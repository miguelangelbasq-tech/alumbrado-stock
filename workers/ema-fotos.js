// Worker «ema-fotos» (Cloudflare) · Fotos, documentos y videos de la app de Alumbrado Público en Cloudflare R2 — EMA Servicios.
// v2-fotos (v155): además de las fotos, guarda PDF (docs/…) y videos (videos/…), sube por partes lo que es muy grande,
// deja adelantar el video (pedidos por rango, «Range») y contesta HEAD. Las fotos siguen exactamente como antes (v037):
//   PUT /f/fotos/AAAA/MM/<obra>/<id>.jpg  (Authorization: Bearer <token de Firebase>)  → {ok:true}
//   GET /f/fotos/…  (Authorization: Bearer … o ?t=<token>)                               → la imagen
//   GET /salud                                                                             → {ok, version, …}
//   Borrar: no se puede (405).
//
// Cómo funciona:
//  · Cada pedido (salvo /salud y OPTIONS) trae el token de Firebase de la persona. El Worker lo revisa (firma RS256 con las
//    claves públicas de Google, aud/iss «alumbrado-stock», que no esté vencido). No lee la base: no gasta lecturas de Firestore.
//  · Solo acepta claves que empiecen con fotos/, docs/ o videos/ (letras, números, _ - . y /; sin «..» ni «//»).
//  · El tipo del archivo tiene que corresponder a la carpeta y a lo que hay adentro (los primeros bytes):
//      fotos/  → image/jpeg, image/png, image/webp       (hasta 10 MB)
//      docs/   → application/pdf                          (hasta 25 MB en un PUT; por partes hasta 200 MB)
//      videos/ → video/mp4, video/webm                    (hasta 95 MB en un PUT; por partes hasta 2 GB)
//  · Nada se pisa: si la clave ya existe con el mismo tamaño contesta {ok:true, ya:true} (un reintento que ya había llegado);
//    si existe con otro tamaño, 409.
//  · Subida por partes (lo que pasa de 95 MB; partes de 5 a 95 MB, todas del mismo tamaño salvo la última):
//      POST /m/<clave>?accion=iniciar&tipo=video/mp4[&tam=<bytes>]   → {ok, key, id}
//      PUT  /m/<clave>?parte=N&id=<id>   (cuerpo = la parte N, desde 1; la 1 con su tipo en X-Tipo o Content-Type) → {ok, parte, etag}
//      POST /m/<clave>?accion=terminar&id=<id>   cuerpo {partes:[{parte, etag}…]} → {ok, key, tam}
//      POST /m/<clave>?accion=cancelar&id=<id>                                    → {ok}
//    (lo único que este Worker borra es una subida por partes terminada que se pasó del tope, antes de que nadie la use)
//  · Para ver: GET con «Range: bytes=…» contesta 206 con Content-Range (así el video se puede adelantar); HEAD da los datos
//    sin el archivo; If-None-Match → 304. Cache-Control privado (nada de cachés compartidas: la URL puede llevar el token).
//  · Errores siempre en castellano: {ok:false, error:"…"}.
//
// Lo que tiene que estar en Cloudflare (Settings › Bindings): el bucket R2 «s3fotos» ligado al Worker. El nombre de la
// ligadura puede ser cualquiera (FOTOS, BUCKET, R2…): el Worker la busca sola. No usa claves ni secretos.
// Variable opcional (Text): FOTOS_ORIGENES = otros sitios permitidos, separados por coma.
// Sin SDK ni dependencias: se pega a mano en el panel de Cloudflare.

const VERSION = "v2-fotos";

const PROYECTO = "alumbrado-stock";
const CLAVES_URL = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";
const ORIGENES = ["https://miguelangelbasq-tech.github.io", "https://localhost"];
const MB = 1024 * 1024;

