/* MAT-HERRAMIENTAS-9 · caja de herramientas 13" con bandeja (8037) cortada a cuarto, caja grande (9013) abierta y estuche organizador 15" (9020). */
import { CAJAS } from '../piezas/perfiles_nherr.mjs';
import { cajaHerr3d, organizador3d, lugar, W, matsH } from '../piezas/nherr_util.mjs';
export default function (R) {
  R.vista({ az: -28, el: 30, fov: 15, margen: .035 });
  R.config({ bordeOp: .2 });
  const M = matsH(R);
  const c1 = cajaHerr3d(R, CAJAS.c8037, { corte: true }); lugar(c1, [0, 0, 0]);
  const c2 = cajaHerr3d(R, CAJAS.c9013, { abierta: true, mat: M.azulP, matAcc: M.amarillo }); lugar(c2, [-470, 120, 0]);
  const o = organizador3d(R, CAJAS.c9020); lugar(o, [-380, -260, 0]);
  const A = CAJAS.c8037, B = CAJAS.c9013, O = CAJAS.c9020;
  R.ancla('a_cuerpo', W(R, c1, [-A.L / 2 + 30, -A.A / 2, A.H * .3]));
  R.ancla('a_tapa', W(R, c1, [-A.L / 4, 0, A.H]));
  R.ancla('a_manija', W(R, c1, [-30, 0, A.H + 24]));
  R.ancla('a_traba', W(R, c1, [-A.L * .32, -A.A / 2 - 4, A.H * .72]));
  R.ancla('a_bandeja', W(R, c1, [A.L / 4, -A.A / 2 + 14, A.H * .72 - 20])); R.ancla('a_corte', W(R, c1, [A.L * .4, -A.A / 2 + 1.5, A.H * .35]));
  R.ancla('b_cuerpo', W(R, c2, [-B.L / 2 + 40, -B.A / 2, B.H * .4]));
  R.ancla('b_band', W(R, c2, [B.L * .25, 0, B.H * .72]));
  R.ancla('b_tapa', W(R, c2, [0, B.A / 2 + 60, B.H * .72 + 40]));
  R.ancla('o_tapa', W(R, o, [O.L / 4, 0, O.H + 3])); R.ancla('o_div', W(R, o, [-O.L / 4, -O.A / 6, O.H - 4])); R.ancla('o_traba', W(R, o, [O.L * .3, -O.A / 2 - 5, O.H]));
}
