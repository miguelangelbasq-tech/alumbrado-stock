/* MAT-FOTOCONTROL-2 · 3089 electrónico rojo (9FENC) y 3090 mecánico-térmico amarillo (8FN2C), cortados a cuarto, sobre el zócalo NEMA (3072).
 * Cuerpo y patas: fotocontrol() / zocaloFoto() de protab_caja (no se tocan). Mecanismo térmico (bimetal + calefactor + LDR CdS) AC */
import { fotocontrol, zocaloFoto } from '../piezas/protab_caja.mjs';
import { FOTO } from '../piezas/perfiles_protab.mjs';
import { MX, helice } from '../piezas/protab_util.mjs';
export default function (R, PRM = {}) {
  const X = MX(R);
  R.vista({ az: 18, el: 18, fov: 14, margen: .04 });
  const xe = -52, xm = 52, z0 = 27.4, b = FOTO.base.h;
  const cutE = [xe, xe + 60, -60, 0, z0 - 2, z0 + 90], cutM = [xm, xm + 60, -60, 0, z0 - 2, z0 + 90];
  fotocontrol(R, xe, 0, z0, { colorTapa: '#c8302c', colorBase: '#2b2d31', interior: true, ventana: 255, cortar: cutE });
  const gm = fotocontrol(R, xm, 0, z0, { colorTapa: '#f2c418', colorBase: '#2b2d31', ventana: 255, cortar: cutM });
  // mecanismo térmico (esquema AC): fotorresistencia CdS detrás de la ventana, resistencia calefactora enrollada en el bimetal, contacto NC
  const g = R.grupo(); const zb = z0 + b;
  R.caja(xm - 26, xm + 26, -2, 2, zb, zb + 6, R.M.pa('#e8e3d4'), { r: .6, padre: g });                         // zócalo interior de baquelita
  R.caja(xm + 4, xm + 6, -1.2, 1.2, zb + 6, zb + 42, X.bimetal(), { r: .2, padre: g });                         // tira bimetálica
  helice(R, [xm + 5, 0, zb + 12], [xm + 5, 0, zb + 32], 2.4, 14, .32, X.esmalte(), { padre: g });              // calefactor
  R.caja(xm - 10, xm + 4, -1.6, 1.6, zb + 40, zb + 42.5, X.cobre(), { r: .2, padre: g });                       // lámina del contacto
  R.cil([xm - 9, 0, zb + 40], [xm - 9, 0, zb + 38.6], 1.6, X.plata(), { padre: g, seg: 20 });                   // contacto móvil
  R.caja(xm - 12, xm - 6, -1.6, 1.6, zb + 6, zb + 37.4, X.cobre(), { r: .2, padre: g });                        // contacto fijo (soporte)
  R.cil([xm - 9, 0, zb + 37.4], [xm - 9, 0, zb + 38.6], 1.6, X.plata(), { padre: g, seg: 20 });
  const a = 255 * Math.PI / 180, rr = 30;
  R.cil([xm + rr * Math.cos(a), rr * Math.sin(a), z0 + FOTO.ventana.z], [xm + (rr - 4) * Math.cos(a), (rr - 4) * Math.sin(a), z0 + FOTO.ventana.z], 5, R.M.pa('#d8cfa8'), { padre: g, seg: 32 });
  R.cil([xm + (rr + .2) * Math.cos(a), (rr + .2) * Math.sin(a), z0 + FOTO.ventana.z], [xm + rr * Math.cos(a), rr * Math.sin(a), z0 + FOTO.ventana.z], 4.4, R.M.pa('#b5562a', { roughness: .3 }), { padre: g, seg: 32 });
  for (const dx of [-14, 0, 14]) R.cil([xm + dx * .8, 0, z0 + .5], [xm + dx * .8, 0, zb + 3], .8, X.cobreEst(), { padre: g, seg: 12 });
  zocaloFoto(R, xe, 0, 26, { largo: 30 }); zocaloFoto(R, xm, 0, 26, { largo: 30 });
  R.ancla('rojo', [xe - 20, 25, z0 + 52]); R.ancla('amar', [xm - 20, 25, z0 + 52]);
  R.ancla('pcb', [xe + 10, 0, z0 + 30]); R.ancla('rele', [xe - 12, 9, z0 + 22]); R.ancla('vari', [xe + 12, 5, z0 + 23]);
  R.ancla('bim', [xm + 5, -1.2, zb + 36]); R.ancla('calef', [xm + 7.5, 0, zb + 20]); R.ancla('cont', [xm - 9, -1.6, zb + 39]); R.ancla('ldr', [xm + rr * Math.cos(a), rr * Math.sin(a), z0 + FOTO.ventana.z + 4]);
  R.ancla('base', [xm + 40, -10, z0 + 5]); R.ancla('zoc', [xe - 20, -30, 12]); R.ancla('vent', [xe + 40 * Math.cos(a), 40 * Math.sin(a), z0 + FOTO.ventana.z]);
}
