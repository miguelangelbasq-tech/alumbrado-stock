/* MAT-EMPALMES-1 · WAGO 221-2411 con dos cables flexibles de 2,5 mm²: a la izquierda cerrado, a la derecha la palanca abierta y el cable entrando */
import { wago, cuerda, aislacion } from '../piezas/conex.mjs';
import { WAGO, CABLE, COLOR } from '../piezas/perfiles_conex.mjs';
export default function (R) {
  R.vista({ az: -36, el: 28, fov: 12, margen: .04 });
  const L = WAGO.L, zc = 3.4, ra = CABLE.uni[2.5] / 2, [n, d] = CABLE.hilosFlex[2.5];
  wago(R, 0, 0, 0, { abierta: true });
  cuerda(R, -.2, WAGO.pelar - .5, 0, zc, n, d, .86, { torsion: 1 / 22 });
  aislacion(R, -28, -.2, 0, zc, ra, COLOR.L1, {});
  cuerda(R, -28.2, -27.6, 0, zc, n, d, .86, {});
  // derecho: entrando (todavía 4 mm afuera)
  cuerda(R, L - WAGO.pelar + 4, L + 4.2, 0, zc, n, d, .86, { torsion: 1 / 22 });
  aislacion(R, L + 4.2, L + 30, 0, zc, ra, COLOR.N, {});
  R.ancla('cuerpo', [L * .42, -WAGO.A / 2, WAGO.H * .55]);
  R.ancla('palanca', [5, -2, WAGO.H + 1.1]);
  R.ancla('palancaA', [L - 6, 0, WAGO.H + 6]);
  R.ancla('resorte', [L / 4 - 1.5, -1.8, 6.9]);
  R.ancla('barra', [L / 2, -2.2, 1.6]);
  R.ancla('cableI', [-14, 0, zc + ra]);
  R.ancla('cableD', [L + 16, 0, zc + ra]);
  R.ancla('pelado', [L + 1.5, 0, zc + .9]);
  R.ancla('boca', [0, -2.2, zc + 1.2]);
}
