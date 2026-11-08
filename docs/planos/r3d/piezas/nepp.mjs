/* nepp.mjs · piezas 3D del grupo «nepp» (EPP e instrumentos). Geometría: perfiles_nepp.mjs (la misma del plano).
 * No toca lib/r3d.mjs ni piezas de otros grupos. */
import { MANO, PUNOS, GUANTES, dedosDe, ALF, ANT, lenteSuave, TAP, tapPerfil, ALT, PINZA, pinzaContorno, NCV, UT, BP } from './perfiles_nepp.mjs';

const rad = (g) => g * Math.PI / 180;

/** materiales del grupo: cada uno con su color y textura (regla de Ángel: nunca dos vecinos parecidos) */
export function matsN(R) {
  if (R._mn) return R._mn;
  const pa = R.M.pa, T = R.THREE;
  // piezas grandes (guantes, cintas, alfombra): material liso sin el ruido de 2 ciclos/mm (a 1 px/mm titila); tela con «sheen»
  const liso = (c, o = {}) => new T.MeshPhysicalMaterial({ color: c, roughness: .8, metalness: 0, ...o });
  const rug = (c, o = {}) => liso(c, { roughness: .9, sheen: .6, sheenRoughness: .8, sheenColor: new T.Color(c).lerp(new T.Color('#ffffff'), .4), ...o });
  const M = {
    gomaRoja: R.tipoCorte(liso('#b52a22', { roughness: .5, clearcoat: .35, clearcoatRoughness: .45 }), 'plastico'),     // goma natural clase 0 (AC color)
    algodon: R.tipoCorte(rug('#efe8d8'), 'plastico'),
    vaqueta: R.tipoCorte(liso('#c49a5e', { roughness: .62, clearcoat: .15, clearcoatRoughness: .6 }), 'plastico'),
    amarillo: R.tipoCorte(liso('#e2b021', { roughness: .62, clearcoat: .15, clearcoatRoughness: .6 }), 'plastico'),
    descarne: R.tipoCorte(rug('#9e8f78', { roughness: .97 }), 'plastico'),
    tejidoG: R.tipoCorte(rug('#d9dbde'), 'plastico'),
    tejidoB: R.tipoCorte(rug('#f1f1ee'), 'plastico'),
    nitrilo: R.tipoCorte(liso('#244f9e', { roughness: .42, clearcoat: .5, clearcoatRoughness: .3 }), 'plastico'),
    pvcAzul: pa('#1f5fb3', { roughness: .4, clearcoat: .4 }),
    costura: pa('#5a4630', { roughness: .8 }),
    alfombra: R.tipoCorte(liso('#2b2d30', { roughness: .75 }), 'plastico'),
    poli: R.tipoCorte(pa('#22252a', { roughness: .4, clearcoat: .4 }), 'plastico'),         // montura / cuerpo negro
    lenteC: new T.MeshPhysicalMaterial({ color: '#dfeef6', roughness: .04, metalness: 0, transparent: true, opacity: .32, clearcoat: 1, side: T.DoubleSide, depthWrite: false }),
    espuma: R.tipoCorte(rug('#f07a1a', { roughness: .95 }), 'plastico'),
    cordon: pa('#2f6fd0', { roughness: .6 }),
    cintaN: R.tipoCorte(rug('#1d2a44', { roughness: .85 }), 'plastico'),     // cinta de poliéster azul oscuro
    cintaR: R.tipoCorte(rug('#c8402e', { roughness: .85 }), 'plastico'),     // cinta roja del absorbedor / cola
    cuerda: rug('#e9e4d6', { roughness: .85 }),
    bolsa: R.tipoCorte(pa('#151618', { roughness: .55, clearcoat: .2 }), 'plastico'),
    acero: R.tipoCorte(R.M.aceroCinc(), 'metal'), alu: R.tipoCorte(pa('#c9ced3', { metalness: 1, roughness: .32, clearcoat: 0 }), 'metal'),
    aluAz: pa('#3a68b8', { metalness: .7, roughness: .35 }),
    amarilloI: R.tipoCorte(pa('#f2c21b', { roughness: .45, clearcoat: .2 }), 'plastico'),   // carcasa amarilla de instrumento
    grisI: R.tipoCorte(pa('#34373c', { roughness: .55 }), 'plastico'),
    gomaN: R.tipoCorte(R.M.goma('#202124'), 'plastico'),
    rojoI: R.tipoCorte(pa('#c8261f', { roughness: .45, clearcoat: .25 }), 'plastico'),
    lcd: new T.MeshPhysicalMaterial({ color: '#9fa98f', roughness: .2, metalness: 0, clearcoat: 1 }),
    lcdOsc: new T.MeshPhysicalMaterial({ color: '#2a2e2c', roughness: .15, clearcoat: 1 }),
    transp: new T.MeshPhysicalMaterial({ color: '#ffffff', roughness: .08, transparent: true, opacity: .35, clearcoat: 1, depthWrite: false }),
    transpR: new T.MeshPhysicalMaterial({ color: '#ff6a5a', roughness: .1, transparent: true, opacity: .55, clearcoat: 1, depthWrite: false }),
    neon: new T.MeshPhysicalMaterial({ color: '#ff7a2e', emissive: '#ff5a10', emissiveIntensity: .6, roughness: .2, transparent: true, opacity: .9 }),
    ledV: new T.MeshPhysicalMaterial({ color: '#4cd36a', emissive: '#2fbf4f', emissiveIntensity: .4, roughness: .2 }),
    ledR: new T.MeshPhysicalMaterial({ color: '#ff4b3e', emissive: '#e8261a', emissiveIntensity: .5, roughness: .2 }),
    latonNiq: R.tipoCorte(R.M.latonNiq(), 'metal'), cromo: R.tipoCorte(R.M.plata(), 'metal'),
    acHoja: R.tipoCorte(pa('#8f979e', { metalness: 1, roughness: .3, clearcoat: 0 }), 'metal'),
  };
  R._mn = M; return M;
}

