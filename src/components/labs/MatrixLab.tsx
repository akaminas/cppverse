import { useMemo, useState } from 'react';
import { STAGE_LABELS, powerIteration, project, stageMatrix, sum, validateStageParams, type StageParams } from '../../lib/simulations/matrix';
import { fmt } from '../charts/scales';
import { LabChart, LabShell, Readout, Segmented, Slider } from './controls';

// Laboratory 2: a stage-structured plant population projected by a matrix.
// λ and the stable stage structure come from renormalised power iteration
// (src/lib/simulations/matrix.ts; C++: cpp-examples/algorithms/stage_matrix.cpp).

const DEFAULTS: StageParams = { fecundity: 4.5, seedlingSurvival: 0.12, stasis: 0.5, flowering: 0.25, reversion: 0.35, reflowering: 0.4 };

export default function MatrixLab(_: { preset?: string }) {
  const [p, setP] = useState<StageParams>(DEFAULTS);
  const [n0, setN0] = useState<[number, number, number]>([100, 20, 5]);
  const [years, setYears] = useState(30);
  const [scale, setScale] = useState<'linear' | 'log'>('log');
  const set = (k: keyof StageParams) => (v: number) => setP((q) => ({ ...q, [k]: v }));

  const issues = validateStageParams(p);
  const A = useMemo(() => stageMatrix(p), [p]);
  const dominant = useMemo(() => {
    try {
      return powerIteration(A);
    } catch {
      return null;
    }
  }, [A]);
  const traj = useMemo(() => project(A, n0, years), [A, n0, years]);
  const lambda = dominant?.lambda ?? NaN;
  const claim = !dominant
    ? 'The population cannot persist with these transitions'
    : lambda > 1.0005
      ? `The population grows by ${fmt((lambda - 1) * 100, 1)} % per year in the long run`
      : lambda < 0.9995
        ? `The population declines by ${fmt((1 - lambda) * 100, 1)} % per year in the long run`
        : 'The population is close to stationary in the long run';

  const proportions = traj.map((n) => {
    const s = sum(n);
    return s > 0 ? n.map((v) => v / s) : [0, 0, 0];
  });

  return (
    <LabShell
      title="Matrix population laboratory"
      status={
        issues.length ? (
          <span className="lab-warning">Impossible parameters: {issues.join(' ')}</span>
        ) : dominant ? (
          <>λ = {fmt(lambda, 4)} after {dominant.iterations} iterations of the power method (tolerance 10⁻¹⁰).</>
        ) : (
          <>Power iteration failed: the population vanishes.</>
        )
      }
      controls={
        <>
          <Slider label="Seedlings per flowering plant" value={p.fecundity} min={0} max={15} step={0.1} onChange={set('fecundity')} />
          <Slider label="Seedling → rosette" value={p.seedlingSurvival} min={0} max={1} step={0.01} onChange={set('seedlingSurvival')} />
          <Slider label="Rosette stays rosette" value={p.stasis} min={0} max={1} step={0.01} onChange={set('stasis')} />
          <Slider label="Rosette → flowering" value={p.flowering} min={0} max={1} step={0.01} onChange={set('flowering')} />
          <Slider label="Flowering → rosette" value={p.reversion} min={0} max={1} step={0.01} onChange={set('reversion')} />
          <Slider label="Flowering again" value={p.reflowering} min={0} max={1} step={0.01} onChange={set('reflowering')} />
          <Slider label="Years projected" value={years} min={5} max={60} step={1} onChange={setYears} digits={0} />
          <div className="lab-inline">
            <span className="lab-seg-label">Initial numbers (S, V, F)</span>
            {n0.map((v, i) => (
              <input
                key={i}
                type="number"
                min={0}
                value={v}
                aria-label={`Initial ${STAGE_LABELS[i]}`}
                onChange={(e) => {
                  const next = [...n0] as [number, number, number];
                  next[i] = Math.max(0, Number(e.target.value) || 0);
                  setN0(next);
                }}
              />
            ))}
          </div>
          <button type="button" className="btn btn-ghost" onClick={() => setP(DEFAULTS)}>
            Reset parameters
          </button>
        </>
      }
    >
      <div className="lab-matrix" aria-label="Projection matrix">
        <table>
          <caption className="sr-only">Projection matrix A: column = stage this year, row = stage next year</caption>
          <thead>
            <tr>
              <th scope="col">next ↓ / now →</th>
              {STAGE_LABELS.map((s) => (
                <th key={s} scope="col">{s}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {A.map((row, i) => (
              <tr key={i}>
                <th scope="row">{STAGE_LABELS[i]}</th>
                {row.map((a, j) => (
                  <td key={j} className={a === 0 ? 'is-zero' : ''}>{fmt(a, 2)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {dominant && (
          <Readout
            items={[
              { label: 'λ (dominant eigenvalue)', value: fmt(lambda, 4) },
              {
                label: 'Stable stage structure',
                value: dominant.w.map((w, i) => `${STAGE_LABELS[i]} ${fmt(w * 100, 1)} %`).join(' · '),
              },
            ]}
          />
        )}
      </div>
      <Segmented<'linear' | 'log'>
        label="Vertical axis"
        value={scale}
        onChange={setScale}
        options={[
          { value: 'log', label: 'Logarithmic' },
          { value: 'linear', label: 'Linear' },
        ]}
      />
      <LabChart
        title={claim}
        subtitle="Projected numbers per stage, n(t + 1) = A n(t)"
        xLabel="Year"
        yUnit="Plants (individuals)"
        series={STAGE_LABELS.map((label, i) => ({
          id: label,
          label,
          points: traj.map((n, t) => [t, n[i]] as [number, number]).filter(([, v]) => scale === 'linear' || v > 0),
        }))}
        y={{ type: scale, includeZero: scale === 'linear' }}
        footer="Computed in your browser with project and powerIteration (src/lib/simulations/matrix.ts)."
      />
      {dominant && (
        <LabChart
          title="Whatever the starting mix, the stage proportions converge to the stable structure"
          subtitle="Proportion of the population in each stage; dotted lines mark the stable structure"
          xLabel="Year"
          yUnit="Proportion of all plants"
          series={STAGE_LABELS.map((label, i) => ({ id: `p${label}`, label, points: proportions.map((q, t) => [t, q[i]] as [number, number]) }))}
          references={dominant.w.map((w, i) => ({ axis: 'y' as const, value: w, label: `${STAGE_LABELS[i]} ${fmt(w * 100, 1)} %` }))}
          y={{ domain: [0, 1] }}
          aspect={0.42}
          footer="Each stage keeps its colour across both charts."
        />
      )}
    </LabShell>
  );
}
