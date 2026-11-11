// v147 · Movimiento entre pantallas, opción B «como app de banco».
// Lucía (oficina) en el celu (390×844) o en la compu:
//  · celu: Inicio → Obras → legajo → ← volver → Órdenes → Seguimiento → Tablero → Pañol → «atrás» del celu (x2): la dirección
//    (adelante = desde la derecha, atrás = al revés), durante el movimiento se ve la pantalla anterior REAL (no una copia: un solo
//    #viewX, sin id repetidos), nunca hay scroll de costado, y al terminar queda UNA sola pantalla, sin restos ni id repetidos;
//  · hojas: la ficha del material sube y baja (con ✕ y con «atrás» del celu: la historia de la v138 queda igual);
//  · sin movimiento: cámara de la app (y un cambio de pantalla con la cámara abierta), mapa, Asistente;
//  · reduced-motion (sin movimiento), Perfil › «Movimiento entre pantallas» Sí / No, celu lento (simulado: el primer cambio
//    tarda > 250 ms) → pasa sola a la opción A (fundido corto) y Perfil lo dice;
//  · compu: fundido de 150 ms (sin pantalla anterior al costado), Asistente lateral sin movimiento, ajuste y reduced-motion.
const { abrir, prueba } = require('./h');
const { datos143 } = require('./datos143');
const { datos147, P: P147 } = require('./datos147');
const { DOM } = require('./h');
const cel = process.argv[2] === 'cel';
function datosOfi() {   // los mismos datos del video de la maqueta (maq_mov/datos.js)
  const d = datos143(), hoy = d.hoy, ahora = Date.now();
  const P = (l) => l.map((n) => ({ nombre: n, rol: 'Oficial' })), K = (l) => l.map((n) => n.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase());
  const ot = (n, plaza, gente, act, prev, estado, campo) => ({ numero: 'OT-2026-' + n, fecha: hoy, plazaId: plaza, plazaNombre: d.db.avanceObras[plaza].nombre, obraId: d.db.avanceObras[plaza].obraId, horaInicio: '07:30', horaFin: '15:30', cuadrilla: gente.map((x) => x.split(' ')[0]).join(' y '), responsable: gente[0], personal: P(gente), personalNombres: K(gente), actividades: act, previsto: prev, actividadesManuales: [], estado, campo: campo || {}, creado: ahora, creadoPor: 'admin@' + DOM });
  Object.assign(d.db.ordenesTrabajo, {
    h1: ot('140', 'p1', ['Juan Pérez', 'Pedro Gómez'], ['montaje_vinculo'], { montaje_vinculo: 2 }, 'En curso', { marcas: { montaje_vinculo: { hecha: true, cant: 1 } } }),
    h2: ot('141', 'p2', ['Raúl Sosa', 'Diego Luna'], ['excavacion', 'hormigonado'], { excavacion: 4, hormigonado: 4 }, 'Emitida'),
  });
  return d;
}
const camaraFalsa = () => {
  try { localStorage.setItem('ema.nav.guardada', '0'); } catch (e) { }
  // muestreo de cada cuadro mientras dura un cambio (empieza con cada toque y con «atrás»)
  window.__muestras = [];
  const muestrear = (motivo) => {
    const L = { motivo, f: [] }; window.__muestras.push(L); const t0 = performance.now(); let k = 0;
    const f = () => {
      const vistas = [...document.querySelectorAll('.wrap[id^=view]')].filter((e) => getComputedStyle(e).display !== 'none');
      const x = { t: Math.round(performance.now() - t0), vistas: vistas.map((e) => e.id), sale: [...document.querySelectorAll('.mov-sale')].map((e) => e.id), fant: document.querySelectorAll('.mov-fantasma').length, sx: window.scrollX, ancho: document.documentElement.scrollWidth > window.innerWidth + 1 && getComputedStyle(document.documentElement).overflowX !== 'hidden', copias: 0 };
      vistas.forEach((v) => { if (document.querySelectorAll('#' + v.id).length !== 1) x.copias++; });
      if (k++ % 3 === 0) { const m = {}; document.querySelectorAll('[id]').forEach((e) => { m[e.id] = (m[e.id] || 0) + 1; }); x.dup = Object.keys(m).filter((i) => m[i] > 1).sort().join(','); }
      const s = x.sale[0] && document.getElementById(x.sale[0]); if (s) { const tr = getComputedStyle(s).transform; x.saleX = tr === 'none' ? 0 : new DOMMatrix(tr).m41; }
      L.f.push(x);
      if (performance.now() - t0 < 600) requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  };
  document.addEventListener('pointerdown', () => muestrear('toque'), true);
  window.addEventListener('popstate', () => muestrear('atras'), true);
  const dib = (c) => { const x = c.getContext('2d'); x.fillStyle = '#9cc3e6'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#6f6f5c'; x.fillRect(0, c.height * 0.62, c.width, c.height); };
  if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => { const c = document.createElement('canvas'); c.width = 720; c.height = 1280; dib(c); setInterval(() => dib(c), 200); return c.captureStream(10); };
  document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = '#avToast{display:none!important}'; document.head.appendChild(s); });
};
(async () => {
  const c = prueba('v147' + (cel ? ' cel' : ''));
  const A = await abrir({ datos: datosOfi(), sesion: 'lucia', espera: 5000, antes: camaraFalsa, mov: true, inicio: true, nav: true, porPartes: true, ofPasos: true, tarjetas: true, camaraB: true, https: true, cel });
  const p = A.page;
  await A.ctx.grantPermissions(['camera'], { origin: 'https://app.test' });
  const ev = (f, a) => p.evaluate(f, a);
  const ult = () => ev(() => { const h = window.__mov.estado().hist; return h[h.length - 1] || {}; });
  const nHist = () => ev(() => window.__mov.estado().hist.length);
  const dup0 = await ev(() => { const m = {}; document.querySelectorAll('[id]').forEach((e) => { m[e.id] = (m[e.id] || 0) + 1; }); return Object.keys(m).filter((i) => m[i] > 1).sort().join(','); });
  console.log('   (id repetidos que ya tenía la app antes de moverse: ' + (dup0 || 'ninguno') + ')');
  const limpio = async (txt) => {   // después de cada cambio: una sola pantalla, sin restos, sin id repetidos nuevos, sin scroll de costado
    const r = await ev((d0) => {
      const m = {}; document.querySelectorAll('[id]').forEach((e) => { m[e.id] = (m[e.id] || 0) + 1; });
      const dup = Object.keys(m).filter((i) => m[i] > 1).sort().join(',');
      return { vistas: [...document.querySelectorAll('.wrap[id^=view]')].filter((e) => getComputedStyle(e).display !== 'none').length, restos: document.querySelectorAll('.mov-sale,.mov-fantasma,.mov-velo,.mov-fondo,.mov-cierra,.mov-entra,.mov-el').length, dupOk: dup === d0, dup, ancho: document.documentElement.scrollWidth <= window.innerWidth + 1, sx: window.scrollX, anim: document.documentElement.classList.contains('mov-anim') };
    }, dup0);
    c(r.vistas === 1 && !r.restos && r.dupOk && r.ancho && !r.sx && !r.anim, txt + ': queda una sola pantalla, sin restos ni id repetidos ni scroll de costado' + (r.vistas === 1 && !r.restos && r.dupOk && r.ancho && !r.anim ? '' : ' ' + JSON.stringify(r)));
  };
  const durante = async (txt, espera) => {   // lo que se vio cuadro por cuadro durante el último cambio
    const M = await ev(() => { const l = window.__muestras; return l[l.length - 1] || { f: [] }; });
    const f = M.f, malos = f.filter((x) => x.sx || x.ancho || x.copias || (x.dup !== undefined && x.dup !== dup0));
    const real = f.some((x) => x.sale.length && x.vistas.indexOf(x.sale[0]) >= 0);
    if (espera === 'real') c(real && f.some((x) => x.vistas.length === 2) && f.every((x) => x.vistas.length <= 2), txt + ': durante el movimiento se ve la pantalla anterior REAL (no una copia) y nunca más de dos');
    c(f.length > 3 && !malos.length, txt + ': cuadro por cuadro sin scroll de costado, sin copias ni id repetidos (' + f.length + ' cuadros)' + (malos.length ? ' ' + JSON.stringify(malos[0]) : ''));
    return f;
  };
  await ev((d) => { window.__dup0 = d; }, dup0);
  const toca = async (sel, ms) => { await p.click(sel, { timeout: 8000 }); await p.waitForTimeout(ms || 750); };

  c(await ev(() => !!window.__mov && document.getElementById('movCss') && document.getElementById('movPantallas') && document.querySelectorAll('#movCss').length === 1), 'el módulo está (movCss + movPantallas)');
  c(await ev(() => window.__mov.modo()) === (cel ? 'B' : 'F'), cel ? 'en el celu: opción B' : 'en la compu: fundido');

  if (cel) {
    // ---------------------------------------------------------------- pantallas: ir y volver
    await toca('#navN1 [data-n1="obras"]');
    let u = await ult();
    c(u.tipo === 'vista' && u.de === 'viewInicio' && u.a === 'viewObras' && u.dir === 1 && u.modo === 'B', 'Inicio → Obras: entra desde la derecha (B)');
    let f = await durante('Inicio → Obras', 'real');
    c(f.some((x) => x.sale[0] === 'viewInicio' && x.saleX < -20), 'Inicio → Obras: la anterior se corre a la izquierda');
    await limpio('Inicio → Obras');

    await toca('#obrasApp [data-lgabrir]');
    u = await ult(); c(u.tipo === 'obrasApp' && u.a === 'lg' && u.dir === 1, 'Obras → legajo: desde la derecha');
    f = await durante('Obras → legajo'); c(f.some((x) => x.fant === 1), 'Obras → legajo: la lista que se va son sus nodos (sin id), uno solo');
    await limpio('Obras → legajo');
    await toca('#obrasApp [data-lgvolver]');
    u = await ult(); c(u.tipo === 'obrasApp' && u.a === 'lista' && u.dir === -1, '← Todas las obras: al revés');
    await durante('legajo ← volver'); await limpio('legajo ← volver');

    await toca('#navN1 [data-n1="ordenes"]');
    u = await ult(); c(u.a === 'viewParteDiario' && u.dir === 1, 'Obras → Órdenes: desde la derecha (más a la derecha en la barra)');
    await durante('Obras → Órdenes', 'real'); await limpio('Obras → Órdenes');
    await toca('#subtabsOrdenes .subtab[data-sub="seguimiento"]');
    u = await ult(); c(u.tipo === 'sub' && u.a === 'seguimiento' && u.dir === 1, 'Tablero → Seguimiento (subpestaña): desde la derecha');
    await durante('Tablero → Seguimiento'); await limpio('Tablero → Seguimiento');
    await toca('#subtabsOrdenes .subtab[data-sub="tablero"]');
    u = await ult(); c(u.tipo === 'sub' && u.dir === -1, 'Seguimiento → Tablero: al revés');
    await toca('#navN1 [data-n1="panol"]');
    u = await ult(); c(u.a === 'viewStock' && u.dir === 1, 'Órdenes → Pañol: desde la derecha');
    await limpio('Órdenes → Pañol');
    await toca('#navN1 [data-n1="inicio"]');
    u = await ult(); c(u.a === 'viewInicio' && u.dir === -1, 'Pañol → Inicio (a la izquierda en la barra): al revés');
    await durante('Pañol → Inicio', 'real'); await limpio('Pañol → Inicio');

    // ---------------------------------------------------------------- «atrás» del celu (v138)
    await toca('#navN1 [data-n1="obras"]'); await toca('#navN1 [data-n1="ordenes"]');
    const e0 = await ev(() => window.__atras.estado());
    await p.goBack(); await p.waitForTimeout(800);
    u = await ult(); let e1 = await ev(() => window.__atras.estado());
    c(u.de === 'viewParteDiario' && u.a === 'viewObras' && u.dir === -1 && u.modo === 'B', '«atrás» del celu: vuelve a Obras y al revés');
    c(e1.vista === 'obras' && e1.prof === e0.prof - 1 && e1.pila.join() === 'inicio,obras', '«atrás» del celu: la historia de la v138 queda igual (' + e1.pila.join(' › ') + ', nivel ' + e1.prof + ')');
    await durante('«atrás» del celu', 'real'); await limpio('«atrás» del celu');
    await p.goBack(); await p.waitForTimeout(800);
    u = await ult(); e1 = await ev(() => window.__atras.estado());
    c(u.a === 'viewInicio' && u.dir === -1 && e1.vista === 'inicio' && e1.prof === 0, '«atrás» otra vez: al Inicio, al revés, sin historia de más');
    await limpio('«atrás» al Inicio');

    // ---------------------------------------------------------------- hojas: la ficha del material sube y baja
    await toca('#navN1 [data-n1="panol"]');
    const hayFicha = await p.locator('#viewStock .pf-link[data-cod]').count();
    if (hayFicha) {
      await p.locator('#viewStock .pf-link[data-cod]').first().click(); await p.waitForTimeout(150);
      u = await ult(); c(u.tipo === 'hoja' && u.a === 'pfModal', 'la ficha del material sube desde abajo');
      await p.waitForTimeout(500);
      await toca('#pfModal [data-pf="cerrar"]', 100);
      c(await ev(() => document.querySelectorAll('.mov-cierra').length === 1 && !document.getElementById('pfModal')), 'al cerrar con ✕ baja (la hoja que se va no tiene id: no hay dos #pfModal)');
      await p.waitForTimeout(500);
      u = await ult(); c(u.tipo === 'hojaCierra', 'la ficha bajó'); await limpio('ficha ✕');
      const a0 = await ev(() => window.__atras.estado().prof);
      await p.locator('#viewStock .pf-link[data-cod]').first().click(); await p.waitForTimeout(900);
      const a1 = await ev(() => window.__atras.estado());
      await p.goBack(); await p.waitForTimeout(900);
      const a2 = await ev(() => window.__atras.estado());
      c(a1.prof === a0 + 1 && a2.prof === a0 && !(await p.$('#pfModal')) && a2.vista === 'stock', '«atrás» con la ficha abierta: la cierra (baja) y la historia vuelve al mismo nivel');
      await limpio('ficha con «atrás»');
    } else c(false, 'no encontré una ficha del pañol');

    // ---------------------------------------------------------------- sin movimiento: mapa, Asistente, cámara
    await ev(() => window.abrirMenuLateral()); await p.waitForTimeout(400);
    await p.click('#menuLista .menu-item[data-vista="mapa"]'); await p.waitForTimeout(700);
    u = await ult(); c(u.a === 'viewMapa' && !u.modo && u.por === 'mapa', 'al Mapa: sin movimiento (cambio al instante)');
    await limpio('Mapa');
    await toca('#navN1 [data-n1="inicio"]');
    u = await ult(); c(u.de === 'viewMapa' && !u.modo, 'del Mapa al Inicio: sin movimiento');

    const n0 = await nHist();
    await ev(() => { document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); window.__asistenteAbrir && window.__asistenteAbrir(); });
    await p.waitForTimeout(1500);
    const iaAn = await ev(() => { const ia = document.getElementById('iaPanel'); return { vis: !!ia && getComputedStyle(ia).display !== 'none', mov: document.getAnimations().filter((a) => a.constructor.name === 'Animation' && a.effect && a.effect.target && ia && ia.contains(a.effect.target)).length }; });
    await ev(() => { document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); window.mostrarVista('stock'); });
    await p.waitForTimeout(500);
    u = await ult();
    c(iaAn.vis && !iaAn.mov && u.a === 'viewStock' && !u.modo && u.por === 'asistente', 'Asistente: se abre sin movimiento y lo que cambia detrás (con el Asistente encima) va al instante');
    await ev(() => { const b = document.querySelector('#iaPanel [data-ia="volver"]'); b && b.click(); }); await p.waitForTimeout(600);

    await ev(() => { document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; window.camaraApp.abrir(i); });
    await p.waitForFunction(() => { const v = document.getElementById('ecVideo'); return v && v.videoWidth > 0; }, null, { timeout: 9000 }).catch(() => { });
    await p.waitForTimeout(800);
    const cam = await ev(() => { const ca = document.getElementById('emaCam'); return { vis: !!ca && getComputedStyle(ca).display !== 'none', mov: document.getAnimations().filter((a) => a.constructor.name === 'Animation' && a.effect && a.effect.target && (a.effect.target.closest ? a.effect.target.closest('#emaCam,#cbHoja,#ecElegir') : null)).length }; });
    await ev(() => { document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); window.mostrarVista('obras'); });
    await p.waitForTimeout(500);
    u = await ult();
    c(cam.vis && !cam.mov && u.a === 'viewObras' && !u.modo && u.por === 'camara', 'cámara de la app: se abre sin movimiento y con la cámara abierta (Modo obra con la foto) nada se mueve' + (cam.vis && !cam.mov && u.por === 'camara' ? '' : ' ' + JSON.stringify([cam, u])));
    await ev(() => { try { window.camaraApp.cerrar(); } catch (e) { } }); await p.waitForTimeout(600);
    await limpio('cámara');

    // ---------------------------------------------------------------- reduced-motion
    await p.emulateMedia({ reducedMotion: 'reduce' }); await p.waitForTimeout(200);
    const nAnim = await ev(() => document.getAnimations().length);
    await p.click('#navN1 [data-n1="ordenes"]'); await p.waitForTimeout(60);
    const rm = await ev(() => ({ n: document.getAnimations().filter((a) => a.constructor.name === 'Animation').length, sale: document.querySelectorAll('.mov-sale').length }));
    await p.waitForTimeout(600);
    u = await ult(); c(!u.modo && u.por === 'apagado' && !rm.sale && !rm.n, 'reduced-motion: el celu pide menos movimiento → cambio al instante');
    await p.emulateMedia({ reducedMotion: 'no-preference' }); await p.waitForTimeout(200);

    // ---------------------------------------------------------------- Perfil › Movimiento entre pantallas
    await toca('#navN1 [data-n1="perfil"]', 900);
    const fila = () => ev(() => { const b = document.querySelector('#viewPerfil [data-pf="mov"]'); return b ? { t: b.textContent, on: !!b.querySelector('.pf-sw.on') } : null; });
    let fl = await fila();
    c(fl && /Movimiento entre pantallas/.test(fl.t) && fl.on && /Sí/.test(fl.t), 'Perfil › Tus ajustes: «Movimiento entre pantallas: Sí» de entrada');
    await toca('#viewPerfil [data-pf="mov"]', 500); fl = await fila();
    c(fl && !fl.on && /No/.test(fl.t) && (await ev(() => localStorage.getItem('ema.mov'))) === '0', 'tocarlo lo apaga (localStorage ema.mov = 0)');
    await toca('#navN1 [data-n1="obras"]');
    u = await ult(); c(u.a === 'viewObras' && !u.modo && u.por === 'apagado', 'apagado: las pantallas cambian al instante');
    await toca('#navN1 [data-n1="perfil"]', 900); await toca('#viewPerfil [data-pf="mov"]', 500); fl = await fila();
    c(fl && fl.on && (await ev(() => localStorage.getItem('ema.mov'))) === '1', 'tocarlo otra vez lo prende');

    // ---------------------------------------------------------------- celu lento (simulado): pasa sola a la opción A
    c(!(await ev(() => localStorage.getItem('ema.mov.lento'))), 'al prenderlo se vuelve a medir el celu');
    await ev(() => { const mv = window.mostrarVista; window.mostrarVista = function () { const t = performance.now(); while (performance.now() - t < 320) { } return mv.apply(this, arguments); }; });   // dibujar tarda 320 ms
    await toca('#navN1 [data-n1="panol"]', 900);
    const lento = await ev(() => ({ ms: localStorage.getItem('ema.mov.lento'), modo: window.__mov.modo() }));
    c(+lento.ms > 250 && lento.modo === 'A', 'celu lento (el primer cambio tardó ' + lento.ms + ' ms): pasa sola a la opción A');
    await toca('#navN1 [data-n1="obras"]');
    u = await ult(); c(u.a === 'viewObras' && u.modo === 'A', 'después: fundido corto (opción A)');
    f = await durante('opción A'); c(!f.some((x) => x.vistas.length > 1), 'opción A: sin la pantalla anterior al costado');
    await limpio('opción A');
    await toca('#navN1 [data-n1="perfil"]', 900); fl = await fila();
    c(fl && fl.on && /fundido corto/.test(fl.t) && /ms/.test(fl.t), 'Perfil lo dice: «' + (fl ? fl.t.replace(/\s+/g, ' ').trim() : '') + '»');
  } else {
    // ---------------------------------------------------------------- compu: fundido corto
    const menu = async (v) => { await ev(() => window.abrirMenuLateral()); await p.waitForTimeout(400); await p.click(`#menuLista .menu-item[data-vista="${v}"]`); };
    await menu('stock'); await p.waitForTimeout(40);
    const dur = await ev(() => document.getAnimations().filter((a) => a.constructor.name === 'Animation' && a.effect && a.effect.target && a.effect.target.id === 'viewStock').map((a) => a.effect.getTiming().duration));
    await p.waitForTimeout(600);
    let u = await ult();
    c(u.a === 'viewStock' && u.modo === 'F' && (!dur.length || dur[0] === 150), 'compu: fundido de 150 ms (' + JSON.stringify(dur) + ')');
    let f = await durante('compu → Pañol'); c(!f.some((x) => x.vistas.length > 1), 'compu: nunca dos pantallas a la vez');
    await limpio('compu → Pañol');
    await menu('obras'); await p.waitForTimeout(600);
    await toca('#obrasApp [data-lgabrir]');
    u = await ult(); c(u.tipo === 'obrasApp' && u.modo === 'F', 'compu: el legajo también con fundido');
    await limpio('compu legajo');
    await p.goBack(); await p.waitForTimeout(800);
    c((await ev(() => !document.querySelector('#obrasApp [data-lgvolver]'))), 'compu: «atrás» del navegador cierra el legajo (v138)');
    await limpio('compu atrás');
    await ev(() => { document.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); window.__asistenteAbrir && window.__asistenteAbrir(); });
    await p.waitForTimeout(1500);
    const iaAn = await ev(() => { const ia = document.getElementById('iaPanel'); return { vis: !!ia && getComputedStyle(ia).display !== 'none', mov: document.getAnimations().filter((a) => a.constructor.name === 'Animation' && a.effect && a.effect.target && ia && ia.contains(a.effect.target)).length }; });
    c(iaAn.vis && !iaAn.mov, 'compu: el Asistente (panel lateral) se abre sin movimiento');
    await ev(() => { const b = document.querySelector('#iaPanel [data-ia="volver"]'); b && b.click(); }); await p.waitForTimeout(600);
    await p.emulateMedia({ reducedMotion: 'reduce' }); await p.waitForTimeout(200);
    await menu('stock'); await p.waitForTimeout(600);
    u = await ult(); c(!u.modo && u.por === 'apagado', 'compu, reduced-motion: al instante');
    await p.emulateMedia({ reducedMotion: 'no-preference' });
    await ev(() => window.__mov.alternar(false)); await menu('obras'); await p.waitForTimeout(600);
    u = await ult(); c(!u.modo && u.por === 'apagado', 'compu, ajuste en No: al instante');
    await ev(() => window.mostrarVista('perfil')); await p.waitForTimeout(800);
    const fl = await ev(() => { const b = document.querySelector('#viewPerfil [data-pf="mov"]'); return b ? b.textContent : ''; });
    c(/Movimiento entre pantallas/.test(fl) && /No/.test(fl), 'compu: Perfil muestra el ajuste');
  }
  c(!A.errores.length, 'sin errores en la página' + (A.errores.length ? ': ' + A.errores.slice(0, 3).join(' | ') : ''));
  await A.browser.close();
  await mapaGuerra(c);
  await pasosCuadrilla(c);
  await informeSemanal(c);
  if (cel) await cuadrillaBarra(c);
  const mal = c.fin();
  process.exit(mal ? 1 : 0);
})().catch((e) => { console.error(e); console.log('RESULTADO v147' + (cel ? ' cel' : '') + ': ERROR'); process.exit(2); });

