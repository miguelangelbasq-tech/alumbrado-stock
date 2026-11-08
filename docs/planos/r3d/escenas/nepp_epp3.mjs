/* MAT-EPP-3 · equipo de altura: 9032 cabo de vida con amortiguador (cuerda), 9034 cola de amarre con amortiguador (cinta, kit CR 45),
 * 9033 cinturón de posicionamiento con 2 anillos D y su cola de amarre de cinta plana 2 m. Todo apoyado en el piso, en «S» (largo real 2 m). */
import { matsN, escala, tubo, cinta, mosqueton, gancho, anilloD } from '../piezas/nepp.mjs';
import { ALT } from '../piezas/perfiles_nepp.mjs';
export default function (R) {
  const E = escala(R, .02); R.ancla = E.ancla;
  R.vista({ az: -8, el: 58, fov: 14, margen: .03 });
  R.config({ bordeOp: .25, exposicion: .95 });
  const M = matsN(R), A = ALT, cz = A.cinta.e / 2 + .2, rz = A.cuerda.d / 2;
  // recorrido en «S»: tramos verticales de largo L, separados w, con vueltas de radio w/2
  const serp = (x0, y0, L, w, n, z) => { const p = []; let y = y0, dir = 1;
    for (let i = 0; i < n; i++) { const xi = x0 + i * w; p.push([xi, y, z]); y += dir * L; p.push([xi, y, z]);
      if (i < n - 1) for (let k = 1; k < 6; k++) { const t = Math.PI * k / 6; p.push([xi + w / 2 - w / 2 * Math.cos(t), y + dir * w / 2 * Math.sin(t), z]); }
      dir = -dir; }
    return p; };
  const barra = (x, y, a, dir = [0, 1]) => R.caja(x - a / 2 + 4, x + a / 2 - 4, y - 9, y + 9, A.cinta.e / 2 + .1, A.cinta.e / 2 + 1.2 + .6, M.costura, { r: .4 });
  const absorbedor = (x, y0, txt) => {
    const Ab = A.absorbedor; R.caja(x - Ab.a / 2, x + Ab.a / 2, y0, y0 + Ab.L, 0, Ab.e, M.bolsa, { r: 8 });
    R.impreso([{ t: 'ABSORBEDOR', s: .7 }, { t: 'EN 355', s: 1 }, { t: txt, s: .6 }], Ab.a - 12, 70, [x, y0 + Ab.L / 2, Ab.e + .05], [0, 1, 0], [-1, 0, 0], { fondo: '#e2e4e6', color: '#151618' });
  };
  // ---------- 9032 cabo de vida (cuerda) ----------
  const x1 = -700, yb = -330;
  mosqueton(R, [x1 - 28, yb - 40, rz], [1, 0, 0], [0, -1, 0]);
  const pc = serp(x1, yb, 880, 130, 2, rz); pc.unshift([x1, yb - 40, rz]);
  tubo(R, pc, rz, M.cuerda, { tension: .3 });
  pc.push([x1 + 130, yb - 46, rz]);
  absorbedor(x1 + 130, yb + 90, 'CABO DE VIDA');
  const g1 = gancho(R, [x1 + 130, yb - 30, A.gancho.d / 2], [-1, 0, 0], [0, -1, 0]);
  // ---------- 9034 cola de amarre con amortiguador (cinta roja) ----------
  const x2 = -400;
  mosqueton(R, [x2 - 28, yb - 40, cz + 3], [1, 0, 0], [0, -1, 0]);
  const pr = serp(x2, yb, 880, 130, 2, cz); pr.unshift([x2, yb - 40, cz]);
  cinta(R, pr, A.cinta.a * .8, A.cinta.e, M.cintaR, { tension: .3 });
  pr.push([x2 + 130, yb - 46, cz]);
  absorbedor(x2 + 130, yb + 90, 'CR 45 (*)');
  gancho(R, [x2 + 130, yb - 30, A.gancho.d / 2], [-1, 0, 0], [0, -1, 0]);
  barra(x2, yb + 10, A.cinta.a * .8); barra(x2 + 130, yb + 330, A.cinta.a * .8);
  // ---------- 9033 cinturón de posicionamiento ----------
  const cx = 160, cy = 160, ra = 240, rb = 150, Cb = A.cinturon;
  const pb = []; for (let i = 0; i <= 60; i++) { const t = -Math.PI / 2 + .1 + (2 * Math.PI - .2) * i / 60; pb.push([cx + ra * Math.cos(t), cy + rb * Math.sin(t), Cb.e / 2]); }
  cinta(R, pb, Cb.a * .6, Cb.e, M.cintaN, { tension: .5 });
  // almohadilla de la espalda (más ancha)
  const pa = []; for (let i = 0; i <= 24; i++) { const t = Math.PI / 2 - .9 + 1.8 * i / 24; pa.push([cx + (ra + 4) * Math.cos(t), cy + (rb + 4) * Math.sin(t), Cb.e / 2 - 1]); }
  cinta(R, pa, Cb.a * 1.6, Cb.e + 6, M.bolsa, { tension: .5 });
  // hebilla adelante
  for (const [a0, a1] of [[-Cb.hebilla / 2, -Cb.hebilla / 2 + 7], [Cb.hebilla / 2 - 7, Cb.hebilla / 2]]) R.caja(cx + a0, cx + a1, cy - rb - 30, cy - rb + 30, 0, 7, M.acero, { r: 2.5 });
  for (const yy of [-30, 23]) R.caja(cx - Cb.hebilla / 2, cx + Cb.hebilla / 2, cy - rb + yy, cy - rb + yy + 7, 0, 7, M.acero, { r: 2.5 });
  R.cil([cx, cy - rb - 4, 9], [cx, cy - rb - 4 - 30, 9], 2.2, M.acero);
  // anillos D a los costados (hacia afuera)
  anilloD(R, [cx + ra + 2, cy, 5], [0, 1, 0], [1, 0, 0]); anilloD(R, [cx - ra - 2, cy, 5], [0, -1, 0], [-1, 0, 0]);
  // ---------- 9033 cola de amarre de cinta plana 2 m (azul) ----------
  const x4 = 520;
  mosqueton(R, [x4 - 28, yb - 40, cz + 3], [1, 0, 0], [0, -1, 0]);
  const pz = serp(x4, yb, 880, 130, 2, cz); pz.unshift([x4, yb - 40, cz]); pz.push([x4 + 130, yb - 40, cz]);
  cinta(R, pz, A.cinta.a * .8, A.cinta.e, M.cintaN, { tension: .3 });
  mosqueton(R, [x4 + 130 + 28, yb - 40, cz + 3], [-1, 0, 0], [0, -1, 0]);
  barra(x4, yb + 10, A.cinta.a * .8); barra(x4 + 130, yb + 10, A.cinta.a * .8);
  // anclas
  R.ancla('cuerda', [x1, yb + 500, rz * 2]);
  R.ancla('absorb1', [x1 + 130 + 20, yb + 200, A.absorbedor.e]);
  R.ancla('mosq1', [x1 - 28 + 33, yb - 40 - 100, 10]);
  R.ancla('gancho1', [x1 + 130 - 40, yb - 30 - 200, 12]);
  R.ancla('traba1', [x1 + 130 + 7, yb - 30 - 90, 12]);
  R.ancla('cintaR', [x2, yb + 600, cz * 2]);
  R.ancla('absorb2', [x2 + 130 + 10, yb + 180, A.absorbedor.e]);
  R.ancla('barra2', [x2, yb + 10, 4]);
  R.ancla('gancho2', [x2 + 130 - 70, yb - 30 - 210, 10]);
  R.ancla('mosq2', [x2 - 28 + 10, yb - 40 - 60, 10]);
  R.ancla('cinturon', [cx + ra * .7, cy - rb * .7, Cb.e]);
  R.ancla('almohadilla', [cx, cy + rb + 4, Cb.e + 4]);
  R.ancla('hebilla', [cx, cy - rb, 6]);
  R.ancla('anilloD', [cx + ra + 2 + 40, cy, 8]);
  R.ancla('anilloD2', [cx - ra - 2 - 40, cy, 8]);
  R.ancla('cintaN', [x4 + 130, yb + 600, cz * 2]);
  R.ancla('mosq4', [x4 + 130 + 28 - 33, yb - 40 - 100, 10]);
  R.ancla('barra4', [x4 + 130, yb + 10, 4]);
}
