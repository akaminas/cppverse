import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Lessons are MDX files in src/content/lessons. Their relationships
// (prerequisites, applications, what they enable) are *not* repeated here:
// they are derived from the atlas graph in src/data, which anchors each
// concept node to a lesson. scripts/validate-curriculum.ts checks that the
// two agree.
const lessons = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/lessons' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    level: z.enum(['beginner', 'intermediate', 'seasoned']),
    /** Groningen manual module, or null for material original to this site. */
    module: z.number().int().min(1).max(17).nullable(),
    /** Manual section ids (src/data/manual.ts) this lesson teaches. */
    manual: z.array(z.string()).default([]),
    minutes: z.number().int().positive(),
    objectives: z.array(z.string()).min(1),
    /** Interactive laboratory embedded in or linked from the lesson. */
    lab: z.enum(['discrete', 'matrix', 'ode', 'gillespie', 'ibm']).optional(),
    /** Supporting references beyond the manual (books, documentation). */
    references: z.array(z.string()).default([]),
    /** Newest language standard used by the lesson's main code. */
    standard: z.enum(['c++17', 'c++20', 'c++23']).default('c++17'),
    optional: z.boolean().default(false),
  }),
});

export const collections = { lessons };
