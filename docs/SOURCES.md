# Sources

## Source documents

Three PDF documents guided the site. They are kept in `sources/` in a local checkout, and
`sources/` is listed in `.gitignore`, so **they are never committed or published**. They are
copyrighted works. A public GitHub Pages site, and a repository that may become public for
Pages, must not redistribute them.

| Priority | File | Role |
|---|---|---|
| 1. Primary, authoritative | `studentManual2021.pdf`: *Programming in C++ for Biologists — Course Manual*, G. Sander van Doorn, Joke Bakker, Thijs Janzen and Claire Guerin, University of Groningen | Sets the curriculum: what must be taught, in what relationships, and the modelling methods |
| 2. Supporting | `Mastering_Modern_C++23_A_Complete_Guide_to_the_Latest_Standard.pdf` | Used selectively to modernise syntax and promote safer idioms; C++20/23 features appear only as labelled, optional alternatives |
| 3. Supporting | `Book_10_Modern_CPP_in_the_Real_World.pdf` | Practical software-engineering guidance: code organisation, testing, debugging, profiling, reproducibility |

The supporting books never override the manual's curriculum. Technical claims that depend on
the standard or on a compiler were checked against the language standard and compiler
documentation, and the C++ examples were compiled with g++-14 and clang++-18 in CI.

## Required attribution

The site cites the manual with this exact wording, defined once in `src/data/citation.ts`
and shown in the footer of every page and on `/sources/`:

> C++ for biologists course material, University of Groningen, Faculty of Science and Engineering, Nijenborgh 7, 9747 AG Groningen

The Sources page also names the manual and its authors. A Playwright test checks that the
landing page shows the attribution exactly.

## Independence

C++ Atlas is an independent educational project. It is not the University of Groningen
course, and it is not endorsed by the University of Groningen or by the manual's authors. The
About and Sources pages say so.

## What is and is not reproduced

**The manual is used as a map, not as text.** Every lesson, example program, figure, check and
capstone on the site is independently written. No substantial prose, figure or code listing
from any source is copied.

**Excluded material is not published.** The manual's exercises, exercise solutions, weekly
assignments, answer keys and graded project specifications are recorded in
`src/data/manual.ts` as excluded, with a reason, and never reproduced, not even in modified or
disguised form. The validator fails the build if an excluded section is cited by a concept or a
lesson. In their place the site offers:

- original practice tasks with hints in each lesson
- original knowledge checks
- six original capstone projects, A–F, on different biological questions from the manual's
  projects

Where the manual is outdated or wrong, the lesson teaches the correct or modern practice and
says so in a "manual" callout. The coverage document lists these notes section by section:
[STUDENT_MANUAL_COVERAGE.md](STUDENT_MANUAL_COVERAGE.md).

## Third-party components

| Component | Licence | Use |
|---|---|---|
| Vellum design tokens (`src/styles/vellum/`) | MIT | colour, type and chart conventions |
| TeX Gyre Pagella | GUST Font License | headings |
| Lato | SIL Open Font License 1.1 | body text |
| Astro, React, KaTeX, Shiki, CodeMirror, d3 modules | MIT, BSD or ISC (see each package) | site generator, islands, maths, highlighting, editor, atlas zoom |

Biological examples use illustrative parameter values chosen for teaching; they are not
presented as measured data.
