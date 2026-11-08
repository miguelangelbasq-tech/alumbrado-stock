/* MAT-EMPALMES-1 · VARIANTE: empalme en gel IP68 en línea (referencia Etelec LDJ01, 118 × Ø25), en medio corte: cuerpo, gel, bornera y tuercas de cierre */
import { aislacion, cuerda, conductor } from '../piezas/conex.mjs';
import { GEL, CABLE, COLOR } from '../piezas/perfiles_conex.mjs';
export default function (R) {
  R.vista({ az: -26, el: 40, fov: 12, margen: .04 });
  const T = R.THREE, L = GEL.L, r = GEL.D / 2, zc = r + 1, rc = 3.6;
  const cuerpo = R.grupo(), interior = R.grupo();
  const pa = R.tipoCorte(R.M.pa('#5b6168', { roughness: .45 }), 'plastico');
  const anilloZ = rr => Array.from({ length: 96 }, (_, i) => [rr * Math.cos(i * Math.PI / 48), zc + rr * Math.sin(i * Math.PI / 48)]);
  R.perfil(anilloZ(r), [anilloZ(r - 1.6)], L - 36, pa, { a0: 18, bevel: .3, padre: cuerpo });
  // tuercas de cierre moleteadas (12 caras) con la junta del cable
  const nuez = R.tipoCorte(R.M.pa('#3a3e44', { roughness: .5 }), 'plastico');
  for (const [x0, s] of [[0, 1], [L, -1]]) {
    const pts = Array.from({ length: 24 }, (_, i) => { const a = i * Math.PI / 12, rr = i % 2 ? r + .6 : r + 1.3; return [rr * Math.cos(a), zc + rr * Math.sin(a)]; });
    R.perfil(pts, [Array.from({ length: 48 }, (_, i) => [(rc + .3) * Math.cos(i * Math.PI / 24), zc + (rc + .3) * Math.sin(i * Math.PI / 24)])], 18, nuez, { a0: s > 0 ? x0 : x0 - 18, bevel: .4, padre: cuerpo });
    R.perfil(anilloZ(r - 1.62), [anilloZ(rc + .05)], 8, R.tipoCorte(R.M.goma('#1d1f22'), 'plastico'), { a0: s > 0 ? x0 + 18 : x0 - 26, bevel: .2, padre: cuerpo });
  }
  const gel = new T.MeshPhysicalMaterial({ color: '#8fd3c3', roughness: .15, transparent: true, opacity: .5, clearcoat: .6, depthWrite: false });
  R.tipoCorte(gel, new T.MeshPhysicalMaterial({ color: '#9fdccd', roughness: .35, transparent: true, opacity: .55, depthWrite: false }));
  R.perfil(anilloZ(r - 1.65), [], L - 52, gel, { a0: 26, bevel: 0, padre: cuerpo });
  R.cortar(cuerpo, [-5, L + 5, -40, -.05, -1, zc + 40]);
  const cols = [COLOR.L1, COLOR.N, COLOR.PE];
  const rI = CABLE.uni[1.5] / 2, [n, d] = CABLE.hilosFlex[1.5];
  R.caja(L / 2 - 9, L / 2 + 9, .2, 9.4, zc - 4.6, zc - 1.6, R.M.pa('#d9dad5'), { r: .6, padre: interior });
  [1.8, 4.8, 7.8].forEach((yy, i) => {
    R.caja(L / 2 - 7, L / 2 + 7, yy - 1.3, yy + 1.3, zc - 1.6, zc + 1.4, R.M.latonNiq(), { r: .3, padre: interior });
    for (const xx of [L / 2 - 3.5, L / 2 + 3.5]) R.tornillo([xx, yy, zc + 1.9], [0, 0, 1], { M: 2.2, L: 2, dk: 2.6, k: 1, tipo: 'ranura', giro: 40 + i * 20, mat: R.M.latonNiq(), padre: interior });
    for (const s of [-1, 1]) {
      const xe = s < 0 ? -6 : L + 6, x1 = L / 2 + s * 7.5, ye = 2.4 + (yy - 4.8) * .4;
      conductor(R, [[xe, ye, zc], [s < 0 ? 26 : L - 26, ye, zc], [x1 - s * 14, yy, zc], [x1 - s * 3.5, yy, zc]], .62, rI, cols[i], { padre: interior });
      cuerda(R, Math.min(x1 - s * 3.5, x1 + s * 4), Math.max(x1 - s * 3.5, x1 + s * 4), yy, zc, n, d, .6, { padre: interior });
    }
  });
  const anillo = rr => Array.from({ length: 64 }, (_, i) => [rr * Math.cos(i * Math.PI / 32), zc + rr * Math.sin(i * Math.PI / 32)]);
  for (const [a, b] of [[-30, 18], [L - 18, L + 30]]) R.perfil(anillo(rc), [anillo(rc - .9)], b - a, R.M.cable(COLOR.vaina), { a0: a, bevel: .2 });
  R.ancla('cuerpo', [L * .62, r * .5, zc + r * .87]);
  R.ancla('gel', [L * .33, -.05, zc + 7.5]);
  R.ancla('bornera', [L / 2 + 3.5, 1.8, zc + 2.4]);
  R.ancla('tuerca', [L - 9, -r * .6, zc + r * .9]);
  R.ancla('junta', [22, -.05, zc + 7]);
  R.ancla('cable', [-20, 0, zc + rc]);
  R.ancla('conductor', [38, 1, zc + 1.4]);
}
