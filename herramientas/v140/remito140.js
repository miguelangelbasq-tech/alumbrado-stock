  // =================================================================================== v140: remito «inteligente»
  //  Pedido de Ángel (10/11/2026): «si el remito ya está puesto, que me diga: ya fue registrado, ¿seguir o no? O que se cargó
  //  hasta aquí, ¿cargamos lo que no se cargó? O se cargó todo pero no el precio, ¿cargamos el precio?».
  //  · Clave del remito: proveedor + número normalizados (sin espacios, puntos ni guiones, sin ceros adelante de cada parte,
  //    sin tildes: «0001-00012345» = «1-12345»; «Richetta» = «RICHETTA S.A.»). El proveedor tiene que coincidir SIEMPRE:
  //    el mismo número de otro proveedor es otro remito.
  //  · Se busca en las entradas de `movimientos` (las de la IA y las cargadas a mano en «Registrar movimiento»: campos
  //    `proveedor` y `remito`; entradas no anuladas, sin devoluciones ni correcciones) y en los resúmenes `adjuntos`
  //    tipo «remitoRes» (por `numN`, y los de la v138 por su `clave`).
  //  · Renglón por renglón, por código del pañol: ✅ ya cargado · 🟠 cargado a medias (faltan N) · 💲 cargado sin precio ·
  //    🆕 no se cargó · 🔴 sin código. Cartel arriba (`.card.rf-cartel`) con la propuesta: «➕ Cargar solo lo que falta»
  //    (entradas solo por la diferencia + precio de los 💲 al catálogo, sin duplicar stock), «Solo los precios que faltan»
  //    (la hoja de «Solo precios» con los 💲 tildados: el remito más viejo que el precio sigue avisando), «Revisar renglón por
  //    renglón» (la tarjeta de siempre con cada renglón marcado y tildado según la propuesta; los ✅ destildados) y «Cancelar».
  //    Todo cargado: «Ver lo cargado» / «Cargar igual» / «Cancelar». Nada se escribe sin que la persona lo elija.
  //  · Al completar: entradas con el mismo remito y proveedor, el resumen «remitoRes» se actualiza (o se crea si venía de una
  //    carga a mano) con historial «completado el dd/mm por X: +N renglones, M precios», auditoría «remito_completar».
  const sinTilde = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  function numN(s) {
    const partes = sinTilde(s).split(/[^0-9a-z]+/).filter(Boolean);
    const nums = partes.filter((p) => /\d/.test(p)).map((p) => (/^\d+$/.test(p) ? p.replace(/^0+(?=\d)/, "") : p.replace(/^0+(?=\d)/, "")));
    return nums.join("-");
  }
  const SUFIJOS = /^(s|a|r|l|h|sa|srl|sas|sacif|sacifi|saic|saci|sh|ltda|cia|y|e|hnos|hijos|de|del|la|el)$/;
  function provN(s) { return sinTilde(s).split(/[^0-9a-z]+/).filter((w) => w && !SUFIJOS.test(w)).join(""); }
  function lev(a, b) {
    if (a === b) return 0; if (!a.length) return b.length; if (!b.length) return a.length;
    let v0 = []; for (let j = 0; j <= b.length; j++) v0[j] = j;
    for (let i = 1; i <= a.length; i++) { const v1 = [i]; for (let j = 1; j <= b.length; j++) v1[j] = Math.min(v1[j - 1] + 1, v0[j] + 1, v0[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); v0 = v1; }
    return v0[b.length];
  }
  function mismoProv(a, b) {
    const x = provN(a), y = provN(b); if (!x || !y) return false;
    if (x === y) return true;
    const c = x.length <= y.length ? x : y, l = c === x ? y : x;
    if (c.length >= 4 && l.indexOf(c) === 0) return true;
    return lev(x, y) <= (Math.max(x.length, y.length) >= 8 ? 2 : 1);
  }
  function movsDelRemito(prov, numero) {
    const n = numN(numero); if (!n || !provN(prov)) return [];
    return (window.stockMovimientos || []).filter((m) => m && m.tipo === "entrada" && !m.anulado && !m.devolucion && !m.ajuste && !m.correccion && m.remito && numN(m.remito) === n && mismoProv(m.proveedor, prov));
  }
  async function resDelRemito(prov, numero) {
    const b = db(), n = numN(numero); if (!b || !n) return [];
    const l = [], vistos = {};
    const junta = (q) => q.forEach((d) => { if (vistos[d.id]) return; vistos[d.id] = 1; const x = Object.assign({ id: d.id }, d.data()); if (mismoProv(x.proveedor, prov) && numN(x.numero || x.remito) === n) l.push(x); });
    try { junta(await b.collection("adjuntos").where("tipo", "==", "remitoRes").where("numN", "==", n).get()); } catch (e) { console.warn("[remito] res:", e); }
    const k = claveDe(prov, numero);
    if (k) { try { junta(await b.collection("adjuntos").where("tipo", "==", "remitoRes").where("clave", "==", k).get()); } catch (e) { console.warn("[remito] res:", e); } }
    l.sort((a, c) => (c.ts || 0) - (a.ts || 0));
    return l;
  }
  const ddmm = (ts) => { const d = new Date(ts || 0); return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0"); };
  function quien(em) {
    em = String(em || "");
    try { const l = window.PERMISOS && PERMISOS.lista ? PERMISOS.lista() : null; const u = (l || []).find((x) => x && x.email === em); if (u && (u.nombre || u.persona || u.usuario)) return u.nombre || u.persona || u.usuario; } catch (e) { }
    return em.split("@")[0] || "—";
  }
  const nE = (s) => { const m = /(\d+)\s*$/.exec(String(s || "")); return m ? +m[1] : 0; };
  function rango(movs) {
    const l = [...new Set(movs.map((m) => m.numero).filter(Boolean))].sort((a, b) => nE(a) - nE(b));
    return !l.length ? "" : l.length === 1 ? l[0] : l[0] + " a " + l[l.length - 1];
  }
  const EST = { ok: "✅ Ya cargado", med: "🟠 Cargado a medias", sp: "💲 Cargado sin precio", nu: "🆕 No se cargó", sc: "🔴 Sin código" };
  // ¿el precio de este código ya se puso en el catálogo desde ESTE remito? («Solo precios» / «Cargar solo lo que falta»)
  function precioDeEste(cod) {
    const ch = cambioDe(cod), D = S.datos; if (!ch || !(num(ch.costo) > 0) || !ch.costoFuente) return false;
    const f = sinTilde(ch.costoFuente), pv = provN(D.proveedor);
    return numN(f) === numN(D.numero) && !!pv && provN(f).indexOf(pv.slice(0, 4)) >= 0;
  }
  // estado de cada renglón contra lo ya cargado (por código; si el código se repite en el remito, lo cargado se reparte en orden)
  function analizar() {
    const P = S.prev, por = {};
    P.movs.forEach((m) => { const c = String(m.codigo), o = por[c] || (por[c] = { cant: 0, precio: false, nums: [] }); o.cant += num(m.cantidad) || 0; if (num(m.precioUnit) > 0) o.precio = true; if (m.numero && o.nums.indexOf(m.numero) < 0) o.nums.push(m.numero); });
    const resto = {}; Object.keys(por).forEach((c) => { resto[c] = r2(por[c].cant); });
    const n = { ok: 0, med: 0, sp: 0, nu: 0, sc: 0 };
    S.filas.forEach((x) => {
      const p = x.cod !== "" ? prodDe(x.cod) : null;
      const rc = isFinite(x.ren.cant) ? r2(x.ren.cant * (x.conv ? x.conv.f : 1)) : x.cant;
      x.remCant = rc; x.prevCant = 0; x.falta = 0; x.nums = [];
      if (!p) { x.est = "sc"; n.sc++; return; }
      const c = String(p.codigo), o = por[c];
      if (!o || !(resto[c] > 1e-6)) { x.est = "nu"; x.falta = rc; n.nu++; return; }
      const got = isFinite(rc) ? Math.min(resto[c], rc) : resto[c];
      resto[c] = r2(resto[c] - got); x.prevCant = r2(got); x.nums = o.nums.slice();
      if (!isFinite(rc) || got + 1e-6 >= rc) x.est = !o.precio && !precioDeEste(c) && isFinite(x.precio) && x.precio > 0 ? "sp" : "ok";
      else { x.est = "med"; x.falta = r2(rc - got); }
      n[x.est]++;
    });
    P.n = n; P.total = S.filas.length - n.sc;
    P.completo = n.med + n.nu + n.sp === 0;
    return n;
  }
  // la propuesta: entradas solo por la diferencia, los ✅ destildados, el precio de los 💲 al catálogo
  function propuestaFila(x) {
    x.precioSi = false;
    if (x.est === "ok" || x.est === "sc") { x.fuera = true; return; }
    if (x.est === "sp") { x.fuera = true; const f = infoPrecio(x); x.precioSi = !!(isFinite(f.nuevo) && !f.viejo); return; }
    x.fuera = false;
    if (x.est === "med") x.cant = x.falta; else if (isFinite(x.remCant)) x.cant = x.remCant;
  }
  function propuesta() { S.filas.forEach(propuestaFila); }
  function propuestaReset() { S.filas.forEach((x) => { x.precioSi = false; x.usa = false; x.fuera = x.cod === "" || !prodDe(x.cod); if (isFinite(x.remCant)) x.cant = x.remCant; }); }
  function reEstados(i) {   // cambió el código de un renglón en «Revisar»: se recalcula y ese renglón vuelve a la propuesta
    if (!S || !S.prev) return;
    analizar();
    if (S.prev.revisar && i != null && S.filas[i]) propuestaFila(S.filas[i]);
  }
  // en entrada: ¿este remito ya se cargó? (síncrono con lo que hay en memoria; los resúmenes llegan después)
  function revisarCargado() {
    if (!S || !S.datos || S.modo === "precios") return false;
    const D = S.datos, movs = movsDelRemito(D.proveedor, D.numero);
    if (!movs.length) return false;
    S.prev = { movs, res: [], revisar: false };
    S.dupOk = S.dupOk || {}; const k = claveDe(D.proveedor, D.numero); if (k) S.dupOk[k] = true;
    const t0 = Math.min.apply(null, movs.map((m) => m.ts || 0).filter((t) => t > 0).concat([Date.now()]));
    S.prev.desde = t0; S.prev.quien = [...new Set(movs.map((m) => quien(m.usuario)).filter(Boolean))].join(", ");
    S.prev.rango = rango(movs);
    analizar();
    pintarCartel();
    const ref = S;
    resDelRemito(D.proveedor, D.numero).then((l) => { if (S === ref && S.prev) S.prev.res = l; });
    return true;
  }
  function cartelTexto() {
    const P = S.prev, n = P.n;
    if (P.completo) return { tit: `🧾 Este remito ya se cargó completo el ${ddmm(P.desde)} por ${P.quien}${P.rango ? " (" + P.rango + ")" : ""}.`, det: `${P.total} ${P.total === 1 ? "renglón" : "renglones"} con su cantidad y su precio${n.sc ? ` · ${n.sc} sin código (no se cargan)` : ""}. Si lo cargás de nuevo, se duplica el stock.` };
    const fal = n.med + n.nu;
    const partes = [];
    if (fal) partes.push(`Faltan ${fal} ${fal === 1 ? "renglón" : "renglones"}${n.med ? ` (${n.med} a medias)` : ""}`);
    if (n.sp) partes.push(`${partes.length ? "" : "Faltan "}${n.sp} sin precio`);
    return { tit: `🧾 Este remito ya se cargó en parte el ${ddmm(P.desde)}: ${n.ok} de ${P.total} renglones.`, det: partes.join(" y ") + "." + (n.sc ? ` ${n.sc} sin código (no se cargan).` : "") + (P.rango ? ` Cargado por ${P.quien} (${P.rango}).` : "") };
  }
  function chipsCartel() {
    const n = S.prev.n, l = [["ok", n.ok], ["med", n.med], ["sp", n.sp], ["nu", n.nu], ["sc", n.sc]].filter((z) => z[1]);
    return `<div class="rf-cnt">${l.map((z) => `<span class="rf-est ${z[0]}">${esc(EST[z[0]].split(" ")[0])} ${z[1]} ${esc(EST[z[0]].replace(/^\S+\s/, "").toLowerCase())}</span>`).join("")}</div>`;
  }
  function cartelHtml(conBotones) {
    const P = S.prev, t = cartelTexto();
    let acc = "";
    if (conBotones) {
      acc = P.completo
        ? `<div class="v7-acc"><button type="button" class="btn-primary" data-rf="pver">Ver lo cargado</button><button type="button" class="btn-ghost" data-rf="pigual">Cargar igual</button><button type="button" class="btn-ghost" data-rf="cerrar">Cancelar</button></div>`
        : `<div class="v7-acc"><button type="button" class="btn-primary" data-rf="pfalta">➕ Cargar solo lo que falta</button>${P.n.sp ? '<button type="button" class="btn-ghost" data-rf="pprecios">💲 Solo los precios que faltan</button>' : ""}<button type="button" class="btn-ghost" data-rf="previsar">Revisar renglón por renglón</button><button type="button" class="btn-ghost" data-rf="pver">Ver lo cargado</button><button type="button" class="btn-ghost" data-rf="cerrar">Cancelar</button></div>`;
    } else acc = `<div class="v7-acc"><button type="button" class="btn-ghost rf-chico" data-rf="popciones">‹ Volver a las opciones</button></div>`;
    return `<div class="card rf-cartel ${P.completo ? "completo" : "parcial"}" id="rfCartel" role="status"><h4>${esc(t.tit)}</h4><p>${esc(t.det)}</p>${chipsCartel()}${acc}</div>`;
  }
  function detalleEst(x) {
    const p = x.cod !== "" ? prodDe(x.cod) : null, un = p ? p.un : x.ren.un || "";
    const q = (v) => esc(nf(v, 2)) + " " + esc(un);
    if (x.est === "ok") return `se cargaron ${q(x.prevCant)}${x.nums.length ? " (" + esc(x.nums.join(", ")) + ")" : ""}`;
    if (x.est === "med") return `se cargaron ${esc(nf(x.prevCant, 2))} de ${q(x.remCant)} → <b>faltan ${q(x.falta)}</b>`;
    if (x.est === "sp") return `se cargaron ${q(x.prevCant)} sin precio${isFinite(x.precio) ? " → el remito dice " + esc(plata(x.precio)) : ""}`;
    if (x.est === "nu") return isFinite(x.remCant) ? `falta cargar ${q(x.remCant)}` : "no se cargó";
    return "no tiene código del pañol: no se carga";
  }
  function filaEstHtml(x) {
    const p = x.cod !== "" ? prodDe(x.cod) : null;
    return `<div class="rf-er e-${x.est}"><div class="rf-er-tx"><b>«${esc(x.ren.desc)}»</b>${p ? `<small class="mono">${esc(p.codigo)} — ${esc(p.desc)}</small>` : ""}<small>${detalleEst(x)}</small></div><span class="rf-est ${x.est}">${esc(EST[x.est])}</span></div>`;
  }
  // el estado dentro de cada renglón de la tarjeta («Revisar renglón por renglón» y la hoja de precios)
  function estFila(x, i, soloChip) {
    if (!S || !S.prev || !x.est) return "";
    let h = `<div class="rf-estado"><span class="rf-est ${x.est}">${esc(EST[x.est])}</span><span>${detalleEst(x)}</span></div>`;
    if (soloChip || !S.prev.revisar || S.modo === "precios") return h;
    if (x.est === "sp") { const f = infoPrecio(x), ok = isFinite(f.nuevo); h += `<label class="rf-usa"><input type="checkbox" data-rf="psi" data-i="${i}"${x.precioSi && ok ? " checked" : ""}${ok ? "" : " disabled"}> Poner el precio en el catálogo (${ok ? esc(plata(f.nuevo)) + " sin IVA" : "sin precio"})</label>${f.viejo ? `<p class="rf-nota">⚠ El remito (${esc(fCorta(S.datos.fecha))}) es más viejo que el precio que ya tenés (${esc(fCorta(f.act.fecha))}).</p>` : ""}`; }
    else if (x.est !== "sc") h += `<label class="rf-usa"><input type="checkbox" data-rf="tilde" data-i="${i}"${x.fuera ? "" : " checked"}> ${x.est === "med" ? "Cargar lo que falta" : x.est === "ok" ? "Cargarlo igual (duplica el stock)" : "Cargar este renglón"}</label>`;
    return h;
  }
  function cambioPrev(k, i, on) {
    const x = S.filas[i]; if (!x) return;
    if (k === "psi") x.precioSi = !!on;
    else { x.fuera = !on; if (on && x.est === "ok" && isFinite(x.remCant)) x.cant = x.remCant; }
    repintarFila(i);
  }
  function pintarCartel() {
    const D = S.datos;
    S.prev.revisar = false;
    hoja(`${cartelHtml(true)}<div class="rf-foto">${miniaturas()}<p>${esc(D.proveedor || "Sin proveedor")} · N° <b>${esc(D.numero || "—")}</b>${D.fecha ? " · " + esc(fCorta(D.fecha)) : ""}</p></div>
<div class="rf-estlista" id="rfEstLista">${S.filas.map(filaEstHtml).join("")}</div>
<div class="v7-msg" id="rfMsg"></div>`);
  }
  function resumenCompletar() {
    const va = S.filas.filter((x) => !x.fuera && x.cod !== ""), pr = S.filas.filter((x) => x.precioSi && x.cod !== "");
    const dup = va.filter((x) => x.est === "ok").length;
    return va.length || pr.length ? `Se cargan <b>${va.length}</b> ${va.length === 1 ? "entrada" : "entradas"} (solo lo que falta)${pr.length ? ` · se ponen <b>${pr.length}</b> ${pr.length === 1 ? "precio" : "precios"} en el catálogo` : ""}${dup ? ` · ⚠ ${dup} ya cargado${dup === 1 ? "" : "s"} se duplica${dup === 1 ? "" : "n"}` : ""}.` : "No hay nada tildado para cargar.";
  }
  function verCargado() {
    const P = S && S.prev; if (!P) return;
    let ov = $("rfPrevOv"); ov && ov.remove();
    ov = document.createElement("div"); ov.id = "rfPrevOv"; ov.className = "v7-ov v7-arriba no-print"; ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Lo cargado de este remito");
    const filas = P.movs.slice().sort((a, b) => nE(a.numero) - nE(b.numero)).map((m) => `<tr><td class="mono">${esc(m.numero || "—")}</td><td><span class="mono">${esc(m.codigo)}</span> ${esc(m.desc || "")}</td><td>${esc(nf(num(m.cantidad) || 0, 2))} ${esc(m.un || "")}</td><td>${num(m.precioUnit) > 0 ? esc(plata(num(m.precioUnit))) : "<b>sin precio</b>"}</td><td>${esc(fCorta(m.fecha))} · ${esc(quien(m.usuario))}${m.porAsistente ? " · con la IA" : " · a mano"}</td><td>${m.id ? `<button type="button" class="btn-ghost rf-chico" data-rfp="ver" data-id="${esc(m.id)}">🧾 Ver</button>` : ""}</td></tr>`).join("");
    ov.innerHTML = `<div class="v7-caja"><div class="v7-asa"></div><div class="v7-cab"><div><h3>🧾 Lo cargado de este remito</h3><small>${esc(S.datos.proveedor || "")} · N° ${esc(S.datos.numero || "")}</small></div><button type="button" class="v7-x" data-rfp="cerrar" aria-label="Cerrar">✕</button></div>
<table class="rh-tabla"><thead><tr><th>N°</th><th>Producto</th><th>Cant.</th><th>Precio</th><th>Cuándo</th><th></th></tr></thead><tbody>${filas}</tbody></table>
<div class="rh-acc">${P.res && P.res[0] ? '<button type="button" class="btn-ghost" data-rfp="res">📜 Ver el resumen del remito</button>' : ""}<button type="button" class="btn-primary" data-rfp="cerrar">Listo</button></div></div>`;
    ov.addEventListener("click", (e) => {
      const b = e.target.closest("[data-rfp]"); if (!b) { if (e.target === ov) ov.remove(); return; }
      const a = b.dataset.rfp;
      if (a === "cerrar") return ov.remove();
      if (a === "ver") { try { window.verComprobanteMovimiento(b.dataset.id); } catch (er) { } return; }
      if (a === "res" && P.res && P.res[0]) { ov.remove(); verRemito(P.res[0]); }
    });
    document.body.appendChild(ov);
  }
  function accionPrev(k, b) {
    if (!S || !S.prev) return false;
    if (k === "pver") { verCargado(); return true; }
    if (k === "pigual") { S.prev = null; S.filas.forEach((x) => { x.fuera = x.cod === "" || !prodDe(x.cod); x.precioSi = false; if (isFinite(x.ren.cant)) x.cant = r2(x.ren.cant * (x.conv ? x.conv.f : 1)); }); pintar(); return true; }
    if (k === "popciones") { S.modo = "entrada"; S.prev.completando = false; S.prev.revisar = false; propuestaReset(); pintarCartel(); return true; }
    if (k === "previsar") { propuesta(); S.prev.revisar = true; S.modo = "entrada"; pintar(); return true; }
    if (k === "pfalta") { propuesta(); completar(b); return true; }
    if (k === "pprecios") { S.modo = "precios"; S.prev.completando = true; S.filas.forEach((x) => { x.usa = x.est === "sp" && usaPorDefecto(x); }); pintarPrecios(); return true; }
    if (k === "sic") { completar(b); return true; }
    return false;
  }
  // cargar solo lo que falta: entradas por la diferencia y precios de los 💲 (lo tildado en la tarjeta o la propuesta)
  async function completar(btn) {
    const D = S.datos, m = $("rfMsg");
    const mal = (t) => { if (m) { m.className = "v7-msg mal"; m.textContent = t; } };
    const ent = S.filas.filter((x) => !x.fuera && x.cod !== "" && prodDe(x.cod));
    const pre = S.filas.filter((x) => x.precioSi && x.cod !== "" && prodDe(x.cod) && isFinite(infoPrecio(x).nuevo));
    if (!ent.length && !pre.length) return mal("No hay nada para cargar: tildá algún renglón.");
    if (!D.fecha) return mal("Poné la fecha del remito.");
    const sinCant = ent.filter((x) => !(x.cant > 0)); if (sinCant.length) return mal(`Revisá la cantidad de «${sinCant[0].ren.desc}».`);
    if (D.moneda === "USD" && (pre.length || ent.some((x) => isFinite(x.precio))) && !(num(D.cotizacion) > 0)) return mal("Los precios están en dólares: poné el dólar del día.");
    if (ent.length && typeof window.fbAddMovimiento != "function") return mal("No hay conexión con la base del pañol.");
    if (pre.length && typeof window.fbGuardarProductoCatalogo != "function") return mal("No hay conexión con la base del pañol.");
    S.estado = "guardando"; S.prev.completando = true;
    document.querySelectorAll("#rfOv [data-rf]").forEach((x) => { if (x.tagName === "BUTTON" && x.dataset.rf !== "cerrar") x.disabled = true; });
    if (btn) btn.disabled = true;
    if (m) { m.className = "v7-msg"; m.textContent = "Cargando lo que falta…"; }
    const ar = ent.length ? await guardarArchivos(D) : { fotoIds: [] }, fotoIds = ar.fotoIds || [], fotoId = fotoIds[0] || "";
    let sector = "alumbrado"; try { sector = typeof sectorElegido == "function" ? sectorElegido() : "alumbrado"; } catch (e) { }
    const ids = [], fallas = [], precios = [];
    for (let k = 0; k < ent.length; k++) {
      const x = ent[k], p = prodDe(x.cod);
      const mov = { tipo: "entrada", codigo: p.codigo, desc: p.desc, un: p.un, cantidad: r2(x.cant), fecha: D.fecha, ts: Date.now() + k, usuario: yoEmail(), proveedor: (D.proveedor || "").trim(), remito: (D.numero || "").trim(), sector, porAsistente: true, remitoIa: { desc: x.ren.desc, cant: isFinite(x.ren.cant) ? x.ren.cant : null, un: x.ren.un || "", grado: x.grado }, completaRemito: { estado: x.est || "", cargadoAntes: x.prevCant || 0, enRemito: isFinite(x.remCant) ? x.remCant : null } };
      if (fotoId) mov.fotoId = fotoId;
      if (fotoIds.length > 1) mov.fotoIds = fotoIds.slice();
      if (isFinite(x.precio) && x.precio >= 0) {
        mov.precioOriginal = r2(x.precio); mov.moneda = D.moneda; mov.ivaPct = D.conIva ? D.ivaPct : 0; mov.ivaIncluido = !!D.conIva;
        if (D.moneda === "USD") mov.cotizacion = num(D.cotizacion);
        mov.precioUnit = aPesosSinIva(x.precio, D);
      }
      try { Object.defineProperty(mov, "__precioOk", { value: true, enumerable: false }); } catch (e) { }
      try {
        const id = await window.fbAddMovimiento(mov);
        if (id) { ids.push(id); window.__ultimoMovLocal = Object.assign({ id }, mov); }
        x.movId = id;
        if (S.alCatalogo && mov.precioUnit != null && typeof window.stockActualizarCostoCatalogo == "function") { try { await window.stockActualizarCostoCatalogo(p.codigo, mov.precioUnit); } catch (e) { } }
      } catch (e) {
        fallas.push(x.ren.desc);
        if (e && e.code === "permission-denied") { mal("🔒 Tu usuario no tiene permiso para cargar en el pañol. No se registró nada más."); break; }
      }
    }
    const fuente = ("remito " + (D.proveedor || "").trim() + " " + (D.numero || "").trim()).replace(/\s+/g, " ").trim();
    for (const x of pre) {
      const f = infoPrecio(x), p = f.p, ts0 = Date.now();
      try {
        await window.fbGuardarProductoCatalogo({ codigo: p.codigo, desc: p.desc, un: p.un, costo: r2(f.nuevo), costoFecha: D.fecha, costoFuente: fuente, editadoPor: yoEmail(), editadoTs: ts0, costoTs: ts0 });
        x.hecho = { antes: isFinite(f.act.costo) ? r2(f.act.costo) : null, despues: r2(f.nuevo) }; precios.push(x);
      } catch (e) {
        fallas.push(x.ren.desc);
        if (e && e.code === "permission-denied") { mal("🔒 Tu usuario no tiene permiso para cambiar precios del catálogo. No se cambió nada más."); break; }
      }
    }
    await new Promise((ok) => setTimeout(ok, 200));
    const numDe = {}; (window.stockMovimientos || []).forEach((s) => { if (s && s.id && s.numero) numDe[s.id] = s.numero; });
    const nums = ids.map((id) => numDe[id]).filter(Boolean);
    try {
      await actualizarResumen("entrada", D, S.filas.map((x) => { const p = x.cod !== "" ? prodDe(x.cod) : null; return { desc: x.ren.desc, cant: isFinite(x.remCant) ? x.remCant : isFinite(x.cant) ? x.cant : null, un: p ? p.un : x.ren.un || "", precio: isFinite(x.precio) ? x.precio : null, codigo: p ? p.codigo : null, grado: x.grado, estadoAntes: x.est || "", cargadoAntes: x.prevCant || 0, cargadoAhora: x.movId ? r2(x.cant) : 0, mov: x.movId ? numDe[x.movId] || "" : (x.nums || []).join(", "), movId: x.movId || "", precioAntes: x.hecho ? x.hecho.antes : null, precioDespues: x.hecho ? x.hecho.despues : null, afuera: !p }; }), ids, fotoIds, { renglones: ids.length, precios: precios.length });
    } catch (e) { console.warn("[remito] resumen:", e); }
    try { window.fbAuditar && window.fbAuditar("remito_completar", `Remito ${D.numero || "(sin número)"}${D.proveedor ? " de " + D.proveedor : ""}: completado con la IA, +${ids.length} renglón(es) como entrada y ${precios.length} precio(s) al catálogo${fallas.length ? ", " + fallas.length + " fallaron" : ""}.`, { ref: D.numero || "", porAsistente: true, proveedor: D.proveedor || "", movIds: ids, movimientosAntes: S.prev.movs.map((m) => m.id), entradas: ent.map((x) => ({ codigo: x.cod, cant: r2(x.cant), estado: x.est, cargadoAntes: x.prevCant || 0 })), precios: precios.map((x) => ({ codigo: x.cod, antes: x.hecho.antes, despues: x.hecho.despues })), fotoIds }); } catch (e) { }
    try { typeof window.renderStockTabla == "function" && window.renderStockTabla(); } catch (e) { }
    try { if (precios.length && typeof window.invalidarCatalogo == "function") window.invalidarCatalogo(); } catch (e) { }
    S.estado = "hecho"; S.ids = ids;
    hoja(`<div class="rf-foto">${miniaturas()}<p class="v7-msg bien" style="margin:0;">✓ Remito completado: ${ids.length ? `+${ids.length} ${ids.length === 1 ? "renglón" : "renglones"} como entrada${nums.length ? " (" + esc(nums.join(", ")) + ")" : ""}` : "sin entradas nuevas"}${precios.length ? ` · ${precios.length} ${precios.length === 1 ? "precio" : "precios"} en el catálogo` : ""}. No se duplicó lo que ya estaba.</p></div>
${precios.length ? `<table class="rh-tabla"><thead><tr><th>Código</th><th>Producto</th><th>Antes</th><th>Ahora</th></tr></thead><tbody>${precios.map((x) => { const p = prodDe(x.cod) || {}; return `<tr><td class="mono">${esc(x.cod)}</td><td>${esc(p.desc || x.ren.desc)}</td><td>${x.hecho.antes != null ? esc(plata(x.hecho.antes)) : "—"}</td><td><b>${esc(plata(x.hecho.despues))}</b></td></tr>`; }).join("")}</tbody></table>` : ""}
${fallas.length ? `<p class="rf-nota r">No se pudieron cargar: ${esc(fallas.join(" · "))}. Cargalos a mano.</p>` : ""}
<div class="rf-hecho">${ids.slice(0, 6).map((id, k) => `<button type="button" class="btn-ghost" data-rf="ver" data-id="${esc(id)}">🧾 Ver ${esc(numDe[id] || "comprobante " + (k + 1))}</button>`).join("")}</div>
<div class="v7-acc"><button type="button" class="btn-primary" data-rf="cerrar">Listo</button></div>`);
    const ov = $("rfOv"); ov && ov.classList.add("rf-listo");
  }
  // el resumen «remitoRes»: se actualiza con historial; si el remito venía de una carga a mano, se crea
  async function actualizarResumen(modo, D, renglones, movIds, fotoIds, cuenta) {
    const ts = Date.now(), P = S.prev || {};
    const nR = cuenta && cuenta.renglones != null ? cuenta.renglones : (movIds || []).length;
    const nP = cuenta && cuenta.precios != null ? cuenta.precios : renglones.filter((r) => r.precioDespues != null).length;
    const h = { ts, por: yoEmail(), quien: quien(yoEmail()), modo, renglones: nR, precios: nP, movimientos: movIds || [], texto: `completado el ${ddmm(ts)} por ${quien(yoEmail())}: +${nR} ${nR === 1 ? "renglón" : "renglones"}, ${nP} ${nP === 1 ? "precio" : "precios"}` };
    const r0 = (P.res || []).find((x) => x.modo !== "precios") || (P.res || [])[0];
    const b = db();
    if (r0 && r0.id && b) {
      const act = { historial: (r0.historial || []).concat([h]).slice(-50), movimientos: (r0.movimientos || []).concat(movIds || []), fotoIds: (r0.fotoIds || []).concat(fotoIds || []), renglones: renglones.slice(0, 200), numN: numN(D.numero), provN: provN(D.proveedor), actualizadoTs: ts, actualizadoPor: yoEmail() };
      await b.collection("adjuntos").doc(r0.id).update(act);
      Object.assign(r0, act); LISTA.cache = null;
      return r0.id;
    }
    if (typeof window.fbAdjuntoGuardar != "function") return "";
    const tot = renglones.reduce((s, r) => s + (!r.afuera && r.precio != null && r.cant != null && isFinite(r.precio) && isFinite(r.cant) ? r.precio * r.cant : 0), 0);
    const doc = { tipo: "remitoRes", mes: mesDe(ts), clave: claveDe(D.proveedor, D.numero), numN: numN(D.numero), provN: provN(D.proveedor), modo: "entrada", proveedor: (D.proveedor || "").trim(), numero: (D.numero || "").trim(), remito: (D.numero || "").trim(), fecha: D.fecha || "", moneda: D.moneda, conIva: !!D.conIva, ivaPct: D.conIva ? D.ivaPct : 0, cotizacion: D.moneda === "USD" ? num(D.cotizacion) || null : null, total: r2(tot), renglones: renglones.slice(0, 200), movimientos: (P.movs || []).map((m) => m.id).filter(Boolean).concat(movIds || []), fotoIds: fotoIds || [], pdf: !!S.pdf, paginas: S.pdf ? S.pdf.paginas || 0 : (S.fotos || []).length, por: yoEmail(), ts, porAsistente: true, deCargaManual: !(P.movs || []).some((m) => m.porAsistente), historial: [h] };
    const id = await window.fbAdjuntoGuardar(doc);
    LISTA.cache = null;
    if (id && S.prev) S.prev.res = [Object.assign({ id }, doc)];
    return id;
  }
