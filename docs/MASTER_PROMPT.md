# MASTER IMPLEMENTATION PROMPT
# C++ ATLAS — Programming and Modelling for Biologists

## 0. Your assignment

You are acting as a senior Astro developer, frontend interaction designer, C++ scientific software engineer, computational biologist, numerical modeller, curriculum architect, and technical educator.

Your task is to **build a complete, functional, GitHub-hosted educational website in the connected repository**.

The website will be called:

**C++ Atlas — Programming and Modelling for Biologists**

The purpose is to teach C++ from absolute zero to the level required for independent computational research in biology, ecology, and evolutionary science.

The website must go substantially beyond teaching C++ syntax. It should teach how to translate mathematical descriptions and biological hypotheses into computational algorithms, implement them in C++, conduct simulation experiments, analyse their outputs, and interpret the results scientifically.

The website must use:

- **Astro** as its primary framework and static site generator.
- **GitHub Pages** for hosting and deployment.
- **The connected GitHub repository** as the implementation target.
- **The University of Groningen's C++ course manual** as the authoritative curriculum.
- **Vellum** as the mandatory scientific visualization and colour system.
- A hierarchical, zoomable concept atlas as its primary navigation mechanism.
- Interactive scientific model laboratories.
- Personalized learning pathways for beginner, intermediate, and seasoned users.

The entire experience should feel like an interactive scientific atlas rather than a conventional programming tutorial.

The ultimate learning objective is:

> A learner should be capable of reading a mathematical model from a scientific paper, understanding its assumptions, designing a suitable computational algorithm, implementing that algorithm in C++, verifying its correctness, running simulation experiments, analysing the output, and drawing appropriately qualified scientific conclusions.

**This is not an encyclopaedia of C++. It is a course in scientific modelling through C++.**

Build the actual website. Do not stop at a proposal, wireframe, prototype, or visual mockup.

---

# 1. The connected repository is the implementation target

The user has connected the GitHub repository where this website must be developed.

You must work within that repository.

Do not create a separate GitHub repository, unrelated application, or standalone demonstration unless an explicit technical blocker prevents the existing repository from being used.

## First actions

Before modifying files:

1. Identify the repository owner, name, root directory, and default branch using the connected repository or workspace context.
2. Inspect the existing directory structure.
3. Read the README and configuration files.
4. Identify the current framework, if any.
5. Check for existing Astro configuration.
6. Inspect `package.json`, the lockfile, and installed dependencies.
7. Identify existing GitHub Actions and Pages configuration.
8. Review the current Git status and preserve unrelated changes.
9. Check whether existing content or deployment configuration must be maintained.
10. Determine whether the new Astro site belongs at the repository root or an existing designated subdirectory.

**Do not assume the repository is empty.**

If Astro is already installed, extend the existing application rather than rebuilding it unnecessarily.

If another framework exists and the repository is intended for this website, migrate it carefully to Astro, preserving useful content and functionality.

Do not delete unrelated files or rewrite unrelated project history.

If the repository contains another existing website, inspect how this project should coexist with it. Do not blindly overwrite the original.

Use the repository's actual deployment settings rather than inventing a repository name, branch, username, or URL.

## Implementation authority

You are expected to make reasonable technical decisions independently.

You may:
- Create and edit project files.
- Install suitable dependencies.
- Reorganize the application where justified.
- Add source content.
- Build and test the project.
- Configure GitHub Actions.
- Implement the requested interface.
- Document technical decisions.

Avoid destructive changes, unnecessary dependencies, and unrelated refactoring.

Keep the implementation coherent with the repository's existing conventions wherever possible.

---

# 2. Source materials and their authority

Three PDF resources are provided.

Their relative importance is fixed.

## 2.1 Primary and authoritative source

**File:** `studentManual2021.pdf`

**Title:** *Programming in C++ for Biologists — Course Manual*

**Authors:** G. Sander van Doorn, Joke Bakker, Thijs Janzen, and Claire Guerin.

**Institution:** University of Groningen.

This is the golden standard for the website.

Read it in full before finalizing the curriculum.

Its complete instructional content must be covered, apart from assignments, exercises, answer keys, solutions, and graded project specifications.

The manual determines:
- The core C++ knowledge that must be taught.
- The sequencing and relationships of programming concepts.
- The distinction between procedural and object-oriented approaches.
- The relevant advanced programming concepts.
- The modelling methods that must be implemented.
- The expected scientific and computational competence.

You may improve the order of presentation, divide chapters into smaller concepts, and build additional connections between subjects.

However, **do not replace the manual with a generic C++ curriculum**.

It should be possible to trace every substantive instructional topic in the manual to one or more educational nodes in the atlas.

### Mandatory attribution

The source must be cited as:

"C++ for biologists course material, University of Groningen, Faculty of Science and Engineering, Nijenborgh 7, 9747 AG Groningen"

Use this wording exactly in the site's source attribution.

A suitable About / Sources page should identify the original manual and credit its named authors.

Individual lessons may also identify relevant manual modules.

The website must distinguish itself from the official University of Groningen course. Do not imply university endorsement.

### Restrictions on assignments

Do not publish:
- The manual's assignments.
- Assignment solutions.
- Exercise solutions.
- Answer keys.
- Completed weekly programming assignments.
- Graded course-project solutions.
- Slightly modified or disguised versions of those solutions.

Do not simply rename variables in a handbook solution and publish it as a new example.

Create independently designed instructional examples, biological models, and practice problems.

You may explain the general programming or mathematical techniques required for the original exercises, but never reconstruct their answers.

Respect copyright. Do not copy substantial textbook prose, figures, or code listings without permission.

The educational content of the website should be independently written.

## 2.2 Secondary source: Modern C++23

**File:** `Mastering_Modern_C++23_A_Complete_Guide_to_the_Latest_Standard.pdf`

This is a supporting technical reference.

Use it selectively to:
- Modernize syntax.
- Improve code clarity.
- Promote safer programming practices.
- Explain useful contemporary language features.
- Avoid unnecessary legacy idioms.
- Improve maintainability.
- Clarify relevant language behaviour.
- Identify compiler compatibility considerations.

Do not convert this project into a complete C++23 course.

Advanced modern-language features should be introduced only when they help scientific modelling or make code safer and easier to understand.

For the principal instructional examples, use C++17 as the initial compatibility baseline, subject to a documented technical review.

C++20 and C++23 features may be presented as optional modern alternatives when useful.

Clearly label code requiring a newer standard and identify the required compiler support.

## 2.3 Tertiary source: Modern C++ in the Real World

**File:** `Book_10_Modern_CPP_in_the_Real_World.pdf`

Use this book for practical software-engineering guidance.

Relevant topics include:
- Modular architecture.
- Code organization.
- Maintainability.
- Testing.
- Debugging.
- Performance profiling.
- Efficient data structures.
- Scientific computing.
- Reproducibility.
- Large simulation projects.
- Open-source scientific software.

