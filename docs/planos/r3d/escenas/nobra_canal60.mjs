/* MAT-CANAL_RIEL-2 rev. C (grupo «nobra») · cable canal perforado 40 × 60 gris Zoloda (5035, alta del equipo): tramo con la tapa corrida,
 * agujeros oblongos en el fondo, cables adentro y uno que sale por una ranura hacia adelante. */
import { canalAlto } from '../piezas/nobra_util.mjs';
import { CANAL60 as C } from '../piezas/perfiles_nobra.mjs';
import { aislacion } from '../piezas/conex.mjs';
import { COLOR } from '../piezas/perfiles_conex.mjs';
export default function (R) {
  R.vista({ az: -38, el: 30, fov: 12, margen: .04 });
  canalAlto(R, 0, 200, { tapa: [95, 230] });
  const cols = [COLOR.L1, COLOR.L2, COLOR.L3, COLOR.N, COLOR.PE, COLOR.L1, COLOR.N, COLOR.L2, COLOR.L3, COLOR.N];
  cols.forEach((c, i) => {
    const y = 5.2 + (i % 4) * 8.6, z = C.fondo + 2.1 + Math.floor(i / 4) * 5.6;
    aislacion(R, -16 - i * 2.5, 215, y, z, 1.83, c, { rayas: c === COLOR.PE ? COLOR.PEy : null });
  });
  const T = R.THREE, paso = C.dedo + C.ranura, xr = 5 * paso + C.dedo + C.ranura / 2, zr = C.H - C.alturaRanura;
  const cur = new T.CatmullRomCurve3([new T.Vector3(xr - 30, 14, 8), new T.Vector3(xr - 4, 8, zr + 6), new T.Vector3(xr, 3, zr + 9), new T.Vector3(xr, -3, zr + 9), new T.Vector3(xr + 2, -14, zr + 4), new T.Vector3(xr + 6, -26, zr - 14)]);
  const m = new T.Mesh(new T.TubeGeometry(cur, 64, 1.83, 20, false), R.M.cable(COLOR.L3)); m.castShadow = true; R.raiz.add(m);
  R.ancla('tapa', [170, 10, C.H + 1.5]); R.ancla('dedo', [2 * paso + C.dedo / 2, 0, C.H - 10]); R.ancla('ranura', [3 * paso + C.dedo + C.ranura / 2, 0, zr + 18]);
  R.ancla('agujero', [C.agujero.paso / 2, C.W / 2, C.fondo]); R.ancla('fondo', [8, 8, C.fondo]); R.ancla('sale', [xr + 2, -14, zr + 4]);
  R.ancla('cables', [-12, 14, 6]); R.ancla('alto', [200, 0, C.H - 3]);
}
