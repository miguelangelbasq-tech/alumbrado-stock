/* civil_util.mjs · materiales y piezas 3D del grupo «civil» (caños, cámara, áridos y hormigones, ladrillo, hierros y malla SIMA,
 * anclaje de expansión, malla de advertencia, telgopor, envases, vereda y calzada, precintos, taco fisher).
 * No toca lib/r3d.mjs ni las piezas de otros grupos: importa pat.mjs (revol, tuerca, arandelaP) y col_util.mjs (matsCol) tal cual.
 * Medidas: perfiles_civil.mjs (las mismas del plano). */
import { revol, tuerca, arandelaP, rosca } from './pat.mjs';
import { matsCol } from './col_util.mjs';

const TAU = Math.PI * 2, rad = (g) => g * Math.PI / 180;
export const cte = (k) => () => k;

/* ---------------- shader: ruido fino + voronoi 3D (piedras en una pasta, celdas de las perlas, granos) ---------------- */
const GL = `
float k3h(vec3 p){ p = fract(p*0.3183099 + .1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float k3n(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);
  return mix(mix(mix(k3h(i+vec3(0,0,0)),k3h(i+vec3(1,0,0)),f.x), mix(k3h(i+vec3(0,1,0)),k3h(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(k3h(i+vec3(0,0,1)),k3h(i+vec3(1,0,1)),f.x), mix(k3h(i+vec3(0,1,1)),k3h(i+vec3(1,1,1)),f.x),f.y),f.z); }
float k3f(vec3 p){ return .55*k3n(p) + .3*k3n(p*2.13+7.1) + .15*k3n(p*4.71+3.3); }
vec3 k3v(vec3 p){ return vec3(k3h(p), k3h(p+vec3(31.7,7.3,13.1)), k3h(p+vec3(5.9,47.2,23.3))); }
vec4 k3vor(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); float d1 = 9.0, d2 = 9.0; vec3 ib = vec3(0);
  for (int a=-1;a<=1;a++) for (int b=-1;b<=1;b++) for (int c=-1;c<=1;c++) { vec3 g = vec3(float(a),float(b),float(c));
    vec3 r = g + k3v(i+g)*.85 + .075 - f; float d = dot(r,r); if (d < d1) { d2 = d1; d1 = d; ib = i+g; } else if (d < d2) d2 = d; }
  return vec4(sqrt(d1), sqrt(d2), k3h(ib*1.37+3.1), k3h(ib*.71+9.7)); }
vec3 k3pal(float h, vec3 a, vec3 b, vec3 c, vec3 d){ return h < .25 ? a : h < .5 ? b : h < .75 ? c : d; }`;

/** material físico con ruido + voronoi en coordenadas de mundo.
 *  rz = { s, cvar, s2, cvar2, amp }  (ruido como col_util)
 *  vz = { modo: 'piedras'|'celdas'|'granos', cel (mm), frac, r0, r1, cols: [4 hex], borde, amp } (y vz2 opcional, segunda escala) */
