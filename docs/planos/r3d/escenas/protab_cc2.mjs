/* MAT-CAJA_COLUMNA-2 · fondo de chapa galvanizada 230 × 95 × 2 (3011) armado como tablerito AP-CC-014: riel NS35 con 2 tornillos,
 * 2 tabaqueras 10×38, bornes BPN 6 (gris · celeste · verde), bulón de PAT, cables que entran por abajo y el acrílico de protección adelante (ETG 16.1).
 * PRM.juego: los fondos del pañol uno al lado del otro (3009, 3010, 3011, 6009 y el tablerito PRFV 80 × 130 de la columna). */
import { MX, hexa, tubo, placaRed } from '../piezas/protab_util.mjs';
import { FONDOS } from '../piezas/perfiles_protab.mjs';
import { portafusible, rielModular } from '../piezas/fusibles.mjs';
import { borne } from '../piezas/bpn.mjs';
import { TAB, F10x38, NS35 } from '../piezas/perfiles.mjs';
export default function (R, PRM = {}) {
  const T = R.THREE, X = MX(R), F = FONDOS;
  const chapa = (x0, z0, f, mat, op = {}) => {
    placaRed(R, x0, x0 + f.W, z0, z0 + f.H, -f.e, f.e, op.r ?? 2, mat, { bisel: .3, huecos: (op.agujeros || []).map(([x, z]) => ({ x: x0 + x, z: z0 + z, r: F.agujero / 2 })) });
  };
  if (PRM.juego) {
    R.vista({ az: 196, el: 14, fov: 14, margen: .03 });
    const L = [['f3009', X.galv(), 'riel'], ['f3010', X.chapaNegra()], ['f3011', X.galv()], ['f6009', X.galv()], ['prfv', R.M.pa('#5f6468', { roughness: .45, clearcoat: .3 })]];
    let x = 0; const pos = {};
    for (const [k, m, extra] of L) {
      const f = F[k], vert = f.H > f.W, z0 = 0;
      chapa(x, z0, f, m, { agujeros: vert ? [[f.W / 2, 8], [f.W / 2, f.H - 8]] : [[8, f.H / 2], [f.W - 8, f.H / 2]], r: k === 'prfv' ? 6 : 2 });
      if (extra === 'riel') {
        const g = R.grupo(); 
        if (vert) { g.position.set(x + f.W / 2, 0, 0); g.rotation.y = Math.PI / 2; rielModular(R, -f.H + 20, -20, 0, g); g.position.set(x + f.W / 2 - 17.5 + 17.5, 0, 0); }
        else { const g2 = R.grupo(); g2.position.set(0, 7.5, f.H / 2 - 17.5 + 17.5 - 17.5); rielModular(R, x + 20, x + f.W - 20, 17.5, g2); }
      }
      pos[k] = [x + f.W / 2, f.H]; x += f.W + 18;
    }
    for (const [k, [xc, h]] of Object.entries(pos)) R.ancla(k, [xc, 0, h - 4]);
    return;
  }
  R.vista({ az: 152, el: 20, fov: 14, margen: .03 });
  const f = F.f3011, x0 = -f.W / 2;
  chapa(x0, 0, f, X.galv(), { agujeros: [[8, f.H / 2], [f.W - 8, f.H / 2]] });
  const g = R.grupo(); g.position.set(0, 7.5, f.H / 2 - TAB.zM); rielModular(R, -95, 95, TAB.zM, g);
  for (const x of [-85, 85]) R.tornillo([x, 2.2, f.H / 2], [0, 1, 0], { M: 6, L: 4, dk: 10.5, k: 3.2, tipo: 'pozi', mat: X.galv() });   // cabeza tanque 6 × 3/8 (AP-CC-014)
  portafusible(R, TAB, F10x38, -70, { padre: g, rotulos: { frente: '10x38' } }); portafusible(R, TAB, F10x38, -52, { padre: g, rotulos: { frente: '10x38' } });
  const mB = new T.Matrix4().makeBasis(new T.Vector3(1, 0, 0), new T.Vector3(0, 0, -1), new T.Vector3(0, 1, 0));
  const gB = R.grupo(); gB.position.set(0, 7.5, f.H / 2 + 26.5); gB.quaternion.setFromRotationMatrix(mB);
  const cols = [R.PAL.grisBPN, R.PAL.grisBPN, R.PAL.celeste, R.PAL.verde];
  cols.forEach((c, i) => borne(R, -20 + i * 8.2, c, { padre: gB, marca: ['S', 'T', 'N', 'PE'][i] }));
  // bulón de PAT (M8 (*)) con tuercas y arandelas
  R.cil([70, -2, f.H / 2], [70, 26, f.H / 2], 4, X.latonNiq(), { seg: 20 }); for (const y of [0, 10]) hexa(R, [70, y, f.H / 2], [70, y + 6, f.H / 2], 13, X.latonNiq(), { hueco: 4 });
  // cables que entran por abajo (troncal 4 x 4 (*)) a las bocas de los bornes
  const cc = ['#6e3b1d', '#26282b', '#1f78c0', ['#13843a', '#f2c418']];
  cc.forEach((c, i) => { const x = -20 + i * 8.2 + 4.1; tubo(R, [[x + (i - 1.5) * 4, 40, -70], [x, 40, -30], [x, 7.5 + 12, f.H / 2 - 26.5 - 6], [x, 7.5 + 12, f.H / 2 - 26.5 + 2]], 2.2, R.M.cable(Array.isArray(c) ? c[0] : c), { radial: 12 }); });
  // acrílico de protección adelante sobre 2 separadores (*)
  for (const x of [-100, 100]) R.cil([x, 0, f.H / 2], [x, 85, f.H / 2], 3.5, R.M.pa('#e6e4dc'), { seg: 20 });
  const ac = placaRed(R, -f.W / 2 - 5, f.W / 2 + 5, -5, f.H + 5, 85, 3, 4, X.policarb('#d8ecf6', .25), { bisel: .4 }); ac.userData.noEncuadre = false;
  R.ancla('fondo', [-105, -1, f.H - 8]); R.ancla('riel', [88, 3, f.H / 2 + 10]); R.ancla('torn', [-85, 4, f.H / 2]); R.ancla('tab', [-60, 7.5 + 61, f.H / 2 + 10]);
  R.ancla('bpn', [-6, 7.5 + 50, f.H / 2 + 2]); R.ancla('pat', [70, 22, f.H / 2]); R.ancla('cable', [-14, 40, -50]); R.ancla('acril', [60, 88, f.H]); R.ancla('sep', [100, 60, f.H / 2]);
}
