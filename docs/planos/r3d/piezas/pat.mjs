/* pat.mjs · piezas 3D del grupo «pat» (jabalina, tomacable, cámara, roscas reales helicoidales, bulonería, abrazaderas, fleje, caños).
 * No toca lib/r3d.mjs ni las piezas de otros grupos: importa aerea.mjs / cables.mjs tal cual. Geometría: perfiles_pat.mjs. */
import { matsA } from './aerea.mjs';
import { JAB, TOMA, BUL, ABR, FLE, CANO } from './perfiles_pat.mjs';

const TAU = Math.PI * 2, rad = (g) => g * Math.PI / 180;

/** materiales del grupo (cada uno con su color y textura, ninguno parecido a su vecino) */
export function matsP(R) {
  if (R._mp) return R._mp;
  const T = R.THREE, A = matsA(R);
  const ph = (o, rz) => { const m = new T.MeshPhysicalMaterial(o); return m; };
  const M = {
    bronce: R.tipoCorte(R.M.pa('#c9a650', { metalness: 1, roughness: .4, clearcoat: 0 }), 'metal'),
    cobre: R.tipoCorte(R.M.cobre(), 'metal'),
    cobreEst: R.tipoCorte(R.M.cobreEst(), 'metal'),
    alma: R.tipoCorte(R.M.pa('#7f878d', { metalness: 1, roughness: .48, clearcoat: 0 }), 'metal'),      // acero SAE 1010–1020
    templado: R.tipoCorte(R.M.pa('#4d5560', { metalness: 1, roughness: .4, clearcoat: 0 }), 'metal'),   // acero templado (bulón de hinca, sufridera)
    galv: A.galv, inox: A.inox,
    porc: R.tipoCorte((() => { const m = R.M.ceramica(); m.color.set('#6b3418'); m.roughness = .18; m.clearcoat = 1; m.clearcoatRoughness = .1; return m; })(), 'ceramica'),
    tierra: R.tipoCorte((() => { const m = R.M.arena(); m.color.set('#8a6a48'); return m; })(), 'arena'),
    horm: R.tipoCorte((() => { const m = R.M.arena(); m.color.set('#a4a39c'); return m; })(), 'arena'),
    pvcG: R.tipoCorte(R.M.pvc('#d9dadb'), 'plastico'),
    pvcN: R.tipoCorte(R.M.pa('#2b2c2f', { roughness: .45 }), 'plastico'),
    tapa: R.tipoCorte(R.M.pa('#3a3c40', { roughness: .7 }), 'plastico'),
    pead: R.tipoCorte(R.M.pa('#1c1d1f', { roughness: .4 }), 'plastico'),
    resina: R.tipoCorte(R.M.pa('#b8322a', { roughness: .4, clearcoat: .3 }), 'plastico'),   // aislador de barra (poliéster rojo)
    zinc: R.tipoCorte(R.M.pa('#9ea7ae', { metalness: 1, roughness: .55, clearcoat: 0 }), 'metal'),   // capa de zinc (corte)
    soldadura: R.tipoCorte(R.M.pa('#5d5850', { metalness: .8, roughness: .7 }), 'metal'),
    pintura: R.M.pa('#2f6d48', { roughness: .5 }),
    goma: R.M.goma('#1b1c1e'),
  };
  for (const k of ['bronce', 'cobre', 'alma', 'templado', 'galv', 'inox', 'zinc', 'cobreEst']) M[k + 'C'] = R.M.corte(M[k], 'metal');
  for (const k of ['porc']) M[k + 'C'] = R.M.corte(M[k], 'ceramica');
  for (const k of ['pvcG', 'pvcN', 'tapa', 'pead', 'resina']) M[k + 'C'] = R.M.corte(M[k], 'plastico');
  M.tierraC = (() => { const m = R.M.arena(); m.color.set('#b0875c'); return m; })();
  M.hormC = (() => { const m = R.M.arena(); m.color.set('#bdbcb4'); return m; })();
  R._mp = M; return M;
}

/** perfil de rosca (radio en función de la posición) · paso p, ángulo de flanco ang (60 métrica/UNC, 55 Whitworth/BSP) */
export function rosca(rMaj, p, ang = 60, ext = true) {
  const Hf = p / (2 * Math.tan(rad(ang / 2)));
  const top = rMaj - Hf / 8, bot = rMaj - Hf * (ext ? 7 / 8 : 3 / 4) + Hf / 8;
  return (th, z) => {
    let s = (z / p - th / TAU) % 1; if (s < 0) s += 1;
    const tri = 1 - Math.abs(2 * s - 1);     // 0..1
    const r = rMaj - 7 / 8 * Hf + Hf * tri;  // triángulo fundamental
    return Math.min(top, Math.max(bot, r));
  };
}
rosca.prof = (p, ang) => { const Hf = p / (2 * Math.tan(rad(ang / 2))); return Hf * (7 / 8 - 1 / 4); };

