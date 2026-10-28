// The checks of the deep trial: a cichlid lake built from scratch in C++.
// They test properties of the dynamics, never a particular model, so an ODE
// box model, an individual-based model or a hybrid can all pass. Every check
// says what it measured; the notes questions never reveal the answer.
import { findColumn, normaliseName, numbers, parseCsv, strings, type Table } from './csv.ts';
import { annualFit, corr, dayDistance, mean } from './stats.ts';

export type Status = 'pass' | 'fail' | 'pending';
export type Group = 'Run' | 'Food web' | 'Cascade' | 'Notes' | 'Bonus';

export interface Check {
  id: string;
  group: Group;
  label: string;
  required: boolean;
  status: Status;
  detail: string;
}

export interface LakeNotes {
  oxygenMinDay?: number;
  dominantFish?: string;
  zooplanktonPeakDay?: number;
  topTrophicLevel?: number;
  interpretation?: string;
}

export interface LakeSubmission {
  run?: string;
  foodWeb?: string;
  cascade?: string;
  /** Top predator first, e.g. "fish_piscivore > fish_planktivore > zooplankton > phytoplankton". */
  chain?: string;
  notes?: LakeNotes;
}

export interface LakeReport {
  checks: Check[];
  /** Every required check passed: the crown is earned. */
  passed: boolean;
  /** What the checker recognised in the files, for the page to show and offer as choices. */
  fish: string[];
  compartments: string[];
  trophicLevels: Record<string, number>;
}

export const YEAR = 365;
export const MIN_YEARS = 5;
export const MAX_STEP = 5;

export const ALIASES = {
  time: ['day', 'days', 'time', 'time_days', 't'],
  temperature: ['temperature', 'temp', 'water_temperature', 'surface_temperature'],
  oxygen: ['oxygen', 'o2', 'do', 'dissolved_oxygen', 'surface_oxygen'],
  ph: ['ph', 'surface_ph'],
  phytoplankton: ['phytoplankton', 'phyto', 'algae', 'chlorophyll', 'chl', 'chl_a'],
  zooplankton: ['zooplankton', 'zoo', 'zoop', 'copepods'],
  carbon: ['co2', 'pco2', 'dic', 'carbon_dioxide'],
  deepOxygen: ['deep_oxygen', 'hypolimnion_oxygen', 'bottom_oxygen', 'deep_o2'],
} as const;

const NUTRIENTS = ['p', 'phosphorus', 'n', 'nitrogen', 'nutrient'];
const CARBON = ['c', 'carbon'];
const KEYWORDS = ['cascade', 'oxygen', 'ph', 'carbon', 'season', 'mixing', 'nutrient', 'phosphorus', 'nitrogen', 'competition', 'niche', 'predat', 'graz', 'bloom', 'trophic', 'feedback'];

const pct = (x: number) => `${x >= 0 ? '+' : ''}${(100 * x).toFixed(1)}%`;
const fmt = (x: number, d = 2) => (Number.isFinite(x) ? x.toFixed(d) : String(x));
/** Name of a compartment for matching across files: case, units and a fish_ prefix do not matter. */
export const compartmentKey = (name: string) => normaliseName(name).replace(/^fish_/, '');

// ---------------------------------------------------------------------------
// The time series.

interface Run {
  table: Table;
  t: number[];
  col: (name: string) => number[] | null;
  role: (aliases: readonly string[]) => { name: string; values: number[] } | null;
  fish: string[];
  /** Index ranges. */
  finalYear: number[];
  previousYear: number[];
  afterFirstYear: number[];
}

function readRun(text: string): Run | string {
  const table = parseCsv(text);
  if (table.columns.length < 2 || table.rows.length < 3) return 'The file has fewer than two columns or three rows.';
  const ti = findColumn(table, ALIASES.time);
  if (ti < 0) return `No time column: name one of ${ALIASES.time.join(', ')} (in days).`;
  const t = numbers(table, ti);
  const cache = new Map<string, number[]>();
  const col = (name: string) => {
    const i = table.columns.indexOf(name);
    if (i < 0) return null;
    if (!cache.has(name)) cache.set(name, numbers(table, i));
    return cache.get(name)!;
  };
  const role = (aliases: readonly string[]) => {
    const i = findColumn(table, aliases);
    return i < 0 ? null : { name: table.columns[i], values: col(table.columns[i])! };
  };
  const fish = table.columns.filter((c) => c.startsWith('fish_'));
  const end = t[t.length - 1];
  const idx = (pred: (x: number) => boolean) => t.flatMap((x, i) => (pred(x) ? [i] : []));
  return {
    table,
    t,
    col,
    role,
    fish,
    finalYear: idx((x) => x > end - YEAR),
    previousYear: idx((x) => x > end - 2 * YEAR && x <= end - YEAR),
    afterFirstYear: idx((x) => x >= t[0] + YEAR),
  };
}

