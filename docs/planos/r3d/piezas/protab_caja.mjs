/* protab_caja.mjs · gabinetes y cajas del grupo «protab»: gabinete PRFV con puerta, junta, bisagras, cierres y placa de montaje;
 * caja de aluminio IP65 con tapa y junta; fondos de tablerito; base y fusible NH 00; fotocontrol NEMA y su zócalo; poste y semiabrazaderas.
 * Medidas: perfiles_protab.mjs. Ejes: x ancho, y fondo (el frente mira a +y), z arriba. */
import { GAB, CAJA_AL, NH, FOTO, FONDOS, rect } from './perfiles_protab.mjs';
import { MX, tubo, hexa, prensacable, bandeja, placaRed, puntaCable } from './protab_util.mjs';

/** gabinete de PRFV (o policarbonato): cuerpo, puerta abierta op.abre grados con junta, bisagras y cierres; pies; prensacables abajo.
 *  op: W, H, P, color, abre, placa (true), cables [{x, colores|color, r}], mat (material del cuerpo), puertaMat */
export function gabinete(R, op = {}) {
  const X = MX(R), G = { ...GAB, ...op }, g = R.grupo(op.padre);
  const W = G.W, H = G.H, P = G.P, e = G.pared, r = G.radio, pu = G.puerta;
  const mat = op.mat || X.prfv(op.color || '#cfd2cc');
  bandeja(R, -W / 2, W / 2, 0, P - pu, 0, H, e, r, mat, { padre: g, bisel: 1.5 });
  // borde de apoyo de la junta (labio)
  placaRed(R, -W / 2 + e, W / 2 - e, e, H - e, P - pu - 6, 6, r - e, mat, { padre: g, bisel: .5, huecos: [{ x: 0, z: H / 2, w: W - 2 * e - 6, h: H - 2 * e - 6, rad: 4 }] });
  // puerta (grupo que gira en la bisagra izquierda, x = -W/2)
  const gp = op.puerta === false ? new R.THREE.Group() : R.grupo(g); gp.position.set(-W / 2, P - pu, 0);
  const pm = op.puertaMat || mat;
  placaRed(R, 0, W, 0, H, 0, pu, r, pm, { padre: gp, bisel: 1.5 });
  // nervio perimetral interior de la puerta + junta de goma
  placaRed(R, 5, W - 5, 5, H - 5, -7, 7, r - 4, pm, { padre: gp, bisel: .5, huecos: [{ x: W / 2, z: H / 2, w: W - 20, h: H - 20, rad: 4 }] });
  placaRed(R, 8, W - 8, 8, H - 8, -9.5, 2.6, r - 6, X.junta(), { padre: gp, bisel: .4, huecos: [{ x: W / 2, z: H / 2, w: W - 16 - 2 * G.junta.a, h: H - 16 - 2 * G.junta.a, rad: 3 }] });
  // cierres (inserto doble barra) del lado derecho de la puerta + leva por dentro
  const cierres = [];
  for (const z of G.cierres) {
    const x = W - 34;
    R.torno([x, pu, z], [x, pu + 7, z], [[0, 0], [13, 0], [13, 4], [11.5, 6.5], [0, 7]], X.paNegro(), { padre: gp, seg: 48 });
    R.caja(x - 6.5, x + 6.5, pu + 6.2, pu + 7.6, z - 1.6, z + 1.6, X.galv(), { r: .3, padre: gp });
    R.caja(x - 1.6, x + 1.6, pu + 6.2, pu + 7.6, z - 6.5, z - 1.6, X.galv(), { r: .3, padre: gp });
    R.cil([x, -12, z], [x, 0, z], 6, X.paNegro(), { padre: gp, seg: 32 });
    R.caja(x - 4, x + 24, -16, -12, z - 7, z + 7, X.galv(), { r: 1, padre: gp });
    cierres.push(z);
  }
  // rótulo de riesgo eléctrico en la puerta
  if (op.rotulo !== false) R.impreso([{ t: 'PELIGRO', s: 1 }, 'RIESGO ELECTRICO'], 90, 26, [W / 2, pu + .05, H - 70], [-1, 0, 0], [0, 0, 1], { padre: gp, color: '#1b1c1f', fondo: '#f2c418', ppm: 12 });
  const ab = (op.abre ?? 105) * Math.PI / 180; gp.rotation.z = ab;   // abre hacia afuera (gira alrededor de z)
  // bisagras (nudos alternados cuerpo / puerta)
  for (const z of G.bisagras) {
    for (let k = 0; k < 3; k++) {
      const z0 = z - 27 + k * 18, m = k % 2 ? X.paNegro() : X.paOscuro();
      R.cil([-W / 2 - 4, P - pu, z0], [-W / 2 - 4, P - pu, z0 + 17.5], 6, m, { padre: g, seg: 32 });
    }
    R.caja(-W / 2 - 4, -W / 2 + 2, P - pu - 26, P - pu - 2, z - 27, z + 27, X.paOscuro(), { r: 1, padre: g });
    R.cil([-W / 2 - 4, P - pu, z - 30], [-W / 2 - 4, P - pu, z + 30], 2.2, X.acero(), { padre: g, seg: 16 });
  }
  // pies de fijación atrás (4)
  for (const [sx, z] of [[-1, 30], [1, 30], [-1, H - 30], [1, H - 30]]) {
    const x = sx * (W / 2 + G.pie.l / 2 - 6);
    R.caja(x - G.pie.l / 2, x + G.pie.l / 2, -1, G.pie.e - 1, z - G.pie.a / 2, z + G.pie.a / 2, X.paOscuro(), { r: 2, padre: g });
    R.cil([x + sx * 6, -1.2, z], [x + sx * 6, G.pie.e - .8, z], 4.2, X.oscuro ? R.M.oscuro() : R.M.oscuro(), { padre: g, seg: 20 });
  }
  // placa de montaje (chapa galvanizada) sobre 4 separadores
  if (op.placa !== false) {
    const pl = G.placa;
    R.caja(-pl.W / 2, pl.W / 2, pl.y, pl.y + pl.e, (H - pl.H) / 2, (H + pl.H) / 2, X.galv(), { r: 1.2, padre: g });
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const x = sx * (pl.W / 2 - 15), z = H / 2 + sz * (pl.H / 2 - 15);
      R.cil([x, e, z], [x, pl.y, z], 6, mat, { padre: g, seg: 24 });
      R.tornillo([x, pl.y + pl.e + 2.6, z], [0, 1, 0], { M: 6, L: 4, dk: 10, k: 2.6, tipo: 'pozi', mat: X.galv(), padre: g });
    }
    // bulón de tierra de la placa
    R.cil([pl.W / 2 - 40, pl.y + pl.e, (H - pl.H) / 2 + 30], [pl.W / 2 - 40, pl.y + pl.e + 22, (H - pl.H) / 2 + 30], 4, X.latonNiq(), { padre: g, seg: 20 });
    hexa(R, [pl.W / 2 - 40, pl.y + pl.e + 4, (H - pl.H) / 2 + 30], [pl.W / 2 - 40, pl.y + pl.e + 10, (H - pl.H) / 2 + 30], 13, X.latonNiq(), { padre: g, hueco: 4 });
  }
  // prensacables abajo con sus cables
  for (const c of (op.cables || [])) prensacable(R, [c.x, c.y ?? P / 2, 0], [0, 0, -1], { padre: g, D: c.D || 26, hex: c.hex || 33, alto: c.alto || 34, pared: e, color: c.colorPrensa || '#5b5f66',
    cable: { r: c.r || 7, largo: c.largo || 70, colores: c.colores, vaina: c.vaina || '#25272a', color: c.color, adentro: c.adentro } });
  return { g, gp };
}

