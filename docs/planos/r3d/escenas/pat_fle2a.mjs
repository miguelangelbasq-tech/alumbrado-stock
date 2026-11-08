/* MAT-FLEJE-2 · pipeta (5502) enroscada en el caño H°G° Ø2" (5501), cortada a cuarto: rosca BSP 55° real, cable que entra por la boca de abajo (forma AC) */
import { CANO } from '../piezas/perfiles_pat.mjs';
import { matsP, canoRoscado, revol, rosca } from '../piezas/pat.mjs';
import { tubo, mats } from '../piezas/cables.mjs';
import { CAB } from '../piezas/perfiles_cables.mjs';
export default function (R) {
  R.vista({ az: -40, el: 20, fov: 13, margen: .05 });
  R.config({ bordeOp: .3 });
  const M = matsP(R), c = CANO.c2, ro = c.De / 2, Lr = CANO.rosca, ref = [1, 0, 0];
  canoRoscado(R, [0, 0, -200], [0, 0, 1], c, 200, Lr, M.galv, M.galvC, { a0: 270, a1: 540, ref });
  // pipeta: cuerpo de fundición de aluminio con rosca interior (AC) y capuchón curvo con la boca hacia abajo
  const fi = rosca(ro, c.paso, 55, false), al = R.tipoCorte(R.M.pa('#b8bdc2', { metalness: .85, roughness: .55, clearcoat: 0 }), 'metal');
  revol(R, { p0: [0, 0, -Lr], dir: [0, 0, 1], L: Lr + 6, ro: () => ro + 7, ri: (th, z) => z < Lr ? fi(th, z) : ro - 6, a0: 270, a1: 540, ref, mat: al, matC: R.M.corte(al, 'metal'), nt: 96, dz: c.paso / 10 });
  // codo de 180° (barrido de anillo) que termina mirando hacia abajo
  const T = R.THREE, Rb = 48, zb = 6;
  class C extends T.Curve { getPoint(t, o = new T.Vector3()) { const a = Math.PI * t; return o.set(Rb - Rb * Math.cos(a), 0, zb + Rb * Math.sin(a) * .9); } }
  const g1 = new T.TubeGeometry(new C(), 48, ro + 7, 48, false), g2 = new T.TubeGeometry(new C(), 48, ro - 1, 48, false);
  const m1 = new T.Mesh(g1, al); m1.castShadow = true; R.agregar(m1);
  const m2 = new T.Mesh(g2, R.M.oscuro()); m2.material.side = T.BackSide; R.agregar(m2);
  // cable de la red que entra por la boca y baja por el caño (piloto Al 1 × 25 XLPE como en el AP-TC-024)
  const Mc = mats(R), rp = CAB.p1x25.Ro;
  const pts = [[2 * Rb + 40, -10, -140], [2 * Rb, 0, -40], [2 * Rb, 0, zb], [Rb, 0, zb + Rb * .9], [6, 0, zb], [6, 0, -190]];
  const cur = new T.CatmullRomCurve3(pts.map(p => new T.Vector3(...p)), false, 'catmullrom', .4);
  tubo(R, (s) => cur.getPoint(Math.min(Math.max(s, 0), 1)).toArray(), 0, 1, rp, Mc.ais('XN'), { segs: 200, rad: 24 });
  R.ancla('cano', [ro * .7, -ro * .7, -150]); R.ancla('rosca', [-.3, -ro + .5, -Lr / 2]); R.ancla('pipeta', [Rb, -ro - 6, zb + Rb * .9]);
  R.ancla('boca', [2 * Rb, -ro, zb - 2]); R.ancla('cable', [2 * Rb + 30, -10, -110]); R.ancla('pared', [-.3, -ro + c.e / 2, -150]); R.ancla('roscaP', [-.3, -ro - 4, -5]);
}
