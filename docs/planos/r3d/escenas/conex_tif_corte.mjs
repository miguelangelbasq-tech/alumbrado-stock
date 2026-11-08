/* MAT-TERMINALES-2 · puntera TIF 6 mm²: ANTES (cable pelado + puntera suelta), PUESTA sin engarzar (corte a cuarto) y ENGARZADA (corte a cuarto) */
import { puntera } from '../piezas/conex.mjs';
import { TIF, COLOR } from '../piezas/perfiles_conex.mjs';
export default function (R) {
  R.vista({ az: -32, el: 30, fov: 12, margen: .04 });
  const p = TIF[3], z = p.D2 / 2;
  // 1) antes: cable pelado 12 mm y la puntera suelta adelante
  puntera(R, p, 0, 0, z, { pelado: true, cable: 16, aisl: COLOR.L1 });
  const suelta = puntera(R, p, 24, 0, z, { cable: 0 });
  // 2) puesta, sin engarzar, cortada a cuarto
  const b = puntera(R, p, 0, -16, z, { cable: 16, aisl: COLOR.L1, cuarto: true });
  // 3) engarzada (cuadrado), cortada a cuarto
  const c = puntera(R, p, 0, -32, z, { cable: 16, aisl: COLOR.L1, crimp: true, cuarto: true });
  const Lc = p.L - p.L2;
  R.ancla('pelado', [8, 0, z + 1.2]);
  R.ancla('suelta', [24 + 3, 0, z + p.D2 / 2]);
  R.ancla('tuboS', [24 + p.L - 2, 0, z + p.di / 2 + p.t]);
  R.ancla('collarB', [3, -16 + p.D2 / 2 * .7, z + p.D2 / 2 * .7]);
  R.ancla('tuboB', [Lc + 4, -16 - .3, z + p.di / 2 + p.t]);
  R.ancla('hilosB', [Lc + 6, -16 - .9, z + .7]);
  R.ancla('aislB', [-8, -16, z + 2.4]);
  R.ancla('embudoB', [Lc * .55, -16 - .2, z + 2.1]);
  R.ancla('engC', [Lc + 7, -32 + 2.6, z + 2.6]);
  R.ancla('hexC', [Lc + 5, -32 - .6, z + .9]);
  R.ancla('bocaC', [p.L, -32 + 1.2, z - .6]);
  R.ancla('aislC', [-8, -32, z + 2.4]);
}
