// sw.js · App Alumbrado Público EMA — v065: la app abre sin internet + avisos al celular (v050).
// Va en la raíz del repositorio de GitHub, al lado de index.html (reemplaza al sw.js de la v050).
//  · La app (index.html) se pide SIEMPRE primero a GitHub: con señal llega la última versión. Si no hay señal (o tarda más
//    de 6 segundos), se abre la última que quedó guardada en el celular.
//  · Las piezas que vienen de afuera (Firebase, el mapa, las letras) quedan guardadas en el celular la primera vez.
//  · Los pedazos del mapa (calles / satélite) que ya se vieron quedan guardados (hasta 2500).
//  · NO se guarda nada de la base de datos ni de las fotos: eso lo maneja la app (base local de Firebase y cola de fotos).
const VERSION = "ema-v065";
const APP = VERSION + "-app", PIEZAS = "ema-piezas-v1", MAPA = "ema-mapa-v1";
const MAX_MAPA = 2500;
const AFUERA = [
  "https://www.gstatic.com/firebasejs/12.17.1/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore-compat.js",
  "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth-compat.js",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
];
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil((async () => {
    const app = await caches.open(APP);
    await Promise.all(["./", "ema-icono.png"].map((u) => fetch(u, { cache: "no-store" }).then((r) => r.ok && app.put(u, r)).catch(() => { })));
    const p = await caches.open(PIEZAS);
    await Promise.all(AFUERA.map((u) => fetch(u, { mode: "no-cors" }).then((r) => p.put(u, r)).catch(() => { })));
  })());
});
self.addEventListener("activate", (e) => e.waitUntil((async () => {
  const ks = await caches.keys();
  await Promise.all(ks.filter((k) => k.startsWith("ema-v") && k !== APP).map((k) => caches.delete(k)));
  await self.clients.claim();
})()));
const esMapa = (u) => /(^|\.)tile\.openstreetmap\.org$/.test(u.hostname) || u.hostname === "server.arcgisonline.com";
const esPieza = (u) => u.hostname === "www.gstatic.com" && u.pathname.startsWith("/firebasejs/") || u.hostname === "cdnjs.cloudflare.com" || u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com" || u.hostname === "unpkg.com" || u.hostname === "cdn.jsdelivr.net";
async function recortar(nombre, max) { try { const c = await caches.open(nombre), ks = await c.keys(); for (let i = 0; i < ks.length - max; i++) await c.delete(ks[i]); } catch { } }
self.addEventListener("fetch", (e) => {
  const r = e.request; if (r.method !== "GET") return;
  let u; try { u = new URL(r.url); } catch { return; }
  // la app: primero GitHub; sin señal, la guardada
  if (r.mode === "navigate" && u.origin === self.location.origin) {
    e.respondWith((async () => {
      const c = await caches.open(APP);
      try {
        const red = await Promise.race([fetch(r, { cache: "no-store" }), new Promise((_, mal) => setTimeout(() => mal(new Error("lento")), 6000))]);
        if (red && red.ok) { c.put("./", red.clone()).catch(() => { }); return red; }
        throw new Error("mal");
      } catch {
        return (await c.match("./")) || (await c.match(r)) || (await caches.match(r)) || new Response("<h1>Sin conexión</h1><p>Abrí la app una vez con internet para que quede guardada en el celular.</p>", { headers: { "Content-Type": "text/html; charset=utf-8" } });
      }
    })());
    return;
  }
  // el ícono y otros archivos propios: primero la red, si no lo guardado
  if (u.origin === self.location.origin && /\.(png|ico|svg|webmanifest|json)$/.test(u.pathname)) {
    e.respondWith(fetch(r).then((x) => { if (x.ok) caches.open(APP).then((c) => c.put(r, x.clone())); return x; }).catch(async () => (await caches.match(r)) || Response.error()));
    return;
  }
  // piezas de afuera (Firebase, mapa, letras): lo guardado al toque y se actualiza por detrás
  if (esPieza(u)) {
    e.respondWith((async () => {
      const c = await caches.open(PIEZAS), g = await c.match(r, { ignoreVary: true });
      const red = fetch(r).then((x) => { if (x && (x.ok || x.type === "opaque")) c.put(r, x.clone()).catch(() => { }); return x; }).catch(() => null);
      return g || (await red) || Response.error();
    })());
    return;
  }
  // pedazos del mapa ya vistos
  if (esMapa(u)) {
    e.respondWith((async () => {
      const c = await caches.open(MAPA), g = await c.match(r);
      if (g) { fetch(r).then((x) => x && (x.ok || x.type === "opaque") && c.put(r, x)).catch(() => { }); return g; }
      try { const x = await fetch(r); if (x && (x.ok || x.type === "opaque")) { c.put(r, x.clone()).then(() => recortar(MAPA, MAX_MAPA)).catch(() => { }); } return x; }
      catch { return Response.error(); }
    })());
  }
  // todo lo demás (base de datos, fotos, Worker, búsquedas) va directo, sin guardar
});
// ---------- avisos al celular con la app cerrada (v050)
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (er) { d = { title: "Tarea de EMA", body: e.data ? e.data.text() : "" }; }
  const titulo = d.title || "Tarea de EMA";
  e.waitUntil(self.registration.showNotification(titulo, {
    body: d.body || "",
    icon: d.icon || "ema-icono.png",
    badge: d.badge || "ema-icono.png",
    tag: d.tag || "ema-" + Date.now(),
    renotify: true,
    vibrate: [200, 100, 200, 100, 300],
    data: { url: d.url || "./" }
  }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || "./", self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((l) => {
    for (const c of l) if (c.url.indexOf(self.registration.scope) === 0 && "focus" in c) { c.postMessage({ tipo: "ema-aviso", url }); return c.focus(); }
    return self.clients.openWindow ? self.clients.openWindow(url) : null;
  }));
});
