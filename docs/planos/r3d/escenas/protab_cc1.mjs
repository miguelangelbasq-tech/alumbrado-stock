/* MAT-CAJA_COLUMNA-1 · caja estanca de aluminio inyectado 200 × 150 × 100 IP65 (6003) en la columna existente (AP-PL-003):
 * 2 abrazaderas, tapa sacada adelante (junta y 4 tornillos imperdibles), adentro el tablerito AP-CC-014 (riel, BPN, 2 tabaqueras, bulón PAT),
 * prensacable abajo con el cable que entra. Medidas de la caja: ficha; el resto (*). */
import { posteSemi } from '../piezas/protab_caja.mjs';
import { MX, bandeja, placaRed, prensacable, hexa, tubo } from '../piezas/protab_util.mjs';
import { CAJA_AL } from '../piezas/perfiles_protab.mjs';
import { portafusible, rielModular } from '../piezas/fusibles.mjs';
import { riel, borne } from '../piezas/bpn.mjs';
import { TAB, F10x38 } from '../piezas/perfiles.mjs';
export default function (R, PRM = {}) {
  const T = R.THREE, X = MX(R), C = CAJA_AL, W = C.W, H = C.H, P = C.P, e = C.pared, tp = C.tapa;
  const al = X.aluFund();
  R.vista(PRM.tapa ? { az: 118, el: 24, fov: 14, margen: .04 } : { az: 148, el: 18, fov: 15, margen: .03 });
  bandeja(R, -W / 2, W / 2, 0, P - tp, 0, H, e, C.radio, al, { bisel: 1 }) && PRM.tapa;
  for (const [sx, sz] of (PRM.tapa ? [[-1, -1], [1, -1], [-1, 1], [1, 1]] : [])) {
    const x = sx * (W / 2 - C.tornillos.off), z = H / 2 + sz * (H / 2 - C.tornillos.off);
    R.cil([x, e - .2, z], [x, P - tp, z], 6.5, al, { seg: 32 }); R.cil([x, e, z], [x, P - tp + .1, z], 2.1, R.M.oscuro(), { seg: 16 });
  }
  if (!PRM.tapa) {
    // columnas de esquina con rosca para los tornillos de la tapa + orejas de fijación atrás
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const x = sx * (W / 2 - C.tornillos.off), z = H / 2 + sz * (H / 2 - C.tornillos.off);
      R.cil([x, e - .2, z], [x, P - tp, z], 6.5, al, { seg: 32 });
      R.cil([x, P - tp - .1, z], [x, P - tp + .05, z], 2.5, R.M.oscuro(), { seg: 16 });
    }
    // tablerito AP-CC-014 (chapa galvanizada) atornillado a los resaltes del fondo
    const yF = 12; R.caja(-70, 70, yF - 2, yF, 25, 125, X.galv(), { r: 1 });
    for (const [x, z] of [[-60, 35], [60, 115]]) { R.cil([x, e, z], [x, yF - 2, z], 5, al, { seg: 24 }); R.tornillo([x, yF + 2.2, z], [0, 1, 0], { M: 4, L: 3, dk: 7.5, k: 2.2, tipo: 'pozi', mat: X.galv() }); }
    const g = R.grupo(); g.position.set(0, yF + 7.5, 75 - TAB.zM); rielModular(R, -66, 66, TAB.zM, g);
    portafusible(R, TAB, F10x38, -2, { padre: g, rotulos: { frente: '10x38' } }); portafusible(R, TAB, F10x38, 16, { padre: g, rotulos: { frente: '10x38' } });
    const mB = new T.Matrix4().makeBasis(new T.Vector3(1, 0, 0), new T.Vector3(0, 0, -1), new T.Vector3(0, 1, 0));
    const gB = R.grupo(); gB.position.set(0, yF + 7.5, 75 + 26.5); gB.quaternion.setFromRotationMatrix(mB);
    [R.PAL.grisBPN, R.PAL.grisBPN, R.PAL.celeste, R.PAL.verde].forEach((c, i) => borne(R, -60 + i * 8.2, c, { padre: gB }));
    // bulón de PAT
    R.cil([50, yF, 50], [50, yF + 24, 50], 4, X.latonNiq(), { seg: 20 }); hexa(R, [50, yF, 50], [50, yF + 5, 50], 13, X.latonNiq(), { hueco: 4 }); hexa(R, [50, yF + 12, 50], [50, yF + 17, 50], 13, X.latonNiq(), { hueco: 4 });
    // prensacable abajo y el cable (4 x 6 (*)) que entra
    prensacable(R, [-30, P / 2 - 8, 0], [0, 0, -1], { D: C.prensa.Dr, hex: C.prensa.hex, alto: C.prensa.alto, pared: e, mat: X.aluLiso(), cable: { r: 5.5, largo: 80, colores: true, vaina: '#25272a', adentro: 18 } });
    const cc = ['#6e3b1d', '#1f78c0', '#13843a'];
    cc.forEach((c, i) => tubo(R, [[-30 + (i - 1) * 2.4, P / 2 - 8, 24], [-30 + (i - 1) * 2.4, P / 2 - 8 + 6, 40], [-50 + i * 8.2 + 4.1, yF + 40, 52], [-56 + i * 8.2 + 4.1, yF + 7.5 + 12, 49]], 1.5, R.M.cable(c), { radial: 10 }));
    // columna existente y 2 abrazaderas
    posteSemi(R, -64, 57, -70, H + 90, [30, 120], { yGab: 0, mat: X.galv() });
  }
  // tapa con la junta y los 4 tornillos imperdibles (afuera, adelante)
  const gt = R.grupo(); gt.position.set(PRM.tapa ? 0 : W / 2 + 150, PRM.tapa ? P - tp : P + 40, 0); if (!PRM.tapa) gt.rotation.z = Math.PI - .55;
  placaRed(R, -W / 2, W / 2, 0, H, 0, tp, C.radio, al, { padre: gt, bisel: 1.5 });
  placaRed(R, -W / 2 + e + 1, W / 2 - e - 1, e + 1, H - e - 1, -5, 5, C.radio - 4, al, { padre: gt, bisel: .4, huecos: [{ x: 0, z: H / 2, w: W - 2 * e - 8, h: H - 2 * e - 8, rad: 4 }] });
  placaRed(R, -W / 2 + e + 1.6, W / 2 - e - 1.6, e + 1.6, H - e - 1.6, -6.4, 1.5, C.radio - 4, X.junta(), { padre: gt, bisel: .3, huecos: [{ x: 0, z: H / 2, w: W - 2 * e - 3.2 - 2 * C.junta, h: H - 2 * e - 3.2 - 2 * C.junta, rad: 3 }] });
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const x = sx * (W / 2 - C.tornillos.off), z = H / 2 + sz * (H / 2 - C.tornillos.off);
    R.tornillo([x, tp + 1.2, z], [0, 1, 0], { M: C.tornillos.M, L: 16, dk: 9, k: 3.5, tipo: 'combi', mat: X.galv(), padre: gt });
  }
  R.impreso(['IP65'], 30, 10, [0, tp + .05, H / 2], [-1, 0, 0], [0, 0, 1], { padre: gt, color: '#5d646b', ppm: 20 });
  if (PRM.tapa) {
    R.raiz.updateMatrixWorld(true); R.cortar(R.raiz, [W / 2 - C.tornillos.off, W / 2 + 20, -20, P + 30, H / 2, H + 20]);
    const x1 = W / 2 - C.tornillos.off; R.ancla('tornillo', [x1, P + 1, H - 11]); R.ancla('rosca', [x1, P - tp - 20, H - 11]); R.ancla('junta', [x1, P - tp - 4.5, H - e - 3]); R.ancla('tapa', [0, P, H * .3]);
    R.ancla('reborde', [x1, P - tp - 3, H - 20]); R.ancla('pared', [x1, P * .5, H - 2]); R.ancla('columna', [x1, 30, H - 11]); R.ancla('fondo', [x1, 2, H * .65]);
    return;
  }
  R.ancla('caja', [-W / 2, P * .5, H * .85]); const tl = (x, y, z) => { const v = new T.Vector3(x, y, z).applyMatrix4(gt.matrixWorld); return [v.x, v.y, v.z]; }; gt.updateMatrixWorld(true);
  R.ancla('tapa', tl(-60, -5, H * .75)); R.ancla('junta', tl(W / 2 - 9, -6.5, 60)); R.ancla('tornillo', tl(-W / 2 + 11, -10, 139));
  R.ancla('tablerito', [-62, 12, 32]); R.ancla('tabaquera', [7, 19.5 + 61, 75]); R.ancla('bpn', [-50, 19.5 + 45, 75]); R.ancla('pat', [50, 34, 50]);
  R.ancla('prensa', [-30, P / 2 - 8, -20]); R.ancla('cable', [-30, P / 2 - 3, -70]); R.ancla('abraz', [57, -40, 120]); R.ancla('columna', [0, -64, H + 70]); R.ancla('rosca', [W / 2 - 11, P - tp, 139]);
}
