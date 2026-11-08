/* nelec_util.mjs · modelos 3D del grupo «nelec» con la geometría de perfiles_nelec.mjs (la misma del plano).
 * Usa las piezas de otros grupos sin modificarlas (bpn.mjs, protab_*.mjs, cables.mjs). Ejes: z arriba, mm. */
import { BPN4, BPN10, BPN16, SEP4, SEP16, TAPA10, ANI, SPAG, FICHA, SONOFF, SMATE, rect } from './perfiles_nelec.mjs';
import { MX, tubo, hexa } from './protab_util.mjs';
import { loft } from './conex.mjs';

/* ===================== BORNES BPN (paramétrico: T = BPN4 / BPN10 / BPN16) ===================== */
export function borneT(R, x0, color, T, op = {}) {
  const g = R.grupo(op.padre), pa = R.M.pa(color), cv = T.cavidades, P = T.paso;
  const bajo = c => c.map(([y, z]) => [y, Math.min(z, T.A * .72)]);
  R.perfil(T.contorno, [cv.traba], T.pared + .3, pa, { a0: x0, bevel: .25, padre: g });
  let nuc = R.perfil(T.contorno, [cv.bocaI, cv.jaulaI, cv.bocaD, cv.jaulaD, cv.barra, cv.zocalo, cv.canalPuente, cv.marcado, cv.traba, bajo(cv.pozoI), bajo(cv.pozoD)],
    P - T.pared, pa, { a0: x0 + T.pared, bevel: .25, padre: g });
  const xm = x0 + T.pared + (P - T.pared) / 2, zP = T.A * .68, rp = T.pozoR;
  for (const y of T.yT) {
    const h = R.torno([xm, y, zP], [xm, y, T.A * .82], [[0, 0], [rp, 0], [rp, T.A * .1], [rp + .9, T.A * .12], [rp + .9, T.A * .14], [0, T.A * .14]], pa, { padre: null, seg: 40 });
    const r = R.restarCSG(nuc, h, pa); g.remove(nuc); g.add(r); nuc = r;
  }
  const ac = R.tipoCorte(R.M.aceroCinc(), 'metal'), cu = R.tipoCorte(R.M.cobreEst(), 'metal');
  for (const [e, i] of [[T.jaula.ext, T.jaula.int], [T.jaula.extD, T.jaula.intD]]) R.perfil(e, [i], T.jaula.x[1] - T.jaula.x[0], ac, { a0: x0 + T.jaula.x[0], bevel: .15, padre: g });
  R.perfil(T.barra.p, [], T.barra.x[1] - T.barra.x[0], cu, { a0: x0 + T.barra.x[0], bevel: .15, padre: g });
  R.perfil(T.zocaloP.p, [], T.zocaloP.x[1] - T.zocaloP.x[0], cu, { a0: x0 + T.zocaloP.x[0], bevel: .1, padre: g });
  for (const y of T.yT) R.tornillo([xm, y, T.tornillo.zCab], [0, 0, 1], { M: T.tornillo.M, L: T.tornillo.L, dk: T.tornillo.dk, k: T.tornillo.k, tipo: 'combi', giro: op.giro || 30, mat: ac, padre: g });
  if (op.texto !== false) {
    const s = Math.min(1, P / 8.2) * 1.4;
    R.texto(T.txt, [xm, T.C + .02, T.A * .47], [-1, 0, 0], [0, 0, 1], pa, { size: s, prof: .2, padre: g });
    R.texto('800V', [xm, T.C + .02, T.A * .37], [-1, 0, 0], [0, 0, 1], pa, { size: s * .8, prof: .2, padre: g });
  }
  if (op.marca) {
    const [y0, y1] = [T.marcado[0][0], T.marcado[1][0]], zt = T.marcado[2][1];
    R.caja(x0 + 1.1, x0 + P - .4, y0 + .3, y1 - .3, zt - 1, zt, R.M.pa('#f6f6f2', { roughness: .5 }), { r: .2, padre: g });
    R.impreso([op.marca], P - 2, y1 - y0 - 1, [x0 + .35 + P / 2, (y0 + y1) / 2, zt + .01], [0, 1, 0], [-1, 0, 0], { px: 3.4, padre: g });
  }
  g.userData = { x0, xm, T }; return g;
}
export function placaT(R, x0, S, color, op = {}) { return R.perfil(S.contorno, [], S.esp, R.M.pa(color), { a0: x0, bevel: .3, padre: op.padre }); }
export function rielT(R, x0, x1, T, op = {}) {                 // riel NS35 bajo el borne (alas en z = 0) sin ranuras (rápido)
  const y0 = T.riel.y0, z0 = T.riel.z0, per = [[0, 7.5], [0, 6.5], [4, 6.5], [4, 0], [31, 0], [31, 6.5], [35, 6.5], [35, 7.5], [30, 7.5], [30, 1], [5, 1], [5, 7.5]].map(([u, v]) => [y0 + u, z0 + v]);
  return R.perfil(per, [], x1 - x0, R.tipoCorte(R.M.aceroCinc(), 'metal'), { a0: x0, bevel: .12, padre: op.padre });
}
/** cable con puntera que entra por la boca (lado 'I' y = 0 / 'D' y = C). colores [aislación, raya] */
export function cableT(R, xc, lado, colores, T, op = {}) {
  const g = R.grupo(op.padre), z = T.puntera.zEje, L = op.largo || 30, s = lado === 'I' ? -1 : 1, yB = lado === 'I' ? 0 : T.C;
  const rc = op.rc || (T.paso > 10 ? 2.5 : T.paso < 7 ? 1.4 : 1.8), ra = op.ra || rc + 1.0;
  const yIn = lado === 'I' ? T.yT[0] - 1 : T.yT[1] + 1, y1 = yB + s * 2.2;
  R.cil([xc, yIn, z], [xc, y1, z], rc, R.tipoCorte(R.M.cobreEst(), 'metal'), { padre: g });
  R.torno([xc, y1, z], [xc, y1 + s * 7, z], [[rc, 0], [ra + .4, 0], [ra + .8, .6], [ra + .8, 6.2], [ra + .4, 7], [rc, 7]], R.M.pa(op.collar || '#7b8288', { roughness: .45 }), { padre: g });
  const p0 = [xc, y1 + s * 6.8, z], p1 = [xc, y1 + s * (6.8 + L), z];
  R.cil(p0, p1, ra, R.M.cable(colores[0]), { padre: g, seg: 40 });
  if (colores[1]) for (const a0 of [10, 190]) {
    const m = R.cil(p0, p1, ra + .05, R.M.cable(colores[1]), { padre: g, seg: 40, abierto: true });
    m.geometry.dispose(); m.geometry = new R.THREE.CylinderGeometry(ra + .05, ra + .05, L, 24, 1, true, a0 * Math.PI / 180, 75 * Math.PI / 180).rotateX(Math.PI / 2).translate(0, 0, L / 2);
  }
  R.cil([xc, p1[1], z], [xc, p1[1] + s * .05, z], ra - .4, R.M.cobre(), { padre: g });
  return g;
}

