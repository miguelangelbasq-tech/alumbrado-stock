// v176 · 🛡 Guardián de datos (solo Administración).
//  0) la copia de todos los días: dos páginas de admin a la vez → una sola copia (adjuntos/cfg-<hoy>, turno en salud.guardian),
//     sin respaldos[] adentro, con tamaños y cuentas, menos de 1 MB; volver a revisar no copia otra vez.
//  1) el 18/11: la base quedó con 10 de 15, sin vehículos y gastosRef vacío; la copia de ayer estaba bien → alerta roja en el
//     Inicio y el Supervisor, aviso al celu de los admin UNA vez; «Ver qué cambió» muestra las 5 personas, los 3 vehículos y los
//     precios; «Sí, volver a como estaba» los trae, leído de vuelta, respaldos[] y auditoría guardian_restaurar; la alerta se cierra.
//  2) sin falsas alarmas: sacar 1 persona con «Sí» y agregar otra no avisa; sacar 2 con «Sí» queda en ámbar (sin aviso);
//     auditoría config_guardar con cuentas (precios 12 → 11).
//  3) roles: Oficina copia y avisa a los admin en silencio (no ve menú, hoja ni alertas); Dirección y la cuadrilla nada.
//  4) asistente: guardian y proponer_restaurar_datos solo para admin.  5) __v176No.
const { abrir, otraPagina, prueba } = require('./h');
const { datos176, dia } = require('./datos176');
const cel = process.argv[2] === 'cel';
const REGLAS = !!process.env.REGLAS;
const SOLO = (x) => !process.env.SOLO || process.env.SOLO.split(',').indexOf(String(x)) >= 0;
const ANTES = () => { window.__gdEspera = 0; window.__supNoIA = true; };
(async () => {
  const c = prueba('v176' + (cel ? ' cel' : '') + (REGLAS ? ' REGLAS' : ''));
  const db = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('stub.db')));
  const sesion = async (quien, datos, op) => { const A = await abrir(Object.assign({ sesion: quien, datos, cel, espera: 3500, antes: ANTES, inicio: true, v176: true }, op || {})); A.page.on('dialog', (x) => x.accept()); return A; };
  const tic = (p) => p.evaluate(async () => { await window.__guardian.tic(); });
  const hoy = dia(0), ayer = dia(1);
  try {
    if (SOLO(0)) {
      const A = await sesion('admin', datos176({ ayer: true })), B = await otraPagina(A, { sesion: 'admin', cel, espera: 3500, antes: ANTES, inicio: true, v176: true });
      await Promise.all([tic(A.page), tic(B.page)]); await A.page.waitForTimeout(1500);
      let d = await db(A.page);
      const cop = Object.keys(d.adjuntos).filter((k) => /^cfg-/.test(k) && d.adjuntos[k].fecha === hoy);
      c(cop.length === 1, `una sola copia del día entre dos páginas (${cop.join(', ')})`);
      const m = d.adjuntos['cfg-' + hoy] || {}, tam = JSON.stringify(m).length;
      c(m.tipo === 'respaldoCfg' && m.docs.personal && m.docs.personal.nomina.length === 15 && !('respaldos' in m.docs.personal), 'la copia trae personal (15) sin respaldos[]');
      const gc = (d.configEquipo.precios.guardianCopias || []).filter((x) => x.fecha === hoy);
      c(!m.docs.precios && !JSON.stringify(m).includes('Gasoil') && m.huellas && m.huellas.precios && m.cuentas.gastosRef === 12, 'precios NO va en adjuntos (lo lee cualquier confirmado): solo cuentas y huella');
      c(gc.length === 1 && Object.keys(gc[0].datos.gastosRef).length === 12 && !('guardianCopias' in gc[0].datos) && gc[0].hash === m.huellas.precios && d.configEquipo.precios.guardianCopias.length === 2, 'la copia de precios queda adentro de configEquipo/precios.guardianCopias (ayer + hoy, misma huella)');
      c(m.tam && m.tam.personal > 0 && m.cuentas && m.cuentas.nomina === 15 && m.cuentas.vehiculos === 3 && tam < 1000000, `tamaños y cuentas, ${Math.round(tam / 1024)} KB (< 1 MB)`);
      c(!Object.keys(m.docs).some((k) => /vapid|secreto/i.test(k)) && ['personal', 'cuadrillas'].every((k) => m.docs[k]), 'sin vapid ni secretos; con personal y cuadrillas');
      const g = d.configEquipo.salud.guardian[hoy]; c(g && g.estado === 'hecho' && g.cuentas.nomina === 15 && g.campos.personal.nomina === 15, 'turno en configEquipo/salud.guardian.<hoy> = hecho con cuentas y campos');
      await tic(A.page); await tic(B.page); d = await db(A.page);
      c(Object.values(d.auditoria || {}).filter((x) => x.accion === 'guardian_copia').length === 1, 'revisar otra vez no copia de nuevo (1 auditoría guardian_copia)');
      c(!(await A.page.evaluate(() => window.__guardian.abiertas().length)), 'sin alertas con los datos bien');
      await A.page.evaluate(() => window.__guardian.abrir()); await A.page.waitForTimeout(1200);
      const h = await A.page.evaluate(() => { const v = document.getElementById('gdOv'); return v ? { t: v.innerText, rol: v.getAttribute('role'), x: !!v.querySelector('[aria-label="Cerrar"]') } : null; });
      c(h && h.rol === 'dialog' && h.x && /Todo en orden/.test(h.t) && /Cómo está cada lista/.test(h.t) && /Copias de todos los días \(2\)/.test(h.t) && /Descargar respaldo completo/.test(h.t), 'hoja «🛡 Guardián de datos»: todo en orden, listas, 2 copias, respaldo completo');
      c(await A.page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), 'sin scroll de costado');
      c(await A.page.evaluate(() => !!document.getElementById('menuGuardian')), 'menú «🛡 Guardián de datos» para Administración');
      await A.browser.close();
    }
    if (SOLO(1)) {
      const A = await sesion('admin', datos176({ ayer: true, mal: true })), p = A.page;
      await tic(p); await p.waitForTimeout(800); await tic(p); await p.waitForTimeout(800);
      const al = await p.evaluate(() => window.__guardian.abiertas().map((a) => a.texto));
      c(al.some((t) => /Se borraron 5 personas de la nómina entre ayer y hoy \(quedan 10 de 15; la última vez guardó admin@/.test(t)), 'alerta: ' + (al[0] || '').slice(0, 120));
      c(al.some((t) => /3 vehículos/.test(t)) && al.some((t) => /12 precios de la lista de Gastos/.test(t)), 'también los 3 vehículos y los 12 precios de Gastos');
      let d = await db(p);
      const push = Object.values(d.avisosPush || {}).filter((x) => x.tipo === 'guardian');
      c(push.length === 3 && push.every((x) => x.email === 'admin@ema-alumbrado.app'), `aviso al celu de los admin una vez por incidente (${push.length})`);
      await p.evaluate(() => window.__inicioPro && window.__inicioPro.pintar && window.__inicioPro.pintar()); await p.waitForTimeout(800);
      c(/Se borraron datos/.test(await p.evaluate(() => document.body.innerText)), 'Inicio › Para atender: «🛡 Se borraron datos»');
      const sup = await p.evaluate(() => window.__supervisor.hallazgos({ ahora: true }).filter((h) => h.cat === 'Datos' && h.g === 'rojo').length);
      c(sup === 3, `Supervisor: ${sup} hallazgos rojos «Datos»`);
      c(/Guardián de datos \(sin IA\)/.test(await p.evaluate(() => window.__guardian.resumenRojos())), 'la revisión con IA de las 12/18 h suma las alertas');
      const clave = await p.evaluate(() => window.__guardian.abiertas().find((a) => a.lista === 'nomina').clave);
      await p.evaluate((k) => window.__guardian.abrir({ clave: k }), clave); await p.waitForTimeout(1500);
      const v = await p.evaluate(() => document.getElementById('gdOv').innerText);
      c(['JAVIER OLARIAGA', 'Ivan Exequiel Pereyra', 'PETITTI ISMAEL', 'Bruno Federico Cherino', 'Vizgarra Alfredo'].every((n) => v.indexOf(n) >= 0), '«Ver qué cambió» muestra las 5 personas');
      c(/Lastra Sergi Ariel/.test(v) && /Cambió/.test(v), 'y lo que cambió (Lastra «Medio oficial»), sin tildar');
      // todo lo borrado: personas + vehículos + precios
      await p.evaluate(() => { document.querySelectorAll('#gdOv [data-gd="atras"]').forEach((b) => b.click()); }); await p.waitForTimeout(300);
      await p.evaluate((f) => { const b = document.querySelector('#gdOv [data-gd="copia:' + f + '"]'); b && b.click(); }, ayer); await p.waitForTimeout(1500);
      const v2 = await p.evaluate(() => ({ t: document.getElementById('gdOv').innerText, n: document.querySelectorAll('#gdOv [data-gdsel]:checked').length }));
      c(/Hilux blanca/.test(v2.t) && /Grúa/.test(v2.t) && /Gasoil/.test(v2.t) && v2.n === 5 + 3 + 12, `la copia de ayer: personas, vehículos y precios tildados (${v2.n})`);
      await p.click('#gdOv [data-gd="si"]'); await p.waitForTimeout(2500);
      d = await db(p);
      const P = d.configEquipo.personal;
      c(P.nomina.length === 15 && P.vehiculos.length === 3 && Object.keys(d.configEquipo.precios.gastosRef).length === 12, `volvió: ${P.nomina.length} personas, ${P.vehiculos.length} vehículos, ${Object.keys(d.configEquipo.precios.gastosRef).length} precios`);
      c(P.nomina.find((x) => x.nombre === 'Lastra Sergi Ariel').rol === 'Medio oficial', 'lo cambiado no se tocó (no estaba tildado)');
      c(Array.isArray(P.respaldos) && P.respaldos[P.respaldos.length - 1].nomina.length === 10 && Array.isArray(d.configEquipo.precios.respaldos), 'antes quedó la copia de cómo estaba (respaldos[])');
      const msg = await p.evaluate(() => document.getElementById('gdOv').innerText);
      c(/Leído de vuelta de la base/.test(msg), 'leído de vuelta de la base');
      c(Object.values(d.auditoria).some((x) => x.accion === 'guardian_restaurar'), 'auditoría guardian_restaurar');
      await tic(p); await p.waitForTimeout(500);
      c(!(await p.evaluate(() => window.__guardian.abiertas().length)) && Object.values(d.configEquipo.salud.guardianAlertas).every((a) => a.estado === 'resuelta'), 'las alertas quedan resueltas');
      c(Object.values((await db(p)).avisosPush || {}).filter((x) => x.tipo === 'guardian').length === 3, 'no vuelve a avisar');
      await A.browser.close();
    }
    if (SOLO(2)) {
      const A = await sesion('admin', datos176({ ayer: true })), p = A.page;
      await tic(p);
      const r1 = p.evaluate(async () => { const n = JSON.parse(JSON.stringify(window.__personalNube.nomina)); n.pop(); n.push({ nombre: 'Nuevo Ayudante', rol: 'Ayudante', activo: true }); try { await window.fbPersonalGuardar({ nomina: n }); return 'ok'; } catch (e) { return e.code; } });
      await p.waitForTimeout(700); await p.click('#psConf [data-psc="si"]'); await r1; await p.waitForTimeout(800);
      await tic(p); await p.waitForTimeout(300);
      const e1 = await p.evaluate(() => ({ a: window.__guardian.abiertas().length, m: window.__guardian.estado().ambar.length, n: window.__personalNube.nomina.length }));
      c(e1.n === 15 && !e1.a && !e1.m, 'sacar 1 persona con «Sí» y agregar otra: sin alerta');
      const r2 = p.evaluate(async () => { const n = JSON.parse(JSON.stringify(window.__personalNube.nomina)).slice(0, 13); try { await window.fbPersonalGuardar({ nomina: n }); return 'ok'; } catch (e) { return e.code; } });
      await p.waitForTimeout(700); await p.click('#psConf [data-psc="si"]'); await r2; await p.waitForTimeout(800);
      await tic(p); await p.waitForTimeout(300);
      const e2 = await p.evaluate(() => ({ a: window.__guardian.abiertas().length, m: window.__guardian.estado().ambar.map((x) => x.texto) }));
      c(!e2.a && e2.m.length === 1 && /con el «Sí» de admin@/.test(e2.m[0]), 'sacar 2 con «Sí»: queda en ámbar, sin alerta roja: ' + (e2.m[0] || '').slice(0, 80));
      c(!Object.values((await db(p)).avisosPush || {}).some((x) => x.tipo === 'guardian'), 'sin aviso al celu');
      await p.evaluate(async () => { const g = Object.assign({}, window.__preciosNube.gastosRef, { Grasa: { precio: 500, un: 'Un.' } }); await window.fbPreciosGuardar({ gastosRef: g }); }); await p.waitForTimeout(800);
      const au = Object.values((await db(p)).auditoria).filter((x) => x.accion === 'config_guardar' && x.doc === 'precios' && x.cuentas);
      c(au.length >= 1 && au[0].antes.gastosRef === 12 && au[0].despues.gastosRef === 13, 'auditoría config_guardar con cuentas (precios gastosRef 12 → 13)');
      await A.browser.close();
    }
    if (SOLO(3)) {
      const A = await sesion('ofi', datos176({ ayer: true, mal: true })), p = A.page;
      await tic(p); await p.waitForTimeout(1000);
      const d = await db(p);
      c(!!d.adjuntos['cfg-' + hoy], 'Oficina toma la copia del día en silencio');
      const push = Object.values(d.avisosPush || {}).filter((x) => x.tipo === 'guardian');
      c(push.length === 3 && push.every((x) => x.email === 'admin@ema-alumbrado.app'), 'y avisa a Administración (no a Oficina)');
      const o = await p.evaluate(async () => ({ menu: !!document.getElementById('menuGuardian'), ab: await window.__guardian.abrir(), at: window.__guardian.atender().length, sup: window.__guardian.supHallazgos().length, txt: document.body.innerText }));
      c(!o.menu && !o.ab && !o.at && !o.sup && !/Se borraron datos/.test(o.txt), 'Oficina no ve menú, hoja, Inicio ni Supervisor del guardián');
      await A.browser.close();
      for (const q of ['dir', 'juan']) {
        const B = await sesion(q, datos176({ ayer: true, mal: true }), { inicio: q !== 'juan' }), pb = B.page;
        await pb.evaluate(async () => { try { await window.__guardian.tic(); } catch (e) { } }); await pb.waitForTimeout(800);
        const db2 = await db(pb), x = await pb.evaluate(() => ({ menu: !!document.getElementById('menuGuardian'), at: window.__guardian ? window.__guardian.atender().length : 0 }));
        c(!db2.adjuntos['cfg-' + hoy] && !Object.values(db2.avisosPush || {}).some((y) => y.tipo === 'guardian') && !x.menu && !x.at, `${q === 'dir' ? 'Dirección' : 'la cuadrilla'}: no copia, no avisa, no ve nada`);
        await B.browser.close();
      }
    }
    if (SOLO(4)) {
      for (const q of ['admin', 'ofi']) {
        const A = await sesion(q, datos176({ ayer: true, mal: true }), { iaPro: true }), p = A.page;
        await tic(p); await p.waitForTimeout(600);
        const r = await p.evaluate(async () => {
          const a = window.__iaCargar && window.__iaCargar(); await new Promise((ok) => setTimeout(ok, 300)); const S = window.__asistente;
          const names = S.alcance().tools(S.TOOLS).map((t) => t.name);
          const g = await S.ejecutar('guardian', { accion: 'cambios', desde: '' });
          const pr = await S.ejecutar('proponer_restaurar_datos', { listas: ['nomina'] });
          return { tiene: names.indexOf('guardian') >= 0 && names.indexOf('proponer_restaurar_datos') >= 0, g: JSON.stringify(g).slice(0, 3000), pr: JSON.stringify(pr).slice(0, 3000) };
        });
        if (q === 'admin') {
          c(r.tiene, 'admin: el asistente tiene guardian y proponer_restaurar_datos');
          c(/Se borraron 5 personas/.test(r.g) && /JAVIER OLARIAGA/.test(r.g), 'guardian: alertas y qué cambió (las 5 personas)');
          c(/pendiente_de_confirmacion/.test(r.pr) && /Vizgarra Alfredo/.test(r.pr), 'proponer_restaurar_datos: tarjeta con las personas que vuelven');
        } else c(!r.tiene && !/Se borraron/.test(r.g) && !/pendiente_de_confirmacion/.test(r.pr), 'Oficina: el asistente no tiene las herramientas del guardián');
        await A.browser.close();
      }
    }
    if (SOLO(5)) {
      const A = await sesion('admin', datos176({ ayer: true, mal: true }), { antes: () => { window.__v176No = true; window.__gdEspera = 0; } }), p = A.page;
      await p.waitForTimeout(1500);
      const d = await db(p), x = await p.evaluate(() => ({ g: !!window.__guardian, m: !!document.getElementById('menuGuardian') }));
      c(!x.g && !x.m && !d.adjuntos['cfg-' + hoy] && !Object.values(d.avisosPush || {}).some((y) => y.tipo === 'guardian'), '__v176No: nada del guardián');
      await A.browser.close();
    }
  } catch (e) { console.log('ERROR', e); c(false, 'excepción: ' + (e && e.message)); }
  process.exit(c.fin() ? 1 : 0);
})();
