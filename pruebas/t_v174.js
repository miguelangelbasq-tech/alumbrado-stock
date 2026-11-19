// v174 · La nómina y los vehículos no se pierden (Ángel 19/11).
//  0) el bug: la base tarda en contestar (demora 12 s), Administración abre Personal del equipo, cambia un rol y toca «Guardar».
//     ANTES=1 (v173): se graban las 10 de la lista de ejemplo (se pierden 5 personas). Ahora: «Cargando la nómina…», no se graba
//     nada y cuando llega la base se ven las 15.
//  1) sacar a alguien → hoja «¿Sacar 1 de la nómina?» (Cancelar no guarda; Sí guarda) + respaldos[] con la anterior + auditoría;
//     el campo equipoCivil no se pierde al guardar desde la tabla; la lista de ejemplo no se graba nunca.
//  2) vehículos: borrar todos pide «Sí»; Cancelar no toca la base.
//  3) recuperar (la base como quedó el 18/11): propone los 5 de las órdenes con su rol, legajo (quincena) y vehículo, y los 3
//     vehículos de las órdenes; no saca a nadie (Lastra sigue «Medio oficial»); escribe solo con «Sí».
//  4) copia en el aparato: un aparato que tenía la nómina buena la guarda al abrir; con la base mala ofrece completar el valor
//     hora, el vehículo a cargo, el sector, equipo civil y los tipos/lugares de los vehículos; archivo de respaldo.
//  5) roles: solo Administración ve la tarjeta; la cuadrilla no.
const { abrir, prueba } = require('./h');
const { datos174, FAB } = require('./datos174');
const cel = process.argv[2] === 'cel';
const ANTES = !!process.env.ANTES;
const REGLAS = !!process.env.REGLAS;
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.split(',').indexOf(String(x)) >= 0;
(async () => {
  const c = prueba('v174' + (cel ? ' cel' : '') + (ANTES ? ' ANTES' : '') + (REGLAS ? ' REGLAS' : ''));
  let browser = null;
  const sesion = async (quien, datos, op) => { const A = await abrir(Object.assign({ sesion: quien, datos, browser, cel, espera: 3500 }, op || {})); browser = A.browser; A.page.on('dialog', (x) => x.accept()); return A; };
  const base = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('stub.db')).configEquipo.personal);
  const irPersonal = async (p) => { await p.evaluate(() => { mostrarVista('produccion'); }); await p.waitForTimeout(300); await p.evaluate(() => { const s = document.querySelector('#subtabsProd [data-sub="personal"]'); s && s.click(); }); await p.waitForTimeout(700); };
  const tx = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, sel);
  const sinScroll = (p) => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  try {
    if (SOLO(0)) {
      const A = await sesion('admin', datos174(), { demora: { 'configEquipo/personal': 12000 }, espera: 1500 }), p = A.page;
      await irPersonal(p);
      const filas = await p.evaluate(() => document.querySelectorAll('#personalBody tr').length);
      await p.evaluate(() => { const s = document.querySelector('#personalBody tr[data-i="2"] .per-rol'); if (s) { s.value = 'Medio oficial'; s.dispatchEvent(new Event('change', { bubbles: true })); } });
      const btn = await p.evaluate(() => { const b = document.querySelector('#prodPanelPersonal button[onclick="guardarPersonalEquipo()"]'); return { dis: b.disabled, t: b.textContent }; });
      await p.evaluate(() => guardarPersonalEquipo()); await p.waitForTimeout(800);
      const b0 = await base(p), msg = await tx(p, '#personalMsg');
      if (ANTES) c(b0.nomina.length === 10 && !b0.nomina.some((x) => /OLARIAGA/.test(x.nombre)), `v173: con la base sin llegar, «Guardar» grabó la lista de ejemplo (${b0.nomina.length} personas, sin JAVIER OLARIAGA) · en pantalla ${filas}`);
      else {
        c(filas === 10 && btn.dis && /Cargando la nómina/.test(btn.t), `antes de que llegue la base: «${btn.t}» deshabilitado (${filas} filas de ejemplo)`);
        c(b0.nomina.length === 15 && b0.vehiculos.length === 3, `«Guardar» igual (a la fuerza) no grabó nada: la base sigue con ${b0.nomina.length} personas y ${b0.vehiculos.length} vehículos`);
        c(/Todavía no llegó la nómina/.test(msg), 'el mensaje dice por qué: ' + msg.slice(0, 90));
        c(/Cargando la nómina/.test(await tx(p, '#psAviso')), 'cartel «Cargando la nómina de la base…» (role=status)');
        await p.waitForTimeout(12000);
        const f2 = await p.evaluate(() => document.querySelectorAll('#personalBody tr').length), b2 = await p.evaluate(() => { const b = document.querySelector('#prodPanelPersonal button[onclick="guardarPersonalEquipo()"]'); return { dis: b.disabled, t: b.textContent }; });
        c(f2 === 15 && !b2.dis && b2.t === 'Guardar', `cuando llega la base: ${f2} personas en pantalla y «Guardar» habilitado`);
      }
      await A.browser.close(); browser = null;
    }
    if (SOLO(1) && !ANTES) {
      const A = await sesion('admin', datos174()), p = A.page;
      await irPersonal(p);
      c((await p.evaluate(() => document.querySelectorAll('#personalBody tr').length)) === 15, 'la pantalla muestra las 15 de la base');
      await p.evaluate(() => { const s = document.querySelector('#personalBody tr[data-i="14"] .per-nombre'); s.closest('tr').remove(); });
      await p.evaluate(() => { guardarPersonalEquipo(); }); await p.waitForTimeout(600);
      const h = await tx(p, '#psConf');
      c(/Sacar 1 de la nómina/.test(h) && /Vizgarra Alfredo/.test(h), 'hoja «¿Sacar 1 de la nómina?» con el nombre: ' + h.slice(0, 80));
      c(await p.evaluate(() => { const d = document.getElementById('psConf'); return d.getAttribute('role') === 'dialog' && !!d.querySelector('[aria-label="Cerrar"]'); }), 'la hoja es role=dialog con ✕');
      await p.click('#psConf [data-psc="no"]'); await p.waitForTimeout(500);
      c((await base(p)).nomina.length === 15, 'Cancelar: la base sigue con 15');
      await p.evaluate(() => { guardarPersonalEquipo(); }); await p.waitForTimeout(600);
      await p.evaluate(() => { const s = document.querySelector('#personalBody .per-nombre'); });
      await irPersonal(p); await p.evaluate(() => { const s = [...document.querySelectorAll('#personalBody .per-nombre')].find((x) => /Vizgarra/.test(x.value)); s && s.closest('tr').remove(); guardarPersonalEquipo(); }); await p.waitForTimeout(600);
      await p.click('#psConf [data-psc="si"]'); await p.waitForTimeout(800);
      const b = await base(p);
      c(b.nomina.length === 14 && Array.isArray(b.respaldos) && b.respaldos.length >= 1 && b.respaldos[b.respaldos.length - 1].nomina.length === 15, `Sí: 14 en la base y respaldos[] con la anterior de 15 (${(b.respaldos || []).length} copia/s)`);
      c(b.nomina.find((x) => x.nombre === 'Víctor Exequiel Franco').equipoCivil === true, 'el «equipo civil» de Víctor no se perdió al guardar desde la tabla');
      const au = await p.evaluate(() => Object.values(JSON.parse(localStorage.getItem('stub.db')).auditoria || {}).filter((x) => x.accion === 'personal_guardar'));
      c(au.length >= 1 && au[au.length - 1].antes.personas === 15 && au[au.length - 1].despues.personas === 14 && /Vizgarra/.test(au[au.length - 1].sacados.join()), 'auditoría personal_guardar con antes 15 → después 14 y quién salió');
      // la lista de ejemplo no se graba (aunque se pida directo)
      const e = await p.evaluate(async () => { try { await window.fbPersonalGuardar({ nomina: JSON.parse(JSON.stringify(window.nominaEquipo().slice(0, 10).map((x, i) => ({ nombre: ['Mauricio Mainini', 'Pablo Maximiliano Picone', 'Lastra Sergi Ariel', 'Víctor Exequiel Franco', 'Franco Nahuel Esequiel González', 'Marcos Marcelo González', 'Leandro Luis Damián Toledo Ontivero', 'Marcos Mancloba', 'Ulises Toledo', 'Herrera Juan Carlos'][i], rol: 'Oficial' })))) }); return 'guardó'; } catch (er) { return er.code; } });
      c(e === 'ps-fabrica', 'la lista de ejemplo no se graba (' + e + ')');
      c(await sinScroll(p), 'sin scroll de costado');
      await A.browser.close(); browser = null;
    }
    if (SOLO(2) && !ANTES) {
      const A = await sesion('admin', datos174()), p = A.page;
      await irPersonal(p);
      const pr = p.evaluate(async () => { try { await window.__vehiculos.guardar([]); return 'guardó'; } catch (e) { return e.code; } });
      await p.waitForTimeout(700);
      const h = await tx(p, '#psConf');
      c(/borrar todos los vehículos/i.test(h) && /Hilux blanca/.test(h), 'borrar todos los vehículos pide «Sí»: ' + h.slice(0, 90));
      await p.click('#psConf [data-psc="no"]');
      c((await pr) === 'ps-cancelado' && (await base(p)).vehiculos.length === 3, 'Cancelar: los 3 vehículos siguen en la base');
      await A.browser.close(); browser = null;
    }
    if (SOLO(3) && !ANTES) {
      const A = await sesion('admin', datos174({ mal: true })), p = A.page;
      await irPersonal(p); await p.waitForTimeout(500);
      c(/Recuperar personal y vehículos/.test(await tx(p, '#psRec')), 'Administración ve «🩹 Recuperar personal y vehículos»');
      await p.click('#psRec [data-ps="abrir"]'); await p.waitForTimeout(1500);
      const A3 = await p.evaluate(() => window.__psRec.estado().A);
      const faltan = A3.faltan.map((x) => x.nombre);
      c(['JAVIER OLARIAGA', 'Ivan Exequiel Pereyra', 'PETITTI ISMAEL', 'Bruno Federico Cherino', 'Vizgarra Alfredo'].every((n) => faltan.indexOf(n) >= 0), 'propone a los 5 que faltan: ' + faltan.join(', '));
      const jav = A3.faltan.find((x) => x.nombre === 'JAVIER OLARIAGA'), pet = A3.faltan.find((x) => x.nombre === 'PETITTI ISMAEL');
      c(jav.datos.rol.v === 'Oficial' && jav.datos.legajo.v === '51400' && jav.datos.vehiculoId.v === 'v1', 'Javier: rol Oficial, legajo 51400 (quincena), vehículo a cargo Hilux (orden)');
      c(pet.datos.rol.v === 'Medio oficial' && /orden/.test(pet.datos.rol.fuente), 'Petitti: Medio oficial, de la orden');
      c(A3.vFaltan.length === 3 && A3.vFaltan.some((x) => x.v.nombre === 'Grúa' && x.v.patente === 'AD789GH'), 'propone los 3 vehículos de las órdenes con su patente');
      c(A3.perdido.some((x) => /valor hora/.test(x)), 'dice lo que no está en ningún lado (valor hora…)');
      c(/18\/11/.test(A3.linea.join(' ')), 'la línea de tiempo dice cuándo se guardó por última vez (18/11)');
      c((await base(p)).nomina.length === 10, 'mirar no escribe nada');
      c(await p.evaluate(() => { const d = document.getElementById('psOv'); return d.getAttribute('role') === 'dialog' && !!d.querySelector('[aria-label="Cerrar"]') && d.querySelectorAll('input[data-pssel]').length >= 8; }), 'hoja role=dialog con ✕ y casillas por fila');
      // destildar a Bruno
      await p.evaluate(() => { const i = window.__psRec.estado().A.faltan.findIndex((x) => /Cherino/.test(x.nombre)); const e = document.querySelector(`#psOv input[data-pssel="p${i}"]`); e.click(); });
      await p.waitForTimeout(300);
      await p.click('#psOv [data-ps="si"]'); await p.waitForTimeout(600);
      c(/Agregar a la nómina/.test(await tx(p, '#psConf')), 'pide «Sí» antes de guardar');
      await p.click('#psConf [data-psc="si"]'); await p.waitForTimeout(1200);
      const b = await base(p);
      c(b.nomina.length >= 14 && !b.nomina.some((x) => /Cherino/.test(x.nombre)) && b.nomina.some((x) => x.nombre === 'Vizgarra Alfredo' && x.vehiculoId === 'v3'), `agregó los tildados (${b.nomina.length} personas; Bruno no, estaba destildado)`);
      c(b.nomina.find((x) => x.nombre === 'Lastra Sergi Ariel').rol === 'Medio oficial' && FAB.every(([, n]) => b.nomina.some((x) => x.nombre === n)), 'no sacó a nadie ni cambió el rol que puso Ángel');
      c(b.vehiculos.length === 3 && b.respaldos && b.respaldos.length === 1 && b.respaldos[0].nomina.length === 10, '3 vehículos y respaldo de cómo estaba (10)');
      const au = await p.evaluate(() => Object.values(JSON.parse(localStorage.getItem('stub.db')).auditoria || {}).filter((x) => x.accion === 'personal_recuperar'));
      c(au.length === 1, 'auditoría personal_recuperar');
      c(/✓ Guardado: \d+ personas, 3 vehículos/.test(await tx(p, '#psMsg')), 'lo lee de vuelta de la base: ' + (await tx(p, '#psMsg')).slice(0, 60));
      c(await sinScroll(p), 'sin scroll de costado');
      await A.browser.close(); browser = null;
    }
    if (SOLO(4) && !ANTES) {
      const A = await sesion('admin', datos174()), p = A.page;
      await p.waitForTimeout(500);
      const loc = await p.evaluate(() => JSON.parse(localStorage.getItem('ema.personal.respaldoLocal') || '[]'));
      c(loc.length >= 1 && loc[0].nomina.length === 15, 'el aparato guardó la nómina que llegó (15)');
      // la base pasa a la mala (como el 18/11) y se vuelve a abrir en el mismo aparato
      const mala = datos174({ mal: true }).db.configEquipo.personal;
      await p.evaluate((m) => { const d = JSON.parse(localStorage.getItem('stub.db')); d.configEquipo.personal = m; localStorage.setItem('stub.db', JSON.stringify(d)); }, mala);
      await p.reload(); await p.waitForTimeout(4500);
      await irPersonal(p); await p.waitForTimeout(500);
      await p.click('#psRec [data-ps="abrir"]'); await p.waitForTimeout(1500);
      const A4 = await p.evaluate(() => window.__psRec.estado().A);
      c(A4.copias.some((x) => /este aparato/.test(x.fuente) && x.personas === 15), 'encuentra la copia de este aparato (15 personas)');
      const viz = A4.faltan.find((x) => x.nombre === 'Vizgarra Alfredo');
      c(viz && viz.datos.valorHora.v === 5000 && viz.datos.sector.v === 'ilicitos', 'Vizgarra: valor hora y sector de la copia');
      c(A4.completar.some((x) => x.nombre === 'Mauricio Mainini' && x.campo === 'valorHora') && A4.completar.some((x) => x.nombre === 'Víctor Exequiel Franco' && x.campo === 'equipoCivil'), 'completa el valor hora y el equipo civil de los que quedaron');
      c(A4.vFaltan.some((x) => x.v.nombre === 'Grúa' && x.v.tipo === 'grua' && x.v.lugares === 2), 'la grúa vuelve con su tipo y lugares');
      await p.click('#psOv [data-ps="si"]'); await p.waitForTimeout(500); await p.click('#psConf [data-psc="si"]'); await p.waitForTimeout(1200);
      const b = await base(p);
      c(require('./datos174').nominaReal().every((r) => b.nomina.some((x) => x.nombre === r.nombre)) && b.nomina.find((x) => x.nombre === 'Mauricio Mainini').valorHora === 4000 && b.nomina.find((x) => x.nombre === 'Lastra Sergi Ariel').rol === 'Medio oficial' && b.vehiculos.length === 3, 'vuelve todo: las 15 personas (' + b.nomina.length + ' con Juan y Pedro de las órdenes de prueba), valor hora, 3 vehículos (Lastra queda Medio oficial)');
      // archivo de respaldo
      await p.evaluate(() => { window.__psRec.leerArchivo(JSON.stringify({ formato: 'respaldo-completo-v2', configEquipo: { personal: { nomina: [{ nombre: 'Persona Del Archivo', rol: 'Oficial', legajo: '1' }], vehiculos: [] } } }), 'respaldo_completo_2026-11-10.json'); });
      const A5 = await p.evaluate(() => window.__psRec.analizar());
      c(A5.faltan.some((x) => x.nombre === 'Persona Del Archivo' && /archivo de respaldo/.test(x.datos.rol.fuente)), 'un archivo de respaldo suma lo que trae');
      await A.browser.close(); browser = null;
    }
    if (SOLO(6) && !ANTES) {
      const d = datos174(); d.db.configEquipo.baremo = Object.assign({}, d.db.configEquipo.baremo || {}, { tareasPropias: [{ id: 'propia_x1', label: 'Pintar bases', un: 'columna', pts: 1 }] });
      const A = await sesion('admin', d, { demora: { 'configEquipo/baremo': 9000 }, espera: 1500 }), p = A.page;
      const e1 = await p.evaluate(async () => { try { await window.fbBaremoGuardar({ tareasPropias: [] }); return 'guardó'; } catch (e) { return e.code; } });
      c(e1 === 'ps-cargando', 'baremo: no se guarda antes de que llegue de la base (' + e1 + ')');
      await p.waitForTimeout(9500);
      const pr = p.evaluate(async () => { try { await window.fbBaremoGuardar({ tareasPropias: [] }); return 'guardó'; } catch (e) { return e.code; } });
      await p.waitForTimeout(700);
      c(/Pintar bases/.test(await tx(p, '#psConf')), 'baremo: sacar una tarea propia pide «Sí»');
      await p.click('#psConf [data-psc="si"]'); c((await pr) === 'guardó', 'Sí: se guarda');
      await p.waitForTimeout(500);
      const b = await p.evaluate(() => JSON.parse(localStorage.getItem('stub.db')).configEquipo.baremo);
      c(Array.isArray(b.respaldos) && b.respaldos[0].campos.tareasPropias[0].label === 'Pintar bases', 'baremo.respaldos[] con lo que había antes');
      await A.browser.close(); browser = null;
    }
    if (SOLO(5) && !ANTES) {
      const A = await sesion('pedro', datos174()), p = A.page;
      await p.waitForTimeout(800);
      c(!(await p.evaluate(() => !!document.getElementById('psRec'))), 'la cuadrilla no ve la tarjeta de recuperar');
      await A.browser.close(); browser = null;
    }
  } catch (e) { c(false, 'error: ' + (e && e.stack || e)); }
  if (browser) await browser.close();
  process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
