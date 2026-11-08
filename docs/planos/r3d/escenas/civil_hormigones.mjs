/* MAT-ARIDOS_HORMIGON-2 · probetas y cubos cortados: se ve el árido de cada mezcla (H-13, H-21, H° pobre, mortero 1:3, calcáreo, revoque) */
import { ARIDO } from '../piezas/perfiles_civil.mjs';
import { matsC, revol, cte } from '../piezas/civil_util.mjs';
export default function (R) {
  R.vista({ az: -26, el: 24, fov: 15, margen: .04 });
  R.config({ bordeOp: .25 });
  const M = matsC(R), P = ARIDO.probeta;
  // probeta H-13 Ø150 × 300 cortada a cuarto (se saca x < 0, y < 0)
  const H13 = M.horm, ext = M.hormExt;
  revol(R, { p0: [0, 0, 0], dir: [0, 0, 1], L: P.H, ro: cte(P.D / 2), a0: -90, a1: 180, mat: ext, matC: H13, matTapa: H13, nt: 120, dz: P.H / 2 });
  // probeta H-21 (más cemento, piedra más junta) al lado
  const H21 = M.hormD;
  revol(R, { p0: [220, 0, 0], dir: [0, 0, 1], L: P.H, ro: cte(P.D / 2), a0: -90, a1: 180, mat: ext, matC: H21, nt: 120, dz: P.H / 2 });
  // cubos de 150 cortados (escalón): H° pobre, mortero 1:3, mortero calcáreo
  const cubo = (x, mat) => { const g = R.grupo(); R.caja(x - 75, x + 75, -75, 75, 0, 150, mat, { r: .5, padre: g }); R.cortar(g, [x - 200, x, -200, 0, 75, 300]); return g; };
  cubo(440, M.hormP); cubo(630, M.mortero); cubo(820, M.morteroCal);
  // revoque grueso sobre ladrillo (8024): 2 ladrillos y la capa de revoque cortada
  const g = R.grupo(); R.caja(930, 1180, -60, 60, 0, 50, M.ladrillo, { r: .8, padre: g }); R.caja(930, 1180, -60, 60, 65, 115, M.ladrillo, { r: .8, padre: g });
  R.caja(930, 1180, -60, 60, 50, 65, M.mortero, { r: .2, padre: g });
  R.caja(930, 1180, -80, -60, 0, 115, M.mortero, { r: .3, padre: g });
  R.caja(930, 1180, -83, -80, 0, 115, M.morteroCal, { r: .3, padre: g });
  R.cortar(g, [900, 1060, -200, 0, -10, 300]);
  R.ancla('h13', [-40, -.5, 200]); R.ancla('h13ext', [60, -40, 140]); R.ancla('h21', [180, -.5, 120]); R.ancla('pobre', [400, -.5, 110]); R.ancla('m13', [590, -.5, 110]);
  R.ancla('cal', [780, -.5, 110]); R.ancla('revoque', [1000, -70, 90]); R.ancla('fino', [1120, -83, 60]); R.ancla('ladrillo', [1100, -60, 90]);
}
