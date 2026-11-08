/* fusibles.mjs · fusible cilíndrico por dentro (casquillos, tubo cerámico, arena de cuarzo, elemento con estrangulamientos),
 * portafusible seccionable «tabaquera» (3053) y base 8×31 (3002) con el mismo modelo, borne seccionable 5×20 (3003), Neozed D01.
 * Medidas: perfiles.mjs (las mismas que el plano). */
import { NS35, TAB, F10x38, F85x315, F5x20, NEOZED, B520, BPN, rot } from './perfiles.mjs';

/** fusible cilíndrico armado en un grupo; eje z de 0 a L (local). spec = F10x38 / F85x315 / F5x20.
 *  op: lineas (impreso), vidrio (5×20), cuarto: [sx, sy] corta el cuadrante (sx·x > 0 y sy·y > 0), padre */
export function fusible(R, spec, op = {}) {
  const g = R.grupo(op.padre);
  const { D, L, cap, tubo, rArena } = spec;
  const casq = R.tipoCorte(R.M.latonNiq(), 'metal');
  // casquillos (vasos de latón niquelado) con el borde enrollado
  R.torno([0, 0, 0], [0, 0, cap], spec.casq.map(([r, t]) => [r, t]), casq, { padre: g });
  R.torno([0, 0, L], [0, 0, L - cap], spec.casq.map(([r, t]) => [r, t]), casq, { padre: g });
  const ri = tubo / 2 - spec.pared;
  if (op.vidrio) {
    // tubo de vidrio + hilo fusible a la vista
    const vid = R.cil([0, 0, cap - .3], [0, 0, L - cap + .3], tubo / 2, R.M.vidrio(), { padre: g });
    vid.userData.noCortar = true;
    R.cil([0, 0, .3], [0, 0, L - .3], .07, R.M.estano(), { padre: g });
    const s = R.torno([0, 0, L / 2 - .5], [0, 0, L / 2 + .5], [[0, 0], [.25, .1], [.25, .9], [0, 1]], R.M.estano(), { padre: g });
  } else {
    // tubo cerámico (anillo) + relleno de arena de cuarzo
    R.torno([0, 0, .35], [0, 0, L - .35], [[ri, 0], [tubo / 2, 0], [tubo / 2, L - .7], [ri, L - .7]], R.tipoCorte(R.M.ceramica(), 'ceramica'), { padre: g });
    const ar = R.cil([0, 0, .5], [0, 0, L - .5], ri - .02, R.tipoCorte(R.M.arena(), 'arena'), { padre: g, seg: 40 });
    // elemento fusible: cinta de plata con estrangulamientos y punto de estaño (efecto M) — sobre el plano del corte
    const e = spec.elemento, w = e.ancho, n = e.muescas;
    const pts = [];
    const sec = (L - 2) / (n + 1);
    const lado = (sgn) => { const a = []; for (let i = 1; i <= n; i++) { const t = 1 + sec * i; a.push([t - .55, sgn * w / 2], [t, sgn * w * .12], [t + .55, sgn * w / 2]); } return a; };
    const top = lado(1), bot = lado(-1).reverse();
    pts.push([1, -w / 2], [1, w / 2], ...top, [L - 1, w / 2], [L - 1, -w / 2], ...bot);
    const x0 = op.cuarto ? op.cuarto[0] * .25 : 0, ys = op.cuarto ? -op.cuarto[1] * .02 : 0;
    // cinta en el plano y = ys, ancho en x
    const cinta = R.perfil(pts.map(([t, u]) => [t, u]), [], .1, R.M.plata(), { A: [0, 1, 0], B: [0, 0, 1], C: [1, 0, 0], o: [x0 + (op.cuarto ? op.cuarto[0] * w / 2 : 0), ys - .05, 0], bevel: 0, padre: g });
    cinta.userData.noCortar = true;
    if (e.estano) { const p = R.cil([x0 + (op.cuarto ? op.cuarto[0] * w / 2 : 0), ys, L / 2 - .6], [x0 + (op.cuarto ? op.cuarto[0] * w / 2 : 0), ys, L / 2 + .6], w * .42, R.M.estano(), { padre: g, seg: 20 }); p.userData.noCortar = true; }
    // soldadura del elemento en las tapas
    for (const z of [.36, L - .36]) R.cil([0, 0, z], [0, 0, z + (z < 1 ? -.25 : .25)], .9, R.M.estano(), { padre: g, seg: 20 });
  }
  if (op.lineas) R.impresoCil(op.lineas, [0, 0, cap + .4], [0, 0, L - cap - .4], tubo / 2 + .01, op.arco || 150, op.ang || 0, { padre: g, color: op.tinta || '#1b2a6b', ppm: 60, px: op.px || Math.min(2.2, D * .2), giro: op.giro || 0 });
  if (op.cuarto) {
    const [sx, sy] = op.cuarto, E = D;
    R.cortar(g, [sx > 0 ? 0 : -E, sx > 0 ? E : 0, sy > 0 ? 0 : -E, sy > 0 ? E : 0, op.cortarDesde ?? -1, op.cortarHasta ?? L + 1]);
  }
  return g;
}