Exclude unrelated professional material, such as interview preparation, career advice, financial trading, networking, and other industrial topics that do not materially support scientific modelling.

The supporting books must not override the Groningen manual's curriculum.

### Source priority rule

When designing a lesson:

1. Identify the relevant Groningen manual material.
2. Preserve its essential programming or modelling concept.
3. Determine whether modern C++ provides a clearer or safer implementation.
4. Add only the supporting explanation necessary.
5. Connect the lesson to biological modelling.
6. Write the lesson independently.
7. Validate the code and mathematics.

Do not treat any book as infallible. Verify compiler-specific and standard-specific technical claims using authoritative documentation when necessary.

---

# 3. Audit the manual completely

Before building a large curriculum, create:

`docs/STUDENT_MANUAL_COVERAGE.md`

This must map the Groningen manual's instructional material to the website.

Include all 17 modules, their instructional sections, and the advanced sections within them.

For every source section, record:

| Field | Meaning |
|---|---|
| Module | Groningen manual module |
| Section | Original section identifier |
| Concept | What is being taught |
| Learning objective | What the learner should understand |
| Atlas node | Where the concept appears |
| Lesson file | Corresponding educational content |
| Level | Beginner, intermediate, or seasoned |
| Modelling relevance | How it contributes to scientific modelling |
| Status | Implemented, partial, or pending |
| Validation | Evidence that the content and examples have been checked |

Explicitly mark exercises, solutions, graded assignments, and project specifications as excluded.

Review the appendices for instructional material that should be retained, while excluding assessment-related content and purely administrative/index material.

The source coverage matrix should be updated as implementation proceeds.

**No instructional section may disappear simply because it is difficult to fit into the atlas.**

Advanced sections may become optional pathways, but their substantive concepts must still be accessible.

---

# 4. Core pedagogical architecture

This is the most important structural principle of the entire project.

## Modules 14–17 are the destinations

**Modules 14–17 of the Groningen manual must serve as the intellectual, educational, and visual destinations of the atlas.**

Modules 1–13 teach the C++ concepts required to reach those destinations.

This relationship must shape:
- The curriculum.
- The network graph.
- Learning recommendations.
- Visual hierarchy.
- Node relationships.
- Model laboratories.
- Capstone projects.
- Progress tracking.

The four principal destinations are:

| Module | Destination | Scientific capability |
|---|---|---|
| 14 | Algorithm Design | Translate biological and mathematical models into computational procedures |
| 15 | Numerical Integration | Implement continuous-time models using numerical methods |
| 16 | Stochastic Modelling | Implement probabilistic processes and Gillespie simulations |
| 17 | Individual-Based Modelling | Implement systems based on individuals, attributes, and interactions |

These four destinations must be immediately recognizable as major landmarks of the atlas.

They should not simply appear as four final items at the end of a linear lesson list.

## The complete educational progression

The overall progression is:

**C++ Foundations → Computational Algorithms → Biological Models → Simulation Experiments → Scientific Inference**

The final region, Scientific Inference, is an original synthesis added by this website. Do not misrepresent it as an additional numbered module of the Groningen course.

It must connect the four modelling destinations to:
- Model verification.
- Simulation design.
- Replicate experiments.
- Parameter exploration.
- Uncertainty.
- Data output.
- Analysis in R or Python.
- Scientific visualization.
- Model validation.
- Interpretation.
- Scientific limitations.

## Two-way learning

The atlas must support two equally important learning directions.

**Forward learning**

"What can I build with the C++ concept I am learning?"

For example:

`std::vector` → Population-state storage → Simulation trajectories → Ecological models.

**Backward learning**

"What C++ knowledge do I need to build this particular model?"

For example:

Gillespie simulation → Stochastic algorithms → Random distributions → Random generators → Functions → Loops → Variables.

A user should be able to select any of the four modelling destinations and inspect its prerequisite network.

The system should use that network to recommend relevant lessons based on existing knowledge.

Do not force experienced users through elementary topics they already understand.

---

# 5. Educational scope: C++ for modelling, not C++ encyclopaedia

The learner is a scientist who wants to develop computational models.

The educational priority is not maximal language coverage.

Prioritize:

### Essential programming knowledge

- Source code and compilation.
- Fundamental syntax.
- Variables and types.
- Constants.
- Operators.
- Conditions.
- Loops.
- Functions.
- References.
- Vectors.
- Basic containers.
- Strings.
- File input/output.
- Structs and classes.
- Program organization.
- Debugging.
- Standard-library functionality needed for simulations.

### Essential modelling knowledge

- Mathematical state variables.
- Model parameters.
- Initial conditions.
- Algorithms.
- Update rules.
- Discrete-time dynamics.
- Numerical integration.
- Stochastic processes.
- Random sampling.
- Gillespie's algorithm.
- Individual-based simulations.
- Computational experiments.
- Model output.
- Verification and validation.
- Scientific interpretation.

### Contextual advanced programming

Explain these when their utility becomes clear:
- Pointers.
- Templates.
- Iterators.
- Memory ownership.
- Constructors.
- Encapsulation.
- Operator overloading.
- Inheritance.
- Polymorphism.
- Smart pointers.
- Performance profiling.
- Parallel computing.
- Modern C++ abstractions.

### Optional enrichment

Do not let these dominate:
- Complex template metaprogramming.
- Coroutines.
- Esoteric overload resolution.
- Lock-free programming.
- Custom allocators.
- Advanced compile-time techniques.
- Large unrelated software design-pattern catalogues.

The learner must acquire a good working command of C++, but should spend increasing amounts of time reasoning about models rather than memorizing language features.

---

# 6. The complete Groningen curriculum

The following is the mandatory educational backbone.

Every module must be represented in the atlas.

## PART I — Elements of the C++ Programming Language

### Module 1 — Getting started

Explain programming from absolute zero.

Cover:
- What a computer program is.
- What C++ is.
- The distinction between an algorithm and its implementation.
- Source files.
- Editing.
- Compilers.
- Linking.
- Execution.
- Development environments.
- VS Code.
- Creating a project.
- Compiling a first program.
- Understanding errors.

Build a detailed, interactive Hello World lesson.

Explain every meaningful element of:

```cpp
#include <iostream>

int main() {
    std::cout << "Hello, world!\n";
    return 0;
}
```

Explain `#include`, headers, `iostream`, `int`, `main`, parentheses, braces, namespaces, output streams, stream insertion, string literals, newline characters, semicolons, and return statements.

Explain syntax before assuming familiarity.

Include genuine local compilation instructions.

Distinguish `gcc` from `g++`, and explain why using the correct C++ toolchain matters.

### Module 2 — Numeric variables and data types

Cover:
- Variable declarations.
- Initialization.
- Assignment.
- Numeric types.
- Constants.
- Type conversions.
- Numeric precision.
- Overflow.
- Underflow.

Use biological variables such as population size, growth rate, survival, age, and time.

