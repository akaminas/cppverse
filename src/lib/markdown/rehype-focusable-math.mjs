// Makes display maths keyboard-focusable. Wide equations scroll sideways on
// narrow screens, and a scrollable region must be reachable without a mouse
// (WCAG 2.1.1). Runs after rehype-katex.
import { visit } from 'unist-util-visit';

export function rehypeFocusableMath() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      const cls = node.properties?.className;
      if (Array.isArray(cls) && cls.includes('katex-display')) node.properties.tabIndex = 0;
    });
  };
}