/** poste (PRFV gris oscuro o H°A°) y 2 semiabrazaderas que toman el gabinete por la espalda (4003). eje z en (0, yC) */
export function posteSemi(R, yC, Rp, z0, z1, zs, op = {}) {
  const X = MX(R), g = R.grupo(op.padre);
  const pm = op.mat || R.M.pa('#5f6468', { roughness: .45, clearcoat: .3 });
  R.cil([0, yC, z0], [0, yC, z1], Rp, pm, { padre: g, seg: 96 });
  for (const z of zs) {
    // media vuelta de fleje alrededor del poste (lado de atrás) + orejas planas abulonadas a los perfiles del gabinete
    const T = R.THREE, pts = [];
    for (let i = 0; i <= 48; i++) { const a = Math.PI * i / 48; pts.push(new T.Vector2((Rp + 2.5) * Math.cos(a), -(Rp + 2.5) * Math.sin(a))); }
    const s = new T.Shape(); const ext = pts, inn = pts.map(p => new T.Vector2(p.x * (Rp) / (Rp + 2.5), p.y * (Rp) / (Rp + 2.5))).reverse();
    s.moveTo(ext[0].x, ext[0].y); for (const p of ext.slice(1)) s.lineTo(p.x, p.y); for (const p of inn) s.lineTo(p.x, p.y);
    const geo = new T.ExtrudeGeometry(s, { depth: 40, bevelEnabled: false, curveSegments: 1 }); geo.deleteAttribute('uv'); geo.translate(0, 0, z - 20);
    const m = new T.Mesh(geo, X.galv()); m.position.y = yC; m.castShadow = m.receiveShadow = true; g.add(m);
    for (const sx of [-1, 1]) {
      R.caja(sx * Rp - (sx > 0 ? 2.5 : -2.5) * 0 - (sx < 0 ? 2.5 : 0), sx * Rp + (sx > 0 ? 2.5 : 0), yC, op.yGab ?? yC + Rp + 40, z - 20, z + 20, X.galv(), { r: .5, padre: g });
      const xb = sx * (Rp + 1.25);
      R.tornillo([xb + sx * 4, (yC + (op.yGab ?? yC + Rp + 40)) / 2 + 20, z], [sx, 0, 0], { M: 10, L: 6, dk: 17, k: 6, tipo: 'ranura', mat: X.galv(), padre: g });
    }
  }
  return g;
}

