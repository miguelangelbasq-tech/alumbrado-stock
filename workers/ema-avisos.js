// Worker «ema-avisos» (Cloudflare) · Avisos al celular con la app CERRADA — EMA Servicios.
// v050: Web Push (navegador / PWA). v115: también FCM (la app de Android 1.3).
// v116: lee menos de Firestore (la clave VAPID una sola vez y solo si hay avisos) y explica el «429» (límite gratis del día).
//
// Cómo funciona:
//  · La app, cuando pasa algo (orden nueva para una persona, material listo para retirar), deja un aviso en Firestore
//    (colección «avisosPush», con enviado:false). Cada celular que activó los avisos deja su suscripción en «pushSubs»:
//      - navegador / PWA: {endpoint, p256dh, auth, …}            → Web Push firmado con VAPID
//      - app de Android 1.3: {tipo:"fcm", fcm:<token>, …}         → Firebase Cloud Messaging (HTTP v1)
//  · Este Worker corre solo cada minuto (Cron Trigger), lee los avisos sin enviar, los manda a los celulares de esa persona
//    y los marca como enviados. Si un celular ya no existe, borra su suscripción.
//  · Las claves VAPID las crea el Worker la primera vez y las guarda en Firestore (la privada en «secretosServidor», que
//    ninguna app puede leer; la pública en configEquipo/vapid). La app pide la pública en  /vapid .
//  · FCM usa la misma cuenta de servicio (FB_SA_JSON): no hace falta ninguna clave nueva.
//
// Variables (Settings › Variables and Secrets), las dos como «Secret»:
//  · FB_SA_JSON   = el contenido COMPLETO del archivo .json de la «cuenta de servicio» de Firebase (Generar nueva clave privada).
//  · (opcional) CONTACTO = mailto:tu-correo — va en la firma de los avisos.
// Cron Trigger (Settings › Triggers › Cron): * * * * *   (cada minuto)
// Rutas: /salud (estado), /vapid (clave pública), /probar (fuerza una vuelta ahora).

const VERSION = "v116-fcm";
const PROYECTO_DEF = "alumbrado-stock";
const MAX_AVISOS = 40;
const enc = new TextEncoder();

