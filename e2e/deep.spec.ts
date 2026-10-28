import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { solutionSubmission } from '../src/lib/quest/reference-lake';

const KEY = 'cpp-atlas:v1';
const emptyQuest = { offered: null, declined: null, accepted: null, crowned: null };

/** A learner state that has finished every required lesson. */
async function finishEveryCourse(page: Page, quest: object = emptyQuest) {
  await page.goto('about/');
  const lessons: [string, number][] = JSON.parse((await page.locator('[data-nautilus]').getAttribute('data-lessons')) ?? '[]');
  expect(lessons.length).toBeGreaterThan(50);
  const state = {
    version: 1,
    profile: null,
    goals: [],
    visited: {},
    studied: Object.fromEntries(lessons.map(([slug]) => [slug, '2026-01-01'])),
    checks: {},
    bookmarks: [],
    recent: [],
    pathway: null,
    quest,
  };
  await page.evaluate(([k, s]) => localStorage.setItem(k, JSON.stringify(s)), [KEY, state] as const);
}

const bubble = (page: Page) => page.locator('.nautilus-bubble');

test.describe('the deep page', () => {
  test('loads, describes the trial and starts with every required check waiting', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto('deep/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { level: 1, name: 'The cichlid lake' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Columns of the baseline run' })).toBeVisible();
    await expect(page.locator('#sec-worked')).toBeHidden();
    await expect(page.locator('.lt-summary')).toContainText('0 of ');
    expect(errors).toEqual([]);
  });

  test('has no serious accessibility violations, with or without the worked solution', async ({ page }) => {
    test.setTimeout(120_000);
    for (const path of ['deep/', 'deep/?solution=1']) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${path} ${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`)).toEqual([]);
    }
  });

  test('judges uploaded files by what they contain, and crowns a lake that passes', async ({ page }) => {
    test.setTimeout(90_000);
    const s = solutionSubmission();
    await page.goto('deep/');
    await page.locator('.lt-file input').nth(0).setInputFiles({ name: 'lake_run.csv', mimeType: 'text/csv', buffer: Buffer.from(s.run) });
    await page.locator('.lt-file input').nth(1).setInputFiles({ name: 'food_web.csv', mimeType: 'text/csv', buffer: Buffer.from(s.foodWeb) });
    await page.locator('.lt-file input').nth(2).setInputFiles({ name: 'lake_cascade.csv', mimeType: 'text/csv', buffer: Buffer.from(s.cascade) });
    await page.getByLabel('The food chain you followed').fill(s.chain);
    await page.getByLabel(/oxygen minimum/).fill(String(s.notes.oxygenMinDay));
    await page.getByLabel(/zooplankton maximum/).fill(String(s.notes.zooplanktonPeakDay));
    await page.getByLabel(/largest mean biomass/).selectOption(s.notes.dominantFish);
    await page.getByLabel(/Trophic level of your top predator/).fill(String(s.notes.topTrophicLevel));
    await page.getByLabel(/What the lake taught you/).fill(s.notes.interpretation);
    await expect(page.locator('.lt-summary')).toContainText('The lake lives', { timeout: 30_000 });
    await expect(page.locator('.lt-crowned')).toBeVisible();
    const quest = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)!).quest, KEY);
    expect(quest.crowned.trial).toBe('lake');
  });

  test('a lake that is too short fails with a reason, and a wrong note is not given away', async ({ page }) => {
    await page.goto('deep/');
    const rows = Array.from({ length: 100 }, (_, i) => `${i},24,8,10,8,${i % 7}`).join('\n');
    await page.locator('.lt-file input').nth(0).setInputFiles({ name: 'short.csv', mimeType: 'text/csv', buffer: Buffer.from(`day,temperature,oxygen,ph,phytoplankton,zooplankton\n${rows}`) });
    await expect(page.locator('.lt-check.is-fail', { hasText: 'The output contract' })).toContainText('Missing');
  });
});

test.describe('the way to the deep', () => {
  test('the passphrase in the atlas search opens the deep with a worked solution, which does not crown', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('atlas/');
    await page.locator('.atlas-search input, #atlas-search').first().fill('03101999');
    await expect(page).toHaveURL(/deep\/\?solution=1/);
    await expect(page.locator('#sec-worked')).toBeVisible();
    await expect(page.locator('#sec-worked')).toContainText('lake_solution');
    await page.getByRole('button', { name: 'Run the worked solution' }).click();
    await expect(page.locator('.lt-summary')).toContainText('The lake lives', { timeout: 40_000 });
    const quest = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? '{"quest":{}}').quest, KEY);
    expect(quest.crowned ?? null).toBeNull();
  });

  test('finishing every course makes the nautilus offer the quest; accepting dives to the deep', async ({ page }) => {
    test.setTimeout(60_000);
    await finishEveryCourse(page);
    await page.goto('progress/');
    await expect(bubble(page)).toBeVisible({ timeout: 15_000 });
    await expect(bubble(page)).toHaveAttribute('data-kind', 'quest');
    await expect(bubble(page).locator('.nb-text')).toContainText('optional');
    await bubble(page).getByRole('button', { name: 'Yes, take me to the deep' }).click();
    await expect(page.locator('.nautilus-root')).toHaveClass(/is-diving/);
    await page.waitForURL(/deep\//, { timeout: 15_000 });
    const quest = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)!).quest, KEY);
    expect(quest.accepted).not.toBeNull();
  });

  test('the quest can be declined, and then is not offered again', async ({ page }) => {
    test.setTimeout(60_000);
    await finishEveryCourse(page);
    await page.goto('progress/');
    await expect(bubble(page)).toHaveAttribute('data-kind', 'quest', { timeout: 15_000 });
    await bubble(page).getByRole('button', { name: 'No, thank you' }).click();
    await expect(bubble(page).locator('.nb-text')).toContainText('As you wish');
    await page.goto('about/');
    await page.waitForTimeout(3_500);
    await expect(bubble(page)).not.toHaveAttribute('data-kind', 'quest');
    const quest = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)!).quest, KEY);
    expect(quest.declined).not.toBeNull();
    await page.goto('progress/');
    await expect(page.getByText('You declined the quest; the way stays open.')).toBeVisible();
  });

  test('before the courses are done there is no offer', async ({ page }) => {
    await page.goto('progress/');
    await page.waitForTimeout(3_500);
    await expect(bubble(page)).not.toHaveAttribute('data-kind', 'quest');
    await expect(page.getByText(/Finish every course/)).toBeVisible();
  });
});

test.describe('the crown', () => {
  test('is worn on every page, and returns when the progress is imported', async ({ page }) => {
    await finishEveryCourse(page, { offered: '2026-01-01', declined: null, accepted: '2026-01-02', crowned: { trial: 'lake', date: '2026-01-03' } });
    await page.goto('learn/hello-world/');
    await expect(page.locator('.nautilus-root')).toHaveClass(/is-crowned/);
    const exported = await page.evaluate((k) => localStorage.getItem(k)!, KEY);
    // A fresh browser: clear the stored state from the page under test, not from the one just left.
    await page.goto('progress/');
    await page.evaluate((k) => localStorage.removeItem(k), KEY);
    await page.reload();
    await expect(page.locator('.nautilus-root')).not.toHaveClass(/is-crowned/);
    await page.locator('input[type="file"]').setInputFiles({ name: 'progress.json', mimeType: 'application/json', buffer: Buffer.from(exported) });
    await expect(page.getByText('Progress imported.')).toBeVisible();
    await expect(page.locator('.nautilus-root')).toHaveClass(/is-crowned/);
    await expect(page.getByText(/Crowned on 2026-01-03/)).toBeVisible();
  });

  test('a forged crown is ignored', async ({ page }) => {
    await finishEveryCourse(page, { offered: null, declined: null, accepted: null, crowned: { trial: 'everything', date: 'x' } });
    await page.goto('about/');
    await expect(page.locator('.nautilus-root')).not.toHaveClass(/is-crowned/);
  });

  test('preview: ?nautilus=crown shows the crown', async ({ page }) => {
    await page.goto('about/?nautilus=crown');
    await expect(page.locator('.nautilus-root')).toHaveClass(/is-crowned/);
  });
});

/** Advance the fake clock in small steps (so the page renders in between) until the bubble shows `kind`; returns the fake time. */
async function waitForBubble(page: Page, kind: string, maxMs = 15 * 60_000) {
  for (let t = 0; t < maxMs; t += 5_000) {
    const seen = await page.evaluate(() => {
      const b = document.querySelector<HTMLElement>('.nautilus-bubble')!;
      return b.hidden ? null : b.dataset.kind;
    });
    if (seen === kind) return page.evaluate(() => Date.now());
    await page.clock.runFor(5_000);
  }
  throw new Error(`The nautilus never showed a "${kind}" bubble`);
}

/**
 * A fake clock from a fixed moment. These tests are about what the nautilus says
 * and when, not how it swims: without animation frames, minutes of fake time pass
 * in moments. (The stub must come after the clock's own init script.)
 */
async function installClock(page: Page) {
  await page.clock.install({ time: new Date('2026-10-28T12:00:00Z') });
  await page.addInitScript(() => {
    window.requestAnimationFrame = () => 0;
  });
}

test.describe('the nautilus on the quest', () => {
  test('cheers the learner on every eight and a half minutes', async ({ page }) => {
    test.setTimeout(90_000);
    await installClock(page);
    await page.addInitScript(
      ([k, q]) => {
        localStorage.setItem(k, JSON.stringify({ version: 1, profile: null, goals: [], visited: {}, studied: {}, checks: {}, bookmarks: [], recent: [], pathway: null, quest: q }));
        localStorage.setItem('nautilus:last-spur', String(Date.parse('2026-10-28T11:50:00Z')));
        localStorage.setItem('nautilus:muted-tips', '1');
      },
      [KEY, { offered: '2026-01-01', declined: null, accepted: '2026-01-02', crowned: null }] as const,
    );
    await page.goto('about/');
    const first = await waitForBubble(page, 'spur', 60_000);
    await expect(bubble(page).locator('.nb-kind')).toHaveText('Keep going');
    await bubble(page).getByRole('button', { name: 'Thanks' }).click();
    // Seven quiet minutes, in steps so that the page renders in between.
    for (let i = 0; i < 7; i++) await page.clock.runFor(60_000);
    expect(await page.evaluate(() => document.querySelector<HTMLElement>('.nautilus-bubble')!.hidden)).toBe(true);
    const second = await waitForBubble(page, 'spur');
    // 8½ minutes between cheers, give or take the 20-second check interval.
    expect((second - first) / 60_000).toBeGreaterThanOrEqual(8.4);
    expect((second - first) / 60_000).toBeLessThan(9.2);
  });

  test('points back to the right course when the trial calls for it', async ({ page }) => {
    test.setTimeout(90_000);
    await installClock(page);
    await page.addInitScript(() => localStorage.setItem('nautilus:welcomed', JSON.stringify({ '/deep/': Date.parse('2026-10-28T11:59:00Z') })));
    await page.goto('deep/');
    await page.locator('#sec-contain').scrollIntoViewIfNeeded();
    await waitForBubble(page, 'pointer', 120_000);
    await expect(bubble(page).locator('.nb-link')).toHaveAttribute('href', /\/learn\/(runge-kutta|odes)\//);
    await expect(bubble(page).locator('.nb-link')).toContainText('Revisit');
  });

  test('points to a lesson when a check fails', async ({ page }) => {
    test.setTimeout(90_000);
    await installClock(page);
    await page.addInitScript(() => localStorage.setItem('nautilus:welcomed', JSON.stringify({ '/deep/': Date.parse('2026-10-28T11:59:00Z') })));
    await page.goto('deep/');
    const s = solutionSubmission();
    // A run whose phosphorus leaks: the budget check fails.
    const lines = s.run.split('\n');
    const col = lines[0].split(',').indexOf('total_p');
    const leaky = [lines[0], ...lines.slice(1).map((l, i) => l.split(',').map((v, k) => (k === col ? String(Number(v) * (1 - 0.00004 * i)) : v)).join(','))].join('\n');
    await page.locator('.lt-file input').nth(0).setInputFiles({ name: 'lake_run.csv', mimeType: 'text/csv', buffer: Buffer.from(leaky) });
    await expect(page.locator('.lt-check.is-fail', { hasText: 'Nutrient mass balance' })).toBeVisible();
    await waitForBubble(page, 'pointer', 120_000);
    await expect(bubble(page).locator('.nb-link')).toHaveAttribute('href', /\/learn\/verification-and-validation\//);
  });
});