// ======================================================================================= 🗺 Mapa de guerra
const M147 = { v147: true, mov: true, sugerida: true, obraGps: true, v145: true, v146: true, inicio: true, nav: true, leaflet: true, cel };
async function mapaGuerra(c) {
  console.log('— Mapa de guerra');
  const A = await abrir(Object.assign({ datos: datos147(), sesion: 'lucia', espera: 5000 }, M147)), p = A.page, ev = (f, a) => p.evaluate(f, a);
  await ev(() => window.mostrarVista('mapa')); await p.waitForTimeout(2500);
  c(await ev(() => !!document.querySelector('#mgBar [data-mg="toggle"]') && !document.body.classList.contains('mg-on')), 'Mapa: la oficina ve «🎯 Control» y el mapa sigue como siempre (apagado)');
  await p.click('#mgBar [data-mg="toggle"]'); await p.waitForTimeout(1800);
  await ev(() => window.__mapaControl.pintar()); await p.waitForTimeout(300);
  const r = await ev(() => ({ on: document.body.classList.contains('mg-on'), ls: localStorage.getItem('ema.mapa.control'), kp: document.getElementById('mgKpis').innerText.replace(/\s+/g, ' '), al: window.__mapaControl.alertas().map((a) => a.p + ':' + a.tipo), cq: [...document.querySelectorAll('.mg-cq')].map((x) => x.textContent + (x.classList.contains('vivo') ? '*' : '')), linea: document.querySelectorAll('.leaflet-overlay-pane path[stroke-dasharray]').length, pins: document.querySelectorAll('.mg-alpin').length, panel: !!document.querySelector('#mgPanel .mg-al') }));
  c(r.on && r.ls === '1' && /órdenes hoy/.test(r.kp) && /alertas/.test(r.kp) && /Zona A/.test(r.kp), 'Control prendido: números de hoy arriba (' + r.kp + ') y se recuerda');
  const tipos = ['1:material', '2:sinCerrar', '2:sinTarea', '3:fraguado', '3:sinUbic'];
  c(tipos.every((x) => r.al.indexOf(x) >= 0) && r.al.every((x, i, a) => i === 0 || +a[i - 1][0] <= +x[0]), 'alertas con los datos de prueba, por prioridad: ' + r.al.join(' · '));
  c(r.al.indexOf('2:fotos') >= 0, 'alerta de fotos dudosas (obraGps)');
  c(r.cq.some((x) => /JP/.test(x) && /\*$/.test(x)) && r.linea >= 1 && r.pins >= 1 && r.panel, 'pin de la cuadrilla en vivo (iniciales + vehículo), línea punteada a la obra, íconos de alerta y panel (' + r.cq.join(',') + ')');
  c(await ev(() => !!document.querySelector('.mg-cq .mg-v svg')), 'el pin lleva el vehículo (grúa)');
  const i = r.al.indexOf('1:material');
  await p.click(`#mgPanel [data-mg="al:${i}"] b`); await p.waitForTimeout(700);
  const f = await ev((PA) => { const m = mapaLeaflet.getCenter(); return { tx: document.getElementById('mgFicha').innerText, on: document.getElementById('mgFicha').classList.contains('on'), d: Math.abs(m.lat - PA[0]) + Math.abs(m.lng - PA[1]) }; }, P147.aca);
  c(f.on && /LAS ACACIAS/.test(f.tx) && /Falta material/.test(f.tx) && f.d < 0.002, 'tocar la alerta centra el mapa en la obra y abre su ficha');
  c(/Legajo/.test(f.tx) && /Llamar/.test(f.tx), 'la ficha tiene Legajo / Orden / Llamar');
  await ev(() => window.__mapaControl.abrirFicha('p1')); await p.waitForTimeout(400);
  const f2 = await ev(() => document.getElementById('mgFicha').innerText);
  c(/Juan Pérez y Pedro Gómez/.test(f2) && /OT-2026-203/.test(f2) && /Fraguado|hechas/.test(f2 + ' hechas'), 'ficha de BULEVARES: quién está y su orden de hoy');
  await p.click('#mgFicha [data-mg="llamar:p1"]'); await p.waitForTimeout(500);
  const ll = await ev(() => ({ tx: (document.getElementById('mgLlamar') || {}).innerText || '', tels: [...document.querySelectorAll('#mgLlamar a[href^="tel:"]')].map((a) => a.getAttribute('href')), mov: window.__mov.estado().hist.filter((h) => h.tipo === 'hoja' && h.a === 'mgLlamar').length }));
  c((ll.tx.match(/sin teléfono cargado/g) || []).length === 2 && ll.tels.length === 1 && ll.tels[0] === 'tel:3515551234', 'Llamar: Juan y Pedro «sin teléfono cargado» (no se inventa), Lucía con el de contactos');
  c(ll.mov === 0 && (await ev(() => document.getAnimations().filter((a) => a.constructor.name === 'Animation' && a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('#viewMapa,#mgLlamar')).length)) === 0, 'adentro del mapa no hay movimiento de pantallas');
  await ev(() => document.getElementById('mgLlamar').remove());
  await p.click('#mgBar [data-mg="toggle"]'); await p.waitForTimeout(500);
  c(await ev(() => !document.body.classList.contains('mg-on') && !document.querySelector('.mg-cq') && localStorage.getItem('ema.mapa.control') === '0' && getComputedStyle(document.getElementById('mgPanel')).display === 'none'), 'apagarlo vuelve al mapa de siempre');
  await ev(() => window.mostrarVista('inicio')); await p.waitForTimeout(600);
  const acc = await ev(() => !!document.querySelector('#iniEje [data-mgabrir]'));
  if (acc) { await p.click('#iniEje [data-mgabrir]'); await p.waitForTimeout(1200); }
  c(acc && (await ev(() => document.body.dataset.vista === 'mapa' && document.body.classList.contains('mg-on'))), 'Inicio Ejecutivo › Accesos «🗺 Mapa de guerra» abre el Mapa ya en Control');
  c(!A.errores.length, 'Mapa de guerra sin errores' + (A.errores.length ? ': ' + A.errores.slice(0, 3).join(' | ') : ''));
  for (const s of ['juan', 'pan']) {
    const B = await abrir(Object.assign({ datos: datos147(), sesion: s, espera: 4500, crew: true }, M147));
    await B.page.evaluate(() => { try { window.mostrarVista('mapa'); } catch (e) { } }); await B.page.waitForTimeout(1500);
    c(await B.page.evaluate(() => !document.querySelector('[data-mg="toggle"]') && !window.__mapaControl.puede()), (s === 'juan' ? 'la cuadrilla' : 'el pañol') + ' no ve «Control»');
    await B.browser.close();
  }
  await A.browser.close();
}

