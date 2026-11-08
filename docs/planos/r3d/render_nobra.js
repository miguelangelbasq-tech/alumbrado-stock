// node render_nobra.js [ss] [filtro] · renders del grupo «nobra» (productos nuevos del pañol; 2400 px de ancho, ss = 2 para la entrega)
const kit = require('./r3dkit');
const L = [
  ['nobra_caja6024', 2400, 1500], ['nobra_canal60', 2400, 1500], ['nobra_precintos', 2400, 1300], ['nobra_cinta43', 2400, 1500], ['nobra_hdx', 2400, 1300], ['nobra_her4', 2400, 1600], ['nobra_fund', 2000, 2400], ['nobra_fund_mat', 2400, 1500], ['nobra_senal', 2400, 1600], ['nobra_lum', 2400, 1400], ['nobra_scup', 2000, 1700],
];
(async () => {
  const ss = +(process.argv[2] || 1), f = process.argv[3] || '';
  for (const [e, w, h] of L) { if (f && !e.includes(f)) continue;
    const r = await kit.render({ escena: `escenas/${e}.mjs`, salida: `out/${e}.png`, ancho: w, alto: h, ss });
    const nul = Object.entries(r.anclas).filter(([k, v]) => !v || v.some(isNaN)).map(([k]) => k);
    console.log(e, r.ms, 'ms', nul.length ? 'ANCLAS MAL: ' + nul : ''); }
  await kit.cerrar();
})().catch(e => { console.error(e); process.exit(1); });
