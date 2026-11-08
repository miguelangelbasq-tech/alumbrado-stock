/* MAT-BORNERAS-1 · fila de bornes BPN-06 en el riel NS35: tope · PE · PE · N (con peine de 3) · separador · R · S · T · tapa final (afuera, para ver adentro) · tope */
import { riel, borne, peine, cable, tapa, separador, tope } from '../piezas/bpn.mjs';
import { BPN, PEINE, TOPE, SEPARADOR, TAPA } from '../piezas/perfiles.mjs';
export default function (R) {
  R.vista({ az: 138, el: 27, fov: 13, margen: .03 });
  const P = BPN.paso, xm = i => xB[i] + 1 + (P - 1) / 2;
  const xB = []; let x = 0;
  tope(R, -TOPE.esp - .2);
  const filas = [['PE', R.PAL.verde, ['#13843a', '#f2c418']], ['PE', R.PAL.verde, null], ['N', R.PAL.celeste, ['#1f78c0']], ['SEP'],
    ['R', R.PAL.grisBPN, ['#6e3b1d']], ['S', R.PAL.grisBPN, ['#26282b']], ['T', R.PAL.grisBPN, ['#c8302c']]];
  for (const f of filas) {
    if (f[0] === 'SEP') { separador(R, x); R.ancla('separador', [x + .75, 35, 53.2]); x += SEPARADOR.esp; continue; }
    xB.push(x); borne(R, x, f[1], { marca: f[0] });
    if (f[2]) cable(R, x + 1 + (P - 1) / 2, 'D', f[2], { largo: 26 });
    x += P;
  }
  const xT = x;
  riel(R, -TOPE.esp - 4, x + 14);
  peine(R, 3, 0);
  // anclas para los globos del SVG (mismos números que el plano)
  const xt = xB[5];
  R.ancla('cuerpo', [xB[4] + 8, 20, 50]);
  R.ancla('tornillo', [xt + 4.6, BPN.yT[1], BPN.tornillo.zCab]);
  R.ancla('jaula', [xt + 7.5, BPN.yT[1] + 4.4, 8.5]);
  R.ancla('barra', [xt + 7.0, 30, 17.5]);
  R.ancla('zocalo', [xt + 6.6, 21, 23]);
  R.ancla('boca', [xm(4), BPN.C, 15.5]);
  R.ancla('traba', [xt + 8.2, 49, 3.6]);
  R.ancla('marcador', [xB[3] + 4.6, 31, 50.3]);
  R.ancla('peine', [xB[1] + 3, 23.2, 52]);
  R.ancla('pe', [xB[0] + 2, 45, 40]);
  R.ancla('n', [xB[2] + 8.2, 45, 40]);
  R.ancla('tope', [-5, 48, 17]);
  R.ancla('riel', [xT + 10, 44, -2]);
  R.ancla('puntera', [xm(3), BPN.C + 5, BPN.puntera.zEje + 3.2]);
  R.ancla('cable', [xm(5), BPN.C + 26, BPN.puntera.zEje + 2.75]);
}
