// v139 · La app aprovecha toda la pantalla en la compu (solo con más de 900 px): Inicio a todo lo ancho con 3/4 columnas,
// Perfil en columnas, Asistente como panel lateral de alto completo (redimensionable) que corre el contenido, .wrap hasta
// 1960 px, sin scroll horizontal en 1024–2560. En el celular (y hasta 900 px) todo mide igual que antes: se compara con la
// hoja v139PcCss apagada.
const { abrir, prueba } = require('./h');
const cel = process.argv[2] === 'cel';
const CAP = process.env.CAP || '';
(async () => {
  const c = prueba('v139' + (cel ? ' cel' : ''));
  const A = await abrir({ sesion: 'admin', cel, espera: 4000, nav: true, inicio: true, supervisor: true, guias: true, iaPro: true });
  const p = A.page;
  p.on('dialog', (x) => x.accept());
  const ver = async (v) => { await p.evaluate((x) => { try { window.__asistente && window.__asistente.cerrar && window.__asistente.cerrar(); } catch (e) { } mostrarVista(x); }, v); await p.waitForTimeout(700); };
  const hoja = (on) => p.evaluate((on) => { const s = document.getElementById('v139PcCss'); s.disabled = !on; return !!s; }, on);
  // medidas clave de una pantalla (para comparar con y sin la hoja nueva)
  const medidas = () => p.evaluate(() => {
    const R = (e) => { const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)].join(','); };
    const q = '#ieHero, #iniEje .ie-tarj, #iniEje .ie-kpi, #viewPerfil > *, #iaPanel, #iaPanel .ia-chat, .wrap, header .header-inner, #navN1';
    return [...document.querySelectorAll(q)].filter((e) => e.offsetWidth > 0).map((e) => (e.id || e.className) + ':' + R(e)).join(' | ');
  });
  const igual = async (nombre) => { await p.waitForTimeout(1200); await hoja(true); await p.waitForTimeout(150);   // espera a que terminen las animaciones de entrada
    const a = await medidas(); await hoja(false); await p.waitForTimeout(150); const b = await medidas(); await hoja(true); c(a === b && a.length > 0, nombre + ' mide igual que antes' + (a === b ? '' : ' · ' + a.slice(0, 300) + ' ≠ ' + b.slice(0, 300))); };

  c(await p.evaluate(() => !!document.getElementById('v139PcCss') && !!window.__iaAncho), 'está la hoja v139PcCss y __iaAncho');

  if (cel) {
    // ===================== celular: nada cambia
    await ver('inicio'); await p.waitForTimeout(800); await igual('Inicio (390)');
    await ver('perfil'); await igual('Perfil (390)');
    await ver('stock'); await igual('Pañol (390)');
    await ver('obras'); await p.evaluate(() => window.__asistenteAbrir && window.__asistenteAbrir()); await p.waitForTimeout(2500);
    const r = await p.evaluate(() => { const b = document.getElementById('iaPanel').getBoundingClientRect(); return { l: b.left, t: b.top, w: b.width, h: b.height, W: innerWidth, H: innerHeight, pad: getComputedStyle(document.body).paddingRight }; });
    c(r.l === 0 && r.t === 0 && Math.abs(r.w - r.W) < 1 && Math.abs(r.h - r.H) < 1, 'Asistente a pantalla completa en el celu · ' + JSON.stringify(r));
    c(r.pad === '0px', 'el contenido no se corre en el celu · ' + r.pad);
    await igual('Asistente abierto (390)');
    c(await p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), 'sin scroll horizontal en el celu');
  } else {
    // ===================== hasta 900 px: igual que antes
    await p.setViewportSize({ width: 900, height: 900 });
    await ver('inicio'); await p.waitForTimeout(800); await igual('Inicio (900)');
    await ver('perfil'); await igual('Perfil (900)');

    // ===================== sin scroll horizontal en los 6 anchos
    for (const W of [1024, 1280, 1440, 1600, 1920, 2560]) {
      await p.setViewportSize({ width: W, height: 900 });
      const malas = [];
      for (const v of ['inicio', 'perfil', 'obras', 'parte', 'stock', 'produccion', 'avance', 'informe', 'calc', 'gastos', 'guias', 'mapa']) {
        await ver(v);
        if (await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)) malas.push(v);
      }
      c(!malas.length, `sin scroll horizontal a ${W} px` + (malas.length ? ' · ' + malas.join(', ') : ''));
    }

    // ===================== Inicio a todo lo ancho, 3 y 4 columnas
    for (const [W, col] of [[1600, 3], [1920, 4], [1280, 3], [1024, 2]]) {
      await p.setViewportSize({ width: W, height: 900 }); await ver('inicio'); await p.waitForTimeout(900);
      const r = await p.evaluate(() => {
        const cw = document.documentElement.clientWidth, h = document.getElementById('ieHero').getBoundingClientRect(), cu = document.querySelector('#iniEje .ie-cuerpo').getBoundingClientRect();
        const t = [...document.querySelectorAll('#iniEje .ie-tarj')].filter((e) => e.offsetHeight > 0);
        const cols = new Set(t.map((e) => Math.round(e.getBoundingClientRect().left / 4)));
        const k = [...document.querySelectorAll('#iniEje .ie-kpi')].map((e) => e.getBoundingClientRect());
        const s = document.querySelector('#iniEje .ie-saludo .ent').getBoundingClientRect(), a = document.querySelector('#iniEje .ie-anillo').getBoundingClientRect();
        return { cw, hero: h.width / cw, cuerpo: cu.width / cw, cols: cols.size, n: t.length, fila: k.length === 3 && Math.abs(k[0].top - s.top) < 60 && s.right < k[0].left && a.left > k[2].right };
      });
      if (W >= 1600) c(r.hero >= 0.9 && r.cuerpo >= 0.9, `Inicio usa ≥ 90 % del ancho a ${W} · portada ${(r.hero * 100).toFixed(1)} % · tarjetas ${(r.cuerpo * 100).toFixed(1)} %`);
      c(r.cols === col, `Inicio en ${col} columnas a ${W} (hay ${r.cols}, ${r.n} tarjetas)`);
      if (W >= 1280) c(r.fila, `portada: saludo · KPIs · anillo en una fila a ${W}`);
      if (W === 1600 && CAP) await p.screenshot({ path: CAP + '/t139_inicio_1600.png' });
    }
    await p.setViewportSize({ width: 2560, height: 1000 }); await ver('inicio'); await p.waitForTimeout(600);
    c(await p.evaluate(() => document.getElementById('iniEje').getBoundingClientRect().width <= 2201), 'Inicio con tope de 2200 px en pantallas enormes');

    // ===================== Perfil en columnas
    for (const [W, n] of [[1024, 2], [1600, 3]]) {
      await p.setViewportSize({ width: W, height: 900 }); await ver('perfil'); await p.waitForTimeout(600);
      const r = await p.evaluate(() => {
        const l = (s) => { const e = document.querySelector('#viewPerfil ' + s); return e ? Math.round(e.getBoundingClientRect().left) : -1; };
        const t = [...document.querySelectorAll('#viewPerfil .pf-tarj')].map((e) => Math.round(e.getBoundingClientRect().left));
        return { yo: l('.pf-yo'), kp: l('.pf-kpis'), aj: t[0], app: t[1], sal: l('.pf-salir'), w: document.getElementById('viewPerfil').getBoundingClientRect().width };
      });
      const cols = new Set([r.yo, r.aj, r.app]).size;
      c(cols >= n && r.yo === r.kp && r.yo < r.aj, `Perfil en ${n} columnas a ${W} · ${JSON.stringify(r)}`);
      if (n === 3) c(r.sal === r.app && r.w <= 1401, 'Perfil: «Cerrar sesión» debajo de «La app» y tope de 1400 px');
    }

    // ===================== .wrap de Pañol a 1600
    await p.setViewportSize({ width: 1600, height: 900 }); await ver('stock');
    const ws = await p.evaluate(() => document.getElementById('viewStock').getBoundingClientRect().width);
    c(ws > 1400, `.wrap de Pañol con más de 1400 px a 1600 (${Math.round(ws)})`);
    await p.setViewportSize({ width: 2560, height: 1000 }); await ver('stock');
    const ws2 = await p.evaluate(() => document.getElementById('viewStock').getBoundingClientRect().width);
    c(ws2 >= 1800 && ws2 <= 2000, `.wrap con tope de unos 1960 px a 2560 (${Math.round(ws2)})`);

    // ===================== Asistente: panel lateral de alto completo
    for (const W of [1600, 1920]) {
      await p.setViewportSize({ width: W, height: 900 }); await ver('obras');
      await p.evaluate(() => window.__asistenteAbrir && window.__asistenteAbrir()); await p.waitForTimeout(2500);
      const r = await p.evaluate(() => {
        const b = document.getElementById('iaPanel').getBoundingClientRect(), cw = document.documentElement.clientWidth;
        const m = document.getElementById('btnMenu').getBoundingClientRect(), hd = document.querySelector('body > header').getBoundingClientRect();
        const v = document.getElementById('viewObras').getBoundingClientRect(), chat = document.querySelector('#iaPanel .ia-chat').getBoundingClientRect();
        const enMenu = document.elementFromPoint(m.left + m.width / 2, m.top + m.height / 2);
        return { l: b.left, r: b.right, t: b.top, bo: b.bottom, w: b.width, H: innerHeight, cw, iw: innerWidth, menuR: m.right, menuVis: !!enMenu && !!enMenu.closest('#btnMenu'), hdR: hd.right, vR: v.right, chat: chat.width };
      });
      c(r.t === 0 && Math.abs(r.bo - r.H) < 1, `Asistente de alto completo a ${W} · ${r.t}–${r.bo} de ${r.H}`);
      c(Math.abs(r.r - r.iw) < 20 && r.w >= 420 && r.w <= 760, `Asistente a la derecha, ${Math.round(r.w)} px de ancho`);
      c(r.menuVis && r.menuR < r.l, 'el Asistente no tapa el botón del menú');
      c(r.hdR <= r.l + 1 && r.vR <= r.l + 1, `el contenido se corre: queda a la vista al lado (header ${Math.round(r.hdR)}, pantalla ${Math.round(r.vR)}, panel desde ${Math.round(r.l)})`);
      c(r.chat >= 380 && r.chat <= 760, `chat con ancho de lectura cómodo (${Math.round(r.chat)} px)`);
      if (W === 1600) {
        if (CAP) await p.screenshot({ path: CAP + '/t139_asistente_1600.png' });
        // arrastrar el borde izquierdo
        const h = await p.evaluate(() => { const e = document.querySelector('#iaPanel .ia-ancho'); if (!e) return null; const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
        c(!!h, 'el panel tiene el asa para cambiar el ancho');
        if (h) {
          await p.mouse.move(h.x, h.y); await p.mouse.down(); await p.mouse.move(h.x - 60, h.y, { steps: 4 }); await p.mouse.move(h.x - 120, h.y, { steps: 4 }); await p.mouse.up();
          const w2 = await p.evaluate(() => document.getElementById('iaPanel').getBoundingClientRect().width);
          c(Math.abs(w2 - (r.w + 120)) < 3, `arrastrando 120 px el panel queda de ${Math.round(w2)} px`);
          c(await p.evaluate(() => localStorage.getItem('ema.ia.ancho')) === String(Math.round(w2)), 'el ancho queda guardado en el aparato');
          await p.mouse.dblclick(h.x - 120, h.y);
          const w3 = await p.evaluate(() => document.getElementById('iaPanel').getBoundingClientRect().width);
          c(Math.abs(w3 - 480) < 2, `doble clic vuelve a 480 px (${Math.round(w3)})`);
          await p.evaluate(() => window.__iaAncho.poner(5000));
          c(await p.evaluate(() => document.getElementById('iaPanel').getBoundingClientRect().width <= window.__iaAncho.maximo() + 1), 'el ancho tiene tope');
          await p.evaluate(() => window.__iaAncho.poner(480));
        }
        // el menú lateral queda arriba del panel
        await p.evaluate(() => abrirMenuLateral()); await p.waitForTimeout(400);
        const mz = await p.evaluate(() => { const b = document.querySelector('#menuLateral .menu-panel').getBoundingClientRect(); const e = document.elementFromPoint(b.left + 20, b.top + b.height / 2); return !!e && !!e.closest('#menuLateral'); });
        c(mz, 'el menú lateral se abre por encima de todo');
        await p.evaluate(() => cerrarMenuLateral()); await p.waitForTimeout(300);
      }
      await p.evaluate(() => window.__asistente && window.__asistente.cerrar && window.__asistente.cerrar()); await p.waitForTimeout(300);
      c(await p.evaluate(() => getComputedStyle(document.body).paddingRight === '0px'), 'al cerrar el Asistente el contenido vuelve a todo lo ancho');
    }
    // a 1024 el panel flota (sin correr el contenido: no queda lugar)
    await p.setViewportSize({ width: 1024, height: 800 }); await ver('obras');
    await p.evaluate(() => window.__asistenteAbrir && window.__asistenteAbrir()); await p.waitForTimeout(1200);
    const r1 = await p.evaluate(() => ({ pad: getComputedStyle(document.body).paddingRight, sw: document.documentElement.scrollWidth <= document.documentElement.clientWidth, h: document.getElementById('iaPanel').getBoundingClientRect().height, H: innerHeight }));
    c(r1.pad === '0px' && r1.sw && Math.abs(r1.h - r1.H) < 1, 'a 1024 el Asistente flota a la derecha, de alto completo y sin scroll horizontal · ' + JSON.stringify(r1));
    await p.evaluate(() => window.__asistente && window.__asistente.cerrar && window.__asistente.cerrar());
  }
  c(A.errores.filter((e) => !/net::|Failed to load|ERR_|favicon/.test(e)).length === 0, 'sin errores de JavaScript · ' + JSON.stringify(A.errores.slice(0, 4)));
  await A.browser.close();
  process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
