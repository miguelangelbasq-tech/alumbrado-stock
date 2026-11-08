/* MAT-HERRAMIENTAS-11 · caloventor 2000 W (9014): resistencia detrás de la rejilla, perillas de potencia y termostato. */
import { VARIOS } from '../piezas/perfiles_nherr.mjs';
import { caloventor3d, lugar, W } from '../piezas/nherr_util.mjs';
export default function (R) {
  R.vista({ az: -30, el: 22, fov: 15, margen: .04 });
  R.config({ bordeOp: .2 });
  const C = VARIOS.calo;
  const cal = caloventor3d(R, C); lugar(cal, [0, 0, 0]);
  R.ancla('cal_rej', W(R, cal, [60, -C.B / 2 - 1, C.H * .45])); R.ancla('cal_res', W(R, cal, [-50, -C.B / 2 + 6, 112]));
  R.ancla('cal_per', W(R, cal, [-40, -20, C.H + 19])); R.ancla('cal_ter', W(R, cal, [40, -20, C.H + 19])); R.ancla('cal_man', W(R, cal, [0, C.B / 2 - 20, C.H + 6]));
  R.ancla('cal_base', W(R, cal, [0, -C.B / 2 + 25, 6])); R.ancla('cal_cable', W(R, cal, [C.A / 2 + 40, C.B / 2 + 30, 10])); R.ancla('cal_carc', W(R, cal, [-C.A / 2, -40, C.H * .6]));
}
