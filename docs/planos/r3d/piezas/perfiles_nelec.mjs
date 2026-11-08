/* perfiles_nelec.mjs · grupo «nelec» (productos nuevos del pañol: cables y unipolares, identificación, bornes BPN 4/10/16 y accesorios,
 * fichas IRAM 2073, termomagnéticas, fotocontroles, comando y tablero T-010). ÚNICA fuente de la geometría (mm) de estas hojas:
 * el 3D (piezas/nelec_util.mjs) y el plano (node exportar_nelec.mjs → perfiles_nelec.json → hojas/mat/nelekit.py) salen de acá.
 * «AC» = (*) a confirmar (proporcional a una referencia). Fuentes de cada medida: r3d/FUENTES_nelec.md */
import { clase2, clase5, COL } from './perfiles_cables.mjs';
import { BPN, SEPARADOR } from './perfiles.mjs';

export const rect = (y0, y1, z0, z1) => [[y0, z0], [y1, z0], [y1, z1], [y0, z1]];
export { COL };

/* ===================== CABLES (copia de multipolar() de perfiles_cables.mjs, que no se exporta) ===================== */
function multipolar(o) {
  const conds = o.conds.map(c => {
    const cu = c.cl5 ? clase5(c.S, c.cl5) : clase2(c.S, c.n || 7);
    const e = c.e !== undefined ? c.e : o.e;
    return { ...c, ...cu, e, rc: cu.R + e };
  });
  const n = conds.length, rc = Math.max(...conds.map(c => c.rc));
  const d = n === 1 ? 0 : n === 2 ? rc : rc / Math.sin(Math.PI / n);
  const a0 = o.a0 !== undefined ? o.a0 : (n === 4 ? 45 : n === 3 ? 90 : 0);
  conds.forEach((c, i) => { const ang = (a0 + 360 * i / n) * Math.PI / 180; c.y = d * Math.cos(ang); c.z = d * Math.sin(ang); });
  const Rlay = n === 1 ? rc : d + rc;
  const Ro = o.D ? o.D / 2 : Rlay + (o.relleno ? .5 : 0) + o.ev;
  return { ...o, conds, n, d, Rlay, Ri: Ro - o.ev, Ro, D: 2 * Ro };
}
function ajustar(c, R) { const k = R / c.R; c.rw *= k; c.R = R; c.hilos = c.hilos.map(([r, a]) => [r * k, a]); c.rc = c.R + c.e; }
const F4 = ['L1', 'L2', 'L3', 'N'];
// Tetrapolares: aislación XLPE 0,7 y Ø de la ficha de la app para IRAM 2178-1 (Prysmian Retenax Valio: 4×2,5 Ø12 · 4×4 Ø13,5 · 4×6 Ø14,5).
// IRAM 62266 (LSZH, Afumex 1000+): mismo armado; el Ø y la vaina NO figuran en la búsqueda → mismos valores AC.
const tetra = (S, D, norma) => multipolar({ conds: F4.map(f => ({ f, S })), e: .7, ev: 1.8, D, relleno: true, norma });
export const CABN = {
  L4x2_5: { ...tetra(2.5, 12, 'IRAM 62266'), cod: 1047, txt: '4 x 2,5', lszh: true },
  L4x4: { ...tetra(4, 13.5, 'IRAM 62266'), cod: 1037, txt: '4 x 4', lszh: true },
  P4x4: { ...tetra(4, 13.5, 'IRAM 2178-1'), cod: 1046, txt: '4 x 4' },
  L4x6: { ...tetra(6, 14.5, 'IRAM 62266'), cod: 1033, txt: '4 x 6', lszh: true },
  P4x6: { ...tetra(6, 14.5, 'IRAM 2178-1'), cod: 1059, txt: '4 x 6' },
  L3x1_5: { ...multipolar({ conds: ['L1', 'L2', 'N'].map(f => ({ f, S: 1.5 })), e: .7, ev: 1.8, D: 10, relleno: true, norma: 'IRAM 62266' }), cod: 3083, txt: '3 x 1,5', lszh: true },
};
// Unipolares IRAM NM 247-3 (Prysmian Superastic Jet): 1,5 → Ø3,0 / 0,7 · 2,5 → Ø3,6 / 0,8 · alambre Ø0,26 (catálogo 2020/2026);
// 6 → Ø4,7 / 0,8 · 10 → Ø6,0 / 1,0 (ficha de la app). Cuerda clase 5 (cantidad de alambres ilustrativa AC).
const uni = (f, S, D, e, dw, cod, txt, col) => ({ ...multipolar({ conds: [{ f, S, cl5: dw }], e, ev: 0, D }), cod, txt, col });
export const UNI = {
  u1_5N: uni('N', 1.5, 3.0, .7, .26, 1044, '1 x 1,5 celeste', 'CELESTE'),
  u1_5M: uni('L1', 1.5, 3.0, .7, .26, 1045, '1 x 1,5 marron', 'MARRON'),
  u2_5N: uni('N', 2.5, 3.6, .8, .26, 1056, '1 x 2,5 celeste', 'CELESTE'),
  u2_5R: uni('L3', 2.5, 3.6, .8, .26, 1057, '1 x 2,5 rojo', 'ROJO'),
  u2_5M: uni('L1', 2.5, 3.6, .8, .26, 1058, '1 x 2,5 marron', 'MARRON'),
  u2_5K: uni('L2', 2.5, 3.6, .8, .26, 1043, '1 x 2,5 negro', 'NEGRO'),
  u2_5V: uni('PE', 2.5, 3.6, .8, .26, 1041, '1 x 2,5 verde-amarillo', 'VERDE-AMARILLO'),
  u6M: uni('L1', 6, 4.7, .8, .31, 1042, '1 x 6 marron', 'MARRON'),
  u10V: uni('PE', 10, 6.0, 1.0, .41, 1034, '1 x 10 verde-amarillo', 'VERDE-AMARILLO'),
};
for (const C of Object.values(UNI)) ajustar(C.conds[0], C.Ro - C.conds[0].e);

