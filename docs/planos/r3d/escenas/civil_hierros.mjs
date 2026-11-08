/* MAT-MAMPOSTERIA-1 · barras Ø6 conformada (nervada) y Ø4,2 lisa, trozo de malla SIMA 15 × 15 (alambres nervados soldados) y alfajía */
import { HIERRO, SIMA, ALFA } from '../piezas/perfiles_civil.mjs';
import { matsC, nervada } from '../piezas/civil_util.mjs';
export default function (R) {
  R.vista({ az: -30, el: 30, fov: 15, margen: .04 });
  R.config({ bordeOp: .25 });
  const M = matsC(R), T = R.THREE, s = SIMA.malla, d = SIMA.d;
  // malla: 4 × 3 cuadros (600 × 450), alambres longitudinales abajo y transversales arriba, nudos soldados
  const nx = 4, ny = 3;
  for (let i = 0; i <= ny; i++) nervada(R, [-40, i * s, d / 2], [nx * s + 40, i * s, d / 2], d, M.hierro, { up: [0, 0, 1] });
  for (let k = 0; k <= nx; k++) nervada(R, [k * s, -40, d * 1.5], [k * s, ny * s + 40, d * 1.5], d, M.hierro, { up: [0, 0, 1] });
  for (let i = 0; i <= ny; i++) for (let k = 0; k <= nx; k++) { const b = new T.Mesh(new T.SphereGeometry(d * .62, 14, 10), M.hierro); b.scale.set(1, 1, .8); b.position.set(k * s, i * s, d); R.raiz.add(b); }
  // barras sueltas adelante: Ø6 nervada y Ø4,2 lisa
  nervada(R, [-40, -150, 3], [640, -150, 3], HIERRO.d6, M.hierro, { up: [0, 0, 1] });
  R.cil([-40, -230, 2.1], [640, -230, 2.1], HIERRO.d42 / 2, M.hierro, { seg: 24 });
  // alfajía (madera) al costado
  R.caja(-40, 640, -380, -380 + ALFA.h, 0, ALFA.b, M.madera, { r: 1 });
  R.ancla('malla', [2 * s + 40, 2 * s, d * 2]); R.ancla('nudo', [3 * s, s, d * 1.6]); R.ancla('cuadro', [s * 1.5, s * 2.5, 0]);
  R.ancla('d6', [560, -150 - 3, 6]); R.ancla('nerv', [420, -150 - 2, 6]); R.ancla('d42', [560, -232, 4]); R.ancla('alfa', [500, -380, ALFA.b]);
}