/** fusible NH 00 (cartucho): eje x, centrado en (x0, y0, z0) = centro de las cuchillas. op.lineas impreso */
export function fusibleNH(R, x0, y0, z0, op = {}) {
  const X = MX(R), F = NH.fus, g = R.grupo(op.padre);
  const [Lc, Wc, Hc] = F.cuerpo;
  // cuerpo cerámico + tapas metálicas con las orejas de agarre
  R.caja(x0 - Lc / 2, x0 + Lc / 2, y0 - Wc / 2 + 4, y0 + Wc / 2 + 4, z0 - Hc / 2 + 6, z0 + Hc / 2 + 6, R.tipoCorte(R.M.ceramica(), 'ceramica'), { r: 2.2, padre: g });
  for (const s of [-1, 1]) {
    const xa = x0 + s * Lc / 2;
    R.caja(Math.min(xa, xa + s * 4), Math.max(xa, xa + s * 4), y0 - Wc / 2 + 3, y0 + Wc / 2 + 5, z0 - Hc / 2 + 5, z0 + Hc / 2 + 7, X.latonNiq(), { r: .8, padre: g });
    // cuchilla
    R.caja(Math.min(xa + s * 4, xa + s * (4 + F.cuchilla.l)), Math.max(xa + s * 4, xa + s * (4 + F.cuchilla.l)), y0 - F.cuchilla.e / 2, y0 + F.cuchilla.e / 2, z0 - F.cuchilla.a / 2, z0 + F.cuchilla.a / 2, X.latonNiq(), { r: .6, padre: g });
    // oreja de agarre (para la manija extractora)
    R.caja(Math.min(xa, xa + s * 2.5), Math.max(xa, xa + s * 2.5), y0 - 6, y0 + 6, z0 + Hc / 2 + 6, z0 + Hc / 2 + 16, X.latonNiq(), { r: .6, padre: g });
  }
  // indicador
  R.cil([x0, y0 + Wc / 2 + 4, z0 + 12], [x0, y0 + Wc / 2 + 4.6, z0 + 12], 3, R.M.pa('#d63a2f'), { padre: g, seg: 24 });
  if (op.lineas) R.impreso(op.lineas, Lc - 6, 20, [x0, y0 + Wc / 2 + 4.03, z0], [-1, 0, 0], [0, 0, 1], { padre: g, color: '#1b2a6b', ppm: 20 });
  return g;
}

