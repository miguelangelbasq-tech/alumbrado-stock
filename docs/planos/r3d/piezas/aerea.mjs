/* aerea.mjs · morsetería de línea preensamblada (grampas y ménsulas tipo LCT) y herrajes MN (H°G°) para poste de madera.
 * Medidas AC (proporcionales a catálogos de grampas ABC: ver FUENTES_cables.md). Geometría base: AER y MN de perfiles_cables.mjs.
 * Poste: eje z en el origen. La línea va en ±y (suspensión) o sale en +x (retención). */
import { AER, MN, HAZ } from './perfiles_cables.mjs';
import { tubo, cuerda, mats, hazPre } from './cables.mjs';

export function matsA(R) {
  if (R._ma) return R._ma; const T = R.THREE;
  R._ma = {
    horm: R.tipoCorte((() => { const m = R.M.arena(); m.color.set('#b9b8b1'); return m; })(), 'arena'),
    madera: (() => { const m = R.M.arena(); m.color.set('#6a4a30'); m.roughness = .85; return m; })(),
    galv: R.tipoCorte(R.M.aceroCinc(), 'metal'),
    inox: R.tipoCorte(new T.MeshPhysicalMaterial({ color: '#d7dbdf', metalness: 1, roughness: .22 }), 'metal'),
    alu: R.tipoCorte(new T.MeshPhysicalMaterial({ color: '#c3c8cc', metalness: .9, roughness: .45 }), 'metal'),
    plas: R.tipoCorte(R.M.pa('#2a2c30', { roughness: .5 }), 'plastico'),
    plasG: R.tipoCorte(R.M.pa('#8c9095', { roughness: .5 }), 'plastico'),
    porc: R.tipoCorte((() => { const m = R.M.ceramica(); m.color.set('#f2efe6'); m.roughness = .25; m.clearcoat = .8; return m; })(), 'ceramica'),
  };
  return R._ma;
}

/** poste de H°A° (troncocónico) de z0 a z1, radio en z0 r0 y conicidad k (mm/mm) */
export function posteHA(R, z0, z1, r0, k = .015) {
  const A = matsA(R); return R.torno([0, 0, z0], [0, 0, z1], [[0, 0], [r0, 0], [r0 - k * (z1 - z0), z1 - z0], [0, z1 - z0]], A.horm, { seg: 96 });
}
export function posteMadera(R, z0, z1, r0) {
  const A = matsA(R); const m = R.torno([0, 0, z0], [0, 0, z1], [[0, 0], [r0, 0], [r0 * .97, z1 - z0], [0, z1 - z0]], A.madera, { seg: 96 }); return m;
}
/** fleje inox 3/4" alrededor del poste (radio r) a la altura z, con hebilla del lado θh (grados) */
export function fleje(R, r, z, th = 200) {
  const A = matsA(R), f = AER.fleje;
  R.torno([0, 0, z - f.a / 2], [0, 0, z + f.a / 2], [[r + .35, 0], [r + .35 + f.e, 0], [r + .35 + f.e, f.a], [r + .35, f.a]], A.inox, { seg: 128 });
  const a = th * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  const g = R.grupo(); R.caja(-4, 4, -13, 13, -f.a / 2 - 2, f.a / 2 + 2, A.inox, { r: 1, padre: g }); g.position.set((r + 4) * c, (r + 4) * s, z); g.rotation.z = a;
  return g;
}