// ======================================================================================= 📋 Paso a paso de la cuadrilla
const ttsFalso = () => { window.__dichos = []; window.Capacitor = { isNativePlatform: () => false, Plugins: { TextToSpeech: { speak: (o) => { window.__dichos.push(o.text); return new Promise((r) => setTimeout(r, 150)); }, stop: () => Promise.resolve() } } }; };
async function pasosCuadrilla(c) {
  console.log('— Paso a paso');
  const PM = { v147: true, crew: true, mtNuevo: true, tarjetas: true, nav: true, inicio: true, ofPasos: true, cel };
  const J = await abrir(Object.assign({ datos: datos147(), sesion: 'juan', espera: 5000, antes: ttsFalso }, PM)), q = J.page, ev = (f, a) => q.evaluate(f, a);
  c(!(await ev(() => window.__pasosTarea.textoDe('armado_luminaria'))), 'borrador: la cuadrilla no ve los pasos que faltan hasta que se guarden');
  if (cel) {
    await ev(() => window.__cuadrillaDia.ir('orden')); await q.waitForTimeout(500);
    c((await ev(() => document.querySelectorAll('#cdApp [data-pstabrir]').length)) === 2, '«La orden del día»: «ver pasos» en cada tarea');
    await ev(() => window.__cuadrillaDia.ir('obra')); await q.waitForTimeout(700);
    await q.click('#cdApp .pst-b'); await q.waitForTimeout(500);
    let e = await ev(() => window.__pasosTarea.estado());
    c(e.abierta && e.k === 'montaje_prfv' && e.total === 6 && (await ev(() => /Paso\s*1\s*de 6/.test(document.querySelector('#pstHoja .pst-num').textContent))), 'Modo obra: «📋 Cómo se hace» abre un paso por pantalla (6 pasos)');
    await q.click('#pstHoja [data-pst="sig"]'); await q.waitForTimeout(200);
    const bx = await q.locator('#pstHoja .pst-paso').boundingBox();
    await q.mouse.move(bx.x + bx.width * 0.85, bx.y + 60); await q.mouse.down(); await q.mouse.move(bx.x + bx.width * 0.15, bx.y + 64, { steps: 6 }); await q.mouse.up(); await q.waitForTimeout(200);
    c((await ev(() => window.__pasosTarea.estado().n)) === 2, '‹ › y deslizar cambian de paso');
    await q.click('#pstHoja [data-pst="oir"]'); await q.waitForTimeout(80);
    c(await ev(() => /Parar/.test(document.querySelector('#pstHoja [data-pst="oir"]').textContent)), '«🔊 Escuchar los pasos» muestra «Parar» mientras habla');
    await q.waitForTimeout(1300);
    const d = await ev(() => window.__dichos);
    c(d.length >= 4 && /^Cómo se hace/.test(d[0]) && /^Paso 3\./.test(d[1]), 'escuchar: la voz del celu lee paso por paso (TTS simulado: ' + d.length + ' frases)');
    await q.click('#pstHoja [data-pst="x"]'); await q.waitForTimeout(300);
    await q.click('#cdApp [data-cd="ayuda"]'); await q.waitForTimeout(500);
    c(await ev(() => { const l = [...document.querySelectorAll('#cdHoja .cd-op')]; return l.length > 1 && l[0].hasAttribute('data-pstabrir') && l.some((b) => b.getAttribute('data-cdh') === 'guia'); }), '«Ayuda»: primero «Ver los pasos de esta tarea», después la guía con dibujos');
    await q.click('#cdHoja [data-pstabrir]'); await q.waitForTimeout(400);
    c(await ev(() => window.__pasosTarea.estado().abierta && !document.getElementById('cdHoja')), 'desde Ayuda abre los pasos');
    await ev(() => window.__pasosTarea.cerrar());
    // sin señal
    await J.ctx.setOffline(true); await ev(() => { window.__stubSinRed = true; });
    await ev(() => window.__cuadrillaDia.ir('orden')); await q.waitForTimeout(400);
    await q.click('#cdApp [data-pstabrir="hormigonado"]'); await q.waitForTimeout(500);
    c(await ev(() => window.__pasosTarea.estado().abierta && window.__pasosTarea.estado().total > 0), 'sin señal: los pasos se ven igual');
    await ev(() => window.__pasosTarea.cerrar()); await J.ctx.setOffline(false); await ev(() => { window.__stubSinRed = false; });
    // Mis tareas clásica
    await ev(() => window.mostrarVista('mistareas')); await q.waitForTimeout(900);
    await ev(() => { const b = document.querySelector('#mtApp [data-mtabrir], #mtApp .mt-ot-abrir, #mtApp [data-mtot]'); b && b.click(); }); await q.waitForTimeout(800);
    const mt = await ev(() => ({ cab: document.querySelectorAll('#mtApp .pst-mtcab [data-pstabrir]').length, orden: document.querySelectorAll('#mtApp [data-pstorden]').length }));
    c(mt.cab >= 1, 'Mis tareas clásica: «ver pasos» en la cabecera de la tarjeta (' + mt.cab + ')');
    c(mt.orden >= 1, 'Mis tareas clásica: «📄 Ver la orden completa»');
    if (mt.orden) { await q.click('#mtApp [data-pstorden]'); await q.waitForTimeout(900); if (process.env.DBG) console.log(await ev(() => { const h = document.getElementById('hojaOv'); return h ? h.outerHTML.slice(0, 600) : 'sin hojaOv'; })); c(await ev(() => { const h = document.getElementById('hojaOv'); const f = h && h.querySelector('iframe'); let tx = h ? h.innerHTML : ''; try { tx += f ? (f.srcdoc || '') + f.contentDocument.documentElement.innerHTML : ''; } catch (e) { } return !!h && getComputedStyle(h).display !== 'none' && /Verificar que la fundaci/.test(tx); }), '«Ver la orden completa» = la hoja de la orden con los pasos'); await ev(() => window.hojaEMA && window.hojaEMA.cerrar && window.hojaEMA.cerrar()); }
    // el aviso abre la orden
    await q.goto('http://app.test/index.html?ot=ot1', { waitUntil: 'commit' }).catch((er) => console.log('   (goto: ' + er.message.split('\n')[0] + ')')); await q.waitForTimeout(7000);
    const ab = await ev(() => ({ e: window.__cuadrillaDia.estado(), url: location.search }));
    c(ab.e.pant === 'orden' && ab.e.otId === 'ot1' && !/ot=/.test(ab.url), 'tocar el aviso (?ot=ot1) abre la orden en el celu de la cuadrilla');
  }
  // oficina: la copia de los pasos al emitir y el aviso
  const A = await abrir(Object.assign({ datos: datos147(), sesion: 'admin', espera: 5000 }, PM, { cel: false })), p = A.page;
  const id = await p.evaluate(async () => { const hoy = window.__v135.hoy(); return window.fbOtAdd({ numero: 'OT-2026-299', fecha: hoy, plazaId: 'p2', plazaNombre: 'Plaza San Pablo', personal: [{ nombre: 'Juan Pérez', rol: 'Oficial' }], personalNombres: ['juan perez'], actividades: ['montaje_prfv', 'replanteo'], actividadesManuales: [], estado: 'Emitida', ts: Date.now(), creado: Date.now() }); });
  await p.waitForTimeout(1200);
  const em = await p.evaluate((id) => { const o = (window.__stubDB().ordenesTrabajo || {})[id] || {}; const s = JSON.stringify(o).length; const av = Object.values(window.__stubDB().avisosPush || {}).filter((a) => a.tipo === 'ot' && a.ref === String(id)); return { pasos: Object.keys(o.pasos || {}), s, av: av.map((a) => [a.cuerpo, a.url]) }; }, id);
  c(em.pasos.join() === 'montaje_prfv' && em.s < 2e4, 'al emitir, la orden guarda la copia de los pasos de cada tarea (las que tienen) · ' + em.s + ' bytes');
  c(em.av.length && /Tocá para ver la orden y los pasos/.test(em.av[0][0]) && em.av[0][1] === './?ot=' + id, 'aviso de orden nueva: «Tocá para ver la orden y los pasos» y abre la orden');
  // borrador en Producción
  await p.evaluate(() => window.mostrarVista('produccion')); await p.waitForTimeout(700);
  await p.locator('#subtabsProd .subtab', { hasText: 'Cuánto vale' }).first().click(); await p.waitForTimeout(500);
  c(await p.evaluate(() => /28 tareas no tienen/.test((document.getElementById('pbCard') || {}).textContent || '')), 'Producción: «28 tareas no tienen el paso a paso» con «Revisar borrador»');
  await p.click('#pbCard [data-pb="abrir"]'); await p.waitForTimeout(400);
  c(await p.evaluate(() => document.querySelectorAll('#pbHoja .pb-t').length === 28 && document.querySelectorAll('#pbHoja mark').length > 0 && /a confirmar/.test(document.getElementById('pbHoja').innerText)), 'el borrador se ve marcado «a confirmar»');
  await p.click('#pbHoja [data-pb="guardar"]'); await p.waitForTimeout(200);
  c(await p.evaluate(() => !!document.querySelector('#pbHoja [data-pb="si"]') && Object.keys(((window.__stubDB().configEquipo || {}).baremo || {}).pasos || {}).length === 0), '«Guardar» pregunta antes (todavía no escribió nada)');
  await p.click('#pbHoja [data-pb="si"]'); await p.waitForTimeout(800);
  c((await p.evaluate(() => Object.keys(((window.__stubDB().configEquipo || {}).baremo || {}).pasos || {}).length)) === 28, 'con «Sí» los pasa a configEquipo/baremo.pasos');
  // editar los pasos de una tarea del catálogo original: se guarda y otro aparato la ve
  await p.evaluate(async () => { window.abrirEditorTarea('excavacion'); document.getElementById('tareaEditPasos').value = '1) Paso editado de prueba.\n2) Segundo paso editado.'; window.guardarTareaEditada(); await window.guardarBaremo(); });
  await p.waitForTimeout(800);
  c(await p.evaluate(() => /Paso editado de prueba/.test((((window.__stubDB().configEquipo || {}).baremo || {}).pasos || {}).excavacion || '')), 'bug arreglado: editar los pasos de una tarea del catálogo original se guarda en la base');
  const B = await abrir(Object.assign({ datos: null, sesion: 'juan', espera: 5000, ctx: A.ctx, browser: A.browser }, PM, { cel: false }));
  const ve = await B.page.evaluate(() => ({ ex: window.__pasosTarea.textoDe('excavacion'), lu: window.__pasosTarea.textoDe('armado_luminaria') }));
  c(/Paso editado de prueba/.test(ve.ex) && /Sacar la luminaria/.test(ve.lu), 'otro aparato (la cuadrilla) ve lo editado y el borrador guardado');
  c(!A.errores.length && !J.errores.length, 'paso a paso sin errores' + (A.errores.concat(J.errores).length ? ': ' + A.errores.concat(J.errores).slice(0, 3).join(' | ') : ''));
  await J.browser.close(); await A.browser.close();
}

