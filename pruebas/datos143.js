// v143 · datos para la orden sugerida (t_v143 y las capturas): 3 obras activas con cálculo (itemizado), 1 sin cálculo,
// cuadrillas de siempre, equipo civil, ausencias, vehículos con tipo y lugares, una reserva con faltante y órdenes cerradas
// con hora de inicio y fin (para lo medido).
const { baseDatos, DOM } = require('./h');
function datos143(op = {}) {
  const d = baseDatos(), ahora = Date.now(), hoy = d.hoy;
  const dia = (n) => { const x = new Date(hoy + 'T12:00:00'); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
  const habil = (desde) => { let x = desde; for (let i = 0; i < 9; i++) { x = (() => { const y = new Date(x + 'T12:00:00'); y.setDate(y.getDate() + 1); return y.toISOString().slice(0, 10); })(); if (new Date(x + 'T12:00:00').getDay() !== 0) return x; } return x; };
  const man = habil(hoy);   // el próximo día hábil (el sábado se trabaja medio día)
  Object.assign(d.cuentas, { ['lucia@' + DOM]: { pass: 'clave123', uid: 'uLucia' }, ['raul@' + DOM]: { pass: 'clave123', uid: 'uRaul' }, ['mir@' + DOM]: { pass: 'clave123', uid: 'uMir' } });
  const U = d.db.usuarios;
  U.uJuan = { email: 'juan@' + DOM, usuario: 'juan', nombre: 'Juan Pérez', rol: 'cuadrilla', persona: 'Juan Pérez', personaClave: 'juan perez', activo: true };
  U.uPedro = { email: 'pedro@' + DOM, usuario: 'pedro', nombre: 'Pedro Gómez', rol: 'cuadrilla', persona: 'Pedro Gómez', personaClave: 'pedro gomez', activo: true };
  U.uLucia = { email: 'lucia@' + DOM, usuario: 'lucia', nombre: 'Lucía Fernández', rol: 'oficina', activo: true };
  U.uRaul = { email: 'raul@' + DOM, usuario: 'raul', nombre: 'Raúl Sosa', rol: 'cuadrilla', persona: 'Raúl Sosa', personaClave: 'raul sosa', activo: true };
  U.uMir = { email: 'mir@' + DOM, usuario: 'mir', nombre: 'Mirta Mira', rol: 'mirar', activo: true };
  const P = (nombre, rol, x) => Object.assign({ nombre, rol, activo: true }, x || {});
  d.db.configEquipo.personal = {
    lista: [P('Juan Pérez', 'Oficial', { vehiculoId: 'vH1' }), P('Pedro Gómez', 'Ayudante'), P('Raúl Sosa', 'Oficial', { vehiculoId: 'vC2' }), P('Diego Luna', 'Ayudante'), P('Ana Torres', 'Oficial'), P('Marcos Ríos', 'Oficial'), P('Lucas Vera', 'Ayudante'),
      P('Javier Olariaga', 'Oficial', { equipoCivil: true }), P('Ronaldo Paz', 'Ayudante', { equipoCivil: true }), P('Axel Díaz', 'Ayudante', { equipoCivil: true })],
    vehiculos: [{ id: 'vG', nombre: 'Grúa', patente: 'AA 100 GR', tipo: 'grua', lugares: 2, activo: true }, { id: 'vH1', nombre: 'Hidro 1', patente: 'AB 123 CD', tipo: 'hidro', lugares: 2, activo: true }, { id: 'vC2', nombre: 'Camioneta 2', patente: 'AC 456 EF', tipo: 'hidro', lugares: 2, activo: true }, { id: 'vB1', nombre: 'Barquilla 1', patente: 'AD 789 GH', tipo: 'barquilla', lugares: 3, activo: true }, { id: 'vT', nombre: 'Hilux', patente: 'AE 321 IJ', tipo: 'transporte', lugares: 5, activo: true }],
    ausencias: op.sinAusencias ? [] : [{ id: 'a1', persona: 'Lucas Vera', motivo: 'vacaciones', desde: dia(-2), hasta: dia(10), por: 'admin@' + DOM, ts: ahora }]
  };
  const col = (n) => Array.from({ length: n }, (_, i) => 'Col ' + (i + 1));
  d.db.avanceObras = {
    p1: { nombre: 'PLAZA LOS ÁLAMOS', plazaNombre: 'PLAZA LOS ÁLAMOS', obraId: '4031', direccion: 'Los Álamos y Pje. 12', barrio: 'Villa Rivera', tipo: 'plaza', creado: ahora, valorItems: [{ id: 1, itemPliego: '5', cantidad: 12, cantidadAvanzada: 0 }, { id: 2, itemPliego: '75', cantidad: 12, cantidadAvanzada: 0 }], puntos: col(12) },
    p2: { nombre: 'PLAZA LAS ACACIAS', plazaNombre: 'PLAZA LAS ACACIAS', obraId: '4072', direccion: 'Acacias 300', barrio: 'Alto Alberdi', tipo: 'plaza', creado: ahora, valorItems: [{ id: 1, itemPliego: '5', cantidad: 8, cantidadAvanzada: 0 }, { id: 2, itemPliego: '15', cantidad: 180, cantidadAvanzada: 0 }, { id: 3, itemPliego: '25', cantidad: 320, cantidadAvanzada: 0 }], puntos: col(8) },
    p3: { nombre: 'PLAZA DEL SOL', plazaNombre: 'PLAZA DEL SOL', obraId: '4044', direccion: 'Sol de Mayo 50', barrio: 'Centro', tipo: 'plaza', creado: ahora, valorItems: [{ id: 1, itemPliego: '1', cantidad: 10, cantidadAvanzada: 4 }], puntos: col(10) },
    p4: { nombre: 'BARRIO SAN VICENTE', plazaNombre: 'BARRIO SAN VICENTE', obraId: '5001', direccion: 'San Vicente', barrio: 'San Vicente', tipo: 'barrio', creado: ahora }
  };
  const per = (...l) => l.map((n) => ({ nombre: n, rol: d.db.configEquipo.personal.lista.find((x) => x.nombre === n).rol }));
  const claves = (...l) => l.map((n) => n.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase());
  const cerr = (n, fecha, plaza, gente, prev, cant, extra) => Object.assign({ numero: 'OT-2026-' + n, fecha, plazaId: plaza, plazaNombre: d.db.avanceObras[plaza].nombre, obraId: d.db.avanceObras[plaza].obraId, horaInicio: '07:30', horaFin: '15:30', cuadrilla: gente.map((x) => x.split(' ')[0]).join(' y '), personal: per(...gente), personalNombres: claves(...gente), actividades: Object.keys(prev), previsto: prev, estado: 'Terminada', creado: ahora - 864e5 * 9, creadoPor: 'admin@' + DOM, cierre: { cerradoTs: ahora - 864e5, cantidades: cant, horas: 8, fecha } }, extra || {});
  const JP = ['Juan Pérez', 'Pedro Gómez'], RD = ['Raúl Sosa', 'Diego Luna'], CIV = ['Javier Olariaga', 'Ronaldo Paz', 'Axel Díaz'];
  const ht = (k, ini, fin) => ({ horasTarea: { [k]: { ini, fin, por: 'Juan Pérez', ts: ahora } } });
  d.db.ordenesTrabajo = {
    // Los Álamos: pozos y hormigón hace 6 días (ya fraguó), izaje de 8, ayer el vínculo quedó en 6 de 8
    a1: cerr('120', dia(-6), 'p1', JP, { excavacion: 12, hormigonado: 12 }, { excavacion: 12, hormigonado: 12 }),
    a2: cerr('125', dia(-3), 'p1', JP, { montaje_prfv: 8 }, { montaje_prfv: 8 }, { campo: { fotos: Object.fromEntries(col(8).map((c, i) => ['f' + i, { k: 'montaje_prfv', cat: 'columna', num: c, por: 'Juan Pérez', ts: ahora }])) } }),
    a3: cerr('134', dia(-1), 'p1', JP, { montaje_vinculo: 8 }, { montaje_vinculo: 6 }),
    // Las Acacias: zanja de 84 m hecha (civil), hormigón ayer a las 17 (fragua), cuadrilla Raúl y Diego
    b1: cerr('128', dia(-4), 'p2', CIV, { zanjeo: 84 }, { zanjeo: 84 }),
    b2: cerr('133', dia(-1), 'p2', RD, { excavacion: 8, hormigonado: 8 }, { excavacion: 8, hormigonado: 8 }, { horaFin: '17:00' }),
    // Plaza del Sol (metálica): 4 columnas cargadas a mano en el itemizado (sin fecha del hormigón), cuadrilla Marcos y Lucas
    c1: cerr('110', dia(-12), 'p3', ['Marcos Ríos', 'Lucas Vera'], { replanteo: 1 }, { replanteo: 1 }),
    // lo medido: 3 cierres del tablerito con hora de inicio y fin (4 en 4 h con 2 → 8 por día con 2)
    m1: cerr('101', dia(-20), 'p4', ['Ana Torres', 'Marcos Ríos'], { conexionado_tablerito: 4 }, { conexionado_tablerito: 4 }, { campo: ht('conexionado_tablerito', '08:00', '12:00') }),
    m2: cerr('102', dia(-19), 'p4', ['Ana Torres', 'Marcos Ríos'], { conexionado_tablerito: 4 }, { conexionado_tablerito: 4 }, { campo: ht('conexionado_tablerito', '08:00', '12:00') }),
    m3: cerr('103', dia(-18), 'p4', ['Ana Torres', 'Marcos Ríos'], { conexionado_tablerito: 4 }, { conexionado_tablerito: 4 }, { campo: ht('conexionado_tablerito', '08:00', '12:00') }),
    // Barrio San Vicente (sin cálculo): un reclamo para mañana con Diego (lo ocupa)
    r1: { numero: 'OT-2026-139', fecha: man, plazaId: 'p4', plazaNombre: 'BARRIO SAN VICENTE', obraId: '5001', horaInicio: '07:30', cuadrilla: 'Diego', personal: per('Diego Luna'), personalNombres: claves('Diego Luna'), actividades: ['reclamo_revision'], previsto: { reclamo_revision: 1 }, estado: 'Emitida', creado: ahora - 36e5, creadoPor: 'admin@' + DOM }
  };
  d.db.reservas = { r1: { numero: 'R-0050', estado: 'pendiente', plazaId: 'p1', plazaNombre: 'PLAZA LOS ÁLAMOS', items: [{ codigo: 6010, desc: 'Luminaria LED 75 W', un: 'Un.', cant: 4, cantidad: 4, entregado: 0 }], creado: ahora, creadoPor: 'admin@' + DOM, historial: [] } };
  d.db.movimientos = { m1: { tipo: 'entrada', codigo: 6010, desc: 'Luminaria LED 75 W', un: 'Un.', cantidad: 1, fecha: dia(-5), ts: ahora - 5e8, usuario: 'admin@' + DOM, numero: 'E-0001' } };
  d.man = man; d.dia = dia;
  return d;
}
module.exports = { datos143 };
