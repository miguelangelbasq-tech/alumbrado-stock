// Worker «ema-ia» (Cloudflare) · Pase seguro entre la app y Claude para el «Asistente EMA» — EMA Servicios.
// v3-ia (v141): topes por persona y por día según el ROL que dice la base (no el que manda la app), preguntas y remitos
// contados aparte, freno del gasto del mes (pausa al 80 % y corte al 95 % de 100 USD, configurable) y las rutas
// GET /uso (Administración y Oficina) y GET /mio (cuánto le queda a cada uno).
// v2-ia (v136): suma Claude Opus 5.5 y Claude Fable 5.2, el respaldo del servidor ante rechazos («fallbacks») y respuestas
// más largas (hasta 16.000 tokens con Opus y Fable). Los bloques de «pensamiento» que devuelve Claude pasan tal cual.
//
// Cómo funciona:
//  · La app manda cada pedido del asistente a  POST /ia  con su token de Firebase (Authorization: Bearer <ID token>).
//  · El Worker revisa el token (firma RS256 con las claves públicas de Google, aud/iss «alumbrado-stock»), saca el uid,
//    lee con ESE MISMO token la ficha de la persona en Firestore (usuarios/{uid}: rol, activo, pendiente) y los límites
//    (configEquipo/personal → asistente.limites y asistente.roles). Las reglas de Firebase ya dejan leer las dos cosas
//    (cada uno su ficha; configEquipo/personal cualquier usuario confirmado). Se guardan 10 minutos (KV o memoria).
//    El rol que mande la app NO se usa para nada.
//  · Controla los topes de esa persona (preguntas y remitos por día, aparte) y el freno del mes, deja pasar SOLO los campos
//    permitidos y se lo reenvía a la API de Claude (Anthropic Messages API) con la clave que vive acá como Secret.
//  · Las herramientas (crear orden, cerrar orden, buscar obra…) NO corren acá: corren en la app, con los permisos de
//    quien pregunta. La app arma el ida y vuelta; este Worker solo reenvía cada pedido.
//  · Devuelve la respuesta de Claude tal cual, más  ema: {costoUsd, modelo, version, uso, freno}.
//
// Cómo cuenta (día y mes de Argentina, UTC−3):
//  · Pregunta = un pedido cuyo último mensaje es texto de la persona (las vueltas de herramientas de esa misma pregunta no
//    suman). Remito = pedido con ema.tipo "remito" que trae una foto o un PDF y ninguna herramienta (varias hojas o un PDF
//    en un pedido = 1 remito). Supervisor = ema.tipo "supervisor" de Administración u Oficina: no cuenta para nadie pero
//    suma al gasto del mes. Todo lo demás cuenta como pregunta.
//  · Gasto del mes = suma de ema.costoUsd de cada respuesta. Al llegar a la «pausa» (80 % del tope) se pausan Pañol,
//    Cuadrilla, Operario y Solo mirar y la primera respuesta que lo cruza trae ema.freno.avisar = true (una vez por mes) para
//    que la app le avise a Administración. Al llegar al «corte» (95 %) se corta para todos menos Administración. El día 1 empieza de cero.
//
// Variables (Settings › Variables and Secrets):
//  · ANTHROPIC_API_KEY  (Secret, obligatoria) = la clave de platform.claude.com. Vive SOLO acá: nunca en la app ni en el repo.
//  · IA_POR_MINUTO      (opcional, texto)     = pedidos por minuto por persona (de entrada 20).
//  · IA_POR_DIA         (opcional, texto)     = pedidos por día por persona, contando las vueltas (de entrada 400).
//  · IA_TOPE_MES        (opcional, texto)     = tope de gasto del mes en US$ si la app no guardó otro (de entrada 100).
//  · IA_PAUSA_PCT / IA_CORTE_PCT (opcionales) = % del tope para la pausa y el corte (de entrada 80 y 95).
//  · IA_LIMITES         (opcional, JSON)      = topes por rol si la app no guardó otros, ej. {"oficina":{"preguntas":30,"remitos":40}}.
// Ligadura recomendada (Settings › Bindings › KV namespace):  IA_KV  → cuenta bien aunque Cloudflare use varias copias del
//  Worker. Sin KV cuenta en memoria (aproximado: cada copia lleva su cuenta) y /salud lo avisa.
// Rutas: POST /ia · GET /salud · GET /uso (Administración y Oficina) · GET /mio.
// Reglas de la API para Opus 5.5 / Fable 5.2 / Sonnet 5.5 (las cumple este Worker aunque la app mande otra cosa):
//  · nunca temperature / top_p / top_k ni «thinking» (el pensamiento va siempre prendido: se controla con output_config.effort);
//  · tool_choice solo «auto» o «none» (forzar una herramienta da 400);
//  · «fallbacks: "default"» + cabecera anthropic-beta server-side-fallback-2026-07-01: si Claude rechaza el pedido por sus
//    filtros, el servidor lo reintenta solo con el modelo que recomienda. (Haiku no tiene respaldo: ahí no se manda.)
// Sin SDK y sin streaming: es un fetch directo, para poder pegarlo a mano en el panel de Cloudflare.

