/* MAT-SENAL_SELLADO-2 · envases: cartucho de silicona 260 ml (9003), cartucho de elastómero (8009), espuma PU en aerosol (8010),
 * lata de pintura asfáltica (8023) abierta y junta con cordón de sellador elástico (8026) */
import { CART, AERO, LATA } from '../piezas/perfiles_civil.mjs';
import { matsC, tuboB, cte } from '../piezas/civil_util.mjs';
export default function (R) {
  R.vista({ az: -24, el: 22, fov: 15, margen: .04 });
  R.config({ bordeOp: .25 });
  const M = matsC(R), T = R.THREE, r = CART.D / 2;
  const cartucho = (x, y, mat, lineas, col) => {
    R.torno([x, y, 0], [x, y, 1], [[r - 4, 6], [r - 1, 0], [r, 1], [r, CART.L - 6], [r - 3, CART.L], [8, CART.L + 3], [7, CART.L + 18], [0, CART.L + 18]], mat, { seg: 72 });
    R.torno([x, y, CART.L + 18], [x, y, CART.L + 19], [[6.5, 0], [2.2, CART.pico], [0, CART.pico]], M.cartucho, { seg: 48 });
    R.impresoCil(lineas, [x, y, 20], [x, y, CART.L - 20], r + .15, 150, 270, { color: col, px: 5.5 });
  };
  cartucho(0, 0, M.cartucho, [{ t: 'SILICONA', s: 1 }, { t: 'TRANSPARENTE', s: .8 }, { t: '260 ml', s: 1 }], '#1d4f9a');
  cartucho(90, 40, R.M.pa('#7c8186', { roughness: .45 }), [{ t: 'SELLADOR', s: 1 }, { t: 'ELASTOMERICO (*)', s: .7 }, { t: 'GRIS', s: .9 }], '#ffffff');
  // aerosol de espuma PU
  const xa = 200, ya = 30;
  R.torno([xa, ya, 0], [xa, ya, 1], [[0, 0], [AERO.D / 2 - 3, 0], [AERO.D / 2, 4], [AERO.D / 2, AERO.H - 40], [AERO.D / 2 - 6, AERO.H - 22], [14, AERO.H - 12], [13, AERO.H - 6], [0, AERO.H - 6]], M.hojalata, { seg: 72 });
  R.cil([xa, ya, AERO.H - 6], [xa, ya, AERO.H + 6], 6, R.M.pa('#2b2c2f'), { seg: 24 });
  R.impresoCil([{ t: 'ESPUMA', s: 1 }, { t: 'POLIURETANO', s: .8 }, { t: '500 ml (*)', s: .8 }], [xa, ya, 20], [xa, ya, AERO.H - 50], AERO.D / 2 + .15, 160, 260, { color: '#c4531a', px: 7, fondo: '#f4efe2' });
  // cordón de espuma expandida en el piso
  tuboB(R, (t) => [260 + 120 * t, -60 + 30 * Math.sin(t * 6), 9], 0, 1, (t) => 9 + 2.5 * Math.sin(t * 40) + 1.5 * Math.sin(t * 17), null, M.espuma, { n: 80, na: 24, up: [0, 0, 1] });
  // lata de pintura asfáltica abierta
  const xl = 380, yl = 160, Rl = LATA.D / 2;
  R.torno([xl, yl, 0], [xl, yl, 1], [[0, 0], [Rl - 2, 0], [Rl, 3], [Rl, LATA.H - 6], [Rl + 1.5, LATA.H - 3], [Rl - 4, LATA.H], [Rl - 4, LATA.H - 12], [Rl - 5, LATA.H - 12]], M.hojalata, { seg: 96 });
  R.cil([xl, yl, LATA.H - 14], [xl, yl, LATA.H - 13], Rl - 5, M.asfaltico, { seg: 96 });
  R.impresoCil([{ t: 'PINTURA', s: .9 }, { t: 'ASFALTICA (*)', s: 1 }, { t: '4 L (*)', s: .8 }], [xl, yl, 20], [xl, yl, LATA.H - 25], Rl + .15, 140, 250, { color: '#ffffff', px: 13, fondo: '#2a2a2a' });
  // junta entre dos losetas con el cordón de sellador
  const jx0 = -80, jy = -150;
  R.caja(jx0, jx0 + 240, jy - 80, jy - 6, 0, 40, M.hormExt, { r: 1 }); R.caja(jx0, jx0 + 240, jy + 6, jy + 80, 0, 40, M.hormExt, { r: 1 });
  R.caja(jx0, jx0 + 240, jy - 6, jy + 6, 25, 39, M.elast, { r: 2 });
  R.caja(jx0, jx0 + 240, jy - 6, jy + 6, 18, 25, R.M.pa('#d8d0b8', { roughness: .9 }), { r: 3 });
  R.ancla('silicona', [-r * .7, -r * .7, 120]); R.ancla('pico', [0, 0, CART.L + 60]); R.ancla('elast', [90 - r * .7, 40 - r * .7, 150]);
  R.ancla('aerosol', [xa - AERO.D / 2 * .7, ya - AERO.D / 2 * .7, 150]); R.ancla('espuma', [320, -60 + 30 * Math.sin(3), 18]); R.ancla('lata', [xl - Rl * .7, yl - Rl * .7, 100]);
  R.ancla('asfalto', [xl, yl - 30, LATA.H - 13]); R.ancla('junta', [jx0 + 60, jy - 2, 39]); R.ancla('fondoj', [jx0, jy, 21]);
}
