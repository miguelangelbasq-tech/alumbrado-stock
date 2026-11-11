// Graba la v147 REAL en el celu (390×844, dpr 2) con el movimiento prendido, como la maqueta maq_mov/B.mp4.
// Uso: TZ=America/Argentina/Cordoba APP=.../v147/fijo/index.html APPDIR=.../v147/fijo node grabar147.js SALIDA_DIR
const fs = require('fs'), path = require('path');
const T = '/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/t';
const { abrir } = require(T + '/h');
const { datosOfi } = require(T + '/../maq_mov/datos');
const SAL = process.argv[2]; const VID = path.join(SAL, 'vid'); fs.rmSync(VID, { recursive: true, force: true }); fs.mkdirSync(VID, { recursive: true });
(async () => {
  const antes = () => {
    try { localStorage.setItem('ema.nav.guardada', '0'); } catch (e) { }
    window.__dedo = true;
    document.addEventListener('DOMContentLoaded', () => {
      const s = document.createElement('style'); s.textContent = '#avToast,#iaFab{display:none!important}#vtDedo{position:fixed;left:0;top:0;width:52px;height:52px;margin:-26px 0 0 -26px;border-radius:50%;background:rgba(40,40,94,.38);border:2px solid rgba(255,255,255,.9);z-index:99999;pointer-events:none;opacity:0;transition:opacity .18s}#vtDedo.on{opacity:1}'; document.head.appendChild(s);
      const d = document.createElement('div'); d.id = 'vtDedo'; document.body.appendChild(d);
      document.addEventListener('pointerdown', (e) => { d.style.transform = `translate(${e.clientX}px,${e.clientY}px) scale(.82)`; d.classList.add('on'); }, true);
      document.addEventListener('pointerup', () => setTimeout(() => d.classList.remove('on'), 140), true);
    });
  };
  const A = await abrir({ sesion: 'lucia', datos: datosOfi(), inicio: true, porPartes: true, ofPasos: true, tarjetas: true, nav: true, mov: true, espera: 4500, cel: true, dpr: 2, antes });
  const p = A.page, m = p.mouse;
  await p.evaluate(() => { window.mostrarVista('inicio'); window.scrollTo(0, 0); });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(2200);
  const cdp = await A.ctx.newCDPSession(p), cuadros = [];
  cdp.on('Page.screencastFrame', (f) => { cuadros.push({ t: f.metadata.timestamp, d: f.data }); cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => { }); });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 88, maxWidth: 780, maxHeight: 1688, everyNthFrame: 1 });
  await p.waitForTimeout(400);
  const tIni = Date.now(), marcas = [], espera = (ms) => p.waitForTimeout(ms), marca = (n) => marcas.push({ n, t: (Date.now() - tIni) / 1000 });
  const centro = async (loc) => { for (let i = 0; i < 30; i++) { const n = await loc.count(); for (let k = 0; k < n; k++) { const b = await loc.nth(k).boundingBox().catch(() => null); if (b && b.width) return [b.x + b.width / 2, b.y + b.height / 2]; } await espera(100); } throw new Error('no está: ' + loc); };
  async function tocar(loc, n) { const [x, y] = await centro(loc); await m.move(x, y); await espera(60); await m.down(); await espera(110); marca(n); await m.up(); }
  const nav = (k) => p.locator(`#navN1 [data-n1="${k}"]`), sub = (id, s) => p.locator(`#${id} .subtab[data-sub="${s}"]`);
  await espera(900);
  await tocar(nav('obras'), 'Inicio → Obras'); await espera(1300);
  await tocar(p.locator('#obrasApp [data-lgabrir]', { hasText: 'PLAZA DEL SOL' }), 'Obras → legajo'); await espera(1500);
  await tocar(p.locator('#obrasApp [data-lgvolver]'), 'legajo ← volver'); await espera(1200);
  await tocar(nav('ordenes'), 'Obras → Órdenes'); await espera(1200);
  await tocar(sub('subtabsOrdenes', 'seguimiento'), 'Tablero → Seguimiento'); await espera(1300);
  await tocar(sub('subtabsOrdenes', 'tablero'), 'Seguimiento → Tablero'); await espera(1000);
  await tocar(nav('panol'), 'Órdenes → Pañol'); await espera(1200);
  const pf = p.locator('#viewStock .pf-link[data-cod]');
  if (await pf.count()) { await tocar(pf, 'ficha sube'); await espera(1300); await tocar(p.locator('#pfModal [data-pf="cerrar"]'), 'ficha baja'); await espera(900); }
  await tocar(sub('subtabsStock', 'reservas'), 'Catálogo → Reservas'); await espera(1300);
  marca('atrás del celu'); await p.goBack(); await espera(1300);
  const tFin = (Date.now() - tIni) / 1000;
  await cdp.send('Page.stopScreencast');
  const hist = await p.evaluate(() => window.__mov.estado().hist);
  await A.browser.close();
  const T0 = tIni / 1000, lista = [];
  cuadros.forEach((c, i) => fs.writeFileSync(path.join(VID, `f${String(i).padStart(5, '0')}.jpg`), Buffer.from(c.d, 'base64')));
  for (let i = 0; i < cuadros.length; i++) {
    const a = Math.max(cuadros[i].t, T0 - 0.5), b = i + 1 < cuadros.length ? cuadros[i + 1].t : T0 + tFin;
    if (b <= T0 - 0.5) continue;
    lista.push(`file 'f${String(i).padStart(5, '0')}.jpg'`, `duration ${Math.max(0.001, b - a).toFixed(4)}`);
  }
  lista.push(lista[lista.length - 2]);
  fs.writeFileSync(path.join(VID, 'lista.txt'), lista.join('\n') + '\n');
  fs.writeFileSync(path.join(SAL, 'marcas.json'), JSON.stringify({ dur: tFin, n: cuadros.length, marcas, hist, errores: A.errores.slice(0, 5) }, null, 1));
  console.log('ok cuadros', cuadros.length, 'dur', tFin.toFixed(2), A.errores.slice(0, 3));
})().catch((e) => { console.error(e); process.exit(2); });
