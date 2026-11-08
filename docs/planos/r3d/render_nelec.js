/* renderiza las escenas del grupo «nelec» (node render_nelec.js [nombre…] [--rapido]) */
const kit = require('./r3dkit');
const L = { nelec_bor3: [2400, 1700], nelec_bor3_exp: [2400, 1500, 'nelec_bor3', { explotado: 1 }],
  nelec_tm2: [2400, 1700], nelec_tm2_corte: [2400, 2000, 'nelec_tm2', { corte: 1 }] ,
  nelec_foto2: [2400, 1500] ,
  nelec_com2: [2400, 1800] ,
  nelec_tab4: [2400, 2300] ,
  nelec_fichas: [2400, 1350] ,
  nelec_ident: [2400, 1700] ,
  nelec_sub3: [2400, 1500], nelec_sub3b: [2400, 1300, 'nelec_sub3', { b: 1 }], nelec_uni: [2400, 1250] };
(async () => {
  const args = process.argv.slice(2), rap = args.includes('--rapido'), solo = args.filter(a => !a.startsWith('--'));
  for (const [n, [w, h, esc, prm]] of Object.entries(L)) {
    if (solo.length && !solo.includes(n)) continue;
    const r = await kit.render({ escena: `escenas/${esc || n}.mjs`, salida: `out/${n}.png`, ancho: rap ? w / 2 : w, alto: rap ? h / 2 : h, ss: rap ? 1 : 2, verLogs: true, params: prm });
    const nul = Object.entries(r.anclas).filter(([k, v]) => !v || v.some(isNaN)).map(([k]) => k);
    console.log(n, (r.ms / 1000).toFixed(1) + ' s', nul.length ? 'ANCLAS MAL: ' + nul : '');
  }
  await kit.cerrar();
})();
