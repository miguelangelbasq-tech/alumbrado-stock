/* MAT-SENAL_SELLADO-3 (grupo «nobra») · señalización de obra y de zanja: cerco con malla de seguridad vial naranja 1 m (1035) entre dos estacas,
 * cinta de peligro (8038) corrida arriba con su rollo, y adelante la malla subterránea «Peligro eléctrico» de 15 cm (1052) extendida con su rollo,
 * al lado de un tramo de la de 30 cm (8017) para comparar. Medidas: MVIAL, CINTAP, MALLA15 (AC salvo ancho y largo del pañol). */
import { MVIAL as V, CINTAP as CP, MALLA15 as M15 } from '../piezas/perfiles_nobra.mjs';
import { matsC } from '../piezas/civil_util.mjs';
function mallaRombo(R, mat, x0, y0, W, Lx, rombo, h, leyenda, t = .5) {
  const T = R.THREE, [rx, ry] = rombo, box = new T.BoxGeometry(1, h, t); box.deleteAttribute('uv');
  const seg = []; const ban = [[0, 8], [W / 2 - 18, W / 2 + 18], [W - 8, W]];
  const libre = (y) => !ban.some(([a, b]) => y > a && y < b);
  for (const s of [1, -1]) for (let k = -Math.ceil(W / ry) - 2; k < Lx / rx + 2; k++) {
    const xk = k * rx, dx = rx / 2, dy = ry / 2; let pts = [];
    for (let y = 0; y <= W; y += 2) { const x = xk + s * (y / dy) * dx; if (x >= 0 && x <= Lx && libre(y)) pts.push([x, y]); else { if (pts.length > 1) seg.push(pts); pts = []; } }
    if (pts.length > 1) seg.push(pts);
  }
  const im = new T.InstancedMesh(box, mat, seg.length), M4 = new T.Matrix4(), Q = new T.Quaternion(), S = new T.Vector3();
  seg.forEach((p, i) => { const a = p[0], b = p[p.length - 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]); Q.setFromAxisAngle(new T.Vector3(0, 0, 1), Math.atan2(b[1] - a[1], b[0] - a[0])); S.set(L + h, 1, 1);
    M4.compose(new T.Vector3(x0 + (a[0] + b[0]) / 2, y0 + (a[1] + b[1]) / 2, t / 2), Q, S); im.setMatrixAt(i, M4); });
  im.castShadow = im.receiveShadow = true; R.sinBorde(im); R.raiz.add(im);
  for (const [a, b] of ban) R.caja(x0, x0 + Lx, y0 + a, y0 + b, 0, t, mat, { r: 0 });
  for (let x = 40; x < Lx - 160; x += 320) R.impreso([leyenda], 230, 30, [x0 + x + 110, y0 + W / 2, t + .2], [1, 0, 0], [0, 1, 0], { color: '#ffffff', px: 26, sep: .3 });
}
function rollo(R, c, W, Ri, Rr, mat, matN) {
  R.torno([c[0], c[1], c[2]], [c[0], c[1] + W, c[2]], [[Ri, 0], [Rr, 0], [Rr, W], [Ri, W], [Ri, 0]], mat, { seg: 96 });
  R.torno([c[0], c[1] - 3, c[2]], [c[0], c[1] + W + 3, c[2]], [[Ri - 5, 0], [Ri, 0], [Ri, W + 6], [Ri - 5, W + 6], [Ri - 5, 0]], matN, { seg: 64 });
}
export default function (R) {
  R.vista({ az: -24, el: 22, fov: 15, margen: .035 });
  R.config({ bordeOp: .22 });
  const M = matsC(R), T = R.THREE, nar = R.M.pa('#ff7417', { roughness: .55 }), roja = M.malla;
  // ---- cerco: 2 estacas de madera y la malla vial de 1 m (ojos ovalados ≈ 90 × 40 (*))
  const yC = 450, xa = 0, xb = 1500, H = V.ancho, est = 40;
  for (const x of [xa - 30, xb + 30]) R.caja(x - est / 2, x + est / 2, yC - est / 2, yC + est / 2, 0, H + 250, M.madera, { r: 2 });
  const hb = new T.BoxGeometry(1, 1, 1); hb.deleteAttribute('uv');
  const [ox, oz] = V.ojo, hi = V.hilo, nz = Math.floor(H / (oz + hi)), nx = Math.floor((xb - xa) / (ox + hi));
  const im = new T.InstancedMesh(hb, nar, (nz + 1) + (nx + 1) * nz), M4 = new T.Matrix4(), Q = new T.Quaternion(); let i = 0;
  for (let k = 0; k <= nz; k++) { M4.compose(new T.Vector3((xa + xb) / 2, yC, 100 + k * (oz + hi)), Q, new T.Vector3(xb - xa, 1.6, hi)); im.setMatrixAt(i++, M4); }
  for (let k = 0; k < nz; k++) for (let j = 0; j <= nx; j++) { const off = (k % 2) * (ox + hi) / 2; const x = xa + j * (ox + hi) + off; if (x > xb) continue;
    M4.compose(new T.Vector3(x, yC, 100 + k * (oz + hi) + (oz + hi) / 2), Q, new T.Vector3(hi * 1.3, 2.2, oz)); im.setMatrixAt(i++, M4); }
  im.count = i; im.castShadow = true; R.sinBorde(im); R.raiz.add(im);
  // ---- cinta de peligro arriba, franjas rojo / blanco (*) a 45°
  const zc = H + 200, wC = CP.ancho;
  for (let x = xa - 10, k = 0; x < xb + 10; x += CP.franja, k++) R.caja(x, Math.min(x + CP.franja, xb + 10), yC - est / 2 - 1.2, yC - est / 2 - .4, zc - wC / 2, zc + wC / 2, k % 2 ? R.M.pa('#f4f4f2') : R.M.pa('#d42a22'), { r: 0 });
  R.impreso(['PELIGRO'], 140, 40, [(xa + xb) / 2, yC - est / 2 - 1.3, zc], [1, 0, 0], [0, 0, 1], { color: '#111111', fondo: '#ffffff', ppm: 6 });
  // ---- adelante: malla 15 cm (1052) extendida + rollo, y tramo de la de 30 cm (8017)
  mallaRombo(R, roja, 0, -260, M15.ancho, 900, M15.rombo, M15.hilo, 'PELIGRO ELECTRICO');
  rollo(R, [900 + M15.rollo.Rext - 10, -260, M15.rollo.Rext], M15.ancho, M15.rollo.Ri ?? M15.rollo.Rin, M15.rollo.Rext, roja, M.kraft);
  mallaRombo(R, roja, 0, -40, 300, 600, M15.rombo, M15.hilo, 'PELIGRO ELECTRICO');
  // rollos de malla vial y de cinta, apoyados
  rollo(R, [1750, -500, V.rollo.Rext], V.ancho, V.rollo.Rin, V.rollo.Rext, nar, M.kraft);
  const g = R.grupo(); rollo(R, [1350, 60, CP.rollo.Rext], CP.ancho, CP.rollo.Rin, CP.rollo.Rext, R.M.pa('#d42a22'), M.kraft);
  R.ancla('vial', [600, yC, 520]); R.ancla('estaca', [xb + 30 - est / 2, yC - est / 2, H + 150]); R.ancla('cinta', [300, yC - est / 2 - 1.3, zc + 20]);
  R.ancla('m15', [300, -260 + M15.ancho * .3, .5]); R.ancla('m15rollo', [900 + M15.rollo.Rext, -260, M15.rollo.Rext * 1.6]); R.ancla('m30', [450, -40 + 250, .5]);
  R.ancla('rolloVial', [1750, 0, V.rollo.Rext * 1.95]); R.ancla('rolloCinta', [1350, 60, CP.rollo.Rext * 1.8]); R.ancla('leyenda', [180, -260 + M15.ancho / 2, .7]);
}
