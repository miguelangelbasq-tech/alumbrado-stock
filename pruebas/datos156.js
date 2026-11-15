// v156 · datos para t_v156 (auditor del avance de obra), sobre datos153 (y datos150):
//  · PLAZA SAN PABLO (s1): cuadra perfecto. Ítem 5 (2 columnas PRFV) hecho 1: OT-2026-201 (hace 12 días) pozo + hormigonado de
//    Col 1 y 2 (0,24 + 0,26) y OT-2026-202 (hace 6 días) izaje de las dos (0,5), con pasos y fotos por columna.
//  · PLAZA LAS ROSAS (s2): ítem 15 (zanja) 40 de 100 cargados a mano, sin orden ni foto ni motivo (avance sin fecha).
//  · PLAZA EL OLMO (s3): OT-2026-203 cerrada con pozo + hormigonado de 4 y avanceItems vacío (no movió el avance); OT-2026-204
//    izaje de 2 que sumó DOS VECES 0,5 al ítem 5.
//  · PLAZA LOS PINOS (s4): Col 1 izada (OT-2026-205, con foto) sin pozo ni hormigonado.
//  · PLAZA EL CEIBO (s5): hormigonado (OT-2026-206, hace 3 días) e izaje (OT-2026-207, hace 2 días) con 1 día de diferencia.
//  · PLAZA SARMIENTO (s6): el cálculo (16 columnas PRFV de 10 m) no coincide con el itemizado (8 del ítem 6 + 8 del ítem 8).
//  · PLAZA ITALIA (s7): ítem 9 (tablero) 2 hechas de 1 contratada.
//  · PLAZA VÉLEZ (s8): al 100 % con carpeta, conforme a obra y certificado, sin la planilla de PAT.
//  · Mirta (solo mirar, de datos153), Roberto (Dirección).
const { DOM } = require('./h');
const { datos153 } = require('./datos153');
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAEUlEQVR4nGPQiOrBihiGlgQAR05DgXjxIegAAAAASUVORK5CYII=';
function datos156() {
  const d = datos153(), ahora = Date.now(), dia = d.dia, A = d.db.avanceObras, O = d.db.ordenesTrabajo;
  d.cuentas['dir@' + DOM] = { pass: 'clave123', uid: 'uDir' };
  d.db.usuarios.uDir = { email: 'dir@' + DOM, usuario: 'dir', nombre: 'Roberto Directo', rol: 'direccion', activo: true };
  const col = (n) => Array.from({ length: n }, (_, i) => 'Col ' + (i + 1));
  const obra = (id, nombre, obraId, items, extra) => { A[id] = Object.assign({ nombre, plazaNombre: nombre, obraId, direccion: 'Calle ' + obraId, barrio: 'Centro', tipo: 'plaza', lat: -31.41 - Math.random() / 100, lng: -64.19, creado: ahora, valorItems: items.map((x, i) => ({ id: i + 1, itemPliego: x[0], cantidad: x[1], cantidadAvanzada: x[2] })), puntos: col(2) }, extra || {}); };
  obra('s1', 'PLAZA SAN PABLO', '4201', [['5', 2, 1]]);
  obra('s2', 'PLAZA LAS ROSAS', '4202', [['15', 100, 40]]);
  obra('s3', 'PLAZA EL OLMO', '4203', [['5', 4, 1]], { puntos: col(4) });
  obra('s4', 'PLAZA LOS PINOS', '4204', [['5', 3, 0.25]], { puntos: col(3) });
  obra('s5', 'PLAZA EL CEIBO', '4205', [['5', 2, 1]]);
  obra('s6', 'PLAZA SARMIENTO', '4120', [['6', 8, 0], ['8', 8, 0]], { puntos: [] });
  obra('s7', 'PLAZA ITALIA', '4207', [['9', 1, 2]], { puntos: [] });
  obra('s8', 'PLAZA VÉLEZ', '4208', [['5', 1, 1]], { puntos: col(1), carpetaEpec: dia(-30), coCierre: { cerrado: true, fecha: dia(-2), usuario: 'admin' }, documentos: { cert: { ok: true, fecha: dia(-2), por: 'admin@' + DOM, porNombre: 'Ana Admin', ts: ahora - 2 * 864e5 } } });
  const per = [{ nombre: 'Lucas Vera', rol: 'Oficial' }, { nombre: 'Diego Luna', rol: 'Ayudante' }], pn = ['lucas vera', 'diego luna'];
  const ot = (key, numero, fecha, plaza, act, cant, avance, campo) => {
    O[key] = { numero, fecha, plazaId: plaza, plazaNombre: A[plaza].nombre, obraId: A[plaza].obraId, horaInicio: '07:30', horaFin: '15:30', cuadrilla: 'Lucas y Diego', responsable: 'Lucas Vera', personal: per.map((p) => Object.assign({}, p)), personalNombres: pn.slice(), actividadesManuales: [], vehiculos: [{ id: 'vH', nombre: 'Grúa 2', patente: 'AB 123 CD' }], vehiculoId: 'vH', creado: ahora - 864e5 * 20, creadoPor: 'lucia@' + DOM,
      actividades: act, previsto: Object.assign({}, cant), estado: 'Terminada', campo: campo || {},
      cierre: { cerradoTs: +new Date(fecha + 'T18:00:00'), fecha, cantidades: Object.assign({}, cant), horas: 8, avanceItems: avance } };
  };
  // pasos (Modo obra) y fotos por columna de una tarea
  const det = (lista, fecha) => { const pasosObra = {}, fotos = {}; let n = 0; const t0 = +new Date(fecha + 'T09:00:00'); lista.forEach(([k, cols]) => { pasosObra[k] = {}; cols.forEach((c) => { n++; pasosObra[k][c.toLowerCase()] = { num: c, ini: '08:00', fin: '09:00', estado: 'si', por: 'Lucas Vera', ts: t0 + n }; fotos['f' + k.slice(0, 3) + n + fecha.slice(-2)] = { k, cat: 'columna', num: c, por: 'Lucas Vera', ts: t0 + n, mini: PNG, distObra: 10 }; }); }); return { pasosObra, fotos }; };
  ot('t201', 'OT-2026-201', dia(-12), 's1', ['excavacion', 'hormigonado'], { excavacion: 2, hormigonado: 2 }, [{ id: 5, delta: 0.24, k: 'excavacion' }, { id: 5, delta: 0.26, k: 'hormigonado' }], det([['excavacion', ['Col 1', 'Col 2']], ['hormigonado', ['Col 1', 'Col 2']]], dia(-12)));
  ot('t202', 'OT-2026-202', dia(-6), 's1', ['montaje_prfv'], { montaje_prfv: 2 }, [{ id: 5, delta: 0.5, k: 'montaje_prfv' }], det([['montaje_prfv', ['Col 1', 'Col 2']]], dia(-6)));
  ot('t203', 'OT-2026-203', dia(-9), 's3', ['excavacion', 'hormigonado'], { excavacion: 4, hormigonado: 4 }, []);
  ot('t204', 'OT-2026-204', dia(-4), 's3', ['montaje_prfv'], { montaje_prfv: 2 }, [{ id: 5, delta: 0.5, k: 'montaje_prfv' }, { id: 5, delta: 0.5, k: 'montaje_prfv' }]);
  ot('t205', 'OT-2026-205', dia(-5), 's4', ['montaje_prfv'], { montaje_prfv: 1 }, [{ id: 5, delta: 0.25, k: 'montaje_prfv' }], det([['montaje_prfv', ['Col 1']]], dia(-5)));
  ot('t206', 'OT-2026-206', dia(-3), 's5', ['excavacion', 'hormigonado'], { excavacion: 2, hormigonado: 2 }, [{ id: 5, delta: 0.24, k: 'excavacion' }, { id: 5, delta: 0.26, k: 'hormigonado' }], det([['excavacion', ['Col 1', 'Col 2']], ['hormigonado', ['Col 1', 'Col 2']]], dia(-3)));
  ot('t207', 'OT-2026-207', dia(-2), 's5', ['montaje_prfv'], { montaje_prfv: 2 }, [{ id: 5, delta: 0.5, k: 'montaje_prfv' }], det([['montaje_prfv', ['Col 1', 'Col 2']]], dia(-2)));
  ot('t208', 'OT-2026-208', dia(-8), 's8', ['montaje_prfv'], { montaje_prfv: 1 }, [{ id: 5, delta: 1 }]);
  const pts = (n) => Array.from({ length: n }, (_, i) => ({ id: i + 1 }));
  d.db.historialCalculos = { h156: { nombre: 'PLAZA SARMIENTO', id: '4120', barrio: 'Centro', fecha: dia(-15), ts: ahora - 864e5 * 15, usuario: 'admin@' + DOM, estado: 'Pendiente', cantCol: 16, tipoCol: 'PRFV', altura: 10, tareas: ['Columnas'], tiles: [], alertas: [],
    form: { v: 1, campos: { colTipo: 'PRFV', toggleColumnas: true, obraNombre: 'PLAZA SARMIENTO', obraId: '4120' }, columnaGrupos: [{ id: 1, altura: 10, columnas: 16 }], vinculoGrupos: [], civilGrupos: [], circuitos: [{ tablero: 1, numero: 1, puntos: pts(8) }, { tablero: 1, numero: 2, puntos: pts(8) }], tramos: [], zanjaTramos: [], tablerosExtra: [] },
    secciones: [{ titulo: 'Columnas', items: [{ cod: 6007, desc: 'Columna PRFV 10 m', corto: 'Columna PRFV 10 m', cant: 16, un: 'Un.' }] }] } };
  return d;
}
module.exports = { datos156, PNG };
