/* perfiles.mjs · UNA SOLA FUENTE de la geometría 2D de las piezas (mm). La usan:
 *   - el 3D (piezas/*.mjs → extruye estos mismos contornos), y
 *   - el plano (node exportar_perfiles.mjs → perfiles.json → los .py de las hojas dibujan las vistas y cortes con estos puntos).
 * Convención: perfil en el plano (y, z): y = largo / profundidad, z = alto. El ancho (paso) va en x.
 * Medidas: ver FUENTES.md. Lo marcado «AC» en los comentarios es «(*) a confirmar»: proporcional a fichas de referencia. */

const esp = (p, L) => p.map(([y, z]) => [L - y, z]).reverse();          // espejo en y (el otro lado del borne)
const rect = (y0, y1, z0, z1) => [[y0, z0], [y1, z0], [y1, z1], [y0, z1]];
export const rot = ([y, z], [yc, zc], deg) => {                          // gira hacia adelante (+y arriba)
  const a = deg * Math.PI / 180, dy = y - yc, dz = z - zc;
  return [yc + dy * Math.cos(a) + dz * Math.sin(a), zc - dy * Math.sin(a) + dz * Math.cos(a)];
};

/* ===================== RIEL NS35 × 7,5 (EN 60715) — mismo perfil que matbfc.perfilNS35 ===================== */
export const NS35 = { ancho: 35, alto: 7.5, chapa: 1.0,
  perfil: [[0, 7.5], [0, 6.5], [4, 6.5], [4, 0], [31, 0], [31, 6.5], [35, 6.5], [35, 7.5], [30, 7.5], [30, 1], [5, 1], [5, 7.5]],
  ranura: { largo: 15, ancho: 6.2, paso: 25 } };    // ranuras oblongas del fondo (AC, como en las otras hojas)

/* ===================== BORNE BPN-06 (Zoloda) =====================
 * De la ficha de la app (tabla Zoloda): paso 8,2 · A = 50 (alto sobre el ala del riel) · C = 53 (largo). B = 48: sin ubicar (AC).
 * La forma (hombros con el tornillo, lomo central con el canal del puente y la zona de marcado, pies de enganche con traba
 * a resorte) es proporcional a los bornes equivalentes Phoenix UT 6 (8,2 × 47,7 × 46,9) y Weidmüller WDU 6: AC.
 * Origen: y = 0 en la cara de entrada izquierda; z = 0 en la cara de arriba del ala del riel. El riel va de y = 9 a 44. */
