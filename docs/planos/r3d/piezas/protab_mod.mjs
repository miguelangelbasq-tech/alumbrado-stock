/* protab_mod.mjs · aparatos modulares para riel DIN: termomagnética (con su mecanismo por dentro), diferencial (toroide),
 * contactor (circuito magnético y puente de contactos), peine de alimentación por pines, selectora 22 mm y llave encapsulada.
 * Medidas: perfiles_protab.mjs (las mismas del plano). Ejes: x = ancho (polos), y = profundidad (0 en la espalda), z = alto. */
import { TM, DI, CT, PEINE_TM, rect } from './perfiles_protab.mjs';
import { MX, tubo, helice, bobinado, hexa, cablePuntera, puntaCable } from './protab_util.mjs';

const xs = (x0, n, W) => Array.from({ length: n }, (_, i) => x0 + i * W);

/** carcasa de n polos (S = TM / DI / CT): rebanadas por polo [pared 1,2][hueca][centro con bolsillo y bocas][hueca][pared].
 *  op: color, interior (true = deja la cámara hueca), anchoPolo (W), padre. Devuelve { g, xm[] } */
export function carcasaMod(R, S, x0, n, op = {}) {
  const g = R.grupo(op.padre), W = op.W || S.W, pa = op.mat || R.M.pa(op.color || '#ecebe6');
  const camara = op.interior ? S.camara : [];
  const cen = op.anchoCentro || S.jaula.ancho + .4, e = 1.2, hu = (W - 2 * e - cen) / 2;
  const xm = [];
  for (let i = 0; i < n; i++) {
    const a = x0 + i * W; xm.push(a + W / 2);
    const cont = op.continuo && n > 1, ini = !cont || i === 0, fin = !cont || i === n - 1;
    if (ini) R.perfil(S.contorno, [S.ranuraTraba], e, pa, { a0: a, bevel: .35, padre: g });
    else R.perfil(S.contorno, [S.ranuraTraba, ...camara], e + .02, pa, { a0: a - .01, bevel: 0, padre: g });
    R.perfil(S.contorno, [S.ranuraTraba, ...camara], hu + .02, pa, { a0: a + e - .01, bevel: 0, padre: g });
    R.perfil(S.contorno, [S.ranuraTraba, ...camara, ...S.bolsillo, ...S.boca, ...(S.ranuraManija && !op.sinManija ? [S.ranuraManija] : [])], cen + .02, pa, { a0: a + e + hu - .01, bevel: 0, padre: g });
    R.perfil(S.contorno, [S.ranuraTraba, ...camara], hu + .02, pa, { a0: a + e + hu + cen - .01, bevel: 0, padre: g });
    if (fin) R.perfil(S.contorno, [S.ranuraTraba], e, pa, { a0: a + W - e, bevel: .35, padre: g });
    else R.perfil(S.contorno, [S.ranuraTraba, ...camara], e + .02, pa, { a0: a + W - e - .01, bevel: 0, padre: g });
    // traba del riel (corredera) y su ojal para el destornillador
    R.perfil(S.traba, [], W - 5, R.M.pa(op.colorTraba || '#d9d8d1'), { a0: a + 2.5, bevel: .2, padre: g });
  }
  // pozos redondos de los tornillos (CSG) en el centro de cada polo: se restan de la rebanada central
  const pozos = [];
  for (const x of xm) for (const z of [S.tornillo.zS, S.tornillo.zI]) pozos.push([x, z]);
  const cens = g.children.filter((m, i) => i % 6 === 2);
  cens.forEach((m, i) => {
    let r = m;
    for (const [x, z] of pozos.slice(i * 2, i * 2 + 2)) {
      const h = R.torno([x, S.Dr + .4, z], [x, S.tornillo.yCab - 3.5, z], [[0, 0], [S.tornillo.pozo, 0], [S.tornillo.pozo, 1.2], [S.tornillo.pozo - .9, 2.2], [S.tornillo.pozo - .9, S.Dr - S.tornillo.yCab + 4], [0, S.Dr - S.tornillo.yCab + 4]], pa, { padre: null, seg: 40 });
      const n2 = R.restarCSG(r, h, pa); g.remove(r); g.add(n2); r = n2;
    }
  });
  return { g, xm, pa };
}

