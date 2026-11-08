/* MAT-CANAL_RIEL-1 · riel NS35 × 7,5 (2038): tramo de 140 mm (una caja de columna) con sus ranuras, dos tornillos cabeza tanque 6 × 3/8,
 * dos bornes BPN-06 enganchados (MAT-BORNERAS-1) y el tope 2059. Punta del riel en primer plano para ver el perfil plegado. */
import { rielNS } from '../piezas/conex.mjs';
import { borne, tope } from '../piezas/bpn.mjs';
import { NS } from '../piezas/perfiles_conex.mjs';
import { BPN, TOPE } from '../piezas/perfiles.mjs';
export default function (R) {
  R.vista({ az: -132, el: 30, fov: 12, margen: .04 });
  // riel en el sistema del borne: alas arriba en z = 0, de y = 9 a 44
  const y0 = 9, z0 = -NS.H;
  rielNS(R, 0, 140, y0, z0, { prim: 20 });
  // tornillos cabeza tanque (Phillips) en las ranuras 1 y 5
  for (const xc of [20, 120]) R.tornillo([xc, y0 + NS.W / 2, z0 + NS.t + 1.9], [0, 0, 1], { M: 3.5, L: 6, dk: 7.2, k: 1.9, tipo: 'pozi', mat: R.M.aceroCinc() });
  // tope y dos bornes
  tope(R, 62);
  borne(R, 62 + TOPE.esp, R.PAL.grisBPN, { marca: 'R' });
  borne(R, 62 + TOPE.esp + BPN.paso, R.PAL.celeste, { marca: 'N' });
  R.ancla('ala', [4, y0 + 1.5, z0 + NS.H]);
  R.ancla('canal', [3, y0 + NS.W / 2, z0 + NS.t]);
  R.ancla('pliegue', [.2, y0 + 4.6, z0 + 1]);
  R.ancla('ranura', [45 - 6, y0 + NS.W / 2 + 2.6, z0 + NS.t]);
  R.ancla('tornillo', [20, y0 + NS.W / 2 + 2.5, z0 + NS.t + 1.9]);
  R.ancla('borne', [62 + TOPE.esp + 4, 20, 50]);
  R.ancla('tope', [62 + 2, 46, 18]);
  R.ancla('extremo', [140, y0 + 30, z0 + 3]);
}