const C = 53, YC = 10;                    // largo; eje del tornillo izquierdo (el derecho en C − YC = 43)
const pieIzq = [[9, 0], [9, -1.1], [10.2, -1.1], [10.2, -2.6], [6.4, -2.6], [6.4, 0]];
const pieDer = [[46.6, 0], [46.6, -2.6], [42.8, -2.6], [42.8, -1.1], [44, -1.1], [44, 0]];
export const BPN = {
  C, A: 50, paso: 8.2, pared: 1.0, yT: [YC, C - YC], yPuente: 21.0, riel: { y0: 9, z0: -7.5 },
  contorno: [[0, 3], [0, 27], [5, 32], [5, 40], [16, 40], [18, 50], [35, 50], [37, 40], [48, 40], [48, 32], [53, 27], [53, 3],
             [50, 0], ...pieDer, ...pieIzq, [3, 0]],
  cavidades: {
    // boca de entrada del cable + caja de la jaula + pozo del tornillo (con avellanado arriba), izquierda y derecha
    bocaI: rect(-1, 5.6, 7.6, 15.0), jaulaI: rect(5.0, 15.2, 5.4, 21.6),
    pozoI: [[YC - 3.75, 21], [YC + 3.75, 21], [YC + 3.75, 38.8], [YC + 4.95, 40.2], [YC - 4.95, 40.2], [YC - 3.75, 38.8]],
    barra: rect(4.0, 49.0, 15.2, 17.8),                    // canal de la barra de corriente
    zocalo: rect(18.8, 23.2, 15.2, 24.9),                  // alojamiento del zócalo del puente
    canalPuente: rect(19.7, 22.3, 24.0, 50.2),             // canal del puente (peine) desde arriba
    marcado: rect(24.2, 33.8, 49.2, 50.2),                 // ranura para el marcador
    traba: [[44.6, 3.0], [53.5, 3.0], [53.5, 5.6], [50.2, 5.6], [50.2, 4.0], [44.6, 4.0]],  // ranura de la traba a resorte (AC)
  },
  // piezas metálicas (perfil y,z) — AC
  jaula: { ext: rect(5.6, 14.4, 6.0, 21.0), int: rect(6.6, 13.4, 7.0, 20.0), x: [1.7, 7.5] },   // acero cincado, M4
  barra: { p: rect(4.5, 48.5, 15.5, 17.5), x: [2.2, 7.0] },                                      // cobre/latón estañado
  zocaloP: { p: [[18.9, 17.5], [23.1, 17.5], [23.1, 24.5], [21.55, 24.5], [21.55, 20.8], [20.45, 20.8], [20.45, 24.5], [18.9, 24.5]], x: [2.6, 6.6] },
  tornillo: { M: 4, dk: 7.0, k: 2.6, zCab: 23.6, L: 4.6 },    // cabeza arriba de la jaula; la punta apoya en la barra
  puntera: { r: 1.8, L: 12, zEje: 11.2 },                    // puntera tubular para 6 mm² (AC)
};
BPN.cavidades.bocaD = esp(BPN.cavidades.bocaI, C); BPN.cavidades.jaulaD = esp(BPN.cavidades.jaulaI, C); BPN.cavidades.pozoD = esp(BPN.cavidades.pozoI, C);
BPN.jaula.extD = esp(BPN.jaula.ext, C); BPN.jaula.intD = esp(BPN.jaula.int, C);

/* Peine 2027 = puente enchufable (paso 8,2). Referencia Phoenix FBS 10-8: paso 8,2 · ancho 80,3 (10 polos) · alto 29,6.
 * Chapa de cobre estañado troquelada en peine (AC) + lomo aislante (AC). Se corta a la cantidad de bornes (FBS: pinza CUTFOX). */
export const PEINE = { paso: 8.2, alto: 29.6, zTop: 53.2, chapa: 1.0, diente: 3.0, lomo: rect(18.8, 23.2, 50.0, 53.2), chapaZ: [50.4, 52.6],
  anchoDe: n => n * 8.2 - 1.7 };
PEINE.zPunta = PEINE.zTop - PEINE.alto;   // 23,6: entra 0,9 mm en la horquilla del zócalo

/* Separador 2041 (placa más alta que el borne), tapa final 2021 y tope 2059: formas AC */
export const SEPARADOR = { esp: 1.5, contorno: [[-1.5, 3], [-1.5, 28], [3.5, 33.5], [3.5, 43], [16, 43], [17.5, 53.5], [35.5, 53.5], [37, 43], [49.5, 43], [49.5, 33.5],
  [54.5, 28], [54.5, 3], [51.5, 0], ...pieDer, ...pieIzq, [1.5, 0]] };
export const TAPA = { esp: 2.2 };                         // tapa final: mismo contorno del borne (Phoenix D-UT: 2,2 mm)
export const TOPE = { esp: 9.5, contorno: [[5, 0], [5, 21], [11, 30], [42, 30], [48, 21], [48, 0], ...pieDer.slice(0), ...pieIzq], yT: 26.5 };

/* ===================== PORTAFUSIBLE SECCIONABLE 10×38 «TABAQUERA» (3053) =====================
 * Ficha de la app: Schneider DF101 17,5 × 79,5 × 61. Cuello del frente 45 (DIN 43880). El resto (hombros, carro, pinzas,
 * bornes) es proporcional a la referencia: AC. y = profundidad desde la cara de atrás (apoyo en el riel), z = alto. */
