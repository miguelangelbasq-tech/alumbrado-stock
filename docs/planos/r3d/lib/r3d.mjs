/* r3d.mjs · librería del navegador para los renders de las fichas de materiales EMA.
 * Unidades: mm. Ejes: x = ancho (paso de los bornes / módulos), y = largo o profundidad, z = arriba (z-up).
 * Una escena (escenas/*.mjs) recibe R y arma las piezas con R.perfil, R.cil, R.caja, R.tornillo, R.texto, R.impreso…,
 * marca puntos con R.ancla('nombre', [x,y,z]) y elige la cámara con R.vista({az, el, fov}). R.render() hace el resto:
 * luz de estudio de 3 puntos + reflejos (RoomEnvironment/PMREM), sombra suave al piso, encuadre automático, supersampling. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import * as BGU from 'three/addons/utils/BufferGeometryUtils.js';
import { Brush, Evaluator, SUBTRACTION, ADDITION, INTERSECTION } from 'three-bvh-csg';
import polygonClipping from 'polygon-clipping';

THREE.Object3D.DEFAULT_UP.set(0, 0, 1);
const V = (a) => (a instanceof THREE.Vector3 ? a.clone() : new THREE.Vector3(a[0], a[1], a[2]));

/* ---------------- ruido procedural en el shader (posición en el mundo, igual para cualquier geometría) ---------------- */
const GLSL_RUIDO = `
float r3h(vec3 p){ p = fract(p*0.3183099 + .1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float r3n(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);
  return mix(mix(mix(r3h(i+vec3(0,0,0)),r3h(i+vec3(1,0,0)),f.x), mix(r3h(i+vec3(0,1,0)),r3h(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(r3h(i+vec3(0,0,1)),r3h(i+vec3(1,0,1)),f.x), mix(r3h(i+vec3(0,1,1)),r3h(i+vec3(1,1,1)),f.x),f.y),f.z); }
float r3f(vec3 p){ return .55*r3n(p) + .3*r3n(p*2.13+7.1) + .15*r3n(p*4.71+3.3); }`;