/** jaula (acero cincado) + tornillo combi en un borne. lado 'S' arriba / 'I' abajo */
export function borneJaula(R, S, xm, lado, padre, op = {}) {
  const X = MX(R), J = S.jaula[lado], w = S.jaula.ancho;
  R.perfil(J.ext, [J.int], w, X.galv(), { a0: xm - w / 2, bevel: .12, padre });
  const z = lado === 'S' ? S.tornillo.zS : S.tornillo.zI;
  const t = S.tornillo;
  R.tornillo([xm, t.yCab, z], [0, 1, 0], { M: t.M, L: t.L, dk: t.dk, k: t.k, tipo: 'combi', giro: op.giro ?? 50, mat: X.galv(), padre });
}

/** termomagnética de n polos (0 = el primero). op: marca ('C20'), int ('6000'), interior: [índices de polo con el mecanismo],
 *  cortar: índice de polo a cortar por el plano medio, sinCables, conexiones {polo: {S: color, I: color}} */
export function termomagnetica(R, x0, n, op = {}) {
  const X = MX(R), S = TM, W = S.W;
  const interior = op.interior || [];
  const { g, xm } = carcasaMod(R, S, x0, n, { ...op, interior: interior.length > 0, color: op.color || '#efeee9' });
  // manijas unidas (una por polo + barra de unión)
  const mg = R.grupo(g);
  const man = op.off ? S.manijaOff : S.manijaP;
  for (const x of xm) {
    R.perfil(man, [], 7.2, X.paOscuro(), { a0: x - 3.6, bevel: .5, padre: mg });
    R.cil([x - 3.6, ...S.manija.piv], [x + 3.6, ...S.manija.piv], S.manija.r, X.paOscuro(), { padre: mg, seg: 32 });
  }
  if (n > 1) R.cil([xm[0], ...S.manija.piv.map((v, i) => i ? v : v + 13)], [xm[n - 1], ...S.manija.piv.map((v, i) => i ? v : v + 13)], 1.3, X.paOscuro(), { padre: mg, seg: 16 });
  // visor de los contactos (rojo = cerrado) en el frente del cuello
  for (const x of xm) {
    R.caja(x - 3.6, x + 3.6, S.Dn - .05, S.Dn + .35, S.ventana.z[0] - .6, S.ventana.z[1] + .6, R.M.pa('#2a2c30'), { r: .3, padre: g });
    R.caja(x - 2.8, x + 2.8, S.Dn + .3, S.Dn + .55, S.ventana.z[0], S.ventana.z[1], R.M.pa(op.off ? '#2f9e44' : '#d63a2f', { roughness: .3, clearcoat: 1 }), { r: .2, padre: g });
  }
  // bornes: jaula + tornillo en todos los polos (se ven por los pozos)
  for (const x of xm) for (const l of ['S', 'I']) borneJaula(R, S, x, l, g);
  // rótulos impresos en el frente del cuello (no en el polo que se corta)
  const imp = (op.cortar === undefined) ? xm : xm.filter((_, i) => i !== op.cortar);
  if (op.marca && imp.length) {
    const xc = (imp[0] + imp[imp.length - 1]) / 2, w = Math.max(14, W * imp.length - 4);
    R.impreso([{ t: op.marca, s: 1.25 }], w, 8, [xc, S.Dn + .06, 57.5], [-1, 0, 0], [0, 0, 1], { padre: g, color: '#1b1c1f', ppm: 50 });
    R.impreso([op.icc || '6000', '230/400V~'], Math.min(w, 16), 6, [xc, S.Dn + .06, 33.6], [-1, 0, 0], [0, 0, 1], { padre: g, color: '#30343a', ppm: 50, peso: 600 });
    imp.forEach((x, i) => { R.impreso([String(2 * i + 1)], 4, 4, [x, S.Dr + .06, 82.5], [-1, 0, 0], [0, 0, 1], { padre: g, color: '#30343a', ppm: 50 });
      R.impreso([String(2 * i + 2)], 4, 4, [x, S.Dr + .06, 2.5], [-1, 0, 0], [0, 0, 1], { padre: g, color: '#30343a', ppm: 50 }); });
  }
  // mecanismo por dentro
  for (const i of interior) mecanismoTM(R, xm[i], g);
  // cables con puntera
  for (const [i, c] of Object.entries(op.cables || {})) {
    const x = xm[+i];
    if (c.S) cablePuntera(R, [x, S.cable.y, 71], [x, S.cable.y, 85 + (c.largoS || 34)], c.S, { padre: g, rC: 1.45, rA: 2.5, collar: c.collar || '#2b2d31' });
    if (c.I) cablePuntera(R, [x, S.cable.y, 14], [x, S.cable.y, -(c.largoI || 34)], c.I, { padre: g, rC: 1.45, rA: 2.5, collar: c.collar || '#2b2d31' });
  }
  g.updateMatrixWorld(true);
  if (op.cortar !== undefined) { const x = xm[op.cortar]; R.cortar(g, [x, x + W / 2 + .5, -12, 100, -10, 140]); }
  return { g, xm };
}