Explain integer division, implicit conversion, and floating-point precision where relevant.

### Module 3 — Elementary calculations

Cover:
- Arithmetic operators.
- Expressions.
- Operator precedence.
- Building larger calculations.
- Mathematical functions.
- `<cmath>`.

Connect mathematical notation to C++ expressions.

Show how a mathematical equation is translated into executable code, including common transcription errors.

### Module 4 — Conditional logic

Cover:
- `if`.
- `else`.
- `else if`.
- Logical expressions.
- Boolean values.
- Comparison operators.
- Advanced alternatives covered by the manual.

Applications:
- Threshold conditions.
- Extinction checks.
- Survival rules.
- State transitions.
- Event conditions.

### Module 5 — Loops and vectors

Cover:
- `for` loops.
- Iteration variables.
- Loop bounds.
- Repetition.
- Relevant alternative loops.
- `std::vector`.
- Indexing.
- Iteration over collections.
- Common indexing errors.
- Advanced jump and loop-control statements in the manual.

Use biological simulation time as the central example.

This module should explicitly demonstrate how repetition transforms a single population update into a simulation.

### Module 6 — Functions

Cover:
- Function definitions.
- Function calls.
- Parameters.
- Return values.
- Scope.
- Pass-by-value.
- Pass-by-reference.
- Const references.
- Relevant advanced function concepts.
- Recursive functions.

Use growth functions, fitness calculations, population updates, and summary statistics as independent instructional examples.

Explain how functions make biological models easier to understand, test, and maintain.

### Module 7 — Matters of style

Cover:
- Naming.
- Formatting.
- Comments.
- Function structure.
- Code readability.
- Modularization.
- Multiple source files.

Emphasize why mathematical correctness is easier to verify when program structure reflects model structure.

### Module 8 — Working with text

Cover:
- Characters.
- Strings.
- String operations.
- Relevant text-processing techniques.

Applications:
- Species labels.
- Parameter labels.
- Configuration values.
- File names.
- Simulation identifiers.

### Module 9 — File input/output

Cover:
- Reading files.
- Writing files.
- Streams.
- Text formatting.
- Command-line arguments.
- Relevant advanced stream techniques.
- Error detection.

Applications:
- Writing trajectories to CSV.
- Loading parameters.
- Organizing replicate results.
- Passing experiment settings.
- Recording reproducibility metadata.

### Module 10 — Home-made objects

Cover:
- Pairs.
- Structures.
- Classes.
- User-defined types.
- Methods.
- Working with objects.
- Relevant complex data structures.

Represent:
- Population states.
- Species attributes.
- Individuals.
- Model parameters.
- Simulation configurations.

Show when a struct is sufficient and when a class becomes useful.

### Module 11 — Procedural programming review

Retain the manual's complete procedural-programming synthesis.

Connect:
- Variables.
- Program flow.
- Functions.
- Compound types.
- Input/output.

Make this a major integration node.

The learner should assemble a complete procedural simulation with a clearly defined state, update rule, and output.

Avoid repeating earlier explanations unnecessarily.

### Module 12 — Exploring the STL

Cover:
- Templates at the appropriate educational depth.
- STL containers.
- Standard algorithms.
- Iterators.
- Relevant container-selection decisions.
- Sorting and searching.
- Practical data organization.

Explain how the choice of data structure influences model readability, computational cost, and correctness.

Do not teach every STL feature just to increase coverage.

### Module 13 — Data encapsulation and object design

Cover:
- Constructors.
- Data encapsulation.
- Static members.
- Access through methods.
- Friend functions.
- Operator overloading.
- Object design.
- Interacting objects.

Preserve the manual's discussion of an iterated prisoner's dilemma tournament as a modelling and program-design concept, without reproducing assignment-specific implementations or solutions.

Use independently designed examples.

Explain both the benefits and limitations of object-oriented modelling.

## PART II — Implementing Biological Models in C++

These four modules should receive the strongest educational and visual emphasis.

### Module 14 — Designing algorithms

Teach:
- Computational problem decomposition.
- Algorithms.
- Pseudocode.
- Flowcharts.
- Debugging.
- Error handling.
- Discrete-time dynamical systems.
- Matrix population models.
- Designing simulation procedures.

Show the complete workflow:

**Biological hypothesis → Mathematical equations → Algorithm → C++ code → Output**

Emphasize:
- State representation.
- Initialization.
- Update functions.
- Simulation loops.
- Update order.
- Temporary states.
- Simultaneous versus sequential updates.
- Output recording.

Include a laboratory for discrete-time population models and a second for matrix population models.

### Module 15 — Numerical integration of ODEs

Teach:
- Continuous-time models.
- Ordinary differential equations.
- Numerical approximation.
- Euler's method.
- Runge–Kutta integration.
- Numerical accuracy.
- Step-size effects.
- Stability.
- Adaptive step-size control.

The laboratory should allow users to compare algorithms and step sizes.

Explain the distinction between the biological model and the numerical method used to approximate it.

Use analytical benchmarks where available.

### Module 16 — Stochastic models

Teach:
- Deterministic versus stochastic models.
- Pseudorandom numbers.
- The C++ `<random>` library.
- Generators and distributions.
- Random seeds.
- Stochastic simulation.
- Gillespie's algorithm.
- Stochastic event timing.
- Event selection.
- Replicates.
- Statistical variation.
- Reproducibility.

Build an interactive Gillespie laboratory.

Show how event rates, waiting times, and state changes are connected.

Explicitly handle zero total propensity and other relevant algorithmic edge cases.

Explain why a stochastic model must generally be analysed over repeated simulations.

### Module 17 — Elementary individual-based simulations

Teach:
- Individual-based modelling logic.
- Representing individual states.
- Attributes.
- Interaction rules.
- Event scheduling.
- Time-step scheduling.
- Population-level outcomes.
- Object-oriented design where useful.
- Emergent behaviour.
- Model validation.

Build a complete, original individual-based demonstration.

The learner should understand how individual behaviours generate population- or system-level patterns.

Emphasize why model scheduling, implementation choices, and stochastic mechanisms can affect results.

### Advanced source material

Retain the manual's instructional advanced sections.

Represent them as optional branches or deeper concept nodes.

Do not omit them merely because they are not required for a beginner to reach a basic modelling destination.

---

# 7. A fifth destination: scientific inference

Connect the four modelling destinations to a final synthesis region:

**Simulation Experiments and Scientific Inference**

This is additional material developed for the website, not a numbered Groningen module.

Teach:
- Designing computational experiments.
- Choosing parameters.
- Exploring parameter ranges.
- Running replicates.
- Random seed management.
- Recording simulation metadata.
- Exporting data.
- Summarizing trajectories.
- Calculating descriptive statistics.
- Visualizing results.
- Examining uncertainty.
- Sensitivity analysis.
- Verification.
- Validation.
- Model comparison.
- Drawing scientific conclusions.
- Recognizing limitations.

