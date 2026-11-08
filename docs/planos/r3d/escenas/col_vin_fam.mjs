/* MAT-VINCULOS-1 · la familia de capuchones (misma escala): 6019, 6020, 6021, 6022 (brazos de 400) y 6017 / 6018 (1000 / 1500) */
import { capuchon, matsCol, tornoZP } from '../piezas/col_util.mjs';
export default function (R) {
  R.vista({ az: -24, el: 26, fov: 12, margen: .03 }); R.config({ exposicion: .92, ambiente: .55 });
  const C = matsCol(R);
  const L = [['6019', [0], 400, [0, 0]], ['6020', [0, 180], 400, [1000, 0]], ['6021', [0, 120, 240], 400, [2000, 0]], ['6022', [0, 90, 180, 270], 400, [3000, 0]],
    ['6017', [0], 1000, [400, -1300]], ['6018', [0], 1500, [1800, -1300]]];
  for (const [cod, angs, Lb, [x, y]] of L) {
    const g = R.grupo(); g.position.set(x, y, 0);
    capuchon(R, 0, angs, { padre: g, L: Lb });
    tornoZP(R, 0, 0, -120, [[38, 0], [45, 0], [45, 125], [38, 125]], 45, 405, C.pvcG, { padre: g, tapas: false });
    R.ancla('c' + cod, [x, y - 51, 260]);
    R.ancla('b' + cod, [x + Lb - 40, y, 190 + (Lb - 51) * Math.tan(5 * Math.PI / 180)]);
  }
}
