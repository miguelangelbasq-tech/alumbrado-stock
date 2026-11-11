// Varios: certificación, material contra avance, gente sin tarea (datos v145, admin compu); herramientas (datos v142); guías; revisar catálogo
const { app, foto, T, tomas, ev, clic, vista, cerrarTodo } = require('./base');
const { datos145 } = require(T + '/datos145');
const { datos142 } = require(T + '/datos142');
const { datos147 } = require(T + '/datos147');
(async () => {
  const quien = process.env.G || 'todo';
  if (quien === 'todo' || quien === 'a') {
    const A = await app(datos145(), 'admin');
    await tomas(A, [
      ['va_cert', async (p) => { await ev(p, () => window.__certMensual.abrir()); await p.waitForTimeout(2000); }, null],
      ['va_cert_2', async (p) => { await ev(p, () => { const o = document.getElementById('cmOv') || document.querySelector('.v7-ov'); const sc = o && [o, ...o.querySelectorAll('*')].find(e => e.scrollHeight > e.clientHeight + 40 && /auto|scroll/.test(getComputedStyle(e).overflowY)); if (sc) sc.scrollTop = 800; }); }, null],
      ['va_matavance', async (p) => { await cerrarTodo(p); await ev(p, () => { try { window.__certMensual.cerrar(); } catch (e) { } window.__lgPlegTodoAbierto = true; window.abrirLegajo('pA'); }); await p.waitForTimeout(2500); await ev(p, () => { const e = document.getElementById('lgMavSec'); e && e.scrollIntoView(); window.scrollBy(0, -80); }); }, null],
      ['va_balance', async (p) => { await ev(p, () => { const e = document.getElementById('lgBalSec'); e && e.scrollIntoView(); window.scrollBy(0, -80); }); }, null],
      ['va_sintarea', async (p) => { await vista(p, 'inicio'); await ev(p, () => window.__sugerida.abrir()); await p.waitForTimeout(2000); await ev(p, () => { const e = document.getElementById('stBloque'); e && e.scrollIntoView({ block: 'start' }); }); }, null],
      ['va_aprende_mat', async (p) => { await ev(p, () => window.__sugerida.cerrar()); await cerrarTodo(p); await ev(p, () => window.__sugerida.abrirAprende('material')); await p.waitForTimeout(1500); }, null],
      ['va_aprende_sin', async (p) => { await cerrarTodo(p); await ev(p, () => window.__sugerida.abrirAprende('sintarea')); await p.waitForTimeout(1500); }, null],
      ['va_itemizado_zona', async (p) => { await cerrarTodo(p); await vista(p, 'avance'); await clic(p, '#subtabsAvance .subtab[data-sub="epec"]', { espera: 1500 }); await ev(p, () => { const e = document.getElementById('zcCaja'); e && e.scrollIntoView({ block: 'center' }); }); }, null],
      ['va_mayusculas', async (p) => { await vista(p, 'obras'); await clic(p, '#fnBtn', { espera: 1200 }); }, null],
      ['va_revisar_cat', async (p) => { await cerrarTodo(p); await ev(p, () => window.__v135.irStock('acceso')); await p.waitForTimeout(1200); await ev(p, () => { const e = document.getElementById('cardCatArreglos'); if (e) { e.classList.remove('ca-oculto'); e.scrollIntoView({ block: 'start' }); window.scrollBy(0, -80); } }); }, null],
    ]);
    console.log(A.errores.slice(0, 5)); await A.browser.close();
  }
  if (quien === 'todo' || quien === 'b') {
    const A = await app(datos142(), 'lucia', { cel: true });
    await tomas(A, [
      ['va_herr', async (p) => { await ev(p, () => window.__v135.irStock('herramientas')); await p.waitForTimeout(1500); }, null],
      ['va_herr_2', (p) => ev(p, () => window.scrollTo(0, 700)), null],
      ['va_etiquetas', async (p) => { await ev(p, () => window.__codigos.elegirEtiquetas()); await p.waitForTimeout(1000); }, null],
      ['va_guias', async (p) => { await cerrarTodo(p); await vista(p, 'guias'); await p.waitForTimeout(1500); }, null],
      ['va_guia_paso', async (p) => { await clic(p, '#guiasApp .gq-card[data-gq-abrir]', { espera: 2000 }); }, null],
      ['va_guia_paso_2', (p) => ev(p, () => window.scrollTo(0, 700)), null],
      ['va_guias_mat', async (p) => { await ev(p, () => { const b = document.querySelector('#guiasApp [data-gq="volver"]'); b && b.click(); }); await p.waitForTimeout(500); await clic(p, '#guiasApp [data-gq-tab="materiales"]', { espera: 1500 }); }, null],
      ['va_guias_tipos', async (p) => { await clic(p, '#guiasApp [data-gq-tab="tipos"]', { espera: 1500 }); }, null],
      ['va_guia_tipo', async (p) => { await clic(p, '#guiasApp .gq-card[data-gq-abrir="AP-TC-001"]', { espera: 2000 }); }, null],
      ['va_guias_laminas', async (p) => { await ev(p, () => { const b = document.querySelector('#guiasApp [data-gq="volver"]'); b && b.click(); }); await p.waitForTimeout(500); await clic(p, '#guiasApp [data-gq-tab="laminas"]', { espera: 1500 }); }, null],
      ['va_normas', async (p) => { await vista(p, 'normas'); await p.waitForTimeout(1000); }, null],
      ['va_calc_cel', async (p) => { await vista(p, 'calc'); }, null],
      ['va_calc_cel_2', (p) => ev(p, () => window.scrollTo(0, 900)), null],
    ]);
    console.log(A.errores.slice(0, 5)); await A.browser.close();
  }
})();
