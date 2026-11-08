/* MAT-CAÑOS-2 · corrugado 3/4" (*) cortado a cuarto y grampa 5015 sujetando un caño Ø50 contra una pared con tornillo y fisher */
import { CORR, GRAMPA, PEAD } from '../piezas/perfiles_civil.mjs';
import { matsC, revol, cte } from '../piezas/civil_util.mjs';
export default function (R) {
  R.vista({ az: -34, el: 22, fov: 15, margen: .05 });
  R.config({ bordeOp: .3 });
  const M = matsC(R), c = CORR; const yb0 = 0;
  // corrugado a lo largo de x, cortado a cuarto
  const fo = (th, z) => c.De / 2 - c.cresta * (.5 - .5 * Math.cos(z / c.paso * Math.PI * 2));
  const fi = (th, z) => fo(th, z) - .55;
  revol(R, { p0: [10, -70, c.De / 2], dir: [1, 0, 0], L: 230, ro: fo, ri: fi, a0: 90, a1: 360, mat: M.corrugado, matC: R.M.pa('#fff3a0', { roughness: .6 }), nt: 120, dz: .35 });
  R.ancla('cresta', [120, -70 - c.De / 2 * .7, c.De / 2 + c.De / 2 * .7]); R.ancla('paso', [60, -70 + .1, c.De - .3]); R.ancla('interior', [200, -70 + .1, c.De / 2 - c.Di / 2 + .2]);
  // pared de hormigón (plano x-z en y = 60) y la grampa omega con el caño
  const yw = 80, G = GRAMPA, D = PEAD.D, r = D / 2, rc = r + G.chapa / 2, xg = 120, zc = 120;
  R.caja(20, 230, yw, yw + 50, 20, 230, M.hormExt, { r: 1 });
  // caño Ø50 (PEAD) a lo largo de z sobre la pared
  revol(R, { p0: [xg, yw - r, 0], dir: [0, 0, 1], L: 250, ro: cte(r), ri: cte(r - 3), mat: M.pead, matC: M.peadCorte, nt: 96, dz: 130 });
  // perfil de la grampa (en el plano x-y, extruido en z): media vuelta + dos alas apoyadas en la pared
  const n = 40, t = G.chapa, poly = [], yb = yw - r;
  // contorno exterior: ala der → arco exterior → ala izq ; interior al revés
    const Ro = rc + t / 2, Ri = rc - t / 2;
  poly.push([xg + Ro + G.ala, yw], [xg + Ro + G.ala, yw - t], [xg + Ro, yw - t]);
  for (let i = 0; i <= n; i++) { const a = Math.PI * i / n; poly.push([xg + Ro * Math.cos(a), yb - Ro * Math.sin(a)]); }
  poly.push([xg - Ro, yw - t], [xg - Ro - G.ala, yw - t], [xg - Ro - G.ala, yw], [xg - Ri, yw]);
  for (let i = n; i >= 0; i--) { const a = Math.PI * i / n; poly.push([xg + Ri * Math.cos(a), yb - Ri * Math.sin(a)]); }
  poly.push([xg + Ri, yw]);
  const gr = R.perfil(poly, [], G.ancho, M.galv, { A: [0, 0, 1], B: [1, 0, 0], C: [0, 1, 0], o: [0, 0, zc - G.ancho / 2], bevel: .2 });
  // tornillos (cabeza) en las alas
  for (const s of [-1, 1]) R.tornillo([xg + s * (rc + G.ala / 2 + 1), yw - t, zc], [0, -1, 0], { M: 4.5, L: 0, dk: 9, k: 3, tipo: 'pozi', mat: M.zinc });
  R.ancla('grampa', [xg - (rc + t / 2) * .7, yb - (rc + t / 2) * .7, zc - G.ancho / 2]); R.ancla('ala', [xg - rc - G.ala * .8, yw - t, zc + G.ancho / 2 - 2]);
  R.ancla('tornillo', [xg + rc + G.ala / 2 + 1, yw - t - 3, zc]); R.ancla('cano', [xg - r * .7, yb - r * .7, 230]); R.ancla("pared", [200, yw, 200]);
}
