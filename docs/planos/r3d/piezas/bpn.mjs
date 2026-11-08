/* bpn.mjs · bornes BPN sobre riel NS35, peine (puente enchufable), separador, tapa final, tope, marcadores, cables con puntera.
 * Todas las formas salen de perfiles.mjs (las mismas que dibuja el plano). x = paso (8,2), y = largo, z = alto. */
import { BPN, NS35, PEINE, SEPARADOR, TAPA, TOPE } from './perfiles.mjs';

const cav = (...k) => k.map(n => BPN.cavidades[n]);

/** riel NS35 de x0 a x1 (en el sistema del borne: alas arriba en z = 0, de y = 9 a 44) con ranuras oblongas en el fondo */
export function riel(R, x0, x1, op = {}) {
  const y0 = op.y0 !== undefined ? op.y0 : BPN.riel.y0, z0 = op.z0 !== undefined ? op.z0 : BPN.riel.z0;
  const per = NS35.perfil.map(([u, v]) => [y0 + u, z0 + v]);
  const mat = R.tipoCorte(R.M.aceroCinc(), 'metal');
  const g = R.grupo(op.padre);
  let m = R.perfil(per, [], x1 - x0, mat, { a0: x0, bevel: .12, padre: g });
  // ranuras oblongas en el fondo
  const { largo, ancho, paso } = NS35.ranura;
  for (let xc = x0 + 12.5; xc + largo / 2 < x1 - 2; xc += paso) {
    const s = [], n = 16;
    for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 + Math.PI * i / n; s.push([xc + largo / 2 - ancho / 2 + ancho / 2 * Math.cos(a), y0 + 17.5 + ancho / 2 * Math.sin(a)]); }
    for (let i = 0; i <= n; i++) { const a = Math.PI / 2 + Math.PI * i / n; s.push([xc - largo / 2 + ancho / 2 + ancho / 2 * Math.cos(a), y0 + 17.5 + ancho / 2 * Math.sin(a)]); }
    const h = R.perfil(s, [], 4, mat, { A: [0, 0, 1], B: [1, 0, 0], C: [0, 1, 0], o: [0, 0, z0 - 1.5], bevel: 0, padre: null });
    const r = R.restarCSG(m, h, mat); g.remove(m); g.add(r); m = r;
  }
  return g;
}

