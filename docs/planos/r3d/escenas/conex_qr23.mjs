/* MAT-EMPALMES-3 · conector estanco IP68 (Pampaco QR 23, 3 × 4 mm²) — ESQUEMA (la ficha no trae medidas): medio corte con la bornera, juntas y tuercas */
import { conductor, cuerda } from '../piezas/conex.mjs';
import { QR23, CABLE, COLOR } from '../piezas/perfiles_conex.mjs';
export default function (R) {
  R.vista({ az: -28, el: 34, fov: 12, margen: .04 });
  const Q = QR23, L = Q.L, r = Q.D / 2, zc = Q.tuerca.D / 2 + .5, rc = 5.55;
  const g = R.grupo(), in_ = R.grupo();
  const an = (rr, n = 96) => Array.from({ length: n }, (_, i) => [rr * Math.cos(i * 2 * Math.PI / n), zc + rr * Math.sin(i * 2 * Math.PI / n)]);
  const pa = R.tipoCorte(R.M.pa('#30343a', { roughness: .45 }), 'plastico');
  const xb0 = (L - Q.cuerpoL) / 2;
  R.perfil(an(r), [an(r - 2)], Q.cuerpoL, pa, { a0: xb0, bevel: .5, padre: g });
  for (const [x0, s] of [[0, 1], [L, -1]]) {
    const hx = Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; const rr = (i % 2 ? Q.tuerca.D / 2 - .8 : Q.tuerca.D / 2); return [rr * Math.cos(a), zc + rr * Math.sin(a)]; });
    R.perfil(hx, [an(rc + .2)], Q.tuerca.L, R.tipoCorte(R.M.pa('#43484f', { roughness: .45 }), 'plastico'), { a0: s > 0 ? x0 : x0 - Q.tuerca.L, bevel: .5, padre: g });
    // rosca entre tuerca y cuerpo + junta cónica
    R.perfil(an(r - 2.05), [an(rc + .05)], 10, R.tipoCorte(R.M.goma('#1b1d20'), 'plastico'), { a0: s > 0 ? x0 + Q.tuerca.L - 2 : x0 - Q.tuerca.L - 8, bevel: .3, padre: g });
  }
  R.cortar(g, [-5, L + 5, -40, -.06, -1, zc + 40]);
  // bornera de 3 polos con tornillos
  R.caja(L / 2 - 8, L / 2 + 8, .3, 10.2, zc - 6, zc - 2.6, R.M.pa('#d7d8d3'), { r: .6, padre: in_ });
  const cols = [COLOR.L1, COLOR.N, COLOR.PE], rI = CABLE.uni[2.5] / 2, [n, d] = CABLE.hilosFlex[2.5];
  [2, 5.2, 8.4].forEach((yy, i) => {
    R.caja(L / 2 - 6.5, L / 2 + 6.5, yy - 1.4, yy + 1.4, zc - 2.6, zc + .8, R.M.latonNiq(), { r: .3, padre: in_ });
    for (const xx of [L / 2 - 3.2, L / 2 + 3.2]) R.tornillo([xx, yy, zc + 1.3], [0, 0, 1], { M: 2.5, L: 2, dk: 2.8, k: 1.1, tipo: 'pozi', mat: R.M.latonNiq(), padre: in_ });
    for (const s of [-1, 1]) {
      const xe = s < 0 ? -10 : L + 10, x1 = L / 2 + s * 7, ye = 2.6 + (yy - 5.2) * .5;
      conductor(R, [[xe, ye, zc - .6], [s < 0 ? 22 : L - 22, ye, zc - .6], [x1 - s * 10, yy, zc - .9], [x1 - s * 3.2, yy, zc - .9]], .9, rI, cols[i], { padre: in_ });
      cuerda(R, Math.min(x1 - s * 3.2, x1 + s * 3), Math.max(x1 - s * 3.2, x1 + s * 3), yy, zc - .9, n, d, .86, { padre: in_ });
    }
  });
  const vaina = R.M.cable(COLOR.vaina);
  for (const [a, b] of [[-34, 22], [L - 22, L + 34]]) R.perfil(an(rc), [an(rc - 1)], b - a, vaina, { a0: a, bevel: .2 });
  R.ancla('cuerpo', [L * .62, r * .55, zc + r * .84]);
  R.ancla('tuerca', [L - 6, -Q.tuerca.D / 2 * .5, zc + Q.tuerca.D / 2 * .85]);
  R.ancla('junta', [Q.tuerca.L + 2, -.06, zc + 9]);
  R.ancla('bornera', [L / 2 + 3.2, 2, zc + 2]);
  R.ancla('cable', [-22, 0, zc + rc]);
}
