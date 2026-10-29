// Local build audit server: compressed text assets, no application/API execution.
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const zlib = require('node:zlib');
const root = path.resolve(process.argv[2] || 'dist');
const port = Number(process.argv[3] || 4394);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid local audit port');
const compressed = new Map();
const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
http.createServer((request, response) => {
  let file;
  try { file = path.resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname)); }
  catch { response.writeHead(400).end(); return; }
  if (file !== root && !file.startsWith(root + path.sep)) { response.writeHead(404).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { response.writeHead(404).end(); return; }
  const extension = path.extname(file);
  response.setHeader('Content-Type', types[extension] || 'application/octet-stream');
  response.setHeader('Cache-Control', file.includes(path.sep + '_astro' + path.sep) ? 'public,max-age=31536000,immutable' : 'no-cache');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  if (/\.(html|css|js|svg)$/.test(extension) && request.headers['accept-encoding']?.includes('gzip')) {
    const stamp = fs.statSync(file).mtimeMs;
    let cached = compressed.get(file);
    if (!cached || cached.stamp !== stamp) { cached = { stamp, bytes: zlib.gzipSync(fs.readFileSync(file)) }; compressed.set(file, cached); }
    response.setHeader('Content-Encoding', 'gzip');
    response.setHeader('Vary', 'Accept-Encoding');
    response.end(cached.bytes);
  } else fs.createReadStream(file).pipe(response);
}).listen(port, '127.0.0.1', () => console.log(`Audit build: http://127.0.0.1:${port}/`));
