/* MAT-MORSETO-1 · PKD-14 (Metal-CE 1995/6) en la línea, cortado a cuarto por los dientes */
import { morseto } from '../piezas/morseto.mjs';
import { MORS } from '../piezas/perfiles_cables.mjs';
export default function (R) {
  R.vista({ az: 140, el: 22, fov: 13, margen: .04 });
  const P = MORS.PKD14, xc = P.dientes.x[2];
  const o = morseto(R, { tipo: 'PKD14', lin: 'neutro', corte: xc, linIni: -42, derIni: -42 });
  const { yF, yA, yb, rcP, rcD, cab } = o;
  R.ancla('cuerpo', [-P.L / 2 + 6, yF, -P.H / 2 + 12]);
  R.ancla('mitadA', [-P.L / 2 + 4, yA + 4, P.H / 2]);
  R.ancla('linea', [-55, 0, P.zP + cab.lin.rc]);
  R.ancla('der', [-55, 0, P.zD + cab.der.rc]);
  R.ancla('diente', [xc, -cab.lin.R - .6, P.zP]);
  R.ancla('placa', [xc, -rcP - 2, P.zP - rcP + 1]);
  R.ancla('cuerda', [xc, 0, P.zP + cab.lin.R * .5]);
  R.ancla('aisl', [xc, cab.lin.rc * .2, P.zP - cab.lin.rc * .9]);
  R.ancla('fusible', [0, yb + 5 + P.bulon.cuello + P.bulon.k, P.bulon.z + 5]);
  R.ancla('cuello', [0, yb + 5 + P.bulon.cuello / 2, P.bulon.z - 2.6]);
  R.ancla('cabeza', [-5, yb + 2.5, P.bulon.z - 3]);
  R.ancla('tuerca', [-4, yA - 6, P.bulon.z - 5]);
  R.ancla('capuchon', [P.L / 2 + 8, 0, P.zD + 8]);
  R.ancla('bulon', [xc, yF - 6, P.bulon.z + 3.6]);
  R.ancla('leyenda', [-6, yF, P.H / 2 - 6]);
}
