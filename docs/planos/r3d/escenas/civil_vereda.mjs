/* MAT-REPOSICION-1 · corte escalonado: vereda (baldosa de 9 panes, mortero 2 cm, contrapiso 8 cm, relleno en capas de 15 cm)
 * y calzada (carpeta asfáltica, H-21 de 0,20, base granular) — cada capa termina antes que la de abajo */
import { VER, CALZ } from '../piezas/perfiles_civil.mjs';
import { matsC } from '../piezas/civil_util.mjs';
export default function (R) {
  R.vista({ az: 38, el: 26, fov: 15, margen: .04 });
  R.config({ bordeOp: .3 });
  const M = matsC(R), V = VER, C = CALZ;
  // ---- vereda (y de 0 a 600)
  const zb = -V.baldosa, zm = zb - V.mortero, zc = zm - V.contrapiso;
  const tonos = [M.relleno, M.tierra, M.relleno];
  for (let k = 0; k < 3; k++) R.caja(0, 900, 0, 600, zc - (k + 1) * V.capa, zc - k * V.capa, tonos[k], { r: 0 });
  R.caja(0, 780, 0, 600, zc, zm, M.hormP, { r: 0 });
  R.caja(0, 690, 0, 600, zm, zb, M.mortero, { r: 0 });
  const P = V.pan;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    const x0 = i * P, y0 = j * P; R.caja(x0 + 1.5, x0 + P - 1.5, y0 + 1.5, y0 + P - 1.5, zb, -5, M.baldosa, { r: .8 });
    for (let p = 0; p < 3; p++) for (let q = 0; q < 3; q++) R.caja(x0 + 8 + p * 62, x0 + 60 + p * 62, y0 + 8 + q * 62, y0 + 60 + q * 62, -5, 0, M.baldosa, { r: 1.5 });
  }
  // ---- calzada (y de -760 a -160)
  const y0 = -760, y1 = -160, za = -C.asfalto, zh = za - C.h21, zbse = zh - C.base;
  R.caja(0, 900, y0, y1, zbse - 300, zbse, M.tierra, { r: 0 });
  R.caja(0, 820, y0, y1, zbse, zh, M.base, { r: 0 });
  R.caja(0, 730, y0, y1, zh, za, M.hormD, { r: 0 });
  R.caja(0, 640, y0, y1, za, 0, M.asfalto, { r: 0 });
  R.ancla('baldosa', [600, 100, 0]); R.ancla('panes', [500, 300, 0]); R.ancla('mortero', [690, 300, (zm + zb) / 2]); R.ancla('contrapiso', [780, 300, (zc + zm) / 2]);
  R.ancla('capa1', [900, 300, zc - V.capa / 2]); R.ancla('capa2', [900, 300, zc - 1.5 * V.capa]); R.ancla('capa3', [900, 300, zc - 2.5 * V.capa]);
  R.ancla('asfalto', [640, -460, za / 2]); R.ancla('h21', [730, -460, (zh + za) / 2]); R.ancla('base', [820, -460, (zbse + zh) / 2]); R.ancla('suelo', [900, -460, zbse - 150]);
}
