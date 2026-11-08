/* perfiles_nherr.mjs · ÚNICA fuente de medidas (mm) del grupo «nherr» (herramientas nuevas del pañol, hojas MAT-HERRAMIENTAS-1…11).
 * Las hojas Python leen r3d/perfiles_nherr.json (node exportar_nherr.mjs): el plano y el 3D usan los mismos números y contornos.
 * Ejes de las herramientas planas (pinzas, llaves, fratachos…): x = largo (punta en x = 0), y = ancho (vista de arriba), z = espesor.
 * AC = a confirmar (proporcional a una referencia; en la hoja va en naranja con (*)). Fuentes con URL: r3d/FUENTES_nherr.md */
import pc from 'polygon-clipping';

const TAU = Math.PI * 2, PI_ = Math.PI;
const r1 = (v) => Math.round(v * 100) / 100;
const circ = (cx, cy, r, n = 48, a0 = 0, a1 = TAU) => Array.from({ length: n }, (_, i) => [r1(cx + r * Math.cos(a0 + (a1 - a0) * i / (n - (a1 - a0 >= TAU - 1e-9 ? 0 : 1)))), r1(cy + r * Math.sin(a0 + (a1 - a0) * i / (n - (a1 - a0 >= TAU - 1e-9 ? 0 : 1))))]);
const espejoY = (mp) => mp.map(pol => pol.map(ring => ring.map(([x, y]) => [x, -y]).reverse()));
const ringR = (pts) => pts.map(([x, y]) => [r1(x), r1(y)]);
const mp = (ring) => [[ringR(ring)]];
const lerp = (a, b, t) => a + (b - a) * t;
/** función por tramos (lista [[x, v]…]) */
const tramo = (tab) => (x) => { if (x <= tab[0][0]) return tab[0][1]; for (let i = 1; i < tab.length; i++) if (x <= tab[i][0]) return lerp(tab[i - 1][1], tab[i][1], (x - tab[i - 1][0]) / (tab[i][0] - tab[i - 1][0])); return tab[tab.length - 1][1]; };

/* ===================================================================================================
 * PINZAS AISLADAS (IEC 60900, 1000 V ca / 1500 V cc): generador común
 * Una pinza cerrada vista de arriba: el brazo A tiene la mordaza arriba (y > 0) y el mango abajo (y < 0); el brazo B es el espejo.
 * En la articulación (disco de radio rp en x = xp) los brazos se solapan: cada uno ocupa la mitad del espesor (junta solapada).
 * Mango: línea media c(x) y medio ancho del acero hc(x); la aislación son capas que agrandan ese medio ancho:
 *   base (capa dura, 1.ª componente) + grip (capa blanda, 2.ª componente) + tope (collar que frena el dedo junto a la cabeza).
 * =================================================================================================== */
function pinza(s) {
  const c = (x) => -lerp(s.c0, s.c1, Math.pow((x - s.xh) / (s.L - s.xh), 1.25));
  const hc = (x) => lerp(s.hc0, s.hc1, (x - s.xh) / (s.L - s.xh));
  const banda = (x0, x1, off, n = 24) => {          // polígono del mango (brazo A, y < 0) entre x0 y x1 con medio ancho hc + off
    const up = [], dn = [];
    for (let i = 0; i <= n; i++) { const x = lerp(x0, x1, i / n); up.push([x, c(x) + hc(x) + off]); dn.push([x, c(x) - hc(x) - off]); }
    return ringR([...up, ...dn.reverse()]);
  };
  // mordaza del brazo A (arriba): de y = sep a y = jw(x)
  const jw = tramo(s.jaw);
  const top = [], N = 30; for (let i = 0; i <= N; i++) { const x = s.xp * i / N; top.push([x, jw(x)]); }
  let jaw = [[ringR([[0, s.sep], ...top.slice(1), [s.xp, s.sep]])]];
  if (s.tubo) jaw = pc.difference(jaw, [[circ(s.tubo.x, 0, s.tubo.r, 40)]]);
  if (s.muescas) for (const [xc, w, hh] of s.muescas) jaw = pc.difference(jaw, mp([[xc - w / 2, -1], [xc + w / 2, -1], [xc + w * .32, hh], [xc - w * .32, hh]]));
  const disco = [[circ(s.xp, 0, s.rp, 64)]];
  const nx = s.xh + 1.5;
  const cuello = mp([[s.xp - s.rp * .55, s.rp * .55], [s.xp + s.rp * .3, s.rp * .2], [nx, c(nx) + hc(nx)], [nx, c(nx) - hc(nx)], [s.xp + s.rp * .1, -s.rp]]);
  const mangoAcero = [[banda(s.xh, s.L - 2, 0)]];
  const brazoA = pc.union(jaw, disco, cuello, mangoAcero);
  const brazoB = espejoY(brazoA);
  const solape = pc.intersection(brazoA, brazoB);
  const llenoA = pc.difference(brazoA, solape);
  const aisPol = {
    base: banda(s.xh + s.ais.tope[1] - .5, s.L, s.ais.base),
    tope: banda(s.xh, s.xh + s.ais.tope[1], s.ais.tope[0]),
    grip: banda(s.xh + s.ais.grip[0], s.L - s.ais.grip[1], s.ais.grip[2]),
  };
  const corteAA = s.xh + (s.L - s.xh) * .62;       // corte A-A del mango (por el medio del grip)
  return {
    ...s, brazoA, brazoB, solape, llenoA, aisPol, corteAA,
    cAA: r1(c(corteAA)), hcAA: r1(hc(corteAA)),
    ancho: r1(2 * (s.c1 + s.hc1 + s.ais.grip[2])),
    cExt: r1(s.c1), centro: (x) => c(x),
  };
}

