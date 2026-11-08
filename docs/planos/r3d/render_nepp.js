// render del grupo «nepp»: node render_nepp.js [-r] escena1 …  (-r = prueba rápida 1200 px ss 1)
const kit = require('./r3dkit');
let L = process.argv.slice(2); const rap = L[0] === '-r'; if (rap) L = L.slice(1);
let W = 2400, H = 1800; const m = L[0] && L[0].match(/^(\d+)x(\d+)$/); if (m) { W = +m[1]; H = +m[2]; L = L.slice(1); }
(async () => { for (const n of L) { const r = await kit.render({ escena: 'escenas/' + n + '.mjs', salida: 'out/' + n + (rap ? '_r' : '') + '.png', ancho: rap ? W / 2 : W, alto: rap ? H / 2 : H, ss: rap ? 1 : 2 }); console.log(n, r.ms, Object.entries(r.anclas).filter(([k, v]) => !v || isNaN(v[0])).map(x => x[0]).join(',')); } await kit.cerrar(); })();
