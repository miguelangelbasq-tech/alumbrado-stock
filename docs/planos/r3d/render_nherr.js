// node render_nherr.js [ss] [filtro] · renders del grupo «nherr» (herramientas; 2400 px de ancho; ss = 2 para la entrega)
const kit = require('./r3dkit');
const L = [
  ['nherr_pinzas', 2400, 1900], ['nherr_pinza_corte', 2400, 1500], ['nherr_criquet', 2400, 1900], ['nherr_destor', 2400, 1700], ['nherr_llaves', 2400, 1800], ['nherr_mazas', 2400, 1800], ['nherr_frat', 2400, 1800], ['nherr_discos', 2400, 1700], ['nherr_mechas', 2400, 1500], ['nherr_cajas', 2400, 1700], ['nherr_varios1', 2400, 1700], ['nherr_varios2', 2400, 1900], ['nherr_pilas', 2400, 1200],
];
(async () => {
  const ss = +(process.argv[2] || 1), f = process.argv[3] || '';
  for (const [e, w, h] of L) { if (f && !e.includes(f)) continue;
    const r = await kit.render({ escena: `escenas/${e}.mjs`, salida: `out/${e}.png`, ancho: w, alto: h, ss });
    const nul = Object.entries(r.anclas).filter(([k, v]) => !v || v.some(isNaN)).map(([k]) => k);
    console.log(e, r.ms, 'ms', nul.length ? 'ANCLAS MAL: ' + nul : ''); }
  await kit.cerrar();
})().catch(e => { console.error(e); process.exit(1); });
