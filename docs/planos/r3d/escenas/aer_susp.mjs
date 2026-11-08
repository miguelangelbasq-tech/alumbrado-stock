/* MAT-MORSETERIA_AEREA-1 · suspensión: poste H°A°, 2 flejes inox, ménsula 4504 y grampa 4502 colgando el haz 3 × 1 × 25/50 por el neutro portante */
import { HAZ, AER } from '../piezas/perfiles_cables.mjs';
import { hazPre } from '../piezas/cables.mjs';
import { posteHA, fleje, mensulaS, grampaS } from '../piezas/aerea.mjs';
export default function (R) {
  R.vista({ az: 34, el: 18, fov: 14, margen: .03 });
  R.config({ bordeOp: .35 });
  const rp = AER.poste.R, zc = 260, H = HAZ.h25_50, rn = H.neu.rc;
  posteHA(R, 150, 370, rp, .01);
  const m = mensulaS(R, rp, zc);
  const zf = [zc - (AER.mensS.h + 30) / 2 + 12, zc + (AER.mensS.h + 30) / 2 - 12];
  for (const z of zf) fleje(R, rp - .01 * (z - 150) + .15, z, 205);
  const gx = m.gancho[0], gz = zc - 12 - rn - 30;
  grampaS(R, [gx, 0, gz], rn);
  const g = R.grupo(); g.rotation.z = Math.PI / 2; g.position.set(gx, 0, gz);
  const o = hazPre(R, H, { x0: -260, xa: [250, 262, 274, 240], Lc: 10, zc: 0, paso: 300, a0: 30, padre: g, bulto: { x: 0, k: 1.15, w: 75 } });
  R.ancla('mensula', [rp + 40, 7, zc + 18]);
  R.ancla('gancho', [gx + 3, 0, zc - 16]);
  R.ancla('grampa', [gx + rn + 6, -20, gz - 4]);
  R.ancla('apriete', [gx, -AER.grampaS.L / 2 + 10, gz + rn + 6]);
  R.ancla('fleje', [(rp + 3) * Math.cos(-.6), (rp + 3) * Math.sin(-.6), zf[1]]);
  R.ancla('neutro', [gx, -120, gz + rn * .7]);
  R.ancla('fase', (() => { const p = o.f[0](-170); return [gx - p[1], p[0], gz + p[2]]; })());
  R.ancla('poste', [-rp * .2, -rp * .98, 180]);
}
