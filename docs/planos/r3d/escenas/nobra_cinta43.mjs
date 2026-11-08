/* MAT-FIJACION-2 (grupo «nobra») · cinta autosoldable Scotch 43+ 19 mm × 5 m (4041): el rollo (Ø calculado con el espesor de referencia)
 * y un empalme de cable 6 mm² con unión de compresión, encintado con 50 % de solape y estirado: 4 capas que se funden.
 * Se deja ABIERTO UN CUARTO del encintado para ver las capas, la unión y la cuerda. La tira sale del empalme hacia el rollo.
 * Medidas: CINTA43 (AC), UNION (perfiles_conex). */
import { CINTA43 as C } from '../piezas/perfiles_nobra.mjs';
import { rolloCinta } from '../piezas/nobra_util.mjs';
import { tuboB, recta } from '../piezas/civil_util.mjs';
import { unionComp, aislacion, cuerda } from '../piezas/conex.mjs';
import { UNION, COLOR } from '../piezas/perfiles_conex.mjs';
export default function (R) {
  R.vista({ az: -24, el: 22, fov: 12, margen: .05 });
  const T = R.THREE, goma = R.M.pa('#1c1d1f', { roughness: .55, clearcoat: .35 });
  const tonos = ['#3a3d42', '#2b2d31', '#3a3d42', '#2b2d31'].map(c => R.M.pa(c, { roughness: .8 }));
  const rA = 2.6, L = UNION.L, x0 = 0, y0 = 0, z0 = 30, rU = UNION.De / 2;
  aislacion(R, -75, x0 - 8, y0, z0, rA, COLOR.L3); aislacion(R, x0 + L + 8, x0 + L + 75, y0, z0, rA, COLOR.L3);
  cuerda(R, x0 - 8.2, x0 + 13, y0, z0, 7, 1.04, 1.6); cuerda(R, x0 + L - 13, x0 + L + 8.2, y0, z0, 7, 1.04, 1.6);
  unionComp(R, x0, y0, z0, { crimp: true });
  // capas: espesor estirado ≈ e · 0,8 (AC); cada capa termina 5 mm antes que la de abajo (escalón en las puntas)
  const e = C.e * .8, n = 4, xa = x0 - 33, xb = x0 + L + 33;
  const base = (x) => { const d = Math.min(x - (x0 - 8), (x0 + L + 8) - x); if (d >= 8) return rU + .05; if (d <= 0) return rA + .05; return rA + .05 + (rU - rA) * d / 8; };
  for (let k = 0; k < n; k++) {
    const a = xa + k * 5, b = xb - k * 5;
    const rin = (t) => base(t) + k * e, rout = (t) => base(t) + (k + 1) * e;
    tuboB(R, (t) => [t, y0, z0], a, b, (t) => rout(t), (t) => rin(t), goma, { a0: 90, a1: 360, n: 120, na: 72, matC: tonos[k], matT: tonos[k] });
  }
  // costura helicoidal de la última vuelta (paso = ancho estirado × (1 − solape))
  const paso = C.w * C.estira * (1 - C.solape), ro = (x) => base(x) + n * e + .03;
  const hel = new (class extends T.Curve { getPoint(t, o = new T.Vector3()) { const x = xa + 16 + (xb - xa - 32) * t, a = (x - xa) / paso * 2 * Math.PI;
    let ang = ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); if (ang < Math.PI / 2) ang = Math.PI / 2;      // no entra en el cuarto abierto
    return o.set(x, y0 - ro(x) * Math.sin(ang), z0 + ro(x) * Math.cos(ang)); } })();
  const mh = new T.Mesh(new T.TubeGeometry(hel, 1600, .2, 6, false), R.M.pa('#0a0a0b', { roughness: .4 })); R.sinBorde(mh); R.raiz.add(mh);
  // tira que sale de arriba del empalme (ancho a lo largo del cable) hacia abajo del rollo; rollo con eje x, atrás y arriba
  const xs = xb - 12, rr = ro(xs), pR = [xs, 58, z0 + 52], Rr = C.De / 2;
  const cur = new T.CatmullRomCurve3([new T.Vector3(0, -2, rr), new T.Vector3(0, 6, rr + 2), new T.Vector3(0, 24, rr + 12), new T.Vector3(0, pR[1] - 14, pR[2] - z0 - Rr + 1), new T.Vector3(0, pR[1], pR[2] - z0 - Rr)]);
  const pts = cur.getPoints(60).map(p => [p.y, p.z + z0]);
  const tira = [...pts.map(([y, z]) => [y, z]), ...pts.slice().reverse().map(([y, z]) => [y + .5, z + .7])];
  R.perfil(tira, [], C.w * C.estira, goma, { A: [1, 0, 0], B: [0, 1, 0], C: [0, 0, 1], o: [xs - C.w * C.estira / 2, 0, 0], bevel: 0 });
  rolloCinta(R, [pR[0], pR[1], pR[2]], C.w, C.Di, C.De, goma, {});
  // el rolloCinta pone el eje según y: lo giro a x
  const ult = R.raiz.children[R.raiz.children.length - 1]; ult.position.set(0, 0, 0);
  ult.traverse(o => { if (o.isMesh) { o.position.sub(new T.Vector3(...pR)); } });
  ult.rotation.z = Math.PI / 2; ult.position.set(...pR);
  R.impreso(['Scotch 43+', '19 mm x 5 m'], 26, 10, [pR[0] - C.w / 2 - .05, pR[1], pR[2] + 30], [0, -1, 0], [0, 0, 1], { color: '#d8dadc', ppm: 30 });
  R.ancla('rollo', [pR[0] - C.w / 2, pR[1] - Rr * .7, pR[2] + Rr * .5]); R.ancla('nucleo', [pR[0] - C.w / 2 - .3, pR[1], pR[2] - C.Di / 2 - 1]);
  R.ancla('tira', [xs, 22, z0 + rr + 11]); R.ancla('capas', [x0 + L / 2, y0 - (rU + 2 * e) * .7, z0 + (rU + 2 * e) * .7]); R.ancla('union', [x0 + 22, y0 - rU * .6, z0 + rU * .8]);
  R.ancla('cuerda', [x0 - 5, y0 - .8, z0 + 1]); R.ancla('cable', [-60, y0 - rA, z0]); R.ancla('costura', [x0 + 70, y0 - ro(x0 + 70) * .3, z0 - ro(x0 + 70) * .95]); R.ancla('puntaE', [xa + 2, y0 - rA, z0 + .5]);
}
