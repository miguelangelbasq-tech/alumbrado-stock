/* fusibles chicos: 8,5×31,5 cortado a cuarto (3014/3015), 5×20 de vidrio (3003) y Neozed D01 2 A (3018, rosa) y 6 A (3019, verde) */
import { fusible, neozed } from '../piezas/fusibles.mjs';
import { F85x315, F5x20 } from '../piezas/perfiles.mjs';
export default function (R) {
  R.vista({ az: 20, el: 30, fov: 12, margen: .04 });
  const T = R.THREE, X = new T.Vector3(1, 0, 0), Z = new T.Vector3(0, 0, 1);
  const pon = (g, x, y, r) => { g.quaternion.setFromUnitVectors(Z, X); g.position.set(x, y, r); g.rotateZ(Math.PI / 2); };
  const a = R.grupo(); fusible(R, F85x315, { padre: a, cuarto: [-1, 1], cortarDesde: 1.2, cortarHasta: 30.3 }); pon(a, 0, 0, 4.25);
  const b = R.grupo(); fusible(R, F85x315, { padre: b, lineas: ['gG  4A', '8,5x31,5  400V'], arco: 170, ang: 180 }); pon(b, 0, 14, 4.25);
  const c = R.grupo(); fusible(R, F5x20, { padre: c, vidrio: true }); pon(c, 42, -2, 2.6);
  const d = R.grupo(); neozed(R, 2, { padre: d, lineas: ['D01  2A', 'gG 400V'], ang: 20 }); d.position.set(46, 22, 0);
  const e = R.grupo(); neozed(R, 6, { padre: e, lineas: ['D01  6A', 'gG 400V'], ang: 20 }); e.position.set(62, 20, 0);
  R.ancla('f85', [16, -3, 6.5]); R.ancla('f85e', [10, -1, 4.4]); R.ancla('f85b', [24, 14 - 4, 6]);
  R.ancla('f520', [52, -2, 4.5]); R.ancla('neo2', [46, 22, 36.2]); R.ancla('neo6', [62, 20, 36.2]); R.ancla('neoPie', [46, 22 - 3, 2]);
}