/** base portafusible NH 00 unipolar (3055 / 3503): cuerpo, 2 pinzas a resorte, bornes con bulón M8. eje x. (x0, y0) = centro, z0 = cara de apoyo */
export function baseNH(R, x0, y0, z0, op = {}) {
  const X = MX(R), Bs = NH.base, g = R.grupo(op.padre);
  const pa = R.M.pa(op.color || '#3a3e45', { roughness: .5 });
  const L = Bs.L, W = Bs.W;
  R.caja(x0 - L / 2, x0 + L / 2, y0 - W / 2, y0 + W / 2, z0, z0 + 8, pa, { r: 1.5, padre: g });
  for (const s of [-1, 1]) {
    const xc = x0 + s * NH.pinzas;
    R.caja(xc - 11, xc + 11, y0 - W / 2, y0 + W / 2, z0 + 8, z0 + 30, pa, { r: 2, padre: g });                 // torre de la pinza
    // pinza (dos láminas a resorte de cobre) + resorte de acero
    for (const sy of [-1, 1]) R.caja(xc - 8, xc + 8, y0 + sy * 3.4 - .9, y0 + sy * 3.4 + .9, z0 + 30, z0 + Bs.H - 14, X.cobreEst(), { r: .3, padre: g });
    R.caja(xc - 9, xc + 9, y0 - 6, y0 + 6, z0 + 34, z0 + 37, X.acero(), { r: .5, padre: g });
    // borne: placa + bulón M8 con tuerca y arandela
    const xb = x0 + s * (L / 2 - 12);
    R.caja(xb - 9, xb + 9, y0 - 9, y0 + 9, z0 + 8, z0 + 11, X.cobreEst(), { r: .4, padre: g });
    R.cil([xb, y0, z0 + 8], [xb, y0, z0 + 28], 4, X.galv(), { padre: g, seg: 20 });
    R.cil([xb, y0, z0 + 11], [xb, y0, z0 + 12.5], 8, X.galv(), { padre: g, seg: 28 });
    hexa(R, [xb, y0, z0 + 12.5], [xb, y0, z0 + 19], 13, X.galv(), { padre: g, hueco: 4 });
  }
  // agujeros de fijación
  for (const s of [-1, 1]) R.cil([x0 + s * 8, y0, z0 + 7.9], [x0 + s * 8, y0, z0 + 8.05], 3, R.M.oscuro(), { padre: g, seg: 16 });
  return g;
}

