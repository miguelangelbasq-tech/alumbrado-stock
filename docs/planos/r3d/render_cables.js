// render final del grupo «cables» (2400 px, ss 2)
const kit = require('./r3dkit');
const L = process.argv.slice(2);
(async () => { for (const n of L) { const r = await kit.render({ escena: 'escenas/' + n + '.mjs', salida: 'out/' + n + '.png', ancho: 2400, alto: 1800, ss: 2 }); console.log(n, r.ms, Object.entries(r.anclas).filter(([k, v]) => !v || isNaN(v[0])).map(x => x[0]).join(',')); } await kit.cerrar(); })();
