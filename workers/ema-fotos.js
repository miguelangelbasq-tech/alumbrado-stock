// Worker «ema-fotos» (Cloudflare) · Fotos, documentos y videos de la app de Alumbrado Público en Cloudflare R2 — EMA Servicios.
// v2-fotos (v160): además de las fotos, guarda PDF (docs/…) y videos (videos/…), sube por partes lo que es muy grande,
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
// Cómo llega al bucket (una de dos; si están las dos, usa la ligadura):
//  a) Ligadura (Settings › Bindings): el bucket R2 «s3fotos» ligado al Worker. El nombre puede ser cualquiera (FOTOS,
//     BUCKET, R2…): el Worker la busca sola.
//  b) Sin ligadura (cuenta sin la suscripción de R2 en el panel), como el Worker v1: por la API compatible con S3, con
//     4 Secrets que ya están cargados en Cloudflare: R2_BUCKET, R2_ENDPOINT, R2_KEY_ID, R2_SECRET. Firma cada pedido
//     (AWS SigV4, región «auto», servicio «s3») con Web Crypto. Los valores nunca se muestran ni se devuelven.
//     R2_ENDPOINT puede venir con o sin «https://», con barra al final o con el bucket ya puesto.
// Variable opcional (Text): FOTOS_ORIGENES = otros sitios permitidos, separados por coma.
// Sin SDK ni dependencias: se pega a mano en el panel de Cloudflare.

const VERSION = "v2-fotos"; // la app reconoce /^v2…-fotos/: no cambiar el formato

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

// ---------- El bucket: la ligadura (cualquier nombre) o, si no hay, la API S3 con los 4 Secrets
function bucket(env) {
  if (!env) return null;
  const es = (b) => b && typeof b === "object" && typeof b.put === "function" && typeof b.get === "function" && typeof b.head === "function";
  for (const n of ["FOTOS", "BUCKET", "R2", "S3FOTOS", "s3fotos", "FOTOS_R2"]) if (es(env[n])) return { b: env[n], nombre: n };
  for (const n of Object.keys(env)) if (es(env[n])) return { b: env[n], nombre: n };
  const cfg = s3Conf(env);
  if (cfg) return { b: s3Bucket(cfg), nombre: "s3", s3: cfg };
  return null;
}

