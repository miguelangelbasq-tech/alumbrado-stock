// v154 · datos para t_v154 (auditor de puntos), sobre datos153:
//  · La quincena de Juan Pérez con 3 órdenes en PLAZA LOS PINOS (p5):
//    OT-2026-160 zanjeo 30 m REPARTIDO (Juan 20, Pedro 10) · OT-2026-161 excavación 4 con «Elegir quiénes» (Juan y Pedro) +
//    hormigonado 4 para toda la cuadrilla (Juan, Pedro, Lucas; sin puntos guardados) · OT-2026-162 izaje PRFV 2 con los puntos
//    puestos a mano CON motivo (Juan 7, Pedro 3).
//  · OT-2026-177 ya corregida como en la v153: el apoyo PRFV lo pusieron Pablo y Ariel (9,25 cada uno), con su historial.
//  · Errores sembrados (otras personas, esta quincena): OT-170 el reparto no suma · OT-171 Ana con 0 h y puntos · OT-172 la
//    cuadrilla dijo «no se hizo» y el cierre le dio puntos · OT-173 la Col 2 de LOS ÁLAMOS cobrada de nuevo (ya estaba en la
//    OT-110) · OT-174 puntos a mano SIN motivo · OT-175 la acometida cerrada con 12 por unidad (hoy vale 9,6) sin nada anotado.
//  · Los cierres de 10 días atrás de datos150 pasan a Lucas y Diego (así la quincena de Juan tiene solo sus 3 órdenes).
const { DOM } = require('./h');
const { datos153 } = require('./datos153');
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAEUlEQVR4nGPQiOrBihiGlgQAR05DgXjxIegAAAAASUVORK5CYII=';
function datos154() {
  const d = datos153(), ahora = Date.now(), dia = d.dia, O = d.db.ordenesTrabajo, t1 = ahora - 864e5;
  const LD = [{ nombre: 'Lucas Vera', rol: 'Oficial' }, { nombre: 'Diego Luna', rol: 'Ayudante' }];
  ['z101', 'z102', 'z103', 'c110'].forEach((id) => { O[id].personal = LD.map((p) => Object.assign({}, p)); O[id].personalNombres = ['lucas vera', 'diego luna']; O[id].cuadrilla = 'Lucas y Diego'; });
  d.db.configEquipo.personal.lista.push({ nombre: 'Juan Pérez', rol: 'Oficial', activo: true });   // ya está (por si acaso, no duplica en la cuenta)
  d.db.configEquipo.personal.lista = d.db.configEquipo.personal.lista.filter((p, i, l) => l.findIndex((x) => x.nombre === p.nombre) === i);
  Object.assign(d.db.configEquipo.baremo.baremo, { montaje_prfv: { un: 'columna', pts: 5 }, sellado_base: { un: 'base', pts: 1 }, bpn: { un: 'columna', pts: 1 } });
  d.db.avanceObras.p5 = { nombre: 'PLAZA LOS PINOS', plazaNombre: 'PLAZA LOS PINOS', obraId: '4090', direccion: 'Los Pinos 50', barrio: 'Jardín', tipo: 'plaza', lat: -31.44, lng: -64.17, creado: ahora, valorItems: [{ id: 1, itemPliego: '5', cantidad: 4, cantidadAvanzada: 0 }], puntos: ['Col 1', 'Col 2', 'Col 3', 'Col 4'] };
  const JP = [{ nombre: 'Juan Pérez', rol: 'Oficial' }, { nombre: 'Pedro Gómez', rol: 'Ayudante' }];
  const ot = (numero, fecha, plaza, per, extra) => Object.assign({ numero, fecha, plazaId: plaza, plazaNombre: d.db.avanceObras[plaza].nombre, obraId: d.db.avanceObras[plaza].obraId, horaInicio: '07:30', horaFin: '15:30', cuadrilla: per.map((p) => p.nombre.split(' ')[0]).join(' y '), responsable: per[0].nombre, personal: per.map((p) => Object.assign({}, p)), personalNombres: per.map((p) => p.nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()), actividadesManuales: [], vehiculos: [], estado: 'Terminada', creado: ahora - 5 * 864e5, creadoPor: 'lucia@' + DOM }, extra);
  const ci = (fecha, cant, extra) => Object.assign({ cerradoTs: ahora - 36e5, fecha, cantidades: cant, horasPersonaV: 2, cerradoPor: 'lucia@' + DOM }, extra);
  const fija = (ren, per, extra) => Object.assign({ total: ren.reduce((s, r) => s + r.pts, 0), ts: ahora - 36e5, renglones: ren, porPersona: per }, extra);
  // --- la quincena de Juan
  O.j160 = ot('OT-2026-160', dia(-4), 'p5', JP, { actividades: ['zanjeo'], previsto: { zanjeo: 30 }, reparto: { zanjeo: [{ nombre: 'Juan Pérez', cant: 20 }, { nombre: 'Pedro Gómez', cant: 10 }] },
    cierre: ci(dia(-4), { zanjeo: 30 }, { horasPersona: { 'Juan Pérez': 8, 'Pedro Gómez': 8 }, hechoPersona: { zanjeo: { 'Juan Pérez': 20, 'Pedro Gómez': 10 } },
      puntos: fija([{ k: 'zanjeo', tarea: 'Zanjeo', cant: 30, un: 'metro', ptsUnit: 0.4, pts: 12 }], [{ nombre: 'Juan Pérez', rol: 'Oficial', pts: 8 }, { nombre: 'Pedro Gómez', rol: 'Ayudante', pts: 4 }]) }) });
  O.j161 = ot('OT-2026-161', dia(-3), 'p5', JP.concat([{ nombre: 'Lucas Vera', rol: 'Oficial' }]), { actividades: ['excavacion', 'hormigonado'], previsto: { excavacion: 4, hormigonado: 4 }, equipoTarea: { excavacion: ['Juan Pérez', 'Pedro Gómez'] },
    cierre: ci(dia(-3), { excavacion: 4, hormigonado: 4 }, { horasPersona: { 'Juan Pérez': 8, 'Pedro Gómez': 8, 'Lucas Vera': 8 } }) });   // sin puntos guardados (de antes): Producción los cuenta en vivo
  O.j162 = ot('OT-2026-162', dia(-2), 'p5', JP, { actividades: ['montaje_prfv'], previsto: { montaje_prfv: 2 },
    cierre: ci(dia(-2), { montaje_prfv: 2 }, { horasPersona: { 'Juan Pérez': 8, 'Pedro Gómez': 8 }, reparto: { 'Juan Pérez': 7, 'Pedro Gómez': 3 },
      puntos: fija([{ k: 'montaje_prfv', tarea: 'Montaje de columna PRFV', cant: 2, un: 'columna', ptsUnit: 5, pts: 10 }], [{ nombre: 'Juan Pérez', rol: 'Oficial', pts: 7, aMano: true }, { nombre: 'Pedro Gómez', rol: 'Ayudante', pts: 3, aMano: true }], { editado: true }),
      puntosHist: [{ ts: ahora - 30e5, por: 'lucia@' + DOM, porNombre: 'Lucía Fernández', tipo: 'puntos', antes: 10, despues: 10, motivo: 'Juan izó casi todo solo, Pedro llegó tarde', personas: [{ nombre: 'Juan Pérez', antes: 6.25, despues: 7 }, { nombre: 'Pedro Gómez', antes: 3.75, despues: 3 }] }] }) });
  // --- OT-177 ya corregida (v153)
  const o177 = O.ot177, c177 = o177.cierre;
  c177.cantidades = { acometida: 1, poste_tablero: 1 };
  c177.puntosTarea = { acometida: { 'Marcos Ríos': 4.8, 'Bruno Sosa': 4.8 }, poste_tablero: { 'Pablo Picone': 9.25, 'Ariel Lastra': 9.25 } };
  c177.puntos = fija([{ k: 'acometida', tarea: 'Acometida EPEC → tablero', cant: 1, un: 'acometida', ptsUnit: 9.6, pts: 9.6 }, { k: 'poste_tablero', tarea: 'Colocación de apoyo PRFV para el tablero', cant: 1, un: 'apoyo', ptsUnit: 18.5, pts: 18.5 }],
    [{ nombre: 'Marcos Ríos', rol: 'Oficial', pts: 4.8 }, { nombre: 'Bruno Sosa', rol: 'Oficial', pts: 4.8 }, { nombre: 'Pablo Picone', rol: 'Oficial', pts: 9.25 }, { nombre: 'Ariel Lastra', rol: 'Oficial', pts: 9.25 }], { corregido: true });
  c177.avanceItems = [{ id: '13', delta: 0.7, k: 'poste_tablero' }];
  c177.puntosHist = [{ ts: ahora - 20e5, por: 'lucia@' + DOM, porNombre: 'Lucía Fernández', tipo: 'corregir', antes: 9.6, despues: 28.1, motivo: 'El apoyo lo colocaron Pablo y Ariel; en el cierre había quedado en 0', porAsistente: false,
    tareas: [{ k: 'poste_tablero', tarea: 'Colocación de apoyo PRFV para el tablero', antes: 0, despues: 1, ptsAntes: 0, ptsDespues: 18.5, quienes: ['Pablo Picone', 'Ariel Lastra'] }], personas: [{ nombre: 'Pablo Picone', antes: 0, despues: 9.25 }, { nombre: 'Ariel Lastra', antes: 0, despues: 9.25 }], avance: [{ id: '13', delta: 0.7 }] }];
  c177.corregido = { ts: ahora - 20e5, por: 'lucia@' + DOM, n: 1, motivo: 'El apoyo lo colocaron Pablo y Ariel; en el cierre había quedado en 0' };
  (d.db.avanceObras.p9.valorItems.find((v) => v.itemPliego === '13') || {}).cantidadAvanzada = 0.7;
  // --- errores sembrados
  const ME = [{ nombre: 'Marcos Ríos', rol: 'Oficial' }, { nombre: 'Ana Torres', rol: 'Ayudante' }];
  const LA = [{ nombre: 'Lucas Vera', rol: 'Oficial' }, { nombre: 'Ana Torres', rol: 'Ayudante' }];
  const DA = [{ nombre: 'Diego Luna', rol: 'Ayudante' }, { nombre: 'Ana Torres', rol: 'Ayudante' }];
  const sell = (n) => [{ k: 'sellado_base', tarea: 'Sellado de base', cant: n, un: 'base', ptsUnit: 1, pts: n }];
  O.e170 = ot('OT-2026-170', dia(-2), 'p5', LD, { actividades: ['sellado_base'], previsto: { sellado_base: 4 }, cierre: ci(dia(-2), { sellado_base: 4 }, { horasPersona: { 'Lucas Vera': 8, 'Diego Luna': 8 }, puntos: fija(sell(4), [{ nombre: 'Lucas Vera', rol: 'Oficial', pts: 2 }, { nombre: 'Diego Luna', rol: 'Ayudante', pts: 1 }]) }) });
  O.e171 = ot('OT-2026-171', dia(-2), 'p5', LA, { actividades: ['sellado_base'], previsto: { sellado_base: 4 }, cierre: ci(dia(-2), { sellado_base: 4 }, { horasPersona: { 'Lucas Vera': 8, 'Ana Torres': 0 }, puntos: fija(sell(4), [{ nombre: 'Lucas Vera', rol: 'Oficial', pts: 3 }, { nombre: 'Ana Torres', rol: 'Ayudante', pts: 1 }]) }) });
  O.e172 = ot('OT-2026-172', dia(-1), 'p5', DA, { actividades: ['bpn'], previsto: { bpn: 3 }, campo: { marcas: { bpn: { k: 'bpn', hecho: false, motivo: 'faltó material', por: 'Diego Luna', ts: t1 } }, enviados: { 'diego luna': { ts: t1, nombre: 'Diego Luna' } } },
    cierre: ci(dia(-1), { bpn: 3 }, { horasPersona: { 'Diego Luna': 8, 'Ana Torres': 8 }, puntos: fija([{ k: 'bpn', tarea: 'BPN', cant: 3, un: 'columna', ptsUnit: 1, pts: 3 }], [{ nombre: 'Diego Luna', rol: 'Ayudante', pts: 1.5 }, { nombre: 'Ana Torres', rol: 'Ayudante', pts: 1.5 }]) }) });
  O.e173 = ot('OT-2026-173', dia(-1), 'p1', ME, { actividades: ['montaje_prfv'], previsto: { montaje_prfv: 1 }, campo: { fotos: { x2: { k: 'montaje_prfv', cat: 'columna', num: 'Col 2', por: 'Marcos Ríos', ts: t1, mini: PNG, distObra: 10 } } },
    cierre: ci(dia(-1), { montaje_prfv: 1 }, { horasPersona: { 'Marcos Ríos': 8, 'Ana Torres': 8 }, puntos: fija([{ k: 'montaje_prfv', tarea: 'Montaje de columna PRFV', cant: 1, un: 'columna', ptsUnit: 5, pts: 5 }], [{ nombre: 'Marcos Ríos', rol: 'Oficial', pts: 3.125 }, { nombre: 'Ana Torres', rol: 'Ayudante', pts: 1.875 }]) }) });
  O.e174 = ot('OT-2026-174', dia(-3), 'p5', ME, { actividades: ['sellado_base'], previsto: { sellado_base: 8 }, cierre: ci(dia(-3), { sellado_base: 8 }, { horasPersona: { 'Marcos Ríos': 8, 'Ana Torres': 8 }, reparto: { 'Marcos Ríos': 6, 'Ana Torres': 2 },
    puntos: fija(sell(8), [{ nombre: 'Marcos Ríos', rol: 'Oficial', pts: 6, aMano: true }, { nombre: 'Ana Torres', rol: 'Ayudante', pts: 2, aMano: true }], { editado: true }), puntosHist: [{ ts: ahora - 40e5, por: 'lucia@' + DOM, antes: 8, despues: 8, tareas: ['Sellado de base 1'] }] }) });
  O.e175 = ot('OT-2026-175', dia(-4), 'p5', ME, { actividades: ['acometida'], previsto: { acometida: 1 }, cierre: ci(dia(-4), { acometida: 1 }, { horasPersona: { 'Marcos Ríos': 8, 'Ana Torres': 8 },
    puntos: fija([{ k: 'acometida', tarea: 'Acometida EPEC → tablero', cant: 1, un: 'acometida', ptsUnit: 12, pts: 12 }], [{ nombre: 'Marcos Ríos', rol: 'Oficial', pts: 7.5 }, { nombre: 'Ana Torres', rol: 'Ayudante', pts: 4.5 }]) }) });
  // la quincena cerrada (OT-2026-150) sigue como en datos153
  return d;
}
module.exports = { datos154 };
