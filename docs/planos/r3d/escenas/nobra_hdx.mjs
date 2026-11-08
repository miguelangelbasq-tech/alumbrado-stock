/* MAT-CAÑOS-3 (grupo «nobra») · sistema de caño rígido HDX Ø25 gris (5038–5042) amurado a la pared: caja de paso 90 × 90 × 75 (5041),
 * conector (5039) con la contratuerca adentro, caño (5038), grampa fija (5040) y caja cuadrada de superficie con tapa (5042).
 * CORTE A CUARTO en la entrada del conector a la caja de paso: se ve el caño contra el tope del conector. Medidas: HDX (AC). */
import { HDX } from '../piezas/perfiles_nobra.mjs';
import { placaRed } from '../piezas/protab_util.mjs';
import { matsC, tuboB } from '../piezas/civil_util.mjs';
export default function (R) {
  R.vista({ az: 206, el: 26, fov: 12, margen: .03 });
  const T = R.THREE, M = matsC(R), pvc = R.tipoCorte(R.M.pvc(HDX.cano.color, { roughness: .42, clearcoat: .3 }), 'plastico');
  const pvc2 = R.tipoCorte(R.M.pvc('#9aa0a5', { roughness: .5, clearcoat: .2 }), 'plastico');
  const C = HDX.caja, S = HDX.cajaSup, De = HDX.cano.De, e = HDX.cano.e, K = HDX.conector;
  const zc = 120, yC = 0;   // eje del caño: y = C.P / 2 desde la pared, z = zc
  // pared (revoque) en y = 0, todo sale hacia +y
  R.caja(-110, 590, -25, 0, 40, 200, M.ladrillo, { r: 0 });
  // caja de paso: base + paredes con 4 conos (2 a los costados); hueco a la derecha para el conector
  const gC = R.grupo(), x1c = C.W / 2, ya = C.P / 2;
  placaRed(R, -C.W / 2, C.W / 2, zc - C.H / 2, zc + C.H / 2, 0, C.pared, 4, pvc2, { padre: gC, bisel: .5 });
  let anillo = placaRed(R, -C.W / 2, C.W / 2, zc - C.H / 2, zc + C.H / 2, C.pared - .2, C.P - C.tapa - C.pared + .2, 4, pvc2, { padre: null, bisel: .5,
    huecos: [{ x: 0, z: zc, w: C.W - 2 * C.pared, h: C.H - 2 * C.pared, rad: 2 }] });
  const hueco = R.cil([x1c - 8, ya, zc], [x1c + 8, ya, zc], K.Drosca / 2 + .3, pvc2, { padre: null });
  anillo = R.restarCSG(anillo, hueco, pvc2); gC.add(anillo);
  for (const [x, z] of [[-x1c, zc], [0, zc + C.H / 2], [0, zc - C.H / 2]]) {   // conos (troqueles) cerrados
    const d = x ? [Math.sign(x), 0, 0] : [0, 0, Math.sign(z - zc)], p = [x + d[0] * .2, ya, z + d[2] * .2];
    R.cil(p, [p[0] + d[0] * C.conos, p[1], p[2] + d[2] * C.conos], C.Dcono / 2 + 2, pvc2, { padre: gC, seg: 40 });
  }
  // tapa con 4 tornillos
  const tp = C.P - C.tapa;
  placaRed(R, -C.W / 2 - 1, C.W / 2 + 1, zc - C.H / 2 - 1, zc + C.H / 2 + 1, tp, C.tapa, 5, pvc2, { padre: gC, bisel: 1 });
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) R.tornillo([sx * (C.W / 2 - 8), C.P + .8, zc + sz * (C.H / 2 - 8)], [0, 1, 0], { M: 3.5, L: 12, dk: 7, k: 2.2, tipo: 'pozi', mat: R.M.aceroCinc(), padre: gC });
  R.impreso(['HDX'], 26, 9, [0, C.P + .05, zc], [-1, 0, 0], [0, 0, 1], { padre: gC, color: '#6c7277', ppm: 20 });
  // conector: cuerpo que recibe el caño (afuera) + collar + rosca adentro de la caja + contratuerca
  const xk = x1c, gK = R.grupo(), rI = De / 2 + .15;
  R.torno([xk + K.L - 12, ya, zc], [xk - K.Lrosca, ya, zc], [[rI, 0], [K.Dcuerpo / 2, 0], [K.Dcuerpo / 2, K.L - 12 - 3], [K.tuercaAF / 2 - 1, K.L - 12 - 3], [K.tuercaAF / 2 - 1, K.L - 12],
    [K.Drosca / 2, K.L - 12], [K.Drosca / 2, K.L - 12 + K.Lrosca], [De / 2 - 2.6, K.L - 12 + K.Lrosca], [De / 2 - 2.6, K.tope], [rI, K.tope]], pvc, { padre: gK, seg: 72 });
  R.cil([xk - C.pared - .2, ya, zc], [xk - C.pared - K.tuercaE - .2, ya, zc], K.tuercaAF / 2 / Math.cos(Math.PI / 6), pvc, { padre: gK, seg: 6 });
  // caño de la caja de paso a la caja de superficie
  const xS = 470, xe = xS - S.W / 2;
  const tub = (a, b) => R.torno([a, ya, zc], [b, ya, zc], [[De / 2 - e, 0], [De / 2, 0], [De / 2, b - a], [De / 2 - e, b - a]], pvc, { seg: 72 });
  const gT = R.grupo(); gT.add(tub(xk + K.L - 12 - K.tope + .5, xe - 10)); R.raiz.remove(gT.children[0]); gT.add(tub(xk + K.L - 12 - K.tope + .5, xe - 10));
  R.impresoCil(['HDX Ø25 · IRAM'], [xk + 80, ya, zc], [xk + 160, ya, zc], De / 2 + .02, 70, 100, { color: '#3d4247', px: 1.2, ppm: 40 });
  // grampa fija: U alrededor del caño + base con 2 alas y tornillos
  const G = HDX.grampa, xg = 260, gG = R.grupo();
  const rr = De / 2, re = rr + G.e;
  // base (taco) de la pared al caño + clip en C que abraza el caño (abre hacia afuera) · tornillo por el medio de la base
  R.caja(xg - G.a / 2, xg + G.a / 2, 0, ya - rr + 1.2, zc - G.base[1] / 2 - 4, zc + G.base[1] / 2 + 4, pvc2, { r: 1.2, padre: gG });
  R.caja(xg - G.a / 2 - 8, xg + G.a / 2 + 8, 0, 3, zc - G.base[0] / 2 + 8, zc + G.base[0] / 2 - 8, pvc2, { r: 1, padre: gG });
  tuboB(R, (t) => [t, ya, zc], xg - G.a / 2, xg + G.a / 2, () => re, () => rr + .1, pvc2, { a0: -35, a1: 215, n: 4, na: 64, padre: gG });
  for (const s2 of [1, -1]) R.tornillo([xg + s2 * (G.a / 2 + 4), 3.8, zc], [0, 1, 0], { M: 3.5, L: 25, dk: 7, k: 2.4, tipo: 'pozi', mat: R.M.aceroCinc(), padre: gG });
  // caja cuadrada de superficie con tapa, el caño entra por un conector
  const gS = R.grupo();
  placaRed(R, xS - S.W / 2, xS + S.W / 2, zc - S.H / 2, zc + S.H / 2, 0, S.P - S.tapa, 3, pvc2, { padre: gS, bisel: .6 });
  placaRed(R, xS - S.W / 2 - 1, xS + S.W / 2 + 1, zc - S.H / 2 - 1, zc + S.H / 2 + 1, S.P - S.tapa, S.tapa, 4, pvc2, { padre: gS, bisel: 1 });
  for (const [sx, sz] of [[-1, 1], [1, -1]]) R.tornillo([xS + sx * (S.W / 2 - 9), S.P + .8, zc + sz * (S.H / 2 - 9)], [0, 1, 0], { M: 3.5, L: 12, dk: 7, k: 2.2, tipo: 'pozi', mat: R.M.aceroCinc(), padre: gS });
  const ys = S.P / 2 - 2;
  R.torno([xe - 22, ya, zc], [xe + .5, ya, zc], [[rI, 0], [K.Dcuerpo / 2, 0], [K.Dcuerpo / 2, 18], [K.tuercaAF / 2 - 1, 18], [K.tuercaAF / 2 - 1, 22.5], [rI, 22.5]], pvc, {});
  // corte a cuarto en la entrada a la caja de paso (arriba y adelante del eje)
  R.raiz.updateMatrixWorld(true);
  for (const g of [gC, gK, gT]) R.cortar(g, [xk - 30, xk + 40, ya, C.P + 10, zc, zc + 60]);
  R.ancla('caja', [-C.W / 2 + 10, C.P, zc + C.H / 2 - 12]); R.ancla('tapa', [-20, C.P, zc - 25]); R.ancla('cono', [-x1c - 3, ya, zc]);
  R.ancla('conector', [xk + 14, ya - K.Dcuerpo / 2, zc]); R.ancla('tope', [xk + K.L - 12 - K.tope, ya + 6, zc + De / 2 - 1.5]); R.ancla('tuerca', [xk - C.pared - 3, ya + 8, zc + K.tuercaAF / 2 - 1]);
  R.ancla('cano', [xk + 120, ya + De / 2 * .7, zc + De / 2 * .7]); R.ancla('grampa', [xg, ya, zc + re]); R.ancla('cajaS', [xS + 20, S.P, zc + 25]); R.ancla('pared', [560, 0, 190]);
  R.ancla('conS', [xe - 12, ya, zc - K.Dcuerpo / 2]); R.ancla('rosca', [xk - 6, ya + 6, zc + K.Drosca / 2]);
}