/** un borne BPN-06. color: hex. x0: cara cerrada (el lado abierto mira a +x). op.marca: texto del marcador (o null) */
export function borne(R, x0, color, op = {}) {
  const g = R.grupo(op.padre);
  const pa = R.M.pa(color);
  // pared cerrada (contorno completo) + núcleo con las cavidades (abierto hacia +x, como los bornes reales)
  R.perfil(BPN.contorno, [cav('traba')[0]], BPN.pared + .3, pa, { a0: x0, bevel: .25, padre: g });
  const bajo = c => c.map(([y, z]) => [y, Math.min(z, 36)]);
  let nuc = R.perfil(BPN.contorno, [...cav('bocaI', 'jaulaI', 'bocaD', 'jaulaD', 'barra', 'zocalo', 'canalPuente', 'marcado', 'traba'), bajo(BPN.cavidades.pozoI), bajo(BPN.cavidades.pozoD)],
    BPN.paso - BPN.pared, pa, { a0: x0 + BPN.pared, bevel: .25, padre: g });
  const xm0 = x0 + 1 + (BPN.paso - 1) / 2;
  for (const y of BPN.yT) {   // pozo redondo Ø6,8 con avellanado arriba
    const h = R.torno([xm0, y, 34], [xm0, y, 41], [[0, 0], [3.4, 0], [3.4, 5.2], [4.3, 6.1], [4.3, 7], [0, 7]], pa, { padre: null, seg: 40 });
    const r = R.restarCSG(nuc, h, pa); g.remove(nuc); g.add(r); nuc = r;
  }
  // jaulas (acero cincado) con su tornillo M4
  const ac = R.tipoCorte(R.M.aceroCinc(), 'metal');
  for (const [e, i] of [[BPN.jaula.ext, BPN.jaula.int], [BPN.jaula.extD, BPN.jaula.intD]])
    R.perfil(e, [i], BPN.jaula.x[1] - BPN.jaula.x[0], ac, { a0: x0 + BPN.jaula.x[0], bevel: .15, padre: g });
  // barra de corriente + zócalo del puente (cobre estañado)
  const cu = R.tipoCorte(R.M.cobreEst(), 'metal');
  R.perfil(BPN.barra.p, [], BPN.barra.x[1] - BPN.barra.x[0], cu, { a0: x0 + BPN.barra.x[0], bevel: .15, padre: g });
  R.perfil(BPN.zocaloP.p, [], BPN.zocaloP.x[1] - BPN.zocaloP.x[0], cu, { a0: x0 + BPN.zocaloP.x[0], bevel: .1, padre: g });
  const xm = x0 + 1 + (BPN.paso - 1) / 2;
  for (const y of BPN.yT) {
    R.tornillo([xm, y, BPN.tornillo.zCab], [0, 0, 1], { M: 4, L: BPN.tornillo.L, dk: BPN.tornillo.dk, k: BPN.tornillo.k, tipo: 'combi', giro: op.giro || 30, mat: R.tipoCorte(R.M.aceroCinc(), 'metal'), padre: g });
  }
  // leyendas en relieve en la cara de la punta (y = C)
  const t = op.texto === undefined ? 'BPN-6' : op.texto;
  if (t) {
    R.texto(t, [xm, BPN.C + .02, 23.6], [-1, 0, 0], [0, 0, 1], pa, { size: 1.5, prof: .2, padre: g });
    R.texto('6mm2', [xm, BPN.C + .02, 20.9], [-1, 0, 0], [0, 0, 1], pa, { size: 1.2, prof: .2, padre: g });
    R.texto('800V', [xm, BPN.C + .02, 18.4], [-1, 0, 0], [0, 0, 1], pa, { size: 1.2, prof: .2, padre: g });
  }
  // marcador blanco en la ranura de marcado
  if (op.marca) {
    const mk = R.M.pa('#f6f6f2', { roughness: .5 });
    R.caja(x0 + 1.25, x0 + BPN.paso - .45, 24.5, 33.5, 49.25, 50.25, mk, { r: .2, padre: g });
    R.impreso([op.marca], BPN.paso - 2.2, 8.6, [x0 + 1 + (BPN.paso - 1.7) / 2, 29, 50.26], [0, 1, 0], [-1, 0, 0], { px: 3.4, padre: g });
  }
  g.userData.x0 = x0; return g;
}

/** peine (puente enchufable) de n polos. x0 = cara cerrada del primer borne. suelto: {dx,dy,dz,giro} para dibujarlo afuera */
export function peine(R, n, x0, op = {}) {
  const g = R.grupo(op.padre);
  const cu = R.tipoCorte(R.M.cobreEst(), 'metal');
  const ancho = PEINE.anchoDe(n), xA = x0 + 1 + (BPN.paso - 1) / 2 - (BPN.paso - 1.7) / 2 - (BPN.paso - ancho / n) * 0, xs = x0 + 1.35;
  // chapa troquelada: lomo + dientes (perfil en x,z, espesor en y)
  const yP = BPN.yPuente, e = PEINE.chapa;
  const pts = [[xs, PEINE.chapaZ[1]]];
  const dientes = [];
  for (let i = 0; i < n; i++) {
    const xc = x0 + i * BPN.paso + 1 + (BPN.paso - 1) / 2, w = PEINE.diente;
    dientes.push(xc);
  }
  const contorno = [[xs, PEINE.chapaZ[0]]];
  for (const xc of dientes) {
    const w = PEINE.diente, zt = PEINE.zPunta;
    contorno.push([xc - w / 2, PEINE.chapaZ[0]], [xc - w / 2, zt + .6], [xc - w / 2 + .5, zt], [xc + w / 2 - .5, zt], [xc + w / 2, zt + .6], [xc + w / 2, PEINE.chapaZ[0]]);
  }
  contorno.push([xs + ancho, PEINE.chapaZ[0]], [xs + ancho, PEINE.chapaZ[1]], [xs, PEINE.chapaZ[1]]);
  R.perfil(contorno, [], e, cu, { A: [0, 1, 0], B: [1, 0, 0], C: [0, 0, 1], o: [0, yP - e / 2, 0], bevel: .08, padre: g });
  // lomo aislante con marcas de corte entre polos
  const ais = R.M.pa(op.color || '#c8302c', { roughness: .5 });
  const lomo = PEINE.lomo.map(([y, z]) => [y, z]);
  const m = R.perfil(lomo, [], ancho, ais, { a0: xs, bevel: .35, padre: g });
  for (let i = 1; i < n; i++) {
    const xc = xs + i * BPN.paso - .85;
    const ranura = R.caja(xc - .35, xc + .35, yP - 3, yP + 3, PEINE.lomo[2][1] - .5, PEINE.lomo[2][1] + 1, ais, { r: 0, padre: null });
    const r = R.restarCSG(g.children[g.children.length - 1], ranura, R.M.corte(ais)); g.remove(g.children[g.children.length - 1]); g.add(r);
  }
  // leyenda en relieve sobre el lomo
  if (op.leyenda !== false && n >= 3) R.texto(op.leyenda || '2027', [xs + ancho / 2, yP + 2.21, 51.6], [-1, 0, 0], [0, 0, 1], ais, { size: 1.3, prof: .12, padre: g });
  if (op.suelto) { const s = op.suelto; g.position.set(s.dx || 0, s.dy || 0, s.dz || 0); if (s.giro) g.rotation.z = s.giro * Math.PI / 180; }
  return g;
}

