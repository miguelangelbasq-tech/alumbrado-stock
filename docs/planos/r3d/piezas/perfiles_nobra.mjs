/* perfiles_nobra · geometría (mm) de los productos nuevos del pañol (altas del equipo, respaldo/nuevos.csv), grupo «nobra».
 * ÚNICA fuente de números para el plano (perfiles_nobra.json → hojas/mat/nobrakit.py) y para el 3D (escenas/nobra_*.mjs).
 * «AC» = a confirmar (proporcional a una referencia; ver r3d/FUENTES_nobra.md). */

/* ---------- precintos (4042–4046, 1040) ----------
 * Medidas L × w de la descripción del pañol. Espesor, cabeza y dentado: proporcionales a HellermannTyton T50R (200 × 4,6, 225 N)
 * y T18R (100 × 2,5, 80 N, mazo ≤ 22 mm). AC. */
export const PRECN = [
  { cod: 4046, L: 100, w: 2.5, t: .95, cab: [5.2, 4.2, 4.4], mat: 'NYLON', ref: 'T18R 100 × 2,5 · 80 N', mazo: 22 },
  { cod: 4043, L: 200, w: 4.5, t: 1.25, cab: [8.2, 6.0, 7.0], mat: 'NYLON', ref: 'T50R 200 × 4,6 · 225 N', mazo: 50 },
  { cod: 1040, L: 200, w: 4.5, t: 1.25, cab: [8.2, 6.0, 7.0], mat: 'NYLON', ref: 'IGUAL A 4043', mazo: 50, baja: true },
  { cod: 4044, L: 200, w: 4.6, t: 1.25, cab: [8.2, 6.0, 7.1], mat: 'POLIAMIDA', ref: 'T50R 200 × 4,6 · 225 N', mazo: 50 },
  { cod: 4042, L: 202, w: 4.6, t: 1.25, cab: [8.2, 6.0, 7.1], mat: 'NYLON', ref: '≈ T50R', mazo: 50 },
  { cod: 4045, L: 250, w: 4.8, t: 1.3, cab: [8.6, 6.2, 7.4], mat: 'NYLON', ref: '≈ T50 (250)', mazo: 65 },
];
export const DIENTE = { h: .45, paso: 1.1, tipLargo: 14, tipW: .55 };   // dentado y punta afinada (fracción de w): AC

/* ---------- cinta autosoldable Scotch 43+ 19 mm × 5 m (4041) ----------
 * 19 × 5 m: pañol. Espesor de referencia 0,76 mm = Scotch 23 (otra cinta de goma autosoldable de 3M, mismo uso): AC.
 * Ø del rollo calculado: De = √(Di² + 4·L·e/π). Núcleo Ø38: AC. Se aplica estirada (≈ 3/4 del ancho) con 50 % de solape. */
const _e = .76, _Di = 38, _L = 5000;
export const CINTA43 = { w: 19, L: _L, e: _e, Di: _Di, De: +Math.sqrt(_Di * _Di + 4 * _L * _e / Math.PI).toFixed(1), liner: .05, solape: .5, estira: .75, V: 1000 };

/* ---------- herrajes nuevos (mat_herrajes_4) ----------
 * Bulones 1/2": rosca W 1/2" (12,7) como los de MAT-HERRAJES-3 (BUL.w12, perfiles_pat). Largos: descripción del pañol. Resto AC.
 * 4048 «12 × 90 NO4 76 mm»: se lee 12 × 90 con 76 mm de rosca (AC). 4056 «C. RED 12 MM X 1»: cabeza redonda (de carrocero, cuello cuadrado) 12 × 1" (AC).
 * 4058 / 4059 «prisionero 3 / 4 cm»: tornillo prisionero (sin cabeza o cabeza chica) que traba la espiga del collar (AC). */
