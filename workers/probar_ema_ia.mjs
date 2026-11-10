// Prueba del Worker «ema-ia» en Node (sin internet): simula las claves de Google, Firestore (REST) y la API de Claude.
// Correr:  node workers/probar_ema_ia.mjs
import worker, { costoDe } from "./ema-ia.js";

const CLAVE_FALSA = "sk-ant-PRUEBA-no-es-real-1234567890";
const ORIGEN = "https://miguelangelbasq-tech.github.io";
let ok = 0, mal = 0;
const prueba = (nombre, cond) => { if (cond) ok++; else mal++; console.log((cond ? "  ok  " : "  MAL ") + nombre); };

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

// ---------- Firestore simulado (usuarios/{uid} y configEquipo/personal)
const FS_URL = "https://firestore.googleapis.com/v1/projects/alumbrado-stock/databases/(default)/documents/";
const USUARIOS = {};   // uid → {rol, activo, pendiente, nombre}; los «uid-…» sin ficha son admin (pruebas viejas)
let CONFIG = null, lecturasFs = 0, fsCaido = false; const tokensFs = [];
const aFs = (v) => v === null ? { nullValue: null } : typeof v == "boolean" ? { booleanValue: v } : typeof v == "number" ? (Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v }) : typeof v == "string" ? { stringValue: v } : Array.isArray(v) ? { arrayValue: { values: v.map(aFs) } } : { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, aFs(x)])) } };

