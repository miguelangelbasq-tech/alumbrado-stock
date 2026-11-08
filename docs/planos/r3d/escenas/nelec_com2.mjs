/* MAT-COMANDO-2 · interruptor horario ABB 1 módulo (3094), horario genérico analógico 3 módulos (3100), Sonoff MINI R4 (3098) y S-MATE (3099).
 * Carcasa modular de protab_mod (TM, no se toca) con W propio; cajas de las Sonoff: nelec_util.cajaBornes. Medidas: perfiles_nelec (AC donde se indica) */
import { carcasaMod } from '../piezas/protab_mod.mjs';
import { rielModular } from '../piezas/fusibles.mjs';
import { TM } from '../piezas/perfiles_protab.mjs';
import { SONOFF, SMATE, HOR } from '../piezas/perfiles_nelec.mjs';
import { cajaBornes } from '../piezas/nelec_util.mjs';
import { MX, tubo } from '../piezas/protab_util.mjs';
export default function (R) {
  const X = MX(R);
  R.vista({ az: 150, el: 24, fov: 14, margen: .03 });
  rielModular(R, -10, 92, TM.zM);
  // ABB 1 módulo: carcasa + ventana con el tambor de segmentos + perilla de modo
  carcasaMod(R, TM, 0, 1, { W: HOR.abb.W, sinManija: true, color: '#efefea' });
  const xa = HOR.abb.W / 2;
  R.caja(xa - 7, xa + 7, TM.Dn - .1, TM.Dn + .3, 38, 62, R.M.pa('#2a2c30'), { r: .5 });
  R.cil([xa - 6, TM.Dn - 3, 50], [xa + 6, TM.Dn - 3, 50], 9.5, R.M.pa('#f4f3ee'), { seg: 64 });
  for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; const g = R.grupo(); R.caja(-5.5, 5.5, -.6, .6, 0, 1.4, R.M.pa(i % 3 ? '#3a3e45' : '#d63a2f'), { r: .1, padre: g }); g.position.set(xa, TM.Dn - 3 + 9.5 * Math.sin(a), 50 + 9.5 * Math.cos(a)); g.rotation.x = -a; }
  R.caja(xa - 6.8, xa + 6.8, TM.Dn + .3, TM.Dn + .7, 38.5, 61.5, X.policarb('#dfe9ee', .35), { r: .4 });
  R.cil([xa, TM.Dn, 30], [xa, TM.Dn + 3, 30], 2.8, R.M.pa('#2a2c30'), { seg: 24 });
  R.impreso([{ t: 'ABB', s: 1.2 }, 'AT1'], 15, 8, [xa, TM.Dn + .06, 69], [-1, 0, 0], [0, 0, 1], { color: '#c8302c', ppm: 50, peso: 800 });
  // genérico 3 módulos con dial de 24 h y segmentos imperdibles
  const xg = 22, Wg = HOR.gen.W; carcasaMod(R, TM, xg, 3, { W: Wg / 3, sinManija: true, color: '#f2f1ec', continuo: true });
  const xc = xg + Wg / 2;
  R.cil([xc, TM.Dn, 46], [xc, TM.Dn + 2.5, 46], HOR.gen.dial, R.M.pa('#f4f3ee'), { seg: 64 });
  for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2, r0 = 16.5; const g = R.grupo(); R.caja(-.7, .7, 0, 1.6, -2.4, 0, R.M.pa(i % 2 ? '#d63a2f' : '#3a3e45'), { padre: g, r: .1 }); g.position.set(xc + r0 * Math.cos(a), TM.Dn + 2.5, 46 + r0 * Math.sin(a)); }
  R.cil([xc, TM.Dn + 2.5, 46], [xc, TM.Dn + 4.5, 46], 6, R.M.pa('#c9c9c4'), { seg: 32 });
  R.caja(xc + 13, xc + 22, TM.Dn, TM.Dn + 2, 26, 31, R.M.pa('#3a3e45'), { r: .5 });
  R.impreso(['24 h · 16 A 250 V~'], 46, 5, [xc, TM.Dn + .06, 68], [-1, 0, 0], [0, 0, 1], { color: '#30343a', ppm: 40 });
  const C = { L: '#6e3b1d', N: '#1f78c0' };
  for (const [x, c] of [[xa, C.L], [xg + 9, C.L], [xg + Wg - 9, C.N]]) tubo(R, [[x, TM.cable.y, 85], [x, TM.cable.y, 110], [x, TM.cable.y - 6, 130]], 1.7, R.M.cable(c), { radial: 12 });
  // Sonoff MINI R4 y S-MATE apoyadas adelante (bornes hacia +y)
  const gS = R.grupo(); gS.position.set(30, 125, -18); gS.rotation.z = Math.PI; cajaBornes(R, SONOFF, { padre: gS, marca: ['SONOFF', 'MINIR4'], px: 34, boton: true });
  const gM = R.grupo(); gM.position.set(-38, 132, -18); gM.rotation.z = Math.PI; cajaBornes(R, SMATE, { padre: gM, marca: ['SONOFF', 'S-MATE'], px: 30 });
  R.ancla('abb', [xa, TM.Dn, 66]); R.ancla('tambor', [xa, TM.Dn + .5, 44]); R.ancla('modo', [xa, TM.Dn + 3, 30]);
  R.ancla('gen', [xc - 18, TM.Dn, 72]); R.ancla('dial', [xc + 12, TM.Dn + 4, 54]); R.ancla('seg', [xc - 16.5, TM.Dn + 4, 46]); R.ancla('riel', [88, -3, TM.zM + 16]);
  R.ancla('sonoff', [30, 125, -18 + SONOFF.H]); R.ancla('bornesS', [30, 125 + SONOFF.P / 2, -18 + SONOFF.H * .4]); R.ancla('smate', [-38, 132 + 8, -18 + SMATE.H]); R.ancla('bornesM', [-38 + 10, 132 + SMATE.P / 2, -18 + SMATE.H * .4]);
  R.ancla('cable', [xg + 9, TM.cable.y, 112]);
}
