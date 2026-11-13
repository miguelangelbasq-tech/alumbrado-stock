// Prueba del Worker «ema-fotos» v2 en Node (sin internet): simula las claves de Google y el bucket R2 (en memoria, con
// subida por partes). Correr:  node workers/probar_ema_fotos.mjs
import worker, { claveDe, rangoDe } from "./ema-fotos.js";
import { readFileSync } from "node:fs";

const ORIGEN = "https://miguelangelbasq-tech.github.io";
const MB = 1024 * 1024;
let ok = 0, malas = 0;
const prueba = (nombre, cond) => { if (cond) ok++; else malas++; console.log((cond ? "  ok  " : "  MAL ") + nombre); };

// ---------- par de claves RSA como las de Google
const b64u = (b) => Buffer.from(b).toString("base64url");
const par = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
const otro = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
const jwkPub = await crypto.subtle.exportKey("jwk", par.publicKey);
const KID = "kid-prueba-1";
async function firmar(cue, { kid = KID, clave = par.privateKey, alg = "RS256" } = {}) {
  const cab = b64u(JSON.stringify({ alg, kid, typ: "JWT" })), c = b64u(JSON.stringify(cue));
  const f = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", clave, new TextEncoder().encode(cab + "." + c));
  return cab + "." + c + "." + b64u(f);
}
const ahora = () => Math.floor(Date.now() / 1000);
const cuerpoToken = (uid, extra = {}) => ({ iss: "https://securetoken.google.com/alumbrado-stock", aud: "alumbrado-stock", sub: uid, user_id: uid, iat: ahora() - 10, exp: ahora() + 3600, auth_time: ahora() - 100, ...extra });

