/* MAT-DIFERENCIALES-1 · el toroide solo: anillo de ferrita con el bobinado secundario, los 4 conductores (L1 L2 L3 N) que lo atraviesan y el relé */
import { toroideDI } from '../piezas/protab_mod.mjs';
import { DI } from '../piezas/perfiles_protab.mjs';
export default function (R) {
  R.vista({ az: 128, el: 22, fov: 14, margen: .04 });
  R.config({ piso: 8 });
  const xm = [9, 27, 45, 63];
  toroideDI(R, xm, 36, 61, undefined);
  const t = DI.toroide;
  R.ancla('ferrita', [36 + t.R * Math.cos(-1.9), t.y + t.R * Math.sin(-1.9), t.z - t.r + .4]);
  R.ancla('bobinado', [36 + (t.R + t.r) * Math.cos(.9), t.y + (t.R + t.r) * Math.sin(.9), t.z + 1]);
  R.ancla('L1', [9, 29, 74]); R.ancla('N', [63, 29, 74]);
  R.ancla('rele', [36, 47, 61]);
  R.ancla('res', [61, 50, 31]);
  R.ancla('hilos', [36 + 8, 31, 52]);
}