// ======================================================================================= 📰 Informe semanal
async function informeSemanal(c) {
  console.log('— Informe semanal');
  const d = datos147();
  const sab = new Date(d.lun + 'T12:00:00').getTime() + 5 * 864e5 + 6 * 36e5;   // sábado 18:00
  const antes = (t) => { window.__isAhora = t; window.__isEspera = 300; window.__isIaNo = true; window.__isNoAuto = true; window.__avisosWorkerNuevo = true; };
  const IM = { v147: true, sugerida: true, obraGps: true, v145: true, v146: true, inicio: true, cel };
  const A = await abrir(Object.assign({ datos: d, sesion: 'admin', espera: 5000, antes, antesArg: sab }, IM)), p = A.page;
  const B = await abrir(Object.assign({ sesion: 'lucia', espera: 5000, antes, antesArg: sab, ctx: A.ctx, browser: A.browser }, IM));
  const R = await Promise.all([p.evaluate(async () => !!(await window.__informeSemanal.tic(true))), B.page.evaluate(async () => !!(await window.__informeSemanal.tic(true)))]);
  await p.waitForTimeout(500);
  const db = await p.evaluate(() => ({ inf: Object.keys(window.__stubDB().adjuntos || {}).filter((k) => /^inf-/.test(k)), av: Object.values(window.__stubDB().avisosPush || {}).filter((a) => a.tipo === 'informe') }));
  c(R.filter(Boolean).length === 1 && db.inf.length === 1, 'turno: dos aparatos a la vez → lo arma uno solo (' + R.join('/') + ', ' + db.inf.join(',') + ')');
  const lunes = new Date(new Date(d.lun + 'T12:00:00').getTime() + 7 * 864e5), ts730 = Date.UTC(lunes.getFullYear(), lunes.getMonth(), lunes.getDate(), 10, 30);
  c(db.av.length === 1 && db.av[0].email === 'admin@ema-alumbrado.app' && db.av[0].enviarDesde === ts730 && /\?informe=\d{4}-W\d\d/.test(db.av[0].url), 'aviso a Administración con enviarDesde = lunes 07:30 (Argentina)');
  const G = await p.evaluate((k) => (window.__stubDB().adjuntos || {})[k], db.inf[0]);
  c(G && G.tipo === 'informeSemanal' && G.datos.mods > 6 && G.datos.mods < 7 && G.datos.modsAnt > 3 && !G.datos.resumen && JSON.stringify(G).length < 2e5 && !/data:image/.test(JSON.stringify(G)), 'armado con los datos: ' + (G ? G.datos.mods + ' módulos (anterior ' + G.datos.modsAnt + '), sin IA, sin imágenes' : '—'));
  c(G && G.datos.obras.some((o) => o.n === 'PLAZA BULEVARES' && o.antes === 25 && o.despues === 50) && G.datos.ordenes.emitidas >= 1 && G.datos.gente.some((x) => x.n === 'Hugo Díaz' && x.sinT > 0) && G.datos.avisos.length, 'por obra (antes → después), órdenes, gente sin tarea y el aviso de lo cargado sin fecha');
  c(G && /Worker nuevo/.test(G.datos.ia.nota), 'IA: muestra el gasto del mes y avisa que la semana necesita un Worker nuevo');
  // con IA simulada: la semana siguiente
  await A.ctx.route(/ema-ia\.mdiaz-60f\.workers\.dev\/ia/, (rq) => rq.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ content: [{ type: 'text', text: 'Semana tranquila: se avanzó en BULEVARES.' }], ema: { costoUsd: 0.01 } }) }));
  await p.evaluate((t) => { window.__isAhora = t; window.__isIaNo = false; }, sab + 7 * 864e5);
  const r2 = await p.evaluate(async () => { const R = await window.__informeSemanal.tic(true); return R && R.resumen; });
  c(r2 === 'Semana tranquila: se avanzó en BULEVARES.', 'con IA (simulada): «Resumen del asistente» arriba, un solo pedido');
  await p.evaluate(() => window.__informeSemanal.abrir()); await p.waitForTimeout(1200);
  const pa = await p.evaluate(() => ({ ops: document.querySelectorAll('#isOv select[data-is="sem"] option').length, res: !!document.querySelector('#isOv .is-res') }));
  c(pa.ops === 2 && pa.res, 'pantalla «Informe de la semana»: la última con el resumen y las semanas anteriores para elegir');
  await p.selectOption('#isOv select[data-is="sem"]', { index: 1 }); await p.waitForTimeout(1000);
  c(await p.evaluate(() => !document.querySelector('#isOv .is-res') && /6,4/.test(document.querySelector('#isOv .is-k b').textContent)), 'elegir la semana anterior muestra la guardada (sin IA)');
  await p.click('#isOv [data-is="pdf"]'); await p.waitForTimeout(1500);
  const pdf = await p.evaluate(() => { const h = document.getElementById('hojaOv'); const ifr = h && h.querySelector('iframe'); const tx = ifr && ifr.contentDocument ? ifr.contentDocument.documentElement.innerHTML : (h ? h.innerHTML : ''); return { vis: !!h && getComputedStyle(h).display !== 'none', h2: /Hoja 2 de 2/.test(tx), qr: /class="ema-qr/.test(tx), logo: /logo-impreso/.test(tx) }; });
  c(pdf.vis && pdf.h2 && pdf.logo, 'PDF de 2 hojas A4 (hojaPdf) con el logo como imagen' + (pdf.qr ? ' y el QR ?informe=' : ''));
  c(pdf.qr, 'el PDF lleva el QR de la semana');
  await p.evaluate(() => { window.hojaEMA && window.hojaEMA.cerrar && window.hojaEMA.cerrar(); window.__informeSemanal.cerrar(); window.mostrarVista('inicio'); }); await p.waitForTimeout(800);
  c(await p.evaluate(() => !!document.querySelector('#iniEje [data-isabrir]') && !!document.getElementById('menuInformeSemanal')), 'acceso en el Inicio Ejecutivo y en el menú');
  c(!A.errores.length && !B.errores.length, 'informe semanal sin errores' + (A.errores.concat(B.errores).length ? ': ' + A.errores.concat(B.errores).slice(0, 3).join(' | ') : ''));
  await A.browser.close();
}

// ======================================================================================= cuadrilla: la barra no se guarda y no titila
async function cuadrillaBarra(c) {
  console.log('— Cuadrilla: barra fija y sin parpadeo');
  const guardadaAntes = () => { try { localStorage.setItem('ema.nav.guardada', '1'); } catch (e) { } };
  const J = await abrir(Object.assign({ datos: datos147(), sesion: 'juan', espera: 6000, antes: guardadaAntes }, { v147: true, mov: true, crew: true, mtNuevo: true, tarjetas: true, nav: true, inicio: true, cel: true })), q = J.page;
  for (const v of ['inicio', 'mistareas']) {
    if (v !== 'inicio') { await q.evaluate((x) => window.mostrarVista(x), v); await q.waitForTimeout(2500); }
    const r = await q.evaluate(() => ({ g: document.body.classList.contains('n1-guardada'), ls: localStorage.getItem('ema.nav.guardada'), n1g: !!document.querySelector('#navN1 [data-n1g]'), tab: !!document.getElementById('navTab'), nav: !!document.querySelector('#navN1 [data-n1]') && getComputedStyle(document.getElementById('navN1')).display !== 'none' }));
    c(r.nav && !r.g && !r.n1g && !r.tab && r.ls === '1', `cuadrilla (${v}): la barra de abajo no se puede guardar (sin flechita ni lengüeta) y lo guardado de antes se ignora sin borrarlo`);
    const m = await q.evaluate(() => new Promise((ok) => {
      const L = []; const mo = new MutationObserver((ms) => ms.forEach((x) => { const t = x.target; if (t === document.body || (t.closest && t.closest('#navN1, #cdApp'))) L.push((t.id || t.nodeName) + ':' + (x.attributeName || x.type)); }));
      mo.observe(document.body, { attributes: true, subtree: true, childList: true, characterData: true });
      setTimeout(() => { mo.disconnect(); ok(L); }, 10000);
    }));
    c(m.length === 0, `cuadrilla (${v}): 10 s quieto, 0 cambios en body, #navN1 y #cdApp (no titila)` + (m.length ? ' · ' + m.slice(0, 6).join(', ') : ''));
  }
  // el aviso de la campanita («te asignaron una orden») lleva a la orden en «Hoy»
  await q.evaluate(() => window.mostrarVista('mistareas')); await q.waitForTimeout(800);
  const A = await abrir(Object.assign({ datos: null, sesion: 'admin', espera: 4000, ctx: J.ctx, browser: J.browser }, { v147: true, nav: true, inicio: true, cel: true }));
  const id = await A.page.evaluate(async () => window.fbOtAdd({ numero: 'OT-2026-310', fecha: window.__v135.hoy(), plazaId: 'p2', plazaNombre: 'Plaza San Pablo', personal: [{ nombre: 'Juan Pérez', rol: 'Oficial' }], personalNombres: ['juan perez'], actividades: ['replanteo'], actividadesManuales: [], estado: 'Emitida', ts: Date.now(), creado: Date.now() }));
  await A.page.close();
  let hay = false; for (let i = 0; i < 30 && !hay; i++) { await q.waitForTimeout(500); hay = await q.evaluate(() => { const b = document.getElementById('avCampana'); return !!b && /\d/.test(b.textContent || ''); }); }
  await q.click('#avCampana'); await q.waitForTimeout(500);
  const it = await q.evaluate(() => { const l = [...document.querySelectorAll('#avPanel [data-avi]')]; const x = l.find((e) => /orden de trabajo/i.test(e.textContent)); if (x) { x.click(); return true; } return false; });
  await q.waitForTimeout(900);
  const e = await q.evaluate(() => ({ e: window.__cuadrillaDia.estado(), v: document.body.dataset.vista || '' }));
  c(hay && it && e.e.pant === 'orden' && e.e.otId === id, 'campanita: «Te asignaron una orden» lleva a esa orden en «Hoy» (' + JSON.stringify([hay, it, e.e.pant, e.e.otId === id]) + ')');
  await q.evaluate(() => window.__cuadrillaDia.ir('orden')); await q.waitForTimeout(400);
  await q.evaluate(() => { const b = document.querySelector('#cdApp [data-cd="lista"]'); b && b.click(); }); await q.waitForTimeout(900);
  c(await q.evaluate(() => { const v = document.getElementById('viewMisTareas'); return !!v && v.style.display !== 'none'; }), 'Mis tareas clásica sigue estando desde «Ver lista completa»');
  c(!J.errores.length, 'cuadrilla sin errores' + (J.errores.length ? ': ' + J.errores.slice(0, 3).join(' | ') : ''));
  await J.browser.close();
  const O = await abrir({ datos: datos147(), sesion: 'lucia', espera: 5000, v147: true, nav: true, inicio: true, cel: true });
  c(await O.page.evaluate(() => !!document.querySelector('#navN1 [data-n1g]')), 'la oficina sigue pudiendo guardar la barra');
  await O.browser.close();
}
