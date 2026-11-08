/* MAT-SENAL_SELLADO-2 · base del poste PRFV en la fundación (AP-TC-003-A) cortada a cuarto: arena fina hasta −50 y sello de 50 arriba */
import { SELLO } from '../piezas/perfiles_civil.mjs';
import { matsC, revol, cte } from '../piezas/civil_util.mjs';
import { bloqueZ, rect2, circ } from '../piezas/col_util.mjs';
export default function (R) {
  R.vista({ az: -34, el: 26, fov: 15, margen: .04 });
  R.config({ bordeOp: .3 });
  const M = matsC(R), rm = 247 / 2, rp = 197 / 2, B = 300, z0 = -420, cu = [-1000, 0, -1000, 0];
  bloqueZ(R, rect2(-B, B, -B, B), [circ(0, 0, rm + 1, 96)], z0, -SELLO.sello, M.horm, { cuarto: cu });
  bloqueZ(R, rect2(-B, B, -B, B), [circ(0, 0, rm + 1, 96)], -SELLO.sello, 0, M.horm, { cuarto: cu });
  // molde PVC Ø247 (queda perdido) y poste PRFV Ø197
  revol(R, { p0: [0, 0, z0], dir: [0, 0, 1], L: -z0 - 2, ro: cte(rm), ri: cte(rm - 3.2), a0: -90, a1: 180, mat: M.pvc, matC: M.pvcCorte, nt: 120, dz: 100 });
  revol(R, { p0: [0, 0, z0], dir: [0, 0, 1], L: -z0 + 260, ro: (th, z) => rp - z * .01, ri: (th, z) => rp - 6 - z * .01, a0: -90, a1: 180, mat: M.prfv, matC: R.M.pa('#8c9295'), nt: 120, dz: 40 });
  // arena fina seca entre poste y molde hasta −50, sello elastómero en los últimos 50
  revol(R, { p0: [0, 0, z0], dir: [0, 0, 1], L: -z0 - SELLO.arena, ro: cte(rm - 3.3), ri: (th, z) => rp - (z) * .01 + .3, a0: -90, a1: 180, mat: M.arena, matC: M.arena, nt: 120, dz: 40 });
  revol(R, { p0: [0, 0, -SELLO.sello], dir: [0, 0, 1], L: SELLO.sello + 3, ro: (th, z) => z > SELLO.sello - 3 ? rm + 6 : rm - 3.3, ri: (th, z) => rp - (z - SELLO.sello - z0) * .01 + .3, a0: -90, a1: 180, mat: M.elast, matC: M.elast, nt: 120, dz: 3 });
  R.ancla('sello', [-rm + 8, 0, -20]); R.ancla('arena', [-(rm + rp) / 2, 0, -200]); R.ancla('poste', [rp * .6, -rp * .7, 150]); R.ancla('molde', [-rm, 0, -300]); R.ancla('horm', [-250, 0, -250]);
  R.ancla('pared', [-rp + 3, 0, 80]);
}
