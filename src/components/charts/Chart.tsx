import { useId, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type { VellumFamily } from '../../data/types';
import { SLOT_ORDER, deep, fmt, makeScale, niceDomain, tint, tone, type ScaleType } from './scales';

// A Vellum-compliant scientific chart (time series, convergence plots,
// replicate ensembles). Anatomy: claim title, muted subtitle, unit line
// above the y axis, horizontal hairline grid, bottom spine, no tick marks,
// three to five round ticks, direct end labels with ringed dots, tint bands
// at 0.55 opacity, dotted ochre reference lines, a traceable footer and the
// data available as a table. Colours resolve through CSS variables, so the
// chart follows the light/dark twin without re-rendering.

export interface Series {
  id: string;
  label: string;
  points: readonly (readonly [number, number])[];
  family?: VellumFamily;
  /** line: 2.2 px; member: thin replicate line; step: piecewise constant; points: dots only. */
  kind?: 'line' | 'member' | 'step' | 'points';
  /** Draw in rule grey (a baseline or comparison that is not the point). */
  grey?: boolean;
  /** Dots at every point (discrete-time data). */
  markers?: boolean;
  /** Direct label at the line end (default true for line/step). */
  endLabel?: boolean;
  /** Dashed line for an exact/analytical solution drawn beneath numerical ones. */
  dashed?: boolean;
  /** Draw as a step function (piecewise constant), e.g. stochastic member paths. */
  step?: boolean;
}

export interface Band {
  id: string;
  label: string;
  points: readonly (readonly [number, number, number])[];
  family?: VellumFamily;
  opacity?: number;
}

export interface Reference {
  axis: 'x' | 'y';
  value: number;
  label: string;
}

export interface AxisSpec {
  domain?: [number, number];
  type?: ScaleType;
  ticks?: number[];
  includeZero?: boolean;
  format?: (v: number) => string;
}

export interface ChartProps {
  title: string;
  subtitle?: string;
  xLabel: string;
  yUnit: string;
  series: Series[];
  bands?: Band[];
  references?: Reference[];
  x?: AxisSpec;
  y?: AxisSpec;
  note?: string;
  footer?: string;
  width?: number;
  height?: number;
  /** Crosshair and tooltip (client islands only). */
  interactive?: boolean;
  /** Maximum rows in the data table. */
  tableRows?: number;
  className?: string;
}

const M = { top: 34, right: 118, bottom: 46, left: 54 };

function familyOf(s: Series, i: number): VellumFamily {
  return s.family ?? SLOT_ORDER[i % SLOT_ORDER.length];
}

export default function Chart({
  title,
  subtitle,
  xLabel,
  yUnit,
  series,
  bands = [],
  references = [],
  x = {},
  y = {},
  note,
  footer,
  width = 680,
  height = 360,
  interactive = false,
  tableRows = 24,
  className,
}: ChartProps) {
  const uid = useId().replace(/:/g, '');
  const hasEndLabels = series.some((s) => (s.endLabel ?? (s.kind !== 'member' && s.kind !== 'points')) && s.points.length);
  const margin = { ...M, right: hasEndLabels ? M.right : 24 };
  const iw = Math.max(80, width - margin.left - margin.right);
  const ih = Math.max(60, height - margin.top - margin.bottom);

  const { xs, ys } = useMemo(() => {
    const allX: number[] = [];
    const allY: number[] = [];
    for (const s of series) for (const [px, py] of s.points) if (Number.isFinite(px) && Number.isFinite(py)) (allX.push(px), allY.push(py));
    for (const b of bands) for (const [px, lo, hi] of b.points) (allX.push(px), allY.push(lo, hi));
    for (const r of references) (r.axis === 'y' ? allY : allX).push(r.value);
    const xType = x.type ?? 'linear';
    const yType = y.type ?? 'linear';
    const posX = xType === 'log' ? allX.filter((v) => v > 0) : allX;
    const posY = yType === 'log' ? allY.filter((v) => v > 0) : allY;
    const xd = x.domain ?? (posX.length ? niceDomain(Math.min(...posX), Math.max(...posX), xType) : [0, 1]);
    const yd = y.domain ?? (posY.length ? niceDomain(Math.min(...posY), Math.max(...posY), yType, y.includeZero ?? false) : [0, 1]);
    return {
      xs: makeScale(xd as [number, number], [0, iw], xType, x.ticks),
      ys: makeScale(yd as [number, number], [ih, 0], yType, y.ticks),
    };
  }, [series, bands, references, x.domain, x.type, x.ticks, y.domain, y.type, y.ticks, y.includeZero, iw, ih]);

  const fx = x.format ?? ((v: number) => fmt(v));
  const fy = y.format ?? ((v: number) => fmt(v));
  const clampY = (v: number) => Math.max(-ih * 0.05, Math.min(ih * 1.05, ys(v)));

  const pathFor = (s: Series) => {
    const pts = s.points.filter(([px, py]) => Number.isFinite(px) && Number.isFinite(py) && (ys.type !== 'log' || py > 0) && (xs.type !== 'log' || px > 0));
    if (!pts.length) return '';
    if (s.kind === 'step' || s.step) {
      let d = `M${xs(pts[0][0]).toFixed(1)},${clampY(pts[0][1]).toFixed(1)}`;
      for (let i = 1; i < pts.length; i++) d += `H${xs(pts[i][0]).toFixed(1)}V${clampY(pts[i][1]).toFixed(1)}`;
      return d;
    }
    return 'M' + pts.map(([px, py]) => `${xs(px).toFixed(1)},${clampY(py).toFixed(1)}`).join('L');
  };

  const bandPath = (b: Band) => {
    const up = b.points.map(([px, , hi]) => `${xs(px).toFixed(2)},${clampY(hi).toFixed(2)}`);
    const down = [...b.points].reverse().map(([px, lo]) => `${xs(px).toFixed(2)},${clampY(lo).toFixed(2)}`);
    return `M${up.join('L')}L${down.join('L')}Z`;
  };

  // End labels, spread apart vertically when they collide.
  const labels = series
    .map((s, i) => ({ s, i, last: [...s.points].reverse().find(([px, py]) => Number.isFinite(px) && Number.isFinite(py)) }))
    .filter(({ s, last }) => last && (s.endLabel ?? (s.kind !== 'member' && s.kind !== 'points')))
    .map(({ s, i, last }) => ({ id: s.id, label: s.label, family: familyOf(s, i), grey: s.grey, x: xs(last![0]), y: clampY(last![1]), ly: clampY(last![1]) }))
    .sort((a, b) => a.y - b.y);
  for (let k = 1; k < labels.length; k++) if (labels[k].ly - labels[k - 1].ly < 16) labels[k].ly = labels[k - 1].ly + 16;
  const overflow = labels.length ? labels[labels.length - 1].ly - ih : 0;
  if (overflow > 0) for (const l of labels) l.ly -= overflow;

  // Interactive crosshair.
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const xValues = useMemo(() => {
    const set = new Set<number>();
    for (const s of series) if (s.kind !== 'member') for (const [px] of s.points) set.add(px);
    return [...set].sort((a, b) => a - b);
  }, [series]);
  const onMove = (e: ReactPointerEvent<SVGRectElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || !xValues.length) return;
    const px = ((e.clientX - rect.left) / rect.width) * width - margin.left;
    let best = 0;
    let bestD = Infinity;
    for (let k = 0; k < xValues.length; k++) {
      const d = Math.abs(xs(xValues[k]) - px);
      if (d < bestD) (bestD = d), (best = k);
    }
    setHover(xValues[best]);
  };
  const valueAt = (s: Series, xv: number) => {
    if (s.kind === 'step' || s.step) {
      let v: number | undefined;
      for (const [px, py] of s.points) if (px <= xv) v = py;
      return v;
    }
    return s.points.find(([px]) => px === xv)?.[1];
  };

  // Data table (downsampled).
  const tableSeries = series.filter((s) => s.kind !== 'member').slice(0, 6);
  const tableX = xValues.length > tableRows ? xValues.filter((_, k) => k % Math.ceil(xValues.length / tableRows) === 0) : xValues;

  return (
    <figure className={['vfig', className].filter(Boolean).join(' ')}>
      <figcaption className="vfig-head">
        <h3 className="vfig-title" id={`${uid}-t`}>{title}</h3>
        {subtitle && <p className="vfig-sub" id={`${uid}-s`}>{subtitle}</p>}
      </figcaption>
      <div className="vfig-plot">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-labelledby={`${uid}-t`}
          aria-describedby={subtitle ? `${uid}-s` : undefined}
          className="vfig-svg"
        >
          <g transform={`translate(${margin.left},${margin.top})`}>
            {/* unit line above the y axis */}
            <text x={-margin.left + 6} y={-16} className="vfig-unit">{yUnit}</text>
            {/* horizontal hairline grid and y tick labels */}
            {ys.ticks.map((t) => (
              <g key={`y${t}`}>
                <line x1={0} x2={iw} y1={ys(t)} y2={ys(t)} className="vfig-grid" />
                <text x={-8} y={ys(t)} dy="0.32em" textAnchor="end" className="vfig-tick">{fy(t)}</text>
              </g>
            ))}
            {/* bottom spine and x tick labels */}
            <line x1={0} x2={iw} y1={ih} y2={ih} className="vfig-spine" />
            {xs.ticks.map((t) => (
              <text key={`x${t}`} x={xs(t)} y={ih + 18} textAnchor="middle" className="vfig-tick">{fx(t)}</text>
            ))}
            <text x={iw / 2} y={ih + 38} textAnchor="middle" className="vfig-axis">{xLabel}</text>

            {bands.map((b, i) => (
              <path key={b.id} d={bandPath(b)} fill={tint(b.family ?? SLOT_ORDER[i])} fillOpacity={b.opacity ?? 0.55} stroke="none" />
            ))}
            {references.map((r) =>
              r.axis === 'y' ? (
                <g key={`r${r.value}${r.label}`}>
                  <line x1={0} x2={iw} y1={ys(r.value)} y2={ys(r.value)} className="vfig-ref" />
                  <text x={iw} y={ys(r.value) - 6} textAnchor="end" className="vfig-note">{r.label}</text>
                </g>
              ) : (
                <g key={`r${r.value}${r.label}`}>
                  <line x1={xs(r.value)} x2={xs(r.value)} y1={0} y2={ih} className="vfig-ref" />
                  <text x={xs(r.value) + 6} y={10} className="vfig-note">{r.label}</text>
                </g>
              ),
            )}
            {series.map((s, i) => {
              const fam = familyOf(s, i);
              const colour = s.grey ? 'var(--v-rule)' : tone(fam);
              if (s.kind === 'points') {
                return (
                  <g key={s.id}>
                    {s.points.map(([px, py], k) => (
                      <circle key={k} cx={xs(px)} cy={clampY(py)} r={3.2} fill={colour} stroke="var(--v-surface)" strokeWidth={1.2} />
                    ))}
                  </g>
                );
              }
              return (
                <g key={s.id}>
                  <path
                    d={pathFor(s)}
                    fill="none"
                    stroke={colour}
                    strokeWidth={s.kind === 'member' ? 1 : 2.2}
                    strokeOpacity={s.kind === 'member' ? 0.55 : 1}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={s.dashed ? '6 5' : undefined}
                  />
                  {s.markers &&
                    s.points.map(([px, py], k) => (
                      <circle key={k} cx={xs(px)} cy={clampY(py)} r={2.6} fill={colour} stroke="var(--v-surface)" strokeWidth={1} />
                    ))}
                </g>
              );
            })}
            {labels.map((l) => (
              <g key={`l${l.id}`}>
                {Math.abs(l.ly - l.y) > 2 && <line x1={l.x + 5} x2={l.x + 9} y1={l.y} y2={l.ly} className="vfig-leader" />}
                <circle cx={l.x} cy={l.y} r={4.5} fill={l.grey ? 'var(--v-rule)' : tone(l.family)} stroke="var(--v-surface)" strokeWidth={1.8} />
                <text x={l.x + 10} y={l.ly} dy="0.32em" className="vfig-end">{l.label}</text>
              </g>
            ))}
            {note && <text x={iw - 4} y={ih - 10} textAnchor="end" className="vfig-note">{note}</text>}

            {interactive && (
              <>
                {hover !== null && (
                  <g>
                    <line x1={xs(hover)} x2={xs(hover)} y1={0} y2={ih} className="vfig-cross" />
                    {series.map((s, i) => {
                      if (s.kind === 'member') return null;
                      const v = valueAt(s, hover);
                      if (v === undefined || !Number.isFinite(v)) return null;
                      return <circle key={s.id} cx={xs(hover)} cy={clampY(v)} r={4.5} fill={s.grey ? 'var(--v-rule)' : tone(familyOf(s, i))} stroke="var(--v-surface)" strokeWidth={1.8} />;
                    })}
                  </g>
                )}
                <rect x={0} y={0} width={iw} height={ih} fill="transparent" onPointerMove={onMove} onPointerLeave={() => setHover(null)} />
              </>
            )}
          </g>
        </svg>
        {interactive && hover !== null && (
          <div className="vtip" role="status" aria-live="polite" style={{ left: `${((margin.left + xs(hover)) / width) * 100}%` }}>
            <div className="vtip-head">{xLabel} {fx(hover)}</div>
            {series.map((s, i) => {
              if (s.kind === 'member') return null;
              const v = valueAt(s, hover);
              if (v === undefined) return null;
              return (
                <div key={s.id} className="vtip-row">
                  <span className="vtip-key" style={{ background: s.grey ? 'var(--v-rule)' : tone(familyOf(s, i)) }} />
                  <strong>{fy(v)}</strong> <span>{s.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {footer && <p className="vfig-foot">{footer}</p>}
      {tableSeries.length > 0 && tableX.length > 0 && (
        <details className="vfig-data">
          <summary>Show the data as a table</summary>
          <div className="table-scroll" tabIndex={0} role="region" aria-label="Data of the figure">

            <table>
              <thead>
                <tr>
                  <th scope="col">{xLabel}</th>
                  {tableSeries.map((s) => (
                    <th key={s.id} scope="col">{s.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableX.map((xv) => (
                  <tr key={xv}>
                    <td>{fx(xv)}</td>
                    {tableSeries.map((s) => {
                      const v = valueAt(s, xv);
                      return <td key={s.id}>{v === undefined ? '' : fmt(v, 4)}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </figure>
  );
}

export { tone, tint, deep };
