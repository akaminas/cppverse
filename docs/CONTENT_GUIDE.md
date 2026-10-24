# Content guide for lessons

This guide is for anyone writing or revising a lesson in `src/content/lessons/`. Read
`src/content/lessons/hello-world.mdx` alongside it: that lesson is the reference for tone,
structure and component use.

## 1. Audience and voice

- Readers are biologists, ecologists and evolutionary scientists. Some have never
  programmed; others know C++ and want to model. Explain every unfamiliar symbol the first
  time it appears in a beginner lesson; in intermediate and seasoned lessons, link back
  instead of repeating.
- Calm, precise, editorial. British English (modelling, behaviour, colour, centre).
  No hype, no exclamation marks, no emoji, no second-person cheerleading.
- Prefer short sentences and concrete examples. One idea per paragraph.
- **Biological examples first.** Avoid cars, bank accounts, employees and shopping
  carts. Keep early examples simple (counts, rates, survival probabilities, body mass,
  temperatures, nest counts, seed numbers). Never invent data and present it as real.
- The goal of the whole site is modelling competence: whenever a construct matters for
  models, show how (state, parameters, update rules, trajectories, replicates, output).

## 2. Lesson file

`src/content/lessons/<slug>.mdx`. The slug is fixed by the atlas
(`src/data/concepts.ts`, field `lesson`). Frontmatter:

```yaml
---
title: Short title, sentence case
summary: One sentence (≤ 160 characters), shown under the title and in the atlas.
level: beginner | intermediate | seasoned
module: 5            # Groningen manual module, or null for original material
manual: ["M5.2"]     # section ids from src/data/manual.ts (never excluded ones)
minutes: 25          # honest reading-and-trying time
objectives:          # 2–5 capabilities, each starting with a verb
  - Store a population trajectory in a std::vector
standard: c++17      # newest standard the lesson's MAIN code needs (default c++17)
optional: false      # true for advanced/optional branches
lab: discrete        # optional: discrete | matrix | ode | gillespie | ibm
references:          # optional: supporting sources (books, cppreference pages)
  - "cppreference.com: std::vector"
---
```

`manual` should list the manual sections whose instructional content the lesson teaches
(normally the union of the `manual` fields of the concepts anchored to the lesson).

## 3. Structure

Use these `##` headings, in this order, omitting any that genuinely do not apply:

1. `## What it is`
2. `## Why it matters`
3. `## How it works in C++`
4. `## A minimal example` (may be merged into 3 when natural)
5. `## Explore it` — interactive explanation: knowledge checks, a trace, an anatomy,
   a synchronised maths–code view, a figure or a laboratory
6. `## In biological modelling`
7. `## Common mistakes`
8. `## Practice`

Use `###` for subsections. The layout adds *Connections* and *Suggested next steps*
automatically from the atlas graph: do not write them yourself.

Every concept anchored to the lesson with an `anchor` in `src/data/concepts.ts` needs an
`<Anchor id="…" />` placed immediately before the subsection that teaches it. The build
fails if an anchor is missing.

Length: as long as the concept needs and no longer — typically 900–2,200 words. A
fundamental syntax lesson can be short; numerical integration needs more.

## 4. Components (no import statements needed)

