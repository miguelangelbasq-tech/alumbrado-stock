/* MAT-HERRAMIENTAS-1 · pinza universal (9005) abierta con un mango cortado a cuarto (acero + capa dura + capa blanda),
 * pinza de punta cónica (9029), alicate de corte oblicuo (3088) y cuchillo de electricista (3086). Medidas: perfiles_nherr.mjs */
import { P9005, P9029, P3088, CUCH } from '../piezas/perfiles_nherr.mjs';
import { pinza3d, cuchillo3d, lugar, W, Pbrazo } from '../piezas/nherr_util.mjs';
export default function (R) {
  R.vista({ az: -18, el: 58, fov: 15, margen: .03 });
  R.config({ bordeOp: .28, exposicion: .95 });
  const u = pinza3d(R, P9005, { abre: 9, corte: [P9005.L - 52, P9005.L + 2] });
  lugar(u.g, [0, 0, P9005.ais.tGrip / 2]);
  const p = pinza3d(R, P9029, { abre: 4 });
  lugar(p.g, [6, -66, P9029.ais.tGrip / 2], -4);
  const a = pinza3d(R, P3088, { abre: 7 });
  lugar(a.g, [40, -128, P3088.ais.tGrip / 2], -3);
  const c = cuchillo3d(R, CUCH);
  lugar(c.g || c, [10, -180, CUCH.mango.Dtope / 2], -2);
  const P = P9005;
  R.ancla('u_mordaza', Pbrazo(R, u, 1, [10, 7, P.tCab / 2]));
  R.ancla('u_tubo', Pbrazo(R, u, 1, [P.tubo.x, P.tubo.r + 1.2, P.tCab / 2]));
  R.ancla('u_filo', Pbrazo(R, u, 1, [44, 6, P.tCab / 2]));
  R.ancla('u_eje', W(R, u.g, [P.xp, 0, P.tCab / 2 + 1.4]));
  R.ancla('u_tope', Pbrazo(R, u, -1, [P.xh + 3, -P.centro(P.xh + 3) + P.hc0 + P.ais.tope[0] - 2, P.ais.tTope / 2]));
  R.ancla('u_base', Pbrazo(R, u, -1, [P.L - 5, -P.centro(P.L - 5), P.ais.tBase / 2]));
  R.ancla('u_grip', Pbrazo(R, u, -1, [P.xh + 60, -P.centro(P.xh + 60) + 3, P.ais.tGrip / 2]));
  R.ancla('u_sello', Pbrazo(R, u, -1, [P.xh + P.ais.grip[0] + 18, -P.centro(P.xh + P.ais.grip[0] + 18), P.ais.tGrip / 2]));
  const xc = P.L - 30;
  R.ancla('u_acero', Pbrazo(R, u, 1, [xc, P.centro(xc), 0]));
  R.ancla('u_capa1', Pbrazo(R, u, 1, [xc, P.centro(xc) - P.hcAA - 1.3, 0]));
  R.ancla('u_capa2', Pbrazo(R, u, 1, [xc, P.centro(xc) - P.hcAA - P.ais.base - 1.2, 0]));
  R.ancla('p_punta', Pbrazo(R, p, 1, [4, 1.5, P9029.tCab / 2]));
  R.ancla('p_filo', Pbrazo(R, p, 1, [66, 5, P9029.tCab / 2]));
  R.ancla('a_filo', Pbrazo(R, a, 1, [8, 5, P3088.tCab / 2]));
  R.ancla('a_eje', W(R, a.g, [P3088.xp, 0, P3088.tCab / 2 + 1.4]));
  R.ancla('c_hoja', W(R, c.g || c, [30, 5, 1]));
  R.ancla('c_filo', W(R, c.g || c, [16, -6, 0]));
  R.ancla('c_mango', W(R, c.g || c, [CUCH.L - 60, 0, 12]));
}
