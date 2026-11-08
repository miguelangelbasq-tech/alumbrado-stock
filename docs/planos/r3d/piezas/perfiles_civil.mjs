/* perfiles_civil.mjs · ÚNICA fuente de medidas (mm) del grupo «civil» (caños, cámaras, áridos y hormigones, mampostería,
 * señalización y sellado, reposición, fijación). Las hojas Python leen r3d/perfiles_civil.json (node exportar_civil.mjs).
 * AC = a confirmar (proporcional a una referencia). Fuentes: r3d/FUENTES_civil.md */

// ---------------- caños de PVC rígido (ficha de la app: Tigre / ETG Córdoba; CRUCE_AP_TC_002) ----------------
export const PVC = {
  d160: { D: 160, e: 3.2, cod: 5008, eRef: 4.7 },
  d110: { D: 110, e: 3.2, cod: 5007 },
  d90: { D: 90, e: 2.7, cod: 5010 },
  d50: { D: 50, e: 3.2, cod: 5009 },
  d25: { D: 25.4, e: 1.8, cod: 5011, eAC: true },           // AC: pared del Ø25,4
  // enchufe (cabeza) de la barra para pegar: Lc mín. 53,5 para DN 110 (Wavin S-40 · IRAM 13326, lectura de la tabla, AC)
  enchufe: { Lc: 53.5, juego: .4, trans: 18 },                 // trans = largo del abocardado (AC)
  adhesivo: .25,                                               // espesor de la película de adhesivo dibujada (AC)
  curva: { R: 165, ang: 90, Ls: 53.5 },                        // R = 1,5 × D (AC), enchufes en las dos puntas
  tapa: { L: 62, e: 3.2, fondo: 4 },                           // tapa 5030 tipo «enchufe» (AC)
  cordon: { d: 10 },                                           // 5014 nylon Ø10 (pañol)
  separacion: 250,                                             // entre los 2 caños del cruce (AC)
};

// ---------------- PEAD Ø50 (5005), corrugado 3/4" (5006), grampa (5015) ----------------
export const PEAD = {
  D: 50, e: 3.0,                                               // AC: pared 3,0 (tritubo PEAD 50 × 3); PN6 en PE100 da ≈ 2,0
  rollo: { Rin: 300, Rext: 520, ancho: 260 },                  // AC: rollo dibujado
  Rcurva: 1000,                                                // AC: radio mínimo de curvado ≈ 20 × D (práctica PE)
  cupla: { L: 150, Dc: 82, tuerca: 96, Lt: 34, oring: 3.5 },   // AC: unión a compresión (cuerpo, tuerca, junta, anillo de agarre)
};
export const CORR = { De: 25, Di: 19.5, paso: 4.2, cresta: 1.8 }; // AC: corrugado 3/4" (Ø int ≈ 3/4")
export const GRAMPA = { chapa: 1.2, ancho: 20, ala: 22, agujero: 5.5, D: 50 }; // AC: grampa omega para Ø50

// ---------------- cámara 40 × 40 (5003), marco y tapa de bronce «A.P.» (5016), masilla (5017) ----------------
export const CAM = {
  A: 400, H: 500, prof: 600, e: 8,                             // 40 × 40 interior, h ≤ 50 (CRUCE_AP_TC_002); e AC
  zCano: 80,                                                   // AC: eje de los caños a 80 del fondo (tapada ≈ 0,50 en vereda)
  marco: { ala: 30, e: 4, pestaña: 25 },                       // AC: ángulo de bronce 30 × 30 × 4 con pestaña de anclaje
  tapa: { e: 6, juego: 2, nervio: 10 },                        // AC
  hpobre: 100, solado: 30, contrapiso: 80, mortero: 20,        // AC: confinación con hormigón pobre (la app: «hormigón pobre de confinación»)
};