// ---------- API S3 de R2 (sin ligadura). Arma un objeto con la misma forma que la ligadura (head, get, put, delete,
// createMultipartUpload, resumeMultipartUpload), así el resto del Worker no cambia.
const limpioS = (v) => String(v == null ? "" : v).trim();
let s3Cache = { k: "", cfg: null };
function s3Conf(env) {
  const id = limpioS(env.R2_KEY_ID), sec = limpioS(env.R2_SECRET), ep = limpioS(env.R2_ENDPOINT);
  if (!id || !sec || !ep) return null;
  const k = ep + "|" + limpioS(env.R2_BUCKET) + "|" + id.length + "|" + sec.length;
  if (s3Cache.k === k && s3Cache.cfg && s3Cache.cfg.id === id && s3Cache.cfg.sec === sec) return s3Cache.cfg;
  let u;
  try { u = new URL(/^https?:\/\//i.test(ep) ? ep : "https://" + ep); } catch (e) { return null; }
  let bkt = limpioS(env.R2_BUCKET).replace(/^\/+|\/+$/g, "");
  const camino = u.pathname.replace(/^\/+|\/+$/g, "");
  if (!bkt && camino) bkt = camino.split("/")[0];          // el bucket venía en el endpoint
  let host = u.host;
  if (bkt && host.toLowerCase().startsWith(bkt.toLowerCase() + ".") && /\.r2\.cloudflarestorage\.com$/i.test(u.hostname)) host = host.slice(bkt.length + 1); // «bucket.cuenta.r2…» → ruta
  if (!bkt || !host) return null;
  const cfg = { base: u.protocol + "//" + host, host, bucket: bkt, id, sec };
  s3Cache = { k, cfg };
  return cfg;
}
const hexDe = (u) => Array.from(u, (b) => b.toString(16).padStart(2, "0")).join("");
async function sha256Hex(datos) { return hexDe(new Uint8Array(await crypto.subtle.digest("SHA-256", typeof datos === "string" ? enc.encode(datos) : datos))); }
async function hmacS(clave, texto) {
  const k = await crypto.subtle.importKey("raw", typeof clave === "string" ? enc.encode(clave) : clave, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", k, enc.encode(texto)));
}
const uriS3 = (s) => encodeURIComponent(s).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
const VACIO_SHA = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
let firmaCache = { dia: "", sec: "", k: null };
// Firma SigV4. Devuelve {url, headers} (sin «host»: lo pone fetch con la URL).
async function firmarS3(cfg, metodo, key, query, cab, hashCuerpo) {
  const amz = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); // AAAAMMDDTHHMMSSZ
  const dia = amz.slice(0, 8);
  const ruta = "/" + uriS3(cfg.bucket) + (key ? "/" + key.split("/").map(uriS3).join("/") : "");
  const qs = Object.keys(query || {}).map((k) => [uriS3(k), uriS3(query[k] == null ? "" : String(query[k]))]).sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0)).map((p) => p[0] + "=" + p[1]).join("&");
  const h = {};
  for (const n of Object.keys(cab || {})) if (cab[n] != null && cab[n] !== "") h[n.toLowerCase()] = String(cab[n]);
  h["x-amz-date"] = amz;
  h["x-amz-content-sha256"] = hashCuerpo || "UNSIGNED-PAYLOAD";
  const firmados = ["host"].concat(Object.keys(h).filter((n) => n.startsWith("x-amz-") || n === "content-type" || n === "content-md5")).sort();
  const valor = (n) => (n === "host" ? cfg.host : h[n]).trim().replace(/\s+/g, " ");
  const canonica = [metodo, ruta, qs, firmados.map((n) => n + ":" + valor(n) + "\n").join(""), firmados.join(";"), h["x-amz-content-sha256"]].join("\n");
  const alcance = dia + "/auto/s3/aws4_request";
  const aFirmar = ["AWS4-HMAC-SHA256", amz, alcance, await sha256Hex(canonica)].join("\n");
  if (firmaCache.dia !== dia || firmaCache.sec !== cfg.sec || !firmaCache.k) {
    let k = await hmacS("AWS4" + cfg.sec, dia);
    k = await hmacS(k, "auto"); k = await hmacS(k, "s3"); k = await hmacS(k, "aws4_request");
    firmaCache = { dia, sec: cfg.sec, k };
  }
  const firma = hexDe(await hmacS(firmaCache.k, aFirmar));
  h["authorization"] = "AWS4-HMAC-SHA256 Credential=" + cfg.id + "/" + alcance + ", SignedHeaders=" + firmados.join(";") + ", Signature=" + firma;
  return { url: cfg.base + ruta + (qs ? "?" + qs : ""), headers: h };
}
// Error de S3 sin datos de la cuenta (nunca lleva las claves)
function errS3(r, que) { const e = new Error("S3 " + que + ": " + r.status); e.status = r.status; return e; }
const descartar = (r) => { try { if (r && r.body) r.body.cancel(); } catch (e) { } };
function s3Bucket(cfg) {
  async function pedir(metodo, key, query, cab, cuerpo, hash) {
    const f = await firmarS3(cfg, metodo, key, query || {}, cab || {}, hash);
    const init = { method: metodo, headers: f.headers };
    if (cuerpo != null) init.body = cuerpo;
    return fetch(f.url, init);
  }
  const metaDe = (r, key) => {
    const et = r.headers.get("etag") || "";
    return { key, size: parseInt(r.headers.get("content-length") || "0", 10) || 0, httpEtag: et, etag: et.replace(/"/g, ""), httpMetadata: { contentType: r.headers.get("content-type") || "" } };
  };
  const cabPut = (op) => {
    const c = {};
    const hm = (op && op.httpMetadata) || {}, cm = (op && op.customMetadata) || {};
    if (hm.contentType) c["Content-Type"] = hm.contentType;
    if (hm.cacheControl) c["Cache-Control"] = hm.cacheControl;
    for (const n of Object.keys(cm)) c["x-amz-meta-" + n.toLowerCase()] = String(cm[n]);
    return c;
  };
  const xmlDe = (t, etq) => { const m = new RegExp("<" + etq + ">([^<]*)</" + etq + ">").exec(t || ""); return m ? m[1] : ""; };
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const B = {
    async head(key) {
      const r = await pedir("HEAD", key, null, null, null, VACIO_SHA);
      descartar(r);
      if (r.status === 404) return null;
      if (!r.ok) throw errS3(r, "head");
      return metaDe(r, key);
    },
    async get(key, op) {
      const cab = {};
      if (op && op.range) { const o = op.range.offset || 0, l = op.range.length; cab["Range"] = "bytes=" + o + "-" + (l != null ? o + l - 1 : ""); }
      const r = await pedir("GET", key, null, cab, null, VACIO_SHA);
      if (r.status === 404) { descartar(r); return null; }
      if (!r.ok) { descartar(r); throw errS3(r, "get"); }
      return { ...metaDe(r, key), body: r.body };
    },
    async put(key, cuerpo, op) {
      const r = await pedir("PUT", key, null, cabPut(op), cuerpo);
      descartar(r);
      if (!r.ok) throw errS3(r, "put");
      return { key, httpEtag: r.headers.get("etag") || "" };
    },
    async delete(key) {
      const r = await pedir("DELETE", key, null, null, null, VACIO_SHA);
      descartar(r);
      if (!r.ok && r.status !== 404) throw errS3(r, "delete");
    },
    async createMultipartUpload(key, op) {
      const r = await pedir("POST", key, { uploads: "" }, cabPut(op), null, VACIO_SHA);
      const t = await r.text();
      if (!r.ok) throw errS3(r, "iniciar");
      const id = xmlDe(t, "UploadId");
      if (!id) throw errS3(r, "iniciar sin id");
      return { key, uploadId: id };
    },
    resumeMultipartUpload(key, id) {
      return {
        key, uploadId: id,
        async uploadPart(n, cuerpo) {
          const r = await pedir("PUT", key, { partNumber: String(n), uploadId: id }, null, cuerpo);
          descartar(r);
          if (!r.ok) throw errS3(r, "parte");
          return { partNumber: n, etag: r.headers.get("etag") || "" };
        },
        async complete(partes) {
          const xml = "<CompleteMultipartUpload>" + partes.map((p) => "<Part><PartNumber>" + p.partNumber + "</PartNumber><ETag>" + esc(p.etag) + "</ETag></Part>").join("") + "</CompleteMultipartUpload>";
          const u = enc.encode(xml);
          const r = await pedir("POST", key, { uploadId: id }, { "Content-Type": "application/xml" }, u, await sha256Hex(u));
          const t = await r.text();
          if (!r.ok || /<Error>/.test(t)) throw errS3(r, "terminar");
          const m = await B.head(key);
          if (!m) throw errS3(r, "terminar sin archivo");
          return m;
        },
        async abort() {
          const r = await pedir("DELETE", key, { uploadId: id }, null, null, VACIO_SHA);
          descartar(r);
          if (!r.ok && r.status !== 404) throw errS3(r, "cancelar");
        },
      };
    },
  };
  return B;
}
// /salud con las claves: prueba que anden (un HEAD de algo que no existe: 404 = bien). Se guarda 5 min.
let s3Prueba = { k: "", hasta: 0, res: null };
async function probarS3(r2) {
  const k = r2.s3.base + "/" + r2.s3.bucket + "|" + r2.s3.id.length;
  if (s3Prueba.k === k && s3Prueba.hasta > Date.now() && s3Prueba.res) return s3Prueba.res;
  let res;
  try { await r2.b.head("fotos/__salud_ema__"); res = { ok: true }; }
  catch (e) {
    const st = e && e.status;
    res = { ok: false, error: st === 403 || st === 401 ? "Las claves de R2 (Secrets R2_KEY_ID / R2_SECRET) no tienen permiso sobre el bucket R2_BUCKET." : st === 404 || st === 400 ? "No se encontró el bucket: revisá los Secrets R2_BUCKET y R2_ENDPOINT." : "No se pudo llegar a R2 con las claves (Secrets R2_*). Probá de nuevo en un rato." };
  }
  s3Prueba = { k, hasta: Date.now() + (res.ok ? 5 * 60000 : 30000), res };
  return res;
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
      if (!r2) o.error = "El Worker no tiene ligado el bucket R2 (Settings › Bindings) ni las 4 claves (Secrets R2_BUCKET, R2_ENDPOINT, R2_KEY_ID, R2_SECRET).";
      if (r2 && r2.s3) { const p = await probarS3(r2); if (!p.ok) { o.ok = false; o.error = p.error; } }
      return json(o, o.ok ? 200 : 503, ctx);
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
