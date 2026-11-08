/* protab_util.mjs · ayudas 3D del grupo «protab» (no toca lib/r3d.mjs): materiales extra, tubos por un camino, hélices,
 * cables con cuerda de hilos y puntera, prensacables, hexágonos, tuercas. Unidades mm, z arriba. */

/** materiales extra (se arman con los de R.M, que ya traen el ruido procedural) */
export function MX(R) {
  const T = R.THREE;
  const M = {
    pa: (c, o) => R.M.pa(c, o),
    paNegro: () => R.M.pa('#2a2c30', { roughness: .5 }),
    paOscuro: () => R.M.pa('#3a3e45', { roughness: .55 }),
    metal: (c, r = .38) => R.M.pa(c, { metalness: 1, roughness: r, clearcoat: 0 }),
    aluFund: () => R.tipoCorte(R.M.pa('#c4c9ce', { metalness: .85, roughness: .55, clearcoat: 0 }), 'metal'),     // aluminio inyectado (granulado)
    aluLiso: () => R.tipoCorte(R.M.pa('#d3d7db', { metalness: .9, roughness: .35, clearcoat: 0 }), 'metal'),
    galv: () => R.tipoCorte(R.M.aceroCinc(), 'metal'),
    chapaNegra: () => R.tipoCorte(R.M.pa('#33363b', { metalness: .6, roughness: .5 }), 'metal'),
    prfv: (c = '#c9cbc4') => R.M.pa(c, { roughness: .55, clearcoat: .25, clearcoatRoughness: .5 }),           // poliéster con fibra, RAL 7035
    junta: () => R.M.goma('#1d1e20'),
    esmalte: () => R.M.pa('#b4562a', { metalness: .7, roughness: .3, clearcoat: .6 }),                         // alambre esmaltado de la bobina
    ferrita: () => R.tipoCorte(R.M.pa('#4a4d52', { metalness: .2, roughness: .7 }), 'metal'),
    chapaSilicio: () => R.tipoCorte(R.M.pa('#7d8288', { metalness: .9, roughness: .45 }), 'metal'),
    fibra: () => R.M.pa('#8a3b25', { roughness: .7 }),                                                       // fibra vulcanizada de la cámara de arco
    pcb: () => R.M.pa('#1f6b3a', { roughness: .45, clearcoat: .5 }),
    plata: () => R.tipoCorte(R.M.plata(), 'metal'),
    cobre: () => R.tipoCorte(R.M.cobre(), 'metal'),
    cobreEst: () => R.tipoCorte(R.M.cobreEst(), 'metal'),
    laton: () => R.tipoCorte(R.M.laton(), 'metal'),
    latonNiq: () => R.tipoCorte(R.M.latonNiq(), 'metal'),
    acero: () => R.tipoCorte(R.M.acero(), 'metal'),
    bimetal: () => R.tipoCorte(R.M.pa('#a8946a', { metalness: 1, roughness: .35 }), 'metal'),
    policarb: (c = '#dfe9ee', op = .3) => new T.MeshPhysicalMaterial({ color: c, roughness: .12, metalness: 0, transparent: true, opacity: op, clearcoat: 1, side: T.DoubleSide, depthWrite: false }),
    lente: (c) => R.M.lente(c),
  };
  return M;
}

const V3 = (R, a) => new R.THREE.Vector3(a[0], a[1], a[2]);

/** tubo de radio r por los puntos (curva suave). op: cerrado, tension, seg, tapas (true) */
export function tubo(R, pts, r, mat, op = {}) {
  const T = R.THREE;
  const cur = new T.CatmullRomCurve3(pts.map(p => V3(R, p)), !!op.cerrado, 'catmullrom', op.tension ?? .2);
  const g = new T.TubeGeometry(cur, op.seg || Math.max(24, pts.length * 12), r, op.radial || 16, !!op.cerrado); g.deleteAttribute('uv');
  const m = new T.Mesh(g, mat); m.castShadow = m.receiveShadow = true; (op.padre || R.raiz).add(m);
  if (op.tapas !== false && !op.cerrado) for (const [p, q] of [[cur.getPoint(0), cur.getTangent(0).negate()], [cur.getPoint(1), cur.getTangent(1)]]) {
    const c = new T.Mesh(new T.CircleGeometry(r, op.radial || 16), mat); c.position.copy(p); c.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), q); (op.padre || R.raiz).add(c);
  }
  return m;
}

