// Worker «ema-ia» (Cloudflare) · Pase seguro entre la app y Claude para el «Asistente EMA» — EMA Servicios.
// v2-ia (v136): suma Claude Opus 5.5 y Claude Fable 5.2, el respaldo del servidor ante rechazos («fallbacks») y respuestas
// más largas (hasta 16.000 tokens con Opus y Fable). Los bloques de «pensamiento» que devuelve Claude pasan tal cual.
//
// Cómo funciona:
//  · La app manda cada pedido del asistente a  POST /ia  con su token de Firebase (Authorization: Bearer <ID token>).
//  · El Worker revisa el token (firma RS256 con las claves públicas de Google, aud/iss «alumbrado-stock»), saca el uid,
//    controla el límite de pedidos de esa persona, deja pasar SOLO los campos permitidos y se lo reenvía a la API de
//    Claude (Anthropic Messages API) con la clave que vive acá como Secret.
//  · Las herramientas (crear orden, cerrar orden, buscar obra…) NO corren acá: corren en la app, con los permisos de
//    quien pregunta. La app arma el ida y vuelta; este Worker solo reenvía cada pedido.
//  · Devuelve la respuesta de Claude tal cual, más  ema: {costoUsd}  (cuánto costó ese pedido, en dólares).
//
// Variables (Settings › Variables and Secrets):
//  · ANTHROPIC_API_KEY  (Secret, obligatoria) = la clave de platform.claude.com. Vive SOLO acá: nunca en la app ni en el repo.
//  · IA_POR_MINUTO      (opcional, texto)     = pedidos por minuto por persona (de entrada 20).
//  · IA_POR_DIA         (opcional, texto)     = pedidos por día por persona (de entrada 400).
// Ligadura opcional (Settings › Bindings › KV namespace):  IA_KV  → cuenta los pedidos bien aunque Cloudflare use varias
//  copias del Worker. Sin KV cuenta en memoria (aproximado: cada copia lleva su cuenta) y /salud lo avisa.
// Rutas: POST /ia · GET /salud.
// Reglas de la API para Opus 5.5 / Fable 5.2 / Sonnet 5.5 (las cumple este Worker aunque la app mande otra cosa):
//  · nunca temperature / top_p / top_k ni «thinking» (el pensamiento va siempre prendido: se controla con output_config.effort);
//  · tool_choice solo «auto» o «none» (forzar una herramienta da 400);
//  · «fallbacks: "default"» + cabecera anthropic-beta server-side-fallback-2026-07-01: si Claude rechaza el pedido por sus
//    filtros, el servidor lo reintenta solo con el modelo que recomienda. (Haiku no tiene respaldo: ahí no se manda.)
// Sin SDK y sin streaming: es un fetch directo, para poder pegarlo a mano en el panel de Cloudflare.

const VERSION = "v2b-ia";
const PROYECTO = "alumbrado-stock";
const API_URL = "https://api.anthropic.com/v1/messages";
// Versión de la API de Claude. La skill «claude-api» usa 2026-10-21 en todos sus ejemplos de HTTP directo.
// (Con esta versión NO se manda temperature/top_p/top_k: este Worker igual los descarta.)
const API_VERSION = "2026-10-21";
// Claves públicas de Google para los tokens de Firebase (las mismas que el x509 de securetoken, en formato JWK).
const CLAVES_URL = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";
const ORIGENES = ["https://miguelangelbasq-tech.github.io", "https://localhost"];
const TOPE_TOKENS = 4000;          // Haiku y Sonnet
const TOPE_TOKENS_PRO = 16000;     // Opus 5.5 y Fable 5.2: respuestas más largas (informes, revisiones)
const BETA_RESPALDO = "server-side-fallback-2026-07-01";
const BETAS_OK = [BETA_RESPALDO];
const TOPE_CUERPO = 5 * 1024 * 1024; // 5 MB por pedido, de sobra para texto (y alguna foto chica)
const ESFUERZOS = ["low", "medium", "high", "xhigh", "max"];

