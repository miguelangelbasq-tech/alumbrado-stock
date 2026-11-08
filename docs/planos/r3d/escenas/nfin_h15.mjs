/* MAT-ARIDOS_HORMIGON-2 rev. C · 8501 hormigón H-15 en el hoyo del apoyo de H°A° (barrido): hoyo Ø600 × 1450 de empotramiento (app),
 * poste H°A° 8,5 m Ro 1050 (Ø cima 210, conicidad 15 mm/m, pared 55: perfiles_col APO.ha, AC), todo cortado a cuarto */
import { H15 } from '../piezas/perfiles_nfin.mjs';
import { matsC, revol, cte } from '../piezas/civil_util.mjs';
import { bloqueZ, rect2, circ } from '../piezas/col_util.mjs';
export default function (R) {
  R.vista({ az: -34, el: 24, fov: 16, margen: .05 });
  R.config({ bordeOp: .3 });
  const M = matsC(R), H = H15, rh = H.hoyoD / 2, p = H.poste, cu = [-2000, 0, -2000, 0];
  const rP = (z) => (p.dc + p.k * (p.L - H.emp - z) / 1000) / 2;     // radio del poste a la altura z (z = 0 en el terreno)
  const B = 520, zf = -H.emp;
  bloqueZ(R, rect2(-B, B, -B, B), [circ(0, 0, rh + 1, 120)], zf, 0, M.tierra, { cuarto: cu });
  bloqueZ(R, rect2(-B, B, -B, B), [], zf - 250, zf, M.tierra, { cuarto: cu });
  // H-15 entre el poste y el terreno (hoyo = empotramiento, como la cuenta de la app)
  revol(R, { p0: [0, 0, zf], dir: [0, 0, 1], L: H.emp, ro: cte(rh), ri: (th, z) => rP(zf + z) + .5, a0: -90, a1: 180, mat: M.horm, matC: M.horm, nt: 120, dz: 150 });
  // poste H°A° hueco (centrifugado)
  const ha = R.tipoCorte(R.M.pa('#c4c1b8', { roughness: .8 }), 'arena'), haC = R.M.pa('#a7a49b', { roughness: .95 });
  revol(R, { p0: [0, 0, zf], dir: [0, 0, 1], L: H.emp + H.sobre * 5, ro: (th, z) => rP(zf + z), ri: (th, z) => rP(zf + z) - p.e, a0: -90, a1: 180, mat: ha, matC: haC, nt: 120, dz: 150 });
  R.ancla('h15', [-rh * .75, 0, -700]); R.ancla('poste', [rP(300) * .7, -rP(300) * .7, 300]); R.ancla('hueco', [-rP(-300) + p.e + 5, 0, -300]);
  R.ancla('tierra', [-B + 60, 0, -900]); R.ancla('fondo', [-rh * .6, 0, zf - 120]); R.ancla('nivel', [B * .6, -B * .6, 0]); R.ancla('pared', [-rP(-900) + p.e / 2, 0, -900]);
}