const VERSION = "v3-ia";

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

// ---------- Fechas de Argentina (UTC−3)
const diaAr = (ms) => new Date((ms == null ? Date.now() : ms) - 3 * 3600 * 1000).toISOString().slice(0, 10);
const mesAr = (ms) => diaAr(ms).slice(0, 7);
function numEnv(v, def) { const n = parseInt(v, 10); return n > 0 ? n : def; }
const numOk = (v) => { const n = Number(v); return isFinite(n) && n >= 0 ? n : null; };

// ---------- Guardado: KV si está ligado (exacto), si no memoria de esta copia del Worker (aproximado)
const memoria = new Map(); // clave → {v, vence}
async function guardadoLeer(env, k) {
  if (env.IA_KV) { const s = await env.IA_KV.get(k); if (s == null) return null; try { return JSON.parse(s); } catch (e) { return null; } }
  const m = memoria.get(k); if (!m) return null; if (m.vence < Date.now()) { memoria.delete(k); return null; } return m.v;
}
async function guardadoPoner(env, k, v, seg) {
  if (env.IA_KV) return env.IA_KV.put(k, JSON.stringify(v), { expirationTtl: Math.max(60, seg) });
  if (memoria.size > 5000) for (const [a, b] of memoria) if (b.vence < Date.now()) memoria.delete(a); // limpieza
  memoria.set(k, { v, vence: Date.now() + seg * 1000 });
}

// ---------- Firestore por REST con el token de la persona (las reglas deciden qué puede leer)
const FS = "https://firestore.googleapis.com/v1/projects/" + PROYECTO + "/databases/(default)/documents/";
function deFs(v) {
  if (!v || typeof v != "object") return null;
  if ("stringValue" in v) return v.stringValue;
  if ("booleanValue" in v) return !!v.booleanValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return Number(v.doubleValue);
  if ("nullValue" in v) return null;
  if ("timestampValue" in v) return v.timestampValue;
  if ("mapValue" in v) { const o = {}, f = (v.mapValue && v.mapValue.fields) || {}; Object.keys(f).forEach((k) => { o[k] = deFs(f[k]); }); return o; }
  if ("arrayValue" in v) return ((v.arrayValue && v.arrayValue.values) || []).map(deFs);
  return null;
}
async function leerDoc(ruta, token, campos) {
  const q = campos && campos.length ? "?" + campos.map((c) => "mask.fieldPaths=" + encodeURIComponent(c)).join("&") : "";
  const r = await fetch(FS + ruta + q, { headers: { Authorization: "Bearer " + token } });
  if (r.status === 404) return {};
  if (!r.ok) throw new Error("firestore " + r.status);
  const j = await r.json();
  return deFs({ mapValue: { fields: (j && j.fields) || {} } }) || {};
}

