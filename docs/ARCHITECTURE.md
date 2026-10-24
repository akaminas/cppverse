# Architecture

C++ Atlas is a static Astro site. Every page is rendered to HTML at build time; React is used
only for interactive parts ("islands"), which hydrate in the browser. There is no server, no
account system and no analytics. The only learner data is stored in the visitor's own browser.

## Stack

| Concern | Choice |
|---|---|
| Site generator | Astro 7, static output, base path `/cppverse/`, trailing slashes |
| Lessons | MDX in an Astro content collection (`src/content/lessons/`) |
| Islands | React 19 |
| Maths | KaTeX, rendered on the server (no maths JavaScript in the browser) |
| Code highlighting | Shiki with a CSS-variables theme mapped to Vellum tokens |
| Code editor | CodeMirror 6, loaded on demand, editing only (no execution) |
| Atlas pan and zoom | d3-zoom, d3-selection, d3-transition |
| Tests | Vitest (unit and model tests), Playwright with axe-core (browser and accessibility) |
| C++ checks | `scripts/check-cpp.sh` with g++-14 and clang++-18 in GitHub Actions |

All dependency versions are pinned exactly in `package.json`.

## Layout of the repository

```
src/
  data/            the curriculum as typed data: concepts, edges, domains, manual sections,
                   goals, labs, model assemblies, destinations, capstones, citation;
                   anatomy/, traces/ and mathcode/ hold per-lesson data for lesson components
  content/lessons/ the MDX lessons (one per lesson slug named in concepts.ts)
  lib/
    graph/         graph building, closures, topological order, routes, atlas layout
    validation/    the curriculum validator used by the build and the tests
    simulations/   the TypeScript models behind the laboratories (rng, discrete, matrix,
                   ode, gillespie, ibm)
    figures/       figure data computed at build time from the simulations
    persistence/   the learner store (localStorage, import/export)
    examples.ts    registry of the C++ programs in cpp-examples/
    coverage.ts    the manual-to-site coverage mapping
    highlight.ts, tex.ts, url.ts, topo.ts, markdown/  rendering helpers
  components/      atlas, charts, code, labs, lessons, models, progress, site, landing
  layouts/         BaseLayout (site chrome) and LessonLayout
  pages/           routes (see below)
  styles/          global and component CSS; vellum/ holds the design tokens
cpp-examples/      every C++ program shown on the site, with expected output
scripts/           validate-curriculum, generate-coverage, check-cpp.sh, compare-cpp-benchmarks
e2e/               Playwright tests
docs/              this documentation
```

## Routes

| Path | Page |
|---|---|
| `/` | Landing page |
| `/start/` | Onboarding: level, familiarity and goals |
| `/atlas/` | The zoomable concept atlas (`?node=<concept>` selects a node, `?goal=<goal>` shows a route) |
| `/learn/<slug>/` | A lesson |
| `/models/`, `/models/<id>/` | Model destinations with assembly views and laboratories |
| `/capstones/`, `/capstones/<id>/` | Capstone projects A–F |
| `/curriculum/` | The whole curriculum as an ordered list |
| `/pathways/` | Goal-based routes |
| `/progress/` | Progress dashboard, bookmarks, import and export |
| `/sources/` | Attribution and the manual coverage matrix |
| `/about/` | About the site |
| `/examples/<path>` | Raw C++ source files and companions, for download |

## The curriculum as data

The atlas, the lessons and the routes all come from `src/data/`.

- `concepts.ts`: each concept node has an id, a domain, a kind (concept, landmark, integration
  or capstone), a level (beginner, intermediate or seasoned), the lesson and anchor that teach
  it, the manual sections it covers, the goals it serves, and flags for optional and C++20/23
  material.
- `edges.ts`: typed relationships. Prerequisite, composition, application and extension
  edges are dependencies and must form a directed acyclic graph; conceptual and validation edges
  are informative and may form cycles.
- `manual.ts`: every section of the manual, marked instructional, advanced or excluded.

`src/lib/validation/curriculum.ts` checks this data and the lesson files together; the rules
are listed in [CURRICULUM.md](CURRICULUM.md). The check runs before every build, so a broken
graph or a missing anchor stops the build.

## Lessons and lesson components

Lessons import nothing. `src/components/lessons/mdx-components.ts` supplies the components:

- `Example`: reads a program from `cpp-examples/`, so the code on the page is exactly the code
  CI compiles. It shows the build command, the expected output and a download link.
- `Trace`, `Anatomy`, `MathCode`: step-through execution traces, annotated program structure,
  and synchronised maths and code. Their data lives in `src/data/traces/`, `anatomy/` and
  `mathcode/`. A unit test checks that each trace's printed output equals the program's `.out`
  file.
- `Figure`: charts computed at build time from `src/lib/simulations` or `src/lib/figures`.
- `Check`: knowledge checks; answers are recorded in the learner store.
- `Callout`, `Std`, `Concept`, `Anchor`, `Practice`, `MiniMap`: notes (including corrections to
  the manual), standard labels, links into the atlas, section anchors, original practice and a
  local map.

## The atlas

`src/lib/graph/layout.ts` computes a deterministic layout: domains are placed in columns that
run from foundations (west) to destinations (east); inside a domain, nodes are packed in a grid
ordered by topological layer. `src/components/atlas/Atlas.tsx` renders it as SVG and handles
zoom. Semantic zoom is driven by one CSS variable, `--k` (screen pixels per world unit): as it
grows past fixed thresholds, the atlas moves from a landscape of domains (only landmarks and the
selected node labelled) to concepts with the edges inside each domain, and finally to every edge. The side panel
(`AtlasPanel.tsx`) provides search, a node's prerequisites and dependants, routes and the legend.
Selection is reflected in the URL and the browser history.

## Routes through the curriculum

`src/lib/graph/routes.ts` computes a route to one or more targets: the dependency closure of the
targets in topological order, with ties broken by domain column, row and file order. Each step is
marked done, assumed (the learner's level and familiarity make it known), next, or to do.
Optional nodes are left out unless they are targets.

## Laboratories

Each laboratory is a React island in `src/components/labs/` that calls a model in
`src/lib/simulations/`. The models are deterministic given a seed (xoshiro128** in `rng.ts`), are
covered by unit tests against analytical results, and are cross-validated against the C++
programs in CI. Every laboratory states on screen that it is a browser simulation of the model,
not the C++ program.

## Learner state

`src/lib/persistence/store.ts` keeps one JSON object under the key `cpp-atlas:v1`: profile,
goals, lessons visited and marked studied, checks passed, bookmarks, recent nodes and the chosen
pathway. Every storage access is guarded, so the site works when storage is blocked. The progress
page exports and imports the state as a JSON file.

## C++ examples

`cpp-examples/<domain>/<name>.cpp` with optional companions:

- `<name>.out`: exact expected standard output
- `<name>.in`: standard input
- `<name>.args`: command-line arguments

Header lines in the source set the title (`// Title:`), the language standard (`// Standard:
C++17|C++20|C++23`, default C++17) and, for programs that demonstrate a compiler error,
`// Expect: compile-error`. The CI job compiles each program with `-Wall -Wextra -Wpedantic
-Werror` with both compilers, runs it, and compares the output.

## Build and deployment

`.github/workflows/deploy.yml` has three jobs:

1. **site:** `npm ci`, validate, unit tests, `astro check`, build, Playwright, upload the Pages
   artifact.
2. **cpp:** for g++-14 and clang++-18, `scripts/check-cpp.sh` and
   `scripts/compare-cpp-benchmarks.ts`.
3. **deploy:** on `main` only, after both jobs pass, deploys to GitHub Pages.
