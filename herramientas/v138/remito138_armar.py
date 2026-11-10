# Arma remito138.html desde el remito.html de la v137 (reemplazos exactos que cortan si no calzan).
import sys
src, sal = sys.argv[1], sys.argv[2]
t = open(src, encoding='utf-8').read()
def R(a, b, n=1):
    global t
    c = t.count(a); assert c == n, (a[:100], c); t = t.replace(a, b)

# --- CSS: resumen arriba, páginas, botón pegado abajo
R('@media (max-width:640px){.rf-datos{grid-template-columns:1fr}', '''.rf-sum{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:0 0 12px;padding:10px 12px;border-radius:16px;background:#fff;border:1.5px solid var(--border,rgba(40,40,94,.12));font:700 14px var(--fuente,inherit);color:var(--navy,#28285E)}
.rf-sum span{font:700 12.5px var(--mono,monospace);padding:3px 9px;border-radius:999px;background:var(--bg-soft,rgba(40,40,94,.05));color:var(--text-soft,#4B5670)}
.rf-sum span.v{background:#e3f6ec;color:#11683f}.rf-sum span.a{background:#fff3e0;color:#7a4300}.rf-sum span.r{background:#ffe9e7;color:#9b1c13}
.rf-pags{display:flex;gap:6px;flex:none}
.rf-pags img{width:52px;height:64px}
.rf-pdf{width:52px;height:64px;flex:none;border-radius:12px;border:1px solid var(--border,rgba(40,40,94,.12));background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;font:800 11px var(--mono,monospace);color:#9b1c13}
.rf-pdf b{font-size:22px;line-height:1}
.rf-ayuda{font-size:12.5px;color:var(--text-3,#7C879D);margin:8px 2px 0}
.rf-pie{position:-webkit-sticky;position:sticky;bottom:0;z-index:2;margin:12px -16px 0;padding:10px 16px 4px;background:var(--bg,#ECEFF7);box-shadow:0 -10px 18px -12px rgba(13,20,36,.35)}
.rf-pie .rf-res{margin:0 0 8px}
.rf-pie .v7-acc{margin-top:0}
@media (max-width:640px){.rf-datos{grid-template-columns:1fr}''')

R('''  //    adjuntos (fotoId en cada renglón) y auditoría «remito_ia» con porAsistente:true.''', '''  //    adjuntos (fotoId en cada renglón) y auditoría «remito_ia» con porAsistente:true.
  //  · v138: también un PDF (bloque «document», hasta 3,5 MB y 20 páginas: el Worker acepta pedidos de hasta 5 MB) y
  //    varias fotos de un mismo remito (hasta 4 páginas) en un solo pedido → una sola tarjeta con todos los renglones.
  //    Con muchos renglones: hasta 16.000 tokens con Opus/Fable, resumen arriba («20 renglones · 17 🟢 · 2 🟡 · 1 🔴»)
  //    y «Sí, cargar entrada» pegado abajo, siempre a la vista.''')

R('''    "Tu único trabajo es TRANSCRIBIR lo que está escrito.''', '''    "Te pueden mandar una foto, varias fotos (páginas del MISMO remito, en orden) o un PDF: juntá los renglones de todas las páginas en un solo JSON, en el orden del documento, sin repetir encabezados ni subtotales.",
    "Tu único trabajo es TRANSCRIBIR lo que está escrito.''')

# --- pedido: partes (imágenes y/o PDF) y tokens suficientes
R('''  async function pedirIa(b64, modelo) {''', '''  const PDF_MAX = 3.5 * 1024 * 1024, PDF_PAGS = 20, FOTOS_MAX = 4;
  function partesDe(x) {   // string (una foto, como la v137) o { fotos: [{dataUrl}], pdf: {b64} }
    if (typeof x == "string") return [{ type: "image", source: { type: "base64", media_type: "image/jpeg", data: x } }];
    const l = [];
    if (x.pdf) l.push({ type: "document", source: { type: "base64", media_type: "application/pdf", data: x.pdf.b64 } });
    (x.fotos || []).forEach((f) => l.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: f.dataUrl.split(",")[1] } }));
    return l;
  }
  async function pedirIa(b64, modelo) {''')
R('''      model: modelo, max_tokens: modelo === SONNET ? 4000 : 8000,''', '''      model: modelo, max_tokens: modelo === SONNET ? 4000 : 16000,   // v138: remitos largos (20–40 renglones) sin cortarse''')
R('''      messages: [{ role: "user", content: [{ type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64 } }, { type: "text", text: "Transcribí este remito o factura en el JSON pedido." }] }],''',
  '''      messages: [{ role: "user", content: partesDe(b64).concat([{ type: "text", text: partesDe(b64).length > 1 ? `Transcribí este remito o factura (${partesDe(b64).length} páginas del mismo documento) en un solo JSON.` : "Transcribí este remito o factura en el JSON pedido." }]) }],''')