/* ===================== IDENTIFICACIÓN ===================== */
/** anillo marcador abierto sobre un cable de eje x (centro en c = [x, y, z]). A = ANI.a25 / a6. letra impresa arriba */
export function anillo(R, c, A, color, op = {}) {
  const T = R.THREE, g = R.grupo(op.padre);
  const a0 = (270 + A.abre / 2) * Math.PI / 180, a1 = (270 + 360 - A.abre / 2) * Math.PI / 180;   // la abertura mira abajo (−z)… gira con op.giro
  const s = new T.Shape(), N = 48;
  for (let i = 0; i <= N; i++) { const a = a0 + (a1 - a0) * i / N; (i ? s.lineTo : s.moveTo).call(s, A.re * Math.cos(a), A.re * Math.sin(a)); }
  for (let i = N; i >= 0; i--) { const a = a0 + (a1 - a0) * i / N; s.lineTo(A.ri * Math.cos(a), A.ri * Math.sin(a)); }
  const geo = new T.ExtrudeGeometry(s, { depth: A.L, bevelEnabled: true, bevelThickness: .25, bevelSize: .2, bevelSegments: 2, curveSegments: 24 }); geo.deleteAttribute('uv');
  geo.translate(0, 0, -A.L / 2);
  // ejes: extrusión (z local) → x del mundo; la abertura (−y local tras girar) mira hacia −z
  geo.applyMatrix4(new T.Matrix4().makeBasis(new T.Vector3(0, 1, 0), new T.Vector3(0, 0, 1), new T.Vector3(1, 0, 0)));
  const m = new T.Mesh(geo, R.M.pa(color, { roughness: .4, clearcoat: .3 })); m.castShadow = m.receiveShadow = true;
  m.position.set(...c); if (op.giro) m.rotation.x = op.giro * Math.PI / 180; g.add(m);
  if (op.letra) {
    const ang = (op.angLetra ?? 0) * Math.PI / 180;
    R.texto(op.letra, [c[0], c[1] + (A.re + .02) * Math.sin(ang), c[2] + (A.re + .02) * Math.cos(ang)], [1, 0, 0], [0, Math.cos(ang), -Math.sin(ang)], R.M.tinta('#1b1c1f'), { size: A.letraH, prof: .12, padre: g });
  }
  return g;
}
/** tramo de termocontraíble (tubo con espesor) de eje x: D exterior, e pared, de x0 a x1 */
export function spaghetti(R, x0, x1, y, z, D, e, color, op = {}) {
  const g = R.grupo(op.padre), ro = D / 2, ri = ro - e;
  R.torno([x0, y, z], [x1, y, z], [[ri, 0], [ro, 0], [ro, x1 - x0], [ri, x1 - x0]], R.M.pa(color, { roughness: .35, clearcoat: .5 }), { padre: g, seg: 64 });
  return g;
}

