/* perfiles_nepp.mjs · geometría ÚNICA (mm) del grupo «nepp»: EPP (guantes, alfombra, anteojo, tapones, equipo de altura)
 * e instrumentos (pinza amperométrica, detector por inducción, probador UT15C, busca polo).
 * El plano (hojas/mat/mat_epp_*.py, mat_instrumentos_*.py vía perfiles_nepp.json) y el 3D (piezas/nepp.mjs) salen de estos números.
 * «AC» = a confirmar (proporcional a una referencia). Fuentes: r3d/FUENTES_nepp.md. */

const rad = (g) => g * Math.PI / 180;

/* ---------------- MANO (guante sin puño) ----------------
 * plano del guante: u = ancho (+u = lado del pulgar), v = largo (v = 0 en la muñeca, + hacia los dedos). Vista de la PALMA, mano derecha.
 * Largo muñeca → punta del medio 190 (AC, talle 10) · ancho de palma 100 (AC). Dedos = cápsulas (segmento + punta redonda). */
export const MANO = {
  palma: { u0: -50, u1: 50, v0: -8, v1: 100, r: 20, t: 28 },          // t = espesor de la mano (3D, AC)
  v0d: 92,                                                              // base de los dedos
  dedos: [
    { n: 'MENIQUE', u: -37.5, w: 19, L: 74, a: -7 },
    { n: 'ANULAR', u: -14, w: 22, L: 94, a: -2.5 },
    { n: 'MEDIO', u: 10, w: 23, L: 98, a: 0 },
    { n: 'INDICE', u: 34, w: 22, L: 88, a: 4 },
  ],
  pulgar: { u: 38, v: 18, w: 27, L: 92, a: 40 },
  kz: .74,                                                              // achatado de los dedos (alto / ancho), AC
};
/* puños: v0 = largo del puño hacia atrás (negativo), wA = ancho (plano) en la boca, wB = en la muñeca. kz = achatado (alto/ancho) */
export const PUNOS = {
  dielectrico: { v0: -170, wA: 150, wB: 98, kz: .34, borde: 'enrollado' },   // borde enrollado (IEC 60903, AC su medida)
  tejido: { v0: -62, wA: 86, wB: 88, kz: .42, borde: 'elastico' },            // puño elastizado de punto
  vaqueta: { v0: -78, wA: 116, wB: 100, kz: .36, borde: 'dobladillo' },        // puño corto de seguridad
  cobertor: { v0: -125, wA: 146, wB: 106, kz: .34, borde: 'dobladillo' },      // protector de cuero: más corto que el de goma (ASTM F496)
  descarne: { v0: -150, wA: 176, wB: 104, kz: .32, borde: 'dobladillo' },      // puño largo tipo «mosquetero»
};
/* cada guante del pañol: puño, escala (talle), color/acabado */
export const GUANTES = {
  g9010: { puno: 'dielectrico', s: 1.00, L: 360, e: 1.0 },   // dieléctrico clase 0: largo 360 (comercial), espesor ≈ 1 mm (AC)
  g9009: { puno: 'tejido', s: .965, e: 1.2 },                // interior de algodón
  g9017: { puno: 'vaqueta', s: 1.07, e: 1.4 },               // vaqueta
  g3096: { puno: 'cobertor', s: 1.075, e: 1.4 },             // cobertor de vaqueta amarillo
  g9007: { puno: 'tejido', s: 1.0, e: 1.2 },                 // tejido con palma de nitrilo
  g9008: { puno: 'tejido', s: 1.0, e: 1.2 },                 // tejido moteado
  g9011: { puno: 'descarne', s: 1.06, e: 1.6 },              // descarne
};
export const SOBRESALE = 13;   // ASTM F496: el puño de goma clase 0 sobresale al menos 13 mm (1/2") del protector de cuero

