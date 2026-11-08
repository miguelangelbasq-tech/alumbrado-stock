/* MAT-MORSETO-1 · PKD-14PF (Metal-CE 1995/4): derivación de fase con portafusible tipo Neozed (AC) */
import { morseto } from '../piezas/morseto.mjs';
import { MORS } from '../piezas/perfiles_cables.mjs';
export default function (R) {
  R.vista({ az: 150, el: 22, fov: 13, margen: .04 });
  const P = MORS.PKD14;
  const o = morseto(R, { tipo: 'PKD14', pf: true, linIni: -45, linFin: 45, derIni: -45 });
  R.ancla('cuerpo', [-P.L / 2 + 6, o.yF, -P.H / 2 + 10]);
  R.ancla('pf', [P.L / 2 + 15, 0, P.zD + 10.5]);
  R.ancla('tapa', [P.L / 2 + 40, 0, P.zD + 11]);
  R.ancla('salida', [P.L / 2 + 95, 0, P.zD + 2.2]);
  R.ancla('linea', [38, 0, P.zP + o.cab.lin.rc]);
  R.ancla('fusible', [0, o.yb + 5 + P.bulon.cuello + P.bulon.k, P.bulon.z + 4]);
}
