/* perfiles_nfin.mjs · grupo «nfin» (códigos que faltaban en las hojas): precinto de tapa 9015, precinto de bornera 9019,
 * silicona neutra negra 9016 / 9022, curva 90° H°G° 3/4" 5503 y hormigón H-15 8501. Única fuente de números: plano y 3D.
 * «AC» = a confirmar (sin ficha del pañol). Fuentes en r3d/FUENTES_nfin.md. */

// ---------- 9015 PRECINTO DE TAPA: precinto de seguridad plástico de cola (pull-tight), numerado ----------
// banda 2,2 × 210 (ref. IMPA 47 «SECURITY SEAL PP PULLTIGHT W2.2 × L210»), bandera ≈ 1" × 1" con número estampado (ref. catálogos pull-tight).
export const PTAPA = {
  cod: 9015, L: 210, w: 2.2, t: 1.6,          // banda: largo útil y ancho (IMPA); espesor AC
  band: [25, 25, 1.6],                        // bandera (ancho × alto × espesor) ≈ 1" × 1": AC
  traba: [9, 8, 6],                           // cuerpo de la traba (x × z × espesor): AC
  dentP: 2.0, dentH: .5,                      // paso y alto de los dientes de la cola: AC
  num: '012345', dig: 6,                      // número correlativo estampado (ejemplo). Cantidad de dígitos AC
  mat: 'POLIPROPILENO (PP)', color: '#d6382b',// color AC (se dibuja rojo)
};
// ---------- 9019 PRECINTO DE BORNERA: precinto de rotor con alambre (twist seal) ----------
// cuerpo de policarbonato transparente de 2 piezas con rotor; alambre de acero inoxidable de 2–4 hilos Ø 0,5–1 (CRE NTCRE 008/07),
// alambre Ø0,7 × 220 (Essentra TwistLock). Cuerpo ≈ 25 × 20 × 15 (listado comercial): AC.
export const PBORN = {
  cod: 9019, D: 24, e: 12,                     // cuerpo redondo Ø × espesor: AC
  rotD: 15, rotE: 4, ala: [16, 5, 3],          // rotor (Ø, saliente) y ala para girar (largo × ancho × alto): AC
  agujD: 2.0, agujSep: 9,                      // 2 pasos para el alambre (Ø y separación): AC
  alD: .7, alL: 220,                           // alambre Ø y largo (Essentra TwistLock 0,7 × 220; CRE: 160)
  num: '01234', dig: 5,                        // CRE: sigla + 5 dígitos correlativos termoestampados
  mat: 'POLICARBONATO TRANSPARENTE', rotor: '#c62828',
};
// ---------- 9016 / 9022 SILICONA NEUTRA NEGRA: cartucho (mismas medidas que CART de perfiles_civil: Ø50 × 215, pico 90; vol. AC) ----------
export const SILN = { cods: [9016, 9022], baja: [9022], color: '#1b1c1e', cordon: 6, junta: [10, 4] };   // cordón Ø6 y junta 10 × 4: AC
// ---------- 5503 CURVA 90° H°G° Ø3/4" ----------
// caño 3/4": Ø ext. 26,9 (CANO.c34 de perfiles_pat, AC) · rosca BSP cónica ISO 7-1 R 3/4: 14 hilos/", 55°, Ø 26,441 en el plano de calibre,
// largo de calibre 9,5 y rosca útil 14,5 (ISO 7-1). Radio de curvado y largo de las patas: AC.
export const CURVA34 = {
  cod: 5503, De: 26.9, e: 2.65, dMaj: 26.441, tpi: 14, paso: 25.4 / 14, ang: 55,
  Lcal: 9.5, Lutil: 14.5, conic: 1 / 16,
  R: 80, pata: 60,                              // radio al eje y tramo recto de cada pata (sin la rosca): AC
};
// ---------- 8501 HORMIGÓN H-15 · fundación de apoyo de H°A° (barrio) ----------
// app: «por apoyo de 8,5 m con hoyo Ø0,60 y 1,45 m de empotramiento ≈ 0,31 m³ + desperdicio» (fuente: EPEC ET 4 + calculadora de barrio)
// apoyo 6023 H°A° Ro 1050: L 8500, emp 1450, Ø cima 210, conicidad 15 mm/m, pared 55 (perfiles_col APO.ha, AC)
export const H15 = { cod: 8501, hoyoD: 600, emp: 1450, vApp: .31, fc: 15, poste: { L: 8500, dc: 210, k: 15, e: 55 }, sobre: 100 }; // sobre = cuánto se ve arriba (dibujo)
