/* MAT-IDENTIFICACION-1 · anillos marcadores sobre unipolares de 2,5 mm² (1-2,5) y 6 mm² (4-6), con letra R / S / T o lisos de color,
 * y termocontraíble 3/8" y 3/16" (suelto y contraído sobre el cable). Geometría: perfiles_nelec (ANI, SPAG, UNI) — anillo AC */
import { anillo, spaghetti } from '../piezas/nelec_util.mjs';
import { ANI, SPAG, UNI } from '../piezas/perfiles_nelec.mjs';
export default function (R) {
  R.vista({ az: 30, el: 32, fov: 14, margen: .03 });
  const cab = (y, C, col, x0 = 50, x1 = 120, raya) => {
    const r = C.Ro, z = r;
    R.cil([x0, y, z], [x1, y, z], r, R.M.cable(col), { seg: 40 });
    if (raya) for (const a0 of [10, 190]) { const m = R.cil([x0, y, z], [x1, y, z], r + .03, R.M.cable(raya), { seg: 40, abierto: true }); m.geometry.dispose(); m.geometry = new R.THREE.CylinderGeometry(r + .03, r + .03, x1 - x0, 24, 1, true, a0 * Math.PI / 180, 75 * Math.PI / 180).rotateX(Math.PI / 2).translate(0, 0, (x1 - x0) / 2); }
    R.cil([x1, y, z], [x1 + 8, y, z], C.conds[0].R, R.M.cobre(), { seg: 24 });
    return z;
  };
  const AM = ANI.amarillo, VE = ANI.verde, CE = ANI.celeste;
  // 2,5 mm²: L1 marrón R, L2 negro S, L3 rojo T, N celeste (anillo celeste), PE (anillo verde) + 1 marrón con anillo amarillo liso
  const f25 = [['#6e3b1d', 'R', AM], ['#202124', 'S', AM], ['#c8302c', 'T', AM], ['#2f86c9', '', CE], ['#2f9a3e', '', VE, '#f2c418'], ['#6e3b1d', '', AM]];
  f25.forEach(([c, l, a, ry], i) => { const y = i * 8; const z = cab(y, UNI.u2_5M, c, 62, 104, ry); anillo(R, [92, y, z], ANI.a25, a, { letra: l }); });
  // 6 mm²: 3 marrones R S T, celeste (anillo celeste), V/A (anillo verde), marrón con amarillo liso
  const f6 = [['#6e3b1d', 'R', AM], ['#6e3b1d', 'S', AM], ['#6e3b1d', 'T', AM], ['#2f86c9', '', CE], ['#2f9a3e', '', VE, '#f2c418'], ['#6e3b1d', '', AM]];
  f6.forEach(([c, l, a, ry], i) => { const y = 64 + i * 10; const z = cab(y, UNI.u6M, c, 76, 122, ry); anillo(R, [108, y, z], ANI.a6, a, { letra: l }); });
  // termocontraíble: 3/16" contraído sobre 1 × 1,5 (Ø3,0) y suelto; 3/8" contraído sobre 6 mm² y suelto
  const S1 = SPAG.s316, S2 = SPAG.s38;
  const y1 = 140, z1 = cab(y1, UNI.u1_5N, '#2f86c9', 30, 74);
  spaghetti(R, 40, 66, y1, z1, UNI.u1_5N.D + 2 * S1.er * .7, S1.er, '#26282b');
  spaghetti(R, 60, 86, y1 + 14, S1.Ds / 2, S1.Ds, S1.es, '#26282b');
  const y2 = 175, z2 = cab(y2, UNI.u6M, '#6e3b1d', 30, 96);
  spaghetti(R, 50, 86, y2, z2, UNI.u6M.D + 2 * S2.er * .7, S2.er, '#c8302c');
  spaghetti(R, 60, 96, y2 + 20, S2.Ds / 2, S2.Ds, S2.es, '#c8302c');
  R.ancla('aR', [92, 0, UNI.u2_5M.Ro + ANI.a25.re]); R.ancla('aS', [92, 8, UNI.u2_5M.Ro + ANI.a25.re]); R.ancla('aT', [92, 16, UNI.u2_5M.Ro + ANI.a25.re]);
  R.ancla('aCe', [92, 24, UNI.u2_5M.Ro + ANI.a25.re]); R.ancla('aVe', [92, 32, UNI.u2_5M.Ro + ANI.a25.re]); R.ancla('aAm', [92, 40, UNI.u2_5M.Ro + ANI.a25.re]);
  const z6 = UNI.u6M.Ro + ANI.a6.re;
  R.ancla('bR', [108, 64, z6]); R.ancla('bS', [108, 74, z6]); R.ancla('bT', [108, 84, z6]); R.ancla('bCe', [108, 94, z6]); R.ancla('bVe', [108, 104, z6]); R.ancla('bAm', [108, 114, z6]);
  R.ancla('s316c', [53, y1, z1 + 2]); R.ancla('s316', [73, y1 + 14, S1.Ds]); R.ancla('s38c', [68, y2, z2 + 3]); R.ancla('s38', [78, y2 + 20, S2.Ds]);
}