/** escenas grandes (guantes, alfombra, cintas de 2 m): la cámara queda lejos y el near = 0,1 de la librería come la precisión de
 *  profundidad (z-fighting). Achico TODO el mundo por k (R.raiz.scale) y devuelvo ancla / cortar que trabajan en mm. */
export function escala(R, k) {
  R.raiz.scale.setScalar(k); const a0 = R.ancla, c0 = R.cortar;
  return {
    k, ancla: (n, p) => a0(n, p.map(x => x * k)),
    cortar: (g, c) => { R.raiz.updateMatrixWorld(true); return c0(g, c.map(x => x * k)); },
  };
}

/* ================= GUANTES ================= */
/** guante plano (palma hacia +z), u → x, v → y. op: { mat, padre, motas, nitrilo, costuras, marca } — devuelve el grupo */
export function guante(R, key, op = {}) {
  const T = R.THREE, G = GUANTES[key], s = G.s, P = PUNOS[G.puno], Mn = MANO, M = matsN(R);
  const g = R.grupo(op.padre); const mat = op.mat;
  // mano (achatada en z)
  const mano = R.grupo(g); mano.scale.z = Mn.kz;
  const pl = Mn.palma, tz = pl.t / 2 / Mn.kz;
  if (!op.soloPuno) R.caja(pl.u0 * s, pl.u1 * s, pl.v0 * s, pl.v1 * s, -tz * s, tz * s, mat, { r: pl.r * s * .95, padre: mano });
  for (const d of (op.soloPuno ? [] : dedosDe(s))) {
    const L = Math.hypot(d.p1[0] - d.p0[0], d.p1[1] - d.p0[1]), r = d.r, pf = [];
    const rp = r * .86;   // el dedo se afina hacia la punta (AC)
    for (let i = 0; i <= 8; i++) { const t = -Math.PI / 2 + Math.PI / 2 * i / 8; pf.push([r * Math.cos(t), r + r * Math.sin(t)]); }   // base redonda
    for (let k = 1; k <= 6; k++) pf.push([r + (rp - r) * k / 6, r + L * k / 6 * .92]);
    for (let i = 0; i <= 10; i++) { const t = Math.PI / 2 * i / 10; pf.push([rp * Math.cos(t), r + L + (rp) * Math.sin(t) - (r - rp)]); }
    const dir = [(d.p1[0] - d.p0[0]) / L, (d.p1[1] - d.p0[1]) / L];
    const a = [d.p0[0] - dir[0] * r, d.p0[1] - dir[1] * r, 0], b = [d.p1[0] + dir[0] * r, d.p1[1] + dir[1] * r, 0];
    R.torno(a, b, pf.map(([rr, t]) => [rr, t]), mat, { padre: mano, seg: 40 });
  }
  // puño (cáscara elíptica)
  const pu = R.grupo(g); pu.scale.z = P.kz;
  const e = Math.max(G.e || 1.2, 2.2) / P.kz;   // espesor visible en la boca
  const Lp = 6 - P.v0;
  R.torno([0, P.v0, 0], [0, 6 + 4, 0], [[P.wA / 2 - e, 0], [P.wA / 2, 0], [P.wB / 2, Lp], [P.wB / 2 * .9, Lp + 4], [P.wB / 2 * .9 - e, Lp + 4], [P.wB / 2 - e, Lp], [P.wA / 2 - e, .01]], mat, { padre: pu, seg: 72 });
  // fondo oscuro del interior (que la boca no deje ver el piso a través del puño)
  if (!op.sinFondo) { const v = P.v0 + 28, w = P.wA + (P.wB - P.wA) * 28 / Lp; const dg = new T.CircleGeometry(w / 2 - e * 1.2, 48); dg.rotateX(Math.PI / 2); dg.translate(0, v, 0); const dm = new T.Mesh(dg, new T.MeshStandardMaterial({ color: '#2a2622', roughness: 1, side: T.DoubleSide })); pu.add(dm); R.sinBorde(dm); }
  if (P.borde === 'enrollado' || P.borde === 'elastico' || P.borde === 'dobladillo') {
    const rr = P.borde === 'enrollado' ? 2.4 : P.borde === 'elastico' ? 1.6 : 1.3;
    const anillo = (v, R0, r0, m) => { const tg = new T.TorusGeometry(R0, r0, 14, 96); tg.rotateX(Math.PI / 2); tg.translate(0, v, 0); tg.deleteAttribute('uv'); const ms = new T.Mesh(tg, m); ms.castShadow = ms.receiveShadow = true; pu.add(ms); return ms; };
    anillo(P.v0 + rr * .6, P.wA / 2 - e / 2, rr, mat);
    if (P.borde === 'elastico') for (let k = 1; k <= 4; k++) { const v = P.v0 + k * (Lp - 6) / 5; const w = P.wA + (P.wB - P.wA) * (v - P.v0) / Lp; anillo(v, w / 2, 1.2, mat); }
  }
  // motas de PVC (9008) en la palma y en los dedos
  if (op.motas) {
    const pm = R.grupo(g); const zt = pl.t / 2 * s - .2;
    for (let u = pl.u0 * s + 12; u <= pl.u1 * s - 10; u += 11) for (let v = pl.v0 * s + 12; v <= pl.v1 * s - 6; v += 11)
      R.cil([u + (Math.round(v / 11) % 2) * 5.5, v, zt], [u + (Math.round(v / 11) % 2) * 5.5, v, zt + 1.6], 2.6, op.motas, { padre: pm, seg: 16 });
    for (const d of dedosDe(s)) { const L = Math.hypot(d.p1[0] - d.p0[0], d.p1[1] - d.p0[1]); for (let t = 14; t < L + 2; t += 11) { const f = t / L; const x = d.p0[0] + (d.p1[0] - d.p0[0]) * f, y = d.p0[1] + (d.p1[1] - d.p0[1]) * f; R.cil([x, y, d.r * Mn.kz - .3], [x, y, d.r * Mn.kz + 1.3], 2.4, op.motas, { padre: pm, seg: 16 }); } }
  }
  // baño de nitrilo en la palma (9007): cáscara un poco mayor, solo la mitad de arriba (palma) y la punta de los dedos
  if (op.nitrilo) {
    const cap = R.grupo(g); cap.scale.z = Mn.kz; const k = 1.025;
    R.caja(pl.u0 * s * k, pl.u1 * s * k, pl.v0 * s * k, pl.v1 * s * k, 0, tz * s * k, op.nitrilo, { r: Math.min(pl.r * s * .95, tz * s * k - .1), padre: cap });
    for (const d of dedosDe(s)) {
      const L = Math.hypot(d.p1[0] - d.p0[0], d.p1[1] - d.p0[1]), r = d.r * 1.06, dir = [(d.p1[0] - d.p0[0]) / L, (d.p1[1] - d.p0[1]) / L];
      const pf = []; for (let i = 0; i <= 8; i++) { const t = -Math.PI / 2 + Math.PI / 2 * i / 8; pf.push([r * Math.cos(t), r + r * Math.sin(t)]); }
      for (let i = 0; i <= 10; i++) { const t = Math.PI / 2 * i / 10; pf.push([r * Math.cos(t), r + L + r * Math.sin(t)]); }
      const m = R.torno([d.p0[0] - dir[0] * r, d.p0[1] - dir[1] * r, 0], [d.p1[0] + dir[0] * r, d.p1[1] + dir[1] * r, 0], pf, op.nitrilo, { padre: cap, seg: 40 });
      m.userData.dedo = d;
    }
    R.cortar(cap, [-400, 400, -400, 400, -400, -.01]);   // queda la mitad de la palma
  }
  // costura central del dorso / del descarne (puntadas)
  if (op.costuras) {
    const cg = R.grupo(g); const zt = pl.t / 2 * s + .1;
    for (let v = pl.v0 * s + 4; v < pl.v1 * s - 4; v += 7) R.caja(-pl.u1 * s * .55 - .7, -pl.u1 * s * .55 + .7, v, v + 4, zt - .6, zt + .5, op.costuras, { r: .3, padre: cg });
    for (let v = P.v0 + 8; v < 0; v += 7) { const w = P.wA + (P.wB - P.wA) * (v - P.v0) / (6 - P.v0); R.caja(w / 2 - 6, w / 2 - 4.6, v, v + 4, w / 2 * P.kz - .8, w / 2 * P.kz + .6, op.costuras, { r: .3, padre: cg }); }
  }
  g.userData.zTop = pl.t / 2 * s;
  g.traverse(o => { if (o.isMesh) o.receiveShadow = false; });
  return g;
}

