(function () {
  "use strict";
  // v168 · Luminarias armadas (Ángel 18/11: «del depósito sacamos artefacto, prensacable y cable, armamos el artefacto armado…
  //   la idea es tener stock de ya armadas para no perder tiempo… es como un movimiento interno pero no podemos perder el
  //   registro porque sale del pañol pero no sale de la empresa… algo rápido para mover las armadas a la plaza que lo necesite»).
  //   Eligió la «Idea 1 + 2» y aprobó las maquetas (Receta · Pañol › Armadas · Armar · Comprobante · Llevar a obra).
  //  · RECETA: un producto del pañol con `armada {v:1, piezas[{codigo, desc, un, cant}], ts, por, porNombre, hist[]}` en
  //    catalogoProductos (por fbGuardarProductoCatalogo, sin reglas nuevas). El CÓDIGO LO ELIGE LA PERSONA: la app propone el
  //    siguiente libre de la familia 6 en x001–x499 (botón «Usar …») y valida que no esté en el catálogo, en movimientos, en
  //    cálculos ni en reservas (codigosConMovimientos) ni en los códigos de barrio movidos. Las cantidades NO se precargan.
  //  · ARMAR: un grupo de movimientos con `armado:true`, `armadoGrupo`, `numero:"AR-0001"` (prefijo a confirmar): salidas de
  //    cada pieza y la entrada de la armada (precioUnit = suma de las piezas al último costo, con `receta` copiada y de dónde
  //    salió cada costo). Sin obra: NO es consumo ni gasto de ninguna obra. stockActual cuenta las dos patas.
  //  · LO QUE LEE MOVIMIENTOS: `window.__armVista(lista)` = `desglosar` (saca las patas del armado y abre cada armada que
  //    salió a una obra —o volvió— en sus piezas, con la receta guardada en el armado más cercano anterior o la vigente).
  //    La usan el legajo, «calculado vs. entregado», __reservas.entregadoAObra, costos de la obra, gastos por mes,
  //    __matAvance, pedido de compras, informe semanal, informes, ficha del material y «Por sector» (ver el parche).
  //  · LLEVAR A OBRA: un vale de salida común (S-, valeGrupo, el comprobante de siempre) de la armada a la obra.
  //  · DEPÓSITO LUMINARIAS: la obra que usan de depósito → «Pasarlo a armadas» (devolución desde esa obra + armado), con «Sí».
  //  Sin reglas nuevas. Apagado con __v168No.
  const $ = (id) => document.getElementById(id);
  const esc = (t) => (typeof escHtml == "function" ? escHtml(String(t == null ? "" : t)) : String(t == null ? "" : t).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]));
  const intentar = (f, d) => { try { return f(); } catch (e) { return d; } };
  const no = () => !!window.__v168No;
  const n0 = (v) => { const x = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(x) ? x : 0; };
  const r4 = (x) => Math.round(x * 1e4) / 1e4;
  const f2 = (x) => (typeof fmt == "function" ? fmt(r4(x), Number.isInteger(r4(x)) ? 0 : 2) : String(r4(x)));
  const plata = (x) => (typeof formatMoney == "function" ? formatMoney(x) : "$ " + Math.round(x));
  const nrm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const movs = () => (Array.isArray(window.stockMovimientos) ? window.stockMovimientos : []);
  const cambios = () => (Array.isArray(window.catalogoCambios) ? window.catalogoCambios : []);
  const obras = () => intentar(() => (typeof avanceObras != "undefined" && Array.isArray(avanceObras) ? avanceObras : window.avanceObras || []), []) || [];
  const ots = () => intentar(() => (typeof ordenesTrabajo != "undefined" && Array.isArray(ordenesTrabajo) ? ordenesTrabajo : []), []) || [];
  const hoyISO = () => (typeof fechaAISO == "function" ? fechaAISO(new Date()) : new Date().toISOString().slice(0, 10));
  const masDias = (f, d) => { const x = new Date(f + "T12:00:00"); x.setDate(x.getDate() + d); return typeof fechaAISO == "function" ? fechaAISO(x) : x.toISOString().slice(0, 10); };
  const fC = (f) => (typeof formatFechaCorta == "function" ? formatFechaCorta(f) : f);
  const yoEmail = () => String((window.__fbUser && window.__fbUser.email) || "");
  const yoNombre = () => intentar(() => { const y = window.PERMISOS && PERMISOS.yo && PERMISOS.yo(); return String((y && (y.nombre || y.persona || y.usuario)) || yoEmail()); }, yoEmail());
  const perm = (h) => intentar(() => (window.PERMISOS && PERMISOS.permiso ? PERMISOS.permiso(h) : "oculto"), "oculto");
  const esDir = () => intentar(() => !!(window.__esDireccion && window.__esDireccion()), false);
  const esCrew = () => intentar(() => !!(window.__cuadrilla && window.__cuadrilla.esCrew()), false);
  const puedeEditar = () => !no() && perm("stock") === "editar" && !esDir() && !esCrew();
  const veStock = () => !no() && perm("stock") !== "oculto";
  const st = (c) => intentar(() => (typeof stockActual == "function" ? n0(stockActual(c)) : 0), 0);
  const reservado = (c) => intentar(() => (typeof window.stockReservado == "function" ? n0(window.stockReservado(c)) : 0), 0);
  const base = (c) => intentar(() => (typeof stockBase == "function" ? stockBase(c) : null), null) || intentar(() => catalogoCompleto().find((p) => String(p.codigo) === String(c)), null);
  const descDe = (c) => { const b = base(c); return b ? String(b.desc || "") : "Producto " + c; };
  const unDe = (c) => { const b = base(c); return b ? String(b.un || "") : ""; };
  const corto = (d) => String(d || "").split(" — ")[0].replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();

  // =========================================================================== recetas (productos «armada»)
  let memoR = { ref: null, n: -1, l: [] };
  function recetas(conBajas) {
    const c = cambios();
    if (memoR.ref !== c || memoR.n !== c.length) {
      memoR = { ref: c, n: c.length, l: c.filter((x) => x && x.codigo != null && x.armada && Array.isArray(x.armada.piezas)).map((x) => ({
        codigo: Number(x.codigo), desc: String(x.desc || descDe(x.codigo)), un: String(x.un || "Un."), activo: x.activo !== false,
        piezas: x.armada.piezas.map((p) => ({ codigo: Number(p.codigo), desc: String(p.desc || descDe(p.codigo)), un: String(p.un || unDe(p.codigo)), cant: n0(p.cant) })),
        hist: Array.isArray(x.armada.hist) ? x.armada.hist : [], ts: x.armada.ts || 0, por: x.armada.porNombre || x.armada.por || "" })).sort((a, b) => a.codigo - b.codigo) };
    }
    return conBajas ? memoR.l : memoR.l.filter((r) => r.activo);
  }
  const receta = (cod) => recetas(true).find((r) => String(r.codigo) === String(cod)) || null;
  const es = (cod) => !no() && !!receta(cod);

  // =========================================================================== índice de los armados (por movimientos)
  let memoA = { ref: null, n: -1 };
  function idx() {
    const l = movs();
    if (memoA.ref === l && memoA.n === l.length && memoA.porCod) return memoA;
    const porCod = new Map(), grupos = new Map(); let hay = false;
    l.forEach((m) => {
      if (!m || !m.armado || !m.armadoGrupo) return; hay = true;
      const g = grupos.get(m.armadoGrupo) || { id: m.armadoGrupo, numero: m.numero || "", legs: [], entra: null, sale: [] };
      g.legs.push(m); if (m.tipo === "entrada") g.entra = m; else g.sale.push(m); if (!g.numero && m.numero) g.numero = m.numero;
      grupos.set(m.armadoGrupo, g);
      if (m.tipo === "entrada" && !m.anulado) { const k = String(m.codigo); if (!porCod.has(k)) porCod.set(k, []); porCod.get(k).push(m); }
    });
    porCod.forEach((a) => a.sort((x, y) => (x.ts || 0) - (y.ts || 0)));
    grupos.forEach((g) => { g.anulado = g.legs.every((x) => x.anulado); g.ts = Math.min.apply(null, g.legs.map((x) => x.ts || 0)); });
    memoA = { ref: l, n: l.length, porCod, grupos, hay };
    return memoA;
  }
  // la receta con que salió una armada: la del armado más cercano anterior (si no, el primero; si no, la vigente)
  function recetaDe(m) {
    const a = idx().porCod.get(String(m.codigo)) || [];
    let r = null; const t = m.ts || Infinity;
    a.forEach((x) => { if ((x.ts || 0) <= t && Array.isArray(x.receta) && x.receta.length) r = x; });
    if (!r) r = a.find((x) => Array.isArray(x.receta) && x.receta.length) || null;
    if (r) return { piezas: r.receta, de: r.numero || "armado" };
    const v = receta(m.codigo);
    return v && v.piezas.length ? { piezas: v.piezas, de: "vigente" } : null;
  }
  // ---------- la vista de los movimientos para lo que cuenta consumo / lo entregado a una obra
  let memoD = { ref: null, n: -1, A: null, R: null, out: null };
  function desglosar(l) {
    if (no() || !Array.isArray(l) || !l.length) return l;
    const A = idx(), R = recetas(true);
    if (!A.hay && !R.length) return l;
    if (memoD.ref === l && memoD.n === l.length && memoD.A === A && memoD.R === R) return memoD.out;   // la lista entera, ya abierta
    const out = abrirArmadas(l, A, R);
    if (l === window.stockMovimientos) memoD = { ref: l, n: l.length, A, R, out };
    return out;
  }
  function abrirArmadas(l, A, R) {
    const set = new Set(R.map((r) => String(r.codigo))); A.porCod.forEach((v, k) => set.add(k));
    const out = [];
    for (let i = 0; i < l.length; i++) {
      const m = l[i];
      if (!m) continue;
      if (m.armado) continue;                                  // el armado no es consumo: queda en el pañol
      if (!set.has(String(m.codigo))) { out.push(m); continue; }
      const rc = recetaDe(m); if (!rc) { out.push(m); continue; }
      const q = n0(m.cantidad);
      rc.piezas.forEach((p) => {
        const c = Number(p.codigo);
        out.push(Object.assign({}, m, { codigo: c, desc: p.desc || descDe(c), un: p.un || unDe(c), cantidad: r4(q * n0(p.cant)), precioUnit: p.precio != null ? p.precio : undefined,
          deArmada: { codigo: m.codigo, desc: m.desc || "", cant: q, receta: rc.de } }));
      });
    }
    return out;
  }
  const sinArmado = (l) => (no() || !Array.isArray(l) ? l : l.filter((m) => !(m && m.armado)));

  // =========================================================================== códigos
  function ocupados() {
    const s = new Set();
    intentar(() => catalogoCompleto().forEach((p) => s.add(Number(p.codigo))));
    intentar(() => codigosConMovimientos().forEach((c) => s.add(Number(c))));
    cambios().forEach((x) => x && x.codigo != null && s.add(Number(x.codigo)));
    Object.keys(window.CODIGOS_BARRIO_MOVIDOS || {}).forEach((k) => s.add(Number(k)));
    return s;
  }
  function proponerCodigo(fam) {
    fam = fam || 6000; const s = ocupados(), tope = window.CODIGO_TOPE_EQUIPO || 499;
    for (let c = fam + 1; c <= fam + tope; c++) if (!s.has(c)) return c;
    return null;
  }
  function codigoMal(c) {
    const x = Number(String(c == null ? "" : c).trim());
    if (!String(c == null ? "" : c).trim()) return "Elegí el código del pañol (la app no lo pone sola).";
    if (!isFinite(x) || x % 1 || x < 1001 || x > 9999) return "El código tiene que ser un número de 4 cifras (familia 1 a 9).";
    const r = x % 1000; if (r < 1 || r > (window.CODIGO_TOPE_EQUIPO || 499)) return "Los códigos x500–x999 son de los materiales que trae la app: elegí uno entre x001 y x499.";
    if (ocupados().has(x)) return "El código " + x + " ya está usado (en el catálogo, en movimientos, en cálculos o en reservas): elegí otro.";
    return "";
  }

  // =========================================================================== costos
  function costoPieza(c) {
    const u = intentar(() => (typeof stockUltimoPrecio == "function" ? stockUltimoPrecio(c) : null), null);
    if (u && n0(u.precioUnit) > 0) return { precio: n0(u.precioUnit), fuente: "último precio cargado (" + fC(u.fecha || "") + ")" };
    const b = base(c); if (b && n0(b.costo) > 0) return { precio: n0(b.costo), fuente: "costo del catálogo" };
    return { precio: 0, fuente: "sin precio cargado" };
  }

  // =========================================================================== armar
  function planArmar(cod, n) {
    const r = receta(cod); n = Math.max(0, Math.floor(n0(n)));
    if (!r) return null;
    const filas = r.piezas.map((p) => { const hay = st(p.codigo), need = r4(p.cant * n), max = p.cant > 0 ? Math.floor((hay + 1e-9) / p.cant) : 0; return Object.assign({}, p, { hay, need, falta: need > hay + 1e-9, max: Math.max(0, max), costo: costoPieza(p.codigo) }); });
    const sinCant = filas.some((f) => !(f.cant > 0));
    const max = filas.length && !sinCant ? Math.min.apply(null, filas.map((f) => f.max)) : 0;
    const costoU = r4(filas.reduce((s, f) => s + f.costo.precio * f.cant, 0));
    return { r, n, filas, max, sinCant, ok: n > 0 && !sinCant && filas.length > 0 && filas.every((f) => !f.falta), costoU, conCosto: filas.every((f) => f.costo.precio > 0) };
  }
  const recientes = new Map();
  function proximoAR() {
    let mx = 0;
    movs().forEach((m) => { const x = String((m && m.numero) || "").match(/^AR-(\d+)/); if (x) mx = Math.max(mx, +x[1]); });
    recientes.forEach((v) => { const x = String(v).match(/^AR-(\d+)/); if (x) mx = Math.max(mx, +x[1]); });
    return "AR-" + String(mx + 1).padStart(4, "0");
  }
  async function add(m) {
    try { Object.defineProperty(m, "__precioOk", { value: true, enumerable: false }); } catch (e) { }   // el precio ya está en $ sin IVA
    return window.fbAddMovimiento(m);
  }
  async function armar(cod, n, quienes, op) {
    op = op || {};
    if (!puedeEditar()) throw new Error("Tu usuario no puede armar en el pañol.");
    const P = planArmar(cod, n);
    if (!P) throw new Error("No encontré la receta de esa armada.");
    if (P.sinCant) throw new Error("La receta tiene piezas sin cantidad: completala antes de armar.");
    if (!(P.n > 0)) throw new Error("Poné cuántas armaron.");
    if (!P.ok && !op.forzar) throw new Error("No alcanza el stock: se pueden armar hasta " + P.max + ".");
    const numero = proximoAR(), G = "AR" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    recientes.set(G, numero);
    const q = (quienes || []).map((x) => String(x || "").trim()).filter(Boolean);
    const comun = { armado: true, armadoGrupo: G, numero, fecha: hoyISO(), usuario: yoEmail(), sector: "alumbrado", plazaId: "", obraId: "", quienes: q, armadoDe: { codigo: P.r.codigo, desc: P.r.desc, cant: P.n } };
    if (op.deposito) comun.deDeposito = op.deposito;
    const t0 = Date.now(), ids = [];
    for (let i = 0; i < P.filas.length; i++) {
      const f = P.filas[i];
      ids.push(await add(Object.assign({}, comun, { tipo: "salida", codigo: f.codigo, desc: f.desc, un: f.un, cantidad: f.need, destino: "Armado " + numero + " · " + P.r.desc + " (sigue en el pañol)", retiradoPor: q.join(", "), ts: t0 + i })));
    }
    const ent = Object.assign({}, comun, { tipo: "entrada", codigo: P.r.codigo, desc: P.r.desc, un: P.r.un || "Un.", cantidad: P.n, proveedor: "", remito: "", ts: t0 + P.filas.length,
      receta: P.filas.map((f) => ({ codigo: f.codigo, desc: f.desc, un: f.un, cant: f.cant, precio: f.costo.precio, fuente: f.costo.fuente })),
      precioFuente: "suma de las piezas: " + P.filas.map((f) => f2(f.cant) + " " + f.un + " " + corto(f.desc) + " a " + plata(f.costo.precio) + " (" + f.costo.fuente + ")").join(" + ") });
    if (P.costoU > 0) ent.precioUnit = P.costoU;
    ids.push(await add(ent));
    intentar(() => window.fbAuditar && window.fbAuditar(op.deposito ? "armadas_deposito" : "armado", numero + ": " + P.n + " × " + P.r.desc + (q.length ? " · armaron " + q.join(", ") : "") + (op.deposito ? " · desde " + op.deposito.nombre : ""), { ref: G }));
    if (P.costoU > 0 && typeof window.fbGuardarProductoCatalogo == "function") { try { await window.fbGuardarProductoCatalogo({ codigo: P.r.codigo, costo: P.costoU, costoFecha: hoyISO(), costoFuente: "armado " + numero, costoTs: Date.now() }); } catch (e) { } }
    ultimo = { G, numero, cod: P.r.codigo, n: P.n, ts: t0, quienes: q, filas: P.filas, costoU: P.costoU };
    return { numero, G, ids };
  }
  let ultimo = null;
  function grupo(G) { return idx().grupos.get(G) || null; }
  function grupoDeMov(m) { return m && m.armadoGrupo ? grupo(m.armadoGrupo) : null; }
  function puedeAnular(G) {
    const g = grupo(G);
    if (!g || !g.entra) return { ok: false, txt: "No encontré ese armado completo." };
    if (g.anulado) return { ok: false, txt: "Este armado ya está anulado." };
    if (!puedeEditar()) return { ok: false, txt: "Tu usuario no puede anular en el pañol." };
    const q = n0(g.entra.cantidad), hay = st(g.entra.codigo), lib = hay - reservado(g.entra.codigo);
    if (hay + 1e-9 < q) return { ok: false, txt: "Solo hay " + f2(hay) + " " + (g.entra.desc || "armadas") + " en el pañol y este armado puso " + f2(q) + ": las otras ya salieron. No se puede anular (hacé la devolución primero)." };
    return { ok: true, txt: lib + 1e-9 < q ? "Ojo: hay armadas apartadas para una reserva; al anular quedan menos libres." : "" };
  }
  async function anular(G, motivo) {
    const p = puedeAnular(G); if (!p.ok) throw new Error(p.txt);
    if (!String(motivo || "").trim()) throw new Error("Escribí por qué se anula.");
    const g = grupo(G);
    for (const m of g.legs) if (!m.anulado) await window.fbUpdateMovimiento(m.id, { anulado: true, anuladoMotivo: String(motivo).trim() + " (armado " + g.numero + ")", anuladoPor: yoEmail(), anuladoTs: Date.now() });
    intentar(() => window.fbAuditar && window.fbAuditar("armado_anulado", g.numero + ": " + motivo, { ref: G }));
    return true;
  }

  // =========================================================================== llevar a obra (vale de salida común)
  const libres = (cod) => r4(st(cod) - reservado(cod));
  const esDeposito = (o) => { const x = nrm(o && (o.nombre || o.plazaNombre)); return x.indexOf("deposito") >= 0 && x.indexOf("luminaria") >= 0; };
  const entregado = (id) => intentar(() => (window.__reservas && window.__reservas.entregadoAObra ? window.__reservas.entregadoAObra(id) : new Map()), new Map()) || new Map();
  function pideDe(o, cod) {
    let s = 0; (o.secciones || []).forEach((sec) => (sec.items || []).forEach((it) => { if (it && !it.tarea && Number(it.cod) === Number(cod)) s += n0(it.cantNecesaria != null ? it.cantNecesaria : it.cant); }));
    return r4(s);
  }
  function obrasPara(cod) {
    const r = receta(cod), main = r && r.piezas[0], hoy = hoyISO(), hasta = masDias(hoy, 7), O = ots();
    return obras().filter((o) => o && !esDeposito(o) && !o.oculta).map((o) => {
      const prox = O.filter((t) => t && String(t.plazaId) === String(o.id) && t.estado !== "Anulada" && !(t.cierre && t.cierre.cerradoTs) && String(t.fecha || "") >= hoy && String(t.fecha || "") <= hasta).sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)))[0] || null;
      const pide = main ? pideDe(o, main.codigo) : 0, rec = main ? r4(n0(entregado(o.id).get(String(main.codigo)))) : 0;
      return { o, prox, pide, rec, falta: Math.max(0, r4(pide - rec)) };
    }).sort((a, b) => (!!b.prox - !!a.prox) || (a.prox && b.prox ? String(a.prox.fecha).localeCompare(String(b.prox.fecha)) : 0) || (b.falta - a.falta) || String(a.o.nombre || "").localeCompare(String(b.o.nombre || ""), "es"));
  }
  async function llevar(cod, obraId, n, retiradoPor) {
    if (!puedeEditar()) throw new Error("Tu usuario no puede hacer vales del pañol.");
    const r = receta(cod), o = obras().find((x) => String(x.id) === String(obraId));
    if (!r) throw new Error("No encontré esa armada."); if (!o) throw new Error("Elegí la obra.");
    n = Math.floor(n0(n)); if (!(n > 0)) throw new Error("Poné cuántas llevan.");
    const lib = libres(cod); if (n > lib + 1e-9) throw new Error("Hay " + f2(lib) + " libres: no se pueden llevar " + n + ".");
    const vg = "VS" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const prev = intentar(() => window.__numeros.proximo("S"), "");
    const m = { tipo: "salida", codigo: r.codigo, desc: r.desc, un: r.un || "Un.", cantidad: n, fecha: hoyISO(), ts: Date.now(), usuario: yoEmail(), retiradoPor: String(retiradoPor || "").trim(), plazaId: String(o.id), obraId: String(o.obraId || ""), destino: o.nombre || o.plazaNombre || "", valeGrupo: vg, sector: "alumbrado" };
    const id = await add(m);
    intentar(() => window.fbAuditar && window.fbAuditar("armadas_llevar", n + " × " + r.desc + " → " + m.destino, { ref: id }));
    return { id, numero: prev, vg };
  }

  // =========================================================================== depósito luminarias
  const depositos = () => obras().filter(esDeposito);
  function enDeposito(id) {
    const m = entregado(id), l = [];
    m.forEach((v, k) => { if (n0(v) > 1e-6) l.push({ codigo: Number(k), desc: descDe(k), un: unDe(k), cant: r4(n0(v)) }); });
    return l.sort((a, b) => a.codigo - b.codigo);
  }
  function planDeposito(obraId, cod, n, sueltas) {
    const o = obras().find((x) => String(x.id) === String(obraId)), r = receta(cod); n = Math.max(0, Math.floor(n0(n)));
    if (!o || !r) return null;
    const hay = enDeposito(o.id), mapa = new Map(hay.map((x) => [String(x.codigo), x]));
    const filas = r.piezas.map((p) => { const h = mapa.get(String(p.codigo)), en = h ? h.cant : 0, need = r4(p.cant * n); return { codigo: p.codigo, desc: p.desc, un: p.un, cant: p.cant, en, need, falta: need > en + 1e-9, max: p.cant > 0 ? Math.floor((en + 1e-9) / p.cant) : 0 }; });
    const max = filas.length ? Math.min.apply(null, filas.map((f) => f.max)) : 0;
    const sobra = hay.map((h) => { const f = filas.find((x) => String(x.codigo) === String(h.codigo)), usa = f ? f.need : 0, q = r4(h.cant - usa); return Object.assign({}, h, { usa, sobra: q, devolver: !!(sueltas && sueltas[String(h.codigo)]) && q > 1e-6 }); }).filter((x) => x.sobra > 1e-6);
    return { o, r, n, filas, max, sobra, ok: n > 0 && filas.every((f) => !f.falta) && r.piezas.every((p) => p.cant > 0) };
  }
  async function pasarDeposito(P, motivo) {
    if (!puedeEditar()) throw new Error("Tu usuario no puede cargar en el pañol.");
    if (!P || !P.ok) throw new Error("Revisá la cantidad: en el depósito no alcanza para esas armadas.");
    const G = "DV" + Date.now().toString(36), mot = String(motivo || "").trim() || "Pasar el material del depósito a armadas";
    const items = P.filas.map((f) => ({ codigo: f.codigo, desc: f.desc, un: f.un, cant: f.need })).concat(P.sobra.filter((s) => s.devolver).map((s) => ({ codigo: s.codigo, desc: s.desc, un: s.un, cant: s.sobra })));
    const junt = new Map(); items.forEach((x) => { const k = String(x.codigo), y = junt.get(k); if (y) y.cant = r4(y.cant + x.cant); else junt.set(k, Object.assign({}, x)); });
    const lista = [...junt.values()].filter((x) => x.cant > 1e-6), t0 = Date.now();
    const comun = { tipo: "entrada", devolucion: true, devolOrigen: "obra", fecha: hoyISO(), usuario: yoEmail(), sector: "alumbrado", devueltoPor: yoNombre(), devolMotivo: mot, devolObs: "Pasado a armadas (v168)", proveedor: "", remito: "", devolGrupo: G, devolGrupoN: lista.length, devolEstado: "bueno", plazaId: String(P.o.id), obraId: String(P.o.obraId || ""), destino: P.o.nombre || "", deposito168: true };
    for (let i = 0; i < lista.length; i++) await add(Object.assign({}, comun, { codigo: lista[i].codigo, desc: lista[i].desc, un: lista[i].un, cantidad: lista[i].cant, ts: t0 + i }));
    const res = await armar(P.r.codigo, P.n, [], { forzar: true, deposito: { obraId: String(P.o.id), nombre: P.o.nombre || "", devolGrupo: G } });
    return Object.assign({ devolGrupo: G, devueltos: lista }, res);
  }

  // =========================================================================== comprobante y etiqueta
  function htmlArmado(g) {
    const e = g.entra || {}, filas = g.sale.slice().sort((a, b) => (a.ts || 0) - (b.ts || 0)), an = g.anulado;
    const tabla = (l, signo) => "<table><thead><tr><th style=\"width:14%\">Código</th><th>Producto</th><th style=\"width:18%;text-align:right\">Cantidad</th></tr></thead><tbody>" + l.map((m) => "<tr" + (m.anulado ? " style=\"text-decoration:line-through;opacity:.6\"" : "") + "><td>" + esc(m.codigo) + "</td><td>" + esc(m.desc || "") + "</td><td style=\"text-align:right;font-weight:700\">" + signo + f2(n0(m.cantidad)) + " " + esc(m.un || "") + "</td></tr>").join("") + "</tbody></table>";
    const fila = (a, b) => (b ? "<tr><th style=\"width:34%;background:#eef0f6\">" + esc(a) + "</th><td>" + esc(b) + "</td></tr>" : "");
    return (an ? "<div style=\"margin:14px 0;border:2px solid #b3261e;color:#b3261e;border-radius:6px;padding:10px 12px;font-weight:700\">⊘ ESTE ARMADO ESTÁ ANULADO — no cuenta para el stock: las piezas volvieron.<div style=\"font-weight:400;margin-top:4px\">" + esc(e.anuladoMotivo || "") + "</div></div>" : "") +
      "<table>" + fila("Comprobante N°", g.numero) + fila("Fecha", fC(e.fecha || "")) + fila("Tipo", "ARMADO — movimiento interno del pañol (no es gasto de ninguna obra)") + fila("Cargó", e.usuario || "") + fila("Armaron", (e.quienes || []).join(", ")) + (e.deDeposito ? fila("Desde", "Material que estaba en " + e.deDeposito.nombre) : "") + fila("Costo de cada armada", n0(e.precioUnit) > 0 ? plata(n0(e.precioUnit)) + " sin IVA (" + (e.precioFuente || "") + ")" : "sin precio cargado de las piezas") + "</table>" +
      "<h3 style=\"font-size:13px;margin:16px 0 4px\">Salió del pañol (piezas)</h3>" + tabla(filas, "−") +
      "<h3 style=\"font-size:13px;margin:16px 0 4px\">Entró al pañol (armadas)</h3>" + tabla(g.entra ? [g.entra] : [], "+") +
      "<div class=\"sub\" style=\"margin-top:12px\">El material sigue en la empresa: no se cuenta como consumo ni gasto de ninguna obra. Se anula como cualquier comprobante (no se borra) y las piezas vuelven al stock.</div>" +
      "<table style=\"margin-top:26px;border:none\"><tr><td style=\"border:none;width:50%;padding-top:34px\"><div style=\"border-top:1px solid #28285e;padding-top:5px\">Armó — aclaración y firma</div></td><td style=\"border:none;width:50%;padding-top:34px;padding-left:24px\"><div style=\"border-top:1px solid #28285e;padding-top:5px\">Pañol — aclaración y firma</div></td></tr></table>";
  }
  function verArmado(G) {
    const g = grupo(G); if (!g) return false;
    if (typeof abrirHojaImpresion == "function") abrirHojaImpresion("Comprobante de armado — N° " + g.numero, htmlArmado(g));
    return true;
  }
  function etiqueta(G) {
    const g = grupo(G); if (!g || !g.entra) return false;
    const C = window.__codigos, url = C && C.urlDoc ? C.urlDoc(g.numero) : "?doc=" + g.numero, img = C && C.dataUrl ? C.dataUrl(url) : "";
    const caja = "<div style=\"display:inline-block;width:46%;margin:1%;border:2px dashed #28285e;border-radius:10px;padding:14px;text-align:center;vertical-align:top\">" + (img ? "<img src=\"" + img + "\" width=\"190\" height=\"190\" alt=\"QR " + esc(g.numero) + "\" style=\"display:block;margin:0 auto\">" : "") + "<div style=\"font:800 22px ui-monospace,Menlo,monospace;color:#28285e;margin-top:6px\">" + esc(g.numero) + "</div><div style=\"font-weight:700;font-size:15px\">" + esc(g.entra.desc || "") + "</div><div style=\"font-size:14px\">" + f2(n0(g.entra.cantidad)) + " " + esc(g.entra.un || "Un.") + " · armadas el " + esc(fC(g.entra.fecha || "")) + "</div></div>";
    if (typeof abrirHojaImpresion == "function") abrirHojaImpresion("Etiqueta de la caja · armado " + g.numero, caja + caja);
    return true;
  }
  // el comprobante de cualquier pata del armado (listado, QR, ?doc=AR-0001) abre el del armado
  function envolverComprobante() {
    const o = window.verComprobanteMovimiento; if (typeof o != "function" || o.__armado) return !!o;
    const n = function (id) {
      if (!no()) { const m = movs().find((x) => x && x.id === id); if (m && m.armado && m.armadoGrupo && verArmado(m.armadoGrupo)) return; }
      return o.apply(this, arguments);
    };
    window.__heredar && window.__heredar(n, o); n.__armado = 1; window.verComprobanteMovimiento = n; try { verComprobanteMovimiento = n; } catch (e) { } return true;
  }

  // =========================================================================== pantalla: Pañol › Catálogo › «🔧 Luminarias armadas»
  const S = { modo: "", cod: null, n: 1, quien: "", obra: "", busca: "", ret: "", G: "", msg: "", mal: false, enviando: false, receta: null, dep: "", depCod: null, depN: 0, sueltas: {}, depMot: "Pasar el material del depósito a armadas", vale: null, anMot: "", res: null };
  function resumenPiezas(r) { return r.piezas.map((p) => corto(p.desc)).join(" + "); }
  function ultimosArmados(cod, k) {
    const l = []; idx().grupos.forEach((g) => { if (g.entra && String(g.entra.codigo) === String(cod)) l.push(g); });
    return l.sort((a, b) => (b.ts || 0) - (a.ts || 0)).slice(0, k || 3);
  }
  function tarjetaHtml() {
    const R = recetas(false), pe = puedeEditar();
    if (!R.length && !pe) return "";
    let h = "<h2><span class=\"dot\"></span>🔧 Luminarias armadas</h2><div class=\"hint\" style=\"margin-top:2px\">Las armadas siguen siendo del pañol: no salen de la empresa hasta que van a una obra. Cada armado y cada salida queda con su comprobante.</div>";
    if (pe) depositos().forEach((o) => {
      const l = enDeposito(o.id); if (!l.length) return;
      h += "<div class=\"ar-dep\"><b>Tenés material en " + esc(o.nombre || "") + "</b><div class=\"ar-dep-l\">" + l.slice(0, 6).map((x) => f2(x.cant) + " " + esc(x.un) + " " + esc(corto(x.desc))).join(" · ") + (l.length > 6 ? " · …" : "") + "</div>" +
        (R.length ? "<button type=\"button\" class=\"btn-ghost ar-bt\" data-ar=\"dep\" data-arobra=\"" + esc(o.id) + "\">Pasarlo a armadas</button>" : "<div class=\"ar-nota\">Primero cargá la receta de la armada («＋ Nueva armada»).</div>") +
        "<div class=\"ar-nota\">Después, conviene no seguir usando esa obra como depósito: las armadas quedan en el pañol.</div></div>";
    });
    R.forEach((r) => {
      const hay = st(r.codigo), ap = reservado(r.codigo), li = r4(hay - ap), arm = ultimosArmados(r.codigo, 2);
      const necesitan = intentar(() => obrasPara(r.codigo).filter((x) => x.prox && x.falta > 0), []);
      const nec = necesitan.reduce((s, x) => s + x.falta, 0);
      h += "<div class=\"ar-item\" data-arcod=\"" + r.codigo + "\"><div class=\"ar-fila\"><div class=\"ar-nom\"><b>" + esc(r.desc) + "</b><small>" + esc(r.codigo) + " · " + esc(resumenPiezas(r)) + "</small></div><div class=\"ar-num" + (li <= 0 ? " ar-cero" : nec > li ? " ar-poco" : "") + "\"><b>" + f2(hay) + "</b><small>listas</small></div></div>" +
        "<div class=\"ar-chips\">" + (ap > 0 ? "<span class=\"ar-chip\">Apartadas: " + f2(ap) + "</span>" : "") + "<span class=\"ar-chip\">Libres: " + f2(li) + "</span></div>" +
        (nec > li && necesitan.length ? "<div class=\"ar-aviso\" role=\"status\">Quedan pocas: " + esc(necesitan[0].o.nombre || "") + " necesita " + f2(necesitan[0].falta) + (necesitan[0].prox ? " (" + esc(fC(necesitan[0].prox.fecha)) + ")" : "") + (necesitan.length > 1 ? " y " + (necesitan.length - 1) + " obra" + (necesitan.length > 2 ? "s" : "") + " más" : "") + "</div>" : "") +
        (pe ? "<div class=\"ar-acc\"><button type=\"button\" class=\"btn-primary\" data-ar=\"armar\" data-arc=\"" + r.codigo + "\">Armar</button><button type=\"button\" class=\"btn-ghost\" data-ar=\"llevar\" data-arc=\"" + r.codigo + "\"" + (li > 0 ? "" : " disabled") + ">Llevar a obra</button></div>" : "") +
        "<div class=\"ar-links\"><button type=\"button\" class=\"link\" data-ar=\"receta\" data-arc=\"" + r.codigo + "\">" + (pe ? "Ver o cambiar la receta" : "Ver la receta") + "</button>" + arm.map((g) => "<button type=\"button\" class=\"link\" data-ar=\"ver\" data-arg=\"" + esc(g.id) + "\">" + esc(g.numero) + (g.anulado ? " (anulado)" : "") + "</button>").join("") + "</div></div>";
    });
    if (!R.length) h += "<div class=\"hint\">Todavía no hay recetas. Cargá la primera: nombre, código del pañol y qué lleva cada armada.</div>";
    if (pe) h += "<button type=\"button\" class=\"btn-ghost ar-nueva\" data-ar=\"nueva\">＋ Nueva armada</button>";
    return h;
  }
  function pintarTarjeta() {
    const c = $("arCard"); if (!c) return;
    if (no()) { c.classList.add("ar-off"); return; }
    if (!c.offsetParent && c.__h) return;
    const h = tarjetaHtml();
    c.classList.toggle("ar-off", !h);
    if (c.__h !== h) { c.__h = h; c.innerHTML = h; }
  }

  // ---------- la hoja
  function hojaAbierta() { return !!$("arOv"); }
  function abrir(modo, op) {
    if (no()) return false;
    Object.assign(S, { modo, msg: "", mal: false, enviando: false }, op || {});
    let v = $("arOv");
    if (!v) { v = document.createElement("div"); v.id = "arOv"; v.className = "v7-ov v7-arriba no-print"; v.setAttribute("role", "dialog"); v.setAttribute("aria-modal", "true"); document.body.appendChild(v); }
    v.setAttribute("aria-label", titulo());
    pintar(); return true;
  }
  function cerrar() { const v = $("arOv"); v && v.remove(); S.modo = ""; pintarTarjeta(); }
  function titulo() { return { receta: S.receta && S.receta.editando ? "Receta de la armada" : "Nueva armada", armar: "Armar luminarias", hecho: "Armado guardado", ver: "Armado " + (grupo(S.G) || {}).numero, llevar: "Llevar armadas a una obra", llevado: "Vale hecho", dep: "Pasar a armadas", depHecho: "Pasado a armadas", anular: "Anular el armado" }[S.modo] || "Armadas"; }
  function cab(t, sub) { return "<div class=\"v7-asa\"></div><div class=\"v7-cab\"><div><h3>" + esc(t) + "</h3>" + (sub ? "<small>" + sub + "</small>" : "") + "</div><button type=\"button\" class=\"v7-x\" data-ar=\"x\" aria-label=\"Cerrar\">✕</button></div>"; }
  const msgHtml = () => "<div class=\"v7-msg" + (S.mal ? " mal" : S.msg ? " bien" : "") + "\" id=\"arMsg\" role=\"status\">" + esc(S.msg || "") + "</div>";
  const masMenos = (val, k, max) => "<div class=\"ar-mm\"><button type=\"button\" class=\"ar-mmb\" data-ar=\"menos\" data-ark=\"" + k + "\" aria-label=\"Menos\">−</button><input type=\"number\" inputmode=\"numeric\" min=\"0\" step=\"1\" id=\"arN_" + k + "\" data-arin=\"" + k + "\" value=\"" + esc(val) + "\" aria-label=\"Cantidad\"><button type=\"button\" class=\"ar-mmb ar-mas\" data-ar=\"mas\" data-ark=\"" + k + "\" aria-label=\"Más\"" + (max != null && val >= max ? " disabled" : "") + ">+</button></div>";
  function recetaHtml() {
    const R = S.receta, prop = R.editando ? null : proponerCodigo(6000), cm = R.editando ? "" : (String(R.codigo || "").trim() ? codigoMal(R.codigo) : "");
    const piezas = R.piezas.map((p, i) => "<div class=\"ar-pz\"><div class=\"ar-pz-n\"><b>" + esc(corto(p.desc)) + "</b><small class=\"mono\">" + esc(p.codigo) + " · " + esc(p.un) + (p.porU ? " · 1 Un. = " + esc(p.porU) : "") + "</small></div><div class=\"ar-pz-c\"><input type=\"text\" inputmode=\"decimal\" data-arpc=\"" + i + "\" value=\"" + esc(p.cant == null ? "" : String(p.cant).replace(".", ",")) + "\" placeholder=\"a confirmar\" aria-label=\"Cantidad de " + esc(corto(p.desc)) + " por armada\"><span>" + esc(p.un) + "</span></div><button type=\"button\" class=\"ar-pz-x\" data-ar=\"pzx\" data-ari=\"" + i + "\" aria-label=\"Sacar " + esc(corto(p.desc)) + "\">✕</button></div>").join("");
    const q = nrm(S.busca), res = q.length >= 2 ? intentar(() => catalogo(), []).filter((p) => !es(p.codigo) && R.piezas.every((x) => String(x.codigo) !== String(p.codigo)) && q.split(" ").every((w) => nrm(p.codigo + " " + p.desc).indexOf(w) >= 0)).sort((a, b) => (String(b.codigo) === q) - (String(a.codigo) === q)).slice(0, 8) : [];
    return cab(R.editando ? "Receta de la armada" : "Nueva armada", R.editando ? "Si cambiás la receta, lo que ya se armó queda como estaba." : "Se carga una sola vez.") +
      "<div class=\"card ar-sec\"><label for=\"arNom\">Nombre</label><input type=\"text\" id=\"arNom\" data-arnom value=\"" + esc(R.desc || "") + "\" placeholder=\"Ej.: Luminaria armada 7 m\">" +
      "<label for=\"arCod\" style=\"margin-top:12px\">Código del pañol</label>" + (R.editando ? "<div class=\"ar-cod-fijo mono\">" + esc(R.codigo) + "</div>" : "<input type=\"text\" inputmode=\"numeric\" id=\"arCod\" data-arcodin value=\"" + esc(R.codigo || "") + "\" placeholder=\"Lo elegís vos (la app no inventa códigos)\">" + (prop ? "<button type=\"button\" class=\"chip ar-prop\" data-ar=\"prop\" data-arv=\"" + prop + "\">Usar " + prop + " (el siguiente libre de la familia 6)</button>" : "") + (cm ? "<div class=\"ar-mal\" role=\"status\">" + esc(cm) + "</div>" : "")) + "</div>" +
      "<div class=\"card ar-sec\"><div class=\"ar-sec-t\">Cada armada lleva</div>" + (piezas || "<div class=\"hint\">Agregá las piezas: la luminaria, el prensacable, el cable…</div>") +
      "<label for=\"arBus\" style=\"margin-top:12px\">＋ Agregar otra pieza (código o palabras)</label><input type=\"search\" id=\"arBus\" data-arbus value=\"" + esc(S.busca || "") + "\" placeholder=\"Ej.: 6010, prensacable, cable 3x1,5\" autocomplete=\"off\">" +
      (res.length ? "<div class=\"ar-res\">" + res.map((p) => "<button type=\"button\" class=\"ar-resb\" data-ar=\"pz\" data-arv=\"" + p.codigo + "\"><span class=\"mono\">" + esc(p.codigo) + "</span> " + esc(p.desc) + " <small>(" + esc(p.un) + ")</small></button>").join("") + "</div>" : q.length >= 2 ? "<div class=\"hint\">No encontré ese material en el catálogo.</div>" : "") +
      "<div class=\"hint\">Los metros de cable por armada los cargás vos (dice «a confirmar» hasta que los pongas).</div></div>" +
      "<div class=\"ar-nota\">Podés tener varias recetas: 7 m, 10 m, con capuchón doble…</div>" +
      msgHtml() + "<div class=\"v7-acc\"><button type=\"button\" class=\"btn-primary\" data-ar=\"guardarReceta\"" + (S.enviando ? " disabled" : "") + ">Guardar receta</button></div>";
  }
  function armarHtml() {
    const R = recetas(false), P = planArmar(S.cod, S.n);
    if (!P) return cab("Armar luminarias") + "<div class=\"hint\">No hay recetas todavía.</div>";
    const nom = intentar(() => (window.nominaEquipo ? window.nominaEquipo() : []).filter((p) => p && p.activo !== false).map((p) => p.nombre), []);
    return cab("Armar luminarias") +
      (R.length > 1 ? "<div class=\"ar-tipos\">" + R.map((r) => "<button type=\"button\" class=\"chip" + (String(r.codigo) === String(S.cod) ? " activo" : "") + "\" data-ar=\"tipo\" data-arc=\"" + r.codigo + "\">" + esc(r.desc) + "</button>").join("") + "</div>" : "") +
      "<div class=\"card ar-sec ar-cuantas\"><div><b>¿Cuántas armaron?</b><small>" + esc(P.r.desc) + (P.sinCant ? "" : " · alcanza para " + P.max) + "</small></div>" + masMenos(S.n, "n", P.max) + "</div>" +
      "<div class=\"card ar-sec\"><div class=\"ar-sec-t\">Sale del pañol</div><div class=\"ar-grid\">" + P.filas.map((f) => "<div>" + esc(corto(f.desc)) + " <small class=\"mono\">" + esc(f.codigo) + "</small></div><div class=\"mono ar-q\">" + (f.cant > 0 ? f2(f.need) + " " + esc(f.un) : "<span class=\"ar-conf\">a confirmar</span>") + "</div><div class=\"ar-hay" + (f.falta ? " mal" : "") + "\">hay " + f2(f.hay) + "</div>").join("") + "</div>" +
      "<div class=\"ar-sep\"></div><div class=\"ar-sec-t\">Entra al pañol (armadas)</div><div class=\"ar-entra\"><span>" + esc(P.r.desc) + "</span><b class=\"mono\">+" + f2(P.n) + " " + esc(P.r.un || "Un.") + "</b></div>" +
      (P.costoU > 0 ? "<div class=\"hint\">Costo de cada armada: " + plata(P.costoU) + " sin IVA (suma de las piezas al último costo" + (P.conCosto ? "" : "; alguna pieza no tiene precio") + ").</div>" : "") + "</div>" +
      (P.sinCant ? "<div class=\"ar-mal\" role=\"status\">La receta tiene piezas sin cantidad («a confirmar»): completala en «Ver o cambiar la receta».</div>" : !P.ok && P.n > 0 ? "<div class=\"ar-mal\" role=\"status\">No alcanza el stock: con lo que hay se pueden armar hasta " + P.max + ".</div>" : "") +
      "<label for=\"arQuien\">¿Quién armó? (opcional)</label><input type=\"text\" id=\"arQuien\" data-arquien list=\"arNomina\" value=\"" + esc(S.quien) + "\" placeholder=\"Ej.: Juan Pérez, Pedro Gómez\"><datalist id=\"arNomina\">" + nom.map((x) => "<option value=\"" + esc(x) + "\">").join("") + "</datalist>" +
      msgHtml() + "<div class=\"v7-acc\"><button type=\"button\" class=\"btn-primary\" data-ar=\"siArmar\"" + (P.ok && !S.enviando ? "" : " disabled") + ">Sí, armar " + f2(P.n) + "</button></div><div class=\"ar-nota\" style=\"text-align:center\">Si falta alguna pieza, te avisa y no deja armar más de las que alcanzan.</div>";
  }
  function verHtml(G, recien) {
    const g = grupo(G);
    if (!g || !g.entra) return cab(recien ? "Armado guardado" : "Armado") + "<div class=\"hint\">Guardando… (aparece apenas vuelve de la base).</div>";
    const C = window.__codigos, qr = C && C.dataUrl && C.urlDoc ? intentar(() => C.dataUrl(C.urlDoc(g.numero)), "") : "", e = g.entra;
    const pa = puedeAnular(G), pe = puedeEditar();
    return cab(recien ? "Armado guardado" : "Armado " + g.numero) +
      (recien && !g.anulado ? "<div class=\"ar-ok\" role=\"status\">✓ " + f2(n0(e.cantidad)) + " " + esc(e.desc || "") + " ya están en el stock</div>" : "") + (g.anulado ? "<div class=\"ar-mal\">⊘ Este armado está anulado: las piezas volvieron al stock.</div>" : "") +
      "<div class=\"card ar-sec ar-comp\"><div class=\"ar-comp-c\"><div><small>Comprobante de armado</small><div class=\"mono ar-nro\">" + esc(g.numero) + "</div><small class=\"ar-conf\">letras del número: a confirmar</small></div>" + (qr ? "<img src=\"" + qr + "\" width=\"68\" height=\"68\" alt=\"Código QR del comprobante\">" : "") + "</div>" +
      "<div class=\"ar-meta\">" + esc(fC(e.fecha || "")) + " · cargó " + esc(e.usuario || "") + ((e.quienes || []).length ? "<br>Armaron: " + esc(e.quienes.join(", ")) : "") + (e.deDeposito ? "<br>Desde " + esc(e.deDeposito.nombre) : "") + "</div><div class=\"ar-sep\"></div>" +
      "<div class=\"ar-sec-t\">Salió</div><div class=\"ar-grid2\">" + g.sale.map((m) => "<div>" + esc(corto(m.desc)) + "</div><div class=\"mono\"><b>−" + f2(n0(m.cantidad)) + " " + esc(m.un || "") + "</b></div>").join("") + "</div>" +
      "<div class=\"ar-sec-t\" style=\"margin-top:12px\">Entró</div><div class=\"ar-grid2\"><div>" + esc(e.desc || "") + "</div><div class=\"mono ar-mas-t\"><b>+" + f2(n0(e.cantidad)) + " " + esc(e.un || "Un.") + "</b></div></div></div>" +
      "<div class=\"ar-nota\">No es un gasto de ninguna obra: el material sigue en la empresa. Se anula como cualquier comprobante (no se borra) y las piezas vuelven al stock.</div>" + msgHtml() +
      "<div class=\"v7-acc\"><button type=\"button\" class=\"btn-ghost\" data-ar=\"etiqueta\" data-arg=\"" + esc(G) + "\">Imprimir etiqueta QR</button><button type=\"button\" class=\"btn-ghost\" data-ar=\"imprimir\" data-arg=\"" + esc(G) + "\">🖨 Comprobante</button>" + (pe && !g.anulado ? "<button type=\"button\" class=\"btn-primary\" data-ar=\"llevar\" data-arc=\"" + esc(e.codigo) + "\">Llevar a obra</button>" : "") + "</div>" +
      (pe && !g.anulado ? "<div class=\"ar-links\" style=\"text-align:center\"><button type=\"button\" class=\"link\" data-ar=\"anular\" data-arg=\"" + esc(G) + "\"" + (pa.ok ? "" : " title=\"" + esc(pa.txt) + "\"") + ">Anular este armado</button>" + (pa.ok ? "" : "<div class=\"hint\">" + esc(pa.txt) + "</div>") + "</div>" : "");
  }
  function anularHtml() {
    const g = grupo(S.G), pa = puedeAnular(S.G);
    return cab("Anular el armado " + (g ? g.numero : "")) + (g && g.entra ? "<p class=\"v7-txt\">Se anulan las " + (g.legs.length) + " líneas del armado: salen " + f2(n0(g.entra.cantidad)) + " " + esc(g.entra.desc || "") + " del stock y vuelven las piezas. No se borra nada.</p>" : "") +
      (pa.txt ? "<div class=\"" + (pa.ok ? "ar-aviso" : "ar-mal") + "\" role=\"status\">" + esc(pa.txt) + "</div>" : "") +
      "<label for=\"arAnMot\">¿Por qué se anula?</label><input type=\"text\" id=\"arAnMot\" data-aranmot value=\"" + esc(S.anMot) + "\" placeholder=\"Ej.: se cargó dos veces\">" + msgHtml() +
      "<div class=\"v7-acc\"><button type=\"button\" class=\"btn-ghost\" data-ar=\"ver\" data-arg=\"" + esc(S.G) + "\">Volver</button><button type=\"button\" class=\"btn-primary ar-peligro\" data-ar=\"siAnular\"" + (pa.ok && !S.enviando ? "" : " disabled") + ">Sí, anular</button></div>";
  }
  function llevarHtml() {
    const r = receta(S.cod); if (!r) return cab("Llevar armadas a una obra") + "<div class=\"hint\">No encontré esa armada.</div>";
    const lib = libres(r.codigo), L = obrasPara(r.codigo), q = nrm(S.busca), main = r.piezas[0];
    let lista = q.length >= 2 ? L.filter((x) => nrm((x.o.nombre || "") + " " + (x.o.obraId || "") + " " + (x.o.barrio || "")).indexOf(q) >= 0).slice(0, 8) : L.filter((x) => x.prox).slice(0, 5);
    const sel = L.find((x) => String(x.o.id) === String(S.obra));
    if (sel && !lista.some((x) => x === sel)) lista = [sel].concat(lista);
    const n = Math.min(S.n, Math.max(0, Math.floor(lib)));
    const filaObra = (x) => "<button type=\"button\" class=\"ar-obra" + (x === sel ? " on" : "") + "\" data-ar=\"obra\" data-arv=\"" + esc(x.o.id) + "\" aria-pressed=\"" + (x === sel ? "true" : "false") + "\"><b>" + esc(x.o.nombre || "") + "</b><small>" + (x.prox ? "Orden " + (x.prox.fecha === hoyISO() ? "de hoy" : "del " + esc(fC(x.prox.fecha))) + " " + esc(x.prox.numero || "") + " · " : "") + (main && x.pide > 0 ? "el cálculo pide " + f2(x.pide) + ", recibió " + f2(x.rec) : main && x.rec > 0 ? "recibió " + f2(x.rec) : "sin cálculo de " + esc(corto(main ? main.desc : "luminarias"))) + "</small></button>";
    const prev = intentar(() => window.__numeros.proximo("S"), "");
    return cab("Llevar armadas a una obra") +
      "<div class=\"ar-sec-t\">¿A qué obra?</div><div class=\"ar-obras\">" + (lista.length ? lista.map(filaObra).join("") : "<div class=\"hint\">" + (q.length >= 2 ? "No encontré esa obra." : "No hay obras con orden en los próximos días: buscala.") + "</div>") + "</div>" +
      "<input type=\"search\" id=\"arBusObra\" data-arbusobra value=\"" + esc(S.busca) + "\" placeholder=\"Buscar otra obra…\" aria-label=\"Buscar otra obra\" autocomplete=\"off\">" +
      "<div class=\"card ar-sec ar-cuantas\"><div><b>" + esc(r.desc) + "</b><small>hay " + f2(lib) + " libres en el pañol</small></div>" + masMenos(n, "n", Math.floor(lib)) + "</div>" +
      "<div class=\"card ar-sec\"><div class=\"ar-sec-t\">La plaza recibe (para el legajo y los costos)</div><div class=\"ar-grid2\">" + r.piezas.map((p) => "<div>" + esc(corto(p.desc)) + "</div><div class=\"mono\"><b>" + (p.cant > 0 ? f2(p.cant * n) + " " + esc(p.un) : "a confirmar") + "</b></div>").join("") + "</div><div class=\"hint\">Así «Material calculado vs. entregado» cuenta las piezas aunque hayan llegado armadas.</div></div>" +
      "<label for=\"arRet\">¿Quién las retira? (opcional)</label><input type=\"text\" id=\"arRet\" data-arret value=\"" + esc(S.ret) + "\" placeholder=\"Ej.: Juan Pérez\">" + msgHtml() +
      "<div class=\"v7-acc\"><button type=\"button\" class=\"btn-primary\" data-ar=\"siLlevar\"" + (sel && n > 0 && !S.enviando ? "" : " disabled") + ">Hacer vale" + (prev ? " · " + esc(prev) : "") + "</button></div><div class=\"ar-nota\" style=\"text-align:center\">El vale de siempre, con su número. Si vuelven sin usar, se hace la devolución y entran otra vez como armadas.</div>";
  }
  function llevadoHtml() {
    const v = S.vale || {}, m = movs().find((x) => x && x.id === v.id), nro = (m && m.numero) || v.numero || "";
    return cab("Vale hecho") + "<div class=\"ar-ok\" role=\"status\">✓ Vale " + esc(nro) + ": " + f2(v.n) + " " + esc(v.desc || "") + " a " + esc(v.obra || "") + "</div>" +
      "<div class=\"ar-nota\">La obra recibe las piezas desglosadas (luminarias, prensacables, cable) para el legajo, el material calculado contra entregado y los costos.</div>" +
      "<div class=\"v7-acc\"><button type=\"button\" class=\"btn-ghost\" data-ar=\"verVale\">🖨 Ver el vale</button><button type=\"button\" class=\"btn-primary\" data-ar=\"x\">Listo</button></div>";
  }
  function depHtml() {
    const o = obras().find((x) => String(x.id) === String(S.dep)), R = recetas(false);
    if (!o) return cab("Pasar a armadas") + "<div class=\"hint\">No encontré esa obra.</div>";
    if (!S.depCod && R.length) S.depCod = R[0].codigo;
    const P = planDeposito(o.id, S.depCod, S.depN, S.sueltas), hay = enDeposito(o.id);
    return cab("Pasar a armadas", "Material que figura entregado en " + esc(o.nombre || "")) +
      "<div class=\"card ar-sec\"><div class=\"ar-sec-t\">Figura en " + esc(o.nombre || "") + "</div><div class=\"ar-grid2\">" + hay.map((x) => "<div>" + esc(corto(x.desc)) + " <small class=\"mono\">" + esc(x.codigo) + "</small></div><div class=\"mono\"><b>" + f2(x.cant) + " " + esc(x.un) + "</b></div>").join("") + "</div></div>" +
      (R.length > 1 ? "<div class=\"ar-tipos\">" + R.map((r) => "<button type=\"button\" class=\"chip" + (String(r.codigo) === String(S.depCod) ? " activo" : "") + "\" data-ar=\"depTipo\" data-arc=\"" + r.codigo + "\">" + esc(r.desc) + "</button>").join("") + "</div>" : "") +
      "<div class=\"card ar-sec ar-cuantas\"><div><b>¿Cuántas armadas hay de verdad?</b><small>Contalas en el depósito y escribí el número</small></div>" + masMenos(S.depN, "dep", P ? P.max : null) + "</div>" +
      (P ? "<div class=\"card ar-sec\"><div class=\"ar-sec-t\">Antes → después</div><div class=\"ar-grid3\"><div></div><div class=\"ar-th\">En el depósito</div><div class=\"ar-th\">Queda</div>" + P.filas.map((f) => "<div>" + esc(corto(f.desc)) + "</div><div class=\"mono\">" + f2(f.en) + " " + esc(f.un) + "</div><div class=\"mono" + (f.falta ? " mal" : "") + "\">" + f2(r4(f.en - f.need)) + " " + esc(f.un) + "</div>").join("") + "</div>" +
        "<div class=\"ar-sep\"></div><div class=\"ar-entra\"><span>Pañol: " + esc(P.r.desc) + "</span><b class=\"mono\">+" + f2(P.n) + " Un.</b></div><div class=\"hint\">Se hace la devolución de esas piezas desde " + esc(o.nombre || "") + " y enseguida el armado (comprobante AR-). El stock de las piezas del pañol no cambia.</div>" +
        (P.sobra.length ? "<div class=\"ar-sec-t\" style=\"margin-top:10px\">Lo que sobra (piezas sueltas)</div>" + P.sobra.map((s) => "<label class=\"checkbox-line ar-chk\"><input type=\"checkbox\" data-arsuelta=\"" + s.codigo + "\"" + (s.devolver ? " checked" : "") + "> <span>Devolver al pañol " + f2(s.sobra) + " " + esc(s.un) + " de " + esc(corto(s.desc)) + "</span></label>").join("") : "") + "</div>" +
        (P.n > 0 && !P.ok ? "<div class=\"ar-mal\" role=\"status\">En el depósito no alcanza para " + P.n + ": como mucho " + P.max + ".</div>" : "") : "") +
      "<label for=\"arDepMot\">Motivo</label><input type=\"text\" id=\"arDepMot\" data-ardepmot value=\"" + esc(S.depMot) + "\">" + msgHtml() +
      "<div class=\"v7-acc\"><button type=\"button\" class=\"btn-primary\" data-ar=\"siDep\"" + (P && P.ok && !S.enviando ? "" : " disabled") + ">Sí, pasar " + (P ? P.n : 0) + " a armadas</button></div>";
  }
  function depHechoHtml() {
    const x = S.res || {};
    return cab("Pasado a armadas") + "<div class=\"ar-ok\" role=\"status\">✓ " + f2(x.n || 0) + " armadas en el pañol (" + esc(x.numero || "") + ")</div>" +
      "<div class=\"ar-aviso\">Para que no se mezcle: de ahora en más no uses esa obra como depósito. Las armadas quedan en el pañol y van a cada plaza con «Llevar a obra». (La obra no se ocultó: si querés, archivala vos desde Obras.)</div>" +
      "<div class=\"v7-acc\"><button type=\"button\" class=\"btn-ghost\" data-ar=\"ver\" data-arg=\"" + esc(x.G || "") + "\">Ver el comprobante</button><button type=\"button\" class=\"btn-primary\" data-ar=\"x\">Listo</button></div>";
  }
  function pintar() {
    const v = $("arOv"); if (!v) return;
    const h = S.modo === "receta" ? recetaHtml() : S.modo === "armar" ? armarHtml() : S.modo === "hecho" ? verHtml(S.G, true) : S.modo === "ver" ? verHtml(S.G, false) : S.modo === "llevar" ? llevarHtml() : S.modo === "llevado" ? llevadoHtml() : S.modo === "dep" ? depHtml() : S.modo === "depHecho" ? depHechoHtml() : S.modo === "anular" ? anularHtml() : "";
    const a = document.activeElement, idf = a && v.contains(a) ? a.id : "", sel = idf && a.selectionStart != null ? [a.selectionStart, a.selectionEnd] : null, sc = (v.firstElementChild || {}).scrollTop || 0;
    v.innerHTML = "<div class=\"v7-caja ar-caja\">" + h + "</div>";
    const c = v.firstElementChild; if (c) c.scrollTop = sc;
    if (idf) { const b = $(idf); if (b) { b.focus(); if (sel) intentar(() => b.setSelectionRange(sel[0], sel[1])); } }
  }
  function msg(t, mal) { S.msg = t || ""; S.mal = !!mal; const m = $("arMsg"); if (m) { m.textContent = S.msg; m.className = "v7-msg" + (mal ? " mal" : t ? " bien" : ""); } }
  function nuevaReceta(cod) {
    const r = cod != null ? receta(cod) : null;
    S.receta = r ? { editando: true, codigo: r.codigo, desc: r.desc, piezas: r.piezas.map((p) => Object.assign({}, p, { porU: porU(p.codigo) })) } : { editando: false, codigo: "", desc: "", piezas: [] };
    S.busca = ""; abrir("receta");
  }
  function porU(c) { const b = base(c), u = b && b.porUnidad; if (!u || typeof u != "object") return ""; const k = Object.keys(u)[0]; return k ? f2(n0(u[k])) + " " + k : ""; }
  async function guardarReceta() {
    const R = S.receta; if (!puedeEditar()) return msg("Tu usuario no puede cambiar el catálogo del pañol.", true);
    const desc = String(R.desc || "").trim(); if (!desc) return msg("Poné el nombre de la armada.", true);
    const cod = Number(String(R.codigo).trim());
    if (!R.editando) { const m = codigoMal(R.codigo); if (m) return msg(m, true); }
    if (!R.piezas.length) return msg("Agregá al menos una pieza.", true);
    const faltan = R.piezas.filter((p) => !(n0(p.cant) > 0));
    if (faltan.length) return msg("Falta la cantidad por armada de " + faltan.map((p) => corto(p.desc)).join(", ") + " (no se precarga: la ponés vos).", true);
    const prev = cambios().find((x) => x && Number(x.codigo) === cod), ahora = Date.now();
    const piezas = R.piezas.map((p) => ({ codigo: Number(p.codigo), desc: descDe(p.codigo), un: unDe(p.codigo), cant: r4(n0(p.cant)) }));
    const hist = (prev && prev.armada && Array.isArray(prev.armada.hist) ? prev.armada.hist : []).slice(-30);
    if (prev && prev.armada) hist.push({ ts: ahora, por: yoEmail(), porNombre: yoNombre(), descAntes: prev.desc || "", antes: prev.armada.piezas || [] });
    const arm = { v: 1, piezas, ts: ahora, por: yoEmail(), porNombre: yoNombre(), hist };
    const doc = R.editando ? { codigo: cod, desc, armada: arm, editadoPor: yoEmail(), editadoTs: ahora }
      : { codigo: cod, desc, un: "Un.", sector: "pañol", stock: 0, costo: r4(piezas.reduce((s, p) => s + costoPieza(p.codigo).precio * p.cant, 0)), minimo: 0, activo: true, armada: arm, editadoPor: yoEmail(), editadoTs: ahora };
    S.enviando = true; pintar();
    try {
      await window.fbGuardarProductoCatalogo(doc);
      intentar(() => window.fbAuditar && window.fbAuditar("armada_receta", cod + " " + desc + ": " + piezas.map((p) => f2(p.cant) + " " + p.un + " " + p.codigo).join(" + "), { ref: String(cod) }));
      S.enviando = false; cerrar();
      toast("✓ Receta guardada: " + cod + " — " + desc);
    } catch (e) { S.enviando = false; pintar(); msg(e && e.code === "permission-denied" ? "🔒 Tu usuario no tiene permiso para cambiar el catálogo." : "⚠ No se pudo guardar (revisá la señal).", true); }
  }
  function toast(t) {
    let m = $("arToast"); if (!m) { m = document.createElement("div"); m.id = "arToast"; m.className = "no-print"; m.setAttribute("role", "status"); document.body.appendChild(m); }
    m.textContent = t; m.hidden = !t; clearTimeout(m._t); m._t = setTimeout(() => { m.hidden = true; }, 4000);
  }
  // ---------- toques
  document.addEventListener("click", async (e) => {
    const b = e.target && e.target.closest ? e.target.closest("[data-ar]") : null;
    if (!b || no() || (!b.closest("#arOv") && !b.closest("#arCard") && !b.closest(".ar-pf"))) return;
    const a = b.dataset.ar, c = b.dataset.arc;
    e.preventDefault();
    if (a === "x") return cerrar();
    if (a === "nueva") return nuevaReceta(null);
    if (a === "receta") return nuevaReceta(c);
    if (a === "armar") { S.cod = Number(c); S.n = 1; S.quien = ""; return abrir("armar"); }
    if (a === "tipo") { S.cod = Number(c); return pintar(); }
    if (a === "llevar") { S.cod = Number(c); S.n = 1; S.obra = ""; S.busca = ""; S.ret = ""; const L = obrasPara(S.cod).filter((x) => x.prox); if (L[0]) { S.obra = String(L[0].o.id); S.n = Math.max(1, Math.min(Math.floor(libres(S.cod)), Math.ceil(L[0].falta) || 1)); } return abrir("llevar"); }
    if (a === "ver") { S.G = b.dataset.arg; return abrir("ver"); }
    if (a === "imprimir") return verArmado(b.dataset.arg);
    if (a === "etiqueta") return etiqueta(b.dataset.arg);
    if (a === "anular") { S.G = b.dataset.arg; S.anMot = ""; return abrir("anular"); }
    if (a === "dep") { S.dep = b.dataset.arobra; S.depCod = null; S.depN = 0; S.sueltas = {}; return abrir("dep"); }
    if (a === "depTipo") { S.depCod = Number(c); return pintar(); }
    if (a === "obra") { S.obra = b.dataset.arv; return pintar(); }
    if (a === "prop") { S.receta.codigo = b.dataset.arv; return pintar(); }
    if (a === "pz") { const p = base(b.dataset.arv); if (p) S.receta.piezas.push({ codigo: Number(p.codigo), desc: p.desc, un: p.un, cant: null, porU: porU(p.codigo) }); S.busca = ""; pintar(); const bu = $("arBus"); bu && bu.blur(); return; }
    if (a === "pzx") { S.receta.piezas.splice(+b.dataset.ari, 1); return pintar(); }
    if (a === "menos" || a === "mas") {
      const k = b.dataset.ark, d = a === "mas" ? 1 : -1;
      if (k === "dep") { const P = planDeposito(S.dep, S.depCod, S.depN + d, S.sueltas); S.depN = Math.max(0, Math.min(S.depN + d, P ? P.max : 0)); }
      else if (S.modo === "llevar") S.n = Math.max(1, Math.min(S.n + d, Math.floor(libres(S.cod))));
      else { const P = planArmar(S.cod, S.n); let v = S.n + d; if (P && d > 0 && v > P.max) { v = Math.max(1, P.max); msg("No alcanza para más: con lo que hay se pueden armar " + P.max + ".", true); } else msg(""); S.n = Math.max(1, v); }
      return pintar();
    }
    if (a === "guardarReceta") return guardarReceta();
    if (a === "siArmar") {
      S.enviando = true; pintar();
      try { const r = await armar(S.cod, S.n, String(S.quien || "").split(",")); S.enviando = false; S.G = r.G; abrir("hecho"); esperarGrupo(r.G); }
      catch (er) { S.enviando = false; pintar(); msg(er && er.code === "permission-denied" ? "🔒 Tu usuario no tiene permiso para cargar en el pañol." : "⚠ " + ((er && er.message) || "No se pudo guardar."), true); }
      return;
    }
    if (a === "siAnular") {
      S.enviando = true; pintar();
      try { await anular(S.G, S.anMot); S.enviando = false; abrir("ver"); msg("✓ Armado anulado: las piezas volvieron al stock."); esperarGrupo(S.G); }
      catch (er) { S.enviando = false; pintar(); msg("⚠ " + ((er && er.message) || "No se pudo anular."), true); }
      return;
    }
    if (a === "siLlevar") {
      const r = receta(S.cod), o = obras().find((x) => String(x.id) === String(S.obra));
      S.enviando = true; pintar();
      try { const x = await llevar(S.cod, S.obra, S.n, S.ret); S.enviando = false; S.vale = { id: x.id, numero: x.numero, n: S.n, desc: r ? r.desc : "", obra: o ? o.nombre : "" }; abrir("llevado"); }
      catch (er) { S.enviando = false; pintar(); msg(er && er.code === "permission-denied" ? "🔒 Tu usuario no tiene permiso para cargar en el pañol." : "⚠ " + ((er && er.message) || "No se pudo hacer el vale."), true); }
      return;
    }
    if (a === "verVale") { if (S.vale && S.vale.id && typeof window.verComprobanteMovimiento == "function") window.verComprobanteMovimiento(S.vale.id); return; }
    if (a === "siDep") {
      const P = planDeposito(S.dep, S.depCod, S.depN, S.sueltas);
      S.enviando = true; pintar();
      try { const x = await pasarDeposito(P, S.depMot); S.enviando = false; S.res = { n: P.n, numero: x.numero, G: x.G }; abrir("depHecho"); }
      catch (er) { S.enviando = false; pintar(); msg("⚠ " + ((er && er.message) || "No se pudo."), true); }
      return;
    }
  }, true);
  function esperarGrupo(G) { let k = 0; const t = setInterval(() => { k++; const g = grupo(G); if ((g && g.entra) || k > 40) { clearInterval(t); if (hojaAbierta() && S.G === G) pintar(); pintarTarjeta(); } }, 250); }
  document.addEventListener("input", (e) => {
    const t = e.target; if (!t || !t.closest || !t.closest("#arOv") || no()) return;
    if (t.hasAttribute("data-arnom")) { S.receta.desc = t.value; return; }
    if (t.hasAttribute("data-arcodin")) { S.receta.codigo = t.value.replace(/\D/g, "").slice(0, 4); clearTimeout(S._t); S._t = setTimeout(pintar, 500); return; }
    if (t.hasAttribute("data-arpc")) { S.receta.piezas[+t.dataset.arpc].cant = t.value.trim() === "" ? null : n0(t.value); return; }
    if (t.hasAttribute("data-arbus") || t.hasAttribute("data-arbusobra")) { S.busca = t.value; clearTimeout(S._t); S._t = setTimeout(pintar, 250); return; }
    if (t.hasAttribute("data-arquien")) { S.quien = t.value; return; }
    if (t.hasAttribute("data-arret")) { S.ret = t.value; return; }
    if (t.hasAttribute("data-aranmot")) { S.anMot = t.value; const b = document.querySelector("#arOv [data-ar=siAnular]"); if (b) b.disabled = !puedeAnular(S.G).ok; return; }
    if (t.hasAttribute("data-ardepmot")) { S.depMot = t.value; return; }
    if (t.hasAttribute("data-arin")) {
      const k = t.dataset.arin, v = Math.max(0, Math.floor(n0(t.value)));
      if (k === "dep") S.depN = v; else S.n = v;
      clearTimeout(S._t); S._t = setTimeout(pintar, 400); return;
    }
  });
  document.addEventListener("change", (e) => {
    const t = e.target; if (!t || !t.closest || !t.closest("#arOv") || no()) return;
    if (t.hasAttribute("data-arsuelta")) { S.sueltas[t.dataset.arsuelta] = t.checked; pintar(); }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && hojaAbierta()) cerrar(); });

  // ---------- ficha del producto: «Armar» / «Llevar a obra» / receta
  function decorarFicha() {
    const m = $("pfModal"); if (!m || no()) return;
    const f = m.querySelector("#pfFoto[data-cod]"), cod = f && f.dataset.cod;
    if (!cod || !es(cod) || m.querySelector(".ar-pf")) return;
    const d = document.createElement("div"); d.className = "ar-pf"; const r = receta(cod), pe = puedeEditar();
    d.innerHTML = "<div class=\"ar-pf-t\">🔧 Armada: " + esc(resumenPiezas(r)) + "</div>" + (pe ? "<button type=\"button\" class=\"btn-primary\" data-ar=\"armar\" data-arc=\"" + esc(cod) + "\">Armar</button><button type=\"button\" class=\"btn-ghost\" data-ar=\"llevar\" data-arc=\"" + esc(cod) + "\">Llevar a obra</button>" : "") + "<button type=\"button\" class=\"link\" data-ar=\"receta\" data-arc=\"" + esc(cod) + "\">" + (pe ? "Ver o cambiar la receta" : "Ver la receta") + "</button>";
    const cab0 = m.querySelector(".pf-cab"); if (cab0 && cab0.parentNode) cab0.parentNode.insertBefore(d, cab0.nextSibling); else (m.firstElementChild || m).appendChild(d);
  }
  intentar(() => new MutationObserver((l) => { if (l.some((x) => [].some.call(x.addedNodes, (n) => n.id === "pfModal"))) setTimeout(decorarFicha, 0); }).observe(document.body, { childList: true }));

  // ---------- el resto
  window.__armVista = (l) => (no() ? l : desglosar(l));
  window.__armEs = (c) => es(c);
  window.__armadas = {
    recetas, receta, es, desglosar, sinArmado, recetaDe, idx, grupo, grupoDeMov, proponerCodigo, codigoMal, ocupados, planArmar, armar, anular, puedeAnular,
    proximoAR, llevar, libres, obrasPara, depositos, enDeposito, planDeposito, pasarDeposito, verArmado, etiqueta, htmlArmado, abrir, cerrar,
    nuevaReceta, pintarTarjeta, costoPieza, puedeEditar, esDeposito,
    paraIa: (c) => { const r = receta(c); return r ? { armada: true, lleva: r.piezas.map((p) => ({ codigo: p.codigo, material: p.desc, porArmada: p.cant, un: p.un })), nota: "Armada del pañol: se arma con estas piezas (comprobante AR-); cuando va a una obra, la obra recibe las piezas desglosadas." } : undefined; },
    estado: () => ({ S, ultimo, recetas: recetas(true).length })
  };
  let k = 0; const t = setInterval(() => { if (envolverComprobante() || ++k > 40) clearInterval(t); }, 250);
  envolverComprobante();
  setInterval(() => { if (!no() && !document.hidden) pintarTarjeta(); }, 1500);
  setTimeout(pintarTarjeta, 300);
})();
