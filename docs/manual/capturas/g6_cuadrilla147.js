// Cuadrilla (Juan) con los datos de la v147: cámara «opción B» (la obra la elige el GPS), paso a paso con voz, Mis tareas lista completa
const { app, foto, T, tomas, ev, clic, vista, cerrarTodo } = require('./base');
const { datos147, P } = require(T + '/datos147');
(async () => {
  const A = await app(datos147(), 'juan', { cel: true, geo: [P.bul[0] + 0.0002, P.bul[1], 8], extra: { leaflet: true } });
  const p = A.page;
  await p.route(/ema-fotos\.mdiaz-60f\.workers\.dev/, (rq) => rq.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ ok: true }) }));
  const camara = async (p) => { await cerrarTodo(p); await ev(p, () => document.getElementById('menuCamara').click()); for (let i = 0; i < 40; i++) { await p.waitForTimeout(250); if (await ev(p, () => { const v = document.getElementById('ecVideo'); return !!(v && v.videoWidth > 0 && document.getElementById('cbPill')); })) break; } await p.waitForTimeout(1800); };
  await tomas(A, [
    ['cb_camara', camara, null],
    ['cb_hoja_obra', async (p) => { await clic(p, '#cbPill .cb-pill', { espera: 900 }); }, null],
    ['cb_otra_obra', async (p) => { await clic(p, '#cbHoja [data-cb="otraObra"]', { espera: 900 }); }, null],
    ['_cerrar', async (p) => { await ev(p, () => { try { window.camaraApp.cerrar(); } catch (e) { } }); await p.waitForTimeout(600); await cerrarTodo(p); }, null],
    ['ps_orden', async (p) => { await vista(p, 'inicio'); await ev(p, () => window.__cuadrillaDia.ir('orden')); await p.waitForTimeout(1200); }, null],
    ['ps_hoja', async (p) => { await clic(p, '#cdApp [data-pstabrir]', { espera: 1500 }); }, null],
    ['ps_hoja_2', async (p) => { await clic(p, '#pstHoja [data-pst="sig"]', { espera: 900 }); }, null],
    ['ps_modo_obra', async (p) => { await ev(p, () => window.__pasosTarea.cerrar()); await ev(p, () => window.__cuadrillaDia.ir('obra')); await p.waitForTimeout(1500); }, null],
    ['ps_mistareas', async (p) => { await vista(p, 'mistareas'); await p.waitForTimeout(800); }, null],
    ['ps_mistareas_2', async (p) => { await ev(p, () => window.scrollTo(0, 500)); }, null],
    ['ps_avisos', async (p) => { await vista(p, 'inicio'); await ev(p, () => { window.__emaAvisos && window.__emaAvisos.avisar({ id: 'a9', titulo: 'Orden nueva OT-2026-204', cuerpo: 'PLAZA LAS ACACIAS · Tocá para ver la orden y los pasos', tipo: 'ot', ts: Date.now() }); document.querySelectorAll('#avToast').forEach(x => x.remove()); document.getElementById('avCampana').click(); }); await p.waitForTimeout(1000); }, null],
    ['ps_catalogo', async (p) => { await cerrarTodo(p); await vista(p, 'stock'); }, null],
    ['ps_mapa', async (p) => { await vista(p, 'mapa'); await p.waitForTimeout(1200); }, null],
  ]);
  console.log(A.errores.slice(0, 5)); await A.browser.close();
})();