/** ménsula de suspensión (tipo PKS-30, AC): placa curva apoyada en el poste con 2 pasos de fleje + brazo + gancho abierto. Brazo en +x */
export function mensulaS(R, rp, zc) {
  const A = matsA(R), m = AER.mensS, g = R.grupo();
  // placa de apoyo (perfil en planta extruido en z)
  const arc = []; for (let i = 0; i <= 20; i++) { const a = (-25 + 50 * i / 20) * Math.PI / 180; arc.push([(rp + .5) * Math.cos(a), (rp + .5) * Math.sin(a)]); }
  const arc2 = arc.slice().reverse().map(([x, y]) => [x * (rp + 7) / (rp + .5), y * (rp + 7) / (rp + .5)]);
  R.perfil([...arc, ...arc2], [], m.h + 30, A.alu, { A: [0, 0, 1], B: [1, 0, 0], C: [0, 1, 0], o: [0, 0, zc - (m.h + 30) / 2], bevel: .6, padre: g });
  // pasos de fleje (resaltes)
  for (const dz of [-(m.h + 30) / 2 + 12, (m.h + 30) / 2 - 12]) R.caja(rp + 6, rp + 10, -18, 18, zc + dz - 11, zc + dz + 11, A.alu, { r: 1.5, padre: g });
  // brazo: perfil (x, z) en I extruido en y
  const x0 = rp + 6, x1 = rp + 6 + m.L;
  const br = [[x0, zc - m.h / 2], [x1 - 14, zc - 12], [x1, zc - 8], [x1, zc + 6], [x1 - 14, zc + 10], [x0, zc + m.h / 2]];
  R.perfil(br.map(([x, z]) => [x, z]), [], 14, A.alu, { A: [0, 1, 0], B: [1, 0, 0], C: [0, 0, 1], o: [0, -7, 0], bevel: .8, padre: g });
  // gancho (de donde cuelga la grampa)
  const hk = (t) => { const a = Math.PI * (1.1 - 1.2 * t); return [x1 - 6 + 9 * Math.cos(a), 0, zc - 8 + 9 * Math.sin(a) - 4]; };
  // curva paramétrica en t ∈ [0,1] (tubo usa x como parámetro: reparametrizo)
  const T = R.THREE; class C extends T.Curve { getPoint(t, o = new T.Vector3()) { const p = hk(t); return o.set(...p); } }
  const geo = new T.TubeGeometry(new C(), 40, 3.2, 20, false); const mh = new T.Mesh(geo, A.alu); mh.castShadow = true; g.add(mh);
  return { g, gancho: [x1 - 6, 0, zc - 21], x1 };
}

/** grampa de suspensión (tipo PKS-10CF, AC): cuerpo de termoplástico con cuna para el neutro portante y pieza de apriete. Cable en y */
export function grampaS(R, pc, rn) {
  const A = matsA(R), m = AER.grampaS, g = R.grupo();
  const [cx, cy, cz] = pc;   // centro del neutro
  // cuerpo: perfil (x, z) con la cuna (círculo del neutro) extruido en y
  const ci = (r, n = 40) => Array.from({ length: n }, (_, i) => [cx + r * Math.cos(2 * Math.PI * i / n), cz + r * Math.sin(2 * Math.PI * i / n)]);
  const cuerpo = [[cx - rn - 6, cz - rn - 7], [cx + rn + 6, cz - rn - 7], [cx + rn + 8, cz + 2], [cx + 6, cz + rn + 22], [cx - 6, cz + rn + 22], [cx - rn - 8, cz + 2]];
  const cav = [ci(rn + .3), [[cx - rn + 1, cz], [cx + rn - 1, cz], [cx + rn - 1, cz + rn + 3], [cx - rn + 1, cz + rn + 3]]];
  R.perfil(cuerpo, cav, m.L, A.plas, { A: [0, 1, 0], B: [1, 0, 0], C: [0, 0, 1], o: [0, cy - m.L / 2, 0], bevel: 1.2, padre: g });
  // ojo superior (anillo) que entra en el gancho de la ménsula
  R.torno([cx, cy - 4, cz + rn + 30], [cx, cy + 4, cz + rn + 30], [[6, 0], [11, 0], [11, 8], [6, 8]], A.plas, { seg: 40, padre: g });
  R.caja(cx - 5, cx + 5, cy - 4, cy + 4, cz + rn + 18, cz + rn + 21, A.plas, { r: 1, padre: g });
  // pieza de apriete (cuña) gris + 2 tornillos
  R.caja(cx - rn + 1.2, cx + rn - 1.2, cy - m.L / 2 + 8, cy + m.L / 2 - 8, cz + rn + .2, cz + rn + 6, A.plasG, { r: 1, padre: g });
  for (const dy of [-m.L / 2 + 14, m.L / 2 - 14]) R.tornillo([cx + rn + 7, cy + dy, cz + 4], [1, 0, 0], { M: 6, L: 2 * rn + 10, dk: 11, k: 4.5, tipo: 'combi', mat: A.galv, padre: g });
  return g;
}