export const BULN = {
  b4048: { d: 12.7, L: 90, Lr: 76, af: 20.8, k: 8.5, tipo: 'hex' },
  b4051: { d: 12.7, L: 250, Lr: 60, af: 20.8, k: 8.5, tipo: 'hex' },
  b4056: { d: 12.7, L: 25.4, Lr: 25.4, dk: 28, k: 6.5, cuello: 6.5, tipo: 'carrocero' },
  b4058: { d: 10, L: 30, Lr: 30, af: 17, k: 6.5, tipo: 'prisionero' },
  b4059: { d: 10, L: 40, Lr: 40, af: 17, k: 6.5, tipo: 'prisionero' },
  tuerca: { af: 20.8, e: 11 },
};
/* collar con espiga móvil Ø240 / 260 / 300 / 350 (4052–4055): Ø interior del pañol (= Ø del poste de H°A° donde va).
 * Dos medias de planchuela (como las abrazaderas H°G° de MAT-HERRAJES-1: 4,76 × 31,7 de referencia), orejas con 2 bulones 1/2",
 * y una espiga Ø16 que gira en un buje soldado a la media de adelante y se traba con el prisionero (4058 / 4059). Todo AC. */
export const COLLAR = { e: 4.76, a: 38, oreja: 40, luz: 8, agujero: 14, tipos: { 4052: 240, 4053: 260, 4054: 300, 4055: 350 },
  buje: { De: 34, Di: 17, L: 50, sale: 32 }, espiga: { d: 16, L: 190, rosca: 60 }, prisionero: 'M10 (*)' };
/* perno para aislador cerámico MN 16 (4057): pasa por el agujero Ø20 del carretel MN 16 (MN.aislador, perfiles_cables: H 76, Ø76).
 * Ø16 (5/8") × 150 con tuerca y arandela: AC. */
export const PERNO16 = { d: 16, L: 150, Lr: 50, af: 24, k: 10, tuerca: { af: 24, e: 13 }, arandela: { de: 34, e: 3 } };
export const MN16 = { H: 76, D: 76, Dc: 52, agujero: 20 };   // = MN.aislador (perfiles_cables, AC)

/* ---------- caño rígido HDX Ø25 (5038–5042) ----------
 * Ø ext. 25 y tira de 3 m: pañol. Pared 1,8 / Ø int. 21,4 = Legrand 651425 (caño rígido 25 mm, 3 m): referencia, AC para HDX.
 * Conector, grampa y caja de paso 90 × 90 × 75 (pañol): formas AC. Caja cuadrada de superficie: SIN MEDIDAS en la descripción → 100 × 100 × 55 (*). */
export const HDX = {
  cano: { De: 25, e: 1.8, L: 3000, color: '#8e9499' },
  conector: { L: 34, Dcuerpo: 31, rosca: 'PG 21 / 3/4" (*)', Drosca: 28.3, Lrosca: 12, tuercaAF: 36, tuercaE: 6, tope: 18 },
  grampa: { a: 14, e: 2.2, base: [46, 14], agujero: 4.5, alto: 31 },
  caja: { W: 90, H: 90, P: 75, pared: 2.5, tapa: 5, conos: 4, Dcono: 25 },
  cajaSup: { W: 100, H: 100, P: 55, pared: 2.2, tapa: 4 },
};

/* ---------- cable canal perforado 40 × 60 gris Zoloda (5035) ----------
 * 40 × 60 (pañol, sin decir ancho × alto): se dibuja ANCHO 40 × ALTO 60 (Vitel: «40 × 60 (ancho × alto)»; Hager B7A40060). AC.
 * Pared, ranuras, dedos y agujeros del fondo: proporcionales al canal 40 × 30 (CANAL, perfiles_conex). Tiras de 2 m (Hager / Vitel). */
export const CANAL60 = { W: 40, H: 60, pared: 1.8, fondo: 2.0, ranura: 5.0, dedo: 7.0, alturaRanura: 46, tira: 2000,
  agujero: { L: 12, A: 5.2, paso: 50 }, tapa: { e: 1.5, labio: 4.4, gancho: 1.0 }, color: '#8f969a', colorTapa: '#9aa1a5' };

