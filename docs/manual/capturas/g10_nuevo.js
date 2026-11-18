// Lo nuevo que las pruebas no fotografían: la hoja «🔎 Puntos» (datos v154, admin en la compu),
// el Inicio de la oficina en el celu y en la compu (datos v155) y la puesta al día del avance (datos v163).
const { app, foto, T, tomas, ev, clic, vista, cerrarTodo, workerFalso } = require('./base');
(async () => {
  const G = process.env.G || 'todo';
  if (G === 'todo' || G === 'a') {
    const { datos154 } = require(T + '/datos154');
    const A = await app(datos154(), 'admin', { w: 1280, h: 860 });
    await tomas(A, [
      ['p10_puntos_rev', async (p) => { await vista(p, 'produccion'); await ev(p, () => window.__auditPuntos.abrir({ tab: 'rev' })); await p.waitForTimeout(1500); }, null],
      ['p10_puntos_persona', async (p) => { await ev(p, () => { const b = document.querySelector('#qpOv [data-qptab="pers"], #qpOv [data-qp="pers"]'); b && b.click(); }); await p.waitForTimeout(1200); }, null],
    ]);
    console.log(A.errores.slice(0, 5)); await A.browser.close();
  }
  if (G === 'todo' || G === 'b') {
    const { datos155 } = require(T + '/datos155');
    let A = await app(datos155(), 'admin', { w: 1280, h: 860, extra: { leaflet: true } });
    await tomas(A, [
      ['p10_inicio_pc', async (p) => { await vista(p, 'inicio'); await p.waitForTimeout(2500); }, null],
      ['p10_inicio_pc_full', null, null, { full: true }],
      ['p10_para_resolver', async (p) => { await ev(p, () => window.__paraResolver.abrir()); await p.waitForTimeout(1800); }, null],
    ]);
    await A.browser.close();
    A = await app(datos155(), 'lucia', { cel: true, extra: { leaflet: true } });
    await tomas(A, [
      ['p10_inicio_cel', async (p) => { await vista(p, 'inicio'); await p.waitForTimeout(2500); }, null],
      ['p10_inicio_cel_2', (p) => ev(p, () => window.scrollTo(0, 1400)), null],
      ['p10_inicio_cel_3', (p) => ev(p, () => window.scrollTo(0, 2900)), null],
    ]);
    await A.browser.close();
  }
  if (G === 'todo' || G === 'd') {
    const { datos158 } = require(T + '/datos158');
    const A = await app(datos158(), 'admin', { w: 1280, h: 860 });
    await tomas(A, [
      ['p10_tarea_nueva', async (p) => { await vista(p, 'produccion'); await clic(p, '#viewProduccion [data-sub="baremo"]', { espera: 1200 }); await ev(p, () => { const e = document.getElementById('tnCard'); e && e.scrollIntoView({ block: 'start' }); window.scrollBy(0, -80); }); }, null],
      ['p10_tarea_nueva_2', async (p) => { await ev(p, () => { const e = document.getElementById('tn2Res') || document.getElementById('tn2Par'); e && e.scrollIntoView({ block: 'start' }); window.scrollBy(0, -120); }); }, null],
    ]);
    console.log(A.errores.slice(0, 5)); await A.browser.close();
  }
  if (G === 'todo' || G === 'c') {
    const { datos163 } = require(T + '/datos163');
    const A = await app(datos163(), 'admin', { w: 1280, h: 860 });
    await tomas(A, [
      ['p10_puesta', async (p) => { await vista(p, 'avance'); await ev(p, () => { window.verAvanceDetalle && window.verAvanceDetalle('b4'); }); await p.waitForTimeout(2000); await ev(p, () => window.__av2.abrirPuesta('b4')); await p.waitForTimeout(1500); }, null],
    ]);
    console.log(A.errores.slice(0, 5)); await A.browser.close();
  }
})();
