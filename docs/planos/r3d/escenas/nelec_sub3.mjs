/* MAT-CABLE_SUBTERRANEO-3 · Cu XLPE 4 × 6 IRAM 62266 (1033) en escalones (o 3 × 1,5 62266 (3083) con PRM.b). cableEscalonado de cables.mjs (no se toca) */
import { CABN } from '../piezas/perfiles_nelec.mjs';
import { cableEscalonado } from '../piezas/cables.mjs';
export default function (R, PRM = {}) {
  R.vista({ az: 62, el: 24, fov: 13, margen: .04 });
  R.config({ bordes: false });
  if (PRM.b) {
    const C = CABN.L3x1_5;
    const o = cableEscalonado(R, C, { x0: -55, Lv: 0, Lr: 6, Lb: 14, abrir: 1.4, La: [26, 32, 38], Lc: [36, 42, 48], marca: 'IRAM 62266  0,6/1,1 kV  Cu XLPE  LSZH  3 x 1,5 mm²', angMarca: 320, pxMarca: 1.3, marcaX: [-52, -4] });
    const z = o.zc;
    R.ancla('vaina', [-20, 0, z + C.Ro * .98]);
    for (let i = 0; i < 3; i++) { const f = o.f[i]; const p = f([26, 32, 38][i] - 6); R.ancla('ais' + i, [p[0], p[1], p[2] + C.conds[i].rc * .9]); const q = f([36, 42, 48][i] - 3); R.ancla('cu' + i, [q[0], q[1], q[2] + C.conds[i].R]); }
    R.ancla('relleno', [5, C.Ri * .6, z - C.Ri * .3]);
    return;
  }
  const C = CABN.L4x6;
  const o = cableEscalonado(R, C, { x0: -85, Lv: 0, Lr: 7, Lb: 16, abrir: 1.25, La: [32, 38, 44, 50], Lc: [44, 50, 56, 62], marca: 'IRAM 62266   0,6/1,1 kV   Cu   XLPE   LSZH   4 x 6 mm²', angMarca: 320, marcaX: [-81, -38], ventana: [-34, -12, -20, 0, 6, 20], pxMarca: 1.7 });
  const z = o.zc;
  R.ancla('vaina', [-45, 0, z + C.Ro * .96]); R.ancla('marca', [-60, -C.Ro * .55, z + C.Ro * .82]); R.ancla('relleno', [3, C.Ri * .7, z - C.Ri * .2]);
  for (let i = 0; i < 4; i++) { const f = o.f[i]; const p = f([32, 38, 44, 50][i] - 8); R.ancla('ais' + i, [p[0], p[1], p[2] + C.conds[i].rc * .9]); const q = f([44, 50, 56, 62][i] - 3); R.ancla('cu' + i, [q[0], q[1], q[2] + C.conds[i].R * .9]); }
}
