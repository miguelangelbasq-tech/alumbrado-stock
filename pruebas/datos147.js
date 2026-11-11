// v147 · datos para t_v147 (Mapa de guerra, pasos de la cuadrilla, informe semanal), sobre datos144 (obras con ubicación).
// Hoy: Juan y Pedro en BULEVARES (OT-2026-203, grúa, Juan en vivo cerca, 2 bases hormigonadas hace 1 h → fraguado);
// mañana: LAS ACACIAS (OT-2026-204) con la reserva R-0050 de 4 luminarias y 0 en stock → falta material;
// ayer: LOS ÁLAMOS (OT-2026-200) sin cerrar; Hugo Díaz en la nómina sin tarea; SIN PIN sin ubicación; contactos: solo Lucía.
const { DOM } = require('./h');
const { datos144, P } = require('./datos144');
function datos147() {
  const d = datos144(), ahora = Date.now(), hoy = d.hoy;
  const mas = (n) => { const x = new Date(hoy + 'T12:00:00'); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
  Object.assign(d.cuentas, { ['pan@' + DOM]: { pass: 'clave123', uid: 'uPan' } });
  d.db.usuarios.uPan = { email: 'pan@' + DOM, usuario: 'pan', nombre: 'Pablo Pañol', rol: 'panol', activo: true };
  d.db.configEquipo.personal = {
    lista: [{ nombre: 'Juan Pérez', rol: 'Oficial', activo: true }, { nombre: 'Pedro Gómez', rol: 'Ayudante', activo: true }, { nombre: 'Hugo Díaz', rol: 'Ayudante', activo: true }],
    vehiculos: [{ id: 'v1', nombre: 'Grúa 1', patente: 'AB123CD', tipo: 'grua' }, { id: 'v2', nombre: 'Camioneta 2', patente: 'AC456EF', tipo: 'transporte' }],
    contactos: [{ nombre: 'Lucía Fernández', rol: 'oficina', tel: '351 555-1234' }]
  };
  const ot1 = d.db.ordenesTrabajo.ot1;
  Object.assign(ot1, { estado: 'En curso', vehiculoId: 'v1', vehiculos: [{ id: 'v1', nombre: 'Grúa 1', patente: 'AB123CD' }], actividades: ['montaje_prfv', 'hormigonado'], previsto: { montaje_prfv: 4, hormigonado: 2 },
    campo: { llegada: { 'juan perez': { ts: ahora - 3 * 36e5, lat: P.bul[0], lng: P.bul[1], enObra: true } }, pasosObra: { hormigonado: { 'Col 5': { estado: 'si', ts: ahora - 36e5 }, 'Col 6': { estado: 'si', ts: ahora - 36e5 } } } } });
  d.db.ordenesTrabajo.ot3 = { numero: 'OT-2026-200', fecha: mas(-1), plazaId: 'p4', plazaNombre: 'Plaza Los Álamos', obraId: '7662', horaInicio: '07:30', cuadrilla: 'Cuadrilla 1', responsable: 'Juan Pérez', personal: [{ nombre: 'Juan Pérez', rol: 'Oficial' }, { nombre: 'Pedro Gómez', rol: 'Ayudante' }], personalNombres: ['juan perez', 'pedro gomez'], actividades: ['excavacion'], previsto: { excavacion: 2 }, actividadesManuales: [], estado: 'En curso', campo: { enviados: { 'juan perez': { ts: ahora - 864e5 } } }, creado: ahora - 864e5 };
  d.db.reservas = { rs1: { numero: 'R-0050', plazaId: 'p3', plazaNombre: 'Plaza Las Acacias', estado: 'pendiente', items: [{ codigo: '6010', desc: 'Luminaria LED 75 W', un: 'Un.', cant: 4, entregado: 0 }], creado: ahora, creadoPor: 'lucia@' + DOM } };
  d.db.ubicacionVivo = { uJuan: { uid: 'uJuan', email: 'juan@' + DOM, persona: 'Juan Pérez', clave: 'juan perez', lat: P.bul[0] + 0.004, lng: P.bul[1] - 0.003, acc: 9, vel: 0, ts: ahora, posTs: ahora, fuente: 'app', activo: true } };
  d.db.configEquipo.ubicacion = { activo: true, desde: '00:00', hasta: '23:59', dias: [0, 1, 2, 3, 4, 5, 6], cadaSeg: 60 };
  // informe semanal: una orden cerrada el lunes de esta semana (BULEVARES, 2 columnas = ítem 5) y una de la semana pasada (LOS ÁLAMOS)
  const lun = (() => { const x = new Date(hoy + 'T12:00:00'); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x.toISOString().slice(0, 10); })();
  const lunAnt = (() => { const x = new Date(lun + 'T12:00:00'); x.setDate(x.getDate() - 7); return x.toISOString().slice(0, 10); })();
  const per = [{ nombre: 'Juan Pérez', rol: 'Oficial' }, { nombre: 'Pedro Gómez', rol: 'Ayudante' }];
  d.db.ordenesTrabajo.ot4 = { numero: 'OT-2026-190', fecha: lun, plazaId: 'p1', plazaNombre: 'Plaza Bulevares', obraId: '4045', cuadrilla: 'Cuadrilla 1', personal: per, personalNombres: ['juan perez', 'pedro gomez'], actividades: ['montaje_prfv'], previsto: { montaje_prfv: 2 }, actividadesManuales: [], estado: 'Terminada', cierre: { cerradoTs: ahora, fecha: lun, horas: 8, cantidades: { montaje_prfv: 2 }, avanceItems: [{ id: '5', delta: 2 }] }, campo: { fotos: { f1: { por: 'Juan Pérez' }, f2: { por: 'Pedro Gómez' } } }, creado: ahora };
  d.db.ordenesTrabajo.ot5 = { numero: 'OT-2026-180', fecha: lunAnt, plazaId: 'p4', plazaNombre: 'Plaza Los Álamos', obraId: '7662', cuadrilla: 'Cuadrilla 1', personal: per, personalNombres: ['juan perez', 'pedro gomez'], actividades: ['excavacion'], previsto: { excavacion: 1 }, actividadesManuales: [], estado: 'Terminada', cierre: { cerradoTs: ahora, fecha: lunAnt, horas: 8, cantidades: { excavacion: 1 }, avanceItems: [{ id: '1', delta: 1 }] }, creado: ahora };
  d.lun = lun; d.lunAnt = lunAnt;
  return d;
}
module.exports = { datos147, P };
