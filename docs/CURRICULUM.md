# Curriculum

The curriculum is a typed graph of concepts. The atlas, the lessons, the pathways and the
progress page are all views of this one graph, defined in `src/data/`. The University of
Groningen manual *Programming in C++ for Biologists* sets what must be taught; how each
manual section maps onto the graph is in [STUDENT_MANUAL_COVERAGE.md](STUDENT_MANUAL_COVERAGE.md).

## Shape

The graph runs from west to east: from the first program, through the language and program
structure, to the modelling destinations and finally to scientific inference.

| Region | Domains (atlas column) |
|---|---|
| Language foundations | Program anatomy and Numeric computation (0); Control flow and Functions (1) |
| Data and program structure | Data structures, Input and output, Program architecture (2) |
| Modelling destinations (manual modules 14–17) | Algorithm design, Numerical integration, Stochastic modelling, Individual-based modelling (3) |
| Scientific inference (original synthesis) | Scientific inference (4) |

| Domain | Concepts | Lessons | Beginner / intermediate / seasoned concepts |
|---|---:|---:|---|
| Program anatomy | 7 | 4 | 7 / 0 / 0 |
| Numeric computation | 14 | 7 | 12 / 2 / 0 |
| Control flow | 7 | 5 | 4 / 3 / 0 |
| Functions | 8 | 4 | 4 / 3 / 1 |
| Data structures | 19 | 12 | 7 / 11 / 1 |
| Input and output | 7 | 5 | 2 / 5 / 0 |
| Program architecture | 10 | 10 | 1 / 6 / 3 |
| Algorithm design | 14 | 6 | 8 / 6 / 0 |
| Numerical integration | 8 | 5 | 0 / 7 / 1 |
| Stochastic modelling | 10 | 5 | 2 / 8 / 0 |
| Individual-based modelling | 8 | 4 | 0 / 6 / 2 |
| Scientific inference | 12 | 7 | 1 / 7 / 4 |

In all: 124 nodes (112 concepts, 5 landmarks, 1 integration node and 6 capstones) and 74
lessons. The landmarks are the five destinations: algorithms and discrete-time models, numerical
integration, stochastic simulation, individual-based models, and scientific inference. Their
pages are under `/models/`.

The full ordered list is on the site at `/curriculum/`.

## Nodes

Each node in `src/data/concepts.ts` has:

- **kind:** `concept` (taught in a lesson), `landmark` (a destination with its own page),
  `integration` (a review that brings earlier material together) or `capstone`.
- **level:** `beginner`, `intermediate` or `seasoned`. This describes the material, not the
  learner.
- **lesson** and **anchor:** the lesson that teaches it and the `<Anchor id="…">` in that
  lesson that the atlas links to.
- **manual:** the manual sections it covers.
- **goals:** the learning goals it serves.
- **optional:** side topics (for example bitwise operators, `switch`, recursion, inheritance)
  that never block a route unless the learner targets them.
- **standard:** set when the material needs C++20 or C++23. The baseline is C++17, and anything
  newer is labelled where it appears.

## Edges

`src/data/edges.ts` holds typed edges. Every edge reads "`to` builds on `from`".

| Type | Meaning | Dependency? |
|---|---|---|
| prerequisite | `from` must be understood before `to` | yes |
| composition | `to` is built out of `from` (for example a landmark out of its parts) | yes |
| application | `to` uses `from` in a model | yes |
| extension | `to` extends `from` beyond the core | yes |
| conceptual | the two are related ideas | no, may form cycles |
| validation | `from` is used to check `to` | no, may form cycles |

Dependency edges drive backward learning ("what does this need?"), forward learning ("what
does this lead to?") and routes.

## Rules enforced on every build

`src/lib/validation/curriculum.ts` runs before every build and in CI (`npm run validate`).
The build fails if any of these rules is broken:

1. Node ids are unique and kebab-case; each node's domain exists.
2. Concepts and integration nodes have a lesson; landmarks and capstones do not.
3. Every lesson a node points at exists, and so does the anchor.
4. Every edge joins known nodes, is not a self-loop, has a known type and is not duplicated.
5. The dependency edges form a directed acyclic graph.
6. Exactly one root, `programs-and-algorithms`, has no dependencies; every node can be reached
   from it.
7. Every node leads, through dependency edges, to a landmark or a capstone, unless it already
   lies beyond a landmark (an extension such as adaptive step-size control). No concept is a
   dead end: each one is used by a model.
8. Every instructional and advanced manual section is cited by at least one node. Excluded
   sections (exercises, solutions, assignments, projects) are cited by none.
9. Every lesson is anchored to a node, and the manual sections in its frontmatter exist and
   are not excluded.
10. Every goal targets existing nodes.

Nodes without goals produce a warning. In addition, `npm run validate` checks that
`docs/STUDENT_MANUAL_COVERAGE.md` is up to date with the data.

## Levels, familiarity and routes

Onboarding (`/start/`) asks for a level and two familiarity ratings, each 0, 1 or 2: one for C++
and one for modelling. The defaults are:

| Level | C++ familiarity | Modelling familiarity |
|---|---|---|
| beginner | 0 | 0 |
| intermediate | 1 | 0 |
| seasoned | 2 | 1 |

A concept counts as already known if its level is at or below the learner's familiarity in the
relevant area: C++ for the foundation and structure domains, modelling for the destination and
inference domains. Landmarks, integration nodes and capstones are never assumed known.

`routeTo` in `src/lib/graph/routes.ts` takes the dependency closure of the targets, leaves out
optional nodes that are not targets, and orders the rest topologically, breaking ties by domain
column, row and position in the file. Each step is marked:

- **done:** studied or passed
- **assumed:** known at the learner's familiarity
- **next:** the first step that is neither done nor assumed
- **todo:** everything after that

## Goals

`src/data/goals.ts` defines nine goals, each with target nodes:

1. Write my first C++ program
2. Build a discrete-time population model
3. Analyse a matrix population model
4. Understand numerical ODE solvers
5. Implement a stochastic model
6. Learn Gillespie simulation
7. Develop individual-based simulations
8. Analyse simulation output
9. Build reproducible C++ modelling software

## Capstones

Six original capstone projects (`src/data/capstones.ts`, `/capstones/`). They are independently
designed and are not the manual's assignments or projects:

| | Capstone | Family |
|---|---|---|
| A | A first ecological model: harvesting a fish stock | Discrete time |
| B | Matrix population dynamics: which life stage should a conservation plan target? | Matrix models |
| C | Numerical ODE modelling: a virus within its host | ODEs |
| D | Stochastic biological simulation: extinction risk of a reintroduced population | Gillespie |
| E | Individual-based modelling: foragers depleting a patchy resource | Individual-based |
| F | A complete computational study: does dispersal distance change persistence? | Inference |

## Adding or changing material

1. Add or edit the node in `concepts.ts` and its edges in `edges.ts`.
2. Write the lesson following [CONTENT_GUIDE.md](CONTENT_GUIDE.md), with the anchor the node
   names.
3. Put any C++ program in `cpp-examples/<domain>/`, with a `.out` file for its expected output.
4. Run `npm run coverage`, `npm run validate` and `npm test`.
