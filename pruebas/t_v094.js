// Pruebas v094: «👥 Elegir quiénes» — una tarea la hacen varias personas juntas (dos en un mismo tablero) y los puntos de esa
// tarea se reparten solo entre ellas. Más «📋 Quién hace qué» en la orden.
const { abrir, otraPagina, prueba, baseDatos, DOM } = require('./h');
const cel = process.argv[2] === 'cel';
function datos() {
  const d = baseDatos();
  d.cuentas['mario@' + DOM] = { pass: 'clave123', uid: 'uMario' };
  d.db.usuarios.uMario = { email: 'mario@' + DOM, usuario: 'mario', nombre: 'Mario Ruiz', rol: 'cuadrilla', persona: 'Mario Ruiz', personaClave: 'mario ruiz', activo: true };
  return d;
}
(async () => {
  const c = prueba('v094' + (cel ? ' cel' : ''));
  const A = await abrir({ sesion: 'admin', cel, datos: datos(), espera: 3500, reglas: true, https: true }), p = A.page;
  const nueva = async () => { const b = p.locator('text=+ Nueva orden'); if (await b.count() && await b.first().isVisible()) { await b.first().click(); await p.waitForTimeout(500); } };
  await p.evaluate(() => mostrarVista('parte')); await p.waitForTimeout(600); await nueva();
  await p.selectOption('#otPlaza', 'p1'); await p.fill('#otCuadrilla', 'Cuadrilla 1'); await p.fill('#otResponsable', 'Juan Pérez');
  await p.evaluate(() => { otFecha.value = fechaAISO(new Date()); personal.length = 0; personal.push({ id: 901, nombre: 'Juan Pérez', rol: ROLES_CUADRILLA[0] }, { id: 902, nombre: 'Pedro Gómez', rol: ROLES_CUADRILLA[1] || ROLES_CUADRILLA[0] }, { id: 903, nombre: 'Mario Ruiz', rol: ROLES_CUADRILLA[1] || ROLES_CUADRILLA[0] }, { id: 904, nombre: 'Luis Díaz', rol: ROLES_CUADRILLA[2] || ROLES_CUADRILLA[0] }); renderPersonal(); }); await p.waitForTimeout(900);
  await p.check('#otAct_montaje_prfv'); await p.fill('.ot-act-prev[data-id="montaje_prfv"]', '1');
  await p.check('#otAct_bpn'); await p.fill('.ot-act-prev[data-id="bpn"]', '6');
  await p.check('#otAct_zanjeo'); await p.fill('.ot-act-prev[data-id="zanjeo"]', '20'); await p.waitForTimeout(500);
  let r = await p.evaluate(() => [...document.querySelector('.ot-act-quien[data-id="montaje_prfv"]').options].map((o) => o.value + '=' + o.textContent));
  c(r.some((x) => /^__equipo__=👥 Elegir quiénes \(la hacen juntos\)$/.test(x)) && r.some((x) => /__reparto__/.test(x)), 'en «¿Quién?» aparece «👥 Elegir quiénes (la hacen juntos)», además de repartir, toda la cuadrilla y cada uno');
  await p.selectOption('.ot-act-quien[data-id="montaje_prfv"]', '__equipo__'); await p.waitForTimeout(400);
  const caja = (k) => p.evaluate((k) => { const cj = document.querySelector('#otAct_' + k).closest('.ot-tarea').querySelector('.eq-caja'); return cj ? { chips: [...cj.querySelectorAll('.chip')].map((b) => (b.classList.contains('activo') ? '+' : '-') + b.dataset.eqn), pie: cj.querySelector('.eq-pie').innerText.replace(/\s+/g, ' ') } : null; }, k);
  r = await caja('montaje_prfv');
  c(r && r.chips.length === 4 && r.chips.every((x) => x[0] === '-') && /Todavía no elegiste a nadie/.test(r.pie), 'aparecen las 4 personas para tocar: ' + JSON.stringify(r));
  await p.click('#otActividades [data-eqk="montaje_prfv"][data-eqn="Juan Pérez"]'); await p.click('#otActividades [data-eqk="montaje_prfv"][data-eqn="Pedro Gómez"]'); await p.waitForTimeout(300);
  r = await caja('montaje_prfv');
  c(r && r.chips.join() === '+Juan Pérez,+Pedro Gómez,-Mario Ruiz,-Luis Díaz' && /La hacen 2: Juan, Pedro/.test(r.pie), 'tocando a Juan y Pedro: «La hacen 2: Juan, Pedro»');
  await p.selectOption('.ot-act-quien[data-id="bpn"]', '__equipo__'); await p.waitForTimeout(300);
  await p.click('#otActividades [data-eqk="bpn"][data-eqn="Mario Ruiz"]'); await p.click('#otActividades [data-eqk="bpn"][data-eqn="Luis Díaz"]');
  await p.click('#otActividades [data-eqk="bpn"][data-eqn="Juan Pérez"]'); await p.click('#otActividades [data-eqk="bpn"][data-eqn="Juan Pérez"]'); await p.waitForTimeout(400);   // tocar dos veces lo saca
  r = await caja('bpn');
  c(r && r.chips.join() === '-Juan Pérez,-Pedro Gómez,+Mario Ruiz,+Luis Díaz', 'otra tarea para Mario y Luis (tocar dos veces a alguien lo saca)');
  await p.click('#otActividades [data-eqk="bpn"][data-eqn="Pedro Gómez"]'); await p.waitForTimeout(200); await p.click('#otActividades [data-eqk="bpn"][data-eqn="Pedro Gómez"]'); await p.waitForTimeout(200);
  await p.selectOption('.ot-act-quien[data-id="zanjeo"]', '__reparto__'); await p.waitForTimeout(300);
  await p.evaluate(() => { const cj = document.querySelector('#otAct_zanjeo').closest('.ot-tarea').querySelector('.rp-tit'); cj.click(); }); await p.waitForTimeout(200);
  await p.selectOption('.ot-act-quien[data-id="zanjeo"]', ''); await p.waitForTimeout(300);
  r = await p.evaluate(() => ['montaje_prfv', 'bpn', 'zanjeo'].map((k) => document.querySelector('#otAct_' + k).checked));
  c(r.every(Boolean), 'tocar a las personas (o adentro de la cajita de «Repartir») no destilda la tarea: ' + JSON.stringify(r));
  r = await p.evaluate(() => { const e = document.getElementById('eqResumen'); return e ? [...e.querySelectorAll('.eq-r-fila')].map((f) => f.innerText.replace(/\s+/g, ' ')) : null; });
  c(r && r.length === 4 && /^👤 Juan Pérez/.test(r[0]) && /Montaje de columna PRFV \(con Pedro\)/.test(r[0]) && /Zanjeo[^·]*\(todos\)/.test(r[0]) && !/BPN|bornera/i.test(r[0]) && /Mario Ruiz.*bornera BPN \(con Luis\)/.test(r[2]), '«📋 Quién hace qué»: cada uno con sus tareas: ' + JSON.stringify(r && r.map((x) => x.slice(0, 70))));
  await p.screenshot({ path: __dirname + '/v094_orden' + (cel ? '_cel' : '') + '.png', fullPage: false });
  if (cel) { const w = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: document.documentElement.clientWidth })); c(w.sw <= w.w + 1, 'celular: sin scroll de costado ' + JSON.stringify(w)); }
  const antes = await p.evaluate(() => ordenesTrabajo.map((o) => o.id));
  await p.click('#otEmitirBtn'); await p.waitForTimeout(1500);
  const ot = await p.evaluate((a) => ordenesTrabajo.find((o) => !a.includes(o.id)), antes);
  c(ot && JSON.stringify(ot.equipoTarea) === JSON.stringify({ montaje_prfv: ['Juan Pérez', 'Pedro Gómez'], bpn: ['Mario Ruiz', 'Luis Díaz'] }) && !Object.keys(ot.asignada || {}).length, 'la orden guarda quiénes hacen cada tarea: ' + JSON.stringify(ot && ot.equipoTarea));
  await p.evaluate((id) => editarOrdenTrabajo(id), ot.id); await p.waitForTimeout(900);
  r = { sel: await p.evaluate(() => document.querySelector('.ot-act-quien[data-id="montaje_prfv"]').value), cj: await caja('montaje_prfv') };
  c(r.sel === '__equipo__' && r.cj && r.cj.chips.join() === '+Juan Pérez,+Pedro Gómez,-Mario Ruiz,-Luis Díaz', 'al editar la orden vuelven los elegidos');
  // una sola persona elegida = asignada como siempre
  await p.click('#otActividades [data-eqk="bpn"][data-eqn="Luis Díaz"]'); await p.waitForTimeout(300);
  await p.click('#otEmitirBtn'); await p.waitForTimeout(1500);
  let o2 = await p.evaluate((id) => ordenesTrabajo.find((o) => o.id === id), ot.id);
  c(o2.asignada && o2.asignada.bpn === 'Mario Ruiz' && !(o2.equipoTarea || {}).bpn && (o2.equipoTarea || {}).montaje_prfv, 'si queda una sola persona, la tarea queda «asignada» a ella como siempre: ' + JSON.stringify({ a: o2.asignada, e: o2.equipoTarea }));
  await p.evaluate(() => typeof salirDeEdicionOt == 'function' && salirDeEdicionOt()); await p.waitForTimeout(300);
  // hoja impresa
  await p.evaluate((id) => imprimirOrdenTrabajo(id), ot.id); await p.waitForTimeout(1500);
  r = await p.evaluate(() => { const d = document.querySelector('#hojaOv iframe').contentDocument; return d.body.innerText.replace(/\s+/g, ' '); });
  c(/La hacen juntos: Juan Pérez · Pedro Gómez/.test(r) && /Asignada a Mario Ruiz/.test(r), 'la orden impresa dice quiénes hacen cada tarea');
  await p.evaluate(() => window.hojaEMA.cerrar());
  await p.evaluate((id) => fbOtUpdate(id, { 'campo.seguridad': { epp: true, baliza: true, herram: true, corte: 'no', por: 'Juan Pérez', ts: Date.now() } }), ot.id); await p.waitForTimeout(600);
  // Mis tareas
  const tarea = (pg, k) => pg.evaluate(([id, k]) => { const t = document.querySelector(`.mt-ot[data-ot="${id}"] .mt-tarea[data-k="${k}"]`); return t ? t.innerText.replace(/\s+/g, ' ') : null; }, [ot.id, k]);
  const J = await otraPagina(A, { sesion: 'juan', cel, espera: 4500, reglas: true, https: true }), pj = J.page;
  await pj.evaluate(() => mostrarVista('mistareas')); await pj.waitForTimeout(1500);
  r = await tarea(pj, 'montaje_prfv');
  c(r && /👥 con Pedro/.test(r), 'Juan ve la columna «👥 con Pedro»: ' + (r && r.slice(0, 90)));
  c(!(await tarea(pj, 'bpn')) && !!(await tarea(pj, 'zanjeo')), 'Juan no ve la tarea de Mario y sí la de toda la cuadrilla');
  await pj.evaluate((id) => { document.querySelector(`.mt-ot[data-ot="${id}"] .mt-tarea[data-k="montaje_prfv"] [data-m="si"]`).click(); }, ot.id); await pj.waitForTimeout(1200);
  const M = await otraPagina(A, { sesion: 'mario', cel, espera: 4500, reglas: true, https: true }), pm = M.page;
  await pm.evaluate(() => mostrarVista('mistareas')); await pm.waitForTimeout(1500);
  c(!(await tarea(pm, 'montaje_prfv')) && !!(await tarea(pm, 'bpn')), 'Mario no ve la columna (es de Juan y Pedro) y sí la suya');
  const P = await otraPagina(A, { sesion: 'pedro', cel, espera: 4500, reglas: true, https: true }), pp = P.page;
  await pp.evaluate(() => mostrarVista('mistareas')); await pp.waitForTimeout(1500);
  r = await pp.evaluate((id) => { const t = document.querySelector(`.mt-ot[data-ot="${id}"] .mt-tarea[data-k="montaje_prfv"]`); return t ? { txt: t.innerText.replace(/\s+/g, ' '), on: !!t.querySelector('[data-m="si"].on') } : null; }, ot.id);
  c(r && /👥 con Juan/.test(r.txt) && r.on, 'Pedro la ve «👥 con Juan» y ya marcada por Juan (es una sola tarea para los dos)');
  await pp.evaluate(() => mostrarVista('inicio')); await pp.waitForTimeout(800);
  r = await pp.evaluate(() => ((document.getElementById('inicioCuadrilla') || {}).innerText || '').replace(/\s+/g, ' '));
  c(/a vos: [^·]*Montaje de columna PRFV \(con Juan\)/.test(r), 'en el Inicio de Pedro: «a vos: Montaje de columna PRFV (con Juan)»');
  // cierre y puntos
  await p.evaluate((id) => abrirCierreOt(id), ot.id); await p.waitForTimeout(900);
  r = await p.evaluate(() => ((document.querySelector('#cierreCuerpo .eq-cierre') || {}).innerText || '').replace(/\s+/g, ' '));
  c(/La hicieron juntos: Juan Pérez, Pedro Gómez/.test(r), 'en el cierre se ve quiénes la hicieron juntos');
  await p.fill('#cierreCuerpo .cierre-qty[data-k="montaje_prfv"]', '1'); await p.fill('#cierreCuerpo .cierre-qty[data-k="bpn"]', '6'); await p.fill('#cierreCuerpo .cierre-qty[data-k="zanjeo"]', '20');
  await p.evaluate(() => { const x = document.querySelector('input[name="coCierreResp"][value="no"]'); x && (x.checked = true); window.guardarCierreOt(); }); await p.waitForTimeout(2500);
  r = await p.evaluate((id) => { const o = ordenesTrabajo.find((x) => x.id === id); const pt = window.puntosDeOrden(o, true); return { pt, fijos: o.cierre && o.cierre.puntos }; }, ot.id);
  const ren = (k) => r.pt.renglones.find((x) => x.k === k), per = (n) => r.pt.porPersona.find((x) => x.nombre.indexOf(n) === 0);
  const mon = ren('montaje_prfv').pts, bpn = ren('bpn').pts, zan = ren('zanjeo').pts;
  const J1 = per('Juan'), P1 = per('Pedro'), M1 = per('Mario'), L1 = per('Luis');
  c(Math.abs(J1.asignado + P1.asignado - mon) < 0.01 && J1.asignado > 0 && P1.asignado > 0, `los ${mon} puntos de la columna son solo de Juan (${J1.asignado.toFixed(2)}) y Pedro (${P1.asignado.toFixed(2)})`);
  c(Math.abs(M1.asignado - bpn) < 0.01 && L1.asignado < 0.01, `la BPN (asignada a Mario) es toda de Mario: ${M1.asignado.toFixed(2)}`);
  const tot = r.pt.porPersona.reduce((s, x) => s + x.pts, 0);
  c(Math.abs(tot - (mon + bpn + zan)) < 0.01 && L1.pts > 0, `no se pierde ni se duplica nada: ${tot.toFixed(2)} = ${(mon + bpn + zan).toFixed(2)} (el zanjeo de todos lo cobra también Luis: ${L1.pts.toFixed(2)})`);
  c(r.fijos && r.fijos.porPersona && Math.abs(r.fijos.porPersona.find((x) => /Juan/.test(x.nombre)).asignado - J1.asignado) < 0.01, 'al cerrar, los puntos quedan fijados con este reparto');
  const errs = A.errores.concat(J.errores, P.errores, M.errores).filter((e) => !/Missing or insufficient permissions|permission-denied|error occurred when fetching the script|ERR_|Failed to fetch|aborted/i.test(e));
  c(!errs.length, 'sin errores de JS ' + JSON.stringify(errs.slice(0, 3)));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
