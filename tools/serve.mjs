/**
 * Mini serveur statique sans dépendance, pour lancer le jeu en local :
 *   npm start   puis ouvrir http://localhost:8080
 * (Nécessaire car les modules ES ne se chargent pas depuis file://)
 */
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

// fileURLToPath (et non `.pathname`) est indispensable sous Windows : une URL
// de fichier donne un pathname du type "/C:/Users/..." que fs ne sait pas lire.
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PORT = process.env.PORT || 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

http.createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (path.endsWith('/')) path += 'index.html';
    const file = normalize(join(ROOT, path));
    if (!file.startsWith(normalize(ROOT))) throw new Error('forbidden');
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': MIME[extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch (e) {
    if (e.code !== 'ENOENT') console.error(`[serve] ${req.url} :`, e.message);
    res.writeHead(404);
    res.end('404');
  }
}).listen(PORT, () => {
  console.log(`DraughtsQuest : http://localhost:${PORT}  (racine : ${ROOT})`);
});