// Qué se acepta en cada carpeta
const TIPOS = {
  fotos: ["image/jpeg", "image/png", "image/webp"],
  docs: ["application/pdf"],
  videos: ["video/mp4", "video/webm"],
};
const ALIAS = { "image/jpg": "image/jpeg", "image/pjpeg": "image/jpeg", "application/x-pdf": "application/pdf" };
const TOPE_PUT = { fotos: 10 * MB, docs: 25 * MB, videos: 95 * MB };     // en un solo PUT
const TOPE_TOTAL = { fotos: 10 * MB, docs: 200 * MB, videos: 2048 * MB }; // por partes
const PARTE_MIN = 5 * MB, PARTE_MAX = 95 * MB, PARTES_MAX = 10000;
const HASTA_MEMORIA = 25 * MB; // más grande que esto (con Content-Length) pasa directo a R2 sin quedar entero en memoria
const CACHE = "private, max-age=604800"; // una semana, solo en el aparato de la persona (los archivos no cambian)
const POR_EXT = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", pdf: "application/pdf", mp4: "video/mp4", webm: "video/webm" };

const enc = new TextEncoder();
const deB64u = (s) => { s = String(s).replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; const bin = atob(s), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; };
const leerJson = (s) => JSON.parse(new TextDecoder().decode(deB64u(s)));

// ---------- CORS: la app publicada en GitHub Pages y la app de Android (https://localhost)
function origenOk(origen, env) {
  if (!origen) return true; // <video src>, <img src>, abrir el enlace: el navegador no manda Origin
  const extra = String((env && env.FOTOS_ORIGENES) || "").split(",").map((s) => s.trim()).filter(Boolean);
  return ORIGENES.includes(origen) || extra.includes(origen);
}
function cabCors(origen, env) {
  const h = { "Vary": "Origin" };
  if (origen && origenOk(origen, env)) {
    h["Access-Control-Allow-Origin"] = origen;
    h["Access-Control-Allow-Methods"] = "GET, HEAD, PUT, POST, OPTIONS";
    h["Access-Control-Allow-Headers"] = "Authorization, Content-Type, Range, If-None-Match, X-Tipo";
    h["Access-Control-Expose-Headers"] = "Content-Length, Content-Range, Accept-Ranges, Content-Type, ETag";
    h["Access-Control-Max-Age"] = "86400";
  }
  return h;
}
const json = (o, s, ctx) => new Response(JSON.stringify(o), { status: s || 200, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...cabCors(ctx.origen, ctx.env) } });
const mal = (error, s, ctx, extra) => json({ ok: false, error, ...(extra || {}) }, s, ctx);

