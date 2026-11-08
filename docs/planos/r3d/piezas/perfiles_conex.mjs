/* perfiles_conex.mjs · ÚNICA fuente de la geometría (mm) del grupo «conex»: punteras TIF, terminales de ojal (Cu estañado y preaislados),
 * termocontraíble, empalmes (WAGO 221, resina + unión a compresión, termocontraíble, gel, conector estanco), prensacables, riel NS35 y cable canal.
 * El plano (hojas/mat/conexkit.py, vía perfiles_conex.json) y el 3D (piezas/conex.mjs) salen de estos mismos números.
 * «AC» = a confirmar (no está en ninguna ficha): proporcional a una referencia. Fuentes: r3d/FUENTES_conex.md */

/* ---------- cables: diámetros y cuerdas ---------- */
// Ø sobre la aislación de un unipolar (tabla DIAM_UNIPOLAR de la app) y cuerda de hilos (clase 5 flexible para punteras; clase 2 para 10/16 mm²)
export const CABLE = {
  uni: { 1.5: 2.84, 2.5: 3.66, 4: 4.11, 6: 4.95, 10: 6.35, 16: 7.3 },            // app: DIAM_UNIPOLAR
  // hilos: [cantidad, Ø del hilo] — clase 5 IEC 60228 (AC: cantidad típica de fabricante)
  hilosFlex: { 1.5: [30, .25], 2.5: [50, .25], 4: [56, .30], 6: [84, .30], 10: [80, .40] },
  hilosRig: { 10: [7, 1.35], 16: [7, 1.70], 25: [7, 2.14] },                     // clase 2 (AC)
  c4x10: { D: 17, aisl: .7, relleno: 1.0 },                                       // ficha «cable subterráneo»: Ø17 (4×10)
};
export const COLOR = { L1: '#6e3b1d', L2: '#26282b', L3: '#c8302c', N: '#1f78c0', PE: '#13843a', PEy: '#f2c418', vaina: '#202226' };

/* ---------- punteras TIF (DIN 46228-4) ---------- */
// L, caña (L2) y Ø int.: ficha de la app (tabla de un fabricante). D2 (collar): 1,5 Interpower 3,5 · 2,5 Weidmüller H2,5 4,2 · 4 Weidmüller H4 4,8 · 6 y 10 AC.
// pared del tubo: 0,15 (Phoenix, 0,75 mm²) → AC para estas secciones. Colores: serie DIN 46228-4 y la de la ficha (NF C 63-023).
export const TIF = [
  { s: '1,5', sec: 1.5, cod: 2028, L: 12.5, L2: 6, di: 1.8, D2: 3.5, t: .15, din: '#1b1c1f', dinN: 'NEGRO', fr: '#1b1c1f', frN: 'NEGRO', d2ac: false },
  { s: '2,5', sec: 2.5, cod: 2030, L: 15, L2: 8, di: 2.3, D2: 4.2, t: .2, din: '#2b5fae', dinN: 'AZUL', fr: '#8f959c', frN: 'GRIS', d2ac: false },
  { s: '4', sec: 4, cod: 2031, L: 17.5, L2: 10, di: 2.9, D2: 4.8, t: .2, din: '#8f959c', dinN: 'GRIS', fr: '#f08a24', frN: 'NARANJA', d2ac: false },
  { s: '6', sec: 6, cod: 2032, L: 20, L2: 12, di: 3.6, D2: 6.0, t: .25, din: '#f2c418', dinN: 'AMARILLO', fr: '#2f9e44', frN: 'VERDE', d2ac: true },
  { s: '10', sec: 10, cod: 2029, L: 21, L2: 12, di: 4.6, D2: 7.4, t: .3, din: '#c8302c', dinN: 'ROJO', fr: '#7a4a2a', frN: 'MARRON', d2ac: true },
];
// collar: perfil de revolución [r, x] (x = 0 en la boca del collar, hacia la caña). Embudo interior para guiar los hilos. AC salvo D2.
export function collarTIF(p) {
  const Lc = p.L - p.L2, R2 = p.D2 / 2, ro = p.di / 2 + p.t, ri = (p.D2 - 2 * .35) / 2;
  return { Lc, perfil: [[ri, 0], [R2 - .15, 0], [R2, .2], [R2, Lc * .62], [ro + .35, Lc - .25], [ro + .35, Lc + .6], [ro, Lc + .6], [ro, Lc - .2], [ri * .55 + ro * .45, Lc * .55], [ri, .35]] };
}
// engarce cuadrado: lado del cuadrado después de apretar (AC: área de cobre + 10 % de vacío ≈ sección; tubo deformado)
export function engarceTIF(p) { const a = Math.sqrt(p.sec * 1.12) + 2 * p.t; return { lado: a, largo: p.L2 - 1.0, r: .35 }; }
export const TIFD = { s: '2 x 1,5', cod: 2058, ancho: 5.6, alto: 3.2, L: 15, L2: 8, t: .2, D2: [7.2, 4.0] };   // doble 2×1,5 (AC; Cimco 2×6 da d2 6,9)

