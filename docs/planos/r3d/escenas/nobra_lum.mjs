/* MAT-LUMINARIA_LED-3 (grupo «nobra») · luminarias nuevas del pañol, a escala: Strand LED 100 W (6025 barrios / 6026 plazas: misma carcasa,
 * se dibuja con la RS 160 de MAT-LUMINARIA_LED-1 (*)), con shorting cup en el zócalo NEMA; Quisur LED 75 W (6028, escalada (*)) y
 * proyector LED Bael Pointer Plus 100 L90 (6030: cuerpo con aletas, vidrio y lira (*)). Medidas: LUM (perfiles_col), PROY, SCUP, QUISUR. */
import { luminaria, matsCol, tuboP, LUM } from '../piezas/col_util.mjs';
import { PROY as P, SCUP, QUISUR } from '../piezas/perfiles_nobra.mjs';
export default function (R) {
  R.vista({ az: -36, el: 26, fov: 15, margen: .04 });
  const C = matsCol(R), T = R.THREE;
  // Strand 100 W con su brazo y la shorting cup en el NEMA
  const g1 = luminaria(R, { nema: 'si' }); g1.position.set(0, 0, 0);
  tuboP(R, [-220, 0, LUM.acople.z], [60, 0, LUM.acople.z], 30.15, 3.2, C.galv);
  const N = LUM.nema, zc = LUM.H + 14;
  R.torno([N.x, 0, zc], [N.x, 0, zc + SCUP.H], [[0, 0], [SCUP.D / 2, 0], [SCUP.D / 2, SCUP.H * .55], [SCUP.D / 2 - 6, SCUP.H * .62], [SCUP.D / 2 - 7, SCUP.H], [0, SCUP.H]], R.M.pa('#1f2124', { roughness: .4 }), { seg: 96 });
  // Quisur 75 W (escalada)
  const g2 = luminaria(R, { nema: 'no', sinRotulos: true }); g2.scale.setScalar(QUISUR.k); g2.position.set(80, 520, 0);
  tuboP(R, [80 - 200, 520, LUM.acople.z * QUISUR.k], [80 + 50, 520, LUM.acople.z * QUISUR.k], 21.2, 2.8, C.galv);
  R.impreso([{ t: 'QUISUR LED 75 W (*)', s: .8 }], 140, 16, [80 + LUM.L * QUISUR.k * .6, 520 - LUM.W * QUISUR.k / 2 - .4, 15], [1, 0, 0], [0, 0, 1], { color: '#2b2f33', ppm: 12 });
  // proyector: cuerpo de aluminio con aletas atrás, marco y vidrio adelante (mira a −y), lira en U con 2 pernos, base
  const xP = 820, yP = -40, zP = 40, al = C.alu, alO = C.aluOsc;
  const W = P.W, H = P.H, D = P.P;
  R.caja(xP - W / 2, xP + W / 2, yP, yP + D * .55, zP, zP + H, al, { r: 6 });
  for (let k = 0; k < P.aletas; k++) { const x = xP - W / 2 + 18 + k * (W - 36) / (P.aletas - 1); R.caja(x - P.alet / 2, x + P.alet / 2, yP + D * .55 - 1, yP + D, zP + 12, zP + H - 12, alO, { r: .4 }); }
  R.caja(xP - W / 2 - 2, xP + W / 2 + 2, yP - 8, yP + 2, zP - 2, zP + H + 2, alO, { r: 4 });
  R.caja(xP - P.vidrio[0] / 2, xP + P.vidrio[0] / 2, yP - 8.6, yP - 7.8, zP + (H - P.vidrio[1]) / 2, zP + (H + P.vidrio[1]) / 2, C.vidrio, { r: 0 });
  R.caja(xP - 60, xP + 60, yP - 4, yP - 3, zP + 40, zP + H - 40, C.led, { r: 0 });
  const lb = P.lira, xl = P.lira.sep / 2;
  for (const s of [-1, 1]) { R.caja(xP + s * xl - lb.e / 2, xP + s * xl + lb.e / 2, yP + D * .2 - lb.a / 2, yP + D * .2 + lb.a / 2, 0, zP + H / 2 + 20, C.galv, { r: 1 });
    R.cil([xP + s * (W / 2 + 2), yP + D * .2, zP + H / 2], [xP + s * (xl + lb.e / 2 + 6), yP + D * .2, zP + H / 2], 7, C.inox, { seg: 6 }); }
  R.caja(xP - xl - lb.e / 2, xP + xl + lb.e / 2, yP + D * .2 - lb.a / 2, yP + D * .2 + lb.a / 2, 0, lb.e, C.galv, { r: 1 });
  R.impreso([{ t: 'BAEL POINTER PLUS 100', s: .7 }], 140, 14, [xP, yP - 8.1, zP + 18], [1, 0, 0], [0, 0, 1], { color: '#e8eaec', ppm: 12 });
  R.ancla('strand', [420, -LUM.W / 2, 25]); R.ancla('scup', [N.x, -SCUP.D / 2 * .7, zc + SCUP.H * .7]); R.ancla('brazo', [-180, 0, LUM.acople.z + 30]);
  R.ancla('quisur', [80 + 420 * QUISUR.k, 520 - LUM.W * QUISUR.k / 2, 20]); R.ancla('aletas', [320, -60, LUM.zJunta + 45]);
  R.ancla('proy', [xP - W / 2 + 20, yP - 8, zP + H - 30]); R.ancla('vidrio', [xP + 60, yP - 8.6, zP + H * .7]); R.ancla('lira', [xP + xl, yP + D * .2 - lb.a / 2, zP * .6]);
  R.ancla('aletasP', [xP + W / 2 - 18, yP + D, zP + H - 20]);
}
