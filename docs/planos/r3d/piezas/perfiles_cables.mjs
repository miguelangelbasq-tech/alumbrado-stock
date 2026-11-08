/* perfiles_cables.mjs · ÚNICA fuente de la geometría (mm) de los cables, preensamblados, morsetos y morsetería aérea
 * del grupo «cables» (MAT-CABLE_SUBTERRANEO-1/2, MAT-CABLE_ACOMETIDA-1/2/3, MAT-LINEA_AEREA-1/2, MAT-MORSETERIA_AEREA-1/2, MAT-MORSETO-1/2).
 * El plano (Python, perfiles_cables.json) y el 3D (three.js) salen de acá.
 * «AC» = a confirmar (no hay ficha con la medida: proporcional a la referencia). Fuentes: r3d/FUENTES_cables.md */

// ---------- colores de fase AEA 90364-7-771 (y de la vaina) ----------
export const COL = {
  L1: '#6e3b1d', L2: '#202124', L3: '#c8302c', N: '#2f86c9', PE: '#2f9a3e', PEy: '#f2c418', GR: '#9aa0a6',
  vaina: '#1d1e21', xlpeNegro: '#232427', relleno: '#b9bcbf', cinta: '#e8e4d8',
};

// ---------- conductores: posición de los alambres (IEC 60228) ----------
/** cuerda clase 2 (redonda, no compactada): 1 + 6 + 12 + 18 … alambres. Devuelve {rw, R, hilos:[[r, ang]]} */
export function clase2(S, n = 7) {
  const capas = n === 7 ? 1 : n === 19 ? 2 : n === 37 ? 3 : 1;
  const rw = Math.sqrt(S / (n * Math.PI));
  const hilos = [[0, 0]];
  for (let k = 1; k <= capas; k++) { const m = 6 * k; for (let i = 0; i < m; i++) hilos.push([2 * k * rw, 360 * i / m + (k % 2 ? 0 : 15)]); }
  return { rw, R: (2 * capas + 1) * rw, hilos, n: hilos.length, clase: 2 };
}
/** cuerda clase 5 (flexible, alambres finos de Ø dmax): anillos concéntricos que llenan el radio R. AC: cantidad real según fabricante */
export function clase5(S, dmax) {
  const rw = dmax / 2; const R0 = Math.sqrt(S / Math.PI) * 1.08;  // factor de llenado AC
  const K = Math.max(1, Math.round((R0 / rw - 1) / 2));
  const hilos = [[0, 0]];
  for (let k = 1; k <= K; k++) { const m = Math.floor(2 * Math.PI * k); for (let i = 0; i < m; i++) hilos.push([2 * k * rw, 360 * i / m + k * 7]); }
  return { rw, R: (2 * K + 1) * rw, hilos, n: hilos.length, clase: 5 };
}

/** arma un cable multipolar: conds = [{f: 'L1'.., S, n|cl5}], e = aislación, ev = vaina, D = Ø exterior (ficha) o null */
function multipolar(o) {
  const conds = o.conds.map(c => {
    const cu = c.cl5 ? clase5(c.S, c.cl5) : clase2(c.S, c.n || 7);
    const e = c.e !== undefined ? c.e : o.e;
    return { ...c, ...cu, e, rc: cu.R + e };
  });
  const n = conds.length, rc = Math.max(...conds.map(c => c.rc));
  const d = n === 1 ? 0 : n === 2 ? rc : rc / Math.sin(Math.PI / n);
  const a0 = o.a0 !== undefined ? o.a0 : (n === 4 ? 45 : n === 3 ? 90 : 0);
  conds.forEach((c, i) => {
    const ang = (a0 + 360 * i / n) * Math.PI / 180;
    const dd = n > 1 ? d - (rc - c.rc) * (o.acercar ? 1 : 0) : 0;
    c.y = dd * Math.cos(ang); c.z = dd * Math.sin(ang);
  });
  const Rlay = n === 1 ? rc : d + rc;
  const Ro = o.D ? o.D / 2 : Rlay + (o.relleno ? .5 : 0) + o.ev;
  return { ...o, conds, n, d, Rlay, Ri: Ro - o.ev, Ro, D: 2 * Ro };
}