// 9005 · Pinza universal aislada (ref. Knipex 03 06 200: 200 × 58 × 20 mm · 355 g · corta Cu 16 mm² · alambre duro Ø2,5 / semiduro Ø3,8)
export const P9005 = pinza({
  cod: 9005, L: 200, xp: 52, rp: 12.5, xh: 66, sep: .12,
  jaw: [[0, 6.2], [6, 7.6], [24, 9.6], [40, 11.6], [52, 12.5]],              // AC: forma de la cabeza (proporcional a 03 06 200)
  tubo: { x: 28, r: 4.6 },                                                  // AC: zona de agarre de caños (redondo)
  filo: [38, 49],                                                           // AC: tramo de los filos de corte
  estrias: [2, 22],                                                         // AC: zona de agarre plana estriada
  c0: 12.6, c1: 19.2, hc0: 4.2, hc1: 5.2, tAcero: 7, tCab: 10.5,
  ais: { base: 2.6, tope: [8.6, 6], grip: [16, 12, 4.6], tBase: 13.5, tTope: 18, tGrip: 20 },
  ref: 'KNIPEX 03 06 200', corta: 'Cu 16 mm² · ALAMBRE Ø2,5 DURO / Ø3,8 SEMIDURO', peso: 355,
});
// 9029 · Pinza de punta cónica (punta semirredonda con filo; ref. Knipex 26 16 200: 200 × 56 × 19 mm · 206 g · corta Ø3,2)
export const P9029 = pinza({
  cod: 9029, L: 200, xp: 74, rp: 10.5, xh: 86, sep: .12,
  jaw: [[0, 1.6], [12, 2.4], [40, 4.3], [60, 7.2], [74, 10.5]],             // AC
  filo: [62, 71], estrias: [2, 40],
  c0: 11.4, c1: 18.6, hc0: 3.8, hc1: 4.8, tAcero: 6.5, tCab: 8.5,
  ais: { base: 2.5, tope: [8.2, 5.5], grip: [14, 12, 4.4], tBase: 13, tTope: 17.5, tGrip: 19 },
  ref: 'KNIPEX 26 16 200', corta: 'ALAMBRE Ø3,2', peso: 206,
});
// 3088 · Alicate de corte oblicuo (diagonal) aislado (ref. Knipex 70 06 160: L 160 · corta Ø2 duro / Ø2,8 semiduro / Ø4 blando)
export const P3088 = pinza({
  cod: 3088, L: 160, xp: 24, rp: 11.5, xh: 37, sep: .1,
  jaw: [[0, 2.6], [3, 6.2], [9, 9.6], [17, 11.4], [24, 11.5]],              // AC: cabeza redondeada (bisel de los filos)
  filo: [1, 16], estrias: null,
  c0: 12, c1: 16.6, hc0: 4, hc1: 4.8, tAcero: 7, tCab: 10,
  ais: { base: 2.5, tope: [8.4, 5.5], grip: [13, 10, 4.4], tBase: 13, tTope: 17.5, tGrip: 19 },
  ref: 'KNIPEX 70 06 160', corta: 'ALAMBRE Ø2 DURO · Ø2,8 SEMIDURO · Ø4 BLANDO', peso: null,
});