export function portaFus(o) {
  const H = o.H, D = o.D, DR = o.Dr || 44, ZM = H / 2, N0 = ZM - 22.5, N1 = ZM + 22.5, fL = o.fL, fD = o.fD, cap = o.cap;
  const fy = DR + 2.2 + fD / 2;                       // eje del fusible (carro cerrado)
  const zc = ZM + fL / 2 - cap / 2;                   // centro del casquillo de arriba
  const T = {
    W: 17.5, H, D, Dr: DR, zM: ZM, cuello: [N0, N1], pared: 1.5, fL, fD, cap,
    lado: [[0, 1.5], [1.5, 0], [DR - 1.5, 0], [DR, 1.5], [DR, N0], [D - 1.5, N0], [D, N0 + 1.5], [D, N1 - 1.5], [D - 1.5, N1], [DR, N1], [DR, H - 1.5], [DR - 1.5, H],
      [1.5, H], [0, H - 1.5], [0, ZM + 21], [-2.4, ZM + 21], [-2.4, ZM + 18.6], [-1.1, ZM + 18.6], [-1.1, ZM + 17.6], [0, ZM + 17.6],
      [0, ZM - 17.6], [-1.1, ZM - 17.6], [-1.1, ZM - 18.6], [-2.4, ZM - 18.6], [-2.4, ZM - 21], [0, ZM - 21]],
    nucleo: [[0, 1.5], [1.5, 0], [DR - 1.5, 0], [DR, 1.5], [DR, H - 1.5], [DR - 1.5, H], [1.5, H], [0, H - 1.5]],
    cav: { jaulaS: rect(26.4, 38.6, H - 16.9, H - 4.1),
           canalS: [[27.6, H - 15.7], [29.8, H - 15.7], [29.8, zc + 1.1], [DR + .5, zc + 1.1], [DR + .5, zc + 3.4], [27.6, zc + 3.4]] },
    boca: { y: [28.5, 37], x: [4.5, 13] },
    jaula: { ext: rect(27.0, 38.0, H - 16.3, H - 4.7), int: rect(28.0, 37.0, H - 15.3, H - 5.7), x: [3.2, 14.3] },
    tornillo: { M: 3.5, dk: 6.0, k: 2.4, z: H - 10.5, y: 40.6, L: 4.2 },
    fleje: { p: [[28.0, H - 15.3], [29.4, H - 15.3], [29.4, zc + 1.5], [fy - fD / 2 - 1.2, zc + 1.5], [fy - fD / 2 - 1.2, zc + 3.0], [28.0, zc + 3.0]], x: [4.5, 13.0] },
    pinza: { y: fy, zS: zc, alto: Math.min(7, cap - 1) },
    carro: [[DR + 1, N0 + 0.8], [D - 4.5, N0 + 0.8], [D - 1.4, N0 + 3.4], [D - 1.4, N1 - 9], [D, N1 - 7], [D, N1 - 1.4], [D - 1.5, N1 - 0.2], [DR + 1.2, N1 - 0.2], [DR + 1.2, N1 - 2.2],
            [D - 3.4, N1 - 2.2], [D - 3.4, N0 + 3.6], [DR + 1, N0 + 3.6]],
    pivote: [D - 5.4, N0 + 2.4], abre: o.abre || 45,
    fus: { y: fy, z0: ZM - fL / 2, z1: ZM + fL / 2 },
    visor: { z: ZM + 9, r: 1.8 },
  };
  const esp = (p) => p.map(([y, z]) => [y, H - z]);
  T.cav.jaulaI = esp(T.cav.jaulaS); T.cav.canalI = esp(T.cav.canalS); T.jaula.extI = esp(T.jaula.ext); T.jaula.intI = esp(T.jaula.int); T.fleje.pI = esp(T.fleje.p);
  T.pinza.zI = H - zc;
  return T;
}
// 3053 tabaquera 10×38 (DF101: 17,5 × 79,5 × 61) — casquillo 10 (AC)
export const TAB = portaFus({ H: 79.5, D: 61, Dr: 44, fL: 38, fD: 10.3, cap: 10 });
// 3002 base 8×31 (Legrand 005806, 1 módulo): alto 80 y profundidad 60 AC (como la hoja anterior)
export const BASE831 = portaFus({ H: 80, D: 60, Dr: 44, fL: 31.5, fD: 8.5, cap: 6.3 });

