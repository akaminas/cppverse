// Build-time syntax highlighting with Shiki, using the CSS-variable theme so
// that highlighted code follows the light/dark twin. Only used on the
// server; no highlighter is shipped to the browser.
import { createHighlighter, type Highlighter } from 'shiki';
import { vellumCodeTheme } from './markdown/code-theme.mjs';

let highlighter: Promise<Highlighter> | null = null;

function getHighlighter() {
  highlighter ??= createHighlighter({ themes: [vellumCodeTheme], langs: ['cpp', 'python', 'r', 'bash', 'cmake', 'text', 'csv'] });
  return highlighter;
}

/** Parse "3,5-7" into a set of 1-based line numbers. */
export function parseLines(spec?: string): Set<number> {
  const out = new Set<number>();
  if (!spec) return out;
  for (const part of spec.split(',')) {
    const [a, b] = part.split('-').map((x) => parseInt(x.trim(), 10));
    if (Number.isFinite(a)) for (let i = a; i <= (Number.isFinite(b) ? b : a); i++) out.add(i);
  }
  return out;
}

export interface HighlightOptions {
  lang?: string;
  mark?: Set<number>;
  /** Per-line data-ids, used by synchronised maths–code views. */
  lineIds?: Record<number, string>;
  /** Number of the first line (when showing an excerpt of a file). */
  startLine?: number;
}

/** Highlight code to HTML; each line is a <span class="line" data-line="n">. */
export async function highlight(code: string, { lang = 'cpp', mark, lineIds, startLine = 1 }: HighlightOptions = {}): Promise<string> {
  const h = await getHighlighter();
  return h.codeToHtml(code.replace(/\s+$/, ''), {
    lang,
    theme: 'vellum-code',
    transformers: [
      {
        line(node, local) {
          const line = local + startLine - 1;
          node.properties['data-line'] = String(line);
          if (mark?.has(line)) this.addClassToHast(node, 'is-marked');
          if (lineIds?.[line]) node.properties['data-id'] = lineIds[line];
        },
        pre(node) {
          delete node.properties.tabindex;
          this.addClassToHast(node, 'code-lines');
        },
      },
    ],
  });
}