/** cápsula (segmento p0→p1, radio r) como polígono */
export function capsula(p0, p1, r, n = 14) {
  const [x0, y0] = p0, [x1, y1] = p1; const a = Math.atan2(y1 - y0, x1 - x0); const pts = [];
  for (let i = 0; i <= n; i++) { const t = a - Math.PI / 2 + Math.PI * i / n; pts.push([x1 + r * Math.cos(t), y1 + r * Math.sin(t)]); }
  for (let i = 0; i <= n; i++) { const t = a + Math.PI / 2 + Math.PI * i / n; pts.push([x0 + r * Math.cos(t), y0 + r * Math.sin(t)]); }
  return pts;
}
export function rectR(u0, u1, v0, v1, r, n = 6) {
  const p = []; const c = [[u1 - r, v1 - r, 0], [u0 + r, v1 - r, 90], [u0 + r, v0 + r, 180], [u1 - r, v0 + r, 270]];
  for (const [cx, cy, a0] of c) for (let i = 0; i <= n; i++) { const t = rad(a0 + 90 * i / n); p.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]); }
  return p;
}
/** ejes de los dedos (en la escala s): [{p0, p1, r, n}] — p1 = centro de la punta redonda */
export function dedosDe(s = 1) {
  const M = MANO, out = [];
  for (const d of M.dedos) {
    const dir = [Math.sin(rad(d.a)), Math.cos(rad(d.a))], r = d.w / 2;
    const p0 = [d.u, M.v0d - 6]; const p1 = [d.u + dir[0] * (d.L - r + 6), M.v0d - 6 + dir[1] * (d.L - r + 6)];
    out.push({ n: d.n, p0: p0.map(x => x * s), p1: p1.map(x => x * s), r: r * s });
  }
  const P = M.pulgar, dir = [Math.sin(rad(P.a)), Math.cos(rad(P.a))], r = P.w / 2;
  out.push({ n: 'PULGAR', p0: [P.u * s, P.v * s], p1: [(P.u + dir[0] * (P.L - r)) * s, (P.v + dir[1] * (P.L - r)) * s], r: r * s });
  return out;
}
/** piezas 2D del guante (para la unión del contorno en exportar_nepp.mjs) */
export function piezasGuante(key) {
  const G = GUANTES[key], s = G.s, P = PUNOS[G.puno], M = MANO.palma;
  const L = [rectR(M.u0 * s, M.u1 * s, M.v0 * s, M.v1 * s, M.r * s)];
  for (const d of dedosDe(s)) L.push(capsula(d.p0, d.p1, d.r));
  L.push([[-P.wA / 2, P.v0], [P.wA / 2, P.v0], [P.wB / 2, 6], [-P.wB / 2, 6]]);
  return L;
}

/* ---------------- ALFOMBRA DIELÉCTRICA 3091 (IEC 61111 clase 0) ----------------
 * 1000 × 1000 × 3 (catálogo) · nervaduras longitudinales finas arriba (paso, ancho y alto AC) */
export const ALF = { L: 1000, W: 1000, e: 3, nerv: { paso: 6, ancho: 3, alto: .7 } };

/* ---------------- ANTEOJO 7013 (policarbonato, EN 166 / ANSI Z87.1 / IRAM 3630) ---------------- AC todo el modelo */
export const ANT = {
  ancho: 150, alto: 52, curva: 12,            // ancho frontal, alto del lente, inclinación de cada lente (grados de «envolvente»)
  // contorno del lente derecho visto de frente (u desde el centro de la nariz, v desde el centro), AC
  lente: [[6, 14], [14, 22], [40, 25], [64, 22], [74, 12], [75, -2], [70, -16], [56, -25], [34, -26], [18, -20], [10, -10], [8, 0]],
  puente: { w: 14, h: 10 },
  patilla: { L: 135, h0: 12, h1: 8, t: 4, caida: 18 },   // largo, alto en la bisagra y en la punta, espesor, caída de la punta
  e: 2.2,                                                 // espesor del policarbonato
};

