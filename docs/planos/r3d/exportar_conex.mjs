// node exportar_conex.mjs → perfiles_conex.json (grupo «conex»: los mismos números del 3D para que el plano los dibuje)
import * as P from './piezas/perfiles_conex.mjs';
import { writeFileSync } from 'fs';
const o = {};
for (const [k, v] of Object.entries(P)) if (typeof v !== 'function') o[k] = v;
o.TIF = P.TIF.map(p => ({ ...p, collar: P.collarTIF(p), engarce: P.engarceTIF(p) }));
o.NSPERFIL = P.perfilNS(8);
o.CANAL.sec40 = P.seccionCanal(40); o.CANAL.sec30 = P.seccionCanal(30);
o.CANAL.tapa40 = P.seccionTapa(40); o.CANAL.tapa30 = P.seccionTapa(30);
writeFileSync(new URL('./perfiles_conex.json', import.meta.url), JSON.stringify(o));
console.log('perfiles_conex.json', Object.keys(o).join(' '));
