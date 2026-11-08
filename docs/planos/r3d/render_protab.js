/* renderiza las escenas del grupo «protab» (node render_protab.js [filtro…]) */
const kit = require('./r3dkit');
const L = [['protab_tm_fila', 2400, 1880], ['protab_tm_corte', 2400, 2200], ['protab_di_fila', 2400, 1900], ['protab_di_toro', 2400, 1920],
  ['protab_ct', 2400, 1900], ['protab_ct_sel', 2400, 1500], ['protab_bor2', 2400, 1800], ['protab_bor2_acc', 2400, 1100], ['protab_cc1', 2400, 1960],
  ['protab_cc2', 2400, 1530], ['protab_cc2_prfv', 2400, 1090], ['protab_tab1', 2400, 2500], ['protab_tab1_cierre', 2400, 1400], ['protab_tab2', 2400, 2590], ['protab_tab2_det', 2400, 2590], ['protab_tab3', 2400, 2400], ['protab_tab3_nh', 2400, 1500],
  ['protab_foto', 2400, 2670], ['protab_foto_zoc', 2400, 1310]];
(async () => {
  const solo = process.argv.slice(2); const fs = require('fs');
  for (const [e, w, h] of L) {
    if (solo.length ? !solo.some(x => e === x) : false) continue;
    if (!fs.existsSync(`escenas/${e}.mjs`)) continue;
    const r = await kit.render({ escena: `escenas/${e}.mjs`, salida: `out/${e}.png`, ancho: w, alto: h, ss: 2, verLogs: false });
    const nul = Object.entries(r.anclas).filter(([k, v]) => !v || v.some(isNaN)).map(([k]) => k);
    console.log(e, (r.ms / 1000).toFixed(1) + ' s', nul.length ? 'ANCLAS MAL: ' + nul : '');
  }
  await kit.cerrar();
})();
