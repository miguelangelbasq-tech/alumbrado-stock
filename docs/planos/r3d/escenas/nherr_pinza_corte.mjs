/* MAT-HERRAMIENTAS-1 · detalle: mango de la pinza universal (9005) cortado a cuarto, escalonado: acero del brazo,
 * capa dura (1.ª componente) y capa blanda (2.ª componente). Se encuadra solo el tramo cortado. */
import { P9005 as P } from '../piezas/perfiles_nherr.mjs';
import { pinza3d, Pbrazo, matsH } from '../piezas/nherr_util.mjs';
export default function (R) {
  R.vista({ az: -38, el: 34, fov: 13, margen: .03 });
  R.config({ bordeOp: .3, piso: -P.ais.tGrip / 2, exposicion: .98 });
  const T = R.THREE;
  const u = pinza3d(R, P, { abre: 0, corte: [P.L - 66, P.L + 2], sello: true });
  u.g.traverse(o => { if (o.isMesh) o.userData.noEncuadre = true; });
  // caja invisible que fija el encuadre (tramo cortado)
  const pts = [];
  for (const x of [P.L - 82, P.L + 3]) for (const dy of [-16, 12]) for (const z of [-10, 10]) pts.push(Pbrazo(R, u, 1, [x, P.centro(x) + dy, z]));
  const bb = new T.Box3().setFromPoints(pts.map(p => new T.Vector3(...p)));
  const m = R.caja(bb.min.x, bb.max.x, bb.min.y, bb.max.y, bb.min.z, bb.max.z, new T.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }), { r: 0 });
  m.castShadow = false; m.receiveShadow = false; R.sinBorde(m);
  const xc = P.L - 30, c = P.centro(xc), hc = P.hcAA;
  R.ancla('acero', Pbrazo(R, u, 1, [xc + 8, c - hc * .4, 0]));
  R.ancla('capa1', Pbrazo(R, u, 1, [xc + 6, c - hc - P.ais.base * .5 - 1.4, -.6]));
  R.ancla('capa2', Pbrazo(R, u, 1, [xc + 4, c - hc - P.ais.base - (P.ais.grip[2] - P.ais.base) * .5 - 2.8, -2]));
  R.ancla('acero_s', Pbrazo(R, u, 1, [xc + 10, c + 1, P.tAcero / 2]));
  R.ancla('grip', Pbrazo(R, u, 1, [P.L - 80, c + 6, P.ais.tGrip / 2]));
  R.ancla('base_fin', Pbrazo(R, u, 1, [P.L - 3, c + 2, P.ais.tBase / 2]));
}
