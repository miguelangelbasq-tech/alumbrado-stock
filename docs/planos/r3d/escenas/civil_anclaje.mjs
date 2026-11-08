/* MAT-MAMPOSTERIA-2 · anclaje de expansión 1/2" × 150 colocado en el hormigón, cortado a cuarto: la camisa abierta muerde
 * la pared del agujero empujada por el cono; arriba la chapa del gabinete, arandela y tuerca. Al lado, el anclaje suelto despiezado */
import { ANC } from '../piezas/perfiles_civil.mjs';
import { matsC, revol, tuerca, arandelaP, varillaRosca, cte } from '../piezas/civil_util.mjs';
export default function (R, op = {}) {
  R.vista({ az: -32, el: 22, fov: 15, margen: .04 });
  R.config({ bordeOp: .3, exposicion: 1.1 });
  const M = matsC(R), T = R.THREE, A = ANC, r = A.d / 2, prof = 125, zb = -120;
  const q = { a0: 180, a1: 450 };     // revol con dir -z: se saca x < 0, y < 0
  // bloque de hormigón + agujero, cortado a cuarto
  const g = R.grupo();
  if (op.det) R.caja(-22, 22, -22, 22, -128, -55, M.hormExt, { r: .3, padre: g }); else R.caja(-75, 75, -65, 65, -165, 0, M.hormExt, { r: 1, padre: g });
  const hueco = new T.Mesh(new T.CylinderGeometry(A.broca / 2, A.broca / 2, prof * 2, 48)); hueco.rotation.x = Math.PI / 2; hueco.position.set(0, 0, 0); g.add(hueco); hueco.updateMatrixWorld();
  const bloque = g.children[0]; const nb = R.restarCSG(bloque, hueco, M.horm); g.remove(bloque); g.remove(hueco); g.add(nb);
  // fondo del agujero (cono de la mecha)
  R.cortar(g, [-500, 0, -500, 0, -500, 500]);
  if (op.det) { R.raiz.traverse(o => { if (o.isMesh && o.parent !== g && !g.children.includes(o)) o.userData.noEncuadre = true; }); }
  // chapa del gabinete (3 mm) con agujero, cortada
  const gc = R.grupo(); R.caja(-60, 60, -50, 50, 0, A.placa, M.galv, { r: .4, padre: gc });
  const h2 = new T.Mesh(new T.CylinderGeometry(7.2, 7.2, 20, 40)); h2.rotation.x = Math.PI / 2; gc.add(h2); h2.updateMatrixWorld();
  const ch = gc.children[0]; const nch = R.restarCSG(ch, h2, M.galvC); gc.remove(ch); gc.remove(h2); gc.add(nch); R.cortar(gc, [-500, 0, -500, 0, -500, 500]);
  // perno: rosca arriba (50), vástago, cono abajo (sección completa al cuarto)
  const zt = 32, Lr = 52;
  varillaRosca(R, [0, 0, zt], [0, 0, -1], Lr, A.d, A.paso, M.galv, M.galvC, q);
  revol(R, { p0: [0, 0, zt - Lr], dir: [0, 0, -1], L: zt - Lr - zb - A.cono.L, ro: cte(r - .9), mat: M.galv, matC: M.galvC, ...q, nt: 72, dz: 20 });
  revol(R, { p0: [0, 0, zb + A.cono.L], dir: [0, 0, -1], L: A.cono.L, ro: (th, z) => (r - .9) - ((r - .9) - A.cono.dmin / 2) * 0 + (z / A.cono.L) * (r - .6 - (r - .9)) - 0 + (z / A.cono.L) * 0, mat: M.galv, matC: M.galvC, ...q, nt: 72, dz: 1 });
  // camisa (clip) abierta: 3 sectores, con dientes, empujada contra la pared del agujero sobre el cono
  const zc0 = zb + A.cono.L * .35, Lc = A.camisa.L;
  for (const [a0, a1] of [[185, 300], [305, 420], [425, 450]]) revol(R, { p0: [0, 0, zc0 + Lc], dir: [0, 0, -1], L: Lc, ro: (th, z) => A.broca / 2 - .05 - (Math.floor(z / 3) % 2 ? .5 : 0) * (z > Lc * .4 ? 1 : .2), ri: (th, z) => A.broca / 2 - A.camisa.e - .05 + (z / Lc) * 0, a0, a1, mat: M.zinc, matC: M.aceroC, nt: 40, dz: .5 });
  // cono: se ensancha hacia abajo (empuja la camisa)
  revol(R, { p0: [0, 0, zc0], dir: [0, 0, -1], L: zc0 - zb, ro: (th, z) => A.cono.dmin / 2 + (A.broca / 2 - .4 - A.cono.dmin / 2) * Math.min(1, z / (zc0 - zb - 2)), mat: M.galv, matC: M.galvC, ...q, nt: 72, dz: 1 });
  // arandela y tuerca
  arandelaP(R, [0, 0, A.placa], [0, 0, 1], A.arandela.di, A.arandela.de, A.arandela.e, M.galv);
  tuerca(R, [0, 0, A.placa + A.arandela.e], [0, 0, 1], { d: A.d, paso: A.paso, af: A.tuerca.af, e: A.tuerca.e, n: 6, mat: M.galv, matC: M.galvC, a0: q.a0, a1: q.a1 });
  // ---- anclaje suelto, despiezado, a la derecha
  if (op.det) { const box = new T.Box3(new T.Vector3(-23, -23, -129), new T.Vector3(23, 23, -54)); R.raiz.traverse(o => { if (o.isMesh) { const b = new T.Box3().setFromObject(o); if (!b.intersectsBox(box)) o.visible = false; o.userData.noEncuadre = !g.children.includes(o); } });
    R.ancla('camisa', [-A.broca / 2 + .5, -.3, zc0 + Lc * .5]); R.ancla('cono', [-.2, 2, zb + 6]); R.ancla('perno', [-.2, 2, -70]); R.ancla('agujero', [-.2, -A.broca / 2, -prof + 2]); R.ancla('hormigon', [-18, -.2, -100]); R.ancla('dientes', [.5, -A.broca / 2 + .3, zc0 + Lc * .8]); return; }
  const X = 120, Y = 60;
  varillaRosca(R, [X, Y, 110], [0, 0, -1], Lr, A.d, A.paso, M.galv, M.galvC);
  R.cil([X, Y, 110 - Lr], [X, Y, -10], r - .9, M.galv, { seg: 48 });
  R.torno([X, Y, -10], [X, Y, -40], [[r - .9, 0], [A.cono.dmin / 2, 2], [A.cono.dmin / 2, 3], [r - .5, A.cono.L], [r - .5, 26], [0, 30]], M.galv, { seg: 64 });
  revol(R, { p0: [X, Y, 32], dir: [0, 0, -1], L: Lc, ro: (th, z) => r + .2 - (Math.floor(z / 3) % 2 ? .4 : 0), ri: cte(r - 1.4), a0: 10, a1: 350, mat: M.acero, matC: M.aceroC, nt: 60, dz: .5 });
  arandelaP(R, [X, Y, 122], [0, 0, 1], A.arandela.di, A.arandela.de, A.arandela.e, M.galv);
  tuerca(R, [X, Y, 134], [0, 0, 1], { d: A.d, paso: A.paso, af: A.tuerca.af, e: A.tuerca.e, n: 6, mat: M.galv, matC: M.galvC });
  R.ancla('tuerca', [-6, -A.tuerca.af / 2 + 1, A.placa + A.arandela.e + A.tuerca.e * .6]); R.ancla('arandela', [-A.arandela.de / 2 + 2, 1, A.placa + 1.5]);
  R.ancla('chapa', [-50, 30, A.placa]); R.ancla('perno', [-.2, 2, -30]); R.ancla('camisa', [-A.broca / 2 + .5, -.3, zc0 + Lc * .5]);
  R.ancla('cono', [-.2, 2, zb + 6]); R.ancla('hormigon', [-60, -.2, -130]); R.ancla('agujero', [-.2, -A.broca / 2, -prof + 3]); R.ancla('rosca', [r * .6, -r * .8, 20]);
  R.ancla('suelto', [X + r * .7, Y - r * .7, 70]); R.ancla('tuercaS', [X, Y - 9, 140]); R.ancla('arandelaS', [X - 15, Y - 5, 124]); R.ancla('camisaS', [X - r, Y - 1, 20]); R.ancla('conoS', [X, Y - r, -25]);
}
