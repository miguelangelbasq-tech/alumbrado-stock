/* MAT-LINEA_AEREA-2 · preensamblado 3 × 25 + 1 × 16 (1503) y 2 × 16 (1502), sin portante */
import { HAZ } from '../piezas/perfiles_cables.mjs';
import { hazPre } from '../piezas/cables.mjs';
export default function (R) {
  R.vista({ az: 58, el: 26, fov: 13, margen: .03 });
  R.config({ bordes: false });
  const H = HAZ.h3x25_16, xa = [290, 306, 322, 274];
  const o = hazPre(R, H, { x0: 0, xa, Lc: 16, sep: .35, xsep: 240, marcas: [40, 110, 180], a0: 45, paso: 260 });
  for (let i = 0; i < 4; i++) { const p = o.f[i](xa[i] - 8); R.ancla('f' + i, [p[0], p[1], p[2] + H.fases[i].rc]); const q = o.f[i](xa[i] + 10); R.ancla('c' + i, [q[0], q[1], q[2] + H.fases[i].R]); }
  const H2 = HAZ.h2x16; const g = R.grupo(); g.position.set(-20, -40, 0);
  const o2 = hazPre(R, H2, { x0: 0, xa: [250, 266], Lc: 14, sep: .4, xsep: 210, marcas: [40, 110, 180], padre: g, a0: 90, paso: 220 });
  for (let i = 0; i < 2; i++) { const p = o2.f[i]([250, 266][i] - 8); R.ancla('g' + i, [p[0] - 20, p[1] - 40, p[2] + H2.fases[i].rc]); }
}
