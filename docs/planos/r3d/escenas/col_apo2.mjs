/* MAT-APOYOS-2 · los tres postes de 8,5 m al pie, cortados a un cuarto: H°A° pretensado Ro 1050 (6023, en H-15) y Ro 750 (6501, directo) de
 * sección anular con los alambres de pretensado, y madera de eucaliptus salinizado (6502) con la albura impregnada. Ø y pared: (*) */
import { matsCol, bloqueZ, rect2, circ, tornoZP, APO } from '../piezas/col_util.mjs';
export default function (R) {
  R.vista({ az: -34, el: 18, fov: 12, margen: .03 }); R.config({ exposicion: .92, ambiente: .55 });
  const C = matsCol(R), Q = [-2000, 0, -2000, 0];
  APO.ha.forEach((p, i) => {
    const g = R.grupo(); g.position.x = i * 900;
    const rz = (z) => (p.dc + p.k * (p.L - p.emp - z) / 1000) / 2, top = 600, B = 360;
    const hoyo = i === 0 ? 300 : rz(-p.emp) + 1;
    bloqueZ(R, rect2(-B, B, -B, B), [circ(0, 0, hoyo)], -p.emp - 150, -60, C.tierra, { cuarto: Q, padre: g });
    bloqueZ(R, rect2(-B, B, -B, B), [circ(0, 0, hoyo)], -60, 0, C.pasto, { cuarto: Q, padre: g });
    if (i === 0) tornoZP(R, 0, 0, -p.emp - 150, [[rz(-p.emp) + .3, 150], [300, 0], [300, p.emp + 150], [rz(0) + .3, p.emp + 150], [rz(-p.emp) + .3, 150], [0, 150], [0, 0]].slice(0, 5).concat([]), -90, 180, C.horm, { padre: g });
    if (p.e) {
      const pf = (z0, z1) => [[rz(z0) - p.e, 0], [rz(z0), 0], [rz(z1), z1 - z0], [rz(z1) - p.e, z1 - z0]];
      tornoZP(R, 0, 0, -p.emp, pf(-p.emp, top), -90, 180, C.hormHA, { padre: g, seg: 112 });
      // alambres de pretensado (se ven en las dos caras del corte)
      for (const a of [-90, 180]) for (const f of [.3, .7]) {
        const ar = a * Math.PI / 180, rr = (z) => rz(z) - p.e * f;
        R.cil([Math.cos(ar) * rr(-p.emp) + (a === -90 ? -.6 : 0), Math.sin(ar) * rr(-p.emp) + (a === 180 ? -.6 : 0), -p.emp], [Math.cos(ar) * rr(top) + (a === -90 ? -.6 : 0), Math.sin(ar) * rr(top) + (a === 180 ? -.6 : 0), top], 2.5, C.acero, { seg: 12, padre: g });
      }
    } else {
      const al = 22; C.madera.userData._mc = C.maderaCorte;
      tornoZP(R, 0, 0, -p.emp, [[0, 0], [rz(-p.emp) - al, 0], [rz(top) - al, top + p.emp], [0, top + p.emp]], -90, 180, C.madera, { padre: g, seg: 112 });
      const imp = R.tipoCorte(R.M.pa('#6f7a3c', { roughness: .85 }), 'plastico');
      tornoZP(R, 0, 0, -p.emp, [[rz(-p.emp) - al, 0], [rz(-p.emp), 0], [rz(top), top + p.emp], [rz(top) - al, top + p.emp]], -90, 180, imp, { padre: g, seg: 112 });
      C.madera.userData._mc = C.maderaCorte;
    }
    R.ancla('p' + p.cod, [i * 900 - rz(300) * .7, -rz(300) * .7, 300]);
    R.ancla('e' + p.cod, [i * 900 - 1, -rz(-p.emp / 2) + 8, -p.emp / 2]);
    R.ancla('f' + p.cod, [i * 900 - 1, -rz(-p.emp) + 4, -p.emp + 30]);
  });
  R.ancla('h15', [-1, -270, -1000]);
  R.ancla('alambre', [-1, -(APO.ha[0].dc / 2 + 15 * 1.6 - 55 * .3), 450]);
}