// 3086 · Cuchillo de electricista aislado (ref. Knipex 98 52: L 190 · hoja 50; Yato YT-21210: 180 / hoja 50)
export const CUCH = {
  cod: 3086, L: 190, hoja: 50, anchoHoja: 15, eHoja: 2,                    // AC: ancho y espesor de la hoja
  mango: { L: 140, D0: 20, D1: 24, Dtope: 30, tope: 7, e: 18 },             // AC: mango oval con collar
  // contorno de la hoja (x = desde la punta, y = arriba/abajo): lomo recto, filo curvo («hoja de electricista»)
  contHoja: ringR([[0, 3.2], [8, 5.6], [50, 6.8], [55, 6.8], [55, -6.2], [50, -6.2], [20, -6.6], [6, -3.8], [1, .4]]),
  ref: 'KNIPEX 98 52 · YATO YT-21210',
};

/* ---- 9018 · Pinza corta cable a criquet hasta 240 mm² (ref. Knipex 95 36 250: 250 × 115 × 20 · 652 g · Ø32 / 240 mm² Cu-Al; NO para acero ni cables extraflexibles) ---- */
export const CRIQ = {
  cod: 9018, L: 250, ancho: 115, e: 20, Dcap: 32, peso: 652,
  cuchilla: { cx: 36, cy: 0, R: 28, Rint: 16 },                               // AC: cuchilla móvil (gancho) con el diente del criquet
  fija: { R: 30, garganta: 17 },                                              // AC
  piv: { x: 58, y: 8, r: 5 },                                                 // AC: eje principal
  dientes: { n: 13, a0: 200, a1: 330, h: 2.4 },                               // AC: dientes del criquet (en la cuchilla móvil)
  manijaF: { x0: 74, L: 176, c0: -6, c1: -42, hc: 5.5, ais: 3.2, grip: 5 },   // AC: mango fijo
  manijaM: { x0: 74, L: 160, c0: 18, c1: 48, hc: 4.5, ais: 3.2, grip: 5 },    // AC: mango del trinquete (abierto)
};
CRIQ.contFija = (() => {        // cuchilla fija en «C» (vista de arriba)
  const { cx, cy } = CRIQ.cuchilla; const R = CRIQ.fija.R, g = CRIQ.fija.garganta;
  const ext = circ(cx, cy, R, 72, Math.PI * .62, Math.PI * 2.05), inn = circ(cx, cy, g, 48, Math.PI * .62, Math.PI * 2.05).reverse();
  return pc.union([[ringR([...ext, ...inn])]], mp([[cx + 10, -14], [CRIQ.manijaF.x0 + 4, -14], [CRIQ.manijaF.x0 + 4, 4], [cx + 18, 8]]));
})();
CRIQ.contMovil = (() => {       // cuchilla móvil: disco con garganta de corte y dientes del criquet en el borde
  const { cx, cy, R } = CRIQ.cuchilla; const d = CRIQ.dientes; const pts = [];
  const n = 90; for (let i = 0; i <= n; i++) { const a = (d.a0 + (d.a1 - d.a0) * i / n) * Math.PI / 180; const k = (i % 7 < 3.5) ? 0 : d.h; pts.push([cx + (R - k) * Math.cos(a), cy + (R - k) * Math.sin(a)]); }
  const arco = circ(cx, cy, R, 40, d.a1 * Math.PI / 180, (d.a0 + 360 - 95) * Math.PI / 180);
  const base = [[ringR([...pts, ...arco])]];
  return pc.difference(base, [[circ(cx - 10, cy + 8, 15, 48)]]);
})();

