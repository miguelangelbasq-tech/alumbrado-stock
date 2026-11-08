/* MAT-CABLE_ACOMETIDA-1 · preensamblado Al-Al 3 × 1 × 25/50 (1016): 3 fases retorcidas sobre el neutro portante */
import { HAZ } from '../piezas/perfiles_cables.mjs';
import { hazPre } from '../piezas/cables.mjs';
export default function (R) {
  R.vista({ az: 58, el: 24, fov: 13, margen: .03 });
  R.config({ bordes: false });
  const H = HAZ.h25_50, xa = [300, 318, 336, 276];
  const o = hazPre(R, H, { x0: 0, xa, Lc: [16, 16, 16, 20], sep: .3, xsep: 250, marcas: [40, 115, 190], a0: 60, paso: 280 });
  const zc = H.Dh / 2;
  const P = (i, x, k = 1) => { const p = o.f[i](x); return p; };
  for (let i = 0; i < 3; i++) { const p = P(i, xa[i] - 10); R.ancla('f' + i, [p[0], p[1], p[2] + H.fases[i].rc]); const q = P(i, xa[i] + 9); R.ancla('c' + i, [q[0], q[1], q[2] + H.fases[i].R]); }
  { const p = P(3, xa[3] - 12); R.ancla('n', [p[0], p[1] - H.neu.rc * .7, p[2] + H.neu.rc * .7]); const q = P(3, xa[3] + 12); R.ancla('nc', [q[0], q[1] - H.neu.R * .7, q[2] + H.neu.R * .7]); }
  for (let i = 0; i < 3; i++) { const x = [30, 95, 160][i]; }
  R.ancla('marca', [115, 0, zc + 4]);
}
