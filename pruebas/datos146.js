// v146 · datos para t_v146 (sobre los de la v143: Los Álamos, Las Acacias, Plaza del Sol, Juan y Pedro, Raúl y Diego…):
//  · cierre por voz: dos órdenes de hoy ya mandadas por la cuadrilla (Los Álamos: izaje 4 de 6 y vínculo 3 de 4; Las Acacias: zanja 30 de 40);
//  · pedido de compras: cómputo de Los Álamos (luminarias, cable 3×1,5, jabalinas), entradas con proveedor y precio, reserva que aparta,
//    fusible bajo el mínimo, alternativa 🟢 (1025 contra 1019) y un pañolero;
//  · tablero del dueño: certificado cerrado del mes pasado, ausencia, oficina que se habilita;
//  · lo no terminado pasa a mañana (op.pasar): órdenes de hoy con «no se hizo», a medias, sin marcar, ya pasada a mano y repetida
//    en la orden de mañana; orden emitida de mañana para Los Álamos y Plaza del Sol (llena), sin orden para Las Acacias.
const { DOM } = require('./h');
const { datos143 } = require('./datos143');
function datos146(op = {}) {
  const d = datos143(), ahora = Date.now(), hoy = d.hoy, dia = d.dia, man = d.man;
  const habil = (desde) => { let x = desde; for (let i = 0; i < 9; i++) { const y = new Date(x + 'T12:00:00'); y.setDate(y.getDate() + 1); x = y.toISOString().slice(0, 10); if (y.getDay() !== 0) return x; } return x; };
  const pasMan = habil(man);
  Object.assign(d.cuentas, { ['pan@' + DOM]: { pass: 'clave123', uid: 'uPan' } });
  d.db.usuarios.uPan = { email: 'pan@' + DOM, usuario: 'pan', nombre: 'Pablo Pañol', rol: 'panol', activo: true };
  const per = (...l) => l.map((n) => ({ nombre: n, rol: d.db.configEquipo.personal.lista.find((x) => x.nombre === n).rol }));
  const claves = (...l) => l.map((n) => n.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase());
  const JP = ['Juan Pérez', 'Pedro Gómez'], RD = ['Raúl Sosa', 'Diego Luna'];
  const env = (k, quien, estado, extra) => ({ [k]: { [claves(quien)[0]]: Object.assign({ estado, ts: ahora, por: quien }, extra || {}) } });
  const ot = (n, fecha, plaza, gente, prev, extra) => Object.assign({ numero: 'OT-2026-' + n, fecha, plazaId: plaza, plazaNombre: d.db.avanceObras[plaza].nombre, obraId: d.db.avanceObras[plaza].obraId, horaInicio: '07:30', horaFin: '15:30', cuadrilla: gente.map((x) => x.split(' ')[0]).join(' y '), personal: per(...gente), personalNombres: claves(...gente), actividades: Object.keys(prev), previsto: prev, estado: 'Emitida', creado: ahora - 864e5, creadoPor: 'admin@' + DOM }, extra || {});
  // cómputo de Los Álamos (para el pedido de compras)
  const it = (desc, cod, cant, un) => ({ desc, cod, cantNecesaria: cant, un: un || 'Un.' });
  d.db.avanceObras.p1.secciones = [{ titulo: 'COLUMNAS', items: [it('Luminaria LED 75 W', 6010, 12)] }, { titulo: 'CABLEADO DE SUBIDA', items: [it('Cable 3×1,5', 1019, 120, 'm')] }, { titulo: 'PUESTA A TIERRA', items: [it('Jabalina', 7015, 12)] }];
  if (!op.pasar) {
    // 1) cierre por voz: lo que mandó la cuadrilla hoy
    d.db.ordenesTrabajo.v1 = ot('150', hoy, 'p1', JP, { montaje_prfv: 6, montaje_vinculo: 4 }, { estado: 'En curso', campo: {
      marcas: { montaje_prfv: { hecho: true, cant: 4, por: 'Juan Pérez', ts: ahora }, montaje_vinculo: { hecho: true, cant: 3, por: 'Juan Pérez', ts: ahora } },
      tareaEnv: Object.assign(env('montaje_prfv', 'Juan Pérez', 'si'), env('montaje_vinculo', 'Juan Pérez', 'si')),
      horasTarea: { montaje_prfv: { ini: '07:30', fin: '12:00', por: 'Juan Pérez', ts: ahora }, montaje_vinculo: { ini: '12:30', fin: '15:30', por: 'Juan Pérez', ts: ahora } },
      enviados: { 'juan perez': { ts: ahora, nombre: 'Juan Pérez' } } } });
    d.db.ordenesTrabajo.v2 = ot('151', hoy, 'p2', RD, { zanjeo: 40 }, { estado: 'En curso', campo: {
      marcas: { zanjeo: { hecho: true, cant: 30, por: 'Raúl Sosa', ts: ahora } }, tareaEnv: env('zanjeo', 'Raúl Sosa', 'si'),
      horasTarea: { zanjeo: { ini: '07:30', fin: '15:30', por: 'Raúl Sosa', ts: ahora } }, enviados: { 'raul sosa': { ts: ahora, nombre: 'Raúl Sosa' } } } });
  } else {
    // 4) lo no terminado de hoy (op.pasar)
    d.db.ordenesTrabajo.h1 = ot('160', hoy, 'p1', JP, { montaje_prfv: 6, montaje_vinculo: 4, sellado_base: 6 }, { estado: 'En curso', pasadoA: { sellado_base: { otId: 'x', numero: 'OT-2026-199', fecha: man, cant: 6, ts: ahora } }, campo: {
      marcas: { montaje_prfv: { hecho: true, cant: 4, por: 'Juan Pérez', ts: ahora }, montaje_vinculo: { hecho: false, motivo: 'faltó material', por: 'Juan Pérez', ts: ahora } },
      tareaEnv: Object.assign(env('montaje_prfv', 'Juan Pérez', 'si'), env('montaje_vinculo', 'Juan Pérez', 'no', { motivo: 'material' })) } });
    d.db.ordenesTrabajo.h2 = ot('161', hoy, 'p2', RD, { zanjeo: 40 }, { estado: 'Emitida' });                                  // sin marcar, sin orden mañana → borrador
    d.db.ordenesTrabajo.h3 = ot('162', hoy, 'p3', ['Ana Torres', 'Marcos Ríos'], { replanteo: 1, montaje_metalica: 3 }, { estado: 'Emitida' });   // replanteo ya está mañana; izaje: mañana llena
    d.db.ordenesTrabajo.m1 = ot('170', man, 'p1', JP, { excavacion: 4 });
    d.db.ordenesTrabajo.m3 = ot('172', man, 'p3', ['Ana Torres', 'Marcos Ríos'], { replanteo: 1, zanjeo: 180 });
    if (op.preguntar) d.db.configEquipo.baremo = { sugerida: { pasarModo: 'preguntar' } };
  }
  // 2) pañol: entradas con proveedor y precio, reserva de Los Álamos (aparta 4 luminarias), fusible bajo el mínimo, alternativa 1025
  const mv = (n, x) => Object.assign({ fecha: dia(-n), ts: ahora - n * 864e5, usuario: 'admin@' + DOM }, x);
  Object.assign(d.db.movimientos, {
    e1: mv(12, { tipo: 'entrada', codigo: 6010, desc: 'Luminaria LED 75 W', un: 'Un.', cantidad: 2, proveedor: 'Eléctrica del Centro', remito: '0001-00012345', precioUnit: 85000, numero: 'E-0412' }),
    e2: mv(10, { tipo: 'entrada', codigo: 3017, desc: 'Fusible 10×38 2 A', un: 'Un.', cantidad: 10, proveedor: 'Eléctrica del Centro', remito: '0001-00012399', precioUnit: 300, numero: 'E-0413' }),
    e3: mv(20, { tipo: 'entrada', codigo: 1019, desc: 'Cable 3×1,5', un: 'm', cantidad: 100, proveedor: 'Cables Mediterránea', remito: 'A-555', precioUnit: 900, numero: 'E-0401' }),
    s3: mv(15, { tipo: 'salida', codigo: 1019, desc: 'Cable 3×1,5', un: 'm', cantidad: 100, plazaId: 'p3', plazaNombre: 'PLAZA DEL SOL', numero: 'S-0301', retiradoPor: 'Marcos Ríos' }),
    e4: mv(8, { tipo: 'entrada', codigo: 1025, desc: 'Cable 3×1,5 IRAM', un: 'm', cantidad: 200, proveedor: 'Cables Mediterránea', remito: 'A-560', precioUnit: 950, numero: 'E-0414' })
  });
  d.db.catalogoProductos = Object.assign(d.db.catalogoProductos || {}, { 3017: { codigo: 3017, desc: 'FUSIBLE CILINDRICO 10 X 38 2 AMP', un: 'Un.', minimo: 50, editadoPor: 'admin@' + DOM, editadoTs: ahora } });
  // 3) tablero: el mes pasado certificado (cerrado)
  const mp = (() => { const x = new Date(hoy + 'T12:00:00'); x.setDate(1); x.setMonth(x.getMonth() - 1); return x.toISOString().slice(0, 7); })();
  d.db.configEquipo.precios = { certCerrados: { [mp]: { ts: ahora - 5 * 864e5, por: 'admin@' + DOM, modulo: 296126.45, kMes: 12.5, kProv: 0, sinIva: 12.5 * 296126.45, obras: 1, zona: 'A' } } };
  d.ausHoy = 'Lucas Vera'; d.pasMan = pasMan; d.mesPasado = mp;
  return d;
}
module.exports = { datos146 };
