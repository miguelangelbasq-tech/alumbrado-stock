/* MAT-MAMPOSTERIA-2 · detalle de la zona de expansión: el cono sube y abre la camisa contra la pared del agujero */
import base from './civil_anclaje.mjs';
export default function (R) { base(R, { det: true }); R.vista({ az: -32, el: 18, fov: 14, margen: .04 }); }
