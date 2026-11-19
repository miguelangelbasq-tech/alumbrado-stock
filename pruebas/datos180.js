// v180 · datos para t_v180 (unir / mover / eliminar carpetas de obra), sobre datos152:
//  · PLAZA LOS ÁLAMOS (p1, la buena: ID 4031, órdenes 101/110/120/130, fotos, avance a mano con el pozo de la Col 1 «no»).
//  · PLAZA LOS ALAMOS (p1b, la REPETIDA: mismo ID 4031, pin a ~20 m) con: OT-2026-150 cerrada (dio 2 del ítem 5 al itemizado,
//    con una foto «Col 3» y un video), OT-2026-151 emitida (foto «Col 4», reserva R-0101 de esa orden), una foto suelta de zanja,
//    un PDF, el vale S-0101 y la devolución D-0101, un cálculo, un gasto, un plano, un punto del mapa, un avance de etapa, una
//    tarea de la planificación, un relevamiento del Proyectista, un aviso de la cuadrilla, itemizado (ítem 5: 2 hechas, ítem 13:
//    1 hecha), avance de obra a mano (pozo Col 1 «si» —choca—, pozo Col 2 «si»), planilla de PAT cargada y avanceHist.
//  · PLAZA VACÍA (p9): nada adentro (se puede eliminar).
//  · Usuarios: Ana admin, Lucía oficina, Roberto Dirección, Pablo pañol, Mirta mirar, Juan cuadrilla.
const { DOM } = require('./h');
const { datos152 } = require('./datos152');
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAEUlEQVR4nGPQiOrBihiGlgQAR05DgXjxIegAAAAASUVORK5CYII=';
function datos180() {
  const d = datos152(), ahora = Date.now(), hoy = d.hoy, ayer = d.ayer, db = d.db;
  const A = db.avanceObras;
  A.p1.av2 = { v: 1, m: { 'c_pozo_COL 1': { e: 'no', ts: ahora - 5e6, por: 'lucia@' + DOM, porNombre: 'Lucía', motivo: 'se rehace' } }, hist: [] };
  A.p1b = { nombre: 'PLAZA LOS ALAMOS', plazaNombre: 'PLAZA LOS ALAMOS', obraId: '4031', direccion: 'Los Alamos y Pje 12', barrio: 'Villa Rivera', tipo: 'plaza', lat: -31.42725, lng: -64.18875, creado: ahora + 1000,
    valorItems: [{ id: 7, itemPliego: '5', cantidad: 6, cantidadAvanzada: 2 }, { id: 8, itemPliego: '13', cantidad: 1, cantidadAvanzada: 1 }],
    av2: { v: 1, m: { 'c_pozo_COL 1': { e: 'si', ts: ahora - 4e6, por: 'admin@' + DOM, porNombre: 'Ana', motivo: 'ya estaba' }, 'c_pozo_COL 2': { e: 'si', ts: ahora - 4e6, por: 'admin@' + DOM, porNombre: 'Ana', motivo: 'ya estaba' } }, hist: [{ ts: ahora - 4e6, por: 'admin@' + DOM, motivo: 'ya estaba', cambios: [] }] },
    documentos: { pat: { ok: true, fecha: ayer, papel: true, nota: 'carpeta de la oficina', por: 'lucia@' + DOM, porNombre: 'Lucía', ts: ahora - 3e6 } },
    avanceHist: [{ item: '13', antes: 0, despues: 1, motivo: 'apoyo hecho', por: 'lucia@' + DOM, porNombre: 'Lucía', ts: ahora - 3e6, tipo: 'aMano' }],
    carpetaEpec: '2026-11-02', puntos: ['Col 1', 'Col 2', 'Col 3', 'Col 4']
  };
  A.p9 = { nombre: 'PLAZA VACÍA', plazaNombre: 'PLAZA VACÍA', obraId: '', barrio: 'Centro', tipo: 'plaza', creado: ahora, lat: -31.3, lng: -64.3 };
  const per = [{ nombre: 'Juan Pérez', rol: 'Oficial' }, { nombre: 'Pedro Gómez', rol: 'Ayudante' }], pn = ['juan perez', 'pedro gomez'];
  const ot = (numero, fecha, extra) => Object.assign({ numero, fecha, plazaId: 'p1b', plazaNombre: 'PLAZA LOS ALAMOS', obraId: '4031', barrio: 'Villa Rivera', horaInicio: '07:30', horaFin: '15:30', cuadrilla: 'Juan y Pedro', responsable: 'Juan Pérez', personal: per, personalNombres: pn, actividadesManuales: [], creado: ahora - 864e5, creadoPor: 'lucia@' + DOM }, extra);
  db.ordenesTrabajo.b150 = ot('OT-2026-150', d.dia(-3), { actividades: ['montaje_prfv'], previsto: { montaje_prfv: 2 }, estado: 'Terminada',
    campo: { fotos: { fb3: { k: 'montaje_prfv', tarea: 'Montaje de columna PRFV', cat: 'columna', num: 'Col 3', por: 'Juan Pérez', ts: ahora - 3 * 864e5, mini: PNG } } },
    cierre: { cerradoTs: ahora - 2 * 864e5, fecha: d.dia(-3), cantidades: { montaje_prfv: 2 }, horas: 8, avanceItems: [{ id: 7, delta: 2, k: 'montaje_prfv' }] } });
  db.ordenesTrabajo.b151 = ot('OT-2026-151', hoy, { actividades: ['sellado_base'], previsto: { sellado_base: 2 }, estado: 'Emitida',
    campo: { fotos: { fb4: { k: 'sellado_base', tarea: 'Sellado', cat: 'columna', num: 'Col 4', por: 'Juan Pérez', ts: ahora - 6e5, mini: PNG } } } });
  const ficha = (adj, ot, x) => Object.assign({ adjId: adj, plazaId: 'p1b', plazaNombre: 'PLAZA LOS ALAMOS', otId: ot || '', otNumero: ot ? db.ordenesTrabajo[ot].numero : '', cat: 'columna', num: '', mini: PNG, por: 'Juan Pérez', usuario: 'juan@' + DOM, ts: ahora - 864e5, fecha: ayer }, x);
  Object.assign(db.fotosObra, {
    gb3: ficha('fb3', 'b150', { num: 'Col 3', k: 'montaje_prfv', fecha: d.dia(-3) }),
    gb4: ficha('fb4', 'b151', { num: 'Col 4', k: 'sellado_base', fecha: hoy }),
    gbv: ficha('vb1', 'b150', { tipo: 'video', cat: 'columna', num: 'Col 3', dur: 12, bytes: 900000 }),
    gbz: ficha('zb1', '', { cat: 'zanja', por: 'Lucía Fernández', origen: 'legajo' }),
    gbp: ficha('pdb', '', { tipo: 'pdf', cat: 'otra', nombre: 'plano-viejo.pdf', paginas: 1 })
  });
  ['gb3', 'gb4', 'gbz'].forEach((k) => { const f = db.fotosObra[k]; db.adjuntos[f.adjId] = { tipo: 'obra', plazaId: 'p1b', plazaNombre: 'PLAZA LOS ALAMOS', otId: f.otId, cat: f.cat, num: f.num, dataUrl: PNG, w: 8, h: 8, bytes: 80, ts: f.ts, usuario: f.usuario }; });
  db.adjuntos.vb1 = { tipo: 'video', plazaId: 'p1b', plazaNombre: 'PLAZA LOS ALAMOS', otId: 'b150', r2: 'videos/2026/11/p1b/vb1.webm', mime: 'video/webm', bytes: 900000, ts: ahora - 864e5 };
  db.movimientos = Object.assign(db.movimientos || {}, {
    mb1: { tipo: 'salida', numero: 'S-0101', valeGrupo: 'S-0101', codigo: '6010', desc: 'Luminaria LED', cantidad: 2, un: 'Un.', plazaId: 'p1b', destino: 'PLAZA LOS ALAMOS', obraId: '4031', fecha: d.dia(-4), ts: ahora - 4 * 864e5, usuario: 'pan@' + DOM },
    mb2: { tipo: 'entrada', devolucion: true, numero: 'D-0101', devolGrupo: 'D-0101', codigo: '6010', desc: 'Luminaria LED', cantidad: 1, un: 'Un.', plazaId: 'p1b', destino: 'PLAZA LOS ALAMOS', obraId: '4031', fecha: d.dia(-2), ts: ahora - 2 * 864e5, usuario: 'pan@' + DOM }
  });
  db.reservas = Object.assign(db.reservas || {}, { rb1: { numero: 'R-0101', estado: 'pendiente', plazaId: 'p1b', plazaNombre: 'PLAZA LOS ALAMOS', obraId: '4031', otId: 'b151', otNumero: 'OT-2026-151', para: 'Juan Pérez', items: [{ codigo: '6010', desc: 'Luminaria LED', cant: 1, un: 'Un.' }], creado: ahora - 864e5 } });
  db.historialCalculos = Object.assign(db.historialCalculos || {}, { cb1: { plazaId: 'p1b', nombre: 'PLAZA LOS ALAMOS', id: '4031', barrio: 'Villa Rivera', fecha: d.dia(-6), ts: ahora - 6 * 864e5, usuario: 'lucia@' + DOM, modo: 'plaza', estado: 'Calculado', form: { campos: { obraNombre: 'PLAZA LOS ALAMOS', obraId: '4031' } }, listado: [] } });
  db.gastosObra = Object.assign(db.gastosObra || {}, { gb1: { plazaId: 'p1b', plazaNombre: 'PLAZA LOS ALAMOS', obraId: '4031', fecha: d.dia(-2), desc: 'Alquiler de martillo', importe: 25000, tipo: 'otro', ts: ahora - 2 * 864e5 } });
  db.historialEtapas = Object.assign(db.historialEtapas || {}, { eb1: { plazaId: 'p1b', plazaNombre: 'PLAZA LOS ALAMOS', etapa: 'pozo', fecha: d.dia(-5), ts: ahora - 5 * 864e5 } });
  db.planosObra = Object.assign(db.planosObra || {}, { plb: { plazaId: 'p1b', nombre: 'Plano de la plaza', tipo: 'foto', paginas: 1, mini: PNG, tam: 80, ts: ahora - 7 * 864e5 } });
  db.mapaPuntos = Object.assign(db.mapaPuntos || {}, { mpb: { plazaId: 'p1b', nombre: 'Cámara de paso', icono: 'camara', lat: -31.4273, lng: -64.1888, ts: ahora - 864e5 } });
  db.planSemanal = Object.assign(db.planSemanal || {}, { psb: { obra: 'PLAZA LOS ALAMOS', fecha: hoy, tarea: 'Sellado', dia: 0, ts: ahora } });
  db.proyectos = Object.assign(db.proyectos || {}, { pyb: { nombre: 'Relevamiento Los Alamos', obraId: 'p1b', obraNombre: 'PLAZA LOS ALAMOS', puntos: [], ts: ahora - 864e5 } });
  db.avisosCuadrilla = Object.assign(db.avisosCuadrilla || {}, { avb: { uid: 'uJuan', email: 'juan@' + DOM, nombre: 'Juan Pérez', persona: 'Juan Pérez', personaClave: 'juan perez', rol: 'cuadrilla', texto: 'Falta una tapa', tipo: 'problema', otId: 'b151', otNumero: 'OT-2026-151', obraId: 'p1b', obraNombre: 'PLAZA LOS ALAMOS', ts: ahora - 3e5, fecha: hoy, estado: 'nuevo' } });
  const U = { dir: ['uDir', 'Roberto Dirección', 'direccion'], mir: ['uMir', 'Mirta Mira', 'mirar'] };
  Object.keys(U).forEach((k) => { const [uid, nombre, rol] = U[k]; d.cuentas[k + '@' + DOM] = { pass: 'clave123', uid }; db.usuarios[uid] = { email: k + '@' + DOM, usuario: k, nombre, rol, activo: true }; });
  d.antesP1b = JSON.parse(JSON.stringify(db));
  return d;
}
module.exports = { datos180 };
