// Pruebas v028: una foto por cada caja / columna, con su nombre; elegir o escribir corto; para enviar, todas las fotos.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
const FOTO = __dirname + '/foto.jpg';
function datos() {
  const d = baseDatos(), ahora = Date.now();
  const seg = { epp: true, baliza: true, herram: true, corte: 'no', por: 'Juan Pérez', ts: ahora };
  d.db.avanceObras.p1.puntos = ['T1 · C1 · Col 1', 'T1 · C1 · Col 2', 'T1 · C1 · Col 3', 'T1 · C2 · Col 1', 'T1 · C2 · Col 2', 'T1 · C2 · Col 3'];
  Object.assign(d.db.ordenesTrabajo.ot1, { actividades: ['bpn'], actividadesManuales: [], previsto: { bpn: 5 }, campo: { seguridad: seg } });
  d.db.avanceObras.p2 = { nombre: 'Plaza Sin Nombres', obraId: '7777', creado: ahora, secciones: [], valorItems: [], grupos: [], etapas: {} };
  d.db.ordenesTrabajo.ot2 = Object.assign({}, d.db.ordenesTrabajo.ot1, { numero: 'OT-2026-002', plazaId: 'p2', plazaNombre: 'Plaza Sin Nombres', actividades: [], previsto: {}, actividadesManuales: [{ actividad: 'Izado de columnas', detalle: '3 columnas' }], campo: { seguridad: seg } });
  return d;
}
(async () => {
  const c = prueba('v028' + (cel ? ' cel' : ''));
  const { browser, page, errores } = await abrir({ sesion: 'juan', cel, datos: datos(), espera: 4000, reglas: true });
  const dlg = []; page.on('dialog', d => { dlg.push(d.message()); d.accept(); });
  const caja = (num) => `.mt-ot[data-ot="${num}"] .fl-caja`;
  const info = (ot) => page.evaluate(sel => { const b = document.querySelector(sel); if (!b) return null; return { cuenta: b.querySelector('.fl-cuenta').textContent.trim(), filas: [...b.querySelectorAll('.fl-fila')].map(f => f.innerText.replace(/\s+/g, ' ').trim()), ayuda: (b.querySelector('.fl-ayuda') || {}).textContent || '' }; }, caja(ot));
  let r = await info('ot1');
  c(r && r.filas.length === 5 && r.cuenta === '0 de 5', 'la tarea de 5 cajas muestra 5 filas, sin marcar «Se hizo» antes: ' + (r && r.cuenta));
  c(r && /T1 · C1 · Col 1/.test(r.filas[0]) && /T1 · C2 · Col 2/.test(r.filas[4]), 'cada fila ya trae el nombre de la obra (T1 · C1 · Col 1 … T1 · C2 · Col 2)');
  c(r && /Son 5 cajas/.test(r.ayuda) && /tocá el nombre/.test(r.ayuda), 'explica claro: «Son 5 cajas: sacale la foto a cada una… tocá el nombre y cambialo»');
  await page.screenshot({ path: __dirname + '/v028_lista' + (cel ? '_cel' : '') + '.png' });
  // primera foto: 📷 de la fila 1
  await page.setInputFiles(caja('ot1') + ' input.mt-foto-t[data-fli="0"]', FOTO); await page.waitForTimeout(1800);
  r = await info('ot1');
  c(r && r.cuenta === '1 de 5' && /✅ T1 · C1 · Col 1/.test(r.filas[0]) && /T1 · C1 · Col 2/.test(r.filas[1]), 'sacó la foto de la Col 1: queda ✅ y la próxima ya es la Col 2 (' + (r && r.cuenta) + ')');
  let f = await page.evaluate(() => { const o = ordenesTrabajo.find(x => x.id === 'ot1'); return Object.values((o.campo || {}).fotos || {}).map(x => [x.cat, x.num]); });
  c(f.length === 1 && f[0][0] === 'caja' && f[0][1] === 'T1 · C1 · Col 1', 'la foto quedó guardada como «caja · T1 · C1 · Col 1»');
  // cambiar el nombre de la fila 2 escribiendo corto «c2 3» → T1 · C2 · Col 3, y se abre la cámara sola desde el 📷 sin nombre? (acá: tocar el nombre)
  await page.click(caja('ot1') + ' .fl-nom-btn[data-fli="1"]'); await page.waitForTimeout(300);
  c(await page.evaluate(() => !!document.getElementById('flSel')), 'tocando el nombre se abre la hoja para elegir o escribir');
  r = await page.evaluate(() => [...document.querySelectorAll('#flSel .pt-chip')].map(b => b.textContent.trim()));
  c(r.length === 6 && r.filter(x => /✅/.test(x)).length === 1, 'muestra las 6 columnas de la obra, la que ya tiene foto en verde');
  await page.fill('#flQ', 'c2 3'); await page.waitForTimeout(200);
  r = await page.evaluate(() => ({ chips: [...document.querySelectorAll('#flSel .pt-chip')].map(b => b.title), usar: (document.querySelector('#flSel [data-fl="usarTxt"]') || {}).textContent }));
  c(r.chips.length === 1 && r.chips[0] === 'T1 · C2 · Col 3' && /Usar «T1 · C2 · Col 3»/.test(r.usar || ''), 'escribiendo «c2 3» queda solo «T1 · C2 · Col 3» y el botón para usarla');
  await page.keyboard.press('Enter'); await page.waitForTimeout(400);
  r = await info('ot1');
  c(r && /T1 · C2 · Col 3/.test(r.filas[1]) && !(await page.evaluate(() => !!document.getElementById('flSel'))), 'Enter la pone en la fila 2 y cierra la hoja');
  await page.setInputFiles(caja('ot1') + ' input.mt-foto-t[data-fli="1"]', FOTO); await page.waitForTimeout(1800);
  f = await page.evaluate(() => { const o = ordenesTrabajo.find(x => x.id === 'ot1'); return Object.values((o.campo || {}).fotos || {}).map(x => x.num).sort(); });
  c(f.length === 2 && f.includes('T1 · C2 · Col 3'), 'la segunda foto quedó con el nombre que se escribió');
  r = await info('ot1');
  c(r && r.cuenta === '2 de 5' && !r.filas.slice(2).some(x => /C2 · Col 3/.test(x)), 'van 2 de 5 y la C2 · Col 3 no se repite en las que faltan');
  // para enviar: marcar hecho con 4 → faltan fotos
  await page.click('.mt-ot[data-ot="ot1"] .mt-tarea [data-m="si"]'); await page.waitForTimeout(500);
  await page.fill('.mt-ot[data-ot="ot1"] .mt-cant-in', '4'); await page.dispatchEvent('.mt-ot[data-ot="ot1"] .mt-cant-in', 'change'); await page.waitForTimeout(600);
  r = await info('ot1');
  c(r && r.cuenta === '2 de 4', 'si hizo 4 («¿Cuánto?» = 4), pide 4 fotos: ' + (r && r.cuenta));
  dlg.length = 0;
  await page.click('.mt-ot[data-ot="ot1"] .mt-enviar'); await page.waitForTimeout(500);
  const aviso = async () => { const x = await page.evaluate(() => { const a = document.getElementById('avisoApp'); return a && getComputedStyle(a).display !== 'none' ? a.innerText : ''; }); if (x) { dlg.push(x); await page.evaluate(() => { const a = document.getElementById('avisoApp'); const b = a && [...a.querySelectorAll('button')].pop(); b && b.click(); }); await page.waitForTimeout(200); } return x; };
  await aviso();
  c(dlg.some(m => /van 2 de 4 fotos de cajas/.test(m)), 'no deja enviar: «Conexionado de bornera BPN (van 2 de 4 fotos de cajas)»');
  for (const i of [2, 3]) { await page.setInputFiles(caja('ot1') + ` input.mt-foto-t[data-fli="${i}"]`, FOTO); await page.waitForTimeout(1800); }
  r = await info('ot1');
  c(r && r.cuenta === '4 de 4', 'con las 4 fotos: 4 de 4');
  dlg.length = 0; await page.click('.mt-ot[data-ot="ot1"] .mt-enviar'); await page.waitForTimeout(900); await aviso();
  const env = await page.evaluate(() => Object.keys(((ordenesTrabajo.find(x => x.id === 'ot1').campo || {}).enviados) || {}).length);
  c(env === 1 && !dlg.some(m => /Falta en/.test(m)), 'ahora sí se envía');
  // obra SIN nombres guardados: tarea a mano «3 columnas» → 3 filas sin nombre; 📷 abre la hoja con tablero/circuito/columna
  r = await info('ot2');
  c(r && r.filas.length === 3 && r.cuenta === '0 de 3' && /¿Cuál es\?/.test(r.filas[0]), 'obra sin nombres: «Izado de columnas — 3 columnas» → 3 filas para elegir');
  await page.click(caja('ot2') + ' button.fl-cam[data-fli="0"]'); await page.waitForTimeout(300);
  r = await page.evaluate(() => ({ armar: document.querySelectorAll('#flSel [data-flarm]').length, usar: (document.querySelector('#flSel [data-fl="usarArm"]') || {}).textContent || '' }));
  c(r.armar === 52 && /Usar «T1 · C1 · Col 1»/.test(r.usar), 'el 📷 abre la hoja con botones T1–4, C1–8 y Col 1–40 para armarlo rápido (' + r.armar + ', ' + r.usar.trim() + ')');
  await page.click('#flSel [data-flarm="c"][data-v="2"]'); await page.click('#flSel [data-flarm="col"][data-v="5"]');
  const [chooser] = await Promise.all([page.waitForEvent('filechooser', { timeout: 3000 }).catch(() => null), page.click('#flSel [data-fl="usarArm"]')]);
  c(!!chooser, 'tocando «📷 Usar «T1 · C2 · Col 5»» se abre la cámara directo');
  if (chooser) { await page.waitForTimeout(1500); await chooser.setFiles(FOTO); await page.waitForTimeout(1800); }   // v109: una persona tarda en sacar la foto; contestar la cámara al instante era una carrera de la prueba
  r = await info('ot2');
  c(r && /✅ T1 · C2 · Col 5/.test(r.filas[0]) && /T1 · C2 · Col 6/.test(r.filas[1]), 'quedó «T1 · C2 · Col 5» y la próxima propone «T1 · C2 · Col 6»');
  // escribir solo un número en obra sin nombres
  await page.click(caja('ot2') + ' .fl-nom-btn[data-fli="1"]'); await page.fill('#flQ', '9'); await page.waitForTimeout(150);
  r = await page.evaluate(() => (document.querySelector('#flSel [data-fl="usarTxt"]') || {}).textContent || '');
  c(/Usar «Col 9»/.test(r), 'escribiendo solo «9» propone «Col 9»');
  await page.keyboard.press('Escape');
  await page.screenshot({ path: __dirname + '/v028_fin' + (cel ? '_cel' : '') + '.png', fullPage: false });
  const neg = await page.evaluate(() => (window.__stubNegadas || []).filter(x => /^(create|update|delete)/.test(x)));
  c(!neg.length, 'la base (reglas reales simuladas) no rechazó nada ' + JSON.stringify(neg));
  const errs = errores.filter(e => !/Missing or insufficient permissions|No se pudo conectar con la base de stock/.test(e));
  c(!errs.length, 'sin errores de JS ' + JSON.stringify(errs.slice(0, 3)));
  await browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