/** hélice (bobina) alrededor del eje p0→p1: radio rh, n vueltas, alambre de radio ra */
export function helice(R, p0, p1, rh, n, ra, mat, op = {}) {
  const T = R.THREE, a = V3(R, p0), b = V3(R, p1), ax = b.clone().sub(a), L = ax.length(); ax.normalize();
  const u = Math.abs(ax.z) < .9 ? new T.Vector3(0, 0, 1).cross(ax).normalize() : new T.Vector3(1, 0, 0).cross(ax).normalize(), v = ax.clone().cross(u);
  const pts = []; const N = Math.round(n * 24);
  for (let i = 0; i <= N; i++) { const t = i / N, th = 2 * Math.PI * n * t; const p = a.clone().addScaledVector(ax, L * t).addScaledVector(u, rh * Math.cos(th)).addScaledVector(v, rh * Math.sin(th)); pts.push([p.x, p.y, p.z]); }
  return tubo(R, pts, ra, mat, { ...op, seg: N * 2, radial: op.radial || 8, tension: .5 });
}

/** bobinado en capas: varias hélices concéntricas entre rI y rE (se ve como alambre esmaltado) */
export function bobinado(R, p0, p1, rI, rE, ra, mat, op = {}) {
  const capas = Math.max(1, Math.round((rE - rI) / (2 * ra)));
  const L = V3(R, p1).distanceTo(V3(R, p0)), n = L / (2 * ra * 1.02);
  const g = R.grupo(op.padre);
  // núcleo macizo (lo que no se ve) + la capa de afuera como hélice
  R.cil(p0, p1, rE - ra, mat, { padre: g, seg: 40 });
  helice(R, p0, p1, rE - ra, n, ra, mat, { padre: g });
  return g;
}

/** prisma hexagonal (tuerca / cuerpo de prensacable) con eje p0→p1; e = entre caras; hueco r (0 = macizo) */
export function hexa(R, p0, p1, e, mat, op = {}) {
  const T = R.THREE, a = V3(R, p0), b = V3(R, p1), L = a.distanceTo(b), rc = e / Math.sqrt(3);
  const s = new T.Shape(); for (let i = 0; i < 6; i++) { const t = Math.PI / 6 + i * Math.PI / 3; (i ? s.lineTo : s.moveTo).call(s, rc * Math.cos(t), rc * Math.sin(t)); }
  if (op.hueco) { const h = new T.Path(); h.absarc(0, 0, op.hueco, 0, Math.PI * 2, true); s.holes.push(h); }
  const ch = op.chaflan ?? Math.min(.6, L * .15);
  const g = new T.ExtrudeGeometry(s, { depth: L - 2 * ch, bevelEnabled: ch > 0, bevelThickness: ch, bevelSize: ch * .8, bevelOffset: -ch * .8, bevelSegments: 2, curveSegments: 24 });
  g.translate(0, 0, ch); g.deleteAttribute('uv'); g.computeVertexNormals();
  const m = new T.Mesh(g, mat); m.castShadow = m.receiveShadow = true;
  m.position.copy(a); m.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), b.clone().sub(a).normalize()); if (op.giro) m.rotateZ(op.giro);
  (op.padre || R.raiz).add(m); return m;
}

/** punta de un cable cortado: aislación + cuerda de hilos (7 o 19) vista de frente. eje p0→p1 (p1 = la cara cortada) */
export function puntaCable(R, p0, p1, rA, rC, color, op = {}) {
  const T = R.THREE, a = V3(R, p0), b = V3(R, p1), ax = b.clone().sub(a).normalize();
  const u = Math.abs(ax.z) < .9 ? new T.Vector3(0, 0, 1).cross(ax).normalize() : new T.Vector3(1, 0, 0).cross(ax).normalize(), v = ax.clone().cross(u);
  const g = R.grupo(op.padre);
  R.cil(p0, p1, rA, R.M.cable(color), { padre: g, seg: 36 });
  const n = op.hilos || (rC > 1.6 ? 19 : 7), rh = n === 19 ? rC / 5 : rC / 3;
  const pos = [[0, 0]]; for (let i = 0; i < 6; i++) pos.push([2 * rh * Math.cos(i * Math.PI / 3), 2 * rh * Math.sin(i * Math.PI / 3)]);
  if (n === 19) for (let i = 0; i < 12; i++) { const t = i * Math.PI / 6 + (i % 2 ? 0 : 0); const rr = i % 2 ? 4 * rh * .87 : 4 * rh; pos.push([rr * Math.cos(t), rr * Math.sin(t)]); }
  const cu = R.M.cobre();
  for (const [s, t] of pos) { const c = b.clone().addScaledVector(u, s).addScaledVector(v, t); R.cil([c.x, c.y, c.z].map((q, i) => q - ax.getComponent(i) * .8), [c.x + ax.x * .25, c.y + ax.y * .25, c.z + ax.z * .25], rh * .97, cu, { padre: g, seg: 12 }); }
  return g;
}

