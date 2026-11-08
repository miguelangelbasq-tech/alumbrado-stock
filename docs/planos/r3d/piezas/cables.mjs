/* cables.mjs · cables en corte escalonado (vaina → relleno → aislación → cuerda de alambres), haces preensamblados retorcidos,
 * antihurto concéntrico. Geometría de perfiles_cables.mjs. Eje del cable = +x; (y, z) = sección. */
import { COL } from './perfiles_cables.mjs';

const ss = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);

/** materiales del grupo */
export function mats(R) {
  const T = R.THREE;
  const std = (o) => new T.MeshPhysicalMaterial(o);
  if (R._mc) return R._mc;
  R._mc = {
    vaina: R.M.pvc(COL.vaina, { roughness: .5, clearcoat: .15 }),
    relleno: R.M.goma(COL.relleno),
    ais: (f) => R.M.cable(f === 'PE' ? COL.PE : f === 'XN' ? COL.xlpeNegro : (COL[f] || COL.xlpeNegro)),
    rayaPE: (() => { const m = R.M.cable(COL.PEy); m.side = T.DoubleSide; m.polygonOffset = true; m.polygonOffsetFactor = -4; m.polygonOffsetUnits = -4; return m; })(),
    cu: R.tipoCorte(R.M.cobre(), 'metal'),
    al: R.tipoCorte(std({ color: '#cfd4d9', metalness: 1, roughness: .33 }), 'metal'),
    cinta: R.M.pa(COL.cinta, { roughness: .5 }),
    tinta: '#e9e9e4',
  };
  return R._mc;
}

/** curva por x: f(x) → [x,y,z] */
function curvaX(T, f, x0, x1) {
  class C extends T.Curve { getPoint(t, o = new T.Vector3()) { const p = f(x0 + (x1 - x0) * t); return o.set(p[0], p[1], p[2]); } }
  return new C();
}
/** marco (T, N, B) de un camino f en x, con N lo más parecido a +z */
function marco(T, f, x) {
  const h = .05, a = f(x - h), b = f(x + h);
  const t = new T.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]).normalize();
  let n = new T.Vector3(0, 0, 1).addScaledVector(t, -t.z); if (n.lengthSq() < 1e-6) n.set(0, 1, 0); n.normalize();
  const bb = new T.Vector3().crossVectors(t, n);
  return [t, n, bb];
}
/** tubo de radio r a lo largo de f(x) de x0 a x1 (con tapas planas) */
export function tubo(R, f, x0, x1, r, mat, op = {}) {
  const T = R.THREE;
  const segs = op.segs || Math.max(8, Math.ceil((x1 - x0) / (op.paso || 1.2)));
  const g = new T.TubeGeometry(curvaX(T, f, x0, x1), segs, r, op.rad || 24, false);
  g.deleteAttribute('uv');
  const m = new T.Mesh(g, mat); m.castShadow = m.receiveShadow = true; R.sinBorde(m); (op.padre || R.raiz).add(m);
  if (op.tapas !== false) for (const [x, s] of [[x0, -1], [x1, 1]]) {
    if (op.tapas === 'fin' && s < 0) continue;
    const [t] = marco(T, f, x); const p = f(x);
    const c = new T.Mesh(new T.CircleGeometry(r, op.rad || 24), op.matTapa || mat); c.position.set(...p);
    c.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), t.clone().multiplyScalar(s)); R.sinBorde(c); (op.padre || R.raiz).add(c);
  }
  return m;
}
/** anillo (tapa de una capa cortada) en la posición x del camino f */
function anillo(R, f, x, ri, ro, mat, padre) {
  const T = R.THREE; const [t] = marco(T, f, x); const p = f(x);
  const c = new T.Mesh(new T.RingGeometry(ri, ro, 48, 1), mat); c.position.set(...p);
  c.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), t); R.sinBorde(c); padre.add(c); return c;
}
/** cuerda: alambres helicoidales alrededor del camino f. cond = {rw, hilos:[[r, ang]]}. paso = paso de cableado de los alambres */
export function cuerda(R, f, x0, x1, cond, mat, op = {}) {
  const T = R.THREE; const g = R.grupo(op.padre); const paso = op.paso || cond.R * 14;
  for (const [rr, a0] of cond.hilos) {
    const sentido = 1;
    const fw = (x) => {
      const [t, n, b] = marco(T, f, x); const p = f(x);
      const a = (a0 * Math.PI / 180) + sentido * 2 * Math.PI * x / paso;
      return [p[0] + rr * (n.x * Math.cos(a) + b.x * Math.sin(a)), p[1] + rr * (n.y * Math.cos(a) + b.y * Math.sin(a)), p[2] + rr * (n.z * Math.cos(a) + b.z * Math.sin(a))];
    };
    tubo(R, fw, x0, x1, cond.rw * .97, mat, { padre: g, rad: op.rad || 12, paso: op.pasoSeg || Math.max(.35, Math.min(1, paso / 40)), tapas: op.tapas });
  }
  return g;
}

