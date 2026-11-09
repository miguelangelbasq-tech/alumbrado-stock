// v135 · Diseño nuevo aprobado por Ángel: Inicio «Ejecutivo» (admin/oficina) con datos reales, Inicio del pañolero,
// la cuadrilla sin cambios, barra de abajo N1 por rol (permisos y globitos), escondida donde hay otra barra,
// nada tapado ni scroll de costado, Perfil con sus números, interruptores, huella y recordatorios (con los plugins
// de la app 1.4 simulados y sin ellos) y cerrar sesión.
const fs = require('fs');
const { abrir, prueba, baseDatos, DOM } = require('./h');
const cel = process.argv[2] === 'cel';
const CAP = process.env.CAP || '';   // carpeta para las capturas (solo en el celu)
function datos() {
  const d = baseDatos(), ahora = Date.now(), hoy = d.hoy;
  d.db.usuarios.uRaul = { email: 'raul@' + DOM, usuario: 'raul', nombre: 'Raúl Pañol', rol: 'panol', activo: true };
  d.cuentas['raul@' + DOM] = { pass: 'clave123', uid: 'uRaul' };
  d.db.usuarios.uRol = { email: 'rolando@' + DOM, usuario: 'rolando', nombre: 'Rolando Velázquez', rol: 'cuadrilla', persona: 'Rolando Velázquez', personaClave: 'rolando velazquez', activo: true };
  d.cuentas['rolando@' + DOM] = { pass: 'clave123', uid: 'uRol' };
  d.db.usuarios.uNuevo = { email: 'nuevo@' + DOM, usuario: 'nuevo', nombre: 'Nuevo Ingreso', rol: 'mirar', pendiente: true, activo: true };
  d.db.configEquipo.personal.lista.push({ nombre: 'Rolando Velázquez', rol: 'Ayudante', activo: true });
  d.db.avanceObras.p2 = { nombre: 'PLAZA GEORG NICOLAI', obraId: '4026', barrio: 'Alta Córdoba', direccion: 'Calle 1', creado: ahora, estado: 'En curso' };
  // una orden de hoy que la cuadrilla ya mandó (para cerrar) y otra de hoy en curso
  d.db.ordenesTrabajo.ot2 = { numero: 'OT-2026-002', fecha: hoy, plazaId: 'p2', plazaNombre: 'PLAZA GEORG NICOLAI', obraId: '4026', horaInicio: '07:42', cuadrilla: 'Cuadrilla 2', responsable: 'Rolando Velázquez', personal: [{ nombre: 'Rolando Velázquez', rol: 'Ayudante' }, { nombre: 'Juan Pérez', rol: 'Oficial' }], actividades: [], actividadesManuales: [{ actividad: 'Tablero', detalle: '' }, { actividad: 'Sellos', detalle: '' }], estado: 'En curso', creado: ahora, personalNombres: ['rolando velazquez', 'juan perez'], campo: { marcas: { m0: { hecho: true }, m1: { hecho: true } }, enviados: { 'rolando velazquez': { ts: ahora } } }, supervisor: { email: 'admin@' + DOM, nombre: 'Ana Admin', uid: 'uAdmin' } };
  // pañol: un pedido para aprobar, una reserva para preparar, un material que se acabó y una herramienta afuera
  d.db.reservas = {
    r1: { numero: 'R-0142', estado: 'solicitada', plazaId: 'p2', plazaNombre: 'PLAZA GEORG NICOLAI', para: 'Rolando Velázquez', items: [{ codigo: 2009, desc: 'Bornera BPN 6 mm²', un: 'Un.', cant: 2, entregado: 0 }, { codigo: 7015, desc: 'Jabalina', un: 'Un.', cant: 1, entregado: 0 }], creadoPor: 'rolando@' + DOM, creadoNombre: 'Rolando Velázquez', creado: ahora - 2 * 36e5, historial: [] },
    r2: { numero: 'R-0141', estado: 'pendiente', plazaId: 'p1', plazaNombre: 'Plaza San Martín', para: 'Juan Pérez', items: [{ codigo: 2009, desc: 'Bornera BPN 6 mm²', un: 'Un.', cant: 1, entregado: 0 }], creadoPor: 'admin@' + DOM, creadoNombre: 'Ana Admin', creado: ahora - 5 * 36e5, historial: [] }
  };
  d.db.movimientos = {
    m1: { tipo: 'entrada', codigo: 3017, desc: 'Fusible cilíndrico 10×38 2 A', un: 'Un.', cantidad: 10, fecha: hoy, ts: ahora - 5e5, usuario: 'admin@x', precioUnit: 100 },
    m2: { tipo: 'salida', codigo: 3017, desc: 'Fusible cilíndrico 10×38 2 A', un: 'Un.', cantidad: 10, fecha: hoy, ts: ahora - 4e5, usuario: 'admin@x', plazaId: 'p1' }
  };
  d.db.herramientas = { h1: { codigo: 'H-001', nombre: 'Pinza amperométrica', estado: 'asignada', asignadaA: 'Juan Pérez', ts: ahora } };
  return d;
}
// plugins de la app de Android 1.4 simulados (huella, recordatorios, número en el ícono)
const apk14 = (bioOk) => {
  window.__bio = []; window.__ln = []; window.__badge = []; window.__appL = {};
  window.__cargador = { url: 'https://miguelangelbasq-tech.github.io/alumbrado-stock/', nativo: true, version: () => 'prueba', listo() { }, guardar() { }, actualizar() { }, borrar() { } };
  window.Capacitor = { isNativePlatform: () => true, convertFileSrc: (u) => u, Plugins: {
    App: { addListener: (ev, fn) => { window.__appL[ev] = fn; return Promise.resolve({ remove() { } }); }, getInfo: async () => ({ version: '1.4', build: '5' }) },
    NativeBiometric: { isAvailable: async () => ({ isAvailable: true, biometryType: 3, deviceIsSecure: true }), verifyIdentity: async (o) => { window.__bio.push(o); if (!(window.__bioOk !== undefined ? window.__bioOk : bioOk)) { const e = new Error('falló'); e.code = '10'; throw e; } } },
    LocalNotifications: { checkPermissions: async () => ({ display: 'granted' }), requestPermissions: async () => ({ display: 'granted' }), createChannel: async () => { }, cancel: async (o) => { window.__ln.push({ cancel: o }); }, schedule: async (o) => { window.__ln.push({ schedule: o }); }, addListener: () => Promise.resolve({ remove() { } }) },
    Badge: { isSupported: async () => ({ isSupported: true }), set: async (o) => { window.__badge.push(o.count); }, clear: async () => { window.__badge.push(0); } },
    PushNotifications: { register: async () => { }, addListener() { }, checkPermissions: async () => ({ receive: 'granted' }), requestPermissions: async () => ({ receive: 'granted' }) } } };
};
(async () => {
  const c = prueba('v135' + (cel ? ' cel' : ''));
  const MOD = { cel, espera: 4000, nav: true, inicio: true, mtNuevo: true, ofPasos: true, tarjetas: true };
  const vis = (p, sel) => p.evaluate((s) => { const e = document.querySelector(s); if (!e) return false; const cs = getComputedStyle(e), r = e.getBoundingClientRect(); return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0; }, sel);
  const sinCostado = (p) => p.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) <= innerWidth + 1);
  const barra = (p) => p.evaluate(() => { const n = document.getElementById('navN1'); const on = !!n && document.body.classList.contains('n1-on') && getComputedStyle(n).display !== 'none'; return { on, tabs: n ? [...n.querySelectorAll('[data-n1]')].map((b) => b.dataset.n1) : [], activa: n ? (n.querySelector('.on') || {}).dataset?.n1 || '' : '', bd: n ? Object.fromEntries([...n.querySelectorAll('[data-n1]')].map((b) => [b.dataset.n1, (b.querySelector('.n1-bd') || {}).textContent || ''])) : {}, tapado: window.__navN1 && window.__navN1.tapado(), min: n ? Math.min(...[...n.querySelectorAll('[data-n1]')].map((b) => Math.min(b.getBoundingClientRect().width, b.getBoundingClientRect().height))) : 0 }; });
  const foto = async (p, nom) => { if (cel && CAP) { await p.waitForTimeout(1900); await p.screenshot({ path: CAP + '/' + nom + '.png' }); } };
  // ========================================================= 1) admin: Inicio «Ejecutivo» con datos reales
  let A = await abrir(Object.assign({ sesion: 'admin', datos: datos() }, MOD)), p = A.page;
  p.on('dialog', (x) => x.accept());
  await p.waitForTimeout(1500);
  let r = await p.evaluate(() => {
    const t = (s) => (document.querySelector(s) || {}).textContent || '';
    const kp = [...document.querySelectorAll('#iniEje .ie-kpi b')].map((b) => b.textContent.trim());
    return { eje: !!document.getElementById('iniEje') && getComputedStyle(document.getElementById('iniEje')).display !== 'none', header: getComputedStyle(document.querySelector('body > header')).display, viejo: !!document.getElementById('inicioPlazas'), viejoVis: getComputedStyle(document.getElementById('inicioPlazas')).display,
      saludo: t('#iniEje .ie-h1'), fecha: t('#iniEje .ie-fecha'), kp, logo: (document.querySelector('#iniEje .ie-logo img') || {}).src || '', atender: [...document.querySelectorAll('#ieAtender .ie-fila')].map((f) => f.textContent.replace(/\s+/g, ' ').trim()), obra: t('#ieEnObra'), ots: t('#ieOts'), cerrarBtn: !!document.querySelector('#ieOts [data-ie="cerrarOt:ot2"]'), accs: [...document.querySelectorAll('#ieAccs .ie-acc')].map((a) => a.textContent.trim()), obras: [...document.querySelectorAll('#ieObras .ie-obra b')].map((b) => b.textContent), grilla: getComputedStyle(document.querySelector('#iniEje .ie-hero'), '::before').content, pedidos: /pedido/i.test(t('#iniEje')) };
  });
  c(r.eje && r.header === 'none' && r.viejo && r.viejoVis === 'none', 'admin ve el Inicio «Ejecutivo» con su portada (el header de la app se esconde); el inicio viejo queda en la página, escondido · ' + JSON.stringify({ eje: r.eje, header: r.header, viejo: r.viejoVis }));
  c(/Ana/.test(r.saludo) && /^(Buen día|Buenas tardes|Buenas noches),/.test(r.saludo) && /^(Lunes|Martes|Miércoles|Jueves|Viernes|Sábado|Domingo) \d+ de [a-z]+$/.test(r.fecha.trim()) && /^data:image\/png;base64,/.test(r.logo), 'saludo con el nombre, la fecha y el logo blanco de la app · ' + r.saludo + ' · ' + r.fecha);
  c(r.kp.join('|') === '2|3|1', '3 números reales: 2 órdenes de hoy, 3 personas en obra, 1 para cerrar · ' + r.kp.join('|'));
  c(r.atender.some((x) => /Órdenes para cerrar.*1/.test(x)) && r.atender.some((x) => /Usuarios nuevos.*1/.test(x)) && r.atender.some((x) => /Materiales sin stock.*FUSIBLE.*1$/i.test(x)), '«Para atender»: órdenes para cerrar, usuarios nuevos y materiales sin stock, con sus cuentas · ' + JSON.stringify(r.atender));
  c(/PLAZA GEORG NICOLAI/.test(r.obra) && /07:42/.test(r.obra) && /Rolando y Juan/.test(r.obra) && r.cerrarBtn && /OT-2026-002/.test(r.ots) && /2\/2/.test(r.ots), '«En obra ahora» y «Órdenes de hoy» con la gente, la hora, el avance 2/2 y el botón «Cerrar» en la que mandaron');
  c(r.accs.join(',') === 'Cálculo,Obras,Órdenes,Pañol,Mapa,Cámara,Plan,Informes' && r.obras.includes('PLAZA GEORG NICOLAI') && r.obras.includes('Plaza San Martín'), 'accesos (8) y obras con su avance · ' + r.accs.join(','));
  c(r.grilla === 'none' || r.grilla === 'normal' || r.grilla === '', 'la portada no lleva cuadrícula de fondo');
  c(!r.pedidos, 'la oficina no ve los «pedidos para aprobar» de reservas (eso es del pañolero)');
  c(await sinCostado(p), 'sin scroll de costado en el Inicio');
  // buscador y chips
  await p.fill('#ieBuscar', 'georg'); await p.waitForTimeout(500);
  r = await p.evaluate(() => [...document.querySelectorAll('#ieObras .ie-obra b')].map((b) => b.textContent));
  c(r.length === 1 && r[0] === 'PLAZA GEORG NICOLAI', 'el buscador de la portada filtra las obras · ' + r.join(','));
  await p.fill('#ieBuscar', ''); await p.click('#ieObras [data-ie="chip:eje"]'); await p.waitForTimeout(400);
  r = await p.evaluate(() => [...document.querySelectorAll('#ieObras .ie-obra b')].map((b) => b.textContent));
  c(r.join(',') === 'PLAZA GEORG NICOLAI', '«En ejecución» deja solo la obra en curso · ' + r.join(','));
  if (cel) { await p.evaluate(() => { document.activeElement && document.activeElement.blur(); window.scrollTo(0, 0); }); await foto(p, '135_inicio_oficina_arriba'); await p.evaluate(() => window.scrollTo(0, 1e6)); await p.waitForTimeout(600); await foto(p, '135_inicio_oficina_abajo'); }
  // nada tapado: lo último del inicio queda arriba de la barra
  if (cel) {
    r = await p.evaluate(() => { window.scrollTo(0, 1e7); const n = document.getElementById('navN1').getBoundingClientRect(), u = document.getElementById('ieObras').getBoundingClientRect(); return { barra: Math.round(n.top), ultimo: Math.round(u.bottom) }; });
    c(r.ultimo <= r.barra, 'con la página al fondo, la última tarjeta queda arriba de la barra · ' + JSON.stringify(r));
  }
  // cada fila lleva a su pantalla
  await p.evaluate(() => window.scrollTo(0, 0)); await p.click('#ieOts [data-ie="cerrarOt:ot2"]'); await p.waitForTimeout(1200);
  c(await vis(p, '#cierreOt'), '«Cerrar» abre el cierre de esa orden');
  await p.evaluate(() => { try { cerrarCuadroCierre(); } catch (e) { } window.mostrarVista('inicio'); }); await p.waitForTimeout(700);
  await p.click('#ieAtender [data-ie="usuarios"]'); await p.waitForTimeout(800);
  c(await p.evaluate(() => document.body.dataset.vista === 'usuarios'), '«Usuarios nuevos» lleva a Usuarios y permisos');
  await p.evaluate(() => window.mostrarVista('inicio')); await p.waitForTimeout(600);
  await p.click('#ieAtender [data-ie="cerrar"]'); await p.waitForTimeout(900);
  c(await p.evaluate(() => document.body.dataset.vista === 'parte' && window.__tableroSub && window.__tableroSub.estado().tab === 'revisar'), '«Órdenes para cerrar» abre Órdenes en «Para revisar y cerrar»');
  // ========================================================= 2) barra N1 de la oficina
  await p.evaluate(() => window.mostrarVista('inicio')); await p.waitForTimeout(900);
  let b = await barra(p);
  if (cel) {
    c(b.on && b.tabs.join(',') === 'inicio,obras,ordenes,panol,perfil' && b.activa === 'inicio' && b.bd.ordenes === '1' && b.min >= 44, 'barra de la oficina: Inicio · Obras · Órdenes · Pañol · Perfil, con el globito de 1 orden para cerrar y botones de 44 px o más · ' + JSON.stringify(b));
    r = await p.evaluate(() => { const ia = document.getElementById('iaFab'), n = document.getElementById('navN1'); if (!ia || !n) return null; const a = ia.getBoundingClientRect(), z = n.getBoundingClientRect(); return !(a.bottom <= z.top || a.top >= z.bottom || a.right <= z.left || a.left >= z.right); });
    c(r === false, 'la lengüeta del Asistente no choca con la barra');
    await p.click('#navN1 [data-n1="obras"]'); await p.waitForTimeout(900); b = await barra(p);
    c(await p.evaluate(() => document.body.dataset.vista === 'obras') && b.activa === 'obras', 'tocar «Obras» abre Obras y queda marcada');
    // escondida donde hay otra barra fija: Llenar orden, Calculadora, Asistente, cámara
    await p.evaluate(() => { window.mostrarVista('parte'); window.irSubOrdenes && window.irSubOrdenes('nueva'); }); await p.waitForTimeout(1500); b = await barra(p);
    c(!b.on && (await vis(p, '#ofBarra')), 'en «Llenar orden» la barra se esconde (manda la barra de la orden) · ' + b.tapado);
    if (CAP) await foto(p, '135_llenar_orden_sin_barra');
    await p.evaluate(() => window.mostrarVista('calc')); await p.waitForTimeout(1200); b = await barra(p);
    c(!b.on && b.tapado === 'calc', 'en la Calculadora se esconde (está la barra flotante) · ' + b.tapado);
    await p.evaluate(() => window.mostrarVista('inicio')); await p.waitForTimeout(800);
    await p.evaluate(() => window.__asistenteAbrir && window.__asistenteAbrir()); await p.waitForTimeout(1500); b = await barra(p);
    c(!b.on, 'con el panel del Asistente abierto se esconde · ' + b.tapado);
    await p.evaluate(() => window.__asistente && window.__asistente.cerrar()); await p.waitForTimeout(900); b = await barra(p);
    c(b.on, 'al cerrar el Asistente vuelve');
    await p.evaluate(() => window.mostrarVista('mapa')); await p.waitForTimeout(800); await p.click('#navN1 [data-n1="inicio"]').catch(() => { }); await p.waitForTimeout(600);
    await p.focus('#ieBuscar'); await p.waitForTimeout(400); b = await barra(p);
    c(!b.on && b.tapado === 'teclado', 'con el teclado abierto (escribiendo) se esconde · ' + b.tapado);
    await p.evaluate(() => document.activeElement.blur()); await p.waitForTimeout(500); b = await barra(p);
    c(b.on, 'al soltar el campo vuelve');
  } else {
    c(!b.on, 'en la PC ancha no hay barra de abajo (la oficina usa el menú lateral) · ' + JSON.stringify(b));
    await p.evaluate(() => abrirMenuLateral()); await p.waitForTimeout(500);
    c(await vis(p, '#menuPerfil'), 'el menú lateral tiene «Perfil» (en la PC no hay barra)');
    await p.click('#menuPerfil'); await p.waitForTimeout(900);
    c(await p.evaluate(() => document.body.dataset.vista === 'perfil'), 'desde el menú se abre el Perfil');
  }
  // ========================================================= 3) Perfil del admin (sin plugins: navegador)
  await p.evaluate(() => window.mostrarVista('perfil')); await p.waitForTimeout(1500);
  r = await p.evaluate(() => ({ vis: getComputedStyle(document.getElementById('viewPerfil')).display !== 'none', header: getComputedStyle(document.querySelector('body > header')).display, inicio: getComputedStyle(document.getElementById('viewInicio')).display, nom: (document.querySelector('#viewPerfil .pf-yo h1') || {}).textContent, rol: (document.querySelector('#viewPerfil .pf-rol') || {}).textContent, us: (document.querySelector('#viewPerfil .pf-mail') || {}).textContent, av: (document.querySelector('#viewPerfil .pf-av') || {}).textContent, k: [...document.querySelectorAll('#viewPerfil .pf-k')].map((x) => x.textContent.replace(/\s+/g, ' ').trim()), filas: [...document.querySelectorAll('#viewPerfil .pf-fila')].map((x) => x.dataset.pf + ':' + x.textContent.replace(/\s+/g, ' ').trim()), salir: !!document.querySelector('#viewPerfil [data-pf="salir"]') }));
  c(r.vis && r.header === 'none' && r.inicio === 'none' && r.nom === 'Ana Admin' && /Administrador/i.test(r.rol) && /admin/.test(r.us) && r.av === 'AA', 'Perfil: tarjeta con iniciales, nombre, rol y usuario (clara, sin la parte azul) · ' + JSON.stringify({ nom: r.nom, rol: r.rol, us: r.us }));
  c(r.k.length === 3 && /Puntos de la quincena/.test(r.k[0]) && /^1\s*Órdenes que seguís/.test(r.k[1]) && /Avisos sin leer/.test(r.k[2]), '3 números: puntos de la quincena, 1 orden que seguís y avisos sin leer · ' + JSON.stringify(r.k));
  c(r.filas.some((x) => /^huella:.*Necesita la app de Android 1\.4/.test(x)) && r.filas.some((x) => /^rec:.*Necesita la app de Android 1\.4/.test(x)) && r.filas.some((x) => /^leer:/.test(x)) && r.filas.some((x) => /^push:/.test(x)) && r.filas.some((x) => /^ver:Versión \d{4}-\d\d-\d\d/.test(x)) && r.filas.some((x) => /^celu:/.test(x)) && r.filas.some((x) => /^clave:.*oficina/.test(x)) && r.salir, 'ajustes y «La app»: sin la app 1.4 la huella y los recordatorios dicen «Necesita la app de Android 1.4»; versión, este equipo, contraseña (sin correo: «pedile a la oficina») y cerrar sesión · ' + JSON.stringify(r.filas));
  await p.click('#viewPerfil [data-pf="leer"]'); await p.waitForTimeout(400);
  r = await p.evaluate(() => ({ ls: localStorage.getItem('ema.ia.leer'), on: document.querySelector('#viewPerfil [data-pf="leer"] .pf-sw').classList.contains('on') }));
  c(r.ls === '1' && r.on, '«El asistente lee en voz alta» guarda ema.ia.leer (el mismo del asistente) · ' + JSON.stringify(r));
  await p.$eval('#viewPerfil [data-pf="huella"]', (e) => e.click()); await p.waitForTimeout(400);
  r = await p.evaluate(() => ({ ls: localStorage.getItem('ema.huella'), msg: document.getElementById('pfMsg').textContent }));
  c(r.ls !== '1' && /1\.4/.test(r.msg), 'sin el plugin, tocar la huella no la prende y explica que hace falta la app 1.4 · ' + r.msg);
  c(await sinCostado(p), 'sin scroll de costado en el Perfil');
  if (cel) { await foto(p, '135_perfil'); b = await barra(p); c(b.on && b.activa === 'perfil', 'en el Perfil la barra marca «Perfil»'); }
  // cerrar sesión
  await p.click('#viewPerfil [data-pf="salir"]'); await p.waitForTimeout(2500);
  r = await p.evaluate(() => ({ user: !!window.__fbUser, sesion: sessionStorage.getItem('stub.sesion') }));
  c(!r.user, '«Cerrar sesión» cierra la sesión (con la misma función de la app) · ' + JSON.stringify(r));
  c(A.errores.length === 0, 'sin errores en la consola (admin) · ' + A.errores.slice(0, 3).join(' | '));
  await A.browser.close();
  // ========================================================= 4) pañolero
  A = await abrir(Object.assign({ sesion: 'raul', datos: datos() }, MOD)); p = A.page; p.on('dialog', (x) => x.accept());
  await p.waitForTimeout(1500);
  r = await p.evaluate(() => ({ pan: !!document.getElementById('iniPan') && getComputedStyle(document.getElementById('iniPan')).display !== 'none', eje: !!document.getElementById('iniEje') && getComputedStyle(document.getElementById('iniEje')).display !== 'none', header: getComputedStyle(document.querySelector('body > header')).display, hdr: (document.getElementById('hdrHoja') || {}).textContent, hola: (document.querySelector('#iniPan .pn-hola b') || {}).textContent, tiles: [...document.querySelectorAll('#iniPan .pn-alerta')].map((x) => x.querySelector('.n').textContent + ' ' + x.querySelector('.t').textContent), ped: (document.querySelector('#iniPan .pn-ped') || {}).textContent || '', stock: [...document.querySelectorAll('#iniPan .pn-fila')].map((x) => x.textContent.replace(/\s+/g, ' ').trim()), accs: [...document.querySelectorAll('#iniPan .pn-acc4')].map((x) => x.textContent.trim()) }));
  c(r.pan && !r.eje && r.header !== 'none' && /Pañol/.test(r.hdr) && /Raúl/.test(r.hola), 'el pañolero ve su Inicio con el header de la app («Inicio · Pañol») y su saludo · ' + JSON.stringify({ hdr: r.hdr, hola: r.hola }));
  c(r.tiles.join(' | ') === '1 pedido para aprobar | 1 para preparar | 1 sin stock | 1 herramienta afuera', 'tarjetas: pedidos para aprobar, para preparar, sin stock y herramientas afuera, con datos reales · ' + r.tiles.join(' | '));
  c(/R-0142/.test(r.ped) && /2 materiales/.test(r.ped) && /PLAZA GEORG NICOLAI/.test(r.ped) && /pidió Rolando Velázquez/.test(r.ped) && /hace 2 h/.test(r.ped), 'el pedido con número, materiales, obra, quién y hace cuánto · ' + r.ped.replace(/\s+/g, ' '));
  c(r.stock.some((x) => /3017.*FUSIBLE.*se acabó/i.test(x)) && r.accs.join(',') === 'Vale,Entrada,Herram.,Compras', 'stock bajo («se acabó») y los 4 accesos · ' + JSON.stringify(r.stock));
  c(await sinCostado(p), 'sin scroll de costado en el Inicio del pañol');
  b = await barra(p);
  if (cel) {
    c(b.on && b.tabs.join(',') === 'inicio,reservas,catalogo,herr,perfil' && b.bd.reservas === '2', 'barra del pañol: Inicio · Reservas · Catálogo · Herramientas · Perfil, globito 2 (1 por aprobar + 1 por preparar) · ' + JSON.stringify(b));
    r = await p.evaluate(() => { const e = [...document.querySelectorAll('#navN1 .n1-t')].find((x) => x.textContent === 'Herramientas'); return e ? e.scrollWidth <= e.parentNode.clientWidth : false; });
    c(r, '«Herramientas» entra en la pestaña');
    await foto(p, '135_inicio_panol');
  }
  await p.click('#iniPan [data-ie="aprobar:r1"]'); await p.waitForTimeout(2500);
  r = await p.evaluate(() => ({ v: document.body.dataset.vista, est: ((window.reservasMaterial || []).find((x) => x.id === 'r1') || {}).estado }));
  c(r.v === 'stock' && r.est === 'pendiente', '«Aprobar» lo aprueba por el camino de Reservas (queda apartado) · ' + JSON.stringify(r));
  if (cel) { b = await barra(p); c(b.activa === 'reservas', 'y la barra marca «Reservas» · ' + b.activa); }
  c(A.errores.length === 0, 'sin errores en la consola (pañol) · ' + A.errores.slice(0, 3).join(' | '));
  await A.browser.close();
  // ========================================================= 5) cuadrilla: su inicio de siempre + su barra
  A = await abrir(Object.assign({ sesion: 'pedro', datos: datos() }, MOD)); p = A.page;
  await p.waitForTimeout(1200);
  r = await p.evaluate(() => ({ crew: document.body.classList.contains('inicio-crew'), ic: !!document.getElementById('inicioCuadrilla') && getComputedStyle(document.getElementById('inicioCuadrilla')).display !== 'none', eje: !!document.getElementById('iniEje') && getComputedStyle(document.getElementById('iniEje')).display !== 'none', pan: !!document.getElementById('iniPan') && getComputedStyle(document.getElementById('iniPan')).display !== 'none', header: getComputedStyle(document.querySelector('body > header')).display }));
  c(r.crew && r.ic && !r.eje && !r.pan && r.header !== 'none', 'la cuadrilla sigue con su inicio (#inicioCuadrilla), sin la portada nueva · ' + JSON.stringify(r));
  b = await barra(p);
  if (cel) {
    c(b.on && b.tabs.join(',') === 'hoy,camara,mapa,panol,perfil' && b.bd.hoy === '1', 'barra de la cuadrilla: Hoy · Cámara · Mapa · Pañol · Perfil, globito con su tarea de hoy · ' + JSON.stringify(b));
    await foto(p, '135_barra_cuadrilla');
    await p.click('#navN1 [data-n1="hoy"]'); await p.waitForTimeout(1000);
    c(await p.evaluate(() => document.body.dataset.vista === 'mistareas'), '«Hoy» abre Mis tareas');
    await p.click('#navN1 [data-n1="camara"]'); await p.waitForTimeout(1500); b = await barra(p);
    c(!b.on && ((await vis(p, '#ecElegir')) || (await vis(p, '#emaCam'))), '«Cámara» abre la cámara de la app y la barra se esconde · ' + b.tapado);
    await p.evaluate(() => window.camaraApp && window.camaraApp.cerrar && window.camaraApp.cerrar()); await p.waitForTimeout(300);
  } else c(!b.on, 'en la PC tampoco aparece para la cuadrilla');
  await p.evaluate(() => window.mostrarVista('perfil')); await p.waitForTimeout(1200);
  r = await p.evaluate(() => [...document.querySelectorAll('#viewPerfil .pf-k')].map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
  c(r.length === 3 && /Puntos de la quincena/.test(r[0]) && /^1\s*Tareas de hoy/.test(r[1]) && /Avisos sin leer/.test(r[2]), 'el Perfil de la cuadrilla: puntos, tareas de hoy y avisos · ' + JSON.stringify(r));
  await A.browser.close();
  // el operario con hojas ocultas (mapa y pañol): esas pestañas no van
  if (cel) {
    A = await abrir(Object.assign({ sesion: 'juan', datos: datos() }, MOD)); p = A.page; await p.waitForTimeout(1200);
    b = await barra(p);
    c(b.on && b.tabs.join(',') === 'hoy,camara,perfil', 'operario con Mapa y Pañol ocultos: la barra no muestra esas pestañas · ' + b.tabs.join(','));
    await A.browser.close();
  }
  // ========================================================= 6) app de Android 1.4 (plugins simulados): huella y recordatorios
  A = await abrir(Object.assign({ sesion: 'admin', datos: datos(), antes: apk14, antesArg: true }, MOD)); p = A.page; p.on('dialog', (x) => x.accept());
  await p.waitForTimeout(800);
  await p.evaluate(() => window.mostrarVista('perfil')); await p.waitForTimeout(1500);
  r = await p.evaluate(() => [...document.querySelectorAll('#viewPerfil .pf-fila')].map((x) => x.dataset.pf + ':' + x.textContent.replace(/\s+/g, ' ').trim() + (x.getAttribute('aria-disabled') ? ' [off]' : '')));
  c(r.some((x) => /^huella:Entrar con huella\s*Huella o PIN al abrir la app$/.test(x)) && r.some((x) => /^rec:Recordatorios\s*Apagados/.test(x)) && r.some((x) => /^celu:Este celular/.test(x)), 'con la app 1.4 la huella y los recordatorios quedan habilitados · ' + JSON.stringify(r));
  await p.$eval('#viewPerfil [data-pf="huella"]', (e) => e.click()); await p.waitForTimeout(800);
  r = await p.evaluate(() => ({ ls: localStorage.getItem('ema.huella'), bio: window.__bio.length, on: document.querySelector('#viewPerfil [data-pf="huella"] .pf-sw').classList.contains('on') }));
  c(r.ls === '1' && r.bio === 1 && r.on, 'prender «Entrar con huella» pide una verificación de prueba y guarda ema.huella=1 · ' + JSON.stringify(r));
  await p.click('#viewPerfil [data-pf="rec"]'); await p.waitForTimeout(500);
  c(await vis(p, '#rdHoja'), 'Recordatorios abre su hoja');
  if (cel) { b = await barra(p); c(!b.on, 'con la hoja de recordatorios abierta la barra se esconde · ' + b.tapado); }
  await p.check('#rdActivo'); await p.fill('#rdHora', '18:30'); await p.click('#rdHoja [data-rd="si"]'); await p.waitForTimeout(800);
  r = await p.evaluate(() => ({ ln: window.__ln.filter((x) => x.schedule).map((x) => x.schedule.notifications[0]), ls: JSON.parse(localStorage.getItem('ema.recordatorio') || 'null'), fila: document.querySelector('#viewPerfil [data-pf="rec"]').textContent.replace(/\s+/g, ' ') }));
  c(r.ln.length === 1 && r.ln[0].schedule.on.hour === 18 && r.ln[0].schedule.on.minute === 30 && /Órdenes para cerrar/.test(r.ln[0].title) && r.ls && r.ls.activo && /18:30/.test(r.fila), 'guardar programa un recordatorio diario a las 18:30 («Órdenes para cerrar») · ' + JSON.stringify(r));
  await p.evaluate(() => window.__perfil.badge()); await p.waitForTimeout(300);
  r = await p.evaluate(() => window.__badge.slice());
  c(r.includes(1), 'el número del ícono muestra lo pendiente (1 orden para cerrar) · ' + JSON.stringify(r));
  await A.browser.close();
  // al abrir con la huella prendida: velo; si falla, «Probar de nuevo» y «Cerrar sesión»
  const d2 = datos();
  A = await abrir(Object.assign({ sesion: 'admin', datos: d2, antes: (x) => { try { localStorage.setItem('ema.huella', '1'); } catch (e) { } (new Function('return ' + x)())(false); }, antesArg: apk14.toString(), espera: 3500 }, MOD)); p = A.page; p.on('dialog', (x) => x.accept());
  await p.waitForTimeout(1200);
  r = await p.evaluate(() => ({ velo: !!document.getElementById('bioVelo') && !document.getElementById('bioVelo').hidden, bio: window.__bio.length, txt: (document.getElementById('bioVelo') || {}).textContent || '' }));
  c(r.velo && r.bio >= 1 && /Probar de nuevo/.test(r.txt) && /Cerrar sesión/.test(r.txt), 'al abrir la app con la huella prendida la pide; si falla queda el velo con «Probar de nuevo» y «Cerrar sesión» · ' + JSON.stringify({ velo: r.velo, bio: r.bio }));
  if (cel) { b = await barra(p); c(!b.on, 'con el velo de la huella la barra no se ve'); }
  await p.evaluate(() => { window.__bioOk = true; }); await p.click('#bioVelo [data-bv="si"]'); await p.waitForTimeout(2200);
  c(await p.evaluate(() => document.getElementById('bioVelo').hidden), '«Probar de nuevo» con la huella buena saca el velo');
  // al volver después de 5 minutos en segundo plano la vuelve a pedir
  await p.evaluate(() => { const f = window.__appL.appStateChange; const t0 = Date.now(); f({ isActive: false }); const o = Date.now; Date.now = () => o() + 6 * 60e3; f({ isActive: true }); Date.now = o; }); await p.waitForTimeout(800);
  r = await p.evaluate(() => window.__bio.length);
  c(r >= 3, 'al volver después de 5 minutos en segundo plano la vuelve a pedir · ' + r);
  await A.browser.close();
  process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
