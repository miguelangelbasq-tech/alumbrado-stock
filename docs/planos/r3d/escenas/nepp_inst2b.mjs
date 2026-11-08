/* MAT-INSTRUMENTOS-2 · busca polo 9036 de cerca: mango transparente con neón, resistencia y resorte; tapa de contacto */
import { buscaPolo } from '../piezas/nepp.mjs';
import { BP } from '../piezas/perfiles_nepp.mjs';
export default function (R) {
  R.vista({ az: -12, el: 30, fov: 14, margen: .04 });
  R.config({ bordeOp: .3 });
  buscaPolo(R, [0, 0, 0]);
  const z = BP.mango.D / 2, x0 = BP.hoja.L;
  R.ancla('bpPunta', [2, 0, z]); R.ancla('bpHoja', [36, 0, z + 1.6]); R.ancla('bpRes', [x0 + 13, 0, z + 1]);
  R.ancla('bpNeon', [x0 + 33, 0, z + 2.5]); R.ancla('bpResorte', [x0 + 57, 0, z + 2.3]); R.ancla('bpTapa', [x0 + BP.mango.L - 1, 0, z + 5]);
  R.ancla('bpClip', [x0 + 52, 0, 2 * z + 1.3]); R.ancla('bpMango', [x0 + 6, -z * .9, z]);
}
