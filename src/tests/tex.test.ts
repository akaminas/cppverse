import { describe, expect, it } from 'vitest';
import { tex } from '../lib/tex.ts';

describe('server-side KaTeX', () => {
  it('trusts \\htmlClass so maths–code terms become selectable hooks', () => {
    const html = tex('\\htmlClass{mc-rate}{r} N');
    expect(html).toContain('mc-rate');
    expect(html).not.toContain('htmlClass');
  });

  it('makes display maths keyboard-focusable, since it may scroll on narrow screens', () => {
    expect(tex('N_{t+1} = R N_t')).toContain('<span class="katex-display" tabindex="0">');
    expect(tex('x', false)).not.toContain('tabindex');
  });
});
