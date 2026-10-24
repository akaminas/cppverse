# Implementation status

Status as of 24 October 2026. This document separates what is built and verified from what
is outstanding. "Verified" means checked by an automated test or a CI job, not just
inspected.

## Summary

| Area | Status |
|---|---|
| Curriculum: all 69 instructional and advanced manual sections | Implemented and validated |
| Lessons | 74 lessons, all present and anchored |
| Atlas | Implemented and tested in desktop and phone browsers |
| Model destinations (modules 14–17) and the scientific-inference synthesis | Implemented |
| Model assembly views | 5, implemented and tested |
| Laboratories | 5, implemented; models unit-tested and cross-validated against C++ |
| Onboarding, pathways, progress, import and export | Implemented and tested |
| Capstones A–F | Written |
| C++ examples | 160 programs; compile and run cleanly with g++-14 and clang++-18 in CI |
| Cross-validation of C++ against TypeScript | 20 of 20 checks pass with both compilers |
| Documentation | Complete (this folder and the README) |
| **GitHub Pages deployment** | **Configured but not deployed: blocked by a repository setting (see below)** |

## Verification

These all ran on the final commit:

| Check | Where | Result |
|---|---|---|
| `npm run validate` (curriculum graph, manual coverage, coverage document up to date) | local and CI | 0 errors, 0 warnings |
| `npm test` (Vitest) | local and CI | 292 tests pass |
| `npx astro check` | local and CI | 0 errors, 0 warnings, 0 hints |
| `astro build` | local and CI | 95 pages, plus every C++ file as a download |
| Playwright, desktop and phone (`npm run test:e2e`) | local (Windows) and CI (Ubuntu) | 61 pass, 1 skipped (a keyboard test that applies only to the desktop layout) |
| axe accessibility (WCAG 2 A and AA, serious or critical) on 9 representative pages, both viewports | local and CI | no violations |
| `scripts/check-cpp.sh` with g++-14 | CI | 160 programs pass |
| `scripts/check-cpp.sh` with clang++-18 | CI | 160 programs pass |
| `scripts/compare-cpp-benchmarks.ts` | CI, both compilers | 20 of 20 |

No C++ compiler was used locally; by design, C++ is checked only by the CI workflow on Ubuntu.

## Implemented features

- **Landing page:** title, phrase, attribution and a topographic background computed at build
  time. It loads a single small script for the theme switch and no framework JavaScript.
- **Onboarding** (`/start/`): level (beginner, intermediate, seasoned), C++ and modelling
  familiarity, and goals. The result is stored locally and sets the atlas pathway.
- **Atlas** (`/atlas/`):
  - layout and zoom: deterministic layout of 124 nodes in 12 domains; semantic zoom with three
    levels; fit, centre, and initial framing adapted to phones
  - finding and following: search with a combobox, backward ("all it needs") and forward ("what
    it leads to") highlighting, goal routes with done, assumed, next and to-do steps, and
    bookmarks
  - navigation: keyboard movement between nodes, and URL state with browser history
- **Lessons:** 74 MDX lessons with original prose and the following components:
  - compiled C++ examples, each with a build command, expected output and download
  - step-through traces, annotated program anatomy, and synchronised maths and code
  - figures computed at build time
  - knowledge checks
  - manual-correction callouts and original practice
  - a local mini-map
- **Model destinations** (`/models/`): algorithms and discrete-time models, matrix models, ODEs,
  stochastic simulation, individual-based models, and inference. Each has a prerequisite network,
  an assembly view, laboratory documentation (equations, parameters, assumptions, algorithm,
  verification, interpretation, limitations) and a laboratory.
- **Laboratories:** discrete-time (with update-order comparison), matrix, ODE (Euler, Heun, RK4
  and adaptive, with stability warnings), Gillespie (replicates against Kendall's formula), and
  individual-based (schedule, dispersal and global-interaction controls). Each one says on
  screen that it is a browser simulation, not the C++ program.
- **Progress** (`/progress/`): lessons visited and marked studied, checks passed, bookmarks,
  recent nodes, and JSON export and import.
- **Code editor:** CodeMirror is loaded only when a learner chooses to edit an example. It edits
  text only; it neither runs nor pretends to run code.
- **Sources** (`/sources/`): attribution and the full coverage matrix.
- **Theming:** light and dark Vellum themes, reduced-motion support, and phone layouts without
  horizontal page scrolling.

Hydration is selective: the atlas, onboarding and progress pages hydrate on load (they are the
page). Laboratories, checks, traces and other lesson islands hydrate when visible or when idle.

## Outstanding

### Deployment (external blocker)

The workflow builds and tests everything, and its deploy job fails at `actions/deploy-pages`
with `HttpError: Not Found`, because GitHub Pages is not enabled for the repository. Enabling
it through the API returns:

> Your current plan does not support GitHub Pages for this repository. (HTTP 422)

The repository `akaminas/cppverse` is **private**, and the account's plan does not include Pages
for private repositories. Either of these resolves it:

1. Make the repository public (Settings → General → Danger Zone → Change visibility), or
2. Upgrade to a plan that includes Pages for private repositories.

Then set **Settings → Pages → Build and deployment → Source** to **GitHub Actions** and re-run
the workflow (Actions → "Build, test and deploy" → Re-run all jobs). The site will be at
<https://akaminas.github.io/cppverse/>. The source PDFs have never been committed, so making the
repository public does not publish them. The brief is committed as `docs/MASTER_PROMPT.md` and
would become public too.

Until then, **the site is not deployed**, and nothing in this repository should be read as
saying it is.

### Known limitations

- Expected outputs assume x86-64. On an aarch64 runner, Clang's floating-point contraction could
  change the last printed digit of two data-structure examples (`matrix_stage_product`,
  `struct_logistic`).
- Twenty-two programs have no exact expected output, for the reasons given in
  [SCIENTIFIC_VALIDATION.md](SCIENTIFIC_VALIDATION.md). They are compiled with warnings as errors
  and must run to completion; the seven canonical model programs among them are cross-validated
  numerically.
- The code editor is for reading and adapting examples locally. Running code requires the
  learner's own compiler, and each example shows the command.
- Lesson text was written by several authors working in parallel to one content guide, and has
  been checked by the validator, the trace tests and CI. It has not had a full editorial
  read-through by a human domain expert.
- Learner progress lives in one browser. There are no accounts or sync, by design; export and
  import move it between devices.
