/* MAT-EMPALMES-2 · empalme recto con resina (kit de referencia 3M 92-NBA1, 178 × 69) en cable 4 × 10: molde transparente, resina,
 * conductores abiertos y uniones a compresión 2060 escalonadas. Corte a cuarto por el eje en la mitad izquierda. */
import { conductor, unionComp, aislacion } from '../piezas/conex.mjs';
import { RESINA, UNION, CABLE, COLOR } from '../piezas/perfiles_conex.mjs';
export default function (R) {
  R.vista({ az: -40, el: 28, fov: 12, margen: .03 });
  const T = R.THREE, L = RESINA.L, zc = RESINA.D / 2 + .2, c = CABLE.c4x10;
  const rCu = Math.sqrt(10 / Math.PI) * 1.0, rIn = rCu + c.aisl;      // 10 mm²: Ø3,57 + XLPE 0,7
  const rc = rIn * 1.414 + .05, rs = 13;
  const cols = [COLOR.L1, COLOR.L2, COLOR.L3, COLOR.N];
  const ang = [Math.PI, Math.PI / 2, 0, -Math.PI / 2];               // -y, +z, +y, -z
  const corte = R.grupo(), resto = R.grupo();
  const xS0 = 16, xS1 = L - 16;                                        // fin de la vaina en cada lado
  const xU = [52, 70, 96, 114];                                        // inicio de cada unión (escalonadas)
  for (let k = 0; k < 4; k++) {
    const cy = Math.cos(ang[k]), cz = Math.sin(ang[k]);
    const P = (x, r) => [x, r * cy, zc + r * cz];
    const pts = [P(-40, rc), P(xS0 + 4, rc), P(xS0 + 10, rc + 2.2), P(xS0 + 16, rc + 5.5), P(xS0 + 22, rs - 1.5), P(44, rs), P(L - 44, rs), P(xS1 - 22, rs - 1.5), P(xS1 - 16, rc + 5.5), P(xS1 - 10, rc + 2.2), P(xS1 - 4, rc), P(L + 40, rc)];
    const xu = xU[k];
    conductor(R, pts, rCu, rIn, cols[k], { padre: corte, pelado: [[xu - 1, xu + UNION.L + 1]] });
    const u = unionComp(R, xu, rs * cy, zc + rs * cz, { crimp: true, padre: corte });
  }
  // cable: vaina de PVC negra + relleno (con los 4 conductores adentro)
  const vaina = R.tipoCorte(R.M.cable(COLOR.vaina), 'plastico');
  const rell = R.tipoCorte(R.M.goma('#5b5f63'), 'plastico');
  for (const [a, b] of [[-40, xS0], [xS1, L + 40]]) {
    const anillo = r => Array.from({ length: 72 }, (_, i) => [r * Math.cos(i * Math.PI / 36), zc + r * Math.sin(i * Math.PI / 36)]);
    R.perfil(anillo(c.D / 2), [anillo(c.D / 2 - 1.6)], b - a, vaina, { a0: a, bevel: .2, padre: corte });
    const huecos = ang.map(q => Array.from({ length: 32 }, (_, i) => [rc * Math.cos(q) + rIn * Math.cos(i * Math.PI / 16), zc + rc * Math.sin(q) + rIn * Math.sin(i * Math.PI / 16)]));
    const circ = Array.from({ length: 64 }, (_, i) => [(c.D / 2 - 1.6) * Math.cos(i * Math.PI / 32), zc + (c.D / 2 - 1.6) * Math.sin(i * Math.PI / 32)]);
    R.perfil(circ, huecos, b - a - 1.5, rell, { a0: a + (a < 0 ? 0 : 1.5), bevel: 0, padre: corte });
  }
  // molde transparente (dos medias cañas) y resina
  const nb = RESINA.Dboca / 2, D = RESINA.D / 2, cu = RESINA.cuello, e = 1.6;
  const ext = [[nb, 0], [nb, 6], [D - 4, cu - 4], [D, cu], [D, L - cu], [D - 4, L - cu + 4], [nb, L - 6], [nb, L]];
  const sh = [...ext, ...ext.slice().reverse().map(([r, t]) => [r - e, t])];
  const molde = new T.MeshPhysicalMaterial({ color: '#e8f4fb', roughness: .06, metalness: 0, transparent: true, opacity: .24, clearcoat: 1, depthWrite: false, side: T.DoubleSide });
  R.tipoCorte(molde, R.M.pvc('#cfe6f2', { roughness: .2 }));
  R.torno([0, 0, zc], [L, 0, zc], sh, molde, { padre: corte, seg: 96 });
  // embudo de llenado y respiradero arriba
  R.torno([L / 2, 0, zc + D - 1], [L / 2, 0, zc + D + RESINA.embudoH], [[RESINA.embudoD / 2 - 1.2, 0], [RESINA.embudoD / 2 - .2, 0], [RESINA.embudoD / 2 + 3, RESINA.embudoH], [RESINA.embudoD / 2 + 1.8, RESINA.embudoH], [RESINA.embudoD / 2 - 1.2, .8]], molde, { padre: resto, seg: 48 });
  // resina (llena el molde): cara de corte con desplazamiento para que ganen los conductores
  const res = R.M.pvc('#7a8a2a', { roughness: .5, clearcoat: .35 });
  const resC = R.M.pvc('#a3ae5c', { roughness: .8, clearcoat: 0 }); resC.polygonOffset = true; resC.polygonOffsetFactor = 2; resC.polygonOffsetUnits = 6;
  R.tipoCorte(res, resC);
  const inn = ext.map(([r, t]) => [Math.max(r - e - .05, c.D / 2 + .05), t]).slice(1, -1);
  R.torno([0, 0, zc], [L, 0, zc], [[0, 7], ...inn.map(([r, t]) => [r, Math.min(Math.max(t, 7), L - 7)]), [0, L - 7]], res, { padre: corte, seg: 96 });
  // marcas de llenado (tope de los sellos de cinta) — anillos de cinta selladora en las bocas
  for (const x of [1, L - 7]) R.torno([x, 0, zc], [x + 6, 0, zc], [[c.D / 2, 0], [nb + .6, 0], [nb + .6, 6], [c.D / 2, 6]], R.tipoCorte(R.M.goma('#2b3036'), 'plastico'), { padre: corte, seg: 64 });
  R.cortar(corte, [-50, 104, -60, -.06, zc + .06, zc + 60]);
  // anclas
  R.ancla('molde', [140, -D * .7, zc + D * .7]);
  R.ancla('resina', [88, -8, zc + 14]);
  R.ancla('union', [xU[1] + 6, -.2, zc + rs + 3]);
  R.ancla('unionCorte', [xU[0] + 8, -rs, zc + .2]);
  R.ancla('cobre', [30, -(rc + 4.5), zc + .1]);
  R.ancla('xlpe', [44 - 8, -.2, zc + rs - 1.9]);
  R.ancla('vaina', [-20, -c.D / 2 * .7, zc + c.D / 2 * .7]);
  R.ancla('relleno', [6, -.2, zc + 6.6]);
  R.ancla('cinta', [3, -nb * .8, zc + nb * .6]);
  R.ancla('embudo', [L / 2, -RESINA.embudoD / 2 - 2, zc + D + RESINA.embudoH]);
  R.ancla('cableD', [L + 25, 0, zc + c.D / 2]);
}