/** sólido de revolución general: radios exterior ro(th, z) e interior ri(th, z) (o null), de z = 0 a L sobre el eje p0 + dir,
 *  arco [a0, a1] en grados (si no es 360 se cierran las dos caras de corte con matC). ref = dirección de th = 0 */
export function revol(R, o) {
  const T = R.THREE;
  const w = new T.Vector3(...o.dir).normalize();
  let u = o.ref ? new T.Vector3(...o.ref) : (Math.abs(w.z) < .9 ? new T.Vector3(0, 0, 1) : new T.Vector3(1, 0, 0));
  u.addScaledVector(w, -u.dot(w)).normalize(); const v = new T.Vector3().crossVectors(w, u);
  const P0 = new T.Vector3(...o.p0), L = o.L, a0 = rad(o.a0 ?? 0), a1 = rad(o.a1 ?? 360), full = Math.abs(a1 - a0 - TAU) < 1e-6;
  const nt = o.nt || Math.max(24, Math.round(96 * (a1 - a0) / TAU)), dz = o.dz || L / 40, nz = Math.max(2, Math.ceil(L / dz));
  const dzf = o.dzf || (() => 0);
  const pt = (r, th, z) => P0.clone().addScaledVector(w, z + dzf(th)).addScaledVector(u, r * Math.cos(th)).addScaledVector(v, r * Math.sin(th));
  const g = R.grupo(o.padre);
  const malla = (pos, idx, mat) => {
    const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
    const m = new T.Mesh(geo, mat); m.castShadow = m.receiveShadow = true; R.sinBorde(m); g.add(m); return m;
  };
  const sup = (f, inv) => {
    const pos = [], idx = [];
    for (let j = 0; j <= nz; j++) { const z = L * j / nz; for (let i = 0; i <= nt; i++) { const th = a0 + (a1 - a0) * i / nt; const q = pt(f(th, z), th, z); pos.push(q.x, q.y, q.z); } }
    for (let j = 0; j < nz; j++) for (let i = 0; i < nt; i++) { const a = j * (nt + 1) + i, b = a + 1, c = a + nt + 1, d = c + 1; inv ? idx.push(a, c, b, b, c, d) : idx.push(a, b, c, b, d, c); }
    return malla(pos, idx, o.mat);
  };
  if (!o.noRo) sup(o.ro, false); if (o.ri && !o.noRi) sup(o.ri, true);
  const tapa = (z, arriba) => {
    const pos = [], idx = [];
    for (let i = 0; i <= nt; i++) { const th = a0 + (a1 - a0) * i / nt; const a = pt(o.ro(th, z), th, z), b = pt(o.ri ? o.ri(th, z) : 0, th, z); pos.push(a.x, a.y, a.z, b.x, b.y, b.z); }
    for (let i = 0; i < nt; i++) { const oi = 2 * i, ni = oi + 1, oj = oi + 2, nj = oi + 3; arriba ? idx.push(ni, oi, oj, ni, oj, nj) : idx.push(ni, oj, oi, ni, nj, oj); }
    return malla(pos, idx, o.matTapa || o.mat);
  };
  if (o.tapa0 !== false) tapa(0, false); if (o.tapa1 !== false) tapa(L, true);
  if (!full) for (const [th, fin] of [[a0, false], [a1, true]]) {
    const pos = [], idx = [];
    for (let j = 0; j <= nz; j++) { const z = L * j / nz; const a = pt(o.ri ? o.ri(th, z) : 0, th, z), b = pt(o.ro(th, z), th, z); pos.push(a.x, a.y, a.z, b.x, b.y, b.z); }
    for (let j = 0; j < nz; j++) { const i0 = 2 * j, o0 = i0 + 1, i1 = i0 + 2, o1 = i0 + 3; fin ? idx.push(i0, i1, o0, o0, i1, o1) : idx.push(i0, o0, i1, o0, o1, i1); }
    const m = malla(pos, idx, o.matC || o.mat); m.userData.corte = true;
  }
  return g;
}
const cte = (r) => () => r;

/** prisma hexagonal o cuadrado con agujero (roscado opcional) a lo largo de dir: n lados, af entre caras */
export function prismaN(R, p0, dir, L, af, n, mat, op = {}) {
  const T = R.THREE, w = new T.Vector3(...dir).normalize();
  let u = op.ref ? new T.Vector3(...op.ref) : (Math.abs(w.z) < .9 ? new T.Vector3(0, 0, 1) : new T.Vector3(1, 0, 0)); u.addScaledVector(w, -u.dot(w)).normalize();
  const v = new T.Vector3().crossVectors(w, u);
  const rc = af / 2 / Math.cos(Math.PI / n), giro = op.giro ?? Math.PI / n;
  const pts = Array.from({ length: n }, (_, i) => [rc * Math.cos(giro + TAU * i / n), rc * Math.sin(giro + TAU * i / n)]);
  const cav = op.agujero ? [Array.from({ length: 48 }, (_, i) => [op.agujero * Math.cos(TAU * i / 48), op.agujero * Math.sin(TAU * i / 48)])] : [];
  return R.perfil(pts, cav, L, mat, { A: w.toArray(), B: u.toArray(), C: v.toArray(), o: p0, bevel: op.bevel ?? .5, padre: op.padre });
}