/** riel NS35 para aparatos modulares: alas en y = 0 (espalda del aparato), centro a la altura zc, de x0 a x1 */
export function rielModular(R, x0, x1, zc, padre) {
  const per = NS35.perfil.map(([u, v]) => [v - 7.5, zc - 17.5 + u]);
  return R.perfil(per, [], x1 - x0, R.tipoCorte(R.M.aceroCinc(), 'metal'), { a0: x0, bevel: .12, padre });
}

/** portafusible seccionable (tabaquera 3053 o base 3002) de 1 polo. T = TAB / BASE831. x0 = cara izquierda.
 *  op: abierto (ángulo del carro, 0 = cerrado), fusOp (opciones del fusible), fusSuelto ([dx,dy,dz] lo saca del carro), cortar (true = corte a cuarto),
 *  rotulos {lado: [líneas], frente: texto}, color del cuerpo */
export function portafusible(R, T, spec, x0, op = {}) {
  const g = R.grupo(op.padre);
  const pa = R.M.pa(op.color || '#d3d5d1'), pc = R.M.pa(op.colorCarro || '#6b7178');
  const W = T.W, p = T.pared;
  // paredes laterales con el cuello y los ganchos del riel
  R.perfil(T.lado, [], p, pa, { a0: x0, bevel: .3, padre: g });
  R.perfil(T.lado, [], p, pa, { a0: x0 + W - p, bevel: .3, padre: g });
  // núcleo con las cavidades internas; bocas y pozos redondos por CSG
  let nuc = R.perfil(T.nucleo, [T.cav.jaulaS, T.cav.jaulaI, T.cav.canalS, T.cav.canalI], W - 2 * p + .4, pa, { a0: x0 + p - .2, bevel: .2, padre: g });
  const xm = x0 + W / 2;
  const huecos = [];
  for (const [zA, zB] of [[T.H - 17, T.H + 1], [-1, 17]]) huecos.push(R.caja(x0 + T.boca.x[0], x0 + T.boca.x[1], T.boca.y[0], T.boca.y[1], zA, zB, pa, { r: .8, padre: null }));
  for (const z of [T.tornillo.z, T.H - T.tornillo.z]) huecos.push(R.torno([xm, 37.5, z], [xm, T.Dr + .3, z], [[0, 0], [3.3, 0], [3.3, T.Dr - 37.5 - 1.6], [4.3, T.Dr - 37.5 - .4], [4.3, T.Dr - 37.5 + .3], [0, T.Dr - 37.5 + .3]], pa, { padre: null, seg: 40 }));
  for (const h of huecos) { const r = R.restarCSG(nuc, h, pa); g.remove(nuc); g.add(r); nuc = r; }
  // traba del riel (corredera abajo, con ranura para el destornillador)
  const tr = R.caja(x0 + 4.5, x0 + W - 4.5, 3, 13, -2.2, .4, R.M.pa(op.colorTraba || '#d9d8d1'), { r: .4, padre: g });
  // jaulas (acero cincado), flejes (cobre estañado), tornillos
  const ac = R.tipoCorte(R.M.aceroCinc(), 'metal'), cu = R.tipoCorte(R.M.cobreEst(), 'metal');
  for (const [e, i] of [[T.jaula.ext, T.jaula.int], [T.jaula.extI, T.jaula.intI]]) R.perfil(e, [i], T.jaula.x[1] - T.jaula.x[0], ac, { a0: x0 + T.jaula.x[0], bevel: .12, padre: g });
  for (const f of [T.fleje.p, T.fleje.pI]) R.perfil(f, [], T.fleje.x[1] - T.fleje.x[0], cu, { a0: x0 + T.fleje.x[0], bevel: .1, padre: g });
  for (const z of [T.tornillo.z, T.H - T.tornillo.z]) R.tornillo([xm, T.tornillo.y, z], [0, 1, 0], { M: T.tornillo.M, L: T.tornillo.L, dk: T.tornillo.dk, k: T.tornillo.k, tipo: 'combi', giro: 60, mat: ac, padre: g });
  // pinzas de contacto (resorte en U de cobre estañado que abraza el casquillo)
  const r0 = T.fD / 2, yb = T.fus.y - r0 - .9;
  for (const zc of [T.pinza.zS, T.pinza.zI]) {
    const xa = xm - r0 - .55, xb = xm + r0 + .55;
    const U = R.unir([[xa, yb], [xb, yb], [xb, yb + .7], [xa, yb + .7]], [[xa, yb], [xa + .55, yb], [xa + .55, T.fus.y + .5], [xa, T.fus.y + .5]],
      [[xb - .55, yb], [xb, yb], [xb, T.fus.y + .5], [xb - .55, T.fus.y + .5]], [[xa, T.fus.y - .3], [xa + 1.0, T.fus.y], [xa + .55, T.fus.y + .7], [xa, T.fus.y + .5]],
      [[xb, T.fus.y - .3], [xb - 1.0, T.fus.y], [xb - .55, T.fus.y + .7], [xb, T.fus.y + .5]], [[xm - 2.6, T.Dr - .5], [xm + 2.6, T.Dr - .5], [xm + 2.6, yb + .3], [xm - 2.6, yb + .3]]);
    R.perfil(U, null, T.pinza.alto, cu, { A: [0, 0, 1], B: [1, 0, 0], C: [0, 1, 0], o: [0, 0, zc - T.pinza.alto / 2], bevel: .1, padre: g });
  }
  // carro basculante con el fusible: gira alrededor del pivote
  const ab = op.abierto || 0;
  const piv = R.grupo(g); piv.position.set(0, T.pivote[0], T.pivote[1]);
  const car = R.grupo(piv); car.position.set(0, -T.pivote[0], -T.pivote[1]);
  piv.rotation.x = -ab * Math.PI / 180;     // la parte de arriba sale hacia adelante (+y)
  R.perfil(T.carro, [], W - 2 * p - .3, pc, { a0: x0 + p + .15, bevel: .3, padre: car });
  // costillas de agarre de la manija y lente del indicador
  for (let i = 0; i < 4; i++) R.caja(x0 + p + 1.2, x0 + W - p - 1.2, T.D - .1, T.D + .35, T.cuello[1] - 6.6 + i * 1.3, T.cuello[1] - 6.0 + i * 1.3, pc, { r: .15, padre: car });
  if (op.visor !== false) R.cil([xm, T.D - 1.6, T.visor.z], [xm, T.D - 1.25, T.visor.z], T.visor.r, R.M.lente('#ff5a3c'), { padre: car });
  if (op.rotulos && op.rotulos.frente) R.texto(op.rotulos.frente, [xm, T.D - 1.38, T.zM - 4], [0, 0, 1], [1, 0, 0], R.M.pa('#f2f2ee'), { size: 2.2, prof: .2, padre: car });
  // pasador del pivote
  R.cil([x0 + .2, T.pivote[0], T.pivote[1]], [x0 + W - .2, T.pivote[0], T.pivote[1]], 1.1, R.M.latonNiq(), { padre: g, seg: 24 });
  // fusible
  const fg = R.grupo(op.fusSuelto ? g : car);
  fusible(R, spec, { ...(op.fusOp || {}), padre: fg });
  fg.position.set(xm, T.fus.y, T.fus.z0);
  if (op.fusSuelto) {
    // afuera del carro, siguiendo el ángulo del carro abierto
    const [dx, dy, dz] = op.fusSuelto; fg.position.set(xm + dx, T.fus.y + dy, T.fus.z0 + dz); fg.rotation.x = -ab * Math.PI / 180;
  }
  // rótulos impresos en el costado derecho (x = x0 + W)
  // cables con puntera que entran por arriba y salen por abajo
  for (const c of (op.cables || [])) {
    const arriba = c.lado === 'S', zb = arriba ? T.H : 0, s = arriba ? 1 : -1, yc = 31.7;
    const zIn = arriba ? T.H - 15 : 15;
    R.cil([xm, yc, zIn], [xm, yc, zb + s * 2], c.r || 1.1, R.tipoCorte(R.M.cobreEst(), 'metal'), { padre: g });
    R.torno([xm, yc, zb + s * 2], [xm, yc, zb + s * 9], [[1.0, 0], [2.0, 0], [2.3, .5], [2.3, 6.3], [1.9, 7], [1.0, 7]], R.M.pa(c.collar || '#2b2d31', { roughness: .45 }), { padre: g });
    R.cil([xm, yc, zb + s * 8.8], [xm, yc, zb + s * (8.8 + (c.largo || 22))], 1.55, R.M.cable(c.color), { padre: g });
    R.cil([xm, yc, zb + s * (8.8 + (c.largo || 22))], [xm, yc, zb + s * (8.85 + (c.largo || 22))], 1.3, R.M.cobre(), { padre: g });
  }
  if (op.rotulos && op.rotulos.lado) R.impreso(op.rotulos.lado, 30, 12, op.rotulos.izq ? [x0 - .01, 20, T.zM - 15] : [x0 + W + .01, 20, T.zM - 15], op.rotulos.izq ? [0, -1, 0] : [0, 1, 0], [0, 0, 1], { padre: g, color: '#30343a', ppm: 50 });
  g.updateMatrixWorld(true);
  if (op.cortar) R.cortar(g, op.cortar);
  return g;
}