/** contorno suave del lente (Catmull-Rom cerrado sobre los puntos de ANT.lente), lo usan el plano y el 3D */
export function lenteSuave(n = 8) {
  const P = ANT.lente, out = [], N = P.length;
  for (let i = 0; i < N; i++) {
    const p0 = P[(i - 1 + N) % N], p1 = P[i], p2 = P[(i + 1) % N], p3 = P[(i + 2) % N];
    for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map(j => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); }
  }
  return out;
}

/* ---------------- TAPÓN AUDITIVO 3092 (espuma, EN 352-2) ---------------- AC */
export const TAP = { L: 24, D: 12.5, d: 10, cordon: { L: 380, d: 2.2 } };
export const tapPerfil = () => [[0, 0], [TAP.d / 2 * .7, 0], [TAP.d / 2, 1.2], [TAP.D / 2 * .96, TAP.L * .55], [TAP.D / 2, TAP.L - 3], [TAP.D / 2 * .85, TAP.L - .6], [0, TAP.L]];

/* ---------------- EQUIPO DE ALTURA (EN 355 / EN 358 / EN 362, IRAM 3605 / 3622) ---------------- AC salvo largo total 2 m y 6 kN */
export const ALT = {
  Lmax: 2000,                                         // EN 355: largo total máximo con conectores y absorbedor
  cinta: { a: 45, e: 2.2 },                           // cinta plana de poliéster, AC
  cuerda: { d: 12 },                                  // cabo de vida (cuerda trenzada), AC
  absorbedor: { L: 190, a: 52, e: 30 },               // bolsa del absorbedor (cinta desgarrable plegada), AC
  absorbedorExt: 1750,                                // estiramiento máximo del absorbedor (EN 355), AC
  mosq: { L: 110, a: 66, d: 10, apertura: 18 },       // mosquetón de acero con seguro a rosca, AC
  gancho: { L: 245, a: 120, d: 13, apertura: 60 },    // gancho de andamio de aluminio con doble traba, AC
  anilloD: { a: 62, h: 52, d: 9 },                    // anillo D forjado, AC
  cinturon: { L: 1150, a: 80, e: 4, hebilla: 55 },    // cinturón de posicionamiento con 2 anillos D laterales, AC
};
/** gancho de andamio (línea media, en el plano u-v; v = largo): curva en J con la apertura */
export function ganchoLinea(G = ALT.gancho) {
  const r = (G.apertura + G.d) / 2 + 2; const v1 = G.L - r - G.d / 2; const p = [[0, 0], [0, 18]];
  // ojo de la cinta abajo (anillo) → caña recta → curva de la boca → pico
  p.push([0, v1 - 10]);
  for (let i = 0; i <= 14; i++) { const t = Math.PI - Math.PI * i / 14; p.push([r + r * Math.cos(t), v1 + r * Math.sin(t)]); }
  p.push([2 * r, v1 - 22]); p.push([2 * r - 6, v1 - 34]);
  return { pts: p, r, v1 };
}
/** mosquetón: contorno de la línea media (forma D asimétrica), u-v */
export function mosqLinea(M = ALT.mosq) {
  const p = []; const R1 = M.a / 2 - M.d / 2, h = M.L - M.d;
  for (let i = 0; i <= 12; i++) { const t = Math.PI * i / 12; p.push([R1 + R1 * Math.cos(t) * -1 + 0, h - R1 + R1 * Math.sin(t)]); }
  // lado largo (lomo) baja recto, curva de abajo más chica
  const r2 = R1 * .62;
  p.push([0, r2 + 6]);
  for (let i = 0; i <= 8; i++) { const t = Math.PI + Math.PI / 2 * i / 8; p.push([r2 + r2 * Math.cos(t), r2 + r2 * Math.sin(t)]); }
  p.push([2 * R1 - 10, 2]);
  return { pts: p, R1, h };
}

/* ---------------- PINZA AMPEROMÉTRICA 3084 (Pro'sKit MT-3202) ----------------
 * MT-3202: CAT II 600 V, 600 A CA True RMS (manual / vendedor). Medidas de la hermana MT-3209: 190 × 71 × 30, mordaza Ø30 → AC */
