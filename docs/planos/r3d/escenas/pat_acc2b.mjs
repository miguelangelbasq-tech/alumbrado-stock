/* MAT-ACCESORIOS_PAT-2 · en su lugar: pie de una columna metálica EXISTENTE, bloquete + banderita debajo de la torta (cortada), cable 1 × 10 V/A a la jabalina */
import { BLQ, BAN, TOMA } from '../piezas/perfiles_pat.mjs';
import { matsP, revol, tomacable, cableVA } from '../piezas/pat.mjs';
export default function (R) {
  R.vista({ az: -36, el: 24, fov: 14, margen: .03 });
  R.config({ bordeOp: .3 });
  const M = matsP(R), cte = (k) => () => k, Rc = 70, ht = 120, B = 420;
  // terreno cortado a cuarto
  let s = R.caja(-B, B, -B, B, -500, 0, M.tierra, { r: 0, padre: null });
  s = R.restarCSG(s, R.caja(-B - 5, 0, -B - 5, 0, -505, 5, M.tierra, { r: 0, padre: null }), M.tierraC);
  s = R.restarCSG(s, R.cil([0, 0, -300], [0, 0, 5], Rc + 160, M.tierra, { padre: null, seg: 64 }), M.tierraC);
  R.agregar(s);
  // torta de hormigón (Ø 460, de -300 a +ht) cortada a cuarto con el hueco de la columna
  revol(R, { p0: [0, 0, -300], dir: [0, 0, 1], L: 300 + ht, ro: (th, z) => z > 300 + ht - 30 ? Rc + 160 - (z - 300 - ht + 30) * 1.2 : Rc + 160, ri: cte(Rc), a0: 270, a1: 540, ref: [1, 0, 0], mat: M.horm, matC: M.hormC, nt: 96, dz: 30 });
  // columna (caño de acero) cortada en el mismo cuarto
  revol(R, { p0: [0, 0, -300], dir: [0, 0, 1], L: 900, ro: cte(Rc), ri: cte(Rc - 4), a0: 270, a1: 540, ref: [1, 0, 0], mat: M.galv, matC: M.galvC, nt: 96, dz: 100 });
  // bloquete en el fuste a z = 40 (dentro de la torta), mirando a -x-y (al cuarto cortado)
  const ang = -135 * Math.PI / 180, u = [Math.cos(ang), Math.sin(ang), 0], zb = 40;
  const p0 = [u[0] * Rc, u[1] * Rc, zb];
  revol(R, { p0, dir: u, L: BLQ.L, ro: cte(BLQ.D / 2), mat: M.bronce, matC: M.bronceC, nt: 64, dz: 10, ref: [0, 0, 1] });
  // banderita sobre la cara del bloquete
  const pb = [u[0] * (Rc + BLQ.L), u[1] * (Rc + BLQ.L), zb];
  R.perfil(Array.from({ length: 40 }, (_, i) => [BAN.a / 2 * Math.cos(2 * Math.PI * i / 40), BAN.a / 2 * Math.sin(2 * Math.PI * i / 40)]), [], BAN.e, M.cobreEst, { A: u, B: [-u[1], u[0], 0], C: [0, 0, 1], o: pb, bevel: .4 });
  R.cil([pb[0] + u[0] * BAN.e, pb[1] + u[1] * BAN.e, zb], [pb[0] + u[0] * (BAN.e + 9), pb[1] + u[1] * (BAN.e + 9), zb], 10.4, M.galv, { seg: 6 });
  // jabalina a 600 del eje (en +x+y… se ve por el corte), tomacable y el cable que viene de la banderita por el terreno
  const xj = -300, yj = -170;
  revol(R, { p0: [xj, yj, -80], dir: [0, 0, -1], L: 420, ro: (th, z) => z < 1.5 ? 7.3 - 1.5 + z : 7.3, mat: M.cobre, matC: M.cobreC, nt: 48, dz: 20, tapa1: false });
  const t = tomacable(R, xj, yj, -102);
  const pc = [pb[0], pb[1], zb - 14];
  const pts = [pc, [pc[0], pc[1], -60], [pc[0] - 20, pc[1] - 10, -140], [t.xc - 10, yj + 40, -150], [t.xc, yj, -120], [t.xc, yj, -112]];
  const T = R.THREE, cur = new T.CatmullRomCurve3(pts.map(p => new T.Vector3(...p)), false, 'catmullrom', .3);
  cableVA(R, (s) => cur.getPoint(Math.min(Math.max(s, 0), 1)).toArray(), 0, 1, 1, { up: [0, 0, 1], n: 240, franjas: [100, 280] });
  R.ancla('columna', [Rc * .7, -Rc * .7, 500]); R.ancla('torta', [-(Rc + 120), -20, 60]); R.ancla('bloquete', [u[0] * (Rc + 25), u[1] * (Rc + 25), zb + BLQ.D / 2]);
  R.ancla('banderita', [pb[0], pb[1], zb + BAN.a / 2 - 2]); R.ancla('cable', cur.getPoint(.45).toArray()); R.ancla('jabalina', [xj, yj - 7, -350]); R.ancla('tomacable', [t.W0 + 2, yj - TOMA.E / 2, -102]);
  R.ancla('bulon', [pb[0] + u[0] * 8, pb[1] + u[1] * 8, zb + 9]); R.ancla('terreno', [B * .6, -B * .6, -250]);
}
