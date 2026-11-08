// node exportar_perfiles.mjs → perfiles.json (los mismos contornos del 3D, para que el plano los dibuje)
import * as P from './piezas/perfiles.mjs';
import { writeFileSync } from 'fs';
import pc from 'polygon-clipping';
const ring = p => { const r = p.map(q => [q[0], q[1]]); r.push([p[0][0], p[0][1]]); return r; };
const menos = (c, cavs) => { let r = [[ring(c)]]; for (const k of cavs) r = pc.difference(r, [[ring(k)]]); return r; };
const rect = (y0, y1, z0, z1) => [[y0, z0], [y1, z0], [y1, z1], [y0, z1]];
const o = {};
for (const [k, v] of Object.entries(P)) if (typeof v !== 'function') o[k] = v;
o.PEINE.anchos = Object.fromEntries([2, 3, 4, 10].map(n => [n, P.PEINE.anchoDe(n)]));
// carro de la tabaquera abierto (para el plano: recorrido de apertura)
for (const k of ['TAB', 'BASE831']) { const T = P[k]; T.carroAbierto = T.carro.map(p => P.rot(p, T.pivote, T.abre)); }
P.B520.palancaAbierta = P.B520.palanca.map(p => P.rot(p, P.B520.pivote, -P.B520.abre));
// secciones por el plano medio (lo que se raya en los cortes)
const B = P.BPN, cv = B.cavidades, T = P.TAB, BA = P.BASE831;
const bajo = c => c.map(([y, z]) => [y, Math.min(z, 36)]);
o.SECC = {
  bpn: menos(B.contorno, [cv.bocaI, cv.jaulaI, cv.bocaD, cv.jaulaD, cv.barra, cv.zocalo, cv.canalPuente, cv.marcado, cv.traba, cv.pozoI, cv.pozoD]),
  bpnPozoRedondo: B.yT.map(y => [[y - 3.4, 21], [y + 3.4, 21], [y + 3.4, 39.1], [y + 4.3, 40.2], [y - 4.3, 40.2], [y - 3.4, 39.1]]),
};
for (const [k, X] of [['tab', T], ['base', BA]]) {
  const boc = [rect(X.boca.y[0], X.boca.y[1], X.H - 17, X.H + 1), rect(X.boca.y[0], X.boca.y[1], -1, 17)];
  const poz = [X.tornillo.z, X.H - X.tornillo.z].map(z => [[37.5, z - 3.3], [X.Dr - 1.6, z - 3.3], [X.Dr + .3, z - 4.3], [X.Dr + .3, z + 4.3], [X.Dr - 1.6, z + 3.3], [37.5, z + 3.3]]);
  o.SECC[k] = menos(X.nucleo, [X.cav.jaulaS, X.cav.jaulaI, X.cav.canalS, X.cav.canalI, ...boc, ...poz]);
}
o.SECC.b520 = menos(P.B520.contorno, [...P.B520.cav, ...P.B520.yT.map(y => rect(y - 3.4, y + 3.4, 21.6, 34))]);
writeFileSync(new URL('./perfiles.json', import.meta.url), JSON.stringify(o, null, 0));
console.log('perfiles.json', Object.keys(o).join(' '));
