// node render_civil.js [ss] [filtro] · renders del grupo «civil» (2400 px de ancho; ss = 2 para la entrega)
const kit = require('./r3dkit');
const L = [
  ['civil_pvc_union', 2400, 1350], ['civil_pvc_cmp', 2400, 1000], ['civil_pvc_det', 2400, 1500], ['civil_pead', 2400, 1300], ['civil_pead_rollo', 2400, 1700], ['civil_corr', 2400, 1800],
  ['civil_camara', 2400, 2200], ['civil_aridos', 2400, 1500], ['civil_granos', 2400, 1350], ['civil_hormigones', 2400, 1100],
  ['civil_mamp', 2400, 1500], ['civil_hierros', 2400, 1600], ['civil_hierro_macro', 2400, 1100], ['civil_anclaje', 2400, 2300], ['civil_anclaje_det', 2400, 2400],
  ['civil_malla', 2400, 1500], ['civil_perlas', 2400, 1700], ['civil_envases', 2400, 1700], ['civil_sello', 2400, 2000],
  ['civil_vereda', 2400, 1800], ['civil_precinto', 2400, 2100], ['civil_fijacion', 2400, 1600], ['civil_fisher', 2400, 1800],
];
(async () => {
  const ss = +(process.argv[2] || 1), f = process.argv[3] || '';
  for (const [e, w, h] of L) { if (f && !e.includes(f)) continue;
    const r = await kit.render({ escena: `escenas/${e}.mjs`, salida: `out/${e}.png`, ancho: w, alto: h, ss });
    const nul = Object.entries(r.anclas).filter(([k, v]) => !v || v.some(isNaN)).map(([k]) => k);
    console.log(e, r.ms, 'ms', nul.length ? 'ANCLAS MAL: ' + nul : ''); }
  await kit.cerrar();
})().catch(e => { console.error(e); process.exit(1); });
