/* MAT-TABLERO-1 · el gabinete cerrado visto de adelante y de abajo: cierres de doble barra, bisagras, rótulo, pies y prensacables */
import { gabinete } from '../piezas/protab_caja.mjs';
import { GAB } from '../piezas/perfiles_protab.mjs';
export default function (R) {
  R.vista({ az: 212, el: -12, fov: 15, margen: .03 });
  R.config({ sombra: false });
  const W = GAB.W, H = GAB.H, P = GAB.P;
  gabinete(R, { abre: 0, cables: [{ x: -110, r: 9 }, { x: 0, r: 7 }, { x: 110, r: 7 }] });
  R.ancla('cierre', [W / 2 - 34, P + 3, GAB.cierres[0]]);
  R.ancla('rotulo', [0, P + .1, H - 60]);
  R.ancla('bisagra', [-W / 2 - 8, P - 4, GAB.bisagras[0]]);
  R.ancla('pie', [-W / 2 - 12, 2, 30]);
  R.ancla('prensa', [-110, P / 2, -18]);
  R.ancla('cable', [0, P / 2 + 7, -70]);
}
