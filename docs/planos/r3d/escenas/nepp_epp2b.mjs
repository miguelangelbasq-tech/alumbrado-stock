/* MAT-EPP-2 · anteojo de seguridad 7013 (policarbonato) y tapones auditivos de espuma 3092 (uno cortado al medio) */
import { anteojo, tapon, matsN } from '../piezas/nepp.mjs';
import { ANT, TAP } from '../piezas/perfiles_nepp.mjs';
export default function (R) {
  R.vista({ az: -32, el: 24, fov: 16, margen: .04 });
  R.config({ bordeOp: .3 });
  const M = matsN(R);
  const g = anteojo(R); g.position.set(0, 0, 40);
  // tapones adelante: uno entero acostado, uno parado, uno cortado al medio
  const t1 = R.grupo(); tapon(R, [-30, -95, TAP.D / 2], [1, .25, 0], { padre: t1 });
  const t2 = R.grupo(); tapon(R, [10, -110, 0], [0, 0, 1], { padre: t2 });
  const t3 = R.grupo(); tapon(R, [40, -90, TAP.D / 2], [1, -.2, 0], { padre: t3 });
  R.cortar(t3, [30, 80, -120, -60, TAP.D / 2, 40]);
  R.ancla('lente', [40, -2, 40 + 5]);
  R.ancla('montura', [-40, 0, 40 + 26]);
  R.ancla('patilla', [-ANT.ancho / 2 - 3, 80, 40 + 10]);
  R.ancla('bisagra', [ANT.ancho / 2 - 3, 2, 40 + 12]);
  R.ancla('nariz', [6, 4, 40 - 10]);
  R.ancla('marca', [-38, -2, 40 - 18]);
  R.ancla('tapon', [-20, -92, TAP.D]);
  R.ancla('taponParado', [10, -110, TAP.L]);
  R.ancla('espuma', [52, -92, TAP.D / 2]);
}
