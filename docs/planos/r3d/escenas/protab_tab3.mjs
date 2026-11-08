/* MAT-TABLERO-3 · tablero aéreo de barrio de policarbonato armado (3504): tapa transparente cerrada; adentro 3 bases NH ACR con fusible (3503 + 3004),
 * minicontactor 20 A (3501), reloj AT1-R (3502), 2 termomagnéticas y bornera. Medidas y disposición (*). */
import { gabinete, baseNH, fusibleNH } from '../piezas/protab_caja.mjs';
import { termomagnetica, carcasaMod } from '../piezas/protab_mod.mjs';
import { rielModular } from '../piezas/fusibles.mjs';
import { riel, borne } from '../piezas/bpn.mjs';
import { TM } from '../piezas/perfiles_protab.mjs';
import { MX, tubo } from '../piezas/protab_util.mjs';
export default function (R, PRM = {}) {
  const T = R.THREE, X = MX(R);
  const W = 320, H = 420, P = 170, yP = 14;
  if (PRM.nh) {   // base NH ACR + fusible afuera (para ver las pinzas y las cuchillas)
    R.vista({ az: 150, el: 26, fov: 14, margen: .04 });
    baseNH(R, 0, 0, 0, { color: '#2f3237' });
    const g = R.grupo(); fusibleNH(R, 0, 0, 0, { padre: g, lineas: ['NH00', 'gL 40A', '500V'] }); g.position.set(0, 0, 88);
    R.ancla('pinza', [27, 4.3, 44]); R.ancla('resorte', [-27, 6, 36]); R.ancla('borne', [-47.5, 0, 19]); R.ancla('cuerpo', [-40, 15, 6]);
    R.ancla('cuchilla', [-36, 3, 88]); R.ancla('fusible', [10, 19, 88 + 2]); R.ancla('oreja', [-25, 0, 88 + 39]); R.ancla('indicador', [0, 19.4, 88 + 12]);
    return;
  }
  R.vista({ az: 150, el: 16, fov: 15, margen: .03 });
  gabinete(R, { W, H, P, abre: 0, mat: R.M.pa('#a9adb2', { roughness: .4 }), puertaMat: X.policarb('#e2eef4', .22), pared: 3, radio: 10, puerta: 4,
    placa: { W: 280, H: 380, e: 2, y: 12 }, cierres: [100, 320], bisagras: [70, 350], pie: { a: 34, l: 30, e: 5 }, rotulo: false,
    cables: [{ x: -80, r: 8, largo: 60, D: 22, hex: 28, alto: 28 }, { x: 0, r: 6, largo: 60, D: 18, hex: 24, alto: 26 }, { x: 80, r: 6, largo: 60, D: 18, hex: 24, alto: 26 }] });
  const mNH = new T.Matrix4().makeBasis(new T.Vector3(0, 0, 1), new T.Vector3(1, 0, 0), new T.Vector3(0, 1, 0));
  const xNH = [-110, -70, -30];
  for (const x of xNH) { const g = R.grupo(); g.position.set(x, yP, 300); g.quaternion.setFromRotationMatrix(mNH); baseNH(R, 0, 0, 0, { padre: g, color: '#2f3237' }); fusibleNH(R, 0, 0, 34, { padre: g, lineas: ['NH00', 'gL 40A'] }); }
  // riel con minicontactor, reloj y térmicas
  const g = R.grupo(); g.position.set(0, yP + 7.5, 175 - TM.zM); rielModular(R, -135, 135, TM.zM, g);
  const mc = carcasaMod(R, TM, -125, 2, { padre: g, sinManija: true, color: '#e9e8e3' });
  R.impreso([{ t: 'KM 20 A', s: 1.1 }, 'A1  A2'], 30, 12, [-107, TM.Dn + .06, 48], [-1, 0, 0], [0, 0, 1], { padre: g, color: '#1b1c1f', ppm: 40 });
  const rl = carcasaMod(R, TM, -84, 3, { padre: g, sinManija: true, color: '#efeee9', continuo: true });
  const dial = R.cil([-57, TM.Dn, 44], [-57, TM.Dn + 2.5, 44], 19, R.M.pa('#f4f3ee'), { padre: g, seg: 64 });
  for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; const r0 = 16.5; R.caja(-.7, .7, 0, 1.6, -2.4, 0, R.M.pa(i % 2 ? '#d63a2f' : '#3a3e45'), { padre: R.grupo(g), r: .1 }).parent.position.set(-57 + r0 * Math.cos(a), TM.Dn + 2.5, 44 + r0 * Math.sin(a)); }
  R.impreso(['AT1-R  24 h'], 40, 5, [-57, TM.Dn + .06, 64], [-1, 0, 0], [0, 0, 1], { padre: g, color: '#30343a', ppm: 40 });
  termomagnetica(R, -28, 1, { padre: g, marca: 'C10' }); termomagnetica(R, -8, 1, { padre: g, marca: 'C10' });
  // bornera
  const mB = new T.Matrix4().makeBasis(new T.Vector3(1, 0, 0), new T.Vector3(0, 0, -1), new T.Vector3(0, 1, 0));
  const gC = R.grupo(); gC.position.set(0, yP + 7.5, 70 + 26.5); gC.quaternion.setFromRotationMatrix(mB); riel(R, -130, -20, { padre: gC });
  [R.PAL.grisBPN, R.PAL.grisBPN, R.PAL.grisBPN, R.PAL.celeste, R.PAL.celeste, R.PAL.verde].forEach((c, i) => borne(R, -120 + i * 8.2, c, { padre: gC }));
  const c = (pts, col, r = 2.2) => tubo(R, pts, r, R.M.cable(col), { radial: 10, tension: .1 });
  ['#6e3b1d', '#26282b', '#c8302c'].forEach((col, i) => c([[-80 + (i - 1) * 6, P / 2 - 30, 4], [-80 + (i - 1) * 6, yP + 40, 60], [xNH[i] - 18, yP + 40, 230], [xNH[i], yP + 34, 243]], col));
  ['#6e3b1d', '#26282b', '#c8302c'].forEach((col, i) => c([[xNH[i], yP + 34, 357], [xNH[i], yP + 50, 380], [60, yP + 50, 380], [70, yP + 50, 260], [-118 + i * 6, yP + 40, 222], [-118 + i * 6, yP + 7.5 + TM.cable.y, 175 - TM.zM + 86]], col, 1.8));
  R.ancla('nh', [-70, yP + 60, 300]); R.ancla('fus', [-30, yP + 54, 320]);
  R.ancla('mc', [-107, yP + 7.5 + TM.Dn, 175 + 5]); R.ancla('reloj', [-57, yP + 7.5 + TM.Dn + 2.5, 175 + 1.5]);
  R.ancla('tm', [-19, yP + 7.5 + TM.Dn, 175 + 15]); R.ancla('bornes', [-100, yP + 50, 70]);
  R.ancla('caja', [W / 2, P * .5, H * .8]); R.ancla('tapa', [80, P, 300]); R.ancla('cierre', [W / 2 - 34, P + 4, 320]); R.ancla('prensa', [80, P / 2, -14]);
}
