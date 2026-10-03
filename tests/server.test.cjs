'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');

test('preview server confines files to the game and accepts read-only requests', async () => {
  const port = 4198;
  const server = spawn(process.execPath, [path.join(__dirname, '..', 'serve.cjs')], {
    env: { ...process.env, FLUESTERTIDE_PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });
  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Server start timed out')), 30000);
      server.stdout.once('data', () => { clearTimeout(timeout); resolve(); });
      server.stderr.once('data', data => { clearTimeout(timeout); reject(new Error(String(data))); });
      server.once('error', error => { clearTimeout(timeout); reject(error); });
    });
    const base = `http://127.0.0.1:${port}`;
    const health = await fetch(`${base}/__health`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { app: 'fluestertide', port });
    const source = await fetch(`${base}/serve.cjs`);
    assert.equal(source.status, 403, 'server source must not be downloadable');
    const directory = await fetch(`${base}/tests/`);
    assert.equal(directory.status, 404, 'directories must not be listed');
    const traversal = await fetch(`${base}/..%2Fdie-millionenfrage.html`);
    assert.equal(traversal.status, 403, 'encoded traversal must stay inside the game');
    const backslash = await fetch(`${base}/..%5Cdie-millionenfrage.html`);
    assert.equal(backslash.status, 403, 'Windows path separators must not escape the game');
    const malformed = await fetch(`${base}/%ZZ`);
    assert.equal(malformed.status, 400);
    const missing = await fetch(`${base}/missing-asset.png`);
    assert.equal(missing.status, 404);
    const write = await fetch(`${base}/__health`, { method: 'POST', body: 'change' });
    assert.equal(write.status, 405);
    const head = await fetch(`${base}/__health`, { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
  } finally {
    server.kill();
  }
});