/* ===================== BORNES BPN (Zoloda): 4, 06 (10 mm²) y 16 =====================
 * Tabla Zoloda de la ficha de la app: BPN-04 paso 6,2 · A/B/C 50/48/53 · 32 A · BPN-06 8,2 · 50/48/53 · 41 A (6 / 10 mm²) ·
 * BPN-16 12,2 · 56/66/71 · 76 A. La forma se arma estirando el perfil del BPN-06 del piloto (perfiles.mjs, que no se toca):
 * los pies quedan sobre el riel NS35 (se corren d = (C − 53)/2), las puntas se estiran, z se escala por A/50. AC */
function mapa(C, A) {
  const d = (C - 53) / 2, k = (6 + d) / 6, kz = A / 50;
  const fy = y => y <= 6 ? y * k : y <= 47 ? y + d : 47 + d + (y - 47) * k;
  const fz = z => z <= 0 ? z : z * kz;
  return { d, fy, fz, p: pts => pts.map(([y, z]) => [fy(y), fz(z)]) };
}
export function bpnTipo(C, A, paso, I, txt) {
  const m = mapa(C, A), s = paso / 8.2, cv = {};
  for (const [k, v] of Object.entries(BPN.cavidades)) cv[k] = m.p(v);
  return { C, A, paso, I, txt, d: m.d, s, pared: 1.0 * Math.min(1, s), yT: BPN.yT.map(m.fy), yPuente: m.fy(BPN.yPuente), riel: { y0: 9 + m.d, z0: -7.5 },
    contorno: m.p(BPN.contorno), cavidades: cv,
    jaula: { ext: m.p(BPN.jaula.ext), int: m.p(BPN.jaula.int), extD: m.p(BPN.jaula.extD), intD: m.p(BPN.jaula.intD), x: BPN.jaula.x.map(x => x * s) },
    barra: { p: m.p(BPN.barra.p), x: BPN.barra.x.map(x => x * s) },
    zocaloP: { p: m.p(BPN.zocaloP.p), x: BPN.zocaloP.x.map(x => x * s) },
    tornillo: { M: paso > 10 ? 5 : paso < 7 ? 3.5 : 4, dk: Math.min(7 * s, 9.5), k: 2.6, zCab: m.fz(BPN.tornillo.zCab), L: BPN.tornillo.L * A / 50 },
    pozoR: Math.min(3.4 * s, 4.6), puntera: { zEje: m.fz(BPN.puntera.zEje) },
    marcado: m.p(BPN.cavidades.marcado) };
}
export const BPN4 = bpnTipo(53, 50, 6.2, '32 A', 'BPN-4');
export const BPN10 = bpnTipo(53, 50, 8.2, '41 A', 'BPN-06');      // «BPN 10 MM» (3075): en la tabla Zoloda el de 10 mm² es el BPN-06 (6/10 mm²) AC
export const BPN16 = bpnTipo(71, 56, 12.2, '76 A', 'BPN-16');
// separadores: el del piloto (2041) estirado igual que el borne. 2063 (2,5/4) = forma del BPN-06; 2064 (16/35) = BPN-16. Espesor 1,5 AC
export const SEP4 = { esp: 1.5, contorno: mapa(53, 50).p(SEPARADOR.contorno) };
export const SEP16 = { esp: 1.5, contorno: mapa(71, 56).p(SEPARADOR.contorno) };
export const TAPA10 = { esp: 2.2, contorno: BPN.contorno };      // 2066 tapa gris BPN 2,5/10: contorno del borne, 2,2 (Phoenix D-UT) AC

/* ===================== IDENTIFICACIÓN =====================
 * Anillo marcador abierto (clip) de PVC flexible. Rango por cable: 1–2,5 mm² → cable Ø3,0–3,6 (Superastic Jet) · 4–6 mm² → Ø4,0–4,7.
 * Referencias de rango: Goobay 4–6 mm, Gotron ≤ 2,5 mm (por diámetro de cable). Medidas del anillo AC. */
