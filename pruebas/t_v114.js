// Pruebas v114 · Ahorro de batería: con la app fuera de la vista, los relojitos corren como mucho una vez por minuto;
// a la vista, como siempre. La app arranca y anda igual.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
const escondible = () => { window.__escondida = false; Object.defineProperty(document, 'hidden', { configurable: true, get: () => !!window.__escondida }); };
(async () => {
  const c = prueba('v114' + (cel ? ' cel' : ''));
  const A = await abrir({ sesion: 'admin', cel, datos: baseDatos(), espera: 3000, antes: escondible }), p = A.page;
  let r = await p.evaluate(() => ({ ok: !!window.__relojitosAhorro, prim: document.querySelector('script').id }));
  c(r.ok && r.prim === 'relojitosAhorro', 'el ahorro arranca antes que todo lo demás de la app');
  r = await p.evaluate(async () => {
    let n = 0; const id = setInterval(() => n++, 100);
    await new Promise((x) => setTimeout(x, 1000)); const vis = n;
    window.__escondida = true; n = 0; await new Promise((x) => setTimeout(x, 2000)); const esc = n;
    window.__escondida = false; n = 0; await new Promise((x) => setTimeout(x, 1000)); const vuelta = n;
    clearInterval(id); return { vis, esc, vuelta };
  });
  c(r.vis >= 7 && r.esc <= 1 && r.vuelta >= 7, 'a la vista corre normal; escondida, casi nada; al volver, normal otra vez · ' + JSON.stringify(r));
  r = await p.evaluate(async () => { let n = 0; const id = setInterval(() => n++, 120000); clearInterval(id); let m = 0; const t = setTimeout(() => m++, 50); await new Promise((x) => setTimeout(x, 200)); return { m, tipo: typeof id }; });
  c(r.m === 1, 'los demás temporizadores (setTimeout) no se tocan');
  // la app sigue andando: navegar por las pantallas principales sin errores
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  for (const v of ['parte', 'stock', 'avance', 'produccion', 'mistareas', 'inicio']) { await p.evaluate((v) => mostrarVista(v), v); await p.waitForTimeout(500); }
  c(!errs.length, 'la app se usa igual, sin errores · ' + errs.join(' | '));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})();
