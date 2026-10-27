import { useMemo, useState } from 'react';
import {
  birthDeath,
  birthDeathExtinction,
  birthDeathMean,
  gillespie,
  sirStochastic,
  summarise,
  type Path,
  type StochasticModel,
} from '../../lib/simulations/gillespie';
import { integrateFixed, sirRhs } from '../../lib/simulations/ode';
import { createRng } from '../../lib/simulations/rng';
import { fmt } from '../charts/scales';
import { LabChart, LabShell, Readout, Segmented, Slider } from './controls';

// Laboratory 4: Gillespie's direct method. Each replicate is an exact
// sample path of the continuous-time Markov chain; the ensemble is compared
// with exact results (birth–death) or the deterministic limit (SIR).

type ModelId = 'bd' | 'sir';
const GRID = 101;

export default function GillespieLab({ preset }: { preset?: string }) {
  const [model, setModel] = useState<ModelId>(preset === 'sir' ? 'sir' : 'bd');
  const [b, setB] = useState(1);
  const [d, setD] = useState(0.8);
  const [N0, setN0] = useState(5);
  const [beta, setBeta] = useState(0.5);
  const [gamma, setGamma] = useState(0.2);
  const [Npop, setNpop] = useState(200);
  const [I0, setI0] = useState(3);
  const [reps, setReps] = useState(100);
  const [seed, setSeed] = useState(2024);

  const T = model === 'bd' ? 6 : 120;
  const spec: { m: StochasticModel; x0: number[]; of: number } = useMemo(
    () => (model === 'bd' ? { m: birthDeath(b, d), x0: [N0], of: 0 } : { m: sirStochastic(beta, gamma, Npop), x0: [Npop - I0, I0, 0], of: 1 }),
    [model, b, d, N0, beta, gamma, Npop, I0],
  );

  const { paths, summary, times } = useMemo(() => {
    const rng = createRng(seed);
    const ps: Path[] = [];
    for (let r = 0; r < reps; r++) ps.push(gillespie(spec.m, spec.x0, T, rng, 2_000_000));
    const ts = Array.from({ length: GRID }, (_, i) => (i / (GRID - 1)) * T);
    return { paths: ps, summary: summarise(ps, ts, spec.of), times: ts };
  }, [spec, reps, seed, T]);

  const expected = useMemo(() => {
    if (model === 'bd') return times.map((t) => [t, birthDeathMean(N0, t, b, d)] as [number, number]);
    const sol = integrateFixed(sirRhs({ beta, gamma }), [(Npop - I0) / Npop, I0 / Npop, 0], 0, T, T / 600, 'rk4');
    return sol.t.map((t, i) => [t, sol.x[i][1] * Npop] as [number, number]);
  }, [model, times, N0, b, d, beta, gamma, Npop, I0, T]);

  const shown = paths.slice(0, 40);
  const finalZero = summary.zeroFraction.at(-1)!;
  const exactExt = model === 'bd' ? birthDeathExtinction(N0, T, b, d) : NaN;
  const se = Math.sqrt((finalZero * (1 - finalZero)) / reps);

  // Event log of the first replicate: the algorithm, step by step.
  const log = paths[0].t.slice(1, 13).map((t, k) => {
    const before = paths[0].x[k];
    const props = spec.m.events.map((e) => e.propensity(before));
    const a0 = props.reduce((s, v) => s + v, 0);
    return { t, tau: t - paths[0].t[k], props, a0, event: spec.m.events[paths[0].event[k + 1]].name, after: paths[0].x[k + 1] };
  });

  const majorOutbreaks = model === 'sir' ? paths.filter((p) => p.x.at(-1)![2] > 0.1 * Npop).length : 0;

  return (
    <LabShell
      title="Gillespie laboratory"
      status={
        <>
          {reps} replicate{reps > 1 ? 's' : ''} · seed {seed} · first run stopped because{' '}
          {paths[0].stop === 'absorbed' ? 'the total propensity reached zero (no event can occur any more)' : paths[0].stop === 'end-time' ? 'the next event would fall after the end time' : 'the event limit was reached'}.
        </>
      }
      controls={
        <>
          <Segmented<ModelId>
            label="Model"
            value={model}
            onChange={setModel}
            options={[
              { value: 'bd', label: 'Birth–death' },
              { value: 'sir', label: 'SIR epidemic' },
            ]}
          />
          {model === 'bd' ? (
            <>
              <Slider label="b, birth rate per individual" value={b} min={0} max={3} step={0.05} unit="per unit time" onChange={setB} />
              <Slider label="d, death rate per individual" value={d} min={0} max={3} step={0.05} unit="per unit time" onChange={setD} />
              <Slider label="N₀, initial individuals" value={N0} min={1} max={50} step={1} onChange={setN0} digits={0} />
            </>
          ) : (
            <>
              <Slider label="β, transmission rate" value={beta} min={0.05} max={1.5} step={0.01} unit="per day" onChange={setBeta} />
              <Slider label="γ, recovery rate" value={gamma} min={0.05} max={1} step={0.01} unit="per day" onChange={setGamma} />
              <Slider label="N, population size" value={Npop} min={20} max={1000} step={10} onChange={setNpop} digits={0} />
              <Slider label="I₀, initially infectious" value={I0} min={1} max={20} step={1} onChange={setI0} digits={0} />
            </>
          )}
          <Slider label="Replicates" value={reps} min={1} max={300} step={1} onChange={setReps} digits={0} />
          <div className="lab-inline">
            <label>
              <span className="lab-seg-label">Seed</span>
              <input type="number" value={seed} onChange={(e) => setSeed(Math.max(0, Math.floor(Number(e.target.value) || 0)))} />
            </label>
            <button type="button" className="btn" onClick={() => setSeed((s) => s + 1)}>
              Next seed
            </button>
          </div>
          <Readout
            items={
              model === 'bd'
                ? [
                    { label: `Mean N at t = ${T}`, value: fmt(summary.mean.at(-1)!, 2), note: `exact ${fmt(birthDeathMean(N0, T, b, d), 2)}` },
                    { label: `Extinct by t = ${T}`, value: `${fmt(finalZero * 100, 1)} % ± ${fmt(se * 100, 1)}`, note: `Kendall: ${fmt(exactExt * 100, 1)} %` },
                  ]
                : [
                    { label: 'Major outbreaks (> 10 % ever infected)', value: `${majorOutbreaks} of ${reps}`, note: beta > gamma ? `branching approximation ≈ ${fmt((1 - Math.pow(gamma / beta, I0)) * 100, 0)} %` : 'R₀ ≤ 1: outbreaks stay minor' },
                    { label: 'Mean infectious at the peak of the ODE', value: fmt(Math.max(...expected.map(([, v]) => v)), 1) },
                  ]
            }
          />
        </>
      }
    >
      <LabChart
        title={model === 'bd' ? 'Identical rules produce very different histories; their average follows the exact mean' : 'Chance decides whether an outbreak takes off; major outbreaks follow the deterministic curve'}
        subtitle={
          model === 'bd'
            ? `Linear birth–death process, b = ${fmt(b)}, d = ${fmt(d)}, N₀ = ${N0}; ${shown.length} of ${reps} runs drawn, 50 % and 90 % bands across all runs`
            : `Stochastic SIR, N = ${Npop}, I₀ = ${I0}, β = ${fmt(beta)}, γ = ${fmt(gamma)} per day; ${shown.length} of ${reps} runs drawn`
        }
        xLabel={model === 'bd' ? 'Time' : 'Time (days)'}
        yUnit={model === 'bd' ? 'Individuals N' : 'Infectious individuals I'}
        bands={[
          { id: 'b90', label: '90 % of runs', family: 'indigo', opacity: 0.3, points: times.map((t, i) => [t, summary.quantiles[i][0], summary.quantiles[i][4]] as [number, number, number]) },
          { id: 'b50', label: '50 % of runs', family: 'indigo', opacity: 0.55, points: times.map((t, i) => [t, summary.quantiles[i][1], summary.quantiles[i][3]] as [number, number, number]) },
        ]}
        series={[
          ...shown.map((p, i) => ({
            id: `run${i}`,
            label: `run ${i + 1}`,
            kind: 'member' as const,
            step: true,
            family: 'indigo' as const,
            points: p.t.map((t, k) => [t, p.x[k][spec.of]] as [number, number]).concat(p.stop === 'end-time' ? [[T, p.x.at(-1)![spec.of]]] : []),
          })),
          { id: 'mean', label: 'Mean of runs', family: 'indigo' as const, points: times.map((t, i) => [t, summary.mean[i]] as [number, number]) },
          { id: 'expected', label: model === 'bd' ? 'Exact mean' : 'Deterministic (ODE)', family: 'teal' as const, dashed: true, points: expected },
        ]}
        y={{ includeZero: true }}
        footer="Computed in your browser with gillespie and summarise (src/lib/simulations/gillespie.ts). Bands show the spread of individual runs, not uncertainty in the mean."
      />
      {model === 'bd' && (
        <LabChart
          title="The fraction of extinct replicates tracks Kendall’s exact extinction probability"
          subtitle="Proportion of runs with N = 0 at each time, against the exact probability"
          xLabel="Time"
          yUnit="Probability of extinction"
          series={[
            { id: 'sim', label: 'Simulated fraction', family: 'indigo', kind: 'step', points: times.map((t, i) => [t, summary.zeroFraction[i]] as [number, number]) },
            { id: 'exact', label: 'Kendall (exact)', family: 'teal', points: times.map((t) => [t, birthDeathExtinction(N0, t, b, d)] as [number, number]) },
          ]}
          y={{ domain: [0, 1] }}
          aspect={0.42}
          footer={b > d ? `As t → ∞ the extinction probability approaches (d/b)^N₀ = ${fmt(Math.pow(d / b, N0), 3)}.` : 'With d ≥ b every lineage eventually dies out.'}
        />
      )}
      <details className="lab-log" open>
        <summary>The algorithm, event by event (first run)</summary>
        <div className="table-scroll" tabIndex={0} role="region" aria-label="Event log of the first run">

          <table>
            <thead>
              <tr>
                <th scope="col">Waiting time τ</th>
                <th scope="col">Time t</th>
                {spec.m.events.map((e) => (
                  <th key={e.name} scope="col">a({e.name})</th>
                ))}
                <th scope="col">Total a₀</th>
                <th scope="col">Chosen event</th>
                <th scope="col">State after</th>
              </tr>
            </thead>
            <tbody>
              {log.map((row, i) => (
                <tr key={i}>
                  <td>{fmt(row.tau, 4)}</td>
                  <td>{fmt(row.t, 4)}</td>
                  {row.props.map((v, j) => (
                    <td key={j}>{fmt(v, 3)}</td>
                  ))}
                  <td>{fmt(row.a0, 3)}</td>
                  <td>{row.event}</td>
                  <td>{row.after.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="lab-note">
          Each waiting time is drawn from an exponential distribution with rate a₀; the event is chosen with probability a(event)/a₀.
          Larger totals give shorter waits.
        </p>
      </details>
    </LabShell>
  );
}
