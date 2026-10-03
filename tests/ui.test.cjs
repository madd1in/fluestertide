'use strict';

// Browser integration test. Uses the existing local Playwright installation.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const { chromium } = require('../../game-design-toolbox/node_modules/playwright');

const screenshotRoot = path.join(__dirname, '..', 'screenshots');
fs.mkdirSync(screenshotRoot, { recursive: true });

test('desktop and mobile UI, save/reload, puzzle inputs, and complete finale', { timeout: 600000 }, async () => {
  const server = spawn(process.execPath, [path.join(__dirname, '..', 'serve.cjs')], {
    env: { ...process.env, FLUESTERTIDE_PORT: '4199' }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let browser;
  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Server start timed out')), 30000);
      server.stdout.once('data', () => { clearTimeout(timeout); resolve(); });
      server.stderr.once('data', data => { clearTimeout(timeout); reject(new Error(String(data))); });
      server.once('error', error => { clearTimeout(timeout); reject(error); });
    });
    try { browser = await chromium.launch({ headless: true }); }
    catch { browser = await chromium.launch({ headless: true, channel: 'msedge' }); }
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const failures = [];
    page.on('pageerror', error => failures.push(error.message));
    page.on('requestfailed', request => failures.push(`${request.url()} ${request.failure()?.errorText}`));
    page.on('response', response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`); });
    await page.goto('http://127.0.0.1:4199', { waitUntil: 'networkidle' });
    assert.equal(await page.title(), 'Flüstertide — Ein Piratenabenteuer');
    assert.equal(await page.locator('#titleScreen').isVisible(), true);
    await page.screenshot({ path: path.join(screenshotRoot, 'desktop-cover.png'), fullPage: true });
    await page.locator('#helpBtn').click();
    assert.match(await page.locator('#modalTitle').textContent(), /Anfang/);
    await page.keyboard.press('Escape');
    await page.locator('#startBtn').click();

    async function drain() {
      for (let i = 0; i < 25 && await page.locator('#conversation').isVisible(); i++) {
        if (await page.locator('#choices button').count()) return;
        await page.locator('#nextLine').click();
      }
    }
    const state = () => page.evaluate(() => window.Fluestertide.getState());
    async function verb(id) {
      const button = page.locator(`[data-verb="${id}"]`);
      if (await button.getAttribute('aria-pressed') !== 'true') await button.click();
    }
    async function act(action, target) {
      await verb(action);
      await page.locator(`[data-target="${target}"]`).click();
      await drain();
    }
    async function walk(scene) {
      await page.locator('#mapBtn').click();
      const destination = page.locator(`[data-scene="${scene}"]`);
      assert.equal(await destination.isEnabled(), true, `${scene} map destination is reachable`);
      await destination.click();
      await drain();
      assert.equal((await state()).scene, scene);
    }
    async function use(item, target) {
      await page.locator(`[data-item="${item}"]`).click();
      await page.locator(`[data-target="${target}"]`).click();
      await drain();
    }
    async function choose(id) {
      await page.locator(`[data-choice="${id}"]`).click();
      await drain();
    }
    async function combine(first, second) {
      await page.locator(`[data-item="${first}"]`).click();
      await page.locator(`[data-item="${second}"]`).click();
      await drain();
    }

    await drain();
    assert.equal(await page.locator('#titleScreen').isVisible(), false);
    await page.locator('#revealBtn').click();
    assert.equal(await page.locator('#revealBtn').getAttribute('aria-pressed'), 'true');
    await act('take', 'rope');
    await act('take', 'bottle');
    assert.equal(await page.locator('#inventory [data-item]').count(), 2);
    await page.screenshot({ path: path.join(screenshotRoot, 'desktop-harbor.png'), fullPage: true });

    // The focused hotspot must not restart a conversation when Enter is pressed.
    await verb('talk');
    await page.locator('[data-target="ferryman"]').click();
    const firstLine = await page.locator('#dialogText').textContent();
    await page.keyboard.press('Enter');
    assert.notEqual(await page.locator('#dialogText').textContent(), firstLine);
    await drain();

    await page.locator('#hintBtn').click();
    const firstHint = await page.locator('.hint-text').textContent();
    await page.getByRole('button', { name: 'Etwas deutlicher, bitte' }).click();
    const secondHint = await page.locator('.hint-text').textContent();
    assert.notEqual(firstHint, secondHint);
    await page.getByRole('button', { name: 'Etwas deutlicher, bitte' }).click();
    assert.notEqual(secondHint, await page.locator('.hint-text').textContent());
    await page.locator('#closeModal').click();

    await walk('tavern');
    await act('talk', 'bartender');
    await page.screenshot({ path: path.join(screenshotRoot, 'desktop-tavern.png'), fullPage: true });
    await walk('bazaar');
    await act('take', 'fruit');
    await use('fruit', 'parrot');
    await use('bottle', 'merchant');
    await walk('tavern');
    await use('rhyme', 'bartender');
    await act('talk', 'pirate');
    await choose('duel_begin');
    await choose('duel_0_bucket');
    assert.equal((await state()).flags.duelStage, 0);
    await choose('duel_0_moor');
    await choose('duel_1_echo');
    await choose('duel_2_idea');
    assert.equal((await state()).flags.duelWon, true);
    const savedBeforeReload = await state();
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('#continueBtn').isVisible(), true);
    await page.locator('#continueBtn').click();
    await drain();
    assert.deepEqual(await state(), savedBeforeReload);

    await walk('lighthouse');
    await use('candle', 'mechanism');
    await use('prism', 'lens');
    await act('talk', 'keeper');
    await walk('lagoon');
    await page.screenshot({ path: path.join(screenshotRoot, 'desktop-lagoon.png'), fullPage: true });
    await act('take', 'shell');
    await use('mug', 'spring');
    await use('compass', 'gate');
    assert.equal((await state()).scene, 'wreck');
    await use('water', 'ghost');
    await act('take', 'chest');
    await combine('rope', 'shell');
    await combine('fork', 'pendulum');
    assert.equal(await page.locator('[data-item="instrument"]').isVisible(), true);
    await walk('vault');
    await use('instrument', 'altar');
    await choose('tone_wind');
    assert.equal((await state()).flags.harmonyStep, 0);
    await choose('tone_sea');
    await choose('tone_wind');
    await choose('tone_heart');
    await use('instrument', 'bell');
    await choose('finale_gently');
    assert.equal((await state()).finished, true);
    assert.equal(await page.locator('#ending').isVisible(), true);
    await page.screenshot({ path: path.join(screenshotRoot, 'desktop-ending.png'), fullPage: true });
    await page.locator('#endingJournal').click();
    assert.match(await page.locator('.journal-objective').textContent(), /VOLLENDET/);
    await page.locator('#closeModal').click();

    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    const mobile = await mobileContext.newPage();
    mobile.on('pageerror', error => failures.push(error.message));
    await mobile.goto('http://127.0.0.1:4199', { waitUntil: 'networkidle' });
    await mobile.screenshot({ path: path.join(screenshotRoot, 'mobile-cover.png'), fullPage: true });
    const layout = await mobile.evaluate(() => ({ width: innerWidth, contentWidth: document.documentElement.scrollWidth }));
    assert.ok(layout.contentWidth <= layout.width + 1, 'mobile page has no horizontal scrolling');
    await mobile.locator('#startBtn').tap();
    await mobile.keyboard.press('Escape');
    await mobile.locator('#revealBtn').tap();
    await mobile.screenshot({ path: path.join(screenshotRoot, 'mobile-harbor.png'), fullPage: true });
    await mobile.locator('[data-verb="take"]').tap();
    await mobile.locator('[data-target="rope"]').tap();
    assert.equal(await mobile.locator('[data-item="rope"]').isVisible(), true);
    assert.deepEqual(failures, [], 'no browser errors or failed assets');
    console.log('UI verified: desktop finale, save/reload, keyboard, hints, mobile touch, 0 browser errors.');
    await mobileContext.close();
    await context.close();
  } finally {
    if (browser) await browser.close();
    server.kill();
  }
});
