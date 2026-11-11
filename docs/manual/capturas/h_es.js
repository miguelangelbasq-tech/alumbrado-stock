// El arnés de las pruebas, con el navegador en castellano (fechas dd/mm/aaaa en los campos de fecha)
const T = process.env.T || '/tmp/claude-0/-home-user-alumbrado-stock/fe896edf-889c-50c7-8615-83acf3badc27/scratchpad/t';
const H = require(T + '/h');
const { chromium } = require('/opt/node-tools/node_modules/playwright');
async function abrir(op = {}) {
  if (!op.browser) {
    const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--lang=es-AR'] });
    const nc = br.newContext.bind(br); br.newContext = (x) => nc(Object.assign({}, x, { locale: 'es-AR' }));
    op = Object.assign({}, op, { browser: br });
  }
  return H.abrir(op);
}
module.exports = Object.assign({}, H, { abrir, otraPagina: (base, op = {}) => H.abrir(Object.assign({}, op, { browser: base.browser, ctx: base.ctx })) });
