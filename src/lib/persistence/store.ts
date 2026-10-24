// Learner state, kept only in this browser (localStorage). No accounts, no
// server. Every access is guarded: storage can be unavailable (private
// windows, blocked site data), in which case the site still works and simply
// forgets between visits.
import type { Level } from '../../data/types.ts';

export const STORAGE_KEY = 'cpp-atlas:v1';

export interface LearnerState {
  version: 1;
  profile: { level: Level; cpp: 0 | 1 | 2; modelling: 0 | 1 | 2 } | null;
  goals: string[];
  /** Lessons opened (slug → ISO date of last visit). Visiting is not competence. */
  visited: Record<string, string>;
  /** Lessons the learner marked as studied. */
  studied: Record<string, string>;
  /** Knowledge checks answered correctly (check id → ISO date). */
  checks: Record<string, string>;
  bookmarks: string[];
  /** Most recent atlas nodes, newest first. */
  recent: string[];
  pathway: string | null;
}

export const emptyState = (): LearnerState => ({
  version: 1,
  profile: null,
  goals: [],
  visited: {},
  studied: {},
  checks: {},
  bookmarks: [],
  recent: [],
  pathway: null,
});

type Listener = (state: LearnerState) => void;
const listeners = new Set<Listener>();
let cache: LearnerState | null = null;

function sanitize(raw: unknown): LearnerState {
  const base = emptyState();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<LearnerState>;
  const rec = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, string>) : {});
  const arr = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
  const p = r.profile;
  const levelOk = p && ['beginner', 'intermediate', 'seasoned'].includes(p.level);
  return {
    version: 1,
    profile: levelOk
      ? { level: p!.level, cpp: ([0, 1, 2].includes(p!.cpp) ? p!.cpp : 0) as 0 | 1 | 2, modelling: ([0, 1, 2].includes(p!.modelling) ? p!.modelling : 0) as 0 | 1 | 2 }
      : null,
    goals: arr(r.goals),
    visited: rec(r.visited),
    studied: rec(r.studied),
    checks: rec(r.checks),
    bookmarks: arr(r.bookmarks),
    recent: arr(r.recent).slice(0, 12),
    pathway: typeof r.pathway === 'string' ? r.pathway : null,
  };
}

export function load(): LearnerState {
  if (cache) return cache;
  try {
    const text = globalThis.localStorage?.getItem(STORAGE_KEY);
    cache = text ? sanitize(JSON.parse(text)) : emptyState();
  } catch {
    cache = emptyState();
  }
  return cache;
}

export function save(next: LearnerState): void {
  cache = next;
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable: keep the in-memory copy */
  }
  for (const fn of listeners) fn(next);
}

export function update(fn: (draft: LearnerState) => void): LearnerState {
  const draft = structuredClone(load());
  fn(draft);
  save(draft);
  return draft;
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = null;
      fn(load());
    }
  };
  globalThis.addEventListener?.('storage', onStorage);
  return () => {
    listeners.delete(fn);
    globalThis.removeEventListener?.('storage', onStorage);
  };
}

const today = () => new Date().toISOString().slice(0, 10);

export const actions = {
  setProfile(profile: NonNullable<LearnerState['profile']>, goals?: string[]) {
    update((s) => {
      s.profile = profile;
      if (goals) s.goals = goals;
      if (goals?.length) s.pathway = goals[0];
    });
  },
  visit(slug: string) {
    update((s) => {
      s.visited[slug] = today();
    });
  },
  setStudied(slug: string, value: boolean) {
    update((s) => {
      if (value) s.studied[slug] = today();
      else delete s.studied[slug];
    });
  },
  passCheck(id: string) {
    update((s) => {
      s.checks[id] = today();
    });
  },
  toggleBookmark(id: string) {
    update((s) => {
      s.bookmarks = s.bookmarks.includes(id) ? s.bookmarks.filter((b) => b !== id) : [id, ...s.bookmarks];
    });
  },
  touch(id: string) {
    update((s) => {
      s.recent = [id, ...s.recent.filter((r) => r !== id)].slice(0, 12);
    });
  },
  setPathway(goal: string | null) {
    update((s) => {
      s.pathway = goal;
      if (goal && !s.goals.includes(goal)) s.goals = [...s.goals, goal];
    });
  },
  importState(text: string): boolean {
    try {
      const parsed = JSON.parse(text);
      if (!parsed || parsed.version !== 1) return false;
      save(sanitize(parsed));
      return true;
    } catch {
      return false;
    }
  },
  exportState(): string {
    return JSON.stringify(load(), null, 2);
  },
  reset() {
    save(emptyState());
  },
};
