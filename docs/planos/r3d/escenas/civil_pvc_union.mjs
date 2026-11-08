/* MAT-CAÑOS-1 · Ø110: barra con enchufe (cabeza) + espiga de la otra barra pegada + curva 90° con enchufes, en MEDIO CORTE
 * (se saca la mitad y < 0 para ver la pared, el enchufe y el adhesivo). Atrás: el caño de reserva entero con la tapa 5030 y el cordón 5014. */
import { PVC } from '../piezas/perfiles_civil.mjs';
import { matsC, tuboB, recta, arco, cte } from '../piezas/civil_util.mjs';
export default function (R, op = {}) {
  R.vista({ az: -22, el: 30, fov: 15, margen: .035 });
  R.config({ bordeOp: .35, exposicion: .85 });
  const M = matsC(R), P = PVC.d110, ro = P.D / 2, ri = ro - P.e, E = PVC.enchufe, j = E.juego, ad = PVC.adhesivo;
  const roS = ro + j + ad + P.e, riS = ro + j + ad;      // enchufe: Ø interior = Ø110 + juego, pared igual
  const half = { a0: -90, a1: 90, up: [0, 1, 0], matC: M.pvcCorte, matI: M.pvcIn, na: 48 };   // mitad y > 0 (N = +y)
  // ---- barra 2 (espiga) de x = -420 a x = Lc (entra en el enchufe de la barra 1)
  const xs = 0, Lc = E.Lc, Tr = E.trans;
  tuboB(R, recta([op.det ? -70 : -420, 0, 0], [xs + Lc - 2, 0, 0]), 0, 1, cte(ro), cte(ri), M.pvc, { ...half, n: 2 });
  // película de adhesivo en el enchufe
  tuboB(R, recta([xs + 1, 0, 0], [xs + Lc - 3, 0, 0]), 0, 1, cte(ro + j + ad - .05), cte(ro + .05), M.adhesivo, { ...half, n: 2, matC: M.adhesivo });
  // ---- barra 1: enchufe (xs-? a xs+Lc), abocardado (Tr) y caño liso hasta xb
  const xe0 = xs - 4, xb = op.det ? 140 : 560;
  const rof = (t) => { const x = xe0 + t * (xb - xe0); if (x < xs + Lc) return roS; if (x < xs + Lc + Tr) { const k = (x - xs - Lc) / Tr; return roS + (ro - roS) * k; } return ro; };
  const rif = (t) => { const x = xe0 + t * (xb - xe0); if (x < xs + Lc) return riS; if (x < xs + Lc + Tr) { const k = (x - xs - Lc) / Tr; return riS + (ri - riS) * k; } return ri; };
  tuboB(R, recta([xe0, 0, 0], [xb, 0, 0]), 0, 1, rof, rif, M.pvc, { ...half, n: 220 });
  if (op.det) { R.vista({ az: -28, el: 26, fov: 14, margen: .04 }); R.ancla('pared', [-40, 0, ro - P.e / 2]); R.ancla('espiga', [-30, 0, -ro + 1]); R.ancla('enchufe', [xs + Lc * .55, 0, roS - .5]);
    R.ancla('adhesivo', [xs + Lc * .45, 0, ro + .3]); R.ancla('abocardado', [xs + Lc + Tr * .5, 0, (roS + ro) / 2]); R.ancla('tope', [xs + Lc - 2, 0, ro - P.e / 2]); return; }
  // ---- curva 90° con enchufes: el caño entra Lc en el enchufe de la curva
  const C = PVC.curva, xc0 = xb - Lc + 2;                          // boca del enchufe de la curva
  tuboB(R, recta([xc0, 0, 0], [xc0 + Lc + 8, 0, 0]), 0, 1, cte(roS), cte(riS), M.pvc, { ...half, n: 2 });
  const xa = xc0 + Lc + 8, cz = C.R;                                 // centro del arco (x = xa, z = R)
  tuboB(R, arco([xa, 0, cz], C.R, [0, 0, -1], [1, 0, 0]), 0, 90, cte(roS), cte(riS), M.pvc, { ...half, n: 60 });
  tuboB(R, recta([xa + C.R, 0, cz], [xa + C.R, 0, cz + Lc + 8]), 0, 1, cte(roS), cte(riS), M.pvc, { ...half, n: 2 });
  // ---- caño de reserva atrás (y = +SEP), entero, con la tapa 5030 separada y el cordón guía saliendo
  const S = PVC.separacion, T = PVC.tapa;
  tuboB(R, recta([-420, S, 0], [xb - 40, S, 0]), 0, 1, cte(ro), cte(ri), M.pvc, { n: 2, na: 72, up: [0, 0, 1] });
  const xt = xb + 60;                                              // tapa explotada
  R.torno([xt, S, 0], [xt + 1, S, 0], [[ro + j, 0], [ro + j + T.e, 0], [ro + j + T.e, T.L + T.fondo - 1], [ro + j + T.e - 1, T.L + T.fondo], [0, T.L + T.fondo], [0, T.L], [ro + j, T.L], [ro + j, 0]], M.pvcN, { seg: 96 });
  // cordón guía Ø10: sale del caño y cae en una curva
  const cord = (t) => { const x = xb - 80 + 150 * Math.sin(t * 1.4); return [x + 60 * t, S + 30 + 200 * t * t - 30 * (1 - t), -ri + 6 - 25 * t]; };
  tuboB(R, cord, 0, 1, cte(PVC.cordon.d / 2), null, M.cordon, { n: 40, na: 16, up: [0, 1, 0] });
  // anclas
  R.ancla('pared', [-250, 0, ro - P.e / 2]); R.ancla('espiga', [-60, 0, -ro + 1]); R.ancla('enchufe', [xs + Lc * .55, 0, roS - .5]);
  R.ancla('adhesivo', [xs + Lc * .45, 0, ro + .1]); R.ancla('abocardado', [xs + Lc + Tr * .5, 0, -(roS + ro) / 2]); R.ancla('barra', [330, 0, -ro + .5]);
  R.ancla('curva', [xa + C.R * .7071 + 1, 0, cz - C.R * .7071 + (roS) * .7071]); R.ancla('enchufeC', [xa + C.R + roS - 1, 0, cz + Lc * .6]);
  R.ancla('reserva', [-200, S - ro * .3, ro * .95]); R.ancla('tapa', [xt + T.L * .5, S - (ro + j + T.e) * .7, (ro + j + T.e) * .7]); R.ancla('cordon', cord(.8));
  R.ancla('interior', [-150, 0, 0]);
}
