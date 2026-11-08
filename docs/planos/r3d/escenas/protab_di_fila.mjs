/* MAT-DIFERENCIALES-1 · diferencial 4 polos cortado a cuarto (toroide, relé, conductores) y 2 polos al lado, en el riel */
import { diferencial } from '../piezas/protab_mod.mjs';
import { rielModular } from '../piezas/fusibles.mjs';
import { DI } from '../piezas/perfiles_protab.mjs';
export default function (R) {
  R.vista({ az: 140, el: 24, fov: 13, margen: .03 });
  rielModular(R, -52, 86, DI.zM);
  const C = { L1: '#6e3b1d', L2: '#26282b', L3: '#c8302c', N: '#1f78c0' };
  diferencial(R, -38, 2, { sens: '30 mA', inom: '25 A  230V~', cables: { 0: { S: C.L1, I: C.L1, largoS: 30, largoI: 26 }, 1: { S: C.N, I: C.N, largoS: 30, largoI: 26 } } });
  const { xc } = diferencial(R, 0, 4, { sens: '300 mA', inom: '40 A  400V~', interior: true, cortar: [36, 80, -12, 100, 38, 140],
    cables: { 0: { S: C.L1, I: C.L1, largoS: 34, largoI: 26 }, 1: { S: C.L2, I: C.L2, largoS: 34, largoI: 26 }, 2: { I: C.L3, largoI: 26 }, 3: { I: C.N, largoI: 26 } } });
  const t = DI.toroide;
  R.ancla('toroide', [36, t.y + t.R + t.r * .6, t.z + 1]);
  R.ancla('bobinado', [36 - 8, t.y - 8, t.z + t.r]);
  R.ancla('conductor', [44.5, 26, 62]);
  R.ancla('rele', [36, 47, 60]);
  R.ancla('boton', [70, DI.Dn + 1.5, DI.boton.z]);
  R.ancla('manija', [30, 70, 50]);
  R.ancla('sens', [-18, DI.Dn, 62]);
  R.ancla('jaula', [27, 30, 87]);
  R.ancla('tornillo', [27, DI.Dr, DI.tornillo.zI]);
  R.ancla('riel', [82, -3, DI.zM + 16]);
  R.ancla('cable', [63, DI.cable.y, 118]);
  R.ancla('cableI', [-29, DI.cable.y, -18]);
  R.ancla('cuerpo', [10, 40, 5]);
  R.ancla('traba', [-20, 3, -2]);
}
