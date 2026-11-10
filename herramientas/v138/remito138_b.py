# Segunda tanda sobre remito138.html: «💲 Solo precios», «📜 Remitos cargados» y aviso de remito repetido.
import sys
p = sys.argv[1]
t = open(p, encoding='utf-8').read()
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:100], c); t = t.replace(a, b)

# ---------------- CSS
R('@media (max-width:640px){.rf-datos{grid-template-columns:1fr}', '''.rf-modo{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:2px 0 10px}
.rf-modo button{margin:0;min-height:52px;border-radius:16px;border:1.5px solid var(--border,rgba(40,40,94,.12));background:#fff;color:var(--navy,#28285E);font:700 14px var(--fuente,inherit);padding:6px 8px;cursor:pointer;line-height:1.2}
.rf-modo button small{display:block;font-weight:500;font-size:11.5px;color:var(--text-3,#7C879D)}
.rf-modo button.activo{background:var(--navy,#28285E);border-color:var(--navy,#28285E);color:#fff}.rf-modo button.activo small{color:rgba(255,255,255,.75)}
.rf-hist{display:block;margin:10px auto 0;width:auto !important;min-height:44px}
.rf-pre{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;margin-top:8px;font-size:14px}
.rf-pre .rf-ant{font-family:var(--mono,monospace);color:var(--text-soft,#4B5670)}
.rf-pre .rf-nue{font-family:var(--mono,monospace);font-weight:800;color:var(--navy,#28285E)}
.rf-pre small{color:var(--text-3,#7C879D)}
.rf-usa{display:flex;align-items:center;gap:8px;margin:8px 0 0;font-size:13.5px;font-weight:600}
.rf-usa input{width:22px !important;height:22px;margin:0}
.rf-ren.rf-viejo{border-color:rgba(255,159,10,.6)}
.rf-revisa{display:inline-block;font-size:11.5px;font-weight:800;padding:2px 8px;border-radius:999px;background:#fff3e0;color:#7a4300}
.rh-filtros{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr);gap:8px;margin:4px 0 10px}
.rh-filtros input,.rh-filtros select{margin:0;width:100%}
.rh-item{display:block;width:100%;text-align:left;margin:0 0 8px;padding:11px 13px;border-radius:16px;background:#fff;border:1.5px solid var(--border,rgba(40,40,94,.12));cursor:pointer;font:inherit;color:var(--text,#0D1424);min-height:44px}
.rh-item b{font-size:14.5px}.rh-item .rh-l2{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:12.5px;color:var(--text-soft,#4B5670);margin-top:3px}
.rh-modo{font-size:11.5px;font-weight:800;padding:2px 8px;border-radius:999px;background:#e8eaf6;color:var(--navy,#28285E)}.rh-modo.p{background:#e3f6ec;color:#11683f}
.rh-tabla{width:100%;border-collapse:collapse;font-size:13px;margin-top:8px}
.rh-tabla th{font:700 11px var(--mono,monospace);text-transform:uppercase;color:var(--text-3,#7C879D);text-align:left;padding:4px 6px}
.rh-tabla td{padding:6px;border-top:1px solid var(--border,rgba(40,40,94,.1));vertical-align:top}
.rh-acc{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.rh-acc .btn-ghost,.rh-acc .btn-primary{width:auto;margin:0}
@media (max-width:640px){.rh-filtros{grid-template-columns:1fr 1fr}.rh-filtros input[type=text]{grid-column:1 / -1}.rh-tabla thead{display:none}.rh-tabla tr{display:block;padding:6px 0;border-top:1px solid var(--border,rgba(40,40,94,.1))}.rh-tabla td{display:block;border:0;padding:2px 0}}
@media (max-width:640px){.rf-datos{grid-template-columns:1fr}''')

R('''  //    y «Sí, cargar entrada» pegado abajo, siempre a la vista.''', '''  //    y «Sí, cargar entrada» pegado abajo, siempre a la vista.
  //  · v138: modo «💲 Solo precios» (no mueve stock): misma lectura y misma propuesta de códigos; por renglón precio actual
  //    (costo del catálogo y su fecha) → precio nuevo SIN IVA, con casilla; remito más viejo que el precio guardado → aviso
  //    amarillo y destildado; cambio de más de 50 % → «revisá». Con el Sí: fbGuardarProductoCatalogo (costo, costoFecha,
  //    costoFuente, editadoPor/editadoTs), sin movimientos; auditoría «remito_precios».
  //  · v138: «📜 Remitos cargados»: cada remito deja un resumen liviano en `adjuntos` (tipo «remitoRes», sin imagen; no hace
  //    falta colección ni reglas nuevas) que se lee por mes (`where tipo == remitoRes` + `where mes == AAAA-MM`: solo
  //    igualdades, no pide índice compuesto) y avisa si el mismo proveedor + número ya se cargó.''')

# ---------------- elegir el modo al abrir
R('''  function abrir() {
    if (!puede()) { window.alert("🔒 Para cargar remitos hace falta poder editar el pañol."); return; }
    S = { estado: "elegir" };''', '''  let MODO = "entrada";
  function abrir(modo) {
    if (!puede()) { window.alert("🔒 Para cargar remitos hace falta poder editar el pañol."); return; }
    if (modo === "entrada" || modo === "precios") MODO = modo;
    S = { estado: "elegir", modo: MODO };''')
