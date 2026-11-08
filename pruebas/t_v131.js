// v131 · «🔧 Revisar el catálogo» (unidades, código reutilizado 7013, repetidos → unificar con el stock trazable; nada se escribe sin confirmar)
// y carrusel foto → 🧊 3D → 📐 Plano en la ficha del material y de la herramienta (sin foto arranca en el 3D), visor claro de la hoja.
const fs = require('fs');
const { abrir, otraPagina, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mN4+vQpAAWuAtWnU9yRAAAAAElFTkSuQmCC';
const MAT = __dirname + '/materiales_prueba';
(async () => {
  const c = prueba('v131' + (cel ? ' cel' : ''));
  // materiales/ falso y chico (como el que arma armar_materiales.py)
  fs.mkdirSync(MAT, { recursive: true });
  fs.writeFileSync(MAT + '/indice.json', JSON.stringify({ v: '2026-11-08 10:00', codigos: { 2009: ['mat_borneras_1'], 6010: ['mat_luminaria_led_1'], 2008: ['mat_falta_1'] }, herramientas: [{ hoja: 'mat_herramientas_1', palabras: ['pinza', 'alicate'] }], titulos: { mat_borneras_1: 'BORNE DE PASO BPN-06', mat_luminaria_led_1: 'LUMINARIA VIAL LED', mat_herramientas_1: 'PINZAS Y ALICATES', mat_falta_1: 'FALTA' } }));
  for (const h of ['mat_borneras_1', 'mat_luminaria_led_1', 'mat_herramientas_1']) for (const s of ['_3d', '_plano', '_hoja']) fs.writeFileSync(MAT + '/' + h + s + '.webp', Buffer.from(PNG, 'base64'));
  global.__matPedidos = [];
  const d = baseDatos(), ahora = Date.now(), FOTO = 'data:image/png;base64,' + PNG;
  d.db.catalogoProductos = {
    1001: { id: '1001', codigo: 1001, desc: 'Alambre para ataduras', un: 'KG', activo: true },
    1005: { id: '1005', codigo: 1005, desc: 'Cable acometida flexible de cobre XLPE 1 x 4 mm', un: 'M', activo: true },
    6010: { id: '6010', codigo: 6010, fotoMini: FOTO, fotoTs: ahora },
    7013: { id: '7013', codigo: 7013, desc: 'ANTEOJO DE SEGURIDAD', un: 'Un.', stock: 3, activo: true, sector: 'pañol', costo: 0, minimo: 0 },
    8029: { id: '8029', codigo: 8029, desc: 'DISCO FLAP 115 MM', un: 'c/a', activo: true, sector: 'pañol', stock: 0 },
    8039: { id: '8039', codigo: 8039, desc: 'Cemento Portland CPN 40/50 (dosaje H-13, 1:2,5:4)', un: 'bolsa 50kg', activo: true, origenAlta: 'calculadora', stock: 0 },
    8042: { id: '8042', codigo: 8042, desc: 'Bloque de telgopor (poliestireno expandido) para ingreso de cable subterráneo (se rompe tras el fraguado)', un: 'Un.', activo: true, origenAlta: 'calculadora', stock: 0 },
    8043: { id: '8043', codigo: 8043, desc: 'Elastómero de sellado aprobado (relleno de vacíos remanentes)', un: 'Un.', activo: true, origenAlta: 'calculadora', stock: 0 },
    9040: { id: '9040', codigo: 9040, desc: 'Cinta aisladora 19 mm', un: 'Un.', activo: true, stock: 0 },
    9041: { id: '9041', codigo: 9041, desc: 'CINTA AISLADORA 19 MM', un: 'UN', activo: true, stock: 2 },
    9022: { id: '9022', codigo: 9022, desc: 'Silicona Neutra Color Negro', un: 'Un.', activo: false, stock: 66 },
    9023: { id: '9023', codigo: 9023, desc: 'Silicona Neutra Color Negro', un: 'Un.', activo: true, stock: 0 }
  };
  d.db.movimientos = { m1: { tipo: 'entrada', codigo: 8039, desc: 'Cemento Portland CPN 40/50 (dosaje H-13, 1:2,5:4)', un: 'bolsa 50kg', cantidad: 5, fecha: d.hoy, ts: ahora - 1e6, usuario: 'admin@ema-alumbrado.app', proveedor: 'Corralón', remito: '1' } };
  d.db.herramientas = { h1: { codigo: 'H-001', nombre: 'Pinza universal 8"', cat: 'mano', marca: 'Bahco', estado: 'ok', asignada: null, creado: ahora, fotoMini: FOTO }, h2: { codigo: 'H-002', nombre: 'Taladro percutor', cat: 'electrica', estado: 'ok', asignada: null, creado: ahora } };
  const MOD = { cel, espera: 3500, reglas: true, matDir: MAT };
  const A = await abrir(Object.assign({ sesion: 'admin', datos: d }, MOD)), p = A.page;
  p.on('dialog', (x) => x.accept());
  const db = () => p.evaluate(() => JSON.parse(JSON.stringify(window.__stubDB())));
  await p.evaluate(() => mostrarVista('stock')); await p.waitForTimeout(800);
  await p.click('#subtabsStock .subtab[data-sub="acceso"]'); await p.waitForTimeout(900);
  const antes = await db();
  let r = await p.evaluate(() => { const c = document.getElementById('cardCatArreglos'); return { vis: !!c && c.offsetParent !== null, ids: [...document.querySelectorAll('#cardCatArreglos [data-ca]')].map((x) => x.dataset.ca), on: [...document.querySelectorAll('#cardCatArreglos [data-ca-chk]:checked')].map((x) => x.dataset.caChk), cod: (document.querySelector('#cardCatArreglos [data-ca-cod]') || {}).value, t: c ? c.textContent.replace(/\s+/g, ' ') : '' }; });
  c(r.vis && /Revisar el catálogo/.test(r.t), 'en Pañol › Acceso y respaldo está «🔧 Revisar el catálogo» para la oficina');
  c(['un:1001', 'un:1005', 'unr:8029'].every((x) => r.ids.includes(x)) && r.on.includes('un:1001') && r.on.includes('un:1005') && !r.on.includes('unr:8029'), 'detecta las unidades (KG → kg, M → m) y la rara «c/a» queda para elegir, sin marcar · ' + JSON.stringify(r.ids));
  c(r.ids.includes('reu:7013') && /ANTEOJO DE SEGURIDAD/.test(r.t) && /CONECTOR C COMPRESION/.test(r.t) && /quedan donde están/.test(r.t) && r.cod === '9042', 'detecta el 7013 reutilizado, propone el siguiente libre de la familia 9 (9042) y avisa que los movimientos viejos quedan · ' + r.cod);
  c(r.ids.includes('rep:9040-9041') && r.on.includes('rep:9040-9041') && ['rep:8008-8039', 'rep:8005-8042', 'rep:8009-8043'].every((x) => r.ids.includes(x) && !r.on.includes(x)) && !r.ids.some((x) => /9022/.test(x)), 'repetidos: el idéntico marcado; 8039/8042/8043 como «parecen el mismo, confirmá» sin marcar; el de baja (9022) no cuenta');
  if (cel) await p.screenshot({ path: __dirname + '/v131_revisar_cel.png', fullPage: false });
  // validación del código nuevo
  await p.fill('#cardCatArreglos [data-ca-cod="reu:7013"]', '7013'); await p.click('#caAplicar'); await p.waitForTimeout(300);
  r = await p.evaluate(() => ({ conf: !!document.getElementById('caConf'), msg: (document.querySelector('#cardCatArreglos .ca-msg') || {}).textContent || '' }));
  c(!r.conf && /ya existe/.test(r.msg), 'si el código nuevo ya existe, avisa y no sigue · ' + r.msg);
  await p.fill('#cardCatArreglos [data-ca-cod="reu:7013"]', '9042');
  await p.selectOption('#cardCatArreglos [data-ca-un="unr:8029"]', 'Un.'); await p.waitForTimeout(200);
  await p.check('#cardCatArreglos [data-ca-chk="rep:8008-8039"]'); await p.waitForTimeout(200);
  await p.check('#cardCatArreglos [data-ca-pasar="reu:7013"]'); await p.waitForTimeout(200);
  await p.click('#caAplicar'); await p.waitForTimeout(400);
  r = await p.evaluate(() => ({ li: [...document.querySelectorAll('#caConf li')].map((x) => x.textContent) }));
  const medio = await db();
  c(r.li.length >= 7 && r.li.some((x) => /Unificar 8039 → 8008/.test(x) && /5/.test(x)) && JSON.stringify(medio.catalogoProductos) === JSON.stringify(antes.catalogoProductos) && JSON.stringify(medio.movimientos) === JSON.stringify(antes.movimientos), 'pide confirmar con la lista de cambios y todavía no escribió nada · ' + r.li.length);
  if (cel) await p.screenshot({ path: __dirname + '/v131_confirmar_cel.png' });
  await p.click('#caSi'); await p.waitForTimeout(2500);
  const des = await db(), cp = des.catalogoProductos, mv = Object.values(des.movimientos || {}), au = Object.values(des.auditoria || {});
  c(cp['1001'].un === 'kg' && cp['1005'].un === 'm' && cp['8029'].un === 'Un.', 'al confirmar guarda las unidades (kg, m y la elegida a mano)');
  c(/CONECTOR C COMPRESION/.test(cp['7013'].desc) && cp['7013'].un === 'Un.' && cp['9042'] && cp['9042'].desc === 'ANTEOJO DE SEGURIDAD' && cp['9042'].activo === true && cp['9042'].origenAlta === 'arreglo', 'el 7013 vuelve a ser el conector y el anteojo queda con el código 9042');
  c(cp['8039'].activo === false && cp['8039'].unidoEn === '8008' && cp['9041'].activo === false && cp['9041'].unidoEn === '9040' && cp['8042'].activo !== false, 'unificar: el que sobra queda de baja con «unidoEn» (no se borra); lo no marcado no se toca');
  const par = (de, a) => { const s = mv.find((m) => m.correccion && m.tipo === 'salida' && +m.codigo === de && m.correccionHacia === String(a)), e = s && mv.find((m) => m.correccionGrupo === s.correccionGrupo && m.tipo === 'entrada' && +m.codigo === a); return s && e ? s.cantidad : null; };
  c(par(8039, 8008) === 5 && par(9041, 9040) === 2 && par(7013, 9042) === 3, 'el stock pasa con el par de «Corrección de código» (trazable): 5 del 8039, 2 del 9041, 3 del 7013 · ' + JSON.stringify([par(8039, 8008), par(9041, 9040), par(7013, 9042)]));
  r = await p.evaluate(() => ({ a: stockActual(8008), b: stockActual(8039), n: stockActual(9042) }));
  c(r.a === 5 && r.b === 0 && r.n === 3, 'el stock queda en el que sigue · ' + JSON.stringify(r));
  c(au.filter((x) => /^catalogo_/.test(x.accion)).length >= 6 && au.some((x) => x.accion === 'catalogo_unificar' && /8039→8008/.test(x.detalle)), 'cada cambio queda en la Auditoría · ' + au.filter((x) => /^catalogo_/.test(x.accion)).length);
  await p.waitForTimeout(1200);
  r = await p.evaluate(() => ({ ids: [...document.querySelectorAll('#cardCatArreglos [data-ca]')].map((x) => x.dataset.ca), av: !!document.getElementById('avisoApp') }));
  c(!r.ids.includes('un:1001') && !r.ids.includes('reu:7013') && !r.ids.includes('rep:8008-8039') && r.ids.includes('rep:8005-8042') && r.av, 'después queda solo lo que no se arregló y sale el aviso de la app · ' + JSON.stringify(r.ids));
  await p.evaluate(() => { const a = document.querySelector('#avisoApp .av-ok'); a && a.click(); });
  // ── carrusel ──
  await p.evaluate(() => mostrarVista('stock')); await p.click('#subtabsStock .subtab[data-sub="inventario"]').catch(() => { }); await p.waitForTimeout(300);
  await p.evaluate(() => window.abrirFichaMaterial(2009)); await p.waitForTimeout(900);
  const car = () => p.evaluate(() => { const m = document.querySelector('#pfFoto .mfc'); return m ? { n: +m.dataset.mfcN, cur: +(m.dataset.mfcCur || 0), tipos: [...m.querySelectorAll('.mfc-sl')].map((s) => s.classList.contains('foto') ? 'foto' : s.dataset.mfcTipo), lazy: [...m.querySelectorAll('img[data-mfc-src]')].every((i) => i.loading === 'lazy'), src: [...m.querySelectorAll('img')].map((i) => i.getAttribute('src').slice(0, 80)) } : null; });
  r = await car();
  c(r && r.n === 2 && r.tipos.join() === '3d,plano' && r.lazy && /materiales\/mat_borneras_1_3d\.webp/.test(r.src[0]), 'sin foto: el carrusel arranca en el 3D y después el plano (imágenes de materiales/, «lazy») · ' + JSON.stringify(r));
  r = await p.evaluate(() => { const m = document.querySelector('#pfFoto .mfc'), cs = getComputedStyle(m); return cs.backgroundColor; });
  c(r !== 'rgb(0, 0, 0)', 'el carrusel no tiene fondo negro · ' + r);
  // le suben la foto: el pañol cambia el cuadro y la foto pasa a ser la primera
  await p.evaluate((f) => { document.getElementById('pfFoto').innerHTML = `<img src="${f}" alt="foto">`; }, FOTO); await p.waitForTimeout(500);
  r = await car();
  c(r && r.tipos.join() === 'foto,3d,plano' && /^data:image/.test(r.src[0]), 'apenas le suben una foto, pasa a ser la primera: foto → 3D → plano · ' + JSON.stringify(r && r.tipos));
  await p.evaluate(() => { const m = document.getElementById('pfModal'); m && m.remove(); });
  await p.evaluate(() => window.abrirFichaMaterial(6010)); await p.waitForTimeout(900);
  r = await car();
  c(r && r.tipos.join() === 'foto,3d,plano' && /^data:image/.test(r.src[0]), 'con foto: la foto es la principal, después 3D y plano · ' + JSON.stringify(r && r.tipos));
  if (cel) await p.screenshot({ path: __dirname + '/v131_carrusel_cel.png' });
  await p.click('#pfFoto [data-mfc-ir="1"]'); await p.waitForTimeout(700);
  const r1 = await car();
  await p.evaluate(() => { const s = document.querySelector('#pfFoto .mfc-pista'); s.scrollLeft = 2 * s.clientWidth; s.dispatchEvent(new Event('scroll')); }); await p.waitForTimeout(500);
  const r2 = await car(), pt = await p.evaluate(() => [...document.querySelectorAll('#pfFoto [data-mfc-pt]')].findIndex((b) => b.classList.contains('on')));
  c(r1.cur === 1 && r2.cur === 2 && pt === 2, 'se pasa con › y deslizando, y los puntitos siguen · ' + JSON.stringify([r1.cur, r2.cur, pt]));
  await p.click('#pfFoto .mfc-sl[data-mfc-tipo="plano"]'); await p.waitForTimeout(600);
  r = await p.evaluate(() => { const v = document.getElementById('mfVisor'); if (!v) return null; const i = v.querySelector('.mfv-cuerpo img'); return { bg: getComputedStyle(v).backgroundColor, bgc: getComputedStyle(v.querySelector('.mfv-cuerpo')).backgroundColor, src: i.getAttribute('src'), ficha: !!document.getElementById('pfModal') }; });
  c(r && /mat_luminaria_led_1_hoja\.webp$/.test(r.src) && r.bg !== 'rgb(0, 0, 0)' && r.bgc !== 'rgb(0, 0, 0)' && r.ficha, 'tocar el plano abre la hoja completa en un visor claro (no negro) · ' + JSON.stringify(r));
  await p.click('#mfVisor [data-mfv="mas"]'); await p.waitForTimeout(200);
  r = await p.evaluate(() => +document.getElementById('mfVisor').dataset.zoom);
  c(r > 1, 'el visor acerca (＋, rueda, dos dedos) · zoom ' + r);
  if (cel) await p.screenshot({ path: __dirname + '/v131_visor_cel.png' });
  await p.click('#mfVisor [data-mfv="cerrar"]'); await p.waitForTimeout(200);
  r = await p.evaluate(() => ({ v: !!document.getElementById('mfVisor'), f: !!document.getElementById('pfModal') }));
  c(!r.v && r.f, 'al cerrar el visor vuelve a la ficha');
  await p.evaluate(() => { const m = document.getElementById('pfModal'); m && m.remove(); });
  // hoja que no llega: aviso sin señal
  await p.evaluate(() => window.abrirFichaMaterial(2008)); await p.waitForTimeout(1200);
  r = await p.evaluate(() => (document.querySelector('#pfFoto .mfc') || {}).textContent || '');
  c(/Sin señal: el 3D se ve cuando vuelva/.test(r) && /Sin señal: el plano se ve cuando vuelva/.test(r), 'si la imagen no llega: «Sin señal: el plano se ve cuando vuelva» · ' + r.replace(/\s+/g, ' ').slice(0, 90));
  await p.evaluate(() => { const m = document.getElementById('pfModal'); m && m.remove(); });
  // herramientas
  await p.click('#subtabsStock .subtab[data-sub="herramientas"]'); await p.waitForTimeout(1200);
  await p.evaluate(() => { const b = document.querySelector('[data-hrabrir="h1"]'); b && b.click(); }); await p.waitForTimeout(900);
  r = await p.evaluate(() => { const m = document.querySelector('#hrModal .hr-foto .mfc'); return m ? [...m.querySelectorAll('.mfc-sl')].map((s) => s.classList.contains('foto') ? 'foto' : s.dataset.mfcTipo + ':' + s.dataset.mfcHoja) : null; });
  c(r && r.join() === 'foto,3d:mat_herramientas_1,plano:mat_herramientas_1', 'en la herramienta (buscada por palabras del nombre): foto → 3D → plano · ' + JSON.stringify(r));
  await p.evaluate(() => { const x = document.querySelector('#hrModal [data-hr="cerrar"]'); x && x.click(); }); await p.waitForTimeout(300);
  await p.evaluate(() => { const b = document.querySelector('[data-hrabrir="h2"]'); b && b.click(); }); await p.waitForTimeout(900);
  r = await p.evaluate(() => { const h = document.querySelector('#hrModal .hr-foto'); return h ? { mfc: !!h.querySelector('.mfc'), t: h.textContent } : null; });
  c(r && !r.mfc, 'una herramienta sin hoja queda como siempre · ' + JSON.stringify(r));
  await p.evaluate(() => { const x = document.querySelector('#hrModal [data-hr="cerrar"]'); x && x.click(); });
  c(global.__matPedidos.filter((x) => /indice\.json$/.test(x)).length === 1, 'el índice de materiales se trae una sola vez · ' + global.__matPedidos.filter((x) => /indice/.test(x)).length);
  if (cel) { const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); c(sw <= 0, 'sin scroll de costado · ' + sw); }
  // sin señal y sin índice guardado (otro aparato): avisa en la ficha
  global.__matSinRed = true;
  const B = await otraPagina(A, Object.assign({}, MOD, { sesion: 'admin' })), q = B.page;
  await q.evaluate(() => { try { localStorage.removeItem('ema.mat.indice'); } catch (e) { } window.__matFichas._mf.ind = null; window.__matFichas._mf.revisado = false; });
  await q.evaluate(() => window.abrirFichaMaterial(2009)); await q.waitForTimeout(1200);
  r = await q.evaluate(() => (document.getElementById('pfFoto') || {}).textContent || '');
  c(/Sin señal: el plano se ve cuando vuelva/.test(r), 'sin señal y sin índice: «Sin señal: el plano se ve cuando vuelva» · ' + r.replace(/\s+/g, ' '));
  global.__matSinRed = false;
  // la cuadrilla no ve el panel de arreglos
  const P = await otraPagina(A, Object.assign({}, MOD, { sesion: 'pedro' })), pq = P.page;
  await pq.evaluate(() => { try { mostrarVista('stock'); } catch (e) { } }); await pq.waitForTimeout(600);
  r = await pq.evaluate(() => { const c = document.getElementById('cardCatArreglos'); return c ? { oc: c.classList.contains('ca-oculto'), vis: c.offsetParent !== null, n: c.querySelectorAll('[data-ca]').length } : null; });
  c(r && r.oc && !r.vis && r.n === 0, 'otro rol (cuadrilla) no ve «Revisar el catálogo» · ' + JSON.stringify(r));
  const errs = (A.errores || []).concat(B.errores || [], P.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script|404/i.test(e));
  c(!errs.length, 'sin errores de JS ' + JSON.stringify(errs.slice(0, 3)));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