/** mecanismo de un polo: bobina, percutor, yugo, contactos, cuernos, cámara de arco, bimetal, malla, cerrojo */
export function mecanismoTM(R, x, padre) {
  const X = MX(R), S = TM, g = R.grupo(padre), cu = X.cobre(), b = S.bobina;
  // conductores de cobre (barras)
  R.perfil(S.barraS, [], 6, cu, { a0: x - 3, bevel: .1, padre: g });
  R.perfil([[20.6, 57], [22, 57], [22, 66.6], [20.6, 66.6]], [], 6, cu, { a0: x - 3, bevel: .1, padre: g });
  R.perfil(S.salidaBob, [], 5, cu, { a0: x - 2.5, bevel: .1, padre: g });
  R.perfil(S.cuernoS, [], 7, cu, { a0: x - 3.5, bevel: .1, padre: g });
  R.perfil(S.cuernoI, [], 7, cu, { a0: x - 3.5, bevel: .1, padre: g });
  R.perfil(S.barraI, [], 6, cu, { a0: x - 3, bevel: .1, padre: g });
  R.perfil([[22.2, 14.6], [36.4, 14.6], [36.4, 16], [22.2, 16]], [], 6, cu, { a0: x - 3, bevel: .1, padre: g });
  // bobina de disparo (carrete + alambre esmaltado) y percutor
  R.torno([x, b.y0 - .8, b.z], [x, b.y1 + .8, b.z], [[b.rI - .7, 0], [b.rE + .6, 0], [b.rE + .6, .8], [b.rI, .8], [b.rI, b.y1 - b.y0 + .8], [b.rE + .6, b.y1 - b.y0 + .8], [b.rE + .6, b.y1 - b.y0 + 1.6], [b.rI - .7, b.y1 - b.y0 + 1.6]], X.paNegro(), { padre: g, seg: 40 });
  bobinado(R, [x, b.y0 + .1, b.z], [x, b.y1 - .1, b.z], b.rI, b.rE, .42, X.esmalte(), { padre: g });
  R.cil([x, b.percutor[0], b.z], [x, b.percutor[1], b.z], b.rP, X.acero(), { padre: g, seg: 24 });
  R.cil([x, b.percutor[1] - .1, b.z], [x, b.percutor[1] + .5, b.z], b.rP * .6, X.acero(), { padre: g, seg: 16 });
  for (const p of S.yugo) R.perfil(p, [], 10, X.acero(), { a0: x - 5, bevel: .1, padre: g });
  // contactos de plata
  R.perfil(S.contactoFijo, [], 4, X.plata(), { a0: x - 2, bevel: .15, padre: g });
  R.perfil(S.brazoP, [], 4.4, cu, { a0: x - 2.2, bevel: .15, padre: g });
  R.perfil(S.pastillaMovil, [], 4, X.plata(), { a0: x - 2, bevel: .15, padre: g });
  R.cil([x - 3.2, ...S.brazo.piv], [x + 3.2, ...S.brazo.piv], 1.1, X.acero(), { padre: g, seg: 16 });
  // cámara de arco: placas de acero con la «V» + placas laterales de fibra
  const ca = S.camara_arco, wC = 11;
  for (let i = 0; i < ca.n; i++) {
    const z = ca.z0 + i * ca.paso, y0 = ca.y[0], y1 = ca.y[1];
    const placa = [[-wC / 2, y0], [wC / 2, y0], [wC / 2, y1], [1.4, y1], [0, y1 - ca.v], [-1.4, y1], [-wC / 2, y1]];
    R.perfil(placa.map(([u, v]) => [u + x, v]), [], ca.esp, X.galv(), { A: [0, 0, 1], B: [1, 0, 0], C: [0, 1, 0], o: [0, 0, z], bevel: .08, padre: g });
  }
  for (const s of [-1, 1]) R.caja(x + s * (wC / 2 + .5) - .5, x + s * (wC / 2 + .5) + .5, ca.y[0] - .5, ca.y[1] + .2, ca.z0 - 1, ca.z0 + ca.n * ca.paso, X.fibra(), { r: .2, padre: g });
  // bimetal (dos láminas) con su tornillo de calibración
  R.perfil(S.bimetal.a, [], 5, X.laton(), { a0: x - 2.5, bevel: .08, padre: g });
  R.perfil(S.bimetal.b, [], 5, X.acero(), { a0: x - 2.5, bevel: .08, padre: g });
  R.tornillo([x, 43.2, 31.6], [0, 1, 0], { M: 2.5, L: 2.6, dk: 4.2, k: 1.6, tipo: 'ranura', mat: X.latonNiq(), padre: g });
  // malla de cobre (trenza flexible) del bimetal al brazo
  tubo(R, [[x, 40.4, 33.6], [x + .3, 42.6, 36.4], [x, 44.6, 37.2], [x - .2, 46.6, 36.6]], .9, R.M.pa('#c4794a', { metalness: 1, roughness: .62 }), { padre: g, radial: 10 });
  // cerrojo / barra de disparo y biela
  R.perfil(S.cerrojo, [], 8, X.paNegro(), { a0: x - 4, bevel: .3, padre: g });
  tubo(R, [[x + 1.5, 57.5, 37.6], [x + 1.5, 53.6, 36.2], [x + 1.5, 50.4, 34.4]], .6, X.acero(), { padre: g, radial: 8 });
  helice(R, [x - 2.5, 47, 27], [x - 2.5, 47, 33.5], 1.2, 7, .22, X.acero(), { padre: g });
  return g;
}

