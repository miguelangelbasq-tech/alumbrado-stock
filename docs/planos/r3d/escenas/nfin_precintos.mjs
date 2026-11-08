/* MAT-FIJACION-3 · 9015 precinto de tapa (cola numerado) abierto y cerrado en las orejas de una tapa; 9019 precinto de rotor con alambre
 * en el tornillo de la tapa de bornera (forma y medidas AC, ver FUENTES_nfin.md) */
import { PTAPA, PBORN, matsN, precintoTapa, precintoRotor, alambre2 } from '../piezas/nfin_util.mjs';
import { barrido } from '../piezas/pat.mjs';
export default function (R) {
  R.vista({ az: -28, el: 34, fov: 14, margen: .05 });
  R.config({ bordeOp: .28 });
  const M = matsN(R), P = PTAPA, B = PBORN;
  // ---- 9015 abierto, acostado
  precintoTapa(R, -40, -70);
  // ---- 9015 cerrado sobre las orejas de una tapa (2 chapas con agujero Ø6)
  const ox = 40, oy = 25;
  for (const [z0, z1, dx] of [[0, 2.5, 0], [3, 5.5, 6]]) {
    const g = R.grupo(); R.perfil([[ox - 14 + dx, oy - 9], [ox + 10, oy - 9], [ox + 10, oy + 9], [ox - 14 + dx, oy + 9]], [Array.from({ length: 24 }, (_, i) => [ox + 3 * Math.cos(i / 24 * 2 * Math.PI), oy + 3 * Math.sin(i / 24 * 2 * Math.PI)])],
      z1 - z0, M.chapa, { A: [0, 0, 1], B: [1, 0, 0], C: [0, 1, 0], o: [0, 0, z0], bevel: .2, padre: g });
  }
  // lazo: círculo en el plano x-z que pasa vertical por el agujero (x = ox) y tiene la traba arriba
  const Rl = 13, cx = ox + Rl, cz = 2.75;
  const f = (t) => { const a = Math.PI + t * 2 * Math.PI * .93; return [cx + Rl * Math.cos(a), oy, cz + Rl * Math.sin(a)]; };
  barrido(R, f, 0, 1, P.w / 2, M.pp, { n: 120, na: 16 });
  const [bw, bh, be] = P.band, [tx, tz, ty] = P.traba, zt = cz + Rl + 1;
  R.caja(cx - tx / 2, cx + tx / 2, oy - ty / 2, oy + ty / 2, zt - 4, zt + 4, M.pp, { r: .8 });
  const gb = R.grupo(); R.caja(cx - bw / 2, cx + bw / 2, oy - be / 2, oy + be / 2, zt + 4, zt + 4 + bh, M.pp, { r: 1.2, padre: gb });
  R.impreso([P.num], bw * .9, 8, [cx, oy - be / 2 - .03, zt + 4 + bh * .55], [1, 0, 0], [0, 0, 1], { color: '#ffffff', px: 7, peso: 700 });
  R.cil([cx + tx / 2, oy, zt], [cx + tx / 2 + 14, oy, zt - 3], P.w / 2, M.pp, { seg: 16 });   // cola sobrante (se corta al ras)
  // ---- 9019 en la tapa de bornera: tornillo con cabeza agujereada + oreja, alambre retorcido y el rotor
  const bx = 150, by = 30;
  R.caja(bx - 30, bx + 40, by - 20, by + 20, 0, 4, M.tablero, { r: 1.5 });                  // tapa (plástico)
  R.cil([bx, by, 4], [bx, by, 9], 5.5, M.galv, { seg: 6 });                                  // cabeza del tornillo (hex. con agujero transversal)
  R.cil([bx, by - 6, 6.6], [bx, by + 6, 6.6], 1.0, R.M.oscuro(), { seg: 16 });
  R.caja(bx + 16, bx + 26, by - 1.5, by + 1.5, 4, 14, M.tablero, { r: .6 });                // oreja fija de la base
  R.cil([bx + 21, by - 2, 10], [bx + 21, by + 2, 10], 1.2, R.M.oscuro(), { seg: 16 });
  const sx = bx + 10, sy = by - 32, sz = B.D / 2 + 1;
  precintoRotor(R, [sx, sy, sz]);
  const P0 = [[sx - 3, sy + 1, sz - 6], [sx - 8, sy + 10, 4], [bx - 8, by - 12, 6.6], [bx - 6, by, 6.6], [bx + 6, by, 6.6], [bx + 12, by + 3, 9], [bx + 21, by + 3, 10], [bx + 21, by - 4, 10],
    [bx + 18, by - 14, 6], [sx + 8, sy + 10, 4], [sx + 3, sy + 1, sz - 6]];
  const cur = new R.THREE.CatmullRomCurve3(P0.map(p => new R.THREE.Vector3(...p)), false, 'centripetal');
  const fw = (t) => cur.getPoint(Math.min(1, Math.max(0, t))).toArray();
  alambre2(R, fw, 0, 1, { paso: 5, n: 260 });
  R.ancla('band', [-40 + 6, -70 - 8, be]); R.ancla('num', [-40 + 12, -70 - 3, be]); R.ancla('traba', [-40 + bw + tx / 2, -70 + ty / 2, tz]);
  R.ancla('cola', [-40 + bw + tx + 120, -70, P.w]); R.ancla('punta', [-40 + bw + tx + P.L - 2, -70, P.w / 2]);
  R.ancla('lazo', f(.15)); R.ancla('orejas', [ox - 10, oy - 9, 5.5]); R.ancla('bandC', [cx - bw / 2 + 3, oy - be / 2, zt + 4 + bh * .3]); R.ancla('sobra', [cx + tx / 2 + 12, oy, zt - 2.5]);
  R.ancla('rotor', [sx, sy + B.e / 2 + B.rotE + B.ala[2], sz + 2]); R.ancla('cuerpo', [sx - B.D / 2 * .7, sy - B.e / 2, sz + B.D / 2 * .7]); R.ancla('numB', [sx - 5, sy - B.e / 2, sz - 7.2]);
  R.ancla('alambre', fw(.2)); R.ancla('tornillo', [bx - 4, by - 3, 9]); R.ancla('tapaB', [bx - 25, by - 20, 4]); R.ancla('orejaB', [bx + 16, by - 1.5, 13]);
}
