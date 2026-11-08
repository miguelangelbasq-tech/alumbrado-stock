/* fusible cilíndrico 10×38 gG: uno cortado a cuarto (casquillos, tubo cerámico, arena de cuarzo, elemento con estrangulamientos y punto de estaño)
 * y uno entero de 4 A (3073) con su impresión */
import { fusible } from '../piezas/fusibles.mjs';
import { F10x38 } from '../piezas/perfiles.mjs';
export default function (R) {
  R.vista({ az: 20, el: 30, fov: 12, margen: .03 });
  const T = R.THREE;
  // cortado: eje a lo largo de x
  const a = R.grupo(); fusible(R, F10x38, { padre: a, cuarto: [-1, 1], cortarDesde: 1.5, cortarHasta: 36.5 });
  a.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), new T.Vector3(1, 0, 0)); a.position.set(0, 0, 5.15);
  a.rotateZ(Math.PI / 2);
  const b = R.grupo(); fusible(R, F10x38, { padre: b, lineas: ['gG  4A', '10x38  500V~', '120kA  IEC 60269-2'], arco: 120, ang: 215 });
  b.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), new T.Vector3(1, 0, 0)); b.position.set(4, 18, 5.15);
  b.rotateZ(Math.PI / 2);
  R.ancla('casquillo', [2, -2, 9.7]);
  R.ancla('tubo', [14, -3.8, 8.6]);
  R.ancla('arena', [12, -1.6, 7.5]);
  R.ancla('elemento', [24.5, -.4, 5.25]);
  R.ancla('estano', [19, -.6, 5.6]);
  R.ancla('muesca', [28.2, -.5, 5.25]);
  R.ancla('soldadura', [37.5, 0, 6]);
  R.ancla('entero', [22, 18 - 5.1, 7]);
}
