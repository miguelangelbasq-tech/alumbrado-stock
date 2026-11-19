// v173 · datos para t_v173: la orden por persona y por tiempo.
//  · PLAZA LOS ÁLAMOS (p1, Col 1–10; itemizado 5 × 10), PLAZA LAS ACACIAS (p2, Col 1–8).
//  · Nómina: Pablo Picone (Oficial), Pedro Gómez (Ayudante), Juan Pérez (Oficial), Mario Díaz (Oficial); usuarios de cuadrilla
//    Pablo, Pedro y Juan; Lucía (oficina).
//  · OT-2026-173 de hoy en LOS ÁLAMOS, Pablo y Pedro, 08:00–16:00, ya llegaron (seguridad y salida hechas):
//    «Armado de luminaria» 10 repartida Pablo 5 · Pedro 5 (sin columnas) y «Excavación de pozos» 10 repartida Pablo 5 · Pedro 5
//    con ot.columnas Col 1–10 (Pablo Col 1–5, Pedro Col 6–10). op.sinReparto: las dos tareas para toda la cuadrilla.
const { baseDatos, DOM } = require('./h');
function datos173(op = {}) {
  const d = baseDatos(), ahora = Date.now(), hoy = d.hoy;
  const ts = (dia, hm) => new Date(dia + 'T' + hm + ':00').getTime();
  Object.assign(d.cuentas, { ['lucia@' + DOM]: { pass: 'clave123', uid: 'uLucia' }, ['pablo@' + DOM]: { pass: 'clave123', uid: 'uPablo' }, ['mario@' + DOM]: { pass: 'clave123', uid: 'uMario' } });
  d.db.usuarios.uJuan = { email: 'juan@' + DOM, usuario: 'juan', nombre: 'Juan Pérez', rol: 'cuadrilla', persona: 'Juan Pérez', personaClave: 'juan perez', activo: true };
  d.db.usuarios.uPedro = { email: 'pedro@' + DOM, usuario: 'pedro', nombre: 'Pedro Gómez', rol: 'cuadrilla', persona: 'Pedro Gómez', personaClave: 'pedro gomez', activo: true };
  d.db.usuarios.uPablo = { email: 'pablo@' + DOM, usuario: 'pablo', nombre: 'Pablo Picone', rol: 'cuadrilla', persona: 'Pablo Picone', personaClave: 'pablo picone', activo: true };
  d.db.usuarios.uMario = { email: 'mario@' + DOM, usuario: 'mario', nombre: 'Mario Díaz', rol: 'cuadrilla', persona: 'Mario Díaz', personaClave: 'mario diaz', activo: true };
  d.db.usuarios.uLucia = { email: 'lucia@' + DOM, usuario: 'lucia', nombre: 'Lucía Fernández', rol: 'oficina', activo: true };
  d.db.configEquipo.personal = { lista: [{ nombre: 'Pablo Picone', rol: 'Oficial', activo: true }, { nombre: 'Pedro Gómez', rol: 'Ayudante', activo: true }, { nombre: 'Juan Pérez', rol: 'Oficial', activo: true }, { nombre: 'Mario Díaz', rol: 'Oficial', activo: true }],
    contactos: [{ nombre: 'Lucía Fernández', rol: 'oficina', tel: '0351 15 555 0202', email: 'lucia@' + DOM }] };
  const cols = (n) => Array.from({ length: n }, (_, i) => 'Col ' + (i + 1));
  d.db.avanceObras = {
    p1: { nombre: 'Plaza Los Álamos', plazaNombre: 'Plaza Los Álamos', obraId: '4031', direccion: 'Los Álamos y Pje. 12', barrio: 'B° Villa Rivera', tipo: 'plaza', lat: -31.4271, lng: -64.1889, creado: ahora, valorItems: [{ id: 1, itemPliego: '5', cantidad: 10, cantidadAvanzada: 0 }], puntos: cols(10) },
    p2: { nombre: 'Plaza Las Acacias', plazaNombre: 'Plaza Las Acacias', obraId: '4040', tipo: 'plaza', lat: -31.40, lng: -64.20, creado: ahora, valorItems: [{ id: 1, itemPliego: '5', cantidad: 8, cantidadAvanzada: 0 }], puntos: cols(8) }
  };
  const per = [{ nombre: 'Pablo Picone', rol: 'Oficial' }, { nombre: 'Pedro Gómez', rol: 'Ayudante' }], pn = ['pablo picone', 'pedro gomez'];
  const lleg = (n, c) => ({ ts: ts(hoy, '08:05'), por: n, lat: -31.4271, lng: -64.1889, acc: 8, dist: 10, enObra: true });
  const seg = (n) => ({ items: { casco: true, arnes: true, guantes: true, botines: true, conos: true, equipo: true }, ts: ts(hoy, '07:55'), ok: true, por: n });
  const rp = op.sinReparto ? {} : { armado_luminaria: [{ nombre: 'Pablo Picone', cant: 5 }, { nombre: 'Pedro Gómez', cant: 5 }], excavacion: [{ nombre: 'Pablo Picone', cant: 5 }, { nombre: 'Pedro Gómez', cant: 5 }] };
  d.db.ordenesTrabajo = {
    ot173: { numero: 'OT-2026-173', fecha: hoy, plazaId: 'p1', plazaNombre: 'Plaza Los Álamos', obraId: '4031', horaInicio: '08:00', horaFin: '16:00', cuadrilla: 'Pablo y Pedro', responsable: 'Pablo Picone', personal: per, personalNombres: pn,
      actividades: ['armado_luminaria', 'excavacion'], previsto: { armado_luminaria: 10, excavacion: 10 }, actividadesManuales: [], reparto: rp, columnas: { excavacion: cols(10) },
      supervisor: { uid: 'uLucia', email: 'lucia@' + DOM, nombre: 'Lucía Fernández' }, estado: 'Emitida', creado: ahora - 3600e3, ts: ahora - 3600e3, creadoPor: 'lucia@' + DOM,
      campo: { llegada: { 'pablo picone': lleg('Pablo Picone'), 'pedro gomez': lleg('Pedro Gómez') }, seguridad: { 'pablo picone': seg('Pablo Picone'), 'pedro gomez': seg('Pedro Gómez'), epp: true, baliza: true, herram: true, corte: 'no' }, salida: { 'pablo picone': { ts: ts(hoy, '07:50'), ok: true, por: 'Pablo Picone' }, 'pedro gomez': { ts: ts(hoy, '07:50'), ok: true, por: 'Pedro Gómez' } } } }
  };
  return d;
}
module.exports = { datos173 };