/** bulón de cabeza hexagonal (o cuadrada) con rosca helicoidal real. p = cara de apoyo de la cabeza; el vástago va hacia dir.
 *  op: d, paso, ang, L (vástago), Lr (largo roscado), af, k, n (6|4), mat, matC, a0/a1 (corte del vástago) */
export function bulon(R, p, dir, op) {
  const T = R.THREE, M = matsP(R), g = R.grupo(op.padre), w = new T.Vector3(...dir).normalize(), P = new T.Vector3(...p);
  const mat = op.mat || M.galv;
  prismaN(R, P.clone().addScaledVector(w, -op.k).toArray(), dir, op.k, op.af, op.n || 6, mat, { padre: g, bevel: .7, ref: op.ref });
  const r = op.d / 2, Ll = op.L - op.Lr, f = rosca(r, op.paso, op.ang);
  const chafl = (th, z) => { const rr = f(th, z); const zz = op.L - z; return zz < op.paso ? Math.min(rr, r - op.paso * .55 + zz * .55) : rr; };
  revol(R, { p0: P.toArray(), dir, L: Ll, ro: cte(r - .05), mat, matC: op.matC || M.galvC, padre: g, tapa0: false, tapa1: false, a0: op.a0, a1: op.a1, ref: op.ref, nt: 64, dz: 4 });
  revol(R, { p0: P.clone().addScaledVector(w, Ll).toArray(), dir, L: op.Lr, ro: (th, z) => chafl(th + 0, z + Ll), mat, matC: op.matC || M.galvC, padre: g, a0: op.a0, a1: op.a1, ref: op.ref, nt: 72, dz: op.paso / 10, tapa0: false });
  return g;
}

/** tuerca hexagonal / cuadrada con rosca interior real (centrada en p, cara de apoyo en p, hacia dir) */
export function tuerca(R, p, dir, op) {
  const T = R.THREE, M = matsP(R), g = R.grupo(op.padre), w = new T.Vector3(...dir).normalize();
  const mat = op.mat || M.galv, n = op.n || 6;
  const rcar = op.af / 2 / Math.cos(Math.PI / n);
  // cuerpo: prisma con agujero del Ø mayor; adentro la rosca como cáscara
  const cuerpo = prismaN(R, p, dir, op.e, op.af, n, mat, { padre: g, agujero: op.d / 2 + .02, bevel: .6, ref: op.ref });
  const f = rosca(op.d / 2, op.paso, op.ang, false);
  revol(R, { p0: p, dir, L: op.e, ro: cte(op.d / 2 + .05), ri: (th, z) => f(th, z), mat, matC: op.matC || M.galvC, padre: g, ref: op.ref, nt: 72, dz: op.paso / 10, a0: op.a0, a1: op.a1 });
  g.userData.cuerpo = cuerpo;
  return g;
}

/** arandela plana (torno) */
export function arandelaP(R, p, dir, di, de, e, mat, op = {}) {
  return R.torno(p, new R.THREE.Vector3(...p).addScaledVector(new R.THREE.Vector3(...dir).normalize(), e).toArray(), [[di / 2, 0], [de / 2 - .3, 0], [de / 2, .3], [de / 2, e - .3], [de / 2 - .3, e], [di / 2, e], [di / 2, 0]], mat, { seg: 72, padre: op.padre });
}
/** arandela de presión (Grower, DIN 127 B): anillo de sección rectangular partido, con las puntas desplazadas en altura (sep) */
export function arandelaG(R, p, dir, di, de, e, mat, op = {}) {
  const sep = op.sep ?? 1.4;
  return revol(R, { p0: p, dir, L: e, ro: cte(de / 2), ri: cte(di / 2), a0: 6, a1: 354, mat, matC: mat, padre: op.padre, nt: 80, dz: e, ref: op.ref,
    dzf: (th) => sep * (th - rad(6)) / rad(348) });
}