let pedidosGoogle = 0;
globalThis.fetch = async (url) => {
  url = String(url);
  if (url.startsWith("https://www.googleapis.com/")) { pedidosGoogle++; return new Response(JSON.stringify({ keys: [{ ...jwkPub, kid: KID, alg: "RS256", use: "sig" }] }), { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=20000" } }); }
  throw new Error("fetch no esperado: " + url);
};

// ---------- R2 en memoria (misma forma que el binding de Cloudflare)
async function aBytes(v) {
  if (v instanceof Uint8Array) return v;
  if (v instanceof ArrayBuffer) return new Uint8Array(v);
  if (typeof v === "string") return new TextEncoder().encode(v);
  if (v && typeof v.getReader === "function") {
    const rd = v.getReader(), t = []; let n = 0;
    for (;;) { const { done, value } = await rd.read(); if (done) break; t.push(value); n += value.byteLength; }
    const u = new Uint8Array(n); let p = 0; for (const x of t) { u.set(x, p); p += x.byteLength; } return u;
  }
  throw new Error("cuerpo no soportado");
}
class R2Mem {
  constructor() { this.objs = new Map(); this.subidas = new Map(); this.puts = 0; this.borrados = 0; }
  meta(k) { const o = this.objs.get(k); return { key: k, size: o.u.byteLength, httpEtag: o.etag, etag: o.etag.replace(/"/g, ""), httpMetadata: o.httpMetadata, customMetadata: o.customMetadata }; }
  async put(k, v, op = {}) { const u = await aBytes(v); this.puts++; this.objs.set(k, { u, etag: '"e' + Math.random().toString(36).slice(2, 10) + '"', httpMetadata: op.httpMetadata || {}, customMetadata: op.customMetadata || {} }); return this.meta(k); }
  async head(k) { return this.objs.has(k) ? this.meta(k) : null; }
  async get(k, op = {}) {
    if (!this.objs.has(k)) return null;
    const o = this.objs.get(k); let u = o.u;
    if (op.range) { const { offset = 0, length = u.byteLength - offset } = op.range; u = u.subarray(offset, offset + length); }
    return { ...this.meta(k), range: op.range, body: new Blob([u]).stream() };
  }
  async delete(k) { this.borrados++; this.objs.delete(k); }
  async createMultipartUpload(k, op = {}) { const id = "up-" + Math.random().toString(36).slice(2); this.subidas.set(id, { k, op, partes: new Map() }); return { key: k, uploadId: id }; }
  resumeMultipartUpload(k, id) {
    const yo = this;
    return {
      key: k, uploadId: id,
      async uploadPart(n, v) { const s = yo.subidas.get(id); if (!s || s.k !== k) throw new Error("NoSuchUpload"); const u = await aBytes(v); const etag = "p" + n + "-" + Math.random().toString(36).slice(2, 8); s.partes.set(n, { u, etag }); return { partNumber: n, etag }; },
      async complete(partes) {
        const s = yo.subidas.get(id); if (!s || s.k !== k) throw new Error("NoSuchUpload");
        const us = partes.map((p) => { const x = s.partes.get(p.partNumber); if (!x || x.etag !== p.etag) throw new Error("InvalidPart"); return x.u; });
        // como R2: todas las partes menos la última del mismo tamaño y de 5 MiB o más
        for (let i = 0; i < us.length - 1; i++) if (us[i].byteLength < 5 * MB || us[i].byteLength !== us[0].byteLength) throw new Error("EntityTooSmall");
        const n = us.reduce((a, u) => a + u.byteLength, 0), todo = new Uint8Array(n); let p = 0; for (const u of us) { todo.set(u, p); p += u.byteLength; }
        yo.subidas.delete(id);
        return yo.put(k, todo, s.op);
      },
      async abort() { yo.subidas.delete(id); },
    };
  }
}

// ---------- archivos de prueba (con los primeros bytes correctos)
function archivo(tipo, n, semilla = 7) {
  const u = new Uint8Array(n); let x = semilla; for (let i = 0; i < n; i++) { x = (x * 1103515245 + 12345) >>> 0; u[i] = x >>> 24; }
  const pon = (i, a) => a.forEach((b, k) => { u[i + k] = typeof b === "string" ? b.charCodeAt(0) : b; });
  if (tipo === "jpg") pon(0, [0xFF, 0xD8, 0xFF, 0xE0]);
  if (tipo === "png") pon(0, [0x89, "P", "N", "G", 0x0D, 0x0A, 0x1A, 0x0A]);
  if (tipo === "webp") { pon(0, ["R", "I", "F", "F"]); pon(8, ["W", "E", "B", "P"]); }
  if (tipo === "pdf") pon(0, [..."%PDF-1.7"]);
  if (tipo === "mp4") pon(4, [..."ftypisom"]);
  if (tipo === "webm") pon(0, [0x1A, 0x45, 0xDF, 0xA3]);
  return u;
}
const iguales = (a, b) => a.byteLength === b.byteLength && Buffer.compare(Buffer.from(a), Buffer.from(b)) === 0;

const R2 = new R2Mem();
const env = { MIS_FOTOS: R2 }; // nombre de ligadura cualquiera: el Worker la busca sola
const BASE = "https://ema-fotos.mdiaz-60f.workers.dev";
async function pedir(ruta, { metodo = "GET", token, cuerpo, tipo, origen = ORIGEN, h = {}, e = env, largo = true } = {}) {
  const hh = { ...h }; if (token) hh.Authorization = "Bearer " + token; if (origen) hh.Origin = origen; if (tipo) hh["Content-Type"] = tipo;
  if (cuerpo instanceof Uint8Array && largo && !("Content-Length" in hh)) hh["Content-Length"] = String(cuerpo.byteLength);
  const r = await worker.fetch(new Request(BASE + ruta, { method: metodo, headers: hh, body: cuerpo, duplex: "half" }), e);
  const ab = new Uint8Array(await r.arrayBuffer());
  let j = null; try { j = JSON.parse(new TextDecoder().decode(ab)); } catch (_) { }
  return { r, j, ab };
}
const T = await firmar(cuerpoToken("uid-juan"));

// ---------- /salud
{
  const { r, j } = await pedir("/salud");
  prueba("/salud → 200 {ok, version v2-fotos, multipart:true}", r.status === 200 && j.ok === true && j.version === "v2-fotos" && j.multipart === true);
  prueba("/salud lista los 6 tipos", ["image/jpeg", "image/png", "image/webp", "application/pdf", "video/mp4", "video/webm"].every((t) => j.tipos.includes(t)) && j.tipos.length === 6);
  prueba("/salud encuentra la ligadura aunque se llame distinto (MIS_FOTOS)", j.r2 === true && j.enlace === "MIS_FOTOS");
  const s2 = await pedir("/salud", { e: {} });
  prueba("/salud sin el bucket ligado → 503 ok:false con el porqué", s2.r.status === 503 && s2.j.ok === false && /Bindings/.test(s2.j.error));
  const s3 = await pedir("/salud", { e: { FOTOS: R2, OTRA: "x" } });
  prueba("/salud con la ligadura FOTOS la usa", s3.j.enlace === "FOTOS");
  const s4 = await pedir("/salud", { origen: "" });
  prueba("/salud sin Origin (sonda de la app / navegador) → 200", s4.r.status === 200);
  const f = await pedir("/f/fotos/2026/11/x/a.jpg", { token: T, e: {} });
  prueba("/f/ sin el bucket → 503 en castellano", f.r.status === 503 && f.j.ok === false && /nube/.test(f.j.error));
}

// ---------- CORS
{
  const r1 = await worker.fetch(new Request(BASE + "/f/fotos/a.jpg", { method: "OPTIONS", headers: { Origin: ORIGEN } }), env);
  prueba("OPTIONS desde GitHub Pages → 204 con Range y PUT", r1.status === 204 && r1.headers.get("Access-Control-Allow-Origin") === ORIGEN && /Range/.test(r1.headers.get("Access-Control-Allow-Headers")) && /PUT/.test(r1.headers.get("Access-Control-Allow-Methods")) && /Content-Range/.test(r1.headers.get("Access-Control-Expose-Headers")));
  const r2 = await worker.fetch(new Request(BASE + "/f/fotos/a.jpg", { method: "OPTIONS", headers: { Origin: "https://localhost" } }), env);
  prueba("OPTIONS desde el APK (https://localhost) → 204", r2.status === 204 && r2.headers.get("Access-Control-Allow-Origin") === "https://localhost");
  const r3 = await worker.fetch(new Request(BASE + "/f/fotos/a.jpg", { method: "OPTIONS", headers: { Origin: "https://malo.example" } }), env);
  prueba("OPTIONS desde otro sitio → 403 sin permiso", r3.status === 403 && !r3.headers.get("Access-Control-Allow-Origin"));
  const n0 = R2.puts;
  const r4 = await pedir("/f/fotos/2026/11/x/malo.jpg", { metodo: "PUT", token: T, tipo: "image/jpeg", cuerpo: archivo("jpg", 1000), origen: "https://malo.example" });
  prueba("PUT desde otro sitio → 403 y no guarda", r4.r.status === 403 && R2.puts === n0);
  const r5 = await worker.fetch(new Request(BASE + "/f/fotos/a.jpg", { method: "OPTIONS", headers: { Origin: "https://otro.ema" } }), { ...env, FOTOS_ORIGENES: "https://otro.ema" });
  prueba("FOTOS_ORIGENES suma otro sitio", r5.status === 204);
}

// ---------- fotos como hoy (v037)
const KF = "fotos/2026/11/plaza_los_alamos/mh3x9a_k2j4f1.jpg";
const FOTO = archivo("jpg", 380 * 1024);
{
  const { r, j } = await pedir("/f/" + KF, { metodo: "PUT", token: T, tipo: "image/jpeg", cuerpo: FOTO });
  prueba("PUT foto como hoy → 200 {ok:true}", r.status === 200 && j.ok === true && j.key === KF);
  const o = R2.objs.get(KF);
  prueba("en R2 queda con su tipo, cache privado y quién la subió", o && o.httpMetadata.contentType === "image/jpeg" && /private/.test(o.httpMetadata.cacheControl) && o.customMetadata.uid === "uid-juan" && iguales(o.u, FOTO));
  const g = await pedir("/f/" + KF, { token: T });
  prueba("GET con Bearer → 200 la imagen igualita", g.r.status === 200 && g.r.headers.get("Content-Type") === "image/jpeg" && iguales(g.ab, FOTO));
  prueba("GET dice Accept-Ranges, Content-Length, ETag y Cache-Control privado", g.r.headers.get("Accept-Ranges") === "bytes" && g.r.headers.get("Content-Length") === String(FOTO.byteLength) && !!g.r.headers.get("ETag") && /^private/.test(g.r.headers.get("Cache-Control")));
  prueba("GET con CORS para la app", g.r.headers.get("Access-Control-Allow-Origin") === ORIGEN);
  const gt = await pedir("/f/" + KF + "?t=" + encodeURIComponent(T), { origen: "" });
  prueba("GET con ?t=<token> (sin cabecera, como <img>/<video>) → 200", gt.r.status === 200 && iguales(gt.ab, FOTO));
  const sin = await pedir("/f/" + KF);
  prueba("GET sin token → 401 {ok:false, error} en castellano", sin.r.status === 401 && sin.j.ok === false && /sesión/.test(sin.j.error));
  const hd = await pedir("/f/" + KF, { metodo: "HEAD", token: T });
  prueba("HEAD → 200 con Content-Length y sin cuerpo", hd.r.status === 200 && hd.r.headers.get("Content-Length") === String(FOTO.byteLength) && hd.ab.byteLength === 0);
  const nm = await pedir("/f/" + KF, { token: T, h: { "If-None-Match": g.r.headers.get("ETag") } });
  prueba("If-None-Match con el mismo ETag → 304", nm.r.status === 304);
  const no = await pedir("/f/fotos/2026/11/x/no_existe.jpg", { token: T });
  prueba("GET de algo que no existe → 404 en castellano", no.r.status === 404 && no.j.ok === false && /No existe/.test(no.j.error));
  const png = await pedir("/f/fotos/2026/11/x/b.jpg", { metodo: "PUT", token: T, tipo: "image/png", cuerpo: archivo("png", 5000) });
  const webp = await pedir("/f/fotos/2026/11/x/c.jpg", { metodo: "PUT", token: T, tipo: "image/webp", cuerpo: archivo("webp", 5000) });
  prueba("PNG y WEBP en fotos/ (con nombre .jpg, como hace la app) → ok", png.j.ok && webp.j.ok);
  const jpgAlias = await pedir("/f/fotos/2026/11/x/d.jpg", { metodo: "PUT", token: T, tipo: "image/jpg; charset=binary", cuerpo: archivo("jpg", 5000) });
  prueba("«image/jpg» con parámetros se toma como image/jpeg", jpgAlias.j.ok === true && R2.objs.get("fotos/2026/11/x/d.jpg").httpMetadata.contentType === "image/jpeg");
  // reintento: la misma foto otra vez
  const n0 = R2.puts;
  const re = await pedir("/f/" + KF, { metodo: "PUT", token: T, tipo: "image/jpeg", cuerpo: FOTO });
  prueba("reintento con la misma clave y el mismo tamaño → {ok:true, ya:true} sin volver a escribir", re.r.status === 200 && re.j.ok && re.j.ya === true && R2.puts === n0);
  const pisa = await pedir("/f/" + KF, { metodo: "PUT", token: T, tipo: "image/jpeg", cuerpo: archivo("jpg", 1234, 99) });
  prueba("otra foto con la misma clave → 409 y la de antes queda igual", pisa.r.status === 409 && pisa.j.ok === false && iguales(R2.objs.get(KF).u, FOTO));
}

// ---------- no se borra
{
  const n0 = R2.borrados;
  const d = await pedir("/f/" + KF, { metodo: "DELETE", token: T });
  prueba("DELETE → 405 «No se puede borrar» y la foto sigue", d.r.status === 405 && d.j.ok === false && /borrar/.test(d.j.error) && R2.objs.has(KF) && R2.borrados === n0);
  const d2 = await pedir("/m/" + KF, { metodo: "DELETE", token: T });
  prueba("DELETE por /m/ → 405", d2.r.status === 405);
  const p = await pedir("/f/" + KF, { metodo: "PATCH", token: T, tipo: "image/jpeg", cuerpo: FOTO });
  prueba("PATCH → 405", p.r.status === 405);
  const x = await pedir("/otra/cosa", { token: T });
  prueba("dirección desconocida → 404", x.r.status === 404 && x.j.ok === false);
}

// ---------- PDF
const KP = "docs/2026/11/plaza_los_alamos/certificado_pat.pdf";
const PDF = archivo("pdf", 3 * MB);
{
  const { r, j } = await pedir("/f/" + KP, { metodo: "PUT", token: T, tipo: "application/pdf", cuerpo: PDF });
  prueba("PDF de 3 MB a docs/ → ok", r.status === 200 && j.ok && j.tam === PDF.byteLength);
  const g = await pedir("/f/" + KP, { token: T });
  prueba("GET del PDF → application/pdf, inline, igualito", g.r.status === 200 && g.r.headers.get("Content-Type") === "application/pdf" && /inline/.test(g.r.headers.get("Content-Disposition")) && iguales(g.ab, PDF));
  const grande = await pedir("/f/docs/2026/11/x/grande.pdf", { metodo: "PUT", token: T, tipo: "application/pdf", cuerpo: archivo("pdf", 26 * MB) });
  prueba("PDF de 26 MB en un PUT → 413 «subilo por partes»", grande.r.status === 413 && /25 MB/.test(grande.j.error) && /por partes/.test(grande.j.error));
  const grande2 = await pedir("/f/docs/2026/11/x/grande2.pdf", { metodo: "PUT", token: T, tipo: "application/pdf", cuerpo: archivo("pdf", 26 * MB), largo: false });
  prueba("PDF de 26 MB sin Content-Length → 413 igual (se corta al leer)", grande2.r.status === 413 && !R2.objs.has("docs/2026/11/x/grande2.pdf"));
}

// ---------- video simple (un PUT)
const KV = "videos/2026/11/plaza_los_alamos/izaje_col4.mp4";
const VID = archivo("mp4", 30 * MB);
{
  const { r, j } = await pedir("/f/" + KV, { metodo: "PUT", token: T, tipo: "video/mp4", cuerpo: VID });
  prueba("video MP4 de 30 MB en un PUT → ok", r.status === 200 && j.ok && iguales(R2.objs.get(KV).u, VID));
  // en Cloudflare lo grande pasa directo a R2 (FixedLengthStream): lo simulamos
  let usadas = 0;
  globalThis.FixedLengthStream = class { constructor(n) { usadas++; const ts = new TransformStream(); this.readable = ts.readable; this.writable = ts.writable; this.n = n; } };
  const WEBM = archivo("webm", 60 * MB);
  const w = await pedir("/f/videos/2026/11/x/charla.webm", { metodo: "PUT", token: T, tipo: "video/webm", cuerpo: WEBM });
  prueba("video WEBM de 60 MB pasa directo a R2 (sin quedar entero en memoria) → ok", w.r.status === 200 && w.j.ok && usadas === 1 && iguales(R2.objs.get("videos/2026/11/x/charla.webm").u, WEBM));
  const n0 = R2.puts;
  const trucho = await pedir("/f/videos/2026/11/x/trucho.webm", { metodo: "PUT", token: T, tipo: "video/webm", cuerpo: archivo("jpg", 40 * MB) });
  prueba("40 MB que dicen ser video pero no lo son (directo) → 415 y no guarda", trucho.r.status === 415 && R2.puts === n0);
  delete globalThis.FixedLengthStream;
  const big = await pedir("/f/videos/2026/11/x/largo.mp4", { metodo: "PUT", token: T, tipo: "video/mp4", cuerpo: new Uint8Array(8), h: { "Content-Length": String(96 * MB) } });
  prueba("video de 96 MB en un PUT → 413 «subilo por partes» (sin leerlo)", big.r.status === 413 && /95 MB/.test(big.j.error) && /por partes/.test(big.j.error));
}

// ---------- Range (adelantar el video)
{
  const tam = VID.byteLength;
  const a = await pedir("/f/" + KV, { token: T, h: { Range: "bytes=0-99" } });
  prueba("Range bytes=0-99 → 206 con Content-Range y 100 bytes", a.r.status === 206 && a.r.headers.get("Content-Range") === "bytes 0-99/" + tam && a.r.headers.get("Content-Length") === "100" && iguales(a.ab, VID.subarray(0, 100)));
  const mitad = Math.floor(tam / 2);
  const b = await pedir("/f/" + KV, { token: T, h: { Range: "bytes=" + mitad + "-" } });
  prueba("Range desde la mitad hasta el final → 206 correcto", b.r.status === 206 && b.r.headers.get("Content-Range") === "bytes " + mitad + "-" + (tam - 1) + "/" + tam && iguales(b.ab, VID.subarray(mitad)));
  const c = await pedir("/f/" + KV, { token: T, h: { Range: "bytes=-500" } });
  prueba("Range de los últimos 500 bytes → 206", c.r.status === 206 && c.ab.byteLength === 500 && iguales(c.ab, VID.subarray(tam - 500)));
  const d = await pedir("/f/" + KV, { token: T, h: { Range: "bytes=100-" + (tam + 999) } });
  prueba("Range que se pasa del final se recorta", d.r.status === 206 && d.ab.byteLength === tam - 100);
  const e = await pedir("/f/" + KV, { token: T, h: { Range: "bytes=" + tam + "-" } });
  prueba("Range fuera del archivo → 416 con Content-Range bytes */tam", e.r.status === 416 && e.r.headers.get("Content-Range") === "bytes */" + tam && e.j.ok === false);
  const f = await pedir("/f/" + KV, { token: T, h: { Range: "bytes=0-1,5-6" } });
  prueba("varios rangos → archivo entero (200)", f.r.status === 200 && f.ab.byteLength === tam);
  const g = await pedir("/f/" + KV + "?t=" + T, { origen: "", h: { Range: "bytes=1000-1999" } });
  prueba("Range con ?t= (el <video> del celu) → 206", g.r.status === 206 && iguales(g.ab, VID.subarray(1000, 2000)) && g.r.headers.get("Content-Type") === "video/mp4");
  const h = await pedir("/f/" + KV, { metodo: "HEAD", token: T, h: { Range: "bytes=0-9" } });
  prueba("HEAD con Range → 206 sin cuerpo", h.r.status === 206 && h.ab.byteLength === 0 && h.r.headers.get("Content-Length") === "10");
  prueba("rangoDe: casos sueltos", rangoDe(null, 10) === null && rangoDe("bytes=2-4", 10).length === 3 && rangoDe("bytes=-0", 10).fuera === true && rangoDe("items=0-1", 10) === null);
}

// ---------- video por partes (110 MB: 50 + 50 + 10)
const KM = "videos/2026/11/plaza_los_alamos/recorrido.mp4";
{
  const VM = archivo("mp4", 110 * MB, 3);
  const ini = await pedir("/m/" + KM + "?accion=iniciar&tipo=video/mp4&tam=" + VM.byteLength, { metodo: "POST", token: T });
  prueba("iniciar → {ok, id}", ini.r.status === 200 && ini.j.ok && !!ini.j.id && ini.j.parteMin === 5 * MB);
  const id = ini.j.id, cortes = [[0, 50 * MB], [50 * MB, 100 * MB], [100 * MB, 110 * MB]], partes = [];
  for (let i = 0; i < cortes.length; i++) {
    const pz = VM.slice(cortes[i][0], cortes[i][1]);
    const p = await pedir("/m/" + KM + "?parte=" + (i + 1) + "&id=" + id, { metodo: "PUT", token: T, cuerpo: pz, h: i === 0 ? { "X-Tipo": "video/mp4" } : {} });
    partes.push({ parte: p.j && p.j.parte, etag: p.j && p.j.etag });
  }
  prueba("las 3 partes → ok con su etag", partes.every((p, i) => p.parte === i + 1 && p.etag));
  prueba("hasta terminar no existe el archivo", !R2.objs.has(KM));
  const fin = await pedir("/m/" + KM + "?accion=terminar&id=" + id, { metodo: "POST", token: T, tipo: "application/json", cuerpo: new TextEncoder().encode(JSON.stringify({ partes: partes.slice().reverse() })) });
  prueba("terminar → {ok, tam 110 MB} (aunque las partes vengan desordenadas)", fin.r.status === 200 && fin.j.ok && fin.j.tam === VM.byteLength);
  prueba("el video juntado es igualito y con tipo video/mp4", iguales(R2.objs.get(KM).u, VM) && R2.objs.get(KM).httpMetadata.contentType === "video/mp4" && R2.objs.get(KM).customMetadata.uid === "uid-juan");
  const r = await pedir("/f/" + KM, { token: T, h: { Range: "bytes=" + (75 * MB) + "-" + (75 * MB + 4095) } });
  prueba("adelantar el video juntado (Range en la parte 2) → 206 correcto", r.r.status === 206 && iguales(r.ab, VM.subarray(75 * MB, 75 * MB + 4096)));
  const ya = await pedir("/m/" + KM + "?accion=iniciar&tipo=video/mp4", { metodo: "POST", token: T });
  prueba("iniciar con una clave que ya existe → 409", ya.r.status === 409);

  // cancelar
  const i2 = await pedir("/m/videos/2026/11/x/cancelado.mp4?accion=iniciar&tipo=video/mp4", { metodo: "POST", token: T });
  const p1 = await pedir("/m/videos/2026/11/x/cancelado.mp4?parte=1&id=" + i2.j.id, { metodo: "PUT", token: T, tipo: "video/mp4", cuerpo: archivo("mp4", 6 * MB) });
  const can = await pedir("/m/videos/2026/11/x/cancelado.mp4?accion=cancelar&id=" + i2.j.id, { metodo: "POST", token: T });
  prueba("cancelar → ok y la subida se descarta", p1.j.ok && can.j.ok && !R2.subidas.has(i2.j.id) && !R2.objs.has("videos/2026/11/x/cancelado.mp4"));
  const tarde = await pedir("/m/videos/2026/11/x/cancelado.mp4?parte=2&id=" + i2.j.id, { metodo: "PUT", token: T, cuerpo: archivo("mp4", 1000) });
  prueba("una parte después de cancelar → error en castellano", tarde.r.status === 502 && tarde.j.ok === false && /parte 2/.test(tarde.j.error));

  // errores
  const i3 = await pedir("/m/videos/2026/11/x/malo.mp4?accion=iniciar&tipo=video/mp4", { metodo: "POST", token: T });
  const pm = await pedir("/m/videos/2026/11/x/malo.mp4?parte=1&id=" + i3.j.id, { metodo: "PUT", token: T, h: { "X-Tipo": "video/mp4" }, cuerpo: archivo("pdf", 6 * MB) });
  prueba("parte 1 que no es video → 415", pm.r.status === 415);
  const sinTipo = await pedir("/m/videos/2026/11/x/malo.mp4?parte=1&id=" + i3.j.id, { metodo: "PUT", token: T, cuerpo: archivo("mp4", 6 * MB) });
  prueba("parte 1 sin tipo → 415", sinTipo.r.status === 415);
  const pa = await pedir("/m/videos/2026/11/x/malo.mp4?parte=1&id=" + i3.j.id, { metodo: "PUT", token: T, tipo: "video/mp4", cuerpo: archivo("mp4", 6 * MB) });
  const etMal = await pedir("/m/videos/2026/11/x/malo.mp4?accion=terminar&id=" + i3.j.id, { metodo: "POST", token: T, cuerpo: new TextEncoder().encode(JSON.stringify({ partes: [{ parte: 1, etag: "trucho" }] })) });
  prueba("terminar con un etag que no es → 400 en castellano", pa.j.ok && etMal.r.status === 400 && /partes/.test(etMal.j.error));
  const sinP = await pedir("/m/videos/2026/11/x/malo.mp4?accion=terminar&id=" + i3.j.id, { metodo: "POST", token: T, cuerpo: new TextEncoder().encode("{}") });
  prueba("terminar sin la lista de partes → 400", sinP.r.status === 400);
  const grande = await pedir("/m/videos/2026/11/x/malo.mp4?parte=2&id=" + i3.j.id, { metodo: "PUT", token: T, cuerpo: new Uint8Array(8), h: { "Content-Length": String(96 * MB) } });
  prueba("una parte de más de 95 MB → 413", grande.r.status === 413);
  const sinId = await pedir("/m/videos/2026/11/x/malo.mp4?parte=2", { metodo: "PUT", token: T, cuerpo: archivo("mp4", 100) });
  const parte0 = await pedir("/m/videos/2026/11/x/malo.mp4?parte=0&id=" + i3.j.id, { metodo: "PUT", token: T, cuerpo: archivo("mp4", 100) });
  prueba("parte sin id o con número 0 → 400", sinId.r.status === 400 && parte0.r.status === 400);
  const enorme = await pedir("/m/videos/2026/11/x/enorme.mp4?accion=iniciar&tipo=video/mp4&tam=" + (3 * 1024 * MB), { metodo: "POST", token: T });
  prueba("iniciar un video de 3 GB → 413", enorme.r.status === 413);
  const mezcla = await pedir("/m/docs/2026/11/x/a.pdf?accion=iniciar&tipo=video/mp4", { metodo: "POST", token: T });
  prueba("iniciar un video en docs/ → 415", mezcla.r.status === 415);
  const acc = await pedir("/m/videos/2026/11/x/a.mp4?accion=borrar", { metodo: "POST", token: T });
  prueba("acción desconocida → 400", acc.r.status === 400);
  const sinTk = await pedir("/m/videos/2026/11/x/a.mp4?accion=iniciar&tipo=video/mp4", { metodo: "POST" });
  prueba("por partes sin token → 401", sinTk.r.status === 401);

  // un PDF por partes que se pasa del tope total (200 MB) se descarta al terminar
  const KD = "docs/2026/11/x/enorme.pdf";
  const i4 = await pedir("/m/" + KD + "?accion=iniciar&tipo=application/pdf", { metodo: "POST", token: T });
  const pp = [];
  for (let i = 1; i <= 3; i++) { const p = await pedir("/m/" + KD + "?parte=" + i + "&id=" + i4.j.id, { metodo: "PUT", token: T, tipo: "application/pdf", cuerpo: i === 1 ? archivo("pdf", 90 * MB) : new Uint8Array(i === 2 ? 90 * MB : 30 * MB) }); pp.push({ parte: i, etag: p.j.etag }); }
  const f4 = await pedir("/m/" + KD + "?accion=terminar&id=" + i4.j.id, { metodo: "POST", token: T, cuerpo: new TextEncoder().encode(JSON.stringify({ partes: pp })) });
  prueba("PDF por partes de 210 MB → 413 y no queda guardado", f4.r.status === 413 && !R2.objs.has(KD));
}

// ---------- tipos, carpetas y tamaños rechazados
{
  const n0 = R2.puts;
  const casos = [
    ["/f/otros/2026/11/x/a.jpg", "image/jpeg", archivo("jpg", 100), 400, "carpeta fuera de fotos/docs/videos"],
    ["/f/a.jpg", "image/jpeg", archivo("jpg", 100), 400, "sin carpeta"],
    ["/f/fotos/2026/%2E%2E%2Fdocs/a.jpg", "image/jpeg", archivo("jpg", 100), 400, "«..» escondido con %2E%2E%2F"],
    ["/f/fotos/2026/11/.oculto/a.jpg", "image/jpeg", archivo("jpg", 100), 400, "carpeta que empieza con punto"],
    ["/f/fotos/2026/11/x//a.jpg", "image/jpeg", archivo("jpg", 100), 400, "«//»"],
    ["/f/fotos/2026/11/plaza%20ñ/a.jpg", "image/jpeg", archivo("jpg", 100), 400, "espacios y ñ"],
    ["/f/fotos/2026/11/x/a.jpg", "text/html", archivo("jpg", 100), 415, "text/html en fotos/"],
    ["/f/fotos/2026/11/x/a.jpg", "application/pdf", archivo("pdf", 100), 415, "PDF en fotos/"],
    ["/f/videos/2026/11/x/a.mp4", "image/jpeg", archivo("jpg", 100), 415, "foto en videos/"],
    ["/f/docs/2026/11/x/a.pdf", "video/mp4", archivo("mp4", 100), 415, "video en docs/"],
    ["/f/fotos/2026/11/x/a.jpg", "image/jpeg", archivo("pdf", 100), 415, "dice jpeg pero adentro es un PDF"],
    ["/f/docs/2026/11/x/a.pdf", "application/pdf", archivo("jpg", 3000), 415, "dice PDF pero adentro es una foto"],
    ["/f/fotos/2026/11/x/a.jpg", "", archivo("jpg", 100), 415, "sin tipo"],
    ["/f/fotos/2026/11/x/vacia.jpg", "image/jpeg", new Uint8Array(0), 400, "vacía"],
    ["/f/fotos/2026/11/x/enorme.jpg", "image/jpeg", archivo("jpg", 11 * MB), 413, "foto de 11 MB"],
  ];
  for (const [ruta, tipo, cuerpo, st, nombre] of casos) {
    const { r, j } = await pedir(ruta, { metodo: "PUT", token: T, tipo, cuerpo });
    prueba("rechaza " + nombre + " → " + st + " {ok:false}", r.status === st && j && j.ok === false && typeof j.error === "string" && j.error.length > 5);
  }
  const sinCL = await pedir("/f/fotos/2026/11/x/enorme2.jpg", { metodo: "PUT", token: T, tipo: "image/jpeg", cuerpo: archivo("jpg", 11 * MB), largo: false });
  prueba("foto de 11 MB sin Content-Length → 413", sinCL.r.status === 413);
  prueba("nada de lo rechazado se guardó", R2.puts === n0);
  prueba("claveDe acepta las claves de la app", claveDe("fotos/2026/11/Plaza_Los_Alamos/mh3x9a_k2j4f1.jpg").key === "fotos/2026/11/Plaza_Los_Alamos/mh3x9a_k2j4f1.jpg" && claveDe("videos/2026/11/general/x.webm").carpeta === "videos");
  prueba("claveDe rechaza «..» y fuera de carpeta", !!claveDe("fotos/../docs/x.pdf").error && !!claveDe("../fotos/x.jpg").error && !!claveDe("secretos/x").error);
}

// ---------- token
{
  const n0 = R2.puts, g0 = pedidosGoogle;
  const casos = [
    [await firmar(cuerpoToken("u1", { exp: ahora() - 3600 })), "vencido"],
    [await firmar(cuerpoToken("u1", { aud: "otro-proyecto" })), "de otro proyecto (aud)"],
    [await firmar(cuerpoToken("u1", { iss: "https://securetoken.google.com/otro" })), "de otro proyecto (iss)"],
    [await firmar(cuerpoToken("u1"), { clave: otro.privateKey }), "firmado con otra clave"],
    [await firmar(cuerpoToken("u1"), { kid: "no-existe" }), "con kid desconocido"],
    [await firmar(cuerpoToken("u1"), { alg: "HS256" }), "con alg distinto de RS256"],
    [await firmar(cuerpoToken("u1", { iat: ahora() + 3600 })), "emitido en el futuro"],
    ["basura.total.x", "ilegible"],
  ];
  for (const [tk, nombre] of casos) {
    const p = await pedir("/f/fotos/2026/11/x/tk.jpg", { metodo: "PUT", token: tk, tipo: "image/jpeg", cuerpo: archivo("jpg", 100) });
    const g = await pedir("/f/" + KF + "?t=" + encodeURIComponent(tk), { origen: "" });
    prueba("token " + nombre + " → 401 al subir y al bajar", p.r.status === 401 && g.r.status === 401 && p.j.ok === false);
  }
  const tq = await pedir("/f/fotos/2026/11/x/tq.jpg?t=" + encodeURIComponent(T), { metodo: "PUT", tipo: "image/jpeg", cuerpo: archivo("jpg", 100) });
  prueba("al subir no se acepta el token en ?t= (solo en la cabecera)", tq.r.status === 401);
  prueba("con token malo no se guardó nada", R2.puts === n0);
  prueba("las claves de Google se bajan pocas veces (quedan guardadas)", pedidosGoogle - g0 <= 2);
}

// ---------- sin secretos en el código
{
  const src = readFileSync(new URL("./ema-fotos.js", import.meta.url), "utf8");
  prueba("el código no tiene claves ni secretos (R2 va por la ligadura)", !/sk-ant-|AKIA[0-9A-Z]{8}|secret_?access|accessKeyId|-----BEGIN/i.test(src) && !/env\.[A-Z_]*(KEY|SECRET|TOKEN)/.test(src));
}

console.log("\nRESULTADO ema-fotos v2: " + ok + "/" + (ok + malas) + " OK");
process.exit(malas ? 1 : 0);
