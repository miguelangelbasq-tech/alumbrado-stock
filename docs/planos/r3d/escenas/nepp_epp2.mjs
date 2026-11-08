/* MAT-EPP-2 · guantes de trabajo: 9007 tejido con palma de nitrilo (de baja), 9008 tejido moteado, 9011 descarne (puño largo) */
import { guante, matsN, escala } from '../piezas/nepp.mjs';
import { PUNOS, MANO } from '../piezas/perfiles_nepp.mjs';
export default function (R) {
  const E = escala(R, .02); R.ancla = E.ancla;
  R.vista({ az: -10, el: 52, fov: 14, margen: .04 });
  R.config({ bordeOp: .2, exposicion: .95 });
  const M = matsN(R), zG = MANO.palma.t / 2 + .5, P = PUNOS;
  const put = (key, x, y, op = {}) => { const g = guante(R, key, op); g.position.set(x, y, zG); g.rotation.z = op.rot || 0; return g; };
  put('g9007', -205, 30, { mat: M.tejidoG, nitrilo: M.nitrilo, rot: .05 });
  put('g9008', 0, 40, { mat: M.tejidoB, motas: M.pvcAzul });
  put('g9011', 215, 0, { mat: M.descarne, costuras: M.costura, rot: -.05 });
  const zt = zG + MANO.palma.t / 2;
  R.ancla('nitrilo', [-205 + 10, 30 + 50, zt + 1]);
  R.ancla('nitriloDedo', [-205 + 10, 30 + 160, zt - 4]);
  R.ancla('tejido', [-205 + 40, 30 - 20, zG + 18]);
  R.ancla('punoEl', [-205 - 30, 30 + P.tejido.v0 + 20, zG + 16]);
  R.ancla('motas', [0 - 10, 40 + 50, zt + 1.5]);
  R.ancla('tejidoB', [0 + 35, 40 - 30, zG + 16]);
  R.ancla('descarne', [215 - 20, 0 + 60, zt * 1.06]);
  R.ancla('punoLargo', [215 + 40, 0 + P.descarne.v0 + 40, zG + 22]);
  R.ancla('costura', [215 - 30, 0 + 40, zt * 1.06 + 1]);
}