Explain how to use C++ as the simulation engine and R or Python for appropriate downstream analysis.

Do not turn the website into a general R or Python programming course.

The purpose is to demonstrate a complete, reproducible scientific modelling workflow.

---

# 8. Website visual identity

The website must integrate three design inspirations, with one mandatory visual authority.

## Landing-page reference

https://reactbits.dev/tools/background-studio?bg=topography&preset=atlas

Use this for a restrained, topographic opening screen.

The background should:
- Be neutral.
- Use fine contour-like lines.
- Suggest scientific cartography.
- Move subtly, if appropriate.
- Remain behind the content.
- Respect reduced-motion settings.
- Avoid unnecessary graphics-processing overhead.

Do not copy proprietary assets or code without checking licensing.

## Atlas interaction reference

https://eye-anatomy-delta.vercel.app/

Study the principle of spatial concept navigation.

Our atlas should be more elegant, readable, hierarchical, and scientifically purposeful.

Avoid treating this reference as a design to reproduce exactly.

## Overall website aesthetic

https://trex.run/

Use its understated scientific-software character as inspiration.

The intended aesthetic is:
- Quiet.
- Minimal.
- Editorial.
- Scholarly.
- Precise.
- Restrained.
- Technically sophisticated.

Avoid generic educational dashboard aesthetics.

## Mandatory design system

https://akaminas.github.io/vellum/index.html

**Vellum is the authoritative visual system.**

Read the relevant documentation, including:
- Principles.
- Colour.
- Anatomy.
- Forms.
- Interactive figures.
- Networks.
- Scientific plots.
- Accessibility.
- Tools.

Use the available Vellum implementation resources where technically and legally appropriate.

Do not approximate the palette from screenshots.

Use the exact documented colours and semantic roles.

### Vellum colour system

The neutral colours include:

| Role | Light | Dark |
|---|---|---|
| Surface | `#FFFFFF` | `#2A2520` |
| Card | `#FAF6EE` | `#342F2A` |
| Grid | `#E6E0D4` | `#413C36` |
| Ink | `#2A2825` | `#ECE7DF` |

Use Vellum's complete token set from its official documentation and resources.

The six chromatic families are:
- Teal.
- Terracotta.
- Indigo.
- Ochre.
- Mauve.
- Moss.

Respect Vellum's tint, tone, and deep colour roles.

Avoid arbitrary gradients or colours outside the design system.

Scientific figures must preserve Vellum's established data-encoding conventions.

Do not use the atlas's concept-category colouring to override scientific-data semantics.

### Typography

Use:
- A refined and readable sans-serif typeface.
- A carefully chosen monospaced code font.
- Restrained heading scales.
- Comfortable line lengths.
- Clear mathematical notation.
- Consistent typography across interface and figures.

Use licensed fonts or appropriate system fallbacks.

### Scientific visualizations

All plots must follow Vellum conventions for:
- Axes.
- Gridlines.
- Line weights.
- Units.
- Labels.
- Colour.
- Markers.
- Legends.
- Uncertainty.
- Annotations.
- Accessibility.

Do not treat scientific charts as decorative illustrations.

They must communicate actual results from defined mathematical models.

---

# 9. Landing page and onboarding

The first screen must be intentionally simple.

Use a full-viewport composition with a subtle topographic background.

Suggested title:

**C++ Atlas**

Subtitle:

**Programming and Modelling for Biologists**

Supporting phrase:

"Learn the language. Build the model. Understand the system."

Present a simple entry action.

Avoid clutter, promotional content, unnecessary illustrations, and large decorative elements.

## First-time onboarding

Users choose:

**Beginner**

Little or no prior C++ experience.

**Intermediate**

Understands programming fundamentals but wants to learn scientific simulation implementation.

**Seasoned**

Already familiar with C++ or modelling and wants to work with more complex simulation techniques.

Optionally assess C++ and mathematical modelling familiarity separately.

Keep onboarding short.

Do not require registration.

Allow users to change their level later.

Persist preferences and progress locally.

---

# 10. The interactive atlas

The atlas is the central feature of the product.

It must be an actual navigational knowledge graph rather than a decorative visualization.

## Hierarchy

Implement at least four scales.

### Scale 1 — Complete landscape

Show the major programming regions and the four principal modelling destinations.

Users should immediately perceive that C++ foundations support biological modelling.

### Scale 2 — Knowledge domains

Zooming reveals domains such as:
- Program anatomy.
- Numeric computation.
- Control flow.
- Functions.
- Data structures.
- Program architecture.
- Algorithms.
- Numerical methods.
- Stochastic methods.
- Individual-based methods.
- Scientific inference.

### Scale 3 — Individual concepts

Reveal detailed concept nodes with meaningful connections.

Examples:
- `std::vector`.
- Pass-by-reference.
- `for` loops.
- Random generators.
- Euler integration.
- Gillespie waiting times.

### Scale 4 — Concept and model detail

Selecting a node reveals its lesson while retaining spatial context.

Model-destination nodes should allow the user to inspect the architecture of a complete computational model.

## Semantic zoom

Do not merely scale all graph elements proportionally.

At different zoom levels:
- Expand or collapse clusters.
- Change label density.
- Reveal or hide secondary relationships.
- Preserve important structural connections.
- Avoid label collisions.
- Maintain orientation.

Use a deterministic hierarchical layout.

Avoid constantly moving force-directed nodes.

## Meaningful edges

Graph relationships must have explicit meanings.

Required types:
- Prerequisite.
- Composition.
- Application.
- Conceptual relationship.
- Extension.
- Validation.

Examples:

`for` loops → Simulation time steps.

`std::vector` → Population state storage.

Functions → State-update rules.

Random generators → Stochastic simulations.

Classes → Individual-based model architectures.

Numerical integration → ODE models.

A graph edge should be defensible pedagogically.

Avoid artificial connections created only to make the atlas look dense.

## Interaction

Support:
- Zoom and pan.
- Node selection.
- Hover or focus previews.
- Prerequisite highlighting.
- Related-concept highlighting.
- Search.
- Recommended routes.
- Bookmarks.
- Current position.
- Back navigation.
- Reset view.
- Mobile interaction.
- Keyboard navigation.

Allow the user to navigate from a programming concept to the models using it, and from a model back to its prerequisites.

Use stable concept identifiers and linkable URLs.

---

# 11. Interactive model assembly

Each of the four principal modelling destinations must contain a **Model Assembly View**.

This is one of the highest-priority features.

The view should expose how a biological model is built from programming concepts.

For example:

### Stochastic modelling assembly

Mathematical model → State variables → Transition rates → Random generators → Event selection → Time advancement → Replicates → Output → Interpretation.

Selecting a component should reveal:
- Its mathematical definition.
- Its role in the algorithm.
- Its relevant C++ implementation.
- Related prerequisite lessons.
- Common errors.
- The consequences of an incorrect implementation.

