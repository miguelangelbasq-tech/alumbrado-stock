/* MAT-HERRAMIENTAS-2 · pinza corta cable a criquet 240 mm² (9018) con un cable 4 × 120 adentro de la boca y la
 * crimpeadora de punteras 9021 abierta, con una puntera TIF en su boca. Medidas: perfiles_nherr.mjs (CRIQ, CRIMP) */
import { CRIQ, CRIMP } from '../piezas/perfiles_nherr.mjs';
import { ext, matsH, lugar, W, mangoRecto, cable4, pinza3d, Pbrazo } from '../piezas/nherr_util.mjs';
export default function (R) {
  R.vista({ az: -22, el: 52, fov: 15, margen: .035 });
  R.config({ bordeOp: .28 });
  const M = matsH(R), T = R.THREE;
  // ---- corta cable a criquet
  const g = R.grupo(), e = 5.5;
  ext(R, CRIQ.contFija, -e, -.05, M.pavon, g, .5);
  ext(R, CRIQ.contMovil, .05, e, M.cromo, g, .5);
  const pv = CRIQ.piv;
  R.torno([pv.x, pv.y, -e - 1], [pv.x, pv.y, e + 1], [[0, 0], [5.6, 0], [6.2, .6], [6.2, 1], [4.6, 1], [4.6, 2 * e + 1], [6.2, 2 * e + 1], [6.2, 2 * e + 1.4], [5.6, 2 * e + 2], [0, 2 * e + 2]], M.cromo, { padre: g });
  // trinquete (uña) y resorte sobre el mango móvil
  R.caja(CRIQ.cuchilla.cx + 22, CRIQ.cuchilla.cx + 34, 14, 19, e, e + 3, M.pavon, { r: .8, padre: g });
  R.cil([CRIQ.cuchilla.cx + 34, 16.5, e + 1.5], [CRIQ.manijaM.x0, 22, e + 1.5], 1.2, M.alambreAc, { padre: g });
  const cF = mangoRecto(R, g, CRIQ.manijaF, CRIQ.L, 7);
  const cM = mangoRecto(R, g, CRIQ.manijaM, CRIQ.L, 7);
  cable4(R, g, [CRIQ.cuchilla.cx - 8, 6], -24, 14, 27);
  lugar(g, [0, 0, 16]);
  const xs = CRIQ.manijaF.x0 + 60;
  R.ancla('k_fija', W(R, g, [CRIQ.cuchilla.cx + 22, -18, -1]));
  R.ancla('k_movil', W(R, g, [CRIQ.cuchilla.cx + 6, -16, e]));
  R.ancla('k_dientes', W(R, g, [CRIQ.cuchilla.cx - 4, -26, e]));
  R.ancla('k_eje', W(R, g, [pv.x, pv.y, e + 2]));
  R.ancla('k_una', W(R, g, [CRIQ.cuchilla.cx + 28, 16.5, e + 3]));
  R.ancla('k_cable', W(R, g, [CRIQ.cuchilla.cx - 8, 6 + 11, 14]));
  R.ancla('k_mangoF', W(R, g, [xs, cF(xs), 9]));
  R.ancla('k_mangoM', W(R, g, [xs + 40, cM(xs + 40), 9]));
  // ---- crimpeadora
  const c = pinza3d(R, CRIMP, { abre: 3, sello: false, matBase: M.negroP, matGrip: M.rojo, acero: M.pavon });
  // sector dentado del criquet (en el brazo B) y traba (en el A)
  const k = CRIMP.criquet, bB = c.brazos.find(b => b.lado === -1), bA = c.brazos.find(b => b.lado === 1);
  for (let i = 0; i < k.n; i++) { const a = (-35 + 70 * i / (k.n - 1)) * Math.PI / 180;
    const m = R.caja(-1, 1, -1.1, 1.1, -3, 3, M.cromo, { r: .2, padre: bB.gi }); m.position.set(k.x + k.r * Math.cos(a) - k.r, k.r * Math.sin(a) * .5 + 2, 0); m.rotation.z = a + .78; }
  R.caja(k.x - 6, k.x + 4, -6, -1.5, -3.2, 3.2, M.cromo, { r: .5, padre: bA.gi });
  // puntera TIF en la boca de 2,5 mm²
  const bo = CRIMP.muescas[3];
  R.cil([bo[0], 0, -10], [bo[0], 0, 6], 1.75, M.C.galv || M.cromo, { padre: c.g, seg: 32 });
  R.cil([bo[0], 0, 6], [bo[0], 0, 13], 2.6, R.M.pa('#2f74c0'), { padre: c.g, seg: 32 });
  R.cil([bo[0], 0, 13], [bo[0], 0, 34], 1.9, R.M.cable('#6e3b1d'), { padre: c.g, seg: 24 });
  lugar(c.g, [70, -112, CRIMP.ais.tGrip / 2], -6);
  R.ancla('c_cab', W(R, c.g, [20, 13, CRIMP.tCab / 2]));
  R.ancla('c_bocas', Pbrazo(R, c, 1, [CRIMP.muescas[5][0], 4, CRIMP.tCab / 2]));
  R.ancla('c_tif', W(R, c.g, [bo[0], 2.6, 12]));
  R.ancla('c_criq', Pbrazo(R, c, -1, [k.x - 4, 6, 3]));
  R.ancla('c_mango', Pbrazo(R, c, -1, [CRIMP.L - 40, -CRIMP.centro(CRIMP.L - 40), CRIMP.ais.tGrip / 2]));
  R.ancla('c_eje', W(R, c.g, [CRIMP.xp, 0, CRIMP.tCab / 2 + 1.4]));
}
