/* MAT-CAÑOS-2 · rollo de PEAD Ø50 (5005) con la punta cortada (se ve la pared) */
import { PEAD } from '../piezas/perfiles_civil.mjs';
import { matsC, tuboB, recta, cte } from '../piezas/civil_util.mjs';
export default function (R) {
  R.vista({ az: -40, el: 22, fov: 15, margen: .05 });
  R.config({ bordeOp: .3 });
  const M = matsC(R), T = R.THREE, ro = PEAD.D / 2, ri = ro - PEAD.e, Rl = PEAD.rollo;
  // ---- rollo (eje y), vueltas como toros; atrás a la derecha
  const cx = 650, cz = Rl.Rext + 5, cy = 380;
  for (let k = 0; k < 4; k++) for (let i = 0; i < 5; i++) {
    const Rm = Rl.Rin + ro + k * PEAD.D, y = cy - Rl.ancho / 2 + ro + i * PEAD.D * 1.0;
    const m = new T.Mesh(new T.TorusGeometry(Rm, ro * .99, 20, 120), M.pead); m.position.set(cx, y, cz); m.rotation.x = Math.PI / 2; m.castShadow = m.receiveShadow = true; R.raiz.add(m);
  }
  // cinta de atadura del rollo (2)
  for (const a of [40, 220]) { const b = new T.Mesh(new T.BoxGeometry(30, Rl.ancho + 20, Rl.Rext - Rl.Rin + 30), M.cordon); b.position.set(cx + Math.cos(a * Math.PI / 180) * (Rl.Rin + Rl.Rext) / 2, cy, cz + Math.sin(a * Math.PI / 180) * (Rl.Rin + Rl.Rext) / 2); b.rotation.y = -a * Math.PI / 180; R.raiz.add(b); }
  // punta que sale del rollo hacia adelante, cortada (se ve la pared)
  const yp = cy - Rl.ancho / 2 + ro;
  const Rmax = Rl.Rin + ro + 3 * PEAD.D, zb = cz - Rmax;
  tuboB(R, recta([cx, yp, zb], [cx - 60, yp - 600, ro]), 0, 1, cte(ro), cte(ri), M.pead, { n: 2, na: 64, up: [0, 0, 1], matT: M.peadCorte });
  R.ancla('rollo', [cx - Rmax * .7, cy - Rl.ancho / 2 + ro, cz + Rmax * .7]); R.ancla('punta', [cx - 60, yp - 600 + 2, ro + ro * .6]);
  R.ancla('pared', [cx - 60 - ri - PEAD.e / 2, yp - 600, ro]); R.ancla('cinta', [cx + Math.cos(.7) * 410, cy - Rl.ancho / 2 - 10, cz + Math.sin(.7) * 410]);
}
