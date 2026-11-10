// v144 · datos para t_v144: obras con ubicación (Bulevares, San Pablo, Las Acacias, Los Álamos), una sin ubicación y un barrio;
// Juan (cuadrilla) con orden hoy en Bulevares (la sigue Lucía) y mañana en Las Acacias; una foto vieja de Los Álamos sacada en Las Acacias.
const { baseDatos, DOM } = require('./h');
const P = { bul: [-31.4000, -64.2000], sp: [-31.4180, -64.2000], aca: [-31.4300, -64.1800], ala: [-31.4330, -64.1800] };
function datos144() {
  const d = baseDatos(), ahora = Date.now(), hoy = d.hoy;
  const mas = (n) => { const x = new Date(hoy + 'T12:00:00'); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
  Object.assign(d.cuentas, { ['lucia@' + DOM]: { pass: 'clave123', uid: 'uLucia' } });
  d.db.usuarios.uJuan = { email: 'juan@' + DOM, usuario: 'juan', nombre: 'Juan Pérez', rol: 'cuadrilla', persona: 'Juan Pérez', personaClave: 'juan perez', activo: true };
  d.db.usuarios.uPedro = { email: 'pedro@' + DOM, usuario: 'pedro', nombre: 'Pedro Gómez', rol: 'cuadrilla', persona: 'Pedro Gómez', personaClave: 'pedro gomez', activo: true };
  d.db.usuarios.uLucia = { email: 'lucia@' + DOM, usuario: 'lucia', nombre: 'Lucía Fernández', rol: 'oficina', activo: true };
  d.db.configEquipo.personal = { lista: [{ nombre: 'Juan Pérez', rol: 'Oficial', activo: true }, { nombre: 'Pedro Gómez', rol: 'Ayudante', activo: true }] };
  const cols = ['Col 1', 'Col 2', 'Col 3', 'Col 4', 'Col 5', 'Col 6', 'Col 7', 'Col 8'];
  d.db.avanceObras = {
    p1: { nombre: 'Plaza Bulevares', obraId: '4045', barrio: 'B° Bulevares', tipo: 'plaza', lat: P.bul[0], lng: P.bul[1], creado: ahora, puntos: cols, valorItems: [{ id: 1, itemPliego: '5', cantidad: 8, cantidadAvanzada: 4 }] },
    p2: { nombre: 'Plaza San Pablo', obraId: '7620', barrio: 'B° San Pablo', tipo: 'plaza', lat: P.sp[0], lng: P.sp[1], creado: ahora },
    p3: { nombre: 'Plaza Las Acacias', obraId: '5910', barrio: 'B° Bella Vista', tipo: 'plaza', lat: P.aca[0], lng: P.aca[1], creado: ahora, valorItems: [{ id: 1, itemPliego: '5', cantidad: 8, cantidadAvanzada: 8 }] },
    p4: { nombre: 'Plaza Los Álamos', obraId: '7662', barrio: 'B° Ciudad de mis Sueños', tipo: 'plaza', lat: P.ala[0], lng: P.ala[1], creado: ahora, valorItems: [{ id: 1, itemPliego: '1', cantidad: 4, cantidadAvanzada: 2 }] },
    p5: { nombre: 'Plaza Sin Pin', obraId: '9154', barrio: 'B° Yofre H', tipo: 'plaza', creado: ahora },
    p6: { nombre: 'Barrio Ampliación', obraId: '4045', tipo: 'barrio', lat: -31.45, lng: -64.25, creado: ahora, valorItems: [{ id: 1, itemPliego: '5', cantidad: 8, cantidadAvanzada: 8 }] }
  };
  const per = [{ nombre: 'Juan Pérez', rol: 'Oficial' }, { nombre: 'Pedro Gómez', rol: 'Ayudante' }];
  d.db.ordenesTrabajo = {
    ot1: { numero: 'OT-2026-203', fecha: hoy, plazaId: 'p1', plazaNombre: 'Plaza Bulevares', obraId: '4045', horaInicio: '07:30', horaFin: '15:30', cuadrilla: 'Cuadrilla 1', responsable: 'Juan Pérez', personal: per, personalNombres: ['juan perez', 'pedro gomez'], actividades: ['montaje_prfv'], previsto: { montaje_prfv: 4 }, actividadesManuales: [], supervisor: { uid: 'uLucia', email: 'lucia@' + DOM, nombre: 'Lucía Fernández' }, estado: 'Emitida', creado: ahora },
    ot2: { numero: 'OT-2026-204', fecha: mas(1), plazaId: 'p3', plazaNombre: 'Plaza Las Acacias', obraId: '5910', horaInicio: '07:30', cuadrilla: 'Cuadrilla 1', personal: per, personalNombres: ['juan perez', 'pedro gomez'], actividades: ['montaje_prfv'], previsto: { montaje_prfv: 2 }, actividadesManuales: [], estado: 'Emitida', creado: ahora }
  };
  d.db.fotosObra = { fv1: { plazaId: 'p4', plazaNombre: 'Plaza Los Álamos', otId: '', cat: 'columna', num: 'Col 2', lat: P.aca[0] + 0.0002, lng: P.aca[1], gpsPrec: 6, por: 'Pedro Gómez', ts: ahora - 864e5, fecha: mas(-1), mini: '' } };
  d.db.configEquipo.precios = {};
  return d;
}
module.exports = { datos144, P };
