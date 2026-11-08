/* MAT-CAÑOS-1 · tramos cortos de los 5 Ø a la misma escala, parados y cortados a cuarto (se ve la pared) */
import { PVC } from '../piezas/perfiles_civil.mjs';
import { matsC, revol, cte } from '../piezas/civil_util.mjs';
export default function (R) {
  R.vista({ az: -30, el: 34, fov: 15, margen: .05 });
  R.config({ bordeOp: .3 });
  const M = matsC(R);
  const L = [['d160', 0], ['d110', 175], ['d90', 310], ['d50', 420], ['d25', 492]];
  for (const [k, x] of L) {
    const c = PVC[k], ro = c.D / 2, ri = ro - c.e, H = 170;
    revol(R, { p0: [x, 0, 0], dir: [0, 0, 1], L: H, ro: cte(ro), ri: cte(ri), a0: -90, a1: 180, mat: M.pvc, matC: M.pvcCorte, nt: 120, dz: H / 2 });
    R.ancla(k, [x - ro * .2, -ro * .2 - .1, H + .5]); R.ancla(k + 'p', [x - ri - c.e / 2, -.2, H * .55]); R.ancla(k + 'b', [x, -ro, 0]);
  }
}
