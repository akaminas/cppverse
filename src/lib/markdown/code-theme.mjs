// Syntax highlighting theme for Shiki that resolves every colour through CSS
// custom properties, so code blocks follow the Vellum light/dark twin without
// re-rendering. The variables are defined in src/styles/code.css.
import { createCssVariablesTheme } from 'shiki';

export const vellumCodeTheme = createCssVariablesTheme({
  name: 'vellum-code',
  variablePrefix: '--code-',
  variableDefaults: {},
  fontStyle: true,
});