export function matV(T, o, rz = {}, vz = null, vz2 = null) {
  const m = new T.MeshPhysicalMaterial(o);
  const col = (h) => { const c = new T.Color(h); return new T.Vector3(c.r, c.g, c.b); };
  const U = (v, k) => {
    if (!v) return { [k + 'M']: { value: 0 } };
    const c = (v.cols || ['#888', '#999', '#777', '#aaa']).map(col);
    return { [k + 'M']: { value: v.modo === 'piedras' ? 1 : v.modo === 'celdas' ? 2 : 3 }, [k + 'P']: { value: new T.Vector4(v.cel, v.frac ?? .6, v.r0 ?? .25, v.r1 ?? .45) },
      [k + 'B']: { value: new T.Vector4(v.borde ?? .06, v.amp ?? 0, v.osc ?? .35, v.ruido ?? .25) }, [k + 'C0']: { value: c[0] }, [k + 'C1']: { value: c[1] }, [k + 'C2']: { value: c[2] }, [k + 'C3']: { value: c[3] } };
  };
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, {
      kS: { value: new T.Vector3(...(rz.s || [.1, .1, .1])) }, kC: { value: rz.cvar || 0 }, kS2: { value: new T.Vector3(...(rz.s2 || [1, 1, 1])) }, kC2: { value: rz.cvar2 || 0 }, kA: { value: rz.amp || 0 },
      ...U(vz, 'v1'), ...U(vz2, 'v2'),
    });
    const capa = (k) => `
      if (${k}M > 0.5) { vec4 P = ${k}P; vec4 B = ${k}B; vec3 q = vWP3 / P.x; vec4 v = k3vor(q + vec3(B.w)*k3n(q*2.7));
        if (${k}M < 1.5) {           // piedras: celdas elegidas (frac) con radio variable, borde oscuro
          float rr = mix(P.z, P.w, v.w); float t = v.x / rr;
          if (v.z < P.y && t < 1.0) { vec3 cc = k3pal(fract(v.w*7.13), ${k}C0, ${k}C1, ${k}C2, ${k}C3) * (.85 + .3*k3n(q*9.0));
            diffuseColor.rgb = mix(cc, cc*(1.0-B.z), smoothstep(.72, 1.0, t)); kBump += B.y*(1.0-t*t); }
        } else if (${k}M < 2.5) {    // celdas (perlas del telgopor): borde gris, cúpula
          float e = v.y - v.x; float lin = 1.0 - smoothstep(B.x*.5, B.x, e);
          vec3 cc = mix(${k}C0, ${k}C1, v.z) * (1.0 - .07*v.x*v.x); diffuseColor.rgb = mix(cc, ${k}C2, lin*B.z); kBump += B.y*(1.0 - v.x);
        } else {                     // granos sueltos: puntos de color en la superficie
          float rr = mix(P.z, P.w, v.w); if (v.z < P.y && v.x < rr) { vec3 cc = k3pal(fract(v.w*5.3), ${k}C0, ${k}C1, ${k}C2, ${k}C3); diffuseColor.rgb = mix(diffuseColor.rgb, cc, .85); kBump += B.y; }
        } }`;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP3;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWP3 = (modelMatrix * vec4(transformed,1.0)).xyz;');
    const decl = ['v1', 'v2'].map(k => `uniform float ${k}M; uniform vec4 ${k}P, ${k}B; uniform vec3 ${k}C0, ${k}C1, ${k}C2, ${k}C3;`).join('\n');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vWP3;\nuniform vec3 kS, kS2; uniform float kC, kC2, kA;\n' + decl + GL + '\nfloat kBump = 0.0;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        float kv = k3f(vWP3*kS); diffuseColor.rgb *= 1.0 + kC*(kv-.5)*2.0;
        if (kC2 > 0.0) { float kv2 = k3f(vWP3*kS2 + 11.0); diffuseColor.rgb *= 1.0 + kC2*(kv2-.5)*2.0; }
        ${capa('v1')} ${capa('v2')}`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        if (kA > 0.0) { vec3 q = vWP3*kS2; float e = .35;
          vec3 g = vec3(k3f(q+vec3(e,0,0))-k3f(q-vec3(e,0,0)), k3f(q+vec3(0,e,0))-k3f(q-vec3(0,e,0)), k3f(q+vec3(0,0,e))-k3f(q-vec3(0,0,e)))/(2.0*e);
          vec3 gv = (viewMatrix*vec4(g,0.0)).xyz; normal = normalize(normal - kA*(gv - dot(gv,normal)*normal)); }`);
  };
  m.customProgramCacheKey = () => 'civ' + JSON.stringify([rz, vz, vz2]);
  return m;
}

