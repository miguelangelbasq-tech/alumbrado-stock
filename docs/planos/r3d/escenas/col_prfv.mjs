/* MAT-COLUMNA_PRFV-1 · columna PRFV 7 m en tres tramos: (A) la base en su fundación cortada a un cuarto, con la boca «C», el troncal
 * que entra por el canal del telgopor, la tapa de la base y el desagüe; (B) las dos cajas borneras a 3,50 m (abajo con la tapa afuera);
 * (C) la cima con el buje Ø90/76. Misma geometría que el plano (perfiles_col.mjs). */
import { postePRFV, matsCol, bloqueZ, circ, rect2, tuboZ, cablePol, PRFV, rPRFV } from '../piezas/col_util.mjs';
export default function (R) {
  R.vista({ az: -38, el: 16, fov: 12, margen: .02 }); R.config({ exposicion: .9, ambiente: .55 });
  const C = matsCol(R), c = PRFV.c7, F = PRFV.fund7, zb = -c.LE, zC = zb + c.C;
  // ---------- A: base y fundación ----------
  const A = R.grupo(); const B = 560, Q = [-2000, 0, -2000, -40];
  bloqueZ(R, rect2(-B, B, -B, B), [rect2(-F.a / 2, F.a / 2, -F.a / 2, F.a / 2)], -1350, -60, C.tierra, { cuarto: Q, padre: A });
  bloqueZ(R, rect2(-B, B, -B, B), [rect2(-F.a / 2, F.a / 2, -F.a / 2, F.a / 2)], -60, 0, C.pasto, { cuarto: Q, padre: A });
  const canal = rect2(-F.a / 2 - 5, -F.molde / 2 + 2, -60, 60);
  const huecoH = circ(0, 0, F.molde / 2 + 3, 72);
  bloqueZ(R, rect2(-F.a / 2, F.a / 2, -F.a / 2, F.a / 2), [huecoH], -F.h, zC - 75, C.horm, { cuarto: Q, padre: A });
  bloqueZ(R, rect2(-F.a / 2, F.a / 2, -F.a / 2, F.a / 2), [huecoH, canal], zC - 75, zC + 75, C.horm, { cuarto: Q, padre: A });
  bloqueZ(R, rect2(-F.a / 2, F.a / 2, -F.a / 2, F.a / 2), [huecoH], zC + 75, 0, C.horm, { cuarto: Q, padre: A });
  // telgopor del canal (por arriba y abajo del cable) y en la zanja: canal libre de 60 de alto para el troncal
  bloqueZ(R, canal, [], zC - 75, zC - 30, C.telgopor, { cuarto: Q, padre: A, bevel: 1 });
  bloqueZ(R, canal, [], zC + 30, zC + 75, C.telgopor, { cuarto: Q, padre: A, bevel: 1 });
  // cosas de revolución (se cortan con CSG): molde PVC, arena, sello, poste, desagüe
  const L = R.grupo(A);
  tuboZ(R, 0, 0, -F.h, 0, F.molde / 2, F.molde / 2, 3, C.pvc, { padre: L });
  const rP = rPRFV(c, zb);
  R.torno([0, 0, -F.h], [0, 0, zb], [[12.7, 0], [F.molde / 2 - 3, 0], [F.molde / 2 - 3, F.h + zb], [12.7, F.h + zb], [12.7, 0]], C.arena, { padre: L });
  R.torno([0, 0, zb], [0, 0, -F.sello], [[rP + .3, 0], [F.molde / 2 - 3, 0], [F.molde / 2 - 3, -F.sello - zb], [rPRFV(c, -F.sello) + .3, -F.sello - zb], [rP + .3, 0]], C.arena, { padre: L });
  R.torno([0, 0, -F.sello], [0, 0, 0], [[rPRFV(c, -F.sello) + .3, 0], [F.molde / 2 - 3, 0], [F.molde / 2 - 3, F.sello], [rPRFV(c, 0) + .3, F.sello], [rPRFV(c, -F.sello) + .3, 0]], C.horm, { padre: L });
  tuboZ(R, 0, 0, -F.h - 120, zb + 10, 12.7, 12.7, 2, C.pvcG, { padre: L, seg: 32 });
  postePRFV(R, c, zb, 450, { ang: -90, padre: L, cajas: false, placa: false, buje: false, Cang: 180 });
  // troncal Cu 4×4 (negro) y PE 1×10 (verde-amarillo) por el canal, entran por la «C» y suben
  const tr = C.cable('#1d1e21'), pe = C.cable('#2f9a3e');
  cablePol(R, [[-B - 50, -20, zC - 10], [-60, -20, zC - 10], [-20, -20, zC + 60], [-20, -20, 450]], 6.8, tr, L);
  cablePol(R, [[-B - 50, 18, zC - 14], [-55, 18, zC - 14], [-24, 18, zC + 50], [-24, 18, 450]], 4.2, pe, L);
  R.raiz.updateMatrixWorld(true);
  R.cortar(L, [-2000, 0, -2000, -40, -3000, 600]);
  // ---------- B: tramo de las cajas (3,30 a 4,25 m) ----------
  const dzB = -3900, dxB = 760;
  const GB = R.grupo(); GB.position.set(dxB, 0, dzB);
  postePRFV(R, c, 3300, 4250, { ang: -90, padre: GB, tapa: 'afuera', tapaSep: 110, buje: false, base: false });
  // ---------- C: cima con el buje ----------
  const dzC = -6400, dxC = 1380;
  const GC = R.grupo(); GC.position.set(dxC, 0, dzC);
  postePRFV(R, c, 6550, 7000, { ang: -90, padre: GC, base: false, cajas: false, placa: false });
  // anclas (coordenadas de mundo)
  const rw = (x, y, z, g) => [x + (g ? g[0] : 0), y, z + (g ? g[1] : 0)];
  R.ancla('poste', [0, -rPRFV(c, 250), 250]);
  R.ancla('C', [-rPRFV(c, zC) - 2, 0, zC + 50]);
  R.ancla('tapaBase', [-40, -45, zb + 6]);
  R.ancla('desague', [0, -13, -F.h - 60]);
  R.ancla('molde', [-F.molde / 2, -60, -400]);
  R.ancla('arena', [-rP - 40, -50, -700]);
  R.ancla('sello', [-rP - 40, -50, -25]);
  R.ancla('horm', [-250, -40, -1000]);
  R.ancla('telgopor', [-250, -40, zC + 55]);
  R.ancla('troncal', [-B, -20, zC - 10]);
  R.ancla('pe', [-B + 60, 18, zC - 14]);
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
