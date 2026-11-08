// node exportar_nelec.mjs → perfiles_nelec.json (grupo «nelec»: misma geometría que el 3D, para las hojas Python)
import * as P from './piezas/perfiles_nelec.mjs';
import { writeFileSync } from 'fs';
import pc from 'polygon-clipping';
const ring = p => { const r = p.map(q => [q[0], q[1]]); r.push([p[0][0], p[0][1]]); return r; };
const menos = (c, cavs) => { let r = [[ring(c)]]; for (const k of cavs) r = pc.difference(r, [[ring(k)]]); return r; };
const o = {};
for (const [k, v] of Object.entries(P)) if (typeof v !== 'function') o[k] = v;
o.SECC = {};
for (const k of ['BPN4', 'BPN10', 'BPN16']) {
  const B = P[k], cv = B.cavidades;
  const poz = B.yT.map(y => [[y - B.pozoR, B.puntera.zEje + 9.8 * B.A / 50], [y + B.pozoR, B.puntera.zEje + 9.8 * B.A / 50], [y + B.pozoR, B.A * .78], [y + B.pozoR + 1, B.A * .8], [y - B.pozoR - 1, B.A * .8], [y - B.pozoR, B.A * .78]]);
  o.SECC[k] = menos(B.contorno, [cv.bocaI, cv.jaulaI, cv.bocaD, cv.jaulaD, cv.barra, cv.zocalo, cv.canalPuente, cv.marcado, cv.traba, ...poz]);
}
writeFileSync(new URL('./perfiles_nelec.json', import.meta.url), JSON.stringify(o));
console.log('perfiles_nelec.json', Object.keys(o).join(' '));
