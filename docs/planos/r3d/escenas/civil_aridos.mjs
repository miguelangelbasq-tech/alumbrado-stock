/* MAT-ARIDOS_HORMIGON-1 · bolsa de cemento (50 kg, como la pide el pañol), bolsa de cal (25 kg), montón de arena y de piedra 6–20 */
import { BOLSA } from '../piezas/perfiles_civil.mjs';
import { matsC, bolsa, monton } from '../piezas/civil_util.mjs';
export default function (R) {
  R.vista({ az: -28, el: 24, fov: 15, margen: .035 });
  R.config({ bordeOp: .25 });
  const M = matsC(R), T = R.THREE, c = BOLSA.c50, l = BOLSA.cal25;
  // bolsa de cemento (acostada) y bolsa de cal encima de otra
  bolsa(R, [-80, -120, 0], c.L, c.A, c.H, M.kraft);
  R.impreso([{ t: 'CEMENTO PORTLAND NORMAL', s: 1 }, { t: 'CPN 40  ·  IRAM 50000', s: .8 }, { t: '50 kg', s: 1.5 }], 520, 300, [-80, -120, c.H + 1.5], [1, 0, 0], [0, 1, 0], { color: '#1d3f78', px: 32, sep: .5 });
  bolsa(R, [-60, 520, 0], l.L, l.A, l.H, M.papelB);
  bolsa(R, [-50, 525, l.H * 1.02], l.L, l.A, l.H, M.papelB);
  R.impreso([{ t: 'CAL HIDRATADA', s: 1 }, { t: 'PARA ALBAÑILERIA', s: .7 }, { t: '25 kg (*)', s: 1.3 }], 330, 230, [-50, 525, 2 * l.H * 1.02 + 2], [1, 0, 0], [0, 1, 0], { color: '#1f6b35', px: 30, sep: .5 });
  // montón de arena y de piedra partida
  monton(R, [720, -180, 0], 380, 240, M.arena);
  const mp = new T.MeshStandardMaterial({ color: '#ffffff', roughness: .75 });
  const nucleo = R.M.pa('#7d7f82', { roughness: 1 });
  monton(R, [760, 560, 0], 360, 250, nucleo, { piedras: { n: 9000, d0: 6, d1: 20, cols: ['#8c8f93', '#a9a49a', '#6f7277', '#b9b6ae', '#9b9ea2'] }, matP: mp });
  R.ancla('cemento', [-80 - c.L * .35, -120 - c.A * .5, c.H * .7]); R.ancla('leyenda', [-80, -120 - 60, c.H + 2]); R.ancla('valvula', [-80 - c.L / 2 + 5, -120 + c.A * .3, c.H * .8]);
  R.ancla('cal', [-50 - l.L * .3, 525 - l.A * .5, l.H * 1.6]); R.ancla('arena', [720 - 120, -180 - 200, 120]); R.ancla('piedra', [760 - 120, 560 - 230, 110]);
}
