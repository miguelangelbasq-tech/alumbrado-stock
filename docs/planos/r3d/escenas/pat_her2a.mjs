/* MAT-HERRAJES-2 · rack MN 4B2L (4032) con el aislador de porcelana marrón (MN 16 / MN 17) cortado a cuarto: polleras, cuello de atadura, agujero y perno */
import { MN } from '../piezas/perfiles_cables.mjs';
import { matsA, rack } from '../piezas/aerea.mjs';
export default function (R) {
  R.vista({ az: -40, el: 22, fov: 13, margen: .05 });
  R.config({ bordeOp: .3 });
  const A = matsA(R); A.porc.color.set('#6b3418'); A.porc.roughness = .18; A.porc.clearcoat = 1;   // porcelana marrón (ET 51)
  const zc = 0, k = rack(R, 0, zc);
  const I = MN.aislador;
  R.cortar(k.g, [k.xp - 60, k.xp + .01, -60, .01, zc - I.H / 2 - 1, zc + 2]);
  R.ancla('rack', [MN.rack.e, -MN.rack.a / 2, zc + I.H / 2 + 30]); R.ancla('brazo', [k.xp + 30, -MN.rack.a / 2, zc + I.H / 2 + MN.rack.e + 2]);
  R.ancla('pollera', [k.xp - I.Dmax / 2 * .7, -I.Dmax / 2 * .7, zc + I.H / 2 - 8]); R.ancla('cuello', [k.xp - 2, -I.Dcuello / 2 - .5, zc - 10]);
  R.ancla('agujero', [k.xp - I.agujero / 2 - 1, -.2, zc - 20]); R.ancla('perno', [k.xp, -7, zc - 10]); R.ancla('chaveta', [k.xp, -11, zc + I.H / 2 + MN.rack.e + 5]);
  R.ancla('corte', [k.xp - 20, -.2, zc - 30]);
}