// =============== CABLES Cu XLPE + vaina PVC (IRAM 2178-1) ===============
// Ø exterior, aislación 0,7 y vaina 1,8: ficha de la app (Prysmian Retenax Valio). 3 × 1,5: aislación 0,7 · vaina 1,8 · Ø10 (Prysmian 2020).
// Cuerda clase 2 de 7 alambres: mínimo de IEC 60228 para cuerda redonda no compactada (AC: la cantidad real la da el fabricante).
const F4 = ['L1', 'L2', 'L3', 'N'];
const tetra = (S, D, e = .7) => multipolar({ conds: F4.map(f => ({ f, S })), e, ev: 1.8, D, relleno: true, norma: 'IRAM 2178-1' });
export const CAB = {
  c4x2_5: { ...tetra(2.5, 12), cod: 1009, txt: '4 x 2,5', marca: 'IRAM 2178-1  0,6/1,1 kV  Cu XLPE  4x2,5 mm²  (*)' },
  c4x4: { ...tetra(4, 13.5), cod: 1010, txt: '4 x 4' },
  c4x6: { ...tetra(6, 14.5), cod: 1011, txt: '4 x 6' },
  c4x10: { ...tetra(10, 17), cod: 1007, txt: '4 x 10' },
  c4x16: { ...tetra(16, 20), cod: 1008, txt: '4 x 16' },
  c3x1_5: { ...multipolar({ conds: ['L1', 'L2', 'N'].map(f => ({ f, S: 1.5 })), e: .7, ev: 1.8, D: 10, relleno: true }), cod: 6001, txt: '3 x 1,5' },
  // 3 × 25 + 1 × 16 (1006 / 1021): Ø 25,5 de la ficha. Aislación 0,9 (25) y 0,7 (16) = IEC 60502-1 (AC). Conductores redondos (en la realidad suelen ser sectoriales: AC)
  c3x25_16: { ...multipolar({ conds: [{ f: 'L1', S: 25, e: .9 }, { f: 'L2', S: 25, e: .9 }, { f: 'L3', S: 25, e: .9 }, { f: 'N', S: 16, e: .7 }], ev: 1.8, D: 25.5, relleno: true, acercar: true }), cod: 1006, txt: '3 x 25 + 1 x 16' },
  // otras formaciones (sheet 2): sin ficha → aislación 0,7 y vaina 1,8 como la 2178-1 (AC)
  c2x4: { ...multipolar({ conds: [{ f: 'L1', S: 4 }, { f: 'N', S: 4 }], e: .7, ev: 1.8, relleno: true, a0: 0 }), cod: 1018, txt: '2 x 4' },
  c3x2_5: { ...multipolar({ conds: ['L1', 'L2', 'N'].map(f => ({ f, S: 2.5 })), e: .7, ev: 1.8, relleno: true }), cod: 1020, txt: '3 x 2,5' },
  c2x1_5T: { ...multipolar({ conds: [{ f: 'L1', S: 1.5 }, { f: 'N', S: 1.5 }, { f: 'PE', S: 1.5 }], e: .7, ev: 1.8, relleno: true }), cod: 1022, txt: '2 x 1,5 + T' },
  // 1005 acometida flexible 1 × 4 XLPE: cuerda clase 5 (alambres Ø ≤ 0,31: AC) + XLPE 0,7 + vaina 1,4 (AC)
  c1x4f: { ...multipolar({ conds: [{ f: 'L2', S: 4, cl5: .31 }], e: .7, ev: 1.4 }), cod: 1005, txt: '1 x 4 flexible' },

  // =============== bajada Cu 4 × 16 (AP-T-019 ref. 12) ===============
  // 1027 autoportante IRAM 2164 / 1028 XLPE-LSZH IRAM 62266: Ø y espesores NO están en la ficha → aislación 0,7 y vaina 1,8 (AC)
  c4x16b: { ...multipolar({ conds: F4.map(f => ({ f, S: 16 })), e: .7, ev: 1.8, relleno: true }), cod: 1027, txt: '4 x 16' },

  // =============== unipolares IRAM NM 247-3 (Superastic Jet): Ø y aislación de la ficha; cuerda clase 5 ===============
  u6n: { ...multipolar({ conds: [{ f: 'L2', S: 6, cl5: .31 }], e: .8, ev: 0, D: 4.7 }), cod: 1031, txt: '1 x 6 negro' },
  u6c: { ...multipolar({ conds: [{ f: 'N', S: 6, cl5: .31 }], e: .8, ev: 0, D: 4.7 }), cod: 1030, txt: '1 x 6 celeste' },
  u10v: { ...multipolar({ conds: [{ f: 'PE', S: 10, cl5: .41 }], e: 1.0, ev: 0, D: 6.0 }), cod: 7010, txt: '1 x 10 verde-amarillo' },

  // =============== piloto Al-Al 1 × 25 XLPE (1501): Ø 9,5 · conductor 5,8 · 7 alambres (ficha) · Cu 1 × 4 XLPE (1504): AC ===============
  p1x25: { ...multipolar({ conds: [{ f: 'XN', S: 25 }], e: (9.5 - 5.8) / 2, ev: 0, D: 9.5 }), cod: 1501, txt: 'Al-Al 1 x 25', al: true },
  p1x4: { ...multipolar({ conds: [{ f: 'XN', S: 4 }], e: 1.0, ev: 0 }), cod: 1504, txt: 'Cu 1 x 4' },
};
// el piloto: el conductor de la ficha es Ø 5,8 → ajusto el alambre (7 alambres de Ø 1,93)
{ const c = CAB.p1x25.conds[0]; const k = 2.9 / c.R; c.rw *= k; c.R = 2.9; c.hilos = c.hilos.map(([r, a]) => [r * k, a]); c.rc = 4.75; }

