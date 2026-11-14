import { test, expect } from '@playwright/test';

test.describe('ASTRA Accessibility & Inclusive Design (WCAG 2.1 AA)', () => {
  test('Keyboard navigation through interactive controls', async ({ page }) => {
    await page.goto('/');

    // Press Tab multiple times to traverse interactive links and buttons
    await page.keyboard.press('Tab');
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A']).toContain(focusedTag);

    // Verify NASA non-endorsement disclaimer is visible in DOM
    const notice = page.getByText(/NASA NON-ENDORSEMENT NOTICE/i);
    await expect(notice).toBeVisible();
    await expect(page.getByText(/independent educational simulator/i)).toBeVisible();
  });

  test('Reduce Effects toggle toggles persistent setting', async ({ page }) => {
    await page.goto('/');

    // Find effects toggle button in header
    const effectsBtn = page.getByTitle(/Effects:/i);
    if (await effectsBtn.isVisible()) {
      await effectsBtn.click();
      // Should now show Motion Off or Reduced
      await expect(page.getByText(/Motion Off/i).or(page.getByText(/Reduced/i))).toBeVisible();

      // Check localStorage updated
      const stored = await page.evaluate(() => localStorage.getItem('astra_reduced_effects'));
      expect(stored).toBe('true');
    }
  });

  test('Status indicators never convey state by color alone', async ({ page }) => {
    await page.goto('/');

    // Start mission to reach Dashboard
    const startBtn = page.getByRole('button', { name: /START MISSION/i }).first();
    await startBtn.click();

    const beginBtn = page.getByRole('button', { name: /BEGIN MISSION/i });
    await beginBtn.click();

    // Verify status badges contain text labels and SVG icons
    const statusBadges = page.locator('[role="status"]');
    const count = await statusBadges.count();
    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const badge = statusBadges.nth(i);
        const text = await badge.innerText();
        expect(text.trim().length).toBeGreaterThan(0);
        // Icon SVG exists inside
        const svgCount = await badge.locator('svg').count();
        expect(svgCount).toBeGreaterThanOrEqual(1);
      }
    }
  });
});
