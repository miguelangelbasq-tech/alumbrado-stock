// v183 · Calculadora (Ángel 19/11/2026): «4 metros para cables 3x1,5 brazo de 0.4 m columnas de 7 metros … la ganancia de abajo
// hacia arriba es de 6 metros, para columna de 10 metros también 6 … el 3x1.5 son 7,5 metros con brazo de un metro … a veces usamos
// en la misma obra luminarias de distinta potencia».
//  0) cable 3×1,5: 7 m / 0,4 → 4 m por artefacto; 10 m / 1 m → 7,5; otra combinación «a confirmar»; en el cómputo (6001).
//  1) ganancia del troncal: 6 m por subida (7 y 10 m, PRFV y metálica) en los circuitos, el resumen y el material.
//  2) obra con 75 W y 180 W: renglón por potencia (producto del pañol o «a confirmar»), consumo, provisiones 85.1 / 85.2,
//     editar el cómputo vuelve a traer las potencias, un cómputo viejo sale como antes (una potencia).
//  3) asistente: proponer_calculo con luminarias → tarjeta → «Sí» → cómputo nuevo con las dos potencias; código inventado no.
//  4) celu: la caja de potencias con 44 px y sin scroll de costado; 💡 Consumo con otra potencia.
//  5) __v183No: todo como antes (4,5 m · 4 m de ganancia · sin potencias).
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
const REGLAS = !!process.env.REGLAS;
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.split(',').indexOf(String(x)) >= 0;
const W = 'https://ema-ia.mdiaz-60f.workers.dev';
(async () => {
  const c = prueba('v183' + (cel ? ' cel' : '') + (REGLAS ? ' REGLAS' : ''));
  let browser = null;
  const sesion = async (op) => { const A = await abrir(Object.assign({ sesion: 'admin', cel, datos: baseDatos(), espera: 3500, reglas: REGLAS, browser, https: true, iaPro: true, v183: true }, op || {})); browser = A.browser; A.page.on('dialog', (x) => x.accept()); await A.page.waitForTimeout(800); return A; };
  const sinErr = (A) => (A.errores || []).filter((e) => !/permission|ERR_|Failed to fetch|aborted|ResizeObserver|error occurred when fetching/i.test(e));
  // carga la calculadora como en t_v066 y calcula; devuelve los renglones del último cómputo de la plaza
  const calc = async (p, k) => {
    await p.evaluate((k) => {
      mostrarVista('calc');
      document.getElementById('obraNombre').value = 'Plaza San Martín'; document.getElementById('obraId').value = '1234';
      document.getElementById('colTipo').value = k.tipo || 'PRFV'; document.getElementById('colTipo').dispatchEvent(new Event('change', { bubbles: true }));
      document.getElementById('vincTipoCol').value = k.tipo || 'PRFV';
      columnaGrupos.length = 0; k.cols.forEach(([h, n], i) => columnaGrupos.push({ id: i + 1, altura: h, columnas: n })); renderColumnaGrupos();
      vinculoGrupos.length = 0; k.vin.forEach(([t, n], i) => vinculoGrupos.push({ id: i + 1, tipo: t, columnas: n, sobre: 'nueva' })); try { renderVinculoGrupos(); } catch (e) { }
      const tot = k.vin.reduce((a, v) => a + v[1], 0); document.getElementById('vincCantCol').value = String(tot);
      if (k.w) document.getElementById('vincPotenciaW').value = String(k.w);
      if (k.lum !== undefined) document.getElementById('lumTipos183').value = k.lum;
      if (k.prov !== undefined) { const pl = document.getElementById('provLuminarias'); pl && (pl.checked = !!k.prov); }
      const tc = document.getElementById('toggleCableado');
      const circ = k.circ || [k.cols.reduce((a, x) => a + x[1], 0)];
      if (circ) { tc.checked = true; tc.dispatchEvent(new Event('change', { bubbles: true })); circuitos.length = 0; circ.forEach((n, i) => { const pts = []; for (let j = 0; j < n; j++) pts.push({ id: i * 100 + j + 1, calibre: '4x4', largo: 20, esColumna: true }); circuitos.push({ id: i + 1, numero: i + 1, tablero: 1, puntos: pts }); }); try { renderCircuitos(); actualizarResumenCircuitos(); } catch (e) { } }
      else if (tc) { tc.checked = false; tc.dispatchEvent(new Event('change', { bubbles: true })); }
      window.__r183 = calcular();
    }, k);
    await p.waitForTimeout(1200);
    return p.evaluate(() => { const r = window.__r183 || {}; const h = historial.filter((x) => x.nombre === 'Plaza San Martín').slice(-1)[0] || {}; const it = []; (r.secciones || []).forEach((s) => (s.items || []).forEach((x) => it.push({ t: s.titulo, d: String(x.desc || ''), c: x.cant, cod: x.cod || null, ic: x.itemCant }))); return { it, form: h.form, n: historial.length }; });
  };
  const linea = (r, re) => (r && r.it || []).filter((x) => re.test(x.d));
  try {
    // ================================================================= 0) cable 3×1,5
    if (SOLO(0) || SOLO(1) || SOLO(2) || SOLO(3) || SOLO(4)) {
      const A = await sesion(); const p = A.page;
      if (SOLO(0)) {
        let r = await p.evaluate(() => ({ a: cableSubidaPorArtefacto(0.4, 7, 'PRFV'), b: cableSubidaPorArtefacto(1, 10, 'PRFV'), c: cableSubidaPorArtefacto(0.425, 7, 'PRFV'), d: cableSubidaPorArtefacto(1.025, 10, 'PRFV'), e: cableSubida183(1, 7, 'PRFV'), f: cableSubida183(0.4, 10, 'PRFV'), g: cableSubida183(0.4, 7, 'PRFV'), m: cableSubida183(0.4, 7, 'Metálica') }));
        c(r.a === 4 && r.c === 4, '7 m con brazo de 0,4 m (y el capuchón de 0,425) → 4 m por artefacto · ' + JSON.stringify([r.a, r.c]));
        c(r.b === 7.5 && r.d === 7.5, '10 m con brazo de 1 m (y el cuádruple de 1,025) → 7,5 m por artefacto · ' + JSON.stringify([r.b, r.d]));
        c(r.e.m === 4.6 && r.e.aConf && r.f.m === 6.9 && r.f.aConf && !r.g.aConf && r.m.aConf, 'otra combinación = la más parecida + la diferencia, «a confirmar» (7 m/1 m 4,6 · 10 m/0,4 6,9; metálica a confirmar) · ' + JSON.stringify([r.e, r.f.m]));
        r = await calc(p, { cols: [[7, 8]], vin: [['simple_400', 8]] });
        const l7 = linea(r, /^Cable Cu 3×1,5/)[0] || {};
        c(l7.cod === 6001 && l7.c === 32, 'cómputo: 8 columnas de 7 m simples → 32 m del 6001 (8 × 4 m) · ' + JSON.stringify([l7.cod, l7.c]));
        c(linea(r, /Cable 3×1,5 a la luminaria, uno por artefacto/).length === 1, 'la explicación del cable dice la regla nueva (4 m · 7,5 m)');
        r = await calc(p, { cols: [[10, 4]], vin: [['simple_1000', 4]] });
        const l10 = linea(r, /^Cable Cu 3×1,5/)[0] || {};
        c(l10.c === 30, '4 columnas de 10 m con brazo de 1 m → 30 m (4 × 7,5) · ' + l10.c);
        r = await calc(p, { cols: [[7, 6], [10, 2]], vin: [['triple_400', 6], ['cuadruple_1025', 2]] });
        const lm = linea(r, /^Cable Cu 3×1,5/)[0] || {};
        c(lm.c === 18 * 4 + 8 * 7.5, 'plaza con 7 y 10 m: los triples de 0,4 en la de 7 (18 × 4) y los cuádruples de 1,025 en la de 10 (8 × 7,5) = 132 m · ' + lm.c);
        r = await p.evaluate(() => { const o = avanceObras.find((x) => x.id === 'p1'); const pv = window.epecPreviaDe(o); const f = ((pv && pv.filas) || []).find((x) => String(x.item) === '30'); return f && f.cantidad; });
        c(Math.abs(r - 132) < 0.01, 'el ítem 30 de la vista previa del itemizado sale con esos metros · ' + r);
      }
      // ================================================================= 1) ganancia 6 m
      if (SOLO(1)) {
        let r = await p.evaluate(() => [gananciaPorDefecto(7, 'PRFV'), gananciaPorDefecto(10, 'PRFV'), gananciaPorDefecto(7, 'Metálica'), gananciaPorDefecto(10, 'Metálica')]);
        c(r.every((x) => x === 6), 'ganancia por subida = 6 m (7 y 10 m, PRFV y metálica) · ' + JSON.stringify(r));
        r = await calc(p, { cols: [[7, 6]], vin: [['simple_400', 6]], circ: [3, 3] });
        const g = await p.evaluate(() => window.__gananciaExactaPorCalibre);
        c(g && g['4x4'] === (2 * 6 - 2) * 6, 'troncal: 2 circuitos de 3 columnas = 10 subidas × 6 m = 60 m · ' + JSON.stringify(g));
        const t4 = linea(r, /^Cable Cu (XLPE|.*4×4)/).find((x) => /4×4/.test(x.d) && /ya contemplan 60 m/.test(x.d)) || linea(r, /ya contemplan 60 m/)[0] || {};
        c(t4.ic === 120 + 60 && t4.c === Math.ceil(180 * 1.05), 'material del troncal: 120 m de zanja + 60 m de subidas (ítem sin reserva = 180; pedido con 5 % = 189) · ' + JSON.stringify([t4.ic, t4.c]));
        const s = await p.evaluate(() => { try { actualizarGananciaSummary(); } catch (e) { } return (document.getElementById('gananciaSummary') || {}).textContent || ''; });
        const ph = await p.evaluate(() => document.getElementById('cableGanancia').placeholder);
        c(/6,0 m por subida/.test(s) && /6 m por subida/.test(ph), 'el resumen y el campo dicen 6 m por subida · ' + s.slice(0, 120));
      }
      // ================================================================= 2) luminarias de distinta potencia
      if (SOLO(2) || SOLO(3)) {
        await p.evaluate(() => { mostrarVista('calc'); try { window.__abrirSeccionCalculo && window.__abrirSeccionCalculo('cardVinculos'); } catch (e) { } document.getElementById('lumTipos183').value = ''; window.__lum183.pintar(); });
        await p.waitForTimeout(300);
        let ui = await p.evaluate(() => !!document.querySelector('#lum183 [data-l183=mas]'));
        c(ui, 'en «Vínculos y luminarias» está «＋ Otra potencia en la misma obra»');
        await p.evaluate(() => { columnaGrupos.length = 0; columnaGrupos.push({ id: 1, altura: 7, columnas: 10 }); vinculoGrupos.length = 0; vinculoGrupos.push({ id: 1, tipo: 'triple_400', columnas: 10, sobre: 'nueva' }); renderVinculoGrupos(); document.getElementById('vincPotenciaW').value = '75'; document.querySelector('#lum183 [data-l183=mas]').click(); });
        await p.waitForTimeout(200);
        await p.evaluate(() => { const set = (s, v) => { const e = document.querySelector(s); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }; set('#lum183 [data-l183i="0"] [data-l183f=w]', '180'); set('#lum183 [data-l183i="0"] [data-l183f=cant]', '8'); });
        await p.waitForTimeout(200);
        const opts = await p.evaluate(() => [...document.querySelectorAll('#lum183 [data-l183i="0"] select option')].map((o) => o.value).filter(Boolean));
        c(opts.indexOf('6010') >= 0 && opts.indexOf('6011') >= 0 && opts.every((v) => +v >= 6000 && +v < 7000), 'el producto se elige del pañol (luminarias de la familia 6, nunca inventado) · ' + opts.join(','));
        const res = await p.evaluate(() => (document.querySelector('#lum183 .lum183-res') || {}).textContent || '');
        c(/30 luminarias/.test(res) && /22 × 75 W \+ 8 × 180 W/.test(res) && /3,09 kW/.test(res), 'el resumen: 22 × 75 W + 8 × 180 W = 3,09 kW con las corrientes · ' + res.slice(0, 140));
        let r = await calc(p, { cols: [[7, 10]], vin: [['triple_400', 10]], w: 75, prov: true });
        let l75 = linea(r, /^Luminaria vial LED 75 W/), l180 = linea(r, /^Luminaria vial LED 180 W/);
        c(l75.length === 1 && l75[0].c === 22 && l75[0].cod === 6010, 'renglón de 75 W: 22 del 6010 · ' + JSON.stringify(l75.map((x) => [x.c, x.cod])));
        c(l180.length === 1 && l180[0].c === 8 && !l180[0].cod && /a confirmar/.test(l180[0].d), 'renglón de 180 W sin producto elegido: 8, «elegí el producto del pañol (a confirmar)», sin código · ' + JSON.stringify(l180.map((x) => [x.c, x.cod])));
        c(linea(r, /Luminarias de distinta potencia:.*3,09 kW/).length === 1, 'el cómputo dice el consumo con cada potencia (3,09 kW)');
        let pv = await p.evaluate(() => { const o = avanceObras.find((x) => x.id === 'p1'); const pv = window.epecPreviaDe(o); const g = {}; ((pv && pv.filas) || []).forEach((f) => { if (/^85/.test(String(f.item))) g[f.item] = f.cantidad; }); return g; });
        c(pv['85.1'] === 22 && pv['85.2'] === 8, 'provisiones: 85.1 = 22 (75 W) y 85.2 = 8 (180 W) · ' + JSON.stringify(pv));
        // elegir el producto 6011 y recalcular
        await p.evaluate(() => { const e = document.querySelector('#lum183 [data-l183i="0"] select'); e.value = '6011'; e.dispatchEvent(new Event('change', { bubbles: true })); });
        r = await calc(p, { cols: [[7, 10]], vin: [['triple_400', 10]], w: 75, prov: true });
        l180 = linea(r, /^Luminaria vial LED 180 W/);
        c(l180[0] && l180[0].cod === 6011 && /producto 6011/.test(l180[0].d), 'con el producto elegido: 180 W va con el código 6011 · ' + (l180[0] || {}).d);
        const form = r.form;
        c(form && form.campos && /"extra"/.test(form.campos.lumTipos183 || ''), 'las potencias quedan guardadas en el formulario del cómputo');
        // editar: limpiar y volver a cargar el cómputo
        await p.evaluate((f) => { document.getElementById('lumTipos183').value = ''; window.__lum183.pintar(); restaurarFormulario(f); }, form);
        await p.waitForTimeout(300);
        ui = await p.evaluate(() => ({ h: document.getElementById('lumTipos183').value, w: (document.querySelector('#lum183 [data-l183f=w]') || {}).value, c: (document.querySelector('#lum183 [data-l183f=cant]') || {}).value, s: (document.querySelector('#lum183 [data-l183i="0"] select') || {}).value }));
        c(ui.w === '180' && ui.c === '8' && ui.s === '6011', 'editar el cómputo trae las potencias de vuelta (180 W × 8, 6011) · ' + JSON.stringify(ui));
        // cómputo viejo (sin potencias): una sola, como antes
        await p.evaluate((f) => { const v = JSON.parse(JSON.stringify(f)); delete v.campos.lumTipos183; restaurarFormulario(v); }, form);
        await p.waitForTimeout(300);
        ui = await p.evaluate(() => ({ h: document.getElementById('lumTipos183').value, mas: !!document.querySelector('#lum183 [data-l183=mas]'), fil: document.querySelectorAll('#lum183 [data-l183i]').length }));
        c(ui.h === '' && ui.mas && !ui.fil, 'un cómputo viejo sin potencias vuelve a una sola potencia · ' + JSON.stringify(ui));
        r = await calc(p, { cols: [[7, 10]], vin: [['triple_400', 10]], w: 75 });
        l75 = linea(r, /^Luminaria vial LED/);
        c(l75.length === 1 && l75[0].c === 30 && l75[0].cod === 6010 && /LED 75 W/.test(l75[0].d), 'calcula como antes: un renglón de 30 luminarias LED 75 W (6010) · ' + JSON.stringify(l75.map((x) => [x.c, x.cod])));
        // de más: las otras potencias suman más que los vínculos
        r = await calc(p, { cols: [[7, 2]], vin: [['simple_400', 2]], w: 75, lum: JSON.stringify({ v: 1, cod1: 6010, extra: [{ w: 180, cant: 5, cod: 6011 }] }) });
        c(linea(r, /suman 5 luminarias y los vínculos dan 2/).length === 1 && linea(r, /^Luminaria vial LED 75 W/).length === 0, 'si las otras potencias suman de más, avisa y la primera queda en 0');
        c(!sinErr(A).length, 'sin errores de JS · ' + JSON.stringify(sinErr(A).slice(0, 3)));
      }
      // ================================================================= 3) asistente
      if (SOLO(3)) {
        await calc(p, { cols: [[7, 10]], vin: [['triple_400', 10]], w: 75, lum: '' });
        let n = 0;
        const usa = (name, input) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text: 'Miro.' }, { type: 'tool_use', id: 'tu_' + n, name, input }], stop_reason: 'tool_use', usage: { input_tokens: 900, output_tokens: 60 }, ema: { costoUsd: 0.02, version: 'v5-ia' } });
        const fin = (text) => ({ id: 'msg_' + (++n), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text }], stop_reason: 'end_turn', usage: { input_tokens: 1000, output_tokens: 60 }, ema: { costoUsd: 0.02, version: 'v5-ia' } });
        const st = { pedidos: [], cola: [] };
        await p.route(W + '/ia', async (rt) => { let b = null; try { b = JSON.parse(rt.request().postData() || 'null'); } catch (e) { } st.pedidos.push(b); const f = st.cola.shift() || fin('Listo.'); return rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(f) }); });
        await p.route(W + '/mio', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v5-ia', habilitado: true }) }));
        await p.route(W + '/uso', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v5-ia', gastoMes: 1, tope: 100, partes: {} }) }));
        await p.route(W + '/salud', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, version: 'v5-ia' }) }));
        for (let i = 0; i < 80 && !(await p.evaluate(() => typeof window.__asistenteAbrir === 'function')); i++) await p.waitForTimeout(200);
        await p.evaluate(() => window.__asistenteAbrir()); await p.waitForTimeout(900);
        const esperarIa = async () => { for (let i = 0; i < 160; i++) { await p.waitForTimeout(150); if (await p.evaluate(() => { const b = document.getElementById('iaEnviar'); return !!b && !b.disabled; })) return; } };
        const decir = async (frase, guion) => { st.cola.push(...guion); const n0 = st.pedidos.length; await p.fill('#iaTxt', frase); await p.click('#iaEnviar'); await p.waitForTimeout(300); await esperarIa(); await p.waitForTimeout(400); return st.pedidos.slice(n0); };
        const resultado = (ped, i) => { const m = (ped[i] || {}).messages || []; const u = m[m.length - 1] || {}; const b = (u.content || []).find((x) => x.type === 'tool_result'); if (!b) return ''; const x = b.content; return typeof x === 'string' ? x : JSON.stringify(x); };
        let ped = await decir('en san martín van 8 de 180 W con la 6011 y el resto de 75', [usa('proponer_calculo', { obraId: 'Plaza San Martín', cambiosForm: { luminarias: [{ potencia: 75 }, { potencia: 180, cantidad: 8, codigo: 6011 }] } }), fin('Te dejo el cómputo para confirmar.')]);
        const tool = ((ped[0] || {}).tools || []).find((t) => t.name === 'proponer_calculo');
        c(tool && tool.input_schema.properties.cambiosForm.properties.luminarias, 'proponer_calculo acepta «luminarias» (potencia, cantidad, código)');
        const card = await p.evaluate(() => { const c = [...document.querySelectorAll('#iaChat .ia-conf')].pop(); return c ? c.textContent.replace(/\s+/g, ' ') : ''; });
        c(/Luminarias/.test(card) && /8 × 180 W \(6011\)/.test(card) && /todas de 75 W/.test(card), 'la tarjeta: Luminarias «todas de 75 W» → «75 W (el resto) + 8 × 180 W (6011)» · ' + card.slice(0, 200));
        const n0 = await p.evaluate(() => historial.length);
        await p.evaluate(() => { const c = [...document.querySelectorAll('#iaChat .ia-conf')].pop(); const b = c && c.querySelector('[data-iasi]'); b && b.click(); });
        for (let i = 0; i < 40 && (await p.evaluate((n) => historial.length, n0)) <= n0; i++) await p.waitForTimeout(250);
        const r = await p.evaluate(() => { const h = historial.filter((x) => x.nombre === 'Plaza San Martín').slice(-1)[0]; const it = []; (h.secciones || []).forEach((s) => (s.items || []).forEach((x) => it.push([String(x.desc).slice(0, 40), x.cant, x.cod]))); return it.filter((x) => /^Luminaria vial LED/.test(x[0])); });
        c(r.length === 2 && r.some((x) => /180 W/.test(x[0]) && x[1] === 8 && x[2] === 6011) && r.some((x) => /75 W/.test(x[0]) && x[1] === 22), 'con «Sí» queda el cómputo nuevo con 22 × 75 W y 8 × 180 W (6011) · ' + JSON.stringify(r));
        ped = await decir('poné la de 180 con el código 6999', [usa('proponer_calculo', { obraId: 'Plaza San Martín', cambiosForm: { luminarias: [{ potencia: 75 }, { potencia: 180, cantidad: 8, codigo: 6999 }] } }), fin('Ese código no existe.')]);
        c(/no es una luminaria del pañol/.test(resultado(ped, 1)), 'un código que no es una luminaria del pañol no se acepta (nunca se inventa) · ' + resultado(ped, 1).slice(0, 120));
        c(!sinErr(A).length, 'sin errores de JS (asistente) · ' + JSON.stringify(sinErr(A).slice(0, 3)));
      }
      // ================================================================= 4) celu / pantalla y 💡 Consumo
      if (SOLO(4)) {
        await p.evaluate(() => { try { window.__asistente && window.__asistente.cerrar(); } catch (e) { } mostrarVista('calc'); try { window.__abrirSeccionCalculo && window.__abrirSeccionCalculo('cardVinculos'); } catch (e) { } vinculoGrupos.length = 0; vinculoGrupos.push({ id: 1, tipo: 'triple_400', columnas: 10, sobre: 'nueva' }); renderVinculoGrupos(); document.getElementById('vincPotenciaW').value = '75'; document.getElementById('lumTipos183').value = JSON.stringify({ v: 1, cod1: 6010, extra: [{ w: 180, cant: 8, cod: '' }, { w: 100, cant: 2, cod: 6012 }] }); window.__lum183.pintar(); const e = document.getElementById('lum183'); e && e.scrollIntoView({ block: 'center' }); });
        await p.waitForTimeout(500);
        const m = await p.evaluate(() => { const b = [...document.querySelectorAll('#lum183 input, #lum183 select, #lum183 button')].filter((x) => x.offsetParent); return { n: b.length, chicos: b.filter((x) => x.getBoundingClientRect().height < 43.5).map((x) => x.outerHTML.slice(0, 60)), sw: document.documentElement.scrollWidth, iw: window.innerWidth, fuera: b.filter((x) => x.getBoundingClientRect().right > window.innerWidth + 1).length }; });
        c(m.n >= 8 && !m.chicos.length, `la caja de potencias: ${m.n} controles, todos de 44 px o más · ` + JSON.stringify(m.chicos.slice(0, 2)));
        c(m.sw <= m.iw + 1 && !m.fuera, `sin scroll de costado (${m.sw} ≤ ${m.iw}) y nada afuera de la pantalla`);
        if (process.env.CAP) await p.locator('#cardVinculos').screenshot({ path: process.env.CAP + '/v183_potencias' + (cel ? '_cel' : '') + '.png' });
        await p.evaluate(() => document.querySelector('#lum183 [data-l183=consumo]').click()); await p.waitForTimeout(600);
        const k = await p.evaluate(() => ({ n2: (document.querySelector('[data-k=n2]') || {}).value, w2: (document.querySelector('[data-k=w2]') || {}).value, r: (document.getElementById('crKRes') || {}).textContent || '' }));
        c(k.n2 === '10' && /3,14\s*kW/.test(k.r), '«Ver en 💡 Consumo» lleva las dos potencias (20 × 75 W + otra potencia 10 de ≈ 164 W = 3,14 kW) · ' + JSON.stringify(k).slice(0, 160));
        if (process.env.CAP) await p.screenshot({ path: process.env.CAP + '/v183_consumo' + (cel ? '_cel' : '') + '.png' });
      }
      await A.page.close();
    }
    // ================================================================= 5) __v183No
    if (SOLO(5)) {
      const A = await sesion({ v183: false }); const p = A.page;
      const r = await p.evaluate(() => ({ a: cableSubidaPorArtefacto(0.4, 7, 'PRFV'), g: gananciaPorDefecto(7, 'PRFV'), gm: gananciaPorDefecto(7, 'Metálica'), lum: !!window.__lum183, mas: !!document.querySelector('#lum183 [data-l183]') }));
      c(r.a === 4.5 && r.g === 4 && r.gm === 5 && !r.lum && !r.mas, 'con __v183No todo como antes (4,5 m · ganancia 4 / 5 m · sin potencias) · ' + JSON.stringify(r));
      await A.page.close();
    }
  } catch (e) { console.error(e); c(false, 'error: ' + e.message); }
  try { browser && await browser.close(); } catch (e) { }
  process.exit(c.fin() ? 1 : 0);
})();
