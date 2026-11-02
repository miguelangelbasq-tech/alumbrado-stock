const R = Math.PI / 180;
// distribuciones de prueba (cd/klm de lámpara), con la simetría que corresponde
const F = {
  rot: (c, g) => g < 90 ? 300 * Math.cos(g * R) + 80 * Math.sin(2 * g * R) : 0,
  c0: (c, g) => g < 95 ? (250 + 150 * Math.cos(c * R) * Math.sin(g * R)) * Math.max(0, Math.cos(g * R * 0.9)) : 0,
  c90: (c, g) => g < 95 ? (250 + 150 * Math.sin(c * R) * Math.sin(g * R)) * Math.max(0, Math.cos(g * R * 0.9)) : 0,
  quad: (c, g) => g < 95 ? (250 + 120 * Math.cos(2 * c * R) * Math.sin(g * R)) * Math.max(0, Math.cos(g * R * 0.9)) : 0,
  full: (c, g) => g < 95 ? (250 + 100 * Math.cos(c * R) * Math.sin(g * R) + 60 * Math.sin(c * R) * Math.sin(g * R)) * Math.max(0, Math.cos(g * R * 0.9)) : 0,
};
function ldt(isym, f, Mc, Ng, lorl, flujo, W) {
  const Dc = 360 / Mc, Dg = 180 / (Ng - 1);
  const Cs = []; for (let i = 0; i < Mc; i++) Cs.push(i * Dc);
  const Gs = []; for (let j = 0; j < Ng; j++) Gs.push(j * Dg);
  let mc1 = 1, mc2 = Mc;
  if (isym === 1) mc2 = 1; else if (isym === 2) mc2 = Mc / 2 + 1; else if (isym === 3) { mc1 = 3 * Mc / 4 + 1; mc2 = mc1 + Mc / 2; } else if (isym === 4) mc2 = Mc / 4 + 1;
  const L = ['FABRICA PRUEBA', '1', String(isym), String(Mc), String(Dc), String(Ng), String(Dg), 'informe', 'LUMINARIA PRUEBA ISYM ' + isym, 'X1', 'x.ldt', 'hoy', '500', '200', '100', '400', '150', '0', '0', '0', '0', '100', String(lorl), '1.0', '0', '1', '1', 'LED', String(flujo), '4000K', '70', String(W)];
  for (let k = 0; k < 10; k++) L.push('0.5');
  Cs.forEach((c) => L.push(c.toFixed(1))); Gs.forEach((g) => L.push(g.toFixed(1)));
  for (let k = mc1 - 1; k <= mc2 - 1; k++) { const c = Cs[k % Mc]; Gs.forEach((g) => L.push(f(c, g).toFixed(2))); }
  return L.join('\r\n');
}
function ies(f, Hs, Vs, lm, abs) {
  const L = ['IESNA:LM-63-2002', '[TEST] prueba', '[MANUFAC] FABRICA IES', '[LUMINAIRE] LUMINARIA IES', 'TILT=NONE', `1 ${abs ? -1 : 10000} 1 ${Vs.length} ${Hs.length} 1 2 0.2 0.5 0.1`, '1 1 98.5', Vs.join(' '), Hs.join(' ')];
  Hs.forEach((h) => { const fila = Vs.map((v) => (f(h, v) * 10).toFixed(3)); L.push(fila.join(' ')); });   // ×10: candelas absolutas (10 klm)
  return L.join('\n');
}
module.exports = { F, ldt, ies };
