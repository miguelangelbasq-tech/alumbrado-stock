const { app, T, ev, vista } = require('./base');
(async () => {
  const { datos155 } = require(T + '/datos155');
  const A = await app(datos155(), process.env.U||'dir', { cel: true, extra: { leaflet: true } });
  const p = A.page; await p.waitForTimeout(4000);
  console.log(await ev(p, () => { window.abrirMenuLateral(); return [...document.querySelectorAll('[data-vista],#menuGastos,#menuCert,[data-ct],[data-isabrir],[data-ap],[data-td],[data-pr]')].filter(e=>e.closest('#menuLateral')).map(e => (e.offsetParent!==null?'V ':'- ')+(e.id||'')+' '+(e.parentElement.id||e.parentElement.className)+' = '+e.textContent.trim().replace(/\s+/g,' ').slice(0,40)).join('\n'); }));
  console.log(A.errores.slice(0,8)); console.log(await ev(p,()=>[typeof window.GASTOS, typeof window.__certMensual, !!document.getElementById('menuLista'), document.querySelectorAll('#menuLista > *').length, typeof window.__informeSemanal]+''));
  await A.browser.close();
})();
