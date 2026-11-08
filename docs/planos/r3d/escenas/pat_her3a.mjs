/* MAT-HERRAJES-3 · despiece: bulón 1/2" Whitworth (rosca real 55°, 12 hilos/pulg) cortado a cuarto en la rosca, arandela plana, de presión, tuerca hexagonal y cuadrada, chapa de retención, espárrago M16 × 190 y capuchón R15 */
import { BUL } from '../piezas/perfiles_pat.mjs';
import { matsP, bulon, tuerca, arandelaP, arandelaG, revol, rosca, prismaN } from '../piezas/pat.mjs';
export default function (R) {
  R.vista({ az: -22, el: 30, fov: 13, margen: .04 });
  R.config({ bordeOp: .3 });
  const M = matsP(R), W = BUL.w12, cte = (k) => () => k;
  // bulón 4018 (Ø 1/2" × 90) a lo largo de +x, cabeza en x = 0
  bulon(R, [0, 0, 0], [1, 0, 0], { d: W.d, paso: W.paso, ang: 55, L: 90, Lr: 40, af: W.af, k: W.k, ref: [0, 0, 1], a0: 90, a1: 360 });
  arandelaP(R, [112, 0, 0], [1, 0, 0], BUL.plana.di, BUL.plana.de, BUL.plana.e, M.galv);
  arandelaG(R, [128, 0, 0], [1, 0, 0], BUL.presion.di, BUL.presion.de, BUL.presion.e, M.galv, { ref: [0, 0, 1] });
  const t = tuerca(R, [146, 0, 0], [1, 0, 0], { d: W.d, paso: W.paso, ang: 55, af: W.af, e: W.tuerca, ref: [0, 0, 1], a0: 90, a1: 360 });
  R.cortar(t, [140, 170, -30, .01, -.01, 30]);
  // fila de abajo: tuerca cuadrada, chapa de retención, espárrago M16 con 2 tuercas, capuchón R15
  const y2 = 70;
  tuerca(R, [0, y2, 0], [1, 0, 0], { d: W.d, paso: W.paso, ang: 55, af: BUL.cuadrada.a, e: BUL.cuadrada.e, n: 4, ref: [0, 0, 1] });
  let ch = R.caja(30, 30 + BUL.chapa.a, y2 - BUL.chapa.b / 2, y2 + BUL.chapa.b / 2, -BUL.chapa.e / 2 - 8, BUL.chapa.e / 2 - 8, M.galv, { r: .4, padre: null });
  ch = R.restarCSG(ch, R.cil([30 + BUL.chapa.a / 2, y2, -15], [30 + BUL.chapa.a / 2, y2, 0], BUL.chapa.agujero / 2, M.galv, { padre: null, seg: 32 }), M.galvC); R.agregar(ch);
  const E = BUL.esparrago, fe = rosca(E.d / 2, E.paso, 60);
  revol(R, { p0: [0, y2 + 60, 0], dir: [1, 0, 0], L: E.L, ro: (th, z) => { const v = fe(th, z); const a = Math.min(z, E.L - z); return a < 1.5 ? Math.min(v, E.d / 2 - 1.5 + a) : v; }, mat: M.galv, matC: M.galvC, nt: 72, dz: E.paso / 10, ref: [0, 0, 1] });
  for (const x of [20, E.L - 34]) tuerca(R, [x, y2 + 60, 0], [1, 0, 0], { d: E.d, paso: E.paso, ang: 60, af: 24, e: 13, ref: [0, 0, 1] });
  const C = BUL.capuchon;
  revol(R, { p0: [130, y2, 0], dir: [1, 0, 0], L: C.L, ro: (th, z) => z > C.L - 6 ? C.De / 2 * Math.sqrt(Math.max(0, 1 - Math.pow((z - C.L + 6) / 6, 2))) + .01 : C.De / 2, ri: (th, z) => z < C.L - 2 ? C.De / 2 - 1.8 : .01, a0: 90, a1: 360, ref: [0, 0, 1], mat: M.pvcN, matC: M.pvcNC, nt: 72, dz: 1 });
  R.ancla('cabeza', [W.k * -.5, -W.af / 2, 3]); R.ancla('vastago', [30, -W.d / 2, 0]); R.ancla('rosca', [70, 0, W.d / 2 - .4]); R.ancla('roscaC', [80, -.3, 4]);
  R.ancla('plana', [112, -BUL.plana.de / 2 * .8, BUL.plana.de / 2 * .5]); R.ancla('presion', [129, -BUL.presion.de / 2 * .8, BUL.presion.de / 2 * .5]);
  R.ancla('tuerca', [146 + W.tuerca / 2, -W.af / 2, 4]); R.ancla('tuercaC', [146 + 4, -.3, W.d / 2 + 2]);
  R.ancla('cuadrada', [BUL.cuadrada.e / 2, y2 - BUL.cuadrada.a / 2, 4]); R.ancla('chapa', [30 + 8, y2 - BUL.chapa.b / 2, -8]);
  R.ancla('esparrago', [E.L / 2, y2 + 60 - E.d / 2, 0]); R.ancla('tuercaE', [20 + 6, y2 + 60 - 12, 4]); R.ancla('capuchon', [130 + C.L / 2, y2 - C.De / 2 * .8, C.De / 2 * .5]);
}
