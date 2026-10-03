'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('../../game-design-toolbox/node_modules/playwright');

(async () => {
  let browser;
  try {
    try { browser = await chromium.launch({ headless: true }); }
    catch { browser = await chromium.launch({ headless: true, channel: 'msedge' }); }
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('requestfailed', request => errors.push(`${request.url()} ${request.failure()?.errorText}`));
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    await page.goto('http://127.0.0.1:4187', { waitUntil: 'networkidle' });
    assert.equal(await page.locator('#titleScreen').isVisible(), true);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    await page.locator('#startBtn').tap();
    await page.keyboard.press('Escape');
    await page.locator('[data-verb="take"]').tap();
    await page.locator('[data-target="rope"]').tap();
    assert.equal(await page.locator('[data-item="rope"]').isVisible(), true);
    assert.deepEqual(await page.evaluate(() => window.Fluestertide.getState().inventory), ['rope']);
    assert.deepEqual(errors, []);
    console.log('PASS: mobile layout, touch inventory, start dialog, 0 browser errors/failed assets.');
    await context.close();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
  }
})();
