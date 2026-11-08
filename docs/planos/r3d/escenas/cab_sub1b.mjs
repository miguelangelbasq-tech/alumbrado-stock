/* MAT-CABLE_SUBTERRANEO-1 · 3 × 1,5 (6001) columna → luminaria */
import { CAB } from '../piezas/perfiles_cables.mjs';
import { cableEscalonado } from '../piezas/cables.mjs';
export default function (R) {
  R.vista({ az: 62, el: 26, fov: 13, margen: .04 });
  R.config({ bordes: false });
  const C = CAB.c3x1_5;
  const o = cableEscalonado(R, C, { x0: -55, Lv: 0, Lr: 6, Lb: 14, abrir: 1.4, La: [26, 32, 38], Lc: [36, 42, 48], marca: 'IRAM 2178-1  0,6/1,1 kV  Cu XLPE  3 x 1,5 mm²', angMarca: 320, pxMarca: 1.35, marcaX: [-52, -4] });
  const z = o.zc;
  R.ancla('vaina', [-20, 0, z + C.Ro * .98]);
  for (let i = 0; i < 3; i++) { const f = o.f[i]; const p = f([26, 32, 38][i] - 6); R.ancla('ais' + i, [p[0], p[1], p[2] + C.conds[i].rc * .9]); const q = f([36, 42, 48][i] - 3); R.ancla('cu' + i, [q[0], q[1], q[2] + C.conds[i].R]); }
  R.ancla('relleno', [5, C.Ri * .6, z - C.Ri * .3]);
}
