// Carga el motor de cálculo de Proyectista (geodesia + cálculos) en Node, sin pantalla.
const fs = require('fs');
module.exports = function (archivo) {
  const t = fs.readFileSync(archivo, 'utf8');
  const a = t.indexOf('  // ======================================================================= geodesia'), b = t.indexOf('  // ======================================================================= estado');
  const cuerpo = t.slice(a, b);
  return new Function('document', cuerpo + '\nreturn { distancia, gk, red, parseLDT, parseIES, fotoGenerica, intens, luz, radios, eEn, plano0, artefactos, flujoDe, tablaFn, rKm, inRecomendada, fusibles, elDe, cfgDe, CFG0, CLASES, NC, NG };')(typeof document === 'undefined' ? undefined : document);
};
