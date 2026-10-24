import { describe, expect, it } from 'vitest';
import { tex } from '../lib/tex.ts';

describe('server-side KaTeX', () => {
  it('trusts \\htmlClass so maths–code terms become selectable hooks', () => {
    const html = tex('\\htmlClass{mc-rate}{r} N');
    expect(html).toContain('mc-rate');
    expect(html).not.toContain('htmlClass');
  });
});
