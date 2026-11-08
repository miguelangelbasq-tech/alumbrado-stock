/* MAT-FICHAS-1 · fichas IRAM 2073 macho y hembra de 10 A (2061 / 2062) y 20 A (9043 / 9044). El macho de 10 A cortado a cuarto (bornes y grampa).
 * Geometría: perfiles_nelec.FICHA (patas 18,5 / tierra 22 del museo de fichas; el resto AC) */
import { fichaMacho, fichaHembra, pataPos } from '../piezas/nelec_util.mjs';
import { FICHA } from '../piezas/perfiles_nelec.mjs';
export default function (R) {
  R.vista({ az: 28, el: 20, fov: 14, margen: .03 });
  const X = { m10: -100, h10: -38, m20: 32, h20: 104 };
  const pon = (x, F, Hh) => {
    const z = Math.max(F.cuerpo.H, Hh.cuerpo.H) / 2 + 2;
    const gm = R.grupo(); gm.position.set(X[x[0]], 0, F.cuerpo.H / 2 + 2); fichaMacho(R, F, { padre: gm, cable: 60 });
    const gh = R.grupo(); gh.position.set(X[x[1]], 0, Hh.cuerpo.H / 2 + 2); fichaHembra(R, Hh, F, { padre: gh, cable: 60 });
    return F.cuerpo.H / 2 + 2;
  };
  const z10 = pon(['m10', 'h10'], FICHA.f10, FICHA.h10), z20 = pon(['m20', 'h20'], FICHA.f20, FICHA.h20);
  const F = FICHA.f10, p = pataPos(F);
  R.ancla('m10', [X.m10 - F.cuerpo.W * .45, F.cuerpo.L * .4, z10 + F.cuerpo.H * .3]);
  R.ancla('pataL', [X.m10 + p[0].x, -F.pata.L * .6, z10 + p[0].z]); R.ancla('tierra', [X.m10 + p[2].x, -F.tierra.L * .7, z10 + p[2].z - 1]);
  R.ancla('pataN', [X.m10 + p[1].x, -F.pata.L * .6, z10 + p[1].z]); R.ancla('cuerpo', [X.m10 + F.cuerpo.W * .3, F.cuerpo.L * .5, z10 + F.cuerpo.H * .42]);
  R.ancla('cable', [X.m10, F.cuerpo.L + 50, z10 + F.cable.D / 2]); R.ancla('h10', [X.h10 - 10, FICHA.h10.cuerpo.L * .5, FICHA.h10.cuerpo.H + 1]);
  R.ancla('ranura', [X.h10 + p[1].x, -.2, FICHA.h10.cuerpo.H / 2 + 2 + p[1].z]);
  const G = FICHA.f20;
  R.ancla('m20', [X.m20 + G.cuerpo.W * .3, G.cuerpo.L * .4, z20 + G.cuerpo.H * .45]); R.ancla('h20', [X.h20 + 10, FICHA.h20.cuerpo.L * .5, FICHA.h20.cuerpo.H + 1]);
  R.ancla('tierra20', [X.m20, -G.tierra.L * .6, z20 + G.tierra.cz - 1]);
}