R('''    if (j && j.stop_reason === "refusal") return { legible: false, motivo: "La IA no quiso leer esta foto." };''',
  '''    if (j && j.stop_reason === "refusal") return { legible: false, motivo: "La IA no quiso leer esta foto." };
    if (j && j.stop_reason === "max_tokens") return { legible: false, motivo: "El remito es muy largo para leerlo de una vez: mandalo en partes (de a 2 páginas)." };''')

# --- la hoja: elegir fotos o PDF
R('''<div class="rf-elegir">${cam ? '<label data-rf="camara"><span>📷</span>Sacar foto</label>' : '<label><span>📷</span>Sacar foto<input type="file" accept="image/*" capture="environment" id="rfFotoCam"></label>'}<label><span>🖼</span>Elegir de la galería<input type="file" accept="image/*" id="rfFotoGal"></label></div>''',
  '''<div class="rf-elegir">${cam ? '<label data-rf="camara"><span>📷</span>Sacar foto</label>' : '<label><span>📷</span>Sacar foto<input type="file" accept="image/*" capture="environment" id="rfFotoCam"></label>'}<label><span>🖼</span>Elegir fotos o PDF<input type="file" accept="image/*,application/pdf" multiple id="rfFotoGal"></label></div>
<p class="rf-ayuda">¿El remito tiene varias páginas? Elegí las fotos juntas (hasta ${FOTOS_MAX}) o el PDF que te mandaron por mail o WhatsApp.</p>''')

R('''  async function conArchivo(f) {
    if (!f) return;
    let foto = null;''', '''  const esPdf = (f) => !!f && (/pdf/i.test(f.type || "") || /\\.pdf$/i.test(f.name || ""));
  const msgElegir = (t) => { const m = $("rfMsg"); if (m) { m.className = "v7-msg mal"; m.textContent = t; } else error(t, false, true); };
  function leerB64(f) { return new Promise((ok, mal) => { const r = new FileReader(); r.onload = () => ok(String(r.result || "").split(",")[1] || ""); r.onerror = () => mal(r.error); r.readAsDataURL(f); }); }
  function leerTexto(f) { return new Promise((ok) => { try { const r = new FileReader(); r.onload = () => ok(String(r.result || "")); r.onerror = () => ok(""); r.readAsBinaryString(f); } catch (e) { ok(""); } }); }
  async function paginasPdf(f) { const s = await leerTexto(f); const m = s.match(/\\/Type\\s*\\/Page(?![a-zA-Z])/g); return m ? m.length : 0; }
  // v138: una o varias fotos del mismo remito, o un PDF → un solo pedido y una sola tarjeta
  async function conArchivos(lista) {
    const fs = [].slice.call(lista || []).filter(Boolean); if (!fs.length) return;
    const pdfs = fs.filter(esPdf), imgs = fs.filter((f) => !esPdf(f));
    if (pdfs.length > 1 || (pdfs.length && imgs.length)) return msgElegir("Elegí un solo PDF, o solo fotos: no los dos juntos.");
    if (imgs.length > FOTOS_MAX) return msgElegir(`Hasta ${FOTOS_MAX} fotos por remito. Si tiene más páginas, mandá el PDF o cargalo en partes.`);
    let pdf = null; const fotos = [];
    if (pdfs.length) {
      const f = pdfs[0];
      if (f.size > PDF_MAX) return msgElegir(`El PDF pesa ${nf(f.size / 1048576, 1)} MB: es mucho para leerlo de una vez (hasta 3,5 MB). Mandalo en partes.`);
      const pags = await paginasPdf(f);
      if (pags > PDF_PAGS) return msgElegir(`El PDF tiene ${pags} páginas: es mucho para leerlo de una vez (hasta ${PDF_PAGS}). Mandalo en partes.`);
      try { pdf = { b64: await leerB64(f), nombre: f.name || "remito.pdf", bytes: f.size, paginas: pags }; } catch (e) { return msgElegir("No se pudo leer el PDF: probá con otro."); }
    } else {
      for (const f of imgs) { try { fotos.push(await comprimirImagen(f, 1600, 700 * 1024)); } catch (e) { return msgElegir("No se pudo leer una de las imágenes: probá con otra."); } }
    }
    const foto = fotos[0] || null, ref = {};
    S = { estado: "leyendo", foto, fotos, pdf, ref };
    hoja(`<div class="rf-foto">${miniaturas()}<div class="rf-cargando"><span class="rf-spin"></span>Leyendo el remito${pdf ? " (PDF" + (pdf.paginas ? ", " + pdf.paginas + " pág." : "") + ")" : fotos.length > 1 ? " (" + fotos.length + " páginas)" : ""}… puede tardar un minuto.</div></div>`);
    let res = null;
    try { res = interpretar(await pedirIa(pdf || fotos.length > 1 ? { fotos, pdf } : foto.dataUrl.split(",")[1], modelo())); }
    catch (e) { if (S && S.ref === ref) error(e.message || String(e), e.tipo === "red" || e.tipo === "worker"); return; }
    if (!S || S.ref !== ref) return;
    if (!res.legible) return error(`No se lee bien el remito: ${res.motivo}${pdf ? "" : " Sacá otra foto con buena luz, de frente y que entre entero."}`, false, true);
    armar(res);
  }
  function miniaturas() {
    if (!S) return "";
    if (S.pdf) return `<div class="rf-pdf" title="${esc(S.pdf.nombre)}"><b>📄</b>PDF</div>`;
    const l = S.fotos && S.fotos.length ? S.fotos : S.foto ? [S.foto] : [];
    return l.length > 1 ? `<div class="rf-pags">${l.map((f, k) => `<img src="${f.dataUrl}" alt="Página ${k + 1} del remito">`).join("")}</div>` : l.length ? `<img src="${l[0].dataUrl}" alt="Foto del remito">` : "";
  }
  async function conArchivo(f) {
    if (!f) return;
    if (esPdf(f)) return conArchivos([f]);
    let foto = null;''')
