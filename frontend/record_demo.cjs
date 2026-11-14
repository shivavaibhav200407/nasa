const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function recordDemo() {
  const outputDir = path.resolve('c:/Users/Vaibhav/nasa/demo_video');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Recording 28-second NASA Space Apps Challenge demonstration video...');
  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    recordVideo: {
      dir: outputDir,
      size: { width: 1280, height: 720 },
    },
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();

  try {
    // 1. (0.0s - 4.0s): Landing Screen & Horizon Arc
    console.log('[00:00 - 00:04] 1. Overview & Landing Screen');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.mouse.move(640, 360, { steps: 5 });
    await page.waitForTimeout(2500);

    // 2. (4.0s - 8.0s): Expedition Setup
    console.log('[00:04 - 00:08] 2. Expedition Setup & Role Selection');
    const startBtn = page.locator('button:has-text("START MISSION"), button:has-text("NEW EXPEDITION"), button:has-text("RESUME MISSION")').first();
    if (await startBtn.isVisible()) {
      await startBtn.click();
      await page.waitForTimeout(1000);
    }
    const beginBtn = page.locator('button:has-text("BEGIN MISSION"), button:has-text("LAUNCH MISSION"), button:has-text("LAUNCH EXPEDITION")').first();
    if (await beginBtn.isVisible()) {
      await page.mouse.move(640, 480, { steps: 5 });
      await page.waitForTimeout(1000);
      await beginBtn.click();
      await page.waitForTimeout(1500);
    } else {
      await page.waitForTimeout(2500);
    }

    // 3. (8.0s - 14.0s): Mission Control Center & 6 ECLSS Loops
    console.log('[00:08 - 00:14] 3. Mission Control Dashboard Telemetry');
    await page.waitForTimeout(1000);
    await page.mouse.move(300, 220, { steps: 5 });
    await page.waitForTimeout(1500);
    await page.mouse.move(640, 320, { steps: 5 }); // Isometric Outpost
    await page.waitForTimeout(1500);
    await page.mouse.move(960, 220, { steps: 5 }); // Crew cards
    await page.waitForTimeout(1500);

    // 4. (14.0s - 19.0s): Advance Sol (Physics Engine Calculation)
    console.log('[00:14 - 00:19] 4. Advancing Sol & Physics Calculation');
    const advanceBtn = page.locator('button:has-text("Advance to Day"), button:has-text("Advance Sol"), button:has-text("Advance Day")').first();
    if (await advanceBtn.isVisible()) {
      await advanceBtn.hover();
      await page.waitForTimeout(500);
      await advanceBtn.click();
      await page.waitForTimeout(3500);
    } else {
      await page.waitForTimeout(4000);
    }

    // 5. (19.0s - 24.0s): Engineering Reallocation Console
    console.log('[00:19 - 00:24] 5. Engineering Console & Microgrid');
    const engBtn = page.locator('button:has-text("Engineering")').first();
    if (await engBtn.isVisible()) {
      await engBtn.click();
      await page.waitForTimeout(1200);
      await page.mouse.move(450, 380, { steps: 5 });
      await page.waitForTimeout(1500);
      await page.mouse.move(800, 420, { steps: 5 });
      await page.waitForTimeout(1500);
    } else {
      await page.waitForTimeout(4000);
    }

    // 6. (24.0s - 28.0s): Astronaut Flight Manual Modal
    console.log('[00:24 - 00:28] 6. Astronaut Flight Manual Modal');
    const manualBtn = page.locator('button:has-text("Flight Manual")').first();
    if (await manualBtn.isVisible()) {
      await manualBtn.click();
      await page.waitForTimeout(3500);
    } else {
      await page.waitForTimeout(3500);
    }

    console.log('[00:28] Demo capture sequence completed in exactly 28 seconds!');
  } catch (err) {
    console.error('Error during recording:', err);
  } finally {
    const video = page.video();
    await page.close();
    await context.close();
    await browser.close();

    if (video) {
      const videoPath = await video.path();
      const targetPath = path.resolve(outputDir, 'ASTRA_30s_SpaceApps_Demo.webm');
      fs.copyFileSync(videoPath, targetPath);
      console.log(`Video saved to: ${targetPath}`);
    }
  }
}

recordDemo();