/** ménsula de retención (tipo PKR-20, AC): placa al poste con pasos de fleje y un ojo para el fiador. Sale en +x */
export function mensulaR(R, rp, zc) {
  const A = matsA(R), m = AER.mensR, g = R.grupo();
  const arc = []; for (let i = 0; i <= 20; i++) { const a = (-22 + 44 * i / 20) * Math.PI / 180; arc.push([(rp + .5) * Math.cos(a), (rp + .5) * Math.sin(a)]); }
  const arc2 = arc.slice().reverse().map(([x, y]) => [x * (rp + 8) / (rp + .5), y * (rp + 8) / (rp + .5)]);
  R.perfil([...arc, ...arc2], [], m.h, A.alu, { A: [0, 0, 1], B: [1, 0, 0], C: [0, 1, 0], o: [0, 0, zc - m.h / 2], bevel: .6, padre: g });
  for (const dz of [-m.h / 2 + 12, m.h / 2 - 12]) R.caja(rp + 7, rp + 11, -17, 17, zc + dz - 11, zc + dz + 11, A.alu, { r: 1.5, padre: g });
  // oreja con ojo
  const x0 = rp + 7, x1 = rp + 7 + m.L;
  const prof = [[x0, zc - 22], [x1 - 14, zc - 12], [x1, zc - 8], [x1, zc + 8], [x1 - 14, zc + 12], [x0, zc + 22]];
  const ojo = Array.from({ length: 32 }, (_, i) => [x1 - 12 + 6.5 * Math.cos(2 * Math.PI * i / 32), zc + 6.5 * Math.sin(2 * Math.PI * i / 32)]);
  R.perfil(prof, [ojo], 12, A.alu, { A: [0, 1, 0], B: [1, 0, 0], C: [0, 0, 1], o: [0, -6, 0], bevel: .8, padre: g });
  return { g, ojo: [x1 - 12, 0, zc] };
}

/** grampa de retención de cuña (tipo PKD-20 / PRA-1500, AC): cuerpo cónico abierto, 2 cuñas que muerden el neutro y fiador inox.
 *  El neutro va en +x desde x0 (boca chica, lado poste) */
export function grampaR(R, x0, zc, rn, ojo) {
  const A = matsA(R), m = AER.grampaR, g = R.grupo(), T = R.THREE;
  const Lc = 110;   // cuerpo
  // cuerpo: tronco de cono abierto arriba (canal), aluminio
  const body = R.torno([x0, 0, zc], [x0 + Lc, 0, zc], [[rn + 1.5, 0], [rn + 8, 0], [rn + 15, Lc], [rn + 10.2, Lc], [rn + 1.5, 0]], A.alu, { seg: 48, padre: g });
  // cuñas (2 mitades) de termoplástico, que asoman por la boca grande
  for (const s of [-1, 1]) {
    const w = R.torno([x0 + 8, 0, zc], [x0 + Lc + 14, 0, zc], [[rn + .3, 0], [rn + 4.2, 0], [rn + 9.6, Lc + 6], [rn + .3, Lc + 6]], A.plas, { seg: 40, padre: g });
    w.scale.set(1, 1, 1);
    // separo las mitades con un corte (CSG): la mitad s mantiene solo |y| de un lado
    const box = R.caja(x0 - 10, x0 + Lc + 30, s > 0 ? -60 : .8, s > 0 ? -.8 : 60, zc - 60, zc + 60, A.plas, { padre: null, r: 0 });
    const r2 = R.restarCSG(w, box, A.plas); g.remove(w); g.add(r2);
  }
  // fiador (bail) de acero inox: lazo que va del cuerpo al ojo de la ménsula
  const p0 = [x0 + 6, 0, zc];
  const bail = (s) => (t) => {
    const a = [x0 + 18, s * (rn + 11), zc], b = [ojo[0] + 2, s * 2.5, ojo[2]];
    if (t < .85) { const u = t / .85; return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u]; }
    const u = (t - .85) / .15; const ang = Math.PI / 2 * (1 - u) * (s > 0 ? 1 : -1); return [b[0] - 4 * Math.sin(Math.PI * u), b[1] * (1 - u), b[2]];
  };
  for (const s of [-1, 1]) { class C extends T.Curve { getPoint(t, o = new T.Vector3()) { return o.set(...bail(s)(t)); } }
    const mh = new T.Mesh(new T.TubeGeometry(new C(), 50, 3, 16, false), A.inox); mh.castShadow = true; g.add(mh); }
  // tramo del fiador que abraza el cuerpo
  R.torno([x0 + 16, 0, zc], [x0 + 21, 0, zc], [[rn + 8.2, 0], [rn + 11.5, 0], [rn + 11.5, 6], [rn + 8.2, 6]], A.inox, { seg: 48, padre: g });
  return { g, Lc };
}