/** Neozed D01: eje z de 0 (pie de contacto) a 36 (cabeza con el indicador de color) */
export function neozed(R, amp, op = {}) {
  const g = R.grupo(op.padre);
  const pf = NEOZED.perfil;
  R.torno([0, 0, 0], [0, 0, 6.6], pf.filter(([r, t]) => t <= 6.6).concat([[0, 6.6]]), R.M.latonNiq(), { padre: g });
  R.torno([0, 0, 6.0], [0, 0, 31.2], [[0, 0], [5.0, 0], [5.5, .6], [5.5, 24.6], [5.0, 25.2], [0, 25.2]], R.tipoCorte(R.M.ceramica(), 'ceramica'), { padre: g });
  R.torno([0, 0, 31.0], [0, 0, 36], [[0, 0], [4.95, 0], [4.95, 1.8], [4.5, 5], [0, 5]], R.M.latonNiq(), { padre: g });
  R.cil([0, 0, 35.9], [0, 0, 36.15], 2.2, R.M.pa(NEOZED.colores[amp] || '#999'), { padre: g });
  if (op.lineas) R.impresoCil(op.lineas, [0, 0, 9], [0, 0, 28], 5.51, 80, op.ang || 0, { padre: g, color: '#1b2a6b', ppm: 60, px: 2.0, giro: op.giro || 0 });
  return g;
}

