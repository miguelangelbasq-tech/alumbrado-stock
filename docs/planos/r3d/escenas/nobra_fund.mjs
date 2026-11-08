/* MAT-FUNDACION-1 (grupo «nobra») · fundación de columna PRFV 7 m (AP-TC-003-A) con lo que entra en el pozo, CORTADA A CUARTO:
 * hormigón H-13 (8039 cemento · 8040 arena gruesa · 8041 agua + piedra), molde de PVC central (5036), caño de desagüe Ø25,4 en el fondo (5037),
 * bloque de telgopor para la entrada del cable (8042) con el cable que entra desde la zanja, arena fina seca en el espacio anular (6027),
 * sello de hormigón de 50 y elastómero en los vacíos (8043). Medidas: FUND (perfiles_nobra). */
import { FUND as F } from '../piezas/perfiles_nobra.mjs';
import { matsC, tuboB } from '../piezas/civil_util.mjs';
import { matsCol } from '../piezas/col_util.mjs';
export default function (R) {
  R.vista({ az: 34, el: 20, fov: 15, margen: .03 });
  R.config({ bordeOp: .22 });
  const M = matsC(R), C = matsCol(R), T = R.THREE, a = F.a / 2, t = F.t, LE = F.LE;
  const rP = F.Dposte / 2, rMo = F.Dcom / 2, rMi = rMo - F.eMolde, TG = F.telg;
  const g = R.grupo();
  // terreno alrededor del pozo
  let suelo = R.caja(-700, 700, -700, 700, -t - 200, -60, M.tierra, { r: 0, padre: null });
  suelo = R.restarCSG(suelo, R.caja(-a, a, -a, a, -t - 1, 10, M.tierra, { r: 0, padre: null }), M.tierra); g.add(suelo);
  let pasto = R.caja(-700, 700, -700, 700, -60, 0, M.pasto, { r: 0, padre: null });
  pasto = R.restarCSG(pasto, R.caja(-a, a, -a, a, -100, 10, M.pasto, { r: 0, padre: null }), M.pasto); g.add(pasto);
  // hormigón: bloque del pozo menos el molde, el telgopor y el desagüe
  let hor = R.caja(-a, a, -a, a, -t, 0, M.horm, { r: 0, padre: null });
  hor = R.restarCSG(hor, R.cil([0, 0, -LE], [0, 0, 10], rMo, M.horm, { padre: null, seg: 96 }), M.horm);
  hor = R.restarCSG(hor, R.caja(-TG.a / 2, TG.a / 2, -a - 1, -rMo + 2, -t + TG.z0, -t + TG.z0 + TG.h, M.horm, { r: 0, padre: null }), M.horm);
  hor = R.restarCSG(hor, R.cil([0, 0, -t - 5], [0, 0, -LE + 2], F.desague.D / 2, M.horm, { padre: null, seg: 32 }), M.horm); g.add(hor);
  R.caja(-TG.a / 2, TG.a / 2, -a, -rMo, -t + TG.z0, -t + TG.z0 + TG.h, M.telgopor, { r: 0, padre: g });
  // cable subterráneo que viene de la zanja y entra por el canal del telgopor hasta la «C» del poste (a 350 de la base: AP-C-033-A)
  const zC = -LE + 350, cab = R.M.cable('#1f2022');
  const cur = new T.CatmullRomCurve3([new T.Vector3(8, -700, -720), new T.Vector3(8, -a - 40, -720), new T.Vector3(8, -rMo - 60, zC - 30), new T.Vector3(8, -rP - 8, zC), new T.Vector3(8, -rP + 20, zC + 30)]);
  const mc = new T.Mesh(new T.TubeGeometry(cur, 80, 11, 24, false), cab); mc.castShadow = true; mc.userData.noCortar = true; g.add(mc);
  R.raiz.updateMatrixWorld(true);
  R.cortar(g, [0, 800, -800, 0, -t - 300, 600]);
  // poste PRFV hueco (pared 6 (*)), abierto el mismo cuarto (sin CSG), con la «C» de entrada del cable a 350 de la base
  const ro = (z) => rP - .0122 * (z + LE) / 2, ri = (z) => ro(z) - 6;
  tuboB(R, (z) => [0, 0, z], -LE, 420, ro, ri, C.prfv, { a0: 0, a1: 270, n: 24, na: 96 });
  // piezas de revolución abiertas el mismo cuarto (sin CSG): molde (queda perdido (*)), desagüe, arena fina, sello y elastómero
  const sec = (z0, z1, r0, r1, mat) => tuboB(R, (z) => [0, 0, z], z0, z1, () => r1, () => r0, mat, { a0: 0, a1: 270, n: 2, na: 96 });
  sec(-LE, 0, rMi, rMo, M.pvc); sec(-t - 2, -LE + 2, F.desague.D / 2 - F.desague.e, F.desague.D / 2, M.pvc);
  sec(-LE, -F.arena, rP + .5, rMi - .5, M.arena); sec(-F.sello, -2, rP + .5, rMi - .5, M.hormP); sec(-6, 4, rP + .2, rP + 8, M.elast);
  R.ancla('hormigon', [a - 60, -a, -t + 120]); R.ancla('molde', [rMo - 1, 0, -LE + 300]); R.ancla('desague', [F.desague.D / 2, 0, -t + 90]);
  R.ancla('telgopor', [TG.a / 2, -a + 60, -t + TG.z0 + TG.h - 120]); R.ancla('arena', [(rP + rMi) / 2, 0, -LE + 250]); R.ancla('sello', [(rP + rMi) / 2, 0, -F.sello / 2]);
  R.ancla('elast', [rP + 5, -3, 3]); R.ancla('poste', [-rP * .7, -rP * .7, 300]); R.ancla('cable', [8, -a - 150, -720 + 11]); R.ancla('tierra', [600, -700, -600]);
  R.ancla('fondo', [a - 40, -40, -t]); R.ancla('nivel', [-a + 20, -a, 0]);
}
