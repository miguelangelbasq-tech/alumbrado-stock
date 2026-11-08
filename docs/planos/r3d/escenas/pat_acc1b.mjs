/* MAT-ACCESORIOS_PAT-1 · bornes de PAT 6 mm² en riel NS35 (7004 azul · 7005 / 7006 gris · 7007 verde, DE BAJA) — mismo cuerpo que el BPN 6 */
import { riel, borne, cable, tope } from '../piezas/bpn.mjs';
import { BPN, TOPE } from '../piezas/perfiles.mjs';
export default function (R) {
  R.vista({ az: 138, el: 27, fov: 13, margen: .04 });
  const P = BPN.paso; let x = 0; const xs = [];
  tope(R, -TOPE.esp - .2);
  for (const [c, m, cab] of [['#2b5fae', '7004', ['#2b5fae']], ['#9aa0a6', '7005', ['#26282b']], ['#9aa0a6', '7006', null], ['#13843a', '7007', ['#13843a', '#f2c418']]]) {
    xs.push(x); borne(R, x, c, { marca: m, texto: 'PAT 6' }); if (cab) cable(R, x + 1 + (P - 1) / 2, 'D', cab, { largo: 24 }); x += P;
  }
  riel(R, -TOPE.esp - 4, x + 12);
  R.ancla('azul', [xs[0] + 4, BPN.C - 2, 40]); R.ancla('gris', [xs[1] + 4, BPN.C - 2, 40]); R.ancla('gris2', [xs[2] + 4, BPN.C - 2, 40]); R.ancla('verde', [xs[3] + 4, BPN.C - 2, 40]);
  R.ancla('tornillo', [xs[3] + 4.6, BPN.yT[1], BPN.tornillo.zCab]); R.ancla('riel', [x + 8, 44, -2]); R.ancla('cable', [xs[3] + 4.6, BPN.C + 20, BPN.puntera.zEje + 2.7]);
  R.ancla('marca', [xs[1] + 4.6, 31, 50.3]);
}
