/* MAT-CABLE_UNIPOLAR-1 · los 9 unipolares IRAM NM 247-3 en abanico, con la punta pelada (cuerda clase 5). cableEscalonado de cables.mjs (no se toca) */
import { UNI } from '../piezas/perfiles_nelec.mjs';
import { cableEscalonado } from '../piezas/cables.mjs';
export default function (R) {
  R.vista({ az: 50, el: 30, fov: 13, margen: .04 });
  R.config({ bordes: false });
  const orden = ['u10V', 'u6M', 'u2_5V', 'u2_5K', 'u2_5M', 'u2_5R', 'u2_5N', 'u1_5M', 'u1_5N'];
  let y = 0;
  orden.forEach((k, i) => {
    const C = UNI[k], g = R.grupo(); y += (i ? (UNI[orden[i - 1]].Ro + C.Ro + 4.2) : 0); g.position.set(i * 5, y, 0);
    const o = cableEscalonado(R, C, { padre: g, x0: -70, Lv: 0, Lr: 0, Lb: 1, abrir: 0, La: [0], Lc: [12 + C.Ro * 2], zc: C.Ro, pasoCuerda: 22 });
    R.ancla(k, [i * 5 - 30, y, 2 * C.Ro]); R.ancla(k + 'cu', [i * 5 + 8, y, C.Ro + C.conds[0].R * .8]);
  });
}
