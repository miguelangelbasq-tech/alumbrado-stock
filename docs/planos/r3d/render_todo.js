/* renderiza todas las escenas de las fichas piloto y muestra cuánto tarda cada una */
const kit = require('./r3dkit');
const L = [['escenas/bpn_fila.mjs', 'out/bpn_fila.png', 2400, 2000], ['escenas/bpn_peine.mjs', 'out/bpn_peine.png', 2400, 1100],
  ['escenas/tab_par.mjs', 'out/tab_par.png', 2400, 2200], ['escenas/fus10x38.mjs', 'out/fus10x38.png', 2400, 1200],
  ['escenas/base_borne.mjs', 'out/base_borne.png', 2400, 2000], ['escenas/fus_chicos.mjs', 'out/fus_chicos.png', 2400, 1300]];
(async () => {
  const solo = process.argv.slice(2);
  for (const [e, s, w, h] of L) { if (solo.length && !solo.some(x => e.includes(x))) continue; const r = await kit.render({ escena: e, salida: s, ancho: w, alto: h, ss: 2 }); console.log(s, (r.ms / 1000).toFixed(1) + ' s'); }
  await kit.cerrar();
})();
