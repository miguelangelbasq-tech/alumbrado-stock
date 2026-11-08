/* MAT-ACCESORIOS_PAT-1 · barra de PAT 125 A (7001): cobre sobre 2 aisladores, tornillos M6 con los ojales; el 1 × 10 V/A va a la jabalina */
import { BARRA } from '../piezas/perfiles_pat.mjs';
import { matsP, bulon, arandelaP, ojal, cableVA, revol } from '../piezas/pat.mjs';
export default function (R) {
  R.vista({ az: -24, el: 34, fov: 13, margen: .04 });
  R.config({ bordeOp: .35 });
  const M = matsP(R), B = BARRA, hA = B.ais.H, z1 = hA + B.e;
  // chapa de montaje (fondo del tablero) galvanizada
  R.caja(-25, B.L + 25, -40, 70, -2, 0, M.galv, { r: .5 });
  // aisladores (resina, hexagonales) con espárragos M6
  for (const x of [10, B.L - 10]) {
    R.torno([x, 0, 0], [x, 0, hA], [[0, 0], [B.ais.D / 2, 0], [B.ais.D / 2, 2], [B.ais.D / 2 - 2.5, 4], [B.ais.D / 2 - 2.5, hA - 4], [B.ais.D / 2, hA - 2], [B.ais.D / 2, hA], [0, hA]], M.resina, { seg: 6 });
    bulon(R, [x, 0, z1 + 4.5], [0, 0, -1], { d: 6, paso: 1, ang: 60, L: 12, Lr: 10, af: 10, k: 4, mat: M.galv, ref: [1, 0, 0] });
  }
  // barra de cobre con 7 agujeros M6
  let bar = R.caja(0, B.L, -B.a / 2, B.a / 2, hA, z1, M.cobre, { r: .6, padre: null });
  const xs = Array.from({ length: B.agujeros }, (_, i) => 25 + i * B.paso);
  for (const x of xs) bar = R.restarCSG(bar, R.cil([x, 0, hA - 1], [x, 0, z1 + 1], 3.1, M.cobre, { padre: null, seg: 32 }), M.cobreC);
  R.agregar(bar);
  R.texto('PAT', [B.L / 2, -B.a / 2 - .02, hA + B.e / 2], [1, 0, 0], [0, 0, 1], M.cobre, { size: 3.2, prof: .2 });
  // ojales con su tornillo: el 1 × 10 a la jabalina (x = 25) y dos 1 × 2,5 (x = 75, 125)
  const cab = [[xs[0], 3.0, 'JAB'], [xs[2], 1.9, 'A'], [xs[4], 1.9, 'B']];
  for (const [x, r, nom] of cab) {
    const o = ojal(R, x, 0, z1, 90, { hole: 6.5, W: r > 2 ? 13 : 10, e: r > 2 ? 1.8 : 1.2, Lb: r > 2 ? 16 : 12, De: 2 * r + .6 });
    arandelaP(R, [x, 0, z1 + (r > 2 ? 1.8 : 1.2)], [0, 0, 1], 6.4, 12, 1.2, M.galv);
    bulon(R, [x, 0, z1 + (r > 2 ? 1.8 : 1.2) + 1.2], [0, 0, -1], { d: 6, paso: 1, ang: 60, L: 12, Lr: 10, af: 10, k: 4, mat: M.galv, ref: [1, 0, 0] });
    // cable: sale del barril hacia -y y baja
    const [ex, ey, ez] = o.fin, R0 = 22;
    const f = (u) => { if (u <= 0) return [ex, ey + u * 0 - 0, ez]; return [ex, ey - Math.min(u, 30), ez]; };
    const g2 = (u) => { const L1 = 20; if (u <= L1) return [ex, ey - u, ez];
      const b = (u - L1) / R0; if (b <= Math.PI / 2) return [ex, ey - L1 - R0 * Math.sin(b), ez - R0 + R0 * Math.cos(b)];
      return [ex, ey - L1 - R0, ez - R0 - (u - L1 - R0 * Math.PI / 2)]; };
    const L = r > 2 ? 110 : 80;
    cableVA(R, (u) => g2(-6 + u), 0, L, L, { r, up: [1, 0, 0], franjas: [100, 280], n: 140 });
    // cuerda adentro del barril (no se ve) · punta pelada no
  }
  R.ancla('barra', [B.L * .62, -B.a / 2, z1 - 1]); R.ancla('aislador', [B.L - 10 - B.ais.D / 2 * .8, -B.ais.D / 2 * .5, hA * .5]);
  R.ancla('tornillo', [xs[2] + 4, -2, z1 + 5]); R.ancla('ojal10', [xs[0] - 5, -4, z1 + 1]); R.ancla('cable10', [xs[0], -56, -20]);
  R.ancla('cable25', [xs[2], -48, -10]); R.ancla('agujero', [xs[5], -2, z1]); R.ancla('chapa', [B.L + 10, -30, 0]); R.ancla('arandela', [xs[4] + 5, -3, z1 + 2.4]);
  R.ancla('esparrago', [10 + 5, 2, z1 + 3]);
}
