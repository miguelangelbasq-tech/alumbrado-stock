/* MAT-ACCESORIOS_PAT-3 · los cinco cables de PAT con la punta pelada: 1 × 2,5 · 1 × 6 · 1 × 10 V/A, Cu desnudo 35 (7 hilos) y acero-cobre 1 × 25 (7 hilos, cada uno con su capa de Cu) */
import { matsP, cableVA, barrido } from '../piezas/pat.mjs';
export default function (R) {
  R.vista({ az: -30, el: 30, fov: 13, margen: .05 });
  R.config({ bordeOp: .3 });
  const M = matsP(R), L = 160, Lp = 22;
  const dy = 22;
  // aislados V/A: radios ≈ Ø ext / 2 (2,5 → 3,6 · 6 → 4,7 · 10 → 6,0; IRAM NM 247-3, ver ficha)
  [[1.8, 0], [2.35, 1], [3.0, 2]].forEach(([r, i]) => cableVA(R, (u) => [u, i * dy, 0], 0, L, L + Lp, { r, up: [0, 0, 1], franjas: [60, 240], n: 120, pasoCu: 18 }));
  // desnudos de 7 hilos: Cu 35 (hilo Ø 2,52) y acero-cobre 25 (hilo Ø 2,13)
  const T = R.THREE;
  for (const [i, rw, acu] of [[3, 1.26, false], [4, 1.07, true]]) {
    const y0 = i * dy, paso = 70;
    const hilos = [[0, 0], ...Array.from({ length: 6 }, (_, k) => [2 * rw, 60 * k])];
    for (const [rr, a0] of hilos) {
      const f = (u) => { const a = a0 * Math.PI / 180 + 2 * Math.PI * u / paso; return [u, y0 + rr * Math.cos(a), rr * Math.sin(a)]; };
      barrido(R, f, 0, L + Lp, rw * .98, M.cobre, { n: 200, na: 16, tapas: true, up: [0, 0, 1] });
      if (acu) { const p = f(L + Lp); R.cil([p[0], p[1], p[2]], [p[0] + .08, p[1], p[2]], rw * .78, M.alma, { seg: 24 }); }   // alma de acero de cada hilo, a la vista en la punta
    }
  }
  const pts = { a25: [60, 0, 1.8], a6: [80, dy, 2.35], a10: [100, 2 * dy, 3], cu10: [L + 12, 2 * dy, 2], d35: [120, 3 * dy, 3.8], ac25: [L + Lp, 4 * dy, 2.5], hilo: [L + Lp + .1, 4 * dy + 2.1, 0] };
  for (const [k, p] of Object.entries(pts)) R.ancla(k, p);
}
