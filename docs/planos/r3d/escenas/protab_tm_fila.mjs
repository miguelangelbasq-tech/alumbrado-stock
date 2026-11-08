/* MAT-TERMOMAGNETICAS-1 · en el riel: 4 polos con L1 L2 L3 N, 2 polos y 1 polo alimentados por el peine de pines; el 1 polo cortado */
import { termomagnetica, peineTM } from '../piezas/protab_mod.mjs';
import { rielModular } from '../piezas/fusibles.mjs';
import { TM, PEINE_TM } from '../piezas/perfiles_protab.mjs';
export default function (R) {
  R.vista({ az: 146, el: 22, fov: 13, margen: .03 });
  rielModular(R, -14, 148, TM.zM);
  const C = { L1: '#6e3b1d', L2: '#26282b', L3: '#c8302c', N: '#1f78c0' };
  termomagnetica(R, 0, 4, { marca: 'C25', icc: '10000', cables: { 0: { S: C.L1, largoS: 40 }, 1: { S: C.L2, largoS: 40 }, 2: { S: C.L3, largoS: 40 }, 3: { S: C.N, largoS: 40 } } });
  termomagnetica(R, 74, 2, { marca: 'C20', cables: { 0: { I: C.L1, largoI: 34 }, 1: { I: C.L1, largoI: 34 } } });
  termomagnetica(R, 112, 1, { marca: 'C10', interior: [0], cortar: 0, cables: { 0: { I: C.L1, largoI: 34 } } });
  peineTM(R, 83, 3, { leyenda: '' });
  R.ancla('cuerpo', [10, 20, 84]);
  R.ancla('manija', [36 + 4, 76, 47]);
  R.ancla('visor', [60, TM.Dn, 28]);
  R.ancla('marca', [24, TM.Dn, 58]);
  R.ancla('tornillo', [27, TM.Dr, TM.tornillo.zI]);
  R.ancla('peine', [92, PEINE_TM.y0 + 6.4, 94]);
  R.ancla('pin', [121, 24.5, 78]);
  R.ancla('bobina', [121, 20, 63]);
  R.ancla('arco', [121, 14, 32]);
  R.ancla('riel', [143, -3, TM.zM + 16]);
  R.ancla('traba', [100, 3, -2]);
  R.ancla('cable', [63, TM.cable.y, 122]);
  R.ancla('puntera', [27, TM.cable.y + 2.5, 92]);
  R.ancla('cableI', [92, TM.cable.y, -28]);
  R.ancla('cuatro', [2, 40, 30]);
}
