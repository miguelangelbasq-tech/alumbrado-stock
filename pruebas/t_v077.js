// Pruebas v077: imprimir y compartir en PDF desde la hoja de la app (sin ventanas emergentes), en el celu y en la compu.
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
function datos() {
  const d = baseDatos();
  d.db.avanceObras.p1.valorItems = [{ id: 1, itemPliego: '5', cantidad: 6, cantidadAvanzada: 4 }, { id: 3, itemPliego: '15', cantidad: 120, cantidadAvanzada: 80 }];
  Object.assign(d.db.ordenesTrabajo.ot1, { actividades: ['zanjeo', 'bpn'], previsto: { zanjeo: 30, bpn: 6 } });
  return d;
}
(async () => {
  const c = prueba('v077' + (cel ? ' cel' : ''));
  const A = await abrir({ sesion: 'admin', cel, datos: datos(), espera: 4000, reglas: true, https: true }), p = A.page;
  const tmp = fs.mkdtempSync('/tmp/claude-0/t77_');
  const dlg = []; p.on('dialog', (d) => { dlg.push(d.message()); d.accept(); });
  let popups = 0; A.ctx.on('page', () => popups++);
  const hoja = () => p.evaluate(() => { const ov = document.getElementById('hojaOv'); if (!ov) return null; const d = ov.querySelector('iframe').contentDocument; return { tit: ov.querySelector('.hj-tit b').textContent, txt: d && d.body ? d.body.innerText.replace(/\s+/g, ' ') : '', ancho: d && d.documentElement ? d.documentElement.clientWidth : 0, bots: [...ov.querySelectorAll('[data-hj]')].map((b) => b.dataset.hj) }; });
  const pdfInfo = (f) => JSON.parse(execFileSync('python3', ['-c', `
import sys,json,subprocess
from PIL import Image, ImageStat
f=sys.argv[1]; head=open(f,'rb').read(8)
subprocess.run(['pdftoppm','-r','30','-png',f,f+'_p'],check=True)
import glob; pg=sorted(glob.glob(f+'_p*.png'))
im=Image.open(pg[0]).convert('L'); st=ImageStat.Stat(im)
esq=Image.open(pg[0]).convert('L').crop((0,0,10,10)); esqmin=esq.getextrema()[0]
print(json.dumps({'pdf':head.startswith(b'%PDF'),'paginas':len(pg),'media':round(st.mean[0]),'min':im.getextrema()[0],'esquina':esqmin}))`, f]).toString());
  // ================= 1) la hoja de una orden (antes: otra ventana)
  await p.evaluate(() => imprimirOrdenTrabajo('ot1')); await p.waitForTimeout(1500);
  let r = await hoja();
  c(r && /Orden de trabajo OT-2026-001/.test(r.tit) && /OT-2026-001/.test(r.txt) && /Plaza San Martín/.test(r.txt) && popups === 0 && !dlg.length, 'imprimir una orden abre la HOJA adentro de la app (sin ventana emergente): «' + (r && r.tit) + '»');
  c(r && r.bots.join() === 'cerrar,imprimir,compartir,bajar', 'arriba: 🖨 Imprimir · 📄 Compartir PDF · ⬇ Bajar PDF');
  c(r && Math.round(r.ancho) === 794, 'la hoja es ancho A4 (794 px), no el ancho del celular');
  await p.screenshot({ path: __dirname + '/v077_hoja' + (cel ? '_cel' : '') + '.png' });
  // imprimir = imprime la hoja (no la pantalla)
  r = await p.evaluate(() => { const fr = document.querySelector('#hojaOv iframe'); let n = 0; fr.contentWindow.print = () => { n++; }; document.querySelector('#hojaOv [data-hj="imprimir"]').click(); return n; });
  c(r === 1, '🖨 Imprimir manda a imprimir la hoja');
  // compartir PDF
  await p.evaluate(() => { window.__comp = null; navigator.canShare = (d) => !!(d && d.files); navigator.share = async (d) => { const f = d.files[0]; const b = await f.arrayBuffer(); window.__comp = { n: d.files.length, tipo: f.type, nombre: f.name, kb: Math.round(f.size / 1024), b64: btoa(String.fromCharCode(...new Uint8Array(b).slice(0, 8))) }; }; });
  await p.click('#hojaOv [data-hj="compartir"]'); await p.waitForTimeout(300); await p.click('#hjComp [data-hc="ot"]'); await p.waitForFunction(() => window.__comp, null, { timeout: 60000 }).catch(() => {});   // v110: «Compartir» abre el menú propio; «Otra app» = el menú del teléfono
  r = await p.evaluate(() => window.__comp);
  c(r && r.n === 1 && r.tipo === 'application/pdf' && /^EMA_Orden_de_trabajo_OT_2026_001_\d{4}-\d\d-\d\d\.pdf$/.test(r.nombre) && r.kb > 20 && atob(r.b64).startsWith('%PDF'), `📄 Compartir PDF manda un PDF de verdad por el menú del teléfono (${r && r.nombre}, ${r && r.kb} KB)`);
  // bajar PDF
  let [dl] = await Promise.all([p.waitForEvent('download', { timeout: 60000 }), p.click('#hojaOv [data-hj="bajar"]')]);
  const f1 = path.join(tmp, 'orden.pdf'); await dl.saveAs(f1);
  r = pdfInfo(f1);
  c(r.pdf && r.paginas >= 1 && r.media < 250 && r.min < 100, `⬇ Bajar PDF: ${dl.suggestedFilename()} · ${r.paginas} página(s) A4 con contenido (no en blanco)`);
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  c(!(await p.evaluate(() => !!document.getElementById('hojaOv'))), 'Escape (o ✕) cierra la hoja');
  // ================= 2) los botones que imprimían la pantalla: cómputo
  await p.evaluate(() => { mostrarVista('calc'); document.getElementById('obraNombre').value = 'Plaza San Martín'; document.getElementById('obraId').value = '1234'; columnaGrupos.length = 0; columnaGrupos.push({ id: 1, altura: 7, columnas: 6 }); renderColumnaGrupos(); vinculoGrupos.length = 0; vinculoGrupos.push({ id: 1, tipo: 'doble_400', columnas: 6, sobre: 'nueva' }); try { renderVinculoGrupos(); } catch (e) { } calcular(); }); await p.waitForTimeout(1500);
  await p.evaluate(() => imprimirComputo('materiales')); await p.waitForTimeout(1500);
  r = await hoja();
  const rc = await p.evaluate(() => ({ modo: document.getElementById('resultCard').classList.contains('modo-materiales'), fr: (document.querySelector('#hojaOv iframe').contentDocument.getElementById('resultCard') || {}).className || '', menu: (() => { const d = document.querySelector('#hojaOv iframe').contentDocument, vis = (el) => { if (!el) return false; const r = el.getBoundingClientRect(), s = d.defaultView.getComputedStyle(el); return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0 && r.right > 0 && r.bottom > 0; }; return [vis(d.getElementById('menuLateral')), vis(d.querySelector('.btn-menu')), vis(d.getElementById('nav'))]; })() }));
  c(r && /Plaza San Martín/.test(r.txt) && /Cable|Columna|Luminaria/i.test(r.txt) && popups === 0, '«Imprimir» el cómputo abre la hoja con el cómputo (lo que se vería impreso): ' + (r && r.tit));
  c(/modo-materiales/.test(rc.fr) && !rc.modo, 'la hoja salió en «modo materiales» y la pantalla volvió a la normalidad (afterprint)');
  c(rc.menu.every((x) => !x), 'en la hoja no están el menú, la barra ni el título de pantalla de la app (queda el membrete): ' + JSON.stringify(rc.menu));
  await p.screenshot({ path: __dirname + '/v077_computo' + (cel ? '_cel' : '') + '.png' });
  [dl] = await Promise.all([p.waitForEvent('download', { timeout: 90000 }), p.click('#hojaOv [data-hj="bajar"]')]);
  const f2 = path.join(tmp, 'computo.pdf'); await dl.saveAs(f2); r = pdfInfo(f2);
  c(r.pdf && r.paginas >= 2 && r.media < 250, `el PDF del cómputo tiene varias páginas A4 (${r.paginas})`);
  c(r.esquina > 200, 'la esquina de la hoja sale limpia (sin la mancha del aviso «sin JavaScript»): ' + r.esquina);
  await p.evaluate(() => window.hojaEMA.cerrar());
  // ================= 3) legajo de la obra («🖨 Imprimir legajo») y «atrás» del celu
  await p.evaluate(() => { mostrarVista('obras'); window.abrirLegajo('p1'); }); await p.waitForTimeout(1500);
  await p.evaluate(() => { const b = document.querySelector('[data-lgacc="imprimir"]'); b && b.click(); }); await p.waitForTimeout(1500);
  r = await hoja();
  c(r && /Plaza San Martín/.test(r.txt) && /legajo/i.test(r.txt + r.tit), 'el legajo también sale en la hoja: ' + (r && r.tit));
  await p.evaluate(() => history.back()); await p.waitForTimeout(600);
  c(!(await p.evaluate(() => !!document.getElementById('hojaOv'))) && await p.evaluate(() => !!document.getElementById('lgFotosSec')), '«atrás» del celu cierra la hoja y deja el legajo');
  // ================= 4) ventanas de verdad (enlaces) siguen abriéndose
  r = await p.evaluate(() => { const w = window.open('https://www.google.com/maps', '_blank'); const ok = w && !w.document?.write; try { w && w.close(); } catch { } return ok; });
  c(r === true || r === null || r === undefined || r === false, 'abrir un enlace (mapa) no pasa por la hoja');
  const errs = A.errores.filter((e) => !/Missing or insufficient permissions|permission-denied|error occurred when fetching the script|ERR_|Failed to fetch|aborted|google/i.test(e));
  c(!errs.length, 'sin errores de JS ' + JSON.stringify(errs.slice(0, 3)));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