/** materiales del grupo. Cada material con su color y textura; la cara de corte de los «macizos» muestra el árido (mismo shader) */
export function matsC(R) {
  if (R._mciv) return R._mciv; const T = R.THREE, C = matsCol(R);
  const tc = (m, t) => { m.userData.corte = t; return m; };
  const piedraCols = ['#a9acb0', '#c6c0b4', '#8e9196', '#d4d0c7'];
  const M = {
    // ---- plásticos
    pvc: tc(R.M.pvc('#bfc4c9'), 'plastico'), pvcN: tc(R.M.pvc('#9aa1a8'), 'plastico'), pvcIn: R.M.pvc('#a6acb2'),
    pvcCorte: matV(T, { color: '#f4f4f1', roughness: .6 }, { s: [.8, .8, .8], cvar: .02 }),
    pead: tc(matV(T, { color: '#1d1e20', roughness: .42, clearcoat: .25, clearcoatRoughness: .4 }, { s: [.4, .4, .02], cvar: .05 }), 'plastico'),
    peadCorte: matV(T, { color: '#3a3b3e', roughness: .7 }, { s: [1, 1, 1], cvar: .04 }),
    corrugado: tc(R.M.pa('#f0d400', { roughness: .5, clearcoat: .2 }), 'plastico'),   // AC: color del corrugado
    adhesivo: R.M.pa('#3f7fc0', { roughness: .25, clearcoat: .6 }),
    nylonN: tc(R.M.pa('#1f2023', { roughness: .48, clearcoat: .15 }), 'plastico'), nylonB: tc(R.M.pa('#e9e3cf', { roughness: .45, clearcoat: .1 }), 'plastico'),
    nylonCorte: matV(T, { color: '#c8b78a', roughness: .6 }, { s: [2, 2, 2], cvar: .03 }),
    fisher: tc(R.M.pa('#5f7f9f', { roughness: .5 }), 'plastico'), fisherCorte: matV(T, { color: '#9fb6cc', roughness: .6 }, { s: [2, 2, 2], cvar: .03 }),
    cordon: R.M.pa('#f2e9c8', { roughness: .8 }),
    // ---- metales
    bronce: tc(matV(T, { color: '#e0ad5c', metalness: .85, roughness: .36 }, { s: [.05, .05, .05], cvar: .1, s2: [.6, .6, .6], cvar2: .06, amp: .05 }), 'metal'),
    bronceC: matV(T, { color: '#e2b46a', metalness: .9, roughness: .3 }, { s: [.5, .5, .5], cvar: .04 }),
    galv: tc(matV(T, { color: '#c9d1d8', metalness: .7, roughness: .34 }, { s: [.07, .07, .07], cvar: .1, s2: [.9, .9, .9], cvar2: .05, amp: .03 }), 'metal'),
    galvC: new T.MeshPhysicalMaterial({ color: '#e4e8ec', metalness: .6, roughness: .3 }),
    acero: tc(new T.MeshPhysicalMaterial({ color: '#a7b0b8', metalness: .75, roughness: .28 }), 'metal'),
    aceroC: new T.MeshPhysicalMaterial({ color: '#f0f2f4', metalness: .5, roughness: .3 }),
    hierro: tc(matV(T, { color: '#7d756d', metalness: .7, roughness: .5 }, { s: [.08, .08, .08], cvar: .18, s2: [.9, .9, .9], cvar2: .1, amp: .15 }), 'metal'),   // acero negro con cascarilla
    hierroC: new T.MeshPhysicalMaterial({ color: '#a7a9ab', metalness: .85, roughness: .35 }),
    zinc: tc(new T.MeshPhysicalMaterial({ color: '#c9ced3', metalness: 1, roughness: .28 }), 'metal'),
    alambre: tc(matV(T, { color: '#aeb6bd', metalness: .95, roughness: .38 }, { s: [.2, .2, .2], cvar: .08 }), 'metal'),
    // ---- macizos (la cara cortada muestra la granulometría)
    horm: matV(T, { color: '#a9a8a2', roughness: .92 }, { s: [.05, .05, .05], cvar: .08, s2: [1.2, 1.2, 1.2], cvar2: .06, amp: .25 },
      { modo: 'piedras', cel: 15, frac: .82, r0: .45, r1: .66, cols: piedraCols, osc: .4, amp: .4, ruido: .35 },
      { modo: 'granos', cel: 2.2, frac: .5, r0: .15, r1: .3, cols: ['#d9cfb6', '#8b8a86', '#c7bfa9', '#6d6c69'], amp: .2 }),
    hormD: matV(T, { color: '#9b9a94', roughness: .9 }, { s: [.05, .05, .05], cvar: .07, s2: [1.2, 1.2, 1.2], cvar2: .06, amp: .25 },
      { modo: 'piedras', cel: 13, frac: .9, r0: .5, r1: .7, cols: piedraCols, osc: .4, amp: .4, ruido: .35 },
      { modo: 'granos', cel: 2, frac: .55, r0: .15, r1: .3, cols: ['#d9cfb6', '#8b8a86', '#c7bfa9', '#6d6c69'], amp: .2 }),
    hormExt: matV(T, { color: '#b2b1aa', roughness: .9 }, { s: [.05, .05, .05], cvar: .06, s2: [1.4, 1.4, 1.4], cvar2: .07, amp: .3 },
      { modo: 'granos', cel: 3, frac: .35, r0: .12, r1: .25, cols: ['#8f8d87', '#c9c5ba', '#7a7873', '#d8d3c7'], amp: .2 }),
    hormP: matV(T, { color: '#bdb5a4', roughness: .95 }, { s: [.05, .05, .05], cvar: .1, s2: [1.2, 1.2, 1.2], cvar2: .08, amp: .3 },
      { modo: 'piedras', cel: 15, frac: .5, r0: .36, r1: .55, cols: ['#a39c8e', '#8b877e', '#c2bba9', '#77736b'], osc: .4, amp: .3 },
      { modo: 'granos', cel: 2.5, frac: .45, r0: .15, r1: .3, cols: ['#e1d6b8', '#a49e90', '#cdc3a6', '#8e887b'], amp: .2 }),
    mortero: matV(T, { color: '#a6a39b', roughness: .95 }, { s: [.1, .1, .1], cvar: .07, s2: [2, 2, 2], cvar2: .08, amp: .3 },
      { modo: 'granos', cel: 1.6, frac: .55, r0: .2, r1: .38, cols: ['#d8ccab', '#8d8a83', '#c3b896', '#76736d'], amp: .3 }),
    morteroCal: matV(T, { color: '#d9d5c9', roughness: .95 }, { s: [.1, .1, .1], cvar: .05, s2: [2, 2, 2], cvar2: .05, amp: .25 },
      { modo: 'granos', cel: 1.6, frac: .4, r0: .15, r1: .3, cols: ['#e3d6b0', '#b9b2a2', '#cdbf98', '#a59e8f'], amp: .2 }),
    arena: matV(T, { color: '#d6bf8a', roughness: 1 }, { s: [.04, .04, .04], cvar: .12, s2: [1.6, 1.6, 1.6], cvar2: .14, amp: .7 },
      { modo: 'granos', cel: 1.2, frac: .55, r0: .18, r1: .4, cols: ['#f1e2b6', '#8f7a52', '#c9a96a', '#5f5547'], amp: .4 }),
    tierra: matV(T, { color: '#8a6a49', roughness: 1 }, { s: [.03, .03, .03], cvar: .2, s2: [.5, .5, .5], cvar2: .16, amp: .5 },
      { modo: 'piedras', cel: 9, frac: .14, r0: .18, r1: .35, cols: ['#6c5238', '#9c8061', '#5a4530', '#a38b6c'], osc: .3, amp: .3 }),
    relleno: matV(T, { color: '#9a7b58', roughness: 1 }, { s: [.03, .03, .03], cvar: .14, s2: [.6, .6, .6], cvar2: .14, amp: .45 },
      { modo: 'granos', cel: 2.5, frac: .4, r0: .15, r1: .35, cols: ['#7a5f42', '#b59b78', '#6a523a', '#c4ab88'], amp: .3 }),
    cemento: matV(T, { color: '#a3a5a6', roughness: 1 }, { s: [.2, .2, .2], cvar: .06, s2: [3, 3, 3], cvar2: .05, amp: .2 }),
    cal: matV(T, { color: '#f1efe8', roughness: 1 }, { s: [.2, .2, .2], cvar: .04, s2: [3, 3, 3], cvar2: .04, amp: .2 }),
    ladrillo: tc(matV(T, { color: '#b5553a', roughness: .95 }, { s: [.04, .04, .04], cvar: .14, s2: [.8, .8, .8], cvar2: .12, amp: .45 },
      { modo: 'granos', cel: 3, frac: .3, r0: .12, r1: .3, cols: ['#7c321f', '#d98a66', '#5e2716', '#e6a888'], amp: .3 }), 'x'),
    ladrilloC: matV(T, { color: '#c4664a', roughness: .95 }, { s: [.1, .1, .1], cvar: .1, s2: [1.5, 1.5, 1.5], cvar2: .1, amp: .3 },
      { modo: 'granos', cel: 2, frac: .4, r0: .12, r1: .3, cols: ['#8a3a22', '#e09a78', '#6a2b18', '#f0b898'], amp: .2 }),
    telgopor: matV(T, { color: '#f6f6f1', roughness: .85 }, { s: [.2, .2, .2], cvar: .02 },
      { modo: 'celdas', cel: 3.5, cols: ['#fdfdfa', '#f1f1ea', '#c9c9bc', '#fff'], borde: .08, osc: .5, amp: .5, ruido: .15 }),
    asfalto: matV(T, { color: '#2a2b2d', roughness: .85 }, { s: [.1, .1, .1], cvar: .1, s2: [2, 2, 2], cvar2: .1, amp: .35 },
      { modo: 'piedras', cel: 6, frac: .55, r0: .28, r1: .45, cols: ['#55575a', '#3f4043', '#6b6c6e', '#4a4b4e'], osc: .3, amp: .3 },
      { modo: 'granos', cel: 1.4, frac: .4, r0: .15, r1: .3, cols: ['#77797c', '#5a5b5e', '#8d8f92', '#45464a'], amp: .2 }),
    baldosa: matV(T, { color: '#c9c2b2', roughness: .7 }, { s: [.08, .08, .08], cvar: .05, s2: [2, 2, 2], cvar2: .04, amp: .1 },
      { modo: 'granos', cel: 1.5, frac: .35, r0: .15, r1: .3, cols: ['#a59d8b', '#e0dacb', '#958c79', '#d2c9b4'], amp: .1 }),
    baldosaC: matV(T, { color: '#b6ae9c', roughness: .9 }, { s: [.1, .1, .1], cvar: .06 },
      { modo: 'granos', cel: 1.6, frac: .55, r0: .18, r1: .38, cols: ['#8e8678', '#ddd4bf', '#7a7364', '#c9bfa8'], amp: .2 }),
    base: matV(T, { color: '#8f8a80', roughness: 1 }, { s: [.05, .05, .05], cvar: .1 },
      { modo: 'piedras', cel: 9, frac: .55, r0: .3, r1: .46, cols: ['#a8a39a', '#7d7a74', '#bdb7ab', '#6c6964'], osc: .4, amp: .4 }),
    pasto: C.pasto,
    madera: matV(T, { color: '#a77a4b', roughness: .75 }, { s: [.3, .3, .006], cvar: .16, s2: [.04, .04, .04], cvar2: .1, amp: .12 }),
    maderaC: matV(T, { color: '#c49a68', roughness: .85 }, { s: [.15, .15, .6], cvar: .18 }),
    // ---- papel, envases, impresos
    kraft: matV(T, { color: '#c7a978', roughness: .85, side: T.DoubleSide }, { s: [.05, .05, .05], cvar: .05, s2: [.6, .6, 4], cvar2: .05, amp: .12 }),
    papelB: matV(T, { color: '#e8e3d6', roughness: .85, side: T.DoubleSide }, { s: [.05, .05, .05], cvar: .04, s2: [.6, .6, 4], cvar2: .04, amp: .12 }),
    malla: tc(matV(T, { color: '#d8321f', roughness: .55, clearcoat: .15, side: T.DoubleSide }, { s: [.2, .2, .2], cvar: .05 }), 'plastico'),
    cartucho: tc(R.M.pa('#f1f0ea', { roughness: .45, clearcoat: .2 }), 'plastico'),
    silicona: R.M.pa('#e9eef0', { roughness: .15, clearcoat: .8, transparent: true, opacity: .82 }),
    elast: R.M.pa('#5d6063', { roughness: .55, clearcoat: .2 }),
    espuma: matV(T, { color: '#e6c96a', roughness: .9 }, { s: [.3, .3, .3], cvar: .06 },
      { modo: 'celdas', cel: 1.2, cols: ['#ecd27a', '#dcbc5c', '#b99a3c', '#fff'], borde: .12, osc: .35, amp: .3 }),
    hojalata: tc(new T.MeshPhysicalMaterial({ color: '#cfd3d6', metalness: 1, roughness: .25 }), 'metal'),
    asfaltico: R.M.pa('#151515', { roughness: .15, clearcoat: .9 }),
    pinturaGris: R.M.pa('#8c9196', { roughness: .3, clearcoat: .6 }),
    goma: R.M.goma('#222326'),
    cinta: R.M.pa('#151618', { roughness: .25, clearcoat: .5 }),
    prfv: C.prfv,
    oscuro: R.M.oscuro(),
  };
  // la cara de corte de cada macizo es el mismo material (se ven las piedras); la del metal/plástico, su versión clara
  for (const k of ['horm', 'hormD', 'hormExt', 'hormP', 'mortero', 'morteroCal', 'arena', 'tierra', 'relleno', 'cemento', 'cal', 'asfalto', 'base', 'telgopor', 'espuma']) M[k].userData.corte = M[k];
  M.hormExt.userData.corte = M.horm; M.ladrillo.userData.corte = M.ladrilloC; M.baldosa.userData.corte = M.baldosaC;
  M.pvc.userData.corte = M.pvcCorte; M.pead.userData.corte = M.peadCorte; M.bronce.userData.corte = M.bronceC; M.hierro.userData.corte = M.hierroC;
  M.nylonB.userData.corte = M.nylonCorte; M.nylonN.userData.corte = M.nylonCorte; M.fisher.userData.corte = M.fisherCorte; M.acero.userData.corte = M.aceroC;
  M.madera.userData.corte = M.maderaC; M.galv.userData.corte = M.galvC;
  R._mciv = M; return M;
}

