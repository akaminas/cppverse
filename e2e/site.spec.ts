import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator } from '@playwright/test';

/** Scroll an island into view and wait until Astro has hydrated it. */
async function hydrated(target: Locator) {
  await target.scrollIntoViewIfNeeded();
  await expect(target.locator('xpath=ancestor-or-self::astro-island[1] | .//astro-island').first()).not.toHaveAttribute('ssr', '');
}

const CITATION = 'C++ for biologists course material, University of Groningen, Faculty of Science and Engineering, Nijenborgh 7, 9747 AG Groningen';

test.describe('landing and navigation', () => {
  test('the landing page shows the title, the phrase and the exact attribution', async ({ page }) => {
    await page.goto('./');
    await expect(page.getByRole('heading', { level: 1, name: 'C++ Atlas' })).toBeVisible();
    await expect(page.getByText('Learn the language. Build the model. Understand the system.')).toBeVisible();
    await expect(page.locator('cite').first()).toHaveText(CITATION);
  });

  test('every internal link on the landing page respects the base path', async ({ page }) => {
    await page.goto('./');
    const hrefs = await page.locator('a[href^="/"]').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    for (const h of hrefs) expect(h!.startsWith('/cppverse/')).toBe(true);
  });

  test('onboarding stores a profile and opens the atlas with the chosen pathway', async ({ page }) => {
    await page.goto('start/');
    await hydrated(page.locator('.onboarding'));
    await page.getByText('Intermediate', { exact: true }).click();
    await page.getByRole('button', { name: /open my atlas/i }).click();
    await expect(page).toHaveURL(/atlas\/\?goal=discrete-model/);
    const stored = await page.evaluate(() => localStorage.getItem('cpp-atlas:v1'));
    expect(JSON.parse(stored!).profile.level).toBe('intermediate');
  });

  for (const path of ['atlas/', 'curriculum/', 'models/', 'models/stochastic/', 'pathways/', 'progress/', 'sources/', 'about/', 'capstones/', 'capstones/capstone-d/', 'learn/hello-world/']) {
    test(`direct URL ${path} loads without errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await page.waitForLoadState('networkidle');
      expect(errors).toEqual([]);
    });
  }
});

test.describe('atlas', () => {
  test('search finds a concept and selecting it opens its panel and updates the URL', async ({ page }) => {
    await page.goto('atlas/');
    await hydrated(page.locator('.atlas'));
    await page.locator('#atlas-search').fill('gillespie');
    await page.locator('#atlas-search').press('Enter');
    await expect(page.locator('.atlas-detail-title')).toHaveText("Gillespie's direct method");
    await expect(page).toHaveURL(/node=gillespie/);
  });

  test('backward learning: "All it needs" highlights prerequisites; browser back restores the previous node', async ({ page }) => {
    await page.goto('atlas/?node=gillespie');
    await expect(page.locator('.atlas-detail-title')).toHaveText("Gillespie's direct method");
    await page.getByRole('button', { name: 'All it needs' }).click();
    await expect(page.locator('#node-variables')).not.toHaveClass(/is-faded/);
    await page.locator('.atlas-panel').getByRole('button', { name: /Events and propensities/ }).first().click();
    await expect(page.locator('.atlas-detail-title')).toHaveText('Events and propensities');
    await page.goBack();
    await expect(page.locator('.atlas-detail-title')).toHaveText("Gillespie's direct method");
  });

  test('the keyboard moves between concepts and Enter opens one', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard navigation is a desktop interaction');
    await page.goto('atlas/?node=for-loop');
    await hydrated(page.locator('.atlas'));
    await page.locator('.atlas-svg').focus();
    await page.keyboard.press('ArrowRight');
    const focused = await page.evaluate(() => document.activeElement?.id);
    expect(focused).toMatch(/^node-/);
    await page.keyboard.press('Enter');
    await expect(page.locator('.atlas-detail-title')).not.toHaveText('for loops');
  });

  test('a pathway highlights its route and names the next step', async ({ page }) => {
    await page.goto('atlas/?goal=gillespie');
    await expect(page.locator('.atlas')).toHaveClass(/has-route/);
    await expect(page.locator('.atlas-route')).toContainText('Next:');
  });
});

test.describe('lessons, models and laboratories', () => {
  test('a knowledge check gives feedback and records a correct answer', async ({ page }) => {
    await page.goto('learn/hello-world/');
    const check = page.locator('.check').first();
    await hydrated(check);
    await check.getByText('N = 120', { exact: true }).click();
    await check.getByRole('button', { name: 'Check my answer' }).click();
    await expect(check.locator('.check-feedback')).toContainText('Correct');
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('cpp-atlas:v1')!));
    expect(Object.keys(stored.checks)).toContain('hello-world/output');
  });

  test('the model assembly view links components to code lines', async ({ page }) => {
    await page.goto('models/stochastic/');
    const asm = page.locator('.assembly').first();
    await hydrated(asm);
    await asm.getByRole('button', { name: /Time advancement/ }).click();
    await expect(asm.locator('.assembly-detail h4')).toHaveText('Time advancement');
    await expect(asm.locator('.line.is-marked').first()).toBeVisible();
  });

  test('the ODE laboratory reports an instability for large Euler steps', async ({ page }) => {
    await page.goto('models/ode/');
    const lab = page.locator('#lab-ode');
    await hydrated(lab);
    await lab.getByRole('button', { name: 'Elimination' }).click();
    const slider = lab.getByLabel('Step size h');
    await slider.focus();
    await slider.press('End');
    await expect(lab.locator('.lab-status')).toContainText('unstable');
  });

  test('the Gillespie laboratory compares replicates with Kendall’s formula', async ({ page }) => {
    await page.goto('models/stochastic/');
    const lab = page.locator('#lab-gillespie');
    await hydrated(lab);
    await expect(lab.getByText(/Kendall/).first()).toBeVisible();
  });
});

test.describe('accessibility', () => {
  for (const path of ['./', 'atlas/', 'learn/hello-world/', 'models/algorithms/', 'curriculum/', 'start/', 'learn/vectors/', 'learn/gillespie/', 'models/ibm/']) {
    test(`no serious accessibility violations on ${path}`, async ({ page }) => {
      test.setTimeout(120_000); // axe is slow on pages with large DOMs and animated layers
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
    });
  }
});