// ---------- Quién es (rol leído de la base, nunca de la app). 10 min guardado.
const ROLES = ["admin", "oficina", "panol", "cuadrilla", "operario", "mirar"];
async function quienEs(env, uid, token) {
  const k = "rol:" + uid, ya = await guardadoLeer(env, k);
  if (ya && ya.rol) return ya;
  let u = null, dudoso = false;
  try { u = await leerDoc("usuarios/" + encodeURIComponent(uid), token, ["rol", "activo", "pendiente", "nombre", "usuario", "persona"]); }
  catch (e) { u = {}; dudoso = true; }
  const rol = ROLES.includes(u.rol) ? u.rol : "mirar";
  const yo = { rol, activo: u.activo !== false, pendiente: u.pendiente === true, nombre: String(u.nombre || u.persona || u.usuario || "").slice(0, 60) };
  if (!dudoso) await guardadoPoner(env, k, yo, 600); // si la base no contestó, no se guarda: se vuelve a probar en el próximo pedido
  if (dudoso) yo.dudoso = true; // se usan los topes de «Solo mirar» (los más chicos) hasta que la base conteste
  return yo;
}

// ---------- Límites: configEquipo/personal → asistente.limites / asistente.roles; si no hay, variables del Worker; si no, estos
const LIM_DEF = {
  // null = sin tope · 0 = no puede
  roles: { admin: { preguntas: null, remitos: null }, oficina: { preguntas: 30, remitos: 40 }, panol: { preguntas: 20, remitos: 40 }, cuadrilla: { preguntas: 10, remitos: 0 }, operario: { preguntas: 10, remitos: 0 }, mirar: { preguntas: 10, remitos: 0 } },
  mes: { tope: 100, pausaPct: 80, cortePct: 95 },
};
const PAUSADOS = ["panol", "cuadrilla", "operario", "mirar"];
function limitesBase(env) {
  const L = JSON.parse(JSON.stringify(LIM_DEF));
  try { const x = env.IA_LIMITES ? JSON.parse(env.IA_LIMITES) : null; if (x && typeof x == "object") Object.keys(x).forEach((r) => { if (L.roles[r] && x[r]) Object.assign(L.roles[r], x[r]); }); } catch (e) { }
  L.mes.tope = numEnv(env.IA_TOPE_MES, L.mes.tope); L.mes.pausaPct = numEnv(env.IA_PAUSA_PCT, L.mes.pausaPct); L.mes.cortePct = numEnv(env.IA_CORTE_PCT, L.mes.cortePct);
  return L;
}
function mezclar(L, a) {
  if (!a || typeof a != "object") return L;
  const lim = a.limites && typeof a.limites == "object" ? a.limites : null;
  if (lim && lim.roles && typeof lim.roles == "object") Object.keys(L.roles).forEach((r) => {
    const x = lim.roles[r]; if (!x || typeof x != "object" || r === "admin") return; // Administración: siempre sin tope
    ["preguntas", "remitos"].forEach((c) => { if (c in x) L.roles[r][c] = x[c] === null || x[c] === "" ? null : numOk(x[c]) == null ? L.roles[r][c] : Math.floor(numOk(x[c])); });
  });
  if (lim && lim.mes && typeof lim.mes == "object") {
    const t = numOk(lim.mes.tope), p = numOk(lim.mes.pausaPct), c = numOk(lim.mes.cortePct);
    if (t > 0) L.mes.tope = t; if (p > 0 && p <= 100) L.mes.pausaPct = p; if (c > 0 && c <= 100) L.mes.cortePct = c;
  }
  if (Array.isArray(a.roles) && a.roles.length) L.habilitados = a.roles.filter((r) => ROLES.includes(r)).concat(["admin"]);
  return L;
}
async function limites(env, token) {
  const ya = await guardadoLeer(env, "cfg:limites");
  if (ya && ya.roles) return ya;
  let a = null, ok = true;
  try { const d = await leerDoc("configEquipo/personal", token, ["asistente"]); a = d.asistente || null; } catch (e) { ok = false; }
  const L = mezclar(limitesBase(env), a);
  if (ok) await guardadoPoner(env, "cfg:limites", L, 600);
  return L;
}
const topeDe = (L, rol, c) => { const r = L.roles[rol] || L.roles.mirar; return r[c] == null ? null : r[c]; };
function nivelMes(L, usd) {
  const pausa = L.mes.tope * L.mes.pausaPct / 100, corte = L.mes.tope * L.mes.cortePct / 100;
  return { nivel: usd >= corte ? "corte" : usd >= pausa ? "pausa" : "", pausa: Math.round(pausa * 100) / 100, corte: Math.round(corte * 100) / 100 };
}

