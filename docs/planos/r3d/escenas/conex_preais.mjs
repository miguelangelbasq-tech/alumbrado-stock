/* MAT-TERMINALES-3 · preaislados: amarillo Ø6 engarzado y cortado, azul Ø6 nuevo, pala (variante) y termocontraíble 2057 antes y después */
import { preaislado, termoTubo, aislacion, cuerda } from '../piezas/conex.mjs';
import { PREAIS, PREAIS_COL, COLOR, TERMO } from '../piezas/perfiles_conex.mjs';
export default function (R) {
  R.vista({ az: -30, el: 34, fov: 12, margen: .04 });
  const z = PREAIS.barrilDe / 2;
  preaislado(R, 0, 0, z, PREAIS_COL.amarillo, { crimp: true, cuarto: true, cable: 18, sec: 4, aisl: COLOR.L2 });
  preaislado(R, 2, -18, z, PREAIS_COL.azul, { leyenda: '6' });
  preaislado(R, 4, -34, z, PREAIS_COL.azul, { pala: true });
  // termocontraíble: tramo suelto (antes) y contraído sobre un cable
  termoTubo(R, -2, 24, -50, TERMO.Dsum / 2, { color: '#26282b' });
  // después: sobre un empalme de comando (dos cables de 1,5 con una unión de cobre estañado)
  aislacion(R, -8, 8, -64, TERMO.Dsum / 2, 1.42, COLOR.L3, {}); aislacion(R, 16, 32, -64, TERMO.Dsum / 2, 1.42, COLOR.L3, {});
  R.cil([7, -64, TERMO.Dsum / 2], [17, -64, TERMO.Dsum / 2], 1.95, R.M.cobreEst(), {});
  termoTubo(R, 2, 22, -64, TERMO.Dsum / 2, { color: '#26282b', sobre: [[1.42, 0], [1.42, 4.4], [1.95, 5.2], [1.95, 14.8], [1.42, 15.6], [1.42, 20]] });
  R.ancla('mang', [5, 0 + 3.6, z + 1.2]);
  R.ancla('barrilY', [6, -.4, z + 2.0]);
  R.ancla('marca', [PREAIS.mangL - 4, 0, z + 3.3]);
  R.ancla('ojalY', [PREAIS.L - 4, 4, z - z + PREAIS.t]);
  R.ancla('azul', [2 + 6, -18, z + PREAIS.mangDe / 2]);
  R.ancla('agujeroA', [2 + PREAIS.L - PREAIS.Dr / 2, -18 - 2, PREAIS.t]);
  R.ancla('pala', [4 + PREAIS.L - 3, -34 + 2.5, PREAIS.t]);
  R.ancla('termo0', [12, -50, TERMO.Dsum]);
  R.ancla('termo1', [12, -64, TERMO.Dsum / 2 + 2.3]);
}
