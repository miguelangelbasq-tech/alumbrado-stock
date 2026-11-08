/* MAT-HERRAJES-2 · en su lugar: rack con roldana MN 17 en el poste (2 semiabrazaderas), piloto atado con alambre 1001; al costado el aislador de rienda MN 20 (4011) */
import { MN, CAB } from '../piezas/perfiles_cables.mjs';
import { matsA, rack, posteHA } from '../piezas/aerea.mjs';
import { tubo, mats } from '../piezas/cables.mjs';
import { matsP, abrazadera } from '../piezas/pat.mjs';
export default function (R) {
  R.vista({ az: 30, el: 18, fov: 14, margen: .04 });
  R.config({ bordeOp: .3 });
  const A = matsA(R); A.porc.color.set('#6b3418'); A.porc.roughness = .18; A.porc.clearcoat = 1;
  const M = matsP(R), Mc = mats(R), rp = 100, zr = 300;
  posteHA(R, 0, 620, rp + 4, .015);
  const k = rack(R, rp, zr);
  for (const dz of [-80, 80]) abrazadera(R, 2 * rp, zr + dz, { escotes: 0 });
  const P = CAB.p1x25, rpi = P.Ro, xr = k.xp + MN.aislador.Dcuello / 2 + rpi;
  tubo(R, (y) => [xr, y, zr], -260, 260, rpi, Mc.ais('XN'), { rad: 40, tapas: true });
  for (const s of [-1, 1]) {
    const f = (t) => { const y = s * (MN.aislador.Dmax / 2 + 4 + t * 40); const a = t * 2 * Math.PI * 8; return [xr + (rpi + .9) * Math.cos(a), y, zr + (rpi + .9) * Math.sin(a)]; };
    tubo(R, f, 0, 1, .9, A.galv, { segs: 500, rad: 8 });
    // vuelta alrededor del cuello
  }
  const fc = (t) => { const a = Math.PI * (0.5 + 1.0 * t); return [k.xp + (MN.aislador.Dcuello / 2 + .9) * Math.cos(a) * 1, (MN.aislador.Dcuello / 2 + .9) * Math.sin(a), zr + 2 * Math.sin(t * 6)]; };
  tubo(R, (t) => { const a = Math.PI / 2 + Math.PI * t; return [k.xp + (MN.aislador.Dcuello / 2 + .9) * Math.cos(a), (MN.aislador.Dcuello / 2 + .9) * Math.sin(a), zr + 3]; }, 0, 1, .9, A.galv, { segs: 120, rad: 8 });
  // aislador de rienda MN 20: 90 × 65 (ficha), con dos agujeros cruzados (forma AC)
  const xm = 320, ym = -180, zm = 140;
  let eg = R.torno([xm, ym, zm - 45], [xm, ym, zm + 45], Array.from({ length: 25 }, (_, i) => { const t = -1 + 2 * i / 24; return [32.5 * Math.sqrt(Math.max(0, 1 - t * t)) + (i === 0 || i === 24 ? .01 : 0), 45 * (t + 1)]; }), A.porc, { seg: 64, padre: null });
  for (const [p0, p1] of [[[xm - 40, ym, zm + 16], [xm + 40, ym, zm + 16]], [[xm, ym - 40, zm - 16], [xm, ym + 40, zm - 16]]]) eg = R.restarCSG(eg, R.cil(p0, p1, 7, A.porc, { padre: null, seg: 32 }), R.M.corte(A.porc, 'ceramica'));
  R.agregar(eg);
  R.ancla('poste', [-rp * .7, -rp * .7, 520]); R.ancla('rack', [rp + 3, -MN.rack.a / 2, zr + 70]); R.ancla('aislador', [k.xp, -MN.aislador.Dmax / 2, zr + 22]);
  R.ancla('piloto', [xr, -220, zr + rpi]); R.ancla('atadura', [xr, -(MN.aislador.Dmax / 2 + 25), zr + rpi + 1]); R.ancla('semi', [0, -rp - 4, zr - 80 + 10]);
  R.ancla('mn20', [xm - 25, ym - 20, zm + 20]); R.ancla('agujeros', [xm, ym - 32, zm - 16]);
}
