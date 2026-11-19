// v176 · datos del Guardián: la nómina real (15) + 3 vehículos + 12 precios de Gastos (bien) o como quedó el 18/11 (mal: 10 de la
// lista de ejemplo, sin vehículos, gastosRef vacío). op.ayer = la copia del día anterior ya guardada (adjuntos/cfg-<ayer> y
// configEquipo/salud.guardian.<ayer>) con la nómina buena. Usuarios: admin, Lucía (oficina), Roberto (Dirección), Juan y Pedro.
const { DOM } = require('./h');
const { datos174, nominaReal, VEH } = require('./datos174');
const GREF = () => { const o = {}; ['Gasoil', 'Nafta', 'Hormigón elaborado m3', 'Arena m3', 'Piedra m3', 'Cemento bolsa', 'Alquiler hidro día', 'Alquiler grúa día', 'Viático', 'Peaje', 'Volquete', 'Herramientas menores'].forEach((k, i) => { o[k] = { precio: 1000 + i * 100, un: 'Un.' }; }); return o; };
const dia = (n) => new Date(Date.now() - n * 864e5 - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
function datos176(op = {}) {
  const d = datos174({ mal: !!op.mal });
  const U = d.db.usuarios;
  Object.assign(d.cuentas, { ['ofi@' + DOM]: { pass: 'clave123', uid: 'uOfi' }, ['dir@' + DOM]: { pass: 'clave123', uid: 'uDir' } });
  U.uOfi = { email: 'ofi@' + DOM, usuario: 'ofi', nombre: 'Lucía Oficina', rol: 'oficina', activo: true };
  U.uDir = { email: 'dir@' + DOM, usuario: 'dir', nombre: 'Roberto Directo', rol: 'direccion', activo: true };
  d.db.configEquipo.precios = op.mal ? { gastosRef: {}, zonaContrato: 'A' } : { gastosRef: GREF(), zonaContrato: 'A' };
  d.db.configEquipo.cuadrillas = { lista: [{ nombre: 'Cuadrilla 1' }, { nombre: 'Cuadrilla 2' }] };
  d.db.adjuntos = d.db.adjuntos || {};
  if (op.ayer) {
    const f = dia(1), ts = Date.parse(f + 'T11:00:00Z');
    const per = { nomina: nominaReal(), vehiculos: VEH, ts: Date.parse('2026-11-17T12:00:00Z'), usuario: 'admin@' + DOM };
    const docs = { personal: per, cuadrillas: { lista: [{ nombre: 'Cuadrilla 1' }, { nombre: 'Cuadrilla 2' }] } };
    // precios: su copia del día va adentro de configEquipo/precios (lo lee solo el equipo), no en adjuntos
    d.db.configEquipo.precios.guardianCopias = [{ fecha: f, ts, por: 'admin@' + DOM, hash: 'x', datos: { gastosRef: GREF(), zonaContrato: 'A' } }];
    const cuentas = { nomina: 15, vehiculos: 3, gastosRef: 12, cuadrillas: 2 };
    const campos = { personal: { nomina: 15, vehiculos: 3 }, precios: { gastosRef: 12, zonaContrato: 1 }, cuadrillas: { lista: 2 } };
    d.db.adjuntos['cfg-' + f] = { tipo: 'respaldoCfg', fecha: f, ts, por: 'admin@' + DOM, docs, tam: { personal: 3000, precios: 600 }, cuentas, partes: [], huellas: { precios: 'x' }, enSuDoc: ['precios'] };
    d.db.configEquipo.salud = { guardian: { [f]: { estado: 'hecho', ts, por: 'admin@' + DOM, ids: ['cfg-' + f], cuentas, campos, tam: { personal: 3000, precios: 600 } } } };
  }
  return d;
}
module.exports = { datos176, dia, GREF };