/* ---------- terminal tubular de ojal Cu estañado (Lapp, IEC 61238-1) ---------- */
// ficha de la app (Lapp): L, d (Ø int.), W (ancho de palma), e (espesor de palma). Øe: Cimco 16 mm² DIN 46235 = 8,5. Agujero M10: 10,5 (Weidmüller).
export const OJAL_TABLA = [
  ['10 mm² / M8', 34, 4.5, 13, 1.8], ['10 mm² / M10', 34, 4.5, 16, 1.5], ['16 mm² / M8', 39, 5.5, 15, 2.4], ['16 mm² / M10', 39, 5.5, 16, 2.2],
  ['25 mm² / M8', 43, 7, 15, 2.9], ['25 mm² / M10', 43, 7, 16, 2.7], ['25 mm² / M12', 48, 7, 19, 2.7], ['50 mm² / M10', 53, 10, 20, 4], ['50 mm² / M12', 56, 10, 22, 3.5]];
export const OJAL = { L: 39, d: 5.5, De: 8.5, W: 16, e: 2.2, hole: 10.5, Lb: 19, cham: 1.0, trans: 6,   // Lb (largo del barril) y trans: AC
  hexEntre: 7.4, hexL: 7, hexN: 2 };                                                                      // engarce hexagonal: entre caras AC (matriz de 16 mm²)

/* ---------- terminal preaislado de ojal (2054/2055 Ø6) ---------- */
// RS PRO M6 4–6 mm² amarillo: L 29,5 · ojal Ø12 ext. / Ø6,4 int. · chapa 1,0. Barril, manguito y collar: AC.
export const PREAIS = { L: 29.5, Dr: 12, dr: 6.4, t: 1.0, barrilL: 9.5, barrilDi: 3.6, barrilDe: 5.0, mangL: 13, mangDe: 7.6, mangDi: 5.6, embudo: 3.5, cuello: 3.8 };
export const PREAIS_COL = { amarillo: '#f2c418', azul: '#2b5fae', rojo: '#c8302c' };
export const PALA = { L: 22, W: 6.4, ranura: 3.7, t: .8 };   // variante de pala (horquilla) — SIN CÓDIGO EN EL PAÑOL; medidas AC

/* ---------- termocontraíble 2057 (pared fina 2:1) ---------- */
export const TERMO = { Dsum: 5.0, Drec: 2.5, pared0: .25, pared: .5 };  // pared recuperada: 0,43–0,51 en fichas de 4,8/2,4 → 0,5. Pared de suministro AC.

/* ---------- unión a compresión 10 mm² (2060) — DIN 46267-1 ---------- */
export const UNION = { L: 30, De: 6, Di: 4.5, tope: 0, matriz: 'K 6' };   // Cellpack DV-CU-V 10 / Klauke 122R: L 30, Øe 6, Øi 4,5, matriz K 6

