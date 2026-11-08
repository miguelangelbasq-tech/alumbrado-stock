/* nobra_util · piezas 3D del grupo «nobra» (productos nuevos del pañol). Medidas: perfiles_nobra.mjs. No modifica piezas de otros grupos
 * (las que se reusan se importan tal cual). Ejes: z arriba. */
import { CANAL60, PRECN, DIENTE, CINTA43 } from './perfiles_nobra.mjs';

/** sección en U del canal (y 0..W, z 0..H) con el labio de enganche por fuera arriba (igual criterio que seccionCanal de conex) */
export function secCanal(C = CANAL60) {
  const { W, H, pared: p, fondo: f } = C, g = C.tapa.gancho;
  return [[0, 0], [W, 0], [W, H - 2.4], [W + g, H - 1.6], [W + g, H - .9], [W, H], [W - p, H], [W - p, f], [p, f], [p, H], [0, H], [-g, H - .9], [-g, H - 1.6], [0, H - 2.4]];
}
export function secTapa(C = CANAL60) {
  const { W, H } = C, e = C.tapa.e, Lb = C.tapa.labio, g = C.tapa.gancho, s = .25;
  return [[-g - s - e, H - Lb], [-g - s - e, H + e], [W + g + s + e, H + e], [W + g + s + e, H - Lb], [W + g + s - .2, H - Lb - .4], [W + s - .1, H - 2.1], [W + g + s, H - 1.4],
    [W + g + s, H + .05], [-g - s, H + .05], [-g - s, H - 1.4], [-s + .1, H - 2.1], [-g - s + .2, H - Lb - .4]];
}
/** cable canal perforado (ranurado) de alto H, a lo largo de x (x0..x1); fondo con agujeros oblongos; tapa op.tapa = [t0, t1] */
export function canalAlto(R, x0, x1, op = {}) {
  const C = op.C || CANAL60, W = C.W, H = C.H, g = R.grupo(op.padre);
  const pvc = R.tipoCorte(R.M.pvc(C.color, { roughness: .5, clearcoat: .15 }), 'plastico');
  const zr = H - C.alturaRanura;
  const base = [[0, 0], [W, 0], [W, zr], [W - C.pared, zr], [W - C.pared, C.fondo], [C.pared, C.fondo], [C.pared, zr], [0, zr]];
  let b = R.perfil(base, [], x1 - x0, pvc, { a0: x0, bevel: .15, padre: null });
  // agujeros oblongos del fondo (para atornillar): se restan con CSG
  const T = R.THREE;
  for (let x = x0 + C.agujero.paso / 2; x < x1 - 10; x += C.agujero.paso) {
    const s = new T.Shape(); const L = C.agujero.L, A = C.agujero.A;
    s.absarc(-L / 2 + A / 2, 0, A / 2, Math.PI / 2, 3 * Math.PI / 2, false); s.absarc(L / 2 - A / 2, 0, A / 2, -Math.PI / 2, Math.PI / 2, false);
    const geo = new T.ExtrudeGeometry(s, { depth: 10, bevelEnabled: false }); geo.translate(x, W / 2, -5);
    b = R.restarCSG(b, new T.Mesh(geo, pvc), pvc);
  }
  g.add(b);
  const paso = C.dedo + C.ranura;
  for (let x = x0; x < x1 - .5; x += paso) {
    const xa = x, xb = Math.min(x + C.dedo, x1);
    for (const lado of [0, 1]) {
      const pf = lado ? [[W - C.pared, zr - .6], [W, zr - .6], [W, H - 2.4], [W + C.tapa.gancho, H - 1.6], [W + C.tapa.gancho, H - .9], [W, H], [W - C.pared, H]]
                      : [[0, zr - .6], [C.pared, zr - .6], [C.pared, H], [0, H], [-C.tapa.gancho, H - .9], [-C.tapa.gancho, H - 1.6], [0, H - 2.4]];
      R.perfil(pf, [], xb - xa, pvc, { a0: xa, bevel: .25, padre: g });
    }
  }
  if (op.tapa) { const [t0, t1] = op.tapa; R.perfil(secTapa(C), [], t1 - t0, R.tipoCorte(R.M.pvc(C.colorTapa, { roughness: .45 }), 'plastico'), { a0: t0, bevel: .2, padre: g }); }
  return g;
}

/** precinto recto (sin cerrar) a lo largo de +x desde x0, centrado en y = y0, apoyado en z = 0: cabeza con la ranura, banda con el dentado
 *  arriba (perfil en x-z extruido en y), punta afinada. P = una entrada de PRECN. */
