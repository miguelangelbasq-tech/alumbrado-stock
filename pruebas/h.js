// Utilidades de prueba: abre la app con el stub de Firebase en http://app.test/
const fs = require('fs');
const { chromium } = require('playwright');
const STUB = fs.readFileSync(__dirname + '/firebase_stub.js', 'utf8');
const APP = process.env.APP || '/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/t/app/index.html';
const DOM = 'ema-alumbrado.app';
const TESELA = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mN4+vQpAAWuAtWnU9yRAAAAAElFTkSuQmCC', 'base64');   // tesela gris clara (mapa sin internet)
function baseDatos() {
  const ahora = Date.now(), hoy = new Date(ahora - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  const cuentas = { ['admin@' + DOM]: { pass: 'clave123', uid: 'uAdmin' }, ['juan@' + DOM]: { pass: 'clave123', uid: 'uJuan' }, ['pedro@' + DOM]: { pass: 'clave123', uid: 'uPedro' } };
  const db = {
    usuarios: {
      uAdmin: { email: 'admin@' + DOM, usuario: 'admin', nombre: 'Ana Admin', rol: 'admin', activo: true },
      uJuan: { email: 'juan@' + DOM, usuario: 'juan', nombre: 'Juan Pérez', rol: 'operario', persona: 'Juan Pérez', personaClave: 'juan perez', activo: true, ajustes: { inicio: 'oculto', calc: 'oculto', plan: 'oculto', mapa: 'oculto', stock: 'oculto', normas: 'oculto' } },   // v049: con ajustes = el operario de antes (las pruebas viejas siguen probando lo mismo)
      uPedro: { email: 'pedro@' + DOM, usuario: 'pedro', nombre: 'Pedro Gómez', rol: 'cuadrilla', persona: 'Pedro Gómez', personaClave: 'pedro gomez', activo: true, ajustes: { registro: 'ver', parte: 'editar', avance: 'editar', obras: 'editar' } }   // v049: con ajustes = la cuadrilla de antes
    },
    configEquipo: { personal: { lista: [{ nombre: 'Juan Pérez', rol: 'Oficial', activo: true }, { nombre: 'Pedro Gómez', rol: 'Ayudante', activo: true }] } },
    avanceObras: { p1: { nombre: 'Plaza San Martín', obraId: '1234', direccion: 'Av. Siempre Viva 100', barrio: 'Centro', creado: ahora } },
    ordenesTrabajo: { ot1: { numero: 'OT-2026-001', fecha: hoy, plazaId: 'p1', plazaNombre: 'Plaza San Martín', obraId: '1234', horaInicio: '07:00', horaFin: '13:00', cuadrilla: 'Cuadrilla 1', responsable: 'Juan Pérez', personal: [{ nombre: 'Juan Pérez', rol: 'Oficial' }, { nombre: 'Pedro Gómez', rol: 'Ayudante' }], actividades: [], actividadesManuales: [{ actividad: 'Revisar tablero', detalle: '' }], estado: 'Emitida', notas: 'Llevar escalera', creado: ahora, personalNombres: ['juan perez', 'pedro gomez'] } },
    planosObra: {}, planosImg: {}
  };
  return { db, cuentas, hoy };
}
async function abrir(op = {}) {
  const browser = op.browser || await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = op.ctx || await browser.newContext(Object.assign(op.cel ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: op.dpr || 2, isMobile: true, hasTouch: true } : { viewport: { width: 1366, height: 900 } }, { ignoreHTTPSErrors: true }, op.tz ? { timezoneId: op.tz } : {}));   // v092: zona horaria (las horas de la app son locales)
  if (!op.ctx) {
    const html = fs.readFileSync(APP);
    await ctx.route('**/*', r => {
      const u = r.request().url();
      if (/^https?:\/\/app\.test\/sw\.js/.test(u) && process.env.APPDIR) return r.fulfill({ body: fs.readFileSync(process.env.APPDIR + '/sw.js'), contentType: 'application/javascript' });
      if (/^https?:\/\/app\.test\/catastro\//.test(u) && process.env.APPDIR) {   // v095: catastro de fondo (archivos junto a la app)
        const f = process.env.APPDIR + new URL(u).pathname;
        if (global.__catPedidos) global.__catPedidos.push(new URL(u).pathname);
        return fs.existsSync(f) ? r.fulfill({ body: fs.readFileSync(f), contentType: 'application/json' }) : r.fulfill({ status: 404, body: 'no' });
      }
      if (/^https?:\/\/app\.test\/materiales\//.test(u)) {   // v131: hojas de material junto a la app (op.matDir; si no, APPDIR/materiales)
        const dir = op.matDir || (process.env.APPDIR ? process.env.APPDIR + '/materiales' : ''), f = dir + new URL(u).pathname.replace(/^\/materiales/, '');
        if (global.__matPedidos) global.__matPedidos.push(new URL(u).pathname);
        if (global.__matSinRed) return r.abort('internetdisconnected');
        return dir && fs.existsSync(f) ? r.fulfill({ body: fs.readFileSync(f), contentType: /\.json$/.test(f) ? 'application/json' : /\.webp$/.test(f) ? 'image/webp' : 'image/png' }) : r.fulfill({ status: 404, body: 'no' });
      }
      if (/^https?:\/\/app\.test\/guias\//.test(u)) {   // v136: guías nuevas junto a la app (op.guiasDir; si no, APPDIR/guias)
        const dir = op.guiasDir || (process.env.APPDIR ? process.env.APPDIR + '/guias' : ''), f = dir + new URL(u).pathname.replace(/^\/guias/, '');
        if (global.__guiasPedidos) global.__guiasPedidos.push(new URL(u).pathname);
        if (global.__guiasSinRed) return r.abort('internetdisconnected');
        return dir && fs.existsSync(f) ? r.fulfill({ body: fs.readFileSync(f), contentType: /\.json$/.test(f) ? 'application/json' : /\.webp$/.test(f) ? 'image/webp' : /\.pdf$/.test(f) ? 'application/pdf' : 'image/png' }) : r.fulfill({ status: 404, body: 'no' });
      }
      if (/^https?:\/\/app\.test\//.test(u)) return r.fulfill({ body: html, contentType: 'text/html; charset=utf-8' });
      if (/firebase-app-compat/.test(u)) return r.fulfill({ body: STUB, contentType: 'application/javascript' });
      if (/firebase-.*\.js/.test(u)) return r.fulfill({ body: '', contentType: 'application/javascript' });
      if (op.leaflet && /leaflet.*\.js/.test(u)) return r.fulfill({ body: fs.readFileSync('/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/t/lib/package/dist/leaflet.js'), contentType: 'application/javascript' });
      if (op.leaflet && /leaflet.*\.css/.test(u)) return r.fulfill({ body: fs.readFileSync('/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/t/lib/package/dist/leaflet.css'), contentType: 'text/css' });
      if (op.leaflet && /tile|arcgisonline|cartocdn|\/\d+\/\d+\/\d+(\.png|$)/.test(u)) return r.fulfill({ body: TESELA, contentType: 'image/png' });
      if (/leaflet.*\.js/.test(u)) return r.fulfill({ body: 'window.L=undefined;', contentType: 'application/javascript' });
      if (/\.css(\?|$)/.test(u)) return r.fulfill({ body: '', contentType: 'text/css' });
      return r.abort();
    });
    const datos = op.datos || baseDatos();
    await ctx.addInitScript(([db, cuentas]) => {
      if (!localStorage.getItem('stub.sembrado')) {
        localStorage.setItem('stub.db', JSON.stringify(db)); localStorage.setItem('stub.cuentas', JSON.stringify(cuentas)); localStorage.setItem('stub.sembrado', '1');
      }
    }, [datos.db, datos.cuentas]);
  }
  const page = await ctx.newPage();
  if (process.env.CPU) { const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: +process.env.CPU }); page.__cdp = cdp; if (process.env.PERFIL) { await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 500 }); await cdp.send('Profiler.start'); } }
  if (op.deny) await page.addInitScript(d => { window.__stubDeny = d; }, op.deny);
  if (op.demora) await page.addInitScript(d => { window.__stubDemora = d; }, op.demora);   // v078: demoras de la base por colección/doc
  if (!op.mtNuevo) await page.addInitScript(() => { window.__mtVistaTodas = true; });
  if (!op.rsObra) await page.addInitScript(() => { try { localStorage.setItem('ema.rs.porObra', '0'); } catch { } });
  if (!op.lgPleg) await page.addInitScript(() => { window.__lgPlegTodoAbierto = true; });   // v082: las pruebas viejas ven el legajo con todas las secciones abiertas; lgPleg:true prueba el plegado   // v081: las pruebas viejas ven las reservas en lista plana; rsObra:true prueba «Por obra»   // v080: las pruebas viejas ven Mis tareas con todas las órdenes desplegadas (como antes); mtNuevo:true prueba las pestañas Hoy/Pendientes/Terminadas
  if (!op.pisoReal) await page.addInitScript(() => { window.__puntosPisoFijo = "2000-01-01"; });   // v103: las pruebas viejas cuentan puntos de cualquier fecha; pisoReal:true prueba que lo de antes del 01/11/2026 no suma
  if (!op.porPartes) await page.addInitScript(() => { window.__avanceEntero = true; });   // v108: las pruebas viejas ven el avance de antes (la tarea completa el ítem); porPartes:true prueba el reparto por partes
  if (op.reglas || process.env.REGLAS) await page.addInitScript({ content: fs.readFileSync(__dirname + '/reglas_stub.js', 'utf8') });
  if (!op.ofPasos) await page.addInitScript(() => { window.__ofCompat = true; });   // v112: las pruebas viejas ven «Llenar orden» todo junto, sin el cartel de pendientes; ofPasos:true prueba los pasos
  if (!op.tarjetas) await page.addInitScript(() => { window.__mtTarjetasNo = true; });   // v130: las pruebas viejas ven todas las tareas de Mis tareas juntas; tarjetas:true prueba una tarjeta por tarea con flechas
  if (!op.nav) await page.addInitScript(() => { window.__navNo = true; });   // v135: las pruebas viejas no ven la barra de abajo N1; nav:true la prueba
  if (!op.inicio) await page.addInitScript(() => { window.__inicioViejo = true; });   // v135: las pruebas viejas ven el Inicio de antes (admin/oficina/pañol); inicio:true prueba el «Ejecutivo» y el del pañolero
  if (!op.iaPro) await page.addInitScript(() => { window.__iaCompat = true; });   // v136: las pruebas viejas del asistente siguen con Sonnet y el cierre de antes; iaPro:true prueba Opus/Fable, el cierre rápido, etc.
  if (!op.guias) await page.addInitScript(() => { window.__guiasNo = true; });   // v136: las pruebas viejas ven las guías de antes; guias:true prueba las nuevas (carpeta guias/)
  if (!op.supervisor) await page.addInitScript(() => { window.__supNoIA = true; });   // v136: las pruebas viejas no disparan la revisión con IA de las 12/18 h; supervisor:true la prueba
  if (!op.crew) await page.addInitScript(() => { window.__crewViejo = true; });   // v142: las pruebas viejas ven la cuadrilla de antes (Inicio y Mis tareas); crew:true prueba el «Modo obra» y el recorrido del día
  if (op.antes) await page.addInitScript(op.antes, op.antesArg === undefined ? null : op.antesArg);   // v109: preparar la página (p. ej. simular la app de Android)
  if (op.sesion) await page.addInitScript(e => { if (!sessionStorage.getItem('stub.sesion0')) { sessionStorage.setItem('stub.sesion', e); sessionStorage.setItem('stub.sesion0', '1'); } }, op.sesion + '@' + DOM);
  const errores = [];
  page.on('pageerror', e => errores.push(String(e && e.message || e)));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) errores.push('console: ' + m.text()); });
  await page.goto((op.https ? 'https' : 'http') + '://app.test/index.html');
  await page.waitForTimeout(op.espera || 2500);
  return { browser, ctx, page, errores };
}
function prueba(nombre) {
  let ok = 0, mal = 0;
  const c = (cond, txt) => { if (cond) { ok++; console.log('  ✓ ' + txt); } else { mal++; console.log('  ✗ ' + txt); } };
  c.fin = () => { console.log(`RESULTADO ${nombre}: ${ok}/${ok + mal} ${mal ? 'FALLAS' : 'OK'}`); return mal; };
  return c;
}
async function otraPagina(base, op = {}) { return abrir(Object.assign({}, op, { browser: base.browser, ctx: base.ctx })); }
module.exports = { abrir, otraPagina, prueba, baseDatos, DOM };
