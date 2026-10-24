// Synchronised mathematics and code. The TeX marks each term with
// \htmlClass{mc-<termId>}{...}; each term lists the C++ lines (1-based, in
// the displayed file) that implement it. Selecting either side highlights
// the other.
export interface MathCodeTerm {
  id: string;
  /** Short name, e.g. "per-capita growth factor". */
  label: string;
  /** What the term means mathematically and how the code computes it. */
  explain: string;
  lines: number[];
}

export interface MathCode {
  title: string;
  /** Display-mode TeX using \htmlClass{mc-<id>}{…} around each term. */
  tex: string;
  /** Example file (relative to /cpp-examples) or inline code. */
  file?: string;
  code?: string;
  terms: MathCodeTerm[];
  /** Optional range of lines to show (inclusive), e.g. [12, 30]. */
  show?: [number, number];
}
