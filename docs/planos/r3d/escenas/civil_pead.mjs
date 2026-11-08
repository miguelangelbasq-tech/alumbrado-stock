/* MAT-CAÑOS-2 · rollo de PEAD Ø50 y unión a compresión cortada a cuarto (cuerpo, tuercas, junta tórica, anillo de agarre) (*) */
import { PEAD } from '../piezas/perfiles_civil.mjs';
import { matsC, tuboB, recta, revol, cte } from '../piezas/civil_util.mjs';
export default function (R) {
  R.vista({ az: -28, el: 26, fov: 15, margen: .05 });
  R.config({ bordeOp: .3, exposicion: .95 });
  const M = matsC(R), T = R.THREE, ro = PEAD.D / 2, ri = ro - PEAD.e;
  // ---- unión a compresión (*) sobre el eje x, adelante; corte a cuarto (se saca arriba-adelante)
  const C = PEAD.cupla, y0 = -120, L = 380, q = { a0: 90, a1: 360, matC: M.peadCorte, nt: 120 };
  for (const s of [-1, 1]) revol(R, { p0: [s * 4, y0, ro], dir: [s, 0, 0], L: L / 2, ro: cte(ro), ri: cte(ri), mat: M.pead, ...q, dz: L / 4 });
  const cuerpo = R.M.pa('#2b2e33', { roughness: .5 }); cuerpo.userData.corte = M.peadCorte;
  const azul = R.M.pa('#2f6db3', { roughness: .45, clearcoat: .2 }); const azulC = R.M.pa('#7fa8d8', { roughness: .7 });
  const L2 = C.L / 2;
  revol(R, { p0: [-L2 + C.Lt - 6, y0, ro], dir: [1, 0, 0], L: C.L - 2 * (C.Lt - 6), ro: (th, z) => (z < 8 || z > C.L - 2 * (C.Lt - 6) - 8) ? C.Dc / 2 - 3 : C.Dc / 2, ri: cte(ro + .3), mat: cuerpo, ...q, matC: R.M.pa('#6b6f75', { roughness: .8 }), dz: 2 });
  for (const s of [-1, 1]) {
    const x0 = s < 0 ? -L2 : L2 - C.Lt;
    revol(R, { p0: [x0, y0, ro], dir: [1, 0, 0], L: C.Lt, ro: (th) => C.tuerca / 2 - (Math.cos(th * 12) > .6 ? 1.2 : 0), ri: (th, z) => ((s < 0 ? z : C.Lt - z) < 6) ? ro + .8 : C.Dc / 2 - 2.5, mat: azul, ...q, matC: azulC, dz: 1 });
    // junta tórica (NBR) y anillo de agarre (POM con dientes)
    const xo = s * (L2 - C.Lt - 10), xa = s * (L2 - C.Lt + 8);
    revol(R, { p0: [xo - C.oring, y0, ro], dir: [1, 0, 0], L: 2 * C.oring, ro: (th, z) => ro + .3 + Math.sqrt(Math.max(0, C.oring ** 2 - (z - C.oring) ** 2)) * 1.0, ri: cte(ro + .05), mat: M.goma, ...q, matC: R.M.goma('#3b3c40'), dz: .5 });
    revol(R, { p0: [xa - 6, y0, ro], dir: [1, 0, 0], L: 12, ro: cte(ro + 6), ri: (th, z) => ro + .2 + (z % 3 < 1.5 ? 0 : 1.2), mat: M.nylonB, ...q, matC: M.nylonCorte, dz: .5 });
    R.ancla(s < 0 ? 'oring' : 'oring2', [xo, y0, ro + ro + 2]); R.ancla(s < 0 ? 'agarre' : 'agarre2', [xa, y0 - 1, ro + ro + 3]);
  }
  R.ancla('cuerpo', [0, y0 - C.Dc / 2 * .7, ro + C.Dc / 2 * .7]); R.ancla('tuerca', [L2 - C.Lt / 2, y0 - C.tuerca / 2 * .75, ro + C.tuerca / 2 * .66]);
  R.ancla('pared', [-150, y0 + .1, ro + ri + PEAD.e / 2]); R.ancla('tope', [0, y0 + .1, ro + ro]);
}