## Synchronized mathematics and code

Where useful, allow selecting a mathematical expression to highlight the corresponding C++ statement.

Selecting the code should explain its mathematical meaning.

This must work especially well for:
- Discrete-time state updates.
- Matrix population models.
- Euler integration.
- Runge–Kutta algorithms.
- Gillespie simulations.
- Individual-based update rules.

This feature should make the relationship between mathematics and code genuinely understandable.

Do not build a superficial animation that only points at arbitrary lines.

---

# 12. Lessons and educational content

Use a consistent but flexible lesson structure.

A typical lesson should contain:

1. **What it is.**
2. **Why it matters.**
3. **How it works in C++.**
4. **An original minimal example.**
5. **An interactive explanation.**
6. **Its role in biological modelling.**
7. **Common mistakes.**
8. **Connections to other concepts.**
9. **Original practice.**
10. **Suggested next steps.**

The amount of detail should match the concept.

A fundamental syntax lesson may be short.

A numerical integration lesson may need more extensive mathematics, code, diagrams, and interactive experiments.

Do not create hundreds of shallow, repetitive pages.

A topic is covered only when the learner can reasonably understand and apply it.

## Explain syntax at the proper level

For beginners, explain unfamiliar symbols explicitly.

Do not assume the learner already understands namespaces, function signatures, stream operators, containers, scope, or references.

As the learner advances, progressively reduce unnecessary repetition.

## Biological relevance

Where a programming construct has an important modelling use, demonstrate it.

Avoid relying entirely on generic examples involving cars, employees, bank accounts, or shopping carts.

Prefer scientifically relevant original examples while keeping initial examples simple.

## Lesson sources

Maintain source metadata linking lessons to the relevant Groningen manual sections.

Display attribution in an unobtrusive manner.

Do not overload every paragraph with citations.

---

# 13. Interactive model laboratories

Build genuine interactive laboratories supporting Modules 14–17.

## Laboratory 1 — Discrete-time population dynamics

Show:
- Equations.
- State variables.
- Parameters.
- Initial conditions.
- Update algorithms.
- C++ implementation.
- Population trajectories.

The user can change parameters and observe model behaviour.

Make clear whether the displayed recurrence is a discrete-time model or a numerical approximation to a continuous-time model.

## Laboratory 2 — Matrix population models

Show:
- Structured population vectors.
- Transition matrices.
- Matrix multiplication.
- Projection over time.
- Population growth or decline.
- Biological interpretation.

Link the implementation to vectors, loops, functions, and data structures.

## Laboratory 3 — Numerical ODE integration

Compare:
- Euler's method.
- A suitable Runge–Kutta method.
- Different step sizes.
- Numerical solutions.
- Known analytical results where available.

Teach truncation error, convergence, and numerical stability.

Do not imply that all ODE solvers provide accurate results for arbitrary step sizes.

## Laboratory 4 — Gillespie simulation

Build an event-driven stochastic laboratory.

Explain:
- System state.
- Event propensities.
- Total propensity.
- Waiting-time sampling.
- Event selection.
- State updates.
- Simulation stopping conditions.
- Replicate variability.

Ensure the implementation follows a mathematically correct Gillespie method for the specified model.

## Laboratory 5 — Individual-based simulation

Implement an original biological model involving individual states and interactions.

Show:
- Individuals.
- Attributes.
- Interaction rules.
- Update schedule.
- Individual events.
- Population-level outcomes.
- Emergent dynamics.

Every visualized state must correspond to the simulation's actual state.

## Laboratory requirements

Every laboratory must include:
- Mathematical equations or process rules.
- Explicit assumptions.
- Parameter definitions.
- Initial conditions.
- Computational algorithm.
- Corresponding C++ implementation.
- Interactive controls.
- Output visualization.
- Scientific interpretation.
- Known limitations.

Scientific correctness is mandatory.

---

# 14. Coding environment

Implement an interactive C++ code-reading and editing interface.

Use a suitable editor such as CodeMirror or Monaco.

Support:
- Syntax highlighting.
- Line numbers.
- Code copying.
- Editing.
- Resetting.
- Concept annotations.
- Readable examples.
- Accessible keyboard interaction.

## Code anatomy

For beginner lessons, enable users to inspect individual elements of a statement.

For example:

```cpp
std::cout << "Hello, world!\n";
```

The learner should be able to explore:
- `std`
- `::`
- `cout`
- `<<`
- String literals.
- Newline escape.
- Statement termination.

As lessons progress, connect larger code blocks to algorithms and mathematical expressions.

## C++ execution

Investigate genuine browser-based C++ execution using an appropriate WebAssembly-compatible toolchain.

Assess:
- Toolchain correctness.
- Bundle size.
- Browser compatibility.
- Compilation latency.
- Resource limits.
- Security.
- GitHub Pages compatibility.

Do not make genuine browser-based compilation a prerequisite for building the educational core.

If robust browser compilation is unavailable, provide:
- Editable annotated code.
- Accurate conceptual demonstrations.
- Downloadable original C++ examples.
- Local compilation instructions.
- Expected output.
- Debugging guidance.

**Never represent JavaScript simulation as execution of arbitrary C++ source.**

Label the implementation technology honestly.

---

# 15. Astro is mandatory

The website must be built using **Astro as the primary framework**.

Do not implement a conventional React single-page application and merely wrap it in Astro.

Astro must own:
- Routing.
- Page generation.
- Site layouts.
- Lesson content.
- Content collections.
- Metadata.
- Static generation.
- Primary document structure.
- GitHub Pages deployment.

Use Astro's islands architecture.

## Recommended architecture

Use:
- Astro.
- TypeScript.
- Astro Content Collections.
- Markdown and MDX.
- `@astrojs/mdx`.
- `@astrojs/react` for interactive React islands where justified.
- React Flow / XYFlow for the interactive atlas if it proves suitable.
- A deterministic hierarchical layout engine, such as ELK.js or an appropriate alternative.
- KaTeX for mathematical notation.
- CodeMirror or Monaco for code.
- D3 utilities or a suitable charting library for visualization.
- Vellum design tokens and chart conventions.
- Vitest for unit tests.
- Playwright for browser tests.

Verify dependency compatibility before installation.

Do not install large libraries without a clear purpose.

## Astro component ownership

Use `.astro` components for:
- Page layouts.
- Navigation shells.
- Static typography.
- Article structures.
- Source attribution.
- Footers.
- Static lesson content.
- Simple interface elements that do not require hydration.

Use hydrated React islands for:
- Interactive atlas canvas.
- Dynamic node interactions.
- Model Assembly Views.
- Interactive numerical laboratories.
- Stateful code interactions.
- Complex interactive charts.
- Controls requiring persistent reactive state.

For simpler interactions, use native browser JavaScript where appropriate rather than introducing unnecessary framework code.

## Hydration strategy

Use appropriate Astro hydration directives.

