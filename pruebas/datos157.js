// v157 · datos para t_v157: el tiempo de cada columna.
//  · PLAZA LOS ÁLAMOS (p1, Col 1–8): OT-2026-157 de hoy, Juan y Pedro, «Conexionado del tablerito en la columna» × 3,
//    llegaron 08:10 (Juan) con la seguridad y la salida hechas (Modo obra arranca en «Foto · Col N»).
//  · op.izaje: la misma orden con «Montaje de columna PRFV» × 3 · op.zanja: «Zanjeo troncal» 40 m (sin columnas).
//  · op.viejas: órdenes cerradas de días anteriores con la hora de cada columna (para 🧠 y la orden sugerida): tablerito
//    40/44/38/50/46 min con 2 personas (Juan y Pedro) y 30/34 con Lucas y Diego, una dudosa (2 min); y una orden vieja con la
//    hora de toda la tarea (08:00 a 10:00, 3 columnas) que sigue andando como un tramo.
const { baseDatos, DOM } = require('./h');
function datos157(op = {}) {
  const d = baseDatos(), ahora = Date.now(), hoy = d.hoy;
  const menos = (n) => { const x = new Date(hoy + 'T12:00:00'); x.setDate(x.getDate() - n); return x.toISOString().slice(0, 10); };
  const ts = (dia, hm) => new Date(dia + 'T' + hm + ':00').getTime();
  Object.assign(d.cuentas, { ['lucia@' + DOM]: { pass: 'clave123', uid: 'uLucia' } });
  d.db.usuarios.uJuan = { email: 'juan@' + DOM, usuario: 'juan', nombre: 'Juan Pérez', rol: 'cuadrilla', persona: 'Juan Pérez', personaClave: 'juan perez', activo: true };
  d.db.usuarios.uPedro = { email: 'pedro@' + DOM, usuario: 'pedro', nombre: 'Pedro Gómez', rol: 'cuadrilla', persona: 'Pedro Gómez', personaClave: 'pedro gomez', activo: true };
  d.db.usuarios.uLucia = { email: 'lucia@' + DOM, usuario: 'lucia', nombre: 'Lucía Fernández', rol: 'oficina', activo: true };
  d.db.configEquipo.personal = { lista: [{ nombre: 'Juan Pérez', rol: 'Oficial', activo: true }, { nombre: 'Pedro Gómez', rol: 'Ayudante', activo: true }, { nombre: 'Lucas Martínez', rol: 'Oficial', activo: true }, { nombre: 'Diego Ruiz', rol: 'Ayudante', activo: true }],
    contactos: [{ nombre: 'Lucía Fernández', rol: 'oficina', tel: '0351 15 555 0202', email: 'lucia@' + DOM }] };
  d.db.avanceObras = {
    p1: { nombre: 'Plaza Los Álamos', plazaNombre: 'Plaza Los Álamos', obraId: '4031', direccion: 'Los Álamos y Pje. 12', barrio: 'B° Villa Rivera', tipo: 'plaza', lat: -31.4271, lng: -64.1889, creado: ahora, valorItems: [{ id: 1, itemPliego: '5', cantidad: 8, cantidadAvanzada: 0 }], puntos: ['Col 1', 'Col 2', 'Col 3', 'Col 4', 'Col 5', 'Col 6', 'Col 7', 'Col 8'] },
    p2: { nombre: 'Plaza Las Acacias', plazaNombre: 'Plaza Las Acacias', obraId: '4040', tipo: 'plaza', lat: -31.40, lng: -64.20, creado: ahora, valorItems: [{ id: 1, itemPliego: '5', cantidad: 10, cantidadAvanzada: 10 }], puntos: ['Col 1', 'Col 2', 'Col 3', 'Col 4', 'Col 5', 'Col 6', 'Col 7', 'Col 8', 'Col 9', 'Col 10'] }
  };
  const per = [{ nombre: 'Juan Pérez', rol: 'Oficial' }, { nombre: 'Pedro Gómez', rol: 'Ayudante' }];
  const tarea = op.izaje ? 'montaje_prfv' : op.zanja ? 'zanjeo' : 'conexionado_tablerito', prev = op.zanja ? 40 : 3;
  const llegada = op.sinLlegue ? {} : { 'juan perez': { ts: ts(hoy, '08:10'), por: 'Juan Pérez', lat: -31.4271, lng: -64.1889, acc: 8, dist: 10, enObra: true } };
  const seg = { 'juan perez': { items: { casco: true, arnes: true, guantes: true, botines: true, conos: true, equipo: true }, ts: ts(hoy, '08:00'), ok: true, por: 'Juan Pérez' }, epp: true, baliza: true, herram: true, corte: 'no' };
  d.db.ordenesTrabajo = {
    ot157: { numero: 'OT-2026-157', fecha: hoy, plazaId: 'p1', plazaNombre: 'Plaza Los Álamos', obraId: '4031', horaInicio: '07:30', horaFin: '15:30', cuadrilla: 'Cuadrilla 1', responsable: 'Juan Pérez', personal: per, personalNombres: ['juan perez', 'pedro gomez'], actividades: [tarea], previsto: { [tarea]: prev }, actividadesManuales: [], supervisor: { uid: 'uLucia', email: 'lucia@' + DOM, nombre: 'Lucía Fernández' }, estado: 'Emitida', creado: ahora, creadoPor: 'admin@' + DOM,
      campo: op.limpio ? {} : { llegada, seguridad: seg, salida: { 'juan perez': { ts: ts(hoy, '07:50'), ok: true, por: 'Juan Pérez' } } } }
  };
  if (op.viejas) {
    const crew2 = [{ nombre: 'Lucas Martínez', rol: 'Oficial' }, { nombre: 'Diego Ruiz', rol: 'Ayudante' }];
    const cerr = (id, n, dia, gente, cols, extra) => {
      const P = {}; let t0 = ts(dia, '08:00');
      cols.forEach((m, i) => { const ini = t0, fin = t0 + m * 60000; const x = { num: 'Col ' + (i + 1), ini: new Date(ini).toTimeString().slice(0, 5), fin: new Date(fin).toTimeString().slice(0, 5), iniTs: ini, finTs: fin, min: m, estado: 'si', por: gente[0].nombre, ts: fin, fuente: 'foto', iniFuente: i ? 'anterior' : 'llegue', n: 1, v: 157, dudosa: m < 3, dudosaMot: m < 3 ? 'fotos seguidas: ' + m + ' min desde la columna anterior' : '' }; P['col ' + (i + 1)] = x; t0 = fin; });
      d.db.ordenesTrabajo[id] = Object.assign({ numero: n, fecha: dia, plazaId: 'p2', plazaNombre: 'Plaza Las Acacias', obraId: '4040', horaInicio: '07:30', personal: gente, personalNombres: gente.map((g) => g.nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')), actividades: ['conexionado_tablerito'], previsto: { conexionado_tablerito: cols.length }, estado: 'Terminada', creado: ahora - 864e5 * 5,
        campo: { pasosObra: { conexionado_tablerito: P } }, cierre: { cerradoTs: ts(dia, '17:00'), cantidades: { conexionado_tablerito: cols.length }, horas: 8 } }, extra || {});
    };
    cerr('otv1', 'OT-2026-140', menos(5), per, [40, 44, 2]);
    cerr('otv2', 'OT-2026-141', menos(4), per, [38, 50, 46]);
    cerr('otv3', 'OT-2026-142', menos(3), crew2, [30, 34]);
    d.db.ordenesTrabajo.otv4 = { numero: 'OT-2026-139', fecha: menos(6), plazaId: 'p2', plazaNombre: 'Plaza Las Acacias', obraId: '4040', personal: per, personalNombres: ['juan perez', 'pedro gomez'], actividades: ['conexionado_tablerito'], previsto: { conexionado_tablerito: 3 }, estado: 'Terminada', creado: ahora - 864e5 * 6,
      campo: { horasTarea: { conexionado_tablerito: { ini: '08:00', fin: '10:00', por: 'Juan Pérez', ts: ahora } } }, cierre: { cerradoTs: ahora - 864e5 * 6, cantidades: { conexionado_tablerito: 3 }, horas: 8 } };
  }
  return d;
}
module.exports = { datos157 };
