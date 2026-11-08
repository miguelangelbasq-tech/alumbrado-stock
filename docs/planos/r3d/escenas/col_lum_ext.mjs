/* MAT-LUMINARIA_LED-1 · luminaria vial LED (ref. Strand RS 160) sobre la punta del brazo Ø60,3, vista de 3/4 desde arriba */
import { luminaria, matsCol, tuboP, LUM } from '../piezas/col_util.mjs';
export default function (R) {
  R.vista({ az: -40, el: 28, fov: 14, margen: .04 });
  const C = matsCol(R);
  const g = luminaria(R, { nema: 'foto' });
  g.rotation.z = 0;
  // brazo Ø60,3 entrando en el acople
  tuboP(R, [-260, 0, LUM.acople.z], [100, 0, LUM.acople.z], 30.15, 3.2, C.galv);
  R.ancla('cuerpo', [420, -LUM.W / 2, 25]);
  R.ancla('aletas', [400, -60, LUM.zJunta + 45]);
  R.ancla('tapaDrv', [120, -80, LUM.H - 2]);
  R.ancla('nema', [LUM.nema.x, -30, LUM.H + 50]);
  R.ancla('bulones', [40, 0, LUM.H + 1]);
  R.ancla('brazo', [-200, 0, LUM.acople.z + 30]);
  R.ancla('escala', [18, -LUM.cuello, LUM.zJunta - 9]);
}
