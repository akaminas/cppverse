// Code anatomy: a program split into explorable parts.
// Each line is a list of segments; a segment is plain text or [text, partId].
export interface AnatomyPart {
  label: string;
  /** Grammatical role, shown as a small label. */
  role: string;
  explain: string;
}

export interface Anatomy {
  title: string;
  lines: (string | [string, string])[][];
  parts: Record<string, AnatomyPart>;
  /** Part selected when the view opens. */
  start: string;
}
