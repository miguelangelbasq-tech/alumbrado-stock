/* MAT-FUNDACION-1 (grupo «nobra») · los materiales del pozo, a escala: bolsa de cemento 50 kg (8039), montón de arena gruesa (8040) y de arena
 * fina seca (6027), balde de 20 L de agua (8041), bloque de telgopor (8042), cartucho de elastómero (8043), tramo de molde PVC Ø250 (5036) y
 * caño de desagüe Ø25,4 (5037). Medidas: BOLSA50, BALDE, CARTU, FUND (AC). */
import { BOLSA50 as BO, BALDE as BA, CARTU as CA, FUND as F } from '../piezas/perfiles_nobra.mjs';
import { matsC, bolsa, monton } from '../piezas/civil_util.mjs';
export default function (R) {
  R.vista({ az: -26, el: 24, fov: 15, margen: .035 });
  R.config({ bordeOp: .25 });
  const M = matsC(R), T = R.THREE;
  bolsa(R, [0, 0, 0], BO.L, BO.A, BO.H, M.kraft);
  R.impreso([{ t: 'CEMENTO PORTLAND', s: 1 }, { t: 'CPN 40  ·  50 kg', s: 1.1 }], 520, 220, [0, 0, BO.H + 1.5], [1, 0, 0], [0, 1, 0], { color: '#1d3f78', px: 32, sep: .5 });
  monton(R, [780, -60, 0], 360, 230, M.arena);
  const fina = R.M.arena(); fina.color.set('#efe3c6');
  monton(R, [780, 640, 0], 300, 170, fina);
  // balde de 20 L con agua
  const xb = 120, yb = 620, bal = R.M.pa('#2a6fb0', { roughness: .45, clearcoat: .3 });
  R.torno([xb, yb, 0], [xb, yb, BA.H], [[0, 0], [BA.D0 / 2, 0], [BA.D1 / 2, BA.H], [BA.D1 / 2 - 4, BA.H], [BA.D0 / 2 - 4, 4], [0, 4]], bal, { seg: 72 });
  const agua = new T.MeshPhysicalMaterial({ color: '#7fb6d9', roughness: .05, metalness: 0, transparent: true, opacity: .8, clearcoat: 1 });
  R.torno([xb, yb, 4], [xb, yb, BA.H * .82], [[0, 0], [BA.D0 / 2 - 4, 0], [BA.D0 / 2 - 4 + (BA.D1 - BA.D0) / 2 * .8, BA.H * .82 - 4], [0, BA.H * .82 - 4]], agua, { seg: 72 });
  R.impreso(['20 L'], 90, 40, [xb, yb - BA.D1 / 2 * .98, BA.H * .5], [1, 0, 0], [0, 0, 1], { color: '#ffffff', ppm: 6 });
  // telgopor, cartucho, molde y desagüe
  R.caja(-420, -420 + F.telg.a, 380, 380 + F.telg.b, 0, F.telg.h * .5, M.telgopor, { r: 2 });
  const xc = 220, yc = -520;
  R.cil([xc, yc, CA.D / 2], [xc + CA.L, yc, CA.D / 2], CA.D / 2, M.cartucho, { seg: 48 });
  R.cil([xc + CA.L, yc, CA.D / 2], [xc + CA.L + CA.pico, yc, CA.D / 2], 6, M.cartucho, { seg: 24, r1: 3 });
  R.torno([-560, 620, 0], [-560, 620, 300], [[F.Dcom / 2 - F.eMolde, 0], [F.Dcom / 2, 0], [F.Dcom / 2, 300], [F.Dcom / 2 - F.eMolde, 300]], M.pvc, { seg: 96 });
  R.torno([300, -380, F.desague.D / 2], [800, -380, F.desague.D / 2], [[F.desague.D / 2 - F.desague.e, 0], [F.desague.D / 2, 0], [F.desague.D / 2, 500], [F.desague.D / 2 - F.desague.e, 500]], M.pvc, { seg: 48 });
  R.ancla('cemento', [-BO.L * .35, -BO.A * .5, BO.H * .7]); R.ancla('arenaG', [780 - 110, -60 - 200, 120]); R.ancla('arenaF', [780 - 100, 640 - 160, 90]);
  R.ancla('agua', [xb, yb - BA.D1 / 2, BA.H * .7]); R.ancla('telgopor', [-420 + F.telg.a / 2, 380, F.telg.h * .5]); R.ancla('cartucho', [xc + 100, yc - CA.D / 2, CA.D / 2]);
  R.ancla('molde', [-560 + F.Dcom / 2 * .7, 620 - F.Dcom / 2 * .7, 220]); R.ancla('desague', [600, -380 - F.desague.D / 2, F.desague.D / 2]);
}