/** peine de alimentación por pines (sin código en el pañol): n polos de paso 18 desde x0 (centro del primer polo) */
export function peineTM(R, x0, n, op = {}) {
  const X = MX(R), P = PEINE_TM, g = R.grupo(op.padre);
  const L = (n - 1) * P.paso + 14;
  R.perfil(P.cuerpo, [], L, R.M.pa(op.color || '#c9302c', { roughness: .45 }), { a0: x0 - 7, bevel: .5, padre: g });
  R.perfil(P.barra, [], L - 2, X.cobre(), { a0: x0 - 6, bevel: .1, padre: g });
  for (let i = 0; i < n; i++) {
    const x = x0 + i * P.paso;
    R.caja(x - P.pin.x / 2, x + P.pin.x / 2, P.pin.y[0], P.pin.y[1], P.pin.z0, 90, X.cobre(), { r: .25, padre: g });
  }
  // tapas de punta
  for (const xx of [x0 - 7.6, x0 + L - 7 - .1]) R.perfil(P.cuerpo, [], .7, R.M.pa('#e6e4dc'), { a0: xx, bevel: .1, padre: g });
  if (op.leyenda) R.impreso([op.leyenda], Math.min(60, L - 10), 4.5, [x0 + L / 2 - 7, P.y0 + 6.42, 91], [-1, 0, 0], [0, 0, 1], { padre: g, color: '#ffffff', ppm: 50, peso: 700 });
  return g;
}

