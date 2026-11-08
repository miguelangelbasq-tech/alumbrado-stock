/* Accesorios sueltos de la bornera: peine 2027 de 10 polos, un trozo de 3 ya cortado, separador 2041, tapa final y tope */
import { peine, separador, tapa, tope } from '../piezas/bpn.mjs';
import { BPN, TOPE } from '../piezas/perfiles.mjs';
export default function (R) {
  R.vista({ az: 150, el: 20, fov: 12, margen: .03 });
  peine(R, 10, 0, { leyenda: '2027 - 10 x 8,2' });
  const g = peine(R, 3, 0, { leyenda: false }); g.position.set(14, 52, -3);
  const sp = R.grupo(); separador(R, 0, undefined, { padre: sp }); sp.position.set(-22, 40, -20);
  const tp = R.grupo(); tapa(R, 0, R.PAL.grisBPN, { padre: tp }); tp.position.set(-46, 62, -20);
  const to = R.grupo(); tope(R, 0, { padre: to }); to.position.set(-74, 84, -20);
  R.ancla('dientes', [8.2 * 4 + 4.6, BPN.yPuente - .5, 32]);
  R.ancla('lomo', [8.2 * 7, BPN.yPuente + 2.2, 52]);
  R.ancla('corte', [8.2 * 2 + 4.6 + 4.1 - .85, BPN.yPuente + 2.2, 53.2]);
  R.ancla('trozo', [14 + 8.2 + 4.6, BPN.yPuente + 52 + .5, 30]);
  R.ancla('sep', [-22 + 1.5, 40 + 40, -20 + 30]);
  R.ancla('tapa', [-46 + 2.2, 62 + 30, -20 + 30]);
  R.ancla('tope', [-74 + 9.5, 84 + 45, -20 + 12]);
}
