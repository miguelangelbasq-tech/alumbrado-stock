/* perfiles_protab.mjs · grupo «protab» (protecciones y tableros). UNA SOLA FUENTE de la geometría 2D (mm) de:
 *   aparatos modulares DIN 43880 (termomagnética, diferencial, contactor), peine de alimentación, gabinetes, caja de columna,
 *   fondos de tablerito, base y fusible NH 00, fotocontrol NEMA y su zócalo.
 * La usan el 3D (piezas/protab_*.mjs) y el plano (node exportar_protab.mjs → perfiles_protab.json → hojas *.py).
 * Convención igual al piloto: perfil en el plano (y, z): y = profundidad desde la espalda (riel), z = alto. El ancho va en x.
 * Medidas: r3d/FUENTES_protab.md. «AC» = (*) a confirmar (proporcional a una referencia). */

export const rect = (y0, y1, z0, z1) => [[y0, z0], [y1, z0], [y1, z1], [y0, z1]];
export const rot = ([y, z], [yc, zc], deg) => {           // gira en el plano (y, z); deg > 0 levanta la punta que mira a +y
  const a = deg * Math.PI / 180, dy = y - yc, dz = z - zc;
  return [yc + dy * Math.cos(a) - dz * Math.sin(a), zc + dy * Math.sin(a) + dz * Math.cos(a)];
};
const espZ = (p, H) => p.map(([y, z]) => [y, H - z]).reverse();

/* ===================== CARCASA MODULAR DIN 43880 =====================
 * H alto, D profundidad total (hasta la punta de la manija), Dr hombro (cara de los tornillos), Dn frente del cuello,
 * cuello = [z0, z1] (45 mm, DIN 43880), zM = centro del riel. Ganchos del riel NS35 en la espalda. */
export function carcasa(o) {
  const { H, Dr, Dn } = o, [c0, c1] = o.cuello, zM = H / 2, b = 1.2;
  const sup = zM + 17.5, inf = zM - 17.5;               // bordes de las alas del riel
  const contorno = [[0, 1.5], [1.5, 0], [Dr - b, 0], [Dr, b], [Dr, c0 - 1], [Dr + 1, c0], [Dn - 1.5, c0], [Dn, c0 + 1.5], [Dn, c1 - 1.5], [Dn - 1.5, c1],
    [Dr + 1, c1], [Dr, c1 + 1], [Dr, H - b], [Dr - b, H], [1.5, H], [0, H - 1.5],
    // gancho fijo arriba (abraza el ala superior del riel)
    [0, sup + 2.2], [-2.0, sup + 2.2], [-2.0, sup - 3.2], [-1.15, sup - 3.2], [-1.15, sup + .2], [0, sup + .2]];
  // traba corrediza abajo (pieza aparte, se mueve con un destornillador desde abajo)
  const traba = [[-2.0, inf - .2], [-1.15, inf - .2], [-1.15, inf + 3.0], [.4, inf + 3.0], [.4, -2.4], [4.6, -2.4], [4.6, -.6], [2.2, -.6], [2.2, inf + 4.4], [-2.0, inf + 4.4]];
  const ranuraTraba = rect(.25, 4.8, -1, inf + 4.6);
  return { ...o, zM, contorno, traba, ranuraTraba, sup, inf };
}

/* ===================== TERMOMAGNÉTICA (curva C) =====================
 * Ficha de la app (Schneider iC60N): 18 mm por polo · alto 85 · profundidad 78,5. Cuello 45 (DIN 43880).
 * Hombro 44 y frente del cuello 69: AC (proporcional; 69 figura en la tabla de cotas de Schneider, sin ubicar). */
