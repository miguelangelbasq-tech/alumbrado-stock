/* MAT-FIJACION-2 (grupo «nobra») · los 6 precintos nuevos del pañol (4046, 4043, 1040 de baja, 4044, 4042, 4045) en fila, a escala,
 * con la cabeza alineada; adelante dos cerrados sobre su mazo (4046 sobre 3 cables 2,5; 4045 sobre un mazo de 6). Medidas: PRECN. */
import { PRECN } from '../piezas/perfiles_nobra.mjs';
import { precintoRecto, precintoLazo } from '../piezas/nobra_util.mjs';
import { matsC } from '../piezas/civil_util.mjs';
export default function (R) {
  R.vista({ az: -10, el: 46, fov: 12, margen: .03 });
  const M = matsC(R), nat = M.nylonB, T = R.THREE;
  const ys = [];
  PRECN.forEach((P, i) => { const y = -i * 13; ys.push(y); precintoRecto(R, P, 0, y, nat);
    R.ancla('p' + P.cod, [40 + i * 22, y, P.t + .3]); R.ancla('c' + P.cod, [P.cab[0] / 2, y, P.cab[1]]); });
  // dos cerrados adelante (y > 0)
  const P1 = PRECN[0], P5 = PRECN[5];
  const cab = (x, y, z, r, col) => { R.cil([x, y - 16, z], [x, y + 16, z], r, R.M.cable(col), { seg: 32 }); R.cil([x, y - 16.05, z], [x, y + 16, z], r * .55, R.M.cobre(), { seg: 24 }); };
  const c1 = [150, 14, 6.2];
  [[0, 0], [1, 1], [-1, 1]].forEach(([a, b], k) => cab(c1[0] + a * 2.9, c1[1], c1[2] - 1.6 + b * 2.8, 1.83, ['#6e3b1d', '#26282b', '#c8302c'][k]));
  precintoLazo(R, P1, [c1[0], c1[1], c1[2]], 5.4, nat, { cola: 10 });
  const c2 = [215, 22, 13.5], cols = ['#6e3b1d', '#26282b', '#c8302c', '#1f78c0', '#13843a', '#26282b', '#1f78c0'];
  const pos = [[0, 0], [7.2, 0], [-7.2, 0], [3.6, 6.2], [-3.6, 6.2], [3.6, -6.2], [-3.6, -6.2]];
  pos.forEach(([a, b], k) => cab(c2[0] + a, c2[1], c2[2] + b, 3.4, cols[k]));
  precintoLazo(R, P5, c2, 10.8, nat, { cola: 16 });
  R.ancla('lazo100', [c1[0], c1[1] + P1.w / 2, c1[2] + 5.4 + P1.t + P1.cab[1]]); R.ancla('lazo250', [c2[0] - 11.5, c2[1] + P5.w / 2, c2[2]]);
  R.ancla('dentado', [120, ys[3], PRECN[3].t + .3]); R.ancla('punta', [PRECN[5].L - 3, ys[5], .6]);
}
