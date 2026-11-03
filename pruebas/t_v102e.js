// Pruebas v102 (5) · «Finalizada» con un solo criterio, obras ocultas en los totales de plata, ganancia sin IVA,
// certificado plaza por plaza, material reconocido por código, notas corregidas, cable del itemizado con la subida.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
(async () => {
  const c = prueba('v102e' + (cel ? ' cel' : ''));
  const d = baseDatos();
  d.db.avanceObras.p2 = { nombre: 'Plaza Oculta', obraId: '9001', estado: 'En curso', oculta: true, creado: Date.now(), valorItems: [{ id: 1, itemPliego: '6', cantidad: 2, cantidadAvanzada: 2 }] };
  d.db.avanceObras.p1.valorItems = [{ id: 1, itemPliego: '6', cantidad: 4, cantidadAvanzada: 4 }];
  d.db.avanceObras.p1.estado = 'En curso';
  const A = await abrir({ sesion: 'admin', cel, datos: d, espera: 3500, reglas: true }), p = A.page;
  p.on('dialog', (x) => x.accept());
  let r = await p.evaluate(() => ({ fin: window.__obraFin(avanceObras.find((o) => o.id === 'p1')), no: window.__obraFin({ estado: 'En curso', valorItems: [{ id: 1, itemPliego: '6', cantidad: 4, cantidadAvanzada: 1 }] }), enc: window.__obraFin({ encendida: true }) }));
  c(r.fin && !r.no && r.enc, 'una obra «En curso» con el avance al 100 % cuenta como Finalizada (igual en Inicio y en el mapa); al 25 % no · ' + JSON.stringify(r));
  r = await p.evaluate(async () => {
    mostrarVista('avance'); await new Promise((s) => setTimeout(s, 500)); try { window.renderEpec(); } catch (e) { }
    await new Promise((s) => setTimeout(s, 400)); const t = (document.getElementById('epecTiles') || {}).innerText || '';
    return { t, n: (window.avanceObrasOcultas || []).length };
  });
  c(r.n === 1 && /\/\s*2/.test(r.t), 'Itemizado 2026: la obra oculta (terminada) sigue en los totales de plata · ' + r.t.replace(/\s+/g, ' '));
  r = await p.evaluate(async () => {
    const o = avanceObras.find((x) => x.id === 'p1'), f1 = window.__gastosPro.filaObra(o);
    const ck = document.getElementById('epecBaseIva'); let f2 = null, iva = null;
    if (ck) { const v0 = ck.value; ck.value = 'con'; iva = window.epecConIva(); f2 = window.__gastosPro.filaObra(o); ck.value = v0; }
    return { a: f1 && f1.itemizado, b: f2 && f2.itemizado, iva };
  });
  c(r.a > 0 && r.iva === true && Math.abs(r.a - r.b) < 0.01, 'Ganancia: el contratado no cambia con «con IVA» (va sin IVA, como los gastos) · ' + JSON.stringify(r));
  // material por código aunque se haya renombrado en el catálogo
  r = await p.evaluate(() => {
    const b = STOCK_CATALOGO_BASE.find((x) => x.codigo === 1010);
    (window.catalogoCambios = window.catalogoCambios || []).push({ codigo: 1010, desc: 'CONDUCTOR RENOMBRADO' }); __catalogoCache = null;
    const mk = (id, de) => ({ id, secciones: [{ titulo: 'CABLEADO', items: [{ desc: de + ' — 100 m de zanja', cod: 1010, cantNecesaria: 130, un: 'm' }] }] });
    const s = (x) => { const v = window.epecPreviaDe(x); return JSON.stringify(((v && v.filas) || []).map((i) => [i.item, i.cantidad])); };
    const r = { ren: s(mk('zz', 'CONDUCTOR RENOMBRADO')), orig: s(mk('zy', b.desc)), base: b.desc };
    window.catalogoCambios.pop(); __catalogoCache = null; return r;
  });
  c(r.orig !== '[]' && r.ren === r.orig, 'paso al itemizado: un producto renombrado en el catálogo se reconoce igual por su código · ' + JSON.stringify(r));
  // notas
  r = await p.evaluate(() => { const h = document.documentElement.innerHTML; return { gris: /Solo la de <b>fase \(gris\)<\/b> sigue la sección/.test(h), hc: /hoja C <b>todavía no se computan/.test(h) }; });
  c(!r.gris && !r.hc, 'las notas viejas (BPN «solo la gris sigue la sección», «cables de la hoja C no se computan») ya no están · ' + JSON.stringify(r));
  // cable del itemizado: provisión y tendido → con la subida
  r = await p.evaluate(() => { const o = { id: 'zc', secciones: [{ titulo: 'CABLEADO', items: [{ desc: 'Cable Cu 4×4 mm² — 100 m de zanja', cantNecesaria: 130, un: 'm' }] }] }; const it = ((window.epecPreviaDe(o) || {}).filas || []).find((i) => +i.item === 37); return it ? { c: it.cantidad, m: it.motivo } : null; });
  c(r && Math.abs(r.c - 130) < 0.01 && /Provisión y tendido/.test(r.m), 'ítem 37 «Provisión y tendido en zanja de cable»: paga el cable entero (zanja + subidas), la zanja va aparte · ' + JSON.stringify(r));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})();