/** diferencial de n polos (2 o 4). op: sens ('30 mA'), interior (true = toroide y relé), cortar ([caja]) */
export function diferencial(R, x0, n, op = {}) {
  const X = MX(R), S = DI, W = S.W;
  const { g, xm } = carcasaMod(R, S, x0, n, { ...op, interior: !!op.interior, continuo: !!op.interior, color: op.color || '#efeee9' });
  // manija (una sola, ancha, en el centro) y botón T
  const xc = (xm[0] + xm[n - 1]) / 2;
  R.perfil(S.manijaP, [], 13, X.paOscuro(), { a0: xc - 6.5, bevel: .5, padre: g });
  R.cil([xc - 6.5, ...S.manija.piv], [xc + 6.5, ...S.manija.piv], S.manija.r, X.paOscuro(), { padre: g, seg: 32 });
  const xb = xm[n - 1] - 2;
  R.torno([xb, S.Dn - 3, S.boton.z], [xb, S.Dn + 2.4, S.boton.z], [[0, 0], [S.boton.r, 0], [S.boton.r, 4.8], [S.boton.r - .5, 5.4], [0, 5.4]], R.M.pa('#e2c21a', { roughness: .4 }), { padre: g, seg: 32 });
  R.torno([xb, S.Dn - .2, S.boton.z], [xb, S.Dn + .5, S.boton.z], [[S.boton.r + .3, 0], [S.boton.r + 1.4, 0], [S.boton.r + 1.4, .7], [S.boton.r + .3, .7]], X.paNegro(), { padre: g, seg: 32 });
  for (const x of xm) for (const l of ['S', 'I']) borneJaula(R, S, x, l, g);
  R.impreso(['T'], 4, 4, [xb, S.Dn + .06, S.boton.z + 6], [-1, 0, 0], [0, 0, 1], { padre: g, color: '#1b1c1f', ppm: 50 });
  if (op.sens) {
    const vis = op.cortar ? xm.filter(x => x < op.cortar[0]) : xm, xv = (vis[0] + vis[vis.length - 1]) / 2;
    const w = W * vis.length - 6;
    R.impreso([{ t: op.sens, s: 1.2 }, op.inom || '40 A  400V~'], w, 10, [xv, S.Dn + .06, 61.5], [-1, 0, 0], [0, 0, 1], { padre: g, color: '#1b1c1f', ppm: 45 });
    R.impreso(['IΔn  clase A'], Math.min(w, 22), 4, [xv, S.Dn + .06, 25], [-1, 0, 0], [0, 0, 1], { padre: g, color: '#30343a', ppm: 50, peso: 600 });
    xm.forEach((x, i) => { const t = i === n - 1 ? 'N' : String(2 * i + 1);
      if (!op.cortar || x < op.cortar[0]) R.impreso([t], 4, 4, [x, S.Dr + .06, 88.5], [-1, 0, 0], [0, 0, 1], { padre: g, color: '#30343a', ppm: 50 });
      R.impreso([i === n - 1 ? 'N' : String(2 * i + 2)], 4, 4, [x, S.Dr + .06, 2.5], [-1, 0, 0], [0, 0, 1], { padre: g, color: '#30343a', ppm: 50 }); });
  }
  if (op.interior) toroideDI(R, xm, xc, xb, g);
  for (const [i, c] of Object.entries(op.cables || {})) {
    const x = xm[+i];
    if (c.S) cablePuntera(R, [x, S.cable.y, 77], [x, S.cable.y, 91 + (c.largoS || 34)], c.S, { padre: g, rC: 1.8, rA: 2.9, collar: c.collar || '#2b2d31' });
    if (c.I) cablePuntera(R, [x, S.cable.y, 14], [x, S.cable.y, -(c.largoI || 34)], c.I, { padre: g, rC: 1.8, rA: 2.9, collar: c.collar || '#2b2d31' });
  }
  g.updateMatrixWorld(true);
  if (op.cortar) R.cortar(g, op.cortar);
  return { g, xm, xc };
}

/** toroide del diferencial con su bobinado, los conductores que lo atraviesan, el relé y la resistencia de prueba */
export function toroideDI(R, xm, xc, xb, padre, op = {}) {
  const X = MX(R), S = DI, g = R.grupo(padre);
  {
    const t = S.toroide, cu = X.cobre();
    // toroide: núcleo de ferrita + bobinado secundario (espiras alrededor del anillo)
    const T = R.THREE;
    const tor = new T.Mesh(new T.TorusGeometry(t.R, t.r, 24, 72), X.ferrita()); tor.position.set(xc, t.y, t.z); tor.castShadow = tor.receiveShadow = true; g.add(tor);
    const esp = [];
    for (let k = 0; k <= 2400; k++) { const s = k / 2400, a = s * Math.PI * 1.6 + Math.PI * .2, b = s * Math.PI * 2 * 60; const rr = t.R + (t.r + .3) * Math.cos(b);
      esp.push([xc + rr * Math.cos(a), t.y + rr * Math.sin(a), t.z + (t.r + .3) * Math.sin(b)]); }
    tubo(R, esp, .28, X.esmalte(), { padre: g, seg: 4800, radial: 6, tension: .5 });
    // conductores principales que pasan por adentro del toroide
    xm.forEach((x, i) => {
      const dx = (x - xc) * .22, c = [xc + dx, t.y + (i % 2 ? 1.6 : -1.6) * 0, t.z];
      tubo(R, [[x, 29, 76], [x, 29, 68], [xc + dx, t.y + 2, t.z + 12], [xc + dx, t.y, t.z], [xc + dx, t.y - 1, t.z - 12], [x, 29, 22], [x, 29, 15]], 1.3, cu, { padre: g, radial: 12 });
    });
    // relé de disparo, resistencia de prueba y cables finos
    R.caja(xc - 6, xc + 6, S.rele[0][0], S.rele[1][0], S.rele[0][1], S.rele[2][1], R.M.pa('#1f4f9a', { roughness: .4 }), { r: .6, padre: g });
    R.caja(xc - 4, xc + 4, S.rele[1][0] - .6, S.rele[1][0] + 1.2, S.rele[0][1] + 3, S.rele[2][1] - 3, X.acero(), { r: .2, padre: g });
    R.cil([xb, 46, 31], [xb, 50, 31], 1.3, R.M.pa('#c9a46a'), { padre: g, seg: 16 });
    tubo(R, [[xc + t.R, t.y + 3, t.z + 4], [xc + 6, 34, 52], [xc + 3, 40, 54]], .35, R.M.cable('#c8302c'), { padre: g, radial: 8 });
    tubo(R, [[xc + t.R - 2, t.y + 6, t.z + 4], [xc + 4, 36, 50], [xc + 1, 40, 52]], .35, R.M.cable('#26282b'), { padre: g, radial: 8 });
  }
  return g;
}