export const PINZA = {
  H: 190, W: 71, T: 30, Tm: 18,                      // alto, ancho, espesor del cuerpo y de la mordaza
  mord: { R: 33, r: 15, vc: 155 },                   // mordaza: radio exterior, interior (Ø30 de abertura), centro
  cuello: { v: 116, w: 58 },
  gatillo: { v0: 100, v1: 128, s: 9 },
  lcd: { u0: -24, u1: 24, v0: 66, v1: 100 },
  selector: { v: 40, D: 32 },
  bornes: { v: 8, du: 15, D: 9 },
  guarda: { v: 122, h: 6 },                          // tope de mano (barrera táctil), AC
};
export function pinzaContorno() {
  const P = PINZA, W = P.W / 2, p = [];
  p.push([-W + 8, 0], [W - 8, 0], [W, 8], [W, P.cuello.v - 22], [P.cuello.w / 2, P.cuello.v]);
  // mordaza (lado derecho fijo) hasta arriba: arco exterior
  const c = P.mord.vc, R = P.mord.R;
  const a0 = Math.asin(Math.min(1, (P.cuello.w / 2) / R));
  for (let i = 0; i <= 24; i++) { const t = -Math.PI / 2 + a0 + (Math.PI * 2 - 2 * a0) * i / 24; p.push([R * Math.cos(t) * 1, c + R * Math.sin(t)]); }
  p.push([-P.cuello.w / 2, P.cuello.v], [-W, P.cuello.v - 22], [-W, 8]);
  return p;
}

/* ---------------- DETECTOR DE TENSIÓN POR INDUCCIÓN 3085 (lápiz NCV) ----------------
 * genérico: proporcional al Klein NCVT-2P (148 × 28 × 22) → AC. Perfil de revolución [r, t] (t desde la punta) */
export const NCV = {
  L: 148, D: 22, clip: { L: 52, a: 8 },
  perfil: [[0, 0], [4, .5], [6.5, 3], [8, 14], [9.5, 30], [10.6, 34], [11, 44], [11, 128], [10.4, 144], [8.5, 147.2], [0, 148]],
  punta: 34,              // largo de la punta translúcida (sensor)
  boton: { t: 60, w: 9, L: 16 }, led: { t: 30 },
};

/* ---------------- PROBADOR UNI-T UT15C 3087 ----------------
 * vendedor: 275 × 51 × 30 · 12–690 V CA/CC · CAT IV 600 V · 2 pilas AAA. Forma de los dos cuerpos: AC */
export const UT = {
  L: 275, W: 51, T: 30,
  cuerpo: [[0, 0], [16, 0], [22, 14], [25.5, 40], [25.5, 196], [22, 214], [14, 222], [10, 232], [9, 238], [0, 238]],  // [semiancho, v] cuerpo principal
  punta: { L: 37, d: 4, guard: 7.5 },                 // punta de prueba con capuchón
  lcd: { v0: 120, v1: 168, w: 30 }, leds: { v0: 50, v1: 112, n: 7 },
  sonda: { L: 150, D: 24, cable: 760 },               // segunda sonda y cable en espiral, AC
  escala: ['12', '24', '50', '120', '230', '400', '690'],
};

/* ---------------- BUSCA POLO 9036 (destornillador de prueba con neón) ----------------
 * ref. FERVI 0013/142: 142 mm, 100–500 V, mango aislante con neón → AC el resto */
export const BP = {
  L: 142, hoja: { L: 62, d: 3.5, punta: .6 }, mango: { L: 80, D: 12.5 },
  perfil: [[0, 0], [5.8, 0], [6.25, 3], [6.25, 54], [5.6, 60], [5.2, 72], [6, 76], [6, 80], [0, 80]],   // mango [r, t] desde el cuello
  neon: { t0: 22, t1: 44, d: 6 }, resistencia: { t0: 6, t1: 20, d: 2.6 }, clip: { L: 40 },
};
