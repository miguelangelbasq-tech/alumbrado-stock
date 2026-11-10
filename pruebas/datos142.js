// v142 · datos de una cuadrilla en obra (Plaza Los Álamos, Juan y Pedro) para t_v142 y las capturas
const { baseDatos, DOM } = require('./h');
function datos142(op = {}) {
  const d = baseDatos(), ahora = Date.now(), hoy = d.hoy;
  const menos = (n) => { const x = new Date(hoy + 'T12:00:00'); x.setDate(x.getDate() - n); return x.toISOString().slice(0, 10); };
  Object.assign(d.cuentas, { ['lucia@' + DOM]: { pass: 'clave123', uid: 'uLucia' }, ['raul@' + DOM]: { pass: 'clave123', uid: 'uRaul' } });
  d.db.usuarios.uJuan = { email: 'juan@' + DOM, usuario: 'juan', nombre: 'Juan Pérez', rol: 'cuadrilla', persona: 'Juan Pérez', personaClave: 'juan perez', activo: true };
  d.db.usuarios.uPedro = { email: 'pedro@' + DOM, usuario: 'pedro', nombre: 'Pedro Gómez', rol: 'cuadrilla', persona: 'Pedro Gómez', personaClave: 'pedro gomez', activo: true };
  d.db.usuarios.uLucia = { email: 'lucia@' + DOM, usuario: 'lucia', nombre: 'Lucía Fernández', rol: 'oficina', activo: true };
  d.db.usuarios.uRaul = { email: 'raul@' + DOM, usuario: 'raul', nombre: 'Raúl Sosa', rol: 'panol', activo: true };
  d.db.configEquipo.personal = { lista: [{ nombre: 'Juan Pérez', rol: 'Oficial', activo: true }, { nombre: 'Pedro Gómez', rol: 'Ayudante', activo: true }, { nombre: 'Lucas Martínez', rol: 'Oficial', activo: true }] };
  if (op.contactos !== false) d.db.configEquipo.personal.contactos = [{ nombre: 'Ángel Díaz', rol: 'admin', tel: '351 555 0101' }, { nombre: 'Lucía Fernández', rol: 'oficina', tel: '0351 15 555 0202', email: 'lucia@' + DOM }, { nombre: 'Raúl Sosa', rol: 'panol', tel: '' }];
  d.db.avanceObras = { p1: { nombre: 'Plaza Los Álamos', plazaNombre: 'Plaza Los Álamos', obraId: '4031', direccion: 'Los Álamos y Pje. 12', barrio: 'B° Villa Rivera', tipo: 'plaza', lat: -31.4271, lng: -64.1889, creado: ahora, valorItems: [{ id: 1, itemPliego: '5', cantidad: 8, cantidadAvanzada: 4 }], puntos: ['Col 1', 'Col 2', 'Col 3', 'Col 4', 'Col 5', 'Col 6', 'Col 7', 'Col 8'] } };
  const per = [{ nombre: 'Juan Pérez', rol: 'Oficial' }, { nombre: 'Pedro Gómez', rol: 'Ayudante' }];
  d.db.ordenesTrabajo = {
    ot134: { numero: 'OT-2026-134', fecha: hoy, plazaId: 'p1', plazaNombre: 'Plaza Los Álamos', obraId: '4031', direccion: 'Los Álamos y Pje. 12', barrio: 'B° Villa Rivera', horaInicio: '07:30', horaFin: '15:30', cuadrilla: 'Cuadrilla 1', responsable: 'Juan Pérez', personal: per, personalNombres: ['juan perez', 'pedro gomez'], actividades: ['montaje_prfv', 'vinculo_luminaria', 'bpn'], previsto: { montaje_prfv: 4, vinculo_luminaria: 4, bpn: 4 }, actividadesManuales: [], vehiculos: [{ id: 'v1', nombre: 'Hidroelevador · Interno 3', patente: 'AB 123 CD' }], supervisor: { uid: 'uLucia', email: 'lucia@' + DOM, nombre: 'Lucía Fernández' }, estado: 'Emitida', notas: 'Ojo con el cantero de la Col 8, hay riego.', creado: ahora, creadoPor: 'admin@' + DOM },
    ot129: { numero: 'OT-2026-129', fecha: menos(1), plazaId: 'p1', plazaNombre: 'Plaza Los Álamos', obraId: '4031', horaInicio: '07:30', cuadrilla: 'Cuadrilla 1', personal: per, personalNombres: ['juan perez', 'pedro gomez'], actividades: ['montaje_prfv'], previsto: { montaje_prfv: 4 }, estado: 'Terminada', creado: ahora - 864e5,
      campo: { fotos: { fa: { por: 'Juan Pérez', ts: ahora - 864e5, k: 'montaje_prfv', cat: 'columna', num: 'Col 1' }, fb: { por: 'Juan Pérez', ts: ahora - 864e5, k: 'montaje_prfv', cat: 'columna', num: 'Col 2' }, fc: { por: 'Juan Pérez', ts: ahora - 864e5, k: 'montaje_prfv', cat: 'columna', num: 'Col 3' }, fd: { por: 'Juan Pérez', ts: ahora - 864e5, k: 'montaje_prfv', cat: 'columna', num: 'Col 4' } } },
      cierre: { cerradoTs: ahora - 864e5 / 2, cantidades: { montaje_prfv: 4 }, horas: 6, puntos: { total: 24, porPersona: [{ nombre: 'Juan Pérez', pts: 12 }, { nombre: 'Pedro Gómez', pts: 12 }], renglones: [] } } }
  };
  d.db.reservas = { r45: { numero: 'R-0045', estado: 'lista', otId: 'ot134', otNumero: 'OT-2026-134', plazaId: 'p1', plazaNombre: 'Plaza Los Álamos', para: 'Juan Pérez', items: [{ codigo: 6010, cantidad: 4, entregado: 4 }, { codigo: 2009, cantidad: 12, entregado: 0 }, { codigo: 3017, cantidad: 8, entregado: 0 }, { codigo: 1010, cantidad: 4, entregado: 4 }], creado: ahora, creadoPor: 'admin@' + DOM, creadoNombre: 'Ana Admin', historial: [] } };
  d.db.herramientas = { h1: { codigo: 'H-003', nombre: 'Eslingas de 2 m', estado: 'asignada', asignadaA: 'Juan Pérez', creado: ahora }, h2: { codigo: 'H-031', nombre: 'Pinza crimpeadora', estado: 'asignada', asignadaA: 'Lucas Martínez', creado: ahora }, h3: { codigo: 'H-010', nombre: 'Nivel de burbuja', estado: 'libre', creado: ahora } };
  return d;
}
module.exports = { datos142 };
