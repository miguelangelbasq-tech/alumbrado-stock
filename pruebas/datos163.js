// v163 · datos para t_v163 (poner al día el avance de obra a mano, sin que lo frene el fraguado). Sobre datos158:
//  · PLAZA BULEVARES (b1) con sus órdenes (cerradas, falla en la Col 2, hormigón de ayer fraguando en Col 7–9).
//  · PLAZA VIEJA (b3, ID 4031): obra vieja ya hecha que nunca se cargó; sin órdenes; 12 columnas PRFV en 2 circuitos, 1 tablero a
//    nivel, zanja/cable 380 m, 1 cruce (como Bulevares) y los papeles completos (carpeta, conforme, PAT, certificado).
//  · PLAZA MEDIA (b4, ID 4032): lo mismo, sin órdenes y sin papeles (para «desde Col 1 hasta Col 6, hasta el izaje»).
const { DOM } = require('./h');
const { datos158 } = require('./datos158');
function datos163(op = {}) {
  const d = datos158(op), hoy = d.hoy;
  const dia = (n) => { const x = new Date(hoy + 'T12:00:00'); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
  const b1 = d.db.avanceObras.b1, h = d.db.historialCalculos.h158;
  const clon = (o) => JSON.parse(JSON.stringify(o));
  const obra = (id, nombre, oid, extra) => {
    const o = Object.assign(clon(b1), { nombre, plazaNombre: nombre, obraId: oid, direccion: 'Calle ' + oid, barrio: 'B° ' + nombre.split(' ').pop(), lat: -31.41 - Number(oid) / 1e6, lng: -64.18, fechaEstimada: dia(30), carpetaEpec: '' }, extra || {});
    o.valorItems.forEach((r) => { r.cantidadAvanzada = 0; });
    d.db.avanceObras[id] = o;
    d.db.historialCalculos['h' + id] = Object.assign(clon(h), { nombre, id: oid, form: Object.assign(clon(h.form), { campos: Object.assign({}, h.form.campos, { obraNombre: nombre, obraId: oid }) }) });
  };
  obra('b3', 'PLAZA VIEJA', '4031', { carpetaEpec: dia(-200), coCierre: { cerrado: true, fecha: dia(-90), usuario: 'admin@' + DOM }, documentos: { pat: { ok: true, fecha: dia(-95), papel: true, por: 'admin@' + DOM, ts: Date.now() - 864e5 * 95 }, cert: { ok: true, fecha: dia(-95), papel: true, por: 'admin@' + DOM, ts: Date.now() - 864e5 * 95 } } });
  obra('b4', 'PLAZA MEDIA', '4032');
  // Pablo (pañol), para ver que no tiene el botón
  Object.assign(d.cuentas, { ['pan@' + DOM]: { pass: 'clave123', uid: 'uPan' } });
  d.db.usuarios.uPan = { email: 'pan@' + DOM, usuario: 'pan', nombre: 'Pablo Pañol', rol: 'panol', activo: true };
  return d;
}
module.exports = { datos163 };