// ---------- Cuentas: por persona y día  d:<uid>:<día> = {n pedidos, q preguntas, r remitos}
//                     del mes          g:<mes>       = {usd, partes{preguntas, remitos, supervisor}, personas{uid:{…}}, aviso}
const vacioMes = () => ({ usd: 0, partes: { preguntas: 0, remitos: 0, supervisor: 0 }, personas: {}, aviso: false });
async function leerMes(env, mes) { const g = await guardadoLeer(env, "g:" + mes); return g && g.partes ? g : vacioMes(); }
async function leerDia(env, uid, dia) { const d = await guardadoLeer(env, "d:" + uid + ":" + dia); return d && typeof d == "object" ? d : { n: 0, q: 0, r: 0 }; }
const r6 = (n) => Math.round(n * 1e6) / 1e6;

// Pregunta nueva = el último mensaje es de la persona y trae texto (no solo resultados de herramientas)
function esNueva(p) {
  const u = p.messages[p.messages.length - 1];
  if (!u || u.role !== "user") return true;
  if (!Array.isArray(u.content)) return true;
  return !u.content.length || !u.content.every((b) => b && b.type === "tool_result");
}
function clasificar(cuerpo, p, rol) {
  const t = cuerpo && cuerpo.ema && typeof cuerpo.ema == "object" ? String(cuerpo.ema.tipo || "") : "";
  const u = p.messages[p.messages.length - 1];
  const archivo = !!(u && Array.isArray(u.content) && u.content.some((b) => b && (b.type === "image" || b.type === "document")));
  if (t === "remito" && archivo && !p.tools) return "remito";
  if (t === "supervisor" && (rol === "admin" || rol === "oficina")) return "supervisor";
  return "pregunta";
}
const ROL_TXT = { admin: "Administración", oficina: "Oficina", panol: "Pañol", cuadrilla: "Cuadrilla", operario: "Operario", mirar: "Solo mirar" };

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

// ---------- Pedidos por minuto (en memoria de esta copia: es solo un freno contra ráfagas)
const porMinuto = new Map();
function minutoOk(env, uid) {
  const tope = numEnv(env.IA_POR_MINUTO, 20), ahora = Date.now(), k = uid + ":" + Math.floor(ahora / 60000);
  if (porMinuto.size > 5000) for (const [a, b] of porMinuto) if (b.vence < ahora) porMinuto.delete(a);
  const m = porMinuto.get(k) || { n: 0, vence: ahora + 120000 };
  if (m.n >= tope) return { ok: false, tope };
  m.n++; porMinuto.set(k, m); return { ok: true };
}

