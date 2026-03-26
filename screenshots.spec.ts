import { test } from '@playwright/test';
import path from 'path';

const OUTPUT_DIR = path.join(__dirname, 'store-screenshots');
const SITE = 'https://promptai360.com';

// Chrome Web Store: 1280x800
const VIEWPORT = { width: 1280, height: 800 };

test.use({ viewport: VIEWPORT });

test('homepage', async ({ page }) => {
  await page.goto(SITE, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '1-homepage.png'), fullPage: false });
});

test('demo page', async ({ page }) => {
  await page.goto(`${SITE}/demo`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '2-demo.png'), fullPage: false });
});

test('pricing page', async ({ page }) => {
  await page.goto(`${SITE}/pricing`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '3-pricing.png'), fullPage: false });
});

test('login page', async ({ page }) => {
  await page.goto(`${SITE}/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '4-login.png'), fullPage: false });
});

test('signup page', async ({ page }) => {
  await page.goto(`${SITE}/signup`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '5-signup.png'), fullPage: false });
});
