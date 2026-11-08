/* MAT-BRAZO_HG-1 · brazo H°G° 2,13 m (4501) sobre poste de H°A° Ø≈220 (*): 2 abrazaderas con bulones Ø12 × 90 (4018), tensor, rosca de la
 * punta con el acople Ø60 × 150 enroscado y la luminaria LED montada. Todo lo fino: ESQUEMA (*). */
import { matsCol, brazoHG, luminaria, tornoZP, BHG, LUM } from '../piezas/col_util.mjs';
export default function (R) {
  R.vista({ az: -25, el: 14, fov: 12, margen: .03 }); R.config({ exposicion: .92, ambiente: .55 });
  const C = matsCol(R), D = BHG.posteD;
  tornoZP(R, 0, 0, -350, [[0, 0], [D / 2 + 6, 0], [D / 2 - 6, 1350], [0, 1350]], 45, 405, C.hormHA, { tapas: false, seg: 96 });
  const b = brazoHG(R, D, 650, { acopleSep: 0 });
  const gl = R.grupo(); luminaria(R, { padre: gl, nema: 'foto' });
  const o = b.a1.clone().addScaledVector(b.dir, -130);
  gl.position.copy(o); gl.position.z -= LUM.acople.z; gl.rotation.y = -Math.atan2(b.dir.z, b.dir.x);
  R.ancla('brazo', b.p0.clone().addScaledVector(b.dir, 700).toArray());
  R.ancla('tensor', b.q0.clone().lerp(b.q1, .5).toArray());
  R.ancla('abrA', [-D / 2 - 6, -D / 2 * .4, 650 + 26]);
  R.ancla('abrT', [-D / 2 - 6, -D / 2 * .4, 650 - BHG.sep + 26]);
  R.ancla('bulon', [D / 2 + 26, -14, 650]);
  R.ancla('poste', [-D / 2 * .7, -D / 2 * .7, 200]);
  R.ancla('acople', b.a0.clone().lerp(b.a1, .3).add(new R.THREE.Vector3(0, -31, 0)).toArray());
  R.ancla('lum', o.clone().addScaledVector(b.dir, 380).add(new R.THREE.Vector3(0, -156, -10)).toArray());
}
