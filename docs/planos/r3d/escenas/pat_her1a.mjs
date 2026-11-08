/* MAT-HERRAJES-1 · abrazaderas H°G° de planchuela 4,76 × 31,7: lisa Ø220 (4004), 1 escote Ø140 (4001), 2 escotes Ø200 (4002), con sus bulones */
import { ABR, BUL } from '../piezas/perfiles_pat.mjs';
import { matsP, abrazadera, bulon, tuerca, arandelaP, arandelaG } from '../piezas/pat.mjs';
export default function (R) {
  R.vista({ az: -30, el: 38, fov: 13, margen: .04 });
  R.config({ bordeOp: .3 });
  const M = matsP(R), W = BUL.w12;
  const piezas = [[220, 0, 0, 0], [140, 1, 300, -40], [200, 2, 140, 260]];
  for (const [D, esc, x, y] of piezas) {
    const g = R.grupo(); abrazadera(R, D, 0, { escotes: esc, padre: g }); g.position.set(x, y, 0);
    // 2 bulones 1/2" en las orejas (cabeza arriba en +y de la luz, tuerca abajo)
    for (const s of [-1, 1]) {
      const xo = x + s * (D / 2 + ABR.oreja / 2), yo = y + ABR.luz / 2 + ABR.e;
      bulon(R, [xo, yo + .2, 0], [0, -1, 0], { d: W.d, paso: W.paso, ang: 55, L: 40, Lr: 24, af: W.af, k: W.k, ref: [0, 0, 1] });
      arandelaP(R, [xo, y - ABR.luz / 2 - ABR.e, 0], [0, -1, 0], BUL.plana.di, BUL.plana.de, BUL.plana.e, M.galv);
      arandelaG(R, [xo, y - ABR.luz / 2 - ABR.e - BUL.plana.e, 0], [0, -1, 0], BUL.presion.di, BUL.presion.de, BUL.presion.e, M.galv, { ref: [0, 0, 1], sep: .8 });
      tuerca(R, [xo, y - ABR.luz / 2 - ABR.e - BUL.plana.e - BUL.presion.e - .8, 0], [0, -1, 0], { d: W.d, paso: W.paso, ang: 55, af: W.af, e: W.tuerca, ref: [0, 0, 1] });
    }
  }
  R.ancla('lisa', [0, 220 / 2 + 3, ABR.a / 2]); R.ancla('esc1', [300, -40 + 70 + ABR.escote.h * .8, ABR.a / 2]); R.ancla('esc2', [140, 260 + 100 + ABR.escote.h * .8, ABR.a / 2]);
  R.ancla('esc2b', [140, 260 - 100 - ABR.escote.h * .8, ABR.a / 2]);
  R.ancla('oreja', [-(110 + ABR.oreja * .8), -ABR.luz / 2 - ABR.e, ABR.a / 2]); R.ancla('bulon', [110 + ABR.oreja / 2 + 3, ABR.luz / 2 + ABR.e + W.k, 4]);
  R.ancla('tuerca', [110 + ABR.oreja / 2, -ABR.luz / 2 - 20, W.af / 2]); R.ancla('planchuela', [-110 * .7, -110 * .7 - 3, ABR.a / 2]);
}
