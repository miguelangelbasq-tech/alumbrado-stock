// node exportar_nepp.mjs → perfiles_nepp.json (misma geometría que el 3D, para las hojas Python del grupo «nepp»)
import * as P from './piezas/perfiles_nepp.mjs';
import pc from 'polygon-clipping';
import { writeFileSync } from 'fs';
const o = {}; for (const [k, v] of Object.entries(P)) if (typeof v !== 'function') o[k] = v;
const ring = (p) => { const r = p.map(q => [q[0], q[1]]); r.push(r[0]); return r; };
o.CONTORNO = {}; for (const k of Object.keys(P.GUANTES)) { const L = P.piezasGuante(k); o.CONTORNO[k] = pc.union(...L.map(p => [[ring(p)]])); }
o.DEDOS = {}; for (const k of Object.keys(P.GUANTES)) o.DEDOS[k] = P.dedosDe(P.GUANTES[k].s);
o.LENTE = P.lenteSuave(); o.PINZA_C = P.pinzaContorno(); o.TAP_P = P.tapPerfil(); o.GANCHO_L = P.ganchoLinea(); o.MOSQ_L = P.mosqLinea();
writeFileSync(new URL('./perfiles_nepp.json', import.meta.url), JSON.stringify(o)); console.log('perfiles_nepp.json', Object.keys(o).join(' '));