// Modelos permitidos y precio en US$ por millón de tokens: entrada / salida / lectura de caché.
// Escritura de caché = 1,25 × la entrada (lo que cobra Anthropic por guardar).
const MODELOS = {
  // Haiku: con más de 100.000 tokens de entrada en el pedido, Anthropic cobra 0,50 / 2,50.
  "claude-haiku-5-5": { ent: 0.10, sal: 0.50, cache: 0.01, largo: { desde: 100000, ent: 0.50, sal: 2.50, cache: 0.05 } },
  "claude-sonnet-5-5": { ent: 2, sal: 10, cache: 0.10, respaldo: true },
  "claude-opus-5-5": { ent: 4, sal: 20, cache: 0.20, respaldo: true, pro: true },
  "claude-fable-5-2": { ent: 8, sal: 40, cache: 0.20, respaldo: true, pro: true },
};
// Modelos que puede usar el respaldo del servidor cuando rechaza (no se pueden pedir: solo para calcular el costo)
const PRECIO_RESPALDO = {
  "claude-opus-5": { ent: 5, sal: 25, cache: 0.50 },
  "claude-opus-4-8": { ent: 5, sal: 25, cache: 0.50 },
  "claude-sonnet-5": { ent: 2, sal: 10, cache: 0.20 },
};

const enc = new TextEncoder();
const deB64u = (s) => { s = String(s).replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; const bin = atob(s), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; };
const leerJson = (s) => JSON.parse(new TextDecoder().decode(deB64u(s)));

// ---------- CORS: solo la app publicada en GitHub Pages y la app de Android (https://localhost)
function cabCors(origen) {
  const h = { "Vary": "Origin" };
  if (origen && ORIGENES.includes(origen)) {
    h["Access-Control-Allow-Origin"] = origen;
    h["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    h["Access-Control-Allow-Headers"] = "Authorization, Content-Type";
    h["Access-Control-Max-Age"] = "86400";
  }
  return h;
}
const json = (o, s, origen) => new Response(JSON.stringify(o), { status: s || 200, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...cabCors(origen) } });
const error = (tipo, mensaje, s, origen) => json({ error: { tipo, mensaje } }, s, origen);

