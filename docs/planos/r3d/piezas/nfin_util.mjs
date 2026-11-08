/* nfin_util.mjs · piezas 3D del grupo «nfin»: precinto de cola numerado (9015), precinto de rotor con alambre (9019).
 * Importa barrido de pat.mjs sin modificarlo. Números: perfiles_nfin.mjs. */
import { PTAPA, PBORN } from './perfiles_nfin.mjs';
import { barrido } from './pat.mjs';

export function matsN(R) {
  if (R._mn) return R._mn;
  const M = {
    pp: R.tipoCorte(R.M.pa(PTAPA.color, { roughness: .5, clearcoat: .15 }), 'plastico'),
    pc: (() => { const m = R.M.lente('#dfe9ee'); m.opacity = .42; m.roughness = .08; m.depthWrite = false; return m; })(),
    rotor: R.tipoCorte(R.M.pa(PBORN.rotor, { roughness: .45 }), 'plastico'),
    inox: R.tipoCorte(new R.THREE.MeshPhysicalMaterial({ color: '#d4d8dc', metalness: 1, roughness: .25 }), 'metal'),
    galv: R.tipoCorte(R.M.aceroCinc(), 'metal'),
    chapa: R.tipoCorte(R.M.pa('#b9bec4', { metalness: .6, roughness: .45 }), 'metal'),
    tablero: R.tipoCorte(R.M.pa('#d8d9d6', { roughness: .55 }), 'plastico'),
  };
  R._mn = M; return M;
}

/** cola dentada recta (torno con dientes de sierra) de x0 a x1 sobre y = y0, z = zc */
export function colaRecta(R, x0, x1, y0, zc, mat, op = {}) {
  const P = PTAPA, r = P.w / 2, pf = [[0, 0]];
  for (let t = 1; t < x1 - x0 - 12; t += P.dentP) pf.push([r - P.dentH, t], [r, t + P.dentP * .8], [r - P.dentH, t + P.dentP * .8 + .01]);
  pf.push([r - P.dentH, x1 - x0 - 12], [r * .45, x1 - x0 - .6], [0, x1 - x0]);
  return R.torno([x0, y0, zc], [x1, y0, zc], pf, mat, { seg: 20, padre: op.padre });
}

/** precinto 9015 abierto, acostado (plano x-y), bandera en x ∈ [x0, x0 + 25] */
export function precintoTapa(R, x0, y0, op = {}) {
  const P = PTAPA, M = matsN(R), g = R.grupo(op.padre), [bw, bh, be] = P.band, [tx, tz, ty] = P.traba;
  R.caja(x0, x0 + bw, y0 - bh / 2, y0 + bh / 2, 0, be, M.pp, { r: 1.2, padre: g });
  R.impreso([P.num], bw * .9, 8, [x0 + bw / 2, y0 - 3, be + .02], [1, 0, 0], [0, 1, 0], { color: '#ffffff', px: 7, peso: 700, padre: g });
  R.impreso(['SEGURIDAD'], bw * .9, 5, [x0 + bw / 2, y0 + 6.5, be + .02], [1, 0, 0], [0, 1, 0], { color: '#ffffff', px: 3.6, padre: g });
  // traba: bloque con el paso de la cola (agujero en z)
  R.perfil([[x0 + bw - .5, y0 - ty / 2], [x0 + bw + tx, y0 - ty / 2], [x0 + bw + tx, y0 + ty / 2], [x0 + bw - .5, y0 + ty / 2]],
    [[[x0 + bw + tx / 2 - P.w / 2 - .2, y0 - P.w / 2 - .2], [x0 + bw + tx / 2 + P.w / 2 + .2, y0 - P.w / 2 - .2], [x0 + bw + tx / 2 + P.w / 2 + .2, y0 + P.w / 2 + .2], [x0 + bw + tx / 2 - P.w / 2 - .2, y0 + P.w / 2 + .2]]],
    tz, M.pp, { A: [0, 0, 1], B: [1, 0, 0], C: [0, 1, 0], o: [0, 0, 0], bevel: .3, padre: g });
  colaRecta(R, x0 + bw + tx - .3, x0 + bw + tx + P.L, y0, P.w / 2 + .2, M.pp, { padre: g });
  return g;
}

/** cuerpo del precinto de rotor 9019 con el eje en +y (cara del número hacia −y), centro c */
export function precintoRotor(R, c, op = {}) {
  const P = PBORN, M = matsN(R), g = R.grupo(op.padre), [x, y, z] = c, r = P.D / 2;
  // carcasa transparente (cilindro hueco) y rotor rojo adentro
  R.torno([x, y - P.e / 2, z], [x, y + P.e / 2, z], [[r - 1.2, 0], [r - .4, 0], [r, .4], [r, P.e - .4], [r - .4, P.e], [P.rotD / 2 + .3, P.e], [P.rotD / 2 + .3, .8], [r - 1.2, .8]], M.pc, { seg: 64, padre: g });
  R.cil([x, y - P.e / 2 + .6, z], [x, y + P.e / 2 + P.rotE, z], P.rotD / 2, M.rotor, { seg: 48, padre: g });
  R.caja(x - P.ala[0] / 2, x + P.ala[0] / 2, y + P.e / 2 + P.rotE - .2, y + P.e / 2 + P.rotE + P.ala[2], z - P.ala[1] / 2, z + P.ala[1] / 2, M.rotor, { r: .8, padre: g });
  // carrete con alambre enrollado (se ve por el policarbonato)
  R.torno([x, y - P.e / 2 + 1.2, z], [x, y + P.e / 2 - 1.2, z], [[3, 0], [P.rotD / 2 - 1.5, 0], [P.rotD / 2 - 1.5, P.e - 2.4], [3, P.e - 2.4]], M.inox, { seg: 48, padre: g });
  R.impreso([P.num], 13, 5, [x, y - P.e / 2 - .05, z - 7.2], [1, 0, 0], [0, 0, 1], { color: '#1d2a3a', px: 4.2, peso: 700, padre: g });
  return g;
}

/** alambre de 2 hilos retorcidos a lo largo de f(t) */
export function alambre2(R, f, t0, t1, op = {}) {
  const T = R.THREE, M = matsN(R), r = PBORN.alD / 2, paso = op.paso || 6, n = op.n || 200;
  const L = (() => { let s = 0, p = f(t0); for (let i = 1; i <= 60; i++) { const q = f(t0 + (t1 - t0) * i / 60); s += Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]); p = q; } return s; })();
  for (const fase of [0, Math.PI]) {
    const g = (t) => { const h = (t1 - t0) * 1e-3, p = f(t), q = f(Math.min(t1, t + h)), p0 = f(Math.max(t0, t - h)), tg = new T.Vector3(q[0] - p0[0], q[1] - p0[1], q[2] - p0[2]).normalize();
      let nn = new T.Vector3(0, 0, 1); if (Math.abs(nn.dot(tg)) > .9) nn = new T.Vector3(1, 0, 0); nn.addScaledVector(tg, -nn.dot(tg)).normalize(); const b = new T.Vector3().crossVectors(tg, nn);
      const a = fase + 2 * Math.PI * ((t - t0) / (t1 - t0)) * L / paso; return [p[0] + r * (nn.x * Math.cos(a) + b.x * Math.sin(a)), p[1] + r * (nn.y * Math.cos(a) + b.y * Math.sin(a)), p[2] + r * (nn.z * Math.cos(a) + b.z * Math.sin(a))]; };
    barrido(R, g, t0, t1, r, M.inox, { n, na: 8, padre: op.padre });
  }
}
export { PTAPA, PBORN };
