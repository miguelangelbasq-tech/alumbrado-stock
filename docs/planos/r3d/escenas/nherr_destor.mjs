/* MAT-HERRAMIENTAS-3 · destornilladores aislados 1000 V: Phillips PH2 × 150 (9025), plano 6,5 × 150 (9026), plano 6 × 125 (9027),
 * Phillips PH2 × 100 (9028). El 9026 cortado a cuarto: acero, vaina y mango bimaterial. Medidas: perfiles_nherr.mjs (DESTOR, PH2) */
import { DESTOR, PH2 } from '../piezas/perfiles_nherr.mjs';
import { destor3d, lugar, W } from '../piezas/nherr_util.mjs';
export default function (R) {
  R.vista({ az: -20, el: 50, fov: 15, margen: .035 });
  R.config({ bordeOp: .25 });
  const L = [['d9025', 0], ['d9026', -50], ['d9027', -100], ['d9028', -150]];
  for (const [k, y] of L) {
    const D = DESTOR[k], R0 = D.mango.Dcol / 2;
    const g = destor3d(R, D, PH2, k === 'd9026' ? { corte: [D.L - 40, D.L + D.mango.L + 2] } : {});
    lugar(g, [k === 'd9028' ? 50 : k === 'd9027' ? 25 : 0, y, R0]);
    const tag = k.slice(1);
    R.ancla(tag + '_punta', W(R, g, [2, 0, D.d / 2]));
    R.ancla(tag + '_vaina', W(R, g, [D.L * .5, 0, D.d / 2 + D.vaina.e]));
    R.ancla(tag + '_mango', W(R, g, [D.L + D.mango.L * .6, 0, D.mango.D / 2]));
    if (k === 'd9026') {
      R.ancla('c_acero', W(R, g, [D.L + 10, -1.5, 0]));
      R.ancla('c_vaina', W(R, g, [D.L - 20, -D.d / 2 - .5, -.2]));
      R.ancla('c_nucleo', W(R, g, [D.L + 40, -D.mango.D / 2 + 6, -1.6]));
      R.ancla('c_blanda', W(R, g, [D.L + 60, -D.mango.D / 2 + 1.2, -3.2]));
      R.ancla('c_collar', W(R, g, [D.L + 4, 0, D.mango.Dcol / 2]));
      R.ancla('c_sello', W(R, g, [D.L + 40, 0, D.mango.D / 2]));
    }
  }
}