/** alfombra con nervaduras (z = 0 abajo). x0..x1 a lo ancho de las nervaduras (que corren en y) */
export function alfombra(R, x0, x1, y0, y1, op = {}) {
  const M = matsN(R), A = ALF, base = A.e - A.nerv.alto, g = R.grupo(op.padre);
  R.caja(x0, x1, y0, y1, 0, base, M.alfombra, { r: .6, padre: g });
  const ng = R.grupo(g);
  for (let x = x0 + A.nerv.paso / 2; x < x1 - A.nerv.ancho; x += A.nerv.paso) R.caja(x, x + A.nerv.ancho, y0 + 1, y1 - 1, base - .05, A.e, M.alfombra, { r: .3, padre: ng });
  R.sinBorde(ng);
  return g;
}

/* ================= ANTEOJO Y TAPONES ================= */
export function anteojo(R, op = {}) {
  const M = matsN(R), A = ANT, T = R.THREE, g = R.grupo(op.padre);
  for (const sg of [1, -1]) {
    const lente = lenteSuave().map(([u, v]) => [sg * u, v]); if (sg < 0) lente.reverse();
    // lente: perfil extruido en y (espesor), girado por la «envolvente»
    const lg = R.grupo(g); lg.rotation.z = sg * rad(A.curva); lg.position.set(sg * 6, 0, 0);
    const m = R.perfil(lente.map(([u, v]) => [u - sg * 6, v]), [], A.e, M.lenteC, { A: [0, 1, 0], B: [1, 0, 0], C: [0, 0, 1], bevel: .4, padre: lg });
    m.userData.noCortar = true;
    // ceja de la montura arriba (marco superior)
    const ceja = []; for (const [u, v] of lente) if (v > 8) ceja.push([u - sg * 6, v]);
    ceja.sort((a, b) => a[0] - b[0]);
    const top = ceja.map(([u, v]) => [u, v + 1.2]), bot = ceja.slice().reverse().map(([u, v]) => [u, v - 2.6]);
    R.perfil(top.concat(bot), [], 4, M.poli, { A: [0, 1, 0], B: [1, 0, 0], C: [0, 0, 1], a0: -1.4, bevel: .5, padre: lg });
    // patilla con bisagra
    const xb = sg * (A.ancho / 2), Pt = A.patilla;
    const pat = [[0, -Pt.h0 / 2], [Pt.L * .7, -Pt.h1 / 2], [Pt.L, -Pt.h1 / 2 - Pt.caida], [Pt.L + 4, -Pt.h1 / 2 - Pt.caida + 3], [Pt.L * .72, Pt.h1 / 2], [0, Pt.h0 / 2]];
    R.perfil(pat.map(([t, v]) => [t, v + 12]), [], Pt.t, M.poli, { A: [sg, 0, 0], B: [0, 1, 0], C: [0, 0, 1], o: [xb - sg * Pt.t, 0, 0], bevel: .8, padre: g });
    R.caja(Math.min(xb, xb - sg * 9), Math.max(xb, xb - sg * 9), -2, 8, 12 - 7, 12 + 7, M.poli, { r: 1.5, padre: g });
  }
  // puente
  R.caja(-A.puente.w / 2, A.puente.w / 2, -1, 4, 14, 26, M.poli, { r: 2, padre: g });
  // apoyos de nariz
  for (const sg of [1, -1]) R.caja(sg * 6 - 2.5, sg * 6 + 2.5, 1, 8, -14, 2, M.gomaN, { r: 2, padre: g });
  R.texto('Z87+', [-46, -1.6, -18], [1, 0, 0], [0, 0, 1], M.poli, { size: 3.2, prof: .25, padre: g });
  return g;
}
export function tapon(R, p0, dir, op = {}) {
  const M = matsN(R); const L = TAP.L; const d = new R.THREE.Vector3(...dir).normalize();
  return R.torno(p0, [p0[0] + d.x * L, p0[1] + d.y * L, p0[2] + d.z * L], tapPerfil(), M.espuma, { padre: op.padre, seg: 48 });
}

