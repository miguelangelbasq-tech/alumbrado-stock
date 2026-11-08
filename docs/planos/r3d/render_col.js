/* renderiza las escenas del grupo «col» (node render_col.js [filtro…]) */
const kit = require('./r3dkit');
const L = [['col_prfv_base', 2000, 2400], ['col_prfv_cajas', 2000, 2400], ['col_met_base', 2000, 2400], ['col_met_puerta', 2000, 2400],
  ['col_vin1', 2400, 2200], ['col_vin_fam', 2400, 1500], ['col_vin2', 2400, 1300], ['col_bhg', 2400, 1500], ['col_bhg_det', 2400, 1100],
  ['col_apo1', 2000, 2400], ['col_apo1_esc', 2000, 2200], ['col_apo2', 2400, 1900], ['col_lum_ext', 2400, 1600], ['col_lum_corte', 2400, 1050], ['col_e27', 2000, 2200]];
(async () => {
  const solo = process.argv.slice(2);
  for (const [e, w, h] of L) {
    if (solo.length && !solo.includes(e)) continue;
    const r = await kit.render({ escena: `escenas/${e}.mjs`, salida: `out/${e}.png`, ancho: w, alto: h, ss: 2, verLogs: false });
    const nul = Object.entries(r.anclas).filter(([k, v]) => !v || v.some(isNaN)).map(([k]) => k);
    console.log(e, (r.ms / 1000).toFixed(1) + ' s', nul.length ? 'ANCLAS MAL: ' + nul : '');
  }
  await kit.cerrar();
})();