// ---------- base64url
const b64u = (buf) => { const b = buf instanceof Uint8Array ? buf : new Uint8Array(buf); let s = ""; for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
const deB64u = (s) => { s = String(s).replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; const bin = atob(s), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; };
const unir = (...l) => { const n = l.reduce((s, x) => s + x.length, 0), o = new Uint8Array(n); let k = 0; l.forEach((x) => { o.set(x, k); k += x.length; }); return o; };

// ---------- token de Google con la cuenta de servicio (RS256) · Firestore + FCM en el mismo token
const SCOPES = "https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/firebase.messaging";
let tokenCache = { t: "", hasta: 0 };
async function tokenGoogle(sa, ahora, fetchFn) {
  if (tokenCache.t && tokenCache.hasta > ahora + 60) return tokenCache.t;
  const pem = String(sa.private_key || "").replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const key = await crypto.subtle.importKey("pkcs8", deB64u(pem.replace(/\+/g, "-").replace(/\//g, "_")), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const cab = b64u(enc.encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const cue = b64u(enc.encode(JSON.stringify({ iss: sa.client_email, scope: SCOPES, aud: "https://oauth2.googleapis.com/token", iat: ahora, exp: ahora + 3600 })));
  const firma = b64u(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, enc.encode(cab + "." + cue)));
  const r = await fetchFn("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "grant_type=" + encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer") + "&assertion=" + cab + "." + cue + "." + firma });
  const j = await r.json();
  if (!r.ok || !j.access_token) throw new Error("no se pudo entrar a Firebase con la cuenta de servicio: " + (j.error_description || j.error || r.status));
  tokenCache = { t: j.access_token, hasta: ahora + (j.expires_in || 3600) };
  return j.access_token;
}

// ---------- Firestore (REST)
const aFs = (v) => v === null || v === undefined ? { nullValue: null } : typeof v === "boolean" ? { booleanValue: v } : typeof v === "number" ? (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v }) : typeof v === "string" ? { stringValue: v } : Array.isArray(v) ? { arrayValue: { values: v.map(aFs) } } : { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, aFs(x)])) } };
const deFs = (v) => !v ? null : "stringValue" in v ? v.stringValue : "integerValue" in v ? Number(v.integerValue) : "doubleValue" in v ? v.doubleValue : "booleanValue" in v ? v.booleanValue : "nullValue" in v ? null : "timestampValue" in v ? v.timestampValue : "arrayValue" in v ? (v.arrayValue.values || []).map(deFs) : "mapValue" in v ? Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, deFs(x)])) : null;
const docDe = (d) => ({ id: d.name.split("/").pop(), name: d.name, ...Object.fromEntries(Object.entries(d.fields || {}).map(([k, v]) => [k, deFs(v)])) });
function firestore(proyecto, token, fetchFn) {
  const base = `https://firestore.googleapis.com/v1/projects/${proyecto}/databases/(default)/documents`, h = { Authorization: "Bearer " + token, "Content-Type": "application/json" };
  return {
    async get(ruta) { const r = await fetchFn(`${base}/${ruta}`, { headers: h }); if (r.status === 404) return null; if (!r.ok) throw new Error("Firestore get " + r.status); return docDe(await r.json()); },
    async set(ruta, datos) { const r = await fetchFn(`${base}/${ruta}`, { method: "PATCH", headers: h, body: JSON.stringify({ fields: aFs(datos).mapValue.fields }) }); if (!r.ok) throw new Error("Firestore set " + r.status); },
    async actualizar(ruta, datos) { const q = Object.keys(datos).map((k) => "updateMask.fieldPaths=" + encodeURIComponent(k)).join("&"); const r = await fetchFn(`${base}/${ruta}?${q}`, { method: "PATCH", headers: h, body: JSON.stringify({ fields: aFs(datos).mapValue.fields }) }); if (!r.ok) throw new Error("Firestore update " + r.status); },
    async borrar(ruta) { const r = await fetchFn(`${base}/${ruta}`, { method: "DELETE", headers: h }); if (!r.ok && r.status !== 404) throw new Error("Firestore delete " + r.status); },
    async consulta(coleccion, donde, limite) {
      const sq = { from: [{ collectionId: coleccion }], limit: limite || 100 };
      if (donde) sq.where = { fieldFilter: { field: { fieldPath: donde[0] }, op: donde[1], value: aFs(donde[2]) } };
      const r = await fetchFn(`${base}:runQuery`, { method: "POST", headers: h, body: JSON.stringify({ structuredQuery: sq }) });
      if (!r.ok) throw new Error("Firestore query " + r.status);
      return (await r.json()).filter((x) => x.document).map((x) => docDe(x.document));
    }
  };
}

// ---------- claves VAPID (se crean la primera vez)
let vapidCache = null;
async function clavesVapid(db) {
  if (vapidCache) return vapidCache;
  const g = await db.get("secretosServidor/vapid");
  if (g && g.privJwk && g.pub) return (vapidCache = { jwk: JSON.parse(g.privJwk), pub: g.pub });
  const kp = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const jwk = await crypto.subtle.exportKey("jwk", kp.privateKey), pub = b64u(await crypto.subtle.exportKey("raw", kp.publicKey));
  await db.set("secretosServidor/vapid", { privJwk: JSON.stringify(jwk), pub, creado: Date.now() });
  await db.set("configEquipo/vapid", { publicKey: pub, ts: Date.now() });
  return { jwk, pub };
}

