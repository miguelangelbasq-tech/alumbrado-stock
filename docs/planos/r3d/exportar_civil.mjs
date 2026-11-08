// node exportar_civil.mjs → perfiles_civil.json (grupo «civil»: los mismos números del 3D para que el plano los dibuje)
import * as P from './piezas/perfiles_civil.mjs';
import { writeFileSync } from 'fs';
const o = {};
for (const [k, v] of Object.entries(P)) if (typeof v !== 'function') o[k] = v;
writeFileSync(new URL('./perfiles_civil.json', import.meta.url), JSON.stringify(o, null, 1));
console.log('perfiles_civil.json', Object.keys(o).join(' '));
