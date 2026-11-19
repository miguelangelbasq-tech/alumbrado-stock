// v181 · datos del registro de cambios: los de la v176 (nómina real, vehículos, precios de Gastos, Lucía oficina, Roberto
// Dirección, Juan operario y Pedro cuadrilla) + una obra con pin rojo, un gasto, una reserva lista, un producto con precio, una
// foto de la obra y la orden de hoy de Juan y Pedro.
const { DOM } = require('./h');
const { datos176, dia, GREF } = require('./datos176');
function datos181(op = {}) {
  const d = datos176(Object.assign({ ayer: true }, op));
  const now = Date.now();
  Object.assign(d.db.avanceObras.p1, { nombre: 'PLAZA SAN MARTÍN', mapaColor: '#EA4335', lat: -31.41, lng: -64.18 });
  d.db.avanceObras.p2 = { nombre: 'PLAZA LOS ÁLAMOS', obraId: '4026', barrio: 'Alberdi', creado: now };
  d.db.gastosObra = { g1: { cat: 'materiales', fecha: dia(1), desc: 'Hormigón elaborado', cant: 2, un: 'm3', pu: 6000, importe: 12000, proveedor: 'Hormigonera Sur', plazaId: 'p1', plazaNombre: 'PLAZA SAN MARTÍN', obraId: '1234', usuario: 'ofi@' + DOM, ts: now - 864e5 } };
  d.db.reservas = { r1: { numero: 'R-0045', estado: 'lista', plazaId: 'p1', plazaNombre: 'PLAZA SAN MARTÍN', items: [{ codigo: '1019', desc: 'Cable 3x1,5', cant: 50, un: 'm' }], creadoPor: 'ofi@' + DOM, ts: now - 2 * 864e5, historial: [] } };
  d.db.catalogoProductos = { '1019': { codigo: '1019', desc: 'CABLE TPR 3x1,5', un: 'm', costo: 100, editadoPor: 'admin@' + DOM, editadoTs: now - 864e5 } };
  d.db.fotosObra = { f1: { plazaId: 'p1', plazaNombre: 'PLAZA SAN MARTÍN', cat: 'columna', num: 'Col 1', fecha: dia(0), por: 'Juan Pérez', ts: now - 3600e3, mini: 'data:image/jpeg;base64,' + 'A'.repeat(300) } };
  return d;
}
module.exports = { datos181, dia, GREF };
