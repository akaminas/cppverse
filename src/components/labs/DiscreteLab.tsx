import { useMemo, useState } from 'react';
import {
  bevertonHoltExact,
  bevertonHoltStep,
  hostParasitoidEquilibrium,
  hostParasitoidTrajectory,
  iterate,
  logisticMapStep,
} from '../../lib/simulations/discrete';
import { fmt } from '../charts/scales';
import { LabChart, LabShell, Readout, Segmented, Slider } from './controls';

// Laboratory 1: discrete-time population dynamics. Every number shown is
// computed in the browser by the tested functions in
// src/lib/simulations/discrete.ts (the same equations as the C++ programs
// in cpp-examples/algorithms/).

type Mode = 'bh' | 'logistic' | 'order';

export default function DiscreteLab({ preset }: { preset?: string }) {
  const [mode, setMode] = useState<Mode>(preset === 'logistic' || preset === 'order' ? preset : 'bh');

  return (
    <div>
      <Segmented<Mode>
        label="Model"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'bh', label: 'Beverton–Holt' },
          { value: 'logistic', label: 'Logistic map' },
          { value: 'order', label: 'Update order' },
        ]}
      />
      {mode === 'bh' && <BevertonHolt />}
      {mode === 'logistic' && <LogisticMap />}
      {mode === 'order' && <UpdateOrder />}
    </div>
  );
}

function BevertonHolt() {
  const [R0, setR0] = useState(2.2);
  const [M, setM] = useState(40);
  const [N0, setN0] = useState(5);
  const [T, setT] = useState(30);
  const traj = useMemo(() => iterate((N) => bevertonHoltStep(N, { R0, M }), N0, T), [R0, M, N0, T]);
  const K = (R0 - 1) * M;
  const maxErr = Math.max(...traj.map((N, t) => Math.abs(N - bevertonHoltExact(N0, t, { R0, M }))));
  const claim = R0 > 1 ? `The population approaches K = ${fmt(K, 1)} without overshooting` : 'With R₀ ≤ 1 the population declines towards extinction';

  return (
    <LabShell
      title="Beverton–Holt laboratory"
      status={<>One generation per step · the simulation agrees with the closed-form solution to within {maxErr.toExponential(1)} individuals.</>}
      controls={
        <>
          <Slider label="R₀, growth factor at low density" value={R0} min={0.5} max={6} step={0.05} onChange={setR0} />
          <Slider label="M, density that halves the growth factor" value={M} min={5} max={200} step={1} unit="individuals" onChange={setM} digits={0} />
          <Slider label="N₀, initial population" value={N0} min={0} max={300} step={1} unit="individuals" onChange={setN0} digits={0} />
          <Slider label="Generations" value={T} min={5} max={80} step={1} onChange={setT} digits={0} />
          <Readout
            items={[
              { label: 'Equilibrium K = (R₀ − 1) M', value: R0 > 1 ? fmt(K, 2) : '0 (no positive equilibrium)' },
              { label: `N after ${T} generations`, value: fmt(traj[T], 3) },
            ]}
          />
        </>
      }
    >
      <LabChart
        title={claim}
        subtitle={`Beverton–Holt model, R₀ = ${fmt(R0)}, M = ${fmt(M, 0)}, N₀ = ${fmt(N0, 0)}`}
        xLabel="Generation t"
        yUnit="Population size N (individuals)"
        series={[{ id: 'N', label: 'Simulation', points: traj.map((N, t) => [t, N]), family: 'teal', markers: T <= 40 }]}
        references={R0 > 1 ? [{ axis: 'y', value: K, label: `K = ${fmt(K, 1)}` }] : []}
        y={{ includeZero: true }}
        footer="Computed in your browser with bevertonHoltStep (src/lib/simulations/discrete.ts); cpp-examples/algorithms/beverton_holt.cpp implements the same recurrence."
      />
    </LabShell>
  );
}

