// Server-side KaTeX rendering (no maths JavaScript in the browser).
import katex from 'katex';

export function tex(source: string, display = true): string {
  return katex.renderToString(source, {
    displayMode: display,
    throwOnError: true,
    strict: 'ignore',
    // Only \htmlClass is trusted: it adds hooks for synchronised highlighting.
    trust: (ctx: { command: string }) => ctx.command === '\\htmlClass',
    output: 'html',
  });
}
