// v148 · Video corto: cuadrilla en «Antes de arrancar» (6/6), celu con CPU ×4, llega un aviso. Graba cuadro por cuadro
// (CDP Page.startScreencast) y deja los JPG en OUT/<nombre>/ para armar el mp4 con ffmpeg.
// Uso: APP=.../index.html node _video148.js <nombre> <carpeta>
const fs = require('fs');
const { abrir } = require('./h');
const { datos147 } = require('./datos147');
const NOM = process.argv[2] || 'v148', OUT = (process.argv[3] || '.') + '/' + NOM;
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const A = await abrir({ datos: datos147(), sesion: 'juan', cel: true, dpr: 2, espera: 6000, v147: true, mov: true, crew: true, mtNuevo: true, tarjetas: true, nav: true, inicio: true, sugerida: true, v145: true, v146: true, obraGps: true, camaraB: true });
  const p = A.page, ev = (f, a) => p.evaluate(f, a);
  await ev(() => { const t = Date.now(); return firebase.firestore().collection('ordenesTrabajo').doc('ot1').set({ campo: { seguridad: { corte: 'epec', 'juan perez': { items: { casco: true, arnes: true, guantes: true, botines: true, conos: true, equipo: true }, fotos: { conos: 'fc1', equipo: 'fe1' }, fotosTs: { conos: t, equipo: t }, ts: t } } } }, { merge: true }); });
  await p.waitForTimeout(1500); await ev(() => window.__cuadrillaDia.ir('seg')); await p.waitForTimeout(2000);
  await ev(() => window.scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(800);
  const cdp = await A.ctx.newCDPSession(p);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  let n = 0; const t0 = Date.now(); const tiempos = [];
  cdp.on('Page.screencastFrame', async (f) => { const i = n++; fs.writeFileSync(`${OUT}/c${String(i).padStart(4, '0')}.jpg`, Buffer.from(f.data, 'base64')); tiempos.push(Date.now() - t0); try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch (e) { } });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 70, maxWidth: 390, maxHeight: 844, everyNthFrame: 1 });
  await p.waitForTimeout(1500);
  await ev(() => window.__emaAvisos.avisar({ titulo: 'Te asignaron una orden de trabajo', cuerpo: 'OT-2026-400 · Plaza Bulevares · hoy 07:30', ir: { v: 'mistareas' } }));
  // la base: llega la orden nueva (globito de «Hoy»)
  await p.waitForTimeout(1200);
  await ev(() => { const hoy = window.__v135.hoy(), ahora = Date.now(); return firebase.firestore().collection('ordenesTrabajo').doc('otV').set({ numero: 'OT-2026-400', fecha: hoy, plazaId: 'p2', plazaNombre: 'Plaza San Pablo', personal: [{ nombre: 'Juan Pérez', rol: 'Oficial' }], personalNombres: ['juan perez'], actividades: ['replanteo'], actividadesManuales: [], estado: 'Emitida', ts: ahora, creado: ahora }); });
  await p.waitForTimeout(9000);
  await cdp.send('Page.stopScreencast');
  fs.writeFileSync(OUT + '/tiempos.json', JSON.stringify(tiempos));
  console.log(NOM, n, 'cuadros');
  await A.browser.close();
})();
