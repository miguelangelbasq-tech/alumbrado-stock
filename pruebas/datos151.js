// v151 · datos para t_v151 («📄 Falta documentación» y «✅ Terminadas»):
//  · PLAZA SAN PABLO (q1): avance 100 % (OT-2026-150 cerrada hace 3 días movió el avance), carpeta EPEC, conforme a obra cerrado,
//    planilla de PAT «en papel» y certificado con foto → documentación completa.
//  · PLAZA LAS ROSAS (q2): avance 100 % (OT-2026-151 hace 2 días), carpeta y conforme, SIN PAT ni certificado.
//  · BARRIO SAN VICENTE (q3, barrio): en curso (50 %), sin carpeta EPEC ni nada.
//  · PLAZA DEL SOL (q4): sin empezar (0 %), sin nada → no se le reclama documentación.
//  · Usuarios: Lucía (oficina), Mirta (mirar), Raúl (cuadrilla).
const { baseDatos, DOM } = require('./h');
const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAEUlEQVR4nGPQiOrBihiGlgQAR05DgXjxIegAAAAASUVORK5CYII=';
function datos151() {
  const d = baseDatos(), ahora = Date.now(), hoy = d.hoy;
  const dia = (n) => { const x = new Date(hoy + 'T12:00:00'); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
  ['lucia', 'mir', 'raul'].forEach((u, i) => { d.cuentas[u + '@' + DOM] = { pass: 'clave123', uid: ['uLucia', 'uMir', 'uRaul'][i] }; });
  const U = d.db.usuarios;
  U.uLucia = { email: 'lucia@' + DOM, usuario: 'lucia', nombre: 'Lucía Fernández', rol: 'oficina', activo: true };
  U.uMir = { email: 'mir@' + DOM, usuario: 'mir', nombre: 'Mirta Mira', rol: 'mirar', activo: true };
  U.uRaul = { email: 'raul@' + DOM, usuario: 'raul', nombre: 'Raúl Díaz', rol: 'cuadrilla', persona: 'Raúl Díaz', personaClave: 'raul diaz', activo: true };
  d.db.configEquipo.personal.lista.push({ nombre: 'Raúl Díaz', rol: 'Oficial', activo: true });
  const it = (cant, av) => [{ id: 1, itemPliego: '5', cantidad: cant, cantidadAvanzada: av }];
  d.db.avanceObras = {
    q1: { nombre: 'PLAZA SAN PABLO', obraId: '4101', direccion: 'San Pablo 200', barrio: 'Villa Allende', tipoObra: 'plaza', lat: -31.41, lng: -64.18, creado: ahora, valorItems: it(4, 4), carpetaEpec: dia(-40), coCierre: { cerrado: true, fecha: dia(-1), ts: ahora - 864e5, usuario: 'admin@' + DOM, modulos: 13 },
      documentos: { pat: { ok: true, fecha: dia(-2), papel: true, nota: 'carpeta de la oficina', por: 'admin@' + DOM, porNombre: 'Ana Admin', ts: ahora - 2 * 864e5 }, cert: { ok: true, fecha: dia(-1), adjId: 'adjCert1', tipoArch: 'foto', por: 'admin@' + DOM, porNombre: 'Ana Admin', ts: ahora - 864e5 } } },
    q2: { nombre: 'PLAZA LAS ROSAS', obraId: '4102', direccion: 'Las Rosas 50', barrio: 'Alto Alberdi', tipoObra: 'plaza', lat: -31.42, lng: -64.19, creado: ahora, valorItems: it(3, 3), carpetaEpec: dia(-30), coCierre: { cerrado: true, fecha: dia(-1), ts: ahora - 864e5, usuario: 'lucia@' + DOM, modulos: 9 } },
    q3: { nombre: 'BARRIO SAN VICENTE', obraId: '', direccion: 'Agustín Garzón 1500', barrio: 'San Vicente', tipoObra: 'barrio', lat: -31.43, lng: -64.16, creado: ahora, valorItems: it(4, 2) },
    q4: { nombre: 'PLAZA DEL SOL', obraId: '4104', direccion: 'Del Sol 10', barrio: 'Centro', tipoObra: 'plaza', lat: -31.40, lng: -64.20, creado: ahora, valorItems: it(2, 0) }
  };
  const per = [{ nombre: 'Raúl Díaz', rol: 'Oficial' }, { nombre: 'Pedro Gómez', rol: 'Ayudante' }];
  const ot = (numero, fecha, plaza, extra) => Object.assign({ numero, fecha, plazaId: plaza, plazaNombre: d.db.avanceObras[plaza].nombre, obraId: d.db.avanceObras[plaza].obraId, horaInicio: '07:30', horaFin: '15:30', cuadrilla: 'Raúl y Pedro', responsable: 'Raúl Díaz', personal: per, personalNombres: ['raul diaz', 'pedro gomez'], actividades: ['montaje_prfv'], previsto: { montaje_prfv: 2 }, actividadesManuales: [], creado: ahora - 5 * 864e5, creadoPor: 'lucia@' + DOM }, extra);
  d.db.ordenesTrabajo = {
    o150: ot('OT-2026-150', dia(-3), 'q1', { estado: 'Terminada', cierre: { cerradoTs: ahora - 3 * 864e5, fecha: dia(-3), cantidades: { montaje_prfv: 2 }, horas: 8, avanceItems: [{ id: 1, delta: 2, k: 'montaje_prfv' }] } }),
    o149: ot('OT-2026-149', dia(-6), 'q1', { estado: 'Terminada', cierre: { cerradoTs: ahora - 6 * 864e5, fecha: dia(-6), cantidades: { montaje_prfv: 2 }, horas: 8, avanceItems: [{ id: 1, delta: 2, k: 'montaje_prfv' }] } }),
    o151: ot('OT-2026-151', dia(-2), 'q2', { estado: 'Terminada', cierre: { cerradoTs: ahora - 2 * 864e5, fecha: dia(-2), cantidades: { montaje_prfv: 3 }, horas: 8, avanceItems: [{ id: 1, delta: 3, k: 'montaje_prfv' }] } }),
    o152: ot('OT-2026-152', dia(-1), 'q3', { estado: 'Terminada', cierre: { cerradoTs: ahora - 864e5, fecha: dia(-1), cantidades: { montaje_prfv: 2 }, horas: 8, avanceItems: [{ id: 1, delta: 2, k: 'montaje_prfv' }] } })
  };
  d.db.adjuntos = { adjCert1: { tipo: 'documento', doc: 'cert', plazaId: 'q1', plazaNombre: 'PLAZA SAN PABLO', dataUrl: PNG, w: 8, h: 8, bytes: 120, fecha: dia(-1), ts: ahora - 864e5, usuario: 'admin@' + DOM } };
  d.dia = dia;
  return d;
}
module.exports = { datos151, PNG };
