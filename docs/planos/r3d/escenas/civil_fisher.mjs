/* MAT-FIJACION-1 · tornillo con taco fisher n° 8 colocado en la pared (ladrillo + revoque) sujetando el soporte 4033, cortado:
 * se ven las dos patas del taco abiertas por el tornillo y apretadas contra el agujero */
import { FISHER, GRAMPA } from '../piezas/perfiles_civil.mjs';
import { matsC, revol, cte, rosca } from '../piezas/civil_util.mjs';
export default function (R) {
  R.vista({ az: -62, el: 22, fov: 14, margen: .05 });
  R.config({ bordeOp: .3 });
  const M = matsC(R), T = R.THREE, F = FISHER, r = F.d / 2;
  // pared: revoque 15 + ladrillo; eje del taco a lo largo de +y desde y = 0 (cara del revoque)
  const g = R.grupo();
  R.caja(-24, 24, 0, 15, -24, 24, M.mortero, { r: .3, padre: g });
  R.caja(-24, 24, 15, 62, -24, 24, M.ladrillo, { r: .3, padre: g });
  const h = new T.Mesh(new T.CylinderGeometry(r, r, 2 * F.prof, 40)); h.position.set(0, 0, 0); g.add(h); h.updateMatrixWorld();
  for (const m of [g.children[0], g.children[1]]) { const n = R.restarCSG(m, h, m.material.userData.corte || m.material); g.remove(m); g.add(n); }
  g.remove(h);
  R.cortar(g, [-200, 0, -200, 200, -200, 200]);     // medio corte: se saca x < 0
  // taco: collar en la boca, 2 patas que se abren hacia la punta (cortado igual, revol dir +y: ángulo desde +z hacia +x)
  const q = { a0: 0, a1: 180 };
  revol(R, { p0: [0, 1, 0], dir: [0, 1, 0], L: 10, ro: cte(r - .15), ri: cte(2.55), mat: M.fisher, matC: M.fisherC || M.fisherCorte, ...q, nt: 72, dz: 1 });
  for (const [a0, a1] of [[0, 84], [96, 180]]) revol(R, { p0: [0, 11, 0], dir: [0, 1, 0], L: F.L - 10, ro: (th, z) => r - .15, ri: (th, z) => 2.55 + Math.min(.35, z * .02), a0, a1, mat: M.fisher, matC: M.fisherCorte, nt: 24, dz: 1 });
  // tornillo 5 × 45 (cabeza fresada sobre el soporte)
  // tornillo 5 × 45 en medio corte: cabeza fresada, rosca real (revol) y punta
  const y0 = -GRAMPA.chapa - 2.8, Lt = F.tornillo[1], fr = rosca(2.5, 2.2, 60);
  revol(R, { p0: [0, y0, 0], dir: [0, 1, 0], L: 2.8, ro: (th, z) => 4.75 - z * .6, ri: null, a0: 0, a1: 180, mat: M.zinc, matC: M.aceroC, nt: 48, dz: .4 });
  revol(R, { p0: [0, y0 + 2.8, 0], dir: [0, 1, 0], L: Lt - 2.8, ro: (th, z) => { const rr = Math.max(1.75, fr(th, z)); const zz = Lt - 2.8 - z; return zz < 6 ? Math.max(.2, rr * zz / 6) : rr; }, a0: 0, a1: 180, mat: M.zinc, matC: M.aceroC, nt: 48, dz: .12 });
  // soporte (ala de la grampa) apretado contra el revoque
  const s = R.grupo(); R.caja(-14, 34, -GRAMPA.chapa, 0, -9, 9, M.galv, { r: .3, padre: s });
  const h3 = new T.Mesh(new T.CylinderGeometry(2.8, 2.8, 10, 32)); s.add(h3); h3.updateMatrixWorld(); { const m = s.children[0]; const n = R.restarCSG(m, h3, M.galvC); s.remove(m); s.add(n); s.remove(h3); }
  R.cortar(s, [-200, 0, -200, 200, -200, 200]);
  R.ancla('taco', [0, 6, r - .6]); R.ancla('patas', [0, 34, -r + .6]); R.ancla('tornillo', [0, 22, 1.2]); R.ancla('cabeza', [0, -3.5, 3]); R.ancla('punta', [0, y0 + Lt - 2, 0]);
  R.ancla('revoque', [0, 7, -16]); R.ancla('ladrillo', [0, 45, -16]); R.ancla('soporte', [28, -1.2, 6]); R.ancla('agujero', [0, F.L + 6, r - .3]);
}