// ---------- Web Push (RFC 8291 aes128gcm + RFC 8292 VAPID)
async function hmac(clave, datos) { const k = await crypto.subtle.importKey("raw", clave, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]); return new Uint8Array(await crypto.subtle.sign("HMAC", k, datos)); }
async function cifrar(payload, p256dh, authSecret, opciones = {}) {
  const ua = deB64u(p256dh), auth = deB64u(authSecret);
  const uaKey = await crypto.subtle.importKey("raw", ua, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const as = opciones.asKeyPair || await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const asPub = new Uint8Array(await crypto.subtle.exportKey("raw", as.publicKey));
  const secreto = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, as.privateKey, 256));
  const prkKey = await hmac(auth, secreto);
  const ikm = (await hmac(prkKey, unir(enc.encode("WebPush: info\0"), ua, asPub, new Uint8Array([1])))).slice(0, 32);
  const salt = opciones.salt || crypto.getRandomValues(new Uint8Array(16));
  const prk = await hmac(salt, ikm);
  const cek = (await hmac(prk, unir(enc.encode("Content-Encoding: aes128gcm\0"), new Uint8Array([1])))).slice(0, 16);
  const nonce = (await hmac(prk, unir(enc.encode("Content-Encoding: nonce\0"), new Uint8Array([1])))).slice(0, 12);
  const k = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM" }, false, ["encrypt"]);
  const cifrado = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, k, unir(enc.encode(payload), new Uint8Array([2]))));
  const rs = new Uint8Array([0, 0, 16, 0]);   // 4096
  return unir(salt, rs, new Uint8Array([asPub.length]), asPub, cifrado);
}
async function jwtVapid(endpoint, vapid, contacto, ahora) {
  const aud = new URL(endpoint).origin;
  const key = await crypto.subtle.importKey("jwk", vapid.jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const cab = b64u(enc.encode(JSON.stringify({ typ: "JWT", alg: "ES256" }))), cue = b64u(enc.encode(JSON.stringify({ aud, exp: ahora + 12 * 3600, sub: contacto })));
  const firma = new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, enc.encode(cab + "." + cue)));
  return cab + "." + cue + "." + b64u(firma);
}
async function enviarPush(sub, datos, vapid, contacto, fetchFn, ahora) {
  const cuerpo = await cifrar(JSON.stringify(datos), sub.p256dh, sub.auth);
  const jwt = await jwtVapid(sub.endpoint, vapid, contacto, ahora);
  const r = await fetchFn(sub.endpoint, { method: "POST", headers: { Authorization: `vapid t=${jwt}, k=${vapid.pub}`, "Content-Encoding": "aes128gcm", "Content-Type": "application/octet-stream", TTL: "86400", Urgency: "high" }, body: cuerpo });
  return { ok: r.status >= 200 && r.status < 300, muerta: r.status === 404 || r.status === 410, status: r.status };
}

