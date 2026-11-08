/* MAT-LUMINARIA_LED-3 (grupo «nobra») · shorting cup (6029) sobre el zócalo NEMA (ANSI C136.10/.41) de la luminaria, explotada y CORTADA
 * A CUARTO: las 3 patas (L, N, CARGA) y el puente de bronce que une LINEA con CARGA (la luminaria queda prendida siempre; el corte lo hace el
 * tablero). Medidas: SCUP (TE ALR-MC-10: Ø73 × 35,6), FOTO (perfiles_protab). */
import { SCUP as S } from '../piezas/perfiles_nobra.mjs';
import { FOTO } from '../piezas/perfiles_protab.mjs';
import { zocaloFoto } from '../piezas/protab_caja.mjs';
import { tuboB } from '../piezas/civil_util.mjs';
export default function (R) {
  R.vista({ az: 38, el: 30, fov: 14, margen: .06 });
  const T = R.THREE, cup = R.M.pa('#1f2124', { roughness: .4 }), lat = R.M.laton();
  zocaloFoto(R, 0, 0, 0, { largo: 60 });
  const z0 = 46;   // la tapa levantada (explotada)
  // cáscara de la tapa: abierta el cuarto x>0, y<0 (ángulos 270–360 en el marco de tuboB: a=0 → +x, 90 → +y)
  const ro = (t) => (t < S.H * .55 ? S.D / 2 : S.D / 2 - 6), ri = (t) => ro(t) - 2.2;
  tuboB(R, (t) => [0, 0, z0 + t], 0, S.H - 2.5, (t) => ro(t - z0), (t) => ri(t - z0), cup, { a0: 0, a1: 270, n: 24, na: 96, up: [1, 0, 0] });
  tuboB(R, (t) => [0, 0, z0 + S.H - 2.5 + t], 0, 2.5, () => S.D / 2 - 7, () => .01, cup, { a0: 0, a1: 270, n: 2, na: 96, up: [1, 0, 0] });
  // base interior (disco con las patas) y patas de bronce
  tuboB(R, (t) => [0, 0, z0 + t], 2, 5, () => S.D / 2 - 2.4, () => .01, R.M.pa('#2d3034', { roughness: .5 }), { a0: 0, a1: 270, n: 2, na: 96, up: [1, 0, 0] });
  const pata = {};
  for (const p of FOTO.patas) {
    const a = p.a * Math.PI / 180, x = FOTO.rPatas * Math.cos(a), y = FOTO.rPatas * Math.sin(a);
    const g = R.grupo(); g.position.set(x, y, z0); g.rotation.z = a + Math.PI / 2;
    R.caja(-4, 4, -FOTO.pata.esp / 2, FOTO.pata.esp / 2, -FOTO.pata.largo, 5, lat, { r: .3, padre: g });
    R.caja(-4, 4 + FOTO.pata.pie, -FOTO.pata.esp / 2, FOTO.pata.esp / 2, -FOTO.pata.largo, -FOTO.pata.largo + 2.5, lat, { r: .3, padre: g });
    pata[p.n] = [x, y];
  }
  // puente L → CARGA (planchuela de bronce por arriba del disco)
  const [xa, ya] = pata.L, [xb, yb] = pata.CARGA;
  const cur = new T.CatmullRomCurve3([new T.Vector3(xa, ya, z0 + 6), new T.Vector3((xa + xb) / 2, (ya + yb) / 2 - 3, z0 + 9), new T.Vector3(xb, yb, z0 + 6)]);
  const mb = new T.Mesh(new T.TubeGeometry(cur, 40, 1.4, 12, false), lat); mb.castShadow = true; R.raiz.add(mb);
  for (const [x, y] of [[xa, ya], [xb, yb]]) R.cil([x, y, z0 + 4], [x, y, z0 + 8], 2.6, lat, { seg: 24 });
  R.ancla('cup', [-S.D / 2 * .7, -S.D / 2 * .7, z0 + S.H * .5]); R.ancla('puente', [(xa + xb) / 2, (ya + yb) / 2 - 3, z0 + 9]);
  R.ancla('pataL', [xa, ya, z0 - 8]); R.ancla('pataC', [xb, yb, z0 - 8]); R.ancla('pataN', [pata.N[0], pata.N[1], z0 - 8]);
  R.ancla('zocalo', [-FOTO.zocalo.D / 2 * .8, -FOTO.zocalo.D / 2 * .6, -10]); R.ancla('cables', [10, -8, -50]);
}