const TMc = carcasa({ H: 85, D: 78.5, Dr: 44, Dn: 69, cuello: [20, 65], W: 18 });
const yCab = 31;                                          // eje del cable en la boca (AC)
export const TM = {
  ...TMc,
  camara: [rect(2.6, 41.4, 18.6, 66.4), rect(41.4, 66.4, 22.6, 62.4)],        // hueco interior (paredes 2,6) AC
  bolsillo: [rect(20.6, 38.2, 2.4, 18.6), rect(20.6, 38.2, 66.4, 82.6)],     // alojamiento de las jaulas
  boca: [rect(23.0, 35.2, -1, 2.6), rect(23.0, 35.2, 82.4, 86)],             // entrada del cable / pin del peine
  ranuraManija: rect(62, 70, 34.5, 50.5),
  ventana: { z: [22.5, 28], y: 69 },                                           // visor rojo/verde (posición de los contactos) AC
  jaula: { S: { ext: rect(22, 36.4, 69, 81), int: rect(23.2, 35.2, 70.2, 79.8) }, I: { ext: rect(22, 36.4, 4, 16), int: rect(23.2, 35.2, 5.2, 14.8) }, ancho: 12 },
  tornillo: { M: 4, dk: 7.4, k: 2.8, L: 3.4, yCab: 40.8, zS: 75, zI: 10, pozo: 4.4 },   // tornillo combi M4 (AC)
  cable: { y: yCab, r: 2.0, rA: 2.95 },                                      // 6 mm² flexible: cobre Ø4 · aislación Ø5,9 (AC)
  pin: { y: [23.5, 25.5], x: 5.0 },                                          // pin del peine en la jaula (atrás del cable)
  // bobina de disparo magnético (eje y), núcleo móvil (percutor) y yugo
  bobina: { z: 57, y0: 9, y1: 30, rI: 3.3, rE: 6.4, carrete: 2.8, percutor: [6.5, 37.2], rP: 2.2 },
  yugo: [rect(7, 31.4, 49.2, 50.4), rect(7, 31.4, 63.6, 64.8), rect(7, 8.2, 49.2, 64.8)],
  // conductores de cobre (perfil y,z; ancho en x)
  barraS: [[20.6, 66.5], [22, 66.5], [22, 79.5], [20.6, 79.5]],
  salidaBob: [[30, 52.2], [38.6, 52.2], [38.6, 45.4], [37.2, 45.4], [37.2, 50.8], [30, 50.8]],
  contactoFijo: rect(36.9, 38.9, 44.4, 45.4),                                // pastilla de plata AC
  cuernoS: [[26.4, 40.6], [37.2, 44.2], [37.2, 45.4], [26.4, 41.8]],         // cuerno de arco superior
  cuernoI: [[26.4, 18.2], [36.6, 18.2], [36.6, 19.4], [26.4, 19.4]],         // cuerno de arco inferior
  barraI: [[36.4, 14.6], [41.6, 14.6], [41.6, 16.0], [36.4, 16.0]],
  bimetal: { a: rect(39.0, 39.9, 16.0, 34.0), b: rect(39.9, 40.8, 16.0, 34.0), tornillo: [40.8, 32] },
  camara_arco: { y: [8, 26.4], z0: 20.2, n: 9, paso: 2.3, esp: .9, v: 5.5 },  // 9 placas de acero (AC)
  brazo: { piv: [52, 34], punta: [38.4, 43.6], ancho: 2.2 },                 // brazo del contacto móvil
  pastillaMovil: rect(37.6, 39.4, 43.4, 44.4),
  cerrojo: [[44.2, 25.5], [50, 25.5], [54.5, 30.5], [54.5, 39.5], [49.5, 39.5], [44.2, 33]],
  manija: { piv: [57.5, 42.5], r: 6.2, largo: 21.5, ancho: 6.4, ang: 14 },    // ON = punta arriba (AC)
};
TM.camaraArco = Array.from({ length: TM.camara_arco.n }, (_, i) => rect(TM.camara_arco.y[0], TM.camara_arco.y[1], TM.camara_arco.z0 + i * TM.camara_arco.paso, TM.camara_arco.z0 + i * TM.camara_arco.paso + TM.camara_arco.esp));
{ // brazo y manija como polígonos (y, z)
  const [py, pz] = TM.brazo.piv, [ty, tz] = TM.brazo.punta, L = Math.hypot(ty - py, tz - pz), a = Math.atan2(tz - pz, ty - py), w = TM.brazo.ancho / 2;
  const P = (s, t) => [py + s * Math.cos(a) - t * Math.sin(a), pz + s * Math.sin(a) + t * Math.cos(a)];
  TM.brazoP = [P(-2.4, -w - .8), P(L, -w), P(L, w), P(-2.4, w + .8)];
  const m = TM.manija, ang = m.ang;
  const pal = [[m.piv[0], m.piv[1] - m.ancho / 2], [m.piv[0] + m.largo - 1.2, m.piv[1] - m.ancho / 2 + .5], [m.piv[0] + m.largo, m.piv[1] - m.ancho / 2 + 1.6],
    [m.piv[0] + m.largo, m.piv[1] + m.ancho / 2 - 1.6], [m.piv[0] + m.largo - 1.2, m.piv[1] + m.ancho / 2 - .5], [m.piv[0], m.piv[1] + m.ancho / 2]];
  TM.manijaP = pal.map(p => rot(p, m.piv, ang));
  TM.manijaOff = pal.map(p => rot(p, m.piv, -ang));
}

/* ===================== DIFERENCIAL (IEC 61008) =====================
 * Ficha de la app (Schneider iID): 2P 36 · 4P 72 · alto 91 · profundidad 73,5. Cuello 45. Hombro 44, frente 64: AC. */
