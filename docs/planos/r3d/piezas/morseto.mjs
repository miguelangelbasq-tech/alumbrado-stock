/* morseto.mjs · morseto de perforación de aislación (IPC) tipo LCT PKD-14 / PKD-16 (Metal-CE 1995/6, /4, /3, /1).
 * Dos mitades de nylon 6/6 + FV que cierran con un bulón M8 de cabeza fusible; los dientes de cobre estañado de la mitad de atrás
 * atraviesan la aislación de la línea (canal de arriba) y de la derivación (canal de abajo). Geometría: MORS de perfiles_cables.mjs (AC).
 * Ejes: cables a lo largo de x; las mitades se separan en y (adelante = +y, donde está la cabeza fusible); z arriba. */
import { MORS, CAB, HAZ } from './perfiles_cables.mjs';
import { tubo, cuerda, mats } from './cables.mjs';

const circ = (cy, cz, r, n = 48) => Array.from({ length: n }, (_, i) => [cy + r * Math.cos(2 * Math.PI * i / n), cz + r * Math.sin(2 * Math.PI * i / n)]);
const rrect = (y0, y1, z0, z1, r, n = 6) => {
  const p = []; const c = [[y1 - r, z1 - r, 0], [y0 + r, z1 - r, 90], [y0 + r, z0 + r, 180], [y1 - r, z0 + r, 270]];
  for (const [cy, cz, a0] of c) for (let i = 0; i <= n; i++) { const a = (a0 + 90 * i / n) * Math.PI / 180; p.push([cy + r * Math.cos(a), cz + r * Math.sin(a)]); }
  return p;
};

/** cables de prueba: línea = fase Al 25 del preensamblado (Ø 9), derivación = Cu 1 × 4 XLPE (1504) */
export function cablesMors(P, op = {}) {
  const lin = op.lin === 'neutro' ? HAZ.h25_50.neu : HAZ.h25_50.fases[0];
  return { lin, der: P.rD > 7 ? HAZ.h25_50.fases[1] : CAB.p1x4.conds[0], linAl: true, derAl: P.rD > 7 };
}

/** morseto completo. op: tipo 'PKD14'|'PKD16', pf (portafusible en lugar del capuchón), abierto (mm de separación de las mitades),
 *  corte (x desde donde se corta a cuarto la parte de arriba) , padre. Devuelve {g, P, anclas} */
