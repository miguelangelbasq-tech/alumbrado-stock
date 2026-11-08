/* r3dkit · render 3D «de catálogo» de las piezas del pañol (three.js en Chromium headless con WebGL por SwiftShader).
 *
 * Uso desde Node (en esta carpeta):
 *   const kit = require('./r3dkit');
 *   const r = await kit.render({ escena: 'escenas/bpn_fila.mjs', salida: 'out/bpn_fila.png', ancho: 2400, alto: 1800, ss: 2, params: {} });
 *   // r = { png, anclas: { nombre: [px, py] }, ms }   (px, py en píxeles del PNG de salida)
 *   await kit.cerrar();
 * o por consola:  node r3dkit.js escenas/bpn_fila.mjs out/bpn_fila.png 2400 1800
 *
 * La escena es un módulo ES que exporta  `export default function (R, params) { ... }`  y usa la librería `lib/r3d.mjs`
 * (R = materiales, perfiles extruidos, cilindros, tornillos, textos, cortes CSG, anclas). Ver README.md.
 * Además del PNG se guarda <salida>.json con las anclas proyectadas (para que los globos del SVG apunten exacto).
 */
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const RAIZ = __dirname;
const MIME = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.html': 'text/html', '.png': 'image/png' };
let srv = null, port = 0, browser = null;

function servidor() {
  if (srv) return Promise.resolve();
  return new Promise(ok => {
    srv = http.createServer((q, s) => {
      const u = decodeURIComponent(q.url.split('?')[0]);
      if (u === '/r3d.html') { s.writeHead(200, { 'content-type': 'text/html' }); return s.end(PAGINA); }
      const f = path.join(RAIZ, u);
      if (!f.startsWith(RAIZ) || !fs.existsSync(f)) { s.writeHead(404); return s.end('no'); }
      s.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(s);
    }).listen(0, '127.0.0.1', () => { port = srv.address().port; ok(); });
  });
}
const NM = '/node_modules/';
const PAGINA = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#fff}</style>
<script type="importmap">{"imports":{
 "three":"${NM}three/build/three.module.js","three/addons/":"${NM}three/examples/jsm/",
 "three-mesh-bvh":"${NM}three-mesh-bvh/src/index.js","three-bvh-csg":"${NM}three-bvh-csg/src/index.js",
 "polygon-clipping":"${NM}polygon-clipping/dist/polygon-clipping.esm.js","splaytree":"${NM}splaytree/dist/splaytree.js",
 "robust-predicates":"${NM}robust-predicates/index.js"}}</script></head><body>
<script type="module">
import { crear } from '/lib/r3d.mjs';
window.__render = async (op) => {
  const R = await crear(op);
  const mod = await import(op.escena + '?t=' + Date.now());
  await mod.default(R, op.params || {});
  return R.render();
};
window.__listo = true;
</script></body></html>`;

async function render(op) {
  await servidor();
  if (!browser) browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  const logs = [];
  page.on('console', m => logs.push(m.text())); page.on('pageerror', e => logs.push('ERROR ' + e.message));
  await page.goto(`http://127.0.0.1:${port}/r3d.html`);
  await page.waitForFunction(() => window.__listo);
  const t0 = Date.now();
  const o = { ancho: 2400, alto: 1800, ss: 2, ...op, escena: '/' + op.escena.replace(/^\//, '') };
  let r;
  try { r = await page.evaluate(x => window.__render(x), o); }
  catch (e) { console.error(logs.join('\n')); throw e; }
  const ms = Date.now() - t0;
  const b64 = r.png.replace(/^data:image\/png;base64,/, '');
  if (op.salida) {
    fs.mkdirSync(path.dirname(path.resolve(RAIZ, op.salida)), { recursive: true });
    fs.writeFileSync(path.resolve(RAIZ, op.salida), Buffer.from(b64, 'base64'));
    fs.writeFileSync(path.resolve(RAIZ, op.salida) + '.json', JSON.stringify({ ancho: o.ancho, alto: o.alto, anclas: r.anclas, ms, info: r.info }, null, 1));
  }
  if (logs.length && op.verLogs) console.log(logs.join('\n'));
  await page.close();
  return { png: op.salida, anclas: r.anclas, ms, info: r.info };
}
async function cerrar() { if (browser) await browser.close(); browser = null; if (srv) srv.close(); srv = null; }
module.exports = { render, cerrar };

if (require.main === module) {
  (async () => {
    const [esc, sal, w, h, ss] = process.argv.slice(2);
    const r = await render({ escena: esc, salida: sal, ancho: +(w || 2400), alto: +(h || 1800), ss: +(ss || 2), verLogs: true });
    console.log(sal, Object.keys(r.anclas).length, 'anclas', r.ms, 'ms'); await cerrar();
  })().catch(e => { console.error(e); process.exit(1); });
}