const DIc = carcasa({ H: 91, D: 73.5, Dr: 44, Dn: 64, cuello: [23, 68], W: 18 });
export const DI = {
  ...DIc,
  camara: [rect(2.6, 41.4, 18.6, 72.4), rect(41.4, 61.4, 25.6, 65.4)],
  bolsillo: [rect(20.6, 38.2, 2.4, 18.6), rect(20.6, 38.2, 72.4, 88.6)],
  boca: [rect(23.0, 35.2, -1, 2.6), rect(23.0, 35.2, 88.4, 92)],
  ranuraManija: rect(57, 65, 37.5, 53.5),
  jaula: { S: { ext: rect(22, 36.4, 75, 87), int: rect(23.2, 35.2, 76.2, 85.8) }, I: { ext: rect(22, 36.4, 4, 16), int: rect(23.2, 35.2, 5.2, 14.8) }, ancho: 12 },
  tornillo: { M: 4, dk: 7.4, k: 2.8, L: 3.4, yCab: 40.8, zS: 81, zI: 10, pozo: 4.4 },
  cable: { y: 31, r: 2.0, rA: 2.95 },
  toroide: { y: 19, z: 45.5, R: 11.5, r: 4.2 },       // transformador toroidal (eje z) AC
  rele: rect(40, 54, 48, 62),                          // relé de disparo (polarizado) AC
  boton: { z: 31, y0: 52, r: 3.2 },                    // botón T (prueba) AC
  resistencia: rect(46, 50, 28, 34),
  manija: { piv: [52.5, 45.5], r: 6.2, largo: 21, ancho: 6.4, ang: 14 },
};
{ const m = DI.manija; const pal = [[m.piv[0], m.piv[1] - m.ancho / 2], [m.piv[0] + m.largo - 1.2, m.piv[1] - m.ancho / 2 + .5], [m.piv[0] + m.largo, m.piv[1] - m.ancho / 2 + 1.6],
  [m.piv[0] + m.largo, m.piv[1] + m.ancho / 2 - 1.6], [m.piv[0] + m.largo - 1.2, m.piv[1] + m.ancho / 2 - .5], [m.piv[0], m.piv[1] + m.ancho / 2]];
  DI.manijaP = pal.map(p => rot(p, m.piv, m.ang)); }

/* ===================== CONTACTOR TRIPOLAR 25 A (3005 / 3006) =====================
 * Ficha de la app (Schneider LC1D25): 45 × 85 × 92. Escalón del frente (Dr 60, cuello 65): AC. Polos cada 15 (AC). */
const CTc = carcasa({ H: 85, D: 92, Dr: 60, Dn: 92, cuello: [10, 75], W: 45 });
export const CT = {
  ...CTc,
  camara: [rect(2.6, 57.4, 16.6, 68.4), rect(57.4, 89.4, 12.6, 72.4)],
  bolsillo: [rect(40.6, 58.2, 2.4, 16.6), rect(40.6, 58.2, 68.4, 82.6)],
  boca: [rect(43, 55.2, -1, 2.6), rect(43, 55.2, 82.4, 86)],
  polos: [7.5, 22.5, 37.5],
  jaula: { S: { ext: rect(42, 56.4, 69, 81), int: rect(43.2, 55.2, 70.2, 79.8) }, I: { ext: rect(42, 56.4, 4, 16), int: rect(43.2, 55.2, 5.2, 14.8) }, ancho: 11 },
  tornillo: { M: 4, dk: 7.4, k: 2.8, L: 3.4, yCab: 56.8, zS: 75, zI: 10, pozo: 4.4 },
  cable: { y: 51, r: 2.0, rA: 2.95 },
  // circuito magnético: E fija (atrás) y E móvil (armadura). Chapas apiladas en x (ancho del paquete 22, AC)
  nucleo: { x: [11.5, 33.5], fijo: [rect(4, 9, 20, 65), rect(9, 23, 20, 27), rect(9, 23, 39, 46), rect(9, 23, 58, 65)],
    movil: [rect(31, 36, 20, 65), rect(24, 31, 20, 27), rect(24, 31, 39, 46), rect(24, 31, 58, 65)], espira: [rect(22, 23, 38.4, 40.2), rect(22, 23, 44.8, 46.6)] },
  bobina: { y: [10.5, 21.5], z: [28, 57], zN: [38.4, 46.6], x: [8, 37] },     // carrete con el bobinado (220 V) AC
  porta: [[36, 38], [66, 38], [66, 30], [72, 30], [72, 55], [66, 55], [66, 47], [36, 47]],   // porta-contactos (PA)
  puente: rect(68.6, 70.6, 25, 60),                                          // puente de contactos (Cu + plata)
  fijoS: [[42, 66], [44, 66], [44, 61], [66.8, 61], [66.8, 56], [65, 56], [65, 59.4], [42, 59.4]],
  fijoI: [[42, 19], [44, 19], [44, 24], [66.8, 24], [66.8, 29], [65, 29], [65, 25.6], [42, 25.6]],
  pastillas: [rect(66.8, 67.6, 56.5, 59), rect(66.8, 67.6, 26, 28.5)], ventanaPorta: rect(68.0, 71.2, 31.2, 53.8),
  resorte: { y: [36, 44], z: 42.5, r: 2.6 },
  A: { z: [70, 15], y: 92 },                                                 // bornes de bobina A1 (arriba) y A2 (abajo) en el frente AC
};