// ---------- Token + quién es (para /ia, /uso y /mio)
async function identificar(request, env) {
  const m = /^Bearer\s+(.+)$/i.exec(request.headers.get("Authorization") || "");
  const token = m ? m[1].trim() : "";
  const uid = token ? await verificarToken(token) : null;
  if (!uid) return { err: ["token", "Tu sesión no es válida. Cerrá y volvé a entrar a la app.", 401] };
  const yo = await quienEs(env, uid, token);
  if (!yo.activo || yo.pendiente) return { err: ["usuario", "Tu usuario todavía no está habilitado (o está dado de baja). Pedíselo a Administración.", 403] };
  return { uid, token, yo };
}
const plata = (n) => "US$ " + (Math.round((Number(n) || 0) * 100) / 100).toFixed(2).replace(".", ",");

async function pedidoIa(request, env, origen) {
  if (!env.ANTHROPIC_API_KEY) return error("sin_clave", "Falta cargar la clave del asistente en el Worker.", 500, origen);
  const largo = +(request.headers.get("Content-Length") || 0);
  if (largo > TOPE_CUERPO) return error("grande", "El pedido es demasiado grande.", 413, origen);
  const id = await identificar(request, env);
  if (id.err) return error(id.err[0], id.err[1], id.err[2], origen);
  const { uid, token, yo } = id, rol = yo.rol;

  const texto = await request.text();
  if (texto.length > TOPE_CUERPO) return error("grande", "El pedido es demasiado grande.", 413, origen);
  let cuerpo;
  try { cuerpo = JSON.parse(texto); } catch (e) { return error("pedido", "El pedido no es JSON válido.", 400, origen); }
  const { p, betas, err } = armarPedido(cuerpo);
  if (err) return error("pedido", err, 400, origen);

  const L = await limites(env, token);
  if (L.habilitados && !L.habilitados.includes(rol)) return error("rol_apagado", "El asistente no está prendido para tu usuario. Si lo necesitás, pedíselo a Administración.", 403, origen);
  const tipo = clasificar(cuerpo, p, rol), nueva = tipo === "pregunta" && esNueva(p);

  const mm = minutoOk(env, uid);
  if (!mm.ok) return error("limite", `Llegaste a ${mm.tope} pedidos por minuto. Esperá un ratito.`, 429, origen);
  const ahora = Date.now(), dia = diaAr(ahora), mes = mesAr(ahora);
  const [D, G] = await Promise.all([leerDia(env, uid, dia), leerMes(env, mes)]);
  const porDia = numEnv(env.IA_POR_DIA, 400);
  if (D.n >= porDia) return error("limite", `Llegaste a ${porDia} pedidos por hoy. Mañana se renueva.`, 429, origen);

  // freno del mes
  const nv = nivelMes(L, G.usd);
  if (nv.nivel === "corte" && rol !== "admin") return error("tope_mes", "El asistente llegó al tope de gasto del mes. Se renueva el día 1.", 429, origen);
  if (nv.nivel === "pausa" && PAUSADOS.includes(rol)) return error("tope_mes", "El asistente está en pausa para tu usuario hasta el día 1: se llegó al " + L.mes.pausaPct + " % del gasto del mes.", 429, origen);
  // topes del día (preguntas y remitos aparte)
  const tq = topeDe(L, rol, "preguntas"), tr = topeDe(L, rol, "remitos");
  if (nueva && tq != null && D.q >= tq) return error("tope_dia", tq ? `Llegaste a tus ${tq} preguntas de hoy. Mañana se renuevan.` : "Con tu usuario el asistente no contesta preguntas. Pedíselo a Administración.", 429, origen);
  if (tipo === "remito" && tr != null && D.r >= tr) return error("tope_remitos", tr ? `Llegaste a tus ${tr} remitos de hoy. Mañana se renuevan.` : "Con tu usuario no se pueden leer remitos con la IA.", 429, origen);

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
  const contarPedido = (ok) => guardadoPoner(env, "d:" + uid + ":" + dia, { n: D.n + 1, q: D.q + (ok && nueva ? 1 : 0), r: D.r + (ok && tipo === "remito" ? 1 : 0) }, 2 * 86400);
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
  } catch (e) { await contarPedido(false); return error("red", "No se pudo hablar con Claude. Probá de nuevo en un rato.", 502, origen); }
  if (!r.ok || !j || j.type === "error") {
    await contarPedido(false);
    const [tipoE, mensaje, s] = errorClaude(r.ok ? 502 : r.status, j);
    const res = { error: { tipo: tipoE, mensaje } }; if (r.status === 400 && (msj(j) || detalle)) res.error.detalle = msj(j) || detalle;
    return json(res, s, origen);
  }
  // cuentas: la persona (día) y el gasto del mes (lo que costó, aunque sea el supervisor)
  const costo = costoDe(j.model && (MODELOS[j.model] || PRECIO_RESPALDO[j.model]) ? j.model : p.model, j.usage);
  await contarPedido(true);
  const G2 = await leerMes(env, mes); // se vuelve a leer: puede haber cambiado mientras Claude contestaba
  G2.usd = r6(G2.usd + costo);
  const parte = tipo === "remito" ? "remitos" : tipo === "supervisor" ? "supervisor" : "preguntas";
  G2.partes[parte] = r6((G2.partes[parte] || 0) + costo);
  const P = G2.personas[uid] || { nombre: yo.nombre, rol, q: 0, r: 0, usd: 0, hoy: { dia, q: 0, r: 0 } };
  if (!P.hoy || P.hoy.dia !== dia) P.hoy = { dia, q: 0, r: 0 };
  P.nombre = yo.nombre || P.nombre; P.rol = rol; P.usd = r6((P.usd || 0) + costo);
  if (nueva) { P.q = (P.q || 0) + 1; P.hoy.q++; }
  if (tipo === "remito") { P.r = (P.r || 0) + 1; P.hoy.r++; }
  G2.personas[uid] = P;
  const nv2 = nivelMes(L, G2.usd);
  let avisar = false;
  if (nv2.nivel && !G2.aviso) { G2.aviso = true; avisar = true; } // una vez por mes: la app le avisa a Administración
  await guardadoPoner(env, "g:" + mes, G2, 40 * 86400);
  const qHoy = D.q + (nueva ? 1 : 0), rHoy = D.r + (tipo === "remito" ? 1 : 0);
  const of = rol === "admin" || rol === "oficina";
  // la respuesta va tal cual (también los bloques «thinking» y «fallback», que la app devuelve sin tocar)
  j.ema = {
    costoUsd: costo, modelo: j.model || p.model, version: VERSION,
    uso: { rol, tipo, preguntasHoy: qHoy, topePreguntas: tq, remitosHoy: rHoy, topeRemitos: tr, quedanPreguntas: tq == null ? null : Math.max(0, tq - qHoy), quedanRemitos: tr == null ? null : Math.max(0, tr - rHoy) },
    freno: Object.assign({ nivel: nv2.nivel, avisar }, of || avisar ? { gastoMes: G2.usd, tope: L.mes.tope, pausa: nv2.pausa, corte: nv2.corte } : {}),
  };
  return json(j, 200, origen);
}

