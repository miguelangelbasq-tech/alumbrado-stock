/* MAT-LUMINARIA_LED-1 · corte longitudinal por el eje: recinto del driver (driver, SPD 10 kV, bornera, NEMA) y recinto óptico (placa LED, lentes, vidrio) */
import { luminaria, matsCol, tuboP, LUM } from '../piezas/col_util.mjs';
export default function (R) {
  R.vista({ az: -14, el: 22, fov: 13, margen: .03 }); R.config({ exposicion: .85, ambiente: .45 });
  const C = matsCol(R), L = LUM;
  const g = luminaria(R, { nema: 'foto', sinRotulos: true, mitad: true });
  const b = R.grupo(); tuboP(R, [-90, 0, L.acople.z], [100, 0, L.acople.z], 30.15, 3.2, C.galv, { padre: b });
  R.raiz.updateMatrixWorld(true);
  R.cortar(R.raiz, [-400, 800, -300, 0, -20, 300]);
  const yc = -.5;
  R.ancla('driver', [115, yc, 30]); R.ancla('spd', [86, 20, 30]); R.ancla('bornera', [160, 30, 24]);
  R.ancla('nema', [L.nema.x, yc, L.H + 10]); R.ancla('foto', [L.nema.x, yc, L.H + 60]);
  R.ancla('placa', [400, yc, L.zJunta - 3]); R.ancla('lente', [L.placaLED.x[0] + 20, yc, L.zJunta - 10]);
  R.ancla('vidrio', [500, yc, L.vidrio.z + 2]); R.ancla('aletas', [480, yc, L.zJunta + 35]); R.ancla('tabique', [L.sep, yc, 20]);
  R.ancla('junta', [150, yc, L.zJunta]); R.ancla('bulon', [80, yc, 50]); R.ancla('brazo', [-60, yc, L.acople.z + 20]);
  R.ancla('tapa', [100, yc, L.H - 3]);
}