/** fotocontrol NEMA de 3 patas (cuerpo z de 0 = cara de las patas a FOTO.H). op: giro (grados), cortar, ventana */
export function fotocontrol(R, x0, y0, z0, op = {}) {
  const X = MX(R), F = FOTO, g = R.grupo(op.padre), T = R.THREE;
  const base = R.M.pa(op.colorBase || '#2b2d31', { roughness: .45 }), tapa = R.M.pa(op.colorTapa || '#d8dcdf', { roughness: .35, clearcoat: .4 });
  // base (disco) con la junta abajo
  R.torno([x0, y0, z0], [x0, y0, z0 + F.base.h], [[0, 0], [F.base.D / 2 - 1.5, 0], [F.base.D / 2, 1.5], [F.base.D / 2, F.base.h], [0, F.base.h]], base, { padre: g, seg: 96 });
  R.torno([x0, y0, z0 - 1.8], [x0, y0, z0 + .2], [[F.zocalo.junta[0], 0], [F.zocalo.junta[1] + 4, 0], [F.zocalo.junta[1] + 4, 2], [F.zocalo.junta[0], 2]], X.junta(), { padre: g, seg: 72 });
  // tapa (cúpula)
  const hT = F.tapa.h, rT = F.tapa.D / 2;
  R.torno([x0, y0, z0 + F.base.h - .5], [x0, y0, z0 + F.H], [[rT - 2.5, 0], [rT, 0], [rT, hT * .55], [rT - 3, hT * .8], [rT - 12, hT * .96], [rT - 22, (F.H - F.base.h + .5)], [0, (F.H - F.base.h + .5)], [0, (F.H - F.base.h + .5) - 2.5], [rT - 23, (F.H - F.base.h + .5) - 2.5], [rT - 14, hT * .96 - 2.5], [rT - 5.2, hT * .8 - 1.5], [rT - 2.5, hT * .55], [rT - 2.5, 0]], tapa, { padre: g, seg: 96 });
  // ventana de la fotocélula (lente) en el frente (+y)
  const vz = z0 + F.ventana.z, ang = (op.ventana ?? 90) * Math.PI / 180;
  const vx = x0 + (rT + .2) * Math.cos(ang), vy = y0 + (rT + .2) * Math.sin(ang);
  const lente = R.caja(-F.ventana.w / 2, F.ventana.w / 2, -1.2, .6, -F.ventana.h / 2, F.ventana.h / 2, R.M.lente('#2c4f6e'), { r: 2.5, padre: null });
  const gl = R.grupo(g); gl.add(lente); gl.position.set(vx, vy, vz); gl.rotation.z = ang - Math.PI / 2;
  // patas (cuchillas curvas sobre el círculo) con el pie de traba
  const giro = (op.giro || 0) * Math.PI / 180;
  for (const p of F.patas) {
    const a0 = (p.a - p.ancho / 2) * Math.PI / 180 + giro, a1 = (p.a + p.ancho / 2) * Math.PI / 180 + giro, rr = F.rPatas, e = F.pata.esp;
    const s = new T.Shape(); const N = 16;
    for (let i = 0; i <= N; i++) { const a = a0 + (a1 - a0) * i / N; (i ? s.lineTo : s.moveTo).call(s, (rr + e / 2) * Math.cos(a), (rr + e / 2) * Math.sin(a)); }
    for (let i = N; i >= 0; i--) { const a = a0 + (a1 - a0) * i / N; s.lineTo((rr - e / 2) * Math.cos(a), (rr - e / 2) * Math.sin(a)); }
    const geo = new T.ExtrudeGeometry(s, { depth: F.pata.largo, bevelEnabled: true, bevelThickness: .25, bevelSize: .2, bevelSegments: 1 }); geo.deleteAttribute('uv');
    geo.translate(0, 0, -F.pata.largo); const m = new T.Mesh(geo, X.laton()); m.position.set(x0, y0, z0); m.castShadow = m.receiveShadow = true; g.add(m);
    // pie de traba: lengüeta que sale hacia afuera en la punta (engancha al girar)
    const am = a1 - 4 * Math.PI / 180;
    const foot = R.caja(-1.6, F.pata.pie + .4, -e / 2, e / 2, -F.pata.largo, -F.pata.largo + 3.2, X.laton(), { r: .3, padre: null });
    const gf = R.grupo(g); gf.add(foot); gf.position.set(x0 + rr * Math.cos(am), y0 + rr * Math.sin(am), z0); gf.rotation.z = am;
  }
  // interior (se ve en el corte): placa de circuito, relé, varistor, fotocélula
  if (op.interior) {
    R.caja(x0 - 30, x0 + 30, y0 - 1, y0 + 1, z0 + F.base.h + 2, z0 + F.base.h + 44, X.pcb(), { r: .4, padre: g });
    R.caja(x0 - 22, x0 - 2, y0 + 1, y0 + 17, z0 + F.base.h + 6, z0 + F.base.h + 22, R.M.pa('#1e2023', { roughness: .4 }), { r: .8, padre: g });   // relé
    R.cil([x0 + 12, y0 + 1, z0 + F.base.h + 14], [x0 + 12, y0 + 5, z0 + F.base.h + 14], 7, R.M.pa('#2a5db0', { roughness: .4 }), { padre: g, seg: 32 }); // varistor
    const cA = Math.cos(ang), sA = Math.sin(ang);
    R.cil([x0 + 2 * cA, y0 + 2 * sA, z0 + F.ventana.z], [x0 + (rT - 9) * cA, y0 + (rT - 9) * sA, z0 + F.ventana.z], 2.6, R.M.pa('#e7e3d6'), { padre: g, seg: 24 });             // fotocélula
    R.cil([x0 + (rT - 9) * cA, y0 + (rT - 9) * sA, z0 + F.ventana.z], [x0 + (rT - 8.6) * cA, y0 + (rT - 8.6) * sA, z0 + F.ventana.z], 2.4, R.M.pa('#c2562a', { roughness: .3 }), { padre: g, seg: 24 });
    for (const dx of [-14, 0, 14]) R.cil([x0 + dx * .8, y0, z0 + .5], [x0 + dx * .8, y0, z0 + F.base.h + 3], .8, X.cobreEst(), { padre: g, seg: 12 });
  }
  g.updateMatrixWorld(true);
  if (op.cortar) R.cortar(g, op.cortar);
  return g;
}