/** jabalina (alma de acero + capa de cobre) con eje z, cabeza en zTop y punta abajo. op: L, D, a0/a1 corte de la cabeza (largo Lc) */
export function jabalina(R, x, y, zTop, op = {}) {
  const M = matsP(R), g = R.grupo(op.padre), D = op.D || JAB.j58.D, L = op.L || JAB.j58.L, cu = (op.cu || JAB.cu) * (op.exag || 1);
  const r = D / 2, ch = JAB.chaflan, Lp = JAB.punta, Lc = op.Lc || 0;
  // tramo superior (con o sin corte a cuarto), cabeza con chaflán
  const roCu = (th, z) => z < ch ? r - ch + z : r;          // z desde arriba hacia abajo
  const riCu = (th, z) => z < ch ? Math.max(0, r - ch + z - cu) : r - cu;
  const base = [x, y, zTop];
  if (Lc > 0) {
    revol(R, { p0: base, dir: [0, 0, -1], L: Lc, ro: roCu, ri: riCu, a0: op.a0 ?? 0, a1: op.a1 ?? 270, mat: M.cobre, matC: M.cobreC, padre: g, nt: 96, dz: .3, tapa0: false, ref: op.ref });
    revol(R, { p0: base, dir: [0, 0, -1], L: Lc, ro: riCu, a0: op.a0 ?? 0, a1: op.a1 ?? 270, mat: M.alma, matC: M.almaC, padre: g, nt: 96, dz: .3, tapa0: true, ref: op.ref });
    revol(R, { p0: base, dir: [0, 0, -1], L: Lc, ro: riCu, a0: op.a1 ?? 270, a1: (op.a0 ?? 0) + 360, mat: M.alma, padre: g, nt: 16, dz: 3, tapa1: false, tapa0: false, ref: op.ref }).visible = false;
  }
  const Lb = L - Lc - Lp;
  const cuerpo = R.cil([x, y, zTop - Lc - Lb], [x, y, zTop - Lc], r, M.cobre, { seg: 64, padre: g });
  if (Lc === 0) { R.torno([x, y, zTop - ch], [x, y, zTop], [[0, 0], [r, 0], [r - ch, ch], [0, ch]], M.cobre, { seg: 64, padre: g }); cuerpo.scale.z = 1; }
  R.torno([x, y, zTop - L], [x, y, zTop - L + Lp], [[0, 0], [.6, 0], [r, Lp], [0, Lp]], M.cobre, { seg: 64, padre: g });
  return g;
}

/** tomacable de bronce (cuerpo en «O», puente y bulón) apretando el cable contra la jabalina. Centro de la jabalina en (x, y), alto zc. Cable en +x */
export function tomacable(R, x, y, zc, op = {}) {
  const M = matsP(R), g = R.grupo(op.padre), t = TOMA, r = JAB.j58.D / 2;
  const W0 = t.ven.x0 - t.pared, W1 = t.ven.x1 + t.pared + t.bulon.k * 0;
  // contorno en planta (x, y) extruido en z: rectángulo redondeado con la ventana adentro
  const rr = (x0, x1, y0, y1, k, n = 6) => { const p = []; const c = [[x1 - k, y1 - k, 0], [x0 + k, y1 - k, 90], [x0 + k, y0 + k, 180], [x1 - k, y0 + k, 270]];
    for (const [cx, cy, a] of c) for (let i = 0; i <= n; i++) { const b = rad(a + 90 * i / n); p.push([cx + k * Math.cos(b), cy + k * Math.sin(b)]); } return p; };
  const ext = rr(x + W0, x + W1 + 6, y - t.E / 2, y + t.E / 2, 5).map(([a, b]) => [a, b]);
  const ven = rr(x + t.ven.x0, x + t.ven.x1, y - t.ven.z / 2 + 1.5, y + t.ven.z / 2 - 1.5, 3);
  const cuerpo = R.perfil(ext, [ven], t.H, M.bronce, { A: [0, 0, 1], B: [1, 0, 0], C: [0, 1, 0], o: [0, 0, zc - t.H / 2], bevel: .8, padre: g });
  g.userData.cuerpo = cuerpo;
  // boss del bulón en +x y el bulón M10 (cabeza hex) que empuja el puente hacia la jabalina
  const xb = x + W1 + 6;
  const xc = x + r + 2.0;   // centro de la cuerda pelada (Ø 4) apoyada en la jabalina
  // puente (pisador) de bronce
  R.caja(xc + 2.0, xc + 2.0 + t.puente.e, y - t.ven.z / 2 + 2, y + t.ven.z / 2 - 2, zc - t.H / 2 + 1.5, zc + t.H / 2 - 1.5, M.bronce, { r: .6, padre: g });
  const Lb = (xb + t.bulon.k) - (xc + 2.0 + t.puente.e) - t.bulon.k;
  bulon(R, [xb, y, zc], [-1, 0, 0], { d: t.bulon.M, paso: 1.5, ang: 60, L: Lb, Lr: Lb - 3, af: t.bulon.af, k: t.bulon.k, mat: M.inox, matC: M.inoxC, padre: g, ref: [0, 0, 1] });
  return { g, xc, xb, W0: x + W0, W1: xb, xp: xc + 2.0 };
}