function LogisticMap() {
  const [r, setR] = useState(3.2);
  const [x0, setX0] = useState(0.2);
  const [T, setT] = useState(60);
  const [compare, setCompare] = useState(true);
  const a = useMemo(() => iterate((x) => logisticMapStep(x, { r }), x0, T), [r, x0, T]);
  const b = useMemo(() => iterate((x) => logisticMapStep(x, { r }), Math.min(0.999, x0 + 0.001), T), [r, x0, T]);
  const tail = a.slice(-12);
  const spread = Math.max(...tail) - Math.min(...tail);
  const regime =
    r <= 1
      ? 'declines to zero'
      : r < 3
        ? `settles at x* = ${fmt(1 - 1 / r, 3)}`
        : r < 3.449
          ? 'alternates between two values'
          : r < 3.57
            ? 'cycles with a longer period'
            : 'fluctuates irregularly (chaos is possible)';
  const diverge = a.findIndex((v, i) => Math.abs(v - b[i]) > 0.1);

  return (
    <LabShell
      title="Logistic map laboratory"
      status={
        <>
          For r = {fmt(r)} the population {regime}
          {compare && diverge > 0 ? `; runs that start 0.001 apart differ by more than 0.1 after ${diverge} generations` : ''}.
        </>
      }
      controls={
        <>
          <Slider label="r, maximum growth factor" value={r} min={0.5} max={4} step={0.01} onChange={setR} />
          <Slider label="x₀, initial scaled density" value={x0} min={0.01} max={0.99} step={0.01} onChange={setX0} />
          <Slider label="Generations" value={T} min={10} max={150} step={1} onChange={setT} digits={0} />
          <label className="lab-check">
            <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} />
            Compare with a start 0.001 higher
          </label>
          <Readout items={[{ label: 'Range of the last 12 values', value: fmt(spread, 4) }]} />
        </>
      }
    >
      <LabChart
        title={`The same rule ${regime}`}
        subtitle={`Discrete logistic map xₜ₊₁ = r xₜ (1 − xₜ) with r = ${fmt(r)}`}
        xLabel="Generation t"
        yUnit="Scaled density x"
        series={[
          { id: 'a', label: `x₀ = ${fmt(x0)}`, points: a.map((x, t) => [t, x]), family: 'teal', markers: T <= 60 },
          ...(compare ? [{ id: 'b', label: `x₀ = ${fmt(x0 + 0.001, 3)}`, points: b.map((x, t) => [t, x] as [number, number]), family: 'terracotta' as const }] : []),
        ]}
        y={{ domain: [0, 1] }}
        footer="Computed in your browser with logisticMapStep (src/lib/simulations/discrete.ts)."
      />
    </LabShell>
  );
}

function UpdateOrder() {
  const [r, setR] = useState(1.2);
  const [K, setK] = useState(80);
  const [a, setA] = useState(0.06);
  const [c, setC] = useState(0.8);
  const [T, setT] = useState(80);
  const sim = useMemo(() => hostParasitoidTrajectory([20, 2], T, { r, K, a, c }, 'simultaneous'), [r, K, a, c, T]);
  const seq = useMemo(() => hostParasitoidTrajectory([20, 2], T, { r, K, a, c }, 'sequential'), [r, K, a, c, T]);
  const eq = hostParasitoidEquilibrium({ r, K, a, c });
  const amp = (traj: [number, number][]) => {
    const tail = traj.slice(-20).map((s) => s[0]);
    return Math.max(...tail) - Math.min(...tail);
  };
  const differ = Math.abs(amp(sim) - amp(seq)) > 2;

  return (
    <LabShell
      title="Update-order laboratory"
      status={
        <>
          Final hosts: simultaneous {fmt(sim[T][0], 1)}, sequential {fmt(seq[T][0], 1)}.{' '}
          {differ ? 'The two implementations of the same equations disagree qualitatively.' : 'Here both orders end alike; try a larger r or a.'}
        </>
      }
      controls={
        <>
          <Slider label="r, host growth rate" value={r} min={0.2} max={2.5} step={0.05} onChange={setR} />
          <Slider label="K, host carrying capacity" value={K} min={20} max={200} step={5} onChange={setK} digits={0} />
          <Slider label="a, searching efficiency" value={a} min={0.01} max={0.15} step={0.005} onChange={setA} digits={3} />
          <Slider label="c, parasitoids per host attacked" value={c} min={0.2} max={2} step={0.05} onChange={setC} />
          <Slider label="Generations" value={T} min={20} max={200} step={5} onChange={setT} digits={0} />
          <Readout
            items={[
              { label: 'Fixed point (H*, P*)', value: eq ? `${fmt(eq[0], 2)}, ${fmt(eq[1], 2)}` : 'none with both species' },
              { label: 'Host range, last 20 generations', value: `${fmt(amp(sim), 1)} (simultaneous) · ${fmt(amp(seq), 1)} (sequential)` },
            ]}
          />
        </>
      }
    >
      <LabChart
        title={differ ? 'Updating hosts before parasitoids changes the dynamics of the same model' : 'Both update orders share the same fixed point'}
        subtitle={`Hosts in the host–parasitoid model, r = ${fmt(r)}, K = ${fmt(K, 0)}, a = ${fmt(a, 3)}, c = ${fmt(c)}`}
        xLabel="Generation t"
        yUnit="Hosts H (per unit area)"
        series={[
          { id: 'sim', label: 'Simultaneous (the model)', points: sim.map((s, t) => [t, s[0]]), family: 'teal' },
          { id: 'seq', label: 'Sequential (a bug)', points: seq.map((s, t) => [t, s[0]]), family: 'terracotta' },
        ]}
        references={eq ? [{ axis: 'y', value: eq[0], label: `H* = ${fmt(eq[0], 1)}` }] : []}
        y={{ includeZero: true }}
        footer="Computed in your browser with hostParasitoidTrajectory (src/lib/simulations/discrete.ts); see cpp-examples/algorithms/host_parasitoid.cpp."
      />
    </LabShell>
  );
}
