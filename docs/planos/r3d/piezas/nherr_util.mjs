/* nherr_util.mjs · materiales y modelos 3D del grupo «nherr» (herramientas del pañol: pinzas y alicates aislados, crimpeadora,
 * corta cable a criquet, cuchillo, destornilladores aislados, llaves, albañilería, discos, mechas, cepillo, cajas y varios).
 * Medidas y contornos: perfiles_nherr.mjs (los mismos del plano). No toca lib/r3d.mjs ni piezas de otros grupos (importa civil_util tal cual).
 * Convención: cada herramienta se arma en sus ejes (x = largo, punta en 0; z = espesor) dentro de un grupo; el grupo se ubica al final
 * con lugar(g, pos, rz, rx). Las anclas se pasan a coordenadas de mundo con W(g, p). */
import pc from 'polygon-clipping';
import { matsC, matV } from './civil_util.mjs';

const PI = Math.PI, TAU = PI * 2, rad = (g) => g * PI / 180;
export const espejoY = (m) => m.map(pol => pol.map(ring => ring.map(([x, y]) => [x, -y]).reverse()));
export const cajaXY = (x0, x1, y0, y1) => [[[[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]]];

export function matsH(R) {
  if (R._mh) return R._mh; const T = R.THREE, C = matsC(R);
  const tc = (m, t) => R.tipoCorte(m, t);
  R._mh = {
    C,
    cromo: tc(new T.MeshPhysicalMaterial({ color: '#d3d9df', metalness: 1, roughness: .16 }), 'metal'),
    pulido: tc(new T.MeshPhysicalMaterial({ color: '#c3c9cf', metalness: 1, roughness: .26 }), 'metal'),
    filo: new T.MeshPhysicalMaterial({ color: '#eef1f4', metalness: 1, roughness: .08 }),
    pavon: tc(matV(T, { color: '#2e3136', metalness: .7, roughness: .42, clearcoat: .3 }, { s: [.2, .2, .2], cvar: .06 }), 'metal'),       // acero pavonado / laca negra
    fosfat: tc(matV(T, { color: '#4a4c4f', metalness: .6, roughness: .55 }, { s: [.4, .4, .4], cvar: .08 }), 'metal'),
    cromoV: tc(matV(T, { color: '#c4c9ce', metalness: 1, roughness: .32 }, { s: [.6, .6, .6], cvar: .03 }), 'metal'),                                     // cromo-vanadio satinado
    hss: tc(matV(T, { color: '#3a3c3f', metalness: .8, roughness: .35 }, { s: [.3, .3, .3], cvar: .06 }), 'metal'),                          // HSS laminado (negro)
    hssRect: tc(new T.MeshPhysicalMaterial({ color: '#b6bcc2', metalness: 1, roughness: .22 }), 'metal'),                                    // HSS rectificado (gris brillante)
    rojo: tc(R.M.pa('#c42a22', { roughness: .42, clearcoat: .25, clearcoatRoughness: .4 }), 'plastico'),                                    // aislación: capa dura
    amarillo: tc(R.M.pa('#efbf16', { roughness: .62, clearcoat: .05 }), 'plastico'),                                                         // aislación: capa blanda (TPE)
    rojoO: tc(R.M.pa('#8f1c17', { roughness: .5 }), 'plastico'),
    negroP: tc(R.M.pa('#1f2124', { roughness: .5, clearcoat: .15 }), 'plastico'),
    grisP: tc(R.M.pa('#6b7076', { roughness: .5 }), 'plastico'),
    naranja: tc(R.M.pa('#e86a12', { roughness: .45, clearcoat: .15 }), 'plastico'),
    azulP: tc(R.M.pa('#1f4f9a', { roughness: .45, clearcoat: .15 }), 'plastico'),
    blancoP: tc(R.M.pa('#ecebe6', { roughness: .5 }), 'plastico'),
    tinta: R.M.tinta('#111214'), tintaB: R.M.tinta('#f5f5f2'),
    madera: tc(C.madera, 'x'), maderaC: C.maderaC,
    goma: tc(R.M.goma('#1d1e20'), 'plastico'),
    espuma: tc(matV(T, { color: '#d9c38a', roughness: 1 }, { s: [1.5, 1.5, 1.5], cvar: .12, amp: .6 },
      { modo: 'celdas', cel: .9, cols: ['#e3cf98', '#d2bb80', '#a99560', '#fff'], borde: .1, osc: .45, amp: .5 }), 'plastico'),
    abrasivo: tc(matV(T, { color: '#3c3e40', roughness: .95 }, { s: [2, 2, 2], cvar: .12, amp: .7 },
      { modo: 'granos', cel: .55, frac: .5, r0: .18, r1: .38, cols: ['#6c6e70', '#1e1f20', '#8a7f72', '#4d4f52'], amp: .5 }), 'x'),
    abrasivoC: matV(T, { color: '#56585b', roughness: .95 }, { s: [3, 3, 3], cvar: .1, amp: .5 },
      { modo: 'granos', cel: .45, frac: .55, r0: .18, r1: .4, cols: ['#8c8f92', '#2b2c2e', '#a09482', '#5f6165'], amp: .4 }),
    zirc: tc(matV(T, { color: '#5b4a3e', roughness: .9 }, { s: [2, 2, 2], cvar: .12, amp: .6 },
      { modo: 'granos', cel: .5, frac: .55, r0: .18, r1: .38, cols: ['#3a2e26', '#7c6655', '#2a221d', '#957b66'], amp: .5 }), 'x'),
    malla: tc(new T.MeshPhysicalMaterial({ color: '#d8d2b8', roughness: .7, metalness: 0 }), 'plastico'),
    etiqueta: tc(R.M.pa('#1e5aa8', { roughness: .4, clearcoat: .3 }), 'plastico'),
    flux: tc(matV(T, { color: '#cdbf9c', roughness: .95 }, { s: [1.2, 1.2, 1.2], cvar: .12, amp: .4 },
      { modo: 'granos', cel: .5, frac: .5, r0: .15, r1: .3, cols: ['#e1d6b9', '#a99a77', '#efe6cf', '#8c7e60'], amp: .2 }), 'x'),
    alambreAc: tc(new T.MeshPhysicalMaterial({ color: '#b9bec3', metalness: 1, roughness: .3 }), 'metal'),
    latonA: tc(new T.MeshPhysicalMaterial({ color: '#d4a84c', metalness: 1, roughness: .32 }), 'metal'),
    papel: tc(matV(T, { color: '#ead9a7', roughness: .9 }, { s: [.8, .8, .8], cvar: .05, amp: .15 }), 'plastico'),
    carton: tc(matV(T, { color: '#b9925c', roughness: .95 }, { s: [.5, .5, .5], cvar: .08 }), 'plastico'),
    pilaN: tc(R.M.pa('#151517', { roughness: .35, clearcoat: .6 }), 'plastico'),
    pilaD: tc(R.M.pa('#c79a2a', { roughness: .3, clearcoat: .6, metalness: .3 }), 'plastico'),
    chapa: tc(new T.MeshPhysicalMaterial({ color: '#2b2d31', metalness: .5, roughness: .45 }), 'metal'),
    resist: new T.MeshPhysicalMaterial({ color: '#ff6a1a', emissive: '#ff3d00', emissiveIntensity: .55, roughness: .6 }),
  };
  return R._mh;
}

/** ubica un grupo (posición, giro z, giro x en grados) y actualiza matrices */
export function lugar(g, pos = [0, 0, 0], rz = 0, rx = 0, ry = 0) {
  g.position.set(...pos); g.rotation.set(rad(rx), rad(ry), rad(rz), 'ZYX'); g.updateMatrixWorld(true); return g;
}
/** punto local del grupo → mundo (para anclas) */
export function W(R, g, p) { g.updateMatrixWorld(true); return new R.THREE.Vector3(...p).applyMatrix4(g.matrixWorld).toArray(); }

/** extruye un multipolígono (x, y) en z de z0 a z1 */
export function ext(R, multi, z0, z1, mat, padre, bevel = .4) {
  const b = Math.min(bevel, (z1 - z0) / 2 - .05);
  return R.perfil(multi, [], z1 - z0, mat, { A: [0, 0, 1], B: [1, 0, 0], C: [0, 1, 0], o: [0, 0, z0], bevel: b > 0 ? b : 0, bevelSeg: b > 1.5 ? 5 : 2, padre });
}

/** símbolo IEC 60417-5216 (doble triángulo) + «1000 V» impreso en una cara plana.
 *  o = centro del símbolo, u = dirección del renglón, n = normal de la cara (hacia afuera), h = alto del triángulo */
export function sello1000V(R, padre, o, u, n, h = 4.2, mat, op = {}) {
  const T = R.THREE, U = new T.Vector3(...u).normalize(), N = new T.Vector3(...n).normalize(), Vv = new T.Vector3().crossVectors(N, U);
  const M = mat || matsH(R).tinta;
  const tri = (cx, cy, s) => { const w = s * 1.0; return [[cx - w / 2, cy - s / 2], [cx + w / 2, cy - s / 2], [cx, cy + s / 2]]; };
  const g = R.grupo(padre);
  const O = new T.Vector3(...o);
  // dos triángulos uno sobre otro (el de arriba apoyado en la punta del de abajo), en coordenadas (U, V)
  for (const [cy] of [[-h * .5], [h * .5]]) {
    const pts = tri(0, cy, h);
    const m = R.perfil(pts, [], .18, M, { A: N.toArray(), B: U.toArray(), C: Vv.toArray(), o: O.toArray(), bevel: 0, padre: g });
    R.sinBorde(m);
  }
  if (op.texto !== false) R.texto(op.texto || '1000 V', O.clone().addScaledVector(U, h * .95 + (op.sep || 1.2)).addScaledVector(N, .02).toArray(), U.toArray(), Vv.toArray(), M, { size: op.size || h * .62, prof: .18, alin: 'izq', padre: g });
  if (op.iec) R.texto(op.iec, O.clone().addScaledVector(U, -h * .7).addScaledVector(N, .02).toArray(), U.toArray(), Vv.toArray(), M, { size: (op.size || h * .62) * .62, prof: .15, alin: 'der', padre: g });
  return g;
}

/* =========================================================================================
 * PINZA AISLADA (generador común: perfiles_nherr.pinza)
 * op: abre (grados que abre cada brazo), corte: [x0, x1] tramo del mango cortado a cuarto (para ver el acero), sello: true
 * Devuelve { g, armA, armB, pivote } — g en coordenadas de la herramienta (ubicarlo con lugar después del corte)
 * ========================================================================================= */
export function pinza3d(R, P, op = {}) {
  const M = matsH(R), g = R.grupo(), T = R.THREE;
  const th = rad(op.abre || 0), matAc = op.acero || M.cromo;
  const corteX = P.xh + 3;
  const brazos = [];
  for (const lado of [1, -1]) {
    const ga = R.grupo(g); ga.position.set(P.xp, 0, 0);
    const gi = R.grupo(ga); gi.position.set(-P.xp, 0, 0);
    const lleno = lado > 0 ? P.llenoA : espejoY(P.llenoA);
    const cab = pc.intersection(lleno, cajaXY(-5, corteX, -200, 200));
    const man = pc.intersection(lleno, cajaXY(corteX - .01, P.L + 5, -200, 200));
    const tc = P.tCab / 2, ta = P.tAcero / 2;
    const gS = R.grupo(gi), gB = R.grupo(gi), gG = R.grupo(gi);
    ext(R, cab, -tc, tc, matAc, gi, .6);
    if (man.length) ext(R, man, -ta, ta, matAc, gS, .4);
    // junta solapada: el brazo A abajo, el B arriba
    ext(R, P.solape, lado > 0 ? -tc : 0.02, lado > 0 ? -0.02 : tc, matAc, gi, .3);
    // aislación (capa dura roja: base + tope; capa blanda amarilla: grip)
    const a = P.ais, mir = (r) => lado > 0 ? [[r]] : espejoY([[r]]);
    ext(R, mir(P.aisPol.base), -a.tBase / 2, a.tBase / 2, op.matBase || M.rojo, gB, 2.4);
    ext(R, mir(P.aisPol.tope), -a.tTope / 2, a.tTope / 2, op.matBase || M.rojo, gi, 2.2);
    ext(R, mir(P.aisPol.grip), -a.tGrip / 2, a.tGrip / 2, op.matGrip || M.amarillo, gG, 4.2);
    brazos.push({ ga, gi, lado, capas: [gS, gB, gG] });
  }
  // remache de la articulación
  R.torno([P.xp, 0, -P.tCab / 2 - .7], [P.xp, 0, P.tCab / 2 + .7], [[0, 0], [4.6, 0], [5.2, .5], [5.2, .9], [4.3, .9], [4.3, P.tCab + .5], [5.2, P.tCab + .5], [5.2, P.tCab + .9], [4.6, P.tCab + 1.4], [0, P.tCab + 1.4]], M.cromo, { seg: 48, padre: g });
  if (op.corte) for (const b of brazos) if (b.lado === (op.corteLado || 1)) {
    g.updateMatrixWorld(true);
    const x0 = op.corte[0], x1 = op.corte[1], cy = P.centro((x0 + x1) / 2) * b.lado;
    b.capas.forEach((gc, k) => { const d = k * 1.4;   // corte escalonado: cada capa un poco más adentro, así se ven las tres
      R.cortar(gc, [x0 + d * 2, x1, b.lado > 0 ? -200 : cy + d, b.lado > 0 ? cy - d : 200, -d, 30]); });
  }
  for (const b of brazos) { b.ga.rotation.z = -b.lado * th; }
  g.updateMatrixWorld(true);
  // sello IEC 60900 en la cara de arriba del grip del brazo B (mango en y > 0) y del A
  if (op.sello !== false) for (const b of brazos) {
    const xs = P.xh + P.ais.grip[0] + 18, yc = -b.lado * (-P.centro(xs));
    const xs2 = xs + 10, yc2 = -b.lado * (-P.centro(xs2));
    const u = [xs2 - xs, yc2 - yc, 0];
    sello1000V(R, b.gi, [xs, yc, P.ais.tGrip / 2 + .01], u, [0, 0, 1], 4.4, M.tinta, { iec: null });
    if (op.marca) R.texto(op.marca, [xs + 38, -b.lado * (-P.centro(xs + 38)), P.ais.tGrip / 2 + .01], u, [-u[1], u[0], 0], M.tinta, { size: 2.6, prof: .15, padre: b.gi });
  }
  return { g, brazos };
}

/** punto de un brazo de la pinza (coordenadas de la herramienta cerrada) → mundo, teniendo en cuenta lo que abre */
export function Pbrazo(R, pz, lado, p) { const b = pz.brazos.find(q => q.lado === lado); return W(R, b.gi, p); }

/** cuchillo de electricista aislado: hoja (contorno de perfiles) + mango oval bimaterial */
export function cuchillo3d(R, CU, op = {}) {
  const M = matsH(R), g = R.grupo();
  const hoja = ext(R, [[CU.contHoja.concat([CU.contHoja[0]])]], -CU.eHoja / 2, CU.eHoja / 2, M.pulido, g, .25);
  // espiga dentro del mango
  R.caja(54, 54 + 60, -4.5, 4.5, -1, 1, M.pulido, { padre: g });
  const m = CU.mango, x0 = CU.L - m.L;
  // mango: capa dura roja (collar + cuerpo) y capa blanda amarilla (agarre)
  R.torno([x0, 0, 0], [CU.L, 0, 0], [[0, 0], [m.Dtope / 2 - 1, 0], [m.Dtope / 2, 1], [m.Dtope / 2, m.tope - 1], [m.Dtope / 2 - 1, m.tope], [m.D0 / 2 + 1.5, m.tope + 2], [m.D0 / 2 + 1.5, m.L - 6], [m.D1 / 2 - .5, m.L - 2], [m.D1 / 2 - 3, m.L], [0, m.L]], M.rojo, { seg: 64, padre: g });
  R.torno([x0 + m.tope + 14, 0, 0], [x0 + m.L - 16, 0, 0], [[0, 0], [m.D0 / 2 + 1.6, 0], [m.D0 / 2 + 3.3, 4], [m.D1 / 2 + 2.6, m.L - m.tope - 34], [m.D1 / 2 + 1.6, m.L - m.tope - 30], [0, m.L - m.tope - 30]], M.amarillo, { seg: 64, padre: g });
  return g;
}

/* =========================================================================================
 * DESTORNILLADOR AISLADO: mango hexalobular bimaterial + vaina + punta plana o Phillips
 * eje x: punta en x = 0, mango hacia +x
 * ========================================================================================= */
export function destor3d(R, D, PH, op = {}) {
  const M = matsH(R), g = R.grupo(), T = R.THREE;
  const gA = R.grupo(g), gV = R.grupo(g), gY = R.grupo(g);     // acero · capa dura (vaina + núcleo del mango) · capa blanda
  const r = D.d / 2, v = D.vaina, libre = v.libre;
  if (D.tipo === 'PL') {
    const [a, e] = D.hoja, n = 28, Lc = 14;
    // punta plana: cuña que pasa del ancho × espesor de la hoja al Ø de la caña (tramos)
    const aw = (t) => lerp(a / 2, r * .98, t * t), ew = (t) => lerp(e / 2, r * .98, Math.sqrt(t));
    for (let i = 0; i < n; i++) { const t0 = i / n, tm = (i + .5) / n;
      R.perfil([[-aw(tm), -ew(tm)], [aw(tm), -ew(tm)], [aw(tm), ew(tm)], [-aw(tm), ew(tm)]], [], Lc / n + .02, M.cromoV, { o: [t0 * Lc, 0, 0], bevel: 0, padre: gA }); }
    R.cil([Lc, 0, 0], [D.L + 8, 0, 0], r, M.cromoV, { padre: gA });
  } else {
    const L0 = PH.conoL;
    R.torno([0, 0, 0], [L0, 0, 0], [[0, 0], [.9, .1], [r * .98, L0], [0, L0]], M.cromoV, { seg: 48, padre: gA });
    const rc = (x) => (.9 + (r * .98 - .9) * x / L0) * 1.01;
    for (let k = 0; k < 4; k++) { const gk = R.grupo(gA); gk.rotation.x = k * PI / 2 + PI / 4;
      const m = R.perfil([[.25, rc(.25) * .2], [L0 * .85, rc(L0 * .85) * .45], [L0 * .85, rc(L0 * .85)], [.25, rc(.25)]], [], .7, M.pavon, { A: [0, 1, 0], B: [1, 0, 0], C: [0, 0, 1], o: [0, -.35, 0], bevel: 0, padre: gk }); R.sinBorde(m); }
    R.cil([L0, 0, 0], [D.L + 8, 0, 0], r, M.cromoV, { padre: gA });
  }
  // vaina aislante roja sobre la caña (deja la punta libre)
  R.torno([libre, 0, 0], [D.L + 2, 0, 0], [[r + .01, 0], [r + v.e - .3, 0], [r + v.e, 1.2], [r + v.e, D.L + 2 - libre], [r + .01, D.L + 2 - libre]], M.rojo, { seg: 48, padre: gV });
  const m = D.mango, x0 = D.L, Lm = m.L;
  R.torno([x0, 0, 0], [x0 + Lm, 0, 0], [[r + .01, 0], [m.Dcol / 2 - 3, 0], [m.Dcol / 2, 2.5], [m.Dcol / 2, 7], [m.D / 2 - 4.5, 11], [m.D / 2 - 3.6, Lm - 8], [m.D / 2 - 1.6, Lm - 3], [m.D / 2 - 4, Lm], [0, Lm]], M.rojo, { seg: 72, padre: gV });
  // espiga de la caña dentro del mango
  R.cil([D.L, 0, 0], [D.L + Lm * .7, 0, 0], r * .9, M.cromoV, { padre: gA });
  const lob = []; const nn = 120; for (let i = 0; i < nn; i++) { const ang = TAU * i / nn; const rr = m.D / 2 - .4 - 1.6 * Math.pow(Math.abs(Math.cos(3 * ang)), 6); lob.push([rr * Math.cos(ang), rr * Math.sin(ang)]); }
  R.perfil(lob, [], Lm - 30, M.amarillo, { o: [x0 + 16, 0, 0], bevel: 2.2, bevelSeg: 4, padre: gY });
  if (op.corte) [gA, gV, gY].forEach((gc, k) => { const d = k * 1.6; R.cortar(gc, [op.corte[0] + d * 3, op.corte[1], -60, d * .2, -d, 60]); });
  if (op.sello !== false) sello1000V(R, gY, [x0 + 40, 0, m.D / 2 - .35], [1, 0, 0], [0, 0, 1], 4.4, M.tinta, {});
  return g;
}
const lerp = (a, b, t) => a + (b - a) * t;

/** banda (polígono) a lo largo de una línea recta inclinada: de (x0, c0) a (x1, c1), medio ancho h */
export function bandaRecta(x0, c0, x1, c1, h, n = 2) {
  const dx = x1 - x0, dy = c1 - c0, L = Math.hypot(dx, dy), nx = -dy / L * h, ny = dx / L * h;
  return [[[[x0 + nx, c0 + ny], [x1 + nx, c1 + ny], [x1 - nx, c1 - ny], [x0 - nx, c0 - ny], [x0 + nx, c0 + ny]]]];
}
/** mango aislado recto (acero + capa dura + capa blanda) entre (x0, c0) y (x1, c1) */
export function mangoRecto(R, padre, m, L, tA = 6, op = {}) {
  const M = matsH(R), x1 = m.x0 + m.L, t = (x) => (x - m.x0) / m.L, cc = (x) => m.c0 + (m.c1 - m.c0) * t(x);
  ext(R, bandaRecta(m.x0 - 4, cc(m.x0 - 4), x1 - 2, cc(x1 - 2), m.hc), -tA / 2, tA / 2, op.acero || M.cromo, padre, .4);
  ext(R, bandaRecta(m.x0, cc(m.x0), x1, cc(x1), m.hc + m.ais), -(tA / 2 + m.ais), tA / 2 + m.ais, op.matBase || M.rojo, padre, 2.2);
  ext(R, bandaRecta(m.x0 + 3, cc(m.x0 + 3), m.x0 + 9, cc(m.x0 + 9), m.hc + m.ais + 4), -(tA / 2 + m.ais + 2), tA / 2 + m.ais + 2, op.matBase || M.rojo, padre, 2);
  ext(R, bandaRecta(m.x0 + 22, cc(m.x0 + 22), x1 - 12, cc(x1 - 12), m.hc + m.grip), -(tA / 2 + m.grip + 1), tA / 2 + m.grip + 1, op.matGrip || M.amarillo, padre, 3.8);
  return cc;
}
/** cable subterráneo 4 × (sección) cortado: cubierta negra, relleno y 4 conductores con colores AEA, eje z */
export function cable4(R, padre, c, z0, z1, D) {
  const M = matsH(R), g = R.grupo(padre);
  R.cil([c[0], c[1], z0], [c[0], c[1], z1], D / 2, R.M.cable('#1d1e20'), { padre: g, seg: 64 });
  const cols = ['#6e3b1d', '#26282b', '#8c8f93', '#2f74c0'], rc = D * .21, d = D * .22;
  cols.forEach((col, i) => { const a = Math.PI / 4 + i * Math.PI / 2, x = c[0] + d * Math.cos(a), y = c[1] + d * Math.sin(a);
    R.cil([x, y, z1 - .1], [x, y, z1 + 1.5], rc, R.M.cable(col), { padre: g, seg: 40 });
    R.cil([x, y, z1 + 1.4], [x, y, z1 + 2.2], rc * .72, R.M.cobre(), { padre: g, seg: 40 }); });
  return g;
}

/* ---------------- LLAVES ---------------- */
import { prismaN } from './pat.mjs';
/** llave francesa: cuerpo (cabeza gruesa + mango) con boca, mandíbula móvil a una apertura dada (0–1) y tornillo sinfín */
export function francesa3d(R, F, op = {}) {
  const M = matsH(R), g = R.grupo();
  const cab = pc.intersection(F.cuerpo, cajaXY(-5, F.cabX, -100, 100)), man = pc.intersection(F.cuerpo, cajaXY(F.cabX - .01, F.L + 5, -100, 100));
  ext(R, cab, -F.eCab / 2, F.eCab / 2, M.cromoV, g, 1.2);
  ext(R, man, -3.6, 3.6, M.cromoV, g, 1.4);
  ext(R, F.movil, -F.eCab / 2 + .7, F.eCab / 2 - .7, M.cromoV, g, 1.0);
  const w = F.sinfin, pf = [], np = 20; for (let i = 0; i <= np; i++) pf.push([i % 2 ? w.r : w.r - 1.1, (w.x1 - w.x0) * i / np]);
  R.torno([w.x0, w.y, 0], [w.x1, w.y, 0], [[0, 0], ...pf, [0, w.x1 - w.x0]], M.cromo, { seg: 48, padre: g });
  R.cil([w.x0 - 2, w.y, 0], [w.x1 + 2, w.y, 0], 1.3, M.cromo, { padre: g });
  if (op.marca) R.texto(op.marca, [F.L * .55, 0, 3.62], [1, 0, 0], [0, 1, 0], M.tinta, { size: 4, prof: .15, padre: g });
  return { g, yc: w.y };
}
/** llave Allen (L hexagonal): brazo largo l1 sobre x, brazo corto l2 sobre y */
export function allen3d(R, s, l1, l2, padre, mat) {
  const g = R.grupo(padre);
  prismaN(R, [0, 0, 0], [1, 0, 0], l1, s, 6, mat, { padre: g, bevel: Math.min(.4, s * .08), giro: 0 });
  prismaN(R, [-s * .1, 0, -s * .43], [0, 0, 1], l2, s, 6, mat, { padre: g, bevel: Math.min(.4, s * .08), giro: 0, ref: [1, 0, 0] });
  return g;
}
/** llave combinada con criquet (boca + estrella con engranaje) */
export function combinada3d(R, C, op = {}) {
  const M = matsH(R), g = R.grupo();
  const cuerpo = pc.intersection(C.cont, cajaXY(-5, C.L - C.estrella * 1.1, -50, 50));
  const anillo = pc.difference(pc.intersection(C.cont, cajaXY(C.L - C.estrella * 1.1 - .01, C.L + 5, -50, 50)), []);
  ext(R, cuerpo, -C.e / 2, C.e / 2, M.cromoV, g, .8);
  ext(R, anillo, -C.eEstr / 2, C.eEstr / 2, M.cromoV, g, .8);
  ext(R, C.engranaje, -C.eEstr / 2 + .8, C.eEstr / 2 - .8, M.pulido, g, .2);
  R.texto('13', [C.L * .5, 0, C.e / 2 + .02], [1, 0, 0], [0, 1, 0], M.tinta, { size: 5, prof: .15, padre: g });
  return g;
}

/* ---------------- ALBAÑILERÍA ---------------- */
import { revol } from './pat.mjs';
const elipR = (a, b) => (th) => a * b / Math.sqrt((b * Math.cos(th)) ** 2 + (a * Math.sin(th)) ** 2);
export function maderaX(R) { if (R._mx) return R._mx; const T = R.THREE;
  R._mx = R.tipoCorte(matV(T, { color: '#b5864f', roughness: .7, clearcoat: .15 }, { s: [.006, .35, .35], cvar: .18, s2: [.04, .04, .04], cvar2: .1, amp: .1 }), 'plastico'); return R._mx; }
/** cabo de madera a lo largo de x (0 → L): sección oval a × b (ancho en y × alto en z) que se angosta al ojo (ojo[0] × ojo[1]) en los últimos lOjo mm */
export function cabo3d(R, padre, L, sec, ojo, lOjo, op = {}) {
  const tr = (tab) => (z) => { if (z <= tab[0][0]) return tab[0][1]; for (let i = 1; i < tab.length; i++) if (z <= tab[i][0]) { const t = (z - tab[i - 1][0]) / (tab[i][0] - tab[i - 1][0]); const s = t * t * (3 - 2 * t); return lerp(tab[i - 1][1], tab[i][1], s); } return tab[tab.length - 1][1]; };
  const z1 = L - lOjo - 70, z2 = L - lOjo;
  const ax = tr([[0, sec[0] * .9], [25, sec[0]], [z1, sec[0] * .94], [z2, ojo[0]], [L, ojo[0]]]);
  const bz = tr([[0, sec[1] * .9], [25, sec[1]], [z1, sec[1] * .94], [z2, ojo[1]], [L, ojo[1]]]);
  return revol(R, { p0: [0, 0, 0], dir: [1, 0, 0], ref: [0, 1, 0], L, ro: (th, z) => elipR(ax(z) / 2, bz(z) / 2)(th), mat: maderaX(R), padre, nt: 64, dz: 4 });
}
/** martillo maza (DIN 6475): cabeza con ojo pasante (eje x = el del cabo), cabo de madera, cuña de acero en la cara de arriba */
export function maza3d(R, Mz, op = {}) {
  const M = matsH(R), g = R.grupo();
  const [Lc, A, H] = Mz.cab, ojo = Mz.ojo, x1 = Mz.cabo, x0 = x1 - A;
  const hueco = [Array.from({ length: 48 }, (_, i) => [ojo[0] / 2 * Math.cos(TAU * i / 48), ojo[1] / 2 * Math.sin(TAU * i / 48)])];
  const cont = [[-Lc / 2 + 3, -H / 2], [Lc / 2 - 3, -H / 2], [Lc / 2, -H / 2 + 3], [Lc / 2, H / 2 - 3], [Lc / 2 - 3, H / 2], [-Lc / 2 + 3, H / 2], [-Lc / 2, H / 2 - 3], [-Lc / 2, -H / 2 + 3]];
  const gc = R.grupo(g);
  R.perfil(cont, hueco, A, op.mat || M.pavon, { A: [1, 0, 0], B: [0, 1, 0], C: [0, 0, 1], o: [x0, 0, 0], bevel: 1.2, padre: gc });
  // caras de golpe pulidas
  for (const s of [-1, 1]) R.caja(x0 + 3, x1 - 3, s * Lc / 2 - (s > 0 ? .3 : -.3) - (s > 0 ? 0 : 0), s * Lc / 2 + (s > 0 ? .25 : -.25), -H / 2 + 3, H / 2 - 3, M.pulido, { r: .2, padre: gc });
  const gm = R.grupo(g);
  cabo3d(R, gm, x1 + .3, Mz.sec, ojo, A + 2);
  // cuña de acero en diagonal sobre la cara del cabo
  const cu = R.caja(x1 + .3, x1 + .9, -ojo[0] / 2 * .85, ojo[0] / 2 * .85, -.9, .9, M.cromo, { r: .1, padre: gm }); cu.rotation.x = .5; cu.position.set(0, 0, 0);
  if (op.corte) R.cortar(gc, [x0 - 2, x1 + 2, -100, 0, 0, 100]);
  return g;
}
/** puntero octogonal (DIN 7256): cuerpo octogonal af, punta cónica, cabeza achaflanada */
export function puntero3d(R, P) {
  const M = matsH(R), g = R.grupo();
  prismaN(R, [P.punta, 0, 0], [1, 0, 0], P.L - P.punta - P.cabeza, P.af, 8, M.pavon, { padre: g, bevel: .6, giro: Math.PI / 8 });
  const rc = P.af / 2 / Math.cos(Math.PI / 8);
  R.torno([0, 0, 0], [P.punta, 0, 0], [[0, 0], [1.6, .6], [rc * .98, P.punta], [0, P.punta]], M.pulido, { seg: 8, padre: g });
  R.torno([P.L - P.cabeza, 0, 0], [P.L, 0, 0], [[0, 0], [rc * .98, 0], [P.af / 2 * .8, P.cabeza], [0, P.cabeza]], M.pulido, { seg: 8, padre: g });
  return g;
}

/* ---- fratachos y hacha ---- */
export function fratacho3d(R, F, man, hueco, op = {}) {
  const M = matsH(R), g = R.grupo();
  let z0 = 0;
  if (op.goma) { R.caja(-F.L / 2, F.L / 2, -F.A / 2, F.A / 2, 0, F.goma, M.espuma, { r: 2, padre: g }); z0 = F.goma; }
  R.caja(-F.L / 2, F.L / 2, -F.A / 2, F.A / 2, z0, z0 + F.e, op.goma ? M.azulP : M.madera, { r: op.goma ? 2 : 3, padre: g });
  const mm = pc.difference([[man.concat([man[0]])]], [[hueco.concat([hueco[0]])]]);
  R.perfil(mm, [], F.mango.A, op.goma ? M.negroP : maderaX(R), { A: [0, 1, 0], B: [1, 0, 0], C: [0, 0, 1], o: [-F.mango.L / 2, -F.mango.A / 2, z0 + F.e], bevel: 3, bevelSeg: 4, padre: g });
  for (const x of [-F.mango.L / 2 + 15, F.mango.L / 2 - 15]) R.torno([x, 0, z0 + F.e + 13], [x, 0, z0 + F.e + 14.5], [[0, 0], [4, 0], [4, .6], [2.5, 1.5], [0, 1.5]], M.cromo, { padre: g });
  return g;
}
export function hacha3d(R, Hc, cabo, sec) {
  const M = matsH(R), g = R.grupo(), E = Hc.esp;
  const cont = [[Hc.cont.concat([Hc.cont[0]])]];
  const xh = cabo - 18;
  const capa = (y0, y1, t, b) => { const m = pc.intersection(cont, cajaXY(-200, 200, y0, y1)); if (m.length) { const gg = R.grupo(g); gg.position.x = xh; ext(R, m, -t / 2, t / 2, M.pavon, gg, b); } };
  capa(-130, E.yFilo, E.filo * 2.5, .5); capa(E.yFilo - .01, E.yHoja, E.hoja, 1.2); capa(E.yHoja - .01, -20, (E.hoja + E.cuerpo) / 2, 2); capa(-20.01, 40, E.cuerpo, 2.5);
  // filo afilado (banda brillante)
  const f = pc.difference(pc.intersection(cont, cajaXY(-200, 200, -130, -106)), []);
  if (f.length) { const gg = R.grupo(g); gg.position.x = xh; ext(R, f, -E.filo * 1.25 - .05, E.filo * 1.25 + .05, M.filo, gg, .2); }
  const gm = R.grupo(g); cabo3d(R, gm, cabo + 8, sec, [Hc.ojo[1] * 1.3, Hc.ojo[0] * .5], 40);
  return g;
}

/* ---------------- DISCOS ---------------- */
/** perfil (r, t) de un disco: tipo 41 plano o 27 de centro deprimido; t0/t1 = franja del espesor (0–1) para armar capas */
export function perfilDisco(D, t0, t1) {
  const R = D.D / 2, ri = D.agujero / 2, e = D.e, a = e * t0, b = e * t1;
  if (D.tipo !== 27) return [[ri, a], [R, a], [R, b], [ri, b], [ri, a]];
  const rd = D.depr.D / 2, hh = D.depr.h;
  return [[ri, a - hh], [rd, a - hh], [rd + 9, a], [R, a], [R, b], [rd + 9, b], [rd, b - hh], [ri, b - hh], [ri, a - hh]];
}
export function disco3d(R, D, op = {}) {
  const M = matsH(R), g = R.grupo(), n = D.mallas || 2;
  // capas: abrasivo / malla / abrasivo / ... (la malla de 0,25 mm)
  const em = .25 / D.e, capas = [];
  const pasos = n + 1; let t = 0; const ea = (1 - n * em) / pasos;
  for (let i = 0; i < pasos; i++) { capas.push([t, t + ea, 'a']); t += ea; if (i < n) { capas.push([t, t + em, 'm']); t += em; } }
  const gc = R.grupo(g);
  for (const [a, b, k] of capas) R.torno([0, 0, 0], [0, 0, 1], perfilDisco(D, a, b).map(([r, tt]) => [r, tt]), k === 'a' ? M.abrasivo : M.malla, { seg: 128, padre: gc });
  // ojal de chapa (anillo metálico del agujero)
  const ri = D.agujero / 2, z0 = D.tipo === 27 ? -D.depr.h : 0;
  R.torno([0, 0, z0 - .25], [0, 0, z0 + 1], [[ri - .01, 0], [ri + 6, 0], [ri + 6, .3], [ri + .3, .3], [ri + .3, D.e + .2], [ri + 6, D.e + .2], [ri + 6, D.e + .5], [ri - .01, D.e + .5]], M.cromo, { seg: 64, padre: gc });
  if (op.corte) R.cortar(gc, [0, D.D, -D.D, 0, -20, 20]);
  if (op.etiqueta) R.impreso(op.etiqueta, D.D * .42, D.D * .22, [-D.D * .02, D.D * .22, D.e + .03], [1, 0, 0], [0, 1, 0], { color: '#f2f2ee', px: D.D / 46, peso: 700, padre: g });
  return g;
}
/** disco flap (tipo 29): plato de fibra cónico + láminas de tela de zirconio superpuestas */
export function flap3d(R, D) {
  const M = matsH(R), g = R.grupo(), Rr = D.D / 2, ri = D.agujero / 2;
  R.torno([0, 0, 0], [0, 0, 1], [[ri, -4], [20, -4], [24, 0], [Rr - 2, 2.5], [Rr - 2, 4], [24, 1.5], [20, -2.5], [ri, -2.5], [ri, -4]], M.malla, { seg: 96, padre: g });
  const nl = D.laminas;
  for (let i = 0; i < nl; i++) {
    const a = TAU * i / nl, m = R.caja(24, Rr, -6.2, 6.2, 0, .9, M.zirc, { r: .2, padre: g });
    m.rotation.order = 'ZYX'; m.rotation.z = a; m.rotation.x = .22; m.rotation.y = -.06; m.position.z = 3.2;
  }
  R.torno([0, 0, -4.3], [0, 0, 1], [[ri - .01, 0], [ri + 6, 0], [ri + 6, .3], [ri - .01, .3]], M.cromo, { seg: 64, padre: g });
  return g;
}

/* ---------------- MECHAS Y CEPILLO ---------------- */
import { rMecha } from './perfiles_nherr.mjs';
/** malla de la parte helicoidal: secciones polares giradas a lo largo de x (de x0 a x1); escala(x) achica hacia la punta */
function helice(R, d, paso, x0, x1, escala, mat, padre) {
  const T = R.THREE, M = 96, N = Math.max(40, Math.round((x1 - x0) / .6));
  const pos = [], idx = [];
  for (let j = 0; j <= N; j++) { const x = x0 + (x1 - x0) * j / N, g = TAU * x / paso, s = escala(x);
    for (let i = 0; i < M; i++) { const th = TAU * i / M, r = rMecha(d, th) * s; pos.push(x, r * Math.cos(th + g), r * Math.sin(th + g)); } }
  for (let j = 0; j < N; j++) for (let i = 0; i < M; i++) { const a = j * M + i, b = j * M + (i + 1) % M, c = a + M, e = b + M; idx.push(a, c, b, b, c, e); }
  // tapas (centro)
  const c0 = pos.length / 3; pos.push(x0, 0, 0); const c1 = pos.length / 3; pos.push(x1, 0, 0);
  for (let i = 0; i < M; i++) { idx.push(c0, i, (i + 1) % M); idx.push(c1, N * M + (i + 1) % M, N * M + i); }
  const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const m = new T.Mesh(geo, mat); m.castShadow = m.receiveShadow = true; R.sinBorde(m); padre.add(m); return m;
}
export function mecha3d(R, Mc) {
  const M = matsH(R), g = R.grupo();
  const tp = Mc.punta;
  helice(R, Mc.d, Mc.paso, 0, tp, (x) => Math.max(.02, x / tp), M.hssRect, g);
  helice(R, Mc.d, Mc.paso, tp, Mc.Lc, () => 1, M.hss, g);
  R.cil([Mc.Lc - .5, 0, 0], [Mc.L - .6, 0, 0], Mc.d / 2 * .99, M.hss, { padre: g, seg: 64 });
  R.torno([Mc.L - .6, 0, 0], [Mc.L, 0, 0], [[0, 0], [Mc.d / 2 * .99, 0], [Mc.d / 2 - .6, .6], [0, .6]], M.hss, { padre: g });
  R.impresoCil([{ t: `HSS  Ø${Mc.d}`, s: 1 }], [Mc.Lc + 8, 0, 0], [Mc.L - 8, 0, 0], Mc.d / 2 + .02, 70, 90, { color: '#d9dcdf', px: Mc.d * .32, padre: g });
  return g;
}
export function cepillo3d(R, C) {
  const M = matsH(R), g = R.grupo(), mad = maderaX(R);
  // cuerpo: zapata de las hileras + mango que sube
  const cont = [[0, -C.ancho / 2], [C.largoHil + 20, -C.ancho / 2], [C.largoHil + 40, -C.ancho / 2 + 6], [C.L - 8, -9], [C.L, -6], [C.L, 6], [C.L - 8, 9], [C.largoHil + 40, C.ancho / 2 - 6], [C.largoHil + 20, C.ancho / 2], [0, C.ancho / 2]];
  ext(R, [[cont.concat([cont[0]])]], 0, C.e, mad, g, 2.5);
  const dx = C.largoHil / C.penachos, dy = (C.ancho - 6) / (C.hileras - 1);
  for (let i = 0; i < C.penachos; i++) for (let j = 0; j < C.hileras; j++) {
    const x = 10 + i * dx + (j % 2) * dx * .3, y = -C.ancho / 2 + 3 + j * dy;
    for (let k = 0; k < 7; k++) { const a = TAU * k / 7 + i, rr = k ? 1.0 : 0, sp = k ? 1.9 : .2;
      const m = R.cil([x + rr * Math.cos(a), y + rr * Math.sin(a), .5], [x + (rr + sp) * Math.cos(a) + Math.sin(i * 7.1 + j) * .4, y + (rr + sp) * Math.sin(a), -C.pelo + Math.abs(Math.sin(i * 3 + j * 5 + k)) * 1.5], .32, M.alambreAc, { padre: g, seg: 6 }); R.sinBorde(m); } }
  R.cil([C.L - 14, 0, -1], [C.L - 14, 0, C.e + 1], 3, M.oscuro || M.tinta, { padre: g });
  return g;
}

/* ---------------- CAJAS ---------------- */
/** cubeta abierta (fondo + 4 paredes sin solaparse) de L × A × H, pared t, en x ∈ [-L/2, L/2], y ∈ [-A/2, A/2], z ∈ [z0, z0 + H] */
export function cubeta(R, padre, L, A, H, t, mat, z0 = 0) {
  const g = R.grupo(padre), o = { r: Math.min(1.2, t * .45), padre: g };
  R.caja(-L / 2, L / 2, -A / 2, A / 2, z0, z0 + t, mat, o);
  R.caja(-L / 2, L / 2, -A / 2, -A / 2 + t, z0 + t, z0 + H, mat, o); R.caja(-L / 2, L / 2, A / 2 - t, A / 2, z0 + t, z0 + H, mat, o);
  R.caja(-L / 2, -L / 2 + t, -A / 2 + t, A / 2 - t, z0 + t, z0 + H, mat, o); R.caja(L / 2 - t, L / 2, -A / 2 + t, A / 2 - t, z0 + t, z0 + H, mat, o);
  return g;
}
export function cajaHerr3d(R, C, op = {}) {
  const M = matsH(R), g = R.grupo(), t = 3, hb = C.H * .72, ht = C.H - hb;
  const mc = op.mat || M.negroP, ma = op.matAcc || M.naranja;
  cubeta(R, g, C.L, C.A, hb, t, mc);
  // bandeja con divisiones (apoyada en el borde)
  const gb = R.grupo(g); const zb = hb - C.bandeja;
  cubeta(R, gb, C.L - 2 * t - 1, C.A - 2 * t - 1, C.bandeja, 2, op.matBand || M.grisP, zb);
  for (const x of [-C.L * .18, C.L * .12]) R.caja(x - 1, x + 1, -C.A / 2 + t + 2, C.A / 2 - t - 2, zb + 2, zb + C.bandeja - 6, op.matBand || M.grisP, { r: .4, padre: gb });
  R.caja(-14, 14, -3, 3, zb + 2, hb + 14, op.matBand || M.grisP, { r: 1.5, padre: gb });   // manija de la bandeja
  // tapa (cáscara invertida) abierta o cerrada
  const gt = R.grupo(g);
  const gti = R.grupo(gt); cubeta(R, gti, C.L, C.A, ht, t, mc, 0); gti.rotation.x = Math.PI; gti.position.z = ht;
  if (op.abierta) { gt.position.set(0, C.A / 2, hb); gt.rotation.x = -1.9; gti.position.y = -C.A / 2; }
  else gt.position.set(0, 0, hb);
  // manija y trabas
  if (!op.abierta) { const zt = C.H;
    R.caja(-C.L * .3, -C.L * .3 + 10, -6, 6, zt, zt + 16, mc, { r: 2, padre: g }); R.caja(C.L * .3 - 10, C.L * .3, -6, 6, zt, zt + 16, mc, { r: 2, padre: g });
    R.caja(-C.L * .3 + 4, C.L * .3 - 4, -8, 8, zt + 14, zt + 24, ma, { r: 3, padre: g }); }
  for (const x of [-C.L * .32, C.L * .32]) R.caja(x - 14, x + 14, -C.A / 2 - 4, -C.A / 2, hb - 20, hb + 16, ma, { r: 1.5, padre: g });
  if (op.corte) R.cortar(g, [-C.L * .05, C.L, -C.A, -C.A / 2 + 14, C.H * .3, C.H + 40]);
  return g;
}
export function organizador3d(R, O) {
  const M = matsH(R), g = R.grupo(), t = 2.5;
  cubeta(R, g, O.L, O.A, O.H, t, M.negroP);
  const [nx, ny] = O.divs;
  for (let i = 1; i < nx; i++) { const x = -O.L / 2 + O.L * i / nx; R.caja(x - 1, x + 1, -O.A / 2 + t, O.A / 2 - t, t, O.H - 4, M.grisP, { r: .4, padre: g }); }
  for (let j = 1; j < ny; j++) { const y = -O.A / 2 + O.A * j / ny; R.caja(-O.L / 2 + t, O.L / 2 - t, y - 1, y + 1, t, O.H - 4, M.grisP, { r: .4, padre: g }); }
  const tapa = R.caja(-O.L / 2, O.L / 2, -O.A / 2, O.A / 2, O.H, O.H + 3, R.M.vidrio(), { r: 1, padre: g });
  for (const x of [-O.L * .3, O.L * .3]) R.caja(x - 15, x + 15, -O.A / 2 - 5, -O.A / 2, O.H - 15, O.H + 5, M.naranja, { r: 1.5, padre: g });
  // cositas adentro: tarugos, punteras
  for (let k = 0; k < 6; k++) R.cil([-O.L / 2 + 20 + k * 6, -O.A / 2 + 20, t], [-O.L / 2 + 20 + k * 6, -O.A / 2 + 20, t + 30], 2.6, M.C.fisher || M.azulP, { padre: g });
  return g;
}

/* ---------------- VARIOS: pasacable, pistola, cinta de papel, pila, caloventor, electrodo ---------------- */
export function pasacable3d(R, P, op = {}) {
  const M = matsH(R), g = R.grupo(), Rr = P.carrete / 2, e = P.e;
  // carcasa: dos tapas + aro (eje z = eje del carrete)
  R.torno([0, 0, 0], [0, 0, 1], [[0, 0], [Rr - 4, 0], [Rr, 4], [Rr, e - 4], [Rr - 4, e], [0, e]], op.mat || M.amarillo, { seg: 96, padre: g });
  R.torno([0, 0, e - .01], [0, 0, e + 2], [[0, 0], [Rr * .35, 0], [Rr * .35, 2], [0, 2]], M.negroP, { seg: 64, padre: g });
  // manija (agarre) arriba
  R.caja(-12, 12, Rr - 6, Rr + 40, 8, e - 8, M.negroP, { r: 5, padre: g });
  R.caja(-34, -12, Rr + 30, Rr + 40, 8, e - 8, M.negroP, { r: 3, padre: g });
  // salida de la cinta y cinta de acero plana con el ojal en la punta
  const [w, t] = P.cinta, Ls = 170;
  R.caja(Rr - 6, Rr + 10, -14, -6, e / 2 - 8, e / 2 + 8, M.negroP, { r: 2, padre: g });
  R.caja(Rr + 8, Rr + 8 + Ls, -10 - t / 2, -10 + t / 2, e / 2 - w / 2, e / 2 + w / 2, M.alambreAc, { r: .2, padre: g });
  const oj = new R.THREE.Mesh(new R.THREE.TorusGeometry(4, .9, 10, 32), M.latonA); oj.position.set(Rr + 12 + Ls, -10, e / 2); oj.rotation.x = Math.PI / 2; g.add(oj);
  R.impreso([op.rotulo || `${P.L / 1000} m`], 40, 14, [0, -Rr * .55, e + .05], [1, 0, 0], [0, 1, 0], { color: '#111', px: 7, padre: g });
  return g;
}
export function pistola3d(R, Pi, cart, op = {}) {
  const M = matsH(R), g = R.grupo(), T = R.THREE, c = Pi.cuna;
  // cuna semicilíndrica (abierta arriba) a lo largo de x
  revol(R, { p0: [c.x0, 0, 0], dir: [1, 0, 0], ref: [0, 0, -1], L: c.x1 - c.x0, ro: () => c.r + c.e, ri: () => c.r, a0: -70, a1: 70, mat: M.cromo, padre: g, nt: 48, dz: 20 });
  R.torno([c.x0 - 3, 0, 0], [c.x0, 0, 0], [[8, 0], [c.r + c.e, 0], [c.r + c.e, 3], [8, 3], [8, 0]], M.cromo, { padre: g });   // aro de la boquilla
  R.caja(Pi.placa.x, Pi.placa.x + Pi.placa.e, -c.r, c.r, -c.r - 6, c.r, M.cromo, { r: 1, padre: g });
  R.perfil(Pi.mango, [], Pi.ancho, M.negroP, { A: [0, 1, 0], B: [1, 0, 0], C: [0, 0, 1], o: [0, -Pi.ancho / 2, 0], bevel: 2.5, padre: g });
  R.perfil(Pi.gatillo, [], Pi.ancho - 4, M.cromo, { A: [0, 1, 0], B: [1, 0, 0], C: [0, 0, 1], o: [0, -Pi.ancho / 2 + 2, 0], bevel: 1, padre: g });
  const v = Pi.vastago; R.cil([v.x0, 0, 0], [v.x0 + v.L, 0, 0], v.r, M.cromo, { padre: g });
  R.cil([v.x0 - Pi.piston.e, 0, 0], [v.x0, 0, 0], Pi.piston.r, M.cromo, { padre: g });
  R.torno([v.x0 + v.L, 0, 0], [v.x0 + v.L + 4, 0, 0], [[0, 0], [9, 0], [9, 4], [0, 4]], M.cromo, { padre: g });   // tope del vástago (gancho)
  // cartucho
  if (cart) { const x0 = 4;
    R.cil([x0, 0, 0], [x0 + cart.L - 8, 0, 0], cart.D / 2, M.blancoP, { padre: g, seg: 64 });
    R.torno([x0 - 1, 0, 0], [x0 - 60, 0, 0], [[0, 0], [7, 0], [2.4, 56], [0, 59]], M.blancoP, { padre: g });
    R.impresoCil([{ t: 'SILICONA', s: 1 }, { t: '300 ml', s: .7 }], [x0 + 30, 0, 0], [x0 + 150, 0, 0], cart.D / 2 + .05, 90, 270, { color: '#2a5caa', px: 9, padre: g, fondo: null }); }
  return g;
}
export function cintaPapel3d(R, Cp) {
  const M = matsH(R), g = R.grupo(), ri = Cp.nucleo / 2, re = Cp.De / 2;
  R.torno([0, 0, 0], [0, 0, 1], [[ri, 0], [ri + 4, 0], [ri + 4, Cp.A], [ri, Cp.A], [ri, 0]], M.carton, { seg: 96, padre: g });
  R.torno([0, 0, 0], [0, 0, 1], [[ri + 4, 0], [re, 0], [re, Cp.A], [ri + 4, Cp.A], [ri + 4, 0]], M.papel, { seg: 128, padre: g });
  R.caja(-1, 80, -re - .25, -re + .05, 0, Cp.A, M.papel, { r: .05, padre: g });   // punta despegada
  return g;
}

export function pila3d(R, P, op = {}) {
  const M = matsH(R), g = R.grupo(), L = P.L - P.nub.h;
  const mats = [M.pilaN, M.cromo, R.tipoCorte(R.M.pa('#2a2a2c', { roughness: .9 }), 'plastico'), M.blancoP, R.tipoCorte(R.M.pa('#8d9196', { roughness: .8 }), 'plastico'), M.latonA];
  const capas = P.capas.map((c, i) => { const gc = R.grupo(g);
    const ro = c[1], ri = c[2], z0 = i === 0 ? 0 : .4, z1 = i === 0 ? L : L - .4;
    const prof = ri > 0 ? [[ri, z0], [ro, z0], [ro, z1], [ri, z1], [ri, z0]] : [[0, z0 + 1.5], [ro, z0 + 1.5], [ro, z1 - 2], [0, z1 - 2]];
    R.torno([0, 0, 0], [0, 0, 1], prof, mats[i], { seg: 64, padre: gc }); return gc; });
  // tapas: (+) con el nub, (-) plana
  R.torno([0, 0, L - .4], [0, 0, L + 1], [[0, 0], [P.D / 2 - .3, 0], [P.D / 2 - .3, .4], [P.nub.D / 2, .4], [P.nub.D / 2, .4 + P.nub.h], [0, .4 + P.nub.h]], M.cromo, { seg: 48, padre: g });
  R.torno([0, 0, -.1], [0, 0, 1], [[0, 0], [P.D / 2 - .5, 0], [P.D / 2 - .5, .5], [0, .5]], M.cromo, { seg: 48, padre: g });
  // banda dorada de la etiqueta y texto
  if (!op.corte) R.torno([0, 0, L * .62], [0, 0, 1], [[P.D / 2 + .01, 0], [P.D / 2 + .03, 0], [P.D / 2 + .03, L * .38 - .2], [P.D / 2 + .01, L * .38 - .2]], M.pilaD, { seg: 64, padre: capas[0] });
  if (!op.corte) R.impresoCil([{ t: 'AAA  LR03  1,5 V', s: 1 }], [0, 0, 4], [0, 0, L * .6], P.D / 2 + .05, 80, -90, { color: '#f0f0f0', px: 2.1, padre: g });
  if (op.corte) capas.forEach((gc, k) => { const d = k * .5; R.cortar(gc, [-20, 20, -20, d * .1, 4 + d * 2, L - 4]); });
  return g;
}
export function caloventor3d(R, C) {
  const M = matsH(R), g = R.grupo(), A = C.A, B = C.B, H = C.H;
  R.caja(-A / 2, A / 2, -B / 2, B / 2, 12, H, M.blancoP, { r: 14, padre: g });
  R.caja(-A / 2 + 20, A / 2 - 20, -B / 2 + 25, B / 2 - 25, 0, 12, M.grisP, { r: 4, padre: g });     // base
  // rejilla al frente (-y): ranuras horizontales + resistencia que se ve atrás
  R.caja(-A / 2 + 25, A / 2 - 25, -B / 2 - .5, -B / 2 + 2, 50, H - 70, M.grisP, { r: 3, padre: g });
  for (let k = 0; k < 11; k++) { const z = 58 + k * ((H - 136) / 10); R.caja(-A / 2 + 30, A / 2 - 30, -B / 2 - 1.2, -B / 2 + .5, z, z + 4, M.negroP, { r: 1, padre: g }); }
  for (let k = 0; k < 4; k++) R.caja(-A / 2 + 40, A / 2 - 40, -B / 2 + 5, -B / 2 + 7, 80 + k * 30, 84 + k * 30, M.resist, { r: 1, padre: g });
  // perillas arriba
  for (const [x, t] of [[-40, 'W'], [40, '°C']]) { R.torno([x, -20, H - 1], [x, -20, H + 18], [[0, 0], [14, 0], [14, 16], [11, 19], [0, 19]], M.grisP, { seg: 48, padre: g }); R.caja(x - 2, x + 2, -34, -20, H + 18, H + 19.5, M.naranja, { r: .3, padre: g }); }
  // manija atrás arriba
  R.caja(-50, 50, B / 2 - 30, B / 2 - 10, H - 8, H + 6, M.blancoP, { r: 6, padre: g });
  R.impreso(['2000 W'], 60, 16, [0, -B / 2 - 1.3, H - 40], [1, 0, 0], [0, 0, 1], { color: '#333', px: 9, padre: g });
  // cable
  R.cil([A / 2 - 30, B / 2, 30], [A / 2 + 60, B / 2 + 40, 4], 3.5, R.M.cable('#f2f2ee'), { padre: g });
  return g;
}
export function electrodo3d(R, E, op = {}) {
  const M = matsH(R), g = R.grupo(), r = E.d / 2, rr = E.Drev / 2, Lr = E.L - E.punta;
  const gA = R.grupo(g), gF = R.grupo(g);
  R.cil([0, 0, 0], [E.L, 0, 0], r, M.alambreAc, { padre: gA, seg: 24 });
  R.torno([0, 0, 0], [Lr, 0, 0], [[r + .01, 0], [rr - .6, 0], [rr, 1.2], [rr, Lr], [r + .01, Lr]], M.flux, { seg: 32, padre: gF });
  if (op.marca) R.impresoCil([{ t: op.marca, s: 1 }], [40, 0, 0], [110, 0, 0], rr + .03, 70, 90, { color: '#1b3a7a', px: 1.8, padre: g });
  if (op.corte) [gA, gF].forEach((gc, k) => { const d = k * .5; R.cortar(gc, [op.corte[0] + d * 4, op.corte[1], -10, d * .2, -d * .2, 10]); });
  return g;
}
