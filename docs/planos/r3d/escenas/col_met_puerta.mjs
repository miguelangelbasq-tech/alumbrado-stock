/* MAT-COLUMNA_METALICA-1 · puerta de inspección a 2,50 m (tapa afuera, traba, bulón antivandálico), tablerito con tabaquera y PAT;
 * arriba la reducción Ø114 → Ø90 soldada (cortada a un cuarto) y, aparte, la cima con el manguito Ø60,3. */
import { matsCol, tornoZP, tuboVentana, puertaMet, cordon, MET, rosca, hexN } from '../piezas/col_util.mjs';
import { portafusible, rielModular } from '../piezas/fusibles.mjs';
import { TAB, F10x38 } from '../piezas/perfiles.mjs';
export default function (R) {
  R.vista({ az: -32, el: 14, fov: 12, margen: .03 }); R.config({ exposicion: .92, ambiente: .55 });
  const C = matsCol(R), c = MET.c7, Pu = MET.puerta, Rd = MET.red;
  const [D1, e1, L1] = c.tr[0], [D2, e2] = c.tr[1], r1 = D1 / 2, r2 = D2 / 2;
  const zR = -c.emp + L1;                                    // 2.700: arriba de la reducción
  // tramo Ø114 con la abertura de la puerta (mirando a −y)
  tuboVentana(R, 2150, zR, r1, r1, e1, 45, 405, C.galv, { a: -90, z: Pu.z, w: Pu.w, h: Pu.h }, { seg: 128, tapas: false });
  // reducción cortada a un cuarto (se ve el abocardado y los dos cordones) y tramo Ø90
  const A0 = -90, A1 = 180;
  tornoZP(R, 0, 0, zR, [[r1 - e1, 0], [r1, 0], [r2 + 1, Rd.L * .8], [r2 + 1, Rd.L], [r2 + 1 - e1, Rd.L], [r2 + 1 - e1, Rd.L * .8]], A0, A1, C.galv, { seg: 128 });
  tornoZP(R, 0, 0, zR + Rd.L * .55, [[r2 - e2, 0], [r2, 0], [r2, 3100 - zR - Rd.L * .55], [r2 - e2, 3100 - zR - Rd.L * .55]], A0, A1, C.galv, { seg: 128 });
  for (const [z, rr, rc] of [[zR, r1 + .3, 3], [zR + Rd.L, r2 + 1.6, 2.6]]) tornoZP(R, 0, 0, z - rc, Array.from({ length: 13 }, (_, i) => [rr + rc * Math.sin(i * Math.PI / 12), rc - rc * Math.cos(i * Math.PI / 12)]), A0, A1, C.soldadura, { seg: 128 });
  // puerta: marco, traba, tapa afuera con lengüeta y bulón de cabeza triangular
  puertaMet(R, R.raiz, D1, Pu.z, { sep: 120, sepB: 26 });
  // tablerito: placa, riel NS35 y una tabaquera 10×38 (MAT-FUSIBLES-1), mirando a la puerta
  const gT = R.grupo(); gT.position.set(10, 30, Pu.z - TAB.zM + 10); gT.rotation.z = Math.PI;
  R.caja(-14, 40, -10, -7.5, -10, 100, C.galvO, { r: .5, padre: gT });
  rielModular(R, -12, 38, TAB.zM, gT);
  portafusible(R, TAB, F10x38, 0, { padre: gT, cables: [] });
  // bulón de bronce de PAT con ojal y el 1×10 verde-amarillo
  const zb = Pu.z - Pu.h / 2 + 20;
  rosca(R, [-30, 25, zb], [-30, -12, zb], 4, C.bronce, 1.2);
  hexN(R, [-30, -2, zb], [-30, -8, zb], 13, C.bronce);
  R.cil([-30, -1.5, zb], [-30, -2, zb], 11, C.cobre, { seg: 32 });
  R.cil([-30, 0, zb], [-30, 0, 2150], 3.2, C.cable('#2f9a3e'), { seg: 16 });
  // cima: tramo Ø60 y manguito Ø60,3 × 300 (aparte, a la derecha)
  const g2 = R.grupo(); g2.position.set(420, 120, 2350 - 6600);
  const [D4, e4] = c.tr[3];
  tornoZP(R, 0, 0, 6550, [[D4 / 2 - e4, 0], [D4 / 2, 0], [D4 / 2, 450], [D4 / 2 - e4, 450]], 45, 405, C.galv, { padre: g2, tapas: false });
  tornoZP(R, 0, 0, 7000, [[MET.manguito.D / 2 - 3.6, 0], [MET.manguito.D / 2, 0], [MET.manguito.D / 2, MET.manguito.L], [MET.manguito.D / 2 - 3.6, MET.manguito.L]], 45, 405, C.galv, { padre: g2, tapas: false });
  cordon(R, 0, 0, 7000, D4 / 2 + .4, 2.2, C.soldadura, g2);
  R.ancla('abertura', [-30, -r1, Pu.z + 40]);
  R.ancla('tapa', [-20, -r1 - 120, Pu.z + 30]);
  R.ancla('traba', [0, -r1 + 4, Pu.z + Pu.h / 2 + 8]);
  R.ancla('bulonT', [0, -r1 - 150, Pu.z - Pu.h / 2 + 3]);
  R.ancla('marco', [Pu.w / 2 + 4, -r1 - 1, Pu.z - 40]);
  R.ancla('tab', [10, -10, Pu.z + 20]);
  R.ancla('pat', [-30, -6, zb]);
  R.ancla('reduccion', [-1, -(r1 + r2) / 2, zR + Rd.L / 2]);
  R.ancla('soldadura', [-r1 * .7, -r1 * .7, zR]);
  R.ancla('tramo2', [-r2 * .7, -r2 * .7, 2950]);
  R.ancla('galv', [r1 * .7, -r1 * .7, 2300]);
  R.ancla('manguito', [420 - MET.manguito.D / 2 * .7, 120 - MET.manguito.D / 2 * .7, 7150 + 2350 - 6600]);
  R.ancla('cima', [420 - D4 / 2 * .7, 120 - D4 / 2 * .7, 6800 + 2350 - 6600]);
}