/* ---- 9021 · Pinza crimpeadora para punteras TIF 0,75–10 mm² «ES-10WF» (sin ficha publicada: ref. Goobay HSC8 6-4A / Klauke K 301/6: L 175, autoajustable) ---- */
const BOCAS = [[0.75, 2.6], [1.0, 2.9], [1.5, 3.3], [2.5, 4.0], [4.0, 4.8], [6.0, 5.7], [10.0, 7.2]];   // AC: ancho de cada boca (mm) por sección (mm²)
let xb = 5; const MUES = BOCAS.map(([s, w]) => { const xc = xb + w / 2; xb += w + 2.2; return [r1(xc), w, r1(w * .42)]; });
export const CRIMP = pinza({
  cod: 9021, L: 180, xp: 50, rp: 13, xh: 72, sep: .15, rango: [0.75, 10], bocas: BOCAS,
  jaw: [[0, 9], [6, 12.5], [40, 13.5], [50, 13]], muescas: MUES,             // AC: cabeza con 7 bocas en fila (una por sección)
  filo: null, estrias: null,
  c0: 15, c1: 22, hc0: 5, hc1: 6, tAcero: 8, tCab: 12,
  ais: { base: 2.2, tope: [5, 4], grip: [10, 10, 3.8], tBase: 13, tTope: 15, tGrip: 17 },
  criquet: { x: 66, r: 16, n: 11 },                                           // AC: sector dentado del criquet y traba
  ref: 'GOOBAY HSC8 6-4A · KLAUKE K 301/6 (175)', aislada: false,
});

/* ===================================================================================================
 * DESTORNILLADORES AISLADOS 1000 V (IEC 60900): mango bimaterial + vaina aislante sobre la caña hasta cerca de la punta
 * =================================================================================================== */
const destor = (cod, tipo, d, L, total, hoja) => ({
  cod, tipo, d, L, total, hoja,                         // hoja: plano → [ancho, espesor]; philips → PH n°
  mango: { L: total - L, D: 34, Dcol: 37, nCaras: 6 }, // AC: mango Ø34 (Recahispania 99 / 34)
  vaina: { e: 1.1, libre: 15 },                         // AC: espesor de la vaina; punta sin aislar ≤ 18 (*)
});
export const DESTOR = {
  d9025: destor(9025, 'PH', 6, 150, 262, 'PH2'),       // total AC
  d9026: destor(9026, 'PL', 6.5, 150, 255, [6.5, 1.2]),  // PB Swiss 5100.5-150: 6,5 × 1,2 × 150 · L 255
  d9027: destor(9027, 'PL', 6, 125, 225, [6, 1.0]),     // AC
  d9028: destor(9028, 'PH', 6, 100, 200, 'PH2'),       // Wera PH2 × 100: L 198–205
};
export const PH2 = { punta: 6, ang: 26.5, ranura: 1.3, conoL: 9 };              // AC: cruz Phillips PH2 (ISO 8764)

/* ===================================================================================================
 * LLAVES
 * =================================================================================================== */
const francesa = (cod, pulg, L, ab, eCab, A, abre = .6) => {
  // vista de arriba (x = desde la boca, y): cabeza elíptica + mango que se afina; ranura de la boca y ventana del sinfín
  const elip = (cx, cy, rx, ry, n = 72) => Array.from({ length: n }, (_, i) => [r1(cx + rx * Math.cos(TAU * i / n)), r1(cy + ry * Math.sin(TAU * i / n))]);
  const cab = [[elip(A * .55, 1.5, A * .55, A * .47)]];
  const mango = mp([[A * .7, A * .24], [L - 14, 9.5], [L - 4, 9], [L, 5], [L, -5], [L - 4, -9], [L - 14, -9.5], [A * .7, -A * .26]]);
  const yb = -ab / 2, hj = ab * (1 - abre);
  const ranura = mp([[-5, yb - 16], [A * .58, yb - 16], [A * .58, ab / 2], [-5, ab / 2]]);
  const ventana = mp([[A * .27, yb - 13.5], [A * .84, yb - 13.5], [A * .84, yb - 2], [A * .27, yb - 2]]);
  const ojo = { x: L - 12, r: 4.5 };
  const cuerpo = pc.difference(pc.union(cab, mango), ranura, ventana, [[circ(ojo.x, 0, ojo.r, 32)]]);
  const elipM = [[elip(A * .55, 1.5, A * .55 + .3, A * .47 + .3)]];
  const movil = pc.union(pc.intersection(elipM, mp([[.6, yb - 2.4], [A * .56, yb - 2.4], [A * .56, yb + hj], [.6, yb + hj]])),
                         pc.intersection(elipM, mp([[.6, yb - 15.5], [A * .26, yb - 15.5], [A * .26, yb - 2.3], [.6, yb - 2.3]])));
  return { cod, pulg, L, ab, eCab, ancCab: A, abre, cuerpo, movil, ojo, sinfin: { x0: A * .29, x1: A * .82, y: r1(yb - 7.7), r: 5.2 }, cabX: A * 1.02 };
};
export const LLAVES = {
  f9030: francesa(9030, 8, 200, 24, 13, 54),     // EMTOP 8": 24 mm (Stanley / Eclipse 8": 29) · AC: cabeza
  f9031: francesa(9031, 10, 250, 30, 15, 64),    // AC: 10" 30 mm (Teng 4004: 33)
  // 9035 juego de llaves Allen (macho hexagonal) · ISO 2936 serie corta: largo l1 / l2 (AC, de memoria: confirmar con la tabla)
  allen: [[1.5, 46, 15.5], [2, 52, 18], [2.5, 58.5, 20.5], [3, 66, 23], [4, 74, 29], [5, 85, 33], [6, 96, 38], [8, 108, 44], [10, 122, 47]],
  // 9037 llave combinada con criquet (boca + estrella a crique): se dibuja la de 13 mm (AC: qué medidas trae el juego «40»)
  comb: { s: 13, L: 178, boca: 32, estrella: 22, e: 7.5, eEstr: 9.5, dientes: 72, ang: 15 },
};

