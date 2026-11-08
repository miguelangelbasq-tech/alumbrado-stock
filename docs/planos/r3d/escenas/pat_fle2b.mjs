/* MAT-FLEJE-2 · en su lugar (AP-TC-024, AC): parte de arriba del poste con el caño H°G° Ø2", un fleje con hebilla, la pipeta y la bajada de la red */
import { CANO } from '../piezas/perfiles_pat.mjs';
import { posteHA } from '../piezas/aerea.mjs';
import { matsP, flejePoste, revol } from '../piezas/pat.mjs';
import { tubo, mats } from '../piezas/cables.mjs';
import { CAB } from '../piezas/perfiles_cables.mjs';
export default function (R) {
  R.vista({ az: -150, el: 14, fov: 14, margen: .04 });
  R.config({ bordeOp: .25 });
  const M = matsP(R), rp = 100, c = CANO.c2, ro = c.De / 2, xc = -(rp + ro + 2.4), cte = (k) => () => k;
  posteHA(R, 5500, 6900, rp, 0);
  revol(R, { p0: [xc, 0, 5500], dir: [0, 0, 1], L: 900, ro: cte(ro), ri: cte(ro - c.e), mat: M.galv, matC: M.galvC, nt: 64, dz: 300 });
  // fleje que abraza poste + caño (el caño está en -x: giro la escena del fleje 180°)
  const g = R.grupo(); flejePoste(R, rp, 5800, { rc: ro, xc: rp + ro + 2.4, th: 330, padre: g }); g.rotation.z = Math.PI;
  const al = R.tipoCorte(R.M.pa('#b8bdc2', { metalness: .85, roughness: .55, clearcoat: 0 }), 'metal');
  const T = R.THREE, Rb = 48, z0 = 6400;
  R.torno([xc, 0, z0 - 30], [xc, 0, z0 + 6], [[0, 0], [ro + 7, 0], [ro + 7, 36], [0, 36]], al, { seg: 48 });
  class C extends T.Curve { getPoint(t, o = new T.Vector3()) { const a = Math.PI * t; return o.set(xc - Rb + Rb * Math.cos(a), 0, z0 + 6 + Rb * Math.sin(a) * .9); } }
  const m = new T.Mesh(new T.TubeGeometry(new C(), 32, ro + 7, 40, false), al); m.castShadow = true; R.agregar(m);
  const Mc = mats(R), rpi = CAB.p1x25.Ro;
  const cur = new T.CatmullRomCurve3([[-900, -100, 6800], [-500, -50, 6650], [xc - 2 * Rb - 20, 0, z0 - 120], [xc - 2 * Rb, 0, z0 - 10], [xc - 2 * Rb, 0, z0 + 6]].map(p => new T.Vector3(...p)), false, 'catmullrom', .4);
  tubo(R, (s) => cur.getPoint(Math.min(Math.max(s, 0), 1)).toArray(), 0, 1, rpi, Mc.ais('XN'), { segs: 160, rad: 20 });
  R.ancla('poste', [rp * .7, rp * .7, 6600]); R.ancla('cano', [xc + ro * .5, ro * .85, 5650]); R.ancla('fleje', [-rp * .2, rp + 2, 5800]); R.ancla('pipeta', [xc - Rb, ro + 6, z0 + 6 + Rb * .9]);
  R.ancla('cable', cur.getPoint(.3).toArray()); R.ancla('boca', [xc - 2 * Rb, ro, z0]);
}