// ================= herrajes MN (H°G°) =================
/** rosca insinuada: anillos de torno a lo largo de p0→p1 */
function rosca(R, p0, p1, r, mat, paso = 2, op = {}) {
  const T = R.THREE, a = new T.Vector3(...p0), b = new T.Vector3(...p1), L = a.distanceTo(b); const pf = [[0, 0]];
  const n = Math.floor(L / paso); for (let i = 0; i <= n; i++) { pf.push([r, i * paso]); if (i < n) pf.push([r * .86, i * paso + paso / 2]); }
  pf.push([r * .8, L]); pf.push([0, L]);
  return R.torno(p0, p1, pf, mat, { seg: 32, padre: op.padre });
}
export { rosca };
function hexN(R, p0, p1, af, mat, padre) { return R.cil(p0, p1, af / Math.sqrt(3), mat, { seg: 6, padre }); }
function toro(R, c, eje, Rm, r, mat, padre) {
  const T = R.THREE; const m = new T.Mesh(new T.TorusGeometry(Rm, r, 24, 64), mat); m.position.set(...c);
  m.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), new T.Vector3(...eje).normalize()); m.castShadow = m.receiveShadow = true; (padre || R.raiz).add(m); return m;
}
/** bulón de ojo MN 505: ojo en p (plano del ojo con normal 'n'), vástago hacia dir, largo L, con tuerca y arandela cuadrada a 'dt' del ojo */
export function bulonOjo(R, p, dir, L, op = {}) {
  const A = matsA(R), B = MN.bulonOjo, T = R.THREE, g = R.grupo(op.padre);
  const d = new T.Vector3(...dir).normalize(), P = new T.Vector3(...p);
  const n = op.n || [0, 0, 1];
  const rm = (B.ojoRi + B.ojoRe) / 2, rt = (B.ojoRe - B.ojoRi) / 2;
  toro(R, P.toArray(), n, rm, rt, A.galv, g);
  const s0 = P.clone().addScaledVector(d, rm + rt * .6), s1 = P.clone().addScaledVector(d, rm + L);
  R.cil(s0.toArray(), P.clone().addScaledVector(d, rm + L * .45).toArray(), B.M / 2, A.galv, { seg: 32, padre: g });
  rosca(R, P.clone().addScaledVector(d, rm + L * .45).toArray(), s1.toArray(), B.M / 2, A.galv, 2.2, { padre: g });
  if (op.dt) {
    const q = P.clone().addScaledVector(d, rm + op.dt);
    if (op.arandela !== false) arandela(R, q.toArray(), d.toArray(), g);
    hexN(R, q.clone().addScaledVector(d, MN.arandela.e).toArray(), q.clone().addScaledVector(d, MN.arandela.e + 11).toArray(), B.tuerca, A.galv, g);
  }
  return g;
}
export function arandela(R, p, dir, padre) {
  const A = matsA(R), W = MN.arandela, T = R.THREE;
  const d = new T.Vector3(...dir).normalize();
  const sq = [[-W.a / 2, -W.a / 2], [W.a / 2, -W.a / 2], [W.a / 2, W.a / 2], [-W.a / 2, W.a / 2]];
  const ho = Array.from({ length: 32 }, (_, i) => [W.agujero / 2 * Math.cos(2 * Math.PI * i / 32), W.agujero / 2 * Math.sin(2 * Math.PI * i / 32)]);
  // base: A = d, B y C perpendiculares
  const up = Math.abs(d.z) > .9 ? new T.Vector3(1, 0, 0) : new T.Vector3(0, 0, 1);
  const Bv = new T.Vector3().crossVectors(up, d).normalize(), Cv = new T.Vector3().crossVectors(d, Bv);
  return R.perfil(sq, [ho], W.e, A.galv, { A: d.toArray(), B: Bv.toArray(), C: Cv.toArray(), o: p, bevel: .4, padre });
}
/** ojal MN 377 (AC): ojo + vástago roscado */
export function ojal(R, p, dir, op = {}) {
  const A = matsA(R), O = MN.ojal, T = R.THREE, g = R.grupo(op.padre);
  const d = new T.Vector3(...dir).normalize(), P = new T.Vector3(...p);
  const rm = (O.ojoRi + O.ojoRe) / 2, rt = (O.ojoRe - O.ojoRi) / 2;
  toro(R, P.toArray(), op.n || [0, 0, 1], rm, rt, A.galv, g);
  R.torno(P.clone().addScaledVector(d, rm).toArray(), P.clone().addScaledVector(d, rm + 14).toArray(), [[0, 0], [rt * 1.6, 0], [O.M / 2 + 1, 14], [0, 14]], A.galv, { padre: g, seg: 32 });
  rosca(R, P.clone().addScaledVector(d, rm + 14).toArray(), P.clone().addScaledVector(d, rm + O.L).toArray(), O.M / 2, A.galv, 2, { padre: g });
  return g;
}
/** tirafondo MN 520: cabeza cuadrada, vástago, rosca para madera (filete helicoidal) y punta cónica */
export function tirafondo(R, p, dir, op = {}) {
  const A = matsA(R), F = MN.tirafondo, T = R.THREE, g = R.grupo(op.padre);
  const d = new T.Vector3(...dir).normalize(), P = new T.Vector3(...p);
  const up = Math.abs(d.z) > .9 ? new T.Vector3(1, 0, 0) : new T.Vector3(0, 0, 1);
  const Bv = new T.Vector3().crossVectors(up, d).normalize(), Cv = new T.Vector3().crossVectors(d, Bv);
  const h = F.cab / 2; R.perfil([[-h, -h], [h, -h], [h, h], [-h, h]], [], F.k, A.galv, { A: d.toArray(), B: Bv.toArray(), C: Cv.toArray(), o: P.toArray(), bevel: .8, padre: g });
  const r = F.d / 2, L = F.L, Ll = L * .4;
  R.cil(P.clone().addScaledVector(d, F.k).toArray(), P.clone().addScaledVector(d, F.k + Ll).toArray(), r, A.galv, { seg: 32, padre: g });
  const core = r * .72;
  R.torno(P.clone().addScaledVector(d, F.k + Ll).toArray(), P.clone().addScaledVector(d, F.k + L).toArray(), [[0, 0], [core, 0], [core, L - Ll - 12], [.6, L - Ll], [0, L - Ll]], A.galv, { seg: 32, padre: g });
  // filete helicoidal
  const paso = 5.5, x0 = F.k + Ll, x1 = F.k + L - 4;
  const f = (s) => { const t = x0 + (x1 - x0) * s; const rr = t > x1 - 12 ? core + (r - core) * (x1 - t) / 12 : r - .4; const a = 2 * Math.PI * (t - x0) / paso;
    const q = P.clone().addScaledVector(d, t).addScaledVector(Bv, rr * Math.cos(a)).addScaledVector(Cv, rr * Math.sin(a)); return [q.x, q.y, q.z]; };
  tubo(R, f, 0, 1, .9, A.galv, { padre: g, segs: 600, rad: 8 });
  return g;
}
/** aislador carretel MN 16 (AC) de eje 'dir' centrado en p */
export function aisladorMN(R, p, dir, op = {}) {
  const A = matsA(R), I = MN.aislador; const H = I.H, r1 = I.Dmax / 2, r2 = I.Dcuello / 2, ra = I.agujero / 2;
  const T = R.THREE, d = new T.Vector3(...dir).normalize(), P = new T.Vector3(...p);
  const pf = [[ra, 0], [r1 - 4, 0], [r1, 4], [r1, 14], [r1 - 3, 18], [r2 + 2, 26], [r2, 32], [r2, H - 32], [r2 + 2, H - 26], [r1 - 3, H - 18], [r1, H - 14], [r1, H - 4], [r1 - 4, H], [ra, H], [ra, 0]];
  return R.torno(P.clone().addScaledVector(d, -H / 2).toArray(), P.clone().addScaledVector(d, H / 2).toArray(), pf, A.porc, { seg: 72, padre: op.padre });
}
/** rack MN 4B2L para un aislador (AC): planchuela en U de H°G° con perno vertical. Se apoya en el poste en x = x0 (sale en +x) */
export function rack(R, x0, zc, op = {}) {
  const A = matsA(R), K = MN.rack, I = MN.aislador, g = R.grupo(op.padre);
  const sal = I.Dmax / 2 + 22, H2 = I.H / 2 + K.e + 2;
  // base vertical
  R.caja(x0, x0 + K.e, -K.a / 2, K.a / 2, zc - H2 - 40, zc + H2 + 40, A.galv, { r: 1, padre: g });
  // brazos arriba y abajo
  for (const s of [-1, 1]) R.caja(x0, x0 + sal + I.Dmax / 2 + 6, -K.a / 2, K.a / 2, zc + s * H2 - (s > 0 ? 0 : K.e), zc + s * H2 + (s > 0 ? K.e : 0), A.galv, { r: 1, padre: g });
  // perno (pasador) vertical con chaveta
  const xp = x0 + sal + 6;
  R.cil([xp, 0, zc - H2 - 10], [xp, 0, zc + H2 + 10], 7, A.galv, { seg: 32, padre: g });
  R.cil([xp, 0, zc + H2 + K.e], [xp, 0, zc + H2 + K.e + 5], 11, A.galv, { seg: 32, padre: g });
  aisladorMN(R, [xp, 0, zc], [0, 0, 1], { padre: g });
  return { g, xp, sal };
}