/** cable multipolar (o unipolar) con la punta pelada en escalones.
 *  C = CAB.xxx. op: x0 (comienzo, < 0), Lv (fin de la vaina), Lr (fin del relleno), Lb (largo de la apertura), abrir (cuánto se separan),
 *  La [fin de la aislación de cada conductor], Lc [fin del cobre], zc (altura del eje), marca (texto), padre, metal 'cu'|'al'
 *  Devuelve {g, f:[caminos], puntos para anclas} */
export function cableEscalonado(R, C, op = {}) {
  const T = R.THREE, M = mats(R), g = R.grupo(op.padre);
  const x0 = op.x0 !== undefined ? op.x0 : -60, Lv = op.Lv || 0, Lr = op.Lr !== undefined ? op.Lr : Lv + 2, Lb = op.Lb || 14, ab = op.abrir || .8;
  const zc = op.zc !== undefined ? op.zc : C.Ro, n = C.conds.length;
  const metal = op.metal === 'al' || C.al ? M.al : M.cu;
  // vaina (tubo con espesor) + anillo de corte en Lv
  const gv = R.grupo(g);
  if (C.ev > 0) {
    R.torno([x0, 0, zc], [Lv, 0, zc], [[C.Ri, 0], [C.Ro, 0], [C.Ro, Lv - x0], [C.Ri, Lv - x0]], R.tipoCorte(M.vaina, 'plastico'), { padre: gv, seg: 96 });
    if (op.marca) R.impresoCil([op.marca], [op.marcaX ? op.marcaX[0] : x0 + 6, 0, zc], [op.marcaX ? op.marcaX[1] : Lv - 6, 0, zc], C.Ro + .02, 70, op.angMarca !== undefined ? op.angMarca : 150, { color: M.tinta, px: op.pxMarca || 1.6, padre: g });
  }
  // relleno: círculo Ri menos los conductores (extruido de x0 a Lr)
  if (C.ev > 0 && C.relleno !== false && n > 1) {
    const circ = (cy, cz, r, k = 64) => Array.from({ length: k }, (_, i) => [cy + r * Math.cos(2 * Math.PI * i / k), cz + r * Math.sin(2 * Math.PI * i / k)]);
    const mp = R.restar(circ(0, zc, C.Ri - .02), C.conds.map(c => circ(c.y, zc + c.z, c.rc + .03, 40)));
    R.perfil(mp, null, Lr - x0, M.relleno, { a0: x0, bevel: 0, padre: gv });
  }
  if (op.ventana) R.cortar(gv, op.ventana);   // ventana a cuarto en la vaina y el relleno para ver los conductores adentro
  R.sinBorde(gv);
  // conductores
  const caminos = [];
  C.conds.forEach((c, i) => {
    const sc = (x) => 1 + ab * ss((x - Lr) / Lb);
    const dz = (op.caida || 0);
    const f = (x) => [x, c.y * sc(x), zc + c.z * sc(x) - dz * ss((x - Lr) / Lb)];
    caminos.push(f);
    const xa = op.La ? op.La[i] : Lr + 20, xc = op.Lc ? op.Lc[i] : xa + 10;
    const mAis = M.ais(c.f);
    // aislación: tubo de radio rc hasta xa, con anillo en la punta
    const ti = tubo(R, f, x0 + .5, xa, c.rc, mAis, { padre: g, rad: 40, paso: .8, tapas: false });
    anillo(R, f, xa, c.R * .98, c.rc, mAis, g);
    if (c.f === 'PE') {   // verde-amarillo: banda amarilla helicoidal (franjas)
      const fr = (x) => f(x);
      const tt = tubo(R, fr, x0 + .5, xa - .05, c.rc + .06, M.rayaPE, { padre: g, rad: 40, paso: .8, tapas: false });
      // recorto la franja con un shader simple: uso alphaTest por coordenada → más simple: geometría de franjas
      tt.geometry.dispose(); tt.geometry = franjas(T, f, x0 + .5, xa - .05, c.rc + .06, op.pasoPE || 12);
    }
    // cuerda: los alambres salen de adentro de la aislación (desde xa − 3) hasta xc
    cuerda(R, f, xa - 3, xc, c, metal, { padre: g, paso: op.pasoCuerda || Math.max(18, c.R * 16), rad: c.n > 20 ? 6 : 12, tapas: 'fin' });
  });
  return { g, f: caminos, zc };
}
/** banda amarilla (verde-amarillo IRAM): 2 franjas longitudinales de 90° (geometría parcial de tubo) */
function franjas(T, f, x0, x1, r, _paso) {
  const pos = [], idx = []; const nx = Math.ceil((x1 - x0) / .8), na = 14;
  const arcos = [[20, 110], [200, 290]];
  let base = 0;
  for (const [a0, a1] of arcos) {
    for (let i = 0; i <= nx; i++) {
      const x = x0 + (x1 - x0) * i / nx; const [t, n, b] = marco(T, f, x); const p = f(x);
      for (let j = 0; j <= na; j++) { const a = (a0 + (a1 - a0) * j / na) * Math.PI / 180; pos.push(p[0] + r * (n.x * Math.cos(a) + b.x * Math.sin(a)), p[1] + r * (n.y * Math.cos(a) + b.y * Math.sin(a)), p[2] + r * (n.z * Math.cos(a) + b.z * Math.sin(a))); }
    }
    for (let i = 0; i < nx; i++) for (let j = 0; j < na; j++) { const a = base + i * (na + 1) + j, b2 = a + na + 1; idx.push(a, b2, a + 1, a + 1, b2, b2 + 1); }
    base += (nx + 1) * (na + 1);
  }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}

