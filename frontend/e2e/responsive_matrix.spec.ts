import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'Mobile (360x640)', width: 360, height: 640 },
  { name: 'Tablet (768x1024)', width: 768, height: 1024 },
  { name: 'Laptop (1280x720)', width: 1280, height: 720 },
  { name: 'Desktop (1920x1080)', width: 1920, height: 1080 },
];

for (const vp of viewports) {
  test.describe(`Viewport: ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('Landing and Setup responsive layouts have no horizontal overflow', async ({ page }) => {
      await page.goto('/');

      // Check no horizontal scrollbar on body
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // 2px margin of error for rounding

      // Verify primary action button is visible and clickable
      const startBtn = page.getByRole('button', { name: /START MISSION/i }).first();
      await expect(startBtn).toBeVisible();

      // Navigate to Setup
      await startBtn.click();
      await expect(page.getByRole('heading', { name: /SET UP EXPEDITION/i })).toBeVisible();

      // Verify setup screen also has no horizontal overflow
      const setupScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const setupClientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(setupScrollWidth).toBeLessThanOrEqual(setupClientWidth + 2);

      // Verify Begin Mission button is visible
      const beginBtn = page.getByRole('button', { name: /BEGIN MISSION/i });
      await expect(beginBtn).toBeVisible();
    });
  });
}
