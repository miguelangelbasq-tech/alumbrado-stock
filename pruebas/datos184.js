// v184 · datos para t_v184 (chat interno), sobre datos155:
//  · Usuarios: admin (Ana), Lucía (oficina), Juan y Pedro (cuadrilla), Dirección (dir), solo mirar (mir), pañol (pan).
//  · Juan tiene hoy la OT-2026-130 abierta (LOS ÁLAMOS: izaje y sellado; sin zanja) y la OT-2026-110 cerrada hace 5 días
//    (izaje de 3, con Pedro). Marcos tiene la OT-2026-121 (no es de Juan: no tiene que llegarle al asistente de Juan).
//  · op.hab = Juan ya habilitado en el chat (configEquipo/chat).
const { DOM } = require('./h');
const { datos155 } = require('./datos155');
function datos184(op) {
  op = op || {};
  const d = datos155();
  if (op.hab) d.db.configEquipo.chat = { habilitados: { uJuan: { por: 'admin@' + DOM, ts: Date.now() - 864e5, nombre: 'Juan Pérez', email: 'juan@' + DOM, rol: 'cuadrilla' } } };
  return d;
}
module.exports = { datos184 };
