/* MAT-HERRAJES-1 · en su lugar: abrazadera con 2 escotes sobre el poste de H°A° (se elige por el Ø del poste en esa altura), cerrada con 2 bulones */
import { ABR, BUL } from '../piezas/perfiles_pat.mjs';
import { posteHA } from '../piezas/aerea.mjs';
import { matsP, abrazadera, bulon, tuerca, arandelaP } from '../piezas/pat.mjs';
export default function (R) {
  R.vista({ az: -34, el: 30, fov: 14, margen: .04 });
  R.config({ bordeOp: .3 });
  const M = matsP(R), W = BUL.w12, zc = 400, D = 200;
  posteHA(R, 330, 480, 104 - .015 * 330, .015);   // conicidad 15 mm/m (AC): Ø 200 a la altura de la abrazadera
  const g = R.grupo(); abrazadera(R, D, zc, { escotes: 0, padre: g });
  for (const s of [-1, 1]) {
    const xo = s * (D / 2 + ABR.oreja / 2);
    bulon(R, [xo, ABR.luz / 2 + ABR.e + .2, zc], [0, -1, 0], { d: W.d, paso: W.paso, ang: 55, L: 40, Lr: 24, af: W.af, k: W.k, ref: [0, 0, 1] });
    arandelaP(R, [xo, -ABR.luz / 2 - ABR.e, zc], [0, -1, 0], BUL.plana.di, BUL.plana.de, BUL.plana.e, M.galv);
    tuerca(R, [xo, -ABR.luz / 2 - ABR.e - BUL.plana.e, zc], [0, -1, 0], { d: W.d, paso: W.paso, ang: 55, af: W.af, e: W.tuerca, ref: [0, 0, 1] });
  }
  R.ancla('poste', [-75, -60, 460]); R.ancla('abrazadera', [-70, -D / 2 * .72 - 3, zc + 10]); R.ancla('escote', [D / 2 + ABR.oreja * .8, -ABR.luz / 2 - ABR.e, zc + ABR.a / 2]);
  R.ancla('bulon', [D / 2 + ABR.oreja / 2, ABR.luz / 2 + ABR.e + W.k, zc + 4]); R.ancla('tuerca', [-(D / 2 + ABR.oreja / 2), -ABR.luz / 2 - 16, zc + W.af / 2]);
}
