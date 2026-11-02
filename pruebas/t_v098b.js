// Pruebas v098b · «¿Olvidaste tu contraseña o tu usuario?» en la pantalla de entrada.
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
function datos() {
  const d = baseDatos();
  d.cuentas['ana.lopez@gmail.com'] = { pass: 'clave123', uid: 'uAna' };
  d.db.configEquipo.alias = { ana: 'ana.lopez@gmail.com', juan: 'juan@ema-alumbrado.app' };
  return d;
}
(async () => {
  const c = prueba('v098b' + (cel ? ' cel' : ''));
  const A = await abrir({ cel, datos: datos(), espera: 2500 }), p = A.page;
  await p.waitForSelector('#portadaLogin', { state: 'visible', timeout: 10000 }).catch(() => { });
  let r = await p.evaluate(() => { const b = document.getElementById('portadaOlvide'); return b ? { txt: b.textContent, h: b.getBoundingClientRect().height, vis: !!b.offsetParent } : null; });
  c(r && r.vis && /Olvidaste tu contraseña o tu usuario/.test(r.txt) && r.h >= 44, 'en la entrada está «¿Olvidaste tu contraseña o tu usuario?» (tocable de 44 px) ' + JSON.stringify(r));
  await p.fill('#portadaUsuario', 'Ana');
  await p.click('#portadaOlvide'); await p.waitForTimeout(200);
  r = await p.evaluate(() => ({ login: document.getElementById('portadaLogin').style.display, recu: !!document.getElementById('portadaRecu').offsetParent, dato: document.getElementById('rcDato').value }));
  c(r.login === 'none' && r.recu && r.dato === 'Ana', 'abre «Recuperar tu contraseña» con el usuario que ya había escrito');
  await p.screenshot({ path: __dirname + '/v098_recu' + (cel ? '_cel' : '') + '.png' });
  const mandar = async (v) => { await p.fill('#rcDato', v); await p.click('#rcMandar'); await p.waitForFunction(() => document.getElementById('rcMandar').textContent === 'Mandarme el correo' && document.getElementById('rcMsg').textContent, null, { timeout: 8000 }); return p.evaluate(() => ({ t: document.getElementById('rcMsg').innerText.replace(/\s+/g, ' '), mal: document.getElementById('rcMsg').classList.contains('mal'), env: window.__stubResets || [] })); };
  r = await mandar('Ana');
  c(!r.mal && /te llega un correo/.test(r.t) && /an\*+@gmail\.com/.test(r.t) && /Spam/.test(r.t) && r.env.length === 1 && r.env[0].email === 'ana.lopez@gmail.com' && r.env[0].lang === 'es', 'con el usuario: manda el enlace (en castellano) a su correo real y lo muestra tapado · ' + r.t);
  r = await mandar('ana.lopez@gmail.com');
  c(!r.mal && /Tu usuario es ana/.test(r.t) && r.env.length === 2, 'con el correo: manda el enlace y le dice su usuario («Tu usuario es ana») · ' + r.t);
  r = await p.evaluate(() => document.getElementById('portadaUsuario').value);
  c(r === 'Ana' || r === 'ana', 'deja el usuario puesto para entrar');
  r = await mandar('juan');
  c(r.mal && /no tiene un correo cargado/.test(r.t) && /oficina/.test(r.t) && r.env.length === 2, 'usuario sin correo de verdad: no manda nada y le dice que lo pida a la oficina · ' + r.t);
  r = await mandar('nadie@gmail.com');
  c(r.mal && /no está cargado/.test(r.t), 'correo que no está en la app: lo dice');
  r = await mandar('mal@correo');
  c(r.mal && /bien escrito/.test(r.t), 'correo mal escrito: lo dice');
  await p.click('#rcVolver'); await p.waitForTimeout(200);
  r = await p.evaluate(() => [document.getElementById('portadaLogin').style.display, document.getElementById('portadaRecu').style.display]);
  c(r[0] === '' && r[1] === 'none', '«← Volver a entrar» vuelve al usuario y contraseña');
  // y se sigue entrando normal
  await p.fill('#portadaUsuario', 'ana'); await p.fill('#portadaPass', 'clave123'); await p.click('#portadaEntrar');
  const ok = await p.waitForFunction(() => !document.getElementById('portada') || window.__portadaAbierta, null, { timeout: 15000 }).then(() => true, () => false);
  c(ok, 'después entra con su usuario y contraseña como siempre');
  if (cel) { const w = await p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]); c(w[0] <= w[1] + 1, 'celular: sin scroll de costado ' + w); }
  c(!A.errores.length, 'sin errores de JS ' + JSON.stringify(A.errores.slice(0, 3)));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
