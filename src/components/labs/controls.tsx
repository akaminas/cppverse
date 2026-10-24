import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import Chart, { type ChartProps } from '../charts/Chart';
import { fmt } from '../charts/scales';

// Shared controls for the laboratories.

export function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  digits = 2,
  log = false,
  note,
}: {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
  digits?: number;
  /** Logarithmic slider (value spans orders of magnitude). */
  log?: boolean;
  note?: string;
}) {
  const id = useId();
  const toSlider = (v: number) => (log ? Math.log10(v) : v);
  const fromSlider = (s: number) => (log ? Math.pow(10, s) : s);
  return (
    <div className="lab-slider">
      <label htmlFor={id}>
        <span className="lab-slider-label">{label}</span>
        <output htmlFor={id} className="lab-slider-value">
          {fmt(value, digits)}
          {unit ? ` ${unit}` : ''}
        </output>
      </label>
      <input
        id={id}
        type="range"
        min={toSlider(min)}
        max={toSlider(max)}
        step={log ? (toSlider(max) - toSlider(min)) / 200 : step}
        value={toSlider(value)}
        onChange={(e) => {
          const raw = fromSlider(Number(e.target.value));
          onChange(log ? Number(raw.toPrecision(3)) : Math.round(raw / step) * step);
        }}
        aria-describedby={note ? `${id}-note` : undefined}
      />
      {note && (
        <span className="lab-note" id={`${id}-note`}>
          {note}
        </span>
      )}
    </div>
  );
}

export function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="lab-seg">
      <span className="lab-seg-label">{label}</span>
      <div className="seg" role="group" aria-label={label}>
        {options.map((o) => (
          <button key={o.value} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Readout({ items }: { items: { label: string; value: ReactNode; note?: string }[] }) {
  return (
    <dl className="lab-readout">
      {items.map((it) => (
        <div key={it.label}>
          <dt>{it.label}</dt>
          <dd>
            {it.value}
            {it.note && <span className="lab-note"> {it.note}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** Measure the width of a container (for charts that redraw at their real size). */
export function useWidth<T extends HTMLElement>(fallback = 640): [React.RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.round(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

/** A Vellum chart that redraws at the width of its container (text stays legible on phones). */
export function LabChart(props: Omit<ChartProps, 'width' | 'height'> & { aspect?: number }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const { aspect = 0.52, ...rest } = props;
  return (
    <div ref={ref} className="lab-chart">
      <Chart {...rest} interactive width={width} height={Math.max(240, Math.round(width * aspect))} />
    </div>
  );
}

export function LabShell({ title, controls, children, status }: { title: string; controls: ReactNode; children: ReactNode; status?: ReactNode }) {
  return (
    <section className="lab" aria-label={title}>
      <div className="lab-grid">
        <div className="lab-controls">{controls}</div>
        <div className="lab-output">
          {status && (
            <p className="lab-status" role="status" aria-live="polite">
              {status}
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
