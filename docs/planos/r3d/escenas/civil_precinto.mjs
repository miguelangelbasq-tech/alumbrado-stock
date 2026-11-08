/* MAT-FIJACION-1 · precinto de nylon 66 cerrado sobre un mazo de 3 cables, CORTADO por el medio: se ve el diente (uña) de la
 * cabeza enganchado en el dentado de la cola. Medidas: PREC (T50R 200 × 4,6 como referencia). */
import { PREC } from '../piezas/perfiles_civil.mjs';
import { matsC, perfilCortado } from '../piezas/civil_util.mjs';
export default function (R) {
  R.vista({ az: -16, el: 14, fov: 14, margen: .05 });
  R.config({ bordeOp: .3 });
  const M = matsC(R), T = R.THREE, t = PREC.t, w = PREC.w, d = PREC.diente, p = PREC.pasoD;
  // --- recorrido de la banda en el plano x-z (y = ancho). Cabeza arriba, ranura vertical en x ∈ [0, 1.6]
  const xs = .8, rb = 9.2, rs = rb + t / 2, Cx = xs - rs, Cz = 1.0 - rs;
  const path = [];
  for (let x = -3; x >= Cx; x -= .5) path.push([x, 1.0]);
  for (let a = 90; a <= 360; a += 3) path.push([Cx + rs * Math.cos(a * Math.PI / 180), Cz + rs * Math.sin(a * Math.PI / 180)]);
  for (let z = Cz; z <= 6 + 14; z += .4) path.push([xs, z]);
  // banda gruesa: lado exterior liso, lado interior (hacia el mazo) con dientes de sierra en los tramos rectos
  const ext = [], inn = [];
  for (let i = 0; i < path.length; i++) {
    const a = path[Math.max(0, i - 1)], b = path[Math.min(path.length - 1, i + 1)]; const tx = b[0] - a[0], tz = b[1] - a[1], L = Math.hypot(tx, tz) || 1;
    const nx = -tz / L, nz = tx / L;   // normal a la izquierda del avance = hacia el centro del mazo
    const P0 = path[i]; ext.push([P0[0] - nx * t / 2, P0[1] - nz * t / 2]);
    const recto = P0[1] > Cz + .5 && P0[0] > Cx;   // tramo vertical que entra en la cabeza
    const s = (P0[1] % p + p) % p / p;           // diente asimétrico: sube despacio, cae de golpe
    const dd = recto ? d * s : 0;
    inn.push([P0[0] + nx * (t / 2 + dd), P0[1] + nz * (t / 2 + dd)]);
  }
  const banda = [...ext, ...inn.reverse()];
  const nyl = M.nylonB, nylC = M.nylonCorte;
  perfilCortado(R, banda, [], w / 2, nyl, nylC, { A: [0, 1, 0], B: [1, 0, 0], C: [0, 0, 1], o: [0, 0, 0], bevel: 0 });
  // --- cabeza: bloque con la ranura y el hueco de la uña; la uña aparte
  const H = PREC.cab, x0 = -2.9, x1 = x0 + H[0], zc0 = 0, zc1 = H[1];
  const cab = [[x0, zc0], [x1, zc0], [x1, zc1], [x0, zc1]];
  const ranura = [[-.05, zc0 - 1], [1.65, zc0 - 1], [1.65, zc1 + 1], [-.05, zc1 + 1]];
  const hueco = [[-2.3, 1.7], [-.05, 1.7], [-.05, 5.3], [-2.3, 5.3]];
  perfilCortado(R, cab, [ranura, hueco], H[2] / 2, nyl, nylC, { A: [0, 1, 0], B: [1, 0, 0], C: [0, 0, 1], o: [0, 0, 0], bevel: 0 });
  const una = [[-2.3, 5.3], [-1.5, 5.3], [xs - t / 2 - d * .2, 2.15], [xs - t / 2 - d * 1.05, 2.0], [-2.3, 4.6]];
  perfilCortado(R, una, [], H[2] / 2 - .4, nyl, nylC, { A: [0, 1, 0], B: [1, 0, 0], C: [0, 0, 1], o: [0, 0, 0], bevel: 0 });
  // --- mazo de 3 cables (a lo largo de y, enteros)
  const cols = ['#6e3b1d', '#26282b', '#c8302c'];
  [90, 210, 330].map(g => [Cx + 4.95 * Math.cos(g * Math.PI / 180), Cz + 4.95 * Math.sin(g * Math.PI / 180)]).forEach(([x, z], i) => {
    R.cil([x, 0, z], [x, 30, z], 4.4, R.M.cable(cols[i]), { seg: 40 });
    R.cil([x, -.05, z], [x, 30, z], 2.6, R.M.cobre(), { seg: 32 });
  });
  R.ancla('una', [-1.2, 0, 4.0]); R.ancla('dientes', [xs - t / 2 - .2, 0, 9]); R.ancla('cabeza', [x1 - .5, 0, zc1 - 1]); R.ancla('cola', [xs, 1, 17]);
  R.ancla('banda', [Cx - rs, w / 2, Cz]); R.ancla('ranura', [.8, 0, -.3]); R.ancla('mazo', [Cx + 4.95 * Math.cos(5.76), 0, Cz + 4.95 * Math.sin(5.76) - 2.8]); R.ancla('corte', [Cx, 0, Cz + rs]);
}
