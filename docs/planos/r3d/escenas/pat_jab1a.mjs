/* MAT-JABALINA-1 · cabeza de la jabalina 5/8" cortada a cuarto (capa de cobre real 0,254), sufridera de hinca explotada, punta cónica */
import { JAB } from '../piezas/perfiles_pat.mjs';
import { matsP, revol } from '../piezas/pat.mjs';
export default function (R) {
  R.vista({ az: 14, el: 16, fov: 13, margen: .04 });
  R.config({ bordeOp: .35 });
  const M = matsP(R), r = JAB.j58.D / 2, cu = JAB.cu, ch = JAB.chaflan;
  const cte = (k) => () => k, A0 = 90, A1 = 360, ref = [1, 0, 0];
  // ---- tramo de la cabeza (z = 0 arriba, baja 120) cortado a cuarto
  const roC = (th, z) => z < ch ? r - ch + z : r, riC = (th, z) => z < ch ? Math.max(.01, r - ch + z - cu) : r - cu;
  revol(R, { p0: [0, 0, 0], dir: [0, 0, -1], L: 120, ro: roC, ri: riC, noRi: true, a0: A0, a1: A1, ref, mat: M.cobre, matC: M.cobreC, nt: 120, dz: .25, tapa1: true });
  revol(R, { p0: [0, 0, 0], dir: [0, 0, -1], L: 120, ro: riC, a0: A0, a1: A1, ref, mat: M.alma, matC: M.almaC, nt: 120, dz: .25, noRo: true });
  R.impresoCil(['IRAM 2309  JL16  5/8" x 1500  Cu 254 µm'], [0, 0, -112], [0, 0, -40], r + .03, 110, -70, { color: '#3b2210', px: 2.3 });
  // ---- sufridera (cabezal de hinca de acero) explotada arriba, cortada a cuarto
  const S = JAB.sufridera, z0 = 22;
  revol(R, { p0: [0, 0, z0], dir: [0, 0, 1], L: S.L, ro: (th, z) => z > S.L - 3 ? S.De / 2 - (z - (S.L - 3)) : S.De / 2, ri: (th, z) => z < S.prof ? S.Di / 2 : .01, a0: 0, a1: 270, ref, mat: M.templado, matC: M.templadoC, nt: 120, dz: 1 });
  // ---- punta (otro tramo), al costado
  const xp = 40, Lp = JAB.punta;
  const roP = (th, z) => z > 90 - Lp ? Math.max(.4, r * (90 - z) / Lp) : r;
  const riP = (th, z) => Math.max(.2, roP(th, z) - cu);
  revol(R, { p0: [xp, 0, -40], dir: [0, 0, -1], L: 90, ro: roP, ri: riP, noRi: true, a0: A0, a1: A1, ref, mat: M.cobre, matC: M.cobreC, nt: 120, dz: .4 });
  revol(R, { p0: [xp, 0, -40], dir: [0, 0, -1], L: 90, ro: riP, a0: A0, a1: A1, ref, mat: M.alma, matC: M.almaC, nt: 120, dz: .4, noRo: true });
  R.ancla('cobre', [-r + .1, -.3, -60]); R.ancla('alma', [r * .45, -.2, -30]); R.ancla('cara', [.2, -r * .5, -95]);
  R.ancla('chaflan', [r * .7, r * .7, -.8]); R.ancla('cabeza', [-2, 2, 0]); R.ancla('leyenda', [r * .2, -r, -75]);
  R.ancla('sufridera', [-S.De / 2 * .7, -S.De / 2 * .7, z0 + 50]); R.ancla('alojamiento', [S.Di / 2 * .5, -.2, z0 + 25]);
  R.ancla('punta', [xp, 0, -130 + 2]); R.ancla('almaP', [xp + r * .3, -.2, -100]); R.ancla('cuerpo', [-r, 0, -100]);
}