R('''    hoja(`<p class="v7-txt">Sacale una foto al remito o a la factura, de frente, con buena luz y que entre entero.</p>''',
  '''    hoja(`<div class="rf-modo" role="group" aria-label="Qué hacer con el remito"><button type="button" data-rf="modo" data-m="entrada" class="${MODO === "entrada" ? "activo" : ""}" aria-pressed="${MODO === "entrada"}">📦 Cargar entrada<small>suma al stock</small></button><button type="button" data-rf="modo" data-m="precios" class="${MODO === "precios" ? "activo" : ""}" aria-pressed="${MODO === "precios"}">💲 Solo precios<small>no mueve el stock</small></button></div>
<p class="v7-txt">Sacale una foto al remito o a la factura, de frente, con buena luz y que entre entero.</p>''')
R('''<p class="rf-ayuda">¿El remito tiene varias páginas? Elegí las fotos juntas (hasta ${FOTOS_MAX}) o el PDF que te mandaron por mail o WhatsApp.</p>''',
  '''<p class="rf-ayuda">¿El remito tiene varias páginas? Elegí las fotos juntas (hasta ${FOTOS_MAX}) o el PDF que te mandaron por mail o WhatsApp.</p>
<button type="button" class="btn-ghost rf-hist" data-rhabrir="1">📜 Ver remitos cargados</button>''')
# el modo viaja en S
R('''    S = { estado: "leyendo", foto, fotos, pdf, ref };''', '''    S = { estado: "leyendo", foto, fotos, pdf, ref, modo: MODO };''')
R('''    S = { estado: "leyendo", foto, fotos: [foto] };''', '''    S = { estado: "leyendo", foto, fotos: [foto], modo: MODO };''')
R('''    S = { estado: "tarjeta", foto: S.foto, fotos: S.fotos || (S.foto ? [S.foto] : []), pdf: S.pdf || null, datos:''',
  '''    S = { estado: "tarjeta", modo: S.modo || MODO, foto: S.foto, fotos: S.fotos || (S.foto ? [S.foto] : []), pdf: S.pdf || null, datos:''')
R('''    pintar();
  }
  const prodDe =''', '''    if (S.modo === "precios") S.filas.forEach((x) => { x.usa = usaPorDefecto(x); });
    pintar();
    revisarRepetido(true);
  }
  const prodDe =''')
# pintar / repintar en modo precios
R('''  function pintar() {
    const D = S.datos;''', '''  function pintar() {
    if (S.modo === "precios") return pintarPrecios();
    const D = S.datos;''')
R('''  function repintarFila(i) {
    const el =''', '''  function repintarFila(i) {
    if (S.modo === "precios") { const k = document.querySelector("#rfOv .v7-caja"), y = k ? k.scrollTop : 0; pintarPrecios(); const k2 = document.querySelector("#rfOv .v7-caja"); if (k2) k2.scrollTop = y; return; }
    const el =''')
R('''      if (x.grado === "r") x.grado = "a";
    }
    repintarFila(i);''', '''      if (x.grado === "r") x.grado = "a";
    }
    if (S.modo === "precios") x.usa = usaPorDefecto(x);
    repintarFila(i);''')
# clics nuevos
R('''    if (k === "otra") return abrir();''', '''    if (k === "otra") return abrir();
    if (k === "modo") { MODO = b.dataset.m === "precios" ? "precios" : "entrada"; if (S) S.modo = MODO; document.querySelectorAll('#rfOv [data-rf="modo"]').forEach((x) => { const on = x.dataset.m === MODO; x.classList.toggle("activo", on); x.setAttribute("aria-pressed", on); }); return; }
    if (k === "sip") return guardarPrecios(b);''')
R('''    else if (k === "dolar") D.cotizacion = t.value;''', '''    else if (k === "dolar") { D.cotizacion = t.value; if (S.modo === "precios") refrescarPrecios(); }''')
R('''    else if (k === "precio") { S.filas[i].precio = num(t.value); const r = $("rfRes"); r && (r.innerHTML = resumen()); }''',
  '''    else if (k === "precio") { S.filas[i].precio = num(t.value); if (S.modo === "precios") { refrescarPrecios(); return; } const r = $("rfRes"); r && (r.innerHTML = resumen()); }''')
R('''    if (k === "cat") { S.alCatalogo = t.checked; return; }''', '''    if (k === "cat") { S.alCatalogo = t.checked; return; }
    if (k === "usa") { S.filas[i].usa = t.checked; refrescarPrecios(); return; }''')

# ---------------- guardar entrada: repetido, archivos y resumen
R('''    if (typeof window.fbAddMovimiento != "function") return mal("No hay conexión con la base del pañol.");
    S.estado = "guardando";''', '''    if (typeof window.fbAddMovimiento != "function") return mal("No hay conexión con la base del pañol.");
    if (!(await revisarRepetido(false))) return;
    S.estado = "guardando";''')
R('''    let fotoId = ""; const fotoIds = []; let pdfGuardado = null;
    const fotosG = S.fotos && S.fotos.length ? S.fotos : S.foto ? [S.foto] : [];
    for (let k = 0; k < fotosG.length; k++) {''', '''    const ar = await guardarArchivos(D), fotoIds = ar.fotoIds, pdfGuardado = ar.pdfGuardado, fotosG = ar.fotosG, fotoId = fotoIds[0] || "";
''')
# sacar el bloque viejo de archivos (queda en guardarArchivos)
i0 = t.index('''      const f = fotosG[k];
      try {
        if (typeof window.fbAdjuntoGuardar == "function") { const id = await window.fbAdjuntoGuardar({ tipo: "remito"''')
