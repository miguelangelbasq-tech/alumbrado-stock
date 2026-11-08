/* perfiles_col.mjs · ÚNICA fuente de la geometría (mm) del grupo «col»: columnas PRFV y metálica, vínculos (capuchón y octogonal),
 * brazo H°G°, apoyos (PRFV, H°A°, madera), luminaria vial LED y portalámpara E27.
 * El plano (Python, perfiles_col.json) y el 3D (three.js, col_util.mjs) salen de acá.
 * Eje z = vertical, z = 0 en el nivel del piso (±0,00). «AC» = a confirmar (sin ficha: proporcional a la referencia). Fuentes: r3d/FUENTES_col.md */

// ---------------- Columna PRFV recta (AP-C-033-A / B, ficha de la app) ----------------
export const PRFV = {
  c7: {
    cod: '6008', plano: 'AP-C-033-A', LT: 8000, LE: 1000, DEB: 197, DEC: 122, e: 5 /* AC: la pared del 7 m no figura */, peso: 41,
    buje: { De: 90, Di: 76, sobre: 468, dentro: 240, mat: 'PRFV/PVC (AC)' },
    cajas: [3500, 4000],       // z del centro sobre el piso (ficha: 3,50 m; la de arriba +500, LB 4,50 desde la base)
    LC: 2800,                  // placa de características: 2,80 desde la base (1,80 sobre el piso)
    C: 350,                    // entrada «C» del troncal: 350 desde la base
  },
  c10: {
    cod: '6007', plano: 'AP-C-033-B', LT: 11100, LE: 1100, DEB: 353, DEC: 180, e: 4.8, peso: 107,
    buje: { De: 114, Di: null, sobre: 468, dentro: 400, mat: 'adaptador metálico' },
    cajas: [3500, 4000], LC: 2900, C: 350,
  },
  caja: { w: 95, h: 160, f: 87, acc: [85, 150], placa: [80, 130] },        // ficha: caja IP54 95×160×87, acceso 85×150, placa B 80×130
  tapa: { w: 105, h: 172, e: 3, r: 8, tornillos: 4, M: 5, dx: 40, dz: 70 },  // AC: tapa de PRFV atornillada con 4 tornillos inox M5
  ventanaC: { w: 60, h: 150 },                                              // AC: boca de la «C» (la ficha da sólo la altura)
  base: { tapa: 6, desague: 25.4 },                                         // AC: tapa de la base; desagüe Ø25,4 = el de la fundación (CLAUDE §11.3)
  placa: { w: 100, h: 100 },
  fund7: { a: 600, h: 1200, molde: 247, arena: 50, sello: 50, telgopor: 350 }, // AP-TC-003-A · CLAUDE §11.3
};
export function rPRFV(c, z) { // radio exterior a la altura z (z = 0 piso) en la columna c (cónica de la base a la cima)
  const t = (z + c.LE) / c.LT; return (c.DEB + (c.DEC - c.DEB) * t) / 2;
}

// ---------------- Columna metálica recta de tramos (AP-C-005 + tabla del fabricante de referencia, ficha de la app) ----------------
export const MET = {
  c7: {
    cod: '6006', Ht: 7700, emp: 700, ref: 'C 80 ASV-4 (*)',
    // tramos de abajo arriba: [Ø, espesor, largo]. Los largos del fabricante suman 8.000: el último se recorta a Ht 7.700 (AC)
    tr: [[114, 3.6, 3400], [90, 3.2, 2000], [76, 3.2, 1500], [60, 3.2, 800]],   // AC: el 1.er tramo de 3.200 pondría la reducción a 2.500, justo en la caja; se dibuja de 3.400
  },
  c10: { cod: '6005', Ht: 11000, emp: 1000, ref: 'C 110 ASV-4 (*)', tr: [[140, 4.7, 4200], [114, 3.6, 3000], [90, 3.2, 2000], [76, 3.2, 1800]] },
  red: { L: 60, sold: 6 },                       // AC: reducción cónica de 60 entre tramos, cordón de soldadura ≥ 1,5 e (FEM)
  puerta: { z: 2500, w: 100, h: 170, e: 2.5, M: 8 }, // caja de conexión a 2,50 m (ficha); abertura 100×170 (IRAM 2620 según pliego T. Lauquen)
  entrada: { z: -300, w: 76, h: 150 },          // 150 × 76 con el centro ≥ 300 bajo el piso (ETG, ficha de la app)
  manguito: { D: 60.3, L: 300 },                // Ø60,3 × 300 (ficha)
  pat: { z: 50, M: 12.7 },                      // tuerca 1/2" soldada a 50 del piso (FEM) · ficha: bulón de bronce en la caja
  fund: { a: 600, h7: 900, h10: 1200 },         // AP-TC-003 (cuadro)
  galv: 75,                                     // µm mínimos (pliego de referencia) AC
};

