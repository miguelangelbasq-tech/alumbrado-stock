/* MAT-APOYOS-1 · apoyo PRFV hl 8 m (6015): base empotrada ≈1,5 m directo en el suelo (cortado a un cuarto) y el tramo del apoya escalera H 12 (4012, ESQUEMA *) */
import { matsCol, bloqueZ, rect2, circ, tornoZP, abrazadera, bulonHex, APO } from '../piezas/col_util.mjs';
export default function (R) {
  R.vista({ az: -38, el: 20, fov: 12, margen: .03 }); R.config({ exposicion: .92, ambiente: .55 });
  const C = matsCol(R), P = APO.prfv, E = APO.esc;
  const rz = (z) => (P.Db - P.k * (z + P.LE) / 1000) / 2, e = 7;
  const pf = (z0, z1) => [[rz(z0) - e, 0], [rz(z0), 0], [rz(z1), z1 - z0], [rz(z1) - e, z1 - z0]];
  // base: suelo con el hoyo relleno de suelo compactado (*), poste cortado a un cuarto
  const B = 420, Q = [-2000, 0, -2000, 0];
  bloqueZ(R, rect2(-B, B, -B, B), [circ(0, 0, rz(-P.LE) + 1)], -P.LE - 200, -60, C.tierra, { cuarto: Q });
  bloqueZ(R, rect2(-B, B, -B, B), [circ(0, 0, rz(-60) + 1)], -60, 0, C.pasto, { cuarto: Q });
  tornoZP(R, 0, 0, -P.LE, pf(-P.LE, 0), -90, 180, C.prfv, { seg: 128 });
  tornoZP(R, 0, 0, 0, pf(0, 400), 45, 405, C.prfv, { seg: 128, tapas: false });
  tornoZP(R, 0, 0, -P.LE, [[0, 0], [rz(-P.LE) - e, 0], [rz(-P.LE) - e, 8], [0, 8]], -90, 180, C.prfvH);
  R.ancla('apoyo', [-rz(200) * .7, -rz(200) * .7, 200]);
  R.ancla('empotr', [-1, -rz(-800) + 3, -800]);
  R.ancla('suelo', [-1, -300, -1200]);
  R.ancla('base', [-1, -40, -P.LE + 4]);
}