Examples:
- `client:load` for an immediately interactive atlas.
- `client:visible` for offscreen laboratories.
- `client:idle` for secondary interactive controls.
- `client:only="react"` when a component genuinely requires client-only rendering.

Do not hydrate every page unnecessarily.

Do not create a large global client-side application when Astro can render static content efficiently.

## Static rendering

The site must be compatible with GitHub Pages.

Use Astro's static rendering and prerendered routes.

Do not require a persistent server, database, or server-side API for the core educational experience.

Store user progress locally.

If an optional feature requires a backend, isolate it and explain the requirement instead of silently breaking static deployment.

---

# 16. Astro curriculum and content architecture

Use Astro Content Collections to manage lessons.

Support Markdown and MDX content.

Each lesson should have validated metadata.

Suggested fields:

```ts
type LessonMetadata = {
  title: string;
  summary: string;
  module: number | null;
  section: string | null;
  level: "beginner" | "intermediate" | "seasoned";
  prerequisites: string[];
  relatedConcepts: string[];
  modellingApplications: string[];
  estimatedMinutes: number;
  learningObjectives: string[];
  laboratoryId?: string;
  sourceReferences: string[];
};
```

Adapt this schema as appropriate.

Concepts and lessons need not correspond one-to-one: a major lesson may explain several related concepts, while a complex source section may require multiple lessons.

Maintain stable concept and lesson identifiers.

## Suggested project organization

Adapt to the connected repository, but aim for a structure similar to:

```text
/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── public/
│   ├── assets/
│   └── ...
├── src/
│   ├── pages/
│   │   ├── index.astro
│   │   ├── atlas/
│   │   │   └── index.astro
│   │   ├── learn/
│   │   │   └── [slug].astro
│   │   ├── sources.astro
│   │   └── about.astro
│   ├── layouts/
│   ├── components/
│   │   ├── landing/
│   │   ├── atlas/
│   │   ├── lessons/
│   │   ├── code/
│   │   ├── mathematics/
│   │   ├── laboratories/
│   │   └── charts/
│   ├── content/
│   │   └── lessons/
│   ├── data/
│   │   ├── concepts/
│   │   ├── relationships/
│   │   ├── pathways/
│   │   └── models/
│   ├── lib/
│   │   ├── graph/
│   │   ├── recommendations/
│   │   ├── simulations/
│   │   ├── persistence/
│   │   └── validation/
│   ├── styles/
│   │   └── vellum/
│   └── tests/
├── cpp-examples/
│   ├── foundations/
│   ├── algorithms/
│   ├── ode/
│   ├── stochastic/
│   └── individual-based/
├── docs/
└── .github/
    └── workflows/
```

This is a suggested structure, not permission to overwrite an existing repository blindly.

## Graph schema

Store the atlas structure separately from the visual layout.

Each node should contain:
- Identifier.
- Title.
- Description.
- Domain.
- Manual module.
- Related lesson.
- Learning level.
- Prerequisites.
- Related applications.
- Optional laboratory.
- Learning goals.

Edges must contain their relationship type.

Validate:
- Missing identifiers.
- Broken references.
- Duplicate nodes.
- Invalid lesson links.
- Circular prerequisite chains.
- Unreachable core concepts.
- Missing source mappings.
- Broken learning pathways.

Conceptual relationships may form cycles, but strict prerequisite dependencies should not.

---

# 17. GitHub Pages deployment

Configure the site for the connected GitHub repository.

Use the official Astro GitHub Pages deployment approach.

## Requirements

- Static production build.
- Correct `site` configuration.
- Correct `base` configuration where required.
- GitHub Actions deployment.
- Compatible URL routing.
- Correct static asset paths.
- Reproducible package installation.
- A committed lockfile.
- A documented compatible Node version.
- Build verification before deployment.

Inspect whether the repository is:
- A project site under `username.github.io/repository`.
- A root `username.github.io` site.
- A custom-domain site.

Configure Astro accordingly.

Do not hardcode paths for an invented repository.

Internal URLs must respect the configured base path.

Prerendered lesson routes must work when visited directly and after browser refresh.

Use the current supported Astro GitHub Action and GitHub Pages deployment actions, verifying their versions during implementation.

If GitHub Pages settings require GitHub Actions as the deployment source, configure this and document the required repository setting.

### Deployment acceptance

Do not claim the site is deployed unless deployment has been verified.

A successful local build is not equivalent to a successful GitHub Pages deployment.

If repository permissions prevent a deployment action, leave the implementation ready and report the exact outstanding setting or permission.

---

# 18. Scientific simulations and implementation consistency

The website contains two potentially distinct implementations of a model:

1. C++ educational source code.
2. Interactive browser simulation code, typically TypeScript.

These implementations must be mathematically consistent.

Do not allow them to diverge silently.

## Validation strategy

For deterministic models:
- Define canonical equations.
- Document update order.
- Create benchmark inputs.
- Compare outputs under equivalent settings.
- Use appropriate numerical tolerances.

For stochastic models:
- Verify event logic.
- Verify distributions.
- Verify stopping conditions.
- Validate statistical behaviour across replicates.
- Document random-number-generation differences.

Do not expect C++ and JavaScript random generators to produce identical trajectories merely because they share a numerical seed.

Use common statistical expectations or a deliberately equivalent generator when exact cross-language reproducibility is required.

## Model tests

Include tests for:
- Initialization.
- Update logic.
- Boundary conditions.
- Nonnegative states where required.
- Extinction.
- Numerical stability.
- Reproducibility.
- Output consistency.
- Known analytical benchmarks.
- Stochastic sample properties.

Every model should have a documented relationship between equations, algorithms, and implementations.

Do not mistake smooth animations or plausible-looking curves for validation.

---

# 19. Scientific figures and analysis

The website must use Vellum for scientific visualization.

Create reusable components for:
- Time-series plots.
- Distribution plots.
- Parameter-response curves.
- Multiple simulation trajectories.
- Numerical method comparisons.
- Matrix population displays.
- Individual-based population summaries.

Use mathematically appropriate axes and scales.

Include units where relevant.

Make stochastic uncertainty visible when needed.

Avoid misleading axis truncation, unjustified smoothing, arbitrary normalization, or inconsistent comparisons.

Explain what the visualized quantity represents.

## Model interpretation

Every substantial model laboratory should include an interpretation section addressing:
- What pattern occurs?
- Which assumptions generate it?
- How does it depend on parameters?
- Does numerical approximation affect it?
- How variable is it?
- What biological claim can be supported?
- What cannot be inferred?

The website should teach scientific reasoning, not merely code execution.

---

# 20. Learning pathways and progress

Support the three entry levels:
- Beginner.
- Intermediate.
- Seasoned.

Recommendations should be generated from actual concept prerequisites and learning goals.

Users should be able to choose goals such as:
- Write my first C++ program.
- Build a discrete-time population model.
- Understand numerical ODE solvers.
- Implement a stochastic model.
- Learn Gillespie simulation.
- Develop individual-based simulations.
- Analyse simulation output.
- Build reproducible C++ modelling software.

