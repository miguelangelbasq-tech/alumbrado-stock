  // ---------- v137 · dictado en vivo + onda de rayitas (pedido de Ángel: «que vaya apareciendo lo que digo, con la onda como WhatsApp»)
  //  · El texto parcial (interimResults del navegador / partialResults del plugin de la app 1.4) va apareciendo en el cuadro.
  //  · La onda (#iaOndaV, 28 rayitas que corren de derecha a izquierda): en la compu con el navegador, nivel REAL del micrófono
  //    (getUserMedia + AnalyserNode, al mismo tiempo que el reconocimiento: en Chrome de escritorio no choca). En el celu y en la
  //    app (el micrófono lo usa el reconocedor y abrirlo dos veces corta el dictado) la onda es simulada y salta con cada palabra.
  //    Si el micrófono no se puede abrir para medir, queda simulada. Sin «?.» ni «??»: Chrome 80.
  const ONDA = (function () {
    const N = 28;
    let on = false, raf = 0, stream = null, ctx = null, an = null, buf = null, real = false, hist = [], golpe = 0, modo = "", ultTx = "", pedido = 0;
    const caja = () => $("iaOndaV");
    function puedeReal() {
      if (window.__iaOndaSimulada) return false;
      if (plug("SpeechRecognition") || window.__cargador) return false;
      if (/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent || "")) return false;
      try { if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) return false; } catch (e) { }
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && (window.AudioContext || window.webkitAudioContext));
    }
    function armar() {
      const c = caja(); if (!c) return null;
      if (c.children.length !== N) { let s = ""; for (let i = 0; i < N; i++) s += "<i></i>"; c.innerHTML = s; }
      return c;
    }
    function nivelReal() {
      if (!an) return 0;
      an.getByteTimeDomainData(buf);
      let s = 0; for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; s += v * v; }
      return Math.min(1, Math.sqrt(s / buf.length) * 5);
    }
    function nivelSimulado(t) {
      golpe = Math.max(0, golpe - 0.045);
      const base = 0.16 + 0.1 * Math.abs(Math.sin(t / 170)) + 0.08 * Math.random();
      return Math.min(1, base + golpe * (0.55 + 0.45 * Math.random()));
    }
    let ultT = 0;
    function cuadro(t) {
      if (!on) return;
      raf = requestAnimationFrame(cuadro);
      if (t - ultT < 60) return;   // ≈ 16 por segundo: liviano en los celus viejos
      ultT = t;
      const n = real ? nivelReal() : nivelSimulado(t);
      hist.push(n); if (hist.length > N) hist.shift();
      const c = caja(); if (!c) return;
      const l = c.children, k = N - hist.length;
      for (let i = 0; i < N; i++) { const v = i < k ? 0.08 : Math.max(0.08, hist[i - k]); l[i].style.transform = "scaleY(" + v.toFixed(3) + ")"; }
      c.dataset.nivel = n.toFixed(3);
    }
    async function medir(yo) {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: false });
        if (!on || yo !== pedido) { s.getTracks().forEach((x) => x.stop()); return; }
        const AC = window.AudioContext || window.webkitAudioContext;
        ctx = new AC(); const src = ctx.createMediaStreamSource(s); an = ctx.createAnalyser(); an.fftSize = 512; an.smoothingTimeConstant = 0.6;
        buf = new Uint8Array(an.fftSize); src.connect(an); stream = s; real = true;
        const c = caja(); if (c) c.dataset.fuente = "real";
      } catch (e) { real = false; }
    }
    function prender(m) {
      const c = armar(); if (!c) return;
      if (on) { modo = m || modo; c.dataset.modo = modo; return; }
      on = true; modo = m || "dicta"; hist = []; golpe = 0.4; ultTx = ""; real = false; pedido++;
      c.hidden = false; c.dataset.modo = modo; c.dataset.fuente = "simulada";
      document.body.classList.add("ia-ondando");
      if (puedeReal()) medir(pedido);
      raf = requestAnimationFrame(cuadro);
    }
    function apagar() {
      if (!on) return;
      on = false; pedido++; cancelAnimationFrame(raf); raf = 0;
      try { stream && stream.getTracks().forEach((x) => x.stop()); } catch (e) { }
      try { ctx && ctx.close(); } catch (e) { }
      stream = null; ctx = null; an = null; buf = null; real = false;
      const c = caja(); if (c) { c.hidden = true; c.dataset.fuente = ""; }
      document.body.classList.remove("ia-ondando");
    }
    function pulso(tx) {   // llegó texto parcial: la onda simulada salta (más si llegaron más letras)
      tx = String(tx || ""); const d = Math.max(0, tx.length - ultTx.length); ultTx = tx;
      golpe = Math.min(1, golpe + 0.35 + Math.min(0.4, d * 0.04));
    }
    return { on: prender, off: apagar, pulso, estado: () => ({ on, real, modo, n: hist.length }) };
  })();
  window.__iaOnda = ONDA;
  // el texto parcial en el cuadro: que se agrande y se vea lo último
  function enVivoCaja(t) { try { t.dispatchEvent(new Event("input", { bubbles: true })); } catch (e) { } try { t.scrollTop = t.scrollHeight; } catch (e) { } }
