/* MAT-HERRAMIENTAS-5 · martillo maza 500 g (8031) cortado por el eje del cabo (se ve el cabo acuñado en el ojo), maza 2 kg (8035),
 * cabo de 40 cm (8034) suelto y punta de hierro / puntero octogonal (8036). Medidas: perfiles_nherr.mjs (ALB) */
import { ALB } from '../piezas/perfiles_nherr.mjs';
import { maza3d, cabo3d, puntero3d, lugar, W } from '../piezas/nherr_util.mjs';
export default function (R) {
  R.vista({ az: -22, el: 48, fov: 15, margen: .035 });
  R.config({ bordeOp: .25 });
  const m2 = maza3d(R, ALB.maza2); lugar(m2, [0, 0, ALB.maza2.cab[2] / 2]);
  const m5 = maza3d(R, ALB.maza05, { corte: true }); lugar(m5, [40, -110, ALB.maza05.cab[2] / 2]);
  const gc = R.grupo(); cabo3d(R, gc, ALB.cabo.L, ALB.cabo.sec, ALB.cabo.ojo, 50); lugar(gc, [-110, -175, ALB.cabo.sec[1] / 2]);
  const pu = puntero3d(R, ALB.punta); lugar(pu, [30, -225, ALB.punta.af / 2]);
  const a2 = ALB.maza2, a5 = ALB.maza05;
  R.ancla('m2_cab', W(R, m2, [a2.cabo - a2.cab[1] / 2, -a2.cab[0] / 2 + 10, a2.cab[2] / 2]));
  R.ancla('m2_cara', W(R, m2, [a2.cabo - a2.cab[1] / 2, a2.cab[0] / 2, 0]));
  R.ancla('m2_cabo', W(R, m2, [120, 0, a2.sec[1] / 2]));
  R.ancla('m5_ojo', W(R, m5, [a5.cabo - a5.cab[1] / 2, a5.ojo[0] / 2 - 2, 0]));
  R.ancla('m5_cuna', W(R, m5, [a5.cabo + .5, 0, 0]));
  R.ancla('m5_cab', W(R, m5, [a5.cabo - a5.cab[1] / 2, -a5.cab[0] / 2 + 6, 0]));
  R.ancla('m5_cabo', W(R, m5, [110, 0, a5.sec[1] / 2]));
  R.ancla('cabo', W(R, gc, [200, 0, ALB.cabo.sec[1] / 2]));
  R.ancla('cabo_ojo', W(R, gc, [ALB.cabo.L - 20, 0, ALB.cabo.ojo[1] / 2]));
  R.ancla('pu_punta', W(R, pu, [8, 0, 3])); R.ancla('pu_cuerpo', W(R, pu, [150, 0, ALB.punta.af / 2])); R.ancla('pu_cabeza', W(R, pu, [ALB.punta.L - 2, 0, 5]));
}