// ---------- GET /uso: el gasto del mes y por persona (solo Administración y Oficina, por el rol que dice la base)
async function uso(request, env, origen) {
  const id = await identificar(request, env);
  if (id.err) return error(id.err[0], id.err[1], id.err[2], origen);
  if (id.yo.rol !== "admin" && id.yo.rol !== "oficina") return error("permiso", "Esto lo ven solo Administración y Oficina.", 403, origen);
  const L = await limites(env, id.token), ahora = Date.now(), dia = diaAr(ahora), mes = mesAr(ahora), G = await leerMes(env, mes), nv = nivelMes(L, G.usd);
  const personas = Object.keys(G.personas).map((u) => { const x = G.personas[u], h = x.hoy && x.hoy.dia === dia ? x.hoy : { q: 0, r: 0 };
    return { uid: u, nombre: x.nombre || "", rol: x.rol || "", rolTxt: ROL_TXT[x.rol] || x.rol || "", hoy: { preguntas: h.q, remitos: h.r }, mes: { preguntas: x.q || 0, remitos: x.r || 0, usd: r6(x.usd || 0) }, topes: { preguntas: topeDe(L, x.rol, "preguntas"), remitos: topeDe(L, x.rol, "remitos") } }; })
    .sort((a, b) => b.mes.usd - a.mes.usd);
  return json({ ok: true, version: VERSION, mes, dia, gastoMes: r6(G.usd), tope: L.mes.tope, pausa: nv.pausa, corte: nv.corte, nivel: nv.nivel, partes: { preguntas: r6(G.partes.preguntas || 0), remitos: r6(G.partes.remitos || 0), supervisor: r6(G.partes.supervisor || 0) }, personas, kv: !!env.IA_KV, texto: `Gastado este mes: ${plata(G.usd)} de ${L.mes.tope}` }, 200, origen);
}
// ---------- GET /mio: cuánto le queda hoy a quien pregunta (sin montos)
async function mio(request, env, origen) {
  const id = await identificar(request, env);
  if (id.err) return error(id.err[0], id.err[1], id.err[2], origen);
  const L = await limites(env, id.token), dia = diaAr(), D = await leerDia(env, id.uid, dia), G = await leerMes(env, mesAr()), nv = nivelMes(L, G.usd), rol = id.yo.rol;
  const tq = topeDe(L, rol, "preguntas"), tr = topeDe(L, rol, "remitos");
  const pausado = (nv.nivel === "corte" && rol !== "admin") || (nv.nivel === "pausa" && PAUSADOS.includes(rol));
  return json({ ok: true, version: VERSION, rol, habilitado: !L.habilitados || L.habilitados.includes(rol), pausado, nivel: nv.nivel, preguntasHoy: D.q, topePreguntas: tq, quedanPreguntas: tq == null ? null : Math.max(0, tq - D.q), remitosHoy: D.r, topeRemitos: tr, quedanRemitos: tr == null ? null : Math.max(0, tr - D.r) }, 200, origen);
}

