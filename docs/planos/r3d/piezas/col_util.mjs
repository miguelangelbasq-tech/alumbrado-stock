/* col_util.mjs · materiales y piezas del grupo «col» (columnas, vínculos, brazo H°G°, apoyos, luminaria LED, portalámpara).
 * Geometría: perfiles_col.mjs (la misma que usa el plano). z = 0 en el piso. Ver README / FUENTES_col.md. */
import * as BGU from 'three/addons/utils/BufferGeometryUtils.js';
import { PRFV, rPRFV, MET, VIN, BHG, APO, LUM, plantaLum, E27 } from './perfiles_col.mjs';

const GL = `
float c3h(vec3 p){ p = fract(p*0.3183099 + .1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float c3n(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);
  return mix(mix(mix(c3h(i+vec3(0,0,0)),c3h(i+vec3(1,0,0)),f.x), mix(c3h(i+vec3(0,1,0)),c3h(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(c3h(i+vec3(0,0,1)),c3h(i+vec3(1,0,1)),f.x), mix(c3h(i+vec3(0,1,1)),c3h(i+vec3(1,1,1)),f.x),f.y),f.z); }
float c3f(vec3 p){ return .55*c3n(p) + .3*c3n(p*2.13+7.1) + .15*c3n(p*4.71+3.3); }`;

