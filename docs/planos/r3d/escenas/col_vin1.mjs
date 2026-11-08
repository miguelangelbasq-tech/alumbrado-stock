/* MAT-VINCULOS-1 · vínculo capuchón 1 brazo de 400 (6019) sobre el buje Ø90/76 de la columna PRFV 7 m, cortado a un cuarto:
 * capuchón Ø101,6 con tapa soldada, prisioneros M10 sobre tuercas soldadas, brazo Ø60,3 a 5° con cartela, luminaria con bulón pasante 4019 + 4038. */
import { matsCol, tornoZP, capuchon, luminaria, cablePol, PRFV, rPRFV, VIN, LUM, bulonHex } from '../piezas/col_util.mjs';
export default function (R) {
  R.vista({ az: -52, el: 18, fov: 12, margen: .03 }); R.config({ exposicion: .92, ambiente: .55 });
  const T = R.THREE, C = matsCol(R), c = PRFV.c7, B = c.buje, zt = c.LT - c.LE;
  const r0 = rPRFV(c, zt - 450);
  tornoZP(R, 0, 0, zt - 450, [[r0 - c.e, 0], [r0, 0], [c.DEC / 2, 450], [c.DEC / 2 - c.e, 450]], 45, 405, C.prfv, { tapas: false, seg: 128 });
  tornoZP(R, 0, 0, zt - 8, [[B.De / 2, 0], [c.DEC / 2 - c.e, 0], [c.DEC / 2 - c.e, 8], [B.De / 2, 8]], 45, 405, C.prfvH, { tapas: false });
  tornoZP(R, 0, 0, zt - B.dentro, [[B.Di / 2, 0], [B.De / 2, 0], [B.De / 2, B.dentro + B.sobre], [B.Di / 2, B.dentro + B.sobre]], -90, 180, C.pvcG);
  const zc = zt + B.sobre + VIN.cap.tapa - VIN.cap.H;
  const { puntas } = capuchon(R, zc, [0], { cut: true });
  const P = puntas[0], d = new T.Vector3(...P.d), tip = new T.Vector3(...P.p1);
  // luminaria: el brazo entra 150 en el acople
  const gl = R.grupo(); const o = tip.clone().addScaledVector(d, -150);
  const lum = luminaria(R, { padre: gl, nema: 'foto' });
  gl.position.copy(o); gl.rotation.y = -VIN.brazo.inc * Math.PI / 180; gl.position.z -= LUM.acople.z;
  // cable 3×1,5 que sube por el buje y entra al brazo
  cablePol(R, [[0, 6, zt - 400], [0, 6, zc + VIN.brazo.z - 40], [30, 6, zc + VIN.brazo.z - 4], [VIN.cap.D / 2 + 60, 6, zc + VIN.brazo.z + 2]], 5, C.cable('#1d1e21'));
  R.ancla('cap', [-VIN.cap.D / 2 * .72, -VIN.cap.D / 2 * .72, zc + 200]);
  R.ancla('tapaCap', [-20, -1, zc + VIN.cap.H - 3]);
  R.ancla('buje', [-1, -B.De / 2 + 4, zc + 60]);
  R.ancla('pris', [Math.cos(-Math.PI / 4) * (VIN.cap.D / 2 + 10), Math.sin(-Math.PI / 4) * (VIN.cap.D / 2 + 10), zc + VIN.pris.z]);
  R.ancla('brazo', tip.clone().addScaledVector(d, -330).toArray());
  R.ancla('cartela', [VIN.cap.D / 2 + 20, -2.5, zc + VIN.brazo.z - 45]);
  R.ancla('cable', [0, 6 - 1, zc + 20]);
  R.ancla('poste', [-r0 * .7, -r0 * .7, zt - 300]);
  R.ancla('lum', o.clone().addScaledVector(d, 420).add(new T.Vector3(0, -150, 0)).toArray());
  R.ancla('bulon', o.clone().addScaledVector(d, 60).add(new T.Vector3(0, 0, LUM.H - LUM.acople.z + 2)).toArray());
  R.ancla('foto', o.clone().addScaledVector(d, LUM.nema.x).add(new T.Vector3(0, -30, LUM.H - LUM.acople.z + 60)).toArray());
}
