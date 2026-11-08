/* MAT-JABALINA-2 · tomacable de bronce en la cabeza de la jabalina 5/8": cuerpo cortado a cuarto, puente que aprieta la cuerda del 1 × 10 V/A, bulón M10 */
import { JAB, TOMA } from '../piezas/perfiles_pat.mjs';
import { matsP, revol, tomacable, cableVA } from '../piezas/pat.mjs';
export default function (R) {
  R.vista({ az: -28, el: 30, fov: 13, margen: .05 });
  R.config({ bordeOp: .35 });
  const M = matsP(R), r = JAB.j58.D / 2, cte = (k) => () => k, zc = -24;
  // jabalina (cabeza a z = 0, se ve un tramo de 130)
  revol(R, { p0: [0, 0, 0], dir: [0, 0, -1], L: 130, ro: (th, z) => z < 1.5 ? r - 1.5 + z : r, mat: M.cobre, matC: M.cobreC, nt: 96, dz: .5, tapa1: false });
  const t = tomacable(R, 0, 0, zc);
  R.cortar(t.g.userData.cuerpo.parent, [t.W0 - 2, t.xb - 1, -40, 0, zc, 40]);
  // cable 1 × 10 V/A que baja paralelo a la jabalina: aislación hasta 6 mm arriba del cuerpo, cuerda adentro hasta el fondo
  const f = (s) => s < 60 ? [t.xc + 60 * 0 + 0, 0, zc - TOMA.H / 2 + 2 + (130 - s) * 0 + 0] : [0, 0, 0];
  const g = (s) => { // s: 0 (punta en el fondo del cuerpo) → sube 40 y curva hacia +y
    const zt = zc + TOMA.H / 2 + 8;
    if (s <= 46) return [t.xc, 0, zc - TOMA.H / 2 + 1.5 + s];
    const a = Math.min((s - 46) / 30, 1) * Math.PI / 2, R0 = 30; const z0 = zc - TOMA.H / 2 + 1.5 + 46;
    if (s <= 46 + R0 * Math.PI / 2) { const b = (s - 46) / R0; return [t.xc, R0 - R0 * Math.cos(b), z0 + R0 * Math.sin(b)]; }
    return [t.xc, R0 + (s - 46 - R0 * Math.PI / 2), z0 + R0];
  };
  cableVA(R, (s) => g(150 - s), 0, 115, 148, { up: [1, 0, 0], n: 160, franjas: [100, 280] });
  R.ancla('cuerpo', [t.W0 + 2, -TOMA.E / 2, zc + 6]); R.ancla('corte', [t.W0 + 3, -TOMA.E / 4, zc + .2]);
  R.ancla('jabalina', [-r * .7, -r * .7, -100]); R.ancla('cuerda', [t.xc, -1.5, zc - 2]); R.ancla('puente', [t.xc + 4, -5, zc]);
  R.ancla('bulon', [t.xb + TOMA.bulon.k * .5, -TOMA.bulon.af / 2, zc]); R.ancla('cable', [t.xc, 40, zc + TOMA.H / 2 + 34]); R.ancla('aisl', [t.xc + 2, -2, zc + TOMA.H / 2 + 12]);
  R.ancla('contacto', [r, -1, zc - 6]);
}
