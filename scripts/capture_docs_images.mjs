import { chromium } from '../frontend/node_modules/@playwright/test/index.mjs';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('docs/images');
const ARTIFACT_DIR = 'C:/Users/Vaibhav/.gemini/antigravity/brain/94b380f2-5a96-4c5d-93c8-c2cbe36bf968';

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function capture() {
  console.log('Launching browser to capture docs screenshots...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  // 1. SCR-01 Landing Page
  console.log('Capturing SCR-01 Landing Page...');
  await page.goto('http://127.0.0.1:5173/');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, 'scr01_landing_hero.png') });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'scr01_landing_hero.png') });

  // 2. SCR-02 Setup Screen
  console.log('Capturing SCR-02 Mission Setup...');
  const startBtn = page.getByRole('button', { name: /START MISSION/i }).first();
  await startBtn.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, 'scr02_mission_setup.png') });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'scr02_mission_setup.png') });

  // 3. SCR-03 Mission Dashboard
  console.log('Capturing SCR-03 Mission Dashboard...');
  const beginBtn = page.getByRole('button', { name: /BEGIN MISSION/i });
  await beginBtn.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT_DIR, 'scr03_mission_dashboard.png') });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'scr03_mission_dashboard.png') });

  // 4. SCR-04 Engineering Console
  console.log('Capturing SCR-04 Engineering Console...');
  const engBtn = page.getByRole('button', { name: /ENGINEERING/i }).first();
  await engBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT_DIR, 'scr04_engineering_console.png') });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'scr04_engineering_console.png') });

  // 5. SCR-05 Events Page
  console.log('Capturing SCR-05 Events Page...');
  await page.goto('http://127.0.0.1:5173/#mission=bfb83b81-c7d6-4619-93be-0b520cbc4785');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT_DIR, 'scr05_events_emergency.png') });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'scr05_events_emergency.png') });

  // 6. SCR-06 Mission Report
  console.log('Capturing SCR-06 Mission Report...');
  await page.goto('http://127.0.0.1:5173/#report=4bd034a3-858e-4146-bfa9-e6eca30d2419');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT_DIR, 'scr06_mission_report.png') });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'scr06_mission_report.png') });

  // 7. Styleguide Screen
  console.log('Capturing Component Styleguide...');
  await page.goto('http://127.0.0.1:5173/#styleguide');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT_DIR, 'styleguide_showcase.png') });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'styleguide_showcase.png') });

  await browser.close();
  console.log('All screenshots successfully captured into docs/images and artifacts directory!');
}

capture().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
