import { concepts } from '../../data/concepts.ts';
import { domains, domainById } from '../../data/domains.ts';
import { edges } from '../../data/edges.ts';
import type { ConceptNode, Edge, EdgeType } from '../../data/types.ts';

/** Edge types meaning "`to` requires `from`". */
export const DEPENDENCY_TYPES: ReadonlySet<EdgeType> = new Set(['prerequisite', 'composition', 'application', 'extension']);

export const isDependency = (edge: Edge) => DEPENDENCY_TYPES.has(edge.type);

export interface Graph {
  nodes: ConceptNode[];
  edges: Edge[];
  byId: Map<string, ConceptNode>;
  /** Insertion order of nodes; used for deterministic tie-breaking. */
  order: Map<string, number>;
  incoming: Map<string, Edge[]>;
  outgoing: Map<string, Edge[]>;
}

export function buildGraph(nodes: ConceptNode[] = concepts, allEdges: Edge[] = edges): Graph {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const order = new Map(nodes.map((n, i) => [n.id, i]));
  const incoming = new Map<string, Edge[]>(nodes.map((n) => [n.id, []]));
  const outgoing = new Map<string, Edge[]>(nodes.map((n) => [n.id, []]));
  for (const edge of allEdges) {
    outgoing.get(edge.from)?.push(edge);
    incoming.get(edge.to)?.push(edge);
  }
  return { nodes, edges: allEdges, byId, order, incoming, outgoing };
}

let defaultGraph: Graph | undefined;
export function getGraph(): Graph {
  defaultGraph ??= buildGraph();
  return defaultGraph;
}

/** Direct dependencies of a node (what must be understood first). */
export function dependenciesOf(g: Graph, id: string): string[] {
  return (g.incoming.get(id) ?? []).filter(isDependency).map((e) => e.from);
}

/** Nodes that directly depend on `id` (what it enables). */
export function dependentsOf(g: Graph, id: string): string[] {
  return (g.outgoing.get(id) ?? []).filter(isDependency).map((e) => e.to);
}

/** All transitive dependencies of the given nodes (excluding the nodes themselves). */
export function dependencyClosure(g: Graph, ids: Iterable<string>): Set<string> {
  const seen = new Set<string>();
  const stack = [...ids];
  const start = new Set(stack);
  while (stack.length) {
    const id = stack.pop()!;
    for (const dep of dependenciesOf(g, id)) {
      if (!seen.has(dep)) {
        seen.add(dep);
        stack.push(dep);
      }
    }
  }
  for (const id of start) seen.delete(id);
  return seen;
}

/** All nodes that transitively depend on `id` (forward learning). */
export function dependentClosure(g: Graph, id: string): Set<string> {
  const seen = new Set<string>();
  const stack = [id];
  while (stack.length) {
    const cur = stack.pop()!;
    for (const next of dependentsOf(g, cur)) {
      if (!seen.has(next)) {
        seen.add(next);
        stack.push(next);
      }
    }
  }
  return seen;
}

/** Rank used to break ties: west-to-east domain column, then file order. */
function rank(g: Graph, id: string): number {
  const node = g.byId.get(id)!;
  const d = domainById[node.domain];
  return d.column * 1e6 + d.row * 1e4 + (g.order.get(id) ?? 0);
}

/**
 * Deterministic topological order of a subset of nodes, honouring only the
 * dependency edges inside the subset. Ties are broken by landscape position
 * so that routes read west → east.
 */
export function topologicalOrder(g: Graph, ids: Iterable<string>): string[] {
  const subset = new Set(ids);
  const indegree = new Map<string, number>();
  for (const id of subset) {
    indegree.set(id, dependenciesOf(g, id).filter((d) => subset.has(d)).length);
  }
  const ready = [...subset].filter((id) => indegree.get(id) === 0);
  const out: string[] = [];
  while (ready.length) {
    ready.sort((a, b) => rank(g, a) - rank(g, b));
    const id = ready.shift()!;
    out.push(id);
    for (const next of dependentsOf(g, id)) {
      if (!subset.has(next)) continue;
      const left = indegree.get(next)! - 1;
      indegree.set(next, left);
      if (left === 0) ready.push(next);
    }
  }
  if (out.length !== subset.size) {
    throw new Error('topologicalOrder: dependency cycle among ' + [...subset].filter((id) => !out.includes(id)).join(', '));
  }
  return out;
}

/** Find a dependency cycle, if any, returned as a list of node ids. */
export function findDependencyCycle(g: Graph): string[] | null {
  const state = new Map<string, 0 | 1 | 2>();
  const path: string[] = [];
  const visit = (id: string): string[] | null => {
    state.set(id, 1);
    path.push(id);
    for (const next of dependentsOf(g, id)) {
      const s = state.get(next) ?? 0;
      if (s === 1) return [...path.slice(path.indexOf(next)), next];
      if (s === 0) {
        const found = visit(next);
        if (found) return found;
      }
    }
    path.pop();
    state.set(id, 2);
    return null;
  };
  for (const node of g.nodes) {
    if ((state.get(node.id) ?? 0) === 0) {
      const found = visit(node.id);
      if (found) return found;
    }
  }
  return null;
}

/** Landmarks (destinations and the inference synthesis) reachable forward from `id`. */
export function landmarksEnabledBy(g: Graph, id: string): ConceptNode[] {
  return [...dependentClosure(g, id)]
    .map((n) => g.byId.get(n)!)
    .filter((n) => n.kind === 'landmark')
    .sort((a, b) => rank(g, a.id) - rank(g, b.id));
}

export { domains, concepts, edges };