/** cable recto con puntera (ferrule) que entra en un borne: desde el conductor (pIn) hacia afuera (pOut) */
export function cablePuntera(R, pIn, pOut, color, op = {}) {
  const T = R.THREE, a = V3(R, pIn), b = V3(R, pOut), ax = b.clone().sub(a).normalize();
  const rC = op.rC || 1.45, rA = op.rA || 2.5, Lp = op.Lp || 12, collar = op.collar || '#2b2d31';
  const g = R.grupo(op.padre);
  const P = (d) => { const p = a.clone().addScaledVector(ax, d); return [p.x, p.y, p.z]; };
  R.cil(P(0), P(Lp - 4), rC, R.M.cobreEst(), { padre: g, seg: 24 });                               // tubo de la puntera
  R.torno(P(Lp - 4.5), P(Lp + 3), [[rC, 0], [rC + .5, 0], [rA + .5, 1.5], [rA + .5, 7], [rA, 7.5], [rC, 7.5]], R.M.pa(collar, { roughness: .45 }), { padre: g });
  const L = a.distanceTo(b);
  if (op.cortado !== false) puntaCable(R, P(Lp + 2.8), P(L), rA, rC + .3, color, { padre: g });
  else R.cil(P(Lp + 2.8), P(L), rA, R.M.cable(color), { padre: g, seg: 36 });
  if (op.cortable !== true) g.traverse(o => { o.userData.noCortar = true; });
  return g;
}

/** prensacable de nylon o metal (cuerpo hexagonal, rosca, cúpula con garras y el cable). Eje p0 (cara de la caja) → afuera.
 *  op: D (rosca), hex, alto, mat, color, cable {r, color}, tuerca (true) */
export function prensacable(R, p0, dir, op = {}) {
  const T = R.THREE, a = V3(R, p0), d = V3(R, dir).normalize();
  const D = op.D || 20, hx = op.hex || 24, H = op.alto || 30, mat = op.mat || R.M.pa(op.color || '#c9ccc8', { roughness: .45 });
  const g = R.grupo(op.padre);
  const P = (s) => { const p = a.clone().addScaledVector(d, s); return [p.x, p.y, p.z]; };
  // rosca hacia adentro (con tuerca de ajuste del otro lado de la pared)
  const esp = op.pared || 4;
  const pf = []; for (let i = 0; i <= 14; i++) pf.push([D / 2 - (i % 2 ? .6 : 0), i * (esp + 6) / 14]);
  R.torno(P(-esp - 6), P(0), [[D / 2 - 2.6, 0], ...pf, [D / 2 - 2.6, esp + 6]], mat, { padre: g, seg: 48 });
  if (op.tuerca !== false) hexa(R, P(-esp - 4.5), P(-esp), hx - 1, mat, { padre: g, hueco: D / 2 - .4 });
  // brida + junta + cuerpo hexagonal + cúpula
  R.torno(P(0), P(1.6), [[D / 2, 0], [hx * .62, 0], [hx * .62, 1.6], [D / 2, 1.6]], R.M.goma('#222'), { padre: g });
  hexa(R, P(1.6), P(1.6 + H * .3), hx, mat, { padre: g, hueco: D / 2 - 2 });
  const zc = 1.6 + H * .3, rc = op.cable ? op.cable.r : 4;
  R.torno(P(zc), P(H), [[D / 2 - 1, 0], [hx * .54, 0], [hx * .55, H * .35], [hx * .5, H * .55], [rc + 2.2, H - zc - .3], [rc + .4, H - zc], [rc + .4, 0]], mat, { padre: g, seg: 48 });
  // estrías de la cúpula
  for (let i = 0; i < 12; i++) { const t = i * Math.PI / 6; const u = Math.abs(d.z) < .9 ? new T.Vector3(0, 0, 1).cross(d).normalize() : new T.Vector3(1, 0, 0).cross(d).normalize(); const v = d.clone().cross(u);
    const off = u.clone().multiplyScalar(Math.cos(t) * hx * .55).add(v.clone().multiplyScalar(Math.sin(t) * hx * .55)); const q0 = V3(R, P(zc + 1)).add(off), q1 = V3(R, P(zc + H * .3)).add(off.multiplyScalar(.97));
    R.cil([q0.x, q0.y, q0.z], [q1.x, q1.y, q1.z], .7, mat, { padre: g, seg: 8 }); }
  if (op.cable) {
    const c = op.cable; const L = c.largo || 60;
    if (c.colores) { // cable multipolar: vaina + conductores que siguen adentro
      R.cil(P(-esp - 6 - (c.adentro || 10)), P(H + L - 6), c.r, R.M.cable(c.vaina || '#25272a'), { padre: g, seg: 40 });
      puntaCable(R, P(H + L - 6), P(H + L), c.r, c.r * .55, c.vaina || '#25272a', { padre: g, hilos: 7 });
    } else R.cil(P(-esp - 10), P(H + L), c.r, R.M.cable(c.color || '#25272a'), { padre: g, seg: 40 });
  }
  return g;
}