// ---------------- Vínculo capuchón (AP-C-008 / 017 / 034) ----------------
export const VIN = {
  cap: { D: 101.6, e: 4, H: 250, tapa: 6 },     // AC: Ø≈102 × 250 (hoja vieja), tapa soldada
  pris: { M: 10, z: 45, n: 3 },                 // AC: 3 prisioneros M10 a 120° sobre tuerca soldada (variante ETG: inox punta copa)
  brazo: { D: 60.3, e: 3.2, L: 400, z: 190, inc: 5, cartela: 70 },  // Ø60,3 (ficha) · 400 del eje · 5° o 15° (ETG) · altura AC
  manguito: { ent: 63, emp: [100, 200] },       // AP-C-008 aprobado: entrada 63±1, empotramiento 100-200
  bulon: { M: 10, L: 110 },                     // AC: bulón pasante 4019 + 4038
  oct: { ap: 250, brazo: 400, z: 150, rayo: 26.9 }, // AP-C-011: ESQUEMA (*)
};

// ---------------- Brazo H°G° 2,13 m (AP-TC-055 E) ----------------
export const BHG = {
  L: 2130, D: 48.3, e: 2.9, sube: 150, sep: 600, // largo total (ficha) · Ø48 × 2,9 (plano EPEC viejo) AC · subida y separación AC
  acople: { D: 60.3, L: 150 }, rosca: { L: 40, paso: 25.4 / 11 },  // acople Ø60 × 150 (plano EPEC viejo) · rosca gas 1 1/2" 11 hilos/" AC
  tensor: { D: 26.9, e: 2.3, t: .55 },           // AC: caño 3/4" al 55 % del brazo
  abraz: { b: 50, e: 6, oreja: 40, bulon: 12, L: 90 }, // 4018: bulón Ø12 × 90 · planchuela AC
  posteD: 220,
};

// ---------------- Apoyos ----------------
export const APO = {
  prfv: { cod: '6015', LT: 9500, LL: 8000, LE: 1500, Db: 260, k: 17.5, gab: 5000 }, // Ø y conicidad AC (15–20 mm/m publicado)
  esc: { z: 2500, a: 300, b: 400, pl: [50, 6] },                                    // apoya escalera H 12 (4012): ESQUEMA AC
  ha: [
    { cod: '6023', nom: 'H°A° Ro 1050', L: 8500, emp: 1450, dc: 210, k: 15, e: 55, item: '11.02' },
    { cod: '6501', nom: 'H°A° Ro 750', L: 8500, emp: 850, dc: 190, k: 15, e: 50, item: '11.01' },
    { cod: '6502', nom: 'Madera Pm 8,5', L: 8500, emp: 1350, dc: 180, k: 8, e: 0, item: '11.03' },
  ],
};

// ---------------- Luminaria vial LED (modelo de referencia: Strand RS 160, 575 × 312 × 93) ----------------
export const LUM = {
  L: 575, W: 312, H: 93, cuello: 50, xAncho: 150, rEsq: 34,
  pared: 3, zJunta: 36,            // la carcasa se parte en la base (bandeja) y la tapa superior AC
  driver: { x: [8, 205], tapa: [8, 205] },
  sep: 212,                        // tabique entre el recinto del driver y el óptico AC
  aletas: { n: 8, e: 4, h: 40, x: [230, 560], y: 132 },
  placaLED: { x: [236, 552], y: 120, e: 2, z: 40 },
  lentes: { filas: 3, col: 8, d: 22, h: 8 },
  vidrio: { x: [222, 562], y: 140, e: 5, z: 3 },
  drv: { x: [95, 200], y: [38, 92], z: [6, 40] },           // AC: driver 105 × 54 × 34, al costado de la boca del brazo
  spd: { x: [38, 84], y: [38, 68], z: [6, 30] },            // AC: protector de sobretensiones 10 kV
  bornera: { x: [120, 166], y: [-92, -56], z: [6, 24] },    // AC: bornera de entrada L · N · PE
  nema: { x: 110, D: 64, H: 38, Dfc: 84, Hfc: 70 },          // receptáculo 7 pines ANSI C136.41 (ej. Intermatic K171H Ø64 × 38)
  acople: { z: 44, D: 60.3, Di: 62, L: 110, emp: 110, bulones: 2, M: 8, reg: [-15, 15, 5] }, // Ø42 / Ø60 (ficha) · inclinación en pasos de 5°
};
/** planta de la luminaria (x desde el acople, y ±W/2) con esquinas redondeadas */
export function plantaLum(ins = 0) {
  const L = LUM.L - ins, w = LUM.W / 2 - ins, c = LUM.cuello - ins * .6, xa = LUM.xAncho, r = LUM.rEsq;
  const p = [[ins, -c], [xa, -w]];
  for (let i = 0; i <= 8; i++) { const a = -Math.PI / 2 + i * Math.PI / 16; p.push([L - r + r * Math.cos(a), -w + r + r * Math.sin(a)]); }
  for (let i = 0; i <= 8; i++) { const a = i * Math.PI / 16; p.push([L - r + r * Math.cos(a), w - r + r * Math.sin(a)]); }
  p.push([xa, w], [ins, c]);
  return p;
}

// ---------------- Portalámpara E27 de aplicar + LED 5 W (6014) ----------------
export const E27 = {
  base: { D: 72, H: 30, tornillos: 48 },     // AC: base de aplicar típica
  cuello: { D: 40, H: 34 },                  // AC
  rosca: { D: 26.45, d: 24.26, paso: 3.629, L: 22 },   // IEC 60061-1 (E27): Ø mayor 26,45 · menor 24,26 · paso 3,629 (7 hilos/")
  lamp: { D: 60, L: 108 },                   // A60 típica AC
};
