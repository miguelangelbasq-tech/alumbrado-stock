/* MAT-ACCESORIOS_PAT-3 · ítem 77: caño H°G° 3/4" (rosca gas BSP 55° real) con cupla, cortado a cuarto, y el cable 1 × 10 V/A adentro (Ø AC) */
import { CANO } from '../piezas/perfiles_pat.mjs';
import { matsP, canoRoscado, cupla, cableVA } from '../piezas/pat.mjs';
export default function (R) {
  R.vista({ az: -28, el: 18, fov: 13, margen: .05 });
  R.config({ bordeOp: .3 });
  const M = matsP(R), c = CANO.c34, Lr = CANO.rosca, cu = CANO.cupla, ref = [1, 0, 0];
  // caño de abajo: rosca arriba, metido media cupla; cupla cortada a cuarto; caño de arriba explotado (rosca abajo)
  canoRoscado(R, [0, 0, -150], [0, 0, 1], c, 150, Lr, M.galv, M.galvC, { a0: 270, a1: 540, ref });
  cupla(R, [0, 0, -cu.L / 2 - 2], [0, 0, 1], c, cu.L, cu.e, M.galv, M.galvC, { a0: 270, a1: 540, ref });
  canoRoscado(R, [0, 0, 150], [0, 0, -1], c, 110, Lr, M.galv, M.galvC, { a0: 180, a1: 450, ref: [1, 0, 0] });
  cableVA(R, (u) => [0, 0, -150 + u], 0, 300, 300, { r: 3.0, up: [1, 0, 0], franjas: [100, 280], n: 160 });
  R.ancla('cano', [c.De / 2 * .7, -c.De / 2 * .7, -110]); R.ancla('rosca', [-.3, -c.De / 2 + .6, -cu.L / 2 - 6]); R.ancla('cupla', [-(c.De / 2 + cu.e) * .9, (c.De / 2 + cu.e) * .3, 8]);
  R.ancla('roscaC', [-.3, -c.De / 2 - .4, 6]); R.ancla('cable', [0, -3, 70]); R.ancla('canoS', [-c.De / 2 * .7, -c.De / 2 * .7, 110]); R.ancla('roscaS', [-c.De / 2 * .7, -c.De / 2 * .7, 55]);
  R.ancla('pared', [-.2, -c.De / 2 + c.e / 2, -120]);
}
