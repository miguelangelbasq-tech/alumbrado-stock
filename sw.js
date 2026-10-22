// sw.js · App Alumbrado Público EMA — avisos al celular con la app cerrada (v050).
// Va en la raíz del repositorio de GitHub, al lado de index.html (Add file › Upload › sw.js).
// Recibe los avisos que manda el Worker «ema-avisos» y los muestra como notificación del celular («Tarea de EMA»).
// No guarda nada en caché: la app se sigue bajando siempre de GitHub como hasta ahora.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
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
