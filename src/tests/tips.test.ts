// The nautilus's welcomes and tips: every lesson has its own, and the
// selection prefers them without repeating.
import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LESSON_GUIDES } from '../data/lesson-tips.ts';
import { DOMAIN_TIPS, GENERAL_TIPS, VOICE_LABEL, pickTip, tipPools } from '../data/tips.ts';
import { domains } from '../data/domains.ts';

const lessons = readdirSync(join(import.meta.dirname, '..', 'content', 'lessons'))
  .filter((f) => f.endsWith('.mdx'))
  .map((f) => f.replace(/\.mdx$/, ''));

describe('lesson guides', () => {
  it('cover every lesson, and only lessons', () => {
    expect(Object.keys(LESSON_GUIDES).sort()).toEqual([...lessons].sort());
  });
  for (const slug of lessons) {
    it(`"${slug}" has a welcome and at least three tips`, () => {
      const g = LESSON_GUIDES[slug];
      expect(g.learn.length).toBeGreaterThan(10);
      expect(g.learn).not.toMatch(/\.$/);
      expect(g.tips.length).toBeGreaterThanOrEqual(3);
    });
  }
});

describe('tips', () => {
  const all = [...GENERAL_TIPS, ...Object.values(DOMAIN_TIPS).flat(), ...Object.values(LESSON_GUIDES).flatMap((g) => g.tips)];
  it('have a known voice, fit the bubble and end a sentence', () => {
    for (const t of all) {
      expect(VOICE_LABEL[t.voice], t.text).toBeDefined();
      expect(t.text.length, t.text).toBeLessThanOrEqual(240);
      expect(t.text, t.text).toMatch(/[.?!”)"]$/);
    }
  });
  it('are not duplicated', () => {
    const texts = all.map((t) => t.text);
    expect(new Set(texts).size).toBe(texts.length);
  });
  it('exist for every atlas domain', () => {
    for (const d of domains) expect(DOMAIN_TIPS[d.id]?.length, d.id).toBeGreaterThan(0);
  });
  it('prefer the lesson, then never repeat until a pool is used up', () => {
    const pools = tipPools('gillespie', 'stochastic');
    const seen = new Set<string>();
    // A draw that always prefers the lesson pool.
    const rand = () => 0.1;
    for (let i = 0; i < pools.lesson.length; i++) {
      const t = pickTip('gillespie', 'stochastic', seen, rand);
      expect(pools.lesson).toContain(t);
      expect(seen.has(t.text)).toBe(false);
      seen.add(t.text);
    }
    // The lesson pool is exhausted: the next tip comes from the domain.
    expect(pools.domain).toContain(pickTip('gillespie', 'stochastic', seen, rand));
  });
  it('fall back to domain and general tips outside a lesson', () => {
    const t = pickTip(null, null, new Set(), () => 0.9);
    expect(GENERAL_TIPS).toContain(t);
  });
});
