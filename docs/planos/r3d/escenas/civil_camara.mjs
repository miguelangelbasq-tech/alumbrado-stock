/* MAT-CAMARAS-1 · cámara de PVC 40 × 40 en la vereda, cortada a cuarto: hormigón pobre de confinación, 2 caños Ø110 que llegan,
 * masilla en la boca del de trabajo (con el cable), tapa 5030 + cordón en el de reserva, marco de bronce y tapa «A.P.» levantada */
import { CAM, PVC, VER } from '../piezas/perfiles_civil.mjs';
import { matsC, tuboB, recta, revol, cte } from '../piezas/civil_util.mjs';
import { bloqueZ, rect2 } from '../piezas/col_util.mjs';
export default function (R) {
  R.vista({ az: -22, el: 26, fov: 15, margen: .03 });
  R.config({ bordeOp: .32, exposicion: .92 });
  const M = matsC(R), T = R.THREE, a = CAM.A / 2, e = CAM.e, B = 560, hp = CAM.hpobre, zf = -CAM.prof;   // fondo interior
  const cu = [-2000, 2000, -2000, 0];                      // se saca la mitad y < 0 (medio corte por el eje)
  const sq = (r) => rect2(-r, r, -r, r);
  const zb = -VER.baldosa, zm = zb - VER.mortero, zc = zm - VER.contrapiso;
  const mk = (cont, huecos, z0, z1, mat) => bloqueZ(R, cont, huecos, z0, z1, mat, { cuarto: cu });
  // terreno y vereda
  mk(sq(B), [sq(a + e + hp)], zf - hp - e, zc, M.relleno);
  mk(sq(B), [], zf - hp - 150, zf - hp - e, M.relleno);
  mk(sq(B), [], zf - hp - 300, zf - hp - 150, M.tierra);
  mk(sq(B), [sq(a + e + 2)], zc, zm, M.hormP);
  mk(sq(B), [sq(a + CAM.marco.ala + 1)], zm, zb, M.mortero);
  // baldosas 200 × 200 con 9 panes (se dibujan solo fuera del marco y del cuarto cortado)
  const P = VER.pan;
  for (let i = -3; i < 3; i++) for (let j = -3; j < 3; j++) {
    const x0 = i * P, y0 = j * P; if (y0 + P <= 0) continue;
    const hue = [sq(a + CAM.marco.ala + 1)];
    const cont = rect2(Math.max(x0, -B) + 1.5, Math.min(x0 + P, B) - 1.5, Math.max(y0, -B) + 1.5, Math.min(y0 + P, B) - 1.5);
    const m = bloqueZ(R, cont, hue, zb, -5, M.baldosa, { cuarto: cu }); if (!m) continue;
    for (let p = 0; p < 3; p++) for (let q = 0; q < 3; q++) {
      const px = x0 + 8 + p * 62, py = y0 + 8 + q * 62; if (Math.abs(px + 26) < a + 32 + 26 && Math.abs(py + 26) < a + 32 + 26) continue; if (py <= 0) continue;
      if (px < -B || py < -B || px + 52 > B || py + 52 > B) continue;
      R.caja(px, px + 52, py, py + 52, -5, 0, M.baldosa, { r: 1.5 });
    }
  }
  // hormigón pobre de confinación (paredes y piso)
  mk(sq(a + e + hp), [sq(a + e)], zf - hp, zc, M.hormP);
  mk(sq(a + e + hp), [], zf - hp - e, zf - e, M.hormP);
  // cámara de PVC: paredes y fondo
  const pared = mk(sq(a + e), [sq(a)], zf, -CAM.marco.ala, M.pvc);
  mk(sq(a + e), [], zf - e, zf, M.pvc);
  // caños: entran por la pared x = +a, a y = ±125 (trabajo y = -125, reserva y = +125)
  const ro = PVC.d110.D / 2, ri = ro - PVC.d110.e, zk = zf + CAM.zCano;
  for (const y of [-125, 125]) tuboB(R, recta([y, a - 12, zk], [y, B + 1, zk]), 0, 1, cte(ro), cte(ri), M.pvc, { n: 2, na: 64, up: [0, 0, 1], matI: M.pvcIn });
  // agujeros en la pared de PVC y en el hormigón (CSG)
  const hueco = (y) => { const c = new T.Mesh(new T.CylinderGeometry(ro + .5, ro + .5, 400, 48)); c.position.set(y, a + 150, zk); return c; };
  const rest = (m) => { let cur = m; for (const y of [-125, 125]) { const h = hueco(y); R.raiz.add(h); h.updateMatrixWorld(); const n = R.restarCSG(cur, h, M.pvcCorte); R.raiz.remove(h); cur.parent.remove(cur); R.raiz.add(n); cur = n; } return cur; };
  rest(pared);
  // masilla 5017 en la boca del caño de trabajo, alrededor del cable
  const masilla = R.M.pa('#8e8775', { roughness: .95 });
  R.torno([-125, a - 14, zk], [-125, a - 40, zk], [[11, 0], [ri, 0], [ri + 2, 6], [ri - 2, 14], [12, 14], [11, 0]], masilla, { seg: 64 });
  // cable que sale del caño y cruza la cámara (cubierta negra)
  const cab = (t) => [-125 + 40 * t * t, a - 20 - 330 * t, zk - (zk - zf - 11) * Math.sin(Math.min(1, t * 2.2) * Math.PI / 2)];
  tuboB(R, cab, 0, 1, cte(10), null, R.M.cable('#202124'), { n: 40, na: 24, up: [0, 1, 0] });
  // tapa 5030 en el de reserva + cordón guía atado
  const Tp = PVC.tapa, j = PVC.enchufe.juego;
  R.torno([125, a - 12, zk], [125, a - 40, zk], [[ro + j, 0], [ro + j + Tp.e, 0], [ro + j + Tp.e, Tp.L * .5], [0, Tp.L * .5], [0, Tp.L * .5 - Tp.fondo], [ro + j, Tp.L * .5 - Tp.fondo]], M.pvcN, { seg: 64 });
  // marco de bronce: ángulo (ala horizontal arriba, ala vertical adentro) y asiento de la tapa
  const mc = CAM.marco, br = M.bronce;
  bloqueZ(R, sq(a + mc.ala), [sq(a)], -mc.e, 0, br, { cuarto: cu });
  bloqueZ(R, sq(a), [sq(a - mc.e)], -mc.ala, 0, br, { cuarto: cu });
  bloqueZ(R, sq(a - mc.e), [sq(a - mc.e - 8)], -CAM.tapa.e - 4, -CAM.tapa.e, br, { cuarto: cu });
  // tapa de bronce levantada y girada, con «A.P.» en relieve y estrías antideslizantes (*)
  const g = R.grupo(), tA = a - mc.e - CAM.tapa.juego;
  R.caja(-tA, tA, -tA, tA, 0, CAM.tapa.e, br, { r: 1.2, padre: g });
  for (let k = -9; k <= 9; k++) { const x = k * 18; if (Math.abs(x) > tA - 22) continue; R.caja(x - 2.5, x + 2.5, -tA + 20, -tA + 70, CAM.tapa.e, CAM.tapa.e + 1.5, br, { r: .6, padre: g }); R.caja(x - 2.5, x + 2.5, tA - 70, tA - 20, CAM.tapa.e, CAM.tapa.e + 1.5, br, { r: .6, padre: g }); }
  R.texto('A.P.', [0, 0, CAM.tapa.e], [1, 0, 0], [0, 1, 0], new R.THREE.MeshPhysicalMaterial({ color: '#7a4c18', metalness: .9, roughness: .45 }), { size: 90, prof: 4, padre: g });
  R.caja(-tA + 10, tA - 10, -tA + 10, tA - 10, -CAM.tapa.nervio, 0, br, { r: 1, padre: g });   // nervio de abajo (*)
  g.position.set(-40, 80, 300); g.rotation.set(.62, -.12, 0);
  // anclas
  R.ancla('tapa', g.localToWorld(new T.Vector3(-tA * .6, tA * .45, CAM.tapa.e + 1.5)).toArray()); R.ancla('leyenda', g.localToWorld(new T.Vector3(40, -20, CAM.tapa.e + 3)).toArray());
  R.ancla('marco', [-(a + mc.ala / 2), 1, 0]); R.ancla('asiento', [(a - mc.e - 4), 1, -CAM.tapa.e - 2]);
  R.ancla('pared', [-a - e / 2, 0, -250]); R.ancla('fondo', [-60, 0, zf - e / 2]); R.ancla('pobre', [-a - e - hp / 2, 0, -380]);
  R.ancla('trabajo', [-125 - ro * .7, a - 12, zk + ro * .7]); R.ancla('masilla', [-125 + ri * .5, a - 40, zk + ri * .5]); R.ancla('reserva', [125 + ro * .6, a - 40, zk + ro * .6]);
  R.ancla('cable', cab(.55)); R.ancla('baldosa', [380, 300, 0]); R.ancla('contrapiso', [B, 0, (zc + zm) / 2]); R.ancla('relleno', [B, 0, -400]);
  R.ancla('mortero', [-B, 0, (zm + zb) / 2]); R.ancla('tierra', [-B, 0, zf - hp - 220]);
}
