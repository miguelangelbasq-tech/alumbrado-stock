/* MAT-CANAL_RIEL-2 · cable canal ranurado 40 × 30 (5002) con la tapa corrida y los cables saliendo por una ranura; tramo de 30 × 30 (5001) atrás */
import { canal, aislacion } from '../piezas/conex.mjs';
import { CANAL, COLOR } from '../piezas/perfiles_conex.mjs';
export default function (R) {
  R.vista({ az: -40, el: 32, fov: 12, margen: .03 });
  canal(R, 40, 0, 160, { tapa: [70, 190] });
  const g = R.grupo(); canal(R, 30, 0, 110, { padre: g, tapa: [0, 110] }); g.position.set(20, 70, 0);
  // cables dentro del canal
  const cols = [COLOR.L1, COLOR.L2, COLOR.L3, COLOR.N, COLOR.PE, COLOR.L1, COLOR.N];
  cols.forEach((c, i) => {
    const y = 5 + (i % 4) * 8.5, z = 4.2 + Math.floor(i / 4) * 5.5;
    aislacion(R, -14 - i * 2.5, 175, y, z, 1.83, c, { rayas: c === COLOR.PE ? COLOR.PEy : null });
  });
  // un cable que sale por la ranura hacia un aparato
  const T = R.THREE, paso = CANAL.dedo + CANAL.ranura, xr = 4 * paso + CANAL.dedo + CANAL.ranura / 2;
  const cur = new T.CatmullRomCurve3([new T.Vector3(xr - 30, 22, 10), new T.Vector3(xr - 6, 30, 11), new T.Vector3(xr, 40, 11), new T.Vector3(xr + 2, 58, 13), new T.Vector3(xr + 10, 74, 14)]);
  const m = new T.Mesh(new T.TubeGeometry(cur, 64, 1.83, 20, false), R.M.cable(COLOR.L3)); m.castShadow = true; R.raiz.add(m);
  R.ancla('tapa', [130, 8, 31.4]);
  R.ancla('dedo', [2 * paso + CANAL.dedo / 2, 0, 24]);
  R.ancla('ranura', [3 * paso + CANAL.dedo + CANAL.ranura / 2, 0, 15]);
  R.ancla('fondo', [10, 20, CANAL.fondo]);
  R.ancla('labio', [55, -CANAL.tapa.gancho, 28.7]);
  R.ancla('sale', [xr + 1, 46, 11.6]);
  R.ancla('cables', [-10, 13.5, 6]);
  R.ancla('canal30', [20 + 60, 70 + 30, 31.4]);
}
