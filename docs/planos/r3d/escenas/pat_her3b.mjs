/* MAT-HERRAJES-3 · en su lugar: cierre de las orejas de una abrazadera con bulón 1/2", arandela plana + presión y tuerca (cortado a cuarto); capa de zinc del galvanizado */
import { ABR, BUL } from '../piezas/perfiles_pat.mjs';
import { matsP, bulon, tuerca, arandelaP, arandelaG } from '../piezas/pat.mjs';
export default function (R) {
  R.vista({ az: 52, el: 24, fov: 13, margen: .05 });
  R.config({ bordeOp: .3 });
  const M = matsP(R), W = BUL.w12, e = ABR.e, a = ABR.a, luz = ABR.luz;
  // 2 orejas (planchuela) con agujero Ø14, separadas por la luz; el eje del bulón es y
  const g = R.grupo();
  for (const [y0, y1] of [[luz / 2, luz / 2 + e], [-luz / 2 - e, -luz / 2]]) {
    let o = R.caja(-10, 60, y0, y1, -a / 2, a / 2, M.galv, { r: .5, padre: null });
    o = R.restarCSG(o, R.cil([20, y0 - 2, 0], [20, y1 + 2, 0], ABR.agujero / 2, M.galv, { padre: null, seg: 40 }), M.galvC);
    g.add(o);
    // capa de zinc (exagerada ×10 para que se vea) en la cara de arriba
    R.caja(-10, 60, y0, y1, a / 2, a / 2 + .85, M.zinc, { r: 0, padre: g });
  }
  R.cortar(g, [20, 70, -40, 40, 0, 30]);
  const yb = luz / 2 + e + .1;
  bulon(R, [20, yb, 0], [0, -1, 0], { d: W.d, paso: W.paso, ang: 55, L: 40, Lr: 26, af: W.af, k: W.k, ref: [1, 0, 0], a0: 90, a1: 360 });
  const y1 = -luz / 2 - e;
  arandelaP(R, [20, y1, 0], [0, -1, 0], BUL.plana.di, BUL.plana.de, BUL.plana.e, M.galv);
  arandelaG(R, [20, y1 - BUL.plana.e, 0], [0, -1, 0], BUL.presion.di, BUL.presion.de, BUL.presion.e, M.galv, { ref: [1, 0, 0], sep: .3 });
  const t = tuerca(R, [20, y1 - BUL.plana.e - BUL.presion.e - .3, 0], [0, -1, 0], { d: W.d, paso: W.paso, ang: 55, af: W.af, e: W.tuerca, ref: [1, 0, 0], a0: 90, a1: 360 });
  R.cortar(t, [20, 50, -60, 0, 0, 30]);
  R.ancla('oreja', [-5, luz / 2 + e, a / 2 - 4]); R.ancla('zinc', [0, luz / 2 + e / 2, a / 2 + .85]); R.ancla('bulon', [20 - W.af / 2, yb + W.k / 2, 4]);
  R.ancla('rosca', [20 + W.d / 2 - .5, y1 - 8, .3]); R.ancla('plana', [20 - BUL.plana.de / 2 * .8, y1 - 1, -BUL.plana.de / 2 * .5]); R.ancla('presion', [20 - BUL.presion.de / 2 * .8, y1 - 3.5, -4]);
  R.ancla('tuerca', [20 - W.af / 2, y1 - 12, -3]); R.ancla('luz', [-8, 0, a / 2]); R.ancla('agujero', [20 + ABR.agujero / 2, luz / 2 + 2, .3]);
}
