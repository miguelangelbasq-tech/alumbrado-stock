/* MAT-CAJA_COLUMNA-1 rev. C (grupo «nobra») · 6024 caja estanca de aluminio inyectado 200 × 200 × 100 (alta del equipo) al lado de la 6003
 * 200 × 150 × 100, las dos cerradas: misma pieza (pared, tapa, junta, 4 tornillos imperdibles, prensacable abajo) con 50 mm más de alto.
 * Medidas de la caja: descripción del pañol; el resto igual a CAJA_AL (protab, (*)). */
import { MX, bandeja, placaRed, prensacable } from '../piezas/protab_util.mjs';
import { CAJA_AL } from '../piezas/perfiles_protab.mjs';
function caja(R, X, x0, H, rot, ip) {
  const C = CAJA_AL, W = C.W, P = C.P, e = C.pared, tp = C.tapa, al = X.aluFund(), g = R.grupo(); g.position.set(x0, 0, 0);
  bandeja(R, -W / 2, W / 2, 0, P - tp, 0, H, e, C.radio, al, { bisel: 1, padre: g });
  const gt = R.grupo(g); gt.position.set(0, P - tp, 0);
  placaRed(R, -W / 2, W / 2, 0, H, 0, tp, C.radio, al, { padre: gt, bisel: 1.5 });
  placaRed(R, -W / 2 + e + 1.6, W / 2 - e - 1.6, e + 1.6, H - e - 1.6, -1.5, 1.6, C.radio - 4, X.junta(), { padre: gt, bisel: .3, huecos: [{ x: 0, z: H / 2, w: W - 2 * e - 3.2 - 2 * C.junta, h: H - 2 * e - 3.2 - 2 * C.junta, rad: 3 }] });
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const x = sx * (W / 2 - C.tornillos.off), z = H / 2 + sz * (H / 2 - C.tornillos.off);
    R.tornillo([x, tp + 1.2, z], [0, 1, 0], { M: C.tornillos.M, L: 16, dk: 9, k: 3.5, tipo: 'combi', mat: X.galv(), padre: gt });
  }
  R.impreso([rot, ip], 70, 22, [0, tp + .05, H / 2], [-1, 0, 0], [0, 0, 1], { padre: gt, color: '#4d545b', ppm: 14 });
  prensacable(R, [x0 - 30, P / 2 - 8, 0], [0, 0, -1], { D: C.prensa.Dr, hex: C.prensa.hex, alto: C.prensa.alto, pared: e, mat: X.aluLiso(), cable: { r: 5.5, largo: 60, colores: true, vaina: '#25272a', adentro: 18 } });
  // orejas de fijación atrás (para las abrazaderas)
  for (const z of [H * .2, H * .8]) R.caja(-W / 2 + 30, W / 2 - 30, -8, 0, z - 9, z + 9, al, { r: 2, padre: g });
  return g;
}
export default function (R) {
  const X = MX(R), C = CAJA_AL;
  R.vista({ az: 156, el: 20, fov: 14, margen: .05 });
  caja(R, X, -125, 150, '6003 · 200 x 150 x 100', 'IP65');
  caja(R, X, 125, 200, '6024 · 200 x 200 x 100', 'ALUMINIO');
  R.ancla('c6003', [-125 - 70, C.P, 130]); R.ancla('c6024', [125 + 60, C.P, 185]);
  R.ancla('tornillo', [125 + C.W / 2 - C.tornillos.off, C.P + 2, 200 - C.tornillos.off]); R.ancla('junta', [125 - C.W / 2 + 6, C.P - C.tapa, 100]);
  R.ancla('prensa', [125 - 30, C.P / 2 - 8, -15]); R.ancla('oreja', [125, -4, 160]); R.ancla('tapa', [125 - 40, C.P, 40]);
}