/** contactor tripolar (CT). op: interior, cortar (caja), cables {polo: {S, I}} */
export function contactor(R, x0, op = {}) {
  const X = MX(R), S = CT;
  const pa = R.M.pa(op.color || '#e9e8e3');
  const g = R.grupo(op.padre);
  // carcasa: un solo bloque de 45 con la cámara y los bolsillos de los 3 polos
  const W = S.W, cam = op.interior ? S.camara : [];
  R.perfil(S.contorno, [S.ranuraTraba], 1.4, pa, { a0: x0, bevel: .4, padre: g });
  const piezas = [[1.4, 2.0], [3.4, 8.2], [11.6, 3.4], [15.0, 15.0], [30.0, 3.4], [33.4, 8.2], [41.6, 2.0]];
  // los polos en x0+7.5, 22.5, 37.5 → rebanadas «con bolsillo» (ancho 8,2 centradas en cada polo) y sin bolsillo entre medio
  const conBolsillo = new Set([1, 5]);
  let cens = [];
  for (const [i, [a, w]] of piezas.entries()) {
    const extra = conBolsillo.has(i) || i === 3 ? [...S.bolsillo, ...S.boca] : [];
    const m = R.perfil(S.contorno, [S.ranuraTraba, ...cam, ...extra], w + .02, pa, { a0: x0 + a - .01, bevel: 0, padre: g });
    if (extra.length) cens.push(m);
  }
  R.perfil(S.contorno, [S.ranuraTraba], 1.4, pa, { a0: x0 + W - 1.4, bevel: .4, padre: g });
  R.perfil(S.traba, [], W - 6, R.M.pa('#d9d8d1'), { a0: x0 + 3, bevel: .2, padre: g });
  // pozos de los tornillos
  cens.forEach((m, i) => { let r = m; const x = x0 + S.polos[i];
    for (const z of [S.tornillo.zS, S.tornillo.zI]) { const h = R.torno([x, S.Dr + .4, z], [x, S.tornillo.yCab - 3.5, z], [[0, 0], [4.4, 0], [4.4, 1.2], [3.5, 2.2], [3.5, S.Dr - S.tornillo.yCab + 4], [0, S.Dr - S.tornillo.yCab + 4]], pa, { padre: null, seg: 40 }); const n2 = R.restarCSG(r, h, pa); g.remove(r); g.add(n2); r = n2; } });
  for (const p of S.polos) for (const l of ['S', 'I']) borneJaula(R, S, x0 + p, l, g, { giro: 30 });
  // bornes de la bobina A1 / A2 y del contacto auxiliar en el frente (tornillos)
  const fr = [[x0 + 8, 70, 'A1'], [x0 + 37, 15, 'A2'], [x0 + 22.5, 70, '13'], [x0 + 37, 70, '21'], [x0 + 22.5, 15, '14'], [x0 + 8, 15, '22']];
  for (const [x, z, t] of fr) {
    R.caja(x - 4.6, x + 4.6, S.Dn - 3, S.Dn + .02, z - 4.6, z + 4.6, R.M.pa('#d9d8d1'), { r: .6, padre: g });
    R.tornillo([x, S.Dn - 1.2, z], [0, 1, 0], { M: 3.5, L: 2, dk: 6.4, k: 2.2, tipo: 'combi', giro: 40, mat: X.galv(), padre: g });
    if (!op.sinRotulos || x < x0 + 22) R.impreso([t], 6, 3.4, [x, S.Dn + .06, z + (z > 40 ? -7.3 : 7.3)], [-1, 0, 0], [0, 0, 1], { padre: g, color: t[0] === 'A' ? '#c8302c' : '#30343a', ppm: 50 });
  }
  // visor y pulsador de prueba manual + rótulos
  R.caja(x0 + 15, x0 + 30, S.Dn - 1.2, S.Dn + .6, 32, 41, R.M.pa('#3a3e45'), { r: .6, padre: g });
  if (!op.sinRotulos) R.impreso([{ t: op.marca || 'KM  25 A', s: 1.1 }, 'AC-3 25A  AC-1 40A', 'bobina 220V 50Hz'], 30, 11, [x0 + 22.5, S.Dn + .06, 51], [-1, 0, 0], [0, 0, 1], { padre: g, color: '#1b1c1f', ppm: 45 });
  if (!op.sinRotulos) ['1/L1', '3/L2', '5/L3'].forEach((t, i) => R.impreso([t], 10, 3.4, [x0 + S.polos[i], S.Dr + .06, 83], [-1, 0, 0], [0, 0, 1], { padre: g, color: '#30343a', ppm: 50 }));
  if (!op.sinRotulos) ['2/T1', '4/T2', '6/T3'].forEach((t, i) => R.impreso([t], 10, 3.4, [x0 + S.polos[i], S.Dr + .06, 2.2], [-1, 0, 0], [0, 0, 1], { padre: g, color: '#30343a', ppm: 50 }));
  if (op.interior) {
    const N = S.nucleo, nx = [x0 + N.x[0], x0 + N.x[1]];
    // paquete de chapas: varias láminas finas para que se vea el apilado
    const nL = 22;
    for (let k = 0; k < nL; k++) { const a = nx[0] + k * (nx[1] - nx[0]) / nL, w = (nx[1] - nx[0]) / nL - .12;
      for (const p of N.fijo) R.perfil(p, [], w, X.chapaSilicio(), { a0: a, bevel: 0, padre: g });
      for (const p of N.movil) R.perfil(p, [], w, X.chapaSilicio(), { a0: a, bevel: 0, padre: g }); }
    for (const p of N.espira) R.perfil(p, [], nx[1] - nx[0] + 1, X.cobre(), { a0: nx[0] - .5, bevel: 0, padre: g });
    // carrete y bobinado (220 V)
    const B = S.bobina;
    const carrete = [[B.y[0] - .6, B.zN[0] - 1], [B.y[1] + .4, B.zN[0] - 1], [B.y[1] + .4, B.z[0] - .6], [B.y[1] + 1, B.z[0] - .6], [B.y[1] + 1, B.z[1] + .6], [B.y[1] + .4, B.z[1] + .6], [B.y[1] + .4, B.zN[1] + 1], [B.y[0] - .6, B.zN[1] + 1]];
    for (const [y0, y1, z0, z1] of [[B.y[0], B.y[1], B.z[0], B.zN[0] - 1], [B.y[0], B.y[1], B.zN[1] + 1, B.z[1]]])
      for (let k = 0; k < 7; k++) R.perfil(rect(y0, y1, z0, z1), [], (B.x[1] - B.x[0]) / 7 - .05, X.esmalte(), { a0: x0 + B.x[0] + k * (B.x[1] - B.x[0]) / 7, bevel: .3, padre: g });
    R.perfil(carrete, [], B.x[1] - B.x[0] + 2, X.paNegro(), { a0: x0 + B.x[0] - 1, bevel: .2, padre: g });
    // porta-contactos, puentes, fijos y resortes de retorno
    R.perfil(S.porta, [S.ventanaPorta], W - 6, R.M.pa('#3a3e45', { roughness: .5 }), { a0: x0 + 3, bevel: .3, padre: g });
    for (const p of S.polos) {
      R.perfil(S.puente, [], 7, X.cobre(), { a0: x0 + p - 3.5, bevel: .15, padre: g });
      R.perfil(S.fijoS, [], 7, X.cobre(), { a0: x0 + p - 3.5, bevel: .15, padre: g });
      R.perfil(S.fijoI, [], 7, X.cobre(), { a0: x0 + p - 3.5, bevel: .15, padre: g });
      for (const q of S.pastillas) R.perfil(q, [], 5, X.plata(), { a0: x0 + p - 2.5, bevel: .15, padre: g });
      for (const q of [rect(70.6, 71.6, 56.5, 59), rect(70.6, 71.6, 26, 28.5)]) R.perfil(q.map(([y, z]) => [y - 3.0, z]), [], 5, X.plata(), { a0: x0 + p - 2.5, bevel: .15, padre: g });
    }
    for (const xx of [x0 + 6, x0 + W - 6]) helice(R, [xx, S.resorte.y[0], S.resorte.z], [xx, S.resorte.y[1], S.resorte.z], S.resorte.r, 6, .35, X.acero(), { padre: g });
  }
  for (const [i, c] of Object.entries(op.cables || {})) {
    const x = x0 + S.polos[+i];
    if (c.S) cablePuntera(R, [x, S.cable.y, 71], [x, S.cable.y, 85 + (c.largoS || 30)], c.S, { padre: g, rC: 1.8, rA: 2.9, collar: c.collar || '#2b2d31' });
    if (c.I) cablePuntera(R, [x, S.cable.y, 14], [x, S.cable.y, -(c.largoI || 30)], c.I, { padre: g, rC: 1.8, rA: 2.9, collar: c.collar || '#2b2d31' });
  }
  g.updateMatrixWorld(true);
  if (op.cortar) R.cortar(g, op.cortar);
  return g;
}