/** abrazadera H°G° de 2 medias (lisa / escotes) de Ø interior D, centrada en (0,0), a la altura zc. Orejas en ±x. escotes = 0|1|2 (en ±y) */
export function abrazadera(R, D, zc, op = {}) {
  const M = matsP(R), g = R.grupo(op.padre), e = ABR.e, a = ABR.a, R0 = D / 2, ore = ABR.oreja, luz = ABR.luz / 2;
  const n = 64;
  for (const s of [1, -1]) {     // media de +y y de -y: orejas a y = ±luz, planchuela de espesor e hacia afuera
    const th0 = Math.asin(luz / R0), xA = R0 * Math.cos(th0), th1 = Math.asin((luz + e) / (R0 + e)), xB = (R0 + e) * Math.cos(th1);
    const inn = [[-(xA + ore), s * luz]], out = [];
    for (let i = 0; i <= n; i++) { const th = Math.PI - th0 - (Math.PI - 2 * th0) * i / n; inn.push([R0 * Math.cos(th), s * R0 * Math.sin(th)]); }
    inn.push([xA + ore, s * luz]);
    out.push([-(xA + ore), s * (luz + e)]);
    for (let i = 0; i <= n; i++) { const th = Math.PI - th1 - (Math.PI - 2 * th1) * i / n; out.push([(R0 + e) * Math.cos(th), s * (R0 + e) * Math.sin(th)]); }
    out.push([xA + ore, s * (luz + e)]);
    const cont = [...inn, ...out.reverse()];
    const m = R.perfil(cont, [], a, M.galv, { A: [0, 0, 1], B: [1, 0, 0], C: [0, 1, 0], o: [0, 0, zc - a / 2], bevel: .5, padre: g });
    let mm = m;
    for (const xo of [-(R0 * Math.cos(Math.asin(luz / R0)) + ore / 2 + e / 2), R0 * Math.cos(Math.asin(luz / R0)) + ore / 2 + e / 2]) {
      const h = R.cil([xo, s * (luz - 5), zc], [xo, s * (luz + e + 5), zc], ABR.agujero / 2, M.galv, { padre: null, seg: 32 });
      const r2 = R.restarCSG(mm, h, M.galvC); g.remove(mm); g.add(r2); mm = r2;
    }
    if (op.escotes && (op.escotes === 2 || s > 0)) {
      const yb = s * (R0 + e);
      // lengüeta del escote: planchuela doblada a 90° (sale radial), plano horizontal
      const lg2 = R.caja(-a / 2, a / 2, s > 0 ? yb - e : yb - ABR.escote.h, s > 0 ? yb + ABR.escote.h : yb + e, zc + a / 2 - e, zc + a / 2, M.galv, { r: .8, padre: null });
      const h = R.cil([0, yb + s * ABR.escote.h * .6, zc + a / 2 - e - 3], [0, yb + s * ABR.escote.h * .6, zc + a / 2 + 3], ABR.agujero / 2, M.galv, { padre: null, seg: 32 });
      const r3 = R.restarCSG(lg2, h, M.galvC); g.add(r3);
    }
  }
  return g;
}

/** fleje (anillo) alrededor de un cilindro de radio r a la altura z + hebilla en el ángulo th (grados) */
export function flejeAnillo(R, r, z, th = 0, op = {}) {
  const M = matsP(R), g = R.grupo(op.padre), f = FLE, h = f.hebilla;
  const a = rad(th);
  // la banda (con un solapado de 2 vueltas al pasar la hebilla)
  revol(R, { p0: [0, 0, z - f.a / 2], dir: [0, 0, 1], L: f.a, ro: cte(r + f.e), ri: cte(r), mat: M.inox, matC: M.inoxC, padre: g, nt: 160, dz: f.a, ref: [Math.cos(a + .25), Math.sin(a + .25), 0], a0: 0, a1: 340 });
  revol(R, { p0: [0, 0, z - f.a / 2], dir: [0, 0, 1], L: f.a, ro: cte(r + 2 * f.e + .1), ri: cte(r + f.e + .1), mat: M.inox, matC: M.inoxC, padre: g, nt: 64, dz: f.a, ref: [Math.cos(a - .55), Math.sin(a - .55), 0], a0: 0, a1: 52 });
  hebilla(R, [ (r + f.e) * Math.cos(a), (r + f.e) * Math.sin(a), z ], [Math.cos(a), Math.sin(a), 0], [-Math.sin(a), Math.cos(a), 0], { padre: g, cola: op.cola ?? 10 });
  return g;
}

/** hebilla «de orejas» inox 3/4" (tipo Ear-Lokt): base en p apoyada sobre la banda (normal n, largo a lo largo de t), con las 2 orejas dobladas
 *  sobre la banda y la punta del fleje doblada hacia atrás (cola). */
