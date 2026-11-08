/* MAT-TERMINALES-2 · las cinco punteras simples engarzadas en su cable (colores DIN 46228-4) */
import { puntera } from '../piezas/conex.mjs';
import { TIF, COLOR } from '../piezas/perfiles_conex.mjs';
export default function (R) {
  R.vista({ az: -28, el: 34, fov: 12, margen: .04 });
  const ais = [COLOR.N, COLOR.L3, COLOR.L2, COLOR.PE, COLOR.L1];
  TIF.forEach((p, i) => {
    const y = -i * 10.5, z = p.D2 / 2, x = i * 2.2;
    puntera(R, p, x, y, z, { crimp: true, cable: 22, aisl: ais[i], rayas: i === 3 ? COLOR.PEy : null });
    R.ancla('c' + i, [x + (p.L - p.L2) * .4, y, z + p.D2 / 2]);
    R.ancla('t' + i, [x + p.L - 1.5, y, z + 1.2]);
    R.ancla('f' + i, [x + p.L + .4, y, z]);
  });
}