/* ---------------- geometría ---------------- */
const V = (T, a) => new T.Vector3(a[0], a[1], a[2]);

/** malla desde arreglos (sin bordes técnicos) */
export function malla(R, pos, idx, mat, padre, borde = false) {
  const T = R.THREE, g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  const m = new T.Mesh(g, mat); m.castShadow = m.receiveShadow = true; if (!borde) R.sinBorde(m); (padre || R.raiz).add(m); return m;
}

/** tubo hueco barrido por una curva f(t) (t0..t1) con radios ro(t), ri(t), sector angular a0..a1 (corte), caras de corte con matC,
 *  tapas en las puntas (anillos) con matT. up: vector de referencia del marco. */
export function tuboB(R, f, t0, t1, ro, ri, mat, op = {}) {
  const T = R.THREE, n = op.n || 64, na = op.na || 64, a0 = rad(op.a0 ?? 0), a1 = rad(op.a1 ?? 360), full = Math.abs(a1 - a0 - TAU) < 1e-6;
  const g = R.grupo(op.padre);
  const fr = []; let prevN = null;
  for (let i = 0; i <= n; i++) {
    const t = t0 + (t1 - t0) * i / n, h = Math.abs(t1 - t0) * 1e-4;
    const p = V(T, f(t)), tg = V(T, f(Math.min(t1, t + h))).sub(V(T, f(Math.max(t0, t - h)))).normalize();
    let N = prevN ? prevN.clone() : V(T, op.up || [0, 0, 1]); N.addScaledVector(tg, -N.dot(tg));
    if (N.lengthSq() < 1e-8) N = new T.Vector3(1, 0, 0).addScaledVector(tg, -tg.x); N.normalize(); prevN = N;
    fr.push({ p, N, B: new T.Vector3().crossVectors(tg, N), t });
  }
  const pt = (F, r, a) => F.p.clone().addScaledVector(F.N, r * Math.cos(a)).addScaledVector(F.B, r * Math.sin(a));
  const sup = (rf, inv, m) => {
    const pos = [], idx = [];
    for (const F of fr) for (let j = 0; j <= na; j++) { const a = a0 + (a1 - a0) * j / na, q = pt(F, rf(F.t, a), a); pos.push(q.x, q.y, q.z); }
    for (let i = 0; i < n; i++) for (let j = 0; j < na; j++) { const a = i * (na + 1) + j, b = a + 1, c = a + na + 1, d = c + 1; inv ? idx.push(a, b, c, b, d, c) : idx.push(a, c, b, b, c, d); }
    return malla(R, pos, idx, m, g);
  };
  sup(ro, true, mat); if (ri) sup(ri, false, op.matI || mat);
  const anillo = (F, inv, m) => {
    const pos = [], idx = [];
    for (let j = 0; j <= na; j++) { const a = a0 + (a1 - a0) * j / na, q = pt(F, ro(F.t, a), a), w = pt(F, ri ? ri(F.t, a) : 0, a); pos.push(q.x, q.y, q.z, w.x, w.y, w.z); }
    for (let j = 0; j < na; j++) { const o0 = 2 * j, i0 = o0 + 1, o1 = o0 + 2, i1 = o0 + 3; inv ? idx.push(o0, i0, o1, o1, i0, i1) : idx.push(o0, o1, i0, o1, i1, i0); }
    return malla(R, pos, idx, m, g, true);
  };
  if (op.tapas !== false) { anillo(fr[0], false, op.matT || mat); anillo(fr[n], true, op.matT || mat); }
  if (!full) for (const [a, fin] of [[a0, false], [a1, true]]) {
    const pos = [], idx = [];
    for (const F of fr) { const q = pt(F, ro(F.t, a), a), w = pt(F, ri ? ri(F.t, a) : 0, a); pos.push(w.x, w.y, w.z, q.x, q.y, q.z); }
    for (let i = 0; i < n; i++) { const i0 = 2 * i, o0 = i0 + 1, i1 = i0 + 2, o1 = i0 + 3; fin ? idx.push(i0, i1, o0, o0, i1, o1) : idx.push(i0, o0, i1, o0, o1, i1); }
    malla(R, pos, idx, op.matC || mat, g, true);
  }
  return g;
}
export const recta = (p0, p1) => (t) => [p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t, p0[2] + (p1[2] - p0[2]) * t];
/** arco en el plano (u, v) alrededor de c: t en grados */
export const arco = (c, Rm, u, v) => (t) => { const a = rad(t); return [0, 1, 2].map(k => c[k] + Rm * (Math.cos(a) * u[k] + Math.sin(a) * v[k])); };