const pick = (values: readonly number[], idx: readonly number[]) => idx.map((i) => values[i]);

function timeline(run: Run): { ok: boolean; detail: string } {
  const { t } = run;
  let maxStep = 0;
  for (let i = 1; i < t.length; i++) {
    const step = t[i] - t[i - 1];
    if (!(step > 0)) return { ok: false, detail: `Time must increase on every row; row ${i + 1} goes from ${t[i - 1]} to ${t[i]}.` };
    maxStep = Math.max(maxStep, step);
  }
  const span = t[t.length - 1] - t[0];
  const years = span / YEAR;
  if (span < 60 && maxStep <= 0.05) return { ok: false, detail: `The run spans ${fmt(span)} time units: time looks like years. The contract asks for days.` };
  if (maxStep > MAX_STEP) return { ok: false, detail: `The largest output interval is ${fmt(maxStep, 1)} days; write at least every ${MAX_STEP} days.` };
  if (span < MIN_YEARS * YEAR - 1) return { ok: false, detail: `The run spans ${fmt(years, 1)} years; run at least ${MIN_YEARS}.` };
  return { ok: true, detail: `${fmt(years, 1)} years, ${t.length} rows, output every ${fmt(maxStep, 2)} days or less.` };
}

// ---------------------------------------------------------------------------
// The food web.

export interface FoodWeb {
  /** consumer → resource → normalised fraction */
  diet: Map<string, Map<string, number>>;
  nodes: string[];
  /** Display names keyed by compartment key. */
  names: Map<string, string>;
  notes: string[];
}

export function readFoodWeb(text: string): FoodWeb | string {
  const table = parseCsv(text);
  const ci = findColumn(table, ['consumer', 'predator', 'eater', 'from']);
  const ri = findColumn(table, ['resource', 'prey', 'food', 'to']);
  const fi = findColumn(table, ['fraction', 'proportion', 'share', 'weight', 'diet_fraction']);
  if (ci < 0 || ri < 0 || fi < 0) return 'The food web needs three columns: consumer, resource and fraction.';
  const consumers = strings(table, ci);
  const resources = strings(table, ri);
  const fractions = numbers(table, fi);
  const raw = new Map<string, Map<string, number>>();
  const names = new Map<string, string>();
  for (let i = 0; i < consumers.length; i++) {
    const c = compartmentKey(consumers[i]);
    const r = compartmentKey(resources[i]);
    const f = fractions[i];
    if (!c || !r) continue;
    if (!Number.isFinite(f) || f < 0) return `Row ${i + 2}: the fraction ${table.rows[i][fi]} is not a non-negative number.`;
    names.set(c, normaliseName(consumers[i]));
    if (!names.has(r)) names.set(r, normaliseName(resources[i]));
    if (!raw.has(c)) raw.set(c, new Map());
    raw.get(c)!.set(r, (raw.get(c)!.get(r) ?? 0) + f);
  }
  if (!raw.size) return 'The food web has no links.';
  const notes: string[] = [];
  const diet = new Map<string, Map<string, number>>();
  for (const [c, prey] of raw) {
    const total = [...prey.values()].reduce((s, v) => s + v, 0);
    if (!(total > 0)) return `${names.get(c)} eats nothing: its fractions sum to zero.`;
    if (Math.abs(total - 1) > 0.05) notes.push(`${names.get(c)}'s fractions summed to ${fmt(total)} and were rescaled.`);
    diet.set(c, new Map([...prey].map(([r, f]) => [r, f / total])));
  }
  const nodes = [...new Set([...raw.keys(), ...[...raw.values()].flatMap((p) => [...p.keys()])])];
  return { diet, nodes, names, notes };
}

/** Trophic levels: 1 for basal compartments, 1 + the diet-weighted level of the prey for consumers. */
export function trophicLevels(web: FoodWeb): Map<string, number> {
  const tl = new Map(web.nodes.map((n) => [n, 1]));
  for (let iter = 0; iter < 2000; iter++) {
    let change = 0;
    for (const [c, prey] of web.diet) {
      let level = 1;
      for (const [r, f] of prey) level += f * tl.get(r)!;
      change = Math.max(change, Math.abs(level - tl.get(c)!));
      tl.set(c, Math.min(level, 50));
    }
    if (change < 1e-10) break;
  }
  return tl;
}

/** Omnivory index: the variance of the trophic levels of a consumer's prey. */
function omnivory(web: FoodWeb, tl: Map<string, number>, consumer: string): number {
  const prey = web.diet.get(consumer)!;
  const m = [...prey].reduce((s, [r, f]) => s + f * tl.get(r)!, 0);
  return [...prey].reduce((s, [r, f]) => s + f * (tl.get(r)! - m) ** 2, 0);
}

