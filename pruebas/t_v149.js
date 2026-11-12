// v149 · El micrófono del Asistente ya no se «destilda» solo + el Asistente más rápido.
//  · Dictar 30 s con el motor cortando solo cada 3–8 s (navegador y plugin de la app 1.4): sigue prendido, el texto completo
//    sin repetidos; se apaga recién al tocar 🎤; tope por silencio largo; enviar no reescribe (v140).
//  · Charla: el motor corta a mitad de frase → no se manda la mitad: el turno termina ~1,5 s después de lo último.
//  · Respuesta en vivo con el Worker v4-ia simulado (SSE de a pedazos): texto que se va escribiendo, herramientas y bloques
//    de pensamiento intactos, voz desde la primera frase; sin v4 (o con respuesta JSON) como hoy.
//  · «Pensando…» al instante, effort más liviano en charla y preguntas cortas, tiempos medidos (celu con CPU ×4).
const { abrir, prueba, baseDatos } = require('./h');
const cel = process.argv[2] === 'cel';
const W = 'https://ema-ia.mdiaz-60f.workers.dev';
(async () => {
  const c = prueba('v149' + (cel ? ' cel' : ''));
  const MOD = { cel, espera: 4500, iaPro: true, v149: true, nav: true, inicio: true, https: true, sesion: 'admin', datos: baseDatos() };
  const A = await abrir(MOD), p = A.page;
  p.on('dialog', (x) => x.accept());
  let salud = { ok: true, version: 'v4-ia', stream: true };
  await p.route(W + '/salud', (rt) => rt.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(salud) }));
  await p.route(W + '/mio', (rt) => rt.abort());
  await p.route(W + '/uso', (rt) => rt.abort());
  // Worker simulado DENTRO de la página: así la respuesta puede llegar de a pedazos (ReadableStream), como el Worker v4-ia
  await p.evaluate(() => {
    const espera = (ms) => new Promise((ok) => setTimeout(ok, ms));
    window.__sse = { cola: [], pedidos: [], log: [], tPedido: [] };
    const f0 = window.fetch;
    window.fetch = function (u, o) {
      if (String(u).indexOf('workers.dev/ia') < 0) return f0.apply(this, arguments);
      const S = window.__sse, b = JSON.parse(o.body); S.pedidos.push(b); S.tPedido.push(performance.now());
      const g = S.cola.shift();
      if (!g) return Promise.resolve(new Response(JSON.stringify({ error: { tipo: 'prueba', mensaje: 'sin guion' } }), { status: 500, headers: { 'Content-Type': 'application/json' } }));
      if (g.json) return espera(g.t0 || 0).then(() => new Response(JSON.stringify(g.json), { status: 200, headers: { 'Content-Type': 'application/json' } }));
      const enc = new TextEncoder();
      const rs = new ReadableStream({ async start(cc) {
        await espera(g.t0 || 0);
        for (const e of g.ev) {
          const tx = e.type === 'ema' ? 'event: ema\ndata: ' + JSON.stringify(e.data) + '\n\n' : 'event: ' + e.type + '\ndata: ' + JSON.stringify(e) + '\n\n';
          // cortado en dos pedazos, para probar que se arma bien aunque un evento llegue partido
          const m = Math.floor(tx.length / 2); cc.enqueue(enc.encode(tx.slice(0, m))); cc.enqueue(enc.encode(tx.slice(m)));
          S.log.push([performance.now(), e.type]);
          if (g.ms) await espera(g.ms);
        }
        cc.close();
      } });
      return Promise.resolve(new Response(rs, { status: 200, headers: { 'Content-Type': 'text/event-stream' } }));
    };
    // voz del navegador: lo que se lee, cuándo, y si alguna vez escuchó mientras hablaba
    window.__dichos = []; window.__hablandoV = false;
    const synth = { speaking: false, getVoices: () => [{ lang: 'es-AR', name: 'prueba' }], cancel() { window.__hablandoV = false; }, speak(u) { window.__hablandoV = true; window.__dichos.push([performance.now(), u.text]); setTimeout(() => { window.__hablandoV = false; u.onend && u.onend(); }, 150); } };
    Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true });
  });
  // eventos SSE como los de la API de Claude
  let nm = 0;
  const ini = (model) => ({ type: 'message_start', message: { id: 'msg_s' + (++nm), type: 'message', role: 'assistant', model: model || 'claude-opus-5-5', content: [], stop_reason: null, usage: { input_tokens: 900, output_tokens: 1 } } });
  const ema = { type: 'ema', data: { costoUsd: 0.01, version: 'v4-ia', modelo: 'claude-opus-5-5', uso: { rol: 'admin', tipo: 'pregunta', preguntasHoy: 1, topePreguntas: null } } };
  const sseTexto = (partes) => [ini(), { type: 'content_block_start', index: 0, content_block: { type: 'thinking', thinking: '' } }, { type: 'content_block_delta', index: 0, delta: { type: 'thinking_delta', thinking: 'pienso' } }, { type: 'content_block_delta', index: 0, delta: { type: 'signature_delta', signature: 'firmaA' } }, { type: 'content_block_stop', index: 0 },
    { type: 'content_block_start', index: 1, content_block: { type: 'text', text: '' } }].concat(partes.map((x) => ({ type: 'content_block_delta', index: 1, delta: { type: 'text_delta', text: x } })), [{ type: 'content_block_stop', index: 1 }, { type: 'ping' }, { type: 'message_delta', delta: { stop_reason: 'end_turn', stop_sequence: null }, usage: { output_tokens: 80 } }, { type: 'message_stop' }, ema]);
  const sseHerr = (pre, name, piezas) => [ini(), { type: 'content_block_start', index: 0, content_block: { type: 'thinking', thinking: '' } }, { type: 'content_block_delta', index: 0, delta: { type: 'thinking_delta', thinking: 'busco la obra' } }, { type: 'content_block_delta', index: 0, delta: { type: 'signature_delta', signature: 'firma' } }, { type: 'content_block_delta', index: 0, delta: { type: 'signature_delta', signature: 'B' } }, { type: 'content_block_stop', index: 0 },
    { type: 'content_block_start', index: 1, content_block: { type: 'text', text: '' } }, { type: 'content_block_delta', index: 1, delta: { type: 'text_delta', text: pre } }, { type: 'content_block_stop', index: 1 },
    { type: 'content_block_start', index: 2, content_block: { type: 'tool_use', id: 'tu_1', name, input: {} } }].concat(piezas.map((x) => ({ type: 'content_block_delta', index: 2, delta: { type: 'input_json_delta', partial_json: x } })), [{ type: 'content_block_stop', index: 2 }, { type: 'message_delta', delta: { stop_reason: 'tool_use', stop_sequence: null }, usage: { output_tokens: 40 } }, { type: 'message_stop' }, ema]);
  const jsonFin = (text) => ({ id: 'msg_j' + (++nm), type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text }], stop_reason: 'end_turn', usage: { input_tokens: 1000, output_tokens: 60 }, ema: { costoUsd: 0.02, version: 'v3-ia' } });
  const esperarLibre = async () => { for (let i = 0; i < 120; i++) { await p.waitForTimeout(120); const ok = await p.evaluate(() => { const b = document.getElementById('iaEnviar'); return !!b && !b.disabled; }); if (ok) return; } };
  const ultUser = (b) => { const m = b && b.messages[b.messages.length - 1]; return m && Array.isArray(m.content) ? m.content.filter((x) => x.type === 'text' && !/^\[Contexto/.test(x.text)).map((x) => x.text).join(' ') : String(m && m.content); };

  await p.evaluate(() => { try { localStorage.removeItem('ema.ia.stream'); localStorage.removeItem('ema.ia.stream.ts'); localStorage.removeItem('ema.ia.leer'); } catch (e) { } window.__asistenteAbrir(); });
  await p.waitForTimeout(1500);
  let r = await p.evaluate(() => ({ ls: localStorage.getItem('ema.ia.stream'), ok: window.__asistente.streamOk() }));
  c(r.ls === '1' && r.ok, 'al abrir el panel pregunta /salud: el Worker dice v4-ia → respuesta en vivo prendida · ' + JSON.stringify(r));

  // ================================================================ 1) DICTAR 30 s con el navegador, el motor corta cada 3–8 s
  const instalarWeb = (cfg) => p.evaluate((cfg) => {
    const H = window.__habla = { palabras: [], i: 0, oidas: [], ses: 0, huecos: [], ultFin: 0, activa: null, dobles: 0, prev: [], durs: cfg.durs, callado: !!cfg.callado, solapa: cfg.solapa, tarde: 0, starts: [] };
    for (let k = 1; k <= (cfg.n || 400); k++) H.palabras.push('columna' + k);
    function SR() { this.lang = ''; }
    SR.prototype.start = function () {
      const s = this; H.ses++; H.starts.push({ continuous: s.continuous, interim: s.interimResults, t: performance.now() }); if (H.ultFin) H.huecos.push(performance.now() - H.ultFin);
      if (H.activa) H.dobles++; H.activa = s; s.oidas = [];
      if (H.solapa && H.ses % 3 === 0 && H.prev.length >= 2) s.oidas = H.prev.slice(-2);   // el motor repite el final de la sesión anterior
      const dur = H.durs[(H.ses - 1) % H.durs.length], t0 = performance.now();
      s._tk = setInterval(() => {
        if (s._fin) return;
        if (!H.callado && H.i < H.palabras.length) { const w = H.palabras[H.i++]; H.oidas.push(w); s.oidas.push(w); s.onresult && s.onresult({ results: [[{ transcript: s.oidas.join(' ') }]] }); }
        if (performance.now() - t0 >= dur) { if (!s.oidas.length) s.onerror && s.onerror({ error: 'no-speech' }); s._terminar(); }
      }, 300);
      s._terminar = () => { if (s._fin) return; s._fin = true; clearInterval(s._tk); H.prev = s.oidas.slice(); if (H.activa === s) H.activa = null; H.ultFin = performance.now(); s.onend && s.onend(); };
    };
    SR.prototype.stop = function () { const s = this; setTimeout(() => s._terminar(), 120); };
    SR.prototype.abort = function () { const s = this; const r0 = s.onresult; setTimeout(() => { H.tarde++; r0 && r0.call(s, { results: [[{ transcript: 'tarde tarde' }]] }); s.onresult && s.onresult({ results: [[{ transcript: 'tarde tarde' }]] }); }, 200); s._terminar(); };
    window.webkitSpeechRecognition = SR; window.SpeechRecognition = SR;
    // muestreo del botón y la onda cada 200 ms
    window.__muestras = []; clearInterval(window.__mt);
    window.__mt = setInterval(() => { const b = document.querySelector('#iaPanel [data-ia="mic"]'); window.__muestras.push({ on: !!(b && b.classList.contains('on')), onda: !!(window.__iaOnda && window.__iaOnda.estado().on), tx: document.getElementById('iaTxt').value.length }); }, 200);
  }, cfg);
  await instalarWeb({ durs: [3200, 5100, 7800, 4300, 6100, 3600, 7200], solapa: true });
  await p.fill('#iaTxt', '');
  await p.click('#iaPanel [data-ia="mic"]');
  await p.waitForTimeout(30000);
  r = await p.evaluate(() => ({ m: window.__muestras.slice(), H: { ses: window.__habla.ses, huecos: window.__habla.huecos, dobles: window.__habla.dobles, oidas: window.__habla.oidas.join(' '), starts: window.__habla.starts.slice(0, 2), android: /Android/i.test(navigator.userAgent) }, tx: document.getElementById('iaTxt').value, largo: window.__voz.largo() }));
  const mOn = r.m.filter((x) => x.on && x.onda).length;
  c(r.H.ses >= 5 && mOn === r.m.length && r.m.length >= 140, '30 s dictando: el motor cortó solo ' + (r.H.ses - 1) + ' veces y el 🎤 y la onda siguieron prendidos todo el tiempo (' + mOn + ' de ' + r.m.length + ' muestras)');
  c(r.tx === r.H.oidas, 'el texto en la caja es todo lo dicho, en orden y sin repetir lo que el motor repite al volver (' + r.H.oidas.split(' ').length + ' palabras) · ' + (r.tx === r.H.oidas ? '' : JSON.stringify([r.tx.slice(-120), r.H.oidas.slice(-120)])));
  c(r.H.dobles === 0 && Math.max.apply(null, r.H.huecos) < 400, 'nunca dos sesiones a la vez y el motor vuelve enseguida (hueco máx. ' + Math.round(Math.max.apply(null, r.H.huecos)) + ' ms)');
  c(r.H.starts[0].interim === true && r.H.starts[0].continuous === !r.H.android, 'navegador: interimResults y continuous ' + (r.H.android ? 'apagado en Android (Chrome de Android repite el texto: se encadena)' : 'prendido (fuera de Android)') + ' · ' + JSON.stringify(r.H.starts[0]));
  // apagar a mano
  await p.click('#iaPanel [data-ia="mic"]'); await p.waitForTimeout(600);
  r = await p.evaluate(() => ({ on: !!document.querySelector('#iaPanel [data-ia="mic"].on'), ar: document.querySelector('#iaPanel [data-ia="mic"]').getAttribute('aria-pressed'), onda: window.__iaOnda.estado().on, tx: document.getElementById('iaTxt').value, oidas: window.__habla.oidas.join(' '), largo: window.__voz.largo(), activa: !!window.__habla.activa }));
  c(!r.on && r.ar === 'false' && !r.onda && !r.largo && !r.activa && r.tx === r.oidas, 'tocar 🎤 otra vez lo apaga: botón y onda apagados, motor parado y el texto queda completo');
  await p.evaluate(() => clearInterval(window.__mt));

  // ================================================================ 2) DICTAR 30 s con el plugin de la app 1.4 (continuousPTT)
  await p.evaluate(() => {
    const L = {}, P = window.__plug = { starts: [], ptt: [], activo: false, corteTotal: 0, ciclos: 0, oidas: [], palabras: [], i: 0, dobles: 0 };
    for (let k = 1; k <= 400; k++) P.palabras.push('tablero' + k);
    const emit = (n, x) => (L[n] || []).slice().forEach((f) => f(x));
    window.Capacitor = window.Capacitor || {}; window.Capacitor.Plugins = window.Capacitor.Plugins || {};
    window.Capacitor.isNativePlatform = () => true; window.Capacitor.isPluginAvailable = () => true;
    const durs = [3400, 6800, 4100, 7900, 5200, 3300, 6000];
    window.Capacitor.Plugins.SpeechRecognition = {
      available: async () => ({ available: true }), checkPermissions: async () => ({ speechRecognition: 'granted' }), requestPermissions: async () => ({ speechRecognition: 'granted' }),
      addListener: async (n, cb) => { (L[n] = L[n] || []).push(cb); return { remove() { L[n] = (L[n] || []).filter((x) => x !== cb); } }; },
      removeAllListeners: async () => { Object.keys(L).forEach((k) => { L[k] = []; }); },
      setPTTState: async (o) => { P.ptt.push(o.held); P.held = o.held; },
      stop: async () => { if (!P.activo) return; clearInterval(P.tk); const acc = (P.acc ? P.acc + ' ' : '') + P.cur.join(' '); emit('partialResults', { matches: [P.cur.join(' ')], accumulatedText: acc.trim() }); P.activo = false; setTimeout(() => emit('listeningState', { state: 'stopped' }), 30); },
      start: async (op) => {
        P.starts.push(op); if (P.activo) { P.dobles++; throw new Error('Speech recognition is already running.'); }
        P.activo = true; P.acc = ''; P.cur = []; let t0 = performance.now();
        P.tk = setInterval(() => {
          if (!P.activo) return;
          if (P.i < P.palabras.length) { const w = P.palabras[P.i++]; P.oidas.push(w); P.cur.push(w); emit('partialResults', P.acc ? { matches: [P.cur.join(' ')], accumulated: P.acc } : { matches: [P.cur.join(' ')] }); }
          if (performance.now() - t0 >= durs[P.ciclos % durs.length]) {
            P.ciclos++;
            if (op.continuousPTT && P.held && P.ciclos % 3 !== 0) {   // el plugin vuelve a prender solo (adentro)
              P.acc = (P.acc ? P.acc + ' ' : '') + P.cur.join(' '); emit('partialResults', { matches: [P.cur.join(' ')], accumulated: P.acc, isRestarting: true }); P.cur = []; t0 = performance.now();
            } else {   // y a veces se corta del todo (error del reconocedor): la app lo vuelve a prender
              P.corteTotal++; clearInterval(P.tk); P.activo = false; emit('error', { code: 'CLIENT' }); emit('listeningState', { state: 'stopped' });
            }
          }
        }, 300);
      }
    };
    window.__muestras = []; clearInterval(window.__mt);
    window.__mt = setInterval(() => { const b = document.querySelector('#iaPanel [data-ia="mic"]'); window.__muestras.push({ on: !!(b && b.classList.contains('on')), onda: !!(window.__iaOnda && window.__iaOnda.estado().on) }); }, 200);
  });
  await p.fill('#iaTxt', '');
  await p.click('#iaPanel [data-ia="mic"]');
  await p.waitForTimeout(30000);
  await p.click('#iaPanel [data-ia="mic"]'); await p.waitForTimeout(1200);
  r = await p.evaluate(() => ({ m: window.__muestras.slice(0, 150), P: { starts: window.__plug.starts.slice(0, 2), n: window.__plug.starts.length, ptt: window.__plug.ptt.slice(0, 3), corte: window.__plug.corteTotal, ciclos: window.__plug.ciclos, oidas: window.__plug.oidas.join(' '), dobles: window.__plug.dobles, activo: window.__plug.activo }, tx: document.getElementById('iaTxt').value, on: !!document.querySelector('#iaPanel [data-ia="mic"].on') }));
  c(r.P.starts[0].continuousPTT === true && r.P.starts[0].muteRecognizerBeep === true && r.P.starts[0].partialResults === true && r.P.starts[0].popup === false && r.P.ptt[0] === true, 'app 1.4: el plugin arranca con continuousPTT (se vuelve a prender adentro), sin el pitido de Android, con parciales y sin ventana · ' + JSON.stringify(r.P.starts[0]));
  c(r.m.every((x) => x.on && x.onda) && r.P.ciclos >= 5 && r.P.corte >= 1 && r.P.n === r.P.corte + 1, 'app 1.4: 30 s con ' + r.P.ciclos + ' cortes del motor (' + r.P.corte + ' del todo, que la app volvió a prender) y el 🎤 nunca se apagó');
  c(r.tx === r.P.oidas && !r.on && !r.P.activo && r.P.dobles === 0, 'app 1.4: al tocar 🎤 se apaga y queda todo lo dicho sin repetir (' + r.P.oidas.split(' ').length + ' palabras) · ' + (r.tx === r.P.oidas ? '' : JSON.stringify([r.tx.slice(-100), r.P.oidas.slice(-100)])));
  await p.evaluate(() => { clearInterval(window.__mt); delete window.Capacitor.Plugins.SpeechRecognition; });

  // ================================================================ 3) silencio largo (tope de batería; en la app 5 min, acá 2,5 s)
  await p.evaluate(() => { window.__micTope = 2500; });
  await instalarWeb({ durs: [1000], callado: true });
  await p.fill('#iaTxt', '');
  await p.click('#iaPanel [data-ia="mic"]'); await p.waitForTimeout(1800);
  let r1 = await p.evaluate(() => !!document.querySelector('#iaPanel [data-ia="mic"].on'));
  await p.waitForTimeout(1800);
  r = await p.evaluate(() => ({ on: !!document.querySelector('#iaPanel [data-ia="mic"].on'), ay: (document.getElementById('iaMicAyuda') || {}).textContent || '', ses: window.__habla.ses, activa: !!window.__habla.activa }));
  c(r1 && !r.on && /Apagué el micrófono porque no escuché nada/.test(r.ay) && !r.activa && r.ses >= 2, 'sin ninguna palabra, sigue prendido aunque el motor corte y recién al tope se apaga con aviso · ' + r.ay);
  await instalarWeb({ durs: [1000], n: 3 });
  await p.fill('#iaTxt', '');
  await p.click('#iaPanel [data-ia="mic"]'); await p.waitForTimeout(5000);
  r = await p.evaluate(() => ({ on: !!document.querySelector('#iaPanel [data-ia="mic"].on'), ay: (document.getElementById('iaMicAyuda') || {}).textContent || '', tx: document.getElementById('iaTxt').value }));
  c(!r.on && r.tx === 'columna1 columna2 columna3' && /no escuché nada más/.test(r.ay), 'con algo dicho y después silencio largo: se apaga y deja lo dicho · ' + JSON.stringify(r));
  await p.evaluate(() => { window.__micTope = 0; clearInterval(window.__mt); });

  // ================================================================ 4) enviar mientras dicta: nada vuelve a la caja (v140)
  await instalarWeb({ durs: [4000] });
  await p.evaluate((ev) => { window.__sse.cola.push({ ev, ms: 20 }); }, sseTexto(['Dale.']));
  await p.fill('#iaTxt', '');
  await p.click('#iaPanel [data-ia="mic"]'); await p.waitForTimeout(2600);
  let n0 = await p.evaluate(() => window.__sse.pedidos.length);
  await p.click('#iaEnviar'); await p.waitForTimeout(1500);
  r = await p.evaluate(() => ({ v: document.getElementById('iaTxt').value, on: !!document.querySelector('#iaPanel [data-ia="mic"].on'), tarde: window.__habla.tarde, activa: !!window.__habla.activa, largo: window.__voz.largo() }));
  let env = await p.evaluate((k) => window.__sse.pedidos[k], n0);
  c(r.v === '' && !r.on && r.tarde >= 1 && !r.activa && !r.largo, 'al enviar se apaga el 🎤 y lo que llega tarde NO vuelve a la caja · ' + JSON.stringify(r));
  c(env && /^columna1 columna2/.test(ultUser(env)) && !/tarde/.test(ultUser(env)), 'el mensaje salió con lo dictado hasta el momento · ' + (env ? ultUser(env) : ''));
  await esperarLibre();

  // ================================================================ 5) charla: el motor corta a mitad de frase y NO se manda la mitad
  await p.evaluate(() => {
    const frase = ['decime', 'cuántas', '', '', 'columnas', 'le', 'faltan', 'a', 'san', 'martín'];   // '' = pausa (piensa)
    const H = window.__charlaV = { ses: 0, i: 0, t0: 0, ult: 0, escuchoHablando: 0, durs: [1100, 4000] };
    function SR() { this.lang = ''; }
    SR.prototype.start = function () {
      const s = this; H.ses++; if (window.__hablandoV) H.escuchoHablando++; s.oidas = [];
      const dur = H.ses === 1 ? H.durs[0] : H.durs[1], t0 = performance.now();
      s._tk = setInterval(() => {
        if (s._fin) return;
        if (H.i < frase.length) { const w = frase[H.i++]; if (w) { s.oidas.push(w); H.ult = performance.now(); s.onresult && s.onresult({ results: [[{ transcript: s.oidas.join(' ') }]] }); } }
        if (performance.now() - t0 >= dur) { if (!s.oidas.length) s.onerror && s.onerror({ error: 'no-speech' }); s._terminar(); }
      }, 300);
      s._terminar = () => { if (s._fin) return; s._fin = true; clearInterval(s._tk); s.onend && s.onend(); };
    };
    SR.prototype.stop = function () { const s = this; setTimeout(() => s._terminar(), 80); };
    SR.prototype.abort = function () { this._terminar(); };
    window.webkitSpeechRecognition = SR; window.SpeechRecognition = SR;
  });
  n0 = await p.evaluate(() => window.__sse.pedidos.length);
  await p.evaluate((ev) => { window.__sse.cola.push({ ev, ms: 120 }); }, sseTexto(['Le faltan ', 'ocho columnas ', 'de diez metros. ', '¿Algo más?']));
  await p.click('#iaPanel [data-ia="charla"]');
  for (let i = 0; i < 60; i++) { await p.waitForTimeout(150); if (await p.evaluate((k) => window.__sse.pedidos.length > k, n0)) break; }
  await p.waitForTimeout(3500);
  r = await p.evaluate((k) => ({ b: window.__sse.pedidos[k], tP: window.__sse.tPedido[k], ult: window.__charlaV.ult, ses: window.__charlaV.ses, eh: window.__charlaV.escuchoHablando, dichos: window.__dichos.slice(), on: window.__asistente.charla().on }), n0);
  const espTurno = r.tP - r.ult;
  c(r.b && ultUser(r.b) === 'decime cuántas columnas le faltan a san martín', 'charla: el motor cortó a mitad de frase («decime cuántas…») y se mandó la frase entera · ' + (r.b ? ultUser(r.b) : 'sin pedido'));
  c(espTurno >= 1400 && espTurno < 2600, 'charla: el turno termina ~1,5 s después de lo último que se escuchó (' + Math.round(espTurno) + ' ms)');
  c(r.b && r.b.output_config.effort === 'low' && r.b.stream === true, 'charla: pregunta por voz → effort «low» y respuesta en vivo · ' + JSON.stringify(r.b && [r.b.output_config, r.b.max_tokens, r.b.stream]));
  c(r.dichos.length >= 2 && /Le faltan ocho columnas de diez metros\./.test(r.dichos[0][1]) && /Algo más/.test(r.dichos.map((x) => x[1]).join(' ')) && r.eh === 0 && r.on, 'charla: lee la respuesta frase por frase y vuelve a escuchar sin escucharse a sí misma · ' + JSON.stringify(r.dichos.map((x) => x[1])));
  await p.click('#iaCharla [data-ia="charlafin"]'); await p.waitForTimeout(600);
  await esperarLibre();

  // ================================================================ 6) respuesta en vivo (Worker v4-ia): texto, herramientas, pensamiento, voz
  await p.evaluate(() => { window.__dichos = []; localStorage.setItem('ema.ia.leer', '1'); window.__sse.log = []; window.__vivoLog = []; clearInterval(window.__vl); window.__vl = setInterval(() => { const v = document.getElementById('iaVivo'); window.__vivoLog.push([performance.now(), v ? v.textContent : null, (document.getElementById('iaEstado') || {}).textContent || '']); }, 50); });
  n0 = await p.evaluate(() => window.__sse.pedidos.length);
  const partes = ['Hoy hay ', 'dos órdenes. ', 'La primera es en ', 'Plaza San Martín ', 'con Juan. ', 'La segunda ', 'todavía ', 'no tiene gente.'];
  await p.evaluate(([e1, e2]) => { window.__sse.cola.push({ ev: e1, ms: 30, t0: 500 }, { ev: e2, ms: 220, t0: 400 }); }, [sseHerr('Me fijo.', 'buscar_obra', ['{"tex', 'to":"san ', 'martin"}']), sseTexto(partes)]);
  const t0click = await p.evaluate(() => performance.now());
  await p.fill('#iaTxt', 'qué órdenes hay hoy en san martín y quién va');
  await p.click('#iaEnviar');
  await p.waitForTimeout(90);
  r = await p.evaluate(() => (document.getElementById('iaEstado') || {}).textContent || '');
  c(/Pensando/.test(r), '«💭 Pensando…» aparece al instante, antes de que conteste nada · ' + r);
  await esperarLibre(); await p.waitForTimeout(400);
  r = await p.evaluate((k) => ({ p1: window.__sse.pedidos[k], p2: window.__sse.pedidos[k + 1], log: window.__vivoLog.slice(), sl: window.__sse.log.slice(), dichos: window.__dichos.slice(), fin: Array.from(document.querySelectorAll('#iaChat .ia-b.ia')).pop().textContent, vivo: !!document.getElementById('iaVivo'), med: (window.__iaMedidas || []).slice(-1)[0] }), n0);
  await p.evaluate(() => clearInterval(window.__vl));
  c(r.p1 && r.p1.stream === true && r.p2 && r.p2.stream === true, 'con el Worker v4-ia los pedidos van con stream:true');
  const a2 = r.p2 && r.p2.messages[r.p2.messages.length - 2], tr2 = r.p2 && r.p2.messages[r.p2.messages.length - 1];
  c(a2 && JSON.stringify(a2.content) === JSON.stringify([{ type: 'thinking', thinking: 'busco la obra', signature: 'firmaB' }, { type: 'text', text: 'Me fijo.' }, { type: 'tool_use', id: 'tu_1', name: 'buscar_obra', input: { texto: 'san martin' } }]), 'lo que llegó de a pedazos se arma igual que la respuesta entera: pensamiento con su firma, texto y herramienta con su input · ' + JSON.stringify(a2 && a2.content));
  c(tr2 && tr2.content[0].type === 'tool_result' && tr2.content[0].tool_use_id === 'tu_1' && /San Mart/.test(JSON.stringify(tr2.content[0].content)), 'la herramienta corrió en la app y su resultado volvió en el pedido siguiente');
  const lastEv = r.sl.filter((x) => x[1] === 'message_stop').pop()[0];
  const enVivo = r.log.filter((x) => x[1] && x[0] < lastEv);
  const parcial = enVivo.find((x) => /Hoy hay dos órdenes/.test(x[1]) && !/no tiene gente/.test(x[1]));
  c(parcial && enVivo.length >= 5, 'el texto se va escribiendo en la burbuja mientras llega (' + enVivo.length + ' muestras antes del final) · ' + (parcial ? parcial[1].slice(0, 60) : JSON.stringify(r.log.slice(-3))));
  c(/Hoy hay dos órdenes\. La primera es en Plaza San Martín con Juan\. La segunda todavía no tiene gente\./.test(r.fin.replace(/\s+/g, ' ')) && !r.vivo, 'al terminar queda la burbuja de siempre con el texto completo (y sin la de «en vivo») · ' + r.fin.slice(0, 120));
  c(r.dichos.length >= 2 && r.dichos[0][0] < lastEv && /Hoy hay dos órdenes/.test(r.dichos[0][1]), '«leer siempre»: empieza a leer con la primera frase, antes de que termine de llegar (' + (r.dichos.length ? Math.round(lastEv - r.dichos[0][0]) : '-') + ' ms antes) · ' + JSON.stringify(r.dichos.map((x) => x[1])));
  const todo = r.dichos.map((x) => x[1]).join(' ');
  c(/La segunda todavía no tiene gente/.test(todo) && (todo.match(/Hoy hay dos órdenes/g) || []).length === 1, 'lee todo una sola vez (nada repetido) · ' + todo);
  c(r.med && r.med.stream && r.med.nHerr === 1 && r.med.primero > 0 && r.med.primero < r.med.total, 'tiempos de la pregunta guardados (window.__iaMedidas): primer texto ' + (r.med && r.med.primero) + ' ms de ' + (r.med && r.med.total) + ' ms · ' + JSON.stringify(r.med));
  await p.evaluate(() => { localStorage.setItem('ema.ia.leer', '0'); window.__voz.callar(); });

  // ================================================================ 7) effort por tipo de pregunta
  const effortDe = async (t) => { await p.evaluate((ev) => { window.__sse.cola.push({ ev, ms: 0 }); }, sseTexto(['Ok.'])); const k = await p.evaluate(() => window.__sse.pedidos.length); await p.fill('#iaTxt', t); await p.click('#iaEnviar'); await esperarLibre(); const b = await p.evaluate((k) => window.__sse.pedidos[k], k); return b ? b.output_config.effort + '/' + b.max_tokens : '?'; };
  const e1 = await effortDe('cómo viene san martín'), e2 = await effortDe('revisá y compará el cómputo de san martín con el itemizado'), e3 = await effortDe('armá una orden para mañana en san martín con juan'), e4 = await effortDe('contame en detalle cómo vienen todas las obras de la zona este, cuáles están atrasadas contra el gantt y por qué');
  c(e1 === 'low/4000' && e2 === 'medium/16000' && !/^low/.test(e3) && e4 === 'medium/16000', 'effort: pregunta corta → low; revisar/comparar, armar una orden o una pregunta larga → como antes · ' + JSON.stringify([e1, e2, e3, e4]));

  // ================================================================ 8) sin Worker v4: como hoy
  salud = { ok: true, version: 'v3-ia' };
  await p.evaluate(() => { localStorage.removeItem('ema.ia.stream.ts'); window.__asistente.revisarSalud(true); });
  await p.waitForTimeout(600);
  r = await p.evaluate(() => window.__asistente.streamOk());
  c(r === false, 'con el Worker v3-ia, /salud apaga la respuesta en vivo');
  await p.evaluate((j) => { window.__sse.cola.push({ json: j, t0: 300 }); window.__vivoV = 0; const mo = new MutationObserver(() => { if (document.getElementById('iaVivo')) window.__vivoV++; }); mo.observe(document.getElementById('iaChat'), { childList: true }); window.__moV = mo; }, jsonFin('Hay una orden hoy.'));
  n0 = await p.evaluate(() => window.__sse.pedidos.length);
  await p.fill('#iaTxt', 'cuántas órdenes hay hoy'); await p.click('#iaEnviar'); await esperarLibre();
  r = await p.evaluate((k) => ({ b: window.__sse.pedidos[k], fin: Array.from(document.querySelectorAll('#iaChat .ia-b.ia')).pop().textContent, vv: window.__vivoV }), n0);
  c(r.b && !('stream' in r.b) && /Hay una orden hoy/.test(r.fin) && r.vv === 0, 'sin v4: el pedido va sin stream y la respuesta llega entera como siempre');
  // el Worker dice v4 pero contesta JSON (p. ej. un proxy que junta todo): igual anda
  await p.evaluate(() => localStorage.setItem('ema.ia.stream', '1'));
  await p.evaluate((j) => { window.__sse.cola.push({ json: j, t0: 100 }); }, jsonFin('Anda igual.'));
  await p.fill('#iaTxt', 'y mañana'); await p.click('#iaEnviar'); await esperarLibre();
  r = await p.evaluate(() => Array.from(document.querySelectorAll('#iaChat .ia-b.ia')).pop().textContent);
  c(/Anda igual/.test(r), 'si pidió en vivo y llega JSON entero, igual muestra la respuesta');

  // ================================================================ 9) tiempos (lo de la app: armar, herramientas, dibujar). Celu: CPU ×4
  let cdp = null; if (cel) { cdp = await A.ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 }); }
  const RED = 1500;   // lo que tardaría Claude en contestar (simulado), igual en las dos
  const medir = async (nueva) => {
    await p.evaluate(([nueva, e1, e2, j1, j2, RED]) => {
      window.__v149No = !nueva; localStorage.setItem('ema.ia.stream', nueva ? '1' : '0');
      if (nueva) window.__sse.cola.push({ ev: e1, t0: 300, ms: 0 }, { ev: e2, t0: 300, ms: Math.round((RED - 300) / 19) });
      else window.__sse.cola.push({ json: j1, t0: 300 }, { json: j2, t0: RED });
      window.__tm = { t0: 0, primero: 0, fin: 0 };
      const ch = document.getElementById('iaChat');
      const mo = new MutationObserver(() => { const now = performance.now(); if (!window.__tm.primero && (document.getElementById('iaVivo') || ch.querySelector('.ia-b.ia.nuevo'))) window.__tm.primero = now; });
      Array.from(ch.querySelectorAll('.ia-b.ia')).forEach((x) => x.classList.add('viejo'));
      mo.observe(ch, { childList: true, subtree: true, characterData: true }); window.__moT = mo;
      const mo2 = new MutationObserver(() => { const b = Array.from(ch.querySelectorAll('.ia-b.ia:not(.viejo):not(.ia-vivo)')).pop(); if (b && !window.__tm.fin) { window.__tm.fin = performance.now(); if (!window.__tm.primero) window.__tm.primero = window.__tm.fin; } });
      mo2.observe(ch, { childList: true }); window.__moT2 = mo2;
    }, [nueva, sseHerr('Me fijo.', 'buscar_obra', ['{"texto":"san martin"}']), sseTexto(partes), { id: 'x1', type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [{ type: 'text', text: 'Me fijo.' }, { type: 'tool_use', id: 'tu_9', name: 'buscar_obra', input: { texto: 'san martin' } }], stop_reason: 'tool_use', usage: { input_tokens: 1, output_tokens: 1 }, ema: { version: 'v3-ia' } }, jsonFin(partes.join('')), RED]);
    await p.fill('#iaTxt', 'qué órdenes hay hoy en san martín y quién va');
    await p.evaluate(() => { window.__tm.t0 = performance.now(); document.getElementById('iaEnviar').click(); });
    await esperarLibre(); await p.waitForTimeout(300);
    return p.evaluate(() => { window.__moT.disconnect(); window.__moT2.disconnect(); const t = window.__tm; return { primero: Math.round(t.primero - t.t0), fin: Math.round(t.fin - t.t0), med: (window.__iaMedidas || []).slice(-1)[0] }; });
  };
  const antes = await medir(false), ahora = await medir(true);
  await p.evaluate(() => { window.__v149No = false; });
  if (cdp) await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  const red2 = 300 + RED;   // dos idas al Worker: 300 ms la herramienta + lo que tarda en llegar la respuesta
  console.log('  TIEMPOS ' + (cel ? 'celu CPU×4' : 'PC') + ' · Claude simulado ' + red2 + ' ms en dos vueltas · antes (v148): primer texto ' + antes.primero + ' ms, fin ' + antes.fin + ' ms · ahora (v149): primer texto ' + ahora.primero + ' ms, fin ' + ahora.fin + ' ms · lo de la app (armar ' + (ahora.med && ahora.med.armar) + ' ms, herramientas ' + (ahora.med && ahora.med.herr) + ' ms, dibujar ' + (ahora.med && ahora.med.pintar) + ' ms, pedido ' + (ahora.med && ahora.med.kb) + ' KB)');
  c(ahora.primero > 0 && ahora.primero < antes.primero - 800, 'con respuesta en vivo, el primer texto aparece mucho antes: ' + ahora.primero + ' ms contra ' + antes.primero + ' ms');
  c(ahora.fin < antes.fin + 400, 'el total no empeora: ' + ahora.fin + ' ms contra ' + antes.fin + ' ms');
  c(ahora.med && ahora.med.armar < (cel ? 400 : 150) && ahora.med.pintar < (cel ? 300 : 100), 'lo que pone la app es poco: armar el pedido ' + (ahora.med && ahora.med.armar) + ' ms, dibujar ' + (ahora.med && ahora.med.pintar) + ' ms');

  if (cel) { const sw = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); c(sw <= 0, 'sin scroll de costado · ' + sw); }
  const errs = (A.errores || []).filter((e) => !/Missing or insufficient permissions|permission-denied|ERR_|Failed to fetch|aborted|fetching the script|net::|sin guion/i.test(e));
  c(!errs.length, 'sin errores de JS ' + JSON.stringify(errs.slice(0, 3)));
  await A.browser.close(); process.exit(c.fin() ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