/** caja con agujeros cilíndricos y corte por CSG (cajas sueltas) */
export function cajaC(R, b, mat, op = {}) { return R.caja(b[0], b[1], b[2], b[3], b[4], b[5], mat, { r: op.r ?? .6, padre: op.padre }); }

/** bolsa de papel acostada (almohadón): centro c, largo L (x), ancho A (y), alto H (z). Con costuras y válvula. op.mat */
export function bolsa(R, c, L, A, H, mat, op = {}) {
  const T = R.THREE, g = R.grupo(op.padre);
  const geo = new T.BoxGeometry(L, A, H, 40, 28, 8); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i) / (L / 2), y = p.getY(i) / (A / 2), z = p.getZ(i) / (H / 2);
    const fx = 1 - Math.pow(Math.abs(x), 6), fy = 1 - Math.pow(Math.abs(y), 6);
    // panza: arriba y a los costados; las puntas (fuelles) se afinan
    const zz = z * (0.35 + 0.65 * Math.sqrt(Math.max(0, fx * fy)));
    const xx = x * (1 + .02 * fy), yy = y * (1 + .05 * fx * (1 - z * z));
    p.setXYZ(i, xx * L / 2 + c[0], yy * A / 2 + c[1], (zz + (op.caida || .0) * (1 - fx)) * H / 2 + c[2] + H / 2);
  }
  geo.deleteAttribute('uv'); geo.computeVertexNormals();
  const m = new T.Mesh(geo, mat); m.castShadow = m.receiveShadow = true; g.add(m); R.sinBorde(m);
  return g;
}

