/* MAT-FLEJE-1 · detalle de la hebilla «de orejas» sola: base, las 2 orejas dobladas sobre las 2 capas de fleje y la cola doblada hacia atrás */
import { FLE } from '../piezas/perfiles_pat.mjs';
import { matsP, hebilla } from '../piezas/pat.mjs';
export default function (R) {
  R.vista({ az: -38, el: 38, fov: 13, margen: .06 });
  R.config({ bordeOp: .6 });
  const M = matsP(R);
  // tramo recto de fleje (como si estuviera sobre una superficie plana)
  R.caja(-42, 52, -FLE.a / 2, FLE.a / 2, -FLE.e, 0, M.inox, { r: .1 });
  hebilla(R, [0, 0, 0], [0, 0, 1], [1, 0, 0], { cola: 12 });
  const H = FLE.hebilla;
  R.ancla('base', [-H.L / 2 + 3, -H.a / 2, H.e / 2]); R.ancla('oreja', [0, -H.a / 2 + 2, 2 * H.e + 2 * FLE.e + .3]); R.ancla('fleje1', [-H.L / 2 - 4, -FLE.a / 2 + 2, H.e + FLE.e]);
  R.ancla('fleje2', [-H.L / 2 + 1, FLE.a / 2 - 2, H.e + 2 * FLE.e + .1]); R.ancla('cola', [H.L / 2 + 3, 0, H.e + 2 * FLE.e + 3.7]); R.ancla('banda', [-36, -FLE.a / 2, 0]);
}
