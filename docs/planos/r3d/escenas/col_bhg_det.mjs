/* MAT-BRAZO_HG-1 · detalle de la punta: rosca gas cónica en el caño Ø48,3 × 2,9 y el acople Ø60 × 150 desenroscado, cortado a un cuarto (*) */
import { matsCol, tornoZP, roscaCano, BHG } from '../piezas/col_util.mjs';
export default function (R) {
  R.vista({ az: -35, el: 20, fov: 12, margen: .05 }); R.config({ exposicion: .92, ambiente: .55 });
  const C = matsCol(R), B = BHG, r = B.D / 2, A = B.acople;
  const g = R.grupo(); g.rotation.y = Math.PI / 2;        // eje z local → +x de mundo
  tornoZP(R, 0, 0, -230, [[r - B.e, 0], [r, 0], [r, 230], [r - B.e, 230]], 45, 405, C.galv, { padre: g, tapas: false });
  roscaCano(R, [0, 0, 0], [0, 0, B.rosca.L], r, r - B.e, C.galv, B.rosca.paso, { padre: g, conica: true });
  const z0 = B.rosca.L + 60;
  const ri = r + .6, pf = [[ri, 0]];
  const n = Math.floor(B.rosca.L * .8 / B.rosca.paso);
  for (let i = 0; i <= n; i++) { pf.push([ri, i * B.rosca.paso]); if (i < n) pf.push([ri - B.rosca.paso * .55, i * B.rosca.paso + B.rosca.paso / 2]); }
  pf.push([ri, B.rosca.L * .8]); pf.push([A.D / 2 - 3.6, B.rosca.L * .8]); pf.push([A.D / 2 - 3.6, A.L]); pf.push([A.D / 2, A.L]); pf.push([A.D / 2, 0]);
  tornoZP(R, 0, 0, z0, pf, 90, 360, C.galvO, { padre: g });
  R.ancla('cano', [-150, -r, 0]);
  R.ancla('rosca', [B.rosca.L * .5, -r, 0]);
  R.ancla('roscaInt', [z0 + 12, 0, -ri + 1]);
  R.ancla('acople', [z0 + 110, -A.D / 2 * .7, A.D / 2 * .7]);
}
