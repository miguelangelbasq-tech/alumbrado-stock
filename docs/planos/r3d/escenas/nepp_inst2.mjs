/* MAT-INSTRUMENTOS-2 · probador UNI-T UT15C (3087) con su sonda y cable en espiral, y busca polo con neón (9036) */
import { ut15c, buscaPolo, matsN } from '../piezas/nepp.mjs';
import { UT, BP } from '../piezas/perfiles_nepp.mjs';
export default function (R) {
  R.vista({ az: -20, el: 42, fov: 16, margen: .04 });
  R.config({ bordeOp: .3 });
  const M = matsN(R);
  ut15c(R, [0, 0, 0]);
  const zF = UT.T;
  R.ancla('lcd', [10, (UT.lcd.v0 + UT.lcd.v1) / 2 + 10, zF]);
  R.ancla('leds', [-8, UT.leds.v1 - 4, zF + 1]);
  R.ancla('escala', [6, UT.leds.v0 + 6, zF]);
  R.ancla('botones', [9, 176, zF + 1.8]);
  R.ancla('punta1', [0, -UT.punta.L - 4, UT.T / 2]);
  R.ancla('capuchon', [UT.punta.guard, -UT.punta.L / 2, UT.T / 2]);
  R.ancla('cuerpo', [-25, 80, UT.T * .6]);
  R.ancla('agarre', [25, 210, UT.T * .8]);
  R.ancla('sonda', [70 + 12, 40 + 90, UT.sonda.D]);
  R.ancla('punta2', [70, 40 - 22, UT.sonda.D / 2]);
  R.ancla('espiral', [35, 238 + 60, UT.T / 2 + 6]);
}
