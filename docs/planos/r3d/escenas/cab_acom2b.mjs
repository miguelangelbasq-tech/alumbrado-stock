/* MAT-CABLE_ACOMETIDA-2 · antihurto concéntrico 4/4 (1003): vaina, cinta, corona de alambres (neutro), XLPE, fase */
import { ANTI } from '../piezas/perfiles_cables.mjs';
import { antihurto } from '../piezas/cables.mjs';
export default function (R) {
  R.vista({ az: 58, el: 26, fov: 13, margen: .05 });
  R.config({ bordes: false });
  antihurto(R, ANTI, { x0: -60, Lv: 0, Lt: 6, Ln: 14, La: 24, Lc: 36, marca: 'Cu 4/4 mm²  ANTIHURTO  0,6/1,1 kV (*)', angMarca: 320 });
  const za = ANTI.Ro;
  R.ancla('av', [-30, 0, za + ANTI.Ro]); R.ancla('at', [3, -ANTI.rCinta * .7, za + ANTI.rCinta * .7]);
  R.ancla('an', [10, -ANTI.rN * .7, za + ANTI.rN * .7]); R.ancla('aa', [19, 0, za + ANTI.fase.rc]); R.ancla('ac', [32, 0, za + ANTI.fase.R]);
}
