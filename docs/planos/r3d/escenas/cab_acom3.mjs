/* MAT-CABLE_ACOMETIDA-3 · unipolares IRAM NM 247-3: 1 × 6 negro (1031), 1 × 6 celeste (1030), 1 × 10 verde-amarillo (7010); cuerda clase 5 */
import { CAB } from '../piezas/perfiles_cables.mjs';
import { cableEscalonado } from '../piezas/cables.mjs';
export default function (R) {
  R.vista({ az: 54, el: 30, fov: 13, margen: .04 });
  R.config({ bordes: false });
  [['u6n', 0, 30], ['u6c', 10, 34], ['u10v', 21, 38]].forEach(([k, y, La]) => {
    const C = CAB[k]; const g = R.grupo(); g.position.set(-y * .5, -y, 0);
    const o = cableEscalonado(R, C, { x0: -40, Lv: 0, Lr: 0, La: [La], Lc: [La + 14], padre: g, pasoCuerda: 26 });
    const p = o.f[0](La - 8), q = o.f[0](La + 10);
    R.ancla(k + '_a', [p[0] - y * .5, p[1] - y, p[2] + C.conds[0].rc]); R.ancla(k + '_c', [q[0] - y * .5, q[1] - y, q[2] + C.conds[0].R]);
  });
}
