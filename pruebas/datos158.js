// v158 · datos para t_v158 (avance de obra nuevo, por rubro y por columna, que se mueve con las órdenes).
//  · PLAZA BULEVARES (b1, ID 4019): PRFV, 12 columnas de 7 m (Col 1–12), 2 circuitos de 6 (cálculo), 1 tablero a nivel; itemizado
//    contratado: 12 del ítem 5, 1 del 10, 380 m de zanja (15), 380 m de cable (25), 1 cruce (21).
//    · OT-2026-301 (hace 10 días, cerrada): pozo + hormigonado de Col 1–6 (Modo obra, con foto).
//    · OT-2026-302 (hace 6 días, cerrada): izaje de Col 1–5 por Modo obra (con foto y hora).
//    · OT-2026-303 (hace 5 días, cerrada): «vínculos × 5» sin decir cuáles (sin detalle por columna) → Col 1–5 «sin columna exacta».
//    · OT-2026-304 (hace 4 días, cerrada): artefacto en Col 1–3 (con foto).
//    · OT-2026-305 (hace 2 días, cerrada): artefacto de la Col 2 «no se hizo: artefacto quemado» (falla).
//    · OT-2026-306 (ayer, cerrada): hormigonado de Col 7–9 (fraguando: 72 h) y pozo de Col 7–11.
//    · OT-2026-307 (hoy, mandada sin cerrar): tablerito de Col 1 y Col 2 (Modo obra, con foto).
//    · OT-2026-308 (mañana, emitida): izaje × 2 (asignado).
//    · Documentación a medias: carpeta EPEC sí; conforme, PAT y certificado no. Material: todo entregado menos el fusible 3017.
//  · PLAZA SIN CÁLCULO (b2): solo ítem 82 (poda) → sin lista: el % es el del itemizado.
//  · Lucía (oficina), Roberto (Dirección), Mirta (solo mirar), Juan (cuadrilla).
const { baseDatos, DOM } = require('./h');
function datos158(op = {}) {
  const d = baseDatos(), ahora = Date.now(), hoy = d.hoy;
  const dia = (n) => { const x = new Date(hoy + 'T12:00:00'); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
  const ts = (f, hm) => new Date(f + 'T' + hm + ':00').getTime();
  Object.assign(d.cuentas, { ['lucia@' + DOM]: { pass: 'clave123', uid: 'uLucia' }, ['dir@' + DOM]: { pass: 'clave123', uid: 'uDir' }, ['mir@' + DOM]: { pass: 'clave123', uid: 'uMir' } });
  d.db.usuarios.uJuan = { email: 'juan@' + DOM, usuario: 'juan', nombre: 'Juan Pérez', rol: 'cuadrilla', persona: 'Juan Pérez', personaClave: 'juan perez', activo: true };
  d.db.usuarios.uPedro = { email: 'pedro@' + DOM, usuario: 'pedro', nombre: 'Pedro Gómez', rol: 'cuadrilla', persona: 'Pedro Gómez', personaClave: 'pedro gomez', activo: true };
  d.db.usuarios.uLucia = { email: 'lucia@' + DOM, usuario: 'lucia', nombre: 'Lucía Fernández', rol: 'oficina', activo: true };
  d.db.usuarios.uDir = { email: 'dir@' + DOM, usuario: 'dir', nombre: 'Roberto Directo', rol: 'direccion', activo: true };
  d.db.usuarios.uMir = { email: 'mir@' + DOM, usuario: 'mir', nombre: 'Mirta Mira', rol: 'mirar', activo: true };
  d.db.configEquipo.personal = { lista: [{ nombre: 'Juan Pérez', rol: 'Oficial', activo: true }, { nombre: 'Pedro Gómez', rol: 'Ayudante', activo: true }] };
  const cols = Array.from({ length: 12 }, (_, i) => 'Col ' + (i + 1));
  const it = (desc, cod, cant, un) => ({ cod, desc, corto: desc, cant, cantNecesaria: cant, un: un || 'Un.' });
  d.db.avanceObras = {
    b1: { nombre: 'PLAZA BULEVARES', plazaNombre: 'PLAZA BULEVARES', obraId: '4019', direccion: 'Bv. San Juan 900', barrio: 'B° Bulevares', tipo: 'plaza', lat: -31.4201, lng: -64.1888, creado: ahora - 864e5 * 20, carpetaEpec: dia(-30), fechaEstimada: dia(14),
      puntos: cols.slice(),
      valorItems: [{ id: 1, itemPliego: '5', cantidad: 12, cantidadAvanzada: 3 }, { id: 2, itemPliego: '10', cantidad: 1, cantidadAvanzada: 0 }, { id: 3, itemPliego: '15', cantidad: 380, cantidadAvanzada: 0 }, { id: 4, itemPliego: '25', cantidad: 380, cantidadAvanzada: 0 }, { id: 5, itemPliego: '21', cantidad: 1, cantidadAvanzada: 0 }],
      secciones: [{ titulo: 'COLUMNAS', items: [it('Luminaria LED 75 W', 6010, 12), it('Vínculo capuchón', 6021, 12)] }, { titulo: 'TABLERO DE COLUMNA', items: [it('Fusible 10×38 2 A', 3017, 12), it('BPN 6 verde', 2010, 26)] }] },
    b2: { nombre: 'PLAZA SIN CÁLCULO', plazaNombre: 'PLAZA SIN CÁLCULO', obraId: '4099', tipo: 'plaza', lat: -31.43, lng: -64.20, creado: ahora, puntos: [], valorItems: [{ id: 1, itemPliego: '82', cantidad: 4, cantidadAvanzada: 1 }] }
  };
  const pts = (n) => Array.from({ length: n }, (_, i) => ({ id: i + 1, esColumna: true, altura: 7 }));
  d.db.historialCalculos = { h158: { nombre: 'PLAZA BULEVARES', id: '4019', barrio: 'B° Bulevares', fecha: dia(-25), ts: ahora - 864e5 * 25, usuario: 'admin@' + DOM, estado: 'Pendiente', cantCol: 12, tipoCol: 'PRFV', altura: 7, tareas: ['Columnas'], tiles: [], alertas: [],
    form: { v: 1, campos: { colTipo: 'PRFV', toggleColumnas: true, obraNombre: 'PLAZA BULEVARES', obraId: '4019' }, columnaGrupos: [{ id: 1, altura: 7, columnas: 12 }], vinculoGrupos: [{ id: 1, tipo: 'simple_400', columnas: 12 }], civilGrupos: [], circuitos: [{ tablero: 1, numero: 1, puntos: pts(6) }, { tablero: 1, numero: 2, puntos: pts(6) }], tramos: [], zanjaTramos: [], tablerosExtra: [] },
    secciones: [{ titulo: 'Columnas', items: [{ cod: 6006, desc: 'Columna PRFV 7 m', corto: 'Columna PRFV 7 m', cant: 12, un: 'Un.' }] }] } };
  const per = [{ nombre: 'Juan Pérez', rol: 'Oficial' }, { nombre: 'Pedro Gómez', rol: 'Ayudante' }], pn = ['juan perez', 'pedro gomez'];
  const det = (lista, f, extra) => { const pasosObra = {}, fotos = {}; let n = 0; lista.forEach(([k, cs, est, mot]) => { pasosObra[k] = pasosObra[k] || {}; cs.forEach((c) => { n++; const t1 = ts(f, '08:00') + n * 30 * 60000; pasosObra[k][c.toLowerCase()] = Object.assign({ num: c, ini: '08:00', fin: '09:00', estado: est || 'si', por: 'Juan Pérez', ts: t1, min: 30 }, mot ? { motivo: mot } : {}); if (!est) fotos['f' + k.slice(0, 4) + n + f.slice(-2)] = { k, cat: k.indexOf('lumin') >= 0 ? 'luminaria' : k.indexOf('tabler') >= 0 ? 'caja' : 'columna', num: c, por: 'Juan Pérez', ts: t1, mini: '' }; }); }); return Object.assign({ pasosObra, fotos }, extra || {}); };
  const ot = (key, numero, f, act, cant, campo, cerrar, extra) => {
    d.db.ordenesTrabajo[key] = Object.assign({ numero, fecha: f, plazaId: 'b1', plazaNombre: 'PLAZA BULEVARES', obraId: '4019', horaInicio: '07:30', horaFin: '15:30', cuadrilla: 'Juan y Pedro', responsable: 'Juan Pérez', personal: per.map((p) => Object.assign({}, p)), personalNombres: pn.slice(), actividades: act, previsto: Object.assign({}, cant), estado: cerrar ? 'Terminada' : 'Emitida', creado: ts(f, '07:00'), campo: campo || {} },
      cerrar ? { cierre: { cerradoTs: ts(f, '18:00'), fecha: f, cantidades: Object.assign({}, cant), horas: 8, avanceItems: [] } } : {}, extra || {});
  };
  d.db.ordenesTrabajo = {};
  ot('o301', 'OT-2026-301', dia(-10), ['excavacion', 'hormigonado'], { excavacion: 6, hormigonado: 6 }, det([['excavacion', cols.slice(0, 6)], ['hormigonado', cols.slice(0, 6)]], dia(-10)), true);
  ot('o302', 'OT-2026-302', dia(-6), ['montaje_prfv'], { montaje_prfv: 5 }, det([['montaje_prfv', cols.slice(0, 5)]], dia(-6)), true);
  ot('o303', 'OT-2026-303', dia(-5), ['montaje_vinculo'], { montaje_vinculo: 5 }, {}, true);
  ot('o304', 'OT-2026-304', dia(-4), ['montaje_luminaria'], { montaje_luminaria: 3 }, det([['montaje_luminaria', cols.slice(0, 3)]], dia(-4)), true);
  ot('o305', 'OT-2026-305', dia(-2), ['montaje_luminaria'], { montaje_luminaria: 1 }, det([['montaje_luminaria', ['Col 2'], 'no', 'artefacto quemado']], dia(-2)), true, { cierre: { cerradoTs: ts(dia(-2), '18:00'), fecha: dia(-2), cantidades: { montaje_luminaria: 0 }, horas: 8, avanceItems: [] } });
  ot('o306', 'OT-2026-306', dia(-1), ['excavacion', 'hormigonado'], { excavacion: 5, hormigonado: 3 }, det([['excavacion', cols.slice(6, 11)], ['hormigonado', cols.slice(6, 9)]], dia(-1)), true);
  ot('o307', 'OT-2026-307', hoy, ['conexionado_tablerito'], { conexionado_tablerito: 2 }, det([['conexionado_tablerito', ['Col 1', 'Col 2']]], hoy, { marcas: { conexionado_tablerito: { hecho: true, cant: 2, por: 'Juan Pérez' } } }), false, { estado: 'En curso' });
  ot('o308', 'OT-2026-308', dia(1), ['montaje_prfv'], { montaje_prfv: 2 }, {}, false);
  if (op.sinOrdenes) d.db.ordenesTrabajo = {};
  // material: todo entregado menos el fusible 3017
  const v = (cod, cant, i) => ({ tipo: 'salida', codigo: cod, desc: 'x', un: 'Un.', cantidad: cant, plazaId: 'b1', plazaNombre: 'PLAZA BULEVARES', fecha: dia(-8), ts: ahora - 864e5 * 8 + i, retiradoPor: 'Juan Pérez', valeGrupo: 'S-00' + (10 + i) });
  d.db.movimientos = {}; [v(6010, 12, 1), v(6021, 12, 2), v(2010, 26, 3)].forEach((m, i) => { d.db.movimientos['mv' + i] = m; });
  d.db.configEquipo.baremo = Object.assign({}, d.db.configEquipo.baremo || {}, { sugerida: { fraguado: 72 } });
  return d;
}
module.exports = { datos158 };
