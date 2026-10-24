// Core data model of the C++ Atlas.
//
// The atlas is a typed knowledge graph. Its *structure* (domains, concept
// nodes, typed edges, pathways) lives in src/data and is independent of its
// *visual layout*, which is computed deterministically in src/lib/graph.

export type Level = 'beginner' | 'intermediate' | 'seasoned';

export const LEVELS: readonly Level[] = ['beginner', 'intermediate', 'seasoned'];

export type VellumFamily = 'teal' | 'terracotta' | 'indigo' | 'ochre' | 'mauve' | 'moss';

export type DomainId =
  | 'anatomy'
  | 'numeric'
  | 'control'
  | 'functions'
  | 'data'
  | 'io'
  | 'architecture'
  | 'algorithms'
  | 'ode'
  | 'stochastic'
  | 'ibm'
  | 'inference';

/** Scale-1 regions of the landscape. */
export type RegionId = 'foundations' | 'structures' | 'destinations' | 'synthesis';

export interface Region {
  id: RegionId;
  title: string;
  summary: string;
}

export interface Domain {
  id: DomainId;
  title: string;
  /** Very short label for the zoomed-out landscape. */
  short: string;
  region: RegionId;
  /** Foundations support the destinations; destinations are Modules 14–17. */
  kind: 'foundation' | 'destination' | 'synthesis';
  /** Only destinations and the synthesis region carry a Vellum family. */
  family?: VellumFamily;
  /** Groningen manual modules primarily taught in this domain. */
  modules: number[];
  summary: string;
  /** Column of the deterministic landscape layout (west → east). */
  column: number;
  /** Order within the column (north → south). */
  row: number;
}

export type NodeKind =
  /** A teachable C++ or modelling concept, anchored in a lesson. */
  | 'concept'
  /** A principal modelling destination (Modules 14–17) or the inference synthesis. */
  | 'landmark'
  /** A synthesis node that integrates many earlier concepts (Module 11). */
  | 'integration'
  /** An original capstone project. */
  | 'capstone';

export type LabId = 'discrete' | 'matrix' | 'ode' | 'gillespie' | 'ibm';

export interface ConceptNode {
  /** Stable identifier used in URLs (?node=id) and progress storage. */
  id: string;
  title: string;
  /** Optional shorter label for the atlas canvas. */
  label?: string;
  summary: string;
  domain: DomainId;
  kind: NodeKind;
  level: Level;
  /** Lesson slug (src/content/lessons/<slug>.mdx); capstones use capstone pages. */
  lesson?: string;
  /** Heading id inside the lesson where this concept is taught. */
  anchor?: string;
  /** Manual section ids (see src/data/manual.ts), e.g. "M5.2". Empty for original material. */
  manual: string[];
  /** One to three learning goals, phrased as capabilities. */
  goals: string[];
  /** Interactive laboratory that exercises the concept. */
  lab?: LabId;
  /** Advanced or optional branch (manual "advanced" sections, enrichment). */
  optional?: boolean;
  /** Language standard required by the main code of the concept, if newer than C++17. */
  standard?: 'c++20' | 'c++23';
}

export type EdgeType =
  /** `from` must be understood before `to` can be learned. Must be acyclic. */
  | 'prerequisite'
  /** `from` is a component of the model or construct `to`. */
  | 'composition'
  /** `from` is applied in `to` (a construct used by a model). */
  | 'application'
  /** A conceptual relationship worth knowing; symmetric, may form cycles. */
  | 'conceptual'
  /** `to` extends `from` (an advanced or optional branch). */
  | 'extension'
  /** `from` is used to verify or validate `to`. */
  | 'validation';

export const EDGE_TYPES: readonly EdgeType[] = [
  'prerequisite',
  'composition',
  'application',
  'conceptual',
  'extension',
  'validation',
];

export interface Edge {
  from: string;
  to: string;
  type: EdgeType;
  /** Short justification, shown in the atlas panel. */
  note?: string;
}

/** A section of the Groningen manual, for the auditable coverage matrix. */
export interface ManualSection {
  /** e.g. "M5.2", "M5.adv-jump", "M14.4" */
  id: string;
  module: number | null;
  /** Section identifier as printed in the manual ("5.2", "advanced", "Appendix"). */
  section: string;
  title: string;
  /** Instructional content is covered; assessment/administrative content is excluded. */
  kind: 'instructional' | 'advanced' | 'excluded';
  /** Why a section is excluded (exercises, solutions, assignments, index …). */
  exclusionReason?: string;
  /** What the section teaches (for instructional sections). */
  concept?: string;
  objective?: string;
  /** How the section contributes to scientific modelling. */
  modelling?: string;
  /** Notes on how the site deviates from or corrects the manual. */
  notes?: string;
}

export interface Goal {
  id: string;
  title: string;
  summary: string;
  /** Target concept ids; the route is their prerequisite closure. */
  targets: string[];
}
