/* MAT-CAÑOS-4 · curva 90° H°G° Ø3/4" (5503): caño 26,9 × 2,65 curvado (R y patas AC) con rosca BSP cónica ISO 7-1 R 3/4 (14 hilos, 55°)
 * en las dos puntas; la pata horizontal abierta a cuarto para ver la rosca en corte y el cable de la acometida adentro (cable AC) */
import { CURVA34 } from '../piezas/perfiles_nfin.mjs';
import { matsP, canoRoscado, barrido } from '../piezas/pat.mjs';
export default function (R) {
  R.vista({ az: -35, el: 18, fov: 14, margen: .06 });
  R.config({ bordeOp: .3 });
  const M = matsP(R), C = CURVA34, ro = C.De / 2, ri = ro - C.e, Rb = C.R, P = C.pata;
  const c = { De: C.De, e: C.e, paso: C.paso, ang: C.ang };
  // pata vertical (rosca abajo)
  canoRoscado(R, [0, 0, 0], [0, 0, -1], c, P, C.Lutil, M.galv, M.galvC, {});
  // curva: arco de radio Rb en el plano x-z, de (0,0,0) a (Rb,0,Rb)
  const f = (t) => { const a = Math.PI - t * Math.PI / 2; return [Rb + Rb * Math.cos(a), 0, Rb * Math.sin(a)]; };
  barrido(R, f, 0, 1, ro, M.galv, { n: 80, na: 48, up: [0, 1, 0] });
  const mi = M.galv.clone(); mi.side = R.THREE.BackSide; barrido(R, f, 0, 1, ri, mi, { n: 80, na: 48, up: [0, 1, 0] });
  // pata horizontal abierta a cuarto (rosca a la derecha)
  canoRoscado(R, [Rb, 0, Rb], [1, 0, 0], c, P, C.Lutil, M.galv, M.galvC, { a0: 0, a1: 270, ref: [0, -1, 0] });
  // cable de la acometida (Ø12 AC) que entra por la pata horizontal y sale por abajo
  const cab = R.tipoCorte(R.M.cable('#1d1e20'), 'plastico');
  const fc = (t) => { if (t < .3) return [Rb + P + 40 - (P + 40) * t / .3, 0, Rb - ri + 6.2]; if (t < .7) { const u = (t - .3) / .4, a = Math.PI / 2 + u * Math.PI / 2; const rr = Rb - ri + 6.2; return [Rb + rr * Math.cos(a), 0, rr * Math.sin(a)]; }
    const u = (t - .7) / .3; return [ri - 6.2, 0, -u * (P + 60)]; };
  barrido(R, fc, 0, 1, 6, cab, { n: 160, na: 24, up: [0, 1, 0], tapas: true, matTapa: R.M.pa('#3a3b3e') });
  R.ancla('curva', f(.5).map((v, i) => v + (i === 1 ? -ro : 0)));
  R.ancla('roscaV', [0, -ro, -P + C.Lutil / 2]); R.ancla('roscaH', [Rb + P - C.Lutil / 2, -ro + .5, Rb]); R.ancla('pared', [Rb + P * .45, -.3, Rb + ri + C.e / 2]);
  R.ancla('cable', [Rb + P + 30, 0, Rb - ri + 12]); R.ancla('patV', [-ro, 0, -P * .45]); R.ancla('patH', [Rb + P * .3, -ro * .7, Rb + ro * .7]);
  R.ancla('cableB', [ri - 6.2, -6, -P - 40]);
}
