/* MAT-MORSETO-2 · PKD-16 (Metal-CE 1995/3): línea y derivación de 25–95 mm², cortado a cuarto por los dientes */
import { morseto } from '../piezas/morseto.mjs';
import { MORS } from '../piezas/perfiles_cables.mjs';
export default function (R) {
  R.vista({ az: 140, el: 22, fov: 13, margen: .04 });
  const P = MORS.PKD16, xc = P.dientes.x[2];
  const o = morseto(R, { tipo: 'PKD16', corte: xc, linIni: -45, derIni: -45, derFin: 60 });
  const { yF, yA, yb, rcP, cab } = o;
  R.ancla('cuerpo', [-P.L / 2 + 6, yF, -P.H / 2 + 12]);
  R.ancla('linea', [-38, 0, P.zP + cab.lin.rc]);
  R.ancla('der', [50, 0, P.zD + cab.der.R]);
  R.ancla('diente', [xc + .1, -cab.lin.R - .8, P.zP]);
  R.ancla('cuerda', [xc, 0, P.zP + cab.lin.R * .4]);
  R.ancla('aisl', [xc, cab.lin.rc * .3, P.zP - cab.lin.rc * .9]);
  R.ancla('fusible', [0, yb + 5 + P.bulon.cuello + P.bulon.k, P.bulon.z + 5]);
  R.ancla('cabeza', [-5, yb + 2.5, P.bulon.z - 3]);
  R.ancla('placa', [xc, -rcP - 2, P.zP - rcP + 1]);
}
