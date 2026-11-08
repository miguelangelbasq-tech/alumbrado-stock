// node exportar_nfin.mjs → perfiles_nfin.json (grupo «nfin»)
import * as P from './piezas/perfiles_nfin.mjs';
import { writeFileSync } from 'fs';
const o = {}; for (const [k, v] of Object.entries(P)) if (typeof v !== 'function') o[k] = v;
writeFileSync(new URL('./perfiles_nfin.json', import.meta.url), JSON.stringify(o, null, 1));
console.log('perfiles_nfin.json', Object.keys(o).join(' '));