/** zócalo NEMA 3 patas (3072): cuerpo, ranuras curvas con los contactos a resorte, junta, cables negro / blanco / rojo */
export function zocaloFoto(R, x0, y0, z0, op = {}) {
  const X = MX(R), F = FOTO, Z = F.zocalo, g = R.grupo(op.padre), T = R.THREE;
  const mat = R.M.pa(op.color || '#3a3e45', { roughness: .5 });
  // cuerpo: disco con 3 ranuras curvas (más largas que la pata: entra y gira)
  const s = new T.Shape(); s.absarc(0, 0, Z.D / 2, 0, Math.PI * 2, false);
  const ranuras = [];
  for (const p of F.patas) {
    const a0 = (p.a - p.ancho / 2 - 2) * Math.PI / 180, a1 = (p.a + p.ancho / 2 + F.giro) * Math.PI / 180, rr = F.rPatas, w = 2.4;
    const h = new T.Path(); const N = 20;
    for (let i = 0; i <= N; i++) { const a = a0 + (a1 - a0) * i / N; (i ? h.lineTo : h.moveTo).call(h, (rr + w) * Math.cos(a), (rr + w) * Math.sin(a)); }
    for (let i = N; i >= 0; i--) { const a = a0 + (a1 - a0) * i / N; h.lineTo((rr - w) * Math.cos(a), (rr - w) * Math.sin(a)); }
    s.holes.push(h); ranuras.push([a0, a1]);
  }
  const top = new T.ExtrudeGeometry(s, { depth: 6, bevelEnabled: true, bevelThickness: .8, bevelSize: .8, bevelSegments: 2, curveSegments: 48 }); top.deleteAttribute('uv');
  top.translate(0, 0, -6.8); const mt = new T.Mesh(top, mat); mt.position.set(x0, y0, z0); mt.castShadow = mt.receiveShadow = true; g.add(mt);
  R.torno([x0, y0, z0 - Z.h], [x0, y0, z0 - 6.5], [[0, 0], [Z.D / 2 - 6, 0], [Z.D / 2 - 1, 5], [Z.D / 2, Z.h - 7], [Z.D / 2 - 3, Z.h - 6.5], [0, Z.h - 6.5]], mat, { padre: g, seg: 96 });
  // fondo oscuro de las ranuras y contactos (láminas de bronce) adentro
  for (const [a0, a1] of ranuras) {
    const am = a1 - 8 * Math.PI / 180, rr = F.rPatas;
    const c = R.caja(-4, 4, -2.6, 2.6, -14, -6.6, X.laton(), { r: .4, padre: null }); const gc = R.grupo(g); gc.add(c); gc.position.set(x0 + rr * Math.cos(am), y0 + rr * Math.sin(am), z0); gc.rotation.z = am + Math.PI / 2;
  }
  R.torno([x0, y0, z0], [x0, y0, z0 + 1.2], [[Z.junta[0], 0], [Z.junta[1], 0], [Z.junta[1], 1.2], [Z.junta[0], 1.2]], X.junta(), { padre: g, seg: 72 });
  // flecha de giro y marcas impresas
  // cables: negro (línea), blanco (neutro), rojo (carga) – convención ANSI
  const cols = op.cables || ['#26282b', '#f2f2ee', '#c8302c'];
  cols.forEach((c, i) => {
    const a = (100 + i * 22) * Math.PI / 180, x = x0 + 9 * Math.cos(a), y = y0 + 9 * Math.sin(a);
    tubo(R, [[x, y, z0 - Z.h + 1], [x, y, z0 - Z.h - 15], [x + (i - 1) * 5, y + 4, z0 - Z.h - 45], [x + (i - 1) * 12, y + 10, z0 - Z.h - (op.largo || 80)]], 1.9, R.M.cable(c), { padre: g, radial: 16 });
  });
  g.updateMatrixWorld(true);
  if (op.cortar) R.cortar(g, op.cortar);
  return g;
}
