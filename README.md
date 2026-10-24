# C++ Atlas — Programming and Modelling for Biologists

A static website that teaches C++ to biologists as a route to building scientific models:
discrete-time population models, matrix models, ordinary differential equations, stochastic
simulation with the Gillespie algorithm, individual-based models, and the inference that turns
simulation output into scientific claims.

The curriculum follows the University of Groningen course manual *Programming in C++ for
Biologists*. Every instructional section of the manual is covered by an original lesson (see
[docs/STUDENT_MANUAL_COVERAGE.md](docs/STUDENT_MANUAL_COVERAGE.md)); the manual's exercises,
solutions, assignments and projects are not reproduced. The site is independent and is not
endorsed by the University of Groningen.

> C++ for biologists course material, University of Groningen, Faculty of Science and Engineering, Nijenborgh 7, 9747 AG Groningen

Live site (after deployment): <https://akaminas.github.io/cppverse/>

## What is in it

- **Atlas** (`/atlas/`): a zoomable map of 124 concepts in 12 domains, joined by typed edges
  (prerequisite, composition, application, extension, conceptual, validation). Zooming reveals
  more detail; search, routes to a goal, bookmarks, keyboard navigation and a phone layout are
  built in.
- **Lessons** (`/learn/<slug>/`): 74 lessons written in MDX, with compiled C++ examples,
  step-through traces, annotated program anatomy, synchronised maths and code, computed
  figures and knowledge checks.
- **Model destinations** (`/models/`): the discrete-time and matrix models, the ODE, stochastic
  and individual-based models (manual modules 14–17) and a scientific-inference synthesis. Each
  has a model assembly view that links every part of the mathematics to the lines of C++ that
  implement it, and a browser laboratory.
- **Laboratories:** five interactive simulations written in TypeScript (discrete-time, matrix,
  ODE, Gillespie, individual-based). They are clearly labelled as browser simulations: **the
  site never runs or pretends to run C++.** The C++ programs are compiled and run in CI and
  cross-validated against the laboratories.
- **Pathways and progress:** a start page asks for a level (beginner, intermediate or seasoned)
  and goals, then recommends a route. Progress stays in the browser's local storage and can be
  exported and imported as JSON.
- **Capstones** (`/capstones/`): six original projects, A–F, one for each modelling family plus
  inference.

## Developing

Requires Node 24 (see `.nvmrc`).

```sh
npm ci
npm run dev          # http://localhost:4321/cppverse/
npm run validate     # curriculum graph, manual coverage, coverage document up to date
npm test             # unit and scientific model tests (Vitest)
npx astro check      # type-check
npm run build        # validate, then build the static site into dist/
npm run test:e2e     # Playwright: navigation, atlas, labs, accessibility (axe)
npm run coverage     # regenerate docs/STUDENT_MANUAL_COVERAGE.md
```

The C++ examples are checked in CI on Ubuntu with g++-14 and clang++-18. To run the same check
locally on a machine with a compiler:

```sh
CXX=g++ bash scripts/check-cpp.sh
node --experimental-strip-types scripts/compare-cpp-benchmarks.ts
```

## Deployment

`.github/workflows/deploy.yml` validates, tests and builds the site, compiles and
cross-validates the C++ with both compilers, and deploys `dist/` to GitHub Pages when every job
passes on `main`. Once per repository, set **Settings → Pages → Build and deployment → Source**
to **GitHub Actions**. A private repository needs a GitHub plan that includes Pages for private
repositories; otherwise make the repository public.

The site is built for the project path `/cppverse/`. To deploy elsewhere, set `SITE_URL` and
`BASE_PATH` when building.

## Documentation

| Document | Contents |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | How the code is organised and how the parts fit together |
| [docs/CURRICULUM.md](docs/CURRICULUM.md) | The atlas graph, domains, levels, routes and validation rules |
| [docs/STUDENT_MANUAL_COVERAGE.md](docs/STUDENT_MANUAL_COVERAGE.md) | Every manual section and where it is taught (generated) |
| [docs/CONTENT_GUIDE.md](docs/CONTENT_GUIDE.md) | How to write a lesson |
| [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | How Vellum is applied, and the few deliberate deviations |
| [docs/SCIENTIFIC_VALIDATION.md](docs/SCIENTIFIC_VALIDATION.md) | How the models, the C++ and the laboratories are verified |
| [docs/SOURCES.md](docs/SOURCES.md) | Source material, attribution and the copyright policy |
| [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md) | What is done, what is verified, known limitations |

## Licence and sources

The site's code and text are original. The Vellum design tokens in `src/styles/vellum/` are
MIT-licensed. The source PDFs are kept out of the repository (`sources/` is gitignored); see
[docs/SOURCES.md](docs/SOURCES.md).
