// v178 · datos: los de la v174/v175 (nómina real, Plaza San Martín con órdenes, la quincena cerrada) + una cosa de CADA colección
// que no está en memoria al entrar (se carga al abrir su pantalla o nunca): herramientas, sus movimientos, puntos del mapa,
// presencia, ubicación en vivo, adjuntos, fotos de obra, auditoría, avisos de la cuadrilla, Proyectista, notas de planos, tableros,
// cuadrillas, guías, salud, alias; una reserva por aprobar, una obra vacía (para borrar) y gastos. «QUIROGA» aparece en varias.
const { datos174 } = require('./datos174');
const { DOM } = require('./h');
function datos178(op = {}) {
  const d = datos174(op), db = d.db, ahora = Date.now(), hoy = d.hoy;
  const U = { lucia: ['uLucia', 'Lucía Oficina', 'oficina'], dir: ['uDir', 'Roberto Dirección', 'direccion'], pan: ['uPan', 'Pablo Pañol', 'panol'], mir: ['uMir', 'Mirta Mira', 'mirar'] };
  Object.keys(U).forEach((k) => { const [uid, nombre, rol] = U[k]; d.cuentas[k + '@' + DOM] = { pass: 'clave123', uid }; db.usuarios[uid] = { email: k + '@' + DOM, usuario: k, nombre, rol, activo: true }; });
  db.herramientas = { h1: { codigo: 'H-001', nombre: 'Amoladora Bosch', cat: 'electrica', estado: 'ok', asignada: null, creado: ahora }, h2: { codigo: 'H-002', nombre: 'Escalera extensible', estado: 'ok', asignada: { persona: 'Ramón QUIROGA', desde: ahora - 864e5 * 3 }, creado: ahora } };
  db.herramientasMov = { hm1: { herr: 'h2', codigo: 'H-002', nombre: 'Escalera extensible', tipo: 'entrega', persona: 'Ramón QUIROGA', ts: ahora - 864e5 * 3, fecha: hoy } };
  db.mapaPuntos = { mp1: { nombre: 'Tablero viejo', icono: 'tablero', lat: -31.41, lng: -64.18, nota: 'lo cuida el vecino QUIROGA', ts: ahora } };
  db.presencia = { uPedro: { ts: ahora, activo: true, vista: 'inicio', disp: { modelo: 'Moto g24 power-PRES', bateria: 80 } } };
  db.ubicacionVivo = { uJuan: { uid: 'uJuan', persona: 'Juan Pérez', clave: 'juan perez', lat: -31.4, lng: -64.19, acc: 12, ts: ahora, activo: true, via: 'android-UBIC' } };
  db.adjuntos = Object.assign(db.adjuntos || {}, { a1: { tipo: 'remito', titulo: 'Remito ADJ-7788 Electro Sur', plazaId: 'p1', ts: ahora - 5e5, por: 'admin' }, a2: { tipo: 'foto', titulo: 'Col 2', plazaId: 'p1', ts: ahora - 6e5, r2: 'fotos/2026/11/p1/a2.jpg' } });
  db.fotosObra = Object.assign(db.fotosObra || {}, { f1: { plazaId: 'p1', cat: 'columna', num: 'Col 9-FOTOOBRA', adjId: 'a2', ts: ahora - 6e5, fecha: hoy, por: 'Juan Pérez' } });
  db.auditoria = Object.assign(db.auditoria || {}, { au1: { accion: 'plaza_borrada', detalle: 'Plaza «PLAZA QUIROGA-AUDIT» borrada del tablero', usuario: 'admin@' + DOM, ts: ahora - 1e6 } });
  db.avisosCuadrilla = { av1: { uid: 'uJuan', email: 'juan@' + DOM, nombre: 'Juan Pérez', persona: 'Juan Pérez', personaClave: 'juan perez', rol: 'operario', texto: 'Falta cinta aisladora, avisale a QUIROGA', tipo: 'falta_material', ts: ahora - 3e5, fecha: hoy, estado: 'nuevo', para: [] } };
  db.proyectos = { py1: { nombre: 'Relevamiento PROY-ALBERDI', obraNombre: 'Plaza San Martín', etapa: 1, puntos: [], ts: ahora } };
  db.planosNotas = { pn1: { planoId: 'pl1', plazaId: 'p1', texto: 'NOTA-PLANO cruce por la esquina', ts: ahora } };
  db.tableros = { uAdmin: { tarjetas: [{ t: 'TABLERO-ANA comprar fusibles' }], ts: ahora } };
  db.configEquipo.cuadrillas = { lista: [{ nombre: 'Cuadrilla CUAD-NORTE', integrantes: ['Mauricio Mainini'] }], actualizado: ahora };
  db.configEquipo.guias = { textos: { izaje: 'GUIA-PROPIA izar con dos' } };
  db.configEquipo.salud = { supervisor: { ultimo: { txt: 'SALUD-PARTE todo bien' } } };
  db.configEquipo.alias = { angel: 'admin@' + DOM };
  db.reservas = { r1: { numero: 'R-0001', estado: 'solicitada', plazaId: 'p1', plazaNombre: 'Plaza San Martín', para: 'Mauricio Mainini', items: [{ codigo: 6010, desc: 'Luminaria LED', cant: 2, entregado: 0 }], historial: [], creado: ahora, ts: ahora } };
  db.gastosObra = { g1: { cat: 'combustible', fecha: hoy, desc: 'Nafta GASTO-NAFTA', importe: 15000, plazaId: 'p1', plazaNombre: 'Plaza San Martín', ts: ahora } };
  db.avanceObras.pVacia = { nombre: 'PLAZA VACÍA DE PRUEBA', obraId: '9999', barrio: 'Sur', creado: hoy, estado: 'Pendiente', secciones: [], valorItems: [], etapas: {} };
  return d;
}
module.exports = { datos178 };