/* ---------- empalme con resina 3M Scotchcast 92-NBA1 (referencia del 2020) ---------- */
export const RESINA = { L: 178, D: 69, Dcab: [10, 22], ml: 135, cuello: 26, Dboca: 21, embudoD: 18, embudoH: 10 };   // 178 × 69 (RS / Enrgtech); cuello, bocas y embudo: AC

/* ---------- conector WAGO 221-2411 (2001) ---------- */
export const WAGO = { L: 35.5, H: 8.9, A: 8.1, pelar: 11, palanca: { L: 15.6, h: 1.6, abre: 60 }, barra: { t: .5 }, resorte: { t: .3 } };  // palanca, barra y resorte: AC

/* ---------- empalme termocontraíble de BT (variante, sin código) y en gel (variante, sin código) ---------- */
export const TERMOJ = { L: 250, Dext0: 38, Dext: 24, ins: 90, insD0: 10, insD: 7.4 };   // HellermannTyton LVK 1,5–6: 12 × 250 (referencia); el resto AC
export const GEL = { L: 118, D: 25 };                                                    // Etelec LDJ01: 118 × Ø25 (0,5–1,5 mm²)

/* ---------- conector estanco Pampaco QR 23 (2501) — ESQUEMA: la ficha no trae medidas ---------- */
export const QR23 = { L: 92, D: 26, tuerca: { L: 15, D: 28, caras: 26 }, cuerpoL: 54, cable: 8.6 };   // todo AC

/* ---------- prensacable de aluminio 3/4" RE (5023) ---------- */
// rango de cable 10–14 (ficha, Pampaco). Todo lo demás AC (proporcional a prensacables metálicos M20/PG16 de catálogo).
export const PRENSA = {
  rosca: { D: 19.05, L: 10, paso: 1.5 },       // 3/4" = 19,05 mm de Ø nominal; paso AC
  hex: { caras: 24, L: 7, r0: 7.6 },           // hexágono del cuerpo (entre caras AC)
  cuerpo: { Dint: 15.2, rBoca: 8.2 },          // agujero de paso
  junta: { De: 25, Di: 19.4, e: 1.5 },          // junta plana (arandela de goma) bajo el hexágono
  tuerca: { caras: 24, L: 5, Di: 19.05 },       // tuerca de fijación (5034 suelta)
  contratuerca: { caras: 24, L: 3.5 },          // contratuerca/arandela dentada (AC)
  pinza: { De: 16.8, Di: 14.6, L: 11, dedos: 8, ranura: 1.4 },
  goma: { De: 15.6, Di: 12.4, L: 12.5, chafl: 2.4 },
  tapa: { caras: 24, L: 13.5, Dcup: 25.5, rosc: 17.6, boca: 13.4 },
  rango: [10, 14], cableD: 12,                  // Ø del 4×2,5 (app: 12)
  chapa: 2.0,                                   // pared de la caja (AC)
};
export const PRENSA_TABLA = [['1/2"', '5 - 8', '5020', 'PAT 1x10'], ['5/8"', '7 - 11', '5024 · 5027 · 5032', '3x1,5'], ['3/4"', '10 - 14', '5022 · 5023 · 5029 · 5034', '4x2,5 · 3x1,5 · LUM.'],
  ['7/8"', '12 - 17', '5028', '4x6'], ['1"', '15 - 20', '5018 · 5026 · 5031', '4x10 · 4x16'], ['1 1/4"', '20 - 25', '5025 · 5033', 'Cu 4x16'], ['1 1/2"', '23 - 30 (*)', '5019', '3x25+1x16'], ['2"', '30 - 40 (*)', '5021', '—']];