R('''    S = { estado: "leyendo", foto };
    hoja(''', '''    S = { estado: "leyendo", foto, fotos: [foto] };
    hoja(''')
R('''    hoja(`${S && S.foto ? `<div class="rf-foto"><img src="${S.foto.dataUrl}" alt="Foto del remito"><p>${esc(txt)}</p></div>` : `<p class="v7-txt">${esc(txt)}</p>`}
<div class="v7-acc"><button type="button" class="btn-primary" data-rf="otra">📷 Sacar otra foto</button>''',
  '''    hoja(`${S && (S.foto || S.pdf) ? `<div class="rf-foto">${miniaturas()}<p>${esc(txt)}</p></div>` : `<p class="v7-txt">${esc(txt)}</p>`}
<div class="v7-acc"><button type="button" class="btn-primary" data-rf="otra">${S && S.pdf ? "📄 Elegir otro archivo" : "📷 Sacar otra foto"}</button>''')
R('''    S = { estado: "tarjeta", foto: S.foto, datos:''', '''    S = { estado: "tarjeta", foto: S.foto, fotos: S.fotos || (S.foto ? [S.foto] : []), pdf: S.pdf || null, datos:''')

# --- tarjeta: resumen arriba y botón pegado abajo
R('''  function pintar() {
    const D = S.datos;
    hoja(`<div class="rf-foto"><img src="${S.foto.dataUrl}" alt="Foto del remito"><p>Revisá''', '''  function sumario() {
    const n = { v: 0, a: 0, r: 0 };
    S.filas.forEach((x) => { const p = x.cod !== "" ? prodDe(x.cod) : null; const gr = x.fuera && !p ? "r" : x.grado === "r" && p ? "a" : x.grado; n[gr] = (n[gr] || 0) + 1; });
    return `<b>${S.filas.length} ${S.filas.length === 1 ? "renglón" : "renglones"}</b><span class="v">${n.v} 🟢</span><span class="a">${n.a} 🟡</span><span class="r">${n.r} 🔴</span>${S.pdf ? `<span>📄 PDF${S.pdf.paginas ? " · " + S.pdf.paginas + " pág." : ""}</span>` : S.fotos && S.fotos.length > 1 ? `<span>${S.fotos.length} páginas</span>` : ""}`;
  }
  function pintar() {
    const D = S.datos;
    hoja(`<div class="rf-sum" id="rfSum">${sumario()}</div><div class="rf-foto">${miniaturas()}<p>Revisá''')
R('''<div class="rf-res" id="rfRes">${resumen()}</div>
<div class="v7-acc"><button type="button" class="btn-primary" data-rf="si">Sí, cargar entrada</button><button type="button" class="btn-ghost" data-rf="no">No</button></div>
<div class="v7-msg" id="rfMsg"></div>`);''', '''<div class="rf-pie" id="rfPie"><div class="rf-res" id="rfRes">${resumen()}</div>
<div class="v7-acc"><button type="button" class="btn-primary" data-rf="si">Sí, cargar entrada</button><button type="button" class="btn-ghost" data-rf="no">No</button></div>
<div class="v7-msg" id="rfMsg"></div></div>`);''')
R('''    const r = $("rfRes"); r && (r.innerHTML = resumen());
  }''', '''    const r = $("rfRes"); r && (r.innerHTML = resumen());
    const s = $("rfSum"); s && (s.innerHTML = sumario());
  }''')

