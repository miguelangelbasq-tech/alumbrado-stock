// v145 · datos para t_v145: certificación mensual (órdenes del mes y del anterior, ejecutada con CERTIF_MUNI, provisiones,
// ítem sin fecha, otra zona, barrio, anulada con el avance descontado), material contra avance (🟢🟡🔴 y un sustituto),
// aprendizaje con 3 obras terminadas y gente sin tarea (nómina de 6, 1 ausente, 4 en órdenes).
const { baseDatos, DOM } = require('./h');
function datos145() {
  const d = baseDatos(), ahora = Date.now(), hoy = d.hoy, M = hoy.slice(0, 7);
  const mesAnt = (() => { const x = new Date(hoy + 'T12:00:00'); x.setDate(1); x.setMonth(x.getMonth() - 1); return x.toISOString().slice(0, 7); })();
  const habil = (desde) => { let x = desde; for (let i = 0; i < 9; i++) { const y = new Date(x + 'T12:00:00'); y.setDate(y.getDate() + 1); x = y.toISOString().slice(0, 10); if (y.getDay() !== 0) return x; } return x; };
  const man = habil(hoy);
  Object.assign(d.cuentas, { ['lucia@' + DOM]: { pass: 'clave123', uid: 'uLucia' }, ['pan@' + DOM]: { pass: 'clave123', uid: 'uPan' }, ['raul@' + DOM]: { pass: 'clave123', uid: 'uRaul' } });
  const U = d.db.usuarios;
  U.uJuan = { email: 'juan@' + DOM, usuario: 'juan', nombre: 'Juan Pérez', rol: 'cuadrilla', persona: 'Juan Pérez', personaClave: 'juan perez', activo: true };
  U.uPedro = { email: 'pedro@' + DOM, usuario: 'pedro', nombre: 'Pedro Gómez', rol: 'cuadrilla', persona: 'Pedro Gómez', personaClave: 'pedro gomez', activo: true };
  U.uRaul = { email: 'raul@' + DOM, usuario: 'raul', nombre: 'Raúl Sosa', rol: 'cuadrilla', persona: 'Raúl Sosa', personaClave: 'raul sosa', activo: true };
  U.uLucia = { email: 'lucia@' + DOM, usuario: 'lucia', nombre: 'Lucía Fernández', rol: 'oficina', activo: true };
  U.uPan = { email: 'pan@' + DOM, usuario: 'pan', nombre: 'Pablo Pañol', rol: 'panol', persona: 'Pablo Pañol', personaClave: 'pablo panol', activo: true };
  const P = (nombre, rol, x) => Object.assign({ nombre, rol, activo: true }, x || {});
  d.db.configEquipo.personal = {
    lista: [P('Juan Pérez', 'Oficial'), P('Pedro Gómez', 'Ayudante'), P('Raúl Sosa', 'Oficial'), P('Axel Díaz', 'Ayudante', { equipoCivil: true }), P('Mario Ruiz', 'Ayudante'), P('Diego Luna', 'Ayudante'), P('Pablo Pañol', 'Pañolero')],
    vehiculos: [{ id: 'vT', nombre: 'Hilux', patente: 'AE 321 IJ', tipo: 'transporte', lugares: 5, activo: true }, { id: 'vC', nombre: 'Camioneta', patente: 'AC 456 EF', tipo: 'hidro', lugares: 3, activo: true }],
    ausencias: [{ id: 'a1', persona: 'Diego Luna', motivo: 'enfermedad', desde: hoy, hasta: man, por: 'admin@' + DOM, ts: ahora }]
  };
  d.db.configEquipo.precios = {};
  const col = (n) => Array.from({ length: n }, (_, i) => 'Col ' + (i + 1));
  const it = (desc, cod, cant, un) => ({ desc, cod, cantNecesaria: cant, un: un || 'Un.' });
  d.db.avanceObras = {
    pA: { nombre: 'PLAZA MITRE', obraId: '7091', tipo: 'plaza', barrio: 'B. Mitre', creado: ahora, puntos: col(10),
      valorItems: [{ id: 1, itemPliego: '5', cantidad: 10, cantidadAvanzada: 6 }, { id: 2, itemPliego: '18', cantidad: 100, cantidadAvanzada: 20 }, { id: 3, itemPliego: '25', cantidad: 100, cantidadAvanzada: 10 }, { id: 4, itemPliego: '86', cantidad: 200, cantidadAvanzada: 40 }],
      secciones: [{ titulo: 'COLUMNAS', items: [it('Luminaria LED 75 W', 6010, 10), it('Vínculo capuchón', 6021, 10)] }, { titulo: 'CABLEADO TRONCAL', items: [it('Cable Cu 4×4 mm²', 1010, 300, 'm')] }, { titulo: 'PUESTA A TIERRA', items: [it('Jabalina 1/2" × 1,5 m', 7015, 10)] }, { titulo: 'TABLERO DE COLUMNA', items: [it('Fusible 10×38 2 A', 3017, 40)] }] },
    pB: { nombre: 'PLAZA SAN MARTÍN', obraId: '2071', tipo: 'plaza', barrio: 'San Martín', creado: ahora, puntos: col(4),
      valorItems: [{ id: 1, itemPliego: '1', cantidad: 4, cantidadAvanzada: 2 }, { id: 2, itemPliego: '43', cantidad: 2, cantidadAvanzada: 3 }] },
    pM: { nombre: 'PLAZA SANTA ANA', obraId: '4045', tipo: 'plaza', barrio: 'Altos de Santa Ana', creado: ahora,
      valorItems: [{ id: 1, itemPliego: '2', cantidad: 3, cantidadAvanzada: 3 }, { id: 2, itemPliego: '3', cantidad: 3, cantidadAvanzada: 3 }, { id: 3, itemPliego: '44', cantidad: 4, cantidadAvanzada: 4 }, { id: 4, itemPliego: '82', cantidad: 1, cantidadAvanzada: 1 }] },
    pZ: { nombre: 'PLAZA FAVALORO', obraId: '4038', tipo: 'plaza', creado: ahora, valorItems: [{ id: 1, itemPliego: '5', cantidad: 6, cantidadAvanzada: 2 }] },
    pX: { nombre: 'Costa Canal', obraId: '7539', tipo: 'plaza', barrio: 'COSTA CANAL', direccion: 'ERIDANUS 1416', creado: ahora },   // mayúsculas mezcladas (como en el celu de Ángel)
    pR: { nombre: 'BARRIO AMPLIACIÓN', obraId: '7031', tipo: 'barrio', creado: ahora, valorItems: [{ id: 1, itemPliego: '5', cantidad: 6, cantidadAvanzada: 2 }] }
  };
  // tres obras terminadas (PRFV 7 m, 8 columnas): la calculadora pone 1 m de Cu 4×4 por columna; lo real 1,3 · 1,375 · 1,2
  [['pL1', '9004', 'PLAZA LICEO', 10.4], ['pL2', '2006', 'PLAZA LUGONES', 11], ['pL3', '7229', 'PLAZA ITUZAINGÓ', 9.6]].forEach(([id, oid, n, m]) => {
    d.db.avanceObras[id] = { nombre: n, obraId: oid, tipo: 'plaza', creado: ahora, estado: 'Finalizada', valorItems: [{ id: 1, itemPliego: '5', cantidad: 8, cantidadAvanzada: 8 }], secciones: [{ titulo: 'CAJAS DE CONEXIÓN', items: [it('Cable Cu 4×4 mm²', 1010, 8, 'm')] }] };
    d.movimientos = d.movimientos || [];
    d.movimientos.push({ tipo: 'salida', codigo: 1010, desc: 'Cable Cu 4×4', un: 'm', cantidad: m, plazaId: id, plazaNombre: n, fecha: hoy, ts: ahora, retiradoPor: 'Juan Pérez' });
  });
  const per = (...l) => l.map((n) => ({ nombre: n, rol: d.db.configEquipo.personal.lista.find((x) => x.nombre === n).rol }));
  const claves = (...l) => l.map((n) => n.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase());
  const ot = (num, fecha, plaza, av, extra) => Object.assign({ numero: 'OT-2026-' + num, fecha, plazaId: plaza, plazaNombre: d.db.avanceObras[plaza].nombre, obraId: d.db.avanceObras[plaza].obraId, personal: per('Juan Pérez', 'Pedro Gómez'), personalNombres: claves('Juan Pérez', 'Pedro Gómez'), actividades: ['montaje_prfv'], previsto: { montaje_prfv: 3 }, estado: 'Terminada', creado: ahora, cierre: { cerradoTs: ahora, cantidades: { montaje_prfv: 3 }, avanceItems: av } }, extra || {});
  d.db.ordenesTrabajo = {
    o1: ot('301', mesAnt + '-20', 'pA', [{ id: '5', delta: 3, k: 'montaje_prfv' }]),
    o2: ot('302', M + '-03', 'pA', [{ id: '5', delta: 2, k: 'montaje_prfv' }, { id: '86', delta: 40 }]),
    o3: ot('303', M + '-05', 'pA', [{ id: '5', delta: 1, k: 'montaje_prfv' }, { id: '18', delta: 20, k: 'zanjeo' }]),
    o4: ot('304', M + '-07', 'pB', [{ id: '1', delta: 2, k: 'montaje_metalica' }]),
    o5: ot('305', M + '-08', 'pM', [{ id: '44', delta: 1 }]),
    o6: ot('306', M + '-04', 'pZ', [{ id: '5', delta: 2 }]),
    o7: ot('307', M + '-04', 'pR', [{ id: '5', delta: 2 }]),
    o8: ot('308', M + '-06', 'pA', [{ id: '5', delta: 4 }], { estado: 'Anulada', cierre: { cerradoTs: ahora, avanceItems: [{ id: '5', delta: 4 }], avanceRevertido: ahora } }),
    // mañana: 4 de los 6 ya tienen orden (Mario queda sin tarea; Diego está enfermo)
    m1: ot('310', man, 'pA', [], { estado: 'Emitida', cierre: null, previsto: { montaje_prfv: 4 }, vehiculos: [{ id: 'vT', nombre: 'Hilux', patente: 'AE 321 IJ' }] }),
    m2: ot('311', man, 'pB', [], { estado: 'Emitida', cierre: null, personal: per('Raúl Sosa', 'Axel Díaz'), personalNombres: claves('Raúl Sosa', 'Axel Díaz'), actividades: ['zanjeo'], previsto: { zanjeo: 30 }, vehiculos: [{ id: 'vC', nombre: 'Camioneta', patente: 'AC 456 EF' }] })
  };
  // vales a PLAZA MITRE: 6010 × 4 (+ 2 del sustituto 6011) 🟢, 6021 nada 🔴, 1010 × 300 🔴, 7015 × 7 🟢, 3017 × 30 🟡
  const v = (cod, cant, n) => ({ tipo: 'salida', codigo: cod, cantidad: cant, plazaId: 'pA', plazaNombre: 'PLAZA MITRE', fecha: hoy, ts: ahora + n, retiradoPor: n % 2 ? 'Juan Pérez' : 'Pedro Gómez', numero: 'S-04' + String(10 + n) });
  d.movimientos = (d.movimientos || []).concat([v(6010, 4, 1), v(6011, 2, 2), v(1010, 200, 3), v(1010, 100, 4), v(7015, 7, 5), v(3017, 30, 6)]);
  d.db.movimientos = {}; d.movimientos.forEach((m, i) => { d.db.movimientos['mv' + i] = m; });
  d.db.reservas = { r1: { numero: 'R-0045', plazaId: 'pA', plazaNombre: 'PLAZA MITRE', estado: 'entregada', creado: ahora, items: [{ codigo: 6011, desc: 'Luminaria LED 75 W (otra marca)', cant: 2, entregado: 2, alternativaDe: 6010, cantOriginal: 2 }] } };
  return Object.assign(d, { M, mesAnt, man });
}
module.exports = { datos145 };
