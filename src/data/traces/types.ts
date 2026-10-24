export interface TraceStep {
  /** Line that has just executed (1-based, in the displayed code). */
  line: number;
  note: string;
  /** Variables alive after this line, name → value as printed. */
  vars?: Record<string, string>;
  /** Text printed by this step (appended to the output so far). */
  out?: string;
}

// Hand-written step-through traces. A trace refers to an example program
// (`file`, relative to /cpp-examples) or carries its own `code`. When it
// refers to a file with a .out companion, CI checks that the concatenated
// `out` text equals the program's real output (scripts/check-traces.ts).
export interface Trace {
  title: string;
  file?: string;
  code?: string;
  steps: TraceStep[];
}