R('''    if (t.id === "rfFotoCam" || t.id === "rfFotoGal") { const f = t.files && t.files[0]; t.value = ""; f && conArchivo(f); return; }''',
  '''    if (t.id === "rfFotoCam" || t.id === "rfFotoGal") { const l = t.files ? [].slice.call(t.files) : []; t.value = ""; if (l.length > 1 || (l[0] && esPdf(l[0]))) conArchivos(l); else if (l[0]) conArchivo(l[0]); return; }''')

# --- guardar: la primera foto como fotoId, las demás en fotoIds; el PDF si entra en la base
R('''    let fotoId = "";
    try {
      if (typeof window.fbAdjuntoGuardar == "function") fotoId = await window.fbAdjuntoGuardar({ tipo: "remito", remito: D.numero || "", proveedor: D.proveedor || "", fecha: D.fecha, dataUrl: S.foto.dataUrl, w: S.foto.w, h: S.foto.h, bytes: S.foto.bytes, nombre: "remito.jpg", ts: Date.now(), usuario: yoEmail(), porAsistente: true }) || "";
    } catch (e) { console.warn("[remito] foto:", e); fotoId = ""; }''', '''    let fotoId = ""; const fotoIds = []; let pdfGuardado = null;
    const fotosG = S.fotos && S.fotos.length ? S.fotos : S.foto ? [S.foto] : [];
    for (let k = 0; k < fotosG.length; k++) {
      const f = fotosG[k];
      try {
        if (typeof window.fbAdjuntoGuardar == "function") { const id = await window.fbAdjuntoGuardar({ tipo: "remito", remito: D.numero || "", proveedor: D.proveedor || "", fecha: D.fecha, dataUrl: f.dataUrl, w: f.w, h: f.h, bytes: f.bytes, nombre: fotosG.length > 1 ? "remito_p" + (k + 1) + ".jpg" : "remito.jpg", pagina: fotosG.length > 1 ? k + 1 : undefined, ts: Date.now(), usuario: yoEmail(), porAsistente: true }) || ""; if (id) fotoIds.push(id); }
      } catch (e) { console.warn("[remito] foto:", e); }
    }
    if (S.pdf) {   // v138: el PDF va a la base solo si entra en un documento (≈ 650 KB); si no, queda en el mail / WhatsApp
      pdfGuardado = false;
      if (S.pdf.bytes <= 650 * 1024 && typeof window.fbAdjuntoGuardar == "function") {
        try { const id = await window.fbAdjuntoGuardar({ tipo: "remito", remito: D.numero || "", proveedor: D.proveedor || "", fecha: D.fecha, dataUrl: "data:application/pdf;base64," + S.pdf.b64, bytes: S.pdf.bytes, nombre: S.pdf.nombre || "remito.pdf", mime: "application/pdf", ts: Date.now(), usuario: yoEmail(), porAsistente: true }) || ""; if (id) { fotoIds.push(id); pdfGuardado = true; } } catch (e) { console.warn("[remito] pdf:", e); }
      }
    }
    fotoId = fotoIds[0] || "";''')
R('''      if (fotoId) mov.fotoId = fotoId;''', '''      if (fotoId) mov.fotoId = fotoId;
      if (fotoIds.length > 1) mov.fotoIds = fotoIds.slice();''')
R('''movIds: ids, fotoId: fotoId || "",''', '''movIds: ids, fotoId: fotoId || "", fotoIds, pdf: !!S.pdf, paginas: S.pdf ? S.pdf.paginas || 0 : fotosG.length,''')
R('''    hoja(`<div class="rf-foto"><img src="${S.foto.dataUrl}" alt="Foto del remito"><p class="v7-msg bien" style="margin:0;">✓ Entrada cargada: ${ids.length} ${ids.length === 1 ? "renglón" : "renglones"}${nums.length ? " (" + esc(nums.join(", ")) + ")" : ""}${fotoId ? " · con la foto del remito" : " · ⚠ la foto no se pudo guardar"}.</p></div>''',
  '''    hoja(`<div class="rf-foto">${miniaturas()}<p class="v7-msg bien" style="margin:0;">✓ Entrada cargada: ${ids.length} ${ids.length === 1 ? "renglón" : "renglones"}${nums.length ? " (" + esc(nums.join(", ")) + ")" : ""}${S.pdf ? (pdfGuardado ? " · con el PDF del remito" : " · el PDF pesa mucho para guardarlo en la app: queda en tu mail o WhatsApp") : fotoId ? (fotoIds.length > 1 ? " · con las " + fotoIds.length + " fotos del remito" : " · con la foto del remito") : " · ⚠ la foto no se pudo guardar"}.</p></div>''')
R('''  window.__remitoFoto = { abrir, cerrar, conArchivo, interpretar,''', '''  window.__remitoFoto = { abrir, cerrar, conArchivo, conArchivos, partesDe, interpretar,''')
open(sal, 'w', encoding='utf-8').write(t); print('ok remito138', len(t))
