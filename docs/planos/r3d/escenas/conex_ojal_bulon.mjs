/* MAT-TERMINALES-1 · cómo va: ojal 16 mm² engarzado, abulonado a una planchuela de cobre con bulón M10, arandela plana, arandela grower y tuerca */
import { ojalCu, hexX } from '../piezas/conex.mjs';
import { OJAL, COLOR } from '../piezas/perfiles_conex.mjs';
export default function (R) {
  R.vista({ az: -30, el: 38, fov: 12, margen: .05 });
  const z = 5 + OJAL.e / 2;
  // planchuela de cobre (barra) 30 × 5 con agujero
  const xc = OJAL.L - OJAL.W / 2;
  const hueco = Array.from({ length: 48 }, (_, i) => [xc + 5.5 * Math.cos(i * Math.PI / 24), 5.5 * Math.sin(i * Math.PI / 24)]);
  R.perfil([[xc - 9.5, -13], [xc + 34, -13], [xc + 34, 13], [xc - 9.5, 13]].map(([x, y]) => [x, y]), [hueco], 5, R.M.cobre(), { A: [0, 0, 1], B: [1, 0, 0], C: [0, 1, 0], o: [0, 0, 0], bevel: .4 });
  const g = ojalCu(R, 0, 0, z, { crimp: true, cable: 30, color: COLOR.L1 });
  // arandela plana, grower y tuerca M10 encima del ojal
  const zt = 5 + OJAL.e;
  R.torno([xc, 0, zt], [xc, 0, zt + 2], [[5.3, 0], [10, 0], [10, 2], [5.3, 2]], R.M.aceroCinc(), { seg: 64 });
  R.torno([xc, 0, zt + 2], [xc, 0, zt + 4.5], [[5.2, 0], [8.6, 0], [8.6, 2.5], [5.2, 2.5]], R.M.aceroCinc(), { seg: 64 });
  const n = hexX(R, 0, 8, 0, 0, 16, R.M.aceroCinc(), { agujero: 4.3, bevel: .6 });
  n.rotation.y = -Math.PI / 2; n.position.set(xc, 0, zt + 4.5);
  // bulón M10 (de abajo hacia arriba)
  R.cil([xc, 0, -8], [xc, 0, zt + 15], 5, R.M.aceroCinc(), { seg: 48 });
  const c = hexX(R, 0, 6.4, 0, 0, 16, R.M.aceroCinc(), { bevel: .6 }); c.rotation.y = -Math.PI / 2; c.position.set(xc, 0, -14.4);
  R.ancla('ojal', [OJAL.Lb + 3, -3, z + 1.5]);
  R.ancla('tuerca', [xc + 6.9, -4, zt + 9]);
  R.ancla('arandela', [xc - 9.4, -3, zt + 1.6]);
  R.ancla('grower', [xc - 8.2, 3, zt + 3.8]);
  R.ancla("planchuela", [xc + 24, -13, 3]);
  R.ancla('bulon', [xc + 3.5, -3.5, zt + 14.5]);
  R.ancla('cable', [-18, 0, z + 3.65]);
}
