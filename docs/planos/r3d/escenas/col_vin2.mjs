/* MAT-VINCULOS-2 · vínculo octogonal (6016) y medio octogonal (6013), AP-C-011: ESQUEMA (*) — aro octogonal, rayos, brazos Ø60,3, capuchón */
import { capuchon, matsCol, tornoZP, tuboP, VIN } from '../piezas/col_util.mjs';
export default function (R) {
  R.vista({ az: -30, el: 28, fov: 12, margen: .03 }); R.config({ exposicion: .92, ambiente: .55 });
  const C = matsCol(R), O = VIN.oct, Ro = O.ap / Math.cos(Math.PI / 8), z = O.z, rr = O.rayo / 2;
  const arma = (dx, medio) => {
    const g = R.grupo(); g.position.x = dx;
    capuchon(R, 0, [], { padre: g });
    tornoZP(R, 0, 0, -160, [[50, 0], [57, 0], [57, 165], [50, 165]], 45, 405, C.galv, { padre: g, tapas: false });
    const P = (i) => [Ro * Math.cos(Math.PI / 8 + i * Math.PI / 4), Ro * Math.sin(Math.PI / 8 + i * Math.PI / 4), z];
    for (let i = 0; i < 8; i++) { const a = P(i), b = P(i + 1); if (medio && (a[1] < -1 || b[1] < -1)) continue; tuboP(R, a, b, rr, 2.3, C.galv, { padre: g }); }
    if (medio) { tuboP(R, [O.ap, 0, z], [-O.ap, 0, z], rr, 2.3, C.galv, { padre: g }); tuboP(R, P(0), [O.ap, 0, z], rr, 2.3, C.galv, { padre: g }); tuboP(R, P(3), [-O.ap, 0, z], rr, 2.3, C.galv, { padre: g }); }
    for (const gd of (medio ? [0, 90, 180] : [0, 90, 180, 270])) {
      const a = gd * Math.PI / 180, cx = Math.cos(a), cy = Math.sin(a);
      tuboP(R, [cx * 50, cy * 50, z], [cx * O.ap, cy * O.ap, z], rr, 2.3, C.galv, { padre: g });
    }
    for (const gd of (medio ? [0, 180] : [0, 90, 180, 270])) {
      const a = gd * Math.PI / 180, cx = Math.cos(a), cy = Math.sin(a);
      tuboP(R, [cx * (O.ap - 10), cy * (O.ap - 10), z], [cx * (O.ap + O.brazo), cy * (O.ap + O.brazo), z + O.brazo * Math.tan(5 * Math.PI / 180)], VIN.brazo.D / 2, VIN.brazo.e, C.galv, { padre: g });
    }
    return g;
  };
  arma(0, false); arma(1700, true);
  R.ancla('aro', [Ro * Math.cos(-Math.PI * 3 / 8), Ro * Math.sin(-Math.PI * 3 / 8), z]);
  R.ancla('rayo', [0, -O.ap * .6, z]);
  R.ancla('brazo', [0, -(O.ap + O.brazo * .6), z + 20]);
  R.ancla('cap', [-35, -35, 220]);
  R.ancla('adapt', [-40, -40, -100]);
  R.ancla('medio', [1700 + O.ap * .5, 1, z]);
  R.ancla('medioBrazo', [1700 + O.ap + O.brazo * .6, 0, z + 20]);
}