// ---------- Token de Firebase (ID token): RS256 firmado por Google
let claves = { jwks: null, hasta: 0 };
async function clavesGoogle(ahoraMs, forzar) {
  if (!forzar && claves.jwks && claves.hasta > ahoraMs) return claves.jwks;
  const r = await fetch(CLAVES_URL);
  if (!r.ok) throw new Error("no se pudieron bajar las claves de Google (" + r.status + ")");
  const j = await r.json();
  const m = /max-age=(\d+)/.exec(r.headers.get("Cache-Control") || "");
  const seg = m ? Math.min(+m[1], 6 * 3600) : 3600; // como mucho 6 h guardadas
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

// ---------- Límite de pedidos por persona (por minuto y por día, día de Argentina UTC−3)
const memoria = new Map(); // sin KV: clave → {n, vence}
function numEnv(v, def) { const n = parseInt(v, 10); return n > 0 ? n : def; }
async function contar(env, uid) {
  const porMin = numEnv(env.IA_POR_MINUTO, 20), porDia = numEnv(env.IA_POR_DIA, 400);
  const ahora = Date.now(), minuto = Math.floor(ahora / 60000);
  const dia = new Date(ahora - 3 * 3600 * 1000).toISOString().slice(0, 10);
  const kMin = "m:" + uid + ":" + minuto, kDia = "d:" + uid + ":" + dia;
  if (env.IA_KV) {
    const [a, b] = await Promise.all([env.IA_KV.get(kMin), env.IA_KV.get(kDia)]);
    const nMin = +(a || 0), nDia = +(b || 0);
    if (nMin >= porMin) return { ok: false, cual: "minuto", tope: porMin };
    if (nDia >= porDia) return { ok: false, cual: "dia", tope: porDia };
    await Promise.all([
      env.IA_KV.put(kMin, String(nMin + 1), { expirationTtl: 120 }),
      env.IA_KV.put(kDia, String(nDia + 1), { expirationTtl: 2 * 86400 }),
    ]);
    return { ok: true };
  }
  if (memoria.size > 5000) for (const [k, v] of memoria) if (v.vence < ahora) memoria.delete(k); // limpieza
  const m = memoria.get(kMin) || { n: 0, vence: ahora + 120000 }, d = memoria.get(kDia) || { n: 0, vence: ahora + 2 * 86400000 };
  if (m.n >= porMin) return { ok: false, cual: "minuto", tope: porMin };
  if (d.n >= porDia) return { ok: false, cual: "dia", tope: porDia };
  m.n++; d.n++; memoria.set(kMin, m); memoria.set(kDia, d);
  return { ok: true };
}

// ---------- Armar el pedido para Claude: solo los campos permitidos
function armarPedido(b) {
  if (!b || typeof b !== "object" || Array.isArray(b)) return { err: "El pedido no tiene la forma esperada." };
  if (!MODELOS[b.model]) return { err: "Ese modelo no está permitido. Usá " + Object.keys(MODELOS).map((m) => "«" + m + "»").join(", ") + "." };
  const M = MODELOS[b.model], tope = M.pro ? TOPE_TOKENS_PRO : TOPE_TOKENS;
  if (!Array.isArray(b.messages) || !b.messages.length) return { err: "Falta la conversación (messages)." };
  const p = { model: b.model, messages: b.messages };
  let mt = parseInt(b.max_tokens, 10);
  if (!(mt > 0)) mt = tope;
  p.max_tokens = Math.min(mt, tope);
  if (typeof b.system === "string" || Array.isArray(b.system)) p.system = b.system;
  if (Array.isArray(b.tools)) p.tools = b.tools;
  if (b.tool_choice != null) {
    const tipo = typeof b.tool_choice === "string" ? b.tool_choice : b.tool_choice && b.tool_choice.type;
    if (tipo !== "auto" && tipo !== "none") return { err: "tool_choice solo puede ser «auto» o «none»." };
    p.tool_choice = { type: tipo };
    if (tipo === "auto" && b.tool_choice.disable_parallel_tool_use === true) p.tool_choice.disable_parallel_tool_use = true;
  }
  const ef = b.output_config && b.output_config.effort;
  if (ESFUERZOS.includes(ef)) p.output_config = { effort: ef };
  if (b.cache_control && typeof b.cache_control === "object" && b.cache_control.type === "ephemeral") {
    p.cache_control = { type: "ephemeral" };
    if (b.cache_control.ttl === "5m" || b.cache_control.ttl === "1h") p.cache_control.ttl = b.cache_control.ttl;
  }
  // respaldo del servidor ante rechazos: solo la forma «default» y solo en los modelos que lo tienen
  const betas = [];
  if (b.fallbacks != null) {
    if (b.fallbacks !== "default") return { err: "fallbacks solo puede ser «default»." };
    if (M.respaldo) { p.fallbacks = "default"; betas.push(BETA_RESPALDO); }
  }
  if (Array.isArray(b.betas)) b.betas.forEach((x) => { if (BETAS_OK.includes(x) && !betas.includes(x) && (x !== BETA_RESPALDO || p.fallbacks)) betas.push(x); });
  // «thinking», temperature, top_p, top_k, stream, metadata y todo lo demás NO pasan.
  return { p, betas };
}

// ---------- Costo en dólares según el «usage» de la respuesta
function costoUno(modelo, u) {
  let pr = MODELOS[modelo] || PRECIO_RESPALDO[modelo];
  if (!pr || !u) return 0;
  const ent = +u.input_tokens || 0, sal = +u.output_tokens || 0;
  const lee = +u.cache_read_input_tokens || 0, escribe = +u.cache_creation_input_tokens || 0;
  if (pr.largo && ent + lee + escribe > pr.largo.desde) pr = pr.largo;
  const cache = pr.cache != null ? pr.cache : pr.ent * 0.10;
  return (ent * pr.ent + escribe * pr.ent * 1.25 + lee * cache + sal * pr.sal) / 1e6;
}
// Con el respaldo del servidor, usage.iterations trae cada intento (el rechazado y el del modelo de respaldo).
function costoDe(modelo, u) {
  if (!u) return 0;
  let usd = 0;
  if (Array.isArray(u.iterations) && u.iterations.length) u.iterations.forEach((it) => { usd += costoUno((it && it.model) || modelo, it); });
  else usd = costoUno(modelo, u);
  return Math.round(usd * 1e6) / 1e6; // 6 decimales
}

// ---------- Errores de Claude → mensaje en castellano simple (nunca la clave ni las cabeceras)
function errorClaude(status, j) {
  const tipo = (j && j.error && j.error.type) || "";
  if (status === 429) return ["limite_claude", "Claude está recibiendo demasiados pedidos. Esperá un minuto y probá de nuevo.", 429];
  if (status === 529 || tipo === "overloaded_error") return ["ocupado", "Claude está muy ocupado en este momento. Probá de nuevo en un rato.", 503];
  if (status === 400) return ["pedido", "Claude no entendió el pedido (faltan datos o hay algo mal armado).", 400];
  if (status === 401 || status === 403) return ["clave", "La clave del asistente no funciona. Avisale a la oficina.", 502];
  if (status === 402) return ["saldo", "El asistente se quedó sin saldo. Avisale a la oficina.", 502];
  if (status === 404) return ["modelo", "Ese modelo no está disponible para esta cuenta.", 502];
  if (status === 413) return ["grande", "El pedido es demasiado grande. Probá con menos texto o menos fotos.", 413];
  return ["claude", "Claude tuvo un problema. Probá de nuevo en un rato.", 502];
}

async function pedidoIa(request, env, origen) {
  if (!env.ANTHROPIC_API_KEY) return error("sin_clave", "Falta cargar la clave del asistente en el Worker.", 500, origen);
  const m = /^Bearer\s+(.+)$/i.exec(request.headers.get("Authorization") || "");
  const uid = m ? await verificarToken(m[1].trim()) : null;
  if (!uid) return error("token", "Tu sesión no es válida. Cerrá y volvé a entrar a la app.", 401, origen);

  const largo = +(request.headers.get("Content-Length") || 0);
  if (largo > TOPE_CUERPO) return error("grande", "El pedido es demasiado grande.", 413, origen);
  const texto = await request.text();
  if (texto.length > TOPE_CUERPO) return error("grande", "El pedido es demasiado grande.", 413, origen);
  let cuerpo;
  try { cuerpo = JSON.parse(texto); } catch (e) { return error("pedido", "El pedido no es JSON válido.", 400, origen); }
  const { p, betas, err } = armarPedido(cuerpo);
  if (err) return error("pedido", err, 400, origen);

  const lim = await contar(env, uid);
  if (!lim.ok) return error("limite", lim.cual === "minuto" ? `Llegaste a ${lim.tope} pedidos por minuto. Esperá un ratito.` : `Llegaste a ${lim.tope} pedidos por hoy. Mañana se renueva.`, 429, origen);

  // v2b: si Claude devuelve 400, se reintenta con el pedido más simple (sin respaldo del servidor, sin caché automática,
  // sin bloques de pensamiento viejos) y, si sigue, se devuelve el motivo exacto en «detalle» (nunca la clave ni las cabeceras).
  const mandar = async (pp, bb) => {
    const cab = { "Content-Type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": API_VERSION };
    if (bb && bb.length) cab["anthropic-beta"] = bb.join(",");
    const rr = await fetch(API_URL, { method: "POST", headers: cab, body: JSON.stringify(pp) });
    let jj = null; try { jj = await rr.json(); } catch (e) { jj = null; }
    return { rr, jj };
  };
  const msj = (jj) => { let s = String((jj && jj.error && jj.error.message) || ""); if (env.ANTHROPIC_API_KEY) s = s.split(env.ANTHROPIC_API_KEY).join("[clave]"); return s.replace(/sk-ant[\w-]*/g, "[clave]").replace(/x-api-key/gi, "[cabecera]").slice(0, 400); };
  let r, j, detalle = "";
  try {
    ({ rr: r, jj: j } = await mandar(p, betas));
    if (r.status === 400) {
      detalle = msj(j); console.log("ema-ia 400 (1):", detalle);
      const p2 = Object.assign({}, p); delete p2.fallbacks; delete p2.cache_control;
      ({ rr: r, jj: j } = await mandar(p2, []));
      if (r.status === 400) {
        detalle = msj(j) || detalle; console.log("ema-ia 400 (2):", detalle);
        const p3 = Object.assign({}, p2);
        p3.messages = (p2.messages || []).map((m) => Array.isArray(m.content) ? Object.assign({}, m, { content: m.content.filter((b) => !b || (b.type !== "thinking" && b.type !== "redacted_thinking" && b.type !== "fallback")) }) : m).filter((m) => !Array.isArray(m.content) || m.content.length);
        ({ rr: r, jj: j } = await mandar(p3, []));
        if (r.status === 400) { detalle = msj(j) || detalle; console.log("ema-ia 400 (3):", detalle); }
      }
    }
  } catch (e) { return error("red", "No se pudo hablar con Claude. Probá de nuevo en un rato.", 502, origen); }
  if (!r.ok || !j || j.type === "error") {
    const [tipo, mensaje, s] = errorClaude(r.ok ? 502 : r.status, j);
    const res = { error: { tipo, mensaje } }; if (r.status === 400 && (msj(j) || detalle)) res.error.detalle = msj(j) || detalle;
    return json(res, s, origen);
  }
  // la respuesta va tal cual (también los bloques «thinking» y «fallback», que la app devuelve sin tocar)
  j.ema = { costoUsd: costoDe(j.model && (MODELOS[j.model] || PRECIO_RESPALDO[j.model]) ? j.model : p.model, j.usage), modelo: j.model || p.model };
  return json(j, 200, origen);
}

export default {
  async fetch(request, env) {
    const u = new URL(request.url), origen = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") return new Response(null, { status: ORIGENES.includes(origen) ? 204 : 403, headers: cabCors(origen) });
    try {
      if (u.pathname === "/salud" && request.method === "GET") {
        return json({ ok: true, version: VERSION, modelos: Object.keys(MODELOS), respaldo: true, clave: !!env.ANTHROPIC_API_KEY, kv: !!env.IA_KV, ...(env.IA_KV ? {} : { aviso: "Sin KV: el límite por persona se cuenta en memoria (aproximado)." }) }, 200, origen);
      }
      if (u.pathname === "/ia") {
        if (request.method !== "POST") return error("metodo", "Usá POST.", 405, origen);
        if (origen && !ORIGENES.includes(origen)) return error("origen", "Origen no permitido.", 403, origen);
        return await pedidoIa(request, env, origen);
      }
      return error("ruta", "Ruta desconocida.", 404, origen);
    } catch (e) {
      // Nunca se devuelve el detalle interno (podría arrastrar cabeceras): solo un mensaje simple.
      return error("interno", "Hubo un problema en el Worker. Probá de nuevo en un rato.", 500, origen);
    }
  },
};

export { costoDe, armarPedido, MODELOS };