/** borne seccionable 5×20 (3003) sobre el riel NS35 (sistema del borne: y = largo, riel desde y = rielY0). op.abierto (grados) */
export function borne520(R, x0, op = {}) {
  const g = R.grupo(op.padre);
  const pa = R.M.pa(op.color || '#b4b8ba'), neg = R.M.pa('#2a2c30');
  const C = B520.C, P = B520.paso, YC = 10;
  const rect = (y0, y1, z0, z1) => [[y0, z0], [y1, z0], [y1, z1], [y0, z1]];
  const cavs = B520.cav;
  R.perfil(B520.contorno, [], 1.3, pa, { a0: x0, bevel: .25, padre: g });
  let nuc = R.perfil(B520.contorno, cavs, P - 1, pa, { a0: x0 + 1, bevel: .25, padre: g });
  const xm = x0 + 1 + (P - 1) / 2;
  for (const y of [YC, C - YC]) {
    const h = R.torno([xm, y, 20], [xm, y, 34], [[0, 0], [3.4, 0], [3.4, 12.2], [4.3, 13.1], [4.3, 14], [0, 14]], pa, { padre: null, seg: 40 });
    const r = R.restarCSG(nuc, h, pa); g.remove(nuc); g.add(r); nuc = r;
    R.tornillo([xm, y, 23.6], [0, 0, 1], { M: 4, L: 4.6, dk: 7, k: 2.6, tipo: 'combi', mat: R.M.aceroCinc(), padre: g });
    R.perfil(rect(y - 4.4, y + 4.4, 6, 21), [rect(y - 3.4, y + 3.4, 7, 20)], 5.8, R.M.aceroCinc(), { a0: x0 + 1.7, bevel: .12, padre: g });
  }
  // barras partidas (el fusible une las dos mitades)
  const cu = R.M.cobreEst();
  R.perfil(rect(4.5, 28, 15.5, 17.5), [], 4.8, cu, { a0: x0 + 2.2, bevel: .1, padre: g });
  R.perfil(rect(44.5, C - 4.5, 15.5, 17.5), [], 4.8, cu, { a0: x0 + 2.2, bevel: .1, padre: g });
  for (const y of [26.5, 46]) R.perfil(rect(y - .6, y + .6, 17.5, 36.5), [], 3.2, cu, { a0: x0 + 3, bevel: .1, padre: g });
  // palanca negra con el fusible 5×20, gira en el pivote
  const ab = op.abierto || 0;
  const piv = R.grupo(g); piv.position.set(0, B520.pivote[0], B520.pivote[1]);
  const pl = R.grupo(piv); pl.position.set(0, -B520.pivote[0], -B520.pivote[1]);
  piv.rotation.x = ab * Math.PI / 180;
  R.perfil(B520.palanca, [rect(24, 49, 37.6, 43.4)], P - .6, neg, { a0: x0 + .3, bevel: .35, padre: pl });
  for (let i = 0; i < 5; i++) R.caja(x0 + .8, x0 + P - .8, 50.5 + i * 1.2, 51.1 + i * 1.2, 46.6, 47.3, neg, { r: .1, padre: pl });
  const fg = R.grupo(pl); fusible(R, F5x20, { vidrio: true, padre: fg });
  fg.position.set(x0 + P / 2, B520.fus.y0, B520.fus.z); fg.rotation.x = -Math.PI / 2; fg.rotation.set(0, 0, 0); fg.quaternion.setFromUnitVectors(new R.THREE.Vector3(0, 0, 1), new R.THREE.Vector3(0, 1, 0));
  R.texto('5x20', [x0 + P / 2, 38, 46.95], [0, 1, 0], [-1, 0, 0], neg, { size: 2.0, prof: .15, padre: pl });
  return g;
}