// ---------------- áridos y hormigones ----------------
export const BOLSA = {
  c50: { L: 760, A: 480, H: 140, kg: 50 },                     // AC: bolsa de papel de 50 kg (el pañol la pide así)
  c25: { L: 460, A: 410, H: 115, kg: 25 },                     // bolsa de 25 kg: 46 × 41 × 11,5 cm (Easy, Loma Negra 25 kg)
  cal25: { L: 460, A: 410, H: 115, kg: 25 },                   // AC: cal en bolsa de 25 kg (Easy: cal 25 kg)
};
export const ARIDO = {
  arena: { dmin: 0.075, dmax: 4.75 },                          // arena: pasa el tamiz IRAM 4,75 mm
  piedra: { dmin: 6, dmax: 20 },                               // pañol: 6–20
  probeta: { D: 150, H: 300 },                                 // probeta normal Ø15 × 30 (IRAM 1524 / 1546)
};
export const H13 = { c: 1, a: 2.5, p: 4, bolsas: 5.2, arena: .55, piedra: .80, agua: 170 };   // ficha de la app

// ---------------- mampostería ----------------
export const LAD = { L: 250, A: 120, H: 50, junta: 25 };          // 25 × 12 × 5 (pañol / app); junta 25: hilada 0,075 (TABLERO_NIVEL)
export const HIERRO = { d6: 6, d42: 4.2, paso6: 4.0, nerv: .3, barra: 12000 };   // nervadura AC (proporcional a ADN 420)
export const SIMA = { malla: 150, d: 6, paño: [2400, 6000] };     // AC: Q188 (Ø6) · paño 2,40 × 6,00
export const ALFA = { b: 50, h: 75, L: 1000 };                    // AC: alfajía (sección y largo dibujados)

// ---------------- anclaje de expansión 1/2" × 150 (8002) y varilla roscada (4040) ----------------
export const ANC = {
  d: 12.7, L: 150, paso: 1.954,                                // 1/2"-13 UNC (paso 25,4/13)
  broca: 12.7, hnom: 51, hmin: 64, prof: 76,                   // broca 1/2" · empotramiento nominal 2" (Hilti KB-TZ2) · agujero AC
  cono: { L: 18, dmin: 8.6 }, camisa: { L: 24, e: 1.6 },        // AC
  tuerca: { af: 19.05, e: 11.1 }, arandela: { de: 34, di: 14.3, e: 2.8 },   // tuerca 1/2" UNC (llave 3/4") · arandela AC
  torque: 68,                                                  // N·m ≈ 50 ft-lb (KB-TZ2 1/2", hormigón)
  placa: 3,                                                    // AC: chapa del gabinete dibujada
};

// ---------------- malla de advertencia (8017) y telgopor (8005) ----------------
export const MALLA = { ancho: 300, rombo: [22, 18], hilo: 2.2, rollo: { L: 100000, Rin: 40, Rext: 120 }, leyenda: 'PELIGRO ELECTRICO' };
export const TELG = { a: 150, b: 176, h: 650, perla: 3.5, dens: 15 };   // AC (borde abajo a 350 del fondo, AP-TC-003-A)

// ---------------- selladores ----------------
export const CART = { D: 50, L: 215, pico: 90, vol: 260 };       // AC: cartucho estándar (9003: 260 ml)
export const AERO = { D: 65, H: 250, vol: 500 };                 // AC: espuma PU en aerosol 500 ml
export const LATA = { D: 155, H: 175, vol: 4 };                  // AC: lata de pintura asfáltica (4 L)
export const SELLO = { sello: 50, arena: 50 };                   // AP-TC-003-A: arena hasta −50 y sello de 50

// ---------------- reposición de vereda y calzada ----------------
export const VER = { baldosa: 25, mortero: 20, contrapiso: 80, capa: 150, pan: 200 };   // contrapiso 8 + mortero 2 (pliego); baldosa AC
export const CALZ = { h21: 200, asfalto: 50, base: 150 };          // H-21 0,20 (estimado app); carpeta y base AC

// ---------------- fijación ----------------
export const PREC = { L: 200, L2: 250, w: 4.5, t: 1.25, cab: [8.2, 6.0, 7.0], diente: .45, pasoD: 1.1, fuerza: 225 };  // T50R: 200 × 4,6 · 225 N
export const FISHER = { d: 8, L: 40, broca: 8, prof: 50, tornillo: [5, 45], aletas: 2 };   // S8 + tornillo 5 × 45 (Easy) · SX 8 × 40
export const CINTA = { w: 19, L: 20000, e: .15, Rin: 19, Rext: 26 };   // AC: núcleo y rollo
export const ALAMBRE = { d: 2.03, gpm: 25 };                     // N° 14 ≈ 2,03 mm · ≈ 25 g/m (CLAUDE.md, AC)
