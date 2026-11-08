/* MAT-CABLE_ACOMETIDA-2 · bajada Cu 4 × 16 (1027 / 1028) y antihurto concéntrico 4/4 (1003) */
import { CAB, ANTI } from '../piezas/perfiles_cables.mjs';
import { cableEscalonado, antihurto } from '../piezas/cables.mjs';
export default function (R) {
  R.vista({ az: 56, el: 27, fov: 13, margen: .03 });
  R.config({ bordes: false });
  const C = CAB.c4x16b;
  const o = cableEscalonado(R, C, { x0: -110, Lv: 0, Lr: 8, Lb: 22, abrir: .9, La: [46, 56, 66, 76], Lc: [62, 72, 82, 92], marca: 'Cu 4x16 mm²  XLPE  0,6/1,1 kV  IRAM 2164 (*)', angMarca: 320, pxMarca: 2.4, marcaX: [-104, -6] });
  const z = o.zc;
  R.ancla('vaina', [-50, 0, z + C.Ro]); R.ancla('relleno', [7, C.Ri * .6, z - C.Ri * .3]);
  for (let i = 0; i < 4; i++) { const p = o.f[i]([46, 56, 66, 76][i] - 10); R.ancla('a' + i, [p[0], p[1], p[2] + C.conds[i].rc]); const q = o.f[i]([62, 72, 82, 92][i] - 4); R.ancla('c' + i, [q[0], q[1], q[2] + C.conds[i].R]); }
}
