/* MAT-JABALINA-2 · en su lugar: cámara de inspección 150 × 150 en el terreno (cortado a cuarto), jabalina hincada, tomacable y el cable 1 × 10 V/A que sale hacia la columna */
import { JAB, TOMA, CAM } from '../piezas/perfiles_pat.mjs';
import { matsP, revol, tomacable, cableVA } from '../piezas/pat.mjs';
export default function (R) {
  R.vista({ az: -34, el: 26, fov: 14, margen: .03 });
  R.config({ bordeOp: .3 });
  const M = matsP(R), r = JAB.j58.D / 2, a = CAM.a / 2 + CAM.e, B = 230, Dz = 420;
  // terreno: bloque menos el cuarto que mira a la cámara y menos el hueco de la cámara
  let s = R.caja(-B, B, -B, B, -Dz, 0, M.tierra, { r: 0, padre: null });
  for (const h of [R.caja(-B - 5, 14, -B - 5, 14, -Dz - 5, 5, M.tierra, { r: 0, padre: null }), R.caja(-a - 1, a + 1, -a - 1, a + 1, -CAM.H - 2, 5, M.tierra, { r: 0, padre: null })]) s = R.restarCSG(s, h, M.tierraC);
  R.agregar(s);
  // pasto: capa fina arriba
  let p = R.caja(-B, B, -B, B, 0, 6, R.M.pa('#5f8f3a', { roughness: .95 }), { r: 0, padre: null });
  for (const h of [R.caja(-B - 5, 14, -B - 5, 14, -5, 10, M.tierra, { r: 0, padre: null }), R.caja(-a - 1, a + 1, -a - 1, a + 1, -5, 10, M.tierra, { r: 0, padre: null })]) p = R.restarCSG(p, h, R.M.pa('#7a5a3a'));
  R.agregar(p);
  // cámara (paredes de PVC negro, sin fondo) cortada a cuarto + tapa levantada
  let c = R.caja(-a, a, -a, a, -CAM.H, 0, M.pvcN, { r: 1.5, padre: null });
  c = R.restarCSG(c, R.caja(-a + CAM.e, a - CAM.e, -a + CAM.e, a - CAM.e, -CAM.H - 5, 5, M.pvcN, { r: 0, padre: null }), M.pvcNC);
  c = R.restarCSG(c, R.caja(-a - 5, 0, -a - 5, 0, -CAM.H - 5, 5, M.pvcN, { r: 0, padre: null }), M.pvcNC);
  c = R.restarCSG(c, R.cil([0, a - 10, -60], [0, a + 10, -60], 9, M.pvcN, { padre: null }), M.pvcNC);   // pasacable hacia la columna
  R.agregar(c);
  const tz = 70; const tp = R.caja(-a - 4, a + 4, -a - 4, a + 4, tz, tz + CAM.tapa, M.tapa, { r: 2, padre: null });
  R.agregar(tp); for (let i = -3; i <= 3; i++) R.caja(-a + 8, a - 8, i * 20 - 3, i * 20 + 3, tz + CAM.tapa, tz + CAM.tapa + 1.5, M.tapa, { r: .8 });
  // relleno de arena/piedra partida en el fondo de la cámara (no: tierra natural) · jabalina desde z = -40 hacia abajo
  const zj = -45;
  revol(R, { p0: [0, 0, zj], dir: [0, 0, -1], L: Dz + zj, ro: (th, z) => z < 1.5 ? r - 1.5 + z : r, mat: M.cobre, matC: M.cobreC, nt: 64, dz: 4, tapa1: false });
  const zc = zj - 22; const t = tomacable(R, 0, 0, zc);
  // cable: sube del tomacable, curva y sale por el pasacable hacia +y (a la columna)
  const z0 = zc - TOMA.H / 2 + 1.5, R0 = 18, zH = -60;
  const f = (u) => { // u = 0 en la punta (abajo del tomacable) → sale
    const L1 = (zH - R0) - z0; if (u <= L1) return [t.xc, 0, z0 + u];
    const b = (u - L1) / R0; if (b <= Math.PI / 2) return [t.xc, R0 - R0 * Math.cos(b), zH - R0 + R0 * Math.sin(b)];
    const w = u - L1 - R0 * Math.PI / 2; return [t.xc, R0 + w, zH];
  };
  const Ltot = (zH - R0 - z0) + R0 * Math.PI / 2 + (B - R0 + 40);
  cableVA(R, (u) => f(Ltot - u), 0, Ltot - 34, Ltot - 2, { up: [1, 0, 0], n: 220, franjas: [100, 280] });
  R.ancla('camara', [-a + 3, a * .3, -40]); R.ancla('tapa', [a * .3, -a - 4, tz + 6]); R.ancla('jabalina', [-r * .7, -r * .7, -300]);
  R.ancla('tomacable', [t.W0 + 3, -TOMA.E / 2, zc]); R.ancla('cable', [t.xc, B * .6, zH + 3]); R.ancla('terreno', [B * .6, -B * .6, -300]);
  R.ancla('pasacable', [t.xc, a, zH + 3]); R.ancla('piso', [B * .7, B * .7, 6]); R.ancla('cabeza', [0, 0, zj]);
}
