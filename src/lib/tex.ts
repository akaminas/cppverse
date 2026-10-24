// Server-side KaTeX rendering (no maths JavaScript in the browser).
import katex from 'katex';

export function tex(source: string, display = true): string {
  const html = katex.renderToString(source, {
    displayMode: display,
    throwOnError: true,
    strict: 'ignore',
    // Only \htmlClass is trusted: it adds hooks for synchronised highlighting.
    trust: (ctx: { command: string }) => ctx.command === '\\htmlClass',
    output: 'html',
  });
  // Wide display maths scrolls on narrow screens, so it must be keyboard-focusable.
  return display ? html.replace('<span class="katex-display">', '<span class="katex-display" tabindex="0">') : html;
}
