// node exportar_nherr.mjs → perfiles_nherr.json (grupo «nherr»: herramientas; los mismos números y contornos del 3D para el plano)
import * as P from './piezas/perfiles_nherr.mjs';
import { writeFileSync } from 'fs';
const o = {};
for (const [k, v] of Object.entries(P)) if (typeof v !== 'function') o[k] = v;
writeFileSync(new URL('./perfiles_nherr.json', import.meta.url), JSON.stringify(o));
console.log('perfiles_nherr.json', Object.keys(o).join(' '));
