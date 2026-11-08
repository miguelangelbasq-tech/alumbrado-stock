/* MAT-ARIDOS_HORMIGON-1 · granos a tamaño real sobre una regla: arena (hasta 4,75) y piedra partida (6–20) */
import { ARIDO } from '../piezas/perfiles_civil.mjs';
import { matsC, piedras, rnd } from '../piezas/civil_util.mjs';
export default function (R) {
  R.vista({ az: -10, el: 48, fov: 14, margen: .04 });
  R.config({ bordeOp: .2, exposicion: 1.0 });
  const M = matsC(R), T = R.THREE;
  // tablita de fondo y regla
  R.caja(-10, 250, -40, 80, -4, 0, R.M.pa('#e9e6dc', { roughness: .9 }), { r: .5 });
  R.caja(0, 240, -34, -16, 0, 1.2, R.M.pa('#f2d13a', { roughness: .5 }), { r: .3 });
  for (let k = 0; k <= 230; k++) { const L = k % 10 === 0 ? 9 : k % 5 === 0 ? 6 : 3.5; R.caja(5 + k - .12, 5 + k + .12, -16 - L, -16, 1.2, 1.32, R.M.tinta('#111')); }
  for (let k = 0; k <= 230; k += 10) R.texto(String(k / 10), [5 + k, -29, 1.25], [1, 0, 0], [0, 1, 0], R.M.tinta('#111'), { size: 2.6, prof: .05 });
  R.texto('cm', [228, -33, 1.25], [1, 0, 0], [0, 1, 0], R.M.tinta('#111'), { size: 2.4, prof: .05 });
  const mp = new T.MeshStandardMaterial({ color: '#ffffff', roughness: .7 });
  // arena: 0,075 a 4,75 (más chicos que grandes)
  piedras(R, 2600, [12, 92, 5, 60, .3, 1.2], .15, 4.75, ['#e6d3a0', '#b89a62', '#8a7a5c', '#d7c08c', '#6e655a', '#f0e4c4'], mp, { semilla: 5, pot: 3.2, det: 1, noEncuadre: false });
  // piedra partida 6–20 (angulosa)
  piedras(R, 34, [120, 238, 5, 62, 3, 7], 6, 20, ['#8c8f93', '#a9a49a', '#6f7277', '#b9b6ae', '#9b9ea2'], mp, { semilla: 11, pot: 1.0, det: 0, noEncuadre: false });
  R.ancla('arena', [50, 30, 2]); R.ancla('piedra', [180, 30, 9]); R.ancla('regla', [120, -25, 1.3]);
}
