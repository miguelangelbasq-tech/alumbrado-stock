/* MAT-FIJACION-3 · silicona neutra negra 9016 / 9022 (DE BAJA): cartucho Ø50 × 215 + pico (CART de perfiles_civil, volumen AC),
 * uno entero y otro abierto a cuarto (silicona, pistón), y el cordón negro sellando la junta tapa–caja (junta 10 × 4 AC) */
import { CART } from '../piezas/perfiles_civil.mjs';
import { SILN } from '../piezas/perfiles_nfin.mjs';
import { matsC, tuboB } from '../piezas/civil_util.mjs';
import { revol } from '../piezas/pat.mjs';
export default function (R) {
  R.vista({ az: -30, el: 22, fov: 15, margen: .05 });
  R.config({ bordeOp: .25 });
  const M = matsC(R), r = CART.D / 2, k = () => 0;
  const negro = R.tipoCorte(R.M.pa('#2a2b2e', { roughness: .4, clearcoat: .25 }), 'plastico');
  const negroC = R.M.pa('#9a9ea4', { roughness: .7 });
  const sil = R.M.pa(SILN.color, { roughness: .3, clearcoat: .5 });
  const silC = R.M.pa('#3a3d42', { roughness: .25, clearcoat: .6 });
  const blanco = R.tipoCorte(R.M.pa('#e9e6dc', { roughness: .6 }), 'plastico');
  // cartucho entero
  R.torno([0, 0, 0], [0, 0, 1], [[r - 4, 6], [r - 1, 0], [r, 1], [r, CART.L - 6], [r - 3, CART.L], [8, CART.L + 3], [7, CART.L + 18], [0, CART.L + 18]], negro, { seg: 72 });
  R.torno([0, 0, CART.L + 18], [0, 0, CART.L + 19], [[6.5, 0], [2.2, CART.pico], [0, CART.pico]], M.cartucho, { seg: 48 });
  R.impresoCil([{ t: 'SILICONA', s: 1 }, { t: 'NEUTRA', s: .9 }, { t: 'NEGRO', s: 1 }], [0, 0, 20], [0, 0, CART.L - 20], r + .15, 150, 270, { color: '#ffffff', px: 5.5 });
  // cartucho abierto a cuarto (revol con caras de corte): pared 1,4 (AC), silicona, pistón abajo, hombro y pico
  const x2 = 100, y2 = 40, a0 = -90, a1 = 180, ref = [1, 0, 0], e = 1.4;
  revol(R, { p0: [x2, y2, 0], dir: [0, 0, 1], L: CART.L - 6, ro: () => r, ri: () => r - e, mat: negro, matC: negroC, a0, a1, ref, nt: 96 });
  revol(R, { p0: [x2, y2, CART.L - 6], dir: [0, 0, 1], L: 9, ro: (t, z) => r - (r - 8) * z / 9, ri: (t, z) => r - e - (r - 8) * z / 9, mat: negro, matC: negroC, a0, a1, ref, nt: 96 });
  revol(R, { p0: [x2, y2, CART.L + 3], dir: [0, 0, 1], L: 15, ro: () => 7.5, ri: () => 5.5, mat: negro, matC: negroC, a0, a1, ref, nt: 64 });
  revol(R, { p0: [x2, y2, 20], dir: [0, 0, 1], L: CART.L - 26, ro: () => r - e - .05, mat: sil, matC: silC, a0, a1, ref, nt: 96 });
  revol(R, { p0: [x2, y2, CART.L - 6], dir: [0, 0, 1], L: 24, ro: (t, z) => Math.max(5.4, r - e - .05 - (r - 8) * z / 9), mat: sil, matC: silC, a0, a1, ref, nt: 96 });
  revol(R, { p0: [x2, y2, 4], dir: [0, 0, 1], L: 16, ro: () => r - e - .05, ri: (t, z) => z < 12 ? r - 6 : 0.01, mat: blanco, matC: R.M.pa('#d2cec2', { roughness: .7 }), a0, a1, ref, nt: 96 });
  revol(R, { p0: [x2, y2, CART.L + 18], dir: [0, 0, 1], L: CART.pico, ro: (t, z) => 6.5 - 4.3 * z / CART.pico, ri: (t, z) => 4.8 - 3.6 * z / CART.pico, mat: M.cartucho, matC: R.M.pa('#d9d7cf'), a0, a1, ref, nt: 48 });
  // junta caja / tapa: pared de la caja (6), silicona (junta 10 × 4) y tapa; la cara x = jx muestra el corte
  const jx = 190, jy = -60, [jw, jh] = SILN.junta, pw = 6, Lj = 130;
  R.caja(jx, jx + Lj, jy, jy + pw, 0, 70, M.pvc, { r: .5 });                                    // pared de la caja (afuera = −y)
  R.caja(jx, jx + Lj, jy - 2, jy + pw + 2, 70, 70 + jh, sil, { r: 1.2 });                        // silicona en la junta
  R.caja(jx, jx + Lj, jy - 6, jy + 80, 70 + jh, 76 + jh, M.pvc, { r: .5 });                     // tapa (corte en x = jx)
  tuboB(R, (t) => [jx + Lj * t, jy - 3.2, 70 + jh / 2 - .5], 0, 1, () => SILN.cordon / 2, null, sil, { n: 40, na: 24, up: [0, 0, 1] });   // cordón exterior
  R.ancla('cart', [-r * .7, -r * .7, 110]); R.ancla('pico', [0, 0, CART.L + 70]); R.ancla('sil', [x2 - 10, y2 - .2, 120]); R.ancla('piston', [x2 - 12, y2 - .2, 12]);
  R.ancla('pared', [x2 - r + .7, y2 - .2, 60]); R.ancla('cart2', [x2 + r * .7, y2 - r * .7, 170]);
  R.ancla('cordon', [jx + 90, jy - 6.2, 70 + jh / 2]); R.ancla('junta', [jx, jy + 3, 70 + jh / 2]); R.ancla('tapa', [jx, jy + 50, 76 + jh]); R.ancla('caja', [jx + 90, jy, 35]);
}
