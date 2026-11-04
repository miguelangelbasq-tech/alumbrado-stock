// Pruebas v111 · Cierre de la orden: 0 horas = 0 puntos, tocar los puntos pasa a mano, «Te quedan N puntos para repartir»,
// «Repartirlos entre los demás» y «✕ No fue».
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v111' + (cel ? ' cel' : ''));
  const d = baseDatos(), hoy = d.hoy;
  const P = [{ nombre: 'Juan Pérez', rol: 'Oficial' }, { nombre: 'Pedro Gómez', rol: 'Oficial' }, { nombre: 'Luis Díaz', rol: 'Oficial' }];
  d.db.ordenesTrabajo = { x1: { numero: 'OT-2026-901', fecha: hoy, plazaId: 'p1', plazaNombre: 'Plaza San Martín', horaInicio: '07:00', horaFin: '12:00', personal: P, personalNombres: ['juan perez', 'pedro gomez', 'luis diaz'], actividades: ['montaje_prfv'], previsto: { montaje_prfv: 9 }, estado: 'En curso', creado: Date.now() } };
  const A = await abrir({ sesion: 'admin', cel, datos: d, espera: 3500 }), p = A.page;
  p.on('dialog', (x) => x.accept());
  await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(400);
  await p.evaluate(() => window.abrirCierreOt('x1')); await p.waitForTimeout(900);
  await p.fill('#cierreCuerpo .cierre-qty[data-k="montaje_prfv"]', '9'); await p.waitForTimeout(500);
  const v = () => p.evaluate(() => [...document.querySelectorAll('.cierre-persona')].map((x) => ({ n: x.querySelector('.cierre-horas-p').dataset.n, h: x.querySelector('.cierre-horas-p').value, pts: +String(x.querySelector('.cierre-pers').value).replace(',', '.') })));
  const tot = () => p.evaluate(() => +String(document.getElementById('cierreTotal').textContent).replace(/\./g, '').replace(',', '.'));
  const T = await tot();
  // 1) 0 horas = 0 puntos (antes le daba la jornada entera)
  const h3 = (await p.$$('.cierre-horas-p'))[2]; await h3.click({ clickCount: 3 }); await p.keyboard.type('0'); await p.waitForTimeout(500);
  let r = await v();
  c(r[2].pts === 0 && Math.abs(r[0].pts + r[1].pts - T) < 0.2, '0 horas = 0 puntos, y los demás se llevan la jornada · ' + JSON.stringify(r.map((x) => x.pts)));
  await h3.click({ clickCount: 3 }); await p.keyboard.press('Backspace'); await p.waitForTimeout(400);
  r = await v(); const ph = await p.evaluate(() => document.querySelectorAll('.cierre-horas-p')[2].placeholder);
  c(r[2].pts > 0 && /5/.test(ph), 'vacío = la jornada de la orden, y se ve escrita en gris · ' + ph);
  // 2) tocar los puntos de alguien pasa a «a mano» y deja escribir
  const p1 = (await p.$$('.cierre-pers'))[0]; await p1.click(); await p.waitForTimeout(300);
  r = await p.evaluate(() => ({ man: document.getElementById('cierreManual').checked, ro: document.querySelectorAll('.cierre-pers')[0].readOnly }));
  c(r.man && !r.ro, 'tocar los puntos de alguien pasa solo a «Repartir a mano» y deja escribir');
  const antes = (await v())[0].pts;
  await p1.click({ clickCount: 3 }); await p.keyboard.type(String(Math.round((antes - 8) * 10) / 10)); await p.waitForTimeout(400);
  let s = await p.evaluate(() => (document.querySelector('#cierreCuerpo .cg-saldo') || {}).textContent || '');
  c(/Te quedan 8 puntos para repartir/.test(s), 'le bajé 8 a uno: «Te quedan 8 puntos para repartir» · ' + s.slice(0, 60));
  await p.click('#cierreCuerpo [data-cg="repartir"]'); await p.waitForTimeout(300);
  r = await v(); s = await p.evaluate(() => (document.querySelector('#cierreCuerpo .cg-saldo') || {}).textContent || '');
  c(/Repartiste todos/.test(s) && Math.abs(r.reduce((a, x) => a + x.pts, 0) - T) < 0.15 && Math.abs(r[0].pts - (antes - 8)) < 0.05, '«Repartirlos entre los demás» los reparte entre los otros dos y no toca al que bajaste · ' + JSON.stringify(r.map((x) => x.pts)));
  if (cel) { const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); c(sw <= 0, 'sin scroll de costado en el celu · ' + sw); }
  // 3) ✕ No fue
  await p.click('#cierreCuerpo [data-cg-nofue="Luis Díaz"]'); await p.waitForTimeout(1500);
  r = await p.evaluate(() => { const o = window.__stubDB().ordenesTrabajo.x1; return { pers: o.personal.map((x) => x.nombre), pn: o.personalNombres, q: (o.quitadosAlCerrar || []).map((x) => x.nombre), filas: document.querySelectorAll('.cierre-persona').length, cant: (document.querySelector('#cierreCuerpo .cierre-qty[data-k="montaje_prfv"]') || {}).value }; });
  c(r.pers.length === 2 && !r.pn.includes('luis diaz') && r.q[0] === 'Luis Díaz' && r.filas === 2 && r.cant === '9', '«✕ No fue» lo saca de la orden (queda anotado) y el cierre conserva lo cargado · ' + JSON.stringify(r));
  // 4) guardar: las horas quedan con la regla nueva
  await p.evaluate(() => document.getElementById('cierreManual').click()); await p.waitForTimeout(200);
  const h2 = (await p.$$('.cierre-horas-p'))[1]; await h2.click({ clickCount: 3 }); await p.keyboard.type('0'); await p.waitForTimeout(400);
  await p.evaluate(async () => { const x = document.querySelector('input[name="coCierreResp"][value="no"]'); x && (x.checked = true); await guardarCierreOt(); }); await p.waitForTimeout(1500);
  r = await p.evaluate(() => { const o = window.__stubDB().ordenesTrabajo.x1, ci = o.cierre || {}, pts = typeof puntosDeOrden == 'function' ? puntosDeOrden(o) : null; return { hp: ci.horasPersona, v: ci.horasPersonaV, pp: pts && pts.porPersona ? pts.porPersona.map((x) => [x.nombre, Math.round(x.pts * 10) / 10]) : null }; });
  const pedro = r.pp && r.pp.find((x) => /Pedro/.test(x[0]));
  c(r.v === 2 && r.hp && r.hp['Pedro Gómez'] === 0 && r.hp['Juan Pérez'] === 5 && pedro && pedro[1] === 0, 'al guardar, 0 horas queda en 0 y no suma puntos; vacío queda con la jornada · ' + JSON.stringify(r));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})();
