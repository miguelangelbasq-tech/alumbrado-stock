// v143 · Prueba del Worker «ema-avisos»: los avisos con hora (enviarDesde) no salen antes de tiempo, quedan «programados»
// (no se leen cada minuto) y el recordatorio de las 7:00 mira la orden (anulada / otro día / la persona ya no está) y manda
// solo el último de cada tag. Corre sin internet: Firestore y los celulares están simulados.  node workers/probar_ema_avisos.mjs
import { vuelta, VERSION } from "./ema-avisos.js";
let ok = 0, mal = 0; const c = (x, t) => { if (x) { ok++; console.log("  ✓ " + t); } else { mal++; console.log("  ✗ " + t); } };
function base(avisos, ots) {
  const docs = Object.fromEntries(avisos.map((a) => [a.id, Object.assign({}, a)])), leidos = { n: 0 };
  const db = {
    async consulta(col, donde, lim) { if (col === "pushSubs") return [{ id: "s1", clave: "juan perez", tipo: "fcm", fcm: "tok" }, { id: "s2", clave: "pedro gomez", tipo: "fcm", fcm: "tok2" }]; const l = Object.values(docs).filter((d) => d.enviado === donde[2]).slice(0, lim); leidos.n += l.length; return l.map((d) => Object.assign({}, d)); },
    async actualizar(ruta, datos) { Object.assign(docs[ruta.split("/")[1]], datos); },
    async get(ruta) { const id = ruta.split("/")[1]; return ots[id] || null; }, async set() { }, async borrar() { }
  };
  const enviados = [];
  const fetchFn = async (url, op) => { enviados.push(JSON.parse(op.body)); return { ok: true, status: 200, json: async () => ({}) }; };
  return { docs, db, fetchFn, enviados, leidos };
}
const env = { FB_SA_JSON: JSON.stringify({ project_id: "alumbrado-stock" }) };
const T7 = Date.UTC(2026, 10, 11, 10, 0);   // 11/11 07:00 de Argentina
(async () => {
  c(/^v143/.test(VERSION), "versión " + VERSION);
  const ots = { ot1: { estado: "Emitida", fecha: "2026-11-11", personalNombres: ["juan perez", "pedro gomez"] }, ot2: { estado: "Anulada", fecha: "2026-11-11", personalNombres: ["juan perez"] } };
  const av = [
    { id: "n1", enviado: false, clave: "juan perez", titulo: "📋 Tarea", cuerpo: "Tenés orden para mañana", tipo: "ot", ts: 1 },
    { id: "r1", enviado: false, clave: "juan perez", cuerpo: "Hoy: LOS ÁLAMOS · izaje ×4", tipo: "recordatorio", tag: "ema-rec-ot1-juan perez", otId: "ot1", fecha: "2026-11-11", enviarDesde: T7, ts: 2 },
    { id: "r2", enviado: false, clave: "juan perez", cuerpo: "Hoy: LOS ÁLAMOS · izaje ×3", tipo: "recordatorio", tag: "ema-rec-ot1-juan perez", otId: "ot1", fecha: "2026-11-11", enviarDesde: T7, ts: 3 },
    { id: "r3", enviado: false, clave: "juan perez", cuerpo: "Hoy: otra", tipo: "recordatorio", tag: "ema-rec-ot2-juan perez", otId: "ot2", fecha: "2026-11-11", enviarDesde: T7, ts: 4 },
    { id: "r4", enviado: false, clave: "maria", cuerpo: "Hoy: LOS ÁLAMOS", tipo: "recordatorio", tag: "ema-rec-ot1-maria", otId: "ot1", fecha: "2026-11-11", enviarDesde: T7, ts: 5 }
  ];
  const B = base(av, ots);
  // 10/11 16:30 de Argentina: sale el aviso de siempre; los recordatorios quedan programados
  let r = await vuelta(env, { db: B.db, token: "x", fetchFn: B.fetchFn, ahora: Date.UTC(2026, 10, 10, 19, 30) });
  c(B.docs.n1.enviado === true && B.enviados.length === 1, "el aviso al emitir sale enseguida (como siempre)");
  c(["r1", "r2", "r3", "r4"].every((k) => B.docs[k].enviado === "programado") && r.programados === 4, "los recordatorios de las 7:00 quedan «programados» (no salen antes)");
  const l0 = B.leidos.n; await vuelta(env, { db: B.db, token: "x", fetchFn: B.fetchFn, ahora: Date.UTC(2026, 10, 10, 19, 31) });
  c(B.leidos.n === l0, "los programados no se vuelven a leer cada minuto fuera de la ventana de las 7");
  // 11/11 07:01: sale solo el último de cada tag y solo si la orden sigue en pie
  B.enviados.length = 0;
  r = await vuelta(env, { db: B.db, token: "x", fetchFn: B.fetchFn, ahora: Date.UTC(2026, 10, 11, 10, 1) });
  c(B.docs.r2.enviado === true && B.docs.r2.celularesFcm === 1 && B.docs.r1.reemplazado === true, "a las 7:00 sale el último recordatorio de esa orden (el más nuevo) y el viejo queda reemplazado");
  c(B.docs.r3.noVale === true && B.docs.r4.noVale === true, "no sale si la orden se anuló o la persona ya no está en la orden");
  c(B.enviados.length === 1 && JSON.stringify(B.enviados[0]).indexOf("izaje ×3") >= 0, "le llega uno solo a Juan, con lo último de la orden");
  console.log(`RESULTADO ema-avisos v143: ${ok}/${ok + mal} ${mal ? "FALLAS" : "OK"}`); process.exit(mal ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