/** haz preensamblado: H = HAZ.xxx. Fases helicoidales (paso H.paso) alrededor del neutro (portante) o entre sí.
 *  op: x0, x1 (fin de la aislación de cada uno: [fases..., neutro]), Lc (largo de cuerda pelada), zc, numeros (marca 1-2-3 impresa), padre */
export function hazPre(R, H, op = {}) {
  const T = R.THREE, M = mats(R), g = R.grupo(op.padre);
  const x0 = op.x0 !== undefined ? op.x0 : 0, zc = op.zc !== undefined ? op.zc : H.Dh / 2, paso = op.paso || H.paso;
  const nf = H.fases.length; const caminos = [];
  const todos = [...H.fases.map((c, i) => ({ c, d: H.neu ? H.d : (c.f === 'N' && H.fases[0].rc > c.rc ? H.d - (H.fases[0].rc - c.rc) : H.d), a0: op.a0 !== undefined ? op.a0 + 360 * i / nf : 90 + 360 * i / nf })),
    ...(H.neu ? [{ c: H.neu, d: 0, a0: 0, neu: true }] : [])];
  todos.forEach((o, i) => {
    const xa = op.xa[i], xc = xa + (op.Lc ? (Array.isArray(op.Lc) ? op.Lc[i] : op.Lc) : 12);
    const sep = op.sep || 0;  // separación de la punta (para que se vean)
    const f = (x) => { const a = o.a0 * Math.PI / 180 + 2 * Math.PI * x / paso; const s = (1 + sep * ss((x - (op.xsep || xa - 40)) / 30)) * (op.bulto && !o.neu ? 1 + op.bulto.k * Math.exp(-Math.pow((x - op.bulto.x) / op.bulto.w, 2)) : 1);
      return [x, o.d * s * Math.cos(a), zc + o.d * s * Math.sin(a)]; };
    caminos.push(f);
    const mAis = M.ais('XN');
    tubo(R, f, x0, xa, o.c.rc, mAis, { padre: g, rad: 44, paso: 1, tapas: false });
    anillo(R, f, xa, o.c.R * .98, o.c.rc, mAis, g);
    if (op.marcas && !o.neu) {   // número de fase impreso en la aislación (AC: IRAM 2263 marca con números o nervios)
      for (let k = 0; k < op.marcas.length; k++) {
        const xm = op.marcas[k]; if (xm > xa - 8) continue;
        const [t, n, b] = marco(T, f, xm); const p = f(xm);
        const out = new T.Vector3(0, p[1], p[2] - zc); out.addScaledVector(t, -out.dot(t)).normalize();
        const v = t.clone(); const u = new T.Vector3().crossVectors(v, out).normalize();
        const oo = new T.Vector3(...p).addScaledVector(out, o.c.rc + .03);
        R.impreso([String(o.c.f)], 4.2, 4.2, oo.toArray(), u.toArray(), v.toArray(), { color: '#e6e6e0', px: 3.6, padre: g });
      }
    }
    cuerda(R, f, xa - 3, xc, o.c, M.al, { padre: g, paso: o.c.R * 14, rad: 14, tapas: 'fin' });
  });
  return { g, f: caminos };
}

