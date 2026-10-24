import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PlantPopulation, defaultIbmParams, meanFieldEquilibrium, type IbmParams, type Plant } from '../../lib/simulations/ibm';
import { fmt } from '../charts/scales';
import { LabChart, LabShell, Readout, Segmented, Slider, useWidth } from './controls';

// Laboratory 5: plants competing with their neighbours. The map draws the
// simulation's own state (src/lib/simulations/ibm.ts): every dot is a plant
// in PlantPopulation.plants at its true position. Changing a parameter
// restarts the run so that what you see always matches the rules shown.

const cssVar = (name: string) => (typeof document === 'undefined' ? '#000' : getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#000');

export default function IbmLab(_: { preset?: string }) {
  const [params, setParams] = useState<IbmParams>(defaultIbmParams);
  const [initial, setInitial] = useState(300);
  const [seed, setSeed] = useState(7);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(6);
  const [colourByCrowding, setColourByCrowding] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [, setVersion] = useState(0);
  const popRef = useRef<PlantPopulation | null>(null);
  const set = (k: keyof IbmParams) => (v: number | string) => setParams((p) => ({ ...p, [k]: v }));

  // (Re)create the population whenever the rules or the seed change.
  const reset = useCallback(() => {
    popRef.current = new PlantPopulation(params, initial, seed);
    setSelected(null);
    setVersion((v) => v + 1);
  }, [params, initial, seed]);
  useEffect(reset, [reset]);

  const step = useCallback(() => {
    const pop = popRef.current;
    if (!pop || pop.plants.length === 0) {
      setRunning(false);
      return;
    }
    pop.step();
    setVersion((v) => v + 1);
  }, []);

  // Play loop: `speed` years per second.
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(step, 1000 / speed);
    return () => window.clearInterval(id);
  }, [running, speed, step]);

  const pop = popRef.current;
  const history = pop?.history ?? [];
  const last = history.at(-1);
  const Nstar = meanFieldEquilibrium(params);
  const recent = history.slice(1).slice(-20);
  const ratio = recent.length ? recent.reduce((s, h) => s + h.meanCrowding / Math.max(h.csrCrowding, 1e-9), 0) / recent.length : NaN;

  // ── Map ──────────────────────────────────────────────────────────────────
  const [wrapRef, width] = useWidth<HTMLDivElement>(480);
  const size = Math.min(width, 520);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [theme, setTheme] = useState(0);
  useEffect(() => {
    const mo = new MutationObserver(() => setTheme((t) => t + 1));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, []);
  const plants: Plant[] = pop?.plants ?? [];
  const maxCrowd = useMemo(() => Math.max(1, ...plants.map((p) => p.crowding)), [plants, history.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = cssVar('--v-card');
    ctx.fillRect(0, 0, size, size);
    // Vellum's teal sequential ramp; the dark twin uses the same stops in reverse.
    const lightRamp = ['#D2EEF0', '#A5D5D7', '#73B9BC', '#429CA0', '#1B7D82', '#066166', '#034649'];
    const ramp = document.documentElement.dataset.theme === 'dark' ? [...lightRamp].reverse() : lightRamp;
    const tone = cssVar('--v-teal');
    const surface = cssVar('--v-surface');
    const r = Math.max(1.6, size / 260);
    for (const p of plants) {
      ctx.beginPath();
      ctx.arc(p.x * size, p.y * size, r, 0, Math.PI * 2);
      ctx.fillStyle = colourByCrowding ? ramp[Math.min(6, Math.floor((p.crowding / maxCrowd) * 6.999))] : tone;
      ctx.fill();
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = surface;
      ctx.stroke();
    }
    const sel = plants.find((p) => p.id === selected);
    if (sel) {
      ctx.strokeStyle = cssVar('--v-secondary');
      ctx.setLineDash([3, 3]);
      ctx.lineWidth = 1;
      // Interaction radius, drawn with wrap-around copies near the edges.
      for (const dx of [-1, 0, 1]) {
        for (const dy of [-1, 0, 1]) {
          ctx.beginPath();
          ctx.arc((sel.x + dx) * size, (sel.y + dy) * size, params.R * size, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(sel.x * size, sel.y * size, r + 3, 0, Math.PI * 2);
      ctx.strokeStyle = cssVar('--v-terracotta');
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [plants, size, selected, colourByCrowding, maxCrowd, params.R, theme, history.length]);

  const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    let best: Plant | null = null;
    let bestD = 0.03;
    for (const p of plants) {
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < bestD) (bestD = d), (best = p);
    }
    setSelected(best?.id ?? null);
  };
  const sel = plants.find((p) => p.id === selected);

  return (
    <LabShell
      title="Individual-based laboratory"
      status={
        <>
          Year {pop?.year ?? 0} · {plants.length} plants
          {last && pop && pop.year > 0 ? ` · ${last.births} seedlings established, ${last.deaths} plants died this year` : ''}
          {plants.length === 0 ? ' · the population is extinct' : ''}.
        </>
      }
      controls={
        <>
          <div className="lab-buttons">
            <button type="button" className="btn" onClick={() => setRunning((x) => !x)} disabled={plants.length === 0}>
              {running ? 'Pause' : 'Run'}
            </button>
            <button type="button" className="btn" onClick={step} disabled={running || plants.length === 0}>
              One year
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                setRunning(false);
                reset();
              }}
            >
              Restart
            </button>
          </div>
          <Slider label="Speed" value={speed} min={1} max={30} step={1} unit="years per second" onChange={setSpeed} digits={0} />
          <Slider label="s₀, survival when uncrowded" value={params.s0} min={0.3} max={1} step={0.01} onChange={set('s0')} />
          <Slider label="c, crowding effect per neighbour" value={params.c} min={0} max={1} step={0.01} onChange={set('c')} />
          <Slider label="R, interaction radius" value={params.R} min={0.02} max={0.15} step={0.005} unit="of the plot side" onChange={set('R')} digits={3} />
          <Slider label="f, mean seeds per survivor" value={params.f} min={0} max={4} step={0.05} onChange={set('f')} />
          <Slider label="σ, dispersal distance" value={params.sigma} min={0.005} max={0.3} step={0.001} log unit="of the plot side" onChange={set('sigma')} digits={3} />
          <Segmented<IbmParams['schedule']>
            label="Schedule"
            value={params.schedule}
            onChange={set('schedule')}
            options={[
              { value: 'synchronous', label: 'Synchronous' },
              { value: 'random-order', label: 'Random order' },
            ]}
          />
          <Segmented<IbmParams['interaction']>
            label="Crowding"
            value={params.interaction}
            onChange={set('interaction')}
            options={[
              { value: 'local', label: 'Local neighbours' },
              { value: 'global', label: 'Mean field' },
            ]}
          />
          <Slider label="Initial plants" value={initial} min={10} max={800} step={10} onChange={setInitial} digits={0} />
          <div className="lab-inline">
            <label>
              <span className="lab-seg-label">Seed</span>
              <input type="number" value={seed} onChange={(e) => setSeed(Math.max(0, Math.floor(Number(e.target.value) || 0)))} />
            </label>
          </div>
        </>
      }
    >
      <div className="ibm-top">
        <div ref={wrapRef} className="ibm-map">
          <canvas
            ref={canvasRef}
            style={{ width: size, height: size }}
            onClick={onCanvasClick}
            role="img"
            aria-label={`Map of the plot: ${plants.length} plants. Select a plant to inspect it.`}
          />
          <label className="lab-check">
            <input type="checkbox" checked={colourByCrowding} onChange={(e) => setColourByCrowding(e.target.checked)} />
            Shade plants by their number of neighbours (darker = more crowded)
          </label>
        </div>
        <div className="ibm-side">
          <Readout
            items={[
              { label: 'Mean-field equilibrium N*', value: Nstar > 0 ? fmt(Nstar, 0) : '0 (s₀(1 + f) ≤ 1)' },
              { label: 'Plants now', value: String(plants.length) },
              { label: 'Mean neighbours at the last census', value: last && pop && pop.year > 0 ? fmt(last.meanCrowding, 2) : '—' },
              { label: 'Expected under spatial randomness', value: last && pop && pop.year > 0 ? fmt(last.csrCrowding, 2) : '—' },
              { label: 'Clustering ratio (last 20 years)', value: Number.isFinite(ratio) ? fmt(ratio, 2) : '—', note: '1 = random, > 1 = clustered' },
            ]}
          />
          {sel ? (
            <div className="ibm-inspect" aria-live="polite">
              <p className="eyebrow">Selected plant #{sel.id}</p>
              <p>
                Position ({fmt(sel.x, 3)}, {fmt(sel.y, 3)}) · age {sel.age} years ·{' '}
                {sel.age === 0
                  ? 'established this year; its neighbours will be counted at the next census'
                  : `${fmt(sel.crowding, 2)} neighbours at the last census · survival probability then ${fmt(params.s0 / (1 + params.c * sel.crowding), 3)}`}
              </p>
            </div>
          ) : (
            <p className="lab-note">Select a plant on the map to see its attributes and its interaction radius.</p>
          )}
        </div>
      </div>
      {history.length > 1 && (
        <LabChart
          title={
            ratio > 1.15 && history.at(-1)!.N < 0.9 * Nstar
              ? 'Clustered plants crowd each other, holding the population below the mean-field value'
              : params.interaction === 'global'
                ? 'With mean-field crowding the population fluctuates around N*'
                : 'The population settles where births balance crowding-dependent deaths'
          }
          subtitle={`s₀ = ${fmt(params.s0)}, c = ${fmt(params.c)}, R = ${fmt(params.R, 3)}, f = ${fmt(params.f)}, σ = ${fmt(params.sigma, 3)}; ${params.schedule}, ${params.interaction} crowding; seed ${seed}`}
          xLabel="Year"
          yUnit="Plants (individuals)"
          series={[{ id: 'N', label: 'Plants', family: 'moss', points: history.map((h) => [h.year, h.N] as [number, number]) }]}
          references={Nstar > 0 ? [{ axis: 'y', value: Nstar, label: `N* = ${fmt(Nstar, 0)}` }] : []}
          y={{ includeZero: true }}
          aspect={0.42}
          footer="Computed in your browser by PlantPopulation (src/lib/simulations/ibm.ts); the C++ version is cpp-examples/ibm/plants.cpp."
        />
      )}
    </LabShell>
  );
}
