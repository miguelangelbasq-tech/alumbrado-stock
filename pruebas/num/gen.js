// Genera fotometrías sintéticas (LDT con las 5 simetrías + IES) desde fórmulas conocidas y casos de red, y deja lo que calcula la app.
const C = require('../calc_node.js')(process.argv[2]);
const fs = require('fs');
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
const out = { foto: [], red: [] };
const rng = (() => { let s = 12345; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
const casos = [[1, 'rot'], [2, 'c0'], [3, 'c90'], [4, 'quad'], [0, 'full']];
casos.forEach(([isym, k]) => {
  const txt = ldt(isym, F[k], 72, 37, 85, 10000, 98.5);
  const p = C.parseLDT(txt);
  const muestras = [];
  for (let n = 0; n < 400; n++) { const c = rng() * 360, g = rng() * 90; muestras.push([c, g, C.intens(p.i, c, g)]); }
  out.foto.push({ fmt: 'LDT', isym, k, lm: p.lm, W: p.W, nombre: p.nombre, ctrl: p.control, muestras });
});
// IES con las 4 simetrías
[['rot', [0]], ['c0', Array.from({ length: 37 }, (_, i) => i * 5)], ['quad', Array.from({ length: 19 }, (_, i) => i * 5)], ['c90', Array.from({ length: 37 }, (_, i) => 90 + i * 5)], ['full', Array.from({ length: 73 }, (_, i) => i * 5)]].forEach(([k, Hs]) => {
  const Vs = Array.from({ length: 37 }, (_, i) => i * 5);
  const p = C.parseIES(ies(F[k], Hs, Vs, 10000, true));
  const muestras = [];
  for (let n = 0; n < 400; n++) { const c = rng() * 360, g = rng() * 90; muestras.push([c, g, C.intens(p.i, c, g)]); }
  out.foto.push({ fmt: 'IES', k, lm: p.lm, W: p.W, nombre: p.nombre, muestras });
});
// iluminancia: una plaza con 6 columnas y luminaria «c0» asimétrica
const base = { lat: -31.4201, lng: -64.1888 };
const pl = C.plano0(base.lat, base.lng);
const pos = [[0, 0], [25, 3], [48, -2], [5, 30], [30, 34], [52, 28]];
const ps = [{ id: 't1', n: 'T1', tipo: 'tab', ...pl.aLL(-6, -6) }];
pos.forEach((q, i) => { const ll = pl.aLL(q[0], q[1]); ps.push({ id: 'c' + i, n: 'C' + (i + 1), tipo: 'colN', lat: ll.lat, lng: ll.lng, el: { tab: 't1', circ: 1 + (i % 2), col: i === 2 ? 'P10' : 'P7', art: i === 4 ? 2 : 1, lum: 'L1', mira: (i * 37) % 360 } }); });
[[-8, -8], [60, -8], [60, 42], [-8, 42]].forEach((q, i) => { const ll = pl.aLL(q[0], q[1]); ps.push({ id: 'b' + i, n: 'B' + (i + 1), tipo: 'borde', lat: ll.lat, lng: ll.lng }); });
const fotC0 = C.parseLDT(ldt(2, F.c0, 72, 37, 85, 10000, 98.5));
const lums = [{ id: 'L1', nombre: 'Prueba', W: 98.5, lm: 8500, cos: 0.95, fot: fotC0 }];
const cfg = C.cfgDe({ calc: { clase: 'P3', fm: 0.8 } });
const r = C.luz(ps, lums, cfg, { paso: 1 });
const ptsE = [];
for (let n = 0; n < 60; n++) { const x = -8 + rng() * 68, y = -8 + rng() * 50; ptsE.push([x, y, C.eEn(r.arts, x, y, 0.8)]); }
const rad = C.radios(r, cfg);
out.luz = { arts: r.arts.map((a) => ({ x: a.x, y: a.y, h: a.h, az: a.az, lm: a.lm })), ptsE, em: r.em, emin: r.emin, emax: r.emax, nx: r.nx, ny: r.ny, x0: r.x0, y1: r.y1, paso: r.paso, zona: r.zona, puntos: r.puntos, E: Array.from(r.E), dentro: Array.from(r.dentro), radios: rad, pos };
// red eléctrica: 40 casos al azar (árboles con ramas, fases fijas y automáticas, 3F y 1F)
for (let caso = 0; caso < 40; caso++) {
  const n = 3 + Math.floor(rng() * 14), ps2 = [{ id: 'T', n: 'T1', tipo: 'tab', lat: base.lat, lng: base.lng }];
  for (let i = 0; i < n; i++) {
    const ll = pl.aLL((rng() - 0.3) * 120, (rng() - 0.3) * 120);
    const el = { tab: 'T', circ: 1, art: 1 + Math.floor(rng() * 3), lum: rng() < 0.5 ? 'A' : 'B', col: rng() < 0.7 ? 'P7' : 'M7' };
    if (i > 1 && rng() < 0.4) el.de = 'c' + Math.floor(rng() * i);   // rama
    if (rng() < 0.15) el.fase = 'RST'[Math.floor(rng() * 3)];
    if (rng() < 0.1) el.m = 20 + Math.floor(rng() * 40);
    ps2.push({ id: 'c' + i, n: 'C' + (i + 1), tipo: 'colN', lat: ll.lat, lng: ll.lng, el });
  }
  const tri = caso % 5 !== 4;
  const circ = { 'T|1': { mat: caso % 7 === 3 ? 'Al' : 'Cu', sec: [4, 6, 10, 16][caso % 4], tipo: tri ? '3F' : '1F', fase: 'S' } };
  const lm2 = [{ id: 'A', W: 60 + Math.floor(rng() * 140), cos: 0.9 + rng() * 0.09 }, { id: 'B', W: 40 + Math.floor(rng() * 100), cos: 0.95 }];
  const cond = caso % 2 ? 5 : 2, cfg2 = C.cfgDe({ calc: { temp: 70, reserva: 5, subida: 3.5, subLum: 7, x: 0.08, cond } });
  const rr = C.red(ps2, lm2, circ, cfg2);
  const c = rr.circuitos[0];
  // también la caída con el reparto «sin mejorar» (R,S,T rotando), para ver que el automático no empeora
  out.red.push({ ps: ps2, lums: lm2, circ: circ['T|1'], cfg: { vll: cfg2.vll, temp: 70, reserva: 5, subida: 3.5, subLum: 7, x: 0.08, cond }, padres: c.ids.map((id) => [id, rr.cols[id].padre, rr.cols[id].metros]), arts: c.arts, dvMax: c.dvMax, Ia: c.Ia, IN: c.IN, P: c.P, In: c.prot.In, cable: c.cable, avisos: c.avisos });
}
out.catalogo = [4, 6, 10].map((s) => C.rKm('Cu', s, 70, 5));
fs.writeFileSync('casos.json', JSON.stringify(out));
console.log('ok', out.foto.length, out.red.length, 'luz', r.nx, r.ny, r.em.toFixed(2), r.emin.toFixed(2));
