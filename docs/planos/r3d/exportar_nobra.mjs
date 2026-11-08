// node exportar_nobra.mjs → perfiles_nobra.json (grupo «nobra»: los mismos números del 3D para que el plano los dibuje)
import * as P from './piezas/perfiles_nobra.mjs';
import { secCanal, secTapa } from './piezas/nobra_util.mjs';
import { writeFileSync } from 'fs';
const o = {};
for (const [k, v] of Object.entries(P)) if (typeof v !== 'function') o[k] = v;
o.CANAL60 = { ...o.CANAL60, sec: secCanal(P.CANAL60), tapa: secTapa(P.CANAL60), tapaD: P.CANAL60.tapa };
writeFileSync(new URL('./perfiles_nobra.json', import.meta.url), JSON.stringify(o, null, 1));
console.log('perfiles_nobra.json', Object.keys(o).join(' '));
