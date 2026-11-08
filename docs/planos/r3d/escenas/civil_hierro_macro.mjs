/* MAT-MAMPOSTERIA-1 · detalle de la nervadura: Ø6 conformada (nervios transversales y longitudinales) junto al Ø4,2 liso */
import { HIERRO } from '../piezas/perfiles_civil.mjs';
import { matsC, nervada } from '../piezas/civil_util.mjs';
export default function (R) {
  R.vista({ az: -18, el: 22, fov: 14, margen: .05 });
  R.config({ bordeOp: .2 });
  const M = matsC(R);
  nervada(R, [0, 0, 3], [60, 0, 3], HIERRO.d6, M.hierro, { up: [0, 0, 1] });
  R.cil([0, 14, 2.1], [60, 14, 2.1], HIERRO.d42 / 2, M.hierro, { seg: 32 });
  R.ancla('transv', [30, -3, 3.5]); R.ancla('long', [45, 0, 6.2]); R.ancla('liso', [40, 14 - 2, 3.5]);
}
