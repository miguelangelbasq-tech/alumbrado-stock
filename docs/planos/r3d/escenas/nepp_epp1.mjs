/* MAT-EPP-1 · juego dieléctrico sobre la alfombra 3091 (1000 x 1000 x 3): atrás interior 9009, dieléctrico clase 0 9010,
 * cobertor 3096 y vaqueta 9017; adelante el conjunto puesto (sobresale el puño de goma) */
import { guante, alfombra, matsN, escala } from '../piezas/nepp.mjs';
import { PUNOS, MANO, ALF } from '../piezas/perfiles_nepp.mjs';
export default function (R) {
  const E = escala(R, .02); R.ancla = E.ancla;
  R.vista({ az: -14, el: 56, fov: 14, margen: .025 });
  R.config({ bordeOp: .22, exposicion: .95 });
  const M = matsN(R), zG = ALF.e + MANO.palma.t / 2 + .5, P = PUNOS;
  alfombra(R, -500, 500, -500, 500);
  const put = (key, x, y, op = {}) => { const g = guante(R, key, op); g.position.set(x, y, zG); g.rotation.z = op.rot || 0; return g; };
  const yB = 140, yF = -300;
  put('g9009', -360, yB + 40, { mat: M.algodon });
  put('g9010', -150, yB, { mat: M.gomaRoja });
  put('g3096', 85, yB + 20, { mat: M.amarillo, costuras: M.costura });
  put('g9017', 320, yB + 50, { mat: M.vaqueta, costuras: M.costura });
  put('g9010', -40, yF, { mat: M.gomaRoja, soloPuno: true });
  const c2 = put('g3096', -40, yF, { mat: M.amarillo, costuras: M.costura }); c2.position.z += 1.2;
  // marca de la clase en el puño (IEC 60903: doble triángulo, clase 0, tensión, talle, fecha) · AC su posición
  const D = P.dielectrico, vM = -120, wM = 52;
  const zM = zG + (D.wA + (D.wB - D.wA) * (vM - D.v0) / (6 - D.v0)) / 2 * D.kz + .25;
  R.impreso([{ t: '▲▲  IEC 60903', s: .8 }, { t: 'CLASE 0', s: 1.15, c: '#b3121a' }, { t: '1000 V CA · T10 · 01/2026', s: .62 }], wM, 30, [-150, yB + vM, zM], [1, 0, 0], [0, 1, 0], { fondo: '#f6f2ea', color: '#1b1c1f', sep: .6 });
  R.ancla('interior', [-360 + 10, yB + 40 + 50, zG + 10]);
  R.ancla('interiorPuno', [-360 - 20, yB + 40 + P.tejido.v0 + 25, zG + 15]);
  R.ancla('dielectrico', [-150 - 20, yB - 40, zG + 12]);
  R.ancla('borde', [-150 - 50, yB + D.v0 + 2, zG + 6]);
  R.ancla('marca', [-150 + 18, yB + vM + 6, zM]);
  R.ancla('cobertor', [85 + 15, yB + 20 + 60, zG + 10]);
  R.ancla('costura', [85 - 30, yB + 20 + 40, zG + 15]);
  R.ancla('vaqueta', [320 + 15, yB + 50 + 60, zG + 12]);
  R.ancla('sobresale', [-40 + 50, yF + D.v0 + 18, zG + 14]);
  R.ancla('conjunto', [-40 + 10, yF + 70, zG + 12]);
  R.ancla('alfombra', [-420, -420, ALF.e]);
  R.ancla('nervio', [430, -380, ALF.e]);
  R.ancla('espesor', [200, -500, 1.5]);
}
