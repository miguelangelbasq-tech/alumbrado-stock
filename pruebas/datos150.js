// v150 · datos para t_v150 («Lo hecho, verificado»):
//  · PLAZA LOS ÁLAMOS (6 columnas): OT-2026-110 (hace 5 días, cerrada) izó Col 1 a 3 con foto; OT-2026-120 (ayer, mandada sin
//    cerrar) pidió izaje de 3: Juan hizo Col 4 y Col 5 con foto y hora y «no se hizo» Col 6 (faltó material); OT-2026-130 (hoy,
//    emitida) repite el izaje de 3 (+ sellado de 3).
//  · PLAZA LAS ACACIAS (4 columnas): OT-2026-121 (ayer) izaje de 2 «se hizo» sin detalle por columna ni foto.
//  · PLAZA BULEVARES (2 columnas): OT-2026-122 (ayer) Col 1 con foto sacada a 820 m (otra obra); OT-2026-141 (próximo día hábil)
//    pide izaje de 2 (repite Col 1).
const { baseDatos, DOM } = require('./h');
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAEUlEQVR4nGPQiOrBihiGlgQAR05DgXjxIegAAAAASUVORK5CYII=';
function datos150() {
  const d = baseDatos(), ahora = Date.now(), hoy = d.hoy;
  const dia = (n) => { const x = new Date(hoy + 'T12:00:00'); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
  const man = (() => { let x = dia(1); if (new Date(x + 'T12:00:00').getDay() === 0) x = dia(2); return x; })();
  const ayer = dia(-1);
  Object.assign(d.cuentas, { ['lucia@' + DOM]: { pass: 'clave123', uid: 'uLucia' }, ['pan@' + DOM]: { pass: 'clave123', uid: 'uPan' } });
  const U = d.db.usuarios;
  U.uJuan = { email: 'juan@' + DOM, usuario: 'juan', nombre: 'Juan Pérez', rol: 'cuadrilla', persona: 'Juan Pérez', personaClave: 'juan perez', activo: true };
  U.uPedro = { email: 'pedro@' + DOM, usuario: 'pedro', nombre: 'Pedro Gómez', rol: 'cuadrilla', persona: 'Pedro Gómez', personaClave: 'pedro gomez', activo: true };
  U.uLucia = { email: 'lucia@' + DOM, usuario: 'lucia', nombre: 'Lucía Fernández', rol: 'oficina', activo: true };
  U.uPan = { email: 'pan@' + DOM, usuario: 'pan', nombre: 'Pablo Pañol', rol: 'panol', activo: true };
  d.db.configEquipo.personal = {
    lista: [{ nombre: 'Juan Pérez', rol: 'Oficial', activo: true, vehiculoId: 'vG' }, { nombre: 'Pedro Gómez', rol: 'Ayudante', activo: true }, { nombre: 'Lucas Vera', rol: 'Oficial', activo: true, vehiculoId: 'vH' }, { nombre: 'Diego Luna', rol: 'Ayudante', activo: true }, { nombre: 'Marcos Ríos', rol: 'Oficial', activo: true, vehiculoId: 'vC' }, { nombre: 'Ana Torres', rol: 'Ayudante', activo: true }],
    vehiculos: [{ id: 'vG', nombre: 'Grúa 1', patente: 'AA 100 GR', tipo: 'grua', lugares: 2, activo: true }, { id: 'vH', nombre: 'Grúa 2', patente: 'AB 123 CD', tipo: 'grua', lugares: 2, activo: true }, { id: 'vC', nombre: 'Grúa 3', patente: 'AC 456 EF', tipo: 'grua', lugares: 2, activo: true }],
    contactos: [{ nombre: 'Lucía Fernández', rol: 'oficina', tel: '351 555-1234' }]
  };
  const col = (n) => Array.from({ length: n }, (_, i) => 'Col ' + (i + 1));
  d.db.avanceObras = {
    p1: { nombre: 'PLAZA LOS ÁLAMOS', plazaNombre: 'PLAZA LOS ÁLAMOS', obraId: '4031', direccion: 'Los Álamos y Pje. 12', barrio: 'Villa Rivera', tipo: 'plaza', lat: -31.4271, lng: -64.1889, creado: ahora, valorItems: [{ id: 1, itemPliego: '5', cantidad: 6, cantidadAvanzada: 0.75 }], puntos: col(6) },
    p2: { nombre: 'PLAZA LAS ACACIAS', plazaNombre: 'PLAZA LAS ACACIAS', obraId: '4072', direccion: 'Acacias 300', barrio: 'Alto Alberdi', tipo: 'plaza', lat: -31.4300, lng: -64.1800, creado: ahora, valorItems: [{ id: 1, itemPliego: '5', cantidad: 4, cantidadAvanzada: 0 }], puntos: col(4) },
    p3: { nombre: 'PLAZA BULEVARES', plazaNombre: 'PLAZA BULEVARES', obraId: '4045', direccion: 'Bv. San Juan 900', barrio: 'Centro', tipo: 'plaza', lat: -31.4000, lng: -64.2000, creado: ahora, valorItems: [{ id: 1, itemPliego: '5', cantidad: 2, cantidadAvanzada: 0 }], puntos: col(2) }
  };
  const per = [{ nombre: 'Juan Pérez', rol: 'Oficial' }, { nombre: 'Pedro Gómez', rol: 'Ayudante' }], pn = ['juan perez', 'pedro gomez'];
  const sup = { uid: 'uLucia', email: 'lucia@' + DOM, nombre: 'Lucía Fernández' };
  const base = (numero, fecha, plaza, extra) => Object.assign({ numero, fecha, plazaId: plaza, plazaNombre: d.db.avanceObras[plaza].nombre, obraId: d.db.avanceObras[plaza].obraId, horaInicio: '07:30', horaFin: '15:30', cuadrilla: 'Juan y Pedro', responsable: 'Juan Pérez', personal: per, personalNombres: pn, actividadesManuales: [], vehiculos: [{ id: 'vG', nombre: 'Grúa 1', patente: 'AA 100 GR' }], vehiculoId: 'vG', supervisor: sup, creado: ahora - 864e5, creadoPor: 'lucia@' + DOM }, extra);
  const foto = (k, num, ts, x) => Object.assign({ k, cat: 'columna', num, por: 'Juan Pérez', ts, mini: PNG }, x || {});
  const t1 = ahora - 864e5;
  d.db.ordenesTrabajo = {
    // pozos y bases de las tres plazas, hace 10 días (ya fraguaron)
    z101: base('OT-2026-101', dia(-10), 'p1', { actividades: ['excavacion', 'hormigonado'], previsto: { excavacion: 6, hormigonado: 6 }, estado: 'Terminada', cierre: { cerradoTs: ahora - 9 * 864e5, fecha: dia(-10), cantidades: { excavacion: 6, hormigonado: 6 }, horas: 8 } }),
    z102: base('OT-2026-102', dia(-10), 'p2', { actividades: ['excavacion', 'hormigonado'], previsto: { excavacion: 4, hormigonado: 4 }, estado: 'Terminada', cierre: { cerradoTs: ahora - 9 * 864e5, fecha: dia(-10), cantidades: { excavacion: 4, hormigonado: 4 }, horas: 8 } }),
    z103: base('OT-2026-103', dia(-9), 'p3', { actividades: ['excavacion', 'hormigonado'], previsto: { excavacion: 2, hormigonado: 2 }, estado: 'Terminada', cierre: { cerradoTs: ahora - 8 * 864e5, fecha: dia(-9), cantidades: { excavacion: 2, hormigonado: 2 }, horas: 8 } }),
    c110: base('OT-2026-110', dia(-5), 'p1', { actividades: ['montaje_prfv'], previsto: { montaje_prfv: 3 }, estado: 'Terminada', campo: { fotos: { g1: foto('montaje_prfv', 'Col 1', t1 * 1 - 4 * 864e5), g2: foto('montaje_prfv', 'Col 2', t1 - 4 * 864e5), g3: foto('montaje_prfv', 'Col 3', t1 - 4 * 864e5) } }, cierre: { cerradoTs: ahora - 4 * 864e5, fecha: dia(-5), cantidades: { montaje_prfv: 3 }, horas: 8, avanceItems: [{ id: 5, delta: 0.75, k: 'montaje_prfv' }] } }),
    a120: base('OT-2026-120', ayer, 'p1', { actividades: ['montaje_prfv'], previsto: { montaje_prfv: 3 }, estado: 'En curso',
      campo: {
        pasosObra: { montaje_prfv: { 'col 4': { num: 'Col 4', ini: '08:00', fin: '09:30', estado: 'si', por: 'Juan Pérez', ts: t1 + 1 }, 'col 5': { num: 'Col 5', ini: '09:40', fin: '11:00', estado: 'si', por: 'Juan Pérez', ts: t1 + 2 }, 'col 6': { num: 'Col 6', estado: 'no', motivo: 'material', por: 'Juan Pérez', ts: t1 + 3 } } },
        fotos: { f4: foto('montaje_prfv', 'Col 4', t1 + 1, { distObra: 12 }), f5: foto('montaje_prfv', 'Col 5', t1 + 2, { distObra: 18 }) },
        marcas: { montaje_prfv: { k: 'montaje_prfv', hecho: true, cant: 2, por: 'Juan Pérez', ts: t1 + 4 } },
        tareaEnv: { montaje_prfv: { 'juan perez': { estado: 'si', ts: t1 + 4, por: 'Juan Pérez' } } },
        horasTarea: { montaje_prfv: { ini: '08:00', fin: '11:00', por: 'Juan Pérez', ts: t1 + 4 } },
        enviados: { 'juan perez': { ts: t1 + 5, nombre: 'Juan Pérez' } }
      } }),
    h130: base('OT-2026-130', hoy, 'p1', { actividades: ['montaje_prfv', 'sellado_base'], previsto: { montaje_prfv: 3, sellado_base: 3 }, estado: 'Emitida', creado: ahora - 36e5, campo: { llegada: { 'juan perez': { ts: ahora - 18e5, lat: -31.4271, lng: -64.1889, enObra: true } } } }),
    b121: base('OT-2026-121', ayer, 'p2', { personal: [{ nombre: 'Marcos Ríos', rol: 'Oficial' }, { nombre: 'Ana Torres', rol: 'Ayudante' }], personalNombres: ['marcos rios', 'ana torres'], cuadrilla: 'Marcos y Ana', responsable: 'Marcos Ríos', actividades: ['montaje_prfv'], previsto: { montaje_prfv: 2 }, estado: 'En curso', campo: { marcas: { montaje_prfv: { k: 'montaje_prfv', hecho: true, cant: 2, por: 'Marcos Ríos', ts: t1 } }, tareaEnv: { montaje_prfv: { 'marcos rios': { estado: 'si', ts: t1, por: 'Marcos Ríos' } } }, enviados: { 'marcos rios': { ts: t1, nombre: 'Marcos Ríos' } } } }),
    d122: base('OT-2026-122', ayer, 'p3', { actividades: ['montaje_prfv'], previsto: { montaje_prfv: 1 }, estado: 'En curso', campo: { pasosObra: { montaje_prfv: { 'col 1': { num: 'Col 1', ini: '13:00', fin: '14:00', estado: 'si', por: 'Juan Pérez', ts: t1 } } }, fotos: { f9: foto('montaje_prfv', 'Col 1', t1, { distObra: 820 }) }, marcas: { montaje_prfv: { hecho: true, cant: 1, por: 'Juan Pérez', ts: t1 } }, tareaEnv: { montaje_prfv: { 'juan perez': { estado: 'si', ts: t1, por: 'Juan Pérez' } } }, enviados: { 'juan perez': { ts: t1, nombre: 'Juan Pérez' } } } }),
    m141: base('OT-2026-141', man, 'p3', { personal: [{ nombre: 'Lucas Vera', rol: 'Oficial' }, { nombre: 'Diego Luna', rol: 'Ayudante' }], personalNombres: ['lucas vera', 'diego luna'], cuadrilla: 'Lucas y Diego', responsable: 'Lucas Vera', vehiculos: [{ id: 'vH', nombre: 'Grúa 2', patente: 'AB 123 CD' }], vehiculoId: 'vH', actividades: ['montaje_prfv'], previsto: { montaje_prfv: 2 }, estado: 'Emitida', creado: ahora - 36e5 })
  };
  d.db.configEquipo.precios = {};
  d.man = man; d.ayer = ayer; d.dia = dia;
  return d;
}
module.exports = { datos150 };