// =============== preensamblado (IRAM 2263) ===============
/** haz: fases retorcidas alrededor del neutro (portante) o entre sí. paso = paso de cableado (AC) */
function haz(o) {
  const fases = o.fases.map(f => { const cu = clase2(f.S, f.n || 7); const e = f.De ? f.De / 2 - cu.R : f.e; return { ...f, ...cu, e, rc: cu.R + e }; });
  const neu = o.neutro ? (() => { const cu = clase2(o.neutro.S, o.neutro.n || 7); const e = o.neutro.De ? o.neutro.De / 2 - cu.R : o.neutro.e; return { ...o.neutro, ...cu, e, rc: cu.R + e }; })() : null;
  let d;
  if (neu) d = neu.rc + fases[0].rc;                      // fases apoyadas sobre el neutro
  else d = fases[0].rc / Math.sin(Math.PI / fases.length);
  const Dh = 2 * (d + fases[0].rc);
  return { ...o, fases, neu, d, Dh };
}
export const HAZ = {
  // 1016 3 × 1 × 25/50: fase Al 25 Ø9, neutro portante Al-aleación 50 Ø12,5, haz ≈ 26, 82 A, 515 kg/km (ficha)
  h25_50: haz({ fases: [{ f: '1', S: 25, De: 9 }, { f: '2', S: 25, De: 9 }, { f: '3', S: 25, De: 9 }], neutro: { f: 'N', S: 50, De: 12.5 }, paso: 420, cod: 1016, DhFicha: 26 }),
  // 1503 3 × 25 + 1 × 16 sin portante: aislación 1,4 (25) / 1,2 (16) AC; ficha: haz ≈ 32 (orientativo)
  h3x25_16: haz({ fases: [{ f: '1', S: 25, e: 1.4 }, { f: '2', S: 25, e: 1.4 }, { f: '3', S: 25, e: 1.4 }, { f: 'N', S: 16, e: 1.2 }], paso: 450, cod: 1503, DhFicha: 32 }),
  // 1502 2 × 16: aislación 1,2 AC
  h2x16: haz({ fases: [{ f: '1', S: 16, e: 1.2 }, { f: 'N', S: 16, e: 1.2 }], paso: 350, cod: 1502 }),
};

