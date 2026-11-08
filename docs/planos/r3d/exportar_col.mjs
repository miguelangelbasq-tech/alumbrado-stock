// node exportar_col.mjs → perfiles_col.json (grupo «col»): la misma geometría del 3D para las hojas Python
import * as P from './piezas/perfiles_col.mjs';
import { writeFileSync } from 'fs';
const o = {};
for (const [k, v] of Object.entries(P)) if (typeof v !== 'function') o[k] = v;
o.LUM.planta = P.plantaLum(0); o.LUM.plantaIn = P.plantaLum(P.LUM.pared);
writeFileSync(new URL('./perfiles_col.json', import.meta.url), JSON.stringify(o));
console.log('perfiles_col.json', Object.keys(o).join(' '));
