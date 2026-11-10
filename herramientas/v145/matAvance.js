(function () {
  "use strict";
  // v145 · Material contra avance (maqueta i2) y lo que aprende la app del material.
  //  · Por obra: lo ENTREGADO neto (vales − devoluciones, __reservas.entregadoAObra; lo cambiado por otro material cuenta
  //    para el original con __sustitutos, v102) contra lo que DEBERÍA haberse usado según el avance: cada material del
  //    cómputo de la obra × el avance de los ítems de su rubro (columnas 1–8, zanja 15–20, cruce 21–24, cable 25–40,
  //    tablero 9–14, PAT 74/75/77/81, retiros 45–49; si la obra no tiene esos ítems, el avance general del itemizado).
  //    Qué rubro es cada material sale del título de la sección del cómputo o, si es genérico, del nombre: «a confirmar».
  //  · Semáforo con un margen editable (de entrada 10 %, «a confirmar», configEquipo/baremo.aprendeMaterial.margen):
  //    🟢 parejo · 🟡 de más o de menos más allá del margen · 🔴 mucho más (más de 5 veces el margen: «¿dónde está el
  //    material?») o avance sin nada entregado («¿lo sacaron de otra obra?»).
  //  · Dónde: legajo (debajo de «🧾 Material: calculado vs. entregado»), 🧠 Lo que aprende la app › 📦 Material y el
  //    Supervisor (sin IA). Las listas usan la zona del contrato (v144), como la certificación.
  //  · Aprendizaje: obras terminadas o al 90 % o más → material real por columna / por metro de zanja / por tablero y por
  //    tipo de obra (PRFV/metálica, 7/10 m), con promedio y cuántas obras, al lado de lo que pone la Calculadora.
  //    No cambia la Calculadora: «✨ Informe del asistente» propone y con «Sí» solo ANOTA la sugerencia para Ángel en
  //    configEquipo/baremo.aprendeMaterial.sugerencias (sin reglas nuevas). Pruebas viejas: window.__v145No.
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (a) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[a]);
  const num = (v) => { const x = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(x) ? x : 0; };
  const r2 = (v) => Math.round((+v || 0) * 100) / 100;
  const intentar = (f, d) => { try { const v = f(); return v === undefined ? d : v; } catch (e) { return d; } };
  const arr = (x) => (Array.isArray(x) ? x : []);
  const obj = (x) => (x && typeof x == "object" && !Array.isArray(x) ? x : {});
  const fN = (v) => { const x = r2(v); return intentar(() => fmt(x, Number.isInteger(x) ? 0 : Math.abs(x * 10 - Math.round(x * 10)) < 1e-9 ? 1 : 2), String(x).replace(".", ",")); };
  const nk = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const obras = () => intentar(() => (Array.isArray(avanceObras) ? avanceObras : []), []);
  const movs = () => (Array.isArray(window.stockMovimientos) ? window.stockMovimientos : []);
  const permiso = (h) => intentar(() => (window.PERMISOS && PERMISOS.permiso ? PERMISOS.permiso(h) : "oculto"), "oculto");
  const esCrew = () => intentar(() => !!(window.__cuadrilla && window.__cuadrilla.esCrew && window.__cuadrilla.esCrew()), false);
  const on = () => !window.__v145No && !!window.__fbUser;
  const nombre = (o) => String((o && (o.nombre || o.plazaNombre)) || "").toUpperCase();
  const K = (id) => intentar(() => num(window.epecItemK(id)), 0);
  const MARGEN_DEF = 10;
  const am = () => obj(obj(window.__baremoNube).aprendeMaterial);
  const margen = () => { const m = num(am().margen); return m > 0 && m < 100 ? m : MARGEN_DEF; };
  const enZona = (o) => intentar(() => (window.__certMensual ? window.__certMensual.enZona(o) : true), true);

  // ---------------------------------------------------------------- rubros
  const rango = (a, b) => { const l = []; for (let i = a; i <= b; i++) l.push(String(i)); return l; };
  const IT = { col: rango(1, 8), zanja: rango(15, 20), cruce: rango(21, 24), cable: rango(25, 40), tab: ["9", "10", "11", "12", "13", "14"], pat: ["74", "75", "77", "81"], ret: rango(45, 49) };
  const NOMBRE_G = { col: "columnas", zanja: "zanja", cruce: "cruce", cable: "cable troncal", tab: "tablero y acometida", pat: "puesta a tierra", ret: "retiros", gral: "avance general" };
  function grupoSec(t) {
    t = nk(t);
    if (/retiro/.test(t)) return "ret";
    if (/tablero de columna|caja|columna|vinculo|luminaria|brazo|pintura|fundaci|torta|seguridad/.test(t)) return "col";
    if (/zanj/.test(t)) return "zanja";
    if (/cruce/.test(t)) return "cruce";
    if (/cableado|troncal|tendido|conductor/.test(t)) return "cable";
    if (/tablero|acometida/.test(t)) return "tab";
    if (/puesta a tierra/.test(t)) return "pat";
    return "";
  }
  function grupoMat(d, cod) {
    d = nk(d); const fam = String(cod || "").charAt(0);
    if (/jabalina|dispersor|tomacable|puesta a tierra/.test(d) || fam === "7") return "pat";
    if (/zanja|malla|ladrillo|pead|cinta de se|pegote/.test(d)) return "zanja";
    if (/subterr|troncal/.test(d)) return "cable";
    if (/tablero|acometida|preensambl|morseto|medidor|pilar/.test(d)) return "tab";
    return "col";
  }
  function filasIt(o) {
    const m = {};
    (o.valorItems || []).forEach((r) => { if (r && r.itemPliego) { const k = String(r.itemPliego), x = m[k] || (m[k] = { c: 0, h: 0 }); x.c += num(r.cantidad); x.h += Math.min(num(r.cantidadAvanzada), num(r.cantidad)); } });
    (o.valorItemsEpec || []).forEach((r) => { if (r && r.itemEpec) { const k = String(r.itemEpec), x = m[k] || (m[k] = { c: 0, h: 0 }); x.c += num(r.cantidad); x.h += Math.min(num(r.cantidadAvanzada), num(r.cantidad)); } });
    return m;
  }
  function general(o, F) {
    const p = intentar(() => window.__avanceItems.pctItemizado(o), null);
    if (p != null) return num(p) / 100;
    let t = 0, h = 0; Object.keys(F).forEach((id) => { if (/^8[3-9]/.test(id)) return; const w = K(id) || 1; t += F[id].c * w; h += F[id].h * w; });
    return t > 0 ? h / t : 0;
  }
  function fraccion(o, g, F) {
    const ids = IT[g] || [];
    let t = 0, h = 0; ids.forEach((id) => { const x = F[id]; if (!x || !(x.c > 0)) return; const w = K(id) || 1; t += x.c * w; h += x.h * w; });
    if (t > 0) return { f: h / t, g };
    if (g === "pat") return fraccion(o, "col", F);
    if (g === "cable") return fraccion(o, "zanja", F);
    return { f: general(o, F), g: "gral" };
  }
  const contar = (F, ids) => ids.reduce((s, id) => s + (F[id] ? F[id].c : 0), 0);
  const hechasN = (F, ids) => ids.reduce((s, id) => s + (F[id] ? F[id].h : 0), 0);

  // ---------------------------------------------------------------- cálculo por obra
  function entregado(o) {
    const m = intentar(() => (window.__reservas && window.__reservas.entregadoAObra ? window.__reservas.entregadoAObra(o.id) : new Map()), new Map()), sus = {};
    try { if (window.__sustitutos) window.__sustitutos(o.id).forEach((l, alt) => { const v = m.get(alt) || 0; if (v > 0) l.forEach((x) => { m.set(x.orig, r2((m.get(x.orig) || 0) + v * x.factor)); (sus[x.orig] = sus[x.orig] || []).push({ codigo: alt, cant: v, factor: x.factor }); }); }); } catch (e) { }
    return { m, sus };
  }
  function vales(o, cod) {
    return movs().filter((x) => x && !x.anulado && String(x.plazaId || "") === String(o.id) && String(x.codigo) === String(cod) && (x.tipo === "salida" || x.devolucion)).map((x) => ({ id: x.id, numero: x.numero || intentar(() => window.numeroComprobante(x), "") || "", fecha: x.fecha || "", cant: num(x.cantidad), quien: x.retiradoPor || x.paraQuien || "", dev: x.tipo !== "salida" }));
  }
  function deObra(o) {
    if (!o) return null;
    const F = filasIt(o), calc = {};
    (o.secciones || []).forEach((s) => {
      const gs = grupoSec(s && s.titulo);
      (s && s.items || []).forEach((it) => {
        if (!it || it.tarea) return;
        const d = String(it.desc || "").replace(/<[^>]+>/g, "").trim(), q = num(it.cantNecesaria != null ? it.cantNecesaria : it.cant);
        if (!(q > 0) || it.cod == null || it.cod === "" || /^[—ℹ⚠]/.test(d)) return;
        const cod = Number(it.cod) === 2007 ? 2009 : it.cod, k = String(cod), g = gs || grupoMat(d, cod);
        const x = calc[k] || (calc[k] = { codigo: cod, desc: d, un: it.un || "", cant: 0, deb: 0, gs: {} });
        const fr = fraccion(o, g, F);
        x.cant += q; x.deb += q * fr.f; x.gs[fr.g] = (x.gs[fr.g] || 0) + q;
      });
    });
    if (!Object.keys(calc).length) return null;
    const E = entregado(o), m = margen() / 100, filas = [];
    Object.keys(calc).forEach((k) => {
      const x = calc[k], base = intentar(() => stockBase(x.codigo), null), unP = base ? base.un || "" : "";
      const dist = !!(base && unP && x.un && window.__nU && window.__nU(x.un) !== window.__nU(unP)), fu = dist ? intentar(() => num(window.__factorUn(x.codigo, x.un)), 0) : 1;
      const e0 = Math.max(0, num(E.m.get(k) || 0)), e = dist && fu > 0 ? e0 * fu : e0;
      const g = Object.keys(x.gs).sort((a, b) => x.gs[b] - x.gs[a])[0];
      const ent = /^un/i.test(String(x.un).trim()), deb = x.deb, tol = Math.max(deb * m, ent ? 1 : 0.01), dif = e - deb;
      let s, txt;
      if (!(deb > 1e-6)) { if (!(e > 1e-6)) return; s = "am"; txt = "salió y todavía no hay avance de eso"; }
      else if (!(e > 1e-6)) { s = "rj"; txt = "hay avance y no salió nada del pañol para esta obra: ¿lo sacaron de otra obra?"; }
      else if (Math.abs(dif) <= tol) { s = "ok"; txt = "parejo"; }
      else if (dif > 0) { s = dif > Math.max(tol, deb * m * 5) ? "rj" : "am"; txt = s === "rj" ? "mucho más de lo que justifica el avance: ¿dónde está el material?" : "se entregó de más"; }
      else { s = "am"; txt = "se entregó de menos que lo que va hecho"; }
      filas.push({ codigo: base ? base.codigo : x.codigo, desc: base ? base.desc : x.desc, un: x.un, calc: r2(x.cant), deb: r2(deb), ent: r2(e), dif: r2(dif), s, txt, grupo: g, unDist: dist && !(fu > 0), sus: E.sus[k] || [] });
    });
    const ord = { rj: 0, am: 1, ok: 2 };
    filas.sort((a, b) => ord[a.s] - ord[b.s] || Math.abs(b.dif) - Math.abs(a.dif));
    const cols = contar(F, IT.col), colsH = hechasN(F, IT.col);
    let nombres = [];
    try { (o.valorItems || []).forEach((r) => { if (r && IT.col.indexOf(String(r.itemPliego)) >= 0) nombres = nombres.concat(window.__avanceItems.hechas(o, "v:" + r.id)); }); } catch (e) { nombres = []; }
    const pts = (o.puntos || []).map((p) => (typeof p == "string" ? p : p && (p.nombre || p.txt)) || "").filter(Boolean);
    const colsNom = [...new Set(nombres)].sort((a, b) => a - b).map((i) => pts[i - 1] || "Col " + i);
    return { o, id: o.id, nombre: nombre(o), filas, rj: filas.filter((f) => f.s === "rj").length, am: filas.filter((f) => f.s === "am").length, ok: filas.filter((f) => f.s === "ok").length, avance: Math.round(general(o, F) * 100), cols, colsH: r2(colsH), colsNom, margen: margen() };
  }

  // ---------------------------------------------------------------- vista (legajo)
  const un = (v, u) => esc(fN(v)) + (u ? " " + esc(u) : "");
  function filaHtml(f, i) {
    const w = f.ent > 0 ? Math.min(100, (f.deb / f.ent) * 100) : f.deb > 0 ? 100 : 0;   // gris = retirado; azul = lo que justifica el avance
    return `<div class="mav-f ${f.s}"><div class="mav-r1"><span class="mav-cod">${esc(f.codigo)}</span><b>${esc(f.desc)}</b><span class="mav-dif ${f.s}">${f.dif > 0 ? "+" : ""}${un(f.dif, f.un)}</span></div>
<div class="mav-barra"><i class="ret"></i><i class="ins" style="width:${w.toFixed(1)}%"></i></div>
<div class="mav-l"><span>Retirado ${un(f.ent, f.un)}</span><span>Según avance ${un(f.deb, f.un)}</span></div>
<div class="mav-s">${f.s === "ok" ? "🟢" : f.s === "am" ? "🟡" : "🔴"} ${esc(f.txt)} · cómputo ${un(f.calc, f.un)} · ${esc(NOMBRE_G[f.grupo] || "")}${f.sus.length ? ` · incluye lo cambiado por ${f.sus.map((x) => esc(x.codigo) + " (" + esc(fN(x.cant)) + ")").join(", ")}` : ""}${f.unDist ? " · ⚠ el pañol lo cuenta en otra unidad: cargá cuánto trae cada una" : ""}</div>
<div class="mav-acc no-print"><button type="button" class="btn-ghost" data-mav="vales" data-i="${i}">Ver vales</button>${f.s === "rj" && f.dif > 0 ? `<button type="button" class="btn-primary" data-mav="devol" data-i="${i}">↩ Pedir devolución</button>` : ""}</div></div>`;
  }
  function html(D) {
    if (!D) return "";
    const rojos = D.filas.filter((f) => f.s === "rj").slice(0, 2), editar = permiso("produccion") === "editar";
    return `<h3>📦 Material contra avance</h3>
<div class="mav-sub">Avance ${esc(D.avance)} %${D.cols ? ` · columnas hechas ${esc(fN(D.colsH))} de ${esc(fN(D.cols))}${D.colsNom.length ? ": " + esc(D.colsNom.slice(0, 12).join(", ")) + (D.colsNom.length > 12 ? "…" : "") : ""}` : ""}</div>
<div class="mav-k"><div><b>${D.filas.length}</b><span>Materiales</span></div><div class="rj"><b>${D.rj}</b><span>🔴 Para mirar ya</span></div><div class="am"><b>${D.am}</b><span>🟡 Diferencia</span></div><div class="ok"><b>${D.ok}</b><span>🟢 Parejos</span></div></div>
${rojos.map((f) => `<div class="mav-al">⚠ <b>${esc(f.desc)} (${esc(f.codigo)}): ${f.ent > 0 ? `salieron ${un(f.ent, f.un)}, el avance justifica ${un(f.deb, f.un)} → ${un(f.dif, f.un)} sin explicar` : `el avance pide ${un(f.deb, f.un)} y no salió nada para esta obra`}.</b></div>`).join("")}
<div class="mav-lista">${D.filas.map(filaHtml).join("")}</div>
<div class="mav-pie"><label>Margen ${editar ? `<input type="number" min="1" max="50" step="1" id="mavMargen" value="${esc(D.margen)}" aria-label="Margen en %">` : `<b>${esc(D.margen)}</b>`} % <small>(a confirmar)</small></label></div>
<div class="hint" style="margin-top:8px">Retirado = vales menos devoluciones (con lo cambiado por otro material). Según avance = cómputo de la obra × avance de su rubro en el itemizado (columnas, zanja, cable, tablero, PAT). El rubro de cada material sale de la sección del cómputo o del nombre: <b>a confirmar</b>.</div>`;
  }
  function plazaDelLegajo() { const s = $("lgFotosSec"); return s && s.dataset.plaza ? s.dataset.plaza : ""; }
  let actual = null;
  function poner() {
    let sec = $("lgMavSec");
    const id = on() ? plazaDelLegajo() : ""; if (!id) { sec && sec.remove(); return; }
    const ref = $("lgBalSec") || [...document.querySelectorAll(".card.lg-sec > h3")].map((h) => h.parentElement).find((c) => /Material entregado/.test(c.firstElementChild.textContent));
    if (!ref) return;
    const o = obras().find((x) => String(x.id) === String(id)), D = deObra(o);
    if (!D) { sec && sec.remove(); return; }
    actual = D;
    if (sec && (sec.dataset.plaza !== id || sec.previousElementSibling !== ref)) { sec.remove(); sec = null; }
    const h = html(D);
    if (!sec) { sec = document.createElement("div"); sec.className = "card lg-sec"; sec.id = "lgMavSec"; sec.dataset.plaza = id; ref.insertAdjacentElement("afterend", sec); }
    if (sec.__h !== h && !(document.activeElement && document.activeElement.id === "mavMargen")) { sec.innerHTML = h; sec.__h = h; }
  }
  function hoja(id, h) {
    const v = $(id); v && v.remove();
    const ov = document.createElement("div"); ov.id = id; ov.className = "v7-ov no-print sg-v7"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
    ov.innerHTML = `<div class="v7-caja"><div class="v7-asa"></div>${h}</div>`;
    ov.addEventListener("click", (e) => { if (e.target === ov) ov.remove(); });
    document.body.appendChild(ov); return ov;
  }
  const cab = (t, s, id) => `<div class="v7-cab"><div><h3>${t}</h3>${s ? `<small>${s}</small>` : ""}</div><button type="button" class="v7-x" data-mav="x" data-h="${id}" aria-label="Cerrar">✕</button></div>`;
  function verVales(D, f) {
    const l = vales(D.o, f.codigo);
    hoja("mavVales", cab(`Vales de ${esc(f.desc)}`, `${esc(D.nombre)} · ${esc(f.codigo)}`, "mavVales") + (l.length ? `<div class="sg-tabw"><table class="sg-tab tabla-tarjetas"><thead><tr><th>Comprobante</th><th>Fecha</th><th>Quién</th><th class="n">Cantidad</th></tr></thead><tbody>${l.map((v) => `<tr><td data-label="Comprobante"><b>${esc(v.numero || "—")}</b>${v.dev ? " <small>devolución</small>" : ""}</td><td data-label="Fecha">${esc(v.fecha)}</td><td data-label="Quién">${esc(v.quien || "—")}</td><td class="n" data-label="Cantidad">${v.dev ? "−" : ""}${esc(fN(v.cant))}</td></tr>`).join("")}</tbody></table></div>` : '<div class="sg-hint">No hay vales de este código para esta obra (quizás salió con otro código).</div>') + '<div class="sg-accs"><button type="button" class="btn-primary" data-mav="x" data-h="mavVales">Listo</button></div>');
  }
  function pedirDevol(D, f) {
    const l = vales(D.o, f.codigo).filter((v) => !v.dev), quien = [...new Set(l.map((v) => v.quien).filter(Boolean))];
    hoja("mavDev", cab("↩ Pedir devolución", `${esc(D.nombre)} · ${esc(f.desc)}`, "mavDev") + `<p class="v7-txt">Salieron <b>${un(f.ent, f.un)}</b> y el avance justifica <b>${un(f.deb, f.un)}</b>. Se avisa ${quien.length ? "a <b>" + esc(quien.join(", ")) + "</b> y " : ""}al pañol: «Devolvé ${un(f.dif, f.un)} de ${esc(f.desc)} de ${esc(D.nombre)} o decí dónde está». No mueve stock.</p>
<div class="sg-accs"><button type="button" class="btn-ghost" data-mav="x" data-h="mavDev">No</button><button type="button" class="btn-primary" data-mav="devsi">Sí, avisar</button></div><div class="sg-msg" id="mavDevMsg" aria-live="polite"></div>`).__d = { D, f, quien };
  }
  async function usuarios() { const l = intentar(() => PERMISOS.lista() || [], []); if (l.length) return l; try { const s = await firebase.firestore().collection("usuarios").get(); return s.docs.map((d) => Object.assign({ uid: d.id }, d.data())); } catch (e) { return []; } }
  async function devolSi() {
    const ov = $("mavDev"); if (!ov || !ov.__d) return; const { D, f, quien } = ov.__d, m = $("mavDevMsg");
    const titulo = "↩ Devolución de material", cuerpo = `${f.desc} (${f.codigo}) en ${D.nombre}: salieron ${fN(f.ent)} y el avance justifica ${fN(f.deb)}. Devolvé ${fN(f.dif)} ${f.un || ""} al pañol o avisá dónde está.`.replace(/\s+\./, ".");
    const dej = (a) => intentar(() => window.__pushAvisos.dejarAviso(Object.assign({ titulo, cuerpo, tipo: "devolucion", ref: String(D.id), url: "./" }, a)), null);
    let n = 0;
    for (const q of quien) { await dej({ clave: nk(q) }); n++; }
    (await usuarios()).filter((u) => u && u.rol === "panol" && u.activo !== false && u.email).forEach((u) => { dej({ email: String(u.email).toLowerCase() }); n++; });
    try { window.fbAuditar && window.fbAuditar("material_devolucion", `${D.nombre} · ${f.codigo}: pedido de devolución de ${fN(f.dif)}`, { obraId: D.id, codigo: f.codigo, dif: f.dif }); } catch (e) { }
    if (m) m.textContent = n ? `✓ Avisado (${n}).` : "No encontré a quién avisar: avisale al pañol."; setTimeout(() => { const x = $("mavDev"); x && x.remove(); }, 900);
  }

  // ---------------------------------------------------------------- Supervisor (sin IA)
  function supHallazgos() {
    if (!on() || esCrew() || !["parte", "avance", "produccion"].some((h) => permiso(h) === "editar")) return [];
    const l = [];
    obras().filter((o) => o && o.id !== "__sinObra" && enZona(o)).forEach((o) => {
      const D = intentar(() => deObra(o), null); if (!D || !D.rj) return;
      const f = D.filas.find((x) => x.s === "rj");
      l.push({ g: "rojo", cat: "Material", t: `${D.nombre}: material contra avance · ${D.rj} en rojo`, s: f.ent > 0 ? `${f.desc}: salieron ${fN(f.ent)} ${f.un || ""}, el avance justifica ${fN(f.deb)} → ${fN(f.dif)} sin explicar.` : `${f.desc}: el avance pide ${fN(f.deb)} ${f.un || ""} y no salió nada para esta obra.`, ir: { tipo: "legajo", id: o.id }, obraId: o.id, btn: "Ver" });
    });
    return l.slice(0, 6);
  }

  // ---------------------------------------------------------------- lo que aprende la app: material real
  function tipoObra(F) {
    const n = (ids) => contar(F, ids), met = n(["1", "2", "3", "4"]), prfv = n(["5", "6", "7", "8"]);
    if (!(met + prfv > 0)) return "";
    const t = prfv >= met ? "PRFV" : "Metálica", diez = prfv >= met ? n(["8"]) : n(["4"]), tot = prfv >= met ? prfv : met;
    return t + (diez > tot / 2 ? " 10 m" : " 7 m");
  }
  const BASE_G = { col: ["columna", (F) => contar(F, IT.col)], pat: ["columna", (F) => contar(F, IT.col)], ret: ["columna", (F) => contar(F, IT.col)], gral: ["columna", (F) => contar(F, IT.col)], zanja: ["m de zanja", (F) => contar(F, IT.zanja)], cable: ["m de zanja", (F) => contar(F, IT.zanja)], cruce: ["cruce", (F) => contar(F, IT.cruce)], tab: ["tablero", (F) => Math.max(1, contar(F, ["9", "10"]))] };
  function aprende() {
    const g = {}, usadas = [];
    obras().filter((o) => o && o.id !== "__sinObra" && enZona(o)).forEach((o) => {
      const F = filasIt(o), fin = intentar(() => !!window.__obraFin(o), false), av = general(o, F);
      if (!(fin || av >= 0.9)) return;
      const D = intentar(() => deObra(o), null), tipo = tipoObra(F); if (!D || !tipo) return;
      usadas.push({ id: o.id, nombre: D.nombre, tipo, avance: Math.round(av * 100) });
      D.filas.forEach((f) => {
        if (f.unDist) return;
        const bg = BASE_G[f.grupo] || BASE_G.col, b = bg[1](F); if (!(b > 0)) return;
        const k = f.codigo + "|" + tipo + "|" + bg[0], x = g[k] || (g[k] = { codigo: f.codigo, desc: f.desc, un: f.un, tipo, por: bg[0], l: [] });
        x.l.push({ obra: D.nombre, calc: f.calc / b, real: f.ent / b });
      });
    });
    const filas = Object.keys(g).map((k) => { const x = g[k], n = x.l.length, c = x.l.reduce((s, y) => s + y.calc, 0) / n, r = x.l.reduce((s, y) => s + y.real, 0) / n; return Object.assign(x, { n, calcPor: c < 0.1 ? Math.round(c * 1000) / 1000 : r2(c), realPor: r < 0.1 ? Math.round(r * 1000) / 1000 : r2(r), difPct: c > 0 ? Math.round(((r - c) / c) * 100) : null }); });
    filas.sort((a, b) => b.n - a.n || Math.abs(num(b.difPct)) - Math.abs(num(a.difPct)));
    return { obras: usadas, filas };
  }
  function frase(x) { return `la calculadora pone ${fN(x.calcPor)} ${x.un || ""} por ${x.por}; lo real fue ${fN(x.realPor)} (${x.n} ${x.n === 1 ? "obra" : "obras"})`.replace(/\s+/g, " "); }
  function aprendeHtml() {
    const A = aprende(), iaOk = intentar(() => window.__iaPuede && window.__iaPuede(), false), sug = arr(am().sugerencias);
    const lista = obras().filter((o) => o && o.id !== "__sinObra" && enZona(o)).map((o) => intentar(() => deObra(o), null)).filter(Boolean);
    return `<div class="card"><h2>📦 Material contra avance <span class="h2-sub">lo entregado contra lo que justifica el avance · nuestra zona · margen ${esc(margen())} % (a confirmar)</span></h2>
${lista.length ? `<div class="sg-tabw"><table class="sg-tab tabla-tarjetas"><thead><tr><th>Obra</th><th>Avance</th><th>🔴</th><th>🟡</th><th>🟢</th><th></th></tr></thead><tbody>${lista.map((D) => `<tr><td><b>${esc(D.nombre)}</b></td><td class="n" data-label="Avance">${esc(D.avance)} %</td><td class="n" data-label="🔴">${D.rj}</td><td class="n" data-label="🟡">${D.am}</td><td class="n" data-label="🟢">${D.ok}</td><td><button type="button" class="btn-ghost" data-ap="legajo" data-id="${esc(D.id)}">Ver en el legajo</button></td></tr>`).join("")}</tbody></table></div>` : '<div class="hint">Todavía no hay obras de la zona con cómputo para comparar.</div>'}</div>
<div class="card"><h2>📏 Material real por columna y por tipo de obra <span class="h2-sub">obras terminadas o al 90 % o más · ${A.obras.length} ${A.obras.length === 1 ? "obra" : "obras"}</span></h2>
${A.filas.length ? `<div class="sg-tabw"><table class="sg-tab tabla-tarjetas" id="mavAprTab"><thead><tr><th>Material</th><th>Tipo de obra</th><th>Por</th><th>Calculadora</th><th>Real</th><th>Obras</th><th>Diferencia</th></tr></thead><tbody>${A.filas.map((x) => `<tr data-mavk="${esc(x.codigo + "|" + x.tipo)}"><td><b>${esc(x.desc)}</b><small>${esc(x.codigo)} · ${esc(frase(x))}</small></td><td data-label="Tipo">${esc(x.tipo)}</td><td data-label="Por">${esc(x.por)}</td><td class="n" data-label="Calculadora">${esc(fN(x.calcPor))} ${esc(x.un)}</td><td class="n" data-label="Real">${esc(fN(x.realPor))} ${esc(x.un)}</td><td class="n" data-label="Obras">${x.n}${x.n < 3 ? " (pocos)" : ""}</td><td class="n" data-label="Diferencia">${x.difPct == null ? "—" : (x.difPct > 0 ? "+" : "") + x.difPct + " %"}</td></tr>`).join("")}</tbody></table></div>` : '<div class="hint">Todavía no hay obras terminadas (o al 90 %) con cómputo y vales para aprender.</div>'}
<div class="hint">Real = lo entregado neto (vales − devoluciones) dividido por las columnas, los metros de zanja o los tableros de la obra. Con menos de 3 obras son pocos datos. <b>No cambia la Calculadora:</b> las reglas las decide Ángel.</div>
${sug.length ? `<div class="sg-eti">📝 Anotado para Ángel</div>${sug.slice(-8).reverse().map((s) => `<div class="sg-av info">${esc(s.material || "")}${s.tipo ? " · " + esc(s.tipo) : ""}: ${esc(s.texto || "")}<small style="display:block">${esc(s.por || "")}${s.ts ? " · " + esc(new Date(s.ts).toLocaleDateString("es-AR")) : ""}</small></div>`).join("")}` : ""}
<div class="sg-accs">${iaOk && A.filas.length ? '<button type="button" class="btn-primary" data-mav="ia">✨ Informe del asistente</button>' : ""}</div></div>`;
  }
  async function anotar(s) {
    const prev = arr(am().sugerencias), n = Object.assign({ ts: Date.now(), por: String((window.__fbUser || {}).email || "") }, s);
    const l = prev.concat([n]).slice(-60);
    await window.fbBaremoGuardar({ aprendeMaterial: { sugerencias: l } });
    window.__baremoNube = Object.assign({}, window.__baremoNube || {}, { aprendeMaterial: Object.assign({}, am(), { sugerencias: l }) });
    try { window.fbAuditar && window.fbAuditar("aprende_material", `Anotado para Ángel: ${s.material || ""} · ${s.texto || ""}`.slice(0, 480), { codigo: s.codigo || "", tipo: s.tipo || "" }); } catch (e) { }
    return n;
  }
  async function guardarMargen(v) {
    v = Math.round(num(v)); if (!(v >= 1 && v <= 50)) return;
    window.__baremoNube = Object.assign({}, window.__baremoNube || {}, { aprendeMaterial: Object.assign({}, am(), { margen: v }) });
    try { await window.fbBaremoGuardar({ aprendeMaterial: { margen: v } }); } catch (e) { try { window.mostrarAviso && window.mostrarAviso("No se pudo guardar el margen (sin señal o sin permiso).", "error"); } catch (x) { } }
    poner();
  }
  async function iaInforme() {
    if (!(window.__asistenteAbrir && window.__asistenteAbrir())) return;
    if (innerWidth < 1240) { try { window.__sugerida && window.__sugerida.cerrarAprende(); } catch (e) { } }
    for (let i = 0; i < 80 && !(window.__asistente && window.__asistente.informeMaterial); i++) await new Promise((r) => setTimeout(r, 100));
    const A = window.__asistente; if (A && A.informeMaterial) A.informeMaterial();
  }

  document.addEventListener("click", (e) => {
    const b = e.target && e.target.closest && e.target.closest("[data-mav]"); if (!b) return;
    const a = b.dataset.mav; e.preventDefault();
    if (a === "x") { const v = $(b.dataset.h); v && v.remove(); }
    else if (a === "vales" && actual) verVales(actual, actual.filas[+b.dataset.i]);
    else if (a === "devol" && actual) pedirDevol(actual, actual.filas[+b.dataset.i]);
    else if (a === "devsi") { b.disabled = true; devolSi(); }
    else if (a === "ia") iaInforme();
  });
  document.addEventListener("change", (e) => { if (e.target && e.target.id === "mavMargen") guardarMargen(e.target.value); });
  let pend = false;
  new MutationObserver(() => { if (pend) return; pend = true; requestAnimationFrame(() => { pend = false; try { poner(); } catch (er) { console.warn("[material contra avance]", er); } }); }).observe(document.documentElement, { childList: true, subtree: true });
  setInterval(() => { try { if (plazaDelLegajo()) poner(); } catch (er) { } }, 3000);
  window.__matAvance = { deObra, poner, html, supHallazgos, aprende, aprendeHtml, anotar, frase, margen, grupoSec, grupoMat, vales, MARGEN_DEF };
})();
