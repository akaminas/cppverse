import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { parseCsv } from '../../lib/quest/csv.ts';
import { annualFit, corr, dayDistance, sineFit } from '../../lib/quest/stats.ts';
import { checkLake, overlap, readFoodWeb, trophicLevels, type LakeNotes, type LakeSubmission } from '../../lib/quest/checks.ts';
import { actions, load } from '../../lib/persistence/store.ts';
import { foodWebCsv, simulateLake, solutionSubmission, toCsv, type LakeRun } from '../../lib/quest/reference-lake.ts';

const CHAIN = 'fish_rhamphochromis > fish_utaka > zooplankton > phytoplankton';

let base: LakeRun;
let cascade: LakeRun;
let notes: LakeNotes;

const col = (run: LakeRun, name: string) => run.rows.map((r) => r[run.columns.indexOf(name)]);
const finalYear = (run: LakeRun) => {
  const end = run.rows[run.rows.length - 1][0];
  return run.rows.flatMap((r, i) => (r[0] > end - 365 ? [i] : []));
};
const status = (sub: LakeSubmission, id: string) => checkLake(sub).checks.find((c) => c.id === id)!.status;
const withColumn = (run: LakeRun, name: string, f: (v: number, day: number, i: number) => number): LakeRun => {
  const j = run.columns.indexOf(name);
  return { ...run, rows: run.rows.map((r, i) => r.map((v, k) => (k === j ? f(v, r[0], i) : v))) };
};
const submission = (over: Partial<LakeSubmission> = {}): LakeSubmission => ({
  run: toCsv(base),
  foodWeb: foodWebCsv(base.diets),
  cascade: toCsv(cascade),
  chain: CHAIN,
  notes,
  ...over,
});

beforeAll(() => {
  base = simulateLake({ years: 6 });
  cascade = simulateLake({ years: 6, harvest: 0.004 });
  // Answer the notes from the data directly, the way a student would.
  const fy = finalYear(base);
  const t = col(base, 'day');
  const o = col(base, 'oxygen');
  const iMin = fy.reduce((b, i) => (o[i] < o[b] ? i : b));
  const fish = base.columns.filter((c) => c.startsWith('fish_'));
  const mean = (v: number[]) => fy.reduce((s, i) => s + v[i], 0) / fy.length;
  const dominant = fish.reduce((b, f) => (mean(col(base, f)) > mean(col(base, b)) ? f : b));
  const z = col(base, 'zooplankton');
  const iPeak = fy.reduce((b, i) => (z[i] > z[b] ? i : b));
  const web = readFoodWeb(foodWebCsv(base.diets));
  if (typeof web === 'string') throw new Error(web);
  notes = {
    oxygenMinDay: Math.round(t[iMin] % 365),
    dominantFish: dominant,
    zooplanktonPeakDay: Math.round(t[iPeak] % 365),
    topTrophicLevel: +Math.max(...trophicLevels(web).values()).toFixed(2),
    interpretation:
      'Harvesting the piscivore released the zooplanktivores, which grazed the zooplankton down and let the phytoplankton bloom: a trophic cascade. Oxygen and pH follow the mixing season.',
  };
}, 60_000);

describe('csv reader', () => {
  it('reads comments, semicolons, decimal commas and messy headers', () => {
    const t = parseCsv('# lake run, seed 4\n"Day";"Temp (°C)";"O2 [mg/L]"\n0;24,5;7,9\n1;24,6;7,8\n');
    expect(t.comments).toEqual(['lake run, seed 4']);
    expect(t.columns).toEqual(['day', 'temp', 'o2']);
    expect(t.rows[1]).toEqual(['1', '24.6', '7.8']);
  });
  it('detects tabs', () => {
    expect(parseCsv('a\tb\n1\t2').columns).toEqual(['a', 'b']);
  });
});

describe('statistics', () => {
  it('recovers the amplitude and peak of an annual sine', () => {
    const t = Array.from({ length: 1000 }, (_, i) => i);
    const y = t.map((d) => 5 + 2 * Math.cos((2 * Math.PI * (d - 100)) / 365));
    const f = sineFit(t, y, 365);
    expect(f.amplitude).toBeCloseTo(2, 6);
    expect(f.peak).toBeCloseTo(100, 4);
    expect(f.r2).toBeCloseTo(1, 6);
    expect(annualFit(t, y).period).toBe(365);
  });
  it('measures circular distance between days', () => {
    expect(dayDistance(360, 5)).toBe(10);
    expect(corr([1, 2, 3], [5, 5, 5])).toBe(0);
  });
});

describe('food webs', () => {
  const web = readFoodWeb('consumer,resource,fraction\nfish_pike,fish_perch,1\nfish_perch,zooplankton,0.5\nfish_perch,algae,0.5\nzooplankton,algae,2\n');
  it('normalises fractions and computes trophic levels', () => {
    if (typeof web === 'string') throw new Error(web);
    const tl = trophicLevels(web);
    expect(tl.get('algae')).toBe(1);
    expect(tl.get('zooplankton')).toBe(2);
    expect(tl.get('perch')).toBeCloseTo(2.5, 10);
    expect(tl.get('pike')).toBeCloseTo(3.5, 10);
    expect(web.notes[0]).toMatch(/rescaled/);
  });
  it('measures diet overlap', () => {
    const a = new Map([['x', 1]]);
    expect(overlap(a, new Map([['x', 1]]))).toBeCloseTo(1);
    expect(overlap(a, new Map([['y', 1]]))).toBe(0);
  });
});