/** caja redondeada con paredes (abierta hacia +y): fondo en y0, boca en y1. pared e, radio de los cantos r */
export function bandeja(R, x0, x1, y0, y1, z0, z1, e, r, mat, op = {}) {
  const g = R.grupo(op.padre);
  placaRed(R, x0, x1, z0, z1, y0, e, r, mat, { padre: g, bisel: op.bisel ?? .8 });
  placaRed(R, x0, x1, z0, z1, y0 + e - .2, y1 - y0 - e + .2, r, mat, { padre: g, bisel: op.bisel ?? .8,
    huecos: [{ x: (x0 + x1) / 2, z: (z0 + z1) / 2, w: x1 - x0 - 2 * e, h: z1 - z0 - 2 * e, rad: Math.max(.5, r - e) }] });
  return g;
}

/** marco rectangular redondeado (para la tapa / puerta / junta) en el plano xz, espesor en y desde y0 */
export function placaRed(R, x0, x1, z0, z1, y0, e, r, mat, op = {}) {
  const T = R.THREE;
  const rr = (cx, cz, w, h, rad) => { const s = new T.Shape(); const x = cx - w / 2, y = cz - h / 2; s.moveTo(x + rad, y); s.lineTo(x + w - rad, y); s.quadraticCurveTo(x + w, y, x + w, y + rad); s.lineTo(x + w, y + h - rad); s.quadraticCurveTo(x + w, y + h, x + w - rad, y + h); s.lineTo(x + rad, y + h); s.quadraticCurveTo(x, y + h, x, y + h - rad); s.lineTo(x, y + rad); s.quadraticCurveTo(x, y, x + rad, y); return s; };
  const s = rr((x0 + x1) / 2, (z0 + z1) / 2, x1 - x0, z1 - z0, r);
  for (const hz of (op.huecos || [])) { const p = new T.Path(); if (hz.r) p.absarc(hz.x, hz.z, hz.r, 0, Math.PI * 2, true); else p.setFromPoints(rr(hz.x, hz.z, hz.w, hz.h, hz.rad || .5).getPoints(8).reverse()); s.holes.push(p); }
  const b = op.bisel ?? Math.min(1.2, e / 3);
  const g = new T.ExtrudeGeometry(s, { depth: e - 2 * b, bevelEnabled: b > 0, bevelThickness: b, bevelSize: b, bevelOffset: -b, bevelSegments: 2, curveSegments: 12 });
  g.translate(0, 0, b); g.deleteAttribute('uv');
  // (x, z_shape, e) → x, y = y0 + e, z = z_shape
  const m4 = new T.Matrix4().makeBasis(new T.Vector3(1, 0, 0), new T.Vector3(0, 0, 1), new T.Vector3(0, 1, 0));
  g.applyMatrix4(m4); const idx = g.index; if (idx) { const a = idx.array; for (let i = 0; i < a.length; i += 3) { const t = a[i + 1]; a[i + 1] = a[i + 2]; a[i + 2] = t; } }
  g.translate(0, y0, 0); g.computeVertexNormals();
  const m = new T.Mesh(g, mat); m.castShadow = m.receiveShadow = true; (op.padre === undefined ? R.raiz : op.padre)?.add(m); return m;
}