// contorno de la llave combinada (vista de arriba, x = largo, boca en x = 0, estrella en x = L)
(() => {
  const c = LLAVES.comb, Rb = c.boca / 2, Re = c.estrella / 2, s = c.s;
  const boca = pc.difference([[circ(Rb, 0, Rb, 64)]], mp([[-2, -s / 2], [Rb + s * .25, -s / 2], [Rb + s * .25, s / 2], [-2, s / 2]]), [[circ(Rb + s * .25, 0, s / 2, 32)]]);
  const cuerpo = mp([[Rb * 1.5, 6.5], [c.L - Re * 1.2, 5.2], [c.L - Re * 1.2, -5.2], [Rb * 1.5, -6.5]]);
  const anillo = pc.difference([[circ(c.L - Re, 0, Re, 64)]], [[circ(c.L - Re, 0, s * .62, 48)]]);
  c.cont = pc.union(boca, cuerpo, anillo);
  // engranaje del criquet (72 dientes) con hexágono doble (12 puntas) para la tuerca de 13
  const g = []; const Rg = s * .62 - .2, nd = 72; for (let i = 0; i < nd * 2; i++) { const a = TAU * i / (nd * 2); const rr = i % 2 ? Rg - .5 : Rg; g.push([r1(c.L - Re + rr * Math.cos(a)), r1(rr * Math.sin(a))]); }
  const st = []; const rs = s / 2 / Math.cos(PI_ / 12); for (let i = 0; i < 24; i++) { const a = TAU * i / 24; const rr = i % 2 ? s / 2 * 1.02 : rs * .98; st.push([r1(c.L - Re + rr * Math.cos(a)), r1(rr * Math.sin(a))]); }
  c.engranaje = pc.difference([[g]], [[st]]);
  c.ojoX = c.L - Re;
})();
/* ===================================================================================================
 * ALBAÑILERÍA
 * =================================================================================================== */
export const ALB = {
  fratM: { cod: 8027, L: 300, A: 140, e: 20, mango: { L: 200, A: 34, H: 46 } },        // AC: Gardex 300; espesor 20 (Hela 115 × 350 × 20)
  fratG: { cod: 8033, L: 280, A: 140, e: 10, goma: 20, mango: { L: 200, A: 34, H: 46 } },// AC
  // martillo maza: cabeza de acero (densidad 7,85 g/cm³) → volumen = masa / 7,85; ojo ovalado
  maza05: { cod: 8031, m: 500, cab: [80, 30, 30], cabo: 260, ojo: [20, 13], sec: [30, 22] },   // (30 × 30 × 80 − ojo 20 × 13 × 30) × 7,85 g/cm³ ≈ 504 g (AC)
  maza2: { cod: 8035, m: 2000, cab: [120, 50, 50], cabo: 300, ojo: [34, 22], sec: [38, 28] },  // (50 × 50 × 120 − ojo 34 × 22 × 50) × 7,85 ≈ 2061 g (AC) · cabo 280–300 (Hoffmann)
  cabo: { cod: 8034, L: 400, ojo: [34, 22], sec: [38, 28] },                            // 40 cm (pañol) · AC: sección del ojo y del cuerpo
  hacha: { cod: 8032, m: 600, cab: { L: 165, filo: 95, e: 28 }, cabo: 360 },          // AC
  punta: { cod: 8036, L: 300, af: 18, punta: 45, cabeza: 6 },                         // DIN 7256 · Rennsteig 300 × 18 octogonal
};