// =============== antihurto concéntrico (1002 2,5/2,5 · 1003 4/4): fase al centro, neutro concéntrico de alambres, cinta, vaina (AC) ===============
export const ANTI = (() => {
  const cu = clase2(4, 7); const e = .8; const r1 = cu.R + e;      // fase 4 mm² + XLPE (AC)
  const nAl = 20, dAl = 2 * Math.sqrt(4 / (nAl * Math.PI));          // 20 alambres que suman 4 mm² (AC)
  const r2 = r1 + dAl, rc = r2 + .1, Ro = rc + 1.2;                  // cinta 0,1 · vaina 1,2 (AC)
  return { cod: 1003, fase: { ...cu, e, rc: r1 }, nAl, rwN: dAl / 2, rN: r1 + dAl / 2, rCinta: rc, Ro, D: 2 * Ro };
})();

// =============== morseto de perforación de aislación (LCT PKD-14 / PKD-16 · Metal-CE 1995/x) ===============
// Medidas del cuerpo NO publicadas: proporcionales a conectores IPC de catálogo (AC). Bulón M8, cabeza fusible de 13 mm (LCT / Sicame TTD).
export const MORS = {
  PKD14: { L: 40, H: 52, D: 30, gap: 1.5, zP: 13, rP: 9.2, zD: -14, rD: 5.6, bulon: { M: 8, z: 0, cab: 13, k: 6.5, cuello: 3, tuerca: 13 },
    dientes: { x: [-9, -3, 3, 9], h: 2.2, paso: 1.8 }, capuchon: { L: 14, r: 6.4 }, rango: ['10–95 mm²', '1,5–10 mm²'], torque: '≈ 8 N·m' },
  PKD16: { L: 44, H: 60, D: 32, gap: 1.5, zP: 15, rP: 9.2, zD: -15, rD: 9.2, bulon: { M: 8, z: 0, cab: 13, k: 6.5, cuello: 3, tuerca: 13 },
    dientes: { x: [-10, -4, 4, 10], h: 2.2, paso: 1.8 }, capuchon: null, rango: ['25–95 mm²', '25–95 mm²'], torque: '10 N·m' },
};

// =============== morsetería aérea (AC: proporcional a catálogos de grampas IPC/ABC) ===============
export const AER = {
  poste: { R: 95 },                       // poste H°A° Ø 190 en la altura de la ménsula (AC)
  fleje: { a: 19, e: .7 },                // fleje inox 3/4" (19 mm) × 0,7 (AC)
  mensS: { L: 120, a: 40, h: 70 },        // ménsula de suspensión
  grampaS: { L: 70, h: 34, a: 30 },       // grampa de suspensión (cuna para el neutro 25–95)
  mensR: { L: 70, a: 46, h: 90 },         // ménsula de retención
  grampaR: { L: 200, a: 32, h: 30 },      // grampa de retención de cuña (cuerpo + 2 cuñas + fiador)
  cola: 1500,
};
// herrajes MN (H°G°). Tirafondo 12,7 × 101,6 (pliego 15.63); lo demás AC
export const MN = {
  bulonOjo: { M: 12.7, L: 250, ojoRi: 13, ojoRe: 23, tuerca: 19 },
  ojal: { M: 12, L: 110, ojoRi: 12, ojoRe: 20 },
  tirafondo: { d: 12.7, L: 101.6, cab: 19, k: 8 },
  arandela: { a: 50, e: 5, agujero: 14 },
  aislador: { H: 76, Dmax: 76, Dcuello: 52, agujero: 20 },   // carretel MN 16 (AC)
  rack: { a: 60, e: 5, Hporta: 110 },
};

// unipolares con Ø de ficha: el conductor = Ø/2 − aislación (escalo los alambres)
function ajustar(c, R) { const k = R / c.R; c.rw *= k; c.R = R; c.hilos = c.hilos.map(([r, a]) => [r * k, a]); c.rc = c.R + c.e; }
for (const k of ['u6n', 'u6c', 'u10v']) { const C = CAB[k]; ajustar(C.conds[0], C.Ro - C.conds[0].e); }
