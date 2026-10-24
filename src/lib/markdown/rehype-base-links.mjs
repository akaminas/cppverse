// Rewrites root-relative links in Markdown/MDX (href="/learn/x/") so that they
// include the deployment base path (e.g. /cppverse/learn/x/). Lesson authors
// can therefore write site-absolute links without knowing where the site is
// hosted.
import { visit } from 'unist-util-visit';

export function rehypeBaseLinks({ base = '/' } = {}) {
  const prefix = base.endsWith('/') ? base.slice(0, -1) : base;
  return (tree) => {
    if (!prefix) return;
    visit(tree, 'element', (node) => {
      for (const attr of ['href', 'src']) {
        const value = node.properties?.[attr];
        if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.startsWith(prefix + '/')) {
          node.properties[attr] = prefix + value;
        }
      }
    });
  };
}