| Component | Use |
|---|---|
| `<Example file="foundations/hello.cpp" mark="8-11" />` | A complete program from `cpp-examples/`, highlighted at build time, with copy, download, an optional in-browser editor, the build command and the expected output. `mark` highlights lines. `editable={false}`, `bare` hide extras. |
| fenced code blocks with ` ```cpp ` | Short fragments that are not complete programs. |
| `<Check id="…" kind="predict\|read\|debug\|model\|interpret" question="…" code={\`…\`} options={[…]} answer={1} feedback={[…]} />` | Knowledge check. One feedback string **per option**, explaining why it is right or wrong. `id` unique within the lesson. 2–4 checks per lesson. |
| `<Callout kind="pitfall\|note\|modern\|biology\|manual\|tip\|standard" title="…">…</Callout>` | Asides. Use `modern` for optional C++20/23 alternatives, `manual` to note how the site differs from the course manual. |
| `<Concept id="std-vector" />` or `<Concept id="…">text</Concept>` | Link to another concept's lesson section. Unknown ids fail the build. |
| `<Anchor id="…" />` | Stable target for an atlas concept (see §3). |
| `<Trace id="…" />` | Step-through of a program; data in `src/data/traces/<slug>.ts` (see §6). |
| `<Anatomy id="…" />` | Element-by-element explorer; data in `src/data/anatomy/<slug>.ts`. |
| `<MathCode id="…" />` | Synchronised equation and C++; data in `src/data/mathcode/<slug>.ts`. |
| `<Figure id="…" />` | A Vellum figure computed at build time; spec in `src/lib/figures/<slug>.ts`. |
| `<Lab id="discrete\|matrix\|ode\|gillespie\|ibm" />` | Embed an interactive laboratory. |
| `<Std v="c++20" />` | Inline badge for code that needs a newer standard. |
| `<Practice>…</Practice>` | Original exercises; hints and worked answers go in `<details>`. |

Maths: KaTeX, inline `$N_{t+1}$` and display `$$ … $$`. Use the notation of the model,
italic single-letter variables, and say what every symbol means and its units.

Links: root-relative links such as `[the atlas](/atlas/)` are rewritten to include the
deployment base path; prefer `<Concept>` for lessons.

## 5. C++ conventions

All code is original. Every complete program lives in `cpp-examples/<area>/<name>.cpp`
(areas: `foundations`, `data`, `io`, `architecture`, `algorithms`, `ode`, `stochastic`,
`ibm`, `inference`). Choose distinctive file names (prefix with the topic if in doubt).

Each file starts with:

```cpp
// Title: Human-readable title
// Standard: C++17
// One to four lines saying what the program demonstrates.
```

Add `// Expect: compile-error` for programs that deliberately fail to compile.

Rules (enforced in CI with `-Wall -Wextra -Wpedantic -Werror` on GCC 14 and Clang 18):

- C++17 baseline. Code that needs C++20/23 says `// Standard: C++20` and is presented as
  an optional modern alternative, with `<Std v="c++20" />` in the text.
- Always qualify `std::`; never `using namespace std;` (the tests reject it).
- `'\n'` rather than `std::endl` unless a flush is intended.
- Initialise every variable; prefer brace initialisation where it prevents narrowing.
- `const` wherever a value does not change; pass cheap types (int, double) by value and
  large objects by `const&`.
- Use `std::size_t` (or range-for) for indices compared with `.size()`.
- No raw `new`/`delete`, no `rand()`, no C-style arrays or casts except where a lesson
  teaches them explicitly.
- No undefined behaviour anywhere, including in "what goes wrong" demonstrations: show
  unsigned wrap-around, `std::numeric_limits`, or describe the UB in prose instead.
- Random numbers: `std::mt19937_64` with an explicit, printed seed.
- Keep programs short enough to read on a screen (ideally ≤ 60 lines).

### Expected output (`<name>.out`)

If a program's output is fully determined, add `<name>.out` with the exact standard
output; CI compares it byte for byte on both compilers. **You cannot compile locally**, so
compute expected output with great care:

- Integers and strings: reason it through.
- Floating-point output: print with explicit formatting (`std::fixed` and
  `std::setprecision(n)`) and reproduce the exact arithmetic in Python with the same
  operation order, then format with `f"{x:.{n}f}"`. Default `std::cout << double` uses
  `%g` with 6 significant digits, which Python reproduces as `f"{x:g}"`.
- Do **not** add `.out` for output that depends on the platform (`sizeof`, type limits),
  on `<random>` distributions (their algorithms differ between GCC and Clang standard
  libraries), or on time.
- Programs reading input: provide `<name>.in`; arguments: `<name>.args` (one line).

## 6. Traces, anatomies, maths–code views and figures

Data files are per lesson and merged automatically (do not edit the `index.ts` files).

- `src/data/traces/<slug>.ts` exports `traces: Record<string, Trace>`
  (`import type { Trace } from './types';`). Each step gives the line that has *just
  executed* (line numbers of the displayed file, including its header comment), a short
  note, the variables alive and their values, and any text printed by that step. If the
  program has a `.out` file, the concatenated `out` strings must equal it exactly (tested).
- `src/data/anatomy/<slug>.ts` exports `anatomies` (see `hello-world.ts`).
- `src/data/mathcode/<slug>.ts` exports `mathcode: Record<string, MathCode>`. Mark each
  term in the TeX with `\htmlClass{mc-<termId>}{…}` and list the code lines (numbers in
  the file) that implement it. Use `show: [from, to]` to show an excerpt.
- `src/lib/figures/<slug>.ts` exports `figures: Record<string, () => FigureSpec>`
  (`import type { FigureSpec } from './types';`). Figures must be computed from tested
  model code in `src/lib/simulations/` (or from straightforward closed forms), never from
  invented numbers. Follow Vellum: the title is a one-sentence **claim with a verb**;
  the subtitle says what was computed with which parameters; `yUnit` is the quantity and
  unit as a noun phrase; the footer names the source file.

## 7. Source material and copyright

The Groningen manual is the authoritative curriculum, not a text to copy.

- Teach every instructional point of the manual sections assigned to you. The section
  inventories are in the project notes given to you; read the manual text itself for
  detail when needed.
- **Never** copy or closely paraphrase the manual's prose, code listings, figures, or
  examples. Write independently, with your own examples.
- **Never** publish the manual's exercises, solutions, weekly assignments or project
  specifications, nor disguised versions of them. Do not reuse their biological examples
  either (the inventories list them). Your practice tasks must be original and must not
  be variations of manual exercises.
- Where the manual is outdated or wrong for modern C++, teach the correct behaviour and,
  where useful, add a `<Callout kind="manual">` that says so plainly and briefly.
  Known corrections:
  - `std::vector<T>(n)` value-initialises its elements (zeros), it does not leave them
    uninitialised.
  - Integer division truncates toward zero on every compiler since C++11.
  - Signed integer overflow is undefined behaviour (not merely platform-dependent);
    unsigned arithmetic wraps modulo 2ⁿ.
  - What the manual calls "underflow" (an increment lost against a large value) is loss
    of significance/absorption; IEEE underflow is a result too close to zero.
  - Whether plain `char` is signed is implementation-defined.
  - `std::string::npos` is the largest `size_type` value; store `find` results in
    `std::string::size_type` (or `auto`), never `int`.
  - The space in `> >` for nested templates has not been needed since C++11.
  - A move constructor takes `T&&` (non-const) and should be `noexcept`.
  - `std::map::operator[]` inserts a default value for a missing key; use `find`, `at` or
    `contains` (C++20) to look up.
  - Exceptions: throw `std::exception`-derived types, catch by `const&`; `std::runtime_error`
    and `std::logic_error` live in `<stdexcept>`.
  - `exit()` does not unwind the stack (destructors of local objects do not run); prefer
    returning from `main`.
  - Pass `int`/`double` by value, not by `const&`.
  - `inline` today is mainly about the one-definition rule, not an optimisation request.
  - Seed `<random>` engines explicitly and record the seed; `rand()` is unsuitable.
- Credit is automatic: the lesson layout cites the manual sections listed in
  `manual:`. Do not add citations to every paragraph.

## 8. Checking your work

```bash
npm run validate     # graph, anchors, manual ids (errors about OTHER lessons not yet written can be ignored)
npm test             # unit tests, including trace/.out consistency
npx astro build      # the site must build
```

Read your rendered lesson (`npx astro preview`, then open `/cppverse/learn/<slug>/`).
Fix anything that is unclear, wrong, or longer than it needs to be.