/* ================= CURVAS: tubos y cintas ================= */
export function tubo(R, pts, r, mat, op = {}) {
  const T = R.THREE; const c = new T.CatmullRomCurve3(pts.map(p => new T.Vector3(...p)), !!op.cerrado, 'catmullrom', op.tension ?? .5);
  const g = new T.TubeGeometry(c, op.seg || Math.max(32, pts.length * 12), r, op.rseg || 18, !!op.cerrado); g.deleteAttribute('uv');
  const m = new T.Mesh(g, mat); m.castShadow = m.receiveShadow = true; (op.padre || R.raiz).add(m); if (op.sinBorde !== false) R.sinBorde(m); return m;
}
/** cinta plana a lo largo de una curva (ancho a, espesor e), «arriba» = up */
export function cinta(R, pts, a, e, mat, op = {}) {
  const T = R.THREE; const c = new T.CatmullRomCurve3(pts.map(p => new T.Vector3(...p)), false, 'catmullrom', op.tension ?? .5);
  const n = op.seg || Math.max(40, pts.length * 14); const up = new T.Vector3(...(op.up || [0, 0, 1]));
  const pos = [], idx = [];
  for (let i = 0; i <= n; i++) {
    const p = c.getPoint(i / n), t = c.getTangent(i / n); const s = new T.Vector3().crossVectors(t, up).normalize(); const u = new T.Vector3().crossVectors(s, t).normalize();
    for (const [ks, ku] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { const q = p.clone().addScaledVector(s, ks * a / 2).addScaledVector(u, ku * e / 2); pos.push(q.x, q.y, q.z); }
  }
  for (let i = 0; i < n; i++) for (let k = 0; k < 4; k++) { const a0 = i * 4 + k, a1 = i * 4 + (k + 1) % 4, b0 = a0 + 4, b1 = a1 + 4; idx.push(a0, b0, a1, a1, b0, b1); }
  const cap = (o, inv) => { if (inv) idx.push(o, o + 2, o + 1, o, o + 3, o + 2); else idx.push(o, o + 1, o + 2, o, o + 2, o + 3); };
  cap(0, false); cap(n * 4, true);
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = new T.Mesh(g, mat); m.castShadow = m.receiveShadow = true; (op.padre || R.raiz).add(m); R.sinBorde(m); return { mesh: m, curva: c };
}

/* ================= CONECTORES DE ALTURA ================= */
/** mosquetón de acero con seguro a rosca: en el plano (u = dir1, v = dir2) con origen en p (base) */
export function mosqueton(R, p, du, dv, op = {}) {
  const M = matsN(R), T = R.THREE, Q = ALT.mosq, r = Q.d / 2;
  const U = new T.Vector3(...du).normalize(), Vv = new T.Vector3(...dv).normalize(), O = new T.Vector3(...p);
  const P = (u, v, w = 0) => { const N = U.clone().cross(Vv); return O.clone().addScaledVector(U, u).addScaledVector(Vv, v).addScaledVector(N, w).toArray(); };
  const g = R.grupo(op.padre), a = Q.a - Q.d, h = Q.L - Q.d;
  // cuerpo: C abierta en el lado u = a (el gatillo)
  const pts = []; const R1 = a / 2, r2 = a * .32;
  pts.push(P(a, h - R1 - 18));
  for (let i = 0; i <= 10; i++) { const t = Math.PI * i / 10; pts.push(P(R1 + R1 * Math.cos(t), h - R1 + R1 * Math.sin(t))); }
  pts.push(P(0, h * .45)); for (let i = 1; i <= 6; i++) { const t = Math.PI + Math.PI / 2 * i / 6; pts.push(P(r2 + r2 * Math.cos(t), r2 + r2 * Math.sin(t))); }
  pts.push(P(a * .7, 0)); pts.push(P(a - 2, 5));
  tubo(R, pts, r, M.acero, { padre: g, tension: .35, sinBorde: true });
  // gatillo + virola de seguro
  R.cil(P(a - 1, 8), P(a, h - R1 - 20), r * .8, M.acero, { padre: g, seg: 24 });
  R.cil(P(a - .8, 12), P(a - .4, 36), r * 1.45, M.acero, { padre: g, seg: 32 });
  g.userData.P = P; return g;
}
/** gancho de andamio de aluminio (J con gatillo y palanca de doble traba) */
export function gancho(R, p, du, dv, op = {}) {
  const M = matsN(R), T = R.THREE, G = ALT.gancho;
  const U = new T.Vector3(...du).normalize(), Vv = new T.Vector3(...dv).normalize(), O = new T.Vector3(...p), N = U.clone().cross(Vv);
  const P = (u, v, w = 0) => O.clone().addScaledVector(U, u).addScaledVector(Vv, v).addScaledVector(N, w).toArray();
  const g = R.grupo(op.padre), r = G.d / 2, Rb = (G.apertura + G.d) / 2, v1 = G.L - Rb - G.d / 2 - 10;
  const pts = [P(0, 22)];
  pts.push(P(0, v1));
  for (let i = 1; i <= 12; i++) { const t = Math.PI - Math.PI * i / 12; pts.push(P(Rb + Rb * Math.cos(t), v1 + Rb * Math.sin(t))); }
  pts.push(P(2 * Rb, v1 - 26)); pts.push(P(2 * Rb - 7, v1 - 38));
  tubo(R, pts, r, M.alu, { padre: g, tension: .3 });
  // ojo de abajo para la cinta
  const ojo = []; for (let i = 0; i <= 20; i++) { const t = 2 * Math.PI * i / 20; ojo.push(P(14 * Math.sin(t), 22 - 14 + 14 * Math.cos(t) - 14 + 14)); }
  tubo(R, [P(0, 22), P(-14, 12), P(-10, -4), P(0, -8), P(10, -4), P(14, 12), P(0, 22)], r * .8, M.alu, { padre: g, cerrado: true, tension: .5 });
  // gatillo (lengüeta) del pico a la caña, y palanca de traba sobre la caña
  R.cil(P(2 * Rb - 8, v1 - 36), P(r + 2, v1 - 46), r * .75, M.aluAz, { padre: g, seg: 24 });
  const lev = R.cil(P(-r - 1.2, 40), P(-r - 1.2, v1 - 30), r * .7, M.aluAz, { padre: g, seg: 24 });
  g.userData.P = P; g.userData.v1 = v1; g.userData.Rb = Rb; return g;
}
/** anillo D forjado (plano u-v, recto en v = 0) */
export function anilloD(R, p, du, dv, op = {}) {
  const M = matsN(R), T = R.THREE, D = ALT.anilloD;
  const U = new T.Vector3(...du).normalize(), Vv = new T.Vector3(...dv).normalize(), O = new T.Vector3(...p), N = U.clone().cross(Vv);
  const P = (u, v) => O.clone().addScaledVector(U, u).addScaledVector(Vv, v).toArray();
  const a = D.a - D.d, h = D.h - D.d; const pts = [];
  for (let i = 0; i <= 6; i++) pts.push(P(-a / 2 + a * i / 6, 0));
  for (let i = 1; i < 16; i++) { const t = -Math.PI / 2 + Math.PI * i / 16; pts.push(P(a / 2 * Math.cos(t) * -Math.sign(Math.cos(t) || 1) * 0 + (a / 2) * Math.sin(-t + Math.PI / 2) * 0 + 0, 0)); }
  const q = []; q.push(P(-a / 2, 0), P(0, 0), P(a / 2, 0));
  for (let i = 0; i <= 14; i++) { const t = Math.PI * i / 14; q.push(P(a / 2 * Math.cos(t), h * Math.sin(t))); }
  return tubo(R, q, D.d / 2, M.acero, { padre: op.padre, cerrado: true, tension: .2 });
}

/* ================= INSTRUMENTOS ================= */
/** pinza amperométrica de pie, frente hacia -y, base en z = 0 (u → x, v → z) */
export function pinza(R, op = {}) {
  const M = matsN(R), P = PINZA, g = R.grupo(op.padre), T = R.THREE;
  const cont = pinzaContorno();
  const hueco = []; for (let i = 0; i < 48; i++) { const t = 2 * Math.PI * i / 48; hueco.push([P.mord.r * Math.cos(t), P.mord.vc + P.mord.r * Math.sin(t)]); }
  // cuerpo (sin la mordaza): recorto el contorno a v < cuello
  const cuerpo = cont.filter(([u, v]) => v <= P.cuello.v + .01);
  R.perfil(cuerpo, [], P.T, M.amarilloI, { A: [0, 1, 0], B: [1, 0, 0], C: [0, 0, 1], o: [0, -P.T / 2, 0], bevel: 3, bevelSeg: 3 });
  // sobremolde gris del frente (zona del selector)
  R.perfil([[-P.W / 2 + 5, 4], [P.W / 2 - 5, 4], [P.W / 2 - 5, 104], [-P.W / 2 + 5, 104]], [], 2, M.grisI, { A: [0, 1, 0], B: [1, 0, 0], C: [0, 0, 1], o: [0, -P.T / 2 - 1.2, 0], bevel: 1, padre: g });
  // mordaza: anillo con la boca partida arriba, en 2 mitades (la izquierda se abre con el gatillo)
  const mordaza = (lado, giro) => {
    const pts = []; const n = 28, a0 = lado > 0 ? -Math.PI / 2 + .05 : Math.PI / 2 + .03, a1 = lado > 0 ? Math.PI / 2 - .03 : 3 * Math.PI / 2 - .05;
    for (let i = 0; i <= n; i++) { const t = a0 + (a1 - a0) * i / n; pts.push([P.mord.R * Math.cos(t), P.mord.vc + P.mord.R * Math.sin(t)]); }
    for (let i = n; i >= 0; i--) { const t = a0 + (a1 - a0) * i / n; pts.push([P.mord.r * Math.cos(t), P.mord.vc + P.mord.r * Math.sin(t)]); }
    const gg = R.grupo(g);
    R.perfil(pts, [], P.Tm, lado > 0 ? M.grisI : M.grisI, { A: [0, 1, 0], B: [1, 0, 0], C: [0, 0, 1], o: [0, -P.Tm / 2, 0], bevel: 1.5, padre: gg });
    if (giro) { gg.position.set(-P.mord.R * .2, 0, P.cuello.v); gg.children.forEach(c => c.position.set(P.mord.R * .2, 0, -P.cuello.v)); gg.rotation.y = -rad(giro); }
    return gg;
  };
  mordaza(1, 0); mordaza(-1, op.abierta || 0);
  // tope de mano
  R.caja(-P.W / 2 - 4, P.W / 2 + 4, -P.T / 2 - 2, P.T / 2 + 2, P.guarda.v - P.guarda.h, P.guarda.v, M.gomaN, { r: 2.5, padre: g });
  // gatillo (lado izquierdo)
  R.caja(-P.W / 2 - P.gatillo.s, -P.W / 2 + 2, -8, 8, P.gatillo.v0 - 12, P.gatillo.v1 - 12, M.gomaN, { r: 3, padre: g });
  // LCD con marco
  const L = P.lcd, yF = -P.T / 2 - 2.3;
  R.caja(L.u0 - 3, L.u1 + 3, yF - .6, yF + 1, L.v0 - 3, L.v1 + 3, M.lcdOsc, { r: 1.5, padre: g });
  R.impreso([{ t: '12.6', s: 1.2 }, { t: 'AC  A  TRMS', s: .55 }], L.u1 - L.u0, L.v1 - L.v0, [(L.u0 + L.u1) / 2, yF - .8, (L.v0 + L.v1) / 2], [1, 0, 0], [0, 0, 1], { fondo: '#a7b29a', color: '#1b1f1c', padre: g });
  // leyendas impresas del frente (AC: textos de la serie MT-3200)
  R.impreso([{ t: "Pro'sKit  MT-3202", s: 1 }], 50, 6, [0, yF - .4, 62], [1, 0, 0], [0, 0, 1], { color: '#f2f2f2', padre: g });
  R.impreso([{ t: 'OFF  600A~  40A~  V~  V⎓  Ω', s: 1 }], 56, 5, [0, yF - 1.3, P.selector.v + P.selector.D / 2 + 4], [1, 0, 0], [0, 0, 1], { color: '#f2f2f2', padre: g });
  R.impreso([{ t: 'COM', s: 1 }, { t: 'CAT II 600V', s: .8 }], 20, 9, [0, yF - 1.3, P.bornes.v + 6], [1, 0, 0], [0, 0, 1], { color: '#f2f2f2', padre: g });
  // selector giratorio
  const S = P.selector; R.cil([0, yF + 1, S.v], [0, yF - 5, S.v], S.D / 2, M.grisI, { padre: g, seg: 48 });
  R.caja(-2.2, 2.2, yF - 7, yF - 4.8, S.v - S.D / 2 + 3, S.v + S.D / 2 - 3, M.gomaN, { r: 1, padre: g });
  R.caja(-1, 1, yF - 7.2, yF - 6.8, S.v + 4, S.v + S.D / 2 - 4, M.rojoI, { r: .3, padre: g });
  // bornes de entrada (COM y VΩ) abajo en el frente
  for (const [u, m] of [[-P.bornes.du, M.gomaN], [P.bornes.du, M.rojoI]]) {
    R.cil([u, yF + 1, P.bornes.v + 6], [u, yF - 2, P.bornes.v + 6], P.bornes.D / 2, m, { padre: g, seg: 32 });
    R.cil([u, yF - 2.1, P.bornes.v + 6], [u, yF + 6, P.bornes.v + 6], 2, M.oscuro || R.M.oscuro(), { padre: g, seg: 20 });
  }
  // botones HOLD / FUNC
  for (const u of [-14, 0, 14]) R.caja(u - 5, u + 5, yF - 2.2, yF + 1, 104 + 2, 104 + 8, M.gomaN, { r: 1.5, padre: g });
  return g;
}
/** punta de prueba con cable (lápiz): p = punta, dir hacia el mango; color */
export function puntaPrueba(R, p, dir, mat, cablePts, op = {}) {
  const M = matsN(R), d = new R.THREE.Vector3(...dir).normalize(), P = (t) => [p[0] + d.x * t, p[1] + d.y * t, p[2] + d.z * t];
  const g = R.grupo(op.padre);
  R.cil(P(0), P(18), 1, M.cromo, { padre: g, seg: 16, r1: 1 });
  R.torno(P(18), P(130), [[0, 0], [3.2, 0], [4.2, 8], [4.2, 22], [7.5, 24], [7.5, 27], [5, 29], [5.2, 100], [3.5, 112], [0, 112]], mat, { padre: g, seg: 40 });
  if (cablePts) tubo(R, [P(128)].concat(cablePts), 1.9, mat, { padre: g });
  return g;
}

/** detector de tensión por inducción (lápiz NCV) acostado: punta en p, eje dir (horizontal), clip arriba (+z) */
export function ncv(R, p, dir, op = {}) {
  const M = matsN(R), N = NCV, T = R.THREE, d = new T.Vector3(...dir).normalize(), P = (t, z = 0) => [p[0] + d.x * t, p[1] + d.y * t, p[2] + d.z * t + z];
  const g = R.grupo(op.padre);
  const pf = N.perfil, cut = N.punta;
  const tip = pf.filter(([r, t]) => t <= cut); tip.push([pf.find(([r, t]) => t > cut)[0], cut]); tip.push([0, cut]);
  const body = [[0, cut], ...pf.filter(([r, t]) => t >= cut)].map(([r, t]) => [r, t - cut]);
  R.torno(P(0), P(cut), tip, M.transpR, { padre: g, seg: 48 });
  R.torno(P(cut), P(N.L), body, op.mat || M.rojoI, { padre: g, seg: 48 });
  R.cil(P(cut - 1), P(cut + 14), 11.7, M.grisI, { padre: g, seg: 48 });                 // anillo gris
  R.cil(P(cut * .45), P(cut * .45 + 6), 2.2, M.ledR, { padre: g, seg: 20 });             // LED / sensor adentro de la punta
  const b = N.boton; R.caja(-b.L / 2, b.L / 2, -b.w / 2, b.w / 2, 0, 3, M.gomaN, { r: 1.4, padre: g }).position.set(...P(b.t, 10.5));
  // clip
  const c = N.clip, t0 = N.L - 6 - c.L; const clip = R.caja(0, c.L, -c.a / 2, c.a / 2, 0, 2.2, M.grisI, { r: .8, padre: g });
  clip.position.set(...P(t0, 12.4)); clip.rotation.z = Math.atan2(d.y, d.x);
  R.caja(0, 8, -c.a / 2, c.a / 2, -3.4, 2.2, M.grisI, { r: .8, padre: g }).position.set(...P(N.L - 14, 12.4));
  return g;
}

/** probador UNI-T UT15C (cuerpo principal + sonda + cable en espiral), acostado (z = espesor), cuerpo hacia +y desde p */
export function ut15c(R, p, op = {}) {
  const M = matsN(R), U = UT, T = R.THREE, g = R.grupo(op.padre); g.position.set(...p);
  const cont = U.cuerpo.map(([w, v]) => [w, v]).concat(U.cuerpo.slice().reverse().map(([w, v]) => [-w, v]));
  R.perfil(cont, [], U.T, M.grisI, { A: [0, 0, 1], B: [1, 0, 0], C: [0, 1, 0], bevel: 4, bevelSeg: 3, padre: g });
  // sobremolde rojo de la mitad de arriba (zona del agarre)
  const roj = U.cuerpo.filter(([w, v]) => v >= 40).map(([w, v]) => [w + .6, v]); const r2 = roj.concat(roj.slice().reverse().map(([w, v]) => [-w, v]));
  R.perfil([[25.5 + .6, 40]].concat(roj).concat(roj.slice().reverse().map(([w, v]) => [-w, v])).concat([[-26.1, 40]]), [], U.T * .5, M.rojoI, { A: [0, 0, 1], B: [1, 0, 0], C: [0, 1, 0], a0: U.T * .52, bevel: 2, padre: g });
  // frente: LCD y columna de LED con la escala
  const zF = U.T + .2, L = U.lcd;
  R.caja(-L.w / 2 - 3, L.w / 2 + 3, L.v0 - 3, L.v1 + 3, zF - 1.2, zF + .4, M.lcdOsc, { r: 1.5, padre: g });
  R.impreso([{ t: '230', s: 1.2 }, { t: 'V  AC', s: .5 }], L.w, L.v1 - L.v0, [0, (L.v0 + L.v1) / 2, zF + .45], [1, 0, 0], [0, 1, 0], { fondo: '#a7b29a', color: '#1b1f1c', padre: g });
  const n = U.leds.n;
  for (let i = 0; i < n; i++) {
    const v = U.leds.v0 + (U.leds.v1 - U.leds.v0) * i / (n - 1);
    R.cil([-8, v, zF - .6], [-8, v, zF + 1.2], 2.2, i < 5 ? M.ledV : M.ledR, { padre: g, seg: 16 });
  }
  R.impreso(U.escala.slice().reverse().map(t => ({ t, s: 1 })), 16, U.leds.v1 - U.leds.v0 + 9, [6, (U.leds.v0 + U.leds.v1) / 2, zF + .1], [1, 0, 0], [0, 1, 0], { color: '#f2f2f2', padre: g });
  for (const [u, v] of [[-9, 176], [9, 176]]) R.cil([u, v, zF - .8], [u, v, zF + 1.8], 4.2, M.gomaN, { padre: g, seg: 24 });
  R.impreso([{ t: 'UNI-T  UT15C', s: 1 }], 36, 7, [0, 190, zF + .1], [1, 0, 0], [0, 1, 0], { color: '#f4f4f4', padre: g });
  // punta de prueba con capuchón
  const Pp = U.punta;
  R.cil([0, 4, U.T / 2], [0, -Pp.L + 10, U.T / 2], Pp.guard, M.gomaN, { padre: g, seg: 32, r1: Pp.guard * .8 });
  R.cil([0, -Pp.L + 10, U.T / 2], [0, -Pp.L - 8, U.T / 2], Pp.d / 2, M.cromo, { padre: g, seg: 20 });
  // sonda 2 (al costado) y cable en espiral desde la cola
  const S = U.sonda, sx = 70, sy = 40;
  R.torno([sx, sy + S.L, S.D / 2], [sx, sy, S.D / 2], [[0, 0], [S.D / 2 - 2, 0], [S.D / 2, 6], [S.D / 2, S.L - 30], [S.D / 2 - 4, S.L - 18], [5, S.L - 4], [0, S.L]], M.rojoI, { padre: g, seg: 40 });
  R.cil([sx, sy + 3, S.D / 2], [sx, sy - 8, S.D / 2], Pp.guard, M.gomaN, { padre: g, seg: 32 });
  R.cil([sx, sy - 8, S.D / 2], [sx, sy - 26, S.D / 2], Pp.d / 2, M.cromo, { padre: g, seg: 20 });
  const hel = []; const yA = 238, yB = sy + S.L; const nv = 9;
  hel.push([0, yA, U.T / 2]); hel.push([0, yA + 20, U.T / 2]);
  for (let i = 0; i <= nv * 16; i++) { const t = i / (nv * 16), a = t * nv * 2 * Math.PI; const cx = 0 + (sx - 0) * t, cy = yA + 40 + 30 * Math.sin(Math.PI * t); hel.push([cx + 7 * Math.cos(a), cy + 7 * Math.sin(a) * .4 + t * 0, U.T / 2 + 7 * Math.sin(a)]); }
  hel.push([sx, yB + 16, S.D / 2]); hel.push([sx, yB, S.D / 2]);
  tubo(R, hel, 1.6, M.gomaN, { padre: g, seg: 900, rseg: 10, tension: .5 });
  return g;
}

/** busca polo (destornillador de prueba con neón), acostado: punta en p, eje +x. El mango es transparente: se ve el neón */
export function buscaPolo(R, p, op = {}) {
  const M = matsN(R), B = BP, g = R.grupo(op.padre); g.position.set(...p);
  const r = B.mango.D / 2, z = r, h = B.hoja;
  R.cil([6, 0, z], [h.L, 0, z], h.d / 2, M.acHoja, { padre: g, seg: 24 });
  R.caja(0, 8, -h.d / 2, h.d / 2, z - h.punta / 2, z + h.punta / 2, M.acHoja, { r: .2, padre: g });
  R.cil([6, 0, z], [8, 0, z], h.d / 2, M.acHoja, { padre: g, seg: 24, r1: h.punta });
  const m = R.torno([h.L, 0, z], [h.L + B.mango.L, 0, z], B.perfil, M.transp, { padre: g, seg: 48 }); m.userData.noCortar = true;
  const x0 = h.L;
  R.cil([x0 + B.resistencia.t0, 0, z], [x0 + B.resistencia.t1, 0, z], B.resistencia.d / 2, R.M.tinta('#3b2a20'), { padre: g, seg: 16 });
  R.cil([x0 + B.neon.t0, 0, z], [x0 + B.neon.t1, 0, z], B.neon.d / 2, M.neon, { padre: g, seg: 24 });
  const res = []; for (let i = 0; i <= 120; i++) { const t = i / 120, a = t * 12 * Math.PI; res.push([x0 + 46 + 22 * t, 2.4 * Math.cos(a), z + 2.4 * Math.sin(a)]); }
  tubo(R, res, .35, M.cromo, { padre: g, rseg: 6 });
  R.cil([x0 + B.mango.L - 6, 0, z], [x0 + B.mango.L + .6, 0, z], r * .92, M.cromo, { padre: g, seg: 32 });   // tapa de contacto (el dedo)
  R.caja(x0 + 30, x0 + 30 + B.clip.L, -2.5, 2.5, z + r - .5, z + r + 1.3, M.cromo, { r: .5, padre: g });
  R.caja(x0 + 30 + B.clip.L - 6, x0 + 30 + B.clip.L, -2.5, 2.5, z + r - 2.5, z + r + 1.3, M.cromo, { r: .5, padre: g });
  return g;
}