Highlight the relevant route through the atlas.

Allow the user to explore unrelated concepts freely.

## Persistence

Use browser-local storage or IndexedDB.

Store:
- Chosen level.
- Learning objectives.
- Completed lessons.
- Completed knowledge checks.
- Bookmarks.
- Recently visited concepts.
- Current pathway.
- Display preferences.

Provide import/export of progress where practical.

Do not require accounts.

Distinguish visiting a lesson from demonstrating competence.

Avoid superficial gamification.

---

# 21. Original exercises and understanding checks

Develop independently designed practice tasks.

Use:
- Code reading.
- Output prediction.
- Debugging.
- Short implementation tasks.
- Mathematical-to-code translation.
- Simulation reasoning.
- Interpretation questions.
- Model-design exercises.

Do not use the handbook's assigned exercise solutions.

Do not create disguised replicas of graded tasks.

Assessment should focus on understanding.

Examples:
- Why does integer division change a calculated growth rate?
- What happens when a loop iterates one step too far?
- How do two state-update orders differ?
- Why does Euler's method become inaccurate with an excessively large step size?
- Why do two stochastic simulations produce different trajectories?
- What does an individual-based model represent that an aggregate equation does not?

Provide useful feedback.

Do not mark arbitrary C++ source correct unless it is genuinely validated.

---

# 22. Capstone projects

Design original capstones that correspond to major modelling destinations.

## Capstone A — First ecological model

A complete procedural simulation.

Focus:
- Variables.
- Functions.
- Loops.
- State updates.
- Storage.
- Output.

## Capstone B — Matrix population dynamics

Focus:
- Population vectors.
- Transition matrices.
- Iterative projections.
- Algorithm design.
- Interpretation.

## Capstone C — Numerical ODE modelling

Focus:
- Mathematical equations.
- Euler integration.
- Runge–Kutta integration.
- Error.
- Numerical validation.

## Capstone D — Stochastic biological simulation

Focus:
- Random generators.
- Event rates.
- Gillespie simulation.
- Replicates.
- Statistical summaries.

## Capstone E — Individual-based modelling

Focus:
- Individuals.
- Data structures.
- Interaction rules.
- Scheduling.
- Emergent behaviour.

## Capstone F — Complete computational research workflow

Focus:
- Scientific question.
- Mathematical model.
- Algorithm.
- C++ implementation.
- Verification.
- Experimental design.
- Replicate simulations.
- Data analysis.
- Vellum visualizations.
- Scientific interpretation.

Every capstone must appear as an integration node in the atlas.

Each must show the programming concepts it requires.

Do not reproduce the Groningen manual's graded projects.

---

# 23. Accessibility and responsive design

The site must remain usable beyond desktop pointer interactions.

Implement:
- Keyboard-accessible navigation.
- Accessible node descriptions.
- Visible focus indicators.
- Reduced-motion support.
- Appropriate colour contrast.
- Accessible charts.
- Readable equations.
- Accessible code editors.
- Touch-compatible atlas interactions.
- Responsive lesson layouts.

Provide a structured curriculum outline as an accessible alternative to the graph.

Do not use colour alone to indicate concept category, progress, or edge meaning.

## Mobile

Build a deliberate mobile experience.

The desktop atlas can be spatially rich, but the mobile version must remain functional.

Use:
- Touch-friendly zooming.
- A compact atlas navigator.
- Responsive lesson panels.
- Clear navigation controls.
- A useful concept outline.
- Accessible interactive laboratory controls.

Do not simply shrink the desktop interface.

---

# 24. Performance and quality

Astro should provide an efficient static-content foundation.

Use client-side JavaScript selectively.

Prioritize:
- Fast initial rendering.
- Minimal unnecessary hydration.
- Readable graph layout.
- Smooth atlas navigation.
- Lazy-loaded laboratories.
- Efficient model calculations.
- Reasonable memory consumption.
- Stable interactions.
- No significant layout shifts.

Do not preload every laboratory, code editor, and graph dependency on the landing page.

Ensure reduced-motion support.

Check performance on normal laptops and mobile browsers.

Avoid heavy animations that add no educational value.

---

# 25. Documentation

Create and maintain:

### README.md

Explain:
- Project purpose.
- Installation.
- Development.
- Testing.
- Building.
- Deployment.
- Repository structure.

### docs/STUDENT_MANUAL_COVERAGE.md

The complete, auditable source-to-lesson mapping.

### docs/CURRICULUM.md

The learning structure, prerequisites, and modelling destinations.

### docs/ARCHITECTURE.md

Astro architecture, interactive islands, data schemas, and technical decisions.

### docs/DESIGN_SYSTEM.md

Vellum integration, colour semantics, typography, graph styling, and scientific visualization rules.

### docs/SCIENTIFIC_VALIDATION.md

Models, equations, algorithms, assumptions, test cases, and validation results.

### docs/SOURCES.md

Primary and supplementary sources, required university attribution, and content-use restrictions.

### docs/IMPLEMENTATION_STATUS.md

What is implemented, incomplete, tested, and outstanding.

Documentation must reflect the actual website.

Do not declare unimplemented features complete.

---

# 26. Development sequence

Proceed in the following order.

## Phase 1 — Repository and source audit

1. Inspect the connected GitHub repository.
2. Examine the existing project.
3. Read the complete Groningen manual.
4. Read the supporting PDFs.
5. Inspect the reference websites.
6. Inspect Vellum documentation and reusable resources.
7. Build the complete manual coverage inventory.
8. Construct the pedagogical dependency graph.
9. Identify the four modelling destinations.
10. Document the Astro architecture and implementation plan.

Do not omit the source audit.

## Phase 2 — Astro foundation and design system

Implement:
- Astro configuration.
- Content collections.
- Global layouts.
- Vellum tokens.
- Light and dark themes.
- Landing page.
- Onboarding.
- Routing.
- Source attribution.
- GitHub Pages-compatible build.

Use actual repository information.

## Phase 3 — Functional atlas

Implement:
- Hierarchical graph data.
- Concept clusters.
- Semantic zoom.
- Panning.
- Search.
- Node previews.
- Lesson navigation.
- Relationship highlighting.
- Learning pathways.
- Local progress.

Use real curriculum content for testing.

Do not fill the atlas with generic placeholder labels.

## Phase 4 — Complete beginner vertical slice

Implement one complete educational journey:

**Hello World → Variables → Calculations → Conditions → Loops → Functions → Algorithm → Population Simulation → Output → Interpretation**

Ensure every lesson, graph connection, code example, and visualization in this route is functional.

Use this to validate both pedagogy and interface architecture.

## Phase 5 — Full manual coverage

Develop the complete instructional content of Modules 1–13.

Preserve advanced manual sections as appropriate optional pathways.

Continue updating the coverage matrix.

