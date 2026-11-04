const { abrir, baseDatos } = require('./h');
(async () => {
  const d = baseDatos();
  const A = await abrir({ sesion: 'admin', datos: d, espera: 3500, reglas: true }), p = A.page;
  const dlg = []; p.on('dialog', (x) => { dlg.push(x.message().slice(0, 160)); x.accept(); });
  const w = (ms) => p.waitForTimeout(ms);
  await p.evaluate(() => mostrarVista('calc')); await w(700);
  const r1 = await p.evaluate(async () => {
    const w = (ms) => new Promise((r) => setTimeout(r, ms));
    document.getElementById('obraNombre').value = 'Plaza San Martín'; document.getElementById('obraId').value = '1234';
    columnaGrupos.length = 0; columnaGrupos.push({ id: 1, altura: 7, columnas: 7 }); renderColumnaGrupos();
    vinculoGrupos.length = 0; vinculoGrupos.push({ id: 1, tipo: 'simple_400', columnas: 7, sobre: 'nueva' }); try { renderVinculoGrupos(); } catch (e) { }
    const tg = (id, v) => { const e = document.getElementById(id); if (e && e.type === 'checkbox' && e.checked !== v) { e.checked = v; e.dispatchEvent(new Event('change', { bubbles: true })); } };
    tg('toggleCivil', true); const z = document.getElementById('civilZanjaMl'); if (z) { z.value = '100'; z.dispatchEvent(new Event('input', { bubbles: true })); }
    tg('toggleTablero', true); tg('togglePat', true);
    calcular(); await w(1500);
    const o = avanceObras.find((x) => x.id === 'p1'); const pv = window.epecPreviaDe(o);
    return { fuente: pv && pv.fuente, filas: ((pv && pv.filas) || []).map((f) => f.item + '=' + f.cantidad), dudas: ((pv && pv.dudas) || []).length };
  });
  console.log('1) CALCULADORA → vista previa del itemizado:', JSON.stringify(r1));
  const r2 = await p.evaluate(async () => {
    const o = avanceObras.find((x) => x.id === 'p1'); const pv = window.epecPreviaDe(o);
    o.valorItems = (pv.filas || []).map((f, i) => ({ id: i + 1, itemPliego: String(f.item), cantidad: f.cantidad, cantidadAvanzada: 0 }));
    await guardarAvanceObras(o); await new Promise((r) => setTimeout(r, 600));
    return { totales: window.totalesDeObra(o), pct: window.avanceItemizadoPct(o) };
  });
  console.log('2) ITEMIZADO cargado → tareas que salen (Quedan T):', JSON.stringify(r2));
  // orden con varias tareas
  await p.evaluate(async (hoy) => {
    await firebase.firestore().collection('ordenesTrabajo').doc('o1').set({ numero: 'OT-2026-500', fecha: hoy, plazaId: 'p1', plazaNombre: 'Plaza San Martín', cuadrilla: 'C1', horaInicio: '07:00', horaFin: '15:00', personal: [{ nombre: 'Juan Pérez', rol: 'Oficial' }, { nombre: 'Pedro Gómez', rol: 'Ayudante' }], personalNombres: ['juan perez', 'pedro gomez'], actividades: ['excavacion', 'hormigonado', 'armado_vinculo', 'armado_luminaria', 'armado_tablerito', 'montaje_prfv', 'montaje_vinculo', 'montaje_luminaria', 'conexionado_tablerito', 'sellado_base', 'zanjeo', 'tapado_zanja', 'tendido_cable', 'colocacion_tablero', 'armado_tablero', 'pat', 'prueba_encendido'], previsto: {}, estado: 'En curso', creado: Date.now() });
  }, d.hoy);
  await w(900);
  await p.evaluate(() => mostrarVista('parte')); await w(400);
  await p.evaluate(() => window.abrirCierreOt('o1')); await w(900);
  const q = { excavacion: 7, hormigonado: 7, armado_vinculo: 7, armado_luminaria: 7, armado_tablerito: 7, montaje_prfv: 8, montaje_vinculo: 7, montaje_luminaria: 7, conexionado_tablerito: 7, sellado_base: 7, zanjeo: 120, tapado_zanja: 120, tendido_cable: 150, colocacion_tablero: 1, armado_tablero: 1, pat: 3, prueba_encendido: 1 };
  for (const [k, v] of Object.entries(q)) { await p.fill(`#cierreCuerpo .cierre-qty[data-k="${k}"]`, String(v)).catch(() => console.log('sin campo', k)); }
  await w(1200);
  const r3 = await p.evaluate(() => ({ efectos: (document.getElementById('cierreEfectos') || {}).innerText, co: [...document.querySelectorAll('#cierreCuerpo input[type=radio]')].map((x) => x.name + ':' + x.value + ' «' + ((x.closest('label') || {}).innerText || '').slice(0, 80) + '»') }));
  console.log('3) CIERRE: lo que dice que va a avanzar:\n' + r3.efectos + '\n   opciones del paso del itemizado: ' + JSON.stringify(r3.co));
  await p.evaluate(async () => { const x = document.querySelector('input[name="coCierreResp"][value="no"]'); x && (x.checked = true, x.dispatchEvent(new Event('change', { bubbles: true }))); });
  await w(500);
  const r3b = await p.evaluate(() => { const t = document.getElementById('cierreCuerpo').innerText; const i = t.lastIndexOf('No, se hizo lo previsto'); return t.slice(i - 900, i + 1800); });
  console.log('   texto del paso del itemizado (con «sí»):\n' + r3b);
  await p.evaluate(async () => { try { await guardarCierreOt(); } catch (e) { console.log('err', e); } }); await w(2000);
  const r4 = await p.evaluate(() => { const o = window.__stubDB().avanceObras.p1; const ot = window.__stubDB().ordenesTrabajo.o1; return { msg: (document.getElementById('cierreMsg') || {}).innerText, items: (o.valorItems || []).map((r) => r.itemPliego + ' ' + r.cantidadAvanzada + '/' + r.cantidad), coAjustes: (o.coAjustes || []).length, avanceItems: ot.cierre && ot.cierre.avanceItems, pct: window.avanceItemizadoPct(o), falta: window.__aviFaltan && window.__aviFaltan(o), etapa: etapaActualLabel(o) }; });
  console.log('4) DESPUÉS DEL CIERRE:', JSON.stringify(r4, null, 1));
  const r5 = await p.evaluate(() => { const s = window.saldoObra ? window.saldoObra('p1') : null; return s && Object.fromEntries(Object.entries(s.tareas || {}).map(([k, v]) => [k, `total ${v.total} hecho ${v.hecho} (órdenes ${v.hechoOrdenes}, avance ${v.hechoAvance}) queda ${v.queda}`])); });
  console.log('5) «Quedan» para la próxima orden:', JSON.stringify(r5));
  const r6 = await p.evaluate(async () => { window.irSubOrdenes('nueva'); await new Promise((r) => setTimeout(r, 600)); const sel = document.getElementById('otPlaza') || document.querySelector('#viewParteDiario select'); if (sel) { const op = [...sel.options].find((o) => /San Mart/.test(o.textContent)); if (op) { sel.value = op.value; sel.dispatchEvent(new Event('change', { bubbles: true })); } } await new Promise((r) => setTimeout(r, 800)); const ts = [...document.querySelectorAll('.ot-tarea')]; return { total: ts.length, conQuedan: ts.filter((t) => /Quedan|quedan/.test(t.innerText)).length, primeras: ts.slice(0, 8).map((t) => t.innerText.replace(/\s+/g, ' ').slice(0, 70)) }; });
  console.log('6) ORDEN NUEVA para la obra:', JSON.stringify(r6, null, 1));
  const r7 = await p.evaluate(() => { const o = avanceObras.find((x) => x.id === 'p1'); return window.__diferenciasObra(o).map((d) => `${d.nombre}: hecho ${d.hecho} contratado ${d.contratado} de más ${d.deMas} → ítem ${d.item}`); });
  console.log('7) DIFERENCIAS CON LO HECHO:', JSON.stringify(r7, null, 1));
  console.log('diálogos:', dlg);
  await A.browser.close();
})();