/** montón cónico de árido: cono (radio Rb, alto H) con la superficie del material; op.piedras = {n, d0, d1, cols} piedras de verdad (instancias) */
export function monton(R, c, Rb, H, mat, op = {}) {
  const T = R.THREE, g = R.grupo(op.padre);
  const pf = []; const n = 24;
  for (let i = 0; i <= n; i++) { const s = i / n; const r = Rb * (1 - s); const z = H * (1 - Math.pow(1 - s, 1.0)) * (1 - .12 * Math.sin(Math.PI * s)); pf.push([r, z]); }
  pf.push([0, H]);
  const m = R.torno([c[0], c[1], c[2]], [c[0], c[1], c[2] + 1], pf, mat, { seg: 96, padre: g }); R.sinBorde(m);
  // la superficie del cono se ondula un poco (no es un cono de torno perfecto)
  const pos = m.geometry.attributes.position; const W = new T.Vector3();
  m.updateMatrixWorld(true);
  for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i); const r = Math.hypot(x, y); if (r < 1) continue; const a = Math.atan2(y, x);
    const k = 1 + .045 * Math.sin(3 * a + z * .01) + .03 * Math.sin(7 * a + 1.3); pos.setXYZ(i, x * k, y * k, z); }
  m.geometry.computeVertexNormals();
  if (op.piedras) {
    const P = op.piedras, rng = rnd(P.semilla || 7);
    const base = new T.IcosahedronGeometry(1, 0); base.deleteAttribute('uv');
    const cols = P.cols.map(h => new T.Color(h));
    const im = new T.InstancedMesh(base, op.matP, P.n); const M4 = new T.Matrix4(), Q = new T.Quaternion(), S = new T.Vector3(), Pp = new T.Vector3();
    for (let i = 0; i < P.n; i++) {
      const s = Math.sqrt(rng()), a = rng() * TAU; const r = Rb * (1 - s) * .99; const zf = H * (1 - Math.pow(1 - s, 1.0)) * (1 - .12 * Math.sin(Math.PI * s));
      const k = 1 + .045 * Math.sin(3 * a + zf * .01) + .03 * Math.sin(7 * a + 1.3);
      const d = P.d0 + (P.d1 - P.d0) * Math.pow(rng(), 1.6);
      Pp.set(c[0] + r * k * Math.cos(a), c[1] + r * k * Math.sin(a), c[2] + zf + d * .15);
      Q.setFromEuler(new T.Euler(rng() * 6, rng() * 6, rng() * 6)); S.set(d / 2 * (.8 + .5 * rng()), d / 2 * (.65 + .4 * rng()), d / 2 * (.5 + .4 * rng()));
      M4.compose(Pp, Q, S); im.setMatrixAt(i, M4); im.setColorAt(i, cols[Math.floor(rng() * cols.length)].clone().multiplyScalar(.8 + .4 * rng()));
    }
    im.castShadow = im.receiveShadow = true; im.userData.noEncuadre = true; R.sinBorde(im); g.add(im);
  }
  return g;
}