/** material físico con ruido anisótropo en coordenadas de mundo: rz = {s:[sx,sy,sz] (1/mm), cvar, amp, s2, cvar2, eje:'z'|'x'|'y'} */
function matR(T, o, rz) {
  const m = new T.MeshPhysicalMaterial(o);
  if (!rz) return m;
  m.onBeforeCompile = (sh) => {
    sh.uniforms.cS = { value: new T.Vector3(...rz.s) }; sh.uniforms.cC = { value: rz.cvar || 0 }; sh.uniforms.cA = { value: rz.amp || 0 };
    sh.uniforms.cS2 = { value: new T.Vector3(...(rz.s2 || [1, 1, 1])) }; sh.uniforms.cC2 = { value: rz.cvar2 || 0 };
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP2;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP2 = (modelMatrix * vec4(transformed,1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP2;\nuniform vec3 cS, cS2;\nuniform float cC, cA, cC2;' + GL)
      .replace('#include <color_fragment>', `#include <color_fragment>
        float cv = c3f(vWP2*cS); diffuseColor.rgb *= 1.0 + cC*(cv-.5)*2.0;
        if (cC2 > 0.0) { float cv2 = c3f(vWP2*cS2 + 11.0); diffuseColor.rgb *= 1.0 + cC2*(cv2-.5)*2.0; }`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        if (cA > 0.0) { vec3 q = vWP2*cS2; float e = .35;
          vec3 g = vec3(c3f(q+vec3(e,0,0))-c3f(q-vec3(e,0,0)), c3f(q+vec3(0,e,0))-c3f(q-vec3(0,e,0)), c3f(q+vec3(0,0,e))-c3f(q-vec3(0,0,e)))/(2.0*e);
          vec3 gv = (viewMatrix*vec4(g,0.0)).xyz; normal = normalize(normal - cA*(gv - dot(gv,normal)*normal)); }`);
  };
  m.customProgramCacheKey = () => 'col' + JSON.stringify(rz);
  return m;
}

/** la cámara de r3d usa near = 0,1 mm: con escenas de metros la precisión del z-buffer no alcanza (manchas entre capas a pocos mm).
 *  En las escenas «col» se sube el near a 40 mm (todas las cámaras quedan a más de 1 m). No toca r3d.mjs. */
function nearFix(T, near = 40) {
  const P = T.PerspectiveCamera.prototype; if (P.__colNear) return; const f = P.updateProjectionMatrix;
  P.updateProjectionMatrix = function () { if (this.fov !== 90 && this.near < near) this.near = near; return f.call(this); }; P.__colNear = 1;
}
export function matsCol(R) {
  if (R._mcol) return R._mcol; const T = R.THREE; nearFix(T);
  const tc = (m, t) => R.tipoCorte(m, t);
  R._mcol = {
    // PRFV RAL 7043 (gris tránsito B), satinado, con la veta de la fibra a lo largo del eje (regla de Ángel: NO parece hormigón)
    prfv: tc(matR(T, { color: '#555b5f', roughness: .38, metalness: 0, clearcoat: .45, clearcoatRoughness: .35 },
      { s: [.4, .4, .004], cvar: .12, s2: [.05, .05, .05], cvar2: .04 }), 'plastico'),
    prfvH: tc(matR(T, { color: '#4f5457', roughness: .38, metalness: 0, clearcoat: .45, clearcoatRoughness: .35 },   // veta horizontal (tapas)
      { s: [.006, .9, .9], cvar: .12, s2: [.05, .05, .05], cvar2: .05 }), 'plastico'),
    prfvGab: tc(matR(T, { color: '#c9ccc6', roughness: .5, clearcoat: .2 }, { s: [.7, .7, .01], cvar: .06 }), 'plastico'),
    // acero galvanizado en caliente: gris azulado con «flor» (cristales de cinc)
    galv: tc(matR(T, { color: '#b9c1c7', metalness: .92, roughness: .4 }, { s: [.07, .07, .07], cvar: .1, s2: [.9, .9, .9], cvar2: .05, amp: .03 }), 'metal'),
    galvO: tc(matR(T, { color: '#9aa3aa', metalness: .9, roughness: .5 }, { s: [.07, .07, .07], cvar: .1, s2: [.9, .9, .9], cvar2: .05 }), 'metal'),
    inox: tc(new T.MeshPhysicalMaterial({ color: '#d8dcdf', metalness: 1, roughness: .22 }), 'metal'),
    acero: tc(new T.MeshPhysicalMaterial({ color: '#7f868c', metalness: 1, roughness: .38 }), 'metal'),
    soldadura: tc(matR(T, { color: '#8e8a83', metalness: .8, roughness: .6 }, { s: [.6, .6, .6], cvar: .2, s2: [2, 2, 2], amp: .4 }), 'metal'),
    bronce: tc(new T.MeshPhysicalMaterial({ color: '#c9933f', metalness: 1, roughness: .3 }), 'metal'),
    laton: tc(new T.MeshPhysicalMaterial({ color: '#d9ad55', metalness: 1, roughness: .3 }), 'metal'),
    cobre: tc(R.M.cobre(), 'metal'),
    // aluminio inyectado pintado (texturado) y aluminio de la placa LED
    alu: tc(matR(T, { color: '#7c838a', metalness: .35, roughness: .5, clearcoat: .12 }, { s: [.05, .05, .05], cvar: .03, s2: [1.6, 1.6, 1.6], amp: .18 }), 'metal'),
    aluOsc: tc(matR(T, { color: '#5b6166', metalness: .3, roughness: .6 }, { s: [.05, .05, .05], cvar: .03, s2: [1.6, 1.6, 1.6], amp: .18 }), 'metal'),
    aluCrudo: tc(new T.MeshPhysicalMaterial({ color: '#d2d6d9', metalness: 1, roughness: .35 }), 'metal'),
    pcb: tc(new T.MeshPhysicalMaterial({ color: '#f1f1ee', roughness: .5 }), 'plastico'),
    led: new T.MeshPhysicalMaterial({ color: '#f7e7a8', emissive: '#ffe9a6', emissiveIntensity: .35, roughness: .3 }),
    lente: new T.MeshPhysicalMaterial({ color: '#eef6fb', roughness: .05, metalness: 0, transparent: true, opacity: .55, clearcoat: 1 }),
    vidrio: (() => { const m = new T.MeshPhysicalMaterial({ color: '#dff0f4', roughness: .04, metalness: 0, transparent: true, opacity: .26, clearcoat: 1, side: T.DoubleSide, depthWrite: false }); m.userData.corte = 'plastico'; return m; })(),
    goma: tc(R.M.goma('#1f2022'), 'plastico'),
    silicona: tc(R.M.pa('#3b3d40', { roughness: .7 }), 'plastico'),
    paNegro: tc(R.M.pa('#2a2c2f'), 'plastico'),
    paGris: tc(R.M.pa('#8d9296'), 'plastico'),
    paCrema: tc(R.M.pa('#e8e3d6'), 'plastico'),
    pvc: tc(R.M.pvc('#d4d7da'), 'plastico'),
    pvcG: tc(R.M.pvc('#9fa5aa'), 'plastico'),
    driver: tc(matR(T, { color: '#2f3237', metalness: .4, roughness: .45 }, { s: [.3, .3, .3], cvar: .03 }), 'metal'),
    // terreno
    horm: tc(matR(T, { color: '#aeada6', roughness: .95, metalness: 0 }, { s: [.12, .12, .12], cvar: .16, s2: [.9, .9, .9], cvar2: .12, amp: .35 }), 'arena'),
    hormHA: tc(matR(T, { color: '#a9aaa6', roughness: .85, metalness: 0 }, { s: [.2, .2, .2], cvar: .12, s2: [1.4, 1.4, 1.4], cvar2: .08, amp: .25 }), 'arena'),
    tierra: tc(matR(T, { color: '#8b6b4a', roughness: 1, metalness: 0 }, { s: [.05, .05, .05], cvar: .22, s2: [.6, .6, .6], cvar2: .18, amp: .5 }), 'arena'),
    pasto: matR(T, { color: '#5e9a3a', roughness: .95 }, { s: [.3, .3, .3], cvar: .25, s2: [1.5, 1.5, 1.5], cvar2: .15, amp: .6 }),
    arena: tc(matR(T, { color: '#e6d5a6', roughness: 1 }, { s: [.8, .8, .8], cvar: .15, s2: [3, 3, 3], cvar2: .1, amp: .7 }), 'arena'),
    telgopor: tc(matR(T, { color: '#f7f7f2', roughness: .9 }, { s: [.35, .35, .35], cvar: .05, s2: [.9, .9, .9], amp: .3 }), 'plastico'),
    madera: tc(matR(T, { color: '#7d5a38', roughness: .8 }, { s: [.25, .25, .004], cvar: .22, s2: [.03, .03, .03], cvar2: .1, amp: .15 }), 'plastico'),
    maderaCorte: matR(T, { color: '#b58a58', roughness: .85 }, { s: [.12, .12, .5], cvar: .2 }),
    cable: (c) => tc(R.M.cable(c), 'plastico'),
  };
  return R._mcol;
}

/* ---------------- utilidades ---------------- */
const V3 = (T, a) => new T.Vector3(a[0], a[1], a[2]);
/** a - cortes (lista de mallas sin padre o con padre): reemplaza a en su padre. Devuelve la malla nueva */
export function restarMuchos(R, a, cortes, matC) {
  const p = a.parent; a.updateMatrixWorld(true);
  let cur = a;
  for (const c of cortes) { c.updateMatrixWorld(true); cur = R.restarCSG(cur, c, matC || c.material); }
  if (cur === a) return a;
  p.remove(a); p.updateMatrixWorld(true);
  cur.geometry.applyMatrix4(new R.THREE.Matrix4().copy(p.matrixWorld).invert()); p.add(cur); return cur;
}
/** tubo (o cono) hueco de z0 a z1 sobre el eje (x, y): radios exteriores r0, r1 y pared e */
export function tuboZ(R, x, y, z0, z1, r0, r1, e, mat, op = {}) {
  const L = z1 - z0;
  const pf = e ? [[r0 - e, 0], [r0, 0], [r1, L], [r1 - e, L], [r0 - e, 0]] : [[0, 0], [r0, 0], [r1, L], [0, L]];
  return R.torno([x, y, z0], [x, y, z1], pf, mat, { seg: op.seg || 96, padre: op.padre });
}
/** tubo hueco entre dos puntos cualesquiera */
export function tuboP(R, p0, p1, r, e, mat, op = {}) {
  const T = R.THREE, L = V3(T, p0).distanceTo(V3(T, p1));
  const pf = e ? [[r - e, 0], [r, 0], [r, L], [r - e, L], [r - e, 0]] : [[0, 0], [r, 0], [r, L], [0, L]];
  return R.torno(p0, p1, pf, mat, { seg: op.seg || 64, padre: op.padre });
}
/** cordón de soldadura (toro) alrededor del eje z a la altura z, radio r */
export function cordon(R, x, y, z, r, rc, mat, padre) {
  const T = R.THREE; const m = new T.Mesh(new T.TorusGeometry(r, rc, 10, 96), mat); m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true; (padre || R.raiz).add(m); return m;
}
export function toro(R, c, eje, Rm, r, mat, padre, arco) {
  const T = R.THREE; const m = new T.Mesh(new T.TorusGeometry(Rm, r, 16, 64, arco || Math.PI * 2), mat); m.position.set(...c);
  m.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), new T.Vector3(...eje).normalize()); m.castShadow = m.receiveShadow = true; (padre || R.raiz).add(m); return m;
}
/** tuerca hexagonal entre p0 y p1 (ancho entre caras af) */
export function hexN(R, p0, p1, af, mat, padre) { return R.cil(p0, p1, af / Math.sqrt(3), mat, { seg: 6, padre }); }
/** rosca insinuada (anillos) */
export function rosca(R, p0, p1, r, mat, paso = 2, op = {}) {
  const T = R.THREE, L = V3(T, p0).distanceTo(V3(T, p1)); const pf = [[0, 0]];
  const n = Math.floor(L / paso); for (let i = 0; i <= n; i++) { pf.push([r, i * paso]); if (i < n) pf.push([r - paso * .55, i * paso + paso / 2]); }
  pf.push([r - paso * .55, L]); pf.push([0, L]);
  return R.torno(p0, p1, pf, mat, { seg: op.seg || 40, padre: op.padre });
}
/** rosca exterior sobre un caño (hueco, pared hasta ri) */
export function roscaCano(R, p0, p1, r, ri, mat, paso, op = {}) {
  const T = R.THREE, L = V3(T, p0).distanceTo(V3(T, p1)); const pf = [[ri, 0]];
  const n = Math.floor(L / paso); for (let i = 0; i <= n; i++) { const rr = r - (op.conica ? (L - i * paso) / 16 * .25 : 0); pf.push([rr, i * paso]); if (i < n) pf.push([rr - paso * .6, i * paso + paso / 2]); }
  pf.push([ri, L]); pf.push([ri, 0]);
  return R.torno(p0, p1, pf, mat, { seg: op.seg || 64, padre: op.padre });
}
/** bulón con cabeza hexagonal: cabeza en p, eje hacia dir, largo L, tuerca a dt (opcional) */
export function bulonHex(R, p, dir, M, L, mat, op = {}) {
  const T = R.THREE, d = V3(T, dir).normalize(), P = V3(T, p), g = R.grupo(op.padre);
  const k = M * .65, af = M * 1.6;
  hexN(R, P.clone().addScaledVector(d, -k).toArray(), P.toArray(), af, mat, g);
  R.cil(P.toArray(), P.clone().addScaledVector(d, L * .4).toArray(), M / 2, mat, { seg: 24, padre: g });
  rosca(R, P.clone().addScaledVector(d, L * .4).toArray(), P.clone().addScaledVector(d, L).toArray(), M / 2, mat, M * .15, { padre: g });
  if (op.dt) {
    const q = P.clone().addScaledVector(d, op.dt);
    R.cil(q.toArray(), q.clone().addScaledVector(d, M * .2).toArray(), M * 1.05, mat, { seg: 32, padre: g });
    hexN(R, q.clone().addScaledVector(d, M * .2).toArray(), q.clone().addScaledVector(d, M * .2 + M * .8).toArray(), af, mat, g);
  }
  return g;
}

/* ---------------- suelo y fundación ---------------- */
/** bloque de suelo cortado a un cuarto (cuadrante -x,-y abierto... en realidad se saca el cuadrante x>0,y<0): devuelve el grupo */
export function suelo(R, cx, cy, B, prof, op = {}) {
  const C = matsCol(R), g = R.grupo(op.padre);
  R.caja(cx - B, cx + B, cy - B, cy + B, -prof, -40, C.tierra, { r: 0, padre: g });
  R.caja(cx - B, cx + B, cy - B, cy + B, -40, 0, C.pasto, { r: 0, padre: g });
  return g;
}

/* ---------------- columna PRFV ---------------- */
/** tramo de la columna PRFV entre z0 y z1. op: ang (grados, hacia dónde miran las cajas), tapa ('puesta'|'afuera'|'no'), cajas true,
 *  base (tapa de la base con desagüe), C (boca del troncal), buje (si z1 llega a la cima), placa (placa de características) */
export function postePRFV(R, c, z0, z1, op = {}) {
  const T = R.THREE, C = matsCol(R), P = PRFV, g = R.grupo(op.padre);
  const zb = -c.LE, zt = c.LT - c.LE;
  const a = (op.ang === undefined ? -90 : op.ang) * Math.PI / 180, nx = Math.cos(a), ny = Math.sin(a);
  let tubo = tuboZ(R, 0, 0, z0, z1, rPRFV(c, z0), rPRFV(c, z1), c.e, C.prfv, { padre: g, seg: 128 });
  const cortes = [];
  // ventanas de las cajas (acceso 85 × 150)
  for (const zc of (op.cajas === false ? [] : c.cajas)) {
    if (zc < z0 || zc > z1) continue;
    const r = rPRFV(c, zc), A = P.caja.acc;
    const k = R.caja(-A[0] / 2, A[0] / 2, -30, 30, zc - A[1] / 2, zc + A[1] / 2, C.prfv, { r: 6, padre: null });
    k.position.set(nx * r, ny * r, 0); k.rotation.z = a - Math.PI / 2; k.position.applyAxisAngle(new T.Vector3(0, 0, 1), 0); cortes.push(k);
  }
  // boca «C» del troncal (del lado opuesto a las cajas, hacia la zanja)
  if (op.C !== false && zb + c.C > z0 && zb + c.C < z1) {
    const W = P.ventanaC, zc = zb + c.C, r = rPRFV(c, zc);
    const k = R.caja(-W.w / 2, W.w / 2, -30, 30, zc - W.h / 2, zc + W.h / 2, C.prfv, { r: W.w / 2 - 1, padre: null });
    const b = a + Math.PI; k.position.set(Math.cos(b) * r, Math.sin(b) * r, 0); k.rotation.z = b - Math.PI / 2; cortes.push(k);
  }
  if (cortes.length) tubo = restarMuchos(R, tubo, cortes);
  // tapa de la base con desagüe
  if (op.base !== false && z0 <= zb + 1) {
    const r = rPRFV(c, zb) - c.e, d = P.base.desague / 2;
    const pf = [[d, 0], [r, 0], [r, P.base.tapa], [d, P.base.tapa], [d, 0]];
    R.torno([0, 0, zb], [0, 0, zb + P.base.tapa], pf, C.prfvH, { padre: g, seg: 96 });
  }
  // cajas, tapas y placa interior
  for (const zc of (op.cajas === false ? [] : c.cajas)) {
    if (zc < z0 || zc > z1) continue;
    const r = rPRFV(c, zc);
    const gc = R.grupo(g); gc.position.set(nx * r, ny * r, zc); gc.rotation.z = a - Math.PI / 2;  // local: +y hacia afuera, x a lo ancho
    caja95(R, gc, r, op);
    if (op.tapa !== 'no') tapaPRFV(R, gc, op.tapa === 'afuera' ? (op.tapaSep || 90) : 0, op);
  }
  // placa de características
  if (op.placa !== false && zb + c.LC > z0 && zb + c.LC < z1) {
    const zc = zb + c.LC, r = rPRFV(c, zc) + .4, b = a + .55;
    R.impreso([{ t: c.plano, s: .9 }, { t: 'PRFV ' + (c.cod === '6008' ? '7' : '10') + ' m · RAL 7043', s: .7 }, { t: 'IRAM 13901', s: .7 }, { t: 'LOTE 2026', s: .6 }],
      62, 62, [Math.cos(b) * r, Math.sin(b) * r, zc], [-Math.sin(b), Math.cos(b), 0], [0, 0, 1], { fondo: '#d9dcdc', color: '#1b1c1f', ppm: 14, padre: g });
  }
  // buje / adaptador en la cima
  if (op.buje !== false && z1 >= zt - 1) {
    const B = c.buje;
    if (B.Di) tuboZ(R, 0, 0, zt - B.dentro, zt + B.sobre, B.De / 2, B.De / 2, (B.De - B.Di) / 2, C.pvcG, { padre: g, seg: 96 });
    else tuboZ(R, 0, 0, zt - B.dentro, zt + B.sobre, B.De / 2, B.De / 2, 4, C.galv, { padre: g, seg: 96 });
    // tapa de la cima (anillo entre el buje y la pared)
    const ri = c.DEC / 2 - c.e;
    R.torno([0, 0, zt - 8], [0, 0, zt], [[B.De / 2, 0], [ri, 0], [ri, 8], [B.De / 2, 8], [B.De / 2, 0]], C.prfvH, { padre: g });
  }
  return g;
}
/** caja bornera IP54 95 × 160 × 87 empotrada (gc local: +y afuera, x ancho, z alto; origen = superficie del poste en el eje de la caja) */
function caja95(R, gc, rPoste, op) {
  const C = matsCol(R), K = PRFV.caja, d = K.f, y0 = -d + 6;
  const w = K.w / 2, h = K.h / 2, t = 2.5;
  R.caja(-w, w, y0, y0 + t, -h, h, C.paGris, { r: 1, padre: gc });                  // fondo
  R.caja(-w, -w + t, y0, 4, -h, h, C.paGris, { r: .5, padre: gc }); R.caja(w - t, w, y0, 4, -h, h, C.paGris, { r: .5, padre: gc });
  R.caja(-w, w, y0, 4, h - t, h, C.paGris, { r: .5, padre: gc }); R.caja(-w, w, y0, 4, -h, -h + t, C.paGris, { r: .5, padre: gc });
  // placa B (80 × 130) con riel y 5 bornes: gris gris gris celeste verde
  const pb = K.placa; R.caja(-pb[0] / 2, pb[0] / 2, y0 + t, y0 + t + 1.5, -pb[1] / 2, pb[1] / 2, C.galvO, { r: .3, padre: gc });
  R.caja(-37, 37, y0 + t + 1.5, y0 + t + 9, -17.5, 17.5, C.galv, { r: .4, padre: gc });   // riel NS35
  const cols = ['#9aa0a6', '#9aa0a6', '#9aa0a6', '#2f86c9', '#2f9a3e'];
  cols.forEach((col, i) => {
    const x = -22 + i * 8.6, mat = R.tipoCorte(R.M.pa(col), 'plastico');
    R.caja(x, x + 8.2, y0 + t + 9, y0 + t + 50, -26, 26, mat, { r: .8, padre: gc });
    for (const zz of [-15, 15]) R.cil([x + 4.1, y0 + t + 50.2, zz], [x + 4.1, y0 + t + 46, zz], 2.4, R.M.latonNiq(), { seg: 20, padre: gc });
  });
  // marco de la caja asomando en la ventana
  R.caja(-w - 2, w + 2, -2, 1, -h - 2, -h + 4, C.paGris, { r: .5, padre: gc }); R.caja(-w - 2, w + 2, -2, 1, h - 4, h + 2, C.paGris, { r: .5, padre: gc });
  if (op.cablesCaja !== false) {
    // troncal 4×4 que entra por abajo y sube (sin caño): se insinúa con dos conductores
    for (const [dx, col] of [[-30, '#202124'], [-26, '#2f86c9']]) R.cil([dx, y0 + 20, -h - 160], [dx, y0 + 20, -h + 10], 2.6, C.cable(col), { seg: 16, padre: gc });
  }
}
/** tapa de PRFV de la ventana (se separa 'sep' hacia afuera) con 4 tornillos */
function tapaPRFV(R, gc, sep, op) {
  const C = matsCol(R), Tp = PRFV.tapa, g = R.grupo(gc);
  g.position.y = sep + 1;
  R.caja(-Tp.w / 2, Tp.w / 2, 0, Tp.e, -Tp.h / 2, Tp.h / 2, C.prfvH, { r: 2.5, padre: g });
  R.caja(-Tp.w / 2 + 6, Tp.w / 2 - 6, -2, 0, -Tp.h / 2 + 6, Tp.h / 2 - 6, C.goma, { r: 1, padre: g });         // junta
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const p = [sx * Tp.dx, Tp.e + (sep ? sep * .45 : 0), sz * Tp.dz];
    R.tornillo(p, [0, 1, 0], { M: Tp.M, L: 14, dk: 9, k: 3, tipo: 'pozi', mat: R.M.latonNiq(), padre: g });
  }
  R.impreso([{ t: 'RIESGO ELECTRICO', s: .8 }], 70, 14, [0, Tp.e + .05, Tp.h / 2 - 22], [-1, 0, 0], [0, 0, 1], { fondo: '#f2c418', color: '#111', ppm: 18, padre: g });
  g.traverse(o => { if (o.isMesh) o.receiveShadow = false; });
  return g;
}

/* ---------------- columna metálica ---------------- */
/** columna de tramos (galvanizada). op.cortarCuarto, op.puerta ('cerrada'|'abierta'), op.entrada */
export function columnaMet(R, c, op = {}) {
  const C = matsCol(R), g = R.grupo(op.padre), Rd = MET.red;
  const zs = []; let z = -c.emp;
  c.tr.forEach(([D, e, L], i) => {
    const z0 = z, z1 = Math.min(z + L, c.Ht - c.emp); z = z1; zs.push([z0, z1, D, e]);
  });
  const tubos = [];
  zs.forEach(([z0, z1, D, e], i) => {
    const sig = zs[i + 1];
    let zz0 = z0 + (i ? Rd.L * .5 : 0);
    if (op.zmin !== undefined && z1 < op.zmin) return; if (op.zmax !== undefined && zz0 > op.zmax) return;
    const a0 = Math.max(zz0, op.zmin ?? -1e9), a1 = Math.min(z1, op.zmax ?? 1e9);
    tubos.push({ m: tuboZ(R, 0, 0, a0, a1, D / 2, D / 2, e, C.galv, { padre: g, seg: 112 }), z0: a0, z1: a1, D, e });
    if (sig && z1 >= (op.zmin ?? -1e9) && z1 <= (op.zmax ?? 1e9)) {
      // reducción: cono soldado (abocardado) del tramo de abajo al de arriba
      const Ds = sig[2];
      R.torno([0, 0, z1], [0, 0, z1 + Rd.L], [[D / 2 - e, 0], [D / 2, 0], [Ds / 2 + 1, Rd.L * .8], [Ds / 2 + 1, Rd.L], [Ds / 2 + 1 - e, Rd.L], [Ds / 2 + 1 - e, Rd.L * .8], [D / 2 - e, 0]], C.galv, { padre: g, seg: 112 });
      cordon(R, 0, 0, z1, D / 2 + .5, Rd.sold * .5, C.soldadura, g);
      cordon(R, 0, 0, z1 + Rd.L, Ds / 2 + 1.5, Rd.sold * .45, C.soldadura, g);
    }
  });
  return { g, zs, tubos };
}
/** puerta de inspección: abertura con marco, tapa con bisagra de lengüeta y bulón antivandálico (cabeza triangular) */
export function puertaMet(R, g, D, zc, op = {}) {
  const C = matsCol(R), Pu = MET.puerta, r = D / 2;
  const gp = R.grupo(g); gp.position.set(0, -r, zc);                 // local: -y hacia afuera
  // marco de refuerzo soldado alrededor de la abertura
  for (const [x0, x1, z0, z1] of [[-Pu.w / 2 - 8, Pu.w / 2 + 8, Pu.h / 2, Pu.h / 2 + 8], [-Pu.w / 2 - 8, Pu.w / 2 + 8, -Pu.h / 2 - 8, -Pu.h / 2],
    [-Pu.w / 2 - 8, -Pu.w / 2, -Pu.h / 2, Pu.h / 2], [Pu.w / 2, Pu.w / 2 + 8, -Pu.h / 2, Pu.h / 2]])
    R.caja(x0, x1, -3, 2, z0, z1, C.galv, { r: .8, padre: gp });
  // traba interior (lengüeta) y tuerca soldada del bulón
  R.caja(-12, 12, 2, 6, Pu.h / 2 - 2, Pu.h / 2 + 14, C.galvO, { r: .5, padre: gp });
  R.caja(-14, 14, 4, 10, -Pu.h / 2 - 12, -Pu.h / 2 + 18, C.galvO, { r: .5, padre: gp });
  hexN(R, [0, 10, -Pu.h / 2 + 3], [0, 17, -Pu.h / 2 + 3], 13, C.galvO, gp);
  // tapa (chapa curva) separada hacia afuera
  const sep = op.sep ?? 0, gt = R.grupo(gp); gt.position.y = -sep;
  const curv = []; const n = 24, ang = Math.asin(Math.min(.99, (Pu.w / 2 + 6) / (r + 2)));
  for (let i = 0; i <= n; i++) { const t = -ang + 2 * ang * i / n; curv.push([(r + 2.5) * Math.sin(t), r - (r + 2.5) * Math.cos(t)]); }
  for (let i = n; i >= 0; i--) { const t = -ang + 2 * ang * i / n; curv.push([(r) * Math.sin(t), r - r * Math.cos(t)]); }
  R.perfil(curv.map(([x, y]) => [x, y]), [], Pu.h + 12, C.galv, { A: [0, 0, 1], B: [1, 0, 0], C: [0, 1, 0], o: [0, -1, -Pu.h / 2 - 6], bevel: .5, padre: gt });
  // lengüeta superior de la tapa (entra en la traba) y bulón de cabeza triangular abajo
  R.caja(-10, 10, -1, 1.5, Pu.h / 2 + 6, Pu.h / 2 + 16, C.galv, { r: .4, padre: gt });
  const tri = [[0, 7], [-6.06, -3.5], [6.06, -3.5]];
  R.perfil(tri, [], 7, C.inox, { A: [0, -1, 0], B: [1, 0, 0], C: [0, 0, 1], o: [0, -2.5 - (op.sepB ?? 0), -Pu.h / 2 + 3], bevel: .8, padre: gt });
  R.cil([0, -2.5 - (op.sepB ?? 0), -Pu.h / 2 + 3], [0, 12 - (op.sepB ?? 0), -Pu.h / 2 + 3], Pu.M / 2, C.inox, { seg: 24, padre: gt });
  return gp;
}

/* ---------------- vínculo capuchón ---------------- */
/** capuchón con n brazos (ángulos en grados), sentado sobre el buje cuya cima está en zTop. L largo del brazo desde el eje */
export function capuchon(R, zBase, angs, op = {}) {
  const T = R.THREE, C = matsCol(R), Cp = VIN.cap, Br = VIN.brazo, g = R.grupo(op.padre);
  const L = op.L || Br.L, inc = (op.inc ?? Br.inc) * Math.PI / 180, r = Cp.D / 2;
  const [a0, a1] = op.cut ? [-90, 180] : [45, 405], tp = op.cut ? true : false;
  tornoZP(R, 0, 0, zBase, [[r - Cp.e, 0], [r, 0], [r, Cp.H - Cp.tapa], [r - Cp.e, Cp.H - Cp.tapa]], a0, a1, C.galv, { padre: g, seg: 96, tapas: tp });
  tornoZP(R, 0, 0, zBase + Cp.H - Cp.tapa, [[0, 0], [r, 0], [r - 1, Cp.tapa - 1], [r - 2, Cp.tapa], [0, Cp.tapa]], a0, a1, C.galv, { padre: g, tapas: tp });
  tornoZP(R, 0, 0, zBase + Cp.H - Cp.tapa - 1.6, Array.from({ length: 13 }, (_, i) => [r + 1.6 * Math.sin(i * Math.PI / 12), 1.6 - 1.6 * Math.cos(i * Math.PI / 12)]), a0, a1, C.soldadura, { padre: g, tapas: tp, seg: 96 });
  // prisioneros a 120° sobre tuercas soldadas (cuplas)
  for (let i = 0; i < VIN.pris.n; i++) {
    const ad = ((op.prisA ?? -45) + i * 120 + 720) % 360; if (op.cut && ad > 180 && ad < 270) continue;
    const a = ad * Math.PI / 180, cx = Math.cos(a), cy = Math.sin(a), z = zBase + VIN.pris.z;
    hexN(R, [cx * (r - .5), cy * (r - .5), z], [cx * (r + 8), cy * (r + 8), z], 17, C.galv, g);
    const pr = op.prisFuera ? 26 : 0;
    R.cil([cx * (r + 8 + pr), cy * (r + 8 + pr), z], [cx * (r - 6 + pr), cy * (r - 6 + pr), z], VIN.pris.M / 2, C.inox, { seg: 6, padre: g });
    rosca(R, [cx * (r - 6 + pr), cy * (r - 6 + pr), z], [cx * (45 + pr), cy * (45 + pr), z], VIN.pris.M / 2, C.inox, 1.5, { padre: g });
  }
  // brazos Ø60,3 soldados, con cartela
  const puntas = [];
  for (const gdeg of angs) {
    const a = gdeg * Math.PI / 180, d = new T.Vector3(Math.cos(a) * Math.cos(inc), Math.sin(a) * Math.cos(inc), Math.sin(inc));
    const zb = zBase + Br.z, p0 = new T.Vector3(Math.cos(a) * (r - 3), Math.sin(a) * (r - 3), zb);
    const Lr = (L - r) / Math.cos(inc), p1 = p0.clone().addScaledVector(d, Lr);
    tuboP(R, p0.toArray(), p1.toArray(), Br.D / 2, Br.e, C.galv, { padre: g, seg: 64 });
    toro(R, p0.clone().addScaledVector(d, 3.5).toArray(), d.toArray(), Br.D / 2 + .3, 1.7, C.soldadura, g);
    // cartela triangular debajo del brazo
    const ca = Br.cartela, u = new T.Vector3(Math.cos(a), Math.sin(a), 0);
    const pts = [[0, 0], [ca, 0], [0, -ca]];
    R.perfil(pts, [], 5, C.galv, { A: [-Math.sin(a), Math.cos(a), 0], B: u.toArray(), C: [0, 0, 1], o: [Math.cos(a) * r - Math.sin(a) * -2.5, Math.sin(a) * r + Math.cos(a) * -2.5, zb - Br.D / 2 + 2], bevel: .5, padre: g });
    puntas.push({ p1: p1.toArray(), d: d.toArray(), a });
  }
  return { g, puntas };
}

/* ---------------- luminaria vial LED ---------------- */
/** luminaria con el acople en el origen del grupo, eje del brazo a lo largo de +x, z arriba. op: nema ('foto'|'tapa'|'no'), cortar */
export function luminaria(R, op = {}) {
  const T = R.THREE, C = matsCol(R), L = LUM, g = R.grupo(op.padre);
  const pl = plantaLum(0), pin = plantaLum(L.pared);
  const MED = [[-500, -500], [900, -500], [900, 0], [-500, 0]];
  const ext = (poly, hole, z0, z1, mat, b = .8) => {
    const cont = op.mitad ? R.restar(poly, [...(hole ? [hole] : []), MED]) : poly;
    const m = R.perfil(cont, op.mitad ? [] : (hole ? [hole] : []), z1 - z0, mat, { A: [0, 0, 1], B: [1, 0, 0], C: [0, 1, 0], o: [0, 0, z0], bevel: op.mitad ? Math.min(b, .4) : b, padre: g });
    if (op.mitad) {
      m.userData.noCortar = true;
      // tapa de corte (cara en y = 0, rayada): intervalos de x donde el plano y = 0 corta la pieza
      const xs = (pp) => { const r = []; for (let i = 0; i < pp.length; i++) { const a = pp[i], c = pp[(i + 1) % pp.length]; if ((a[1] < 0) !== (c[1] < 0)) r.push(a[0] + (c[0] - a[0]) * (0 - a[1]) / (c[1] - a[1])); } return r.sort((u, v) => u - v); };
      const xo = xs(poly), xi = hole ? xs(hole) : [];
      const tramos = xi.length >= 2 ? [[xo[0], xi[0]], [xi[xi.length - 1], xo[xo.length - 1]]] : [[xo[0], xo[xo.length - 1]]];
      const mc = mat.userData._mc || (mat.userData._mc = R.M.corte(mat, mat.userData.corte || 'metal'));
      for (const [a, c] of tramos) if (c - a > .2) { const k = R.caja(a, c, -.25, .05, z0, z1, mc, { r: 0, padre: g }); k.userData.noCortar = true; R.sinBorde(k); }
    }
    return m;
  };
  // bandeja inferior (paredes) z 0..zJunta, con fondo cerrado en el recinto del driver y ventana óptica
  ext(plantaLum(4), plantaLum(L.pared + 4), 0, 8, C.alu, 2);
  ext(pl, pin, 7, L.zJunta, C.alu, 1.2);
  const fondoDrv = [[L.pared, -L.cuello + 2], [L.sep, -L.W / 2 + L.pared], [L.sep, L.W / 2 - L.pared], [L.pared, L.cuello - 2]];
  const recorte = (x0, x1, w) => [[x0, -w], [x1, -w], [x1, w], [x0, w]];
  ext(pl.map(([x, y]) => [x, y]), recorte(L.vidrio.x[0] + 6, L.vidrio.x[1] - 6, L.vidrio.y - 6), 0, 3, C.alu, .6);   // fondo con la ventana del vidrio
  // tabique driver | óptico
  R.caja(L.sep - 2, L.sep + 2, -L.W / 2 + 2, L.W / 2 - 2, 0, L.zJunta + 10, C.alu, { r: .5, padre: g });
  // tapa superior: recinto del driver (abovedada) + disipador del recinto óptico
  const drvTop = plantaLum(0).filter(([x]) => x <= L.sep + 1); drvTop.push([L.sep + 1, L.W / 2], [L.sep + 1, -L.W / 2]);
  const dt = [[0, -L.cuello], [L.xAncho, -L.W / 2], [L.sep + 2, -L.W / 2], [L.sep + 2, L.W / 2], [L.xAncho, L.W / 2], [0, L.cuello]];
  const dti = [[L.pared, -L.cuello + L.pared], [L.xAncho, -L.W / 2 + L.pared], [L.sep - 1, -L.W / 2 + L.pared], [L.sep - 1, L.W / 2 - L.pared], [L.xAncho, L.W / 2 - L.pared], [L.pared, L.cuello - L.pared]];
  ext(dt, dti, L.zJunta, L.H - 12, C.alu, 1.5);
  const ins = (k) => [[k, -L.cuello + k * .7], [L.xAncho, -L.W / 2 + k], [L.sep + 2 - k * .3, -L.W / 2 + k], [L.sep + 2 - k * .3, L.W / 2 - k], [L.xAncho, L.W / 2 - k], [k, L.cuello - k * .7]];
  ext(ins(3), null, L.H - 12, L.H - 6, C.alu, 2.5);
  ext(ins(12), null, L.H - 6.5, L.H, C.alu, 3);
  if (!op.sinRotulos) R.impreso([{ t: 'IP66', s: 1 }], 46, 16, [175, 0, L.H + .05], [0, 1, 0], [-1, 0, 0], { color: '#3a3f44', ppm: 14, padre: g });
  // 4 tornillos inox de la tapa del driver
  for (const [x, y] of [[30, -L.cuello + 6], [30, L.cuello - 6], [L.sep - 12, -L.W / 2 + 12], [L.sep - 12, L.W / 2 - 12]])
    R.tornillo([x, y, L.H - 6], [0, 0, 1], { M: 5, L: 0, dk: 8.5, k: 3, tipo: 'pozi', mat: C.inox, padre: g });
  // junta de la tapa
  ext(dt.map(([x, y]) => [x, y * 1.003]), dti, L.zJunta - .8, L.zJunta + .8, C.goma, .2);
  // placa disipadora del recinto óptico + aletas longitudinales
  const opt = pl.filter(([x]) => x >= L.sep); opt.unshift([L.sep, -L.W / 2 + .5]); opt.push([L.sep, L.W / 2 - .5]);
  const optP = [[L.sep, -L.W / 2], ...pl.filter(([x]) => x > L.sep + 1), [L.sep, L.W / 2]];
  ext(optP, null, L.zJunta, L.zJunta + 10, C.alu, 1.5);
  const Al = L.aletas;
  for (let i = 0; i < Al.n; i++) {
    const y = -Al.y + i * 2 * Al.y / (Al.n - 1);
    const hh = Al.h * (1 - Math.pow(Math.abs(y) / (Al.y + 40), 2) * .8);
    const prof = [[Al.x[0], 0], [Al.x[0] + 30, hh], [Al.x[1] - 25, hh], [Al.x[1], 0]];
    R.perfil(prof, [], Al.e, C.alu, { A: [0, 1, 0], B: [1, 0, 0], C: [0, 0, 1], o: [0, y - Al.e / 2, L.zJunta + 10], bevel: .8, padre: g });
  }
  // nervio transversal + marca en relieve
  // placa LED (aluminio), LEDs y lentes
  const PL = L.placaLED, zl = L.zJunta - 2;
  R.caja(PL.x[0], PL.x[1], -PL.y, PL.y, zl - PL.e, zl, C.aluCrudo, { r: .3, padre: g });
  const Ln = L.lentes, gx = (PL.x[1] - PL.x[0]) / Ln.col, gy = 2 * PL.y / Ln.filas;
  for (let i = 0; i < Ln.col; i++) for (let j = 0; j < Ln.filas; j++) {
    const x = PL.x[0] + gx * (i + .5), y = -PL.y + gy * (j + .5), zz = zl - PL.e;
    R.caja(x - 12, x + 12, y - 12, y + 12, zz - 1.2, zz, C.pcb, { r: .3, padre: g });                      // base de la lente
    R.caja(x - 2.5, x + 2.5, y - 2.5, y + 2.5, zz - 1.8, zz - 1.2, C.led, { r: .2, padre: g });
    const ln = R.torno([x, y, zz - 1.2], [x, y, zz - 1.2 - Ln.h], [[0, 0], [Ln.d / 2, 0], [Ln.d / 2 * .92, Ln.h * .5], [Ln.d / 2 * .55, Ln.h * .9], [0, Ln.h]], C.lente, { padre: g, seg: 32 });
    ln.scale.set(1, 1.15, 1);
  }
  // vidrio templado + marco de silicona
  const Vd = L.vidrio;
  R.caja(Vd.x[0], Vd.x[1], -Vd.y, Vd.y, Vd.z, Vd.z + Vd.e, C.vidrio, { r: 4, padre: g });
  for (const [x0, x1, y0, y1] of [[Vd.x[0], Vd.x[1], -Vd.y, -Vd.y + 4], [Vd.x[0], Vd.x[1], Vd.y - 4, Vd.y], [Vd.x[0], Vd.x[0] + 4, -Vd.y, Vd.y], [Vd.x[1] - 4, Vd.x[1], -Vd.y, Vd.y]])
    R.caja(x0, x1, y0, y1, Vd.z + Vd.e, Vd.z + Vd.e + 3, C.silicona, { r: .5, padre: g });
  // recinto del driver: driver, protector de sobretensiones, bornera, cables
  const D = L.drv; R.caja(D.x[0], D.x[1], D.y[0], D.y[1], D.z[0], D.z[1], C.driver, { r: 3, padre: g });
  if (!op.sinRotulos) R.impreso([{ t: 'LED DRIVER', s: 1 }, { t: '220-240V~ 50Hz  120W', s: .7 }, { t: 'DIM 1-10V  IP67', s: .7 }], 110, 34, [(D.x[0] + D.x[1]) / 2, (D.y[0] + D.y[1]) / 2, D.z[1] + .2], [1, 0, 0], [0, 1, 0], { color: '#e8e8e8', ppm: 12, padre: g });
  for (const sx of [D.x[0] - 6, D.x[1] + 1]) R.caja(sx, sx + 5, D.y[0] + 8, D.y[1] - 8, D.z[0], D.z[0] + 2, C.driver, { r: .5, padre: g });
  const S = L.spd; R.caja(S.x[0], S.x[1], S.y[0], S.y[1], S.z[0], S.z[1], R.tipoCorte(R.M.pa('#1f5aa6'), 'plastico'), { r: 2, padre: g });
  if (!op.sinRotulos) R.impreso([{ t: 'SPD 10kV', s: 1 }, { t: 'Uc 320V', s: .8 }], 40, 22, [(S.x[0] + S.x[1]) / 2, (S.y[0] + S.y[1]) / 2, S.z[1] + .2], [1, 0, 0], [0, 1, 0], { color: '#ffffff', ppm: 16, padre: g });
  const B = L.bornera; R.caja(B.x[0], B.x[1], B.y[0], B.y[1], B.z[0], B.z[1], C.paCrema, { r: 1, padre: g });
  for (let i = 0; i < 3; i++) R.cil([B.x[0] + 8 + i * 15, (B.y[0] + B.y[1]) / 2, B.z[1] + .2], [B.x[0] + 8 + i * 15, (B.y[0] + B.y[1]) / 2, B.z[1] - 4], 2.8, R.M.latonNiq(), { seg: 16, padre: g });
  // cables internos (L marrón, N celeste, PE verde-amarillo) de la bornera al driver y al SPD
  const cab = (pts, col) => { for (let i = 0; i < pts.length - 1; i++) R.cil(pts[i], pts[i + 1], 1.3, C.cable(col), { seg: 12, padre: g }); };
  // 3×1,5 que sale del brazo → bornera; bornera → SPD y driver; driver → placa LED (pasa el tabique)
  const xa = L.acople.emp, za = L.acople.z;
  cab([[xa, -6, za], [xa + 6, -40, 20], [B.x[0] + 8, (B.y[0] + B.y[1]) / 2, B.z[1]]], '#6e3b1d');
  cab([[xa, 0, za], [xa + 12, -36, 22], [B.x[0] + 23, (B.y[0] + B.y[1]) / 2, B.z[1]]], '#2f86c9');
  cab([[xa, 6, za], [xa + 18, -30, 24], [B.x[0] + 38, (B.y[0] + B.y[1]) / 2, B.z[1]]], '#2f9a3e');
  cab([[B.x[1], -70, 18], [D.x[0] + 10, 30, 30], [D.x[0] + 12, D.y[0] + 4, 30]], '#6e3b1d');
  cab([[S.x[1], (S.y[0] + S.y[1]) / 2, 18], [D.x[0], D.y[0] + 10, 18]], '#6e3b1d');
  cab([[D.x[1], D.y[0] + 12, 25], [L.sep - 3, 20, 28], [L.sep + 6, 20, 30]], '#202124');
  // receptáculo NEMA 7 pines + fotocontrol (o tapa)
  const N = L.nema;
  if (op.nema !== 'no') {
    R.torno([N.x, 0, L.H - 2], [N.x, 0, L.H + 8], [[0, 0], [N.D / 2 + 4, 0], [N.D / 2 + 2, 10], [0, 10]], C.paGris, { padre: g });
    R.torno([N.x, 0, L.H + 8], [N.x, 0, L.H + 14], [[0, 0], [N.D / 2, 0], [N.D / 2 - 1, 6], [0, 6]], C.paNegro, { padre: g });
    if (op.nema === 'foto') {
      const fc = R.torno([N.x, 0, L.H + 14], [N.x, 0, L.H + 14 + N.Hfc], [[0, 0], [N.Dfc / 2, 0], [N.Dfc / 2, N.Hfc * .55], [N.Dfc / 2 * .8, N.Hfc * .9], [N.Dfc / 2 * .45, N.Hfc], [0, N.Hfc]], R.tipoCorte(R.M.pvc('#5d6a74', { roughness: .3 }), 'plastico'), { padre: g });
      R.caja(N.x - 12, N.x + 12, N.Dfc / 2 - 9, N.Dfc / 2 - 8, L.H + 14 + N.Hfc * .3, L.H + 14 + N.Hfc * .5, C.lente, { r: .3, padre: g });
    }
  }
  // acople: boca Ø62 en el cuello, 2 bulones M8 con abrazadera interior y escala de inclinación
  const A = L.acople;
  const bocaX0 = -6;
  R.torno([bocaX0, 0, L.acople.z], [bocaX0 + 14, 0, L.acople.z], [[A.Di / 2, 0], [A.Di / 2 + 6, 0], [A.Di / 2 + 6, 14], [A.Di / 2, 14], [A.Di / 2, 0]], C.alu, { padre: g });
  for (const bx of [40, 80]) {
    R.cil([bx, 0, L.H - 8], [bx, 0, L.H + 1], 7.5, C.inox, { seg: 6, padre: g });
    R.cil([bx, 0, L.H - 8], [bx, 0, 6], 4, C.inox, { seg: 20, padre: g });
    R.caja(bx - 9, bx + 9, -A.Di / 2 - 2, A.Di / 2 + 2, L.acople.z - A.Di / 2 - 6, L.acople.z - A.Di / 2 - 1, C.galvO, { r: 1, padre: g });   // puente / abrazadera
  }
  // escala de inclinación grabada en el costado del cuello (-15 … +15)
  for (let k = -3; k <= 3; k++) {
    const x = 18 + k * 7; R.caja(x - .6, x + .6, -L.cuello - .1 - (x * (L.W / 2 - L.cuello) / L.xAncho) * 0, -L.cuello + .6, L.zJunta - 6 - (k % 3 === 0 ? 6 : 3), L.zJunta - 6, C.aluOsc, { r: 0, padre: g });
  }
  // marca en el costado
  if (!op.sinRotulos) R.impreso([{ t: 'LUMINARIA LED VIAL', s: .8 }, { t: 'IP66 · IK08 · CLASE I', s: .6 }], 120, 20, [L.L * .62, -L.W / 2 - .3, 18], [1, 0, 0], [0, 0, 1], { color: '#2b2f33', ppm: 14, padre: g });
  return g;
}

/* ---------------- brazo H°G° ---------------- */
export { PRFV, rPRFV, MET, VIN, BHG, APO, LUM, plantaLum, E27 };

/* ---------------- fundación y suelo armados en 2D (sin CSG): bloque cuadrado con agujero, menos el cuarto que se corta ---------------- */
/** bloque vertical de z0 a z1 con contorno 'cont' y agujeros 'huecos' ([x,y]), sacando el cuarto 'cuarto' ([x0,x1,y0,y1]) */
export function bloqueZ(R, cont, huecos, z0, z1, mat, op = {}) {
  const q = op.cuarto; const extra = q ? [[[q[0], q[2]], [q[1], q[2]], [q[1], q[3]], [q[0], q[3]]]] : [];
  const mp = R.restar(cont, [...huecos, ...extra]);
  if (!mp.length) return null;
  const m = R.perfil(mp, [], z1 - z0, mat, { A: [0, 0, 1], B: [1, 0, 0], C: [0, 1, 0], o: [0, 0, z0], bevel: op.bevel ?? 0, padre: op.padre });
  m.userData.noCortar = true; return m;
}
export const circ = (cx, cy, r, n = 64) => Array.from({ length: n }, (_, i) => [cx + r * Math.cos(2 * Math.PI * i / n), cy + r * Math.sin(2 * Math.PI * i / n)]);
export const rect2 = (x0, x1, y0, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
/** cable redondo por una polilínea (tramos rectos con codos) */
export function cablePol(R, pts, r, mat, padre) {
  for (let i = 0; i < pts.length - 1; i++) R.cil(pts[i], pts[i + 1], r, mat, { seg: 20, padre });
  for (let i = 1; i < pts.length - 1; i++) { const s = new R.THREE.Mesh(new R.THREE.SphereGeometry(r, 20, 12), mat); s.position.set(...pts[i]); (padre || R.raiz).add(s); }
}

/** pieza de revolución alrededor del eje z (en x, y) de z0 hacia arriba, sólo entre los ángulos de mundo a0 → a1 (grados),
 *  con tapas planas rayadas en los dos cortes (sin CSG). pf = [[r, t]…] cerrado. */
export function tornoZP(R, x, y, z0, pf, a0, a1, mat, op = {}) {
  const T = R.THREE, g = op.padre || R.raiz;
  const pc = pf.slice(); if (pc[0][0] !== pc[pc.length - 1][0] || pc[0][1] !== pc[pc.length - 1][1]) pc.push(pc[0]);
  const geo = new T.LatheGeometry(pc.map(([r, t]) => new T.Vector2(Math.max(r, 1e-3), t)), op.seg || 96, (a0 + 90) * Math.PI / 180, (a1 - a0) * Math.PI / 180);
  geo.rotateX(Math.PI / 2); geo.deleteAttribute('uv'); geo.computeVertexNormals();
  const m = new T.Mesh(BGU.toCreasedNormals(geo, Math.PI / 4), mat); m.position.set(x, y, z0); m.castShadow = true; m.receiveShadow = !!op.sombraRecibe; m.userData.noCortar = true; g.add(m);
  if (op.tapas !== false) {
    const mc = mat.userData._mc || (mat.userData._mc = R.M.corte(mat, mat.userData.corte || 'plastico'));
    const sh = new T.Shape(pf.map(([r, t]) => new T.Vector2(r, t)));
    for (const a of [a0, a1]) {
      const sg = new T.ShapeGeometry(sh); const ar = a * Math.PI / 180;
      // (r, t) → (x + r cos a, y + r sin a, z0 + t)
      const pos = sg.attributes.position; for (let i = 0; i < pos.count; i++) { const r = pos.getX(i), t = pos.getY(i); pos.setXYZ(i, x + r * Math.cos(ar), y + r * Math.sin(ar), z0 + t); }
      sg.computeVertexNormals();
      const k = new T.Mesh(sg, mc); k.material = mc; mc.side = T.DoubleSide; k.userData.noCortar = true; R.sinBorde(k); g.add(k);
    }
  }
  return m;
}
/** tubo hueco parcial (pared e) de z0 a z1 */
export function tuboZP(R, x, y, z0, z1, r0, r1, e, a0, a1, mat, op = {}) {
  const L = z1 - z0; return tornoZP(R, x, y, z0, [[r0 - e, 0], [r0, 0], [r1, L], [r1 - e, L]], a0, a1, mat, op);
}

/* ---------------- tubo con ventana (sin CSG): bandas de revolución ---------------- */
/** tubo de z0 a z1 (radios r0→r1, pared e) entre a0 y a1 (grados), con una ventana de ancho w y alto h centrada en (aw, zw) */
export function tuboVentana(R, z0, z1, r0, r1, e, a0, a1, mat, ven, op = {}) {
  const rr = (z) => r0 + (r1 - r0) * (z - z0) / (z1 - z0);
  const pf = (za, zb) => [[rr(za) - e, 0], [rr(za), 0], [rr(zb), zb - za], [rr(zb) - e, zb - za]];
  if (!ven) return tornoZP(R, 0, 0, z0, pf(z0, z1), a0, a1, mat, op);
  const zA = ven.z - ven.h / 2, zB = ven.z + ven.h / 2, th = Math.asin(ven.w / 2 / rr(ven.z)) * 180 / Math.PI;
  tornoZP(R, 0, 0, z0, pf(z0, zA), a0, a1, mat, op);
  // banda de la ventana: de aw+th a aw+360-th, recortado al rango [a0, a1]
  const s0 = ven.a + th, s1 = ven.a + 360 - th;
  const segs = [];
  for (const k of [-360, 0, 360]) { const p = Math.max(a0, s0 + k), q = Math.min(a1, s1 + k); if (q > p + .5) segs.push([p, q]); }
  for (const [p, q] of segs) tornoZP(R, 0, 0, zA, pf(zA, zB), p, q, mat, { ...op, tapas: op.tapas !== false && (p === a0 || q === a1) ? true : false });
  return tornoZP(R, 0, 0, zB, pf(zB, z1), a0, a1, mat, op);
}

/* ---------------- abrazadera H°G° de 2 mitades con orejas y 2 bulones (eje z, Ø del poste D, a la altura z) ---------------- */
export function abrazadera(R, D, z, op = {}) {
  const C = matsCol(R), A = BHG.abraz, g = R.grupo(op.padre), r = D / 2;
  for (const [a0, a1] of [[5, 175], [185, 355]]) tornoZP(R, 0, 0, z - A.b / 2, [[r, 0], [r + A.e, 0], [r + A.e, A.b], [r, A.b]], a0, a1, C.galv, { padre: g, tapas: false, seg: 64 });
  for (const s of [-1, 1]) {
    // orejas (planchuelas dobladas) a ±x, con el bulón Ø12 que las aprieta (eje y)
    const x = s * (r + A.e + A.oreja / 2);
    for (const yy of [-6 - A.e, 6]) R.caja(x - A.oreja / 2, x + A.oreja / 2, yy, yy + A.e, z - A.b / 2, z + A.b / 2, C.galv, { r: .8, padre: g });
    bulonHex(R, [x + s * 4, -6 - A.e - .5, z], [0, 1, 0], A.bulon, A.L * .7, C.galv, { padre: g, dt: 6 + A.e + 13 });
  }
  return g;
}

/* ---------------- portalámpara E27 de aplicar con lámpara LED A60 ---------------- */
export function portalampara(R, op = {}) {
  const C = matsCol(R), E = E27, g = R.grupo(op.padre), a0 = op.a0 ?? -90, a1 = op.a1 ?? 270, tp = op.tapas;
  const B = E.base, Cu = E.cuello, Rs = E.rosca, Lp = E.lamp;
  // base de baquelita / termoplástico con dos pozos de tornillo
  tornoZP(R, 0, 0, 0, [[0, 0], [B.D / 2, 0], [B.D / 2, B.H - 6], [B.D / 2 - 6, B.H], [Cu.D / 2, B.H], [Cu.D / 2, B.H + Cu.H], [Rs.D / 2 + 1.5, B.H + Cu.H], [Rs.D / 2 + 1.5, 10], [0, 10]], a0, a1, C.paCrema, { padre: g, tapas: tp });
  // camisa roscada de latón (rosca E27) y contacto central
  const zr = B.H + Cu.H - Rs.L, n = Math.floor(Rs.L / Rs.paso), pfR = [[Rs.D / 2 - .4, 0]];
  for (let i = 0; i <= n * 2; i++) pfR.push([i % 2 ? Rs.d / 2 + .3 : Rs.D / 2 + .3, i * Rs.paso / 2]);
  pfR.push([Rs.D / 2 + .3, Rs.L]); pfR.push([Rs.D / 2 - .4, Rs.L]);
  tornoZP(R, 0, 0, zr, pfR, a0, a1, C.laton, { padre: g, tapas: tp, seg: 64 });
  tornoZP(R, 0, 0, zr - 3, [[0, 0], [4, 0], [4, 3], [0, 3]], a0, a1, C.laton, { padre: g, tapas: tp });
  // lámpara: casquillo E27 + cuerpo térmico + globo opal
  const zl = zr + 1, pfC = [[0, 0], [3, 0], [3, 2]];
  for (let i = 0; i <= n * 2; i++) pfC.push([i % 2 ? Rs.d / 2 : Rs.D / 2 - .3, 3 + i * Rs.paso / 2]);
  pfC.push([Rs.D / 2, Rs.L + 4]); pfC.push([0, Rs.L + 4]);
  if (op.lamp !== false) {
    tornoZP(R, 0, 0, zl, pfC, a0, a1, C.aluCrudo, { padre: g, tapas: tp, seg: 64 });
    const zc = zl + Rs.L + 4;
    tornoZP(R, 0, 0, zc, [[0, 0], [14.5, 0], [21, 18], [24, 26], [0, 26]], a0, a1, R.tipoCorte(R.M.pvc('#f2f2ef'), 'plastico'), { padre: g, tapas: tp });
    const prof = [[0, 0]]; for (let i = 0; i <= 24; i++) { const t = i / 24 * Math.PI; prof.push([Math.max(.1, (Lp.D / 2) * Math.sin(t * .5 + Math.PI / 2 * (t > Math.PI / 2 ? 0 : 0)) ), 0]); }
    const glob = []; const zg = zc + 24, H = Lp.L - (zg - zl);
    glob.push([24, 0]); for (let i = 1; i <= 24; i++) { const u = i / 24; const r = u < .45 ? 24 + (Lp.D / 2 - 24) * Math.sin(u / .45 * Math.PI / 2) : (Lp.D / 2) * Math.sqrt(Math.max(0, 1 - Math.pow((u - .45) / .55, 2))); glob.push([Math.max(r, .2), u * H]); }
    glob.push([0, H]); glob.push([0, 0]);
    const gm = R.M.pvc('#fbfaf6', { roughness: .45, transmission: 0 }); gm.transparent = true; gm.opacity = op.globoOp ?? .92;
    tornoZP(R, 0, 0, zg, glob, a0, a1, R.tipoCorte(gm, 'plastico'), { padre: g, tapas: tp, seg: 64 });
    // placa LED interior
    tornoZP(R, 0, 0, zg + 1, [[0, 0], [20, 0], [20, 1.6], [0, 1.6]], a0, a1, C.pcb, { padre: g, tapas: tp });
  }
  // bornes de conexión (2) y tornillos de fijación
  for (const s of [-1, 1]) {
    R.tornillo([s * E.base.tornillos / 2, 0, B.H - 6.2], [0, 0, 1], { M: 4, L: 22, dk: 7.5, k: 2.6, tipo: 'pozi', mat: C.acero, padre: g });
    R.caja(s * 11 - 4, s * 11 + 4, 12, 22, 10, 18, C.laton, { r: .4, padre: g });
  }
  return g;
}

/* ---------------- brazo H°G° 2,13 m sobre poste (eje z), saliendo hacia +x desde la abrazadera de arriba ---------------- */
export function brazoHG(R, D, zA, op = {}) {
  const T = R.THREE, C = matsCol(R), Bz = BHG, g = R.grupo(op.padre), r = D / 2;
  const zT = zA - Bz.sep;
  abrazadera(R, D, zA, { padre: g }); abrazadera(R, D, zT, { padre: g });
  // montura: chapa curva soldada al brazo (apretada por la abrazadera) AC
  tornoZP(R, 0, 0, zA - 45, [[r + 6, 0], [r + 12, 0], [r + 12, 90], [r + 6, 90]], -30, 30, C.galv, { padre: g, tapas: true });
  const p0 = new T.Vector3(r + 12, 0, zA), Lh = Bz.L - r - 12 - Bz.rosca.L;
  const dir = new T.Vector3(Lh, 0, Bz.sube).normalize();
  const p1 = p0.clone().addScaledVector(dir, Math.hypot(Lh, Bz.sube));
  tuboP(R, p0.toArray(), p1.toArray(), Bz.D / 2, Bz.e, C.galv, { padre: g });
  toro(R, p0.clone().addScaledVector(dir, 3).toArray(), dir.toArray(), Bz.D / 2 + .3, 2, C.soldadura, g);
  // rosca gas en la punta
  const p2 = p1.clone().addScaledVector(dir, Bz.rosca.L);
  roscaCano(R, p1.toArray(), p2.toArray(), Bz.D / 2, Bz.D / 2 - Bz.e, C.galv, Bz.rosca.paso, { padre: g, conica: true });
  // tensor: de la abrazadera de abajo al 55 % del brazo, con chapitas soldadas
  const q0 = new T.Vector3(r + 12, 0, zT), q1 = p0.clone().addScaledVector(dir, Lh * Bz.tensor.t).add(new T.Vector3(0, 0, -Bz.D / 2));
  tuboP(R, q0.toArray(), q1.toArray(), Bz.tensor.D / 2, Bz.tensor.e, C.galv, { padre: g });
  R.caja(q1.x - 20, q1.x + 20, -3, 3, q1.z - 6, q1.z + 12, C.galv, { r: .5, padre: g });
  tornoZP(R, 0, 0, zT - 30, [[r + 6, 0], [r + 12, 0], [r + 12, 60], [r + 6, 60]], -25, 25, C.galv, { padre: g, tapas: true });
  // acople Ø60,3 × 150 (cupla) enroscado en la punta (op.acopleSep lo separa)
  const sep = op.acopleSep || 0, a0 = p1.clone().addScaledVector(dir, Bz.rosca.L * .2 + sep);
  const A = Bz.acople, a1 = a0.clone().addScaledVector(dir, A.L);
  const ga = R.grupo(g);
  tuboP(R, a0.toArray(), a1.toArray(), A.D / 2, A.D / 2 - Bz.D / 2 + 1.2, C.galvO, { padre: ga });
  roscaCano(R, a0.toArray(), a0.clone().addScaledVector(dir, Bz.rosca.L * .8).toArray(), Bz.D / 2 + 1.2, Bz.D / 2 - .6, C.galvO, Bz.rosca.paso, { padre: ga });
  return { g, p0, p1, p2, dir, a0, a1, q0, q1 };
}
