/* MAT-PRENSACABLES-1 · despiece del prensacable 3/4" RE a lo largo del eje */
import { prensacable } from '../piezas/conex.mjs';
import { PRENSA } from '../piezas/perfiles_conex.mjs';
export default function (R) {
  R.vista({ az: -38, el: 24, fov: 12, margen: .04 });
  const P = PRENSA;
  const ex = { contratuerca: -22, tuerca: -12, cuerpo: 0, junta: -6, pinza: 22, goma: 36, tapa: 54 };
  const g = prensacable(R, 0, { explotado: ex });
  g.position.z = 14;
  const xh1 = g.userData.xh1;
  const z = 14, s = P.hex.caras / 2;
  R.ancla('contratuerca', [-P.chapa - P.tuerca.L - P.contratuerca.L / 2 - 22, 0, z + s]);
  R.ancla('tuerca', [-P.chapa - P.tuerca.L / 2 - 12, 0, z + s]);
  R.ancla('junta', [P.junta.e / 2 - 6, 0, z + P.junta.De / 2]);
  R.ancla('cuerpo', [P.junta.e + P.hex.L / 2, 0, z + s]);
  R.ancla('rosca', [-5, 0, z + P.rosca.D / 2]);
  R.ancla('pinza', [xh1 + 8 + 22, 0, z + P.pinza.De / 2 - .4]);
  R.ancla('goma', [xh1 + 8 + 36, 0, z + P.goma.De / 2]);
  R.ancla('tapa', [xh1 + 6 + 54, 0, z + s]);
}
