/* MAT-MAMPOSTERIA-1 · muro de ladrillo común en soga (3 hiladas) con 2 hierros Ø6 en la junta (AP-TC-007) y ladrillo suelto con sus caras */
import { LAD, HIERRO } from '../piezas/perfiles_civil.mjs';
import { matsC, nervada } from '../piezas/civil_util.mjs';
export default function (R) {
  R.vista({ az: -34, el: 24, fov: 15, margen: .04 });
  R.config({ bordeOp: .3 });
  const M = matsC(R), L = LAD.L, A = LAD.A, H = LAD.H, j = LAD.junta;
  // muro: 3 hiladas, trabadas a medio ladrillo, junta de mortero 15
  const n = 3, x0 = 0;
  for (let h = 0; h < 3; h++) {
    const z0 = h * (H + j), off = h % 2 ? -(L + j) / 2 : 0;
    for (let i = -1; i < n + 1; i++) {
      let a = x0 + off + i * (L + j), b = a + L; a = Math.max(a, x0); b = Math.min(b, x0 + n * (L + j) - j); if (b - a < 20) continue;
      R.caja(a, b, 0, A, z0, z0 + H, M.ladrillo, { r: 1.5 });
      if (b < x0 + n * (L + j) - j - 1) R.caja(b, b + j, 0, A, z0, z0 + H, M.mortero, { r: .3 });
    }
    if (h < 2) R.caja(x0, x0 + n * (L + j) - j, 0, A, z0 + H, z0 + H + j, M.mortero, { r: .3 });
  }
  // 2 hierros Ø6 en la junta de arriba (asoman por la punta)
  const zj = H + j + H + j / 2;
  R.caja(x0, x0 + n * (L + j) - j, 0, A, 2 * H + j, 2 * H + 2 * j, M.mortero, { r: .3 });
  for (const y of [30, 90]) nervada(R, [x0 + 40, y, zj], [x0 + n * (L + j) + 120, y, zj], HIERRO.d6, M.hierro, { up: [0, 0, 1] });
  // tercera hilada arriba de la junta con hierros
  // ladrillo suelto adelante, con las caras a la vista
  const bx = 120, by = -330;
  R.caja(bx, bx + L, by, by + A, 0, H, M.ladrillo, { r: 1.5 });
  R.ancla('tabla', [bx + L * .45, by + A * .5, H]); R.ancla('canto', [bx + L * .55, by, H * .5]); R.ancla('testa', [bx, by + A * .5, H * .5]);
  R.ancla('junta', [x0 + 200, 0, H + j / 2]); R.ancla('hierro', [x0 + n * (L + j) + 80, 30, zj + 3]); R.ancla('soga', [x0 + 400, 0, 2 * (H + j) + H * .5 + j]);
  R.ancla('vertical', [x0 + L + j / 2, 0, H * .5]);
}
