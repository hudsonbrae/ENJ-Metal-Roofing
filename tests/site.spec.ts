import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = [
  '/',
  '/services/',
  '/services/re-roofing/',
  '/projects/',
  '/projects/rural-hip-roof/',
  '/projects/suburban-home/',
  '/projects/estate-new-home/',
  '/about/',
  '/contact/',
  '/contact/thank-you/',
  '/contact/not-sent/',
  '/privacy/',
];

const widths = [360, 390, 768, 1024, 1280, 1440, 1920];

async function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  page.on('pageerror', (err) => errors.push(err.message));
  return errors;
}

test.describe('every page', () => {
  for (const path of pages) {
    test(`${path} renders cleanly at every width`, async ({ page }) => {
      const errors = await trackErrors(page);
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      for (const width of widths) {
        await page.setViewportSize({ width, height: 900 });
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(0);
      }
      expect(errors).toEqual([]);
    });

    test(`${path} has no serious accessibility violations`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
    });
  }
});

test.describe('home hero', () => {
  for (const [width, height] of [[390, 844], [1280, 720], [1440, 900], [1920, 1080]] as const) {
    test(`quote button is above the fold at ${width}x${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      const box = await page.locator('.hero').getByRole('link', { name: 'Get a free quote' }).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.y + box!.height).toBeLessThanOrEqual(height);
    });
  }
});

test('mobile menu opens, traps focus and closes with Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const opener = page.getByRole('button', { name: 'Menu' });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: 'Site menu' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test('mobile action bar reveals every contact option', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.mouse.wheel(0, 2000);
  const toggle = page.getByRole('button', { name: 'Contact us' });
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const panel = page.locator('#contact-panel');
  await expect(panel.getByRole('link', { name: /Call John/ })).toBeVisible();
  await expect(panel.getByRole('link', { name: /Call Ethan/ })).toBeVisible();
  await expect(panel.getByRole('link', { name: /Email/ })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
});

test.describe('quote form', () => {
  test('an empty submission shows inline errors and focuses the first', async ({ page }) => {
    await page.goto('/contact/');
    await page.locator('[data-submit]').click();
    await expect(page.locator('[data-error-for]:not(.hidden)')).toHaveCount(4);
    await expect(page.locator('#name')).toBeFocused();
    await expect(page.locator('#phone')).toHaveAttribute('aria-invalid', 'true');
  });

  test('a valid submission lands on the thank-you page', async ({ page }) => {
    await page.goto('/contact/');
    await page.fill('#name', 'Automated Test');
    await page.fill('#phone', '0400 000 000');
    await page.fill('#suburb', 'Test suburb');
    await page.selectOption('#workType', { index: 1 });
    // The endpoint ignores submissions made faster than a person could type.
    await page.waitForTimeout(3100);
    await page.locator('[data-submit]').click();
    await page.waitForURL('**/contact/thank-you/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('John and Ethan');
  });
});

test('project gallery opens a lightbox that steps through photos', async ({ page }) => {
  await page.goto('/projects/');
  await page.locator('[data-gallery] [data-open]').first().click();
  const viewer = page.getByRole('dialog', { name: 'Photo viewer' });
  await expect(viewer).toBeVisible();
  const counter = viewer.locator('[data-counter]');
  await expect(counter).toHaveText(/^1 of \d+$/);
  await page.keyboard.press('ArrowRight');
  await expect(counter).toHaveText(/^2 of \d+$/);
  await page.keyboard.press('Escape');
  await expect(viewer).toBeHidden();
});
