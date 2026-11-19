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
  if (!op.sugerida) await page.addInitScript(() => { window.__sugNo = true; });   // v143: las pruebas viejas no ven la orden sugerida (tarjeta, tablero, recordatorio de las 7, ausencias); sugerida:true la prueba
  if (!op.obraGps) await page.addInitScript(() => { window.__obraGpsNo = true; });   // v144: las pruebas viejas no ven la obra elegida por el GPS (fotos, Llegué en otra obra, supervisor de fotos, nuestra zona igual); obraGps:true la prueba
  if (!op.camaraB) await page.addInitScript(() => { window.__camViejaNo = true; });   // v144: las pruebas viejas ven la hoja «¿De qué obra?» de antes; camaraB:true prueba la cámara primero (opción B)
  if (!op.v145) await page.addInitScript(() => { window.__v145No = true; });   // v145: las pruebas viejas no ven la certificación, el material contra avance ni la gente sin tarea; v145:true los prueba
  if (!op.v146) await page.addInitScript(() => { window.__v146No = true; });   // v146: las pruebas viejas no ven el cierre por voz, el pedido de compras, el tablero del dueño ni el pase automático a mañana; v146:true los prueba
  if (!op.mov) await page.addInitScript(() => { window.__movNo = true; });   // v147: las pruebas viejas no ven el movimiento entre pantallas (cambio al instante, mismos tiempos); mov:true lo prueba
  if (!op.v147) await page.addInitScript(() => { window.__v147No = true; });   // v147: las pruebas viejas no ven el Mapa de guerra, el informe semanal ni los pasos nuevos de la cuadrilla; v147:true los prueba
  if (!op.v149) await page.addInitScript(() => { window.__v149No = true; });   // v149: las pruebas viejas tienen el micrófono de antes (termina con el motor), sin respuesta en vivo ni effort más liviano; v149:true los prueba
  if (!op.v150) await page.addInitScript(() => { window.__v150No = true; });   // v150: las pruebas viejas no ven la verificación de las órdenes, los avisos de trabajo repetido ni la planilla de columnas; v150:true los prueba
  if (!op.v151) await page.addInitScript(() => { window.__v151No = true; });   // v151: las pruebas viejas no ven «Falta documentación» / «Terminadas» (Avance y Obras) ni la ficha de documentación del legajo; v151:true las prueba
  if (!op.v152) await page.addInitScript(() => { window.__v152No = true; });   // v152: las pruebas viejas no ven «↔ Mover» de las fotos ni las herramientas nuevas del asistente (buscar_fotos, proponer_mover_fotos con columna/orden); v152:true los prueba
  if (!op.v180) await page.addInitScript(() => { window.__v180No = true; });   // v180: las pruebas viejas siguen sin «🗂 Unir / mover / eliminar» carpetas de obra (sección del legajo, posibles duplicadas en Obras, línea del Supervisor, herramientas del asistente); v180:true lo prueba
  if (!op.v153) await page.addInitScript(() => { window.__v153No = true; });   // v153: las pruebas viejas no ven «✏ Corregir cierre» ni proponer_corregir_cierre del asistente; v153:true los prueba
  if (!op.v154) await page.addInitScript(() => { window.__v154No = true; });   // v154: las pruebas viejas no ven el auditor de puntos (motivo obligatorio en ⭐ Puntos, el cierre y el baremo; explicar_puntos y las herramientas nuevas del asistente); v154:true los prueba
  if (!op.v155) await page.addInitScript(() => { window.__v155No = true; });   // v155: las pruebas viejas no ven el rol Dirección, su Inicio, «📊 Dirección» ni «📨 Para resolver» (ni las herramientas nuevas del asistente); v155:true los prueba
  if (!op.v156) await page.addInitScript(() => { window.__v156No = true; });   // v156: las pruebas viejas no ven el auditor del avance (motivo obligatorio al cambiar lo hecho a mano, la hoja «🔎 Control del avance», la línea del Supervisor, el parte de las 18 h ni las herramientas nuevas del asistente; ni los arreglos del Inicio de Dirección y «Para resolver»); v156:true los prueba
  if (!op.v157) await page.addInitScript(() => { window.__v157No = true; });   // v157: las pruebas viejas siguen con la hora de toda la tarea (Modo obra con «Terminé» por columna, sin el cartelito «Col N lista · N min», sin los minutos por columna en la oficina, 🧠 ni la orden sugerida, sin tiempos_por_unidad); v157:true lo prueba
  if (!op.v158) await page.addInitScript(() => { window.__v158No = true; });   // v158: las pruebas viejas siguen con el % del itemizado en toda la app y la pantalla de Avance de obra de antes (sin el avance nuevo por rubro y columna, sin las herramientas avance_obra / proponer_marcar_avance); v158:true lo prueba
  if (!op.v159) await page.addInitScript(() => { window.__v159No = true; });   // v159: las pruebas viejas no ven la calculadora de tareas nuevas ni proponer_tarea_nueva / proponer_editar_tarea del asistente; v159:true lo prueba
  if (!op.v160) await page.addInitScript(() => { window.__v160No = true; });   // v160: las pruebas viejas no ven los PDF y videos en la nube (sección «🎥 Videos y PDF», botones 🎥, PDF hasta 25 MB): el PDF sigue hasta 650 KB en la base; v160:true lo prueba
  if (!op.v161) await page.addInitScript(() => { window.__v161No = true; });   // v161: las pruebas viejas siguen con el Inicio Ejecutivo de admin/oficina (y «📊 Dirección» como hoja); v161:true prueba el Inicio de Dirección con las piezas del Ejecutivo adentro
  if (!op.v163) await page.addInitScript(() => { window.__v163No = true; });   // v163: las pruebas viejas siguen con el hormigón a mano que fragua 72 h y sin «⚡ Poner al día esta obra»; v163:true lo prueba
  if (!op.v164) await page.addInitScript(() => { window.__v164No = true; });   // v164: las pruebas viejas siguen con las fotos de antes (la cola sale con la cámara cerrada, sin la miniatura al toque ni la fila para nombrar en la cámara); v164:true lo prueba
  if (!op.v165) await page.addInitScript(() => { window.__v165No = true; });   // v165: las pruebas viejas siguen sin «Voy a iniciar», sin la cámara C, sin otra tarea, récords ni columnas en la orden y con la medición de PAT de antes; v165:true lo prueba
  if (!op.v166) await page.addInitScript(() => { window.__v166No = true; });   // v166: las pruebas viejas siguen sin «Voy a iniciar» ni el tiempo de cada columna en Mis tareas (la lista); v166:true lo prueba
  if (!op.v167) await page.addInitScript(() => { window.__v167No = true; });   // v167: las pruebas viejas siguen sin zoom en la cámara ni la hoja «Elegir fotos» (Enviar / Borrar varias); v167:true lo prueba
  if (!op.v168) await page.addInitScript(() => { window.__v168No = true; });   // v168: las pruebas viejas no ven las luminarias armadas (receta, armar, llevar a obra, depósito) ni el desglose de las armadas en piezas; v168:true lo prueba
  if (!op.v169) await page.addInitScript(() => { window.__v169No = true; });   // v169: las pruebas viejas siguen con la tarjeta de las armadas dentro de Catálogo pañol (sin la subpestaña «🔧 Armadas»); v169:true lo prueba
  if (!op.v170) await page.addInitScript(() => { window.__v170No = true; });   // v170: las pruebas viejas siguen con el motivo obligatorio al cambiar el avance a mano y sin la «✏ Carga rápida» ni «Tocar marca» en la grilla; v170:true lo prueba
  if (!op.v171) await page.addInitScript(() => { window.__v171No = true; });   // v171: las pruebas viejas siguen sin «＋ Otra foto» con nombre en Mis tareas (el «📷 Otra foto» de antes en las tomas); v171:true lo prueba
  if (!op.v172) await page.addInitScript(() => { window.__v172No = true; });   // v172: las pruebas viejas siguen con el «🎥 Video» flotante de la cámara y sin «Tablero …» (tocar otra vez el botón elegido para agregarle algo al nombre); v172:true lo prueba
  if (!op.v173) await page.addInitScript(() => { window.__v173No = true; });   // v173: las pruebas viejas siguen sin el horario de cada uno en la orden ni «cada uno lo suyo» en las tareas repartidas; v173:true lo prueba
  if (!op.v175) await page.addInitScript(() => { window.__v175No = true; });   // v175: las pruebas viejas siguen sin las herramientas del asistente para cargar el personal; v175:true lo prueba
  if (!op.v176) await page.addInitScript(() => { window.__v176No = true; });   // v176: las pruebas viejas siguen sin el Guardián de datos (copia diaria, alertas, hoja, asistente, auditoría con cuentas); v176:true lo prueba
  if (!op.v177) await page.addInitScript(() => { window.__v177No = true; });   // v177: las pruebas viejas siguen con el Inicio de antes (logo al centro de la portada); v177:true prueba el Inicio prolijo
  if (!op.v179) await page.addInitScript(() => { window.__v179No = true; });   // v179: las pruebas viejas siguen sin las pestañas por sector en Personal del equipo (sectores Alumbrado / Ilícitos de antes; Oficina y demás no se excluyen de la gente sin tarea ni de la sugerida); v179:true lo prueba
  if (!op.v183) await page.addInitScript(() => { window.__v183No = true; });   // v183: las pruebas viejas siguen con el cable 3×1,5 de antes ((altura − caja) + brazo + 0,60), la ganancia de 4 m (PRFV) / 5 m (metálica) y una sola potencia de luminaria; v183:true lo prueba
  if (!op.v178) await page.addInitScript(() => { window.__v178No = true; });   // v178: las pruebas viejas siguen con el asistente de antes (sin leer de la base lo que no está en memoria, sin leer_doc, buscar_en_todo, ver_pantalla, dato_app ni proponer_accion); v178:true lo prueba
  if (!op.v181 && !process.env.V181) await page.addInitScript(() => { window.__v181No = true; });   // v181: las pruebas viejas siguen sin el registro de cambios (sin anotar cada escritura en auditoria, sin «📜 Historial de cambios» ni historial_cambios / proponer_revertir_cambio); v181:true (o V181=1) lo prueba
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
