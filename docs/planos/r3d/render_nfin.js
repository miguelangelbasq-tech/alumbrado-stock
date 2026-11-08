// node render_nfin.js [ss] [filtro] · renders del grupo «nfin»
const kit = require('./r3dkit');
const L = [['nfin_precintos', 2400, 1300], ['nfin_silicona', 2400, 1400], ['nfin_curva', 2400, 1700], ['nfin_h15', 1600, 1600]];
(async () => {
  const ss = +(process.argv[2] || 1), f = process.argv[3] || '';
  for (const [e, w, h] of L) { if (f && !e.includes(f)) continue;
    const r = await kit.render({ escena: `escenas/${e}.mjs`, salida: `out/${e}.png`, ancho: w, alto: h, ss });
    const nul = Object.entries(r.anclas).filter(([k, v]) => !v || v.some(isNaN)).map(([k]) => k);
    console.log(e, r.ms, 'ms', nul.length ? 'ANCLAS MAL: ' + nul : ''); }
  await kit.cerrar();
})().catch(e => { console.error(e); process.exit(1); });