export function separador(R, x0, color = '#b9bdc0', op = {}) {
  return R.perfil(SEPARADOR.contorno, [], SEPARADOR.esp, R.M.pa(color), { a0: x0, bevel: .3, padre: op.padre });
}
export function tapa(R, x0, color, op = {}) {
  return R.perfil(BPN.contorno, [], TAPA.esp, R.M.pa(color), { a0: x0, bevel: .35, padre: op.padre });
}
export function tope(R, x0, op = {}) {
  const g = R.grupo(op.padre);
  R.perfil(TOPE.contorno, [rect2(TOPE.yT - 4, TOPE.yT + 4, 18, 31)], TOPE.esp, R.M.pa('#8f969d'), { a0: x0, bevel: .4, padre: g });
  R.tornillo([x0 + TOPE.esp / 2, TOPE.yT, 26], [0, 0, 1], { M: 4, L: 12, tipo: 'combi', mat: R.M.aceroCinc(), padre: g });
  return g;
}
const rect2 = (y0, y1, z0, z1) => [[y0, z0], [y1, z0], [y1, z1], [y0, z1]];

/** cable con puntera que entra por la boca: lado 'I' (y=0) o 'D' (y=C). colores: [aislación, rayas (opcional)] */
export function cable(R, xc, lado, colores, op = {}) {
  const g = R.grupo(op.padre);
  const z = BPN.puntera.zEje, L = op.largo || 34;
  const yIn = lado === 'I' ? 9.0 : BPN.C - 9.0, s = lado === 'I' ? -1 : 1;
  const yBoca = lado === 'I' ? 0 : BPN.C;
  // tubo de la puntera (cobre estañado) desde adentro de la jaula hasta 2 mm afuera
  const yCu1 = yBoca + s * 2.2;
  R.cil([xc, yIn, z], [xc, yCu1, z], BPN.puntera.r, R.tipoCorte(R.M.cobreEst(), 'metal'), { padre: g });
  R.torno([xc, yCu1, z], [xc, yCu1 + s * 7, z], [[1.6, 0], [2.9, 0], [3.3, .6], [3.3, 6.2], [2.9, 7], [1.6, 7]], R.M.pa(op.collar || '#7b8288', { roughness: .45 }), { padre: g });
  // cable (aislación PVC) — rayas para el verde-amarillo
  const p0 = [xc, yCu1 + s * 6.8, z], p1 = [xc, yCu1 + s * (6.8 + L), z];
  R.cil(p0, p1, 2.75, R.M.cable(colores[0]), { padre: g, seg: 40 });
  if (colores[1]) for (const a0 of [10, 190]) {
    const m = R.cil(p0, p1, 2.8, R.M.cable(colores[1]), { padre: g, seg: 40, abierto: true });
    m.geometry.dispose(); m.geometry = new R.THREE.CylinderGeometry(2.8, 2.8, L, 24, 1, true, a0 * Math.PI / 180, 75 * Math.PI / 180).rotateX(Math.PI / 2).translate(0, 0, L / 2);
    m.geometry.deleteAttribute('uv');
  }
  // corte del cable en la punta: cobre a la vista (hilos)
  R.cil([xc, p1[1], z], [xc, p1[1] + s * .05, z], 2.4, R.M.cobre(), { padre: g });
  return g;
}