// manija del fratacho (perfil de costado, x a lo largo, z para arriba; se extruye en el ancho A): arco con dos patas atornilladas
ALB.manija = (() => { const L = 200, H = 46, t = 13, pts = [], inn = [];
  for (let i = 0; i <= 24; i++) { const x = 30 + (L - 60) * i / 24, s = Math.sin(Math.PI * i / 24); pts.push([r1(x), r1(t + (H - t) * Math.pow(s, .6))]); inn.push([r1(x), r1(t - 1 + (H - t - 13) * Math.pow(s, .6))]); }
  return ringR([[0, 0], [L, 0], [L, t], [L - 10, H * .55], ...pts.slice().reverse().slice(1, -1), [10, H * .55], [0, t]]).concat([]) ; })();
ALB.manijaHueco = (() => { const L = 200, t = 13, H = 46, inn = []; for (let i = 0; i <= 24; i++) { const x = 36 + (L - 72) * i / 24, s = Math.sin(Math.PI * i / 24); inn.push([r1(x), r1(t - 1 + (H - t - 14) * Math.pow(s, .6))]); }
  return ringR([...inn, ...inn.slice().reverse().map(([x, z]) => [x, Math.min(z, t)])]); })();
// hacha de mano: contorno de la cabeza (vista de costado: x a lo largo del cabo, y hacia el filo negativo) y espesores
ALB.hacha.cont = ringR([[-18, 26], [18, 26], [20, 8], [22, -40], [44, -100], [47, -108], [44, -114], ...Array.from({ length: 13 }, (_, i) => { const a = Math.PI * (i / 12); return [r1(44 - 94 * i / 12), r1(-114 - 7 * Math.sin(a))]; }).slice(1, -1), [-50, -114], [-53, -108], [-50, -100], [-22, -40], [-20, 8]]);
ALB.hacha.ojo = [28, 14];          // AC: ojo ovalado (largo en y × ancho en z)
ALB.hacha.esp = { cuerpo: 28, hoja: 8, filo: 1.5, yHoja: -45, yFilo: -100 };   // AC: espesores (cuña)
/* ===================================================================================================
 * CORTE, DESBASTE Y PERFORADO
 * =================================================================================================== */
export const DISCOS = {
  d8030: { cod: 8030, D: 115, e: 1.6, agujero: 22.23, tipo: 41, rpm: 13300, vs: 80, mallas: 2, uso: 'CORTE' },   // e 1,0 / 1,6 según marca (AC)
  d9042: { cod: 9042, D: 230, e: 3.0, agujero: 22.23, tipo: 41, rpm: 6600, vs: 80, mallas: 2, uso: 'CORTE' },    // Metabo Flexiamant 230 × 3,0
  d8028: { cod: 8028, D: 115, e: 6.4, agujero: 22.23, tipo: 27, rpm: 13300, vs: 80, mallas: 3, uso: 'DESBASTE', depr: { D: 40, h: 5 } },
  d8029: { cod: 8029, D: 115, e: 7, agujero: 22.23, tipo: 29, rpm: 13300, vs: 80, laminas: 72, grano: 'P60', uso: 'FLAP' },   // RS PRO: 7 mm · grano AC
};
export const MECHAS = {
  m9040: { cod: 9040, d: 10, L: 133, Lc: 87, ang: 118, helice: 30 },    // DIN 338: 10 → 133 / 87
  m9041: { cod: 9041, d: 12, L: 151, Lc: 101, ang: 118, helice: 30 },   // DIN 338: 12 → 151 / 101
};
// sección de la mecha helicoidal de 2 canales (polar): radio exterior R, alma w (AC: 0,18 × d), canal de ≈ 110° cada uno
export function rMecha(d, th) { const R = d / 2, w = .18 * d / 2 * 2 * .5 + .09 * d; const a = ((th % PI_) + PI_) % PI_;   // 0..π
  const c = 1.15, x = (a - .25) / c; const f = x > 0 && x < 1 ? Math.pow(Math.sin(Math.PI * x), .55) : 0; return R - (R - w) * f; }
