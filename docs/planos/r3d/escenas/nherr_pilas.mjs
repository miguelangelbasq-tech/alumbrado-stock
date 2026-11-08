/* MAT-HERRAMIENTAS-11 · pilas AAA LR03 (9004), una cortada a lo largo (vaso, cátodo, separador, ánodo, colector) y electrodos E6013 Ø2,5 (1036),
 * uno cortado (alma de acero + revestimiento). Se encuadran las puntas de los electrodos y las pilas. */
import { VARIOS } from '../piezas/perfiles_nherr.mjs';
import { pila3d, electrodo3d, lugar, W } from '../piezas/nherr_util.mjs';
export default function (R) {
  R.vista({ az: -28, el: 36, fov: 15, margen: .04 });
  R.config({ bordeOp: .2 });
  const T = R.THREE, V = VARIOS, P = V.aaa, E = V.electrodo;
  const pc = pila3d(R, P, { corte: true }); lugar(pc, [10, -37.5, P.D / 2], 0, 0, 90);
  [0, 1, 2].forEach(i => { const p = pila3d(R, P); lugar(p, [10, -i * 12.5, P.D / 2], 0, 0, 90); });
  const ec = electrodo3d(R, E, { corte: [E.L - 70, E.L - 28], marca: 'E6013  Ø2,5' }); lugar(ec, [-E.L + 0, 34, E.Drev / 2]);
  [1, 2].forEach(i => { const e = electrodo3d(R, E); lugar(e, [-E.L - i * 6, 34 + i * 6, E.Drev / 2]); });
  R.raiz.traverse(o => { if (o.isMesh) o.userData.noEncuadre = true; });
  const m = R.caja(-75, 60, -46, 44, 0, 12, new T.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }), { r: 0 }); m.castShadow = false; R.sinBorde(m);
  R.config({ piso: 0, sombra: false });
  const L = P.L - P.nub.h;
  R.ancla('p_etq', W(R, pc, [0, -P.D / 2, 30])); R.ancla('p_vaso', W(R, pc, [P.D / 2 - .1, -.3, 12]));
  R.ancla('p_catodo', W(R, pc, [4, -.3, 18])); R.ancla('p_anodo', W(R, pc, [1.6, -.3, 24])); R.ancla('p_pin', W(R, pc, [.3, -.3, 32]));
  R.ancla('p_mas', W(R, pc, [0, 0, L + 1.2])); R.ancla('p_menos', W(R, pc, [0, -P.D / 2 + 1, 0]));
  R.ancla('e_rev', W(R, ec, [E.L - 80, 0, E.Drev / 2])); R.ancla('e_alma', W(R, ec, [E.L - 50, -.4, E.d / 2 * .7])); R.ancla('e_punta', W(R, ec, [E.L - 10, 0, E.d / 2]));
  R.ancla('e_rev_c', W(R, ec, [E.L - 40, -1.6, -.3]));
}