/* ---------- riel NS35 × 7,5 (EN 60715) con radios de plegado ---------- */
// 35 × 7,5 · chapa 1,0 · 27 entre caras exteriores del canal · ranuras 15 × 6,2 cada 25 (Phoenix NS 35/7,5 1207640). Radio de plegado AC.
export const NS = { W: 35, H: 7.5, t: 1.0, b: 27, rP: .8, ranura: { L: 15, A: 6.2, paso: 25 }, largoTira: [1000, 2000] };
// perfil con plegados (arcos de radio rP por dentro): devuelve [y, z] cerrado, y = 0 en el borde del ala izquierda, z = 0 en la cara de abajo del canal
export function perfilNS(n = 6) {
  const { W, H, t, b, rP } = NS, a = (W - b) / 2, ri = rP, ro = rP + t, P = [];
  const arc = (cy, cz, r, a0, a1) => { for (let i = 0; i <= n; i++) { const q = a0 + (a1 - a0) * i / n; P.push([cy + r * Math.cos(q), cz + r * Math.sin(q)]); } };
  const pi = Math.PI;
  // contorno exterior (en sentido horario) del ala izquierda → canal → ala derecha, y vuelve por dentro
  P.push([0, H]); P.push([0, H - t]);
  arc(a - ri, H - t - ri, ri, pi / 2, 0);                 // codo superior izq. (interior del pliegue del ala)
  arc(a + ro, ro, ro, pi, 3 * pi / 2);                        // codo inferior izq. (exterior)
  arc(W - a - ro, ro, ro, 3 * pi / 2, 2 * pi);                // codo inferior der. (exterior)
  arc(W - a + ri, H - t - ri, ri, pi, pi / 2);                // codo superior der.
  P.push([W, H - t]); P.push([W, H]);
  arc(W - a + ri, H - t - ri, ro, pi / 2, pi);                // vuelta por la cara de arriba del ala der. (exterior del pliegue)
  arc(W - a - ro, ro, ri, 2 * pi, 3 * pi / 2);                // interior del canal der.
  arc(a + ro, ro, ri, 3 * pi / 2, pi);                        // interior del canal izq.
  arc(a - ri, H - t - ri, ro, 0, pi / 2);
  return P;
}

/* ---------- cable canal ranurado 40 × 30 (5002) y 30 × 30 (5001) ---------- */
// 40 × 30 y 30 × 30 (pañol). Pared, ranuras, dedos, tapa y agujeros del fondo: AC (Ideal NZ «ranura de 4 mm» como referencia).
export const CANAL = { tiras: 2000, pared: 1.6, fondo: 1.8, ranura: 4.2, dedo: 6, alturaRanura: 21, radioRanura: 2.1, rompe: .6, tapa: { e: 1.4, labio: 4.2, gancho: 1.0 },
  agujero: { L: 12, A: 5.2, paso: 50 }, color: '#8f969a', colorTapa: '#9aa1a5' };
export function seccionCanal(W, H = 30) {   // U del canal (y de 0 a W, z de 0 a H) con el labio de enganche arriba por fuera
  const p = CANAL.pared, f = CANAL.fondo, g = CANAL.tapa.gancho;
  return [[0, 0], [W, 0], [W, H - 2.4], [W + g, H - 1.6], [W + g, H - .9], [W, H], [W - p, H], [W - p, f], [p, f], [p, H], [0, H], [-g, H - .9], [-g, H - 1.6], [0, H - 2.4]];
}
export function seccionTapa(W, H = 30) {    // tapa con las pestañas que abrazan el labio
  const e = CANAL.tapa.e, Lb = CANAL.tapa.labio, g = CANAL.tapa.gancho, s = .25;
  return [[-g - s - e, H - Lb], [-g - s - e, H + e], [W + g + s + e, H + e], [W + g + s + e, H - Lb], [W + g + s - .2, H - Lb - .4], [W + s - .1, H - 2.1], [W + g + s, H - 1.4],
    [W + g + s, H + .05], [-g - s, H + .05], [-g - s, H - 1.4], [-s + .1, H - 2.1], [-g - s + .2, H - Lb - .4]];
}
