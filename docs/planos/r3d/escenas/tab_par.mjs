/* MAT-FUSIBLES-1 · dos tabaqueras 10×38 en el riel: la izquierda cortada a cuarto (borne, jaula, fleje, pinza, fusible por dentro);
 * la derecha con el carro abierto y el fusible afuera. Cables 1,5 mm² con puntera arriba (entra) y abajo (sale a la luminaria). */
import { portafusible, rielModular } from '../piezas/fusibles.mjs';
import { TAB, F10x38 } from '../piezas/perfiles.mjs';
export default function (R) {
  R.vista({ az: -146, el: 21, fov: 13, margen: .03 });
  const W = TAB.W, x1 = W + .1;
  rielModular(R, -14, 2 * W + 14, TAB.zM);
  portafusible(R, TAB, F10x38, 0, { rotulos: { frente: '10x38', lado: ['10x38  gG', '32A  690V~'], izq: true },
    cables: [{ lado: 'S', color: '#6e3b1d' }, { lado: 'I', color: '#6e3b1d' }],
    fusOp: { cuarto: [-1, 1], cortarDesde: 0 },
    cortar: [-1, W / 2, -10, 80, TAB.zM, 100] });
  portafusible(R, TAB, F10x38, x1, { abierto: TAB.abre, rotulos: { frente: '10x38' }, fusSuelto: [0, 36, 26],
    fusOp: { lineas: ['gG  2A', '10x38  500V~', '120kA  IEC 60269'], arco: 150, ang: 270 },
    cables: [{ lado: 'S', color: '#26282b' }, { lado: 'I', color: '#26282b' }] });
  const xm0 = W / 2, xm1 = x1 + W / 2, rf = F10x38.D / 2;
  R.ancla('cuerpo', [0, 18, 12]);
  R.ancla('carro', [x1 + 2, TAB.D - 2, TAB.cuello[1] - 10]);
  R.ancla('manija', [xm0, TAB.D + .2, TAB.cuello[1] - 4]);
  R.ancla('visor', [xm0, TAB.D - 1.4, TAB.visor.z]);
  R.ancla('jaula', [W / 2, 30, TAB.H - 8]);
  R.ancla('tornillo', [W / 2, 40, TAB.tornillo.z + 2]);
  R.ancla('fleje', [W / 2, 36, TAB.pinza.zS + 2.2]);
  R.ancla('pinza', [W / 2, TAB.fus.y - rf - .5, TAB.pinza.zS - 2]);
  R.ancla('arena', [W / 2 - .2, TAB.fus.y + 1.6, TAB.zM + 6]);
  R.ancla('elemento', [W / 2 - .5, TAB.fus.y, TAB.zM + 2]);
  R.ancla('casquillo', [W / 2 - 1, TAB.fus.y + rf * .7, TAB.fus.z1 - 3]);
  R.ancla('fusSuelto', [xm1 - rf, TAB.fus.y + 36 + 10, TAB.fus.z0 + 26 + 14]);
  R.ancla('pivote', [x1 + W, TAB.pivote[0], TAB.pivote[1]]);
  R.ancla('riel', [-12, -3, TAB.zM + 17]);
  R.ancla('cableS', [xm0, 31.7, TAB.H + 20]);
  R.ancla('cableI', [xm1, 31.7, -20]);
  R.ancla('traba', [xm0, 8, -1.5]);
}
