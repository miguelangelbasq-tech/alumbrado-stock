/* MAT-SENAL_SELLADO-1 · rollo de malla de advertencia (8017) con un tramo extendido (rombos y leyenda) y bloque de telgopor (8005) */
import { MALLA, TELG } from '../piezas/perfiles_civil.mjs';
import { matsC } from '../piezas/civil_util.mjs';
export default function (R) {
  R.vista({ az: -30, el: 30, fov: 15, margen: .04 });
  R.config({ bordeOp: .25 });
  const M = matsC(R), T = R.THREE, W = MALLA.ancho, [rx, ry] = MALLA.rombo, h = MALLA.hilo, Lx = 760, t = .5;
  // tramo extendido: hilos en diagonal (rombos de rx a lo largo × ry a lo ancho), dos orillas y una franja con la leyenda (*)
  const box = new T.BoxGeometry(1, h, t); box.deleteAttribute('uv');
  const seg = []; const ban = [[0, 8], [W / 2 - 22, W / 2 + 22], [W - 8, W]];
  const libre = (y) => !ban.some(([a, b]) => y > a && y < b);
  for (const s of [1, -1]) for (let k = -Math.ceil(W / ry) - 2; k < Lx / rx + 2; k++) {
    // recta x = k*rx + s*(y)*(rx/ry)/... dirección (rx/2, s*ry/2)
    const x0 = k * rx, dx = rx / 2, dy = ry / 2;
    let pts = [];
    for (let y = 0; y <= W; y += 2) { const x = x0 + s * (y / dy) * dx; if (x >= 0 && x <= Lx && libre(y)) pts.push([x, y]); else { if (pts.length > 1) seg.push(pts); pts = []; } }
    if (pts.length > 1) seg.push(pts);
  }
  const im = new T.InstancedMesh(box, M.malla, seg.length); const M4 = new T.Matrix4(), Q = new T.Quaternion(), S = new T.Vector3();
  seg.forEach((p, i) => { const a = p[0], b = p[p.length - 1]; const L = Math.hypot(b[0] - a[0], b[1] - a[1]); Q.setFromAxisAngle(new T.Vector3(0, 0, 1), Math.atan2(b[1] - a[1], b[0] - a[0])); S.set(L + h, 1, 1); M4.compose(new T.Vector3((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, t / 2), Q, S); im.setMatrixAt(i, M4); });
  im.castShadow = im.receiveShadow = true; R.sinBorde(im); R.raiz.add(im);
  for (const [a, b] of ban) R.caja(0, Lx, a, b, 0, t, M.malla, { r: 0 });
  // leyenda impresa (blanca) en la franja central, repetida
  for (const x of [130, 470]) R.impreso(['PELIGRO ELECTRICO'], 300, 40, [x + 20, W / 2, t + .2], [1, 0, 0], [0, 1, 0], { color: '#ffffff', px: 26, sep: .3 });
  // rollo (eje y) al final del tramo
  const Rr = MALLA.rollo.Rext, Ri = MALLA.rollo.Rin;
  R.torno([Lx + Rr - 10, 0, Rr], [Lx + Rr - 10, W, Rr], [[Ri, 0], [Rr, 0], [Rr, W], [Ri, W], [Ri, 0]], M.malla, { seg: 96 });
  R.torno([Lx + Rr - 10, -4, Rr], [Lx + Rr - 10, W + 4, Rr], [[Ri - 6, 0], [Ri, 0], [Ri, W + 8], [Ri - 6, W + 8], [Ri - 6, 0]], M.kraft, { seg: 64 });
  // espiral de la cara del rollo
  for (let k = 0; k < 18; k++) { const r = Ri + (Rr - Ri) * k / 18; const m = new T.Mesh(new T.TorusGeometry(r, .9, 6, 96), R.M.pa('#a3251a')); m.position.set(Lx + Rr - 10, -.2, Rr); m.rotation.x = Math.PI / 2; R.sinBorde(m); R.raiz.add(m); }
  // bloque de telgopor adelante
  const tx = 120, ty = -360;
  R.caja(tx, tx + TELG.h, ty, ty + TELG.b, 0, TELG.a, M.telgopor, { r: 2 });
  R.ancla('rombo', [Lx * .35, W * .2, t]); R.ancla('orilla', [Lx * .7, W - 4, t]); R.ancla('leyenda', [500, W / 2 + 10, t]); R.ancla('rollo', [Lx + Rr, -2, Rr * 1.5]);
  R.ancla('telg', [tx + TELG.h * .5, ty, TELG.a * .6]); R.ancla('telgTop', [tx + TELG.h * .8, ty + TELG.b * .5, TELG.a]);
}
