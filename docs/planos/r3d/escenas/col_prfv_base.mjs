/* MAT-COLUMNA_PRFV-1 · base de la columna PRFV 7 m en su fundación (AP-TC-003-A) cortada a un cuarto: molde PVC Ø247, arena seca, sello,
 * tapa de la base con desagüe Ø25,4, boca «C» a 350 de la base (cortada por la mitad) y el troncal + PE que entran por el canal del telgopor. */
import { matsCol, bloqueZ, circ, rect2, tornoZP, tuboZP, cablePol, PRFV, rPRFV } from '../piezas/col_util.mjs';
export default function (R) {
  R.vista({ az: -40, el: 20, fov: 12, margen: .03 }); R.config({ exposicion: .92, ambiente: .55 });
  const C = matsCol(R), c = PRFV.c7, F = PRFV.fund7, zb = -c.LE, zC = zb + c.C, W = PRFV.ventanaC;
  const B = 430, Q = [-2000, 0, -2000, 0], A0 = -90, A1 = 180;
  bloqueZ(R, rect2(-B, B, -B, B), [rect2(-F.a / 2, F.a / 2, -F.a / 2, F.a / 2)], -1300, -60, C.tierra, { cuarto: Q });
  bloqueZ(R, rect2(-B, B, -B, B), [rect2(-F.a / 2, F.a / 2, -F.a / 2, F.a / 2)], -60, 0, C.pasto, { cuarto: Q });
  const canal = rect2(-F.a / 2 - 5, -F.molde / 2 + 2, -70, 70);
  const huecoH = circ(0, 0, F.molde / 2, 96);
  const sq = rect2(-F.a / 2, F.a / 2, -F.a / 2, F.a / 2);
  bloqueZ(R, sq, [huecoH], -F.h, zC - 75, C.horm, { cuarto: Q });
  bloqueZ(R, sq, [huecoH, canal], zC - 75, zC + 75, C.horm, { cuarto: Q });
  bloqueZ(R, sq, [huecoH], zC + 75, -F.sello, C.horm, { cuarto: Q });
  bloqueZ(R, sq, [huecoH], -F.sello, 0, C.horm, { cuarto: Q });
  bloqueZ(R, canal, [], zC - 75, zC - 32, C.telgopor, { cuarto: Q, bevel: .8 });
  bloqueZ(R, canal, [], zC + 32, zC + 75, C.telgopor, { cuarto: Q, bevel: .8 });
  // molde PVC Ø247 (pared 3), arena seca debajo y alrededor del poste, sello de hormigón pobre 50
  tuboZP(R, 0, 0, -F.h, 0, F.molde / 2, F.molde / 2, 3, A0, A1, C.pvc);
  const rm = F.molde / 2 - 3, rP = (z) => rPRFV(c, z);
  tornoZP(R, 0, 0, -F.h, [[12.7, 0], [rm, 0], [rm, F.h + zb], [12.7, F.h + zb]], A0, A1, C.arena);
  tornoZP(R, 0, 0, zb, [[rP(zb) + .2, 0], [rm, 0], [rm, -F.sello - zb], [rP(-F.sello) + .2, -F.sello - zb]], A0, A1, C.arena);
  tornoZP(R, 0, 0, -F.sello, [[rP(-F.sello) + .2, 0], [rm, 0], [rm, F.sello], [rP(0) + .2, F.sello]], A0, A1, C.horm);
  tuboZP(R, 0, 0, -F.h - 120, zb + 6, 12.7, 12.7, 2, A0, A1, C.pvcG, { seg: 32 });
  // poste: debajo de la «C», la «C» (ventana de 60 × 150 centrada en 180°), arriba
  const th = Math.asin(W.w / 2 / rP(zC)) * 180 / Math.PI;
  const pf = (z0, z1) => [[rP(z0) - c.e, 0], [rP(z0), 0], [rP(z1), z1 - z0], [rP(z1) - c.e, z1 - z0]];
  tornoZP(R, 0, 0, zb, pf(zb, zC - W.h / 2), A0, A1, C.prfv, { seg: 128 });
  tornoZP(R, 0, 0, zC - W.h / 2, pf(zC - W.h / 2, zC + W.h / 2), A0, A1 - th, C.prfv, { seg: 128 });
  tornoZP(R, 0, 0, zC + W.h / 2, pf(zC + W.h / 2, 0), A0, A1, C.prfv, { seg: 128 });
  tornoZP(R, 0, 0, 0, pf(0, 520), 45, 405, C.prfv, { seg: 128, tapas: false });
  // tapa de la base con el desagüe
  tornoZP(R, 0, 0, zb, [[PRFV.base.desague / 2, 0], [rP(zb) - c.e, 0], [rP(zb) - c.e, PRFV.base.tapa], [PRFV.base.desague / 2, PRFV.base.tapa]], A0, A1, C.prfvH);
  // troncal Cu 4×4 (negro) y PE 1×10 (verde-amarillo): por el canal, entran por la «C» y suben (sin caño)
  cablePol(R, [[-B - 40, 22, zC - 8], [-70, 22, zC - 8], [-28, 22, zC + 60], [-28, 22, 520]], 6.8, C.cable('#1d1e21'));
  cablePol(R, [[-B - 40, 48, zC - 14], [-66, 48, zC - 14], [-32, 48, zC + 46], [-32, 48, 520]], 4.2, C.cable('#2f9a3e'));
  R.ancla('poste', [-rP(300) * .72, -rP(300) * .72, 300]);
  R.ancla('C', [-rP(zC), -1, zC + 55]);
  R.ancla('tapaBase', [-1, -45, zb + 6]);
  R.ancla('desague', [-1, -13, -F.h - 70]);
  R.ancla('molde', [-1, -F.molde / 2 + 1, -300]);
  R.ancla('arena', [-1, -rP(-500) - 20, -500]);
  R.ancla('arenaFondo', [-1, -60, -1100]);
  R.ancla('sello', [-1, -rP(-25) - 25, -25]);
  R.ancla('horm', [-1, -230, -950]);
  R.ancla('telgopor', [-200, -1, zC + 54]);
  R.ancla('troncal', [-B, 22, zC - 8]);
  R.ancla('pe', [-B + 50, 48, zC - 14]);
  R.ancla('suelo', [-B * .7, -B, -60]);
}
