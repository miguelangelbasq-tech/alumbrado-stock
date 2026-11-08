/* MAT-FLEJE-1 · fleje inox 3/4" (4024) con hebilla (4025) abrazando el poste de H°A° y el caño de bajada doble aislación Ø2" (5004); hebilla trabada en detalle */
import { FLE, CANO } from '../piezas/perfiles_pat.mjs';
import { posteHA } from '../piezas/aerea.mjs';
import { matsP, flejePoste, revol } from '../piezas/pat.mjs';
export default function (R) {
  R.vista({ az: -150, el: 24, fov: 13, margen: .04 });
  R.config({ bordeOp: .3 });
  const M = matsP(R), rp = 110, rc = CANO.da.De / 2, xc = rp + rc + .8, cte = (k) => () => k;
  posteHA(R, 0, 330, rp, 0); R._mp.horm;
  revol(R, { p0: [xc, 0, -20], dir: [0, 0, 1], L: 380, ro: cte(rc), ri: cte(rc - CANO.da.e), mat: M.pvcG, matC: M.pvcGC, nt: 96, dz: 380, ref: [1, 0, 0] });
  const f1 = flejePoste(R, rp, 120, { rc, xc, th: 150 });
  flejePoste(R, rp, 250, { rc, xc, th: 150 });
  const h = f1.hebilla;
  R.ancla('fleje', [xc + rc * Math.cos(.5), rc * Math.sin(.5) + .5, 120]); R.ancla('hebilla', [h[0] - 2, h[1] - 6, h[2] + 10]); R.ancla('cola', [h[0] - 4, h[1] + 14, h[2] + 5]);
  R.ancla('cano', [xc - rc * .7, -rc * .7, 300]); R.ancla('poste', [-rp * .7, rp * .7, 200]);
  R.ancla('oreja', [h[0] - 3, h[1] - 9, h[2] + FLE.a / 2 + 1]);
}