export function hebilla(R, p, n, t, op = {}) {
  const T = R.THREE, M = matsP(R), g = R.grupo(op.padre), H = FLE.hebilla, f = FLE;
  const P = new T.Vector3(...p), N = new T.Vector3(...n).normalize(), Tt = new T.Vector3(...t).normalize(), B = new T.Vector3().crossVectors(Tt, N);
  const at = (dt, db, dn) => P.clone().addScaledVector(Tt, dt).addScaledVector(B, db).addScaledVector(N, dn).toArray();
  const caja = (t0, t1, b0, b1, n0, n1, mat) => {
    const m = R.caja(t0, t1, b0, b1, n0, n1, mat, { r: .35, padre: null });
    const q = new T.Matrix4().makeBasis(Tt, B, N); m.applyMatrix4(q); m.position.add(P); g.add(m); return m;
  };
  const e = H.e, L = H.L, w = H.a;
  caja(-L / 2, L / 2, -w / 2, w / 2, 0, e, M.inox);                        // base bajo las bandas
  // orejas laterales dobladas encima de las 2 capas de fleje
  const hb = 2 * f.e + .2;
  for (const s of [-1, 1]) {
    caja(-L / 2 + 2, L / 2 - 2, s * (w / 2) - (s > 0 ? e : 0), s * (w / 2) + (s > 0 ? 0 : e), e, e + hb + e, M.inox);    // pared
    caja(-L / 2 + 2, L / 2 - 2, s > 0 ? w / 2 - H.oreja : -w / 2, s > 0 ? w / 2 : -w / 2 + H.oreja, e + hb, e + hb + e, M.inox);   // oreja doblada
  }
  for (const s2 of [-1, 1]) { const yy = s2 * (w / 2 - e / 2), zz = e + hb + e / 2; const m = R.cil([-L / 2 + 2, yy, zz], [L / 2 - 2, yy, zz], e * .75, M.inox, { padre: null, seg: 24 });
    const q = new T.Matrix4().makeBasis(Tt, B, N); m.applyMatrix4(q); m.position.add(P); g.add(m); }
  // 2 capas de fleje que pasan por la hebilla + la cola doblada hacia atrás
  caja(-L / 2 - 6, L / 2 + 6, -f.a / 2, f.a / 2, e, e + f.e, M.inox);
  caja(-L / 2 - 2, L / 2 + 4, -f.a / 2, f.a / 2, e + f.e + .1, e + 2 * f.e + .1, M.inox);
  const cola = op.cola ?? 10;
  if (cola > 0) caja(L / 2 - cola * .1, L / 2 + 4.5, -f.a / 2, f.a / 2, e + 2 * f.e + .2, e + 2 * f.e + .2 + 3.5, M.inox).visible = true;
  if (cola > 0) caja(L / 2 - cola, L / 2 + 4.5, -f.a / 2, f.a / 2, e + 2 * f.e + 3.2, e + 3 * f.e + 3.2, M.inox);
  g.userData.ejes = { P, N, Tt, B };
  return g;
}

/** caño de radio exterior De/2 y espesor e en el eje p0→dir de largo L con rosca exterior real (BSP) en los últimos Lr mm. op.a0/a1 corte */
export function canoRoscado(R, p0, dir, c, L, Lr, mat, matC, op = {}) {
  const g = R.grupo(op.padre), ro = c.De / 2, ri = ro - c.e, f = rosca(ro, c.paso, c.ang);
  revol(R, { p0, dir, L: L - Lr, ro: cte(ro), ri: cte(ri), mat, matC, padre: g, a0: op.a0, a1: op.a1, ref: op.ref, nt: 96, dz: (L - Lr) / 4 });
  const T = R.THREE, P = new T.Vector3(...p0).addScaledVector(new T.Vector3(...dir).normalize(), L - Lr);
  revol(R, { p0: P.toArray(), dir, L: Lr, ro: (th, z) => f(th, z), ri: cte(ri), mat, matC, padre: g, a0: op.a0, a1: op.a1, ref: op.ref, nt: 96, dz: c.paso / 10, tapa0: false });
  return g;
}
/** cupla (manguito) con rosca interior real */
export function cupla(R, p0, dir, c, L, e, mat, matC, op = {}) {
  const ro = c.De / 2, f = rosca(ro, c.paso, c.ang, false);
  return revol(R, { p0, dir, L, ro: cte(ro + e), ri: (th, z) => f(th, z) - 0.0, mat, matC, padre: op.padre, a0: op.a0, a1: op.a1, ref: op.ref, nt: 96, dz: c.paso / 10 });
}