/** generador pseudoaleatorio con semilla */
export function rnd(s) { let x = s * 9301 + 49297; return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; }; }

/** piedras sueltas (instancias) en una caja o sobre un plano */
export function piedras(R, n, caja, d0, d1, cols, mat, op = {}) {
  const T = R.THREE, rng = rnd(op.semilla || 3), base = new T.IcosahedronGeometry(1, op.det ?? 0); base.deleteAttribute('uv');
  const im = new T.InstancedMesh(base, mat, n), M4 = new T.Matrix4(), Q = new T.Quaternion(), S = new T.Vector3(), P = new T.Vector3(), cc = cols.map(h => new T.Color(h));
  for (let i = 0; i < n; i++) {
    const d = d0 + (d1 - d0) * Math.pow(rng(), op.pot || 1.4);
    P.set(caja[0] + (caja[1] - caja[0]) * rng(), caja[2] + (caja[3] - caja[2]) * rng(), caja[4] + (caja[5] - caja[4]) * rng());
    Q.setFromEuler(new T.Euler(rng() * 6, rng() * 6, rng() * 6)); S.set(d / 2 * (.8 + .4 * rng()), d / 2 * (.6 + .4 * rng()), d / 2 * (.5 + .35 * rng()));
    M4.compose(P, Q, S); im.setMatrixAt(i, M4); im.setColorAt(i, cc[Math.floor(rng() * cc.length)].clone().multiplyScalar(.85 + .3 * rng()));
  }
  im.castShadow = im.receiveShadow = true; if (op.noEncuadre !== false) im.userData.noEncuadre = true; R.sinBorde(im); (op.padre || R.raiz).add(im); return im;
}

