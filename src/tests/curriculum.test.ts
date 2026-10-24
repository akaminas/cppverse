import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { concepts } from '../data/concepts.ts';
import { edges } from '../data/edges.ts';
import { buildGraph, dependencyClosure, dependentClosure, findDependencyCycle, landmarksEnabledBy, topologicalOrder } from '../lib/graph/graph.ts';
import { computeLayout } from '../lib/graph/layout.ts';
import { routeForGoal, routeTo } from '../lib/graph/routes.ts';
import { validateCurriculum } from '../lib/validation/curriculum.ts';

const lessonsDir = join(import.meta.dirname, '..', 'content', 'lessons');
const lessons = readdirSync(lessonsDir)
  .filter((f) => f.endsWith('.mdx'))
  .map((file) => {
    const source = readFileSync(join(lessonsDir, file), 'utf8');
    const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
    const data = fm ? parse(fm[1]) : {};
    return { slug: file.replace(/\.mdx$/, ''), source, manual: data.manual ?? [] };
  });

describe('curriculum graph', () => {
  const g = buildGraph();
  it('has no dependency cycles', () => {
    expect(findDependencyCycle(g)).toBeNull();
  });
  it('passes the structural validation (ignoring lessons not yet written)', () => {
    const report = validateCurriculum(lessons);
    const structural = report.errors.filter((e) => !/missing lesson|missing anchor/.test(e));
    expect(structural).toEqual([]);
  });
  it('detects an injected prerequisite cycle', () => {
    const bad = buildGraph(concepts, [...edges, { from: 'gillespie', to: 'variables', type: 'prerequisite' }]);
    expect(findDependencyCycle(bad)).not.toBeNull();
  });
  it('supports backward learning: Gillespie requires random generators, functions, loops and variables', () => {
    const needs = dependencyClosure(g, ['gillespie']);
    for (const id of ['random-library', 'random-seeds', 'functions', 'for-loop', 'variables']) expect(needs.has(id)).toBe(true);
  });
  it('supports forward learning: std::vector leads to population trajectories and the destinations', () => {
    const enabled = dependentClosure(g, 'std-vector');
    expect(enabled.has('time-stepping')).toBe(true);
    const landmarks = landmarksEnabledBy(g, 'std-vector').map((n) => n.id);
    expect(landmarks).toEqual(expect.arrayContaining(['algorithms-landmark', 'ode-landmark', 'stochastic-landmark', 'ibm-landmark']));
  });
  it('orders routes topologically', () => {
    const order = topologicalOrder(g, [...dependencyClosure(g, ['discrete-time']), 'discrete-time']);
    const pos = new Map(order.map((id, i) => [id, i]));
    for (const e of edges) {
      if (pos.has(e.from) && pos.has(e.to) && e.type !== 'conceptual' && e.type !== 'validation') {
        expect(pos.get(e.from)!).toBeLessThan(pos.get(e.to)!);
      }
    }
  });
});

describe('recommendations', () => {
  it('a beginner starts at the root', () => {
    const route = routeForGoal('gillespie', { level: 'beginner', cpp: 0, modelling: 0 });
    expect(route[0]).toEqual({ id: 'programs-and-algorithms', status: 'next' });
  });
  it('an intermediate learner skips beginner foundations but not modelling material', () => {
    const route = routeForGoal('gillespie', { level: 'intermediate', cpp: 1, modelling: 0 });
    expect(route.find((s) => s.id === 'for-loop')!.status).toBe('assumed');
    expect(route.find((s) => s.status === 'next')!.id).not.toBe('programs-and-algorithms');
    expect(route.find((s) => s.id === 'gillespie')!.status).toBe('todo');
  });
  it('completed concepts are marked done and the next step moves on', () => {
    const route = routeTo(['for-loop'], { level: 'beginner', cpp: 0, modelling: 0 }, new Set(['programs-and-algorithms', 'compilation']));
    expect(route[0].status).toBe('done');
    expect(route.find((s) => s.status === 'next')!.id).toBe('program-anatomy');
  });
  it('optional branches never block a route unless they are targets', () => {
    const route = routeForGoal('ode-solvers', { level: 'beginner', cpp: 0, modelling: 0 });
    expect(route.some((s) => s.id === 'adaptive-step')).toBe(false);
  });
});

describe('atlas layout', () => {
  const layout = computeLayout();
  it('places every node', () => {
    for (const c of concepts) expect(layout.nodes[c.id]).toBeDefined();
  });
  it('keeps domain regions from overlapping', () => {
    const boxes = Object.values(layout.domains);
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i];
        const b = boxes[j];
        const overlap = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
        expect(overlap, `${a.id} overlaps ${b.id}`).toBe(false);
      }
    }
  });
  it('keeps every node inside its domain region and nodes apart', () => {
    const list = Object.values(layout.nodes);
    for (const n of list) {
      const b = layout.domains[n.domain];
      expect(n.x).toBeGreaterThan(b.x);
      expect(n.x).toBeLessThan(b.x + b.w);
      expect(n.y).toBeGreaterThan(b.y);
      expect(n.y).toBeLessThan(b.y + b.h);
    }
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        expect(Math.hypot(list[i].x - list[j].x, list[i].y - list[j].y)).toBeGreaterThan(list[i].r + list[j].r + 20);
      }
    }
  });
  it('is deterministic', () => {
    expect(computeLayout()).toEqual(layout);
  });
  it('puts destinations east of the foundations', () => {
    const fx = layout.domains.numeric.x;
    for (const d of ['algorithms', 'ode', 'stochastic', 'ibm'] as const) expect(layout.domains[d].x).toBeGreaterThan(fx + 1000);
  });
});
