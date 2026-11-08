/* MAT-FUSIBLES-2 · base 8×31 (3002) cortada a cuarto y borne seccionable 5×20 (3003) con la palanca abierta, en el riel NS35 */
import { portafusible, rielModular, borne520 } from '../piezas/fusibles.mjs';
import { BASE831, F85x315, B520 } from '../piezas/perfiles.mjs';
export default function (R) {
  R.vista({ az: -146, el: 21, fov: 13, margen: .03 });
  const T = BASE831, W = T.W;
  rielModular(R, -10, W + 8, T.zM);
  portafusible(R, T, F85x315, 0, { rotulos: { frente: '8x31', lado: ['8,5x31,5', '25A  1P'], izq: true },
    fusOp: { cuarto: [-1, 1], cortarDesde: 0 }, cortar: [-1, W / 2, -10, 80, T.zM, 100],
    cables: [{ lado: 'S', color: '#6e3b1d' }, { lado: 'I', color: '#6e3b1d' }] });
  // borne 5×20 en su propio riel horizontal, al lado (sistema del borne: riel a lo largo de x)
  const g = R.grupo(); g.position.set(-50, -40, 0);
  const rg = R.grupo(g);
  borne520(R, 0, { padre: g, abierto: B520.abre });
  borne520(R, B520.paso, { padre: g });
  const per = [[0, 7.5], [0, 6.5], [4, 6.5], [4, 0], [31, 0], [31, 6.5], [35, 6.5], [35, 7.5], [30, 7.5], [30, 1], [5, 1], [5, 7.5]].map(([u, v]) => [B520.rielY0 + u, v - 7.5]);
  R.perfil(per, [], 34, R.M.aceroCinc(), { a0: -10, bevel: .12, padre: g });
  R.ancla('base', [0, 20, 12]);
  R.ancla('carro', [2, T.D - 1, T.cuello[1] - 6]);
  R.ancla('fus85', [W / 2 - .5, T.fus.y, T.zM + 4]);
  R.ancla('pinza', [W / 2, T.fus.y - 5, T.pinza.zS - 2]);
  R.ancla('jaula', [W / 2, 30, T.H - 8]);
  R.ancla('palanca', [-46, -11.5, 72]);
  R.ancla('vidrio', [-46, -16.2, 53]);
  R.ancla('b520', [-46, -40 + 72.5, 15]);
  R.ancla('riel', [-8, -3, T.zM + 17]);
}