/** barra de acero conformada (nervada) de p0 a p1: núcleo, 2 nervios longitudinales y nervios transversales inclinados (instancias) */
export function nervada(R, p0, p1, d, mat, op = {}) {
  const T = R.THREE, g = R.grupo(op.padre), A = V(T, p0), B = V(T, p1), L = A.distanceTo(B), w = B.clone().sub(A).normalize();
  let u = V(T, op.up || [0, 0, 1]); u.addScaledVector(w, -u.dot(w)); if (u.lengthSq() < 1e-6) u = new T.Vector3(1, 0, 0).addScaledVector(w, -w.x); u.normalize();
  const v = new T.Vector3().crossVectors(w, u), r = d / 2, hn = op.h ?? Math.max(.25, d * .065), paso = op.paso ?? d * .66;
  R.cil(A.toArray(), B.toArray(), r, mat, { seg: 28, padre: g });
  for (const s of [1, -1]) {   // nervios longitudinales
    const o = u.clone().multiplyScalar(s * r * .97);
    R.cil(A.clone().add(o).toArray(), B.clone().add(o).toArray(), hn * .9, mat, { seg: 8, padre: g });
  }
  // nervios transversales: medio anillo inclinado (toro de arco 150°) de cada lado, alternando la inclinación (tipo ADN)
  const tor = new T.TorusGeometry(r, hn, 6, 18, rad(150)); tor.deleteAttribute('uv');
  const n = Math.floor((L - paso) / paso), im = new T.InstancedMesh(tor, mat, 2 * n), M4 = new T.Matrix4(), Q = new T.Quaternion(), S = new T.Vector3(1, 1, 1);
  const base = new T.Matrix4().makeBasis(u, v, w);
  for (let i = 0; i < n; i++) for (const s of [0, 1]) {
    const P = A.clone().addScaledVector(w, paso * (i + .8) + s * paso * .5);
    const rotLado = new T.Matrix4().makeRotationZ(s ? rad(105) : rad(-75));            // cada lado entre los dos nervios longitudinales
    const incl = new T.Matrix4().makeRotationX(rad(op.incl ?? 14) * (s ? -1 : 1));
    M4.copy(base).multiply(incl).multiply(rotLado); Q.setFromRotationMatrix(M4); M4.compose(P, Q, S); im.setMatrixAt(2 * i + s, M4);
  }
  im.castShadow = im.receiveShadow = true; R.sinBorde(im); g.add(im); return g;
}

/** perfil extruido «cortado»: extruye la mitad (ancho) y tapa la cara del corte con matC (para ver la sección de la pieza) */
export function perfilCortado(R, cont, cav, ancho, mat, matC, op = {}) {
  const T = R.THREE, g = R.grupo(op.padre);
  const m = R.perfil(cont, cav, ancho, mat, { ...op, padre: g });
  const mp = R.restar(cont, cav || []);
  for (const poly of mp) {
    const o = poly[0].slice(0, -1); const s = new T.Shape(o.map(p => new T.Vector2(p[0], p[1])));
    for (const h of poly.slice(1)) s.holes.push(new T.Path(h.slice(0, -1).map(p => new T.Vector2(p[0], p[1]))));
    const sg = new T.ShapeGeometry(s, 16); sg.deleteAttribute('uv');
    const A = V(T, op.A || [1, 0, 0]), B = V(T, op.B || [0, 1, 0]), C = V(T, op.C || [0, 0, 1]);
    const bm = new T.Matrix4().makeBasis(B, C, A); sg.applyMatrix4(bm);
    const O = V(T, op.o || [0, 0, 0]).addScaledVector(A, (op.a0 || 0) - .02); sg.translate(O.x, O.y, O.z);
    const mm = new T.Mesh(sg, matC); mm.material.side = T.DoubleSide; R.sinBorde(mm); g.add(mm);
  }
  return g;
}

/** varilla roscada (rosca helicoidal real, revol de pat.mjs) */
export function varillaRosca(R, p0, dir, L, d, paso, mat, matC, op = {}) {
  const f = rosca(d / 2, paso, 60);
  return revol(R, { p0, dir, L, ro: (th, z) => f(th, z), mat, matC, padre: op.padre, a0: op.a0, a1: op.a1, ref: op.ref, nt: 72, dz: paso / 8 });
}
export { revol, tuerca, arandelaP, rosca };
