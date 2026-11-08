/* renderiza las escenas del grupo «conex» (2400 px, supersampling 2×). Uso: node render_conex.js [filtro…] */
const kit = require('./r3dkit');
const L = [['conex_tif_corte', 2400, 1500], ['conex_tif_fila', 2400, 1300], ['conex_ojal', 2400, 1600], ['conex_ojal_bulon', 2400, 1400], ['conex_preais', 2400, 1700],
  ['conex_wago', 2400, 1300], ['conex_gel', 2400, 1100], ['conex_resina', 2400, 1400], ['conex_union', 2400, 1100],
  ['conex_termoj', 2400, 1000], ['conex_qr23', 2400, 1200], ['conex_prensa_corte', 2400, 1700], ['conex_prensa_despiece', 2400, 1000],
  ['conex_riel', 2400, 1700], ['conex_canal', 2400, 1600]];
(async () => {
  const solo = process.argv.slice(2);
  for (const [e, w, h] of L) { if (solo.length && !solo.some(x => e === x)) continue;
    const r = await kit.render({ escena: `escenas/${e}.mjs`, salida: `out/${e}.png`, ancho: w, alto: h, ss: 2 }); console.log(e, (r.ms / 1000).toFixed(1) + ' s', JSON.stringify(r.anclas).includes('null') ? 'ANCLA NULL' : ''); }
  await kit.cerrar();
})();