for (const k of ['m9040', 'm9041']) { const m = MECHAS[k]; m.secc = Array.from({ length: 96 }, (_, i) => { const th = TAU * i / 96, r = rMecha(m.d, th); return [r1(r * Math.cos(th)), r1(r * Math.sin(th))]; });
  m.paso = r1(Math.PI * m.d / Math.tan(m.helice * PI_ / 180)); m.punta = r1(m.d / 2 / Math.tan(m.ang / 2 * PI_ / 180)); }
export const CEPILLO = { cod: 9039, L: 290, hileras: 5, largoHil: 140, pelo: 25, alambre: .3, ancho: 30, e: 12, penachos: 18 };   // Lessmann 105451

/* ===================================================================================================
 * CAJAS Y ORGANIZADORES
 * =================================================================================================== */
export const CAJAS = {
  c8037: { cod: 8037, L: 330, A: 170, H: 140, bandeja: 45 },            // Jadever JDTB1313 / Wadfow WDFWTB3313: 330 × 170 × 140 · 1 bandeja
  c9013: { cod: 9013, L: 480, A: 250, H: 230, bandeja: 60 },            // AC: «grande» (19") sin medida en el pañol
  c9020: { cod: 9020, L: 380, A: 290, H: 80, divs: [4, 3] },            // AC: 15" ≈ 380
};

/* ===================================================================================================
 * VARIOS
 * =================================================================================================== */
// pistola de silicona (esqueleto): perfil de la empuñadura + gatillo (vista de costado: x hacia la boquilla negativa, z arriba) AC
export const PISTOLA = {
  cuna: { x0: 0, x1: 225, r: 26.5, e: 1.2 },        // cuna semicilíndrica de chapa (AC)
  placa: { x: 225, e: 4 },                           // placa trasera (AC)
  mango: ringR([[226, -20], [262, -24], [272, -150], [262, -164], [246, -160], [240, -40], [226, -36]]),
  gatillo: ringR([[214, -18], [228, -22], [238, -140], [232, -150], [222, -146], [208, -30]]),
  vastago: { r: 3.2, L: 149, x0: 216 }, piston: { r: 22, e: 4 }, ancho: 14,   // vástago hasta 365 (largo Bellota 50262)
};
export const VARIOS = {
  pasa15: { cod: 9023, L: 15000, cinta: [3, 1], carrete: 178, e: 50, punta: 'OJAL' },   // Klein 56001 / Wattmaster: 3 × 1 mm · Ø178 (AC para el del pañol)
  pasa10: { cod: 9024, L: 10000, cinta: [3, 1], carrete: 150, e: 45, punta: 'OJAL' },   // AC: carrete Ø150
  pistola: { cod: 9012, L: 230, cart: { D: 49, L: 215 }, alto: 210, ancho: 55, largoTotal: 365 },        // Bellota 50262: 210 × 365 × 55 (con cartucho) · cartucho AC
  papel: { cod: 9038, A: 36, nucleo: 76, De: 112, largo: 'A CONFIRMAR' },               // AC: 76 núcleo, rollo de 40–50 m
  aaa: { cod: 9004, D: 10.5, L: 44.5, V: 1.5, iec: 'LR03', capas: [['ETIQUETA', 5.25, 5.1], ['VASO DE ACERO (+)', 5.1, 4.85], ['CATODO MnO2', 4.85, 3.25], ['SEPARADOR', 3.25, 3.0], ['ANODO Zn (GEL)', 3.0, .65], ['COLECTOR (-)', .65, 0]], nub: { D: 3.8, h: .8 } },   // capas: AC (pila alcalina típica)                            // IEC 60086 · ficha: Ø9,8–10,5 × 43,5–44,5
  calo: { cod: 9014, P: 2000, P1: 1000, A: 230, B: 170, H: 265 },                       // Cofan 1000/2000 W: 23 × 17 × 26,5 cm (AC)
  electrodo: { cod: 1036, d: 2.5, L: 350, Drev: 4.1, punta: 25, aws: 'E6013', A: [60, 90] },   // Würth E6013 2,5 × 350 · AC: Ø del revestimiento
};