describe('the reference lake', () => {
  it('passes every check, bonuses included', () => {
    const r = checkLake(submission());
    const failing = r.checks.filter((c) => c.status !== 'pass').map((c) => `${c.id}: ${c.detail}`);
    expect(failing).toEqual([]);
    expect(r.passed).toBe(true);
    expect(r.fish).toHaveLength(5);
  });

  it('is pending, not failed, before any file is given', () => {
    const r = checkLake({});
    expect(r.passed).toBe(false);
    expect(r.checks.filter((c) => c.required).every((c) => c.status === 'pending')).toBe(true);
  });

  it('accepts other dialects of the same output', () => {
    // Different names, separator, decimal commas, a coarser interval and DIC instead of CO2.
    const rename: Record<string, string> = { day: 'Time', temperature: 'Temp (C)', oxygen: 'O2', phytoplankton: 'Algae', zooplankton: 'Zoo', co2: 'unused_co2' };
    const columns = base.columns.map((c) => rename[c] ?? c);
    const rows = base.rows.filter((_, i) => i % 3 === 0);
    const text = ['# reference lake, every third day', columns.join(';'), ...rows.map((r) => r.map((v) => String(+v.toPrecision(8)).replace('.', ',')).join(';'))].join('\n');
    const r = checkLake({ run: text });
    const run = r.checks.filter((c) => c.group === 'Run');
    expect(run.filter((c) => c.status !== 'pass').map((c) => c.id)).toEqual([]);
  });

  it('accepts any compartment names, with or without a fish_ prefix in the web', () => {
    const web = foodWebCsv(base.diets).replace(/fish_/g, '');
    expect(status(submission({ foodWeb: web }), 'web-match')).toBe('pass');
    expect(status(submission({ foodWeb: web, chain: 'rhamphochromis → utaka → zooplankton → phytoplankton' }), 'cascade-alternation')).toBe('pass');
  });
});

