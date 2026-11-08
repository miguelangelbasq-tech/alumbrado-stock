/* MAT-TABLERO-2 · tablero de alumbrado armado (TT, AP-T-007), esquema: gabinete PRFV 800 × 600 × 300 abierto; en la placa: 3 bases NH 00 con
 * fusible (3055 + 3004), medidor (3049, EPEC), diferencial 4 × 40 A 300 mA (3007), contactor 25 A (3005), 4 termomagnéticas bipolares de salida,
 * bornera de salida BPN y barra PE; selectora en la puerta; acometida por abajo. Disposición (*). */
import { gabinete, baseNH, fusibleNH } from '../piezas/protab_caja.mjs';
import { termomagnetica, diferencial, contactor, selectora } from '../piezas/protab_mod.mjs';
import { rielModular } from '../piezas/fusibles.mjs';
import { riel, borne } from '../piezas/bpn.mjs';
import { TM, DI, CT } from '../piezas/perfiles_protab.mjs';
import { MX, tubo } from '../piezas/protab_util.mjs';
export default function (R, PRM = {}) {
  R.vista(PRM.detalle ? { az: 162, el: 12, fov: 14, margen: .02 } : { az: 196, el: 14, fov: 15, margen: .025 });
  const T = R.THREE, X = MX(R);
  const W = 600, H = 800, P = 300, yP = 27;
  const { gp } = PRM.detalle ? { gp: null } : gabinete(R, { W, H, P, abre: 118, puerta: false, placa: { W: 540, H: 740, e: 2, y: 25 }, cierres: [200, 600], bisagras: [120, 680],
    cables: [{ x: -200, r: 10, largo: 90 }, { x: -60, r: 7, largo: 90 }, { x: 60, r: 7, largo: 90 }, { x: 180, r: 7, largo: 90 }] });
  const L = '#6e3b1d', S = '#26282b', Tt = '#c8302c', N = '#1f78c0', PE = ['#13843a', '#f2c418'];
  const grupoEn = (x, y, z, base) => { const g = R.grupo(); g.position.set(x, y, z); if (base) g.quaternion.setFromRotationMatrix(base); return g; };
  // --- 3 bases NH 00 verticales con el fusible
  const mNH = new T.Matrix4().makeBasis(new T.Vector3(0, 0, 1), new T.Vector3(1, 0, 0), new T.Vector3(0, 1, 0));
  const xNH = [-225, -180, -135];
  for (const x of xNH) { const g = grupoEn(x, yP, 640, mNH); baseNH(R, 0, 0, 0, { padre: g }); fusibleNH(R, 0, 0, 30 + 4, { padre: g, lineas: ['NH00', 'gL 63A', '500V'] }); }
  if (PRM.detalle) R.caja(-268, -20, 25, 27, 80, 740, X.galv(), { r: 1 });
  // --- medidor (lo provee EPEC)
  if (!PRM.detalle) {
  R.caja(60, 240, yP, yP + 95, 500, 760, R.M.pa('#e6e6e1'), { r: 8 });
  R.caja(80, 220, yP + 94, yP + 97, 610, 740, X.policarb('#cfe0ea', .45), { r: 4 });
  R.caja(105, 195, yP + 88, yP + 95, 680, 715, R.M.pa('#2d3a2e', { roughness: .3 }), { r: 1 });
  R.impreso(['8 8 8 8 8 . 8', 'kWh'], 80, 22, [150, yP + 95.2, 697], [-1, 0, 0], [0, 0, 1], { color: '#7fd18a', ppm: 16, fondo: '#203026' });
  R.impreso(['MEDIDOR TRIFASICO', '3 x 380/220 V'], 110, 18, [150, yP + 95.2, 650], [-1, 0, 0], [0, 0, 1], { color: '#30343a', ppm: 14 });
  R.caja(70, 230, yP + 2, yP + 80, 500, 560, R.M.pa('#d6d6d0'), { r: 4 });
  }
  // --- riel A: diferencial 4P + contactor
  const zA = 420;
  const gA = grupoEn(0, yP + 7.5, zA - DI.zM); rielModular(R, -262, -30, DI.zM, gA);
  diferencial(R, -245, 4, { padre: gA, sens: '300 mA', inom: '40 A  400V~' });
  contactor(R, -160, { padre: gA });
  // --- riel B: 4 termomagnéticas bipolares de salida
  const zB = 270;
  const gB = grupoEn(0, yP + 7.5, zB - TM.zM); rielModular(R, -262, -30, TM.zM, gB);
  for (let i = 0; i < 4; i++) termomagnetica(R, -245 + i * 38, 2, { padre: gB, marca: 'C10' });
  // --- riel C: bornera de salida (L / N por salida) + PE
  const zC = 120;
  const mB = new T.Matrix4().makeBasis(new T.Vector3(1, 0, 0), new T.Vector3(0, 0, -1), new T.Vector3(0, 1, 0));
  const gC = grupoEn(0, yP + 7.5, zC + 26.5, mB);
  riel(R, -264, -30, { padre: gC });
  const cols = [R.PAL.grisBPN, R.PAL.celeste, R.PAL.grisBPN, R.PAL.celeste, R.PAL.grisBPN, R.PAL.celeste, R.PAL.grisBPN, R.PAL.celeste, R.PAL.verde, R.PAL.verde];
  cols.forEach((c, i) => borne(R, -255 + i * 8.2, c, { padre: gC }));
  if (!PRM.detalle) {
  // barra PE (7001) atornillada a la placa
  R.caja(-10, 110, yP, yP + 6, zC - 10, zC + 10, X.cobreEst(), { r: .8 });
  for (let i = 0; i < 6; i++) R.tornillo([2 + i * 20, yP + 6 + 2.6, zC], [0, 1, 0], { M: 5, L: 2, dk: 8.5, k: 2.6, tipo: 'combi', mat: X.galv() });
  }
  // --- cableado (esquema): acometida → NH → medidor → diferencial → contactor → TM → bornera
  const yc = yP + 55, c = PRM.detalle ? (() => null) : (pts, col, r = 2.8) => tubo(R, pts, r, R.M.cable(col), { radial: 12, tension: .1 });
  [L, S, Tt].forEach((col, i) => { const x = xNH[i]; c([[-200 + (i - 1) * 9, P / 2 - 40, 5], [-200 + (i - 1) * 9, yc - 10, 60], [x - 20 - i * 3, yc - 10, 520], [x, yP + 40, 568]], col); });
  c([[-60, P / 2 - 40, 5], [-60, yc, 80], [-60, yc, 560], [-80, yc, 700], [-100, yc + 10, 740]], N);
  [L, S, Tt].forEach((col, i) => c([[xNH[i], yP + 40, 712], [xNH[i], yc + 20 + i * 4, 770], [40, yc + 20 + i * 4, 770], [90 + i * 30, yP + 70, 760]], col));
  [L, S, Tt, N].forEach((col, i) => c([[100 + i * 30, yP + 60, 505], [100 + i * 30, yc + 14, 490], [-236 + i * 18, yc + 14, 512], [-236 + i * 18, yP + 31, DI.H + zA - DI.zM + 4]], col, 2.4));
  [L, S, Tt, N].forEach((col, i) => i < 3 && c([[-236 + i * 18, yP + 31, zA - DI.zM - 4], [-236 + i * 18, yc + 6, zA - DI.zM - 26], [-152 + i * 15, yc + 6, zA - DI.zM + CT.H + 26], [-152 + i * 15, yP + 7.5 + CT.cable.y, zA - DI.zM + CT.H + 4]], col, 2.2));
  for (let i = 0; i < 4; i++) {
    const x = -245 + i * 38 + 9;
    c([[x, yP + 31, zB - TM.zM - 4], [x, yc - 4, zB - TM.zM - 22], [-251 + i * 16.4, yc - 4, zC + 70], [-251 + i * 16.4, yP + 65, zC + 30]], i % 2 ? S : L, 2);
  }
  // --- selectora AUT-MAN en la puerta (lado de adentro se ve el bloque de contactos)
  if (false) { const gs = R.grupo(gp); const sel = selectora(R, [0, 0, 0], { chapa: 4.5, pos: 'AUT', padre: gs }); gs.position.set(W / 2, 4.5, 470); }
  // anclas
  R.ancla('nh', [-180, yP + 60, 640]);
  R.ancla('fus', [-135, yP + 66, 610]);
  R.ancla('medidor', [150, yP + 96, 690]);
  R.ancla('dif', [-210, yP + 7.5 + DI.Dn, zA + 12]);
  R.ancla('cont', [-138, yP + 7.5 + CT.Dn, zA - 5]);
  R.ancla('tm', [-120, yP + 7.5 + TM.Dn, zB + 10]);
  R.ancla('bornes', [-230, yP + 50, zC]);
  R.ancla('pe', [90, yP + 6, zC + 8]);
  R.ancla('riel', [40, yP + 3, zB + 17]);
  R.ancla('placa', [200, yP, 300]);
  R.ancla('acometida', [-200, P / 2, -60]);
  R.ancla('cableado', [-60, yc, 330]);
}
