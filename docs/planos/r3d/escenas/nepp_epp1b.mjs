/* MAT-EPP-1 · detalle del conjunto puesto cortado a cuarto en el puño: interior 9009, goma 9010 y cobertor 3096 (capas) */
import { guante, matsN, escala } from '../piezas/nepp.mjs';
import { PUNOS } from '../piezas/perfiles_nepp.mjs';
export default function (R) {
  const E = escala(R, .05); R.ancla = E.ancla;
  R.vista({ az: 38, el: 30, fov: 16, margen: .04 });
  R.config({ bordeOp: .22, exposicion: .95, sombra: false });
  const M = matsN(R), P = PUNOS;
  const g1 = guante(R, 'g9009', { mat: M.algodon, soloPuno: true, sinFondo: true });
  const g2 = guante(R, 'g9010', { mat: M.gomaRoja, soloPuno: true, sinFondo: true });
  const g3 = guante(R, 'g3096', { mat: M.amarillo, costuras: M.costura, sinFondo: true });
  for (const g of [g1, g2, g3]) E.cortar(g, [0, 300, -300, -20, 0, 300]);
  const D = P.dielectrico;
  R.ancla('tela', [42, -30, 0]);
  R.ancla('goma', [71.5, -150, 0]);
  R.ancla('cuero', [64, -75, 0]);
  R.ancla('sobre', [-55, D.v0 + 12, 18]);
  R.ancla('costura', [-30, 60, 16]);
}