i1 = t.index('''    fotoId = fotoIds[0] || "";''') + len('''    fotoId = fotoIds[0] || "";''')
viejo = t[i0:i1]
t = t[:i0] + t[i1:]
R('''    const fuera = S.filas.filter((x) => x.fuera || x.cod === "");
    S.estado = "hecho"; S.ids = ids;''', '''    const fuera = S.filas.filter((x) => x.fuera || x.cod === "");
    try {
      const numDe = {}; (window.stockMovimientos || []).forEach((s) => { if (s && s.id && s.numero) numDe[s.id] = s.numero; });
      await guardarResumen("entrada", D, S.filas.map((x) => { const p = x.cod !== "" ? prodDe(x.cod) : null, va = !x.fuera && p; return { desc: x.ren.desc, cant: isFinite(x.cant) ? x.cant : null, un: p ? p.un : x.ren.un || "", precio: isFinite(x.precio) ? x.precio : null, codigo: va ? p.codigo : null, grado: x.grado, mov: va && x.movId ? numDe[x.movId] || "" : "", movId: va ? x.movId || "" : "", afuera: !va }; }), ids, fotoIds);
    } catch (e) { console.warn("[remito] resumen:", e); }
    S.estado = "hecho"; S.ids = ids;''')

# ---------------- funciones nuevas (antes de «botones»)
NUEVO = r'''
  // =================================================================================== v138: archivos y resumen del remito
  async function guardarArchivos(D) {
    const fotoIds = []; let pdfGuardado = null;
    const fotosG = S.fotos && S.fotos.length ? S.fotos : S.foto ? [S.foto] : [];
    for (let k = 0; k < fotosG.length; k++) {
''' + viejo.replace('    fotoId = fotoIds[0] || "";', '') + r'''    return { fotoIds, pdfGuardado, fotosG };
  }
  const claveDe = (prov, numero) => { const n = String(numero || "").replace(/[^0-9a-z]/gi, "").replace(/^0+/, "").toLowerCase(); return n ? nrm(prov).replace(/[^0-9a-z]/g, "") + "|" + n : ""; };
  const mesDe = (ts) => { const d = new Date(ts); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"); };
  const db = () => (window.firebase && firebase.firestore ? firebase.firestore() : null);
  async function guardarResumen(modo, D, renglones, movIds, fotoIds) {
    const ts = Date.now();
    const tot = renglones.reduce((s, r) => s + (!r.afuera && isFinite(r.precio) && isFinite(r.cant) && r.precio != null && r.cant != null ? r.precio * r.cant : 0), 0);
    const doc = { tipo: "remitoRes", mes: mesDe(ts), clave: claveDe(D.proveedor, D.numero), modo, proveedor: (D.proveedor || "").trim(), numero: (D.numero || "").trim(), remito: (D.numero || "").trim(), fecha: D.fecha || "", moneda: D.moneda, conIva: !!D.conIva, ivaPct: D.conIva ? D.ivaPct : 0, cotizacion: D.moneda === "USD" ? num(D.cotizacion) || null : null, total: r2(tot), renglones: renglones.slice(0, 200), movimientos: movIds || [], fotoIds: fotoIds || [], pdf: !!S.pdf, paginas: S.pdf ? S.pdf.paginas || 0 : (S.fotos || []).length, por: yoEmail(), ts, porAsistente: true };
    if (typeof window.fbAdjuntoGuardar != "function") return "";
    const id = await window.fbAdjuntoGuardar(doc);
    LISTA.cache = null;
    return id;
  }
  async function buscarRepetido(prov, numero) {
    const k = claveDe(prov, numero), b = db(); if (!k || !b) return null;
    try { const q = await b.collection("adjuntos").where("tipo", "==", "remitoRes").where("clave", "==", k).get(); const l = []; q.forEach((d) => l.push(Object.assign({ id: d.id }, d.data()))); l.sort((a, c) => (c.ts || 0) - (a.ts || 0)); return l[0] || null; }
    catch (e) { console.warn("[remito] repetido:", e); return null; }
  }
  const fCorta = (iso) => { const m = /^(\d{4})-(\d\d)-(\d\d)/.exec(String(iso || "")); return m ? m[3] + "/" + m[2] + "/" + m[1] : ""; };
  const fTs = (ts) => { const d = new Date(ts || 0); return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0") + " " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
  // «Este remito ya lo cargaste…» → Ver / Cargar igual / Cancelar. Devuelve true si sigue.
  async function revisarRepetido(alLeer) {
    if (!S || !S.datos) return true;
    const D = S.datos, k = claveDe(D.proveedor, D.numero);
    if (!k || (S.dupOk && S.dupOk[k])) return true;
    const ref = S; const r = await buscarRepetido(D.proveedor, D.numero);
    if (!r || S !== ref) return true;
    return new Promise((ok) => {
      const ov = document.createElement("div"); ov.id = "rfDup"; ov.className = "v7-ov v7-arriba no-print"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true");
      const d = r.ts ? new Date(r.ts) : null;
      ov.innerHTML = `<div class="v7-caja"><div class="v7-asa"></div><div class="v7-cab"><h3>⚠ Remito repetido</h3><button type="button" class="v7-x" data-dup="cancelar" aria-label="Cerrar">✕</button></div><p class="v7-txt">Este remito ya lo cargaste el <b>${d ? String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0") : "—"}</b> (${r.modo === "precios" ? "Solo precios" : "Entrada"}): ${esc(r.proveedor || "")} N° ${esc(r.numero || "")}.</p><div class="v7-acc"><button type="button" class="btn-ghost" data-dup="ver">Ver</button><button type="button" class="btn-primary" data-dup="igual">Cargar igual</button><button type="button" class="btn-ghost" data-dup="cancelar">Cancelar</button></div></div>`;
      const fin = (v) => { ov.remove(); ok(v); };
      ov.addEventListener("click", (e) => {
        const b = e.target.closest("[data-dup]"); if (!b && e.target !== ov) return;
        const a = b ? b.dataset.dup : "cancelar";
        if (a === "igual") { if (S) { S.dupOk = S.dupOk || {}; S.dupOk[k] = true; } return fin(true); }
        if (a === "ver") { fin(false); verRemito(r); return; }
        fin(false); if (alLeer) cerrar();
      });
      document.body.appendChild(ov);
    });
  }

  // =================================================================================== v138: solo precios
  function cambioDe(cod) { return (window.catalogoCambios || []).filter((a) => a && String(a.codigo) === String(cod)).sort((a, b) => (b.editadoTs || 0) - (a.editadoTs || 0))[0] || null; }
  function precioActual(cod) {
    const p = prodDe(cod); if (!p) return { costo: NaN, fecha: "" };
    const ch = cambioDe(cod); let fecha = (ch && ch.costoFecha && (!ch.costoTs || !ch.editadoTs || ch.costoTs === ch.editadoTs)) ? ch.costoFecha : "";   // si después se cambió el costo por otro lado, esa fecha ya no vale
    if (!fecha) { try { const u = typeof stockUltimoPrecio == "function" ? stockUltimoPrecio(p.codigo) : null; if (u && u.fecha && Math.abs(num(u.precioUnit) - num(p.costo)) < 0.011) fecha = u.fecha; } catch (e) { } }
    if (!fecha && ch && ch.costo != null && ch.editadoTs) { const d = new Date(ch.editadoTs); fecha = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
    return { costo: num(p.costo), fecha };
  }
  function infoPrecio(x) {
    const p = x.cod !== "" ? prodDe(x.cod) : null, D = S.datos;
    const act = p ? precioActual(p.codigo) : { costo: NaN, fecha: "" };
    const falta = D.moneda === "USD" && !(num(D.cotizacion) > 0);
    const nuevo = p && isFinite(x.precio) && !falta ? aPesosSinIva(x.precio, D) : NaN;
    const viejo = !!(p && act.fecha && D.fecha && D.fecha < act.fecha);
    const revisa = isFinite(nuevo) && act.costo > 0 && Math.abs(nuevo - act.costo) / act.costo > 0.5;
    return { p, act, nuevo, viejo, revisa, falta };
  }
  function usaPorDefecto(x) { const f = infoPrecio(x); return !!(f.p && !x.fuera && isFinite(x.precio) && !f.viejo); }
  function filaPrecioHtml(x, i) {
    const f = infoPrecio(x), p = f.p, gr = x.fuera && !p ? "r" : x.grado === "r" && p ? "a" : x.grado;
    const et = gr === "v" ? (x.porEan ? "🟢 Seguro (código de barras)" : "🟢 Seguro") : gr === "a" ? "🟡 Parecido" : "🔴 Sin código";
    const ops = x.cands.filter((c) => !p || String(c.codigo) !== String(p.codigo));
    const sel = `<select data-rf="cod" data-i="${i}" aria-label="Producto del pañol"><option value=""${p ? "" : " selected"}>— sin código: elegilo o dejalo afuera —</option>${p ? `<option value="${esc(p.codigo)}" selected>${esc(p.codigo)} — ${esc(p.desc)} (${esc(p.un)})</option>` : ""}${ops.map((c) => `<option value="${esc(c.codigo)}">${esc(c.codigo)} — ${esc(c.desc)} (${esc(c.un)})</option>`).join("")}<option value="__otro">🔎 Buscar otro en el catálogo…</option></select>`;
    const puedeUsar = !!(p && isFinite(f.nuevo));
    const notas = [];
    if (p && x.conv && x.conv.txt) notas.push(`<p class="rf-nota${x.conv.ok ? "" : " r"}">⚠ ${esc(x.conv.txt)}</p>`);
    if (f.viejo) notas.push(`<p class="rf-nota">⚠ El remito (${esc(fCorta(S.datos.fecha))}) es más viejo que el precio que ya tenés (${esc(fCorta(f.act.fecha))}).</p>`);
    if (p && !isFinite(x.precio)) notas.push('<p class="rf-nota r">El remito no trae precio para este renglón.</p>');
    if (f.falta) notas.push('<p class="rf-nota r">Poné el dólar del día para pasar a pesos.</p>');
    return `<div class="rf-ren g-${gr}${f.viejo ? " rf-viejo" : ""}${!p ? " rf-fuera" : ""}" data-ren="${i}">
<div class="rf-ren-cab"><p class="rf-dice">Dice el remito: <b>«${esc(x.ren.desc)}»</b>${isFinite(x.ren.precio) ? ` · ${esc(plata(x.ren.precio))}${x.ren.un ? " / " + esc(x.ren.un) : ""}` : ""}</p><span class="rf-grado ${gr}">${et}</span></div>
<div class="rf-flecha">→ Producto del pañol</div>${sel}${x.otro ? `<input type="text" class="rf-busca" data-rf="busca" data-i="${i}" list="stockDatalist" placeholder="Escribí el código o el nombre…" autocomplete="off">` : ""}
${p ? `<div class="rf-fila"><div><label>Precio del remito (${S.datos.moneda === "USD" ? "U$S" : "$"}${S.datos.conIva ? ", con IVA" : ", sin IVA"}) por ${esc(p.un)}</label><input type="number" inputmode="decimal" min="0" step="0.01" data-rf="precio" data-i="${i}" value="${isFinite(x.precio) ? x.precio : ""}" placeholder="sin precio"></div></div>
<div class="rf-pre" data-rfpre="${i}">${preHtml(f)}</div>` : ""}
${notas.join("")}
${p ? `<label class="rf-usa"><input type="checkbox" data-rf="usa" data-i="${i}"${x.usa && puedeUsar ? " checked" : ""}${puedeUsar ? "" : " disabled"}> Actualizar este precio</label>` : '<p class="rf-nota r">Sin código: no se actualiza nada.</p>'}
</div>`;
  }
  function preHtml(f) {
    return `<span class="rf-ant">${isFinite(f.act.costo) && f.act.costo > 0 ? esc(plata(f.act.costo)) : "sin precio"}</span>${f.act.fecha ? `<small>(${esc(fCorta(f.act.fecha))})</small>` : ""} → <span class="rf-nue">${isFinite(f.nuevo) ? esc(plata(f.nuevo)) : "—"}</span><small>sin IVA</small>${f.revisa ? '<span class="rf-revisa">revisá: cambia más de 50 %</span>' : ""}`;
  }
  function resumenPrecios() {
    const n = S.filas.filter((x) => x.usa && isFinite(infoPrecio(x).nuevo)).length;
    return n ? `Se actualizan <b>${n}</b> ${n === 1 ? "precio" : "precios"} del catálogo (costo sin IVA). <b>No se mueve el stock.</b>` : "Tildá los precios que querés actualizar.";
  }
  function refrescarPrecios() {
    if (!S || S.modo !== "precios") return;
    S.filas.forEach((x, i) => {
      const el = document.querySelector('#rfFilas [data-rfpre="' + i + '"]'); if (el) el.innerHTML = preHtml(infoPrecio(x));
      const c = document.querySelector('#rfFilas [data-rf="usa"][data-i="' + i + '"]'); if (c) { const ok = isFinite(infoPrecio(x).nuevo); c.disabled = !ok; if (!ok) { c.checked = false; x.usa = false; } }
    });
    const r = $("rfRes"); r && (r.innerHTML = resumenPrecios());
    const s = $("rfSum"); s && (s.innerHTML = sumario());
  }
  function pintarPrecios() {
    const D = S.datos;
    hoja(`<div class="rf-sum" id="rfSum">${sumario()}</div><div class="rf-foto">${miniaturas()}<p><b>💲 Solo precios:</b> se actualiza el costo del catálogo (sin IVA). No se cargan entradas ni se mueve el stock.</p></div>
<div class="rf-datos"><div><label for="rfProv">Proveedor</label><input type="text" id="rfProv" data-rf="prov" value="${esc(D.proveedor)}" list="stockProveedoresList" autocomplete="off"></div>
<div><label for="rfNum">Remito / factura N°</label><input type="text" id="rfNum" data-rf="num" value="${esc(D.numero)}" autocomplete="off"></div>
<div><label for="rfFecha">Fecha</label><input type="date" id="rfFecha" data-rf="fecha" value="${esc(D.fecha)}"></div></div>
<div class="rf-precios"><div><label for="rfMon">Moneda</label><select id="rfMon" data-rf="mon"><option value="ARS"${D.moneda === "ARS" ? " selected" : ""}>Pesos ($)</option><option value="USD"${D.moneda === "USD" ? " selected" : ""}>Dólares (U$S)</option></select></div>
<div><label for="rfIva">IVA incluido en los precios</label><select id="rfIva" data-rf="iva"><option value="0"${!D.conIva ? " selected" : ""}>Sin IVA</option><option value="21"${D.conIva && D.ivaPct === 21 ? " selected" : ""}>Con IVA 21 %</option><option value="10.5"${D.conIva && D.ivaPct === 10.5 ? " selected" : ""}>Con IVA 10,5 %</option>${D.conIva && D.ivaPct !== 21 && D.ivaPct !== 10.5 ? `<option value="${D.ivaPct}" selected>Con IVA ${esc(nf(D.ivaPct, 1))} %</option>` : ""}</select></div>
${D.moneda === "USD" ? `<div><label for="rfDolar">Dólar del día ($)</label><input type="number" id="rfDolar" data-rf="dolar" inputmode="decimal" min="0" step="0.01" value="${esc(D.cotizacion)}"></div>` : ""}</div>
<div id="rfFilas">${S.filas.map(filaPrecioHtml).join("")}</div>
<div class="rf-pie" id="rfPie"><div class="rf-res" id="rfRes">${resumenPrecios()}</div>
<div class="v7-acc"><button type="button" class="btn-primary" data-rf="sip">Sí, actualizar precios</button><button type="button" class="btn-ghost" data-rf="no">No</button></div>
<div class="v7-msg" id="rfMsg"></div></div>`);
  }
  async function guardarPrecios(btn) {
    const D = S.datos, m = $("rfMsg");
    const mal = (t) => { m.className = "v7-msg mal"; m.textContent = t; };
    if (D.moneda === "USD" && !(num(D.cotizacion) > 0)) return mal("Los precios están en dólares: poné el dólar del día.");
    const va = S.filas.filter((x) => x.usa && isFinite(infoPrecio(x).nuevo));
    if (!va.length) return mal("No hay precios tildados para actualizar.");
    if (!D.fecha) return mal("Poné la fecha del remito.");
    if (typeof window.fbGuardarProductoCatalogo != "function") return mal("No hay conexión con la base del pañol.");
    if (!(await revisarRepetido(false))) return;
    S.estado = "guardando"; btn.disabled = true; m.className = "v7-msg"; m.textContent = "Actualizando precios…";
    const ar = await guardarArchivos(D);
    const fuente = ("remito " + (D.proveedor || "").trim() + " " + (D.numero || "").trim()).replace(/\s+/g, " ").trim();
    const hechos = [], fallas = [];
    for (const x of va) {
      const f = infoPrecio(x), p = f.p, ts0 = Date.now();
      try {
        await window.fbGuardarProductoCatalogo({ codigo: p.codigo, desc: p.desc, un: p.un, costo: r2(f.nuevo), costoFecha: D.fecha, costoFuente: fuente, editadoPor: yoEmail(), editadoTs: ts0, costoTs: ts0 });
        x.hecho = { antes: isFinite(f.act.costo) ? r2(f.act.costo) : null, despues: r2(f.nuevo) }; hechos.push(x);
      } catch (e) {
        fallas.push(x.ren.desc);
        if (e && e.code === "permission-denied") { mal("🔒 Tu usuario no tiene permiso para cambiar precios del catálogo. No se cambió nada más."); break; }
      }
    }
    try { await guardarResumen("precios", D, S.filas.map((x) => { const p = x.cod !== "" ? prodDe(x.cod) : null; return { desc: x.ren.desc, cant: isFinite(x.ren.cant) ? x.ren.cant : null, un: p ? p.un : x.ren.un || "", precio: isFinite(x.precio) ? x.precio : null, codigo: p ? p.codigo : null, grado: x.grado, precioAntes: x.hecho ? x.hecho.antes : null, precioDespues: x.hecho ? x.hecho.despues : null, afuera: !x.hecho }; }), [], ar.fotoIds); } catch (e) { console.warn("[remito] resumen:", e); }
    try { window.fbAuditar && window.fbAuditar("remito_precios", `Remito ${D.numero || "(sin número)"}${D.proveedor ? " de " + D.proveedor : ""}: ${hechos.length} precio(s) del catálogo actualizados con la IA (solo precios, sin mover stock)${fallas.length ? ", " + fallas.length + " fallaron" : ""}.`, { ref: D.numero || "", porAsistente: true, proveedor: D.proveedor || "", codigos: hechos.map((x) => x.cod), cambios: hechos.map((x) => ({ codigo: x.cod, antes: x.hecho.antes, despues: x.hecho.despues })), fotoIds: ar.fotoIds, renglones: S.filas.length }); } catch (e) { }
    try { if (typeof window.invalidarCatalogo == "function") window.invalidarCatalogo(); } catch (e) { }
    S.estado = "hecho";
    hoja(`<div class="rf-foto">${miniaturas()}<p class="v7-msg bien" style="margin:0;">✓ Precios actualizados: ${hechos.length} ${hechos.length === 1 ? "producto" : "productos"} (costo sin IVA). No se movió el stock.</p></div>
${hechos.length ? `<table class="rh-tabla"><thead><tr><th>Código</th><th>Producto</th><th>Antes</th><th>Ahora</th></tr></thead><tbody>${hechos.map((x) => { const p = prodDe(x.cod) || {}; return `<tr><td class="mono">${esc(x.cod)}</td><td>${esc(p.desc || x.ren.desc)}</td><td>${x.hecho.antes != null ? esc(plata(x.hecho.antes)) : "—"}</td><td><b>${esc(plata(x.hecho.despues))}</b></td></tr>`; }).join("")}</tbody></table>` : ""}
${fallas.length ? `<p class="rf-nota r">No se pudieron actualizar: ${esc(fallas.join(" · "))}.</p>` : ""}
<div class="v7-acc"><button type="button" class="btn-primary" data-rf="cerrar">Listo</button></div>`);
    const ov = $("rfOv"); ov && ov.classList.add("rf-listo");
  }

  // =================================================================================== v138: 📜 Remitos cargados
  const LISTA = { items: [], meses: 0, cache: null, cargando: false, f: { q: "", prov: "", desde: "", hasta: "" } };
  const puedeVer = () => !!window.__fbUser && perm("stock") !== "oculto";
  function mesAtras(k) { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - k); return mesDe(d.getTime()); }
  async function cargarMeses(n) {
    const b = db(); if (!b) return;
    LISTA.cargando = true;
    const desde = LISTA.meses;
    for (let k = desde; k < desde + n; k++) {
      try { const q = await b.collection("adjuntos").where("tipo", "==", "remitoRes").where("mes", "==", mesAtras(k)).get(); q.forEach((d) => { if (!LISTA.items.some((x) => x.id === d.id)) LISTA.items.push(Object.assign({ id: d.id }, d.data())); }); }
      catch (e) { console.warn("[remito] lista:", e); LISTA.error = String((e && e.message) || e); }
      LISTA.meses = k + 1;
    }
    LISTA.items.sort((a, c) => (c.ts || 0) - (a.ts || 0));
    LISTA.cargando = false; LISTA.cache = true;
  }
  function hojaRh(id, html) {
    let ov = $(id);
    if (!ov) { ov = document.createElement("div"); ov.id = id; ov.className = "v7-ov no-print" + (id === "rhVer" ? " v7-arriba" : ""); ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.innerHTML = '<div class="v7-caja"></div>'; document.body.appendChild(ov); ov.addEventListener("click", clicRh); ov.addEventListener("input", filtrarRh); ov.addEventListener("change", filtrarRh); }
    ov.querySelector(".v7-caja").innerHTML = '<div class="v7-asa"></div>' + html;
    return ov;
  }
  function filtrados() {
    const f = LISTA.f, q = nrm(f.q);
    return LISTA.items.filter((x) => (!f.prov || x.proveedor === f.prov) && (!f.desde || (x.fecha || "") >= f.desde) && (!f.hasta || (x.fecha || "") <= f.hasta) && (!q || nrm([x.proveedor, x.numero, x.por, (x.renglones || []).map((r) => r.desc + " " + (r.codigo || "") + " " + (r.mov || "")).join(" ")].join(" ")).indexOf(q) >= 0));
  }
  function itemHtml(x) {
    const n = (x.renglones || []).length;
    return `<button type="button" class="rh-item" data-rhver="${esc(x.id)}"><b>${esc(x.proveedor || "Sin proveedor")} · N° ${esc(x.numero || "—")}</b> <span class="rh-modo${x.modo === "precios" ? " p" : ""}">${x.modo === "precios" ? "💲 Solo precios" : "📦 Entrada"}</span>
<span class="rh-l2"><span>📅 ${esc(fCorta(x.fecha) || "sin fecha")}</span><span>${n} ${n === 1 ? "renglón" : "renglones"}</span>${x.total ? `<span>${x.moneda === "USD" ? "U$S " + esc(nf(x.total, 2)) : esc(plata(x.total))}${x.conIva ? " c/IVA" : ""}</span>` : ""}<span>👤 ${esc(String(x.por || "").split("@")[0])} · ${esc(fTs(x.ts))}</span></span></button>`;
  }
  function pintarLista() {
    const l = filtrados(), provs = [...new Set(LISTA.items.map((x) => x.proveedor).filter(Boolean))].sort();
    const caja = $("rhLista"); if (!caja) return;
    caja.innerHTML = (l.length ? l.map(itemHtml).join("") : `<p class="v7-txt">${LISTA.cargando ? "Buscando…" : LISTA.items.length ? "No hay remitos con ese filtro." : "Todavía no hay remitos cargados con la IA en estos meses."}</p>`) +
      `<button type="button" class="btn-ghost rf-hist" data-rh="mas"${LISTA.cargando ? " disabled" : ""}>Ver más (meses anteriores)</button><p class="rf-ayuda">Hasta ${esc(fCorta(mesAtras(LISTA.meses - 1) + "-01"))} · ${LISTA.items.length} remito(s).</p>`;
    const s = $("rhProv"); if (s && s.options.length !== provs.length + 1) { const v = LISTA.f.prov; s.innerHTML = '<option value="">Todos los proveedores</option>' + provs.map((p) => `<option${p === v ? " selected" : ""}>${esc(p)}</option>`).join(""); }
  }
  async function abrirLista() {
    if (!puedeVer()) { window.alert("🔒 No tenés permiso para ver el pañol."); return; }
    hojaRh("rhOv", `<div class="v7-cab"><div><h3>📜 Remitos cargados</h3><small>Los que se cargaron con la IA (entrada o solo precios).</small></div><button type="button" class="v7-x" data-rh="cerrar" aria-label="Cerrar">✕</button></div>
<div class="rh-filtros"><input type="text" id="rhBuscar" placeholder="Buscar: proveedor, N°, producto, E-…" value="${esc(LISTA.f.q)}" autocomplete="off"><select id="rhProv" aria-label="Proveedor"><option value="">Todos los proveedores</option></select><input type="date" id="rhDesde" aria-label="Desde" value="${esc(LISTA.f.desde)}"><input type="date" id="rhHasta" aria-label="Hasta" value="${esc(LISTA.f.hasta)}"></div>
<div id="rhLista"><p class="v7-txt">Buscando…</p></div>`);
    if (!LISTA.cache) { LISTA.items = []; LISTA.meses = 0; await cargarMeses(3); }
    pintarLista();
  }
  function filtrarRh(e) {
    const t = e.target; if (!t || !t.id) return;
    if (t.id === "rhBuscar") LISTA.f.q = t.value; else if (t.id === "rhProv") LISTA.f.prov = t.value; else if (t.id === "rhDesde") LISTA.f.desde = t.value; else if (t.id === "rhHasta") LISTA.f.hasta = t.value; else return;
    pintarLista();
  }
  function detalleHtml(x, imprimir) {
    const ren = x.renglones || [], prec = x.modo === "precios", mon = (n) => n == null || !isFinite(n) ? "—" : x.moneda === "USD" && !imprimir ? "U$S " + nf(n, 2) : plata(n);
    const filas = ren.map((r) => `<tr><td>${esc(r.desc || "")}</td><td class="mono">${r.codigo != null ? esc(r.codigo) : "—"}</td><td>${r.cant != null ? esc(nf(r.cant, 2)) + " " + esc(r.un || "") : ""}</td><td>${r.precio != null ? (x.moneda === "USD" ? "U$S " + esc(nf(r.precio, 2)) : esc(plata(r.precio))) : "—"}</td><td>${prec ? (r.precioDespues != null ? `${r.precioAntes != null ? esc(plata(r.precioAntes)) : "sin precio"} → <b>${esc(plata(r.precioDespues))}</b>` : "no se cambió") : r.afuera ? "quedó afuera" : esc(r.mov || "cargado")}</td></tr>`).join("");
    void mon;
    return `<p style="margin:0 0 6px">${esc(x.proveedor || "Sin proveedor")} · N° <b>${esc(x.numero || "—")}</b> · ${esc(fCorta(x.fecha) || "sin fecha")} · ${prec ? "Solo precios (no movió stock)" : "Entrada"}${x.total ? " · total " + (x.moneda === "USD" ? "U$S " + esc(nf(x.total, 2)) : esc(plata(x.total))) + (x.conIva ? " con IVA" : " sin IVA") : ""}</p>
<p style="margin:0 0 8px;font-size:12.5px;color:#4b5670">Cargado por ${esc(x.por || "")} el ${esc(fTs(x.ts))} con el asistente.</p>
<table class="rh-tabla"><thead><tr><th>Dice el remito</th><th>Código</th><th>Cant.</th><th>Precio</th><th>${prec ? "Precio sin IVA (antes → después)" : "Entrada"}</th></tr></thead><tbody>${filas}</tbody></table>`;
  }
  let VISTO = null;
  async function verRemito(x) {
    if (typeof x == "string") x = LISTA.items.find((y) => y.id === x) || (await (async () => { try { const d = await window.fbAdjuntoLeer(x); return d; } catch (e) { return null; } })());
    if (!x) return;
    VISTO = x;
    const fotos = (x.fotoIds || []).map((id, k) => `<button type="button" class="btn-ghost" data-rh="foto" data-id="${esc(id)}">${x.pdf && k === (x.fotoIds.length - 1) ? "📄 Ver PDF" : "🖼 Ver foto" + (x.fotoIds.length > 1 ? " " + (k + 1) : "")}</button>`).join("");
    hojaRh("rhVer", `<div class="v7-cab"><div><h3>🧾 Remito ${esc(x.numero || "")}</h3><small>${x.modo === "precios" ? "💲 Solo precios" : "📦 Entrada"}</small></div><button type="button" class="v7-x" data-rh="cerrarVer" aria-label="Cerrar">✕</button></div>
${detalleHtml(x)}
<div class="rh-acc">${fotos}${x.pdf && !(x.fotoIds || []).length ? '<span class="rf-nota">El PDF no se guardó en la app (pesaba mucho).</span>' : ""}<button type="button" class="btn-primary" data-rh="imprimir">🖨 Imprimir / PDF</button></div>`);
  }
  async function verArchivo(id) {
    let d = null; try { d = await window.fbAdjuntoLeer(id); } catch (e) { d = null; }
    if (d && (d.mime === "application/pdf" || /^data:application\/pdf/.test(d.dataUrl || ""))) {
      try { const a = document.createElement("a"); a.href = d.dataUrl; a.download = d.nombre || "remito.pdf"; document.body.appendChild(a); a.click(); a.remove(); } catch (e) { }
      return;
    }
    typeof window.verAdjunto == "function" && window.verAdjunto(id);
  }
  function clicRh(e) {
    const ov = e.currentTarget, b = e.target.closest("[data-rh],[data-rhver]");
    if (!b) { if (e.target === ov) ov.remove(); return; }
    if (b.dataset.rhver) return verRemito(b.dataset.rhver);
    const k = b.dataset.rh;
    if (k === "cerrar") { const o = $("rhOv"); o && o.remove(); return; }
    if (k === "cerrarVer") { const o = $("rhVer"); o && o.remove(); return; }
    if (k === "mas") { b.disabled = true; cargarMeses(3).then(pintarLista); return; }
    if (k === "foto") return verArchivo(b.dataset.id);
    if (k === "imprimir" && VISTO) {
      const tit = `Remito ${VISTO.numero || ""} — ${VISTO.proveedor || ""}`.trim();
      if (typeof window.abrirHojaImpresion == "function") window.abrirHojaImpresion(tit, detalleHtml(VISTO, true), VISTO.modo === "precios" ? "Remito · solo precios" : "Remito · entrada");
      else if (window.hojaEMA) window.hojaEMA.abrir(tit, "<!doctype html><html><body>" + detalleHtml(VISTO, true) + "</body></html>");
    }
  }
  document.addEventListener("click", (e) => { const t = e.target; const a = t && t.closest && t.closest("[data-rhabrir]"); if (a) { e.preventDefault(); abrirLista(); } });
'''
R('''  // =================================================================================== botones
  function botonEntrada() {''', NUEVO + '''
  // =================================================================================== botones
  function botonEntrada() {''')
R('''      b.innerHTML = '<button type="button" class="btn-ghost" id="rfBtn" data-rfabrir="1">📷 Cargar remito con foto</button><div class="hint">La IA lee el remito y te arma la entrada para que la revises. Nada se carga sin tu «Sí».</div>';''',
  '''      b.innerHTML = '<button type="button" class="btn-ghost" id="rfBtn" data-rfabrir="1">📷 Cargar remito con foto</button><button type="button" class="btn-ghost" id="rhBtn" data-rhabrir="1">📜 Remitos cargados</button><div class="hint">La IA lee el remito (foto o PDF) y te arma la entrada, o solo actualiza los precios. Nada se carga sin tu «Sí».</div>';''')
R('''  window.__remitoFoto = { abrir, cerrar, conArchivo, conArchivos, partesDe, interpretar,''', '''  window.__remitoFoto = { abrir, cerrar, conArchivo, conArchivos, partesDe, lista: abrirLista, verRemito, buscarRepetido, claveDe, precioActual, interpretar,''')
open(p, 'w', encoding='utf-8').write(t); print('ok remito138_b', len(t))
