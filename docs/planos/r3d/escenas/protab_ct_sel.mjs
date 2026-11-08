/* MAT-COMANDO-1 · selectora 22 mm de 2 posiciones (3056) en un trozo de puerta del tablero y llave encapsulada de un punto (3047 / 3048) */
import { selectora, llaveEncapsulada } from '../piezas/protab_mod.mjs';
import { placaRed } from '../piezas/protab_util.mjs';
export default function (R) {
  R.vista({ az: 128, el: 18, fov: 14, margen: .04 });
  const ch = 1.5;
  placaRed(R, -40, 40, -40, 40, -ch, ch, 3, R.M.pa('#c9cbc4', { roughness: .55 }), { huecos: [{ x: 0, z: 0, r: 11.2 }] });
  selectora(R, [0, 0, 0], { chapa: ch, pos: 'AUT' });
  R.impreso(['AUT     MAN'], 34, 5, [0, .05, 23], [-1, 0, 0], [0, 0, 1], { color: '#1b1c1f', ppm: 40 });
  llaveEncapsulada(R, [-115, -10, -25], { texto: 'LUZ TABLERO' });
  R.ancla('cabezal', [0, 12, 8]);
  R.ancla('aro', [11, 3, -10]);
  R.ancla('tuerca', [12, -3.5, 6]);
  R.ancla('na', [7.5 + 6.8, -30, -14]);
  R.ancla('nc', [-7.5 + 6.8, -30, -14]);
  R.ancla('tornillos', [14, -48, 8]);
  R.ancla('chapa', [35, -1.5, 30]);
  R.ancla('llave', [-115, 25, -15]);
  R.ancla('caja', [-115 - 40, 10, -40]);
  R.ancla('rotulo', [-115, 22.1, -55]);
}