// ---------- fetch simulado
let ultimoPedido = null, respuestaClaude = null, pedidosClaude = 0;
globalThis.fetch = async (url, init = {}) => {
  url = String(url);
  if (url.startsWith("https://www.googleapis.com/")) return new Response(JSON.stringify({ keys: [{ ...jwkPub, kid: KID, alg: "RS256", use: "sig" }] }), { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=20000" } });
  if (url === "https://api.anthropic.com/v1/messages") {
    pedidosClaude++;
    ultimoPedido = { headers: init.headers, body: JSON.parse(init.body) };
    if (respuestaClaude) { const rc = respuestaClaude(init, ultimoPedido.body); if (rc) return rc; }
    return new Response(JSON.stringify({ id: "msg_1", type: "message", role: "assistant", model: ultimoPedido.body.model, content: [{ type: "text", text: "Hola Ángel" }], stop_reason: "end_turn", usage: { input_tokens: 1000, output_tokens: 500, cache_read_input_tokens: 2000, cache_creation_input_tokens: 0 } }), { status: 200, headers: { "Content-Type": "application/json", "request-id": "req_1" } });
  }
  if (url.startsWith(FS_URL)) {
    lecturasFs++;
    const auth = (init.headers && (init.headers.Authorization || init.headers.authorization)) || "";
    tokensFs.push(auth);
    if (fsCaido) return new Response(JSON.stringify({ error: { code: 503 } }), { status: 503 });
    const ruta = decodeURIComponent(url.slice(FS_URL.length).split("?")[0]);
    if (ruta.startsWith("usuarios/")) {
      const uid = ruta.slice(9), u = USUARIOS[uid] || (uid.startsWith("uid-") ? { rol: "admin", nombre: "Prueba" } : null);
      if (!u) return new Response(JSON.stringify({ error: { code: 404 } }), { status: 404 });
      return new Response(JSON.stringify({ name: "x", fields: aFs(u).mapValue.fields }), { status: 200 });
    }
    if (ruta === "configEquipo/personal") return new Response(JSON.stringify({ name: "x", fields: CONFIG ? { asistente: aFs(CONFIG) } : {} }), { status: 200 });
    return new Response("{}", { status: 404 });
  }
  throw new Error("fetch no esperado: " + url);
};

const env = { ANTHROPIC_API_KEY: CLAVE_FALSA, IA_POR_MINUTO: "5", IA_POR_DIA: "400" };
const todas = []; // todas las respuestas, para buscar la clave
async function pedir(ruta, { metodo = "POST", token, cuerpo, origen = ORIGEN, e = env } = {}) {
  const h = {}; if (token) h.Authorization = "Bearer " + token; if (origen) h.Origin = origen; if (cuerpo) h["Content-Type"] = "application/json";
  const r = await worker.fetch(new Request("https://ema-ia.mdiaz-60f.workers.dev" + ruta, { method: metodo, headers: h, body: cuerpo ? JSON.stringify(cuerpo) : undefined }), e);
  const tx = await r.text();
  todas.push(tx + JSON.stringify([...r.headers]));
  let j = null; try { j = JSON.parse(tx); } catch (_) {}
  return { r, j, tx };
}
const base = (extra = {}) => ({ model: "claude-haiku-5-5", max_tokens: 1000, messages: [{ role: "user", content: "hola" }], ...extra });

// ---------- /salud
{
  const { r, j } = await pedir("/salud", { metodo: "GET" });
  prueba("/salud responde 200 con versión v3-ia, los modelos, gastoMes y tope", r.status === 200 && j.ok && j.version === "v3-ia" && j.gastoMes === 0 && j.tope === 100 && j.modelos.includes("claude-fable-5-2") && j.modelos.includes("claude-opus-5-5"));
  prueba("/salud dice clave:true y kv:false (con aviso)", j.clave === true && j.kv === false && !!j.aviso);
  const s2 = await pedir("/salud", { metodo: "GET", e: {} });
  prueba("/salud sin secret dice clave:false", s2.j.clave === false);
}

// ---------- CORS
{
  const r1 = await worker.fetch(new Request("https://x/ia", { method: "OPTIONS", headers: { Origin: ORIGEN } }), env);
  prueba("OPTIONS desde GitHub Pages → 204 con su origen", r1.status === 204 && r1.headers.get("Access-Control-Allow-Origin") === ORIGEN && /Authorization/.test(r1.headers.get("Access-Control-Allow-Headers")));
  const r2 = await worker.fetch(new Request("https://x/ia", { method: "OPTIONS", headers: { Origin: "https://localhost" } }), env);
  prueba("OPTIONS desde el APK (https://localhost) → 204", r2.status === 204 && r2.headers.get("Access-Control-Allow-Origin") === "https://localhost");
  const r3 = await worker.fetch(new Request("https://x/ia", { method: "OPTIONS", headers: { Origin: "https://malo.example" } }), env);
  prueba("OPTIONS desde otro sitio → sin permiso", r3.status === 403 && !r3.headers.get("Access-Control-Allow-Origin"));
  const t = await firmar(cuerpoToken("uid-cors"));
  const r4 = await pedir("/ia", { token: t, cuerpo: base(), origen: "https://malo.example" });
  prueba("POST /ia desde otro sitio → 403", r4.r.status === 403);
}

// ---------- token
{
  const n0 = pedidosClaude;
  const a = await pedir("/ia", { cuerpo: base() });
  prueba("sin token → 401", a.r.status === 401 && a.j.error.tipo === "token");
  const b = await pedir("/ia", { token: "basura.total.x", cuerpo: base() });
  prueba("token ilegible → 401", b.r.status === 401);
  const c = await pedir("/ia", { token: await firmar(cuerpoToken("u1"), { clave: otro.privateKey }), cuerpo: base() });
  prueba("token firmado con otra clave → 401", c.r.status === 401);
  const d = await pedir("/ia", { token: await firmar(cuerpoToken("u1", { aud: "otro-proyecto" })), cuerpo: base() });
  prueba("token de otro proyecto (aud) → 401", d.r.status === 401);
  const e = await pedir("/ia", { token: await firmar(cuerpoToken("u1", { iss: "https://securetoken.google.com/otro" })), cuerpo: base() });
  prueba("token con iss distinto → 401", e.r.status === 401);
  const f = await pedir("/ia", { token: await firmar(cuerpoToken("u1", { exp: ahora() - 3600 })), cuerpo: base() });
  prueba("token vencido → 401", f.r.status === 401);
  const g = await pedir("/ia", { token: await firmar(cuerpoToken("u1"), { kid: "no-existe" }), cuerpo: base() });
  prueba("token con kid desconocido → 401", g.r.status === 401);
  const hh = await pedir("/ia", { token: await firmar(cuerpoToken("u1"), { alg: "HS256" }), cuerpo: base() });
  prueba("token con alg distinto de RS256 → 401", hh.r.status === 401);
  prueba("con token malo no se llamó a Claude", pedidosClaude === n0);
}

// ---------- pedido bueno: campos, tope, costo
{
  const t = await firmar(cuerpoToken("uid-bueno"));
  const { r, j } = await pedir("/ia", { token: t, cuerpo: base({
    max_tokens: 99999, temperature: 0.2, top_p: 0.9, stream: true, metadata: { user_id: "x" }, thinking: { type: "disabled" }, betas: ["x"],
    system: "Sos el asistente de EMA.", tools: [{ name: "buscar_obra", description: "Busca", input_schema: { type: "object", properties: {} } }],
    tool_choice: { type: "auto" }, output_config: { effort: "low", format: { type: "json_schema" } }, cache_control: { type: "ephemeral" },
  }) });
  prueba("pedido bueno → 200 con la respuesta de Claude", r.status === 200 && j.content[0].text === "Hola Ángel" && j.id === "msg_1");
  const b = ultimoPedido.body;
  prueba("max_tokens recortado a 4000", b.max_tokens === 4000);
  prueba("campos extra descartados (temperature, top_p, stream, metadata, thinking, betas)", ["temperature", "top_p", "stream", "metadata", "thinking", "betas"].every((k) => !(k in b)));
  prueba("output_config solo con effort", JSON.stringify(b.output_config) === JSON.stringify({ effort: "low" }));
  prueba("pasan model, system, messages, tools, tool_choice, cache_control", b.model === "claude-haiku-5-5" && b.system && b.messages.length === 1 && b.tools.length === 1 && b.tool_choice.type === "auto" && b.cache_control.type === "ephemeral");
  prueba("solo campos permitidos en el pedido", Object.keys(b).every((k) => ["model", "system", "messages", "tools", "tool_choice", "max_tokens", "output_config", "cache_control"].includes(k)));
  prueba("cabeceras a Claude: x-api-key y anthropic-version", ultimoPedido.headers["x-api-key"] === CLAVE_FALSA && /^\d{4}-\d{2}-\d{2}$/.test(ultimoPedido.headers["anthropic-version"]));
  // Haiku: 1000 × 0,10 + 2000 × 0,01 + 500 × 0,50 = 100 + 20 + 250 = 370 / 1e6
  prueba("costo Haiku calculado (0,00037)", Math.abs(j.ema.costoUsd - 0.00037) < 1e-9);
  prueba("costo Sonnet: 1M entrada + 1M salida = 12", Math.abs(costoDe("claude-sonnet-5-5", { input_tokens: 1e6, output_tokens: 1e6 }) - 12) < 1e-9);
  prueba("costo Sonnet: lectura de caché US$ 0,10 por millón", Math.abs(costoDe("claude-sonnet-5-5", { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 1e6 }) - 0.1) < 1e-9);
  prueba("costo Opus 5.5: 1M + 1M = 24 y caché 0,20", Math.abs(costoDe("claude-opus-5-5", { input_tokens: 1e6, output_tokens: 1e6 }) - 24) < 1e-9 && Math.abs(costoDe("claude-opus-5-5", { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 1e6 }) - 0.2) < 1e-9);
  prueba("costo Fable 5.2: 1M + 1M = 48 y caché 0,20", Math.abs(costoDe("claude-fable-5-2", { input_tokens: 1e6, output_tokens: 1e6 }) - 48) < 1e-9 && Math.abs(costoDe("claude-fable-5-2", { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 1e6 }) - 0.2) < 1e-9);
  prueba("costo con respaldo: suma cada intento de usage.iterations", Math.abs(costoDe("claude-fable-5-2", { input_tokens: 1, output_tokens: 1, iterations: [{ model: "claude-fable-5-2", input_tokens: 1e6, output_tokens: 0 }, { model: "claude-opus-4-8", input_tokens: 1e6, output_tokens: 0 }] }) - 13) < 1e-9);
  const sm = await pedir("/ia", { token: t, cuerpo: base({ max_tokens: 50, model: "claude-sonnet-5-5" }) });
  prueba("Sonnet permitido y max_tokens chico se respeta", sm.r.status === 200 && ultimoPedido.body.max_tokens === 50 && ultimoPedido.body.model === "claude-sonnet-5-5");
  const sinMt = await pedir("/ia", { token: t, cuerpo: { model: "claude-haiku-5-5", messages: [{ role: "user", content: "x" }] } });
  prueba("sin max_tokens → 4000", sinMt.r.status === 200 && ultimoPedido.body.max_tokens === 4000);
  const ts = await pedir("/ia", { token: t, cuerpo: base({ tool_choice: "none" }) });
  prueba("tool_choice «none» pasa como objeto", ts.r.status === 200 && ultimoPedido.body.tool_choice.type === "none");
}

// ---------- v136: Opus 5.5 y Fable 5.2 con respaldo del servidor
{
  const t = await firmar(cuerpoToken("uid-pro"));
  for (const m of ["claude-fable-5-2", "claude-opus-5-5"]) {
    const { r } = await pedir("/ia", { token: t, cuerpo: base({ model: m, max_tokens: 99999, fallbacks: "default", betas: ["server-side-fallback-2026-07-01", "otra-beta"], temperature: 1, thinking: { type: "disabled" }, output_config: { effort: "high" }, tool_choice: { type: "auto" } }) });
    const b = ultimoPedido.body, h = ultimoPedido.headers;
    prueba(m + ": pasa con max_tokens hasta 16000, fallbacks «default» y la cabecera beta (sin otras betas)", r.status === 200 && b.model === m && b.max_tokens === 16000 && b.fallbacks === "default" && h["anthropic-beta"] === "server-side-fallback-2026-07-01");
    prueba(m + ": sin thinking ni temperature, effort high", !("thinking" in b) && !("temperature" in b) && b.output_config.effort === "high");
  }
  await pedir("/ia", { token: t, cuerpo: base({ fallbacks: "default" }) });
  prueba("Haiku: no lleva fallbacks ni cabecera beta (no tiene respaldo)", !("fallbacks" in ultimoPedido.body) && !ultimoPedido.headers["anthropic-beta"]);
  await pedir("/ia", { token: t, cuerpo: base({ model: "claude-sonnet-5-5", max_tokens: 99999 }) });
  prueba("Sonnet sigue con tope 4000 y sin cabecera beta si no pide respaldo", ultimoPedido.body.max_tokens === 4000 && !ultimoPedido.headers["anthropic-beta"]);
  const pens = [{ type: "thinking", thinking: "", signature: "firma-xyz" }, { type: "fallback", from: { model: "claude-fable-5-2" }, to: { model: "claude-opus-4-8" } }, { type: "text", text: "ok" }];
  respuestaClaude = () => new Response(JSON.stringify({ id: "msg_p", type: "message", role: "assistant", model: "claude-opus-4-8", content: pens, stop_reason: "end_turn", usage: { input_tokens: 10, output_tokens: 5, iterations: [{ type: "message", model: "claude-fable-5-2", input_tokens: 1000, output_tokens: 0 }, { type: "fallback_message", model: "claude-opus-4-8", input_tokens: 1000, output_tokens: 100 }] } }), { status: 200, headers: { "Content-Type": "application/json" } });
  const { j } = await pedir("/ia", { token: t, cuerpo: base({ model: "claude-fable-5-2", fallbacks: "default", messages: [{ role: "user", content: "hola" }, { role: "assistant", content: pens }, { role: "user", content: "seguí" }] }) });
  respuestaClaude = null;
  prueba("los bloques thinking y fallback llegan tal cual (ida y vuelta)", JSON.stringify(j.content) === JSON.stringify(pens) && JSON.stringify(ultimoPedido.body.messages[1].content) === JSON.stringify(pens));
  prueba("el costo suma los dos intentos del respaldo (0,0155)", Math.abs(j.ema.costoUsd - 0.0155) < 1e-9 && j.ema.modelo === "claude-opus-4-8");
}

// ---------- pedidos malos → 400 sin llamar a Claude
{
  const t = await firmar(cuerpoToken("uid-malos"));
  const n0 = pedidosClaude;
  const a = await pedir("/ia", { token: t, cuerpo: base({ model: "claude-opus-5" }) });
  prueba("modelo fuera de lista → 400 «no está permitido»", a.r.status === 400 && a.j.error.tipo === "pedido" && /no está permitido/.test(a.j.error.mensaje));
  const a2 = await pedir("/ia", { token: t, cuerpo: base({ fallbacks: [{ model: "claude-opus-4-8" }] }) });
  prueba("fallbacks que no sea «default» → 400", a2.r.status === 400);
  const b = await pedir("/ia", { token: t, cuerpo: base({ model: "claude-haiku-4-5" }) });
  prueba("otro modelo viejo → 400", b.r.status === 400);
  const c = await pedir("/ia", { token: t, cuerpo: base({ tool_choice: { type: "tool", name: "x" } }) });
  prueba("tool_choice forzado → 400", c.r.status === 400);
  const d = await pedir("/ia", { token: t, cuerpo: base({ messages: [] }) });
  prueba("sin mensajes → 400", d.r.status === 400);
  prueba("los pedidos malos no llegaron a Claude", pedidosClaude === n0);
}

// ---------- errores de Claude → castellano, sin la clave
{
  const t = await firmar(cuerpoToken("uid-errores"));
  const casos = [[429, "rate_limit_error", 429], [529, "overloaded_error", 503], [400, "invalid_request_error", 400], [401, "authentication_error", 502]];
  for (const [st, tipo, esperado] of casos) {
    respuestaClaude = () => new Response(JSON.stringify({ type: "error", error: { type: tipo, message: "detalle en inglés x-api-key " + CLAVE_FALSA }, request_id: "req_x" }), { status: st, headers: { "Content-Type": "application/json", "x-api-key": CLAVE_FALSA } });
    const { r, j } = await pedir("/ia", { token: t, cuerpo: base() });
    prueba(`Claude ${st} → ${esperado} con {error:{tipo, mensaje}} en castellano`, r.status === esperado && j.error && j.error.tipo && /[áéíóúñ]|Probá|Claude|clave/.test(j.error.mensaje) && !("request_id" in j));
  }
  respuestaClaude = () => { throw new Error("sin red " + CLAVE_FALSA); };
  const red = await pedir("/ia", { token: t, cuerpo: base() });
  prueba("sin red hacia Claude → 502", red.r.status === 502 && red.j.error.tipo === "red");
  respuestaClaude = null;
}

// ---------- v2b: 400 de Claude → reintenta más simple y devuelve el motivo
{
  const t = await firmar(cuerpoToken("uid-reintento"));
  const vistos = [];
  respuestaClaude = (req, body) => { vistos.push(body); return ("fallbacks" in body) ? new Response(JSON.stringify({ type: "error", error: { type: "invalid_request_error", message: "fallbacks: no habilitado" } }), { status: 400, headers: { "Content-Type": "application/json" } }) : null; };
  const a = await pedir("/ia", { token: t, cuerpo: base({ model: "claude-opus-5-5", fallbacks: "default", cache_control: { type: "ephemeral" } }) });
  prueba("v2b: 400 con respaldo → reintenta sin respaldo ni caché automática y contesta 200", a.r.status === 200 && vistos.length === 2 && !("fallbacks" in vistos[1]) && !("cache_control" in vistos[1]));
  respuestaClaude = () => new Response(JSON.stringify({ type: "error", error: { type: "invalid_request_error", message: "messages.0: algo mal " + CLAVE_FALSA } }), { status: 400, headers: { "Content-Type": "application/json" } });
  const b = await pedir("/ia", { token: t, cuerpo: base({ model: "claude-opus-5-5" }) });
  prueba("v2b: 400 que sigue → «detalle» con el motivo y sin la clave", b.r.status === 400 && /messages\.0: algo mal/.test(b.j.error.detalle || "") && !(b.j.error.detalle || "").includes("sk-ant"));
  respuestaClaude = null;
}

// ---------- límite por minuto (IA_POR_MINUTO = 5) y por día
{
  const t = await firmar(cuerpoToken("uid-limite"));
  const est = [];
  for (let i = 0; i < 7; i++) est.push((await pedir("/ia", { token: t, cuerpo: base() })).r.status);
  prueba("límite por minuto: 5 pasan y el 6.º da 429", est.slice(0, 5).every((s) => s === 200) && est[5] === 429 && est[6] === 429);
  const otraPersona = await pedir("/ia", { token: await firmar(cuerpoToken("uid-otra")), cuerpo: base() });
  prueba("el límite es por persona (otra pasa)", otraPersona.r.status === 200);
  const envDia = { ...env, IA_POR_MINUTO: "100", IA_POR_DIA: "3" }, td = await firmar(cuerpoToken("uid-dia"));
  const ed = [];
  for (let i = 0; i < 4; i++) ed.push((await pedir("/ia", { token: td, cuerpo: base(), e: envDia })).r.status);
  prueba("límite por día: 3 pasan y el 4.º da 429", ed.join() === "200,200,200,429");
}

// ---------- con KV ligado
{
  const kv = new Map(); let puts = 0;
  const IA_KV = { get: async (k) => kv.get(k) ?? null, put: async (k, v, o) => { puts++; kv.set(k, v); if (!(o && o.expirationTtl >= 60)) throw new Error("ttl"); } };
  const envKv = { ...env, IA_POR_MINUTO: "2", IA_KV };
  const s = await pedir("/salud", { metodo: "GET", e: envKv });
  prueba("/salud con KV dice kv:true", s.j.kv === true && !s.j.aviso);
  const t = await firmar(cuerpoToken("uid-kv"));
  const e = [];
  for (let i = 0; i < 3; i++) e.push((await pedir("/ia", { token: t, cuerpo: base(), e: envKv })).r.status);
  const dia = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 10);
  prueba("con KV: 2 pasan, el 3.º da 429 (por minuto) y las cuentas quedan en el KV (día, mes, rol, límites)", e.join() === "200,200,429" && JSON.parse(kv.get("d:uid-kv:" + dia)).n === 2 && JSON.parse(kv.get("g:" + dia.slice(0, 7))).usd > 0 && kv.has("rol:uid-kv") && kv.has("cfg:limites") && puts >= 6);
}

// =====================================================================================================================
// v3-ia (v141): rol leído de la base, topes por rol y día, remitos aparte, freno 80/95, reinicio de mes, /uso y /mio
// =====================================================================================================================
const nuevoKv = () => { const kv = new Map(); return { kv, IA_KV: { get: async (k) => kv.get(k) ?? null, put: async (k, v) => { kv.set(k, v); } } }; };
const conDatos = (e, k, v) => e.IA_KV.put(k, JSON.stringify(v));
const pregunta = (extra = {}) => base(extra);
const vuelta = () => base({ messages: [{ role: "user", content: "hola" }, { role: "assistant", content: [{ type: "tool_use", id: "t1", name: "stock", input: {} }] }, { role: "user", content: [{ type: "tool_result", tool_use_id: "t1", content: "{}" }] }] });
const remito = (extra = {}) => base({ model: "claude-opus-5-5", ema: { tipo: "remito" }, messages: [{ role: "user", content: [{ type: "image", source: { type: "base64", media_type: "image/jpeg", data: "AAAA" } }, { type: "image", source: { type: "base64", media_type: "image/jpeg", data: "BBBB" } }, { type: "text", text: "Transcribí" }] }], ...extra });
Object.assign(USUARIOS, {
  "c-1": { rol: "cuadrilla", nombre: "Juan Pérez", activo: true }, "c-2": { rol: "cuadrilla", nombre: "Pedro Gómez" }, "o-1": { rol: "oficina", nombre: "Olga" },
  "a-1": { rol: "admin", nombre: "Ángel" }, "p-1": { rol: "panol", nombre: "Pablo Pañol" }, "m-1": { rol: "mirar", nombre: "Mira" },
  "x-baja": { rol: "oficina", activo: false }, "x-pend": { rol: "mirar", pendiente: true }, "op-1": { rol: "operario", nombre: "Oscar" },
});
const tk = (uid, extra) => firmar(cuerpoToken(uid, extra));
{
  // ---- rol leído de Firestore con el token de la persona (y guardado 10 min)
  const E = { ...env, IA_POR_MINUTO: "500", ...nuevoKv() };
  const l0 = lecturasFs, t = await tk("c-1");
  let r = await pedir("/ia", { token: t, cuerpo: pregunta(), e: E });
  prueba("v3: el Worker lee usuarios/{uid} y configEquipo/personal por REST con el MISMO token de la persona", r.r.status === 200 && lecturasFs - l0 === 2 && tokensFs.slice(-2).every((x) => x === "Bearer " + t));
  prueba("v3: la respuesta trae ema.version v3-ia y el uso del día (rol cuadrilla, 1 de 10)", r.j.ema.version === "v3-ia" && r.j.ema.uso.rol === "cuadrilla" && r.j.ema.uso.preguntasHoy === 1 && r.j.ema.uso.topePreguntas === 10 && r.j.ema.uso.quedanPreguntas === 9 && !("gastoMes" in r.j.ema.freno));
  await pedir("/ia", { token: t, cuerpo: pregunta(), e: E });
  prueba("v3: el rol y los límites quedan guardados (no vuelve a leer la base en el pedido siguiente)", lecturasFs - l0 === 2 && E.IA_KV.get && JSON.parse(E.kv.get("rol:c-1")).rol === "cuadrilla");
  // ---- topes por rol y día: cuadrilla 10 (con 2 hechas: 8 más pasan, la 11.ª no)
  const est = [];
  for (let i = 0; i < 9; i++) est.push((await pedir("/ia", { token: t, cuerpo: pregunta({ ema: { rol: "admin", tipo: "pregunta" } }), e: E })).r.status);
  r = await pedir("/ia", { token: t, cuerpo: pregunta(), e: E });
  prueba("v3: cuadrilla tiene 10 preguntas por día: la 11.ª da tope_dia con el mensaje en castellano", est.slice(0, 8).every((s) => s === 200) && est[8] === 429 && r.r.status === 429 && r.j.error.tipo === "tope_dia" && r.j.error.mensaje === "Llegaste a tus 10 preguntas de hoy. Mañana se renuevan.");
  prueba("v3: el rol falso que manda la app (ema.rol = admin) se ignora", est[8] === 429);
  const n0 = pedidosClaude; await pedir("/ia", { token: t, cuerpo: pregunta(), e: E });
  prueba("v3: pasado el tope no se llama a Claude", pedidosClaude === n0);
  r = await pedir("/ia", { token: await tk("c-2"), cuerpo: pregunta(), e: E });
  prueba("v3: el tope es por persona (otro de la cuadrilla sigue)", r.r.status === 200 && r.j.ema.uso.preguntasHoy === 1);
  // vueltas de herramientas de la misma pregunta no suman
  const to = await tk("op-1");
  await pedir("/ia", { token: to, cuerpo: pregunta(), e: E });
  for (let i = 0; i < 4; i++) await pedir("/ia", { token: to, cuerpo: vuelta(), e: E });
  r = await pedir("/ia", { token: to, cuerpo: vuelta(), e: E });
  prueba("v3: las vueltas de herramientas (último mensaje = tool_result) no cuentan como pregunta nueva (operario: 1 de 10)", r.r.status === 200 && r.j.ema.uso.preguntasHoy === 1 && r.j.ema.uso.topePreguntas === 10);
  // admin sin tope; oficina 30; mirar 10
  r = await pedir("/ia", { token: await tk("a-1"), cuerpo: pregunta(), e: E });
  prueba("v3: Administración sin tope (topePreguntas null)", r.r.status === 200 && r.j.ema.uso.topePreguntas === null && r.j.ema.uso.quedanPreguntas === null && typeof r.j.ema.freno.gastoMes === "number");
  r = await pedir("/ia", { token: await tk("o-1"), cuerpo: pregunta(), e: E });
  prueba("v3: Oficina 30 por día y ve el gasto del mes en la respuesta", r.j.ema.uso.topePreguntas === 30 && r.j.ema.freno.tope === 100);
  r = await pedir("/ia", { token: await tk("m-1"), cuerpo: pregunta(), e: E });
  prueba("v3: Solo mirar 10 por día", r.j.ema.uso.topePreguntas === 10);
  // usuario dado de baja / a confirmar
  r = await pedir("/ia", { token: await tk("x-baja"), cuerpo: pregunta(), e: E });
  const r2 = await pedir("/ia", { token: await tk("x-pend"), cuerpo: pregunta(), e: E });
  prueba("v3: usuario dado de baja o «a confirmar» → 403 tipo usuario", r.r.status === 403 && r.j.error.tipo === "usuario" && r2.r.status === 403);
  // usuario sin ficha → Solo mirar
  r = await pedir("/ia", { token: await tk("sin-ficha"), cuerpo: pregunta(), e: E });
  prueba("v3: sin ficha en la base → se trata como «Solo mirar» (10)", r.r.status === 200 && r.j.ema.uso.rol === "mirar" && r.j.ema.uso.topePreguntas === 10);
}
{
  // ---- remitos aparte (pañol 20 preguntas + 40 remitos; con límites de la base: 2 remitos para probar)
  CONFIG = { roles: ["admin", "oficina", "panol", "cuadrilla", "operario", "mirar"], limites: { roles: { panol: { preguntas: 3, remitos: 2 }, admin: { preguntas: 1 } }, mes: { tope: 100, pausaPct: 80, cortePct: 95 } } };
  const E = { ...env, IA_POR_MINUTO: "500", ...nuevoKv() }, t = await tk("p-1");
  let r = await pedir("/ia", { token: t, cuerpo: remito(), e: E });
  prueba("v3: un remito de 2 hojas cuenta 1 remito y 0 preguntas", r.r.status === 200 && r.j.ema.uso.tipo === "remito" && r.j.ema.uso.remitosHoy === 1 && r.j.ema.uso.preguntasHoy === 0 && r.j.ema.uso.topeRemitos === 2);
  await pedir("/ia", { token: t, cuerpo: remito(), e: E });
  r = await pedir("/ia", { token: t, cuerpo: remito(), e: E });
  prueba("v3: el 3.er remito (tope 2 guardado en la base) → tope_remitos", r.r.status === 429 && r.j.error.tipo === "tope_remitos" && /2 remitos de hoy/.test(r.j.error.mensaje));
  r = await pedir("/ia", { token: t, cuerpo: pregunta(), e: E });
  prueba("v3: con los remitos agotados las preguntas siguen (se cuentan aparte)", r.r.status === 200 && r.j.ema.uso.preguntasHoy === 1);
  r = await pedir("/ia", { token: t, cuerpo: base({ ema: { tipo: "remito" } }), e: E });
  prueba("v3: «remito» sin foto ni PDF cuenta como pregunta", r.r.status === 200 && r.j.ema.uso.tipo === "pregunta" && r.j.ema.uso.preguntasHoy === 2);
  r = await pedir("/ia", { token: t, cuerpo: remito({ tools: [{ name: "x", description: "x", input_schema: { type: "object", properties: {} } }] }), e: E });
  prueba("v3: «remito» con herramientas cuenta como pregunta", r.r.status === 200 && r.j.ema.uso.tipo === "pregunta");
  r = await pedir("/ia", { token: await tk("a-1"), cuerpo: pregunta(), e: E });
  const r2 = await pedir("/ia", { token: await tk("a-1"), cuerpo: pregunta(), e: E });
  prueba("v3: Administración sigue sin tope aunque la base diga otra cosa", r2.r.status === 200 && r2.j.ema.uso.topePreguntas === null);
  // supervisor: no cuenta para nadie pero suma al gasto (solo de admin u oficina)
  const to = await tk("o-1");
  r = await pedir("/ia", { token: to, cuerpo: pregunta({ ema: { tipo: "supervisor" } }), e: E });
  const g = JSON.parse(E.kv.get("g:" + new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 7)));
  prueba("v3: el supervisor de Oficina no cuenta como pregunta pero suma al gasto del mes (parte «supervisor»)", r.r.status === 200 && r.j.ema.uso.tipo === "supervisor" && r.j.ema.uso.preguntasHoy === 0 && g.partes.supervisor > 0 && g.partes.remitos > 0 && g.partes.preguntas > 0);
  r = await pedir("/ia", { token: await tk("c-1"), cuerpo: pregunta({ ema: { tipo: "supervisor" } }), e: E });
  prueba("v3: «supervisor» mandado por la cuadrilla cuenta como pregunta", r.j.ema.uso.tipo === "pregunta" && r.j.ema.uso.preguntasHoy >= 1);
  // rol apagado por Administración
  CONFIG = { roles: ["admin", "oficina"] };
  const E2 = { ...env, IA_POR_MINUTO: "500", ...nuevoKv() };
  r = await pedir("/ia", { token: await tk("c-1"), cuerpo: pregunta(), e: E2 });
  const r3 = await pedir("/ia", { token: await tk("o-1"), cuerpo: pregunta(), e: E2 });
  prueba("v3: rol apagado en ⚙ (solo admin y oficina) → la cuadrilla recibe rol_apagado y oficina pasa", r.r.status === 403 && r.j.error.tipo === "rol_apagado" && r3.r.status === 200);
  CONFIG = null;
}
{
  // ---- freno del mes: pausa a 80, corte a 95, aviso una vez, reinicio el día 1
  const E = { ...env, IA_POR_MINUTO: "500", ...nuevoKv() }, mes = new Date(Date.now() - 3 * 3600e3).toISOString().slice(0, 7);
  await conDatos(E, "g:" + mes, { usd: 79.9998, partes: { preguntas: 79.9998, remitos: 0, supervisor: 0 }, personas: {}, aviso: false });
  let r = await pedir("/ia", { token: await tk("c-1"), cuerpo: pregunta(), e: E });
  prueba("v3: la pregunta que cruza los 80 USD pasa y trae freno.avisar (para avisar a Administración) con el gasto", r.r.status === 200 && r.j.ema.freno.nivel === "pausa" && r.j.ema.freno.avisar === true && r.j.ema.freno.gastoMes >= 80);
  r = await pedir("/ia", { token: await tk("o-1"), cuerpo: pregunta(), e: E });
  prueba("v3: el aviso sale una sola vez por mes", r.r.status === 200 && r.j.ema.freno.avisar === false && r.j.ema.freno.nivel === "pausa");
  const st = [];
  for (const u of ["c-1", "op-1", "m-1", "p-1"]) { const x = await pedir("/ia", { token: await tk(u), cuerpo: pregunta(), e: E }); st.push(x.r.status + ":" + (x.j.error ? x.j.error.tipo : "")); }
  r = await pedir("/ia", { token: await tk("p-1"), cuerpo: remito(), e: E });
  prueba("v3: en pausa (≥ 80) quedan frenados cuadrilla, operario, solo mirar y pañol (también sus remitos) con tope_mes", st.every((s) => s === "429:tope_mes") && r.r.status === 429 && r.j.error.tipo === "tope_mes");
  r = await pedir("/ia", { token: await tk("o-1"), cuerpo: pregunta(), e: E });
  prueba("v3: en pausa Oficina sigue", r.r.status === 200);
  const g = JSON.parse(E.kv.get("g:" + mes)); g.usd = 95; await conDatos(E, "g:" + mes, g);
  r = await pedir("/ia", { token: await tk("o-1"), cuerpo: pregunta(), e: E });
  const ra = await pedir("/ia", { token: await tk("a-1"), cuerpo: pregunta(), e: E });
  prueba("v3: a los 95 USD se corta para todos menos Administración («Se renueva el día 1»)", r.r.status === 429 && r.j.error.tipo === "tope_mes" && r.j.error.mensaje === "El asistente llegó al tope de gasto del mes. Se renueva el día 1." && ra.r.status === 200);
  const s = await pedir("/salud", { metodo: "GET", e: E });
  prueba("/salud muestra gastoMes y tope", s.j.version === "v3-ia" && s.j.gastoMes >= 95 && s.j.tope === 100 && s.j.kv === true);
  // reinicio de mes
  const real = Date.now, mas = 32 * 86400e3; Date.now = () => real() + mas;
  try {
    r = await pedir("/ia", { token: await tk("c-1"), cuerpo: pregunta(), e: E });
    prueba("v3: el mes siguiente el gasto empieza de cero y la cuadrilla vuelve a preguntar (1 de 10)", r.r.status === 200 && r.j.ema.freno.nivel === "" && r.j.ema.uso.preguntasHoy === 1);
  } finally { Date.now = real; }
  // tope del mes configurable desde la base
  CONFIG = { limites: { mes: { tope: 200, pausaPct: 80, cortePct: 95 } } };
  const E3 = { ...env, IA_POR_MINUTO: "500", ...nuevoKv() };
  await conDatos(E3, "g:" + mes, { usd: 120, partes: { preguntas: 120, remitos: 0, supervisor: 0 }, personas: {}, aviso: false });
  r = await pedir("/ia", { token: await tk("c-1"), cuerpo: pregunta(), e: E3 });
  prueba("v3: con el tope en 200 (guardado en ⚙), 120 USD no frena a nadie", r.r.status === 200 && r.j.ema.freno.nivel === "");
  CONFIG = null;
}
{
  // ---- /uso solo admin/oficina (por el rol de la base) y /mio para todos
  const E = { ...env, IA_POR_MINUTO: "500", ...nuevoKv() };
  await pedir("/ia", { token: await tk("c-1"), cuerpo: pregunta(), e: E });
  await pedir("/ia", { token: await tk("p-1"), cuerpo: remito(), e: E });
  await pedir("/ia", { token: await tk("o-1"), cuerpo: pregunta({ ema: { tipo: "supervisor" } }), e: E });
  let r = await pedir("/uso", { metodo: "GET", token: await tk("c-1"), e: E });
  const sin = await pedir("/uso", { metodo: "GET", e: E });
  prueba("v3: /uso con un usuario de la cuadrilla → 403 (aunque la app diga otra cosa) y sin token → 401", r.r.status === 403 && r.j.error.tipo === "permiso" && sin.r.status === 401);
  r = await pedir("/uso", { metodo: "GET", token: await tk("o-1"), e: E });
  const pj = r.j && r.j.personas || [], pp = pj.find((x) => x.uid === "p-1"), pc = pj.find((x) => x.uid === "c-1");
  prueba("v3: /uso de Oficina: gasto del mes con preguntas / remitos / supervisor y por persona hoy y en el mes", r.r.status === 200 && r.j.gastoMes > 0 && r.j.partes.preguntas > 0 && r.j.partes.remitos > 0 && r.j.partes.supervisor > 0 && pp && pp.hoy.remitos === 1 && pp.mes.remitos === 1 && pc && pc.hoy.preguntas === 1 && pc.nombre === "Juan Pérez" && pc.rolTxt === "Cuadrilla");
  r = await pedir("/uso", { metodo: "GET", token: await tk("a-1"), e: E });
  prueba("v3: /uso de Administración → 200", r.r.status === 200 && r.j.tope === 100);
  r = await pedir("/mio", { metodo: "GET", token: await tk("c-1"), e: E });
  prueba("v3: /mio dice cuánto le queda (cuadrilla: 9 de 10) sin montos", r.r.status === 200 && r.j.quedanPreguntas === 9 && r.j.topePreguntas === 10 && !("gastoMes" in r.j) && r.j.rol === "cuadrilla");
  r = await pedir("/uso", { metodo: "GET", token: await tk("o-1"), e: E, origen: "https://malo.example" });
  prueba("v3: /uso desde otro sitio → 403", r.r.status === 403);
}
{
  // ---- la base no contesta: se usan los topes de «Solo mirar» y no se guarda el rol
  fsCaido = true;
  const E = { ...env, IA_POR_MINUTO: "500", ...nuevoKv() };
  const r = await pedir("/ia", { token: await tk("a-1"), cuerpo: pregunta(), e: E });
  fsCaido = false;
  prueba("v3: si Firestore no contesta, se usan los topes más chicos (mirar) y no se guarda el rol", r.r.status === 200 && r.j.ema.uso.rol === "mirar" && !E.kv.has("rol:a-1"));
}

// ---------- la clave nunca aparece
prueba("la clave no aparece en ninguna respuesta (" + todas.length + " revisadas)", todas.every((x) => !x.includes(CLAVE_FALSA) && !x.includes("sk-ant")));
{
  const r = await pedir("/nada", { metodo: "GET" });
  prueba("ruta desconocida → 404", r.r.status === 404);
}

console.log(`RESULTADO ema-ia: ${ok}/${ok + mal} OK`);
process.exit(mal ? 1 : 0);
