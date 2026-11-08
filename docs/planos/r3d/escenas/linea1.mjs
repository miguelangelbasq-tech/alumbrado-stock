/* MAT-LINEA_AEREA-1 · piloto Al-Al 1 × 25 XLPE (1501, 7 alambres) y Cu 1 × 4 XLPE (1504) */
import { CAB } from '../piezas/perfiles_cables.mjs';
import { cableEscalonado } from '../piezas/cables.mjs';
export default function (R) {
  R.vista({ az: 56, el: 27, fov: 13, margen: .04 });
  R.config({ bordes: false });
  const P = CAB.p1x25;
  const o = cableEscalonado(R, P, { x0: -90, Lv: 0, Lr: 0, La: [0], Lc: [26], pasoCuerda: 90 });
  // grabado sobre la aislación XLPE negra (el piloto no tiene vaina): calco en el tubo
  R.impresoCil(['Al-Al 1x25 mm²  XLPE  0,6/1,1 kV  IRAM 63002 (*)'], [-86, 0, P.Ro], [-6, 0, P.Ro], P.Ro + .03, 70, 320, { color: '#e9e9e4', px: 1.9 });
  R.ancla('ais', [-40, 0, P.Ro * 2]); R.ancla('cu', [16, 0, P.Ro + 2.9]);
  const Q = CAB.p1x4; const g = R.grupo(); g.position.set(-10, -22, 0);
  const o2 = cableEscalonado(R, Q, { x0: -60, Lv: 0, Lr: 0, La: [0], Lc: [16], padre: g, zc: Q.Ro, pasoCuerda: 24 });
  R.ancla('ais2', [-40, -22, Q.Ro * 2]); R.ancla('cu2', [-10 + 10, -22, Q.Ro + Q.conds[0].R]);
}
