/* MAT-TERMOMAGNETICAS-2 · en el riel: 4 × 40 A (3095), iK60N 2 × 20 A C (3097), 1 × 16 A C (3093), 1 × 20 A (3074). Piezas de protab_mod (no se tocan) */
import { termomagnetica } from '../piezas/protab_mod.mjs';
import { rielModular } from '../piezas/fusibles.mjs';
import { TM } from '../piezas/perfiles_protab.mjs';
export default function (R, PRM = {}) {
  const C = { L1: '#6e3b1d', L2: '#26282b', L3: '#c8302c', N: '#1f78c0' };
  if (PRM.corte) {
    R.vista({ az: 112, el: 18, fov: 13, margen: .03 });
    rielModular(R, -6, 24, TM.zM);
    termomagnetica(R, 0, 1, { marca: 'C16', interior: [0], cortar: 0, cables: { 0: { S: C.L1, I: C.L1, largoS: 24, largoI: 24 } } });
    const x = 9.05, b = TM.bobina;
    R.ancla('bobina', [x, 18, b.z + b.rE - .3]); R.ancla('fijo', [x, 38, 45.2]); R.ancla('arco', [x, 14, 30]); R.ancla('bimetal', [x, 40.4, 24]);
    R.ancla('manija', [x - 2, 74, 47]); R.ancla('jaulaS', [x, 22.6, 76]); R.ancla('cable', [x, TM.cable.y + 2.5, 100]); R.ancla('riel', [-4, -3, TM.zM + 16]);
    return;
  }
  R.vista({ az: 146, el: 22, fov: 13, margen: .03 });
  rielModular(R, -14, 168, TM.zM);
  termomagnetica(R, 0, 4, { marca: '40 A', icc: ' ', cables: { 0: { S: C.L1, I: C.L1, largoS: 40, largoI: 30 }, 1: { S: C.L2, I: C.L2, largoS: 40, largoI: 30 }, 2: { S: C.L3, I: C.L3, largoS: 40, largoI: 30 }, 3: { S: C.N, I: C.N, largoS: 40, largoI: 30 } } });
  termomagnetica(R, 82, 2, { marca: 'iK60N C20', icc: '6000', cables: { 0: { S: C.L1, largoS: 34 }, 1: { S: C.N, largoS: 34 } } });
  termomagnetica(R, 126, 1, { marca: 'C16', icc: ' ', cables: { 0: { S: C.L1, largoS: 34 } } });
  termomagnetica(R, 150, 1, { marca: '20 A', icc: ' ', cables: { 0: { S: C.L1, largoS: 34 } } });
  R.ancla('tm4', [36, TM.Dn, 58]); R.ancla('ik', [100, TM.Dn, 58]); R.ancla('c16', [135, TM.Dn, 58]); R.ancla('c20', [159, TM.Dn, 58]);
  R.ancla('manija', [100, 76, 47]); R.ancla('visor', [9, TM.Dn, 25]); R.ancla('tornillo', [27, TM.Dr, TM.tornillo.zS]);
  R.ancla('riel', [164, -3, TM.zM + 16]); R.ancla('traba', [134, 3, -2]); R.ancla('cable', [63, TM.cable.y, 122]); R.ancla('cableI', [9, TM.cable.y, -24]);
}
