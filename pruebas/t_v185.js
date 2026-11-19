// v185 · La Calculadora por rubros, opción A (Ángel 19/11/2026: «VAMOS CON LA A»).
//  0) pestañas Obra · Columnas · Luminarias · Eléctrico · Civil · PAT · Resultado: cada una con sus campos (los de siempre,
//     mismos id), los puntitos verde / naranja, Plaza / Barrio arriba, la barra de abajo, ⚡ Cálculos rápidos, Historial y
//     Material por obra siguen arriba; celu: la fila de pestañas se desliza sola (sin scroll de costado), 44 px.
//  1) «Calcular» da exactamente lo mismo que con __v185No (materiales e itemizado) en 3 cómputos: plaza PRFV con dos
//     potencias de luminaria, metálica de 10 m, barrio.
//  2) editar un cómputo vuelve a cargar todo en sus pestañas; «Ver» del historial lleva al Resultado (hoja completa).
//  3) asistente: proponer_calculo sigue andando (tarjeta → «Sí» → cómputo nuevo) y la barra se actualiza.
//  4) Resultado por rubro con «✎ Cambiar», «Lo que sale de este rubro» (compu), «Cambió algo desde el último cálculo».
//  5) __v185No: la Calculadora de antes.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
const REGLAS = !!process.env.REGLAS;
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.split(',').indexOf(String(x)) >= 0;
const CAP = process.env.CAP || '';
const W = 'https://ema-ia.mdiaz-60f.workers.dev';
(async () => {
  const c = prueba('v185' + (cel ? ' cel' : '') + (REGLAS ? ' REGLAS' : ''));
  let browser = null;
  const sesion = async (op) => { const A = await abrir(Object.assign({ sesion: 'admin', cel, datos: baseDatos(), espera: 3500, reglas: REGLAS, browser, https: true, iaPro: true, v183: true, v185: true }, op || {})); browser = A.browser; A.page.on('dialog', (x) => x.accept()); await A.page.waitForTimeout(900); return A; };
  const sinErr = (A) => (A.errores || []).filter((e) => !/permission|ERR_|Failed to fetch|aborted|ResizeObserver|error occurred when fetching|MIME type/i.test(e));
  // carga un cómputo en la Calculadora (igual en las dos páginas)
  const cargar = async (p, k) => p.evaluate((k) => {
    mostrarVista('calc');
    const ev = (e) => { e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); };
    if (k.barrio) {
      window.calcModoPoner('barrio');
      document.getElementById('obraNombre').value = k.nombre; document.getElementById('obraId').value = k.id || '';
      Object.keys(k.campos || {}).forEach((id) => { const e = document.getElementById(id); if (!e) return; e.type === 'checkbox' ? (e.checked = !!k.campos[id]) : (e.value = String(k.campos[id])); ev(e); });
      return true;
    }
    window.calcModoPoner('plaza');
    document.getElementById('obraNombre').value = k.nombre; document.getElementById('obraId').value = k.id || '';
    document.getElementById('colTipo').value = k.tipo || 'PRFV'; ev(document.getElementById('colTipo'));
    document.getElementById('vincTipoCol').value = k.tipo || 'PRFV'; ev(document.getElementById('vincTipoCol'));
    document.getElementById('civilTipoCol').value = k.tipo || 'PRFV';
    if (k.esquema) { document.getElementById('esquemaTierra').value = k.esquema; ev(document.getElementById('esquemaTierra')); }
    columnaGrupos.length = 0; k.cols.forEach(([h, n], i) => columnaGrupos.push({ id: i + 1, altura: h, columnas: n })); renderColumnaGrupos();
    vinculoGrupos.length = 0; k.vin.forEach(([t, n], i) => vinculoGrupos.push({ id: i + 1, tipo: t, columnas: n, sobre: 'nueva' })); try { renderVinculoGrupos(); } catch (e) { }
    document.getElementById('vincCantCol').value = String(k.vin.reduce((a, v) => a + v[1], 0));
    document.getElementById('vincPotenciaW').value = String(k.w || 75);
    document.getElementById('lumTipos183').value = k.lum || ''; try { window.__lum183 && window.__lum183.pintar(); } catch (e) { }
    const pl = document.getElementById('provLuminarias'); pl && (pl.checked = !!k.prov);
    const tc = document.getElementById('toggleCableado');
    if (k.circ) { tc.checked = true; ev(tc); circuitos.length = 0; k.circ.forEach((n, i) => { const pts = []; for (let j = 0; j < n; j++) pts.push({ id: i * 100 + j + 1, calibre: '4x4', largo: 20, esColumna: true }); circuitos.push({ id: i + 1, numero: i + 1, tablero: 1, puntos: pts }); }); try { renderCircuitos(); actualizarResumenCircuitos(); } catch (e) { } }
    else { tc.checked = false; ev(tc); }
    if (k.zanja != null) { document.getElementById('civilZanjaMl').value = String(k.zanja); ev(document.getElementById('civilZanjaMl')); }
    return true;
  }, k);
  // lo que salió (materiales con todo y la vista previa del itemizado de la plaza p1)
  const salida = (p, plaza) => p.evaluate((plaza) => {
    const R = typeof ultimoResultado !== 'undefined' ? ultimoResultado : null; if (!R) return null;
    const it = []; (R.secciones || []).forEach((s) => (s.items || []).forEach((x) => it.push([s.titulo, String(x.desc || ''), x.cant, x.un, x.cod == null ? null : x.cod, x.itemCant == null ? null : x.itemCant, String(x.ref || '')])));
    let iz = null;
    if (plaza) { const o = avanceObras.find((x) => x.id === 'p1'); const pv = window.epecPreviaDe(o); iz = ((pv && pv.filas) || []).map((f) => [String(f.item), Math.round((+f.cantidad || 0) * 1000) / 1000]).sort((a, b) => a[0].localeCompare(b[0])); }
    return { it, iz, al: (R.alertas || []).map((a) => String(a)), tareas: R.tareas, n: it.length };
  }, plaza);
  const tabsInfo = (p) => p.evaluate(() => [...document.querySelectorAll('#r185Tabs .r185-t')].map((b) => ({ k: b.dataset.r185t, on: b.classList.contains('on'), d: (b.querySelector('.r185-d') || {}).className || '', h: b.getBoundingClientRect().height, t: b.textContent.trim() })));
  const visible = (p, ids) => p.evaluate((ids) => ids.map((id) => { const e = document.getElementById(id); return [id, !!(e && e.offsetParent !== null && e.getClientRects().length)]; }), ids);
  const ir = async (p, k) => { await p.evaluate((k) => { const b = document.querySelector(`#r185Tabs [data-r185t="${k}"]`); b && b.click(); }, k); await p.waitForTimeout(350); };
  const CAMPOS = {
    obra: ['obraNombre', 'obraId', 'obraBarrio', 'provColumnas', 'provLuminarias'],
    col: ['colTipo', 'columnaGruposContainer', 'colAddAlturaBtn', 'colExistentes', 'retiroCol', 'retiroLum'],
    lum: ['vincTipoCol', 'vincCantCol', 'vincPotenciaW', 'lum183', 'vinculoGruposContainer', 'bpnCfgPf'],
    ele: ['circuitosContainer', 'addCircuitoBtn', 'cableGanancia', 'tableroTipo', 'acometidaMl', 'circuitos', 'tabTermoTetraH', 'empChico'],
    civ: ['civilTipoCol', 'civilZanjaMl', 'civilZanjaProf', 'civilArenaCama', 'cruceMl'],
    pat: ['esquemaTierra', 'esquemaHint']
  };
  const TODOS = [].concat(...Object.values(CAMPOS));
  const K1 = { nombre: 'Plaza San Martín', id: '1234', cols: [[7, 10]], vin: [['triple_400', 10]], w: 75, lum: JSON.stringify({ v: 1, cod1: 6010, extra: [{ w: 180, cant: 8, cod: 6011 }] }), prov: true, circ: [5, 5], zanja: 120 };
  const K2 = { nombre: 'Plaza San Martín', id: '1234', tipo: 'Metálica', esquema: 'TN-S', cols: [[10, 4]], vin: [['cuadruple_1025', 4]], w: 180, zanja: 60 };
  const K3 = { barrio: true, nombre: 'B° Los Robles', id: '', campos: { b_tgLum: true, b_lumCant: 24, b_lumRet: 24, b_tgCa: true, b_caSim: 4, b_caDob: 2 } };
  try {
    // ================================================================= 0) pestañas, campos, puntitos, celu
    if (SOLO(0)) {
      const A = await sesion(); const p = A.page;
      await p.evaluate(() => mostrarVista('calc')); await p.waitForTimeout(900);
      let t = await tabsInfo(p);
      c(t.map((x) => x.k).join(',') === 'obra,col,lum,ele,civ,pat,res' && /Obra/.test(t[0].t) && /Resultado/.test(t[6].t), 'pestañas Obra · Columnas · Luminarias · Eléctrico · Civil · PAT · Resultado · ' + t.map((x) => x.t).join(' · '));
      c(t.every((x) => x.h >= 44), 'cada pestaña tiene 44 px o más · ' + t.map((x) => Math.round(x.h)).join(','));
      const ids = await p.evaluate((l) => l.map((id) => document.querySelectorAll('[id="' + id + '"]').length), TODOS);
      c(ids.every((n) => n === 1), 'los campos de siempre siguen con su id (uno solo de cada uno) · ' + ids.join(''));
      const sub = await p.evaluate(() => ({ cp: !!document.querySelector('#subtabsComputo [data-cptab="hist"]') && document.getElementById('subtabsComputo').offsetParent !== null, sc: getComputedStyle(document.getElementById('subtabsCalc')).display, modo: !!document.querySelector('#r185Top .cb-modo [data-modo="barrio"]'), bar: !!document.querySelector('#calcFlotante #r185Bar') && getComputedStyle(document.getElementById('calcFlotante')).display, rap: !!document.getElementById('r185Rap') }));
      c(sub.cp && sub.modo && sub.bar === 'flex' && sub.rap && sub.sc === 'none', 'arriba Calculadora / Historial / Material por obra y Plaza / Barrio; abajo la barra con ⚡ Cálculos rápidos · ' + JSON.stringify(sub));
      for (const k of Object.keys(CAMPOS)) {
        await ir(p, k);
        const v = await visible(p, TODOS);
        const mal = v.filter(([id, vis]) => (CAMPOS[k].indexOf(id) >= 0) !== vis).map((x) => x[0]);
        c(!mal.length, `pestaña ${k}: se ven sus campos y no los de las otras · ` + (mal.join(',') || CAMPOS[k].join(',')));
      }
      const pat = await p.evaluate(() => !!document.querySelector('#r185Pat #esquemaTierra') && !!document.querySelector('#r185Pat #esquemaHint') && !document.querySelector('#cardColumnas #esquemaTierra'));
      c(pat, 'el esquema de conexión a tierra se movió (el mismo campo) a la pestaña PAT');
      // puntitos
      await ir(p, 'obra');
      await p.evaluate(() => { const e = document.getElementById('obraNombre'); e.value = ''; e.dispatchEvent(new Event('input', { bubbles: true })); });
      await p.waitForTimeout(500);
      t = await tabsInfo(p); const d0 = t.find((x) => x.k === 'obra').d;
      await p.fill('#obraNombre', 'Plaza San Martín'); await p.waitForTimeout(500);
      t = await tabsInfo(p); const d1 = t.find((x) => x.k === 'obra').d;
      c(/av/.test(d0) && /ok/.test(d1), 'puntito de Obra: naranja sin nombre, verde con el nombre · ' + d0 + ' → ' + d1);
      await p.evaluate(() => { const g = document.getElementById('toggleCivil'); g.checked = true; g.dispatchEvent(new Event('change', { bubbles: true })); const z = document.getElementById('civilZanjaMl'); z.value = '0'; z.dispatchEvent(new Event('input', { bubbles: true })); civilGrupos && (civilGrupos.length = 0); document.getElementById('civilCantBases').value = '0'; });
      await p.waitForTimeout(400); t = await tabsInfo(p); const c0 = t.find((x) => x.k === 'civ').d;
      await p.evaluate(() => { const z = document.getElementById('civilZanjaMl'); z.value = '80'; z.dispatchEvent(new Event('input', { bubbles: true })); });
      await p.waitForTimeout(400); t = await tabsInfo(p); const c1 = t.find((x) => x.k === 'civ').d;
      c(/av/.test(c0) && /ok/.test(c1), 'puntito de Civil: naranja sin bases ni zanja, verde con 80 m de zanja · ' + c0 + ' → ' + c1);
      await p.evaluate(() => { ['toggleCruce'].forEach((id) => { const g = document.getElementById(id); g.checked = false; g.dispatchEvent(new Event('change', { bubbles: true })); }); const g = document.getElementById('toggleCivil'); g.checked = false; g.dispatchEvent(new Event('change', { bubbles: true })); });
      await p.waitForTimeout(400); t = await tabsInfo(p);
      c(!t.find((x) => x.k === 'civ').d, 'Civil apagada (sin «Incluir esta tarea») va sin puntito');
      await p.evaluate(() => { const g = document.getElementById('toggleCivil'); g.checked = true; g.dispatchEvent(new Event('change', { bubbles: true })); });
      // ‹ › al pie
      await ir(p, 'lum');
      const nav = await p.evaluate(() => [...document.querySelectorAll('#r185Nav [data-r185t]')].map((b) => b.dataset.r185t + ':' + b.textContent.trim()));
      c(nav.length === 2 && /^col:/.test(nav[0]) && /^ele:/.test(nav[1]), 'al pie «‹ Columnas» y «Eléctrico ›» · ' + nav.join(' | '));
      // celu: la fila de pestañas se desliza dentro de sí, sin scroll de costado
      const m = await p.evaluate(() => { const r = document.getElementById('r185Tabs'); const bs = [...document.querySelectorAll('#r185Top .cb-modo [data-modo], #calcFlotante button, #r185Nav button')].filter((b) => b.offsetParent !== null); return { sw: document.documentElement.scrollWidth, iw: innerWidth, desl: r.scrollWidth > r.clientWidth + 2, ov: getComputedStyle(r).overflowX, chicos: bs.filter((b) => b.getBoundingClientRect().height < 43.5).map((b) => b.textContent.trim().slice(0, 20)) }; });
      c(m.sw <= m.iw + 1, `sin scroll de costado en la página (${m.sw} ≤ ${m.iw})`);
      if (cel) c(m.desl && /auto|scroll/.test(m.ov), 'celu: la fila de pestañas se desliza adentro suyo · ' + JSON.stringify(m));
      else c(!m.desl, 'compu: las 7 pestañas entran en una fila');
      c(!m.chicos.length, 'Plaza / Barrio, la barra y ‹ › con 44 px o más · ' + JSON.stringify(m.chicos));
      // barrio: su agrupación
      await p.evaluate(() => document.querySelector('#r185Top .cb-modo [data-modo="barrio"]').click()); await p.waitForTimeout(600);
      t = await tabsInfo(p);
      c(t.map((x) => x.k).join(',') === 'bobra,blum,bred,btab,bpat,res', 'barrio: Obra · Luminarias y postes · Red aérea · Alimentación y tablero · PAT de red · Resultado · ' + t.map((x) => x.t).join(' · '));
      const BB = { bobra: ['obraNombre', 'cardBRet'], blum: ['cardBCa', 'cardBCs', 'cardBLum', 'cardBApo', 'cardBCon'], bred: ['cardBTen', 'cardBTr'], btab: ['cardBTab', 'cardBTt'], bpat: ['cardBPat'] };
      const BT = [].concat(...Object.values(BB)).concat(['cardColumnas', 'r185Pat']);
      for (const k of Object.keys(BB)) {
        await ir(p, k);
        const v = await visible(p, BT); const mal = v.filter(([id, vis]) => (BB[k].indexOf(id) >= 0) !== vis).map((x) => x[0]);
        c(!mal.length, `barrio, pestaña ${k}: sus tarjetas y nada de la plaza · ` + (mal.join(',') || 'ok'));
      }
      if (CAP) { await ir(p, 'blum'); await p.screenshot({ path: `${CAP}/barrio_luminarias${cel ? '_cel' : ''}.png` }); }
      await p.evaluate(() => document.querySelector('#r185Top .cb-modo [data-modo="plaza"]').click()); await p.waitForTimeout(500);
      // ⚡ Cálculos rápidos y vuelta; Historial / Material por obra
      await p.click('#r185Rap'); await p.waitForTimeout(500);
      let q = await p.evaluate(() => ({ rap: document.body.classList.contains('calc-rapida'), top: document.getElementById('r185Top').offsetParent !== null, sc: getComputedStyle(document.getElementById('subtabsCalc')).display }));
      await p.evaluate(() => document.querySelector('#subtabsCalc [data-sub="computo"]').click()); await p.waitForTimeout(500);
      const q2 = await p.evaluate(() => ({ rap: document.body.classList.contains('calc-rapida'), top: document.getElementById('r185Top').offsetParent !== null }));
      c(q.rap && !q.top && q.sc !== 'none' && !q2.rap && q2.top, '⚡ abre los Cálculos rápidos (con «Cómputo de la plaza» para volver) y se vuelve a las pestañas · ' + JSON.stringify([q, q2]));
      await p.evaluate(() => document.querySelector('#subtabsComputo [data-cptab="hist"]').click()); await p.waitForTimeout(400);
      q = await p.evaluate(() => ({ top: document.getElementById('r185Top').offsetParent !== null, hist: document.getElementById('cardHistCalc').offsetParent !== null, bar: getComputedStyle(document.getElementById('calcFlotante')).display }));
      await p.evaluate(() => document.querySelector('#subtabsComputo [data-cptab="calc"]').click()); await p.waitForTimeout(400);
      c(!q.top && q.hist && q.bar === 'none', 'Historial: el historial a pantalla completa, sin pestañas ni barra · ' + JSON.stringify(q));
      c(!sinErr(A).length, 'sin errores de JS · ' + JSON.stringify(sinErr(A).slice(0, 3)));
      await A.page.close();
    }
    // ================================================================= 1) el mismo cálculo que con __v185No
    if (SOLO(1)) {
      const A = await sesion(); const B = await sesion({ v185: false });
      for (const [nom, k, plaza] of [['plaza PRFV 7 m con 75 W y 180 W', K1, true], ['metálica de 10 m, TN-S, 180 W', K2, true], ['barrio', K3, false]]) {
        await cargar(A.page, k); await cargar(B.page, k); await A.page.waitForTimeout(400);
        await A.page.click('#calcFlotante .cf-calc'); await A.page.waitForTimeout(1500);
        await B.page.evaluate(() => calcular()); await B.page.waitForTimeout(1500);
        const a = await salida(A.page, plaza), b = await salida(B.page, plaza);
        const ja = JSON.stringify(a), jb = JSON.stringify(b);
        c(a && b && a.n > 5 && ja === jb, `${nom}: «Calcular» da los mismos ${a && a.n} renglones${plaza ? ` y el mismo itemizado (${a && a.iz.length} ítems)` : ''} que la Calculadora de antes`);
        if (ja !== jb && a && b) { const i = a.it.findIndex((x, j) => JSON.stringify(x) !== JSON.stringify(b.it[j])); console.log('  distinto:', JSON.stringify(a.it[i]), JSON.stringify(b.it[i]), JSON.stringify(a.iz), JSON.stringify(b.iz)); }
        if (k === K1) c(a.it.some((x) => /^Luminaria vial LED 180 W/.test(x[1]) && x[2] === 8 && x[4] === 6011) && a.it.some((x) => /^Luminaria vial LED 75 W/.test(x[1]) && x[2] === 22), 'con las dos potencias: 22 × 75 W (6010) y 8 × 180 W (6011)');
        const st = await A.page.evaluate(() => ({ e: window.__calc185.estadoInterno(), bar: document.getElementById('r185Bar').textContent.replace(/\s+/g, ' '), rc: document.getElementById('resultCard').offsetParent !== null }));
        const nm = await A.page.evaluate(() => window.__calc185.cuentas().mats);
        c(st.e.tab === 'res' && st.e.res && new RegExp('^' + nm + ' materiales').test(st.bar.trim()) && (plaza ? st.e.k > 0 && /mód\. K/.test(st.bar) : /sin itemizado de barrio/.test(st.bar)), `${nom}: después de «Calcular» va al Resultado y la barra dice ${st.bar.trim()}`);
        if (CAP) await A.page.screenshot({ path: `${CAP}/resultado_${plaza ? (k === K1 ? 'prfv' : 'metalica') : 'barrio'}${cel ? '_cel' : ''}.png` });
      }
      c(!sinErr(A).length && !sinErr(B).length, 'sin errores de JS · ' + JSON.stringify(sinErr(A).concat(sinErr(B)).slice(0, 3)));
      await A.page.close(); await B.page.close();
    }
    // ================================================================= 2) editar vuelve a las pestañas; «Ver» lleva al resultado
    if (SOLO(2)) {
      const A = await sesion(); const p = A.page;
      await cargar(p, Object.assign({}, K1, { esquema: 'TN-S' })); await p.click('#calcFlotante .cf-calc'); await p.waitForTimeout(1500);
      const i = await p.evaluate(() => historial.map((h, j) => [h.nombre, j]).filter((x) => x[0] === 'Plaza San Martín').pop()[1]);
      await cargar(p, { nombre: 'Otra', cols: [[7, 1]], vin: [['simple_400', 1]], esquema: 'TN-C' });
      await p.evaluate((i) => editarComputoHistorial(i), i); await p.waitForTimeout(1200);
      const e = await p.evaluate(() => window.__calc185.estadoInterno());
      const v = await p.evaluate(() => ({ n: document.getElementById('obraNombre').value, vis: document.getElementById('obraNombre').offsetParent !== null }));
      c(e.tab === 'obra' && v.n === 'Plaza San Martín' && v.vis, 'editar un cómputo del historial: vuelve a la pestaña Obra con el nombre cargado · ' + JSON.stringify([e.tab, v]));
      await ir(p, 'col');
      let x = await p.evaluate(() => ({ g: columnaGrupos.map((g) => g.altura + 'x' + g.columnas).join(','), filas: document.querySelectorAll('#columnaGruposContainer input').length, vis: document.getElementById('columnaGruposContainer').offsetParent !== null }));
      c(x.g === '7x10' && x.filas > 0 && x.vis, 'Columnas: vuelven las 10 de 7 m en su pestaña · ' + JSON.stringify(x));
      await ir(p, 'lum');
      x = await p.evaluate(() => ({ w: (document.querySelector('#lum183 [data-l183f=w]') || {}).value, cant: (document.querySelector('#lum183 [data-l183f=cant]') || {}).value, s: (document.querySelector('#lum183 [data-l183i="0"] select') || {}).value, vis: document.getElementById('lum183').offsetParent !== null, vc: document.getElementById('vincCantCol').value }));
      c(x.w === '180' && x.cant === '8' && x.s === '6011' && x.vis && x.vc === '10', 'Luminarias: vuelven las dos potencias (180 W × 8, 6011) y los 10 vínculos · ' + JSON.stringify(x));
      await ir(p, 'pat');
      x = await p.evaluate(() => ({ v: document.getElementById('esquemaTierra').value, vis: document.getElementById('esquemaTierra').offsetParent !== null }));
      c(x.v === 'TN-S' && x.vis, 'PAT: vuelve el esquema TN-S (el campo movido se restaura igual) · ' + JSON.stringify(x));
      await ir(p, 'ele');
      x = await p.evaluate(() => ({ n: circuitos.length, vis: document.getElementById('circuitosContainer').offsetParent !== null }));
      c(x.n === 2 && x.vis, 'Eléctrico: vuelven los 2 circuitos · ' + JSON.stringify(x));
      // «Ver» del historial → Resultado, hoja completa
      await p.evaluate((i) => { document.querySelector('#subtabsComputo [data-cptab="hist"]').click(); }, i); await p.waitForTimeout(300);
      await p.evaluate((i) => verComputoHistorial(i), i); await p.waitForTimeout(900);
      x = await p.evaluate(() => ({ e: window.__calc185.estadoInterno(), rc: document.getElementById('resultCard').offsetParent !== null }));
      c(x.e.tab === 'res' && x.e.sub === 'hoja' && x.rc, '«Ver» del historial: Resultado con la hoja completa a la vista · ' + JSON.stringify(x));
      // una validación que lleva a un campo abre su pestaña
      await ir(p, 'obra');
      await p.evaluate(() => document.getElementById('acometidaMl').focus()); await p.waitForTimeout(300);
      x = await p.evaluate(() => window.__calc185.estadoInterno().tab);
      c(x === 'ele', 'lo que lleva a un campo (foco, «ir a la sección») abre su pestaña · ' + x);
      c(!sinErr(A).length, 'sin errores de JS · ' + JSON.stringify(sinErr(A).slice(0, 3)));
      await A.page.close();
    }
    // ================================================================= 3) asistente: proponer_calculo
    if (SOLO(3)) {
      const A = await sesion(); const p = A.page;
      await cargar(p, Object.assign({}, K1, { lum: '' })); await p.click('#calcFlotante .cf-calc'); await p.waitForTimeout(1500);
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
      st.cola.push(usa('proponer_calculo', { obraId: 'Plaza San Martín', cambiosForm: { columnas: [{ altura: 7, columnas: 12 }], luminarias: [{ potencia: 75 }, { potencia: 180, cantidad: 8, codigo: 6011 }] } }), fin('Te dejo el cómputo para confirmar.'));
      await p.fill('#iaTxt', 'en san martín son 12 columnas y 8 de 180 W con la 6011'); await p.click('#iaEnviar'); await p.waitForTimeout(300); await esperarIa(); await p.waitForTimeout(400);
      const card = await p.evaluate(() => { const c = [...document.querySelectorAll('#iaChat .ia-conf')].pop(); return c ? c.textContent.replace(/\s+/g, ' ') : ''; });
      c(/8 × 180 W \(6011\)/.test(card), 'la tarjeta de proponer_calculo sale igual · ' + card.slice(0, 160));
      const n0 = await p.evaluate(() => historial.length);
      await p.evaluate(() => { const c = [...document.querySelectorAll('#iaChat .ia-conf')].pop(); const b = c && c.querySelector('[data-iasi]'); b && b.click(); });
      for (let i = 0; i < 40 && (await p.evaluate(() => historial.length)) <= n0; i++) await p.waitForTimeout(250);
      await p.waitForTimeout(800);
      const r = await p.evaluate(() => { const h = historial.filter((x) => x.nombre === 'Plaza San Martín').slice(-1)[0]; const it = []; (h.secciones || []).forEach((s) => (s.items || []).forEach((x) => it.push([String(x.desc).slice(0, 40), x.cant, x.cod]))); return { l: it.filter((x) => /^Luminaria vial LED/.test(x[0])), g: columnaGrupos.map((g) => g.altura + 'x' + g.columnas).join(','), bar: document.getElementById('r185Bar').textContent, m: window.__calc185.cuentas().mats, e: window.__calc185.estadoInterno() }; });
      c(r.l.some((x) => /180 W/.test(x[0]) && x[1] === 8 && x[2] === 6011) && r.g === '7x12', 'con «Sí» queda el cómputo nuevo (12 columnas, 8 × 180 W 6011) y el formulario cargado en sus pestañas · ' + JSON.stringify(r.l));
      c(new RegExp(r.m + ' materiales').test(r.bar) && !r.e.dirty, 'la barra de abajo se pone al día con el cómputo del asistente · ' + r.bar.trim().slice(0, 80));
      c(!sinErr(A).length, 'sin errores de JS (asistente) · ' + JSON.stringify(sinErr(A).slice(0, 3)));
      await A.page.close();
    }
    // ================================================================= 4) Resultado por rubro, lo que sale de cada rubro, «cambió algo»
    if (SOLO(4)) {
      const A = await sesion(); const p = A.page;
      await cargar(p, K1); await p.click('#calcFlotante .cf-calc'); await p.waitForTimeout(1500);
      let x = await p.evaluate(() => ({ cards: [...document.querySelectorAll('#r185Res [data-r185rc]')].map((c) => c.dataset.r185rc), tiles: [...document.querySelectorAll('#r185Res .r185-tile b')].map((b) => b.textContent.trim()), rc: document.getElementById('resultCard').offsetParent !== null, form: document.querySelector('#viewCalculadora .grid > div:first-child').offsetParent !== null }));
      c(['col', 'lum', 'ele', 'civ', 'pat'].every((k) => x.cards.indexOf(k) >= 0) && !x.form, 'Resultado por rubro: Columnas, Luminarias, Eléctrico, Civil y PAT (sin el formulario) · ' + x.cards.join(','));
      c(x.tiles.length === 3 && /^\d+$/.test(x.tiles[0]) && /^≈ \d/.test(x.tiles[1]), 'tres números: materiales, módulos K y avisos · ' + x.tiles.join(' | '));
      if (CAP) await p.screenshot({ path: `${CAP}/resultado_por_rubro${cel ? '_cel' : ''}.png`, fullPage: true });
      const lumRes = await p.evaluate(() => [...document.querySelectorAll('#r185Res [data-r185rc="lum"] tbody tr')].map((t) => t.textContent.replace(/\s+/g, ' ').trim()));
      await p.evaluate(() => document.querySelector('#r185Res [data-r185ir="lum"]').click()); await p.waitForTimeout(500);
      x = await p.evaluate(() => ({ e: window.__calc185.estadoInterno(), prev: document.getElementById('r185Prev').offsetParent !== null, filas: [...document.querySelectorAll('#r185Prev tbody tr')].map((t) => t.textContent.replace(/\s+/g, ' ').trim()), corto: (document.querySelector('#r185Prev .r185-corto') || {}).textContent || '', vis: document.getElementById('vincCantCol').offsetParent !== null }));
      c(x.e.tab === 'lum' && x.vis, '«✎ Cambiar» de Luminarias lleva a su pestaña · ' + x.e.tab);
      if (!cel) {
        c(x.prev && x.filas.length === lumRes.length && x.filas.join('|') === lumRes.join('|') && x.filas.some((f) => /180 W/.test(f)), `compu: al lado, «Lo que sale de 💡 Luminarias» (${x.filas.length} materiales, los mismos del Resultado)`);
        const g = await p.evaluate(() => { const a = document.querySelector('#viewCalculadora .grid > div:first-child').getBoundingClientRect(), b = document.getElementById('r185Prev').getBoundingClientRect(); return { lado: b.left > a.right - 2, arriba: Math.abs(b.top - a.top) < 40 }; });
        c(g.lado && g.arriba, 'compu: el panel va a la derecha de la pestaña · ' + JSON.stringify(g));
      } else c(x.prev && /y \d+ más/.test(x.corto), 'celu: abajo, lo que sale del rubro en corto («y N más ›») · ' + x.corto.slice(0, 80));
      await p.fill('#vincCantCol', '11'); await p.waitForTimeout(500);
      x = await p.evaluate(() => ({ bar: document.getElementById('r185Bar').textContent, d: (document.querySelector('#r185Tabs [data-r185t="res"] .r185-d') || {}).className || '' }));
      c(/Cambió algo desde el último cálculo/.test(x.bar) && /av/.test(x.d), 'si cambia algo: «Cambió algo desde el último cálculo» y el Resultado en naranja · ' + x.bar.trim().slice(0, 90));
      await p.click('#calcFlotante .cf-calc'); await p.waitForTimeout(1500);
      x = await p.evaluate(() => ({ bar: document.getElementById('r185Bar').textContent, e: window.__calc185.estadoInterno() }));
      c(!/Cambió algo/.test(x.bar) && x.e.tab === 'res', 'al volver a calcular se va el aviso');
      // hoja completa e imprimir siguen
      await p.evaluate(() => document.querySelector('#r185Res [data-r185s="hoja"]').click()); await p.waitForTimeout(400);
      x = await p.evaluate(() => ({ rc: document.getElementById('resultCard').offsetParent !== null, imp: !!document.querySelector('#resultCard [onclick*="imprimirComputo"]') }));
      c(x.rc && x.imp, '«Hoja completa»: el resultado de siempre (con imprimir, itemizado, pañol) · ' + JSON.stringify(x));
      if (CAP) {
        for (const k of ['obra', 'col', 'lum', 'ele', 'civ', 'pat']) { await ir(p, k); await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(250); await p.screenshot({ path: `${CAP}/pestana_${k}${cel ? '_cel' : ''}.png` }); }
        await ir(p, 'res'); await p.evaluate(() => { document.querySelector('#r185Res [data-r185s="rub"]').click(); window.scrollTo(0, 0); }); await p.waitForTimeout(300); await p.screenshot({ path: `${CAP}/pestana_resultado${cel ? '_cel' : ''}.png` });
      }
      c(!sinErr(A).length, 'sin errores de JS · ' + JSON.stringify(sinErr(A).slice(0, 3)));
      await A.page.close();
    }
    // ================================================================= 5) __v185No
    if (SOLO(5)) {
      const A = await sesion({ v185: false }); const p = A.page;
      await p.evaluate(() => mostrarVista('calc')); await p.waitForTimeout(800);
      const r = await p.evaluate(() => ({ r185: document.getElementById('viewCalculadora').classList.contains('r185'), tabs: !!document.getElementById('r185Tabs'), bar: !!document.getElementById('r185Bar'), esq: !!document.querySelector('#cardColumnas #esquemaTierra'), sc: getComputedStyle(document.getElementById('subtabsCalc')).display, api: !!window.__calc185, modo: !!document.querySelector('#viewCalculadora .grid .cb-modo') }));
      c(!r.r185 && !r.tabs && !r.bar && r.esq && r.sc !== 'none' && !r.api && r.modo, 'con __v185No la Calculadora de antes (todas las tarjetas, el esquema en Columnas, la barra flotante de antes) · ' + JSON.stringify(r));
      await A.page.close();
    }
  } catch (e) { console.error(e); c(false, 'error: ' + e.message); }
  try { browser && await browser.close(); } catch (e) { }
  process.exit(c.fin() ? 1 : 0);
})();
