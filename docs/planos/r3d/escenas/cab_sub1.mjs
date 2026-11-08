/* MAT-CABLE_SUBTERRANEO-1 · Cu XLPE + vaina PVC 4 × 2,5 (1009) en escalones */
import { CAB } from '../piezas/perfiles_cables.mjs';
import { cableEscalonado } from '../piezas/cables.mjs';
export default function (R) {
  R.vista({ az: 62, el: 24, fov: 13, margen: .04 });
  R.config({ bordes: false });
  const C = CAB.c4x2_5;
  const o = cableEscalonado(R, C, { x0: -80, Lv: 0, Lr: 7, Lb: 16, abrir: 1.25, La: [30, 36, 42, 48], Lc: [42, 48, 54, 60], marca: 'IRAM 2178-1   0,6/1,1 kV   Cu   XLPE   4 x 2,5 mm²', angMarca: 320, marcaX: [-76, -37], ventana: [-34, -12, -20, 0, 6, 20], pxMarca: 1.7 });
  const z = o.zc;
  R.ancla('vaina', [-40, 0, z + C.Ro * .96]);
  R.ancla('marca', [-55, -C.Ro * .55, z + C.Ro * .82]);
  R.ancla('relleno', [3, C.Ri * .7, z - C.Ri * .2]);
  const c = C.conds;
  for (let i = 0; i < 4; i++) { const f = o.f[i]; const p = f([30, 36, 42, 48][i] - 8); R.ancla('ais' + i, [p[0], p[1], p[2] + c[i].rc * .9]); const q = f([42, 48, 54, 60][i] - 3); R.ancla('cu' + i, [q[0], q[1], q[2] + c[i].R * .9]); }
}
