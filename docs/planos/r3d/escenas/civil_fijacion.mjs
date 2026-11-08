/* MAT-FIJACION-1 · precintos 200 (natural) y 250 (negro), cinta aisladora 19 mm, rollo de alambre de atar, tornillo + fisher n° 8
 * suelto, soporte para caños (4033) y lata de pintura gris (9002) */
import { PREC, CINTA, ALAMBRE, FISHER, LATA } from '../piezas/perfiles_civil.mjs';
import { matsC } from '../piezas/civil_util.mjs';
export default function (R) {
  R.vista({ az: -26, el: 30, fov: 15, margen: .04 });
  R.config({ bordeOp: .25 });
  const M = matsC(R), T = R.THREE;
  // precintos rectos (banda + cabeza)
  const prec = (y, L, mat) => { R.caja(0, L, y - PREC.w / 2, y + PREC.w / 2, 0, PREC.t, mat, { r: .3 }); R.caja(-PREC.cab[0], 0, y - PREC.cab[2] / 2, y + PREC.cab[2] / 2, 0, PREC.cab[1], mat, { r: .6 });
    R.caja(L - 12, L, y - PREC.w / 2 + .6, y + PREC.w / 2 - .6, 0, PREC.t, mat, { r: .3 }); };
  prec(0, PREC.L, M.nylonB); prec(22, PREC.L2, M.nylonN);
  // cinta aisladora
  R.torno([300, 40, 0], [300, 40, 1], [[CINTA.Rin + 31, 0], [CINTA.Rin + 31 + 9, 0], [CINTA.Rin + 31 + 9, CINTA.w], [CINTA.Rin + 31, CINTA.w], [CINTA.Rin + 31, 0]], M.cinta, { seg: 96 });
  R.torno([300, 40, 0], [300, 40, 1], [[CINTA.Rin + 28, 0], [CINTA.Rin + 31, 0], [CINTA.Rin + 31, CINTA.w], [CINTA.Rin + 28, CINTA.w], [CINTA.Rin + 28, 0]], M.kraft, { seg: 64 });
  // rollo de alambre (espiras)
  for (let k = 0; k < 14; k++) { const m = new T.Mesh(new T.TorusGeometry(60 + (k % 4) * 2.2, ALAMBRE.d / 2, 8, 120), M.alambre); m.position.set(300 + (k % 3), 170, 2 + Math.floor(k / 4) * ALAMBRE.d * .9 + (k % 2)); m.rotation.z = k * .4; m.castShadow = true; R.sinBorde(m); R.raiz.add(m); }
  // lata de pintura gris
  const xl = 140, yl = 190, Rl = 55, Hl = 75;
  R.torno([xl, yl, 0], [xl, yl, 1], [[0, 0], [Rl - 2, 0], [Rl, 3], [Rl, Hl - 4], [Rl + 1.2, Hl - 2], [Rl - 2, Hl], [0, Hl]], M.hojalata, { seg: 96 });
  R.impresoCil([{ t: 'PINTURA', s: .8 }, { t: 'GRIS', s: 1.2 }, { t: '(*)', s: .6 }], [xl, yl, 10], [xl, yl, Hl - 12], Rl + .15, 150, 250, { color: '#2d3136', px: 12, fondo: '#9aa0a6' });
  // tornillo + fisher n° 8 sueltos
  const F = FISHER;
  R.torno([30, 120, F.d / 2], [30 + F.L, 120, F.d / 2], [[F.d / 2 + 1.2, 0], [F.d / 2 + 1.2, 1.2], [F.d / 2, 1.5], [F.d / 2, F.L - 2], [F.d / 2 - 1, F.L], [2.2, F.L], [2.2, 0]], M.fisher, { seg: 48 });
  R.tornillo([30, 150, 3.5], [1, 0, 0], { M: F.tornillo[0], L: F.tornillo[1] - 4, dk: 9.5, k: 2.8, tipo: 'pozi', mat: M.zinc });
  R.ancla('p200', [PREC.L * .6, 0, PREC.t]); R.ancla('p250', [PREC.L2 * .75, 22, PREC.t]); R.ancla('cabeza', [-PREC.cab[0] / 2, 22, PREC.cab[1]]);
  R.ancla('cinta', [300 - 52, 40 - 30, CINTA.w]); R.ancla('alambre', [300 - 58, 170 - 10, 6]); R.ancla('lata', [xl - Rl * .7, yl - Rl * .7, 40]); R.ancla('fisher', [30 + F.L * .6, 120 - F.d / 2, F.d]);
  R.ancla('tornillo', [30 + 25, 150 - 2, 6]);
}