Do not generate large amounts of superficial filler.

## Phase 6 — Four modelling destinations

Implement:
- Module 14 algorithm-design destination.
- Module 15 ODE-integration destination.
- Module 16 stochastic-modelling destination.
- Module 17 individual-based-modelling destination.

Build the associated model laboratories and Model Assembly Views.

Ensure the modelling destinations are visually prominent and connected to their prerequisites.

## Phase 7 — Scientific inference

Connect simulations to:
- Experiment design.
- Replicates.
- Parameter exploration.
- Data export.
- Analysis.
- Visualization.
- Validation.
- Scientific conclusions.

Develop the complete computational research capstone.

## Phase 8 — Modernization and engineering

Add selective modern C++ explanations and good software engineering practices from the supporting books.

Keep the focus on modelling.

## Phase 9 — Testing and release

Run:
- Astro build checks.
- TypeScript checks.
- Curriculum validation.
- C++ compilation tests.
- Scientific model tests.
- Browser tests.
- Accessibility tests.
- Responsive layout tests.
- Graph navigation tests.
- GitHub Pages deployment checks.

Fix critical issues before declaring completion.

---

# 27. Mandatory acceptance criteria

## Educational completeness

- Every non-excluded instructional section in the Groningen manual has been addressed.
- Modules 1–13 teach the required C++ concepts.
- Modules 14–17 are the principal modelling destinations.
- The full advanced manual content is accessible through appropriate optional routes.
- A complete beginner can learn the anatomy of a C++ program.
- Users can progress from basic syntax to biological modelling.
- Users learn modelling logic, not merely language syntax.
- No original course assignment solutions have been published.

## Atlas quality

- The atlas is the principal navigation interface.
- It is hierarchical and zoomable.
- Nodes are meaningfully connected.
- Layout remains readable.
- Users can navigate from fundamentals to models.
- Users can navigate backward from models to prerequisites.
- Concept clusters expand and collapse appropriately.
- Model Assembly Views demonstrate how programming concepts form complete simulations.
- Search, bookmarks, and pathways work.

## Scientific quality

- Model equations and implementations agree.
- C++ examples compile successfully.
- Mathematical assumptions are explained.
- Numerical algorithms are validated.
- Stochastic simulations behave appropriately.
- Replicate variability is interpreted correctly.
- Scientific figures use actual computed data.
- Scientific conclusions are appropriately qualified.

## Visual quality

- The landing page has the specified topographic aesthetic.
- The interface reflects the restrained TRex design direction.
- The atlas is visually elegant rather than cluttered.
- Scientific figures comply with Vellum.
- Vellum colour semantics are respected.
- Typography is consistent.
- Dark and light modes function.
- Reduced-motion behaviour is supported.
- Mobile navigation is usable.

## Astro and repository quality

- The site is genuinely built with Astro.
- React is used only where justified for interactive islands.
- Lessons are managed through Astro content architecture.
- Static generation works.
- The connected repository is used.
- No unrelated repository content is destroyed.
- GitHub Pages is configured correctly.
- Internal paths respect the deployment base path.
- Direct lesson URLs work.
- Production builds and tests pass.
- Deployment is actually verified or any external blocker is precisely reported.

## Documentation quality

- Source coverage is auditable.
- Technical decisions are documented.
- The university source is correctly cited.
- Scientific validation is documented.
- Implementation status is accurate.
- Incomplete features are not misrepresented as complete.

---

# 28. Working principles for the agent

Use independent technical judgment, but do not deviate from the central requirements.

You should not need to ask the user about routine implementation decisions.

Use the actual repository state, source material, and reference websites to resolve those decisions.

If a reference website cannot be inspected fully, report that limitation rather than inventing details.

If an attached PDF is unavailable in the development environment, locate it through the supplied project context or available attachments before asserting curriculum coverage.

Do not guess missing handbook material.

Make reasonable progress even when noncritical information is missing.

Prioritize working software over speculative architectural complexity.

Avoid:
- Unnecessary framework dependencies.
- Full-page client-side React architecture.
- Decorative graph effects.
- Fake C++ execution.
- Unvalidated simulations.
- Long, shallow lessons.
- Unnecessary advanced C++ language trivia.
- Excessive gamification.
- Copyright-infringing course reproductions.
- Unsupported scientific claims.
- False statements about deployment or completion.

When an implementation choice is uncertain, prefer:
- Correct science over visual spectacle.
- Clear programming over clever abstractions.
- Meaningful relationships over dense networks.
- Carefully written educational material over autogenerated repetition.
- Astro's static rendering over unnecessary hydration.
- Reproducible simulations over visually convenient approximations.
- Vellum compliance over improvised styling.
- Working functionality over placeholder demonstrations.

---

# 29. Final deliverables

The completed work must include:

1. A functioning Astro website in the connected GitHub repository.
2. A minimalist landing page with a subtle topographic background.
3. Beginner, intermediate, and seasoned onboarding.
4. A hierarchical, zoomable knowledge atlas.
5. The complete instructional curriculum of the Groningen manual, with assignments and solutions excluded.
6. Clear, original C++ explanations and examples.
7. Four prominent modelling destinations corresponding to Modules 14–17.
8. Interactive Model Assembly Views.
9. Interactive scientific model laboratories.
10. Scientific inference and simulation-analysis material.
11. Personalized prerequisite-based learning pathways.
12. Local progress tracking.
13. Vellum-compliant scientific figures.
14. C++ example compilation tests.
15. Scientific model validation.
16. Functional responsive and accessible layouts.
17. GitHub Pages deployment configuration.
18. Accurate source attribution.
19. Complete technical and curriculum documentation.
20. A final implementation report identifying completed work and any remaining limitations.

Provide the actual repository changes, not just a description of what should be built.

If the entire website cannot reasonably be completed in one working session, finish the largest coherent, tested part possible and preserve a clear implementation plan for the remaining work. Do not misrepresent partial functionality as complete.

---

# 30. The ultimate design principle

The atlas must make the relationship between programming and modelling visible.

The learner should be able to see how individual language constructs connect to algorithms, how algorithms connect to biological models, and how biological models connect to scientific conclusions.

The four modelling destinations — **Algorithm Design, Numerical Integration, Stochastic Modelling, and Individual-Based Modelling** — are the intellectual centre of the experience.

The rest of the curriculum must support them.

The final synthesis is scientific inference.

The website should continuously reinforce two questions:

**What can I build with the C++ concept I have just learned?**

**What do I need to understand to build the biological model I want?**

These questions should drive the atlas's structure, its navigation, its educational content, and its interactive demonstrations.

A successful user should not merely know what a C++ function, class, vector, or loop is.

They should know how to use those constructs to implement a scientifically meaningful model, determine whether it behaves correctly, examine its predictions, and interpret what its behaviour means.

**Build an elegant, technically rigorous, Astro-based atlas that teaches the art of computational biological modelling through C++.**
