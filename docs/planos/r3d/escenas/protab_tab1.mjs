/* MAT-TABLERO-1 · gabinete PRFV 530 × 430 × 200 (3020) con la puerta abierta, junta, bisagras, 2 cierres de doble barra, placa de montaje (3052)
 * sobre separadores, pies de fijación, 3 prensacables con cables y 2 semiabrazaderas (4003) al apoyo PRFV */
import { gabinete, posteSemi } from '../piezas/protab_caja.mjs';
import { GAB } from '../piezas/perfiles_protab.mjs';
export default function (R) {
  R.vista({ az: 152, el: 18, fov: 15, margen: .03 });
  const W = GAB.W, H = GAB.H, P = GAB.P, Rp = 110;
  gabinete(R, { abre: 112, cables: [{ x: -110, r: 9 }, { x: 0, r: 7 }, { x: 110, r: 7 }] });
  posteSemi(R, -Rp - 26, Rp, -140, H + 110, [90, H - 90], { yGab: 0 });
  R.ancla('cuerpo', [W / 2, P * .6, H * .7]);
  R.ancla('puerta', [-W / 2 - 150, P + 300, H * .45]);
  R.ancla('junta', [-W / 2 - 14, P + 60, H * .62]);
  R.ancla('cierre', [-W / 2 - 108, P + 360, GAB.cierres[1]]);
  R.ancla('bisagra', [-W / 2 - 6, P - 4, GAB.bisagras[1]]);
  R.ancla('placa', [80, GAB.placa.y + 2, H * .55]);
  R.ancla('separador', [GAB.placa.W / 2 - 15, 14, H / 2 + GAB.placa.H / 2 - 15]);
  R.ancla('bulon', [GAB.placa.W / 2 - 40, GAB.placa.y + 20, (H - GAB.placa.H) / 2 + 30]);
  R.ancla('prensa', [110, P / 2 + 16, -16]);
  R.ancla('cable', [-110, P / 2 + 6, -80]);
  R.ancla('semi', [Rp + 4, -Rp - 26 + 40, 90]);
  R.ancla('poste', [-60, -Rp - 26 + 90, H + 80]);
  R.ancla('pie', [W / 2 + 12, 2, H - 30]);
}