/** barrido de un sector de tubo (ángulos a0–a1 en grados, 0–360 = tubo completo) de radio r a lo largo de f(t) → [x,y,z], t de t0 a t1 */
export function barrido(R, f, t0, t1, r, mat, op = {}) {
  const T = R.THREE, n = op.n || 120, na = op.na || 24, a0 = rad(op.a0 ?? 0), a1 = rad(op.a1 ?? 360);
  const pos = [], idx = []; let prevN = null;
  for (let i = 0; i <= n; i++) {
    const t = t0 + (t1 - t0) * i / n, h = (t1 - t0) * 1e-3;
    const p = new T.Vector3(...f(t)), tg = new T.Vector3(...f(t + h)).sub(new T.Vector3(...f(t - h))).normalize();
    let N = prevN ? prevN.clone() : new T.Vector3(...(op.up || [0, 0, 1]));
    N.addScaledVector(tg, -N.dot(tg)); if (N.lengthSq() < 1e-8) N = new T.Vector3(1, 0, 0).addScaledVector(tg, -tg.x); N.normalize(); prevN = N;
    const Bn = new T.Vector3().crossVectors(tg, N);
    for (let j = 0; j <= na; j++) { const a = a0 + (a1 - a0) * j / na; const q = p.clone().addScaledVector(N, r * Math.cos(a)).addScaledVector(Bn, r * Math.sin(a)); pos.push(q.x, q.y, q.z); }
  }
  for (let i = 0; i < n; i++) for (let j = 0; j < na; j++) { const a = i * (na + 1) + j, b = a + 1, c = a + na + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
  const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const m = new T.Mesh(geo, mat); m.castShadow = m.receiveShadow = true; R.sinBorde(m); (op.padre || R.raiz).add(m);
  if (op.tapas) for (const [t, s] of [[t0, -1], [t1, 1]]) { const h = (t1 - t0) * 1e-3; const p = new T.Vector3(...f(t)), tg = new T.Vector3(...f(t + h)).sub(new T.Vector3(...f(t - h))).normalize();
    const c = new T.Mesh(new T.CircleGeometry(r, na), op.matTapa || mat); c.position.copy(p); c.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), tg.multiplyScalar(s)); R.sinBorde(c); (op.padre || R.raiz).add(c); }
  return m;
}
/** cable Cu 1 × 10 verde-amarillo (Ø 6, cuerda Ø 4) a lo largo de f: aislación de t0 a ta, cuerda pelada de ta a tc */
export function cableVA(R, f, t0, ta, tc, op = {}) {
  const g = R.grupo(op.padre), M = matsP(R);
  const verde = R.M.cable('#2f9a3e'), amar = R.M.cable('#f2c418');
  const rr = op.r || 3.0, kk = rr / 3.0;
  const fr = op.franjas || [40, 220], w = 85;
  for (const a of fr) barrido(R, f, t0, ta, rr, amar, { padre: g, n: op.n || 120, na: 14, a0: a, a1: a + w, up: op.up });
  for (const a of fr) barrido(R, f, t0, ta, rr, verde, { padre: g, n: op.n || 120, na: 16, a0: a + w, a1: a + 180, up: op.up });
  barrido(R, f, t0, ta, rr * .999, verde, { padre: g, n: 2, na: 32, tapas: true, matTapa: verde, up: op.up }).visible = false;
  for (const [t, sg] of [[t0, -1], [ta, 1]]) { const T = R.THREE, h = (ta - t0) * 1e-3; const p = new T.Vector3(...f(t)), tg = new T.Vector3(...f(t + h)).sub(new T.Vector3(...f(t - h))).normalize();
    const c = new T.Mesh(new T.RingGeometry(tc > ta ? 2.0 * kk : 0, rr, 32), verde); c.position.copy(p); c.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), tg.multiplyScalar(sg)); R.sinBorde(c); g.add(c); }
  if (tc > ta) {   // cuerda clase 5 (se insinúa con 19 alambres de Ø 0,8 alrededor del eje)
    const T = R.THREE; const hilos = [[0, 0]]; for (let k = 1; k <= 2; k++) for (let i = 0; i < 6 * k; i++) hilos.push([k * .8 * kk, 360 * i / (6 * k) + k * 15]);
    const paso = op.pasoCu || 22;
    for (const [rr, a0] of hilos) {
      const fw = (t) => { const h = (tc - ta) * 1e-3; const p = new T.Vector3(...f(t)), tg = new T.Vector3(...f(t + h)).sub(new T.Vector3(...f(t - h))).normalize();
        let N = new T.Vector3(...(op.up || [0, 0, 1])); N.addScaledVector(tg, -N.dot(tg)); if (N.lengthSq() < 1e-6) N = new T.Vector3(1, 0, 0); N.normalize(); const B = new T.Vector3().crossVectors(tg, N);
        const s = Math.hypot(...[0, 1, 2].map(k => f(t)[k] - f(ta)[k])); const a = rad(a0) + TAU * s / paso;
        return p.addScaledVector(N, rr * Math.cos(a)).addScaledVector(B, rr * Math.sin(a)).toArray(); };
      barrido(R, fw, ta - 1.5, tc, .42 * kk, M.cobre, { padre: g, n: 60, na: 8, tapas: true });
    }
  }
  return g;
}

