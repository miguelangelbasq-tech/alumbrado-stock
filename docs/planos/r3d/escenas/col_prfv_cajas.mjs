/* MAT-COLUMNA_PRFV-1 · tramo de las cajas borneras (3,30 a 4,25 m; abajo la tapa afuera con sus 4 tornillos) y la cima con el buje Ø90/76 */
import { postePRFV, matsCol, PRFV, rPRFV } from '../piezas/col_util.mjs';
export default function (R) {
  R.vista({ az: -30, el: 14, fov: 12, margen: .03 }); R.config({ exposicion: .9, ambiente: .55 });
  const c = PRFV.c7;
  // ---------- B: tramo de las cajas (3,30 a 4,25 m) ----------
  const dzB = -3300, dxB = 0;
  const GB = R.grupo(); GB.position.set(dxB, 0, dzB);
  postePRFV(R, c, 3300, 4250, { ang: -90, padre: GB, tapa: 'afuera', tapaSep: 110, buje: false, base: false });
  // ---------- C: cima con el buje ----------
  const dzC = -6550 + 320, dxC = 420;
  const GC = R.grupo(); GC.position.set(dxC, 0, dzC);
  postePRFV(R, c, 6550, 7000, { ang: -90, padre: GC, base: false, cajas: false, placa: false });
  const rw = (x, y, z, g) => [x + (g ? g[0] : 0), y, z + (g ? g[1] : 0)];
  const r35 = rPRFV(c, 3500), r40 = rPRFV(c, 4000);
  R.ancla('cajaAbajo', rw(0, -r35 + 20, 3500 - 30, [dxB, dzB]));
  R.ancla('bornes', rw(5, -r35 + 30, 3500 + 10, [dxB, dzB]));
  R.ancla('tapa', rw(-30, -r35 - 112, 3500 + 60, [dxB, dzB]));
  R.ancla('tornillo', rw(40, -r35 - 160, 3500 - 70, [dxB, dzB]));
  R.ancla('cajaArriba', rw(-40, -r40 - 4, 4000, [dxB, dzB]));
  R.ancla('fibra', rw(-r35 * .7, -r35 * .7, 3800, [dxB, dzB]));
  R.ancla('buje', rw(0, -45, 7300, [dxC, dzC]));
  R.ancla('cima', rw(-rPRFV(c, 6900) * .7, -rPRFV(c, 6900) * .7, 6900, [dxC, dzC]));
}
