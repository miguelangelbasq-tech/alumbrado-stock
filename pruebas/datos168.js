// v168 · datos para t_v168 (luminarias armadas), sobre los de la v143 (Los Álamos, Las Acacias, Plaza del Sol, Juan y Pedro…):
//  · pañol con stock: 34 luminarias 6010, 50 prensacables 3/4" (5040, alta del equipo para la prueba) y 300 m de cable 3×1,5 (1019),
//    con precio en las entradas; pañolero Pablo (pan), oficina Lucía, cuadrilla Juan, mirar Mirta, Dirección Roberto;
//  · obra «DEPOSITO LUMINARIAS» (la que usan de depósito) con vales de 6 luminarias, 6 prensacables y 40 m de cable;
//  · PLAZA LOS ÁLAMOS con cálculo que pide 8 luminarias, 8 prensacables y 120 m de cable, un vale viejo de 2 luminarias y una
//    orden de HOY (OT-2026-170, Juan y Pedro); la reserva R-0050 de la v143 aparta 4 luminarias.
const { DOM } = require('./h');
const { datos143 } = require('./datos143');
function datos168(op) {
  op = op || {};
  const d = datos143(), ahora = Date.now(), hoy = d.hoy, dia = d.dia;
  Object.assign(d.cuentas, { ['pan@' + DOM]: { pass: 'clave123', uid: 'uPan' }, ['dir@' + DOM]: { pass: 'clave123', uid: 'uDir' } });
  d.db.usuarios.uPan = { email: 'pan@' + DOM, usuario: 'pan', nombre: 'Pablo Pañol', rol: 'panol', activo: true };
  d.db.usuarios.uDir = { email: 'dir@' + DOM, usuario: 'dir', nombre: 'Roberto Dirección', rol: 'direccion', activo: true };
  d.db.avanceObras.p5 = { nombre: 'DEPOSITO LUMINARIAS', plazaNombre: 'DEPOSITO LUMINARIAS', obraId: '', direccion: 'Galpón', barrio: '', tipo: 'otra', creado: ahora };
  const it = (desc, cod, cant, un) => ({ desc, cod, cantNecesaria: cant, un: un || 'Un.' });
  d.db.avanceObras.p1.secciones = [{ titulo: 'COLUMNAS', items: [it('Luminaria vial LED', 6010, 8), it('Prensacable 3/4"', 5040, 8)] }, { titulo: 'CABLEADO DE SUBIDA', items: [it('Cable 3×1,5', 1019, 120, 'm')] }];
  d.db.catalogoProductos = Object.assign(d.db.catalogoProductos || {}, { 5040: { codigo: 5040, desc: 'PRENSACABLE 3/4"', un: 'Un.', sector: 'pañol', stock: 0, costo: 0, minimo: 0, activo: true, editadoPor: 'admin@' + DOM, editadoTs: ahora } });
  const mv = (n, x) => Object.assign({ fecha: dia(-n), ts: ahora - n * 864e5, usuario: 'admin@' + DOM, sector: 'alumbrado' }, x);
  d.db.movimientos = {
    e1: mv(20, { tipo: 'entrada', codigo: 6010, desc: 'Luminaria vial LED (provista por la Municipalidad)', un: 'Un.', cantidad: 34, proveedor: 'Municipalidad', remito: 'M-1', precioUnit: 85000, numero: 'E-0001' }),
    e2: mv(20, { tipo: 'entrada', codigo: 5040, desc: 'PRENSACABLE 3/4"', un: 'Un.', cantidad: 50, proveedor: 'Eléctrica del Centro', remito: 'A-10', precioUnit: 1200, numero: 'E-0002' }),
    e3: mv(20, { tipo: 'entrada', codigo: 1019, desc: 'CABLE SUBTERRANEO 3 X 1.5 MM 22 (PLAZA-MUNICIPALIDAD DE CBA)', un: 'm', cantidad: 300, proveedor: 'Cables Mediterránea', remito: 'A-555', precioUnit: 900, numero: 'E-0003' }),
    s1: mv(10, { tipo: 'salida', codigo: 6010, desc: 'Luminaria vial LED (provista por la Municipalidad)', un: 'Un.', cantidad: 6, plazaId: 'p5', obraId: '', destino: 'DEPOSITO LUMINARIAS', valeGrupo: 'VSdep1', numero: 'S-0001', retiradoPor: 'Juan Pérez' }),
    s2: mv(10, { tipo: 'salida', codigo: 5040, desc: 'PRENSACABLE 3/4"', un: 'Un.', cantidad: 6, plazaId: 'p5', obraId: '', destino: 'DEPOSITO LUMINARIAS', valeGrupo: 'VSdep1', numero: 'S-0001', retiradoPor: 'Juan Pérez' }),
    s3: mv(10, { tipo: 'salida', codigo: 1019, desc: 'CABLE SUBTERRANEO 3 X 1.5 MM 22 (PLAZA-MUNICIPALIDAD DE CBA)', un: 'm', cantidad: 40, plazaId: 'p5', obraId: '', destino: 'DEPOSITO LUMINARIAS', valeGrupo: 'VSdep1', numero: 'S-0001', retiradoPor: 'Juan Pérez' }),
    s4: mv(5, { tipo: 'salida', codigo: 6010, desc: 'Luminaria vial LED (provista por la Municipalidad)', un: 'Un.', cantidad: 2, plazaId: 'p1', obraId: '4031', destino: 'PLAZA LOS ÁLAMOS', valeGrupo: 'VSp1a', numero: 'S-0002', retiradoPor: 'Juan Pérez' })
  };
  const per = [{ nombre: 'Juan Pérez', rol: 'Oficial' }, { nombre: 'Pedro Gómez', rol: 'Ayudante' }];
  d.db.ordenesTrabajo.h170 = { numero: 'OT-2026-170', fecha: hoy, plazaId: 'p1', plazaNombre: 'PLAZA LOS ÁLAMOS', obraId: '4031', horaInicio: '07:30', horaFin: '15:30', cuadrilla: 'Juan y Pedro', responsable: 'Juan Pérez', personal: per, personalNombres: ['juan perez', 'pedro gomez'], actividades: ['montaje_luminaria'], previsto: { montaje_luminaria: 6 }, estado: 'Emitida', creado: ahora - 36e5, creadoPor: 'admin@' + DOM };
  if (op.conArmadas) {   // una receta (6026) y un armado de 4 ya hechos (AR-0001), para mirar con cada rol
    const pz = [{ codigo: 6010, desc: 'Luminaria vial LED (provista por la Municipalidad)', un: 'Un.', cant: 1 }, { codigo: 5040, desc: 'PRENSACABLE 3/4"', un: 'Un.', cant: 1 }, { codigo: 1019, desc: 'CABLE SUBTERRANEO 3 X 1.5 MM 22 (PLAZA-MUNICIPALIDAD DE CBA)', un: 'm', cant: 5.5 }];
    d.db.catalogoProductos[6026] = { codigo: 6026, desc: 'Luminaria armada 7 m', un: 'Un.', sector: 'pañol', stock: 0, costo: 91150, minimo: 0, activo: true, armada: { v: 1, piezas: pz, ts: ahora - 864e5, por: 'pan@' + DOM, porNombre: 'Pablo Pañol', hist: [] }, editadoPor: 'pan@' + DOM, editadoTs: ahora - 864e5 };
    const c = { armado: true, armadoGrupo: 'ARt1', numero: 'AR-0001', fecha: dia(-1), usuario: 'pan@' + DOM, sector: 'alumbrado', plazaId: '', obraId: '', quienes: ['Juan Pérez'], armadoDe: { codigo: 6026, desc: 'Luminaria armada 7 m', cant: 4 } };
    pz.forEach((p, i) => { d.db.movimientos['ar' + i] = Object.assign({}, c, { tipo: 'salida', codigo: p.codigo, desc: p.desc, un: p.un, cantidad: p.cant * 4, destino: 'Armado AR-0001 · Luminaria armada 7 m (sigue en el pañol)', retiradoPor: 'Juan Pérez', ts: ahora - 864e5 + i }); });
    d.db.movimientos.ar9 = Object.assign({}, c, { tipo: 'entrada', codigo: 6026, desc: 'Luminaria armada 7 m', un: 'Un.', cantidad: 4, proveedor: '', remito: '', precioUnit: 91150, receta: pz.map((p) => Object.assign({ precio: 0 }, p)), ts: ahora - 864e5 + 9 });
  }
  return d;
}
module.exports = { datos168 };