describe('a broken lake fails the right check', () => {
  it('too short a run', () => {
    const short = { ...base, rows: base.rows.filter((r) => r[0] <= 3 * 365) };
    expect(status({ run: toCsv(short) }, 'timeline')).toBe('fail');
  });
  it('time in years', () => {
    const years = { ...base, rows: base.rows.map((r) => [r[0] / 365, ...r.slice(1)]) };
    expect(checkLake({ run: toCsv(years) }).checks.find((c) => c.id === 'timeline')!.detail).toMatch(/years/);
  });
  it('a negative concentration', () => {
    expect(status({ run: toCsv(withColumn(base, 'phosphate', (v, _d, i) => (i === 900 ? -0.2 : v))) }, 'values')).toBe('fail');
  });
  it('NaN in the output', () => {
    const lines = toCsv(base).split('\n');
    lines[50] = lines[50].replace(/,[^,]+$/, ',nan');
    expect(status({ run: lines.join('\n') }, 'values')).toBe('fail');
  });
  it('no seasons', () => {
    expect(status({ run: toCsv(withColumn(base, 'temperature', () => 25)) }, 'forcing')).toBe('fail');
  });
  it('chemistry that ignores biology', () => {
    const flat = withColumn(withColumn(base, 'ph', (_v, d) => 8.5 + 0.1 * Math.sin(d / 3)), 'co2', (_v, d) => 14 + Math.sin(d / 3));
    expect(status({ run: toCsv(flat) }, 'feedbacks')).toBe('fail');
  });
  it('phosphorus that leaks', () => {
    expect(status({ run: toCsv(withColumn(base, 'total_p', (v, d) => v * (1 - 0.00002 * d))) }, 'budget')).toBe('fail');
    const noTotal = { ...base, columns: base.columns.map((c) => (c === 'total_p' ? 'something' : c)) };
    expect(status({ run: toCsv(noTotal) }, 'budget')).toBe('fail');
  });
  it('grazers in step with their food', () => {
    const inPhase = withColumn(withColumn(base, 'zooplankton', (_v, d) => 5 + 2 * Math.cos((2 * Math.PI * (d - 200)) / 365)), 'phytoplankton', (_v, d) => 3 + Math.cos((2 * Math.PI * (d - 200)) / 365));
    expect(status({ run: toCsv(inPhase) }, 'lag')).toBe('fail');
  });
  it('competitive exclusion', () => {
    const lost = withColumn(withColumn(base, 'fish_mbuna', (v, d) => (d > 4 * 365 ? 0 : v)), 'fish_lethrinops', (v, d) => v * Math.exp(-d / 100));
    const r = checkLake({ run: toCsv(lost) });
    expect(r.checks.find((c) => c.id === 'coexistence')!.status).toBe('fail');
  });
  it('a population still exploding', () => {
    expect(status({ run: toCsv(withColumn(base, 'phytoplankton', (v, d) => v * Math.exp(Math.max(0, d - 4 * 365) / 150))) }, 'bounded')).toBe('fail');
  });
  it('a food web that is not the model', () => {
    expect(status(submission({ foodWeb: foodWebCsv(base.diets) + '\nfish_utaka,insects,0.2' }), 'web-match')).toBe('fail');
  });
  it('a food web without piscivores', () => {
    const { fish_rhamphochromis: _, ...rest } = base.diets;
    expect(status(submission({ foodWeb: foodWebCsv(rest) }), 'web-levels')).toBe('fail');
  });
  it('two guilds with the same diet', () => {
    const diets = { ...base.diets, fish_lethrinops: { ...base.diets.fish_aulonocara } };
    expect(status(submission({ foodWeb: foodWebCsv(diets) }), 'web-niches')).toBe('fail');
  });
  it('a chain that is not a food chain', () => {
    expect(status(submission({ chain: 'fish_rhamphochromis > fish_utaka > zoobenthos > detritus' }), 'cascade-chain')).toBe('fail');
    expect(status(submission({ chain: 'fish_utaka > zooplankton > phytoplankton' }), 'cascade-chain')).toBe('fail');
  });
  it('a perturbation that changes nothing', () => {
    expect(status(submission({ cascade: toCsv(base) }), 'cascade-top')).toBe('fail');
  });
  it('a chain that does not alternate', () => {
    const odd = withColumn(cascade, 'zooplankton', (v) => v * 1.5);
    expect(status(submission({ cascade: toCsv(odd) }), 'cascade-alternation')).toBe('fail');
  });
  it('notes that do not match the run, without giving the answer away', () => {
    const r = checkLake(
      submission({ notes: { ...notes, oxygenMinDay: ((notes.oxygenMinDay ?? 0) + 180) % 365, dominantFish: 'fish_mbuna', zooplanktonPeakDay: ((notes.zooplanktonPeakDay ?? 0) + 150) % 365, topTrophicLevel: 2.5, interpretation: 'fish' } }),
    );
    for (const id of ['note-oxygen', 'note-dominant', 'note-zooplankton', 'note-level', 'note-interpretation']) expect(r.checks.find((c) => c.id === id)!.status).toBe('fail');
    const oxygen = r.checks.find((c) => c.id === 'note-oxygen')!;
    expect(oxygen.detail).not.toMatch(String(notes.oxygenMinDay));
    expect(r.passed).toBe(false);
  });
  it('bonuses never block the crown', () => {
    const noBonus = { ...base, columns: base.columns.map((c) => (c === 'deep_oxygen' ? 'deep_x' : c === 'total_c' ? 'tc' : c)) };
    const r = checkLake(submission({ run: toCsv(noBonus) }));
    expect(r.checks.filter((c) => c.group === 'Bonus').every((c) => c.status === 'pending')).toBe(true);
    expect(r.passed).toBe(true);
  });
});

describe('the crown in the learner state', () => {
  it('survives an import and rejects anything else', () => {
    actions.reset();
    actions.crown('lake');
    const exported = actions.exportState();
    actions.reset();
    expect(load().quest.crowned).toBeNull();
    expect(actions.importState(exported)).toBe(true);
    expect(load().quest.crowned?.trial).toBe('lake');
    const forged = JSON.parse(exported);
    forged.quest.crowned = { trial: 'everything', date: '2026-01-01' };
    actions.importState(JSON.stringify(forged));
    expect(load().quest.crowned).toBeNull();
  });
  it('keeps the first crown and the record of the offer', () => {
    actions.reset();
    actions.offerQuest();
    actions.declineQuest();
    expect(load().quest.declined).not.toBeNull();
    actions.acceptQuest();
    expect(load().quest.declined).toBeNull();
    actions.crown('lake');
    const first = load().quest.crowned;
    actions.crown('lake');
    expect(load().quest.crowned).toEqual(first);
  });
});

describe('the worked solution', () => {
  it('passes every check, bonuses included', () => {
    const r = checkLake(solutionSubmission());
    expect(r.checks.filter((c) => c.status !== 'pass').map((c) => `${c.id}: ${c.detail}`)).toEqual([]);
    expect(r.passed).toBe(true);
  });
  it('is mirrored by a C++ program that CI compiles', () => {
    const cpp = readFileSync(join(import.meta.dirname, '..', '..', '..', 'cpp-examples', 'quest', 'lake_solution.cpp'), 'utf8');
    expect(cpp).toMatch(/Title:/);
    expect(cpp).toMatch(/fish_rhamphochromis/);
  });
});

describe('the pointers of the nautilus', () => {
  it('only name lessons that exist', () => {
    const page = readFileSync(join(import.meta.dirname, '..', '..', 'pages', 'deep.astro'), 'utf8');
    const slugs = [...page.matchAll(/pointer\('[^']+', '([^']+)'/g)].map((m) => m[1]);
    expect(slugs.length).toBeGreaterThan(10);
    for (const slug of slugs) expect(existsSync(join(import.meta.dirname, '..', '..', 'content', 'lessons', `${slug}.mdx`)), slug).toBe(true);
  });
});
