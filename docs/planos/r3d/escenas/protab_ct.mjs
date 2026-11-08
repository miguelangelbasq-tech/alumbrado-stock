/* MAT-COMANDO-1 · contactor 25 A entero (frente con los bornes A1-A2 y 13-14 / 21-22) y otro cortado por el polo del medio:
 * electroimán (E fija, E móvil, espira de sombra), bobina 220 V, porta-contactos, puente con pastillas de plata, resortes */
import { contactor } from '../piezas/protab_mod.mjs';
import { rielModular } from '../piezas/fusibles.mjs';
import { CT } from '../piezas/perfiles_protab.mjs';
export default function (R) {
  R.vista({ az: 132, el: 20, fov: 13, margen: .03 });
  rielModular(R, -62, 60, CT.zM);
  const C = { L1: '#6e3b1d', L2: '#26282b', L3: '#c8302c' };
  contactor(R, -50, { cables: { 0: { S: C.L1, I: C.L1 }, 1: { S: C.L2, I: C.L2 }, 2: { S: C.L3, I: C.L3 } } });
  contactor(R, 0, { interior: true, sinRotulos: true, cortar: [22.5, 60, -12, 110, -14, 130], cables: { 0: { S: C.L1, I: C.L1, largoS: 24, largoI: 24 } } });
  const x = 22.6, N = CT.nucleo, B = CT.bobina;
  R.ancla('nucleoF', [x, 6.5, 62]);
  R.ancla('nucleoM', [x, 33.5, 62]);
  R.ancla('espira', [x, 22.5, 39.4]);
  R.ancla('bobina', [x, 16, 31]);
  R.ancla('porta', [x, 50, 42.5]);
  R.ancla('puente', [x, 70.6, 50]);
  R.ancla('pastilla', [x, 67.2, 57.8]);
  R.ancla('fijo', [x, 55, 60.2]);
  R.ancla('resorte', [6, 40, 45]);
  R.ancla('jaula', [x, 43, 76]);
  R.ancla('A1', [-42, CT.Dn, 70]);
  R.ancla('aux', [-27.5, CT.Dn, 70]);
  R.ancla('marca', [-27.5, CT.Dn, 53]);
  R.ancla('tornillo', [-42.5, CT.Dr, CT.tornillo.zS]);
  R.ancla('riel', [56, -3, CT.zM + 16]);
  R.ancla('cable', [-42.5, CT.cable.y, 112]);
}
