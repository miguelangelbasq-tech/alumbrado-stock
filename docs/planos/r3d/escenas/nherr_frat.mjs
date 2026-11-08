/* MAT-HERRAMIENTAS-6 · fratacho de madera (8027), fratacho con goma espuma (8033, dado vuelta para ver la espuma) y hacha de mano (8032). */
import { ALB } from '../piezas/perfiles_nherr.mjs';
import { fratacho3d, hacha3d, lugar, W } from '../piezas/nherr_util.mjs';
export default function (R) {
  R.vista({ az: -26, el: 40, fov: 15, margen: .035 });
  R.config({ bordeOp: .25 });
  const F = ALB.fratM, G = ALB.fratG, H = ALB.hacha;
  const f1 = fratacho3d(R, F, ALB.manija, ALB.manijaHueco); lugar(f1, [0, 0, 0]);
  const f2 = fratacho3d(R, G, ALB.manija, ALB.manijaHueco, { goma: true }); lugar(f2, [40, -190, G.goma + G.e + 46], 0, 180);
  const hc = hacha3d(R, H, H.cabo, [36, 26]); lugar(hc, [-200, -330, H.esp.cuerpo / 2], 0);
  R.ancla('f1_base', W(R, f1, [-F.L / 2 + 30, -F.A / 2 + 10, F.e]));
  R.ancla('f1_manija', W(R, f1, [0, 0, F.e + 46]));
  R.ancla('f1_tornillo', W(R, f1, [-F.mango.L / 2 + 15, 0, F.e + 14.5]));
  R.ancla('f2_espuma', W(R, f2, [-G.L / 2 + 40, G.A / 2 - 20, 0]));
  R.ancla('f2_base', W(R, f2, [G.L / 2 - 10, -G.A / 2, G.goma + 5]));
  R.ancla('h_filo', W(R, hc, [H.cabo - 18 - 4, -118, 0]));
  R.ancla('h_hoja', W(R, hc, [H.cabo - 18 + 10, -70, H.esp.hoja / 2]));
  R.ancla('h_ojo', W(R, hc, [H.cabo - 18, 10, H.esp.cuerpo / 2]));
  R.ancla('h_cabo', W(R, hc, [150, 0, 13]));
}
