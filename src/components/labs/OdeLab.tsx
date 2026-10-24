import { useMemo, useState } from 'react';
import {
  METHOD_ORDER,
  eliminationExact,
  eliminationRhs,
  integrateFixed,
  logisticExact,
  logisticRhs,
  sirFinalSusceptible,
  sirRhs,
  type Method,
} from '../../lib/simulations/ode';
import type { VellumFamily } from '../../data/types';
import { fmt } from '../charts/scales';
import { LabChart, LabShell, Readout, Segmented, Slider } from './controls';

// Laboratory 3: numerical integration. The model (right-hand side) and the
// method (stepper) are chosen independently. Errors are measured against
// exact solutions (logistic, elimination) or exact invariants (SIR).

type Model = 'logistic' | 'elimination' | 'sir';
const METHOD_LABEL: Record<Method, string> = { euler: 'Euler', heun: 'Heun (RK2)', rk4: 'RK4' };
const METHOD_FAMILY: Record<Method, VellumFamily> = { euler: 'terracotta', heun: 'indigo', rk4: 'ochre' };

export default function OdeLab({ preset }: { preset?: string }) {
  const [model, setModel] = useState<Model>(preset === 'elimination' || preset === 'sir' ? preset : 'logistic');
  const [methods, setMethods] = useState<Method[]>(['euler', 'rk4']);
  const [h, setH] = useState(0.5);
  const toggle = (m: Method) => setMethods((ms) => (ms.includes(m) ? ms.filter((x) => x !== m) : [...ms, m]));

  // Model definitions and their reference solutions.
  const [r, setR] = useState(0.8);
  const [k, setK] = useState(0.5);
  const [beta, setBeta] = useState(0.5);
  const [gamma, setGamma] = useState(0.2);
  const K = 100;
  const N0 = 2;
  const C0 = 10;

  const def = useMemo(() => {
    if (model === 'logistic')
      return { f: logisticRhs({ r, K }), x0: [N0], tEnd: 15, exact: (t: number) => [logisticExact(N0, t, { r, K })], names: ['N'], unit: 'Population size N (individuals)', time: 'Time (days)' };
    if (model === 'elimination')
      return { f: eliminationRhs({ k }), x0: [C0], tEnd: 16, exact: (t: number) => [eliminationExact(C0, t, { k })], names: ['C'], unit: 'Concentration C (mg per litre)', time: 'Time (hours)' };
    return { f: sirRhs({ beta, gamma }), x0: [0.999, 0.001, 0], tEnd: 160, exact: null, names: ['S', 'I', 'R'], unit: 'Proportion of the population', time: 'Time (days)' };
  }, [model, r, k, beta, gamma]);

  const runs = useMemo(
    () => methods.map((m) => ({ m, sol: integrateFixed(def.f, def.x0, 0, def.tEnd, h, m) })),
    [methods, def, h],
  );

  const exactSeries = def.exact
    ? [{ id: 'exact', label: 'Exact solution', family: 'teal' as const, points: Array.from({ length: 201 }, (_, i) => (i / 200) * def.tEnd).map((t) => [t, def.exact!(t)[0]] as [number, number]) }]
    : [];
  const showComponent = model === 'sir' ? 1 : 0; // infectious proportion for SIR
  const methodSeries = runs.map(({ m, sol }) => ({
    id: m,
    label: `${METHOD_LABEL[m]}, h = ${fmt(h, 3)}`,
    family: METHOD_FAMILY[m],
    points: sol.t.map((t, i) => [t, sol.x[i][showComponent]] as [number, number]),
    markers: sol.t.length <= 40,
  }));

  const errors = runs.map(({ m, sol }) => {
    const end = sol.x.at(-1)!;
    const blewUp = sol.t.at(-1)! < def.tEnd;
    const err = def.exact ? Math.abs(end[0] - def.exact(def.tEnd)[0]) : Math.abs(end[0] - sirFinalSusceptible(0.999, { beta, gamma }));
    const drift = model === 'sir' ? Math.max(...sol.x.map((x) => Math.abs(x[0] + x[1] + x[2] - 1))) : NaN;
    return { m, err, blewUp, evals: sol.evaluations, drift };
  });

  // Convergence study: global error at the end time against the step size.
  const hs = [2, 1, 0.5, 0.25, 0.125, 0.0625, 0.03125, 0.015625];
  const convergence = useMemo(() => {
    if (!def.exact) return [];
    const target = def.exact(def.tEnd)[0];
    return (['euler', 'heun', 'rk4'] as Method[]).map((m) => ({
      id: `c-${m}`,
      label: `${METHOD_LABEL[m]} (order ${METHOD_ORDER[m]})`,
      family: METHOD_FAMILY[m],
      markers: true,
      points: hs
        .map((hh) => {
          const sol = integrateFixed(def.f, def.x0, 0, def.tEnd, hh, m);
          return [hh, Math.abs(sol.x.at(-1)![0] - target)] as [number, number];
        })
        .filter(([, e]) => e > 1e-14 && Number.isFinite(e) && e < 1e6)
        .sort((a, b) => a[0] - b[0]),
    }));
  }, [def]);

  const unstable = model === 'elimination' && h > 2 / k;
  const oscillating = model === 'elimination' && h > 1 / k && h <= 2 / k;

  return (
    <LabShell
      title="Numerical integration laboratory"
      status={
        unstable ? (
          <span className="lab-warning">h = {fmt(h, 3)} exceeds 2/k = {fmt(2 / k, 2)}: forward Euler is unstable here and grows without bound, although the true concentration decays.</span>
        ) : oscillating ? (
          <>h lies between 1/k and 2/k: Euler oscillates in sign while decaying, an artefact of the method.</>
        ) : (
          <>The model and the method are separate choices: the same equations, approximated in different ways.</>
        )
      }
      controls={
        <>
          <Segmented<Model>
            label="Model"
            value={model}
            onChange={setModel}
            options={[
              { value: 'logistic', label: 'Logistic' },
              { value: 'elimination', label: 'Elimination' },
              { value: 'sir', label: 'SIR' },
            ]}
          />
          {model === 'logistic' && <Slider label="r, growth rate" value={r} min={0.1} max={2} step={0.05} unit="per day" onChange={setR} />}
          {model === 'elimination' && <Slider label="k, elimination rate" value={k} min={0.1} max={1.5} step={0.05} unit="per hour" onChange={setK} />}
          {model === 'sir' && (
            <>
              <Slider label="β, transmission rate" value={beta} min={0.1} max={1.5} step={0.01} unit="per day" onChange={setBeta} />
              <Slider label="γ, recovery rate" value={gamma} min={0.05} max={1} step={0.01} unit="per day" onChange={setGamma} />
            </>
          )}
          <Slider label="Step size h" value={h} min={0.01} max={6} step={0.01} log onChange={setH} digits={3} />
          <div className="lab-seg">
            <span className="lab-seg-label">Methods</span>
            <div className="lab-chips">
              {(['euler', 'heun', 'rk4'] as Method[]).map((m) => (
                <button key={m} type="button" className="chip" aria-pressed={methods.includes(m)} onClick={() => toggle(m)}>
                  {METHOD_LABEL[m]}
                </button>
              ))}
            </div>
          </div>
          <Readout
            items={errors.map((e) => ({
              label: METHOD_LABEL[e.m],
              value: e.blewUp
                ? 'diverged'
                : model === 'sir' && runs.find((x) => x.m === e.m)!.sol.x.at(-1)![1] > 1e-4
                  ? 'epidemic not over by the end time'
                  : `${model === 'sir' ? 'final-size error' : 'error'} ${e.err.toExponential(2)}`,
              note: `${e.evals} slope evaluations${model === 'sir' ? ` · max |S+I+R−1| ${e.drift.toExponential(1)}` : ''}`,
            }))}
          />
        </>
      }
    >
      <LabChart
        title={model === 'sir' ? 'The epidemic rises and falls; every method must keep S + I + R = 1' : 'Smaller steps and higher-order methods track the exact solution more closely'}
        subtitle={
          model === 'logistic'
            ? `Logistic growth, r = ${fmt(r)} per day, K = 100, N(0) = 2`
            : model === 'elimination'
              ? `First-order elimination, k = ${fmt(k)} per hour, C(0) = 10`
              : `SIR in proportions, β = ${fmt(beta)}, γ = ${fmt(gamma)} per day (R₀ = ${fmt(beta / gamma, 2)}); infectious proportion shown`
        }
        xLabel={def.time}
        yUnit={model === 'sir' ? 'Infectious proportion I' : def.unit}
        series={[...exactSeries, ...methodSeries]}
        y={{ includeZero: model !== 'elimination' }}
        references={model === 'elimination' ? [{ axis: 'y', value: 0, label: 'C = 0' }] : []}
        footer="Computed in your browser with integrateFixed (src/lib/simulations/ode.ts); C++: cpp-examples/ode/."
      />
      {convergence.length > 0 && (
        <LabChart
          title="Halving the step divides the error by 2, 4 and 16 for orders 1, 2 and 4"
          subtitle={`Absolute error at t = ${def.tEnd} against step size, logarithmic axes`}
          xLabel="Step size h"
          yUnit="Absolute error at the end time"
          series={convergence}
          x={{ type: 'log' }}
          y={{ type: 'log' }}
          aspect={0.5}
          footer="On log–log axes the slope of each line is the order of the method; the smallest errors reach the limit of double precision."
        />
      )}
      {model === 'sir' && (
        <Readout
          items={[
            { label: 'Final susceptible proportion from the final-size relation', value: fmt(sirFinalSusceptible(0.999, { beta, gamma }), 6) },
            ...runs.map(({ m, sol }) => ({ label: `${METHOD_LABEL[m]} final S`, value: fmt(sol.x.at(-1)![0], 6) })),
          ]}
        />
      )}
    </LabShell>
  );
}
