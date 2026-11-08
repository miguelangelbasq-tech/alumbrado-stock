/* MAT-LUMINARIA_LED-2 · portalámpara de aplicar E27 con lámpara LED 5 W (6014), cortado a un cuarto, sobre la placa del tablero */
import { matsCol, portalampara, E27 } from '../piezas/col_util.mjs';
export default function (R) {
  R.vista({ az: -36, el: 18, fov: 12, margen: .04 }); R.config({ exposicion: .92, ambiente: .55 });
  const C = matsCol(R);
  R.caja(-70, 70, -60, 60, -3, 0, C.galvO, { r: .4 });
  portalampara(R, { a0: -90, a1: 180, tapas: true, globoOp: .95 });
  const B = E27.base, Cu = E27.cuello, Rs = E27.rosca;
  const zr = B.H + Cu.H - Rs.L;
  R.ancla('base', [-B.D / 2 * .72, -B.D / 2 * .72, B.H * .5]);
  R.ancla('rosca', [-1, -Rs.D / 2 - .3, zr + 8]);
  R.ancla('contacto', [-1, -2, zr - 1.5]);
  R.ancla('casquillo', [-1, -Rs.d / 2, zr + 16]);
  R.ancla('globo', [-24, -24, zr + 80]);
  R.ancla('placaLed', [-1, -12, zr + Rs.L + 4 + 26]);
  R.ancla('tornillo', [-B.tornillos / 2, 0, B.H - 6]);
  R.ancla('placa', [-60, -55, 0]);
  R.ancla('borne', [-11, 17, 18]);
}