// ---------- Token de Firebase (ID token): RS256 firmado por Google (igual que en «ema-ia»)
let claves = { jwks: null, hasta: 0 };
async function clavesGoogle(ahoraMs, forzar) {
  if (!forzar && claves.jwks && claves.hasta > ahoraMs) return claves.jwks;
  const r = await fetch(CLAVES_URL);
  if (!r.ok) throw new Error("no se pudieron bajar las claves de Google (" + r.status + ")");
  const j = await r.json();
  const m = /max-age=(\d+)/.exec(r.headers.get("Cache-Control") || "");
  const seg = m ? Math.min(+m[1], 6 * 3600) : 3600;
  claves = { jwks: j.keys || [], hasta: ahoraMs + seg * 1000 };
  return claves.jwks;
}
// Devuelve el uid si el token vale; si no, null.
async function verificarToken(token) {
  try {
    const partes = String(token || "").split(".");
    if (partes.length !== 3) return null;
    const cab = leerJson(partes[0]), cue = leerJson(partes[1]);
    if (cab.alg !== "RS256" || !cab.kid) return null;
    const ahoraMs = Date.now(), ahora = Math.floor(ahoraMs / 1000), juego = 300; // 5 min de tolerancia de reloj
    if (cue.aud !== PROYECTO) return null;
    if (cue.iss !== "https://securetoken.google.com/" + PROYECTO) return null;
    if (typeof cue.sub !== "string" || !cue.sub || cue.sub.length > 128) return null;
    if (!(cue.exp > ahora - juego)) return null;
    if (!(cue.iat <= ahora + juego)) return null;
    if (cue.auth_time != null && !(cue.auth_time <= ahora + juego)) return null;
    let lista = await clavesGoogle(ahoraMs, false), jwk = lista.find((k) => k.kid === cab.kid);
    if (!jwk) { lista = await clavesGoogle(ahoraMs, true); jwk = lista.find((k) => k.kid === cab.kid); } // Google rotó las claves
    if (!jwk) return null;
    const clave = await crypto.subtle.importKey("jwk", { kty: "RSA", n: jwk.n, e: jwk.e, alg: "RS256", ext: true }, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", clave, deB64u(partes[2]), enc.encode(partes[0] + "." + partes[1]));
    return ok ? cue.sub : null;
  } catch (e) { return null; }
}
function tokenDe(request, url, permitirT) {
  const a = request.headers.get("Authorization") || "";
  const m = /^Bearer\s+(.+)$/i.exec(a);
  if (m) return m[1].trim();
  if (permitirT) return url.searchParams.get("t") || "";
  return "";
}

// ---------- El bucket: la ligadura puede tener cualquier nombre
function bucket(env) {
  if (!env) return null;
  const es = (b) => b && typeof b === "object" && typeof b.put === "function" && typeof b.get === "function" && typeof b.head === "function";
  for (const n of ["FOTOS", "BUCKET", "R2", "S3FOTOS", "s3fotos", "FOTOS_R2"]) if (es(env[n])) return { b: env[n], nombre: n };
  for (const n of Object.keys(env)) if (es(env[n])) return { b: env[n], nombre: n };
  return null;
}

// ---------- Clave (ruta del archivo en el bucket)
// Devuelve {key, carpeta} o {error}
function claveDe(resto) {
  let key;
  try { key = decodeURIComponent(resto); } catch (e) { return { error: "La dirección del archivo no es válida." }; }
  key = key.replace(/^\/+/, "");
  if (!key || key.length > 512) return { error: "La dirección del archivo no es válida." };
  if (!/^[A-Za-z0-9._\-/]+$/.test(key)) return { error: "La dirección del archivo tiene letras que no se aceptan." };
  const seg = key.split("/");
  if (seg.some((s) => !s || s === "." || s === ".." || s.startsWith("."))) return { error: "La dirección del archivo no es válida." };
  const carpeta = seg[0];
  if (!TIPOS[carpeta]) return { error: "Solo se aceptan archivos en fotos/, docs/ o videos/." };
  if (seg.length < 2) return { error: "Falta el nombre del archivo." };
  return { key, carpeta };
}
function tipoLimpio(t) {
  t = String(t || "").split(";")[0].trim().toLowerCase();
  return ALIAS[t] || t;
}
function tipoOk(carpeta, tipo) { return TIPOS[carpeta].includes(tipo); }
const textoTipos = (carpeta) => TIPOS[carpeta].join(", ");
const mb = (n) => (Math.round(n / MB * 10) / 10).toLocaleString("es-AR") + " MB";

// ---------- Que lo de adentro sea lo que dice ser (primeros bytes)
function primerosOk(tipo, u) {
  const b = (i) => u[i];
  const asc = (i, s) => { for (let k = 0; k < s.length; k++) if (u[i + k] !== s.charCodeAt(k)) return false; return true; };
  switch (tipo) {
    case "image/jpeg": return u.length >= 3 && b(0) === 0xFF && b(1) === 0xD8 && b(2) === 0xFF;
    case "image/png": return u.length >= 8 && b(0) === 0x89 && asc(1, "PNG") && b(4) === 0x0D && b(5) === 0x0A && b(6) === 0x1A && b(7) === 0x0A;
    case "image/webp": return u.length >= 12 && asc(0, "RIFF") && asc(8, "WEBP");
    case "application/pdf": { const n = Math.min(u.length, 1024) - 5; for (let i = 0; i <= n; i++) if (asc(i, "%PDF-")) return true; return false; }
    case "video/mp4": return u.length >= 12 && asc(4, "ftyp");
    case "video/webm": return u.length >= 4 && b(0) === 0x1A && b(1) === 0x45 && b(2) === 0xDF && b(3) === 0xA3;
  }
  return false;
}
const BYTES_CHEQUEO = 1024;

// Lee el cuerpo entero, cortando si pasa del tope. Devuelve Uint8Array, o null si se pasó.
async function leerHasta(body, tope) {
  if (!body) return new Uint8Array(0);
  const rd = body.getReader(), trozos = [];
  let total = 0;
  for (;;) {
    const { done, value } = await rd.read();
    if (done) break;
    total += value.byteLength;
    if (total > tope) { try { await rd.cancel(); } catch (e) { } return null; }
    trozos.push(value);
  }
  const u = new Uint8Array(total); let p = 0;
  for (const t of trozos) { u.set(t, p); p += t.byteLength; }
  return u;
}

// Prepara el cuerpo para R2. Chico: entero en memoria. Grande con Content-Length: pasa directo (FixedLengthStream).
// Devuelve {cuerpo, tam, bomba?} o {error, s}
async function cuerpoParaR2(request, tope, tipo, chequear) {
  const cl = request.headers.get("Content-Length");
  const largo = cl != null && /^\d+$/.test(cl) ? parseInt(cl, 10) : null;
  if (largo != null && largo > tope) return { error: "El archivo pesa " + mb(largo) + " y el tope es " + mb(tope) + ".", s: 413 };
  if (largo === 0) return { error: "El archivo llegó vacío.", s: 400 };
  if (largo != null && largo > HASTA_MEMORIA && request.body && typeof FixedLengthStream === "function") {
    const rd = request.body.getReader(), primeros = [];
    let n = 0;
    while (n < BYTES_CHEQUEO) { const { done, value } = await rd.read(); if (done) break; primeros.push(value); n += value.byteLength; }
    if (chequear) {
      const u = new Uint8Array(n); let p = 0; for (const t of primeros) { u.set(t, p); p += t.byteLength; }
      if (!primerosOk(tipo, u)) { try { await rd.cancel(); } catch (e) { } return { error: "Lo que llegó no es un archivo " + tipo + ".", s: 415 }; }
    }
    const fls = new FixedLengthStream(largo), w = fls.writable.getWriter();
    const bomba = (async () => {
      try {
        for (const t of primeros) await w.write(t);
        for (;;) { const { done, value } = await rd.read(); if (done) break; await w.write(value); }
        await w.close();
      } catch (e) { try { await w.abort(e); } catch (e2) { } throw e; }
    })();
    return { cuerpo: fls.readable, tam: largo, bomba };
  }
  const u = await leerHasta(request.body, tope);
  if (u === null) return { error: "El archivo pasa el tope de " + mb(tope) + ".", s: 413 };
  if (!u.byteLength) return { error: "El archivo llegó vacío.", s: 400 };
  if (chequear && !primerosOk(tipo, u)) return { error: "Lo que llegó no es un archivo " + tipo + ".", s: 415 };
  return { cuerpo: u, tam: u.byteLength };
}
async function aR2(promesa, prep) {
  if (!prep.bomba) return await promesa;
  const [r] = await Promise.all([promesa, prep.bomba]);
  return r;
}

// ---------- Rango (para adelantar el video). Devuelve null (sin rango / no se entiende: archivo entero),
// {offset, length} o {fuera:true} (416).
function rangoDe(h, tam) {
  if (!h) return null;
  const m = /^bytes=\s*(\d*)\s*-\s*(\d*)\s*$/i.exec(h.trim());
  if (!m || (m[1] === "" && m[2] === "")) return null; // varios rangos o algo raro: va el archivo entero
  let ini, fin;
  if (m[1] === "") { const suf = parseInt(m[2], 10); if (!(suf > 0)) return { fuera: true }; ini = Math.max(0, tam - suf); fin = tam - 1; }
  else { ini = parseInt(m[1], 10); fin = m[2] === "" ? tam - 1 : Math.min(parseInt(m[2], 10), tam - 1); }
  if (ini >= tam || fin < ini) return { fuera: true };
  return { offset: ini, length: fin - ini + 1 };
}
function cabArchivo(obj, key, ctx) {
  const tipo = (obj.httpMetadata && obj.httpMetadata.contentType) || POR_EXT[(key.split(".").pop() || "").toLowerCase()] || "application/octet-stream";
  const h = { "Content-Type": tipo, "Cache-Control": CACHE, "Accept-Ranges": "bytes", "X-Content-Type-Options": "nosniff", ...cabCors(ctx.origen, ctx.env) };
  if (obj.httpEtag) h["ETag"] = obj.httpEtag;
  if (tipo === "application/pdf") h["Content-Disposition"] = 'inline; filename="' + key.split("/").pop() + '"';
  return h;
}

// ---------- Rutas
async function archivo(request, url, ctx, resto) {
  const metodo = request.method;
  if (!["GET", "HEAD", "PUT"].includes(metodo)) return mal("No se puede " + (metodo === "DELETE" ? "borrar" : "hacer eso") + " desde acá.", 405, ctx);
  const c = claveDe(resto);
  if (c.error) return mal(c.error, 400, ctx);
  const uid = await verificarToken(tokenDe(request, url, metodo !== "PUT"));
  if (!uid) return mal("Tu sesión no es válida: cerrá y volvé a entrar a la app.", 401, ctx);
  const B = ctx.B;

  if (metodo === "PUT") {
    const tipo = tipoLimpio(request.headers.get("Content-Type"));
    if (!tipoOk(c.carpeta, tipo)) return mal("En " + c.carpeta + "/ solo van archivos " + textoTipos(c.carpeta) + " (llegó «" + (tipo || "sin tipo") + "»).", 415, ctx);
    const prep = await cuerpoParaR2(request, TOPE_PUT[c.carpeta], tipo, true);
    if (prep.error) return mal(prep.error + (prep.s === 413 && c.carpeta !== "fotos" ? " Para algo más grande, subilo por partes." : ""), prep.s, ctx);
    const ya = await B.head(c.key);
    if (ya) {
      if (prep.bomba) { try { prep.cuerpo.cancel(); } catch (e) { } prep.bomba.catch(() => { }); }
      if (ya.size === prep.tam) return json({ ok: true, key: c.key, tam: ya.size, ya: true }, 200, ctx);
      return mal("Ya hay otro archivo con ese nombre.", 409, ctx);
    }
    try {
      await aR2(B.put(c.key, prep.cuerpo, { httpMetadata: { contentType: tipo, cacheControl: CACHE }, customMetadata: { uid, subido: new Date().toISOString() } }), prep);
    } catch (e) { return mal("No se pudo guardar el archivo en la nube. Probá de nuevo en un rato.", 502, ctx); }
    return json({ ok: true, key: c.key, tam: prep.tam }, 200, ctx);
  }

  // GET / HEAD
  const rangoH = request.headers.get("Range");
  const cab0 = await B.head(c.key);
  if (!cab0) return mal("No existe ese archivo.", 404, ctx);
  const tam = cab0.size;
  const h = cabArchivo(cab0, c.key, ctx);
  const inm = request.headers.get("If-None-Match");
  if (inm && cab0.httpEtag && inm.split(",").map((s) => s.trim()).includes(cab0.httpEtag)) return new Response(null, { status: 304, headers: h });
  const rg = rangoDe(rangoH, tam);
  if (rg && rg.fuera) return new Response(JSON.stringify({ ok: false, error: "Ese pedazo del archivo no existe." }), { status: 416, headers: { ...h, "Content-Type": "application/json; charset=utf-8", "Content-Range": "bytes */" + tam } });
  if (rg) {
    h["Content-Range"] = "bytes " + rg.offset + "-" + (rg.offset + rg.length - 1) + "/" + tam;
    h["Content-Length"] = String(rg.length);
    if (metodo === "HEAD") return new Response(null, { status: 206, headers: h });
    const obj = await B.get(c.key, { range: { offset: rg.offset, length: rg.length } });
    if (!obj) return mal("No existe ese archivo.", 404, ctx);
    return new Response(obj.body, { status: 206, headers: h });
  }
  h["Content-Length"] = String(tam);
  if (metodo === "HEAD") return new Response(null, { status: 200, headers: h });
  const obj = await B.get(c.key);
  if (!obj) return mal("No existe ese archivo.", 404, ctx);
  return new Response(obj.body, { status: 200, headers: h });
}

async function porPartes(request, url, ctx, resto) {
  const metodo = request.method;
  if (!["POST", "PUT"].includes(metodo)) return mal("No se puede " + (metodo === "DELETE" ? "borrar" : "hacer eso") + " desde acá.", 405, ctx);
  const c = claveDe(resto);
  if (c.error) return mal(c.error, 400, ctx);
  const uid = await verificarToken(tokenDe(request, url, false));
  if (!uid) return mal("Tu sesión no es válida: cerrá y volvé a entrar a la app.", 401, ctx);
  const B = ctx.B;
  if (typeof B.createMultipartUpload !== "function") return mal("La nube no permite subir por partes.", 501, ctx);
  const q = url.searchParams, id = q.get("id") || "";

  if (metodo === "PUT") {
    const n = parseInt(q.get("parte") || "", 10);
    if (!(n >= 1 && n <= PARTES_MAX) || String(n) !== q.get("parte")) return mal("Falta el número de parte (de 1 a " + PARTES_MAX + ").", 400, ctx);
    if (!id) return mal("Falta el id de la subida.", 400, ctx);
    const tipo = tipoLimpio(request.headers.get("X-Tipo") || q.get("tipo") || request.headers.get("Content-Type") || "");
    const chequear = n === 1;
    if (chequear && !tipoOk(c.carpeta, tipo)) return mal("En la parte 1 falta el tipo del archivo (" + textoTipos(c.carpeta) + ").", 415, ctx);
    const prep = await cuerpoParaR2(request, PARTE_MAX, tipo, chequear);
    if (prep.error) return mal(prep.error.replace("El archivo", "La parte"), prep.s, ctx);
    try {
      const sub = B.resumeMultipartUpload(c.key, id);
      const p = await aR2(sub.uploadPart(n, prep.cuerpo), prep);
      return json({ ok: true, parte: p.partNumber || n, etag: p.etag }, 200, ctx);
    } catch (e) { return mal("No se pudo guardar la parte " + n + ". Probá de nuevo (si sigue, empezá la subida otra vez).", 502, ctx); }
  }

  const accion = q.get("accion") || "";
  if (accion === "iniciar") {
    const tipo = tipoLimpio(q.get("tipo") || request.headers.get("X-Tipo") || request.headers.get("Content-Type"));
    if (!tipoOk(c.carpeta, tipo)) return mal("En " + c.carpeta + "/ solo van archivos " + textoTipos(c.carpeta) + ".", 415, ctx);
    const tamQ = q.get("tam");
    if (tamQ != null && tamQ !== "") { const t = Number(tamQ); if (!(t > 0) || t > TOPE_TOTAL[c.carpeta]) return mal("El archivo pesa " + mb(t || 0) + " y el tope es " + mb(TOPE_TOTAL[c.carpeta]) + ".", 413, ctx); }
    if (await B.head(c.key)) return mal("Ya hay otro archivo con ese nombre.", 409, ctx);
    try {
      const s = await B.createMultipartUpload(c.key, { httpMetadata: { contentType: tipo, cacheControl: CACHE }, customMetadata: { uid, subido: new Date().toISOString() } });
      return json({ ok: true, key: c.key, id: s.uploadId, parteMin: PARTE_MIN, parteMax: PARTE_MAX, tope: TOPE_TOTAL[c.carpeta] }, 200, ctx);
    } catch (e) { return mal("No se pudo empezar la subida. Probá de nuevo en un rato.", 502, ctx); }
  }
  if (accion === "terminar") {
    if (!id) return mal("Falta el id de la subida.", 400, ctx);
    let cuerpo = null; try { cuerpo = await request.json(); } catch (e) { }
    const lista = cuerpo && Array.isArray(cuerpo.partes) ? cuerpo.partes : null;
    if (!lista || !lista.length || lista.length > PARTES_MAX) return mal("Faltan las partes (lista de {parte, etag}).", 400, ctx);
    const partes = [];
    for (const p of lista) {
      const n = Number(p && (p.parte != null ? p.parte : p.partNumber)), et = p && p.etag;
      if (!(Number.isInteger(n) && n >= 1 && n <= PARTES_MAX) || typeof et !== "string" || !et) return mal("Hay una parte mal anotada.", 400, ctx);
      partes.push({ partNumber: n, etag: et });
    }
    partes.sort((a, b) => a.partNumber - b.partNumber);
    let obj;
    try { obj = await B.resumeMultipartUpload(c.key, id).complete(partes); }
    catch (e) { return mal("No se pudieron juntar las partes (falta alguna o alguna no llegó bien). Empezá la subida otra vez.", 400, ctx); }
    const tam = obj && obj.size;
    if (tam > TOPE_TOTAL[c.carpeta]) { try { await B.delete(c.key); } catch (e) { } return mal("El archivo pesa " + mb(tam) + " y el tope es " + mb(TOPE_TOTAL[c.carpeta]) + ".", 413, ctx); }
    return json({ ok: true, key: c.key, tam }, 200, ctx);
  }
  if (accion === "cancelar") {
    if (!id) return mal("Falta el id de la subida.", 400, ctx);
    try { await B.resumeMultipartUpload(c.key, id).abort(); } catch (e) { }
    return json({ ok: true }, 200, ctx);
  }
  return mal("Falta la acción (iniciar, terminar o cancelar).", 400, ctx);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origen = request.headers.get("Origin") || "";
    const ctx = { origen, env, B: null };
    if (request.method === "OPTIONS") {
      if (!origenOk(origen, env) || !origen) return new Response(null, { status: 403, headers: { "Vary": "Origin" } });
      return new Response(null, { status: 204, headers: cabCors(origen, env) });
    }
    if (!origenOk(origen, env)) return mal("Este sitio no puede usar el servidor de fotos.", 403, ctx);
    const r2 = bucket(env);
    const ruta = url.pathname;
    if (ruta === "/salud" || ruta === "/salud/") {
      const tipos = [].concat(TIPOS.fotos, TIPOS.docs, TIPOS.videos);
      const o = { ok: !!r2, version: VERSION, tipos, multipart: !!(r2 && typeof r2.b.createMultipartUpload === "function"), rango: true,
        topes: { fotos: TOPE_PUT.fotos, docs: TOPE_PUT.docs, videos: TOPE_PUT.videos }, topesPartes: TOPE_TOTAL, r2: !!r2, enlace: r2 ? r2.nombre : null };
      if (!r2) o.error = "El Worker no tiene ligado el bucket R2 (Settings › Bindings).";
      return json(o, r2 ? 200 : 503, ctx);
    }
    const esF = ruta.startsWith("/f/"), esM = ruta.startsWith("/m/");
    if (!esF && !esM) return mal("No existe esa dirección.", 404, ctx);
    if (!r2) return mal("El servidor de fotos no tiene la nube conectada.", 503, ctx);
    ctx.B = r2.b;
    try {
      return esF ? await archivo(request, url, ctx, ruta.slice(3)) : await porPartes(request, url, ctx, ruta.slice(3));
    } catch (e) {
      return mal("Algo falló en el servidor de fotos. Probá de nuevo en un rato.", 500, ctx);
    }
  },
};

export { claveDe, rangoDe, primerosOk, VERSION };