/* ===================== PEINE DE ALIMENTACIÓN (pin) para termomagnéticas =====================
 * Referencia Siemens 5ST3687-0: 10 mm², 12 módulos, paso 18, alto 11,3, ancho 6,4, largo 214. SIN CÓDIGO EN EL PAÑOL. */
export const PEINE_TM = { paso: 18, alto: 11.3, ancho: 6.4, largo12: 214, y0: 21.3, zBase: 85.2, barra: rect(22.8, 26.2, 89.5, 93.5),
  pin: { y: TM.pin.y, x: 4.6, z0: 71.5 } };
PEINE_TM.cuerpo = [[PEINE_TM.y0, 85.2], [PEINE_TM.y0 + 6.4, 85.2], [PEINE_TM.y0 + 6.4, 95.5], [PEINE_TM.y0 + 5.4, 96.5], [PEINE_TM.y0 + 1, 96.5], [PEINE_TM.y0, 95.5]];

/* ===================== GABINETE PRFV 530 × 430 × 200 (3020) + PLACA 3052 =====================
 * Ficha de la app y Schneider PanelSeT PLM NSYPLM54G: 530 × 430 × 200, IP66, IK10, RAL 7035, 2 cierres con inserto doble barra.
 * Pared 4, puerta 4 con junta, bisagras, pies de fijación y placa (480 × 380 × 2): AC. Ejes: x ancho, y fondo (frente +y), z alto. */
export const GAB = { W: 430, H: 530, P: 200, pared: 4, radio: 14, puerta: 4.5, junta: { a: 9, e: 5 }, bisagras: [80, 450],
  cierres: [130, 400], placa: { W: 380, H: 480, e: 2, y: 22 }, separador: 20, pie: { a: 40, l: 36, e: 5 } };

/* ===================== CAJA DE ALUMINIO 200 × 150 × 100 IP65 (6003) =====================
 * Ficha de la app (Conextube) y AP-PL-003. Pared 4, tapa 14 con junta y 4 tornillos imperdibles M5, radio 10: AC. */
export const CAJA_AL = { W: 200, H: 150, P: 100, tapa: 14, pared: 4, radio: 10, tornillos: { off: 11, M: 5 }, junta: 3.5,
  ojal: 50, riel: 140, prensa: { rosca: 'PG 13,5 (*)', Dr: 20.4, hex: 24, alto: 30, cable: [6, 12] } };

/* ===================== FONDOS DE TABLERITO (pañol: medidas de la descripción) ===================== */
export const FONDOS = { f3009: { W: 220, H: 75, e: 2 }, f3010: { W: 220, H: 80, e: 2 }, f3011: { W: 230, H: 95, e: 2 }, f6009: { W: 70, H: 165, e: 2 },
  prfv: { W: 80, H: 130, e: 4 }, agujero: 5.5 };

/* ===================== BASE NH 00 + FUSIBLE NH 00 (3055 / 3004 / 3503) =====================
 * Ficha de la app: fusible NH00 79 × 58 × 30 (Eaton 160NHG00B); base ETI PK00 30 × 119 × 58,5. Cuchillas 6 × 15 y pinzas: AC (DIN 43620). */
export const NH = { base: { W: 30, L: 119, H: 58.5 }, fus: { L: 79, H: 58, W: 30, cuerpo: [48, 30, 47], cuchilla: { e: 6, a: 15, l: 15.5 } },
  pinzas: 27, borne: { M: 8 } };

/* ===================== FOTOCONTROL NEMA 3 PATAS (ANSI C136.10) + ZÓCALO 3072 =====================
 * Ficha de la app: medidas típicas Ø84 × 66. Zócalo de referencia Intermatic K121/K122: Ø76 × 70 con cables (3"), 15 A, 480 V.
 * Patas curvas sobre un círculo, ángulo de traba y forma de la ventana: AC. */
export const FOTO = { D: 84, H: 66, base: { D: 84, h: 9 }, tapa: { D: 79, h: 57 }, rPatas: 15.5,
  patas: [{ a: 90, n: 'N', ancho: 26 }, { a: 210, n: 'L', ancho: 26 }, { a: 330, n: 'CARGA', ancho: 26 }],   // ancho angular (grados) AC
  pata: { largo: 13, esp: 1.6, pie: 3.5 }, giro: 35,
  zocalo: { D: 76, h: 26, junta: [24, 32], ranura: 34 }, ventana: { ang: 0, w: 22, h: 26, z: 36 } };