export function precintoRecto(R, P, x0, y0, mat, op = {}) {
  const g = R.grupo(op.padre), [cl, ch, cw] = P.cab, t = P.t, w = P.w, d = DIENTE.h * (w / 4.6), p = DIENTE.paso * (w / 4.6) ** .5;
  // cabeza: bloque con la ranura pasante vertical (agujero) para la cola
  R.perfil([[x0, y0 - cw / 2], [x0 + cl, y0 - cw / 2], [x0 + cl, y0 + cw / 2], [x0, y0 + cw / 2]], [[[x0 + cl * .3, y0 - w / 2 - .1], [x0 + cl * .3 + t + .5, y0 - w / 2 - .1], [x0 + cl * .3 + t + .5, y0 + w / 2 + .1], [x0 + cl * .3, y0 + w / 2 + .1]]],
    ch, mat, { A: [0, 0, 1], B: [1, 0, 0], C: [0, 1, 0], o: [0, 0, 0], bevel: .25, padre: g });
  // banda: perfil x-z con dientes de sierra arriba, extruido a lo ancho (y)
  const xb0 = x0 + cl - .2, xb1 = x0 + P.L - DIENTE.tipLargo, pf = [[xb0, 0], [xb1, 0]];
  for (let x = xb1; x > xb0 + 2; x -= p) pf.push([x, t], [x - p * .85, t + d]);
  pf.push([xb0, t]);
  R.perfil(pf.map(([x, z]) => [x, z]), [], w, mat, { A: [0, 1, 0], B: [1, 0, 0], C: [0, 0, 1], o: [0, y0 - w / 2, 0], bevel: 0, padre: g });
  // punta afinada (plana)
  const wt = w * DIENTE.tipW;
  R.perfil([[xb1, y0 - w / 2], [x0 + P.L - 1, y0 - wt / 2], [x0 + P.L, y0], [x0 + P.L - 1, y0 + wt / 2], [xb1, y0 + w / 2]], [], t, mat, { A: [0, 0, 1], B: [1, 0, 0], C: [0, 1, 0], o: [0, 0, 0], bevel: .15, padre: g });
  return g;
}

/** precinto cerrado (lazo) sobre un mazo de radio rM, en el plano x-z alrededor de c = [x, y, z], cola saliendo hacia +z */
export function precintoLazo(R, P, c, rM, mat, op = {}) {
  const g = R.grupo(op.padre), T = R.THREE, t = P.t, w = P.w, [cl, ch, cw] = P.cab;
  const n = 96, pts = [];
  for (let i = 0; i <= n; i++) { const a = Math.PI / 2 + (i / n) * 2 * Math.PI * .97; pts.push([c[0] + (rM + t / 2) * Math.cos(a), c[2] + (rM + t / 2) * Math.sin(a)]); }
  const ext = [], inn = [];
  for (let i = 0; i < pts.length; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], tx = b[0] - a[0], tz = b[1] - a[1], L = Math.hypot(tx, tz) || 1, nx = -tz / L, nz = tx / L;
    ext.push([pts[i][0] - nx * t / 2, pts[i][1] - nz * t / 2]); inn.push([pts[i][0] + nx * t / 2, pts[i][1] + nz * t / 2]); }
  R.perfil([...ext, ...inn.reverse()], [], w, mat, { A: [0, 1, 0], B: [1, 0, 0], C: [0, 0, 1], o: [0, c[1] - w / 2, 0], bevel: 0, padre: g });
  // cabeza arriba del mazo y la cola que sale para arriba (cortada)
  const xh = c[0], zh = c[2] + rM + t;
  R.caja(xh - cl / 2, xh + cl / 2, c[1] - cw / 2, c[1] + cw / 2, zh, zh + ch, mat, { r: .5, padre: g });
  R.caja(xh + cl * .1, xh + cl * .1 + t, c[1] - w / 2, c[1] + w / 2, zh + ch - .1, zh + ch + (op.cola ?? 12), mat, { r: .2, padre: g });
  return g;
}

/** rollo de cinta (ancho w, Ø int Di, Ø ext De) con el núcleo de cartón, eje según y en c */
export function rolloCinta(R, c, w, Di, De, mat, op = {}) {
  const g = R.grupo(op.padre);
  R.torno([c[0], c[1] - w / 2, c[2]], [c[0], c[1] + w / 2, c[2]], [[Di / 2 + 2, 0], [De / 2 - .6, 0], [De / 2, .6], [De / 2, w - .6], [De / 2 - .6, w], [Di / 2 + 2, w]], mat, { seg: 96, padre: g });
  R.torno([c[0], c[1] - w / 2 - .3, c[2]], [c[0], c[1] + w / 2 + .3, c[2]], [[Di / 2, 0], [Di / 2 + 2, 0], [Di / 2 + 2, w + .6], [Di / 2, w + .6]], op.nucleo || R.M.pa('#b98a55', { roughness: .9 }), { seg: 64, padre: g });
  return g;
}
export { CINTA43, PRECN };
