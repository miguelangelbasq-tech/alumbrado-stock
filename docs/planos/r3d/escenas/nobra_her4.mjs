/* MAT-HERRAJES-4 (grupo «nobra») · collar con espiga móvil (4052–4055; se dibuja el de Ø260, 4053) cerrado en el poste de H°A°:
 * 2 medias de planchuela con orejas y 2 bulones 1/2", buje soldado adelante, espiga Ø16 que gira / corre adentro y se traba con el
 * prisionero (4058). A la derecha, en fila: bulón 12 × 90 (4048), 12 × 250 (4051), de cabeza redonda 12 × 1" (4056), prisioneros
 * de 3 y 4 cm (4058 / 4059) y perno Ø16 del aislador MN 16 (4057) con su carretel. Medidas: COLLAR, BULN, PERNO16 (AC). */
import { COLLAR, BULN, PERNO16, MN16 } from '../piezas/perfiles_nobra.mjs';
import { ABR, BUL } from '../piezas/perfiles_pat.mjs';
import { posteHA, aisladorMN } from '../piezas/aerea.mjs';
import { matsP, abrazadera, bulon, tuerca, arandelaP } from '../piezas/pat.mjs';
export default function (R) {
  R.vista({ az: -30, el: 26, fov: 14, margen: .04 });
  R.config({ bordeOp: .3 });
  const M = matsP(R), W = BUL.w12, zc = 400, D = 260, R0 = D / 2, e = ABR.e, B = COLLAR.buje, E = COLLAR.espiga;
  posteHA(R, 300, 640, R0 + .015 * (zc - 300), .015);
  abrazadera(R, D, zc, { escotes: 0 });
  for (const s of [-1, 1]) {
    const xo = s * (R0 + ABR.oreja / 2);
    bulon(R, [xo, ABR.luz / 2 + e + .2, zc], [0, -1, 0], { d: W.d, paso: W.paso, ang: 55, L: 40, Lr: 24, af: W.af, k: W.k, ref: [0, 0, 1] });
    tuerca(R, [xo, -ABR.luz / 2 - e, zc], [0, -1, 0], { d: W.d, paso: W.paso, ang: 55, af: W.af, e: W.tuerca, ref: [0, 0, 1] });
  }
  // buje soldado a la media de adelante (sale hacia −y), con la espiga adentro y el prisionero arriba
  const y0 = -(R0 + e) + 1, y1 = y0 - B.L;
  R.torno([0, y0, zc], [0, y1, zc], [[B.Di / 2, 0], [B.De / 2, 0], [B.De / 2, B.L], [B.Di / 2, B.L]], M.galv, { seg: 64 });
  R.torno([0, y0 + 1, zc], [0, y0 - 3, zc], [[B.De / 2, 0], [B.De / 2 + 3, 0], [B.De / 2, 4]], M.soldadura, { seg: 48 });
  const yE1 = y1 - B.sale - 60;
  R.cil([0, y0 - 2, zc], [0, yE1, zc], E.d / 2, M.galv, { seg: 48 });
  tuerca(R, [0, yE1 + 26, zc], [0, -1, 0], { d: 16, paso: 2, ang: 60, af: 24, e: 13, ref: [0, 0, 1] });
  bulon(R, [0, y1 + B.L / 2, zc + B.De / 2 + 12], [0, 0, -1], { d: 10, paso: 1.5, ang: 60, L: 30, Lr: 22, af: 17, k: 6.5, ref: [1, 0, 0] });
  // fila de bulones, de izquierda a derecha, acostados (eje x) en z = 300
  const zf = 318, F = BULN;
  const fila = [['b4048', 230], ['b4051', 270], ['b4056', 310], ['b4058', 345], ['b4059', 375]];
  for (const [k, yy] of fila) {
    const b = F[k], x0 = 260;
    if (b.tipo === 'carrocero') {
      R.torno([x0 - b.k, yy - 300, zf], [x0, yy - 300, zf], [[0, 0], [b.dk / 2 - .4, 0], [b.dk / 2 - 2, b.k * .6], [b.dk * .25, b.k], [0, b.k]].map(([r, t]) => [r, b.k - t]), M.galv, { seg: 64 });
      R.caja(x0, x0 + b.cuello, yy - 300 - b.d / 2, yy - 300 + b.d / 2, zf - b.d / 2, zf + b.d / 2, M.galv, { r: .4 });
      bulon(R, [x0 + b.cuello, yy - 300, zf], [1, 0, 0], { d: b.d, paso: W.paso, ang: 55, L: b.L - b.cuello, Lr: b.L - b.cuello, af: 0.1, k: .01, ref: [0, 0, 1] });
    } else {
      bulon(R, [x0, yy - 300, zf], [1, 0, 0], { d: b.d, paso: b.d > 12 ? W.paso : 1.5, ang: b.d > 12 ? 55 : 60, L: b.L, Lr: b.Lr, af: b.af, k: b.k, ref: [0, 0, 1] });
    }
    R.ancla(k, [x0 + Math.min(b.L, 60) * .5, yy - 300, zf + b.d / 2]);
  }
  tuerca(R, [262 + 90 - 20, -70, zf], [1, 0, 0], { d: W.d, paso: W.paso, ang: 55, af: W.af, e: W.tuerca, ref: [0, 0, 1] });
  tuerca(R, [262 + 250 - 30, -30, zf], [1, 0, 0], { d: W.d, paso: W.paso, ang: 55, af: W.af, e: W.tuerca, ref: [0, 0, 1] });
  // perno del MN 16 parado, con el carretel y la tuerca
  const P = PERNO16, xp = 560, yp = -150;
  bulon(R, [xp, yp, zf - 18 + P.L], [0, 0, -1], { d: P.d, paso: 2, ang: 60, L: P.L, Lr: P.Lr, af: P.af, k: P.k, ref: [1, 0, 0] });
  arandelaP(R, [xp, yp, zf - 18 + P.L - 1], [0, 0, -1], 17, P.arandela.de, P.arandela.e, M.galv);
  aisladorMN(R, [xp, yp, zf - 18 + P.L - 4 - MN16.H / 2], [0, 0, 1]);
  R.ancla('perno', [xp, yp - P.d / 2, zf + 20]); R.ancla('mn16', [xp + MN16.D / 2 - 3, yp, zf - 18 + P.L - 4 - MN16.H / 2]);
  R.ancla('poste', [-60, -100, 560]); R.ancla('collar', [-R0 * .7, -R0 * .72 - 3, zc + 10]); R.ancla('oreja', [R0 + ABR.oreja * .7, -ABR.luz / 2 - e, zc + ABR.a / 2]);
  R.ancla('buje', [B.De / 2, y1 + B.L * .4, zc]); R.ancla('espiga', [E.d / 2, yE1 + 40, zc]); R.ancla('prisionero', [0, y1 + B.L / 2, zc + B.De / 2 + 8]); R.ancla('tuercaE', [0, yE1 + 20, zc + 12]);
}
