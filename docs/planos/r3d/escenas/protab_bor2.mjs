/* MAT-BORNERAS-2 · tira del tablerito de abajo con jabalina (TC-PRFV-02): tope · PE · N (peine PE-N) · separador · R · S · T · tapa final · tope */
import { riel, borne, peine, cable, tapa, separador, tope } from '../piezas/bpn.mjs';
import { BPN, TOPE, SEPARADOR, TAPA } from '../piezas/perfiles.mjs';
export default function (R, P = {}) {
  const ex = P.explotado ? 9 : 0;   // separación entre piezas (vista explotada)
  R.vista(P.explotado ? { az: 150, el: 30, fov: 12, margen: .03 } : { az: 162, el: 30, fov: 13, margen: .03 });
  const paso = BPN.paso; let x = 0; const xs = {};
  tope(R, -TOPE.esp - .2 - ex); xs.topeI = -TOPE.esp - .2 - ex;
  const filas = [['PE', R.PAL.verde, ['#13843a', '#f2c418']], ['N', R.PAL.celeste, ['#1f78c0']], ['SEP'],
    ['R', R.PAL.grisBPN, ['#6e3b1d']], ['S', R.PAL.grisBPN, ['#26282b']], ['T', R.PAL.grisBPN, ['#c8302c']], ['TAPA'], ['TOPE']];
  for (const f of filas) {
    if (f[0] === 'SEP') { separador(R, x, '#3b3d41'); xs.sep = x; x += SEPARADOR.esp + ex; continue; }
    if (f[0] === 'TAPA') { tapa(R, x, R.PAL.grisBPN); xs.tapa = x; x += TAPA.esp + .2 + ex; continue; }
    if (f[0] === 'TOPE') { tope(R, x); xs.topeD = x; x += TOPE.esp; continue; }
    xs[f[0]] = x; borne(R, x, f[1], { marca: f[0] });
    if (!P.explotado) cable(R, x + 1 + (paso - 1) / 2, 'D', f[2], { largo: 30 });
    x += paso + ex;
  }
  riel(R, xs.topeI - 6, x + 6);
  const gp = peine(R, 2, xs.PE, { leyenda: false });
  if (P.explotado) gp.position.set(0, 0, 22);
  // anclas
  R.ancla('sep', [xs.sep + .75, 44, 52]);
  R.ancla('topeI', [xs.topeI + 2, 46, 12]);
  R.ancla('topeD', [xs.topeD + TOPE.esp - 1, 44, 10]);
  R.ancla('tornTope', [xs.topeD + TOPE.esp / 2, TOPE.yT, 27]);
  R.ancla('tapa', [xs.tapa + TAPA.esp, 40, 30]);
  R.ancla('peine', [xs.PE + 8.2, BPN.yPuente + 2.2, 52 + (P.explotado ? 22 : 0)]);
  R.ancla('dientes', [xs.N + 4.6, BPN.yPuente, 30 + (P.explotado ? 22 : 0)]);
  R.ancla('pe', [xs.PE + 2, 45, 38]);
  R.ancla('n', [xs.N + 6, 45, 38]);
  R.ancla('fase', [xs.S + 6, 45, 38]);
  R.ancla('riel', [x + 3, 44, -3]);
  R.ancla('cable', [xs.R + 4.6, BPN.C + 28, BPN.puntera.zEje + 2.75]);
  R.ancla('cablePE', [xs.PE + 4.6, BPN.C + 28, BPN.puntera.zEje + 2.75]);
}