/* ===================== FICHAS IRAM 2073 ===================== */
const rr = (W, H, r, n = 10) => { const p = []; for (const [cx, cy, a0] of [[W / 2 - r, H / 2 - r, 0], [-W / 2 + r, H / 2 - r, 90], [-W / 2 + r, -H / 2 + r, 180], [W / 2 - r, -H / 2 + r, 270]]) for (let i = 0; i <= n; i++) { const a = (a0 + 90 * i / n) * Math.PI / 180; p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return p; };
/** perfil de una pata plana (en el plano x,z del frente) girada ang alrededor de su centro */
const pataXZ = (cx, cz, a, e, ang) => { const c = Math.cos(ang), s = Math.sin(ang); return [[-e / 2, -a / 2], [e / 2, -a / 2], [e / 2, a / 2], [-e / 2, a / 2]].map(([u, v]) => [cx + u * c - v * s, cz + u * s + v * c]); };
export function pataPos(F) {   // centros y ángulos de las 3 patas en el frente (x, z); la tierra abajo (tipo I / IRAM 2073: L y N invertidos respecto de AS/NZS)
  const p = F.pata, t = F.tierra, a = p.ang * Math.PI / 180;
  return [{ n: 'L', x: -p.cx, z: p.cz, ang: -a, a: p.a, e: p.e, L: p.L }, { n: 'N', x: p.cx, z: p.cz, ang: a, a: p.a, e: p.e, L: p.L }, { n: 'T', x: 0, z: t.cz, ang: Math.PI / 2, a: t.a, e: t.e, L: t.L }];
}
/** ficha macho: cuerpo (eje y: el frente en y = 0 mira a −y; el cable sale por +y), patas de latón, bornes, prensacable. op.cortar */
export function fichaMacho(R, F, op = {}) {
  const T = R.THREE, X = MX(R), g = R.grupo(op.padre), C = F.cuerpo, col = op.color || '#f1f0ea';
  const pa = R.M.pa(col, { roughness: .45, clearcoat: .2 });
  // cuerpo: frente rectangular redondeado que se afina hacia el cable (loft simple en 3 tramos)
  const secs = [[0, 1], [C.frente, 1], [C.L * .55, .94], [C.L * .82, .72], [C.L, .52]];
  const gl = R.grupo(g); gl.rotation.z = Math.PI / 2;
  loft(R, secs.map(([y, k]) => ({ x: y, pts: rr(C.W * k, C.H * k, Math.min(C.r * k, C.H * k / 2 - .1)) })), pa, { padre: gl });
  // tapa del frente (con las 3 patas pasantes) y tapa de atrás
  R.perfil(rr(C.W, C.H, C.r), [], 2, pa, { A: [0, 1, 0], B: [1, 0, 0], C: [0, 0, 1], o: [0, 0, 0], bevel: .8, padre: g });
  // texto en relieve en el frente
  R.texto(`${F.I}A 250V`, [0, -.05, -C.H * .36], [1, 0, 0], [0, 0, 1], pa, { size: 2.2, prof: .2, padre: g });
  R.texto('IRAM 2073', [0, -.05, C.H * .36], [1, 0, 0], [0, 0, 1], pa, { size: 2.0, prof: .2, padre: g });
  // patas planas de latón (salen del frente hacia −y) + bornes con tornillo adentro
  const lat = X.laton(), ac = X.galv();
  for (const p of pataPos(F)) {
    const per = pataXZ(p.x, p.z, p.a, p.e, p.ang);
    R.perfil(per, [], p.L + 14, lat, { A: [0, -1, 0], B: [1, 0, 0], C: [0, 0, 1], o: [0, 14, 0], bevel: .25, padre: g });
    R.caja(p.x - 3.2, p.x + 3.2, 14, 22, p.z - 3.2, p.z + 3.2, lat, { r: .5, padre: g });
    R.tornillo([p.x, 18, p.z + 3.4], [0, 0, 1], { M: 3, L: 4, dk: 5.2, k: 1.8, tipo: 'combi', mat: ac, padre: g });
  }
  // grampa del cable (2 tornillos) y cable de 3 conductores
  const yG = C.L * .7;
  R.caja(-C.W * .3, C.W * .3, yG - 3, yG + 3, F.cable.D / 2 - .2, F.cable.D / 2 + 2.6, R.M.pa('#d8d6cf'), { r: .6, padre: g });
  for (const sx of [-1, 1]) R.tornillo([sx * C.W * .22, yG, F.cable.D / 2 + 2.7], [0, 0, 1], { M: 2.5, L: 4, dk: 4.4, k: 1.6, tipo: 'pozi', mat: ac, padre: g });
  const yC = C.L + (op.cable ?? 60);
  R.cil([0, C.L * .55, 0], [0, yC, 0], F.cable.D / 2, R.M.cable(op.vaina || '#1d1e21'), { padre: g, seg: 48 });
  // conductores dentro hasta cada borne
  const cols = { L: '#6e3b1d', N: '#2f86c9', T: '#2f9a3e' };
  for (const p of pataPos(F)) tubo(R, [[0, C.L * .58, 0], [p.x * .5, C.L * .45, p.z * .5], [p.x, 24, p.z]], 1.25, R.M.cable(cols[p.n]), { padre: g, radial: 12 });
  g.updateMatrixWorld(true);
  if (op.cortar) R.cortar(g, op.cortar);
  return g;
}
/** ficha hembra (prolongador): cuerpo con 3 ranuras en el frente (y = 0) y contactos a resorte de latón adentro */
export function fichaHembra(R, H, F, op = {}) {
  const T = R.THREE, X = MX(R), g = R.grupo(op.padre), C = H.cuerpo, pa = R.M.pa(op.color || '#f1f0ea', { roughness: .45, clearcoat: .2 });
  const ran = pataPos(F).map(p => pataXZ(p.x, p.z, p.a + 1.2, p.e + 1.0, p.ang));
  R.perfil(rr(C.W, C.H, C.r), ran, C.frente, pa, { A: [0, 1, 0], B: [1, 0, 0], C: [0, 0, 1], o: [0, 0, 0], bevel: .9, padre: g });
  R.torno([0, C.frente - .1, 0], [0, C.L, 0], [[0, 0], [C.W * .4, 0], [C.W * .41, C.L * .35], [C.W * .33, C.L * .75], [F.cable.D / 2 + 1.8, C.L - C.frente], [0, C.L - C.frente]], pa, { padre: g, seg: 64 });
  // fondo oscuro de las ranuras + contactos
  for (const p of pataPos(F)) {
    R.perfil(pataXZ(p.x, p.z, p.a + 1.2, p.e + 1.0, p.ang), [], .6, R.M.oscuro(), { A: [0, 1, 0], B: [1, 0, 0], C: [0, 0, 1], o: [0, C.frente + .2, 0], bevel: 0, padre: g });
    R.perfil(pataXZ(p.x, p.z, p.a, 1.0, p.ang), [], 12, X.laton(), { A: [0, 1, 0], B: [1, 0, 0], C: [0, 0, 1], o: [0, C.frente + 1, 0], bevel: .2, padre: g });
  }
  R.texto(`${H.I}A 250V`, [0, -.05, -C.H * .38], [1, 0, 0], [0, 0, 1], pa, { size: 2.2, prof: .2, padre: g });
  R.cil([0, C.L - 2, 0], [0, C.L + (op.cable ?? 50), 0], F.cable.D / 2, R.M.cable(op.vaina || '#1d1e21'), { padre: g, seg: 48 });
  g.updateMatrixWorld(true);
  if (op.cortar) R.cortar(g, op.cortar);
  return g;
}

/* ===================== COMANDO: Sonoff MINI R4 y S-MATE ===================== */
export function cajaBornes(R, D, op = {}) {     // caja de PC blanca W × P × H (z arriba) con la bornera en un lado (−y) y leyendas
  const g = R.grupo(op.padre), pa = R.M.pa(op.color || '#f4f4f0', { roughness: .4, clearcoat: .3 }), X = MX(R);
  const W = D.W, P = D.P, H = D.H;
  R.caja(-W / 2, W / 2, -P / 2, P / 2, 0, H, pa, { r: 3, padre: g });
  const n = D.bornes.length, paso = Math.min(5.0, (W - 6) / n), x0 = -paso * (n - 1) / 2;
  D.bornes.forEach((b, i) => {
    const x = x0 + i * paso;
    R.caja(x - paso / 2 + .35, x + paso / 2 - .35, -P / 2 - .2, -P / 2 + 3, 1.2, H * .55, R.M.oscuro(), { r: .2, padre: g });     // boca del borne
    R.cil([x, -P / 2 + 4, H * .55], [x, -P / 2 + 4, H + .05], 1.6, R.M.oscuro(), { padre: g, seg: 20 });                          // pozo del tornillo
    R.tornillo([x, -P / 2 + 4, H - 1.2], [0, 0, 1], { M: 2.5, L: 2, dk: 3.4, k: 1.2, tipo: 'combi', mat: X.galv(), padre: g });
    R.impreso([b], paso + .4, 2.4, [x, -P / 2 + 8.4, H + .02], [1, 0, 0], [0, 1, 0], { px: 13, padre: g, color: '#30343a', peso: 700 });
  });
  if (op.marca) R.impreso(op.marca, W * .7, P * .42, [0, P * .12, H + .02], [1, 0, 0], [0, 1, 0], { px: op.px || 30, padre: g, color: '#1b1c1f', peso: 700 });
  if (op.boton) { R.cil([W * .32, P * .3, H - .5], [W * .32, P * .3, H + .8], 2.2, R.M.pa('#c9c9c4'), { padre: g, seg: 24 }); R.cil([W * .32 - 6, P * .3, H], [W * .32 - 6, P * .3, H + .2], 1.0, R.M.pa('#2f9e44', { roughness: .2 }), { padre: g, seg: 16 }); }
  return g;
}
