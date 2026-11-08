/* MAT-EMPALMES-2 · unión a compresión 10 mm² (2060): ANTES (conductores pelados entrando) y DESPUES (engarzada, cortada a cuarto) */
import { unionComp, cuerda, aislacion } from '../piezas/conex.mjs';
import { UNION, CABLE, COLOR } from '../piezas/perfiles_conex.mjs';
export default function (R) {
  R.vista({ az: -30, el: 30, fov: 12, margen: .04 });
  const [n, d] = CABLE.hilosRig[10], ri = UNION.Di / 2, z = 3.2, rI = Math.sqrt(10 / Math.PI) + .7;
  // antes
  unionComp(R, 0, 0, z, { leyenda: ['10'] });
  cuerda(R, -9, -9 + 16, 0, z, n, d, ri - .1, { torsion: 1 / 40 });
  aislacion(R, -40, -9, 0, z, rI, COLOR.L1, {});
  cuerda(R, UNION.L + 6, UNION.L + 6 + 16, 0, z, n, d, ri - .1, { torsion: 1 / 40 });
  aislacion(R, UNION.L + 22, UNION.L + 50, 0, z, rI, COLOR.L1, {});
  // después
  const y = -16;
  unionComp(R, 0, y, z, { crimp: true, cuarto: true });
  cuerda(R, -.3, UNION.L / 2 - .3, y, z, n, d, ri - .08, { quitar: (u, v) => u < 0 && v > 0 });
  cuerda(R, UNION.L / 2 + .3, UNION.L + .3, y, z, n, d, ri - .08, { quitar: (u, v) => u < 0 && v > 0 });
  aislacion(R, -30, -.4, y, z, rI, COLOR.L1, {});
  aislacion(R, UNION.L + .4, UNION.L + 30, y, z, rI, COLOR.L1, {});
  R.ancla('tubo', [6, 0, z + UNION.De / 2]);
  R.ancla('pelado', [-4, 0, z + 1.8]);
  R.ancla('hex', [7, y + 1.3, z + 2.3]);
  R.ancla('hilos', [12, y - .7, z + .9]);
  R.ancla('centro', [UNION.L / 2, y - .5, z + 1.5]);
  R.ancla('aisl', [-20, y, z + rI]);
}