/* ---------- fundación de columna PRFV 7 m (AP-TC-003-A): lo que entra en el pozo ----------
 * App FUNDACIONES.PRFV[7]: pozo 0,60 × 0,60 × 1,20, vol. 0,403 m³ (a confirmar contra 0,4057); LE (empotramiento) 1,00 (AP-C-033-A);
 * Ø de base 197; molde = Ø base + 50 → 247 (comercial Ø250); telgopor 150 × 176 × 650 con el borde abajo a 350 del fondo (TELG, civil);
 * desagüe PVC Ø25,4 en el fondo; arena fina seca hasta −50 y sello de 50; elastómero en los vacíos (pliego, Instalación de columnas 2.4).
 * H-13 1 : 2,5 : 4 · 5,2 bolsas · 0,55 m³ arena · 0,80 m³ piedra · 170 L de agua por m³ (CLAUDE.md §11.3). */
export const FUND = { a: 600, t: 1200, LE: 1000, vol: .403, Dposte: 197, Dmolde: 247, Dcom: 250, eMolde: 3.2,
  telg: { a: 150, b: 176, h: 650, z0: 350 }, desague: { D: 25.4, e: 1.5 }, arena: 50, sello: 50, piso: 0,
  h13: { bolsas: 5.2, arena: .55, piedra: .80, agua: 170 } };
export const BOLSA50 = { L: 760, A: 480, H: 140, kg: 50 };        // AC (BOLSA.c50 del grupo civil)
export const BALDE = { D1: 300, D0: 260, H: 330, L: 20 };          // balde de 20 L para medir el agua: AC
export const CARTU = { D: 50, L: 215, pico: 90, vol: 300 };        // elastómero en cartucho: AC (8043 dice «Un.»)

/* ---------- señalización (1035, 1052, 8038) ----------
 * 1035 malla de seguridad vial naranja 1 × 45 m (pañol). Malla de PEAD con aberturas ovaladas ≈ 90 × 40 (AC, típica de obra).
 * 1052 malla subterránea «Peligro eléctrico» 15 cm (pañol; Maintec la hace en 15 y 30 cm, rollo 100 m: FUENTES_civil). Rombo como la 8017.
 * 8038 cinta de peligro 100 m: ancho 75 mm, PE, franjas a 45° (AC: no dice ancho ni color). */
export const MVIAL = { ancho: 1000, L: 45000, ojo: [90, 40], hilo: 6, rollo: { Rin: 25, Rext: 110 } };
export const MALLA15 = { ancho: 150, rombo: [22, 18], hilo: 2.2, rollo: { L: 100000, Rin: 40, Rext: 120 }, leyenda: 'PELIGRO ELECTRICO' };
export const CINTAP = { ancho: 75, L: 100000, e: .05, franja: 50, rollo: { Rin: 20, Rext: 60 } };
export const ZANJA = { prof: 750, malla: 300, ancho: 400 };        // AP-TC-001: excavar 0,75 · malla a 0,30 (CLAUDE.md §11.3)

/* ---------- luminarias nuevas (6025, 6026, 6028), proyector (6030) y shorting cup (6029) ----------
 * Strand 100 W (barrios / plazas): no hay ficha del modelo; se dibuja con la carcasa Strand RS 160 de MAT-LUMINARIA_LED-1 (LUM, perfiles_col: 575 × 312 × 93).
 * Quisur 75 W: sin ficha → misma familia, escalada (AC). Proyector Bael Pointer Plus 100 L90: cuerpo de aluminio inyectado con aletas y lira (AC; Pointer Pro: aluminio, IP65).
 * Shorting cup: tapa ANSI C136.10 que puentea LÍNEA → CARGA en el zócalo NEMA cuando no hay fotocontrol (TE ALR-MC-10 ANSI: Ø73 × 35,6). */
export const PROY = { W: 300, H: 240, P: 62, aletas: 11, alet: 1.8, vidrio: [250, 190], lira: { a: 30, e: 5, sep: 340 }, kg: 3.2 };
export const SCUP = { D: 73, H: 35.6, rPatas: 15.5, puente: { e: 1.2, a: 6 } };
export const QUISUR = { k: .82 };   // escala de la carcasa respecto de la RS 160 (AC)
