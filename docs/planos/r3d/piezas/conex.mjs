/* conex.mjs · modelos 3D del grupo «conex» (punteras, terminales, empalmes, prensacables, riel, cable canal).
 * Toda la geometría sale de perfiles_conex.mjs (la misma que dibuja el plano). Eje de las piezas «largas»: +x. z arriba. */
import { CABLE, COLOR, TIF, TIFD, collarTIF, engarceTIF, OJAL, PREAIS, PALA, TERMO, UNION, RESINA, WAGO, TERMOJ, GEL, QR23, PRENSA, NS, perfilNS, CANAL, seccionCanal, seccionTapa } from './perfiles_conex.mjs';

const TAU = Math.PI * 2;

/* ---------------- utilidades ---------------- */
/** centros de n hilos de Ø d empaquetados (hexagonal) dentro de un círculo de radio Rb. Devuelve [[u, v]] */
export function empaque(n, d, Rb) {
  const pts = [], s = d * .98;
  const m = Math.ceil(Rb / s) + 2;
  for (let i = -m; i <= m; i++) for (let j = -m; j <= m; j++) {
    const u = (i + (j % 2) * .5) * s, v = j * s * .866;
    if (Math.hypot(u, v) <= Rb - d / 2 + 1e-6) pts.push([u, v]);
  }
  pts.sort((a, b) => Math.hypot(...a) - Math.hypot(...b));
  return pts.slice(0, n);
}
/** cuerda de hilos de cobre entre x0 y x1 alrededor del eje (y0, z0) a lo largo de x. op: torsion (vueltas por mm, 0 = rectos), quitar(u, v) → true omite el hilo, mat */
export function cuerda(R, x0, x1, y0, z0, n, d, Rb, op = {}) {
  const T = R.THREE, g = R.grupo(op.padre), mat = op.mat || R.M.cobre();
  const pts = empaque(n, d, Rb);
  for (const [u, v] of pts) {
    if (op.quitar && op.quitar(u, v)) continue;
    let m;
    if (op.torsion && Math.hypot(u, v) > 1e-3) {
      const r = Math.hypot(u, v), a0 = Math.atan2(v, u), L = x1 - x0;
      const cur = new (class extends T.Curve { getPoint(t, o = new T.Vector3()) { const a = a0 + TAU * op.torsion * L * t; return o.set(x0 + L * t, y0 + r * Math.cos(a), z0 + r * Math.sin(a)); } })();
      const geo = new T.TubeGeometry(cur, Math.max(8, Math.round(L * 2)), d / 2, 8, false); geo.deleteAttribute('uv');
      m = new T.Mesh(geo, mat); m.castShadow = m.receiveShadow = true; g.add(m);
      for (const t of [0, 1]) R.cil(cur.getPoint(t), cur.getPoint(t).add(cur.getTangent(t).multiplyScalar(t ? .01 : -.01)), d / 2, mat, { padre: g, seg: 8 });
    } else m = R.cil([x0, y0 + u, z0 + v], [x1, y0 + u, z0 + v], d / 2, mat, { padre: g, seg: 10 });
  }
  g.traverse(o => { if (o.isMesh) o.userData.noCortar = true; });
  return g;
}
/** cable unipolar (aislación de color) a lo largo de x, de x0 a x1; op.rayas (verde-amarillo), op.abierto */
export function aislacion(R, x0, x1, y0, z0, r, color, op = {}) {
  const g = R.grupo(op.padre);
  const ri = op.ri || 0;
  const per = ri ? [[ri, 0], [r - .12, 0], [r, .12], [r, x1 - x0 - .12], [r - .12, x1 - x0], [ri, x1 - x0]] : [[0, 0], [r - .12, 0], [r, .12], [r, x1 - x0 - .12], [r - .12, x1 - x0], [0, x1 - x0]];
  R.torno([x0, y0, z0], [x1, y0, z0], per, R.M.cable(color), { padre: g, seg: 48 });
  if (op.rayas) for (const a0 of [20, 200]) {
    const L = x1 - x0, geo = new R.THREE.CylinderGeometry(r + .02, r + .02, L - .3, 32, 1, true, a0 * Math.PI / 180, 70 * Math.PI / 180);
    geo.rotateZ(-Math.PI / 2); geo.translate(x0 + L / 2, y0, z0); geo.deleteAttribute('uv');
    const m = new R.THREE.Mesh(geo, R.M.cable(op.rayas)); m.userData.noCortar = true; g.add(m);
  }
  return g;
}
/** loft entre secciones cerradas (mismo número de puntos) ubicadas en x: secs = [{x, pts: [[y, z]...]}] (malla cerrada con tapas) */
export function loft(R, secs, mat, op = {}) {
  const T = R.THREE, n = secs[0].pts.length, pos = [], idx = [];
  for (const s of secs) for (const [y, z] of s.pts) pos.push(s.x, y, z);
  for (let i = 0; i < secs.length - 1; i++) for (let j = 0; j < n; j++) {
    const a = i * n + j, b = i * n + (j + 1) % n, c = (i + 1) * n + j, d = (i + 1) * n + (j + 1) % n;
    idx.push(a, c, b, b, c, d);
  }
  // tapas con vértices propios (normales planas)
  const cap = (i, inv) => { const base = pos.length / 3, s = secs[i]; let cy = 0, cz = 0; s.pts.forEach(([y, z]) => { cy += y / n; cz += z / n; });
    for (const [y, z] of s.pts) pos.push(s.x, y, z); pos.push(s.x, cy, cz); const c0 = base + n;
    for (let j = 0; j < n; j++) { const a = base + j, b = base + (j + 1) % n; inv ? idx.push(c0, b, a) : idx.push(c0, a, b); } };
  cap(0, false); cap(secs.length - 1, true);
  const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setIndex(idx);
  // volumen con signo → si quedó al revés, invierto los triángulos
  let vol = 0; const P = pos;
  for (let i = 0; i < idx.length; i += 3) { const [a, b, c] = [idx[i] * 3, idx[i + 1] * 3, idx[i + 2] * 3];
    vol += P[a] * (P[b + 1] * P[c + 2] - P[b + 2] * P[c + 1]) - P[a + 1] * (P[b] * P[c + 2] - P[b + 2] * P[c]) + P[a + 2] * (P[b] * P[c + 1] - P[b + 1] * P[c]); }
  if (vol < 0) { const ix = geo.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; } }
  geo.computeVertexNormals();
  const m = new T.Mesh(geo, mat); m.castShadow = m.receiveShadow = true; R.sinBorde(m); (op.padre || R.raiz).add(m); return m;
}
export const circulo = (r, n = 40, cy = 0, cz = 0) => Array.from({ length: n }, (_, i) => [cy + r * Math.cos(TAU * i / n), cz + r * Math.sin(TAU * i / n)]);
/** rectángulo redondeado muestreado con n puntos (por ángulo, para poder hacer loft con un círculo) */
export function rectRed(w, h, r, n = 40) {
  return Array.from({ length: n }, (_, i) => {
    const a = TAU * i / n, dx = Math.cos(a), dy = Math.sin(a);
    // proyección del rayo sobre el rectángulo redondeado (superelipse aproximada)
    const p = 8, k = 1 / Math.pow(Math.pow(Math.abs(dx) / (w / 2), p) + Math.pow(Math.abs(dy) / (h / 2), p), 1 / p);
    return [dx * k, dy * k];
  });
}
/** prisma hexagonal (entre caras s) a lo largo de x, con agujero redondo opcional */
export function hexX(R, x0, x1, y0, z0, s, mat, op = {}) {
  const r = s / Math.sqrt(3), pts = Array.from({ length: 6 }, (_, i) => [y0 + r * Math.cos(TAU * i / 6 + (op.giro || 0)), z0 + r * Math.sin(TAU * i / 6 + (op.giro || 0))]);
  const cav = op.agujero ? [circulo(op.agujero, 48, y0, z0)] : [];
  return R.perfil(pts, cav, x1 - x0, mat, { a0: x0, bevel: op.bevel ?? .25, padre: op.padre });
}
/** LatheGeometry con arco parcial (phiStart, phiLength en grados), eje x */
export function tornoParcial(R, x0, perfilRT, phi0, dphi, mat, op = {}) {
  const T = R.THREE;
  const g = new T.LatheGeometry(perfilRT.map(([r, t]) => new T.Vector2(Math.max(r, 1e-3), t)), op.seg || 24, phi0 * Math.PI / 180, dphi * Math.PI / 180);
  g.rotateZ(-Math.PI / 2); g.translate(x0, op.y0 || 0, op.z0 || 0); g.deleteAttribute('uv'); g.computeVertexNormals();
  const m = new T.Mesh(g, mat); m.castShadow = m.receiveShadow = true; (op.padre || R.raiz).add(m); return m;
}
/** contorno de una tira de chapa de espesor t que sigue una polilínea (para resortes) */
export function tira(pl, t) {
  const L = [], Rr = [];
  for (let i = 0; i < pl.length; i++) {
    const a = pl[Math.max(0, i - 1)], b = pl[Math.min(pl.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
    L.push([pl[i][0] + nx * t / 2, pl[i][1] + ny * t / 2]); Rr.push([pl[i][0] - nx * t / 2, pl[i][1] - ny * t / 2]);
  }
  return [...L, ...Rr.reverse()];
}

/* ---------------- puntera TIF ---------------- */
/** puntera p (de TIF) con su cable: boca del collar en x = x0, eje (y0, z0). op: crimp, cuarto (corta el cuadrante y<0,z>0), cable (largo), color ('din'|'fr'), aisl (color de la aislación), pelado (sin puntera: solo los hilos) */
export function puntera(R, p, x0, y0, z0, op = {}) {
  const g = R.grupo(op.padre), gc = R.grupo(g);
  const col = op.color === 'fr' ? p.fr : p.din;
  const { Lc, perfil } = collarTIF(p);
  const ro = p.di / 2 + p.t, ri = p.di / 2;
  const cu = R.tipoCorte(R.M.cobreEst(), 'metal');
  const pp = R.M.pvc(col, { roughness: .35 }); R.tipoCorte(pp, 'plastico');
  // collar de polipropileno
  if (!op.pelado) R.torno([x0, y0, z0], [x0 + 1, y0, z0], perfil, pp, { padre: gc, seg: 64 });
  const xt0 = x0 + Lc - 1.6, xt1 = x0 + p.L;
  const ec = engarceTIF(p);
  if (op.crimp) {
    // tubo redondo en la zona del collar + tramo engarzado cuadrado
    const xc0 = x0 + Lc + .9, xc1 = x0 + p.L - .25;
    R.torno([xt0, y0, z0], [xt0 + 1, y0, z0], [[ri, 0], [ro, 0], [ro, xc0 - xt0], [ri, xc0 - xt0]], cu, { padre: gc, seg: 48 });
    const a = ec.lado, ai = a - 2 * p.t;
    const sq = rectRed(a, a, ec.r, 48).map(([u, v]) => [y0 + u, z0 + v]);
    const sqi = rectRed(ai, ai, ec.r * .6, 48).map(([u, v]) => [y0 + u, z0 + v]);
    // transición redondo → cuadrado
    loft(R, [{ x: xc0 - .01, pts: circulo(ro, 48, y0, z0) }, { x: xc0 + .8, pts: sq }], cu, { padre: gc });
    R.perfil(sq.map(([u, v]) => [u, v]), [sqi], xc1 - xc0 - .8, cu, { A: [1, 0, 0], B: [0, 1, 0], C: [0, 0, 1], a0: xc0 + .8, bevel: .06, padre: gc });
    R.torno([xc1, y0, z0], [xc1 + 1, y0, z0], [[0, 0], [ai / 2, 0], [ai / 2, .01], [0, .01]], R.M.cobre(), { padre: null });
    // hilos compactados: prismas hexagonales que llenan el cuadrado (cara del extremo y corte)
    const hc = R.grupo(g); const [nh] = CABLE.hilosFlex[p.sec]; const s = ai / Math.sqrt(nh * 1.15);
    const cuH = R.M.cobre();
    for (let i = -8; i <= 8; i++) for (let j = -8; j <= 8; j++) {
      const u = (i + (j % 2) * .5) * s, v = j * s * .866;
      if (Math.abs(u) > ai / 2 - s * .45 || Math.abs(v) > ai / 2 - s * .45) continue;
      if (op.cuarto && u < 0 && v > 0) continue;
      hexX(R, xc0 + .8, xc1, y0 + u, z0 + v, s * .96, cuH, { padre: hc, bevel: 0, giro: Math.PI / 6 });
    }
    hc.traverse(o => o.userData.noCortar = true);
    // hilos sueltos en la zona redonda (collar → engarce)
    const [n, d] = CABLE.hilosFlex[p.sec];
    cuerda(R, x0 + .6, xc0 + 1, y0, z0, n, d, ri - .03, { padre: g, quitar: op.cuarto ? (u, v) => u < 0 && v > 0 : null });
  } else if (!op.pelado) {
    R.torno([xt0, y0, z0], [xt0 + 1, y0, z0], [[ri, 0], [ro, 0], [ro, xt1 - xt0 - .1], [ro - .08, xt1 - xt0], [ri, xt1 - xt0]], cu, { padre: gc, seg: 48 });
    const [n, d] = CABLE.hilosFlex[p.sec];
    if (op.cable !== 0) cuerda(R, x0 + .6, xt1 + (op.sobresale || 0), y0, z0, n, d, ri - .03, { padre: g, quitar: op.cuarto ? (u, v) => u < 0 && v > 0 : null });
  }
  // cable: aislación que entra al collar
  const ra = Math.min(CABLE.uni[p.sec] / 2, perfil[0][0] - .03);
  const Lcab = op.cable ?? 14;
  if (Lcab > 0) {
    aislacion(R, x0 - Lcab, x0 + .6, y0, z0, ra, op.aisl || '#2a2b2f', { padre: g, rayas: op.rayas });
    const [n, d] = CABLE.hilosFlex[p.sec];   // punta cortada del cable: se ven los hilos
    cuerda(R, x0 - Lcab - .12, x0 - Lcab + .5, y0, z0, n, d, ra * .64, { padre: g });
  }
  if (op.pelado) {   // sólo el cable pelado (antes de poner la puntera)
    const [n, d] = CABLE.hilosFlex[p.sec];
    cuerda(R, x0 + .6, x0 + .6 + p.L2, y0, z0, n, d, ra * .62, { padre: g, torsion: 1 / 18 });
  }
  if (op.cuarto) R.cortar(gc, [x0 - 1, x0 + p.L + 1, y0 - 20, y0, z0, z0 + 20]);
  g.userData.ancla = { collar: [x0 + Lc * .45, y0, z0 + p.D2 / 2], tubo: [x0 + p.L - 2, y0, z0 + ro], boca: [x0 + p.L, y0, z0] };
  return g;
}

/* ---------------- terminal tubular de ojal Cu estañado ---------------- */
/** ojal sobre el eje x: boca del barril en x0. op: crimp (hex), cuarto, cable (largo de la aislación), color, conductor (mm²) */
export function ojalCu(R, x0, y0, z0, op = {}) {
  const O = OJAL, g = R.grupo(op.padre), gc = R.grupo(g);
  const cu = R.tipoCorte(R.M.cobreEst(), 'metal');
  const re = O.De / 2, ri = O.d / 2, xb = x0 + O.Lb, xp = x0 + O.Lb + O.trans;
  // barril (con chaflán en la boca y fondo cerrado)
  if (op.crimp) {
    const h0 = x0 + 3.5, h1 = h0 + O.hexL * 2 + 1.5;
    R.torno([x0, y0, z0], [x0 + 1, y0, z0], [[ri + .5, 0], [re - .3, 0], [re, .3], [re, h0 - x0], [ri, h0 - x0]], cu, { padre: gc, seg: 64 });
    // dos engarces hexagonales con un escalón entre ellos
    const rh = O.hexEntre / Math.sqrt(3);
    for (const [a, b] of [[h0, h0 + O.hexL], [h0 + O.hexL + 1.5, h1]]) {
      const hx = Array.from({ length: 6 }, (_, i) => [y0 + rh * Math.cos(TAU * i / 6), z0 + rh * Math.sin(TAU * i / 6)]);
      R.perfil(hx, [], b - a, cu, { a0: a, bevel: .3, padre: gc });
    }
    R.torno([h0 + O.hexL, y0, z0], [h0 + O.hexL + 1, y0, z0], [[ri, 0], [re - .4, 0], [re - .4, 1.5], [ri, 1.5]], cu, { padre: gc, seg: 48 });
    R.torno([h1, y0, z0], [h1 + 1, y0, z0], [[0, 0], [re, 0], [re, xb - h1], [0, xb - h1]], cu, { padre: gc, seg: 64 });
  } else {
    R.torno([x0, y0, z0], [x0 + 1, y0, z0], [[ri + .5, 0], [re - .3, 0], [re, .3], [re, O.Lb], [0, O.Lb], [0, O.Lb - 1.2], [ri, O.Lb - 1.6], [ri, .5]], cu, { padre: gc, seg: 64 });
  }
  // transición aplastada: círculo → rectángulo redondeado (palma)
  const secs = [];
  for (let i = 0; i <= 6; i++) { const t = i / 6, w = re + (O.W * .62 / 2 - re) * t, h = re + (O.e / 2 - re) * t;
    secs.push({ x: xb - .01 + t * O.trans, pts: rectRed(2 * w, 2 * h, Math.min(w, h) * (1 - t) + .4 * t, 48).map(([u, v]) => [y0 + u, z0 + v]) }); }
  loft(R, secs, cu, { padre: gc });
  // palma con el agujero
  const xc = x0 + O.L - O.W / 2, Wm = O.W * .62 / 2, pal = [];
  pal.push([xp - .02, -Wm]);
  for (let i = 0; i <= 24; i++) { const a = -Math.PI / 2 + Math.PI * i / 24; pal.push([xc + O.W / 2 * Math.cos(a), O.W / 2 * Math.sin(a)]); }
  pal.push([xp - .02, Wm]);
  // pasa a (y, x) → perfil en el plano xy extruido en z
  const palma = R.perfil(pal.map(([x, y]) => [x, y0 + y]), [circulo(O.hole / 2, 48, xc, y0)], O.e, cu, { A: [0, 0, 1], B: [1, 0, 0], C: [0, 1, 0], o: [0, 0, z0 - O.e / 2], bevel: .25, padre: gc });
  // conductor rígido 16 mm² (7 hilos) + aislación
  const [n, d] = CABLE.hilosRig[16];
  if (op.cable !== 0 && op.cable !== undefined) {
    cuerda(R, x0 - 3, x0 + O.Lb - 1.4, y0, z0, n, d, ri - .02, { padre: g, torsion: 0, quitar: op.cuarto ? (u, v) => u < -.01 && v > .01 : null });
    aislacion(R, x0 - op.cable, x0 - 3, y0, z0, CABLE.uni[16] / 2, op.color || COLOR.L1, { padre: g });
  }
  if (op.cuarto) R.cortar(gc, [x0 - 1, xb + .02, y0 - 20, y0, z0, z0 + 20]);
  g.userData.ancla = { barril: [x0 + 2, y0, z0 + re], palma: [xp + 3, y0 + Wm, z0 + O.e / 2], agujero: [xc, y0 - O.hole / 2, z0 + O.e / 2] };
  return g;
}

/* ---------------- terminal preaislado de ojal (o de pala) ---------------- */
export function preaislado(R, x0, y0, z0, col, op = {}) {
  const P = PREAIS, g = R.grupo(op.padre), gc = R.grupo(g);
  const cu = R.tipoCorte(R.M.cobreEst(), 'metal');
  const ins = R.tipoCorte(R.M.pvc(col, { roughness: .32, clearcoat: .4 }), 'plastico');
  const xm0 = x0, xb0 = x0 + P.mangL - P.barrilL - .4, xb1 = xb0 + P.barrilL, xn = xb1 + P.cuello;
  // barril de cobre estañado (costura soldada) — tubo
  const rb = P.barrilDe / 2, rbi = P.barrilDi / 2;
  R.torno([xb0, y0, z0], [xb0 + 1, y0, z0], [[rbi, 0], [rb, 0], [rb, P.barrilL], [rbi, P.barrilL]], cu, { padre: gc, seg: 48 });
  // manguito interior de cobre (agarra la aislación)
  R.torno([xm0 + 1.2, y0, z0], [xm0 + 2.2, y0, z0], [[P.mangDi / 2 - .3, 0], [P.mangDi / 2, 0], [P.mangDi / 2, xb0 - xm0 - 1.6], [P.mangDi / 2 - .3, xb0 - xm0 - 1.6]], R.tipoCorte(R.M.cobre(), 'metal'), { padre: gc, seg: 48 });
  // manguito aislante (PVC de color) con embudo de entrada
  const Rm = P.mangDe / 2, Ri = P.mangDi / 2;
  let man = R.torno([xm0, y0, z0], [xm0 + 1, y0, z0], [[Ri + .7, 0], [Rm - .3, 0], [Rm, .4], [Rm, P.mangL - 2], [rb + .6, P.mangL], [rb + .05, P.mangL], [rb + .05, P.mangL - P.barrilL + .2], [Ri + .05, P.mangL - P.barrilL - .2], [Ri + .05, 1.4]], ins, { padre: gc, seg: 64 });
  // engarce: dos marcas (arriba y abajo) que hunden el manguito y el barril
  if (op.crimp) for (const s of [1, -1]) {
    const die = R.caja(xb0 + 1.6, xb0 + 6.6, y0 - 4.2, y0 + 4.2, z0 + s * (rb + .2) - (s > 0 ? 0 : 3), z0 + s * (rb + .2) + (s > 0 ? 3 : 0), ins, { r: 1, padre: null });
    for (const k of [...gc.children]) { if (!k.isMesh || k.material === cu || k === undefined) continue; }
    const nm = R.restarCSG(man, die, R.M.corte(ins)); gc.remove(man); gc.add(nm); man = nm;
  }
  // cuello + palma (ojal o pala) de chapa
  const t = P.t, xc = x0 + P.L - P.Dr / 2;
  const cue = [[xb1 - .4, -rb * .8], [xn, -P.Dr * .26], [xn, P.Dr * .26], [xb1 - .4, rb * .8]];
  R.perfil(cue.map(([x, y]) => [x, y0 + y]), [], t, cu, { A: [0, 0, 1], B: [1, 0, 0], C: [0, 1, 0], o: [0, 0, z0 - rb], bevel: .12, padre: gc });
  if (op.pala) {
    const L = x0 + P.L, w = PALA.W / 2, s = PALA.ranura / 2;
    const pal = [[xn - .02, -P.Dr * .26], [xn + 2, -w], [L - .6, -w], [L, -w + .6], [L, -s - .2], [xn + 7, -s], [xn + 6.2, 0], [xn + 7, s], [L, s + .2], [L, w - .6], [L - .6, w], [xn + 2, w], [xn - .02, P.Dr * .26]];
    R.perfil(pal.map(([x, y]) => [x, y0 + y]), [], t, cu, { A: [0, 0, 1], B: [1, 0, 0], C: [0, 1, 0], o: [0, 0, z0 - rb], bevel: .12, padre: gc });
  } else {
    const pal = [[xn - .02, -P.Dr * .26]];
    for (let i = 0; i <= 32; i++) { const a = -Math.PI * .62 + Math.PI * 1.24 * i / 32; pal.push([xc + P.Dr / 2 * Math.cos(a), P.Dr / 2 * Math.sin(a)]); }
    pal.push([xn - .02, P.Dr * .26]);
    R.perfil(pal.map(([x, y]) => [x, y0 + y]), [circulo(P.dr / 2, 48, xc, y0)], t, cu, { A: [0, 0, 1], B: [1, 0, 0], C: [0, 1, 0], o: [0, 0, z0 - rb], bevel: .12, padre: gc });
    if (op.leyenda) R.texto(op.leyenda, [xc - P.Dr * .02, y0 + P.Dr * .36, z0 - rb + t + .01], [1, 0, 0], [0, 1, 0], cu, { size: .9, prof: .06, padre: g });
  }
  // cable
  if (op.cable) {
    const sec = op.sec || 4, [n, d] = CABLE.hilosFlex[sec] || CABLE.hilosFlex[4];
    cuerda(R, xm0 + 1, xb1 - .2, y0, z0, n, d, Math.min(rbi - .03, Math.sqrt(sec / Math.PI) * 1.08), { padre: g, quitar: op.cuarto ? (u, v) => u < 0 && v > 0 : null });
    aislacion(R, xm0 - op.cable, xm0 + 3.2, y0, z0, Math.min(CABLE.uni[sec] / 2, Ri - .05), op.aisl || COLOR.L2, { padre: g });
  }
  if (op.cuarto) R.cortar(gc, [x0 - 1, xb1 + .1, y0 - 20, y0, z0, z0 + 20]);
  g.userData.ancla = { manguito: [xm0 + 4, y0, z0 + Rm], barril: [xb0 + 4, y0 - .2, z0 + rb], palma: [xc, y0 + P.Dr / 2 * .7, z0 - rb + t], agujero: [xc, y0, z0 - rb + t] };
  return g;
}

/* ---------------- termocontraíble (antes / después) ---------------- */
export function termoTubo(R, x0, x1, y0, z0, op = {}) {
  const mat = R.tipoCorte(R.M.pvc(op.color || '#26282b', { roughness: .45, clearcoat: .3 }), 'plastico');
  if (!op.sobre) return R.torno([x0, y0, z0], [x1, y0, z0], [[TERMO.Dsum / 2 - TERMO.pared0, 0], [TERMO.Dsum / 2, 0], [TERMO.Dsum / 2, x1 - x0], [TERMO.Dsum / 2 - TERMO.pared0, x1 - x0]], mat, { padre: op.padre, seg: 48 });
  // contraído sobre un perfil de radios [[r, t]] (t desde x0)
  const w = TERMO.pared, pr = op.sobre;
  const ext = pr.map(([r, t]) => [r + w, t]), int = pr.map(([r, t]) => [r + .02, t]).reverse();
  return R.torno([x0, y0, z0], [x1, y0, z0], [...ext, ...int], mat, { padre: op.padre, seg: 48 });
}

/* ---------------- unión a compresión 10 mm² (DIN 46267) ---------------- */
export function unionComp(R, x0, y0, z0, op = {}) {
  const U = UNION, g = R.grupo(op.padre), gc = R.grupo(g), cu = R.tipoCorte(R.M.cobreEst(), 'metal');
  const re = U.De / 2, ri = U.Di / 2;
  if (op.crimp) {
    const zonas = [[0, 3], [3, 10.5], [10.5, 12.5], [12.5, 17.5], [17.5, 19.5], [19.5, 27], [27, 30]];
    zonas.forEach(([a, b], i) => {
      if (i % 2) { const s = 5.2, rh = s / Math.sqrt(3); R.perfil(Array.from({ length: 6 }, (_, k) => [y0 + rh * Math.cos(TAU * k / 6), z0 + rh * Math.sin(TAU * k / 6)]), [], b - a, cu, { a0: x0 + a, bevel: .3, padre: gc }); }
      else R.torno([x0 + a, y0, z0], [x0 + b, y0, z0], [[ri, 0], [re - (a === 0 || b === U.L ? .3 : 0), 0], [re, .3], [re, b - a - .3], [re - (b === U.L ? .3 : 0), b - a], [ri, b - a]], cu, { padre: gc, seg: 48 });
    });
  } else R.torno([x0, y0, z0], [x0 + 1, y0, z0], [[ri, 0], [re - .4, 0], [re, .4], [re, U.L - .4], [re - .4, U.L], [ri, U.L]], cu, { padre: gc, seg: 64 });
  if (op.leyenda) R.impresoCil(op.leyenda, [x0 + 9, y0, z0], [x0 + 21, y0, z0], re + .01, 80, 90, { padre: g, color: '#3b3020', px: 1.3, ppm: 60 });
  if (op.cuarto) R.cortar(gc, [x0 - 1, x0 + U.L + 1, y0 - 20, y0, z0, z0 + 20]);
  return g;
}

/* ---------------- WAGO 221-2411 ---------------- */
export function wago(R, x0, y0, z0, op = {}) {
  const W = WAGO, g = R.grupo(op.padre), L = W.L, A = W.A, H = W.H;
  // carcasa transparente (policarbonato)
  const pc = new R.THREE.MeshPhysicalMaterial({ color: '#eef6fb', roughness: .08, metalness: 0, transparent: true, opacity: .26, clearcoat: 1, depthWrite: false, side: R.THREE.DoubleSide });
  const cas = R.caja(x0, x0 + L, y0 - A / 2, y0 + A / 2, z0, z0 + H, pc, { r: .8, padre: g }); cas.userData.noCortar = true;
  // bocas de entrada (cuadradas) — marco más oscuro
  for (const [x, s] of [[x0 - .01, -1], [x0 + L + .01, 1]]) R.impreso(['+'], 3.6, 3.6, [x, y0, z0 + 3.4], [0, -s, 0], [0, 0, 1], { padre: g, color: '#8aa7b8', fondo: 'rgba(160,190,205,.35)', px: .5 });
  // barra de corriente (cobre estañado) en el fondo
  const cu = R.M.cobreEst();
  R.caja(x0 + 2.2, x0 + L - 2.2, y0 - 2.2, y0 + 2.2, z0 + .9, z0 + .9 + W.barra.t * 2, cu, { r: .1, padre: g });
  // resortes (acero inoxidable) tipo «cage clamp»: tira en J
  const ac = R.M.acero();
  for (const s of [-1, 1]) {
    const xc = x0 + L / 2 + s * L / 4;
    const pl = [[-3.8, 1.4], [-3.8, 6.3], [-2.6, 7.3], [1.6, 7.3], [2.8, 6.2], [2.8, 3.6], [1.2, 2.2]].map(([u, v]) => [xc + s * u, z0 + v]);
    R.perfil(tira(pl, W.resorte.t * 1.6).map(([x, z]) => [x, z]), [], 4.2, ac, { A: [0, 1, 0], B: [1, 0, 0], C: [0, 0, 1], o: [0, y0 - 2.1, 0], bevel: .05, padre: g });
    // palanca naranja (cerrada) con bisagra
    const pa = R.M.pa('#f07d1a', { roughness: .45 });
    // bisagra del lado del centro; la palanca levanta del lado de la boca (*)
    const xp = x0 + L / 2 + s * .6, Lp = W.palanca.L;
    const ab = op.abierta && s > 0 ? W.palanca.abre : 0;
    const gp = R.grupo(g); gp.position.set(xp, y0, z0 + H - .6);
    R.caja(s < 0 ? -Lp : 0, s < 0 ? 0 : Lp, -A / 2 + .5, A / 2 - .5, -.4, W.palanca.h, pa, { r: .5, padre: gp });
    R.caja(s < 0 ? -Lp : Lp - 4, s < 0 ? -Lp + 4 : Lp, -A / 2 + .5, A / 2 - .5, W.palanca.h - .1, W.palanca.h + .6, pa, { r: .4, padre: gp });
    R.cil([0, -A / 2 + .3, 0], [0, A / 2 - .3, 0], .9, pa, { padre: gp, seg: 20 });
    gp.rotation.y = -s * ab * Math.PI / 180;
  }
  return g;
}

/* ---------------- prensacable 3/4" ---------------- */
/** dientes de rosca (anillos) para un torno: de t0 a t1, radio base rb, alto h, paso p, hacia afuera (+1) o adentro (-1) */
export function dientes(t0, t1, rb, h, p, s = 1) { const a = []; for (let t = t0; t < t1 - 1e-6; t += p) { a.push([rb, t], [rb + s * h, t + p * .5]); } a.push([rb, t1]); return a; }
export function prensacable(R, x0, op = {}) {
  const P = PRENSA, g = R.grupo(op.padre), al = R.tipoCorte(R.M.aceroCinc(), 'metal');
  const alu = R.tipoCorte(new R.THREE.MeshPhysicalMaterial({ color: '#d5d9dd', metalness: 1, roughness: .33 }), 'metal');
  const goma = R.tipoCorte(R.M.goma('#1f2124'), 'plastico');
  const pa = R.tipoCorte(R.M.pa('#2c2e31'), 'plastico');
  const ex = op.explotado || {};
  const off = k => (ex[k] || 0);
  const rr = P.rosca.D / 2, hr = .7, ri = P.cuerpo.Dint / 2;
  const parts = {};
  // cuerpo: rosca de entrada (x0-10 .. x0) + hexágono (x0+1.5 .. +8.5) + rosca de la tapa (+8.5 .. +17)
  {
    const gb = R.grupo(g); gb.position.x = off('cuerpo'); parts.cuerpo = gb;
    const pr = [[ri, -P.rosca.L], ...dientes(-P.rosca.L + .3, -.2, rr - hr, hr, P.rosca.paso).map(([r, t]) => [r, t]), [rr - hr, 0], [rr - hr, P.junta.e], [ri, P.junta.e]];
    R.torno([x0, 0, 0], [x0 + 1, 0, 0], [[ri, -P.rosca.L], [rr - hr, -P.rosca.L], [rr - .2, -P.rosca.L + .5], ...dientes(-P.rosca.L + .8, -.4, rr - hr, hr, P.rosca.paso).slice(1), [rr - hr, P.junta.e + .2], [ri, P.junta.e + .2]], alu, { padre: gb, seg: 64 });
    hexX(R, x0 + P.junta.e, x0 + P.junta.e + P.hex.L, 0, 0, P.hex.caras, alu, { padre: gb, agujero: ri, bevel: .5 });
    const rt = P.tapa.rosc / 2, h2 = .55;
    R.torno([x0 + P.junta.e + P.hex.L, 0, 0], [x0 + 20, 0, 0], [[ri, -.1], [rt - h2, -.1], ...dientes(.3, 8.2, rt - h2, h2, 1.2).slice(0), [rt - h2 - .3, 8.6], [ri + .4, 8.6], [ri, 8.2]], alu, { padre: gb, seg: 64 });
    if (op.leyenda !== false) R.texto('3/4" RE', [x0 + P.junta.e + P.hex.L / 2, 0, P.hex.caras / 2 + .01], [1, 0, 0], [0, 1, 0], alu, { size: 1.6, prof: .12, padre: gb });
  }
  const xh1 = x0 + P.junta.e + P.hex.L;   // fin del hexágono
  // junta plana (goma) bajo el hexágono
  { const gj = R.grupo(g); gj.position.x = off('junta'); parts.junta = gj;
    R.torno([x0, 0, 0], [x0 + 1, 0, 0], [[P.junta.Di / 2, 0], [P.junta.De / 2, 0], [P.junta.De / 2, P.junta.e], [P.junta.Di / 2, P.junta.e]], goma, { padre: gj, seg: 64 }); }
  // pinza: anillo + 8 dedos (poliamida)
  { const gp = R.grupo(g); gp.position.x = off('pinza'); parts.pinza = gp;
    const xp = xh1 + 1.2, D = P.pinza, n = D.dedos, w = 360 / n - D.ranura / (D.De / 2) * 180 / Math.PI;
    R.torno([xp, 0, 0], [xp + 1, 0, 0], [[D.Di / 2, 0], [D.De / 2, 0], [D.De / 2, 3], [D.Di / 2, 3]], pa, { padre: gp, seg: 64 });
    const paD = R.tipoCorte(R.M.pa('#2c2e31', { side: R.THREE.DoubleSide }), 'plastico');
    for (let i = 0; i < n; i++) tornoParcial(R, xp + 3, [[D.Di / 2, 0], [D.De / 2, 0], [D.De / 2 - .8, D.L - 3], [D.Di / 2 - 1.1, D.L - 3], [D.Di / 2 - .4, D.L - 4.5]], i * 360 / n, w, paD, { padre: gp, seg: 6 });
  }
  // goma de sellado (dentro de la pinza)
  { const gg = R.grupo(g); gg.position.x = off('goma'); parts.goma = gg;
    const G = P.goma, xg = xh1 + 2.2;
    R.torno([xg, 0, 0], [xg + 1, 0, 0], [[G.Di / 2, 0], [G.De / 2 - .5, 0], [G.De / 2, .5], [G.De / 2, G.L - G.chafl], [G.Di / 2 + .9, G.L], [G.Di / 2, G.L]], goma, { padre: gg, seg: 64 }); }
  // tapa (domo) con hexágono y rosca interior
  { const gt = R.grupo(g); gt.position.x = off('tapa'); parts.tapa = gt;
    const T = P.tapa, xt = xh1 + .4, rt = P.tapa.rosc / 2;
    hexX(R, xt, xt + 7.5, 0, 0, T.caras, alu, { padre: gt, agujero: rt + .05, bevel: .5 });
    R.torno([xt + 7.5, 0, 0], [xt + 8.5, 0, 0], [[rt + .05, 0], [T.Dcup / 2 - 1.2, 0], [T.Dcup / 2 - 1.2, 1.6], [T.Dcup / 2 - 2.6, T.L - 7.5 - .8], [T.boca / 2 + 1.2, T.L - 7.5], [T.boca / 2, T.L - 7.5], [T.boca / 2, T.L - 7.5 - .8], [P.goma.Di / 2 + 1.6, T.L - 7.5 - 1.8], [P.pinza.De / 2 - 1.2, 1.2], [rt + .05, .6]], alu, { padre: gt, seg: 64 });
  }
  // tuerca de fijación (del lado de adentro de la caja) y arandela dentada
  { const gn = R.grupo(g); gn.position.x = off('tuerca'); parts.tuerca = gn;
    const xn = x0 - P.chapa - P.tuerca.L;
    hexX(R, xn, xn + P.tuerca.L, 0, 0, P.tuerca.caras, al, { padre: gn, agujero: rr - .35, bevel: .45 });
  }
  { const ga = R.grupo(g); ga.position.x = off('contratuerca'); parts.contratuerca = ga;
    const xa = x0 - P.chapa - P.tuerca.L - P.contratuerca.L;
    hexX(R, xa, xa + P.contratuerca.L, 0, 0, P.contratuerca.caras * .95, al, { padre: ga, agujero: rr - .35, bevel: .35, giro: .3 });
  }
  if (op.cuarto) for (const k of Object.keys(parts)) R.cortar(parts[k], [x0 - 40, x0 + 60, -40, 0, 0, 40]);
  g.userData.partes = parts; g.userData.xh1 = xh1;
  return g;
}

/* ---------------- riel NS35 con plegados y ranuras ---------------- */
export function rielNS(R, x0, x1, y0, z0, op = {}) {
  const mat = R.tipoCorte(R.M.aceroCinc(), 'metal'), g = R.grupo(op.padre);
  const per = perfilNS(8).map(([u, v]) => [y0 + u, z0 + v]);
  let m = R.perfil(per, [], x1 - x0, mat, { a0: x0, bevel: .1, padre: g });
  if (op.ranuras !== false) {
    const { L, A, paso } = NS.ranura;
    for (let xc = x0 + (op.prim ?? 12.5); xc + L / 2 < x1 - 1; xc += paso) {
      const s = [], n = 16;
      for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + Math.PI * i / n; s.push([xc + L / 2 - A / 2 + A / 2 * Math.cos(a), y0 + NS.W / 2 + A / 2 * Math.sin(a)]); }
      for (let i = 0; i <= n; i++) { const a = Math.PI / 2 + Math.PI * i / n; s.push([xc - L / 2 + A / 2 + A / 2 * Math.cos(a), y0 + NS.W / 2 + A / 2 * Math.sin(a)]); }
      const h = R.perfil(s, [], 4, mat, { A: [0, 0, 1], B: [1, 0, 0], C: [0, 1, 0], o: [0, 0, z0 - 1.5], bevel: 0, padre: null });
      const r = R.restarCSG(m, h, mat); g.remove(m); g.add(r); m = r;
    }
  }
  return g;
}

/* ---------------- cable canal ranurado ---------------- */
export function canal(R, W, x0, x1, op = {}) {
  const C = CANAL, g = R.grupo(op.padre), H = 30;
  const pvc = R.tipoCorte(R.M.pvc(C.color, { roughness: .5, clearcoat: .15 }), 'plastico');
  // fondo + franja baja de las paredes (hasta el fondo de las ranuras) + labio arriba en cada dedo
  const zr = H - C.alturaRanura;      // altura del fondo de la ranura
  const base = [[0, 0], [W, 0], [W, zr], [W - C.pared, zr], [W - C.pared, C.fondo], [C.pared, C.fondo], [C.pared, zr], [0, zr]];
  R.perfil(base, [], x1 - x0, pvc, { a0: x0, bevel: .15, padre: g });
  // dedos con el labio de la tapa, separados por las ranuras (fondo redondeado)
  const sec = seccionCanal(W, H);
  const dedoI = sec.slice(10).concat([[0, H - 2.4]]).filter(([y]) => y <= .01);   // lado y = 0
  const paso = C.dedo + C.ranura;
  for (let x = x0; x < x1 - .5; x += paso) {
    const xa = x, xb = Math.min(x + C.dedo, x1);
    for (const lado of [0, 1]) {
      const yA = lado ? W - C.pared : 0, yB = lado ? W : C.pared;
      const pf = lado ? [[W - C.pared, zr - .6], [W, zr - .6], [W, H - 2.4], [W + C.tapa.gancho, H - 1.6], [W + C.tapa.gancho, H - .9], [W, H], [W - C.pared, H]]
                      : [[0, zr - .6], [C.pared, zr - .6], [C.pared, H], [0, H], [-C.tapa.gancho, H - .9], [-C.tapa.gancho, H - 1.6], [0, H - 2.4]];
      R.perfil(pf, [], xb - xa, pvc, { a0: xa, bevel: .25, padre: g });
    }
    // fondo redondeado de la ranura (medio cilindro)
    if (xb + C.ranura <= x1) for (const yy of [C.pared / 2, W - C.pared / 2]) R.cil([xb + C.ranura / 2, yy - C.pared / 2 - .01, zr - .6], [xb + C.ranura / 2, yy + C.pared / 2 + .01, zr - .6], C.ranura / 2 + .02, pvc, { padre: g, seg: 16 }).visible = false;
  }
  // tapa
  if (op.tapa) {
    const [t0, t1] = op.tapa;
    R.perfil(seccionTapa(W, H), [], t1 - t0, R.tipoCorte(R.M.pvc(C.colorTapa, { roughness: .45 }), 'plastico'), { a0: t0, bevel: .2, padre: g });
  }
  return g;
}

/* ---------------- conductor aislado por tramos (para cortes con CSG: todo cerrado) ---------------- */
/** pts: camino [[x,y,z]…]; pelado: [[xa, xb]…] tramos sin aislación (sólo en tramos rectos según x). Cobre macizo (cuerda compacta) + aislación anular */
export function conductor(R, pts, rCu, rIns, color, op = {}) {
  const g = R.grupo(op.padre);
  const cu = R.tipoCorte(R.M.cobre(), 'metal'), ai = R.tipoCorte(R.M.cable(color), 'plastico');
  const pel = op.pelado || [];
  const dentro = x => pel.some(([a, b]) => x > a + 1e-6 && x < b - 1e-6);
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    // cortes por los bordes de los tramos pelados
    const xs = [a[0], b[0]]; for (const [p, q] of pel) for (const x of [p, q]) if (x > Math.min(a[0], b[0]) && x < Math.max(a[0], b[0])) xs.push(x);
    xs.sort((u, v) => (b[0] >= a[0] ? u - v : v - u));
    for (let k = 0; k < xs.length - 1; k++) {
      const t0 = (xs[k] - a[0]) / (b[0] - a[0] || 1), t1 = (xs[k + 1] - a[0]) / (b[0] - a[0] || 1);
      const P0 = a.map((v, j) => v + (b[j] - v) * t0), P1 = a.map((v, j) => v + (b[j] - v) * t1);
      const L = Math.hypot(P1[0] - P0[0], P1[1] - P0[1], P1[2] - P0[2]); if (L < 1e-4) continue;
      R.torno(P0, P1, [[0, -.02], [rCu, -.02], [rCu, L + .02], [0, L + .02]], cu, { padre: g, seg: 32 });
      if (!dentro((P0[0] + P1[0]) / 2)) R.torno(P0, P1, [[rCu, -.03], [rIns, -.03], [rIns, L + .03], [rCu, L + .03]], ai, { padre: g, seg: 40 });
    }
  }
  return g;
}
