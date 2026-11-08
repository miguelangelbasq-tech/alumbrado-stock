/* MAT-EMPALMES-3 · VARIANTE: empalme recto termocontraíble para cable 4 × 10 (sin código en el pañol): uniones 2060, manga interior por conductor,
 * manga exterior con adhesivo. Corte a cuarto por el eje en la mitad izquierda. */
import { conductor, unionComp } from '../piezas/conex.mjs';
import { TERMOJ, UNION, CABLE, COLOR } from '../piezas/perfiles_conex.mjs';
export default function (R) {
  R.vista({ az: -38, el: 30, fov: 12, margen: .03 });
  const L = TERMOJ.L, c = CABLE.c4x10, zc = TERMOJ.Dext / 2 + 1;
  const rCu = Math.sqrt(10 / Math.PI), rIn = rCu + c.aisl, rc = rIn * 1.414 + .05, rs = 5.2;
  const cols = [COLOR.L1, COLOR.L2, COLOR.L3, COLOR.N], ang = [Math.PI, Math.PI / 2, 0, -Math.PI / 2];
  const g = R.grupo();
  const xS0 = 50, xS1 = L - 50, xU = [74, 92, 128, 146];
  const ins = R.tipoCorte(R.M.pvc('#2a2c30', { roughness: .4, clearcoat: .5 }), 'plastico');
  for (let k = 0; k < 4; k++) {
    const cy = Math.cos(ang[k]), cz = Math.sin(ang[k]), P = (x, r) => [x, r * cy, zc + r * cz];
    conductor(R, [P(-30, rc), P(xS0 + 2, rc), P(xS0 + 12, rs), P(xS1 - 12, rs), P(xS1 - 2, rc), P(L + 30, rc)], rCu, rIn, cols[k], { padre: g, pelado: [[xU[k] - 1, xU[k] + UNION.L + 1]] });
    unionComp(R, xU[k], rs * cy, zc + rs * cz, { crimp: true, padre: g });
    // manga interior contraída sobre la unión (de color negro, pared 0,6) — AC
    const a = xU[k] - 8, b = xU[k] + UNION.L + 8, ri = rIn + .02, ru = 3.05;
    const pr = [[ri, 0], [ri + .7, 0], [ri + .7, 6.5], [ru + .7, 8.5], [ru + .7, b - a - 8.5], [ri + .7, b - a - 6.5], [ri + .7, b - a], [ri, b - a], [ri, b - a - 7], [ru + .05, b - a - 8], [ru + .05, 8], [ri, 7]];
    R.torno([a, rs * cy, zc + rs * cz], [b, rs * cy, zc + rs * cz], pr, ins, { padre: g, seg: 40 });
  }
  // vaina del cable
  const vaina = R.tipoCorte(R.M.cable(COLOR.vaina), 'plastico');
  const an = (r, n = 72) => Array.from({ length: n }, (_, i) => [r * Math.cos(i * TAUN / n), zc + r * Math.sin(i * TAUN / n)]); const TAUN = Math.PI * 2;
  for (const [a, b] of [[-30, xS0], [xS1, L + 30]]) R.perfil(an(c.D / 2), [an(c.D / 2 - 1.6)], b - a, vaina, { a0: a, bevel: .2, padre: g });
  // manga exterior (negra) con adhesivo interior (amarillo ámbar): contraída — perfil de radios a lo largo
  const adh = R.tipoCorte(R.M.pvc('#d9a521', { roughness: .6 }), 'plastico');
  const ext = R.tipoCorte(R.M.pvc('#1e2023', { roughness: .45, clearcoat: .4 }), 'plastico');
  const D = TERMOJ.Dext / 2, rv = c.D / 2;
  const prA = [[rv, 0], [rv + .9, 0], [rv + .9, 40], [D - 2.0, 60], [D - 2.0, L - 60], [rv + .9, L - 40], [rv + .9, L], [rv, L], [rv, L - 38], [D - 3.0, L - 58], [D - 3.0, 58], [rv, 38]];
  R.torno([0, 0, zc], [L, 0, zc], prA.map(([r, t]) => [r, t]), adh, { padre: g, seg: 72 });
  const prE = [[rv + .9, 0], [rv + 2.4, 0], [rv + 2.4, 40], [D, 60], [D, L - 60], [rv + 2.4, L - 40], [rv + 2.4, L], [rv + .9, L], [rv + .9, L - 40], [D - 2.0, L - 60], [D - 2.0, 60], [rv + .9, 40]];
  R.torno([0, 0, zc], [L, 0, zc], prE, ext, { padre: g, seg: 72 });
  R.cortar(g, [-40, 120, -60, -.06, zc + .06, zc + 60]);
  R.ancla('exterior', [190, -D * .7, zc + D * .7]);
  R.ancla('adhesivo', [30, -.06, zc + rv + .5]);
  R.ancla('interior', [xU[1] + 3, -.06, zc + rs + 3.6]);
  R.ancla('union', [xU[0] + 12, -rs, zc + .06]);
  R.ancla('vaina', [-15, -c.D / 2 * .7, zc + c.D / 2 * .7]);
  R.ancla('conductor', [56, -.06, zc + rs + 1.5]);
}