/* ===================== FUSIBLES CILÍNDRICOS (IEC 60269-2) ===================== */
// perfil de revolución [r, t] (t a lo largo del eje). Casquillo: largo AC (10 en 10×38 aM; 8,5 en otras fichas).
export function fusibleCil(D, L, cap, o = {}) {
  const tubo = o.tubo || D - .6, pared = o.pared || D * .15, e = .35;
  return {
    D, L, cap, tubo, pared, rArena: tubo / 2 - pared,
    casq: [[0, 0], [D / 2 - .5, 0], [D / 2, .5], [D / 2, cap], [D / 2 - e, cap], [D / 2 - e, e], [0, e]],   // casquillo (vaso)
    elemento: { ancho: o.ancho || Math.min(1.4, D * .14), esp: .08, muescas: o.muescas || 3, estano: o.estano !== false },
  };
}
export const F10x38 = fusibleCil(10.3, 38, 10, { tubo: 9.7, pared: 1.5 });
export const F85x315 = fusibleCil(8.5, 31.5, 6.3, { tubo: 8.0, pared: 1.3 });
export const F5x20 = fusibleCil(5.2, 20, 4.5, { tubo: 5.0, pared: .45, ancho: .15, muescas: 0, estano: false });

/* Neozed D01 (DIN VDE 0636-3 / IEC 60269-3): largo 36, Ø 11 (Mersen, tabla a/b). Escalones: AC. Color del indicador por amperaje: */
export const NEOZED = { L: 36, D: 11, perfil: [[0, 0], [3.0, 0], [3.0, 5.5], [5.0, 6.0], [5.5, 6.6], [5.5, 30.6], [5.0, 31.2], [4.9, 33.0], [4.5, 36], [0, 36]],
  colores: { 2: '#e0559a', 4: '#7a4a2c', 6: '#22943f', 10: '#d62f2f', 16: '#8f979c' } };

/* ===================== BASE 8×31 (3002) y BORNE SECCIONABLE 5×20 (3003) ===================== */
// Borne seccionable 5×20 (referencia Phoenix UK 5-HESI: paso 8,2, largo 72,5). Alto AC.
export const B520 = { paso: 8.2, C: 72.5, A: 47,
  contorno: [[0, 3], [0, 24], [5, 29], [5, 33], [16, 33], [18, 36], [54.5, 36], [56.5, 33], [67.5, 33], [67.5, 29], [72.5, 24], [72.5, 3], [70, 0],
             [55.75, 0], [55.75, -2.6], [51.95, -2.6], [51.95, -1.1], [53.25, -1.1], [53.25, 0],
             [18.25, 0], [18.25, -1.1], [19.45, -1.1], [19.45, -2.6], [15.65, -2.6], [15.65, 0], [3, 0]],
  rielY0: 18.25,
  palanca: [[17, 33.5], [57, 33.5], [57, 46], [52, 47], [21, 47], [17, 44]], pivote: [19.5, 36.5], abre: 62,
  fus: { y0: 26.25, y1: 46.25, z: 40.5 },
  cav: [rect(-1, 5.6, 7.6, 15), rect(5, 15.2, 5.4, 21.6), rect(4, 68.5, 15.2, 17.8), rect(66.9, 73.5, 7.6, 15), rect(57.3, 67.5, 5.4, 21.6), rect(16.5, 56, 30, 36.2),
        rect(25.7, 27.3, 17.5, 30.5), rect(45.2, 46.8, 17.5, 30.5)],
  yT: [10, 62.5] };
