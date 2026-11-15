// v160 · datos para t_v160 (PDF y videos en la nube): sobre datos151 (San Pablo, Las Rosas, San Vicente, Del Sol; Lucía oficina,
// Mirta mirar, Raúl cuadrilla) + Roberto (Dirección) y Pancho (pañol); Las Rosas (q2) con sus columnas «Col 1…Col 3» y una orden de
// HOY para Raúl y Pedro (OT-2026-160, montaje PRFV × 3, emitida) para grabar el video desde Modo obra / Mis tareas.
const { DOM } = require('./h');
const { datos151 } = require('./datos151');
function datos160(op) {
  op = op || {};
  const d = datos151(), ahora = Date.now(), hoy = d.hoy;
  d.cuentas['dir@' + DOM] = { pass: 'clave123', uid: 'uDir' };
  d.cuentas['pan@' + DOM] = { pass: 'clave123', uid: 'uPan' };
  d.db.usuarios.uDir = { email: 'dir@' + DOM, usuario: 'dir', nombre: 'Roberto Dirección', rol: 'direccion', activo: true };
  d.db.usuarios.uPan = { email: 'pan@' + DOM, usuario: 'pan', nombre: 'Pancho Pañol', rol: 'panol', activo: true };
  d.db.avanceObras.q2.puntos = ['Col 1', 'Col 2', 'Col 3'];
  const per = [{ nombre: 'Raúl Díaz', rol: 'Oficial' }, { nombre: 'Pedro Gómez', rol: 'Ayudante' }];
  d.db.ordenesTrabajo.o160 = { numero: 'OT-2026-160', fecha: hoy, plazaId: 'q2', plazaNombre: 'PLAZA LAS ROSAS', obraId: '4102', horaInicio: '07:30', horaFin: '15:30', cuadrilla: 'Raúl y Pedro', responsable: 'Raúl Díaz', personal: per, personalNombres: ['raul diaz', 'pedro gomez'], actividades: ['montaje_prfv'], previsto: { montaje_prfv: 3 }, actividadesManuales: [], estado: 'Emitida', creado: ahora - 3600e3, creadoPor: 'lucia@' + DOM, campo: {} };
  if (op.conVideo) {   // un video ya subido de Las Rosas (Col 3)
    d.db.fotosObra = d.db.fotosObra || {};
    d.db.fotosObra.vid1 = { tipo: 'video', adjId: 'vid1', plazaId: 'q2', plazaNombre: 'PLAZA LAS ROSAS', mini: '', dur: 12, bytes: 1500000, por: 'Lucía Fernández', ts: ahora - 3600e3, fecha: hoy, num: 'Col 3', cat: 'otra' };
    d.db.adjuntos.vid1 = { tipo: 'video', r2: 'videos/2026/11/q2/vid1.webm', plazaId: 'q2', plazaNombre: 'PLAZA LAS ROSAS', mime: 'video/webm', bytes: 1500000, dur: 12, num: 'Col 3', ts: ahora - 3600e3, por: 'Lucía Fernández' };
  }
  return d;
}
module.exports = { datos160 };
