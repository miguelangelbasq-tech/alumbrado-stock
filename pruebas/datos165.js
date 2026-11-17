// v165 · datos para t_v165: «Voy a iniciar esta tarea», cámara C, otra tarea, récords y columnas en la orden.
//  · PLAZA LOS ÁLAMOS (p1, Col 1–8; itemizado 5 × 8: la lista del avance nuevo): OT-2026-165 de hoy, Juan y Pedro, llegaron 08:10
//    con la seguridad y la salida: «Excavación de pozo» Col 6, 7 y 8 (salteando la 5), «Montaje (izaje) de columna PRFV» Col 2 y 3 y «Zanjeo» 10 m
//    (ot.columnas; op.sinColumnas: sin). Col 1–3 con pozo y hormigón (hace 5 días), Col 1 izada (OT-2026-150); Col 4 con pozo y
//    hormigonada ayer (fraguando).
//  · Órdenes viejas cerradas en LAS ACACIAS (p2), de a 2 (Juan y Pedro), con la hora y la foto de cada columna:
//    excavación 30, 32, 35 y 31 min; izaje 50, 48, 55 min (tarea de riesgo: sin récord); zanja 10 m en 40, 38, 45 min (sin columnas).
//  · op.sinViejas: sin esas órdenes (no hay con qué comparar).
const { baseDatos, DOM } = require('./h');
function datos165(op = {}) {
  const d = baseDatos(), ahora = Date.now(), hoy = d.hoy;
  const menos = (n) => { const x = new Date(hoy + 'T12:00:00'); x.setDate(x.getDate() - n); return x.toISOString().slice(0, 10); };
  const ts = (dia, hm) => new Date(dia + 'T' + hm + ':00').getTime();
  const hm = (t) => new Date(t).toTimeString().slice(0, 5);
  Object.assign(d.cuentas, { ['lucia@' + DOM]: { pass: 'clave123', uid: 'uLucia' } });
  d.db.usuarios.uJuan = { email: 'juan@' + DOM, usuario: 'juan', nombre: 'Juan Pérez', rol: 'cuadrilla', persona: 'Juan Pérez', personaClave: 'juan perez', activo: true };
  d.db.usuarios.uPedro = { email: 'pedro@' + DOM, usuario: 'pedro', nombre: 'Pedro Gómez', rol: 'cuadrilla', persona: 'Pedro Gómez', personaClave: 'pedro gomez', activo: true };
  d.db.usuarios.uLucia = { email: 'lucia@' + DOM, usuario: 'lucia', nombre: 'Lucía Fernández', rol: 'oficina', activo: true };
  d.db.configEquipo.personal = { lista: [{ nombre: 'Juan Pérez', rol: 'Oficial', activo: true }, { nombre: 'Pedro Gómez', rol: 'Ayudante', activo: true }],
    contactos: [{ nombre: 'Lucía Fernández', rol: 'oficina', tel: '0351 15 555 0202', email: 'lucia@' + DOM }] };
  const cols = (n) => Array.from({ length: n }, (_, i) => 'Col ' + (i + 1));
  d.db.avanceObras = {
    p1: { nombre: 'Plaza Los Álamos', plazaNombre: 'Plaza Los Álamos', obraId: '4031', direccion: 'Los Álamos y Pje. 12', barrio: 'B° Villa Rivera', tipo: 'plaza', lat: -31.4271, lng: -64.1889, creado: ahora, valorItems: [{ id: 1, itemPliego: '5', cantidad: 8, cantidadAvanzada: 0 }, { id: 2, itemPliego: '81', cantidad: 3, cantidadAvanzada: 0 }], puntos: cols(8) },
    p2: { nombre: 'Plaza Las Acacias', plazaNombre: 'Plaza Las Acacias', obraId: '4040', tipo: 'plaza', lat: -31.40, lng: -64.20, creado: ahora, valorItems: [{ id: 1, itemPliego: '5', cantidad: 12, cantidadAvanzada: 0 }], puntos: cols(12) }
  };
  const per = [{ nombre: 'Juan Pérez', rol: 'Oficial' }, { nombre: 'Pedro Gómez', rol: 'Ayudante' }], pn = ['juan perez', 'pedro gomez'];
  const llegada = { 'juan perez': { ts: ts(hoy, '08:10'), por: 'Juan Pérez', lat: -31.4271, lng: -64.1889, acc: 8, dist: 10, enObra: true }, 'pedro gomez': { ts: ts(hoy, '08:11'), por: 'Pedro Gómez', lat: -31.4271, lng: -64.1889, acc: 8, dist: 10, enObra: true } };
  const seg = { 'juan perez': { items: { casco: true, arnes: true, guantes: true, botines: true, conos: true, equipo: true }, ts: ts(hoy, '08:00'), ok: true, por: 'Juan Pérez' }, epp: true, baliza: true, herram: true, corte: 'no' };
  const segP = { items: { casco: true, arnes: true, guantes: true, botines: true, conos: true, equipo: true }, ts: ts(hoy, '08:00'), ok: true, por: 'Pedro Gómez' };
  const tareas = op.tareas || ['excavacion', 'montaje_prfv', 'zanjeo'], prev = { excavacion: 3, montaje_prfv: 2, zanjeo: 10, conexionado_tablerito: 3 };
  const P = {}; tareas.forEach((k) => { P[k] = prev[k] || 1; });
  d.db.ordenesTrabajo = {
    ot165: { numero: 'OT-2026-165', fecha: hoy, plazaId: 'p1', plazaNombre: 'Plaza Los Álamos', obraId: '4031', horaInicio: '07:30', horaFin: '15:30', cuadrilla: 'Cuadrilla 1', responsable: 'Juan Pérez', personal: per, personalNombres: pn, actividades: tareas, previsto: P, actividadesManuales: [], supervisor: { uid: 'uLucia', email: 'lucia@' + DOM, nombre: 'Lucía Fernández' }, estado: 'Emitida', creado: ahora - 3600e3, ts: ahora - 3600e3, creadoPor: 'lucia@' + DOM,
      columnas: { excavacion: ['Col 6', 'Col 7', 'Col 8'], montaje_prfv: ['Col 2', 'Col 3'] },
      campo: { llegada, seguridad: Object.assign({}, seg, { 'pedro gomez': segP }), salida: { 'juan perez': { ts: ts(hoy, '07:50'), ok: true, por: 'Juan Pérez' }, 'pedro gomez': { ts: ts(hoy, '07:50'), ok: true, por: 'Pedro Gómez' } } } }
  };
  if (op.sinColumnas) delete d.db.ordenesTrabajo.ot165.columnas;
  // lo hecho en LOS ÁLAMOS (Col 1–3 completas hasta el izaje; Col 4 hormigonada ayer: fragua hasta mañana)
  const cerrPrev = (id, n, dia, k, nums, plaza) => {
    const PO = {}, F = {}; let t0 = ts(dia, '08:00');
    nums.forEach((x, i) => { const ini = t0, fin = t0 + 30 * 60000; PO[x.toLowerCase().replace(/ /g, ' ')] = { num: x, ini: hm(ini), fin: hm(fin), iniTs: ini, finTs: fin, min: 30, estado: 'si', por: 'Juan Pérez', ts: fin, fuente: 'foto', iniFuente: i ? 'anterior' : 'llegue', n: 1, v: 157 }; F['f' + id + i] = { por: 'Juan Pérez', ts: fin, k, tarea: k, cat: 'columna', num: x, mini: '' }; t0 = fin; });
    d.db.ordenesTrabajo[id] = { numero: n, fecha: dia, plazaId: plaza || 'p1', plazaNombre: plaza === 'p2' ? 'Plaza Las Acacias' : 'Plaza Los Álamos', obraId: plaza === 'p2' ? '4040' : '4031', horaInicio: '07:30', personal: per, personalNombres: pn, actividades: [k], previsto: { [k]: nums.length }, estado: 'Terminada', creado: ts(dia, '07:00'),
      campo: { pasosObra: { [k]: PO }, fotos: F }, cierre: { cerradoTs: ts(dia, '17:00'), cantidades: { [k]: nums.length }, horas: 8 } };
  };
  cerrPrev('otA1', 'OT-2026-148', menos(6), 'excavacion', ['Col 1', 'Col 2', 'Col 3']);
  cerrPrev('otA2', 'OT-2026-149', menos(5), 'hormigonado', ['Col 1', 'Col 2', 'Col 3']);
  cerrPrev('otA3', 'OT-2026-150', menos(2), 'montaje_prfv', ['Col 1']);
  cerrPrev('otA4', 'OT-2026-151', menos(3), 'excavacion', ['Col 4']);
  // Col 4 hormigonada ayer a la tarde (fragua 72 h)
  d.db.ordenesTrabajo.otA5 = { numero: 'OT-2026-152', fecha: menos(1), plazaId: 'p1', plazaNombre: 'Plaza Los Álamos', obraId: '4031', personal: per, personalNombres: pn, actividades: ['hormigonado'], previsto: { hormigonado: 1 }, estado: 'Terminada', creado: ts(menos(1), '07:00'),
    campo: { pasosObra: { hormigonado: { 'col 4': { num: 'Col 4', ini: '15:00', fin: '15:40', iniTs: ts(menos(1), '15:00'), finTs: ts(menos(1), '15:40'), min: 40, estado: 'si', por: 'Juan Pérez', ts: ts(menos(1), '15:40'), fuente: 'foto', v: 157 } } }, fotos: { fA5: { por: 'Juan Pérez', ts: ts(menos(1), '15:40'), k: 'hormigonado', cat: 'columna', num: 'Col 4', mini: '' } } },
    cierre: { cerradoTs: ts(menos(1), '17:00'), cantidades: { hormigonado: 1 }, horas: 8 } };
  if (!op.sinViejas) {
    // los tiempos de antes en LAS ACACIAS (de a 2)
    const vieja = (id, n, dia, k, mins, startCol) => {
      const PO = {}, F = {}; let t0 = ts(dia, '08:00');
      mins.forEach((m, i) => { const x = 'Col ' + (startCol + i), ini = t0, fin = t0 + m * 60000; PO['col ' + (startCol + i)] = { num: x, ini: hm(ini), fin: hm(fin), iniTs: ini, finTs: fin, min: m, estado: 'si', por: 'Juan Pérez', ts: fin, fuente: 'foto', iniFuente: i ? 'anterior' : 'llegue', n: 1, v: 157 }; F[id + 'f' + i] = { por: 'Juan Pérez', ts: fin, k, tarea: k, cat: 'columna', num: x, mini: '' }; t0 = fin; });
      d.db.ordenesTrabajo[id] = { numero: n, fecha: dia, plazaId: 'p2', plazaNombre: 'Plaza Las Acacias', obraId: '4040', horaInicio: '07:30', personal: per, personalNombres: pn, actividades: [k], previsto: { [k]: mins.length }, estado: 'Terminada', creado: ts(dia, '07:00'),
        campo: { pasosObra: { [k]: PO }, fotos: F }, cierre: { cerradoTs: ts(dia, '17:00'), cantidades: { [k]: mins.length }, horas: 8 } };
    };
    vieja('otV1', 'OT-2026-130', menos(12), 'excavacion', [30, 32], 1);
    vieja('otV2', 'OT-2026-131', menos(11), 'excavacion', [35, 31], 3);
    vieja('otV3', 'OT-2026-132', menos(10), 'montaje_prfv', [50, 48, 55], 1);
    // zanja (sin columnas): 10 m en 40, 38 y 45 min, con su foto
    const zanja = (id, n, dia, min) => {
      d.db.ordenesTrabajo[id] = { numero: n, fecha: dia, plazaId: 'p2', plazaNombre: 'Plaza Las Acacias', obraId: '4040', horaInicio: '07:30', personal: per, personalNombres: pn, actividades: ['zanjeo'], previsto: { zanjeo: 10 }, estado: 'Terminada', creado: ts(dia, '07:00'),
        campo: { horasTarea: { zanjeo: { ini: '09:00', fin: hm(ts(dia, '09:00') + min * 60000), por: 'Juan Pérez', ts: ts(dia, '10:00') } }, fotos: { [id + 'z']: { por: 'Juan Pérez', ts: ts(dia, '10:00'), k: 'zanjeo', cat: 'zanja', num: '', mini: '' } }, marcas: { zanjeo: { hecho: true, cant: 10 } } },
        cierre: { cerradoTs: ts(dia, '17:00'), cantidades: { zanjeo: 10 }, horas: 8 } };
    };
    zanja('otZ1', 'OT-2026-133', menos(9), 40); zanja('otZ2', 'OT-2026-134', menos(8), 38); zanja('otZ3', 'OT-2026-135', menos(7), 45);
  }
  return d;
}
module.exports = { datos165 };
