// Pruebas v120 · «Órdenes que seguís» compacta (para cerrar primero, el resto plegado, fechas 05/11), barra de «Llenar
// orden» opaca, nombres de columna completos en las fotos.
const { abrir, prueba, baseDatos, DOM } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v120' + (cel ? ' cel' : ''));
  const d = baseDatos(), hoy = d.hoy;
  const sup = { uid: 'uAdmin', email: 'admin@' + DOM, nombre: 'Ana Admin' }, P = [{ nombre: 'Juan Pérez', rol: 'Oficial' }];
  for (let i = 0; i < 7; i++) d.db.ordenesTrabajo['s' + i] = { numero: 'OT-2026-' + (170 + i), fecha: hoy, plazaId: 'p1', plazaNombre: 'OBRA ' + i, personal: P, personalNombres: ['juan perez'], actividades: ['poda'], previsto: { poda: 1 }, estado: 'Emitida', creado: i, supervisor: sup, campo: i === 3 ? { enviados: { juan_perez: { nombre: 'Juan Pérez', ts: Date.now() } } } : {} };
  const A = await abrir({ sesion: 'admin', cel, dpr: cel ? 2 : 1, datos: d, espera: 3500, ofPasos: true }), p = A.page;
  await p.evaluate(() => mostrarVista('mistareas')); await p.waitForTimeout(2200);
  let r = await p.evaluate(() => { const s = document.getElementById('supSeguir'); return { n: s ? s.querySelectorAll('.sup-ot').length : 0, prim: s ? (s.querySelector('.sup-ot') || {}).textContent : '', todo: !!(s && s.querySelector('[data-sup-todo="1"]')), fechaIso: s ? /\d{4}-\d\d-\d\d/.test(s.textContent) : true }; });
  c(r.n <= 3 && /OT-2026-173/.test(r.prim) && /Para cerrar/.test(r.prim) && r.todo && !r.fechaIso, '«Órdenes que seguís»: la para cerrar primero, el resto plegado, fechas 05/11 · ' + JSON.stringify(r).slice(0, 160));
  if (cel) await p.evaluate(() => document.getElementById('supSeguir').scrollIntoView({ block: 'start' })), await p.evaluate(() => window.scrollBy(0, -80)), await p.waitForTimeout(300), await p.screenshot({ path: __dirname + '/v120_seguis_cel.png' });
  await p.click('#supSeguir [data-sup-todo="1"]'); await p.waitForTimeout(500);
  r = await p.evaluate(() => document.querySelectorAll('#supSeguir .sup-ot').length);
  c(r === 7, '«Ver todas las que seguís» las muestra todas · ' + r);
  // barra de «Llenar orden» y nombres de columna
  await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(500);
  await p.click('#subtabsOrdenes .subtab[data-sub="nueva"]'); await p.waitForTimeout(1500);
  r = await p.evaluate(() => { const b = document.getElementById('ofBarra'); const s = document.createElement('button'); s.className = 'fl-nom-btn'; document.body.appendChild(s); const ws = getComputedStyle(s).whiteSpace; s.remove(); return { bg: b ? getComputedStyle(b).backgroundColor : 'sin', vis: b ? getComputedStyle(b).display : '', ws }; });
  c((!cel || (r.vis === 'flex' && r.bg === 'rgb(255, 255, 255)')) && r.ws === 'normal', 'la barra de abajo es blanca (no deja ver lo de atrás) y el nombre de la columna no se corta · ' + JSON.stringify(r));
  if (cel) { const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); c(sw <= 0, 'sin scroll de costado · ' + sw); }
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})();
