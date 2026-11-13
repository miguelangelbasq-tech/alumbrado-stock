// v152 · datos para t_v152 (mover fotos), sobre datos150:
//  · LOS ÁLAMOS (p1): OT-2026-120 (ayer, mandada sin cerrar) izaje de 3: Juan hizo Col 4 y Col 5 (pasos de Modo obra con la
//    hora) y sacó DOS fotos «Col 5» (f5 y f5b: la segunda era en realidad la Col 6) → la verificación dice 2 de 3.
//    Una foto suelta del legajo «Zanja» (z1, sin orden). OT-2026-130 (hoy, emitida) con una foto de Juan «Col 1» (hf1).
//  · LAS ACACIAS (p2): OT-2026-121 (ayer, Marcos y Ana). · BULEVARES (p3): OT-2026-122 (ayer) con la foto f9 sacada a 820 m.
//  · «Fotos sin obra»: s1 y s2 de Juan (hoy).
//  · Fichas fotosObra y adjuntos de todas (con imagen chica), Mirta (solo mirar).
const { DOM } = require('./h');
const { datos150 } = require('./datos150');
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAEUlEQVR4nGPQiOrBihiGlgQAR05DgXjxIegAAAAASUVORK5CYII=';
const PNG2 = PNG;   // misma imagen chica
function datos152() {
  const d = datos150(), ahora = Date.now(), t1 = ahora - 864e5, hoy = d.hoy, ayer = d.ayer;
  const a = d.db.ordenesTrabajo.a120;
  a.campo.pasosObra = { montaje_prfv: { 'col 4': { num: 'Col 4', ini: '08:00', fin: '09:30', estado: 'si', por: 'Juan Pérez', ts: t1 + 1 }, 'col 5': { num: 'Col 5', ini: '09:40', fin: '11:00', estado: 'si', por: 'Juan Pérez', ts: t1 + 2 } } };
  a.campo.fotos.f5b = { k: 'montaje_prfv', tarea: 'Montaje de columna PRFV', cat: 'columna', num: 'Col 5', por: 'Juan Pérez', ts: t1 + 3, mini: PNG2, distObra: 15 };
  a.campo.marcas.montaje_prfv.cant = 3;
  const h = d.db.ordenesTrabajo.h130, tsH = ahora - 9e5;
  h.campo.fotos = { hf1: { k: 'montaje_prfv', tarea: 'Montaje de columna PRFV', cat: 'columna', num: 'Col 1', por: 'Juan Pérez', ts: tsH, mini: PNG } };
  const ficha = (adj, plaza, ot, x) => Object.assign({ adjId: adj, plazaId: plaza, plazaNombre: plaza === '__sinObra' ? 'Fotos sin obra' : d.db.avanceObras[plaza].nombre, otId: ot ? ot : '', otNumero: ot ? d.db.ordenesTrabajo[ot].numero : '', k: '', tarea: '', cat: 'columna', num: '', mini: PNG, por: 'Juan Pérez', usuario: 'juan@' + DOM, origen: 'cuadrilla' }, x);
  d.db.fotosObra = {
    fo4: ficha('f4', 'p1', 'a120', { k: 'montaje_prfv', tarea: 'Montaje de columna PRFV', num: 'Col 4', ts: t1 + 1, fecha: ayer, lat: -31.4271, lng: -64.1889 }),
    fo5: ficha('f5', 'p1', 'a120', { k: 'montaje_prfv', tarea: 'Montaje de columna PRFV', num: 'Col 5', ts: t1 + 2, fecha: ayer, lat: -31.4271, lng: -64.1889 }),
    fo5b: ficha('f5b', 'p1', 'a120', { k: 'montaje_prfv', tarea: 'Montaje de columna PRFV', num: 'Col 5', ts: t1 + 3, fecha: ayer, mini: PNG2, lat: -31.4271, lng: -64.1889 }),
    fo9: ficha('f9', 'p3', 'd122', { k: 'montaje_prfv', tarea: 'Montaje de columna PRFV', num: 'Col 1', ts: t1, fecha: ayer, lat: -31.4271, lng: -64.1889, distObra: 820 }),
    foz: ficha('z1', 'p1', '', { cat: 'zanja', num: '', ts: ahora - 2 * 864e5, fecha: d.dia(-2), por: 'Lucía Fernández', origen: 'legajo' }),
    foh: ficha('hf1', 'p1', 'h130', { k: 'montaje_prfv', tarea: 'Montaje de columna PRFV', num: 'Col 1', ts: tsH, fecha: hoy }),
    fs1: ficha('s1', '__sinObra', '', { cat: 'otra', ts: ahora - 36e5, fecha: hoy, lat: -31.5, lng: -64.3 }),
    fs2: ficha('s2', '__sinObra', '', { cat: 'otra', ts: ahora - 35e5, fecha: hoy })
  };
  d.db.adjuntos = {};
  Object.values(d.db.fotosObra).forEach((f) => { d.db.adjuntos[f.adjId] = { tipo: 'obra', plazaId: f.plazaId, plazaNombre: f.plazaNombre, otId: f.otId, cat: f.cat, num: f.num, dataUrl: f.mini, w: 8, h: 8, bytes: 80, ts: f.ts, usuario: f.usuario }; });
  d.db.usuarios.uMir = { email: 'mirta@' + DOM, usuario: 'mirta', nombre: 'Mirta Mira', rol: 'mirar', activo: true };
  d.cuentas['mirta@' + DOM] = { pass: 'clave123', uid: 'uMir' };
  return d;
}
module.exports = { datos152 };
