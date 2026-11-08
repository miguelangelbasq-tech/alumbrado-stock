/* MAT-MORSETERIA_AEREA-2 · herrajes MN (H°G°) sueltos: bulón de ojo MN 505 con arandela MN 30 y tuerca, ojal MN 377, tirafondo MN 520; rack 4B2L con aislador MN 16 */
import { MN } from '../piezas/perfiles_cables.mjs';
import { bulonOjo, ojal, tirafondo, arandela, rack } from '../piezas/aerea.mjs';
export default function (R) {
  R.vista({ az: 30, el: 32, fov: 13, margen: .04 });
  R.config({ bordeOp: .3 });
  const B = MN.bulonOjo, re = B.ojoRe;
  bulonOjo(R, [0, -90, re], [1, 0, 0], 200, { n: [0, 1, 0], dt: 150 });
  ojal(R, [0, -150, MN.ojal.ojoRe], [1, 0, 0], { n: [0, 1, 0] });
  tirafondo(R, [0, -205, MN.tirafondo.cab / 2], [1, 0, 0]);
  arandela(R, [120, -20, 0], [0, 0, 1]);
  const k = rack(R, 230, MN.aislador.H / 2 + MN.rack.e + 2 + 50);
  R.ancla('ojo', [-((B.ojoRi + B.ojoRe) / 2), -90, re + B.ojoRe * .55]);
  R.ancla('vastago', [100, -90, re + B.M / 2]);
  R.ancla('tuerca', [B.ojoRe / 2 + 150 + 12, -90, re + B.tuerca / 1.7]);
  R.ancla('arandela', [120 + 18, -20 - 18, MN.arandela.e]);
  R.ancla('ojal', [-(MN.ojal.ojoRi + MN.ojal.ojoRe) / 2, -150, MN.ojal.ojoRe * 1.6]);
  R.ancla('tira', [8, -205, MN.tirafondo.cab]);
  R.ancla('rosca', [70, -205, MN.tirafondo.d / 2 + 1]);
  R.ancla('rack', [232, MN.rack.a / 2, 140]);
  R.ancla('aislador', [k.xp, -MN.aislador.Dmax / 2, MN.aislador.H / 2 + 60]);
  R.ancla('perno', [k.xp, 0, MN.aislador.H + 70]);
}