/** selectora 22 mm de 2 posiciones (3056) montada en una chapa: cabezal en +y. o = centro del agujero en la cara de la chapa */
export function selectora(R, o, op = {}) {
  const X = MX(R), g = R.grupo(op.padre), [x, y, z] = o;
  // cabezal: aro cromado + cuerpo negro + palanca
  R.torno([x, y, z], [x, y + 9, z], [[11, 0], [15, 0], [15, 1.2], [14.2, 3.2], [12.6, 4.2], [11, 4.2]], X.latonNiq(), { padre: g, seg: 64 });
  R.torno([x, y, z], [x, y + 12, z], [[0, 0], [11.4, 0], [11.4, 7], [10.4, 9], [0, 9]], X.paNegro(), { padre: g, seg: 64 });
  const ang = (op.pos === 'MAN' ? 45 : -45) * Math.PI / 180;
  const pal = R.caja(-3, 3, 0, 9, -11, 11, X.paNegro(), { r: 1.5, padre: null }); const pg = R.grupo(g); pg.add(pal); pg.position.set(x, y + 9, z); pg.rotation.y = ang;
  R.caja(-.8, .8, 8.6, 9.2, 4, 10, R.M.pa('#f2f2ee'), { r: .2, padre: pg });
  // rosca y tuerca atrás de la chapa + bloque de contactos 1NA + 1NC
  R.cil([x, y - op.chapa - 8, z], [x, y, z], 10.8, X.paNegro(), { padre: g, seg: 48 });
  hexa(R, [x, y - op.chapa - 3.5, z], [x, y - op.chapa, z], 27, X.latonNiq(), { padre: g, hueco: 10.8 });
  R.caja(x - 15, x + 15, y - op.chapa - 46, y - op.chapa - 10, z - 15, z + 15, R.M.pa('#e9e8e3'), { r: 1.2, padre: g });
  for (const [dx, col] of [[-7.5, '#2f9e44'], [7.5, '#c8302c']]) {
    R.caja(x + dx - 6.8, x + dx + 6.8, y - op.chapa - 46.4, y - op.chapa - 10, z - 15.2, z - 13, R.M.pa(col), { r: .5, padre: g });
    for (const dz of [-8, 8]) R.tornillo([x + dx, y - op.chapa - 46.4, z + dz], [0, -1, 0], { M: 3.5, L: 2, dk: 6, k: 2, tipo: 'combi', mat: X.galv(), padre: g });
  }
  return g;
}

