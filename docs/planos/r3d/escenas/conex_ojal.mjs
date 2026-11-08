/* MAT-TERMINALES-1 · terminal tubular de ojal Cu estañado 16 mm² / M10: uno nuevo (se ve el barril) y uno engarzado en el cable, cortado a cuarto */
import { ojalCu } from '../piezas/conex.mjs';
import { OJAL, COLOR } from '../piezas/perfiles_conex.mjs';
export default function (R) {
  R.vista({ az: -34, el: 32, fov: 12, margen: .04 });
  const z = OJAL.De / 2;
  const a = ojalCu(R, 0, 0, z, { crimp: true, cuarto: true, cable: 26, color: COLOR.L1 });
  ojalCu(R, 14, -22, z, {});
  R.ancla('barril', [3.5, -OJAL.De / 2 * .2, z + OJAL.De / 2 * .95]);
  R.ancla('hex', [9, 3.1, z + 2.0]);
  R.ancla('hilos', [6, -.6, z + .6]);
  R.ancla('palma', [OJAL.L - 10, 5.5, z + OJAL.e / 2]);
  R.ancla('agujero', [OJAL.L - OJAL.W / 2, -OJAL.hole / 2, z + OJAL.e / 2]);
  R.ancla('cable', [-18, 0, z + 3.65]);
  R.ancla('transicion', [OJAL.Lb + 2.5, 0, z + 2]);
  R.ancla('nuevo', [14 + 8, -22, z + 4.25]);
  R.ancla('boca', [14, -22 - 2.4, z + 1.2]);
}
