/* MAT-MORSETERIA_AEREA-2 · en su lugar: poste de madera con bulón de ojo pasante (retención), rack 4B2L + aislador MN 16 con el piloto atado */
import { MN, CAB, HAZ } from '../piezas/perfiles_cables.mjs';
import { posteMadera, bulonOjo, rack, grampaR } from '../piezas/aerea.mjs';
import { tubo, cuerda, mats } from '../piezas/cables.mjs';
export default function (R) {
  R.vista({ az: 28, el: 18, fov: 14, margen: .03 });
  R.config({ bordeOp: .3 });
  const rp = 110, M = mats(R);
  posteMadera(R, 130, 500, rp);
  // bulón de ojo pasante a z = 420: el ojo sale en +x, la tuerca con arandela del otro lado
  const zb = 420, B = MN.bulonOjo, rm = (B.ojoRi + B.ojoRe) / 2;
  bulonOjo(R, [rp + 6 + rm, 0, zb], [-1, 0, 0], 2 * rp + 40, { n: [0, 0, 1], dt: 2 * rp + 6 });
  // arandela del lado del ojo
  // grampa de retención colgada del ojo con el neutro portante
  const rn = HAZ.h25_50.neu.rc, x0 = rp + 6 + 2 * rm + 70;
  grampaR(R, x0, zb, rn, [rp + 6 + 2 * rm - 4, 0, zb]);
  tubo(R, (x) => [x, 0, zb], x0 - 2, x0 + 260, rn, M.ais('XN'), { rad: 40, tapas: 'fin' });
  // rack con aislador a z = 220 y el piloto atado
  const zr = 220; const k = rack(R, rp - 4, zr);
  const P = CAB.p1x25, rpi = P.Ro, xr = k.xp + MN.aislador.Dcuello / 2 + rpi;
  tubo(R, (y) => [xr, y, zr], -240, 240, rpi, M.ais('XN'), { rad: 40, tapas: true });
  // atadura de alambre (vueltas helicoidales alrededor del piloto a los dos lados del aislador)
  for (const s of [-1, 1]) {
    const f = (t) => { const y = s * (MN.aislador.Dmax / 2 + 4 + t * 40); const a = t * 2 * Math.PI * 8; return [xr + (rpi + .9) * Math.cos(a), y, zr + (rpi + .9) * Math.sin(a)]; };
    tubo(R, f, 0, 1, .9, R.tipoCorte(R.M.aceroCinc(), 'metal'), { segs: 500, rad: 8 });
  }
  R.ancla('poste', [rp * .7, -rp * .7, 320]);
  R.ancla('ojo', [rp + 6 + rm, 0, zb + B.ojoRe * .5]);
  R.ancla('tuerca', [-rp - 12, 0, zb + 10]);
  R.ancla('grampa', [x0 + 50, -(rn + 12), zb]);
  R.ancla('rack', [rp, -MN.rack.a / 2, zr + 80]);
  R.ancla('aislador', [k.xp, -MN.aislador.Dmax / 2, zr + 20]);
  R.ancla('piloto', [xr, -200, zr + rpi]);
  R.ancla('atadura', [xr, -(MN.aislador.Dmax / 2 + 25), zr + rpi + 1]);
}