/** antihurto concéntrico: fase al centro (XLPE), corona de alambres de cobre (neutro), cinta, vaina negra */
export function antihurto(R, A, op = {}) {
  const T = R.THREE, M = mats(R), g = R.grupo(op.padre);
  const x0 = op.x0 || -50, zc = op.zc !== undefined ? op.zc : A.Ro, Lv = op.Lv || 0, Lt = op.Lt || 4, Ln = op.Ln || 16, La = op.La || 26, Lc = op.Lc || 36;
  const ax = (x) => [x, 0, zc];
  R.sinBorde(R.torno([x0, 0, zc], [Lv, 0, zc], [[A.rCinta, 0], [A.Ro, 0], [A.Ro, Lv - x0], [A.rCinta, Lv - x0]], M.vaina, { padre: g, seg: 96 }));
  if (op.marca) R.impresoCil([op.marca], [x0 + 5, 0, zc], [Lv - 5, 0, zc], A.Ro + .02, 80, op.angMarca || 150, { color: M.tinta, px: 1.2, padre: g });
  R.sinBorde(R.torno([x0, 0, zc], [Lt, 0, zc], [[A.rCinta - .1, 0], [A.rCinta, 0], [A.rCinta, Lt - x0], [A.rCinta - .1, Lt - x0]], M.cinta, { padre: g, seg: 96 }));
  // neutro concéntrico: corona de alambres helicoidales (paso 60, AC) cortada a ras en Ln
  for (let i = 0; i < A.nAl; i++) {
    const a0 = 2 * Math.PI * i / A.nAl;
    const f = (x) => { const a = a0 + 2 * Math.PI * x / 60; return [x, A.rN * Math.cos(a), zc + A.rN * Math.sin(a)]; };
    tubo(R, f, x0 + .5, Ln, A.rwN * .97, M.cu, { padre: g, rad: 10, paso: .5, tapas: 'fin' });
  }
  tubo(R, ax, x0 + .5, La, A.fase.rc, M.ais('L2'), { padre: g, rad: 48, tapas: false });
  anillo(R, ax, La, A.fase.R * .98, A.fase.rc, M.ais('L2'), g);
  cuerda(R, ax, La - 3, Lc, A.fase, M.cu, { padre: g, paso: 16, rad: 12, tapas: 'fin' });
  return { g, zc };
}
