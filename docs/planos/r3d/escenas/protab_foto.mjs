/* MAT-FOTOCONTROL-1 · fotocontrol NEMA de 3 patas (3012 / 3031) arriba de su zócalo (3072), separados para ver las patas;
 * el fotocontrol cortado a cuarto (placa, relé, varistor, fotocélula). PRM.patas: el fotocontrol dado vuelta al lado del zócalo (vista de las patas y de las ranuras). */
import { fotocontrol, zocaloFoto } from '../piezas/protab_caja.mjs';
import { FOTO } from '../piezas/perfiles_protab.mjs';
export default function (R, PRM = {}) {
  const F = FOTO;
  if (PRM.patas) {
    R.vista({ az: 160, el: 52, fov: 14, margen: .04 });
    const g = R.grupo(); fotocontrol(R, 0, 0, 0, { padre: g }); g.rotation.x = Math.PI; g.position.set(-100, 0, F.H);
    zocaloFoto(R, 0, 0, 0, { largo: 40 });
    const p = (a, r, z, x0 = 0, s = 1) => [x0 + r * Math.cos(a * Math.PI / 180), s * r * Math.sin(a * Math.PI / 180), z];
    R.ancla('pataN', p(-90, F.rPatas, F.H + F.pata.largo, -100)); R.ancla('pataL', p(-210, F.rPatas, F.H + F.pata.largo, -100)); R.ancla('pataC', p(-330, F.rPatas, F.H + F.pata.largo, -100));
    R.ancla('pie', p(-(F.patas[0].a + F.patas[0].ancho / 2 - 4), F.rPatas + 2.5, F.H + F.pata.largo - 1.5, -100));
    R.ancla('juntaF', p(-150, 30, F.H + 1.8, -100));
    R.ancla('ranura', p(F.patas[1].a, F.rPatas, .3)); R.ancla('contacto', p(F.patas[2].a + F.patas[2].ancho / 2 + 20, F.rPatas, -6)); R.ancla('juntaZ', p(20, 28, 1.2)); R.ancla('zocalo', p(-60, F.zocalo.D / 2, -10));
    return;
  }
  R.vista({ az: 140, el: 18, fov: 14, margen: .03 });
  zocaloFoto(R, 0, 0, 0, { largo: 70 });
  const z1 = 46;
  fotocontrol(R, 0, 0, z1, { interior: true, cortar: [0, 60, 0, 60, z1 - 20, z1 + 80], ventana: 128 });
  R.ancla('tapa', [28, -28, z1 + 50]); R.ancla('ventana', [F.tapa.D / 2 * Math.cos(128 * Math.PI / 180), F.tapa.D / 2 * Math.sin(128 * Math.PI / 180), z1 + F.ventana.z + 6]); R.ancla('base', [-30, 30, z1 + 5]);
  R.ancla('pata', [F.rPatas * Math.cos(210 * Math.PI / 180), F.rPatas * Math.sin(210 * Math.PI / 180), z1 - 8]);
  R.ancla('pcb', [16, 1.1, z1 + 40]); R.ancla('rele', [-12, 10, z1 + F.base.h + 18]); R.ancla('mov', [12, 4, z1 + F.base.h + 14]); R.ancla('celula', [(F.tapa.D / 2 - 12) * Math.cos(128 * Math.PI / 180), (F.tapa.D / 2 - 12) * Math.sin(128 * Math.PI / 180), z1 + F.ventana.z]);
  R.ancla('zocalo', [F.zocalo.D / 2 * .7, -F.zocalo.D / 2 * .7, -12]); R.ancla('junta', [-30, -5, .6]);
  R.ancla('negro', [9 * Math.cos(100 * Math.PI / 180), 9 * Math.sin(100 * Math.PI / 180), -F.zocalo.h - 30]);
  R.ancla('rojo', [9 * Math.cos(144 * Math.PI / 180) + 10, 9 * Math.sin(144 * Math.PI / 180) + 8, -F.zocalo.h - 60]);
}
