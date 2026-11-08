/* MAT-HERRAMIENTAS-10 · cintas pasacable 15 m (9023) y 10 m (9024), pistola aplicadora de silicona (9012) con un cartucho y cinta de papel 36 mm (9038). */
import { VARIOS, PISTOLA } from '../piezas/perfiles_nherr.mjs';
import { pasacable3d, pistola3d, cintaPapel3d, lugar, W, matsH } from '../piezas/nherr_util.mjs';
export default function (R) {
  R.vista({ az: -24, el: 42, fov: 15, margen: .035 });
  R.config({ bordeOp: .22 });
  const M = matsH(R), V = VARIOS;
  const p15 = pasacable3d(R, V.pasa15, { rotulo: '15 m' }); lugar(p15, [0, 0, 0]);
  const p10 = pasacable3d(R, V.pasa10, { rotulo: '10 m', mat: M.naranja }); lugar(p10, [-40, -200, 0]);
  const pi = pistola3d(R, PISTOLA, V.pistola.cart); lugar(pi, [250, -40, 166], 8, 0);
  const cp = cintaPapel3d(R, V.papel); lugar(cp, [480, -260, 0]);
  const P = V.pasa15;
  R.ancla('p_carrete', W(R, p15, [-P.carrete / 2 * .7, -P.carrete / 2 * .4, P.e]));
  R.ancla('p_cinta', W(R, p15, [P.carrete / 2 + 90, -10, P.e / 2 + 1.5]));
  R.ancla('p_ojal', W(R, p15, [P.carrete / 2 + 182, -10, P.e / 2]));
  R.ancla('p_manija', W(R, p15, [0, P.carrete / 2 + 30, P.e - 8]));
  R.ancla('p10', W(R, p10, [-V.pasa10.carrete / 2 * .6, 0, V.pasa10.e]));
  R.ancla('s_cart', W(R, pi, [80, 0, 24.5]));
  R.ancla('s_boq', W(R, pi, [-40, 0, 3]));
  R.ancla('s_cuna', W(R, pi, [190, -18, -20]));
  R.ancla('s_gatillo', W(R, pi, [226, 0, -100]));
  R.ancla('s_mango', W(R, pi, [258, 0, -120]));
  R.ancla('s_vastago', W(R, pi, [330, 0, 3]));
  R.ancla('c_papel', W(R, cp, [V.papel.De / 2 * .7, V.papel.De / 2 * .7, V.papel.A]));
  R.ancla('c_nucleo', W(R, cp, [0, -V.papel.nucleo / 2 - 2, V.papel.A]));
}
