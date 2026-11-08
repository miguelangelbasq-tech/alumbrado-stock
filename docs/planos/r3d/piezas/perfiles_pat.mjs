/* perfiles_pat.mjs · ÚNICA fuente de la geometría (mm) del grupo «pat»: jabalina, tomacable, cámara, barra de PAT, bloquete,
 * banderita, herrajes (abrazaderas, bulones, arandelas, tuercas, chapa, espárrago), rack/aisladores (de perfiles_cables MN),
 * fleje + hebilla, caños H°G° roscados y pipeta. Hojas: MAT-JABALINA-1/2, MAT-ACCESORIOS_PAT-1/2/3, MAT-HERRAJES-1/2/3, MAT-FLEJE-1/2.
 * «AC» = a confirmar (proporcional a la referencia). Fuentes: r3d/FUENTES_pat.md */

const IN = 25.4;

// ---------- jabalina cobre-acero IRAM 2309 (7015 / 7017) ----------
export const JAB = {
  j58: { D: 14.6, L: 1500, cod: 7015, nom: 'JL16 · 5/8"' },        // ficha app / pliego ítem 88
  j34: { D: 16.2, L: 2000, cod: 7017, nom: 'JL18 · 3/4"' },        // ficha app
  cu: 0.254,                 // capa de cobre ≥ 254 µm (ficha app; = 10 mil UL 467)
  punta: 25,                 // largo de la punta cónica AC
  chaflan: 1.5,              // chaflán de la cabeza AC
  // sufridera (cabezal de hinca de acero, Genrod la vende para 5/8"): AC
  sufridera: { De: 32, L: 70, prof: 45, Di: 15.6 },
  // seccional (variante): rosca 5/8" UNC (11 hilos/pulg) laminada en la punta del tramo, manguito de bronce al silicio 61 (CR58 = 2,4"),
  // bulón de hinca de acero templado. Ø del manguito y largo del bulón: AC
  rosca: { d: 5 / 8 * IN, tpi: 11, paso: IN / 11, ang: 60, L: 30 },
  manguito: { L: 61, De: 22, Di: 5 / 8 * IN },
  bulonHinca: { L: 48, Lr: 30, Dc: 24, k: 18 },
};

// ---------- cable de PAT Cu 1 × 10 V/A (7010) = perfiles_cables CAB.u10v (Ø 6,0; aislación 1,0; clase 5) ----------
export const CAB10 = { D: 6.0, Dc: 4.0, e: 1.0 };

// ---------- tomacable de bronce (7019) para jabalina 5/8": cuerpo en «O» con puente y bulón. Medidas AC
// (el rango comercial de la ficha es 13 × 17 a 21 × 31 mm: se dibuja el 21 × 31 → alto 31, espesor 21)
export const TOMA = {
  H: 31, E: 21, W: 44,            // alto (z) · espesor (y) · ancho total (x)
  ven: { x0: -9.5, x1: 17.5, z: 22 },   // ventana interior (jabalina + cuerda Ø4 + puente)
  pared: 4.5,
  puente: { e: 4 },               // puente (pisador) que aprieta la cuerda contra la jabalina
  bulon: { M: 10, af: 16, k: 7, L: 20 },   // bulón M10 (AC) de bronce / inox
};

// ---------- cámara de inspección 150 × 150 (Genrod plástica 15 × 15 cm) ----------
export const CAM = { a: 150, H: 150, e: 6, tapa: 12, fondoLibre: true };

// ---------- conector C de compresión (7013 / 7014) AC ----------
export const CMC = { L: 30, Re: 17, e: 5 };

// ---------- barra de PAT 125 A (7001) AC ----------
export const BARRA = { L: 200, a: 20, e: 5, agujeros: 7, M: 6, paso: 25, ais: { D: 25, H: 25, M: 6 } };

// ---------- bloquete de bronce MN 1101 b (7003): RW 1/2" × 50 (descripción del pañol). Ø AC ----------
export const BLQ = { L: 50, D: 30, rosca: { d: 0.5 * IN, tpi: 12, paso: IN / 12, ang: 55 }, prof: 30, fuste: 4 };
// terminal banderita (7018): ojal Ø14,6 (AP-TC-005); caño de engarce para 10 + 2,5 mm². Resto AC
export const BAN = { ojo: 14.6, a: 30, Lp: 34, e: 2.5, cano: { L: 22, De: 9, Di: 6.2 } };

// ---------- bulonería (H°G°). 1/2" Whitworth (RW / BSW): 12 hilos/pulg, 55°. Métrica M12 (ISO 4014 / 4032 / 7089, DIN 127 B) ----------
export const BUL = {
  w12: { d: 12.7, paso: IN / 12, ang: 55, af: 20.8, k: 8.5, tuerca: 11 },   // A/F y alturas 1/2" BSW: AC
  m12: { d: 12, paso: 1.75, ang: 60, af: 18, k: 7.5, tuerca: 10.8 },        // ISO 4014 / ISO 4032
  plana: { di: 13, de: 24, e: 2.5 },        // ISO 7089 M12 (1/2": AC)
  presion: { di: 12.2, de: 21.1, e: 2.5 },  // DIN 127 B M12 (pgb-europe)
  cuadrada: { a: 22, e: 11 },               // tuerca cuadrada 1/2" AC
  chapa: { a: 52, b: 28, e: 2, agujero: 14 },   // 4020 (pañol); agujero AC
  esparrago: { d: 16, L: 190, paso: 2 },        // 4023 M16 × 190 (pañol)
  capuchon: { L: 40, De: 26 },                  // 4031 R15 AC
  galv: { planchuela: 70, pieza: 85, rosca: 50 },   // µm: ISO 1461 (3–6 mm: 70 · > 6 mm: 85 · rosca centrifugada > 6 mm: 50)
  largos: { 4016: 250, 4018: 90, 4017: 38 },
};

// ---------- abrazaderas H°G° (4001–4008): planchuela 4,76 × 31,7 (ficha app), agujeros Ø14 (ficha app). Orejas AC ----------
export const ABR = { e: 4.76, a: 31.7, agujero: 14, oreja: 40, luz: 8, escote: { h: 40, w: 46 },
  tipos: { 4004: 220, 4005: 240, 4006: 260, 4007: 300, 4008: 340, 4001: 140, 4002: 200 } };

// ---------- fleje inox AISI 304 3/4" (4024) y hebilla (4025) ----------
export const FLE = { a: 19.05, e: 0.7, hebilla: { e: 1.5, L: 28, a: 22.5, oreja: 6 } };   // hebilla: L, ancho y orejas AC

// ---------- caños H°G° roscados (rosca gas BSP / IRAM 2502: 55°) ----------
export const CANO = {
  c2: { De: 60.3, e: 3.65, tpi: 11, paso: IN / 11, ang: 55, L: 6400, cod: 5501 },   // 2": Ø ext. 60,3 · 11 hilos (BSP). Espesor AC
  c34: { De: 26.9, e: 2.65, tpi: 14, paso: IN / 14, ang: 55 },                     // 3/4" (ítem 77, Ø AC)
  rosca: 30,      // largo roscado AC
  cupla: { L: 40, e: 4 },
  da: { De: 60, e: 2.5, L: 4000, cod: 5004 },   // doble aislación 2" (5004)
  pipeta: { L: 140, R: 55 },                   // pipeta AC
};
