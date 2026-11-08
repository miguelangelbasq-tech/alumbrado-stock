/* MAT-ACCESORIOS_PAT-2 · bloquete de bronce RW 1/2" (7003) soldado al fuste (cortado a cuarto: rosca Whitworth real), banderita 7018 y bulón 1/2" explotados */
import { BLQ, BAN, BUL } from '../piezas/perfiles_pat.mjs';
import { matsP, revol, rosca, bulon, arandelaP, arandelaG, cableVA } from '../piezas/pat.mjs';
export default function (R) {
  R.vista({ az: -38, el: 22, fov: 13, margen: .04 });
  R.config({ bordeOp: .35 });
  const M = matsP(R), W = BUL.w12, cte = (k) => () => k, Rf = 70;   // fuste (radio exterior 70, espesor 4) visto como un sector
  // sector del fuste (eje z en x = -Rf): pared de acero pintado
  revol(R, { p0: [-Rf, 0, -70], dir: [0, 0, 1], L: 140, ro: cte(Rf), ri: cte(Rf - BLQ.fuste), a0: -32, a1: 32, ref: [1, 0, 0], mat: M.galv, matC: M.galvC, nt: 64, dz: 140 });
  // bloquete: cilindro radial (eje +x) que sale del fuste, rosca interior RW 1/2" en los primeros BLQ.prof, cortado a cuarto
  const fi = rosca(W.d / 2, W.paso, 55, false);
  revol(R, { p0: [0, 0, 0], dir: [1, 0, 0], L: BLQ.L, ro: (th, z) => z > BLQ.L - 1.5 ? BLQ.D / 2 - (z - BLQ.L + 1.5) : BLQ.D / 2, ri: (th, z) => z > BLQ.L - BLQ.prof ? fi(th, z) : .01,
    a0: 90, a1: 360, ref: [0, 0, 1], mat: M.bronce, matC: M.bronceC, nt: 120, dz: W.paso / 10 });
  // cordón de soldadura alrededor del pie
  const T = R.THREE; const tor = new T.Mesh(new T.TorusGeometry(BLQ.D / 2 + 1, 3.2, 12, 64), M.soldadura); tor.rotation.y = Math.PI / 2; tor.position.set(1.2, 0, 0); tor.castShadow = true; R.agregar(tor);
  // banderita explotada (+x 30): palma con ojal Ø14,6 en el plano y-z, caño de engarce hacia -z con el 10 y el 2,5
  const xb = BLQ.L + 26, e = BAN.e;
  const pal = []; for (let i = 0; i <= 32; i++) { const a = Math.PI * i / 32; pal.push([BAN.a / 2 * Math.cos(a), BAN.a / 2 * Math.sin(a)]); } pal.push([-BAN.a / 2, -BAN.Lp + 8]); pal.push([BAN.a / 2, -BAN.Lp + 8]);
  const hole = Array.from({ length: 40 }, (_, i) => [BAN.ojo / 2 * Math.cos(TAU() * i / 40), BAN.ojo / 2 * Math.sin(TAU() * i / 40)]);
  function TAU() { return Math.PI * 2; }
  R.perfil(pal.map(([u, v]) => [u, v]), [hole], e, M.cobreEst, { A: [1, 0, 0], B: [0, 1, 0], C: [0, 0, 1], o: [xb, 0, 0], bevel: .4 });
  const zc0 = -BAN.Lp + 8;
  R.torno([xb + e / 2, 0, zc0], [xb + e / 2, 0, zc0 - BAN.cano.L], [[BAN.cano.Di / 2, 0], [BAN.cano.De / 2, 0], [BAN.cano.De / 2, BAN.cano.L], [BAN.cano.Di / 2, BAN.cano.L]], M.cobreEst, { seg: 48 });
  for (const k of [.35, .7]) R.torno([xb + e / 2, 0, zc0 - BAN.cano.L * k + 1.5], [xb + e / 2, 0, zc0 - BAN.cano.L * k - 1.5], [[0, 0], [BAN.cano.De / 2 + .2, 0], [BAN.cano.De / 2 + .2, 3], [0, 3]], M.cobreEst, { seg: 6 });
  // cables que entran por abajo al caño: 10 (Ø6) y 2,5 (Ø3,6) lado a lado
  cableVA(R, (u) => [xb + e / 2 - 1.2, 0, zc0 - BAN.cano.L - 120 + u], 0, 118, 118, { r: 1.5, up: [1, 0, 0], franjas: [100, 280] });
  cableVA(R, (u) => [xb + e / 2 + 2.2, 0, zc0 - BAN.cano.L - 160 + u], 0, 158, 158, { r: 3.0, up: [1, 0, 0], franjas: [100, 280] });
  // arandelas y bulón 1/2" Whitworth, explotados en +x
  arandelaP(R, [xb + e + 14, 0, 0], [1, 0, 0], BUL.plana.di, BUL.plana.de, BUL.plana.e, M.galv);
  arandelaG(R, [xb + e + 28, 0, 0], [1, 0, 0], BUL.presion.di, BUL.presion.de, BUL.presion.e, M.galv, { ref: [0, 0, 1] });
  bulon(R, [xb + e + 52 + 40, 0, 0], [-1, 0, 0], { d: W.d, paso: W.paso, ang: 55, L: 40, Lr: 28, af: W.af, k: W.k, mat: M.galv, ref: [0, 0, 1] });
  R.ancla('bloquete', [BLQ.L * .45, BLQ.D / 2 * .3, -BLQ.D / 2 * .95]); R.ancla('rosca', [BLQ.L - 10, -W.d / 2 - .3, .5]); R.ancla('soldadura', [2, -BLQ.D / 2 - 3, -4]);
  R.ancla('fuste', [-Rf + Rf * Math.cos(.4), -Rf * Math.sin(.4), 50]); R.ancla('banderita', [xb, -BAN.a / 2 + 3, 6]); R.ancla('ojo', [xb + e, -BAN.ojo / 2 - 2, 2]);
  R.ancla('cano', [xb + e / 2, -BAN.cano.De / 2, zc0 - BAN.cano.L * .5]); R.ancla('cable10', [xb + 4, -3, zc0 - BAN.cano.L - 80]); R.ancla('cable25', [xb, -1.5, zc0 - BAN.cano.L - 50]);
  R.ancla('plana', [xb + e + 14, -BUL.plana.de / 2 * .8, BUL.plana.de / 2 * .5]); R.ancla('presion', [xb + e + 29, -BUL.presion.de / 2 * .8, BUL.presion.de / 2 * .5]);
  R.ancla('bulon', [xb + e + 52 + 40 + W.k / 2, -W.af / 2, 2]); R.ancla('roscaB', [xb + e + 70, 0, -W.d / 2]);
}