// ---------- FCM HTTP v1 (app de Android 1.3)
// Canal «avisos», ícono «ic_stat_ema» y color navy: son los que trae el APK 1.3. Tocar la notificación abre la hoja «vista».
const VISTA_DE = { reserva: "stock", sinstock: "stock", cambio: "stock", cambioresp: "stock", envio: "parte" };
function mensajeFcm(token, datos) {
  const tag = String(datos.tag || "ema").slice(0, 100);
  return {
    message: {
      token,
      notification: { title: datos.title, body: datos.body },
      data: { url: String(datos.url || "./"), tag, vista: String(datos.vista || "mistareas"), tipo: String(datos.tipo || "") },
      android: { priority: "high", ttl: "86400s", notification: { channel_id: "avisos", icon: "ic_stat_ema", color: "#28285E", tag, default_sound: true } }
    }
  };
}
async function enviarFcm(sub, datos, proyecto, token, fetchFn) {
  const r = await fetchFn(`https://fcm.googleapis.com/v1/projects/${proyecto}/messages:send`, { method: "POST", headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" }, body: JSON.stringify(mensajeFcm(sub.fcm, datos)) });
  if (r.ok) return { ok: true, status: r.status };
  let j = {}; try { j = await r.json(); } catch (e) { }
  const det = JSON.stringify((j.error && j.error.details) || []), est = (j.error && j.error.status) || "";
  // token que ya no sirve (desinstalaron la app, borraron datos, token de otro proyecto) → se borra la suscripción
  const muerta = r.status === 404 || /UNREGISTERED|SENDER_ID_MISMATCH/.test(det) || (r.status === 400 && est === "INVALID_ARGUMENT" && /token/i.test((j.error && j.error.message) || ""));
  return { ok: false, muerta, status: r.status, error: (j.error && j.error.message) || String(r.status) };
}

// ---------- una vuelta: mandar los avisos pendientes
const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
async function vuelta(env, dep = {}) {
  const fetchFn = dep.fetchFn || fetch, ahora = Math.floor((dep.ahora || Date.now()) / 1000);
  if (!env.FB_SA_JSON) return { ok: false, error: "falta la variable FB_SA_JSON (cuenta de servicio de Firebase)" };
  const sa = JSON.parse(env.FB_SA_JSON), proyecto = sa.project_id || env.PROYECTO || PROYECTO_DEF;
  const token = dep.token || await tokenGoogle(sa, ahora, fetchFn);
  const db = dep.db || firestore(proyecto, token, fetchFn);
  const contacto = env.CONTACTO || "mailto:avisos@ema-alumbrado.app";
  const avisos = (await db.consulta("avisosPush", ["enviado", "EQUAL", false], MAX_AVISOS)).sort((a, b) => (a.ts || 0) - (b.ts || 0));
  if (!avisos.length) return { ok: true, version: VERSION, avisos: 0, enviados: 0 };
  const subs = await db.consulta("pushSubs", null, 500);
  // la clave VAPID solo hace falta para los celulares de navegador (Web Push), y se lee una sola vez
  let vapid = null; const vapidDe = async () => vapid || (vapid = await clavesVapid(db));
  let enviados = 0, enviadosFcm = 0, borradas = 0; const muertas = new Set(), errores = [];
  for (const a of avisos) {
    const dest = subs.filter((s) => !muertas.has(s.id) && ((a.clave && norm(s.clave) === norm(a.clave)) || (a.email && String(s.email || "").toLowerCase() === String(a.email).toLowerCase()) || (a.uid && s.uid === a.uid)));
    const datos = { title: a.titulo || "Tarea de EMA", body: a.cuerpo || "", url: a.url || "./", tag: a.tag || ("ema-" + a.id), tipo: a.tipo || "", vista: a.vista || VISTA_DE[a.tipo] || "mistareas" };
    let ok = 0, okFcm = 0;
    for (const s of dest) {
      try {
        const esFcm = s.tipo === "fcm" && s.fcm;
        if (!esFcm && !(s.endpoint && s.p256dh && s.auth)) continue;
        const r = esFcm ? await enviarFcm(s, datos, proyecto, token, fetchFn) : await enviarPush(s, datos, await vapidDe(), contacto, fetchFn, ahora);
        if (r.ok) { ok++; if (esFcm) okFcm++; }
        else if (r.muerta) { muertas.add(s.id); await db.borrar("pushSubs/" + s.id); borradas++; }
        else if (errores.length < 5) errores.push((esFcm ? "fcm " : "web ") + r.status + (r.error ? ": " + r.error : ""));
      } catch (e) { if (errores.length < 5) errores.push(e.message); /* un celular que falla no frena a los demás */ }
    }
    enviados += ok; enviadosFcm += okFcm;
    await db.actualizar("avisosPush/" + a.id, { enviado: true, enviadoTs: ahora * 1000, celulares: ok, celularesFcm: okFcm });
  }
  return { ok: true, version: VERSION, avisos: avisos.length, enviados, enviadosFcm, borradas, errores };
}

const cors = (h = {}) => ({ "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", ...h });
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: cors({ "Content-Type": "application/json" }) });
export default {
  async fetch(request, env) {
    const u = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors() });
    try {
      if (u.pathname === "/salud") return json({ ok: true, version: VERSION, cuenta: !!env.FB_SA_JSON, cron: "cada minuto", fcm: true });
      if (u.pathname === "/vapid") {
        if (!env.FB_SA_JSON) return json({ ok: false, error: "falta FB_SA_JSON" }, 500);
        const sa = JSON.parse(env.FB_SA_JSON), db = firestore(sa.project_id || PROYECTO_DEF, await tokenGoogle(sa, Math.floor(Date.now() / 1000), fetch), fetch);
        const v = await clavesVapid(db);
        return json({ ok: true, publicKey: v.pub });
      }
      if (u.pathname === "/probar") return json(await vuelta(env));
      return json({ ok: false, error: "ruta desconocida" }, 404);
    } catch (e) { return json({ ok: false, error: /\b429\b/.test(e.message) ? "Firebase llegó al límite gratis de lecturas del día (429). Se destraba solo a la madrugada (≈ 05:00)." : e.message }, 500); }
  },
  async scheduled(event, env, ctx) { ctx.waitUntil(vuelta(env).catch((e) => console.log("vuelta: " + e.message))); }
};

export { vuelta, mensajeFcm, enviarFcm, VISTA_DE };