export const ANI = {
  a25: { ri: 1.45, re: 2.55, L: 4.0, abre: 70, rango: '1-2,5 mm²', cable: [3.0, 3.6], letraH: 2.4 },
  a6: { ri: 2.05, re: 3.25, L: 5.0, abre: 70, rango: '4-6 mm²', cable: [4.0, 4.7], letraH: 3.0 },
  amarillo: '#f2c418', verde: '#2f9a3e', celeste: '#4fa3d9',
};
// Termocontraíble 2:1: 3/8" → Ø9,53 suministrado, 4,75 recuperado, pared recuperada 0,64 (3M FP-301) · 3/16" → 4,75 / 2,36 / 0,51 (Panduit HSTT19, Syscom).
// Pared suministrada AC (≈ la mitad de la recuperada).
export const SPAG = {
  s38: { Ds: 9.53, Dr: 4.75, er: .64, es: .34, txt: '3/8"', cod: 1049 },
  s316: { Ds: 4.75, Dr: 2.36, er: .51, es: .27, txt: '3/16"', cod: 1060 },
};

/* ===================== FICHAS IRAM 2073 (macho) y su hembra (prolongador) =====================
 * Patas: 2 planas en V (fase y neutro, 30° de la vertical) + tierra vertical. Largo de las planas 18,5 y de la tierra 22,0
 * (Museum of Plugs and Sockets; Interpower dice 18,2 / 21,4). El de 20 A tiene las patas más separadas (museo; compatible NEMA 10-20).
 * Ancho y espesor de las patas, separación y cuerpo: AC (proporcional a AS/NZS 3112). Cuerpo 10 A: 34 × 32 × 50,5 (cifras de la ficha Kalop, sin rotular: AC). */
export const FICHA = {
  f10: { I: 10, cuerpo: { W: 34, H: 32, L: 50.5, frente: 6, r: 6 }, pata: { a: 6.5, e: 1.6, L: 18.5, ang: 30, cx: 7.1, cz: 3.2 }, tierra: { a: 6.5, e: 1.6, L: 22.0, cz: -7.6 }, cable: { D: 7.4, cod: '3 x 1,5' } },
  f20: { I: 20, cuerpo: { W: 40, H: 38, L: 58, frente: 7, r: 7 }, pata: { a: 6.5, e: 1.6, L: 18.5, ang: 30, cx: 9.2, cz: 3.6 }, tierra: { a: 8.0, e: 1.6, L: 22.0, cz: -9.0 }, cable: { D: 9.6, cod: '3 x 2,5' } },
  h10: { I: 10, cuerpo: { W: 36, H: 36, L: 56, frente: 8, r: 9 } },
  h20: { I: 20, cuerpo: { W: 42, H: 42, L: 62, frente: 9, r: 10 } },
};

/* ===================== COMANDO =====================
 * ABB AT1 (interruptor horario analógico de cuarzo, 1 módulo 17,5, 230 V, 16 A resistiva / 4 A inductiva, 1 NA; ficha ABB 2CSC440007B0201).
 * Alto 85 / profundidad 64 / cuello 45 de un modular DIN 43880 AC. Genérico: analógico de 3 módulos (52,5) con dial de segmentos AC.
 * Sonoff MINI R4: 39,5 × 33 × 16,8 · 10 A · 100–240 V · bornes L in, N in, L out, S1, S2 (ficha Sonoff / manual MINIR4).
 * Sonoff S-MATE (switch mate): 54 × 45 × 24 · pila CR2032 · bornes L, L1, L2, L3, S, S1, S2, S3 (pasantes) (minoristas / manual). */
export const HOR = { H: 85, D: 64, Dr: 44, Dn: 64, cuello: [20, 65], abb: { W: 17.5 }, gen: { W: 52.5, dial: 19 } };
export const SONOFF = { W: 39.5, P: 33, H: 16.8, bornes: ['N in', 'L in', 'S1', 'S2', 'L out', 'N out'] };
export const SMATE = { W: 54, P: 45, H: 24, bornes: ['L', 'L1', 'L2', 'L3', 'S', 'S1', 'S2', 'S3'] };

/* ===================== TABLERO T-010 PRFV para poste (3101 / 3102) =====================
 * Descripción del pañol: 747 × 546 × 300 (alto × ancho × fondo AC: el orden no está dicho), 3 o 2 salidas «3 × 1 × 16 A».
 * Pared, puerta, junta, placa, poste y contenido: como el gabinete 530 × 430 × 200 de MAT-TABLERO-1 (perfiles_protab GAB) AC. */
export const T010 = { W: 546, H: 747, P: 300, pared: 4.5, radio: 16, puerta: 5, placa: { W: 486, H: 687, e: 2, y: 25 }, poste: { R: 95 }, salidas3: 3, salidas2: 2 };