/** Pianka's diet overlap between two consumers (0 = no shared prey, 1 = identical diets). */
export function overlap(a: Map<string, number>, b: Map<string, number>): number {
  let ab = 0;
  let aa = 0;
  let bb = 0;
  for (const [r, f] of a) {
    aa += f * f;
    ab += f * (b.get(r) ?? 0);
  }
  for (const f of b.values()) bb += f * f;
  return aa > 0 && bb > 0 ? ab / Math.sqrt(aa * bb) : 0;
}

// ---------------------------------------------------------------------------

/**
 * Lag (days) of the annual zooplankton cycle behind the phytoplankton cycle,
 * from the phases of fitted sines: robust to the several short peaks a
 * predator–prey oscillation adds within a season.
 */
function planktonLag(run: Run, phyto: number[], zoo: number[]) {
  const idx = run.afterFirstYear;
  const ts = pick(run.t, idx);
  const fp = annualFit(ts, pick(phyto, idx));
  const fz = annualFit(ts, pick(zoo, idx));
  const period = (fp.period + fz.period) / 2;
  return { phase: (((fz.peak - fp.peak) % period) + period) % period, r2: Math.min(fp.r2, fz.r2) };
}

function budget(run: Run, elements: string[]): { name: string; residual: number } | null {
  for (const e of elements) {
    const total = run.col(`total_${e}`);
    if (!total) continue;
    const cin = run.col(`cum_${e}_in`);
    const cout = run.col(`cum_${e}_out`);
    const scale = Math.abs(mean(total));
    let worst = 0;
    for (let i = 0; i < total.length; i++) {
      const gained = (cin ? cin[i] - cin[0] : 0) - (cout ? cout[i] - cout[0] : 0);
      worst = Math.max(worst, Math.abs(total[i] - total[0] - gained));
    }
    return { name: `total_${e}`, residual: scale > 0 ? worst / scale : Infinity };
  }
  return null;
}

