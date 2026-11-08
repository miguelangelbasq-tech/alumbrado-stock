/* MAT-PRENSACABLES-1 · prensacable 3/4" RE montado en la pared de la caja, cortado a cuarto, con el cable 4 × 2,5 pasando */
import { prensacable, aislacion, conductor } from '../piezas/conex.mjs';
import { PRENSA, CABLE, COLOR } from '../piezas/perfiles_conex.mjs';
export default function (R) {
  R.vista({ az: 30, el: 30, fov: 12, margen: .04 });
  const P = PRENSA, g = prensacable(R, 0, {});
  for (const k of Object.keys(g.userData.partes)) R.cortar(g.userData.partes[k], [-40, 60, -40, -.05, .05, 40]);
  // pared de la caja (chapa) con el agujero
  const pared = R.tipoCorte(new R.THREE.MeshPhysicalMaterial({ color: '#b8bec5', metalness: .6, roughness: .45 }), 'metal');
  const hueco = Array.from({ length: 64 }, (_, i) => [(P.rosca.D / 2 + .25) * Math.cos(i * Math.PI / 32), (P.rosca.D / 2 + .25) * Math.sin(i * Math.PI / 32)]);
  const pw = R.perfil([[-24, -24], [24, -24], [24, 24], [-24, 24]], [hueco], P.chapa, pared, { a0: -P.chapa, bevel: .3 });
  const gp = R.grupo(); gp.add(pw); R.cortar(gp, [-40, 40, -40, -.05, .05, 40]);
  // cable 4 × 2,5 (vaina) pasando + conductores adentro de la caja
  const rv = P.cableD / 2;
  const an = r => Array.from({ length: 72 }, (_, i) => [r * Math.cos(i * Math.PI / 36), r * Math.sin(i * Math.PI / 36)]);
  const gv = R.grupo(); R.perfil(an(rv), [an(rv - 1.1)], 82, R.tipoCorte(R.M.cable(COLOR.vaina), 'plastico'), { a0: -22, bevel: .3, padre: gv });
  R.cortar(gv, [-23, 34, -40, -.05, .05, 40]);
  const cols = [COLOR.L1, COLOR.L2, COLOR.L3, COLOR.N], rI = 1.65, rCu = .9;
  const gc = R.grupo();
  [[1, 1], [-1, 1], [-1, -1], [1, -1]].forEach(([a, b], k) => {
    const y = a * 2.15, z = b * 2.15;
    conductor(R, [[59, y, z], [-22, y, z], [-30, y * 2.6, z * 2.6 - 2], [-40, y * 3.6, z * 3.6 - 6]], rCu, rI, cols[k], { padre: gc });
  });
  R.cortar(gc, [-23, 34, -40, -.05, .05, 40]);
  const xh1 = g.userData.xh1;
  R.ancla('cuerpo', [P.junta.e + P.hex.L / 2, P.hex.caras / 2, 2]);
  R.ancla('rosca', [-P.rosca.L * .6, -P.rosca.D / 2 + .4, .4]);
  R.ancla('junta', [P.junta.e / 2, -P.junta.De / 2 + 1, .3]);
  R.ancla('pinza', [xh1 + 9, -P.pinza.De / 2 + 1, .4]);
  R.ancla('goma', [xh1 + 8, -P.goma.De / 2 + 1.2, .3]);
  R.ancla('tapa', [xh1 + 12, P.tapa.Dcup / 2 * .7, P.tapa.Dcup / 2 * .55]);
  R.ancla('tuerca', [-P.chapa - P.tuerca.L / 2, P.tuerca.caras / 2, 3]);
  R.ancla('contratuerca', [-P.chapa - P.tuerca.L - 1.5, -P.tuerca.caras / 2 + 2, 6]);
  R.ancla('pared', [-1, -24, 22]);
  R.ancla('cable', [38, 0, rv]);
  R.ancla('conductores', [-33, 5, 4]);
}
