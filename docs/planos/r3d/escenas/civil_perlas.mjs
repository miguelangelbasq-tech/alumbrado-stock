/* MAT-SENAL_SELLADO-1 · esquina del telgopor de cerca: perlas de poliestireno expandido soldadas entre sí (*) */
import { matsC } from '../piezas/civil_util.mjs';
export default function (R) {
  R.vista({ az: -35, el: 28, fov: 14, margen: .05 });
  R.config({ bordeOp: .15, exposicion: .95 });
  const M = matsC(R);
  R.caja(0, 70, 0, 50, 0, 40, M.telgopor, { r: 1.5 });
  // regla chica para la escala
  R.caja(-5, 75, -14, -6, 0, .8, R.M.pa('#f2d13a', { roughness: .5 }), { r: .2 });
  for (let k = 0; k <= 70; k++) { const L = k % 10 === 0 ? 4 : k % 5 === 0 ? 3 : 1.6; R.caja(k - .07, k + .07, -6 - L, -6, .8, .86, R.M.tinta('#111')); }
  for (let k = 0; k <= 70; k += 10) R.texto(String(k), [k, -12.5, .85], [1, 0, 0], [0, 1, 0], R.M.tinta('#111'), { size: 1.4, prof: .03 });
  R.ancla('perla', [35, 0, 25]); R.ancla('regla', [40, -10, .8]);
}
