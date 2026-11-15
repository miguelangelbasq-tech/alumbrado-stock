// v155 · datos para t_v155 (rol Dirección y su Inicio), sobre datos150:
//  · Usuarios: Dirección (dir), solo mirar (mir), además de admin, Lucía (oficina), Juan (cuadrilla) y el pañol.
//  · LOS ÁLAMOS con Gantt que terminaba hace 10 días (atrasada); LAS ACACIAS con fecha estimada en 40 días; BULEVARES sin
//    fecha prevista. Hoy: OT-2026-130 (LOS ÁLAMOS, sin cerrar, la cuadrilla mandó el sellado de 3 con una foto de hoy) y
//    OT-2026-131 (LAS ACACIAS, cerrada hoy con 1 columna = 3,19 K). Ayer: OT-2026-125 cerrada (2 columnas en LAS ACACIAS).
//  · Una foto de hoy en fotosObra de LAS ACACIAS (la trae la consulta del Inicio). Un gasto en LOS ÁLAMOS.
//  · El contrato sin fecha de inicio (se usa la primera orden de la zona, «estimada»); la prueba la carga después.
const { DOM } = require('./h');
const { datos150 } = require('./datos150');
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAEUlEQVR4nGPQiOrBihiGlgQAR05DgXjxIegAAAAASUVORK5CYII=';
function datos155() {
  const d = datos150(), ahora = Date.now(), hoy = d.hoy, dia = d.dia, O = d.db.ordenesTrabajo, A = d.db.avanceObras, U = d.db.usuarios;
  Object.assign(d.cuentas, { ['dir@' + DOM]: { pass: 'clave123', uid: 'uDir' }, ['mir@' + DOM]: { pass: 'clave123', uid: 'uMir' } });
  U.uDir = { email: 'dir@' + DOM, usuario: 'dir', nombre: 'Roberto Directo', rol: 'direccion', activo: true };
  U.uMir = { email: 'mir@' + DOM, usuario: 'mir', nombre: 'Mirta Mira', rol: 'mirar', activo: true };
  A.p1.planGantt = [{ id: 'g1', tarea: 'Toda la obra', desde: dia(-30), hasta: dia(-10) }];
  A.p2.fechaEstimada = dia(40); A.p2.obraId = '4026';   // ID de la zona A (Este)
  A.p2.valorItems = [{ id: 1, itemPliego: '5', cantidad: 4, cantidadAvanzada: 1 }];   // hechas: 1 (la de hoy) ya está en el itemizado
  const per2 = [{ nombre: 'Marcos Ríos', rol: 'Oficial' }, { nombre: 'Ana Torres', rol: 'Ayudante' }], pn2 = ['marcos rios', 'ana torres'];
  const base = (numero, fecha, plaza, extra) => Object.assign({ numero, fecha, plazaId: plaza, plazaNombre: A[plaza].nombre, obraId: A[plaza].obraId, horaInicio: '07:30', horaFin: '15:30', cuadrilla: 'Marcos y Ana', responsable: 'Marcos Ríos', personal: per2, personalNombres: pn2, actividadesManuales: [], vehiculos: [{ id: 'vC', nombre: 'Grúa 3', patente: 'AC 456 EF' }], vehiculoId: 'vC', creado: ahora - 864e5, creadoPor: 'lucia@' + DOM }, extra);
  O.k131 = base('OT-2026-131', hoy, 'p2', { actividades: ['montaje_prfv'], previsto: { montaje_prfv: 1 }, estado: 'Terminada', cierre: { cerradoTs: ahora - 36e5, fecha: hoy, cantidades: { montaje_prfv: 1 }, horas: 8, avanceItems: [{ id: 5, delta: 1, k: 'montaje_prfv' }] } });
  O.k125 = base('OT-2026-125', d.ayer, 'p2', { actividades: ['montaje_prfv'], previsto: { montaje_prfv: 2 }, estado: 'Terminada', cierre: { cerradoTs: ahora - 20 * 36e5, fecha: d.ayer, cantidades: { montaje_prfv: 2 }, horas: 8, avanceItems: [{ id: 5, delta: 2, k: 'montaje_prfv' }] } });
  // la de hoy en LOS ÁLAMOS: la cuadrilla mandó el sellado de 3 (sin cerrar) con una foto
  const t0 = ahora - 9e5;
  O.h130.estado = 'En curso';
  O.h130.campo = Object.assign({}, O.h130.campo, {
    fotos: { fh1: { k: 'sellado_base', cat: 'columna', num: 'Col 1', por: 'Juan Pérez', ts: t0, mini: PNG, distObra: 10 } },
    marcas: { sellado_base: { k: 'sellado_base', hecho: true, cant: 3, por: 'Juan Pérez', ts: t0 } },
    tareaEnv: { sellado_base: { 'juan perez': { estado: 'si', ts: t0, por: 'Juan Pérez' } } },
    horasTarea: { sellado_base: { ini: '08:00', fin: '10:00', por: 'Juan Pérez', ts: t0 } }
  });
  d.db.fotosObra = { fo1: { plazaId: 'p2', plazaNombre: 'PLAZA LAS ACACIAS', fecha: hoy, cat: 'columna', num: 'Col 1', adjId: 'adjFo1', mini: PNG, por: 'Marcos Ríos', ts: ahora - 6e5 } };
  d.db.gastosObra = { gs1: { plazaId: 'p1', plazaNombre: 'PLAZA LOS ÁLAMOS', fecha: dia(-3), concepto: 'Hormigón', monto: 150000, categoria: 'material' } };
  d.db.configEquipo.precios = {};
  // reclamo de puntos: OT-2026-132 (ayer, BULEVARES, CERRADA): montaje 1 (Juan y Pedro, 2,5 c/u) y el sellado quedó en 0, pero Juan
  // mandó foto y «se hizo» del sellado de la Col 1 → Juan tiene razón
  const perJP = [{ nombre: 'Juan Pérez', rol: 'Oficial' }, { nombre: 'Pedro Gómez', rol: 'Ayudante' }];
  O.r132 = Object.assign(base('OT-2026-132', d.ayer, 'p3', { personal: perJP, personalNombres: ['juan perez', 'pedro gomez'], cuadrilla: 'Juan y Pedro', responsable: 'Juan Pérez', actividades: ['montaje_prfv', 'sellado_base'], previsto: { montaje_prfv: 1, sellado_base: 1 }, estado: 'Terminada',
    campo: { fotos: { sj1: { k: 'sellado_base', cat: 'columna', num: 'Col 1', por: 'Juan Pérez', ts: ahora - 26 * 36e5, mini: PNG, distObra: 8 } }, marcas: { sellado_base: { k: 'sellado_base', hecho: true, cant: 1, por: 'Juan Pérez', ts: ahora - 26 * 36e5 }, montaje_prfv: { k: 'montaje_prfv', hecho: true, cant: 1, por: 'Juan Pérez', ts: ahora - 26 * 36e5 } }, tareaEnv: { sellado_base: { 'juan perez': { estado: 'si', ts: ahora - 26 * 36e5, por: 'Juan Pérez' } } }, enviados: { 'juan perez': { ts: ahora - 25 * 36e5, nombre: 'Juan Pérez' } } },
    cierre: { cerradoTs: ahora - 22 * 36e5, fecha: d.ayer, cantidades: { montaje_prfv: 1, sellado_base: 0 }, horas: 8, horasPersona: { 'Juan Pérez': 8, 'Pedro Gómez': 8 }, horasPersonaV: 2, avanceItems: [],
      puntos: { total: 5, ts: ahora - 22 * 36e5, renglones: [{ k: 'montaje_prfv', tarea: 'Izaje de columnas PRFV', cant: 1, un: 'columna', ptsUnit: 5, pts: 5 }], porPersona: [{ nombre: 'Juan Pérez', rol: 'Oficial', pts: 2.5 }, { nombre: 'Pedro Gómez', rol: 'Ayudante', pts: 2.5 }] } } }));
  // un aviso de Pedro a la oficina (de ayer): la cuadrilla no puede leer los avisos de los demás
  d.db.avisosCuadrilla = { ac0: { uid: 'uPedro', email: 'pedro@' + DOM, nombre: 'Pedro Gómez', persona: 'Pedro Gómez', personaClave: 'pedro gomez', rol: 'cuadrilla', texto: 'Se rompió la pala', tipo: 'problema', otId: '', otNumero: '', obraId: 'p1', obraNombre: 'PLAZA LOS ÁLAMOS', fotoId: '', fotoMini: '', ts: ahora - 864e5, fecha: d.ayer, hora: '10:00', estado: 'nuevo', para: ['admin@' + DOM], porAsistente: true } };
  return d;
}
module.exports = { datos155, PNG };
