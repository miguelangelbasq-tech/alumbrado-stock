// render del grupo «pat»: node render_pat.js [-r] escena1 escena2 …  (-r = prueba rápida 1200 px ss 1)
const kit = require('./r3dkit');
let L = process.argv.slice(2); const rap = L[0] === '-r'; if (rap) L = L.slice(1);
(async () => { for (const n of L) { const r = await kit.render({ escena: 'escenas/' + n + '.mjs', salida: 'out/' + n + (rap ? '_r' : '') + '.png', ancho: rap ? 1200 : 2400, alto: rap ? 900 : 1800, ss: rap ? 1 : 2 }); console.log(n, r.ms, Object.entries(r.anclas).filter(([k, v]) => !v || isNaN(v[0])).map(x => x[0]).join(',')); } await kit.cerrar(); })();
