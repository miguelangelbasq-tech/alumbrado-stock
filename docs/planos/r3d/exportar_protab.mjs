// node exportar_protab.mjs → perfiles_protab.json (grupo «protab»): los mismos contornos del 3D + secciones por el plano medio
import * as P from './piezas/perfiles_protab.mjs';
import { writeFileSync } from 'fs';
import pc from 'polygon-clipping';
const ring = p => { const r = p.map(q => [q[0], q[1]]); r.push([p[0][0], p[0][1]]); return r; };
const menos = (c, cavs) => { let r = [[ring(c)]]; for (const k of cavs) r = pc.difference(r, [[ring(k)]]); return r; };
const mas = (...ps) => pc.union(...ps.map(p => [[ring(p)]]));
const rect = P.rect;
const o = {};
for (const [k, v] of Object.entries(P)) if (typeof v !== 'function') o[k] = v;
const pozo = (S, z) => [[S.tornillo.yCab - 3.5, z - (S.tornillo.pozo - .9)], [S.Dr - 2.2, z - (S.tornillo.pozo - .9)], [S.Dr - 1.2, z - S.tornillo.pozo], [S.Dr + .5, z - S.tornillo.pozo],
  [S.Dr + .5, z + S.tornillo.pozo], [S.Dr - 1.2, z + S.tornillo.pozo], [S.Dr - 2.2, z + (S.tornillo.pozo - .9)], [S.tornillo.yCab - 3.5, z + (S.tornillo.pozo - .9)]];
o.SECC = {};
for (const [k, S] of [['tm', P.TM], ['di', P.DI], ['ct', P.CT]]) {
  o.SECC[k] = menos(S.contorno, [S.ranuraTraba, ...S.camara, ...S.bolsillo, ...S.boca, ...(S.ranuraManija ? [S.ranuraManija] : []), pozo(S, S.tornillo.zS), pozo(S, S.tornillo.zI)]);
  o.SECC[k + 'Lleno'] = menos(S.contorno, [S.ranuraTraba]);
  o.SECC[k + 'Pozos'] = [pozo(S, S.tornillo.zS), pozo(S, S.tornillo.zI)];
}
writeFileSync(new URL('./perfiles_protab.json', import.meta.url), JSON.stringify(o, null, 0));
console.log('perfiles_protab.json', Object.keys(o).join(' '));
