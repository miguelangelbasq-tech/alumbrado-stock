// Datos "tamaño real" para medir rendimiento: datos184 (usuarios/roles) + muestras de datos180/178 multiplicadas
// hasta las cantidades estimadas en ANALISIS_CUPO.md (≈ 250 obras, 250 órdenes, 3000 movimientos, ...).
const { datos184 } = require('./datos184');
const { datos180 } = require('./datos180');
const { datos178 } = require('./datos178');
const clon = o => JSON.parse(JSON.stringify(o));
function datosGrande(op) {
  op = op || {};
  const F = op.factor || 1;
  const d = datos184({ hab: true });
  const a = datos180({}), b = datos178({});
  const db = d.db;
  const mezclar = (src, col) => { db[col] = Object.assign({}, src.db[col] || {}, db[col] || {}); };
  ['movimientos', 'historialCalculos', 'reservas', 'historialEtapas', 'planSemanal', 'adjuntos', 'mapaPuntos', 'planosObra'].forEach(c => mezclar(a, c));
  ['herramientas', 'herramientasMov', 'cierresQuincena'].forEach(c => mezclar(b, c));
  const ahora = Date.now(), dia = 864e5;
  const fecha = t => new Date(t - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
  const obras0 = Object.entries(db.avanceObras);
  const obraIds = obras0.map(x => x[0]);
  const N = (n) => Math.round(n * F);
  // obras
  for (let i = 0; i < N(250) - obras0.length; i++) {
    const [id, o] = obras0[i % obras0.length]; const n = clon(o);
    n.nombre = n.plazaNombre = 'PLAZA PRUEBA ' + (i + 1); n.obraId = String(5000 + i);
    n.lat = (n.lat || -31.42) + (i % 20) * 0.01; n.lng = (n.lng || -64.18) + Math.floor(i / 20) * 0.01;
    n.puntos = Array.from({ length: 6 + (i % 14) }, (_, k) => 'Col ' + (k + 1));
    n.valorItems = [{ id: 1, itemPliego: '5', cantidad: n.puntos.length, cantidadAvanzada: (i % 5) / 5 }, { id: 2, itemPliego: '15', cantidad: 120, cantidadAvanzada: 0.3 }, { id: 3, itemPliego: '26', cantidad: 140, cantidadAvanzada: 0.2 }];
    const nid = 'g' + i; db.avanceObras[nid] = n; obraIds.push(nid);
  }
  // órdenes
  const ots0 = Object.values(db.ordenesTrabajo);
  for (let i = 0; i < N(250); i++) {
    const o = clon(ots0[i % ots0.length]); const t = ahora - (1 + (i % 60)) * dia; const oid = obraIds[i % obraIds.length];
    o.numero = 'OT-2026-' + String(300 + i).padStart(3, '0'); o.fecha = fecha(t); o.plazaId = oid; o.plazaNombre = db.avanceObras[oid].nombre; o.creado = t;
    if (o.estado !== 'Anulada') o.estado = 'Terminada';
    if (!o.cierre) o.cierre = { cerradoTs: t + 3e7, fecha: o.fecha, cantidades: o.previsto || {}, horas: 8 };
    db.ordenesTrabajo['ga' + i] = o;
  }
  // movimientos
  const cods = ['6010', '1019', '7015', '2009', '3017', '3053', '8001', '5040', '6006', '1010'];
  for (let i = 0; i < N(3000); i++) {
    const t = ahora - (i % 120) * dia - i * 1000; const oid = obraIds[i % obraIds.length]; const ent = i % 7 === 0;
    db.movimientos['gm' + i] = ent ? { tipo: 'entrada', numero: 'E-' + (1000 + i), codigo: cods[i % 10], desc: 'Material ' + cods[i % 10], cantidad: 50, un: 'Un.', proveedor: 'Proveedor ' + (i % 9), remito: '0001-' + i, precioUnit: 1000 + i % 300, fecha: fecha(t), ts: t, usuario: 'pan@ema-alumbrado.app' }
      : { tipo: 'salida', numero: 'S-' + (1000 + i), valeGrupo: 'S-' + (1000 + Math.floor(i / 3)), codigo: cods[i % 10], desc: 'Material ' + cods[i % 10], cantidad: 1 + i % 6, un: 'Un.', plazaId: oid, destino: db.avanceObras[oid].nombre, fecha: fecha(t), ts: t, usuario: 'pan@ema-alumbrado.app' };
  }
  const rep = (col, n, f) => { const s = Object.values(db[col] || {}); if (!s.length) return; for (let i = 0; i < N(n); i++) { const x = clon(s[i % s.length]); f && f(x, i); db[col]['gx' + col + i] = x; } };
  rep('historialEtapas', 400, (x, i) => { const oid = obraIds[i % obraIds.length]; x.plazaId = oid; x.plazaNombre = db.avanceObras[oid].nombre; x.ts -= i * 1e6; });
  rep('herramientasMov', 400, (x, i) => { x.ts = (x.ts || ahora) - i * 1e6; });
  rep('herramientas', 150, (x, i) => { x.codigo = 'H-' + (200 + i); x.nombre = (x.nombre || 'Herramienta') + ' ' + i; });
  rep('historialCalculos', 150, (x, i) => { const oid = obraIds[i % obraIds.length]; x.plazaId = oid; x.nombre = db.avanceObras[oid].nombre; x.ts -= i * 1e6; });
  rep('reservas', 100, (x, i) => { x.numero = 'R-' + (2000 + i); x.estado = ['pendiente', 'entregada', 'lista', 'anulada'][i % 4]; });
  rep('planSemanal', 100, (x, i) => { x.ts -= i * 1e6; });
  rep('gastosObra', 300, (x, i) => { const oid = obraIds[i % obraIds.length]; x.plazaId = oid; x.ts = (x.ts || ahora) - i * 1e6; });
  rep('fotosObra', 400, (x, i) => { x.adjId = 'gf' + i; x.ts = (x.ts || ahora) - i * 6e5; x.fecha = fecha(x.ts); const oid = obraIds[i % 30]; x.plazaId = oid; });
  return d;
}
module.exports = { datosGrande };
