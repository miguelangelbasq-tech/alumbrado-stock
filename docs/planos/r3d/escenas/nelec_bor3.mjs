/* MAT-BORNERAS-3 · tira en el riel NS35: BPN 4 azul (1038) y verde (1039), separador 2,5/4 (2063), BPN 06 «10 mm» verde (3075), tapa 2066,
 * separador 16/35 (2064), BPN-16 gris (3076, cortado a cuarto) y azul (2065). Cables con puntera. Medidas: perfiles_nelec.mjs (*) */
import { borneT, placaT, rielT, cableT } from '../piezas/nelec_util.mjs';
import { BPN4, BPN10, BPN16, SEP4, SEP16, TAPA10 } from '../piezas/perfiles_nelec.mjs';
export default function (R, PRM = {}) {
  const ex = PRM.explotado ? 1 : 0;
  R.vista(ex ? { az: 128, el: 24, fov: 14, margen: .03 } : { az: 132, el: 30, fov: 14, margen: .03 });
  const AZ = '#2b5fae', VE = '#13843a', GR = '#b4b8ba', TA = '#9ea3a8';
  rielT(R, -12, 98 + ex * 96, BPN4);
  const g16 = R.grupo(); g16.position.y = -(BPN16.riel.y0 - BPN4.riel.y0);
  let x = 0; const X = {}; const dz = (i) => 0, dx = ex ? 12 : 0;
  const pon = (k, f, w, i) => { const gg = R.grupo(f === '16' ? g16 : undefined); gg.position.set(ex * i * dx, 0, dz(i)); X[k] = x; return gg; };
  let i = 0;
  let g = pon('b4a', 0, 0, i++); borneT(R, x, AZ, BPN4, { padre: g, marca: 'N' }); x += BPN4.paso;
  g = pon('b4v', 0, 0, i++); borneT(R, x, VE, BPN4, { padre: g, marca: 'PE' }); x += BPN4.paso;
  g = pon('s4', 0, 0, i++); placaT(R, x, SEP4, '#3a3e45', { padre: g }); x += SEP4.esp;
  g = pon('b10', 0, 0, i++); borneT(R, x, VE, BPN10, { padre: g, marca: 'PE' }); x += BPN10.paso;
  g = pon('tapa', 0, 0, i++); placaT(R, x, TAPA10, TA, { padre: g }); x += TAPA10.esp + 4;
  g = pon('s16', '16', 0, i++); placaT(R, x, SEP16, '#3a3e45', { padre: g }); x += SEP16.esp;
  g = pon('b16g', '16', 0, i++); const bg = borneT(R, x, GR, BPN16, { padre: g, marca: 'L1' }); x += BPN16.paso;
  g = pon('b16a', '16', 0, i++); borneT(R, x, AZ, BPN16, { padre: g, marca: 'N' }); x += BPN16.paso;
  if (!ex) {
    const cab = (k, T, cols, gr, rc) => { const xm = X[k] + T.pared + (T.paso - T.pared) / 2; for (const l of ['I', 'D']) cableT(R, xm, l, cols, T, { padre: gr, largo: 26, rc }); };
    cab('b4a', BPN4, ['#2f86c9'], undefined, 1.25); cab('b4v', BPN4, ['#2f9a3e', '#f2c418'], undefined, 1.25); cab('b10', BPN10, ['#2f9a3e', '#f2c418'], undefined, 2.1);
    cab('b16g', BPN16, ['#6e3b1d'], g16, 2.6); cab('b16a', BPN16, ['#2f86c9'], g16, 2.6);
    g16.updateMatrixWorld(true);
  }
  const y16 = -(BPN16.riel.y0 - BPN4.riel.y0), xm = (k, T) => X[k] + ex * 0 + T.paso / 2;
  const at = (k, i0) => [ex ? i0 * dx : 0, ex ? dz(i0) : 0];
  const A = (k, i0, T, y, z, oy = 0) => { const [ox, oz] = at(k, i0); return [X[k] + T.paso / 2 + ox, y + oy, z + oz]; };
  R.ancla('b4a', A('b4a', 0, BPN4, BPN4.C * .5, BPN4.A));
  R.ancla('b4v', A('b4v', 1, BPN4, BPN4.C * .3, BPN4.A * .82));
  R.ancla('s4', A('s4', 2, { paso: SEP4.esp }, 40, 44));
  R.ancla('b10', A('b10', 3, BPN10, BPN10.C * .62, BPN10.A * .9));
  R.ancla('tapa', A('tapa', 4, { paso: TAPA10.esp }, 50, 20));
  R.ancla('s16', A('s16', 5, { paso: SEP16.esp }, 60, 52, y16));
  R.ancla('b16g', A('b16g', 6, BPN16, BPN16.C * .5, BPN16.A, y16));
  R.ancla('b16a', A('b16a', 7, BPN16, BPN16.C * .8, BPN16.A * .82, y16));
  R.ancla('jaula', A('b16g', 6, BPN16, BPN16.yT[0], BPN16.puntera.zEje + 4, y16));
  R.ancla('barra', A('b16g', 6, BPN16, BPN16.C * .45, 17.2 * BPN16.A / 50, y16));
  R.ancla('tornillo', A('b16g', 6, BPN16, BPN16.yT[1], BPN16.tornillo.zCab, y16));
  R.ancla('riel', [-8, BPN4.riel.y0 + 30, -2]);
  R.ancla('cable', [X.b4a + 3, -30, BPN4.puntera.zEje]);
}
