/* MAT-INSTRUMENTOS-1 · pinza amperométrica Pro'sKit MT-3202 (3084) midiendo un cable y detector de tensión por inducción (3085) */
import { pinza, ncv, puntaPrueba, tubo, matsN } from '../piezas/nepp.mjs';
import { PINZA, NCV } from '../piezas/perfiles_nepp.mjs';
export default function (R) {
  R.vista({ az: -28, el: 18, fov: 18, margen: .04 });
  R.config({ bordeOp: .3 });
  const M = matsN(R), P = PINZA;
  const g = pinza(R);
  // cable unipolar marrón (L1) que pasa por la mordaza
  tubo(R, [[-60, -20, P.mord.vc], [0, 0, P.mord.vc], [70, 30, P.mord.vc - 10], [130, 40, 2]], 4.5, R.M.cable('#6e3b1d'), { sinBorde: false });
  // puntas de prueba (negra en COM, roja en VΩ)
  const yF = -P.T / 2 - 2;
  puntaPrueba(R, [-110, -120, 4], [1, .15, 0], M.gomaN, [[-60, -60, 20], [-30, -40, 2], [-P.bornes.du, yF - 30, P.bornes.v + 6], [-P.bornes.du, yF - 2, P.bornes.v + 6]]);
  puntaPrueba(R, [-90, -150, 4], [1, .05, 0], M.rojoI, [[-40, -110, 20], [0, -70, 2], [P.bornes.du, yF - 30, P.bornes.v + 6], [P.bornes.du, yF - 2, P.bornes.v + 6]]);
  ncv(R, [60, -150, NCV.D / 2], [1, .32, 0]);
  R.ancla('mordaza', [-P.mord.R * .7, -6, P.mord.vc + P.mord.R * .7]);
  R.ancla('abertura', [0, -P.Tm / 2, P.mord.vc + P.mord.r - 2]);
  R.ancla('gatillo', [-P.W / 2 - P.gatillo.s, 0, P.gatillo.v0 - 4]);
  R.ancla('tope', [P.W / 2 + 2, -P.T / 2, P.guarda.v - 3]);
  R.ancla('lcd', [P.lcd.u1 - 4, yF - .8, P.lcd.v1 - 6]);
  R.ancla('selector', [P.selector.D / 2 - 4, yF - 5, P.selector.v]);
  R.ancla('botones', [14, yF - 2, 108]);
  R.ancla('com', [-P.bornes.du, yF - 2, P.bornes.v + 6]);
  R.ancla('vohm', [P.bornes.du, yF - 2, P.bornes.v + 6]);
  R.ancla('cuerpo', [P.W / 2, 0, 60]);
  R.ancla('cable', [70, 30, P.mord.vc - 10]);
  R.ancla('punta', [-105, -119, 6]);
  R.ancla('ncvPunta', [60 + 12, -150 + 4, NCV.D / 2 + 6]);
  R.ancla('ncvLed', [60 + 15, -150 + 5, NCV.D / 2]);
  R.ancla('ncvBoton', [60 + 60 * .95, -150 + 60 * .3, NCV.D / 2 + 12]);
  R.ancla('ncvClip', [60 + 120 * .95, -150 + 120 * .3, NCV.D / 2 + 14]);
}
