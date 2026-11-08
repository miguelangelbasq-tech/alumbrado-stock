/* MAT-COLUMNA_METALICA-1 · base de la columna metálica 7 m (tramo Ø114 × 3,6) empotrada en la fundación (AP-TC-003) cortada a un cuarto:
 * entrada de cable 150 × 76 con el centro a 300 bajo el piso (cortada por la mitad), caño PVC Ø75 (6004) a la zanja, troncal y PE que suben. */
import { matsCol, bloqueZ, rect2, tornoZP, tuboVentana, cablePol, MET } from '../piezas/col_util.mjs';
export default function (R) {
  R.vista({ az: -40, el: 20, fov: 12, margen: .03 }); R.config({ exposicion: .92, ambiente: .55 });
  const C = matsCol(R), c = MET.c7, [D, e] = c.tr[0], r = D / 2, Fh = MET.fund.h7, Fa = MET.fund.a / 2, En = MET.entrada;
  const B = 430, Q = [-2000, 0, -2000, 0], A0 = -90, A1 = 180, rp = 37.5;
  bloqueZ(R, rect2(-B, B, -B, B), [rect2(-Fa, Fa, -Fa, Fa)], -1050, -60, C.tierra, { cuarto: Q });
  bloqueZ(R, rect2(-B, B, -B, B), [rect2(-Fa, Fa, -Fa, Fa)], -60, 0, C.pasto, { cuarto: Q });
  const sq = rect2(-Fa, Fa, -Fa, Fa), hueco = Array.from({ length: 64 }, (_, i) => [r * Math.cos(i * Math.PI / 32), r * Math.sin(i * Math.PI / 32)]);
  const slot = rect2(-Fa - 5, -r + 1, -rp, rp);
  bloqueZ(R, sq, [hueco], -Fh, En.z - rp, C.horm, { cuarto: Q });
  bloqueZ(R, sq, [hueco, slot], En.z - rp, En.z + rp, C.horm, { cuarto: Q });
  bloqueZ(R, sq, [hueco], En.z + rp, 0, C.horm, { cuarto: Q });
  bloqueZ(R, rect2(-B, -Fa, -B, B), [], En.z - rp, En.z + rp, C.tierra, { cuarto: Q }).visible = false;
  // tubo Ø114 con la entrada 150 × 76 mirando a −x (el corte la parte al medio)
  tuboVentana(R, -c.emp, 0, r, r, e, A0, A1, C.galv, { a: 180, z: En.z, w: En.w, h: En.h }, { seg: 128 });
  tornoZP(R, 0, 0, 0, [[r - e, 0], [r, 0], [r, 650], [r - e, 650]], 45, 405, C.galv, { seg: 128, tapas: false });
  // caño PVC Ø75 de la entrada a la zanja (mitad de atrás)
  const gp = R.grupo(); gp.position.set(-r + 6, 0, En.z); gp.rotation.y = -Math.PI / 2;
  tornoZP(R, 0, 0, 0, [[rp - 2.2, 0], [rp, 0], [rp, B + 40], [rp - 2.2, B + 40]], 0, 180, C.pvc, { padre: gp, seg: 64 });
  // fondo de la columna: hormigón de relleno hasta la entrada (*)
  tornoZP(R, 0, 0, -c.emp, [[0, 0], [r - e, 0], [r - e, -c.emp - (En.z - En.h / 2) * -1 + 0], [0, -c.emp - (En.z - En.h / 2) * -1]].map(([a, b]) => [a, Math.abs(b)]), A0, A1, C.horm);
  // troncal (negro) y PE 1×10 (verde-amarillo)
  cablePol(R, [[-B - 60, 14, En.z - 6], [-r - 10, 14, En.z - 6], [-22, 14, En.z + 50], [-22, 14, 650]], 6.8, C.cable('#1d1e21'));
  cablePol(R, [[-B - 60, -6 + 30, En.z - 16], [-r - 8, 24, En.z - 16], [-28, 24, En.z + 40], [-28, 24, 650]], 4.2, C.cable('#2f9a3e'));
  R.ancla('tubo', [-r * .7, -r * .7, 350]);
  R.ancla('entrada', [-r, -1, En.z + En.h / 2 - 10]);
  R.ancla('cano', [-B + 40, -1, En.z + rp]);
  R.ancla('horm', [-1, -200, -700]);
  R.ancla('relleno', [-1, -25, -560]);
  R.ancla('troncal', [-B + 10, 14, En.z - 6]);
  R.ancla('pe', [-B + 70, 24, En.z - 16]);
  R.ancla('pared', [-1, -r + e / 2, -150]);
  R.ancla('suelo', [-B * .7, -B, -60]);
}
