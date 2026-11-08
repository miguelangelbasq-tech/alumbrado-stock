/* MAT-HERRAMIENTAS-4 · llaves francesas 8" (9030) y 10" (9031), juego de llaves Allen (9035, de baja) y llave combinada con
 * criquet (9037, de baja). Medidas: perfiles_nherr.mjs (LLAVES) */
import { LLAVES } from '../piezas/perfiles_nherr.mjs';
import { francesa3d, allen3d, combinada3d, lugar, W, matsH } from '../piezas/nherr_util.mjs';
export default function (R) {
  R.vista({ az: -16, el: 56, fov: 15, margen: .035 });
  R.config({ bordeOp: .3 });
  const M = matsH(R);
  const f10 = francesa3d(R, LLAVES.f9031, { marca: '10"' }); lugar(f10.g, [0, 0, LLAVES.f9031.eCab / 2]);
  const f8 = francesa3d(R, LLAVES.f9030, { marca: '8"' }); lugar(f8.g, [10, -82, LLAVES.f9030.eCab / 2]);
  const F = LLAVES.f9031;
  R.ancla('f_fija', W(R, f10.g, [F.ancCab * .3, F.ab / 2 + 6, F.eCab / 2]));
  R.ancla('f_movil', W(R, f10.g, [F.ancCab * .15, -F.ab / 2 - 6, F.eCab / 2 - .7]));
  R.ancla('f_sinfin', W(R, f10.g, [(F.sinfin.x0 + F.sinfin.x1) / 2, f10.yc, F.sinfin.r]));
  R.ancla('f_mango', W(R, f10.g, [F.L * .7, 0, 3.6]));
  R.ancla('f_ojo', W(R, f10.g, [F.ojo.x, 4.5, 3.6]));
  R.ancla('f8', W(R, f8.g, [LLAVES.f9030.L * .7, 0, 3.6]));
  // juego Allen en abanico
  const ga = R.grupo(); let y = 0;
  LLAVES.allen.forEach(([s, l1, l2], i) => { const k = allen3d(R, s, l1, l2, ga, M.pavon); k.position.set(0, -y, 0); y += Math.max(s * 1.7, 6) + 3; });
  lugar(ga, [-10, -150, 5], 0);
  R.ancla('allen10', W(R, ga, [60, 0, 5])); R.ancla('allen15', W(R, ga, [30, -(y - 6), .8])); R.ancla('allen_corto', W(R, ga, [0, 0, 30]));
  // combinada
  const c = combinada3d(R, LLAVES.comb); lugar(c, [120, -165, LLAVES.comb.eEstr / 2], 0);
  R.ancla('c_boca', W(R, c, [LLAVES.comb.boca / 2 - 8, 8, LLAVES.comb.e / 2]));
  R.ancla('c_estr', W(R, c, [LLAVES.comb.ojoX, LLAVES.comb.s * .5, LLAVES.comb.eEstr / 2 - .8]));
  R.ancla('c_cuerpo', W(R, c, [LLAVES.comb.L * .4, 0, LLAVES.comb.e / 2]));
}