/** llave encapsulada de un punto (3047 / 3048): caja de aplicar 80 × 80 con la tecla (forma AC) */
export function llaveEncapsulada(R, o, op = {}) {
  const X = MX(R), g = R.grupo(op.padre), [x, y, z] = o, s = op.L || 80;
  R.caja(x - s / 2, x + s / 2, y, y + 32, z - s / 2, z + s / 2, R.M.pa('#ecebe6'), { r: 6, padre: g });
  R.caja(x - 13, x + 13, y + 31.6, y + 33.2, z - 22, z + 22, R.M.pa('#d9d8d1'), { r: 1.5, padre: g });
  const t = R.grupo(g); R.caja(-11, 11, 0, 5, -19, 19, R.M.pa('#f4f3ee', { roughness: .4 }), { r: 2, padre: t }); t.position.set(x, y + 32.8, z); t.rotation.x = .1;
  R.caja(x - 3, x + 3, y + 37.6, y + 38.1, z + 10, z + 13, R.M.pa('#d63a2f'), { r: .3, padre: g });
  for (const [dx, dz] of [[-s / 2 + 8, -s / 2 + 8], [s / 2 - 8, s / 2 - 8]]) R.tornillo([x + dx, y + 32.2, z + dz], [0, 1, 0], { M: 3.5, L: 2, dk: 6.5, k: 1.8, tipo: 'pozi', mat: X.galv(), padre: g });
  R.impreso([op.texto || 'AUT - MAN'], 30, 5, [x, y + 32.05, z - 30], [-1, 0, 0], [0, 0, 1], { padre: g, color: '#30343a', ppm: 40 });
  return g;
}
