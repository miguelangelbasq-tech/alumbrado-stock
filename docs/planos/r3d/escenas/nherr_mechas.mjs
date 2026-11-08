/* MAT-HERRAMIENTAS-8 · mechas de acero rápido (HSS) Ø10 (9040) y Ø12 (9041), DIN 338, y cepillo de alambre con mango (9039). */
import { MECHAS, CEPILLO } from '../piezas/perfiles_nherr.mjs';
import { mecha3d, cepillo3d, lugar, W } from '../piezas/nherr_util.mjs';
export default function (R) {
  R.vista({ az: -24, el: 32, fov: 15, margen: .035 });
  R.config({ bordeOp: .22 });
  const m10 = mecha3d(R, MECHAS.m9040); lugar(m10, [40, 0, MECHAS.m9040.d / 2]);
  const m12 = mecha3d(R, MECHAS.m9041); lugar(m12, [30, -30, MECHAS.m9041.d / 2]);
  const C = CEPILLO; const cp = cepillo3d(R, C); lugar(cp, [-40, -150, C.pelo], 0);
  R.ancla('m10_punta', W(R, m10, [2, 0, 1])); R.ancla('m10_canal', W(R, m10, [40, 0, MECHAS.m9040.d / 2])); R.ancla('m10_cola', W(R, m10, [110, 0, MECHAS.m9040.d / 2]));
  R.ancla('m12_punta', W(R, m12, [3, 0, 2])); R.ancla('m12_cola', W(R, m12, [130, 0, MECHAS.m9041.d / 2]));
  R.ancla('c_pelo', W(R, cp, [60, -C.ancho / 2 + 3, -C.pelo * .6])); R.ancla('c_cuerpo', W(R, cp, [80, 0, C.e])); R.ancla('c_mango', W(R, cp, [C.L - 40, 0, C.e])); R.ancla('c_ojo', W(R, cp, [C.L - 14, 3, C.e]));
}
