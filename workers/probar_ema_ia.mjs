// Prueba del Worker «ema-ia» en Node (sin internet): simula las claves de Google y la API de Claude.
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
  prueba("/salud responde 200 con versión v2b-ia y los modelos", r.status === 200 && j.ok && j.version === "v2b-ia" && j.modelos.includes("claude-fable-5-2") && j.modelos.includes("claude-opus-5-5"));
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
  prueba("con KV: 2 pasan, el 3.º da 429 y se guardó en el KV", e.join() === "200,200,429" && puts === 4);
}

// ---------- la clave nunca aparece
prueba("la clave no aparece en ninguna respuesta (" + todas.length + " revisadas)", todas.every((x) => !x.includes(CLAVE_FALSA) && !x.includes("sk-ant")));
{
  const r = await pedir("/nada", { metodo: "GET" });
  prueba("ruta desconocida → 404", r.r.status === 404);
}

console.log(`RESULTADO ema-ia: ${ok}/${ok + mal} OK`);
process.exit(mal ? 1 : 0);