/** terminal de ojal de Cu estañado (palma plana en el plano z = z0, agujero centrado en (x, y), barril hacia -dirección 'ang' en el plano) */
export function ojal(R, x, y, z0, ang, op = {}) {
  const M = matsP(R), g = R.grupo(op.padre), hole = op.hole || 6.5, W = op.W || 13, e = op.e || 1.6, Lb = op.Lb || 14, De = op.De || 6.4;
  const a = rad(ang), c = Math.cos(a), s = Math.sin(a);
  const pal = []; for (let i = 0; i <= 28; i++) { const t = -Math.PI / 2 + Math.PI * i / 28; pal.push([W / 2 * Math.cos(t), W / 2 * Math.sin(t)]); }
  pal.unshift([-W * .55, -W * .32]); pal.push([-W * .55, W * .32]);
  const rot = ([u, v]) => [x + u * c - v * s, y + u * s + v * c];
  const hol = Array.from({ length: 40 }, (_, i) => rot([hole / 2 * Math.cos(TAU * i / 40), hole / 2 * Math.sin(TAU * i / 40)]));
  R.perfil(pal.map(rot), [hol], e, M.cobreEst, { A: [0, 0, 1], B: [1, 0, 0], C: [0, 1, 0], o: [0, 0, z0], bevel: .3, padre: g });
  const pb = [x - (W * .55) * c, y - (W * .55) * s, z0 + e / 2], pe = [pb[0] - Lb * c, pb[1] - Lb * s, pb[2]];
  R.torno(pb, pe, [[0, 0], [De / 2 * .75, 0], [De / 2, 3], [De / 2, Lb], [0, Lb]], M.cobreEst, { seg: 40, padre: g });
  // engarce (dos marcas)
  for (const k of [.45, .7]) { const q = [pb[0] - Lb * k * c, pb[1] - Lb * k * s, pb[2]]; R.torno([q[0] + 1.2 * c, q[1] + 1.2 * s, q[2]], [q[0] - 1.2 * c, q[1] - 1.2 * s, q[2]], [[0, 0], [De / 2 - .5, 0], [De / 2 - .5, 2.4], [0, 2.4]], M.cobreEst, { seg: 6, padre: g }); }
  return { g, fin: pe, dir: [-c, -s, 0] };
}

/** fleje que abraza un poste (radio rp, centro 0,0) y opcionalmente un caño (radio rc, centro (xc, 0)) a la altura z. Devuelve el punto de la hebilla */
export function flejePoste(R, rp, z, op = {}) {
  const M = matsP(R), f = FLE, g = R.grupo(op.padre);
  const pts = [];
  if (!op.rc) { for (let i = 0; i < 160; i++) { const a = TAU * i / 160; pts.push([rp * Math.cos(a), rp * Math.sin(a)]); } }
  else { // envolvente de los dos círculos (tangentes exteriores)
    const d = op.xc, rc = op.rc, b = Math.acos((rp - rc) / d);
    for (let i = 0; i <= 120; i++) { const a = b + (TAU - 2 * b) * i / 120; pts.push([rp * Math.cos(a), rp * Math.sin(a)]); }
    for (let i = 0; i <= 40; i++) { const a = -b + 2 * b * i / 40; pts.push([d + rc * Math.cos(a), rc * Math.sin(a)]); }
  }
  // contorno de la banda: el polígono y su paralelo hacia afuera (e)
  const E3 = op.e3 || 1.2, sep = op.sep ?? 1.0;   // en el 3D la banda va 1,0 separada y con 1,2 de espesor (si no, se pierde contra el poste)
  for (const p of pts) { const l = Math.hypot(p[0] - (p[0] > rp ? op.xc || 0 : 0), p[1]); }
  const n = pts.length; const pts2 = pts.map((p, i) => { const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n]; const tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty); return [p[0] + ty / l * sep, p[1] - tx / l * sep]; });
  const out = pts.map((p, i) => { const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n]; const tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty); return [p[0] + ty / l * (sep + E3), p[1] - tx / l * (sep + E3)]; });
  // orientación: si el paralelo quedó adentro, lo invierto
  const ar = (P) => P.reduce((s, p, i) => s + p[0] * P[(i + 1) % P.length][1] - P[(i + 1) % P.length][0] * p[1], 0);
  let ext = out, inn = pts2; if (Math.abs(ar(out)) < Math.abs(ar(pts))) { ext = pts.map((p, i) => [2 * p[0] - out[i][0], 2 * p[1] - out[i][1]]); inn = pts.map((p, i) => [2 * p[0] - pts2[i][0], 2 * p[1] - pts2[i][1]]); }
  R.perfil(ext, [inn], f.a, M.inox, { A: [0, 0, 1], B: [1, 0, 0], C: [0, 1, 0], o: [0, 0, z - f.a / 2], bevel: .05, padre: g });
  const th = rad(op.th ?? 200), ph = [(rp + 1 + E3) * Math.cos(th), (rp + 1 + E3) * Math.sin(th), z];
  hebilla(R, ph, [Math.cos(th), Math.sin(th), 0], [-Math.sin(th), Math.cos(th), 0], { padre: g, cola: 10 });
  return { g, hebilla: ph };
}
