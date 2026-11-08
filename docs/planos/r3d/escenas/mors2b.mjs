/* MAT-MORSETO-2 · PKD-16 explotado: mitad de atrás con los dientes, mitad de adelante, bulón de cabeza fusible y tuerca */
import { morseto } from '../piezas/morseto.mjs';
import { MORS } from '../piezas/perfiles_cables.mjs';
export default function (R) {
  R.vista({ az: 128, el: 24, fov: 13, margen: .04 });
  const P = MORS.PKD16;
  const o = morseto(R, { tipo: 'PKD16', abierto: 30, linIni: -40, linFin: 40, derIni: -40, derFin: 40 });
  R.ancla('dientes', [P.dientes.x[3], -13 - o.cab.lin.R * .5, P.zP + 2]);
  R.ancla('mitadF', [-P.L / 2 + 4, o.yF, P.H / 2 - 4]);
  R.ancla('mitadA', [-P.L / 2 + 4, o.yA, P.H / 2 - 4]);
  R.ancla('bulon', [0, 0, 3.8]);
  R.ancla('tuerca', [0, o.yA - 6, P.bulon.z + 6]);
  R.ancla('fusible', [0, o.yb + 5 + P.bulon.cuello + P.bulon.k, P.bulon.z + 5]);
}