export function checkLake(sub: LakeSubmission): LakeReport {
  const checks: Check[] = [];
  const add = (group: Group, id: string, label: string, status: Status, detail: string, required = true) =>
    checks.push({ id, group, label, required, status, detail });
  const report = (fish: string[] = [], compartments: string[] = [], tl = new Map<string, number>()): LakeReport => ({
    checks,
    passed: checks.every((c) => !c.required || c.status === 'pass'),
    fish,
    compartments,
    trophicLevels: Object.fromEntries(tl),
  });

  // --- Run -----------------------------------------------------------------
  const RUN_IDS: [string, string][] = [
    ['columns', 'The output contract'],
    ['timeline', 'A long enough, fine enough run'],
    ['values', 'Finite, non-negative state'],
    ['ranges', 'A lake that could exist'],
    ['forcing', 'A seasonal climate'],
    ['seasonality', 'Seasonal plankton'],
    ['feedbacks', 'Coupled chemistry'],
    ['budget', 'Nutrient mass balance'],
    ['lag', 'Grazers follow the bloom'],
    ['coexistence', 'Four or more fish guilds coexist'],
    ['bounded', 'Bounded dynamics'],
  ];
  const pendingAll = (group: Group, ids: [string, string][], why: string) => {
    for (const [id, label] of ids) add(group, id, label, 'pending', why, true);
  };
  const run = sub.run?.trim() ? readRun(sub.run) : null;
  let fishNames: string[] = [];
  let zoo: number[] | null = null;
  let oxygen: number[] | null = null;
  let persisting: string[] = [];
  if (!run) pendingAll('Run', RUN_IDS, 'Add the baseline run.');
  else if (typeof run === 'string') {
    add('Run', 'columns', RUN_IDS[0][1], 'fail', run);
    pendingAll('Run', RUN_IDS.slice(1), 'Fix the file first.');
  } else {
    fishNames = run.fish;
    const T = run.role(ALIASES.temperature);
    const O = run.role(ALIASES.oxygen);
    const PH = run.role(ALIASES.ph);
    const A = run.role(ALIASES.phytoplankton);
    const Z = run.role(ALIASES.zooplankton);
    const C = run.role(ALIASES.carbon);
    const missing = [
      !T && 'temperature',
      !O && 'oxygen',
      !PH && 'ph',
      !C && 'co2 or dic',
      !A && 'phytoplankton',
      !Z && 'zooplankton',
      run.fish.length < 4 && `at least four fish_* columns (found ${run.fish.length})`,
    ].filter(Boolean);
    if (missing.length || !T || !O || !PH || !C || !A || !Z) {
      add('Run', 'columns', RUN_IDS[0][1], 'fail', `Missing: ${missing.join(', ')}.`);
      pendingAll('Run', RUN_IDS.slice(1), 'Fix the columns first.');
    } else {
      zoo = Z.values;
      oxygen = O.values;
      add('Run', 'columns', RUN_IDS[0][1], 'pass', `Read ${run.table.columns.length} columns, among them ${run.fish.length} fish guilds: ${run.fish.join(', ')}.`);
      const tl = timeline(run);
      add('Run', 'timeline', RUN_IDS[1][1], tl.ok ? 'pass' : 'fail', tl.detail);

      // Values.
      const textCols = run.table.columns.filter((c) => run.col(c)!.some((v) => Number.isNaN(v)));
      const signed = new Set([run.table.columns[findColumn(run.table, ALIASES.time)], T.name, PH.name]);
      const negatives = run.table.columns.filter((c) => {
        if (signed.has(c) || c.startsWith('cum_') || textCols.includes(c)) return false;
        const v = run.col(c)!;
        const scale = Math.max(1, ...v.map(Math.abs));
        return v.some((x) => x < -1e-9 * scale);
      });
      const infinite = run.table.columns.filter((c) => run.col(c)!.some((v) => v === Infinity || v === -Infinity));
      const bad = [...new Set([...textCols, ...infinite])];
      add(
        'Run',
        'values',
        RUN_IDS[2][1],
        bad.length || negatives.length ? 'fail' : 'pass',
        bad.length
          ? `Not a finite number somewhere in: ${bad.join(', ')} (NaN, inf or empty cells).`
          : negatives.length
            ? `Negative values in ${negatives.join(', ')}: a concentration or a biomass below zero is a numerical artefact (step too large, or no guard).`
            : 'Every cell is a finite number and every quantity that must not go below zero does not.',
      );

      // Ranges.
      const range = (v: number[]) => [Math.min(...v), Math.max(...v)];
      const [t0, t1] = range(T.values);
      const [o0, o1] = range(O.values);
      const [p0, p1] = range(PH.values);
      const out = [
        (t0 < 5 || t1 > 40) && `temperature ${fmt(t0, 1)} to ${fmt(t1, 1)} °C (expected 5 to 40)`,
        o1 > 25 && `oxygen up to ${fmt(o1, 1)} mg/L (above 25: check the units are mg/L)`,
        (p0 < 4 || p1 > 12) && `pH ${fmt(p0)} to ${fmt(p1)} (expected 4 to 12)`,
      ].filter(Boolean);
      add('Run', 'ranges', RUN_IDS[3][1], out.length ? 'fail' : 'pass', out.length ? `Out of range: ${out.join('; ')}.` : `Temperature ${fmt(t0, 1)} to ${fmt(t1, 1)} °C, oxygen ${fmt(o0, 1)} to ${fmt(o1, 1)} mg/L, pH ${fmt(p0)} to ${fmt(p1)}.`);

      // Seasonal forcing and response.
      const late = run.afterFirstYear;
      const ts = pick(run.t, late);
      const tf = annualFit(ts, pick(T.values, late));
      add(
        'Run',
        'forcing',
        RUN_IDS[4][1],
        tf.amplitude >= 0.3 && tf.r2 >= 0.4 ? 'pass' : 'fail',
        `Temperature follows an annual cycle of amplitude ${fmt(tf.amplitude)} °C (R² ${fmt(tf.r2)}; needs at least 0.3 °C and 0.4).`,
      );
      const af = annualFit(ts, pick(A.values, late));
      const of = annualFit(ts, pick(O.values, late));
      const seasonal = Math.max(af.r2, of.r2);
      add('Run', 'seasonality', RUN_IDS[5][1], seasonal >= 0.15 ? 'pass' : 'fail', `An annual cycle explains ${fmt(100 * af.r2, 0)}% of the variation in phytoplankton and ${fmt(100 * of.r2, 0)}% in oxygen after the first year (one of them needs 15%).`);

      // Coupling signatures that hold whatever drives the seasons (blooms,
      // upwelling of deep water, reaeration): carbonate equilibrium makes pH
      // fall as CO₂ rises, and metabolism moves oxygen and CO₂ in opposite
      // directions. Correlations with phytoplankton itself are not required:
      // upwelling can bring a bloom together with oxygen-poor water.
      const lateC = pick(C.values, late);
      const rPh = corr(pick(PH.values, late), lateC);
      const rO = corr(pick(O.values, late), lateC);
      add(
        'Run',
        'feedbacks',
        RUN_IDS[6][1],
        rPh < -0.5 && rO < -0.2 ? 'pass' : 'fail',
        `${rPh < -0.5 ? '✓' : '✗'} pH falls as ${C.name} rises (r = ${fmt(rPh)}; below −0.5 needed: carbonate equilibrium). ${rO < -0.2 ? '✓' : '✗'} oxygen and ${C.name} move in opposite directions (r = ${fmt(rO)}; below −0.2 needed: photosynthesis and respiration).`,
      );

      // Mass balance.
      const b = budget(run, NUTRIENTS);
      add(
        'Run',
        'budget',
        RUN_IDS[7][1],
        b && b.residual <= 0.01 ? 'pass' : 'fail',
        !b
          ? 'Write the lake-wide total of your limiting nutrient as total_p (or total_n), plus cum_p_in and cum_p_out if anything enters or leaves.'
          : `${b.name} drifts from its budget by at most ${fmt(100 * b.residual, 3)}% of its mean (1% allowed).`,
      );

      // Predator–prey lag.
      const lags = planktonLag(run, A.values, Z.values);
      add(
        'Run',
        'lag',
        RUN_IDS[8][1],
        lags.r2 >= 0.1 && lags.phase >= 3 && lags.phase <= 150 ? 'pass' : 'fail',
        lags.r2 < 0.1
          ? 'Phytoplankton or zooplankton has no clear annual cycle, so no lag can be measured.'
          : `Over the run, the zooplankton peak trails the phytoplankton peak by ${fmt(lags.phase, 0)} days (3 to 150 expected).`,
      );

      // Coexistence.
      persisting = run.fish.filter((f) => {
        const v = run.col(f)!;
        const last = pick(v, run.finalYear);
        return Math.min(...last) > 0 && mean(last) >= 0.01 * Math.max(...v);
      });
      add(
        'Run',
        'coexistence',
        RUN_IDS[9][1],
        persisting.length >= 4 ? 'pass' : 'fail',
        `${persisting.length} of ${run.fish.length} fish guilds persist through the final year${persisting.length ? ` (${persisting.join(', ')})` : ''}; four needed. A guild that falls below 1% of its peak counts as lost.`,
      );

      // Boundedness.
      const watched = [A.name, Z.name, ...persisting];
      const ratios = watched.map((n) => {
        const v = run.col(n)!;
        const prev = mean(pick(v, run.previousYear));
        return [n, prev > 0 ? mean(pick(v, run.finalYear)) / prev : Infinity] as const;
      });
      const drifting = ratios.filter(([, r]) => !(r >= 1 / 3 && r <= 3));
      add(
        'Run',
        'bounded',
        RUN_IDS[10][1],
        run.previousYear.length && !drifting.length ? 'pass' : 'fail',
        drifting.length
          ? `Still exploding or crashing in the last two years: ${drifting.map(([n, r]) => `${n} ×${fmt(r)}`).join(', ')}.`
          : 'Plankton and every persisting fish stay within a factor of three from one year to the next at the end of the run.',
      );
    }
  }
  const runOk = run && typeof run !== 'string' ? run : null;

  // --- Food web ------------------------------------------------------------
  const WEB_IDS: [string, string][] = [
    ['web-read', 'A readable food web'],
    ['web-match', 'The web is the model'],
    ['web-levels', 'Four trophic levels'],
    ['web-omnivory', 'Omnivory'],
    ['web-niches', 'Competitors with distinct niches'],
  ];
  const webParsed = sub.foodWeb?.trim() ? readFoodWeb(sub.foodWeb) : null;
  let web: FoodWeb | null = null;
  let tl = new Map<string, number>();
  if (!webParsed) pendingAll('Food web', WEB_IDS, 'Add the food web.');
  else if (typeof webParsed === 'string') {
    add('Food web', 'web-read', WEB_IDS[0][1], 'fail', webParsed);
    pendingAll('Food web', WEB_IDS.slice(1), 'Fix the file first.');
  } else {
    web = webParsed;
    tl = trophicLevels(web);
    const enough = web.nodes.length >= 8;
    add(
      'Food web',
      'web-read',
      WEB_IDS[0][1],
      enough ? 'pass' : 'fail',
      `${web.nodes.length} compartments and ${[...web.diet.values()].reduce((s, p) => s + p.size, 0)} feeding links${enough ? '' : ' (at least eight compartments needed)'}.${web.notes.length ? ' ' + web.notes.join(' ') : ''}`,
    );
    if (!runOk) add('Food web', 'web-match', WEB_IDS[1][1], 'pending', 'Add the baseline run to compare.');
    else {
      const runKeys = new Set(runOk.table.columns.map(compartmentKey));
      const unknown = web.nodes.filter((n) => !runKeys.has(n)).map((n) => web!.names.get(n));
      const unfed = runOk.fish.filter((f) => !web!.diet.has(compartmentKey(f)));
      add(
        'Food web',
        'web-match',
        WEB_IDS[1][1],
        unknown.length || unfed.length ? 'fail' : 'pass',
        unknown.length
          ? `In the web but not in the run: ${unknown.join(', ')}. Every compartment of the web needs its own column.`
          : unfed.length
            ? `Fish in the run with no diet in the web: ${unfed.join(', ')}.`
            : 'Every compartment of the web is a column of the run, and every fish has a diet.',
      );
    }
    const top = [...tl].sort((a, b) => b[1] - a[1])[0];
    add('Food web', 'web-levels', WEB_IDS[2][1], top[1] >= 3.5 ? 'pass' : 'fail', `The highest trophic level is ${fmt(top[1])} (${web.names.get(top[0])}); a lake with piscivores reaches 3.5 or more.`);
    const omni = [...web.diet.keys()].map((c) => [c, omnivory(web!, tl, c)] as const).sort((a, b) => b[1] - a[1]);
    const omnivores = omni.filter(([, o]) => o >= 0.05);
    add(
      'Food web',
      'web-omnivory',
      WEB_IDS[3][1],
      omnivores.length ? 'pass' : 'fail',
      omnivores.length
        ? `Feeding across trophic levels: ${omnivores.map(([c, o]) => `${web!.names.get(c)} (omnivory index ${fmt(o)})`).join(', ')}.`
        : `No consumer feeds across trophic levels (largest omnivory index ${fmt(omni[0]?.[1] ?? 0)}; 0.05 needed). Real lake webs are full of omnivores.`,
    );
    const fishKeys = [...web.diet.keys()].filter((c) => (runOk ? runOk.fish.map(compartmentKey).includes(c) : web!.names.get(c)!.startsWith('fish_')));
    const pairs: [string, string, number][] = [];
    for (let i = 0; i < fishKeys.length; i++)
      for (let j = i + 1; j < fishKeys.length; j++) pairs.push([fishKeys[i], fishKeys[j], overlap(web.diet.get(fishKeys[i])!, web.diet.get(fishKeys[j])!)]);
    const competing = pairs.filter((p) => p[2] >= 0.3).sort((a, b) => b[2] - a[2]);
    const clones = pairs.filter((p) => p[2] >= 0.95);
    const nm = (k: string) => web!.names.get(k);
    add(
      'Food web',
      'web-niches',
      WEB_IDS[4][1],
      fishKeys.length >= 4 && competing.length && !clones.length ? 'pass' : 'fail',
      fishKeys.length < 4
        ? `Only ${fishKeys.length} fish guilds have a diet; four needed.`
        : clones.length
          ? `Diets almost identical (Pianka overlap ≥ 0.95): ${clones.map(([a, b, o]) => `${nm(a)} and ${nm(b)} (${fmt(o)})`).join(', ')}. Give each guild its own niche.`
          : competing.length
            ? `Competitors that share prey: ${competing.slice(0, 3).map(([a, b, o]) => `${nm(a)} and ${nm(b)} (overlap ${fmt(o)})`).join(', ')}; no two guilds have identical diets.`
            : 'No two fish share prey (Pianka overlap ≥ 0.3 needed for at least one pair): there is no competition to coexist through.',
    );
  }

  // --- Cascade -------------------------------------------------------------
  const CASCADE_IDS: [string, string][] = [
    ['cascade-run', 'A comparable perturbed run'],
    ['cascade-chain', 'A food chain from the web'],
    ['cascade-top', 'The top predator is suppressed'],
    ['cascade-alternation', 'The effect alternates down the chain'],
  ];
  const casc = sub.cascade?.trim() ? readRun(sub.cascade) : null;
  const chain = (sub.chain ?? '')
    .split(/\s*(?:->|→|>|,|;)\s*/)
    .map((s) => normaliseName(s))
    .filter(Boolean);
  if (!casc) pendingAll('Cascade', CASCADE_IDS, 'Add the perturbed run.');
  else if (typeof casc === 'string') {
    add('Cascade', 'cascade-run', CASCADE_IDS[0][1], 'fail', casc);
    pendingAll('Cascade', CASCADE_IDS.slice(1), 'Fix the file first.');
  } else {
    const tlc = timeline(casc);
    const sameLength = runOk ? Math.abs(casc.t[casc.t.length - 1] - casc.t[0] - (runOk.t[runOk.t.length - 1] - runOk.t[0])) <= MAX_STEP : true;
    add(
      'Cascade',
      'cascade-run',
      CASCADE_IDS[0][1],
      !runOk ? 'pending' : tlc.ok && sameLength ? 'pass' : 'fail',
      !runOk ? 'Add the baseline run to compare.' : !tlc.ok ? tlc.detail : sameLength ? `${tlc.detail} Same length as the baseline.` : 'The perturbed run must last as long as the baseline.',
    );
    const keyed = (r: Run) => new Map(r.table.columns.map((c) => [compartmentKey(c), c]));
    if (chain.length < 4) add('Cascade', 'cascade-chain', CASCADE_IDS[1][1], 'fail', 'Name at least four compartments from top predator to producer, e.g. fish_a > fish_b > zooplankton > phytoplankton.');
    else if (!web) add('Cascade', 'cascade-chain', CASCADE_IDS[1][1], 'pending', 'Add the food web to follow the chain.');
    else {
      const keys = chain.map(compartmentKey);
      const broken = keys.slice(1).flatMap((r, i) => ((web!.diet.get(keys[i])?.get(r) ?? 0) >= 0.1 ? [] : [`${chain[i]} → ${chain[i + 1]}`]));
      const absent = runOk ? chain.filter((c) => !keyed(runOk).has(compartmentKey(c)) || !keyed(casc).has(compartmentKey(c))) : [];
      add(
        'Cascade',
        'cascade-chain',
        CASCADE_IDS[1][1],
        broken.length || absent.length ? 'fail' : 'pass',
        broken.length
          ? `Each link must be a real meal (at least 10% of the consumer's diet in your web): ${broken.join(', ')} is not.`
          : absent.length
            ? `Not a column of both runs: ${absent.join(', ')}.`
            : `${chain.join(' → ')}: every link is at least 10% of the consumer's diet.`,
      );
    }
    const chainOk = checks[checks.length - 1].status === 'pass';
    if (!runOk || !chainOk) {
      add('Cascade', 'cascade-top', CASCADE_IDS[2][1], 'pending', 'Needs both runs and a valid chain.');
      add('Cascade', 'cascade-alternation', CASCADE_IDS[3][1], 'pending', 'Needs both runs and a valid chain.');
    } else {
      const change = chain.map((c) => {
        const k = compartmentKey(c);
        const b = mean(pick(runOk.col(keyed(runOk).get(k)!)!, runOk.finalYear));
        const p = mean(pick(casc.col(keyed(casc).get(k)!)!, casc.finalYear));
        return b > 0 ? (p - b) / b : NaN;
      });
      add(
        'Cascade',
        'cascade-top',
        CASCADE_IDS[2][1],
        change[0] <= -0.1 ? 'pass' : 'fail',
        `${chain[0]} changes by ${pct(change[0])} over the final year (a fall of at least 10% needed: harvest it, or remove it).`,
      );
      const ok = change.slice(1).every((d, i) => Number.isFinite(d) && Math.abs(d) >= 0.01 && Math.sign(d) === (i % 2 === 0 ? 1 : -1));
      add(
        'Cascade',
        'cascade-alternation',
        CASCADE_IDS[3][1],
        ok ? 'pass' : 'fail',
        `${chain.map((c, i) => `${c} ${pct(change[i])}`).join(', ')}. ${ok ? 'A trophic cascade: every level moves against the one above it.' : 'A cascade alternates (down, up, down, up), each by at least 1%.'}`,
      );
    }
  }

  // --- Notes ---------------------------------------------------------------
  const n = sub.notes ?? {};
  const has = (v: unknown) => v !== undefined && v !== null && v !== '' && !(typeof v === 'number' && Number.isNaN(v));
  const NOTE_LOOK = 'Your file says otherwise: look again at the final year.';
  /**
   * A day of the final year at which `values` reaches its minimum (sign 1) or
   * maximum (sign −1): within 15 days of the extreme, or on a day whose value is
   * within 5% of the year's range of it (two nearly equal troughs both count).
   */
  const extremeDay = (values: number[], said: number, sign: 1 | -1) => {
    const fy = runOk!.finalYear;
    const v = fy.map((i) => sign * values[i]);
    const k = v.reduce((b, x, j) => (x < v[b] ? j : b), 0);
    const range = Math.max(...v) - v[k];
    const near = fy.reduce((b, i, j) => (dayDistance(runOk!.t[i], said) < dayDistance(runOk!.t[fy[b]], said) ? j : b), 0);
    return dayDistance(runOk!.t[fy[k]], said) <= 15 || v[near] - v[k] <= 0.05 * range;
  };
  if (!oxygen || !runOk) add('Notes', 'note-oxygen', 'When oxygen is lowest', 'pending', 'Needs the baseline run.');
  else if (!has(n.oxygenMinDay)) add('Notes', 'note-oxygen', 'When oxygen is lowest', 'pending', 'Give the day of the year (0 to 364) of the oxygen minimum in the final year.');
  else {
    const day = Number(n.oxygenMinDay);
    const ok = extremeDay(oxygen, day, 1);
    add('Notes', 'note-oxygen', 'When oxygen is lowest', ok ? 'pass' : 'fail', ok ? `Day ${day}: yes, oxygen bottoms out then.` : NOTE_LOOK);
  }
  if (!runOk || !runOk.fish.length) add('Notes', 'note-dominant', 'The dominant guild', 'pending', 'Needs the baseline run.');
  else if (!has(n.dominantFish)) add('Notes', 'note-dominant', 'The dominant guild', 'pending', 'Name the fish guild with the largest mean biomass in the final year.');
  else {
    const means = runOk.fish.map((f) => [f, mean(pick(runOk.col(f)!, runOk.finalYear))] as const);
    const best = Math.max(...means.map((m) => m[1]));
    const said = compartmentKey(String(n.dominantFish));
    const ok = means.some(([f, m]) => compartmentKey(f) === said && m >= 0.95 * best);
    add('Notes', 'note-dominant', 'The dominant guild', ok ? 'pass' : 'fail', ok ? `${n.dominantFish}: yes, the largest standing stock in the final year.` : NOTE_LOOK);
  }
  if (!runOk || !zoo) add('Notes', 'note-zooplankton', 'When grazers peak', 'pending', 'Needs the baseline run.');
  else if (!has(n.zooplanktonPeakDay)) add('Notes', 'note-zooplankton', 'When grazers peak', 'pending', 'Give the day of the year (0 to 364) of the zooplankton maximum in the final year.');
  else {
    const day = Number(n.zooplanktonPeakDay);
    const ok = extremeDay(zoo, day, -1);
    add('Notes', 'note-zooplankton', 'When grazers peak', ok ? 'pass' : 'fail', ok ? `Day ${day}: yes, the grazers are at their peak.` : NOTE_LOOK);
  }
  if (!web) add('Notes', 'note-level', 'The trophic level of the top predator', 'pending', 'Needs the food web.');
  else if (!has(n.topTrophicLevel)) add('Notes', 'note-level', 'The trophic level of the top predator', 'pending', 'Compute it from your own diet fractions.');
  else {
    const top = Math.max(...tl.values());
    const ok = Math.abs(Number(n.topTrophicLevel) - top) <= 0.1;
    add('Notes', 'note-level', 'The trophic level of the top predator', ok ? 'pass' : 'fail', ok ? `${n.topTrophicLevel}: yes, from your diet fractions.` : 'Not what your diet fractions give: TL = 1 + Σ (diet fraction × TL of the prey), with producers and detritus at 1.');
  }
  const text = (n.interpretation ?? '').trim();
  const words = KEYWORDS.filter((k) => text.toLowerCase().includes(k));
  add(
    'Notes',
    'note-interpretation',
    'What the lake taught you',
    !text ? 'pending' : text.length >= 120 && words.length >= 2 ? 'pass' : 'fail',
    !text
      ? 'A few sentences on the mechanism behind what you saw (at least 120 characters).'
      : text.length < 120
        ? `${text.length} characters; write at least 120.`
        : words.length < 2
          ? 'Name the mechanisms: nutrients, oxygen, carbon, the cascade, competition, seasons.'
          : 'Noted. The nautilus will read it in the deep.',
  );

  // --- Bonus ---------------------------------------------------------------
  if (runOk) {
    const c = budget(runOk, CARBON);
    add(
      'Bonus',
      'bonus-carbon',
      'A closed carbon budget',
      c ? (c.residual <= 0.01 ? 'pass' : 'fail') : 'pending',
      c ? `${c.name} drifts from its budget by at most ${fmt(100 * c.residual, 3)}% (1% allowed).` : 'Write total_c, with cum_c_in and cum_c_out for exchange with the air and harvest.',
      false,
    );
    const D = runOk.role(ALIASES.deepOxygen);
    if (!D || !oxygen) add('Bonus', 'bonus-deep', 'A stratified lake', 'pending', 'Add a deep_oxygen column for a second, deeper layer.', false);
    else {
      const late = runOk.afterFirstYear;
      const f = annualFit(pick(runOk.t, late), pick(D.values, late));
      const ok = f.r2 >= 0.2 && Math.min(...D.values) < Math.min(...oxygen);
      add('Bonus', 'bonus-deep', 'A stratified lake', ok ? 'pass' : 'fail', `Deep oxygen cycles with the seasons (R² ${fmt(f.r2)}; 0.2 needed) and ${Math.min(...D.values) < Math.min(...oxygen) ? 'falls below' : 'never falls below'} the surface minimum.`, false);
    }
  }

  return report(fishNames, web ? web.nodes.map((k) => web!.names.get(k)!) : [], tl);
}