export function morseto(R, op = {}) {
  const P = MORS[op.tipo || 'PKD14'], M = mats(R), T = R.THREE;
  const g = R.grupo(op.padre), gc = R.grupo(g);           // gc = lo que se corta
  const ny = R.tipoCorte(R.M.pa('#1b1c1f', { roughness: .55 }), 'plastico');
  const est = R.tipoCorte(new T.MeshPhysicalMaterial({ color: '#b58a5c', metalness: 1, roughness: .32 }), 'metal');   // cobre estañado (tono cálido para que se distinga del aluminio)
  const ac = R.tipoCorte(R.M.aceroCinc(), 'metal');
  const L = P.L, H = P.H, D = P.D, gap = P.gap;
  const ab = op.abierto || 0;
  const cab = cablesMors(P, op);
  const rcP = cab.lin.rc + .35, rcD = cab.der.rc + .35;
  // ---- mitades (perfil (y, z) extruido en x) ----
  const mit = (s) => {   // s = +1 adelante, −1 atrás
    const y0 = s > 0 ? gap / 2 : -D / 2 - ab / 2, y1 = s > 0 ? D / 2 + ab / 2 : -gap / 2;
    const yy0 = s > 0 ? gap / 2 + ab / 2 : -D / 2 - ab / 2, yy1 = s > 0 ? D / 2 + ab / 2 : -gap / 2 - ab / 2;
    const cont = rrect(yy0, yy1, -H / 2, H / 2, 3.5);
    const cav = [circ(s * ab / 2, P.zP, rcP), circ(s * ab / 2, P.zD, rcD)];
    const m = R.perfil(cont, cav, L, ny, { a0: -L / 2, bevel: .8, padre: gc });
    return m;
  };
  let fr = mit(1), at = mit(-1);
  // agujero del bulón (Ø 8,6) en las dos mitades
  for (const k of ['fr', 'at']) {
    const m = k === 'fr' ? fr : at;
    const h = R.cil([0, -D, P.bulon.z], [0, D, P.bulon.z], 4.4, ny, { padre: null, seg: 32 });
    const r = R.restarCSG(m, h, ny); gc.remove(m); gc.add(r);
    if (k === 'fr') fr = r; else at = r;
  }
  // asiento de la cabeza (resalte adelante) y de la tuerca (atrás)
  const yF = D / 2 + ab / 2, yA = -D / 2 - ab / 2;
  R.torno([0, yF - .5, P.bulon.z], [0, yF + 2.5, P.bulon.z], [[4.5, 0], [10, 0], [10, 2.2], [9.2, 3], [4.5, 3]], ny, { padre: gc, seg: 48 });
  R.torno([0, yA + .5, P.bulon.z], [0, yA - 2.5, P.bulon.z], [[4.5, 0], [10, 0], [10, 2.2], [9.2, 3], [4.5, 3]], ny, { padre: gc, seg: 48 });
  // nervios laterales (rigidez) en las caras ±x del cuerpo, arriba y abajo de los canales
  // ---- dientes (cobre estañado) en la mitad de atrás: una placa con dientes hacia +y en cada canal ----
  const dz = (r) => [-r * .45, 0, r * .45];
  const xcorte = op.corte !== undefined ? op.corte : null;
  const dientes = (zc, rc, R0) => {
    for (const x0 of P.dientes.x) for (const z of dz(R0)) {
      const tip = -Math.sqrt(Math.max(R0 * R0 - z * z, 0)) + .3 - ab / 2;   // la punta llega al conductor
      const base = -rc - 1.2 - ab / 2;
      const w = 1.7, t = 1.6;   // ancho en z, espesor en x
      // la fila que cae en el corte se corre para que su cara quede justo en el plano de corte (se ve entera)
      const x = (xcorte !== null && Math.abs(x0 - xcorte) < 1e-6) ? xcorte - t / 2 + .06 : x0;
      const pf = [[base, zc + z - w], [base, zc + z + w], [tip, zc + z + .15], [tip, zc + z - .15]];
      const m = R.perfil(pf, [], t, est, { a0: x - t / 2, bevel: 0, padre: gc });
      if (x !== x0) m.userData.noCortar = true;
    }
    // placa de contacto (puente de cobre estañado entre los dos canales)
  };
  dientes(P.zP, rcP, cab.lin.R); dientes(P.zD, rcD, cab.der.R);
  const xp0 = P.dientes.x[0] - 1.2, xp1 = P.dientes.x[P.dientes.x.length - 1] + 1.2;
  R.caja(xp0, xp1, -Math.max(rcP, rcD) - 2.6 - ab / 2, -Math.max(rcP, rcD) - 1.2 - ab / 2, P.zD - rcD * .7, P.zP + rcP * .7, est, { r: .2, padre: gc });
  // ---- bulón M8 con cabeza fusible + tuerca ----
  const b = P.bulon, hex = (p0, p1, af) => R.cil(p0, p1, af / Math.sqrt(3), ac, { seg: 6, padre: gc });
  const yb = yF + 2.5;
  hex([0, yb, b.z], [0, yb + 5, b.z], b.cab);                                    // cabeza que queda
  R.cil([0, yb + 5, b.z], [0, yb + 5 + b.cuello, b.z], 2.6, ac, { padre: gc, seg: 32 });   // cuello que se corta
  hex([0, yb + 5 + b.cuello, b.z], [0, yb + 5 + b.cuello + b.k, b.z], b.cab);    // cabeza fusible
  R.cil([0, yA - 2.5, b.z], [0, yb, b.z], 4, ac, { padre: gc, seg: 32 });        // vástago
  hex([0, yA - 2.5, b.z], [0, yA - 9, b.z], b.tuerca);                           // tuerca
  R.cil([0, yA - 9, b.z], [0, yA - 11, b.z], 3.6, ac, { padre: gc, seg: 32 });   // punta del bulón
  // leyendas en relieve en la cara de adelante
  const yt = yF + .02;
  R.texto(op.tipo === 'PKD16' ? 'PKD-16' : 'PKD-14', [0, yt, H / 2 - 6], [-1, 0, 0], [0, 0, 1], ny, { size: 3.2, prof: .3, padre: g });
  R.texto(P.rango[0].replace('–', '-').replace(' mm²', ''), [0, yt, P.zP - rcP - 3.2], [-1, 0, 0], [0, 0, 1], ny, { size: 2.2, prof: .25, padre: g });
  R.texto(P.rango[1].replace('–', '-').replace(' mm²', '').replace(',', '.'), [0, yt, P.zD + rcD + 3], [-1, 0, 0], [0, 0, 1], ny, { size: 2.2, prof: .25, padre: g });
  R.texto('1kV', [0, yt, -H / 2 + 5], [-1, 0, 0], [0, 0, 1], ny, { size: 2.4, prof: .25, padre: g });
  // ---- capuchón de la derivación (o portafusible) ----
  if (P.capuchon && !op.pf) {
    const c = P.capuchon;
    R.torno([L / 2 - 1, 0, P.zD], [L / 2 + c.L, 0, P.zD], [[rcD, 0], [c.r + 1.2, 0], [c.r + 1.2, 2], [c.r, 3], [c.r, c.L - .2], [c.r - 1.2, c.L + 1], [0, c.L + 1]], R.tipoCorte(R.M.goma('#222326'), 'plastico'), { padre: gc, seg: 48 });
  }
  if (op.pf) {   // portafusible tipo Neozed (AC): cuerpo + tapa roscada gris; la salida a la luminaria sale por la tapa
    R.torno([L / 2 - 1, 0, P.zD], [L / 2 + 30, 0, P.zD], [[rcD, 0], [9.5, 0], [9.5, 2], [10.5, 3], [10.5, 30], [0, 30]], ny, { padre: gc, seg: 48 });
    const tapa = []; for (let i = 0; i <= 16; i++) tapa.push([i % 2 ? 10.6 : 11.2, 30 + i * 1.2]); tapa.push([7, 50]); tapa.push([4, 52]);
    R.torno([L / 2 + 29, 0, P.zD], [L / 2 + 81, 0, P.zD], tapa.map(([r, t]) => [r, t - 30]), R.M.pa('#8e9399'), { padre: g, seg: 48 });
  }
  // ---- cables ----
  const xc = op.corte !== undefined ? op.corte : null;
  const lin = (x) => [x, -ab / 2 * 0, P.zP];
  const xl1 = xc !== null ? xc : (op.linFin || 80);
  tubo(R, lin, op.linIni || -90, xl1, cab.lin.rc, M.ais('XN'), { padre: g, rad: 48, tapas: false });
  for (const xx of (xc !== null ? [op.linIni || -90] : [op.linIni || -90, xl1])) { const an = new T.Mesh(new T.RingGeometry(cab.lin.R, cab.lin.rc, 64), M.ais('XN')); an.position.set(xx, 0, P.zP); an.rotation.y = xx > 0 ? Math.PI / 2 : -Math.PI / 2; R.sinBorde(an); g.add(an); }
  cuerda(R, lin, (op.linIni || -90) + .5, xl1, cab.lin, cab.linAl ? M.al : M.cu, { padre: g, paso: cab.lin.R * 14, rad: 14, tapas: true });
  if (xc !== null) {   // tapa de la aislación cortada
    const an = new T.Mesh(new T.RingGeometry(cab.lin.R, cab.lin.rc, 64), M.ais('XN')); an.position.set(xc - .01, 0, P.zP); an.rotation.y = Math.PI / 2; R.sinBorde(an); g.add(an);
  }
  const der = (x) => [x, 0, P.zD];
  const xd1 = op.pf ? L / 2 + 6 : (P.capuchon ? L / 2 + P.capuchon.L - 1 : (op.derFin || 70));
  const pel = !P.capuchon && !op.pf;
  tubo(R, der, op.derIni || -80, xd1, cab.der.rc, M.ais('XN'), { padre: g, rad: 40, tapas: pel ? false : true });
  if (pel) for (const xx of [op.derIni || -80, xd1]) { const an = new T.Mesh(new T.RingGeometry(cab.der.R, cab.der.rc, 64), M.ais('XN')); an.position.set(xx, 0, P.zD); an.rotation.y = xx > 0 ? Math.PI / 2 : -Math.PI / 2; R.sinBorde(an); g.add(an); }
  if (pel) cuerda(R, der, (op.derIni || -80) + .5, xd1, cab.der, cab.derAl ? M.al : M.cu, { padre: g, paso: cab.der.R * 14, rad: 12, tapas: true });
  if (op.pf) {   // salida a la luminaria desde la tapa
    const s = (x) => [x, 0, P.zD];
    tubo(R, s, L / 2 + 50, L / 2 + 120, CAB.p1x4.conds[0].rc, M.ais('XN'), { padre: g, rad: 40 });
  }
  if (xc !== null) R.cortar(gc, [xc, L + 200, -200, 200, P.bulon.z + 5.2, H + 100]);
  return { g, P, cab, rcP, rcD, yF, yA, yb };
}
