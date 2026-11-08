/* MAT-MORSETERIA_AEREA-1 · retención en punta: ménsula 4505 con 2 flejes, grampa de cuña 4503 en el neutro portante, cola de 1,5 m */
import { HAZ, AER } from '../piezas/perfiles_cables.mjs';
import { hazPre, tubo, cuerda, mats } from '../piezas/cables.mjs';
import { posteHA, fleje, mensulaR, grampaR } from '../piezas/aerea.mjs';
export default function (R) {
  R.vista({ az: 24, el: 22, fov: 14, margen: .03 });
  R.config({ bordeOp: .35 });
  const rp = AER.poste.R, zc = 260, H = HAZ.h25_50, rn = H.neu.rc, M = mats(R);
  posteHA(R, 150, 370, rp, .01);
  const m = mensulaR(R, rp, zc);
  for (const z of [zc - AER.mensR.h / 2 + 12, zc + AER.mensR.h / 2 - 12]) fleje(R, rp - .01 * (z - 150) + .15, z, 205);
  const x0 = m.ojo[0] + 70;
  const gr = grampaR(R, x0, zc, rn, m.ojo);
  // neutro portante: entra por la boca grande (x0 + 120) y sale por la chica (x0) como cola que baja por el poste
  const N = H.neu, xs = x0 + gr.Lc + 10;
  // cola: sale por la boca chica hacia el poste, dobla y baja (1,5 m: se dibuja un tramo)
  const L1 = 50, Rr = 35, L2 = 110, Lt = L1 + Math.PI / 2 * Rr + L2;
  const cola = (t) => { const s = t * Lt;
    if (s < L1) return [x0 + 2 - s, -s * .25, zc];
    if (s < L1 + Math.PI / 2 * Rr) { const a = (s - L1) / Rr; return [x0 + 2 - L1 - Rr * Math.sin(a), -L1 * .25, zc - Rr * (1 - Math.cos(a))]; }
    return [x0 + 2 - L1 - Rr, -L1 * .25, zc - Rr - (s - L1 - Math.PI / 2 * Rr)]; };
  tubo(R, cola, 0, 1, N.rc, M.ais('XN'), { rad: 40, segs: 120, tapas: 'fin' });
  tubo(R, (x) => [x, 0, zc], x0 - 2, xs + 2, N.rc, M.ais('XN'), { rad: 40, tapas: false });
  // haz hacia el vano (+x): fases retorcidas sobre el neutro desde xs
  const g = R.grupo(); g.position.set(xs, 0, zc);
  hazPre(R, H, { x0: 0, xa: [150, 162, 174, 140], Lc: 8, zc: 0, paso: 300, a0: 30, padre: g, bulto: { x: 0, k: 1.3, w: 40 } });
  // las fases rodean la grampa y bajan (puente a la bajada): tramo corto
  R.ancla('mensula', [rp + 30, 6, zc + 14]);
  R.ancla('ojo', [m.ojo[0] + 5, 4, m.ojo[2] + 4]);
  R.ancla('grampa', [x0 + 60, -(rn + 8.5), zc + 2]);
  R.ancla('cuna', [x0 + gr.Lc + 10, -(rn + 6), zc + 3]);
  R.ancla('fiador', [x0 - 20, -rn - 3, zc]);
  R.ancla('cola', [x0 + 2 - 50 - 35, -12.5 - N.rc, zc - 100]);
  R.ancla('vano', [xs + 120, -20, zc + 10]);
  R.ancla('fleje', [(rp + 1) * Math.cos(-.6), (rp + 1) * Math.sin(-.6), zc + AER.mensR.h / 2 - 12]);
}
