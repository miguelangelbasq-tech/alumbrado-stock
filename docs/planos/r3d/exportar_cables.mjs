// node exportar_cables.mjs → perfiles_cables.json (misma geometría que el 3D, para las hojas Python del grupo «cables»)
import * as P from './piezas/perfiles_cables.mjs';
import { writeFileSync } from 'fs';
const o = {};
for (const [k, v] of Object.entries(P)) if (typeof v !== 'function') o[k] = v;
writeFileSync(new URL('./perfiles_cables.json', import.meta.url), JSON.stringify(o));
console.log('perfiles_cables.json', Object.keys(o).join(' '));
