// Pañol en el celu (Pablo, pañolero) con los datos de la v146 (cómputo de Los Álamos, entradas con proveedor, reserva, fusible bajo mínimo)
const { app, foto, T, tomas, ev, clic, vista, cerrarTodo } = require('./base');
const { datos146 } = require(T + '/datos146');
const FOTO = T + '/foto.jpg';
const st = (s) => async (p) => { await cerrarTodo(p); await ev(p, (s) => window.__v135.irStock(s), s); await p.waitForTimeout(1000); await ev(p, () => window.scrollTo(0, 0)); };
const ficha = (cod) => async (p) => { await cerrarTodo(p); await ev(p, (k) => { const b = document.createElement('button'); b.className = 'pf-link'; b.dataset.cod = k; document.body.appendChild(b); b.click(); b.remove(); }, String(cod)); await p.waitForTimeout(1200); };
(async () => {
  const cel = process.argv[3] !== 'pc';
  const A = await app(datos146(), process.argv[4] || 'pan', { cel });
  const p = A.page;
  await p.route('https://ema-ia.mdiaz-60f.workers.dev/ia', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'm', type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text: JSON.stringify({ legible: true, motivo: '', proveedor: 'Richetta', numero: '0009-00000123', fecha: '2026-11-10', moneda: 'ARS', preciosConIva: false, ivaPct: null, renglones: [{ desc: 'FUSIBLE CILINDRICO 10X38 2A', cant: 20, un: 'u', precio: 100, ean: null }, { desc: 'CABLE CU 4X4 MM2 XLPE IRAM 2178', cant: 100, un: 'm', precio: 2000, ean: null }, { desc: 'Gaseosa cola 2,25 L', cant: 2, un: 'u', precio: 3000, ean: null }] }) }], stop_reason: 'end_turn', ema: { costoUsd: 0.01, version: 'v3-ia' } }) }));
  const s = cel ? '' : '_pc';
  await tomas(A, [
    ['pa_inicio' + s, null, null],
    ['pa_inicio_2' + s, (p) => ev(p, () => window.scrollTo(0, 99999)), null],
    ['pa_catalogo' + s, st('inventario'), null],
    ['pa_ficha' + s, ficha('6010'), null],
    ['pa_ficha_ean' + s, async (p) => { await ev(p, () => { const b = document.getElementById('eanBox'); b && b.scrollIntoView({ block: 'center' }); }); }, null],
    ['pa_lector' + s, async (p) => { await cerrarTodo(p); await st('inventario')(p); await clic(p, '#esBtnPanol', { espera: 1200 }); }, null],
    ['pa_reservas' + s, st('reservas'), null],
    ['pa_reservas_2' + s, (p) => ev(p, () => window.scrollTo(0, 500)), null],
    ['pa_registrar' + s, st('registrar'), null],
    ['pa_registrar_2' + s, (p) => ev(p, () => window.scrollTo(0, 600)), null],
    ['pa_remito_abrir' + s, async (p) => { await ev(p, () => window.__remitoFoto.abrir('entrada')); await p.waitForTimeout(900); }, null],
    ['pa_remito_tarjeta' + s, async (p) => { await p.setInputFiles('#rfFotoGal', FOTO); for (let i = 0; i < 60; i++) { await p.waitForTimeout(200); if (await ev(p, () => !!document.querySelector('#rfFilas, #rfCartel, #rfDup'))) break; } await p.waitForTimeout(800); }, null],
    ['pa_remito_tarjeta_2' + s, async (p) => { await ev(p, () => { const f = document.getElementById('rfFilas'); f && f.scrollIntoView({ block: 'start' }); }); }, null],
    ['pa_compras' + s, async (p) => { await ev(p, () => window.__remitoFoto.cerrar()); await st('inventario')(p); await ev(p, () => { const c = document.getElementById('pcCard') || document.getElementById('cardStockCompras'); c && c.scrollIntoView({ block: 'start' }); window.scrollBy(0, -70); }); }, null],
    ['pa_pedido' + s, async (p) => { await ev(p, () => window.__pedidoCompras.abrir()); await p.waitForTimeout(1500); }, null],
    ['pa_pedido_2' + s, async (p) => { await ev(p, () => { const o = document.querySelector('#pcOv .sg-in') || document.getElementById('pcOv'); o.scrollTop = 700; }); }, null],
    ['pa_herramientas' + s, async (p) => { await cerrarTodo(p); await st('herramientas')(p); }, null],
    ['pa_etiquetas' + s, async (p) => { await ev(p, () => window.__codigos.elegirEtiquetas()); await p.waitForTimeout(900); }, null],
    ['pa_movimientos' + s, async (p) => { await cerrarTodo(p); await st('movimientos')(p); }, null],
    ['pa_personas' + s, st('personas'), null],
    ['pa_calcpanol' + s, st('calcpanol'), null],
    ['pa_acceso' + s, st('acceso'), null],
    ['pa_acceso_2' + s, (p) => ev(p, () => window.scrollTo(0, 99999)), null],
  ]);
  console.log(A.errores.slice(0, 5)); await A.browser.close();
})();
