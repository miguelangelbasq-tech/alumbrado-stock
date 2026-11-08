/* MAT-CABLE_SUBTERRANEO-2 · otras formaciones en fila: 3 × 25 + 1 × 16 · 3 × 2,5 · 2 × 4 · 2 × 1,5 + T · 1 × 4 flexible */
import { CAB } from '../piezas/perfiles_cables.mjs';
import { cableEscalonado } from '../piezas/cables.mjs';
export default function (R) {
  R.vista({ az: 50, el: 30, fov: 14, margen: .03 });
  R.config({ bordes: false });
  const fila = [
    ['c3x25_16', 0, { Lr: 8, Lb: 22, abrir: .7, La: [44, 52, 60, 36], Lc: [60, 68, 76, 50], marca: 'IRAM 2178  Cu XLPE  3x25/16 mm²', pxMarca: 2.6 }],
    ['c3x2_5', 30, { Lr: 6, Lb: 14, abrir: 1.2, La: [28, 34, 40], Lc: [38, 44, 50], marca: 'IRAM 2178  3x2,5 mm²', pxMarca: 1.5 }],
    ['c2x4', 52, { Lr: 6, Lb: 14, abrir: 1.2, La: [30, 36], Lc: [40, 46], marca: 'IRAM 2178  2x4 mm²', pxMarca: 1.5 }],
    ['c2x1_5T', 72, { Lr: 6, Lb: 14, abrir: 1.4, La: [26, 32, 38], Lc: [35, 41, 47], marca: 'IRAM 2178  2x1,5+T', pxMarca: 1.4 }],
    ['c1x4f', 90, { Lr: 0, La: [22], Lc: [34], marca: 'Cu XLPE 1x4 flex', pxMarca: 1.1 }],
  ];
  for (const [k, y, op] of fila) {
    const C = CAB[k]; const dx = -y * .35;
    const g = R.grupo(); g.position.set(dx, -y, 0);
    const o = cableEscalonado(R, C, { x0: -70, Lv: 0, angMarca: 320, marcaX: [-66, -6], padre: g, ...op });
    const z = o.zc;
    R.ancla(k + '_v', [dx - 35, -y, z + C.Ro]);
    const i = C.conds.length - 1; const f = o.f[0]; const p = f(op.La[0] - 5); R.ancla(k + '_a', [p[0] + dx, p[1] - y, p[2] + C.conds[0].rc]);
    const q = f(op.Lc[0] - 3); R.ancla(k + '_c', [q[0] + dx, q[1] - y, q[2] + C.conds[0].R]);
    if (C.conds.length > 1) R.ancla(k + '_r', [dx + op.Lr - 1, -y + C.Ri * .6, z - C.Ri * .4]);
  }
}
