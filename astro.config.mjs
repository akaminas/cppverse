// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { rehypeBaseLinks } from './src/lib/markdown/rehype-base-links.mjs';
import { rehypeFocusableMath } from './src/lib/markdown/rehype-focusable-math.mjs';
import { vellumCodeTheme } from './src/lib/markdown/code-theme.mjs';

// The site is a GitHub Pages *project* site for github.com/akaminas/cppverse,
// so every route lives under /cppverse/. Override with SITE_URL / BASE_PATH
// when deploying elsewhere (for example a fork or a custom domain).
const site = process.env.SITE_URL ?? 'https://akaminas.github.io';
const base = process.env.BASE_PATH ?? '/cppverse';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  output: 'static',
  // Per-checkout cache (node_modules may be shared between worktrees).
  cacheDir: './.astro-cache',
  integrations: [mdx(), react()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [[rehypeKatex, { strict: 'ignore' }], rehypeFocusableMath, [rehypeBaseLinks, { base }]],
    }),
    shikiConfig: {
      theme: vellumCodeTheme,
      wrap: false,
    },
  },
  vite: {
    build: { chunkSizeWarningLimit: 900 },
  },
});
