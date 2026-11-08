/* MAT-APOYOS-1 · tramo del apoyo PRFV (2.100 a 2.900) con el apoya escalera H 12 (4012): «U» de planchuela, chapa y 2 abrazaderas · ESQUEMA (*) */
import { matsCol, tornoZP, abrazadera, APO } from '../piezas/col_util.mjs';
export default function (R) {
  R.vista({ az: -40, el: 18, fov: 12, margen: .04 }); R.config({ exposicion: .92, ambiente: .55 });
  const C = matsCol(R), P = APO.prfv, E = APO.esc;
  const rz = (z) => (P.Db - P.k * (z + P.LE) / 1000) / 2, e = 7;
  const pf = (z0, z1) => [[rz(z0) - e, 0], [rz(z0), 0], [rz(z1), z1 - z0], [rz(z1) - e, z1 - z0]];
  // tramo del apoya escalera (2.100 a 2.900), corrido a la derecha
  const g = R.grupo();
  tornoZP(R, 0, 0, 2100, pf(2100, 2900), 45, 405, C.prfv, { padre: g, seg: 128, tapas: false });
  const D = 2 * rz(E.z);
  abrazadera(R, D, E.z + 60, { padre: g }); abrazadera(R, D, E.z - 60, { padre: g });
  // «U» de planchuela 50 × 6 que sale hacia −y (el lado de la vereda), con los brazos soldados a una chapa de apoyo
  const [b, t] = E.pl, r = D / 2 + 6, yA = -r - E.a;
  for (const s of [-1, 1]) R.caja(s * E.b / 2 - t / 2, s * E.b / 2 + t / 2, yA, -r + 8, E.z - b / 2, E.z + b / 2, C.galv, { r: 1, padre: g });
  R.caja(-E.b / 2 - t / 2, E.b / 2 + t / 2, yA - t, yA, E.z - b / 2, E.z + b / 2, C.galv, { r: 1, padre: g });
  R.caja(-E.b / 2 - t / 2, E.b / 2 + t / 2, -r - 2, -r + 6, E.z - 110, E.z + 110, C.galv, { r: 1.5, padre: g });
  for (const s of [-1, 1]) R.caja(s * (E.b / 2 + 2) - 2, s * (E.b / 2 + 2) + 2, yA, yA + 40, E.z + b / 2, E.z + b / 2 + 60, C.galv, { r: .8, padre: g });
  R.ancla('escU', [0, yA - 3, E.z]);
  R.ancla('escTope', [E.b / 2, yA + 20, E.z + b / 2 + 50]);
  R.ancla('escAbr', [-D / 2 - 6, -12, E.z + 60]);
  R.ancla('escChapa', [-60, -r - 2, E.z - 90]);
  R.ancla('bulon', [D / 2 + 26, -14, E.z - 60]);
  R.ancla('apoyo', [-rz(2800) * .7, -rz(2800) * .7, 2800]);
}