function conRuido(m, rz) {
  // rz = { f: frecuencia (1/mm), amp: relieve, cvar: variación de color, ray: {dir:[x,y,z], paso, fuerza} rayado de corte }
  if (!rz) return m;
  m.onBeforeCompile = (sh) => {
    sh.uniforms.rzF = { value: rz.f || 2 }; sh.uniforms.rzA = { value: rz.amp || 0 }; sh.uniforms.rzC = { value: rz.cvar || 0 };
    sh.uniforms.rzRD = { value: new THREE.Vector3(...(rz.ray ? rz.ray.dir : [0, 1, 1])).normalize() };
    sh.uniforms.rzRP = { value: rz.ray ? rz.ray.paso : 0 }; sh.uniforms.rzRF = { value: rz.ray ? rz.ray.fuerza || .35 : 0 };
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP = (modelMatrix * vec4(transformed,1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP;\nuniform float rzF,rzA,rzC,rzRP,rzRF;\nuniform vec3 rzRD;' + GLSL_RUIDO)
      .replace('#include <color_fragment>', `#include <color_fragment>
        float rzv = r3f(vWP*rzF); diffuseColor.rgb *= 1.0 + rzC*(rzv-.5)*2.0;
        if (rzRP > 0.0) { float s = fract(dot(vWP, rzRD)/rzRP); diffuseColor.rgb *= 1.0 - rzRF*smoothstep(.0,.08,s)*(1.0-smoothstep(.16,.24,s)); }`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        if (rzA > 0.0) { float e = .35/rzF; vec3 q = vWP*rzF;
          vec3 g = vec3(r3f(q+vec3(e,0,0))-r3f(q-vec3(e,0,0)), r3f(q+vec3(0,e,0))-r3f(q-vec3(0,e,0)), r3f(q+vec3(0,0,e))-r3f(q-vec3(0,0,e)))/(2.0*e);
          vec3 gv = (viewMatrix*vec4(g,0.0)).xyz; normal = normalize(normal - rzA*(gv - dot(gv,normal)*normal)); }`);
  };
  m.customProgramCacheKey = () => JSON.stringify(rz);
  return m;
}

/* ---------------- materiales ---------------- */
// Paleta fiel a la realidad (regla de Ángel: cada material con su color y textura; nunca dos vecinos parecidos).
export const PAL = {
  gris7035: '#c3c6c2', grisBPN: '#b4b8ba', celeste: '#1f78c0', verde: '#13843a', amarillo: '#f2c418', negro: '#26282b',
  blanco: '#f4f3ee', rojo: '#c8302c', azul: '#2b5fae', marron: '#6e3b1d', rosa: '#e98fb4', verdeClaro: '#5fbf4a',
};
function crearMateriales() {
  const std = (o, rz) => conRuido(new THREE.MeshPhysicalMaterial(o), rz);
  const M = {
    // poliamida PA 6.6 mate, levemente rugosa (color = cualquiera de PAL o hex)
    pa: (c = PAL.gris7035, o = {}) => std({ color: c, roughness: .62, metalness: 0, clearcoat: .08, clearcoatRoughness: .6, ...o }, { f: 2.2, amp: .05, cvar: .025 }),
    pvc: (c, o = {}) => std({ color: c, roughness: .38, metalness: 0, clearcoat: .25, clearcoatRoughness: .35, ...o }, { f: 1.2, amp: .015, cvar: .01 }),
    latonNiq: () => std({ color: '#e2e5e8', metalness: 1, roughness: .3 }, { f: 3, amp: .015, cvar: .02 }),
    laton: () => std({ color: '#d9ad55', metalness: 1, roughness: .3 }, { f: 3, amp: .015, cvar: .03 }),
    cobre: () => std({ color: '#d4834e', metalness: 1, roughness: .28 }, { f: 3, amp: .015, cvar: .03 }),
    cobreEst: () => std({ color: '#c7c9c4', metalness: 1, roughness: .42 }, { f: 4, amp: .03, cvar: .05 }),   // cobre estañado
    plata: () => std({ color: '#e9eaec', metalness: 1, roughness: .2 }),
    estano: () => std({ color: '#b9bcbd', metalness: 1, roughness: .45 }),
    aceroCinc: () => std({ color: '#c2ccd6', metalness: 1, roughness: .34 }, { f: .45, amp: .05, cvar: .07 }),  // cincado con «flor»
    acero: () => std({ color: '#9aa1a8', metalness: 1, roughness: .38 }, { f: 3, amp: .02, cvar: .03 }),
    ceramica: () => std({ color: '#f3efe4', roughness: .78, metalness: 0 }, { f: 6, amp: .04, cvar: .03 }),
    arena: () => std({ color: '#e7dcc1', roughness: .95, metalness: 0 }, { f: 9, amp: .9, cvar: .22 }),       // arena de cuarzo
    vidrio: () => new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: .05, metalness: 0, transmission: .0, transparent: true, opacity: .28, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false }),
    lente: (c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: .15, metalness: 0, transparent: true, opacity: .75, clearcoat: 1 }),
    cable: (c) => std({ color: c, roughness: .45, metalness: 0, clearcoat: .2 }, { f: 1, amp: .01, cvar: .01 }),
    goma: (c = '#2a2b2d') => std({ color: c, roughness: .8, metalness: 0 }, { f: 2, amp: .04, cvar: .02 }),
    oscuro: () => new THREE.MeshStandardMaterial({ color: '#141518', roughness: .9 }),   // fondo de huecos
    tinta: (c = '#1b1c1f') => new THREE.MeshStandardMaterial({ color: c, roughness: .7 }),
  };
  // material de la cara de corte: el mismo color, más claro y con rayado fino (plástico) o liso brillante (metal)
  M.corte = (base, tipo = 'plastico') => {
    const c = new THREE.Color(base.color).lerp(new THREE.Color('#ffffff'), tipo === 'metal' ? .05 : .18);
    if (tipo === 'metal') return std({ color: c, metalness: .85, roughness: .32 }, { f: 3, cvar: .03 });
    if (tipo === 'arena') return std({ color: '#ebe2ca', roughness: .95 }, { f: 9, amp: 1.0, cvar: .25 });
    if (tipo === 'ceramica') return std({ color: '#f7f4ec', roughness: .85 }, { f: 6, amp: .1, cvar: .05, ray: { dir: [1, 0, 1], paso: .9, fuerza: .18 } });
    return std({ color: c, roughness: .7, metalness: 0 }, { f: 2, cvar: .02, ray: { dir: [1, 1, 1], paso: .9, fuerza: .22 } });
  };
  return M;
}

/* ---------------- geometría ---------------- */
// perfil 2D [(u,v)...] (u → eje B, v → eje C) extruido a lo largo del eje A. Por defecto: A = x, B = y, C = z
function base3(A, B, C) { const m = new THREE.Matrix4(); m.makeBasis(V(B), V(C), V(A)); return m; }
function voltear(g) { // invierte el sentido de los triángulos (base espejada)
  const a = g.attributes.position; if (g.index) { const ix = g.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; } return; }
  for (const k of Object.keys(g.attributes)) { const at = g.attributes[k], n = at.itemSize; for (let i = 0; i < at.count; i += 3) for (let c = 0; c < n; c++) { const t = at.array[(i + 1) * n + c]; at.array[(i + 1) * n + c] = at.array[(i + 2) * n + c]; at.array[(i + 2) * n + c] = t; } }
}
function ring(pts) { const r = pts.map(p => [p[0], p[1]]); const a = r[0], b = r[r.length - 1]; if (a[0] !== b[0] || a[1] !== b[1]) r.push([a[0], a[1]]); return r; }
function area(p) { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; }
function aShape(poly) { // poly = [outer, hole, hole...] (anillos de polygon-clipping)
  const o = poly[0].slice(0, -1); if (area(o) < 0) o.reverse();
  const s = new THREE.Shape(o.map(p => new THREE.Vector2(p[0], p[1])));
  for (const h of poly.slice(1)) { const hh = h.slice(0, -1); if (area(hh) > 0) hh.reverse(); s.holes.push(new THREE.Path(hh.map(p => new THREE.Vector2(p[0], p[1])))); }
  return s;
}
/** contorno menos cavidades (todo 2D, con polygon-clipping). Devuelve multipolígono */
export function restar(contorno, cavidades = []) {
  let r = [[ring(contorno)]];
  for (const c of cavidades) r = polygonClipping.difference(r, [[ring(c)]]);
  return r;
}
export function unir(...polys) { return polygonClipping.union(...polys.map(p => [[ring(p)]])); }

export async function crear(op) {
  const M = crearMateriales();
  const escena = new THREE.Scene();
  const raiz = new THREE.Group(); escena.add(raiz);
  const anclas = {}; const sinBorde = new Set();
  let vista = { az: -38, el: 26, fov: 16, margen: .05, dir: null, objetivo: null };
  let cfg = { bordes: true, bordeColor: '#20242a', bordeOp: .55, bordeAng: 28, sombra: true, exposicion: .92, fondo: '#ffffff', piso: null, ambiente: .7 };
  const font = await new Promise((ok, mal) => new FontLoader().load('/node_modules/three/examples/fonts/helvetiker_bold.typeface.json', ok, undefined, mal));
  const ev = new Evaluator(); ev.attributes = ['position', 'normal']; ev.useGroups = true;

  const R = {
    THREE, M, PAL, escena, raiz, restar, unir,
    config(o) { Object.assign(cfg, o); },
    vista(o) { Object.assign(vista, o); },
    ancla(n, p) { anclas[n] = V(p); },
    grupo(padre = raiz) { const g = new THREE.Group(); padre.add(g); return g; },
    agregar(o, padre = raiz) { padre.add(o); return o; },
    sinBorde(o) { o.traverse(x => sinBorde.add(x)); return o; },

    /** perfil extruido: contorno [(u,v)], cavidades [[(u,v)]], ancho a lo largo de A (por defecto x), desde a0.
     *  op.bevel (mm, 0 = sin bisel), op.A/B/C ejes, op.o origen. Devuelve Mesh. */
    perfil(contorno, cavidades, ancho, mat, op = {}) {
      const mp = Array.isArray(contorno[0][0]) ? contorno : restar(contorno, cavidades || []);
      const b = op.bevel === undefined ? .3 : op.bevel;
      const shapes = mp.map(aShape);
      const g = new THREE.ExtrudeGeometry(shapes, { depth: ancho - (b ? 2 * b : 0), bevelEnabled: !!b, bevelThickness: b, bevelSize: b, bevelOffset: -b, bevelSegments: op.bevelSeg || 2, curveSegments: 12 });
      if (b) g.translate(0, 0, b);
      const bm = base3(op.A || [1, 0, 0], op.B || [0, 1, 0], op.C || [0, 0, 1]); g.applyMatrix4(bm);
      if (bm.determinant() < 0) voltear(g);
      const o = V(op.o || [0, 0, 0]); if (op.a0) o.addScaledVector(V(op.A || [1, 0, 0]), op.a0);
      g.translate(o.x, o.y, o.z); g.deleteAttribute('uv'); g.computeVertexNormals();
      const m = new THREE.Mesh(BGU.mergeVertices(g, 1e-4), mat); m.castShadow = m.receiveShadow = true;
      // normales con ángulo: mergeVertices + computeVertexNormals suaviza todo; recomputo «facetado» en aristas vivas
      m.geometry = BGU.toCreasedNormals(m.geometry.index ? m.geometry.toNonIndexed() : m.geometry, Math.PI / 5);
      if (op.padre !== null) (op.padre || raiz).add(m);
      return m;
    },
    /** cilindro (o cono) entre dos puntos. op: r1 (radio final), seg, abierto, tapas */
    cil(p0, p1, r, mat, op = {}) {
      const a = V(p0), b = V(p1), L = a.distanceTo(b);
      const g = new THREE.CylinderGeometry(op.r1 === undefined ? r : op.r1, r, L, op.seg || 48, 1, !!op.abierto);
      g.rotateX(Math.PI / 2); g.translate(0, 0, L / 2);   // eje z, de 0 a L
      const m = new THREE.Mesh(g, mat); m.castShadow = m.receiveShadow = true;
      m.position.copy(a); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), b.clone().sub(a).normalize());
      g.deleteAttribute('uv'); m.updateMatrixWorld(); if (op.padre !== null) (op.padre || raiz).add(m); return m;
    },
    /** cilindro torneado: perfil [(r, t)] alrededor del eje p0→p1 (t en mm desde p0). Sirve para casquillos, tornillos, neozed. */
    torno(p0, p1, perfilRT, mat, op = {}) {
      const a = V(p0), b = V(p1);
      const g = new THREE.LatheGeometry(perfilRT.map(([r, t]) => new THREE.Vector2(Math.max(r, 1e-3), t)), op.seg || 64);
      g.rotateX(Math.PI / 2);  // eje y → z
      const m = new THREE.Mesh(g, mat); m.castShadow = m.receiveShadow = true;
      m.position.copy(a); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), b.clone().sub(a).normalize());
      g.deleteAttribute('uv'); g.computeVertexNormals(); m.geometry = BGU.toCreasedNormals(g, Math.PI / 4);
      if (op.padre !== null) (op.padre || raiz).add(m); return m;
    },
    /** caja con cantos redondeados (r) */
    caja(x0, x1, y0, y1, z0, z1, mat, op = {}) {
      const r = Math.min(op.r === undefined ? .25 : op.r, (x1 - x0) / 2 - 1e-3, (y1 - y0) / 2 - 1e-3, (z1 - z0) / 2 - 1e-3);
      const g = r > 0 ? new RoundedBoxGeometry(x1 - x0, y1 - y0, z1 - z0, 2, r) : new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
      g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); g.deleteAttribute('uv');
      const m = new THREE.Mesh(g, mat); m.castShadow = m.receiveShadow = true; if (op.padre !== null) (op.padre || raiz).add(m); return m;
    },
    /** tornillo: cabeza en p (centro de la cara de arriba), eje hacia -dir. op: M (diám.), L (largo de rosca), dk (diám. cabeza), k (alto cabeza),
     *  tipo 'ranura' | 'pozi' | 'combi', giro (grados de la ranura), rosca (true) */
    tornillo(p, dir, op = {}) {
      const Md = op.M || 4, L = op.L || 8, dk = op.dk || Md * 1.75, k = op.k || Md * .62, mat = op.mat || M.latonNiq();
      const g = new THREE.Group(); (op.padre || raiz).add(g);
      // cabeza cilíndrica abombada con chaflán
      const cab = [[0, 0], [dk / 2 - .25, 0], [dk / 2, .25], [dk / 2, k - .35], [dk / 2 - .35, k - .05], [dk * .3, k], [0, k]];
      R.torno([0, 0, -k], [0, 0, 0], cab.map(([r, t]) => [r, t]), mat, { padre: g });
      // ranura y/o cruz (se restan con CSG)
      const corta = [];
      const w = Md * .16 + .2;
      if (op.tipo !== 'pozi') corta.push(new THREE.BoxGeometry(dk * 1.2, w, k * .9).translate(0, 0, -k * .1 + .05));
      if (op.tipo === 'pozi' || op.tipo === 'combi') { corta.push(new THREE.BoxGeometry(w, dk * .62, k * .9).translate(0, 0, .05 - k * .1)); }
      const cabM = g.children[0];
      let res = new Brush(cabM.geometry, mat); res.updateMatrixWorld();
      for (const c of corta) { c.deleteAttribute('uv'); const br = new Brush(c, M.oscuro()); br.rotation.z = THREE.MathUtils.degToRad(op.giro || 25); br.updateMatrixWorld(); res = ev.evaluate(res, br, SUBTRACTION); }
      g.remove(cabM); res.castShadow = res.receiveShadow = true; g.add(res);
      // vástago con rosca insinuada (anillos)
      if (L > 0) {
        const pf = []; const paso = Md * .175; const n = Math.max(2, Math.floor(L / paso));
        pf.push([0, 0]); for (let i = 0; i <= n; i++) { pf.push([Md / 2 - (i % 2 ? .12 * Md / 4 * 1.0 : 0), i * L / n]); }
        pf.push([Md / 2 * .8, L + .3]); pf.push([0, L + .4]);
        R.torno([0, 0, -k], [0, 0, -k - L - .4], pf, mat, { padre: g, seg: 32 });
      }
      g.position.copy(V(p)); g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), V(dir).normalize());
      g.updateMatrixWorld(true); return g;
    },
    /** texto en relieve. o = origen (abajo-izquierda o centro según alin), u = dirección del renglón, v = arriba del texto. op: size, prof, alin */
    texto(str, o, u, v, mat, op = {}) {
      const g = new TextGeometry(str, { font, size: op.size || 2, height: op.prof || .15, curveSegments: 6, bevelEnabled: false });
      g.computeBoundingBox(); const bb = g.boundingBox;
      const dx = op.alin === 'izq' ? -bb.min.x : op.alin === 'der' ? -bb.max.x : -(bb.min.x + bb.max.x) / 2;
      g.translate(dx, op.alinV === 'abajo' ? 0 : -(bb.min.y + bb.max.y) / 2, 0); g.deleteAttribute('uv');
      const U = V(u).normalize(), W = V(v).normalize(), N = U.clone().cross(W);
      g.applyMatrix4(new THREE.Matrix4().makeBasis(U, W, N)); const O = V(o); g.translate(O.x, O.y, O.z);
      const m = new THREE.Mesh(g, mat); m.castShadow = true; sinBorde.add(m); (op.padre || raiz).add(m); return m;
    },
    /** texto impreso (calco) en un plano: lineas [str], tamaño en mm (w, h), o = centro, u, v. op: color, fondo, px (alto de letra en px), peso */
    impreso(lineas, w, h, o, u, v, op = {}) {
      const tex = textoCanvas(lineas, w, h, op);
      const g = new THREE.PlaneGeometry(w, h);
      const U = V(u).normalize(), W = V(v).normalize(), N = U.clone().cross(W);
      g.applyMatrix4(new THREE.Matrix4().makeBasis(U, W, N)); const O = V(o).addScaledVector(N, op.sep || .03); g.translate(O.x, O.y, O.z);
      const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: .6, polygonOffset: true, polygonOffsetFactor: -2 }));
      sinBorde.add(m); (op.padre || raiz).add(m); return m;
    },
    /** texto impreso alrededor de un cilindro (fusibles): eje p0→p1, radio r, arco en grados centrado en ang0 */
    impresoCil(lineas, p0, p1, r, arco, ang0, op = {}) {
      const a = V(p0), b = V(p1), L = a.distanceTo(b);
      const w = r * THREE.MathUtils.degToRad(arco);
      const tex = textoCanvas(lineas, L, w, { ...op, rot: true });
      const g = new THREE.CylinderGeometry(r, r, L, 64, 1, true, THREE.MathUtils.degToRad(ang0 - arco / 2), THREE.MathUtils.degToRad(arco));
      g.rotateX(Math.PI / 2); g.translate(0, 0, L / 2);
      const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: .6, polygonOffset: true, polygonOffsetFactor: -2 }));
      m.position.copy(a); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), b.clone().sub(a).normalize());
      if (op.giro) m.rotateZ(THREE.MathUtils.degToRad(op.giro));
      sinBorde.add(m); (op.padre || raiz).add(m); return m;
    },
    /** resta CSG: devuelve un Mesh nuevo (en coordenadas de mundo) = a − b. b: Mesh o geometría; matB = material de la cara cortada */
    restarCSG(a, b, matB) {
      a.updateMatrixWorld(true); b.updateMatrixWorld(true);
      const A = new Brush(limpia(a.geometry), a.material); A.applyMatrix4(a.matrixWorld); A.updateMatrixWorld();
      const B = new Brush(limpia(b.geometry), matB || b.material); B.applyMatrix4(b.matrixWorld); B.updateMatrixWorld();
      const r = ev.evaluate(A, B, SUBTRACTION); r.castShadow = r.receiveShadow = true; r.userData.csg = true; return r;
    },
    sumarCSG(a, b) {
      a.updateMatrixWorld(true); b.updateMatrixWorld(true);
      const A = new Brush(limpia(a.geometry), a.material); A.applyMatrix4(a.matrixWorld); A.updateMatrixWorld();
      const B = new Brush(limpia(b.geometry), b.material); B.applyMatrix4(b.matrixWorld); B.updateMatrixWorld();
      const r = ev.evaluate(A, B, ADDITION); r.castShadow = r.receiveShadow = true; return r;
    },
    /** corte de vista: le saca a cada malla del grupo la caja [x0,x1,y0,y1,z0,z1]. La cara cortada toma el color del material
     *  (mat.userData.corte = 'metal' | 'plastico' | 'arena' | 'ceramica' o un material). Reemplaza las mallas en su lugar. */
    cortar(grupo, caja) {
      const [x0, x1, y0, y1, z0, z1] = caja;
      const box = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2));
      const lista = []; grupo.traverse(o => { if (o.isMesh && !sinBorde.has(o) && !o.userData.noCortar) lista.push(o); });
      const bb = new THREE.Box3().setFromObject(box);
      for (const m of lista) {
        const b2 = new THREE.Box3().setFromObject(m); if (!b2.intersectsBox(bb)) continue;
        const mat = Array.isArray(m.material) ? m.material[0] : m.material;
        const t = mat.userData.corte || 'plastico'; const mc = typeof t === 'string' ? (mat.userData._mc || (mat.userData._mc = M.corte(mat, t))) : t;
        const r = R.restarCSG(m, box, mc);
        const p = m.parent; p.remove(m);
        // r está en coordenadas de mundo: lo paso a las del padre
        p.updateMatrixWorld(true); r.geometry.applyMatrix4(new THREE.Matrix4().copy(p.matrixWorld).invert());
        p.add(r); r.userData = { ...m.userData, csg: true };
      }
    },
    /** marca el tipo de corte de un material */
    tipoCorte(mat, t) { mat.userData.corte = t; return mat; },
    render: () => render(),
  };

  function limpia(g) { const x = g.index ? g.toNonIndexed() : g.clone(); for (const k of Object.keys(x.attributes)) if (k !== 'position' && k !== 'normal') x.deleteAttribute(k); if (!x.attributes.normal) x.computeVertexNormals(); return x; }

  function textoCanvas(lineas, w, h, op) {
    const ppm = op.ppm || 40; // píxeles por mm
    const cv0 = document.createElement('canvas'); cv0.width = Math.round(w * ppm); cv0.height = Math.round(h * ppm);
    const cv = { width: cv0.width, height: cv0.height };
    const c = cv0.getContext('2d'); if (op.fondo) { c.fillStyle = op.fondo; c.fillRect(0, 0, cv.width, cv.height); }
    c.fillStyle = op.color || '#1b1c1f'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const n = lineas.length; const lh = cv.height / n;
    lineas.forEach((l, i) => {
      const txt = typeof l === 'string' ? l : l.t; const esc = typeof l === 'string' ? 1 : (l.s || 1);
      let fs = (op.px ? op.px * ppm : lh * .72) * esc; c.font = `${op.peso || 700} ${fs}px Inter, Arial, sans-serif`;
      while (c.measureText(txt).width > cv.width * .94 && fs > 4) { fs *= .94; c.font = `${op.peso || 700} ${fs}px Inter, Arial, sans-serif`; }
      if (typeof l !== 'string' && l.c) c.fillStyle = l.c; c.fillText(txt, cv.width / 2, lh * (i + .5)); c.fillStyle = op.color || '#1b1c1f';
    });
    let fin = cv0;
    if (op.rot) { // el renglón va a lo largo del eje del cilindro: giro la imagen 90°
      fin = document.createElement('canvas'); fin.width = cv0.height; fin.height = cv0.width;
      const r = fin.getContext('2d'); r.translate(0, fin.height); r.rotate(-Math.PI / 2); r.drawImage(cv0, 0, 0);
    }
    const t = new THREE.CanvasTexture(fin); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
  }

  async function render() {
    const W = op.ancho, H = op.alto, ss = op.ss || 2;
    const cv = document.createElement('canvas'); cv.width = W * ss; cv.height = H * ss;
    const rd = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveDrawingBuffer: true });
    rd.setPixelRatio(1); rd.setSize(W * ss, H * ss, false);
    rd.outputColorSpace = THREE.SRGBColorSpace; rd.toneMapping = THREE.ACESFilmicToneMapping; rd.toneMappingExposure = cfg.exposicion;
    rd.shadowMap.enabled = cfg.sombra; rd.shadowMap.type = THREE.VSMShadowMap;
    rd.setClearColor(cfg.fondo || '#ffffff', cfg.fondo ? 1 : 0);
    const pm = new THREE.PMREMGenerator(rd); const env = pm.fromScene(new RoomEnvironment(rd), .04).texture;
    escena.environment = env;
    escena.traverse(o => { if (o.isMesh) for (const m of [].concat(o.material)) if (m.envMapIntensity !== undefined && m.userData.env === undefined) m.envMapIntensity = cfg.ambiente; });

    // bordes técnicos
    raiz.updateMatrixWorld(true);
    if (cfg.bordes) {
      const ls = [];
      raiz.traverse(o => { if (o.isMesh && !sinBorde.has(o) && !o.userData.csg && !(o.material && o.material.transparent)) ls.push(o); });
      const lm = new THREE.LineBasicMaterial({ color: cfg.bordeColor, transparent: true, opacity: cfg.bordeOp });
      for (const o of ls) { const e = new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, cfg.bordeAng), lm); o.add(e); }
    }
    raiz.updateMatrixWorld(true);
    const bb = new THREE.Box3(); raiz.traverse(o => { if (o.isMesh && !o.userData.noEncuadre) bb.expandByObject(o); });
    const ctr = bb.getCenter(new THREE.Vector3()), rad = bb.getBoundingSphere(new THREE.Sphere()).radius;

    // cámara: perspectiva leve, encuadre por proyección de los vértices
    const cam = new THREE.PerspectiveCamera(vista.fov, W / H, .1, 1e5); cam.up.set(0, 0, 1);
    const az = THREE.MathUtils.degToRad(vista.az), el = THREE.MathUtils.degToRad(vista.el);
    const dir = vista.dir ? V(vista.dir).normalize() : new THREE.Vector3(Math.cos(el) * Math.sin(az), -Math.cos(el) * Math.cos(az), Math.sin(el));
    let tgt = vista.objetivo ? V(vista.objetivo) : ctr.clone(); let dist = rad / Math.sin(THREE.MathUtils.degToRad(vista.fov) / 2);
    const pts = []; raiz.traverse(o => { if (o.isMesh && !o.userData.noEncuadre) { const p = o.geometry.attributes.position; const st = Math.max(1, Math.floor(p.count / 3000)); for (let i = 0; i < p.count; i += st) pts.push(new THREE.Vector3().fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld)); } });
    for (let it = 0; it < 6; it++) {
      cam.position.copy(tgt).addScaledVector(dir, dist); cam.lookAt(tgt); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      for (const p of pts) { const q = p.clone().project(cam); x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y); }
      const lim = 1 - 2 * vista.margen; const k = Math.max((x1 - x0) / (2 * lim), (y1 - y0) / (2 * lim));
      // mover el objetivo al centro de la imagen (en el plano de la cámara)
      const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      const right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 1);
      const hh = Math.tan(THREE.MathUtils.degToRad(vista.fov) / 2) * dist;
      tgt.addScaledVector(right, cx * hh * cam.aspect).addScaledVector(up, cy * hh);
      dist *= k;
    }
    cam.position.copy(tgt).addScaledVector(dir, dist); cam.lookAt(tgt); cam.updateMatrixWorld(); cam.updateProjectionMatrix();

    // luces: estudio de 3 puntos (principal arriba-izquierda-adelante con sombra, relleno a la derecha, contraluz)
    const camR = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0);
    const lp = (side, upk, back, I, col) => { const l = new THREE.DirectionalLight(col, I); l.position.copy(ctr).addScaledVector(camR, side * rad * 3).add(new THREE.Vector3(0, 0, upk * rad * 3)).addScaledVector(dir, back * rad * 3); l.target.position.copy(ctr); escena.add(l, l.target); return l; };
    const key = lp(-1.0, 1.6, .9, 2.2, '#fff6ea'), fill = lp(1.3, .5, .9, .7, '#eaf2ff'), rim = lp(.4, 1.2, -1.4, 1.3, '#ffffff');
    escena.add(new THREE.HemisphereLight('#ffffff', '#d9dde3', .35));
    if (cfg.sombra) {
      key.castShadow = true; const sc = key.shadow.camera; const e = rad * 1.6; sc.left = -e; sc.right = e; sc.top = e; sc.bottom = -e; sc.near = .1; sc.far = rad * 12;
      key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 6; key.shadow.blurSamples = 16; key.shadow.bias = -.0004; key.shadow.normalBias = .02;
      const z0 = cfg.piso !== null ? cfg.piso : bb.min.z;
      const piso = new THREE.Mesh(new THREE.PlaneGeometry(rad * 12, rad * 12), new THREE.ShadowMaterial({ opacity: .2 }));
      piso.position.set(ctr.x, ctr.y, z0 - .02); piso.receiveShadow = true; escena.add(piso);
    }
    rd.render(escena, cam);

    // supersampling: achicar por mitades
    let src = cv;
    let w = cv.width, h = cv.height;
    while (w / 2 >= W) {
      const c2 = document.createElement('canvas'); c2.width = Math.round(w / 2); c2.height = Math.round(h / 2);
      const x = c2.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, c2.width, c2.height);
      src = c2; w = c2.width; h = c2.height;
    }
    if (w !== W) { const c2 = document.createElement('canvas'); c2.width = W; c2.height = H; const x = c2.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, W, H); src = c2; }
    const png = src.toDataURL('image/png');
    const an = {}; for (const [k, p] of Object.entries(anclas)) { const q = p.clone().project(cam); an[k] = [+((q.x + 1) / 2 * W).toFixed(1), +((1 - q.y) / 2 * H).toFixed(1)]; }
    const info = { triangulos: rd.info.render.triangles, gl: rd.getContext().getParameter(rd.getContext().VERSION) };
    rd.dispose(); return { png, anclas: an, info };
  }
  return R;
}
