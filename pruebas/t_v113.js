// Pruebas v113 · Una sola forma de hacer cada cosa: «Cierre del día» guarda como «Cargar lo hecho», «Buscar» dentro de
// Seguimiento, un solo informe mensual, vehículos en un solo lugar; responsable de oficina de la orden («Órdenes que seguís»).
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v113' + (cel ? ' cel' : ''));
  const d = baseDatos(), hoy = d.hoy, dom = d.db.usuarios.uAdmin.email.split('@')[1];
  d.db.usuarios.uOfi = { email: 'olga@' + dom, usuario: 'olga', nombre: 'Olga Oficina', rol: 'oficina', activo: true };
  d.db.avanceObras.p1.valorItems = [{ id: 1, itemPliego: '5', cantidad: 9, cantidadAvanzada: 0 }];
  const P = [{ nombre: 'Juan Pérez', rol: 'Oficial' }, { nombre: 'Pedro Gómez', rol: 'Oficial' }, { nombre: 'Luis Díaz', rol: 'Oficial' }];
  d.db.ordenesTrabajo = { x1: { numero: 'OT-2026-901', fecha: hoy, plazaId: 'p1', plazaNombre: 'Plaza San Martín', horaInicio: '07:00', horaFin: '12:00', personal: P, personalNombres: ['juan perez', 'pedro gomez', 'luis diaz'], actividades: ['montaje_prfv'], previsto: { montaje_prfv: 9 }, estado: 'En curso', creado: Date.now(), supervisor: { uid: 'uAdmin', email: 'admin@' + dom, nombre: 'Ana Admin' }, campo: { enviados: { juan_perez: { nombre: 'Juan Pérez', ts: Date.now() } } } } };
  const A = await abrir({ sesion: 'admin', cel, datos: d, espera: 3500, porPartes: true, ofPasos: true }), p = A.page;
  p.on('dialog', (x) => x.accept());
  // 1) Cierre del día = el mismo cierre
  await p.evaluate(() => mostrarVista('produccion')); await p.waitForTimeout(600);
  await p.evaluate(() => { const b = [...document.querySelectorAll('#subtabsProd .subtab')].find((x) => /Cierre del d/i.test(x.textContent)); b && b.click(); }); await p.waitForTimeout(1200);
  await p.fill('.dia-qty[data-ot="x1"][data-k="montaje_prfv"]', '9'); await p.waitForTimeout(300);
  const h3 = await p.$('.dia-horas[data-ot="x1"][data-n="Luis Díaz"]'); await h3.fill('0'); await p.waitForTimeout(600);
  let r = await p.evaluate(() => [...document.querySelectorAll('.dia-pers[data-ot="x1"]')].map((x) => +String(x.value).replace(',', '.')));
  c(r.length === 3 && r[2] === 0 && Math.abs(r[0] - r[1]) < 0.01 && r[0] > 0, 'el parte del día muestra los mismos puntos que el cierre (0 horas = 0) · ' + JSON.stringify(r));
  r = await p.evaluate(() => !!document.querySelector('#prodPanelDia .cd-co[data-ot="x1"]'));
  c(r, 'el parte del día tiene la misma pregunta del cierre: ¿agregó o sacó algo del itemizado?');
  await p.click('#prodPanelDia input[name="cdco-x1"][value="no"]'); await p.waitForTimeout(200);
  await p.click('.dia-guardar[data-ot="x1"]'); await p.waitForTimeout(4000);
  r = await p.evaluate(() => { const o = window.__stubDB().ordenesTrabajo.x1, ci = o.cierre || {}; const pz = window.__stubDB().avanceObras.p1; const av = window.__stubDB().avisosPush || {}; return { v: ci.horasPersonaV, hp: ci.horasPersona, cant: ci.cantidades, items: (ci.avanceItems || []).length, it5: pz.valorItems[0].cantidadAvanzada, pts: Object.values(av).filter((x) => x.tipo === 'puntos').length, msg: (document.querySelector('.dia-msg[data-ot="x1"]') || {}).textContent, abierto: (document.getElementById('cierreOt') || {}).style.display }; });
  c(r.v === 2 && r.hp['Luis Díaz'] === 0 && r.cant.montaje_prfv === 9 && r.items > 0 && r.it5 > 0 && r.pts >= 2 && /igual que/.test(r.msg) && r.abierto === 'none', '«Guardar el parte» guarda como «Cargar lo hecho»: horas, itemizado y aviso de puntos · ' + JSON.stringify(r));
  // 2) Buscar dentro de Seguimiento
  await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(600);
  await p.click('#subtabsOrdenes .subtab[data-sub="seguimiento"]'); await p.waitForTimeout(1500);
  r = await p.evaluate(() => ({ tab: getComputedStyle(document.querySelector('#subtabsOrdenes .subtab[data-sub="buscar"]')).display, b: !!document.getElementById('urBuscar') }));
  c(r.tab === 'none' && r.b, '«Por persona / obra» ya no es otra pestaña: está en Seguimiento como «🔎 Buscar en las órdenes»');
  await p.click('#urBuscar'); await p.waitForTimeout(1500);
  r = await p.evaluate(() => ({ bus: (document.getElementById('otBuscarPanel') || {}).offsetParent !== null, v: !!document.getElementById('urVolver') }));
  c(r.bus && r.v, 'abre el mismo buscador, con «← Volver a Seguimiento»');
  // 3) responsable de oficina
  await p.click('#subtabsOrdenes .subtab[data-sub="nueva"]'); await p.waitForTimeout(1500);
  await p.click('#ofPasos .of-paso[data-of-ir="2"]'); await p.waitForTimeout(1300);
  r = await p.evaluate(() => [...document.querySelectorAll('#supSel option')].map((o) => o.textContent));
  c(r.length === 2 && r.some((x) => /Ana Admin \(vos\)/.test(x)) && r.some((x) => /Olga Oficina/.test(x)), 'en la orden se elige el responsable de oficina (oficina o administración) · ' + r.join(', '));
  await p.selectOption('#supSel', 'olga@' + dom);
  await p.evaluate(() => { const s = document.getElementById('otPlaza'); s.value = 'p1'; s.dispatchEvent(new Event('change', { bubbles: true })); }); await p.waitForTimeout(900);
  await p.evaluate(() => { const x = document.getElementById('ofPend'); x && x.remove(); });
  await p.evaluate(() => { const n = (window.__personalNube || {}).lista || []; window.__ordenNueva.sumarPersona('Juan Pérez'); document.getElementById('otCuadrilla').value = 'C1'; const cb = document.querySelector('#otActividades .ot-act-check[value="poda"]'); cb.checked = true; cb.dispatchEvent(new Event('change', { bubbles: true })); });
  await p.waitForTimeout(600); await p.evaluate(() => document.getElementById('otEmitirBtn').click()); await p.waitForTimeout(2500);
  r = await p.evaluate(() => { const o = Object.values(window.__stubDB().ordenesTrabajo).find((x) => x.numero !== 'OT-2026-901'); const av = Object.values(window.__stubDB().avisosPush || {}).filter((x) => x.tipo === 'supervisor'); return { sup: o && o.supervisor && o.supervisor.email, av: av.map((x) => x.email) }; });
  c(/olga@/.test(r.sup || '') && r.av.length === 1 && /olga@/.test(r.av[0]), 'la orden guarda el responsable y le manda el aviso · ' + JSON.stringify(r));
  // 4) «Órdenes que seguís» en Mis tareas (la x1 la sigue el admin)
  await p.evaluate(() => mostrarVista('mistareas')); await p.waitForTimeout(1800);
  r = await p.evaluate(() => ({ t: (document.querySelector('#supSeguir h2') || {}).textContent || '', n: document.querySelectorAll('#supSeguir .sup-ot').length, cerrar: document.querySelectorAll('#supSeguir [data-sup-cerrar]').length }));
  c(r.n === 0, 'v120: la orden ya cerrada NO aparece en «👔 Órdenes que seguís» (Ángel: «si ya se cerraron, no me tienen que salir») · ' + JSON.stringify(r));
  // 5) informe mensual único y vehículos en un solo lugar
  await p.evaluate(() => mostrarVista('informe')); await p.waitForTimeout(800);
  await p.selectOption('#informePeriodo', 'Informe mensual'); await p.waitForTimeout(1300);
  r = await p.evaluate(() => ({ op: [...document.getElementById('informePeriodo').options].find((o) => o.value === 'Informe mensual').textContent, hint: (document.getElementById('urInfHint') || {}).textContent || '' }));
  c(/Avance del mes/.test(r.op) && /Informe mensual con fotos/.test(r.hint), 'un solo informe mensual: el otro se llama «Avance del mes» y te manda al de fotos · ' + r.op);
  await p.evaluate(() => { mostrarVista('gastos'); window.gastosElegirTab && window.gastosElegirTab('combustible'); }); await p.waitForTimeout(1500);
  r = await p.evaluate(() => { const n = document.getElementById('gvNombre'); return { form: n ? getComputedStyle(n.closest('.ga-form')).display : 'sin', link: !!document.querySelector('[data-ur="veh"]') }; });
  c((r.form === 'none' || r.form === 'sin') && (r.link || r.form === 'sin'), 'los vehículos se cargan en un solo lugar (Personal del equipo); en Gastos, el botón para ir · ' + JSON.stringify(r));
  if (cel) { const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); c(sw <= 0, 'sin scroll de costado en el celu · ' + sw); }
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})();
