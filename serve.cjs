'use strict';

// Local preview only: no dependencies, directory listings, or external binding.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = fs.realpathSync(__dirname);
const host = '127.0.0.1';
const port = Number(process.env.FLUESTERTIDE_PORT || 4187);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
};

function insideRoot(file) {
  const relative = path.relative(root, file);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function reply(res, status, message) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(message);
}

const server = http.createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return reply(res, 405, 'Methode nicht erlaubt.');
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, `http://${host}:${port}`).pathname);
  } catch {
    return reply(res, 400, 'Ungültige Adresse.');
  }
  if (pathname === '/__health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(req.method === 'HEAD' ? undefined : JSON.stringify({ app: 'fluestertide', port }));
  }
  if (pathname.includes('\0')) return reply(res, 400, 'Ungültige Adresse.');
  if (pathname === '/') pathname = '/index.html';
  const filename = path.resolve(root, `.${pathname}`);
  if (!insideRoot(filename)) return reply(res, 403, 'Zugriff verweigert.');

  try {
    // Resolve symlinks as well, so a file outside the game cannot be served.
    const realFile = await fs.promises.realpath(filename);
    if (!insideRoot(realFile)) return reply(res, 403, 'Zugriff verweigert.');
    const stat = await fs.promises.stat(realFile);
    if (!stat.isFile()) return reply(res, 404, 'Datei nicht gefunden.');
    const extension = path.extname(realFile).toLowerCase();
    if (!mime[extension]) return reply(res, 403, 'Dieser Dateityp ist nicht freigegeben.');
    res.writeHead(200, {
      'Content-Type': mime[extension],
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    if (req.method === 'HEAD') return res.end();
    const stream = fs.createReadStream(realFile);
    stream.on('error', () => res.destroy());
    stream.pipe(res);
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return reply(res, 404, 'Datei nicht gefunden.');
    reply(res, 500, 'Die Datei konnte nicht geladen werden.');
  }
});

server.on('error', (error) => {
  console.error(error.code === 'EADDRINUSE'
    ? `Port ${port} ist belegt. Ein laufendes Spiel ist unter http://${host}:${port} erreichbar.`
    : error.message);
  process.exitCode = 1;
});
server.listen(port, host, () => console.log(`Flüstertide läuft: http://${host}:${port}`));
