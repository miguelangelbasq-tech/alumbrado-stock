// v179 · datos: la nómina real de la v174 (15 personas, Víctor Exequiel Franco de Alumbrado con «equipo civil», Vizgarra de
// Ilícitos) + una persona en cada sector nuevo: Ramón Paredes (Civil), Carlos Tercero (Contratista), Lucía Oficina (Oficina),
// Roberto Dirección (Dirección) y Pablo Pañol (Pañol). Usuarios: Lucía oficina, dir, pan, mir. Un vale de Vizgarra (Ilícitos) y
// uno de Ramón (Civil → Alumbrado) este mes.
const { datos174 } = require('./datos174');
const { DOM } = require('./h');
const EXTRA = [['51500', 'Ramón Paredes', 'civil', 'Oficial'], ['', 'Carlos Tercero', 'contratista', 'Oficial'], ['51600', 'Lucía Oficina', 'oficina', 'Capataz'], ['51601', 'Roberto Dirección', 'direccion', 'Capataz'], ['51602', 'Pablo Pañol', 'panol', 'Ayudante']];
function datos179(op) {
  op = op || {};
  const d = datos174(op);
  d.db.configEquipo.personal.nomina = d.db.configEquipo.personal.nomina.concat(EXTRA.map(([l, n, s, r]) => ({ legajo: l, nombre: n, sector: s, rol: r, valorHora: 4500, vehiculoId: '', activo: true })));
  const U = { lucia: ['uLucia', 'Lucía Oficina', 'oficina'], dir: ['uDir', 'Roberto Dirección', 'direccion'], pan: ['uPan', 'Pablo Pañol', 'panol'], mir: ['uMir', 'Mirta Mira', 'mirar'] };
  Object.keys(U).forEach((k) => { const [uid, nombre, rol] = U[k]; d.cuentas[k + '@' + DOM] = { pass: 'clave123', uid }; d.db.usuarios[uid] = { email: k + '@' + DOM, usuario: k, nombre, rol, activo: true }; });
  const hoy = new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  d.db.movimientos = d.db.movimientos || {};
  d.db.movimientos.m179a = { tipo: 'salida', codigo: 6010, desc: 'Luminaria LED', un: 'Un.', cantidad: 2, fecha: hoy, ts: Date.now() - 5e5, usuario: 'admin@' + DOM, retiradoPor: 'Vizgarra Alfredo', sector: 'ilicitos', valeGrupo: 'S-0101', numero: 'S-0101' };
  d.db.movimientos.m179b = { tipo: 'salida', codigo: 6010, desc: 'Luminaria LED', un: 'Un.', cantidad: 3, fecha: hoy, ts: Date.now() - 4e5, usuario: 'admin@' + DOM, retiradoPor: 'Ramón Paredes', sector: 'alumbrado', valeGrupo: 'S-0102', numero: 'S-0102' };
  return d;
}
module.exports = { datos179, EXTRA };