export default {
  async fetch(request, env) {
    const u = new URL(request.url), origen = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") return new Response(null, { status: ORIGENES.includes(origen) ? 204 : 403, headers: cabCors(origen) });
    try {
      if (u.pathname === "/salud" && request.method === "GET") {
        const L = (await guardadoLeer(env, "cfg:limites")) || limitesBase(env), G = await leerMes(env, mesAr());
        return json({ ok: true, version: VERSION, modelos: Object.keys(MODELOS), respaldo: true, clave: !!env.ANTHROPIC_API_KEY, kv: !!env.IA_KV, gastoMes: r6(G.usd), tope: L.mes.tope, ...(env.IA_KV ? {} : { aviso: "Sin KV: los topes y el gasto del mes se cuentan en memoria (aproximado)." }) }, 200, origen);
      }
      if (origen && !ORIGENES.includes(origen)) return error("origen", "Origen no permitido.", 403, origen);
      if (u.pathname === "/ia") {
        if (request.method !== "POST") return error("metodo", "Usá POST.", 405, origen);
        return await pedidoIa(request, env, origen);
      }
      if (u.pathname === "/uso" && request.method === "GET") return await uso(request, env, origen);
      if (u.pathname === "/mio" && request.method === "GET") return await mio(request, env, origen);
      return error("ruta", "Ruta desconocida.", 404, origen);
    } catch (e) {
      // Nunca se devuelve el detalle interno (podría arrastrar cabeceras): solo un mensaje simple.
      return error("interno", "Hubo un problema en el Worker. Probá de nuevo en un rato.", 500, origen);
    }
  },
};

export { costoDe, armarPedido, MODELOS, clasificar, esNueva, mezclar, limitesBase };
