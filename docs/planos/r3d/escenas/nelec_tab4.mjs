/* MAT-TABLERO-4 · tablero T-010 armado en PRFV para poste, 747 × 546 × 300 (3101: 3 salidas «3 × 1 × 16 A»). Gabinete y poste: protab_caja (sin tocar).
 * Contenido de la placa fuera de las salidas (general 4 × 40, contactor, bornera): como el tablero armado de MAT-TABLERO-2, a confirmar (*). */
import { gabinete, posteSemi } from '../piezas/protab_caja.mjs';
import { termomagnetica, contactor } from '../piezas/protab_mod.mjs';
import { rielModular } from '../piezas/fusibles.mjs';
import { riel, borne } from '../piezas/bpn.mjs';
import { TM, CT } from '../piezas/perfiles_protab.mjs';
import { T010 } from '../piezas/perfiles_nelec.mjs';
import { MX, tubo } from '../piezas/protab_util.mjs';
export default function (R, PRM = {}) {
  const T = R.THREE, X = MX(R), { W, H, P } = T010, yP = T010.placa.y, ns = PRM.salidas || 3;
  R.vista({ az: 198, el: 12, fov: 15, margen: .025 });
  gabinete(R, { W, H, P, abre: 112, pared: T010.pared, radio: T010.radio, puerta: T010.puerta, placa: T010.placa, cierres: [200, 550], bisagras: [110, 640],
    cables: [{ x: -150, r: 9, largo: 80 }, ...Array.from({ length: ns }, (_, i) => ({ x: -30 + i * 80, r: 7, largo: 80 }))] });
  const Rp = T010.poste.R; posteSemi(R, -Rp - 26, Rp, -260, H + 260, [140, H - 140], { yGab: 0 });
  const grupoEn = (x, y, z, base) => { const g = R.grupo(); g.position.set(x, y, z); if (base) g.quaternion.setFromRotationMatrix(base); return g; };
  const L = '#6e3b1d', S = '#26282b', Tt = '#c8302c', N = '#1f78c0';
  // riel A: general 4 polos + contactor (*)
  const zA = 560, gA = grupoEn(0, yP + 7.5, zA - TM.zM); rielModular(R, -230, 230, TM.zM, gA);
  termomagnetica(R, -90, 4, { padre: gA, marca: '40 A', icc: ' ' });
  contactor(R, 10, { padre: gA });
  // riel B: las salidas 3 × 1 × 16 A (3 unipolares C16 por salida)
  const zB = 380, gB = grupoEn(0, yP + 7.5, zB - TM.zM); rielModular(R, -230, 230, TM.zM, gB);
  const xS = []; for (let s = 0; s < ns; s++) { const x0 = -ns * 36 + 6 + s * 72; xS.push(x0); for (let k = 0; k < 3; k++) termomagnetica(R, x0 + k * 18, 1, { padre: gB, marca: 'C16', icc: ' ' }); }
  // riel C: bornera de salida
  const zC = 190, mB = new T.Matrix4().makeBasis(new T.Vector3(1, 0, 0), new T.Vector3(0, 0, -1), new T.Vector3(0, 1, 0));
  const gC = grupoEn(0, yP + 7.5, zC + 26.5, mB); riel(R, -120, 120, { padre: gC });
  const cols = []; for (let s = 0; s < ns; s++) cols.push(R.PAL.grisBPN, R.PAL.grisBPN, R.PAL.grisBPN); cols.push(R.PAL.celeste, R.PAL.celeste, R.PAL.verde, R.PAL.verde);
  cols.forEach((c, i) => borne(R, -cols.length * 4.1 + i * 8.2, c, { padre: gC }));
  // cableado esquemático
  const yc = yP + 52, c = (pts, col, r = 2.2) => tubo(R, pts, r, R.M.cable(col), { radial: 10, tension: .1 });
  [L, S, Tt, N].forEach((col, i) => c([[-150 + (i - 1.5) * 6, P / 2 - 40, 4], [-150 + (i - 1.5) * 6, yc, 80], [-250 + i * 6, yc, 300], [-250 + i * 6, yc, 640], [-81 + i * 18, yP + 7.5 + TM.cable.y, zA - TM.zM + 96]], col, 2.8));
  for (let s = 0; s < ns; s++) [L, S, Tt].forEach((col, k) => { const x = xS[s] + 9 + k * 18; c([[x, yP + 7.5 + TM.cable.y, zB - TM.zM - 8], [x, yc - 6, zB - TM.zM - 40], [-cols.length * 4.1 + 4 + (s * 3 + k) * 8.2, yc - 6, zC + 90], [-cols.length * 4.1 + 4 + (s * 3 + k) * 8.2, yP + 60, zC + 30]], col, 1.8); });
  R.ancla('gab', [W / 2, P * .5, H * .85]); R.ancla('puerta', [-W / 2 - 120, P + 120, H * .55]); R.ancla('placa', [200, yP, 120]); R.ancla('poste', [0, -Rp - 26 - Rp * .7, H + 120]);
  R.ancla('semi', [Rp, -Rp - 26, 140]); R.ancla('tmG', [-54, yP + 7.5 + TM.Dn, zA + 12]); R.ancla('km', [32, yP + 7.5 + CT.Dn, zA - 8]);
  R.ancla('sal', [xS[0] + 27, yP + 7.5 + TM.Dn, zB + 12]); R.ancla('bornes', [-40, yP + 50, zC]); R.ancla('prensa', [-150, P / 2, -20]); R.ancla('junta', [W / 2 - 10, P - 5, H * .35]);
}
