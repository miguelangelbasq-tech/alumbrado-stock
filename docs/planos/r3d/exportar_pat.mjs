// node exportar_pat.mjs → perfiles_pat.json (misma geometría que el 3D, para las hojas Python del grupo «pat»)
import * as P from './piezas/perfiles_pat.mjs';
import { writeFileSync } from 'fs';
const o = {}; for (const [k, v] of Object.entries(P)) if (typeof v !== 'function') o[k] = v;
writeFileSync(new URL('./perfiles_pat.json', import.meta.url), JSON.stringify(o)); console.log('perfiles_pat.json', Object.keys(o).join(' '));
