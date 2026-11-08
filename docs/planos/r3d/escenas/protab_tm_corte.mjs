/* MAT-TERMOMAGNETICAS-1 · un polo cortado por el plano medio: bobina, percutor, contactos, cámara de arco, bimetal, malla, manija, jaulas */
import { termomagnetica } from '../piezas/protab_mod.mjs';
import { rielModular } from '../piezas/fusibles.mjs';
import { TM } from '../piezas/perfiles_protab.mjs';
export default function (R) {
  R.vista({ az: 118, el: 16, fov: 13, margen: .03 });
  rielModular(R, -6, 24, TM.zM);
  termomagnetica(R, 0, 1, { interior: [0], cortar: 0, cables: { 0: { S: '#6e3b1d', I: '#6e3b1d', largoS: 22, largoI: 22 } } });
  const x = 9.05, b = TM.bobina;
  R.ancla('bobina', [x, 18, b.z + b.rE - .3]);
  R.ancla('percutor', [x, 34.5, b.z + 1.5]);
  R.ancla('yugo', [x, 7.6, 60]);
  R.ancla('fijo', [x, 38, 45.2]);
  R.ancla('movil', [x, 44, 40.5]);
  R.ancla('arco', [x, 14, 30]);
  R.ancla('cuerno', [x, 31, 42.7]);
  R.ancla('bimetal', [x, 40.4, 24]);
  R.ancla('malla', [x, 43.8, 37]);
  R.ancla('cerrojo', [x, 50, 30]);
  R.ancla('manija', [x - 2, 74, 47]);
  R.ancla('jaulaS', [x, 22.6, 76]);
  R.ancla('tornillo', [x, 41, 10]);
  R.ancla('puntera', [x, TM.cable.y + 2.5, 92]);
  R.ancla('cable', [x, TM.cable.y + 2.5, -16]);
  R.ancla('riel', [-4, -3, TM.zM + 16]);
  R.ancla('traba', [x, 3, -2]);
  R.ancla('visor', [x - 1, TM.Dn, 28]);
}
