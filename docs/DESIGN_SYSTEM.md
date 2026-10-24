# Design system

The site uses **Vellum**: a white page with warm cream cards and six earth-pigment hue
families (teal, terracotta, indigo, ochre, mauve, moss). Each family has three steps of one hue
angle (tint, tone, deep), and Vellum has a dark twin on warm charcoal. Vellum is MIT-licensed.
Its tokens are copied verbatim into `src/styles/vellum/vellum.css`, with the machine-readable
definition in `src/styles/vellum/vellum.json`. Nothing in those two files is edited; site-specific
tokens are defined on top of them in `src/styles/global.css`.

## Tokens

| Group | Tokens | Use |
|---|---|---|
| Neutrals | `--v-surface`, `--v-card`, `--v-grid`, `--v-rule`, `--v-muted`, `--v-secondary`, `--v-ink` | page, cards, gridlines, rules, de-emphasised and body text |
| Families | `--v-<family>`, `--v-<family>-tint`, `--v-<family>-deep` | data series, domains, highlights |
| Status | `--v-status-good`, `-warning`, `-serious`, `-critical` | check feedback, laboratory warnings |
| Gradients | `--v-grad-lagoon`, `-ember`, `-shore` | sequential scales (the landing contours use neutrals) |
| Type | `--v-font-title` (Palatino / TeX Gyre Pagella), `--v-font-body` (Corbel / Lato) | headings and body |

Site chrome adds `--bg`, `--panel`, `--soft`, `--line`, `--frame` and `--accent` (indigo deep),
following the sleek layer of Vellum's own site: page equals surface, panels are a faint tone of
the page, there are few borders, and navigation and labels use small, spaced capitals.

**Fonts.** TeX Gyre Pagella and Lato are self-hosted as WOFF2 in `src/assets/fonts/`, with
`font-display: swap`. Palatino Linotype and Corbel are used first where the system has them.
Code uses Consolas, then the platform's monospace.

## Colour assignments

| Domain | Family |
|---|---|
| Algorithm design (discrete-time and matrix models) | indigo |
| Numerical integration | teal |
| Stochastic modelling | ochre |
| Individual-based modelling | moss |
| Scientific inference | mauve |
| Foundations and structure domains | neutrals |

Each domain region in the atlas, each model page and each laboratory uses its family:
`.fam-<family>` sets `--fam`, `--fam-tint` and `--fam-deep`, which components read. Within a
chart, series take families in a fixed order and keep that colour wherever the same quantity
appears again.

## Dark mode

Dark mode switches `data-theme="dark"` on the root element. Vellum redefines every token under
that selector, and the site-chrome tokens are redefined beside it. An inline script in
`BaseLayout.astro` sets the theme before first paint. The order of precedence is a `?theme=`
query parameter, then the stored choice (`localStorage` key `vellum-theme`), then light. The
theme button stores the choice; storage failures are ignored.

## Charts

`src/components/charts/Chart.tsx` draws every figure in Vellum's chart anatomy
(`src/styles/charts.css`):

- a serif title and a one-line subtitle that states the finding
- light gridlines and spines in `--v-grid`
- tick and axis labels in `--v-muted`, with units on the axes
- direct end-of-line labels instead of a legend where possible
- dotted ochre reference lines for analytical values such as equilibria or exact solutions
- a hover crosshair and tooltip
- a "data" disclosure under each chart that shows the plotted numbers as a table, so the
  figure is accessible without the graphic

Figures in lessons are computed at build time from the same TypeScript models the
laboratories use. Laboratories redraw the same chart component live.

## Code

Shiki highlights code at build time with a CSS-variables theme
(`src/lib/markdown/code-theme.mjs`). Token colours are Vellum variables, mostly the deep step of a
family, with comments and punctuation in `--v-secondary` (`src/styles/code.css`). Because Vellum
redefines those variables in dark mode, code follows the theme without re-rendering.

## Layout and motion

- The reading measure is 68ch; the page is at most 1180px wide; the gutter is 24px, or 16px
  under 620px wide. No page scrolls horizontally on a phone; wide code, tables and display
  maths scroll inside their own focusable boxes.
- Motion is limited to one slow drift of the landing page's contour lines, the atlas's zoom
  transitions, and fades of nodes outside the current focus or route. The drift stops under
  `prefers-reduced-motion: reduce`.

## Deliberate deviations from Vellum

1. **Secondary instead of muted for UI text.** Vellum's `--v-muted` (#8A857C on white) is about
   3.7:1, which is below the WCAG AA minimum of 4.5:1 for body-size text. The site therefore uses
   `--v-secondary` for every piece of interface text: captions, labels, footers, metadata, the
   `.muted` utility class and chart footnotes. `--v-muted` is kept only where Vellum's chart
   anatomy uses it for non-essential marks: tick labels, axis units, atlas region captions and
   legend dots. That text is either repeated in the data table or is decorative. The Playwright
   suite runs axe on representative pages to keep this true.
2. **Landing contours.** The landing page draws topographic contour lines, computed by marching
   squares (`src/lib/topo.ts`), in `--v-grid` and `--v-rule`, and lets them drift slowly. Vellum
   itself is static. The contours are neutral, sit behind the content, are hidden from
   assistive technology and stop moving under reduced motion.
3. **Faded states in the atlas.** When a route or a selection is shown, other domains and nodes
   fade to 45–60% opacity, and edges outside the route turn grey (`--v-grid`). Vellum has no
   interaction states for a graph, so these are additions, kept to opacity and neutrals so that
   family colours keep their meaning.
