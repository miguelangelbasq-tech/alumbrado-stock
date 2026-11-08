/* MAT-JABALINA-1 · VARIANTE seccional: tramos con rosca 5/8" UNC laminada, manguito de bronce cortado a cuarto (rosca real) y bulón de hinca */
import { JAB } from '../piezas/perfiles_pat.mjs';
import { matsP, revol, rosca } from '../piezas/pat.mjs';
export default function (R) {
  R.vista({ az: 14, el: 14, fov: 13, margen: .04 });
  R.config({ bordeOp: .35 });
  const M = matsP(R), r = JAB.j58.D / 2, cu = JAB.cu, Rr = JAB.rosca, Mg = JAB.manguito, B = JAB.bulonHinca;
  const cte = (k) => () => k, ref = [1, 0, 0];
  const fr = rosca(Rr.d / 2, Rr.paso, 60);
  // tramo inferior: cuerpo hasta z = 0 y espiga roscada de 0 a Rr.L (dentro de la mitad baja del manguito)
  const tramo = (z0, Lb, sube, corte) => {
    const o = corte ? { a0: 0, a1: 270 } : {};
    revol(R, { p0: [0, 0, z0], dir: [0, 0, sube ? 1 : -1], L: Lb, ro: cte(r), ri: cte(r - cu), noRi: true, mat: M.cobre, matC: M.cobreC, nt: 96, dz: Lb / 3, ref, ...o });
    revol(R, { p0: [0, 0, z0], dir: [0, 0, sube ? -1 : 1], L: Rr.L, ro: (th, z) => { const v = fr(th, z); const zz = Rr.L - z; return zz < 2 ? Math.min(v, Rr.d / 2 - 2 + zz * .9) : v; }, mat: M.cobre, matC: M.cobreC, nt: 96, dz: Rr.paso / 10, ref, tapa0: false, ...o });
  };
  const fi = rosca(Mg.Di / 2, Rr.paso, 60, false);
  const manguito = (zc) => revol(R, { p0: [0, 0, zc - Mg.L / 2], dir: [0, 0, 1], L: Mg.L, ro: (th, z) => (z < 1.5 || z > Mg.L - 1.5) ? Mg.De / 2 - 1 : Mg.De / 2, ri: (th, z) => fi(th, z), a0: 0, a1: 270, mat: M.bronce, matC: M.bronceC, nt: 120, dz: Rr.paso / 10, ref });
  const zm = 0;
  tramo(zm - Rr.L - 1, 90, false, false);          // tramo de abajo: rosca de −31 a −1 (mitad baja del manguito)
  manguito(zm);
  const zs = zm + Mg.L / 2 + 36;                     // tramo de arriba explotado: rosca abajo (zs − 30 … zs)
  tramo(zs, 80, true, false);
  // rosca de arriba del tramo superior y segundo manguito con el bulón de hinca
  const zt = zs + 80;
  revol(R, { p0: [0, 0, zt], dir: [0, 0, 1], L: Rr.L, ro: (th, z) => { const v = fr(th, z); const zz = Rr.L - z; return zz < 2 ? Math.min(v, Rr.d / 2 - 2 + zz * .9) : v; }, mat: M.cobre, matC: M.cobreC, nt: 96, dz: Rr.paso / 10, ref, tapa0: false });
  const zm2 = zt + Mg.L / 2 - 1; manguito(zm2);
  const zb = zm2 + Mg.L / 2 + 34;
  revol(R, { p0: [0, 0, zb], dir: [0, 0, 1], L: B.k, ro: (th, z) => z > B.k - 2 ? B.Dc / 2 - (z - B.k + 2) : B.Dc / 2, mat: M.templado, matC: M.templadoC, nt: 96, dz: 2, ref });
  revol(R, { p0: [0, 0, zb], dir: [0, 0, -1], L: B.Lr, ro: (th, z) => { const v = fr(th, z); const zz = B.Lr - z; return zz < 2 ? Math.min(v, Rr.d / 2 - 2 + zz * .9) : v; }, mat: M.templado, matC: M.templadoC, nt: 96, dz: Rr.paso / 10, ref, tapa0: false });
  R.ancla('manguito', [-Mg.De / 2 * .7, -Mg.De / 2 * .7, zm + 18]); R.ancla('roscaI', [Mg.Di / 2 + .5, -.3, zm + 14]);
  R.ancla('roscaE', [0, -Rr.d / 2, zs - 15]); R.ancla('manguito2', [-Mg.De / 2 * .7, -Mg.De / 2 * .7, zm2 + 10]); R.ancla('tramoInf', [-r * .7, -r * .7, -60]); R.ancla('tramoSup', [-r * .7, -r * .7, zs + 40]);
  R.ancla('espiga', [0, -Rr.d / 2, zt + 15]); R.ancla('bulon', [-B.Dc / 2 * .7, -B.Dc / 2 * .7, zb + 9]); R.ancla('espigaB', [0, -Rr.d / 2, zb - 15]);
  R.ancla('tope', [0, -r, zm - Mg.L / 2 - .5]);
}
