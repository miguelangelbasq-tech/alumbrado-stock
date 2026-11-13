// v153 · datos para t_v153 (corregir el cierre de una orden cerrada), sobre datos150:
//  · GEORG NICOLAI (p9, ID 4110): ítem 13 (apoyo PRFV del tablero) 0 de 1 y ítem 12 (acometida) 1 de 1.
//  · OT-2026-177 (ayer, CERRADA) como la de Ángel: Marcos Ríos, Bruno Sosa, Pablo Picone y Ariel Lastra (Oficiales, 8 h).
//    Tareas: acometida (hecha 1: Marcos y Bruno, 4,8 cada uno), «Colocación de apoyo PRFV para el tablero» (en el cierre
//    quedó 0: Pablo y Ariel con 0) y «Armado y conexionado del tablero general» (Marcos mandó 2 fotos y «se hizo», pero en el
//    cierre quedó 0 = «no se hizo»). La tarea del apoyo vale 18,5 puntos (configEquipo/baremo, como en la base de Ángel).
//  · OT-2026-150 (hace 20 días, CERRADA) en una quincena ya cerrada (cierresQuincena), con el apoyo en 0.
//  · Mirta (solo mirar).
const { DOM } = require('./h');
const { datos150 } = require('./datos150');
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAEUlEQVR4nGPQiOrBihiGlgQAR05DgXjxIegAAAAASUVORK5CYII=';
const qDe = (f) => { const [y, m, d] = f.split('-').map(Number); const ult = new Date(y, m, 0).getDate(), p = (n) => String(n).padStart(2, '0'); return d <= 15 ? { key: `${y}-${p(m)}-1`, desde: `${y}-${p(m)}-01`, hasta: `${y}-${p(m)}-15` } : { key: `${y}-${p(m)}-2`, desde: `${y}-${p(m)}-16`, hasta: `${y}-${p(m)}-${p(ult)}` }; };
function datos153() {
  const d = datos150(), ahora = Date.now(), ayer = d.ayer, t1 = ahora - 864e5;
  d.cuentas['mir@' + DOM] = { pass: 'clave123', uid: 'uMir' };
  d.db.usuarios.uMir = { email: 'mir@' + DOM, usuario: 'mir', nombre: 'Mirta Mira', rol: 'mirar', activo: true };
  const L = d.db.configEquipo.personal.lista;
  [['Bruno Sosa', 'Oficial'], ['Pablo Picone', 'Oficial'], ['Ariel Lastra', 'Oficial'], ['Hugo Paz', 'Ayudante']].forEach(([n, r]) => L.push({ nombre: n, rol: r, activo: true }));
  d.db.configEquipo.baremo = { baremo: { poste_tablero: { un: 'apoyo', pts: 18.5 }, acometida: { un: 'acometida', pts: 9.6 }, armado_tablero: { un: 'tablero', pts: 12 } } };
  d.db.avanceObras.p9 = { nombre: 'GEORG NICOLAI', plazaNombre: 'GEORG NICOLAI', obraId: '4110', direccion: 'Nicolai 1200', barrio: 'Alta Córdoba', tipo: 'plaza', lat: -31.39, lng: -64.18, creado: ahora,
    valorItems: [{ id: 1, itemPliego: '13', cantidad: 1, cantidadAvanzada: 0 }, { id: 2, itemPliego: '12', cantidad: 1, cantidadAvanzada: 1 }, { id: 3, itemPliego: '9', cantidad: 1, cantidadAvanzada: 0 }] };
  const per = [{ nombre: 'Marcos Ríos', rol: 'Oficial' }, { nombre: 'Bruno Sosa', rol: 'Oficial' }, { nombre: 'Pablo Picone', rol: 'Oficial' }, { nombre: 'Ariel Lastra', rol: 'Oficial' }];
  const pn = ['marcos rios', 'bruno sosa', 'pablo picone', 'ariel lastra'];
  const horas = { 'Marcos Ríos': 8, 'Bruno Sosa': 8, 'Pablo Picone': 8, 'Ariel Lastra': 8 };
  const ot = (numero, fecha, extra) => Object.assign({ numero, fecha, plazaId: 'p9', plazaNombre: 'GEORG NICOLAI', obraId: '4110', horaInicio: '07:30', horaFin: '15:30', cuadrilla: 'Marcos, Bruno, Pablo y Ariel', responsable: 'Marcos Ríos', personal: per.map((p) => Object.assign({}, p)), personalNombres: pn.slice(), actividadesManuales: [], vehiculos: [{ id: 'vC', nombre: 'Grúa 3', patente: 'AC 456 EF' }], vehiculoId: 'vC', creado: ahora - 3 * 864e5 }, extra);
  const fija = (fecha) => ({ cerradoTs: ahora - 36e5, fecha, cantidades: { acometida: 1 }, horasPersona: Object.assign({}, horas), horasPersonaV: 2, puntosTarea: { acometida: { 'Marcos Ríos': 4.8, 'Bruno Sosa': 4.8 } }, avanceItems: [],
    puntos: { total: 9.6, ts: ahora - 36e5, renglones: [{ k: 'acometida', tarea: 'Acometida EPEC → tablero', cant: 1, un: 'acometida', ptsUnit: 9.6, pts: 9.6 }], porPersona: [{ nombre: 'Marcos Ríos', rol: 'Oficial', pts: 4.8 }, { nombre: 'Bruno Sosa', rol: 'Oficial', pts: 4.8 }, { nombre: 'Pablo Picone', rol: 'Oficial', pts: 0 }, { nombre: 'Ariel Lastra', rol: 'Oficial', pts: 0 }] } });
  d.db.ordenesTrabajo.ot177 = ot('OT-2026-177', ayer, { actividades: ['acometida', 'poste_tablero', 'armado_tablero'], previsto: { acometida: 1, poste_tablero: 1, armado_tablero: 1 }, estado: 'Terminada',
    campo: {
      fotos: { tb1: { k: 'armado_tablero', tarea: 'Armado y conexionado del tablero general', cat: 'tablero', num: 'Tablero', por: 'Marcos Ríos', ts: t1 + 1, mini: PNG, distObra: 10 }, tb2: { k: 'armado_tablero', tarea: 'Armado y conexionado del tablero general', cat: 'tablero', num: 'Tablero', por: 'Marcos Ríos', ts: t1 + 2, mini: PNG, distObra: 12 } },
      marcas: { armado_tablero: { k: 'armado_tablero', hecho: true, cant: 1, por: 'Marcos Ríos', ts: t1 + 3 }, poste_tablero: { k: 'poste_tablero', hecho: true, cant: 1, por: 'Pablo Picone', ts: t1 + 3 }, acometida: { k: 'acometida', hecho: true, cant: 1, por: 'Marcos Ríos', ts: t1 + 3 } },
      enviados: { 'marcos rios': { ts: t1 + 5, nombre: 'Marcos Ríos' }, 'pablo picone': { ts: t1 + 6, nombre: 'Pablo Picone' } }
    },
    cierre: fija(ayer) });
  const viejo = d.dia(-20), q = qDe(viejo);
  d.db.ordenesTrabajo.ot150 = ot('OT-2026-150', viejo, { actividades: ['acometida', 'poste_tablero'], previsto: { acometida: 1, poste_tablero: 1 }, estado: 'Terminada', cierre: fija(viejo) });
  d.db.cierresQuincena = { [q.key]: { key: q.key, desde: q.desde, hasta: q.hasta, label: 'quincena cerrada de prueba', estado: 'cerrada', valorPunto: 1000, cerradoTs: ahora - 5 * 864e5, cerradoNombre: 'Ana Admin', total: 9.6, cerradas: 1, sinCerrar: 0,
    personas: [{ nombre: 'Marcos Ríos', pts: 4.8 }, { nombre: 'Bruno Sosa', pts: 4.8 }], ajustes: [], historial: [{ ts: ahora - 5 * 864e5, por: 'admin', txt: 'cerrada' }] } };
  d.q150 = q;
  return d;
}
module.exports = { datos153 };
