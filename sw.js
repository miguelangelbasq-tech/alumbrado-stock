/* Alumbrado Público — EMA Servicios · service worker (2026-09-27)
   Para que la herramienta se pueda INSTALAR como app en el celular y en la PC.
   Regla: SIEMPRE primero internet. Solo si no hay señal, abre la última versión guardada.
   Así nunca queda una versión vieja pegada: cada vez que hay conexión, se usa lo último de GitHub.
   No toca los datos (Firestore, fotos, mapas y demás servicios de afuera pasan directo, sin guardar). */
const CACHE = 'alumbrado-app-v1';
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html'])).catch(() => {}));
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const claves = await caches.keys();
    await Promise.all(claves.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;          // Firestore, CDN, mapas: directo
  e.respondWith((async () => {
    try {
      const res = await fetch(req);
      if (res && res.ok && res.type === 'basic') {
        const copia = res.clone();
        caches.open(CACHE).then(c => c.put(req, copia)).catch(() => {});
      }
      return res;
    } catch (err) {
      const guardada = await caches.match(req, { ignoreSearch: true })
        || (req.mode === 'navigate' ? (await caches.match('./index.html')) || (await caches.match('./')) : null);
      if (guardada) return guardada;
      throw err;
    }
  })());
});
