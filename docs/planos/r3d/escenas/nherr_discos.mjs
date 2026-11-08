/* MAT-HERRAMIENTAS-7 · discos para amoladora: corte 115 (8030) cortado a cuarto (abrasivo + mallas de fibra + ojal), corte 230 (9042),
 * desbaste 115 de centro deprimido (8028, cortado) y flap 115 (8029). Medidas: perfiles_nherr.mjs (DISCOS) */
import { DISCOS } from '../piezas/perfiles_nherr.mjs';
import { disco3d, flap3d, lugar, W } from '../piezas/nherr_util.mjs';
export default function (R) {
  R.vista({ az: -20, el: 46, fov: 15, margen: .035 });
  R.config({ bordeOp: .22 });
  const d230 = disco3d(R, DISCOS.d9042, { etiqueta: ['230 × 3,0 × 22,23', 'MAX 6600 rpm · 80 m/s', 'METAL · EN 12413'] }); lugar(d230, [0, 0, 0]);
  const c115 = disco3d(R, DISCOS.d8030, { corte: true, etiqueta: ['115 × 1,6 × 22,23', 'MAX 13300 rpm', 'EN 12413'] }); lugar(c115, [195, -40, 0], 30);
  const ds = disco3d(R, DISCOS.d8028, { corte: true, etiqueta: ['115 × 6,4 × 22,23', 'DESBASTE · T27', 'MAX 13300 rpm'] }); lugar(ds, [60, -175, DISCOS.d8028.depr.h], 20);
  const fl = flap3d(R, DISCOS.d8029); lugar(fl, [200, -190, 4.3], 0);
  const D = DISCOS;
  R.ancla('d230', W(R, d230, [-60, 40, 3]));
  R.ancla('d230_ojal', W(R, d230, [0, -14, 3.6]));
  R.ancla('c_abr', W(R, c115, [40, -.1, D.d8030.e * .85]));
  R.ancla('c_malla', W(R, c115, [30, -.1, D.d8030.e * .5]));
  R.ancla('c_ojal', W(R, c115, [13, -.1, D.d8030.e + .3]));
  R.ancla('d_abr', W(R, ds, [45, -.1, D.d8028.e * .85]));
  R.ancla('d_malla', W(R, ds, [42, -.1, D.d8028.e * .62]));
  R.ancla('d_depr', W(R, ds, [-15, 12, D.d8028.e - D.d8028.depr.h]));
  R.ancla('f_lam', W(R, fl, [-40, -20, 5]));
  R.ancla('f_plato', W(R, fl, [0, 22, -2.5]));
}
