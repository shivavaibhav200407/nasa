import { test, expect } from '@playwright/test';

test.describe('ASTRA Mission Lifecycle & Flow', () => {
  test('SCR-01 Landing to SCR-02 Setup to SCR-03 Dashboard flow', async ({ page }) => {
    // 1. Visit landing
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1, name: /ASTRA/i })).toBeVisible();

    // 2. Click Start Mission to go to Setup
    const startMissionBtn = page.getByRole('button', { name: /START MISSION/i }).first();
    await expect(startMissionBtn).toBeVisible();
    await startMissionBtn.click();

    // 3. Setup screen verification
    await expect(page.getByRole('heading', { name: /SET UP EXPEDITION/i })).toBeVisible();
    await expect(page.getByText(/Explorer/i).first()).toBeVisible();
    await expect(page.getByText(/Commander/i).first()).toBeVisible();

    // Select Explorer mode
    const explorerCard = page.locator('text=Explorer Guided').first();
    if (await explorerCard.isVisible()) {
      await explorerCard.click();
    }

    // Click Begin Mission
    const beginBtn = page.getByRole('button', { name: /BEGIN MISSION/i });
    await expect(beginBtn).toBeVisible();
    await beginBtn.click();

    // 4. Mission Dashboard (SCR-03)
    await expect(page.getByText(/SOL 1/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Subsystem Closed-Loop/i)).toBeVisible();
    await expect(page.getByText(/Atmospheric O2/i).first()).toBeVisible();
    await expect(page.getByText(/Potable Water/i).first()).toBeVisible();

    // 5. Navigate to Engineering (SCR-04)
    const engNavBtn = page.getByRole('button', { name: /ENGINEERING/i }).first();
    await engNavBtn.click();
    await expect(page.getByText(/Electrical Microgrid/i)).toBeVisible();

    // Return to Dashboard
    const dashNavBtn = page.getByRole('button', { name: /DASHBOARD/i }).first();
    await dashNavBtn.click();
    await expect(page.getByText(/Subsystem Closed-Loop/i)).toBeVisible();
  });

  test('Advance Day and State Mutation', async ({ page }) => {
    await page.goto('/');
    const startBtn = page.getByRole('button', { name: /START MISSION/i }).first();
    await startBtn.click();

    const beginBtn = page.getByRole('button', { name: /BEGIN MISSION/i });
    await beginBtn.click();

    // Verify Sol 1
    await expect(page.getByText(/SOL 1/i).first()).toBeVisible({ timeout: 10000 });

    // Click Advance to Day 2
    const advanceBtn = page.getByRole('button', { name: /Advance to Day 2/i });
    await expect(advanceBtn).toBeVisible();
    await advanceBtn.click();

    // Check Sol 2 reached
    await expect(page.getByText(/SOL 2/i).first()).toBeVisible({ timeout: 15000 });
  });

  test('Mission State Persistence Across Page Reload', async ({ page }) => {
    await page.goto('/');
    const startBtn = page.getByRole('button', { name: /START MISSION/i }).first();
    await startBtn.click();

    const beginBtn = page.getByRole('button', { name: /BEGIN MISSION/i });
    await beginBtn.click();

    await expect(page.getByText(/SOL 1/i).first()).toBeVisible({ timeout: 10000 });

    // Advance to Sol 2
    const advanceBtn = page.getByRole('button', { name: /Advance to Day 2/i });
    await advanceBtn.click();
    await expect(page.getByText(/SOL 2/i).first()).toBeVisible({ timeout: 15000 });

    // Reload page
    await page.reload();

    // Verify mission state persists at Sol 2
    await expect(page.getByText(/SOL 2/i).first()).toBeVisible({ timeout: 10000 });
  });
});
