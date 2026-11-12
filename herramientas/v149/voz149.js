    // ---------- v149 · el micrófono no se «destilda» solo (Ángel 12/11: «como el micrófono de Claude: yo hablo y se va
    // escribiendo, y se destilda recién cuando yo aprieto»)
    //  · Por qué se cortaba: el reconocedor de Android termina solo al primer silencio (1–2 s) o a los 5–10 s, y el del
    //    navegador con continuous=false igual; la app tomaba ese final como «terminé» y apagaba el 🎤.
    //  · Ahora cada corte del motor se vuelve a prender solo (sesiones encadenadas) y el texto se junta sin repetir (juntar +
    //    sinEco). En la app 1.4 el plugin además se encadena adentro: continuousPTT + muteRecognizerBeep (sin el pitido de
    //    Android en cada vuelta); si el plugin no lo acepta, se encadena solo desde acá.
    //  · Termina cuando la persona lo apaga (parar = guarda lo último), al enviar (cortar = no escribe nada más, v140), con
    //    op.finSilencio ms sin texto nuevo (charla: fin de turno) o con op.topeSinPalabras ms sin ninguna palabra (batería).
    //  · Sin «?.» ni «??»: Chrome 80.
    let largo = null, ctlSes = null, pttOk = true;
    const nrmV = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9ñ ]+/g, " ").replace(/\s+/g, " ").trim();
    function juntar(a, b) {   // lo dicho antes + lo de la sesión nueva, sin repetir
      a = String(a || "").trim(); b = String(b || "").trim();
      if (!a) return b; if (!b) return a;
      const na = nrmV(a), nb = nrmV(b);
      if (!nb) return a; if (!na) return b;
      if (na === nb) return b.length >= a.length ? b : a;
      if (nb.indexOf(na + " ") === 0) return b;   // el motor trajo todo de nuevo (acumulado)
      const wa = a.split(/\s+/), wb = b.split(/\s+/);
      if (wb.length >= 2 && (" " + na).slice(-(nb.length + 1)) === " " + nb) return a;   // ya estaba al final
      for (let k = Math.min(wa.length, wb.length, 12); k >= 2; k--) if (nrmV(wa.slice(-k).join(" ")) === nrmV(wb.slice(0, k).join(" "))) return wa.concat(wb.slice(k)).join(" ");
      return a + " " + b;
    }
    const parcialL = (e) => {   // plugin @capgo: con continuousPTT trae «accumulated» (lo de las vueltas anteriores) o «accumulatedText»
      if (!e) return "";
      const m = e.matches || e.value, m0 = String((m && m[0]) || e.text || "");
      if (e.isRestarting) return String(e.accumulated || m0 || "");
      if (e.accumulatedText) return String(e.accumulatedText);
      return (e.accumulated ? String(e.accumulated) + " " : "") + m0;
    };
    const sinErr = (q) => { try { q && q.catch && q.catch(() => { }); } catch (e) { } };
    function sesNativo(SR, cambio) {
      return new Promise((ok) => {
        let txt = "", hecho = false; const hs = [];
        const fin = (err) => { if (hecho) return; hecho = true; ctlSes = null; hs.forEach((h) => { try { h && h.remove && h.remove(); } catch (e) { } }); ok({ texto: txt.trim(), err: err || "" }); };
        (async () => {
          try {
            hs.push(await SR.addListener("partialResults", (e) => { if (hecho) return; const s = parcialL(e).trim(); if (s) { txt = s; cambio(txt); } }));
            hs.push(await SR.addListener("listeningState", (e) => { if (e && (e.state === "stopped" || e.status === "stopped")) setTimeout(() => fin(""), 150); }));
            hs.push(await SR.addListener("error", (e) => { const c = String((e && e.code) || ""); if (!/NO_MATCH|SPEECH_TIMEOUT|RECOGNIZER_BUSY/.test(c)) fin(/PERMISSION|INSUFFICIENT/.test(c) ? "no hay permiso para el micrófono" : /NETWORK/.test(c) ? "el dictado necesita señal" : "no pude usar el micrófono (" + c + ")"); }));
          } catch (e) { }
          if (hecho) return;
          ctlSes = (ya) => {
            try { if (SR.setPTTState) sinErr(SR.setPTTState({ held: false })); } catch (e) { }
            try { sinErr(SR.stop()); } catch (e) { }
            if (ya) { try { if (SR.removeAllListeners) sinErr(SR.removeAllListeners()); } catch (e) { } fin(""); } else setTimeout(() => fin(""), 900);
          };
          const op = { language: langN || "es-AR", maxResults: 1, partialResults: true, popup: false };
          if (pttOk) { op.continuousPTT = true; op.muteRecognizerBeep = true; try { if (SR.setPTTState) await SR.setPTTState({ held: true }); } catch (e) { } }
          try { await SR.start(op); }
          catch (e) {
            const m = String((e && (e.message || e.code)) || e);
            if (pttOk && /continuous|PTT/i.test(m)) { pttOk = false; fin(""); }
            else if (/NO_MATCH|SPEECH_TIMEOUT/.test(m)) fin("");
            else if (/already running/i.test(m)) { try { await SR.stop(); } catch (er) { } fin("ocupado"); }
            else if (/language/i.test(m) && !langN) { langN = "es-US"; fin(""); }
            else fin(/permission/i.test(m) ? "no hay permiso para el micrófono" : "no pude usar el micrófono");
          }
        })();
      });
    }
    const esAndroid = () => /Android/i.test(navigator.userAgent || "");
    function sesWeb(W, cambio) {
      return new Promise((ok) => {
        let r = null, txt = "", err = "", hecho = false;
        const fin = () => { if (hecho) return; hecho = true; ctlSes = null; ok({ texto: txt.trim(), err }); };
        try { r = new W(); } catch (e) { ok({ texto: "", err: "sin-dictado" }); return; }
        r.lang = "es-AR"; r.interimResults = true; r.maxAlternatives = 1;
        r.continuous = !esAndroid();   // en la compu una sola sesión larga; en Chrome de Android continuous repite el texto: ahí se encadena
        r.onresult = (e) => { if (hecho) return; let s = ""; for (let i = 0; i < e.results.length; i++) s += e.results[i][0].transcript; s = s.trim(); if (s) { txt = s; cambio(txt); } };
        r.onerror = (e) => { const c = (e && e.error) || ""; if (c !== "no-speech" && c !== "aborted") err = c === "not-allowed" || c === "service-not-allowed" ? "no hay permiso para el micrófono" : c === "network" ? "el dictado necesita señal" : c === "audio-capture" ? "no encontré el micrófono" : "no te escuché bien"; };
        r.onend = fin;
        ctlSes = (ya) => {
          if (ya) { r.onresult = null; r.onend = null; try { if (r.abort) r.abort(); else r.stop(); } catch (e) { } fin(); return; }
          try { r.stop(); } catch (e) { } setTimeout(fin, 1500);
        };
        try { r.start(); } catch (e) { err = "no pude usar el micrófono"; fin(); }
      });
    }
    const FATAL = /permiso|no tiene el reconocedor|sin-dictado|no encontr/;
    function escucharLargo(enVivo, op) {
      op = op || {};
      const yo = ++ses, n0 = nSR(), w0 = n0 ? null : wSR();
      if (!n0 && !w0) return Promise.resolve({ texto: "", err: "sin-dictado" });
      if (largo) { try { largo.cortar(); } catch (e) { } }
      let acum = "", vivo = "", activo = true, parando = false, cortado = false, silencio = false, fallas = 0, sesiones = 0, algo = false, ultCambio = Date.now(), reloj = null;
      const total = () => juntar(acum, vivo);
      const cambio = (s) => { s = sinEco(s); if (!activo || yo !== ses || s === vivo) return; vivo = s; ultCambio = Date.now(); algo = true; if (enVivo) enVivo(sinEco(total())); };
      const ctl = {
        parar() { if (!activo || parando) return; parando = true; const f = ctlSes; if (f) f(false); },
        cortar() { if (!activo) return; cortado = true; activo = false; const f = ctlSes; if (f) f(true); },
        estado: () => ({ activo, parando, sesiones, fallas, texto: total(), sinPalabras: Date.now() - ultCambio })
      };
      largo = ctl;
      return new Promise((ok) => {
        const cerrar = (err) => {
          clearInterval(reloj); if (largo === ctl) largo = null; activo = false;
          ok(cortado || yo !== ses ? { texto: "", err: "", cortado: true } : { texto: sinEco(total()).trim(), err: err || "", silencio, sesiones });
        };
        reloj = setInterval(() => {
          if (!activo || parando) return;
          const sin = Date.now() - ultCambio;
          if (op.finSilencio > 0 && algo && total().trim() && sin >= op.finSilencio) ctl.parar();
          else if (op.topeSinPalabras > 0 && sin >= op.topeSinPalabras) { silencio = true; ctl.parar(); }
        }, 150);
        (async () => {
          try {
            if (n0) { const e0 = await permisoNativo(n0); if (e0) return cerrar(e0); }
            while (activo) {
              const t0 = Date.now(); sesiones++; vivo = "";
              const r = await (n0 ? sesNativo(n0, cambio) : sesWeb(w0, cambio));
              if (!activo) break;
              if (r.texto) vivo = sinEco(r.texto);
              acum = total(); vivo = "";
              if (parando) break;
              if (r.err && FATAL.test(r.err)) return cerrar(r.err);
              if (r.err || Date.now() - t0 < 700) { fallas++; if (fallas >= 8) return cerrar(r.err && r.err !== "ocupado" ? r.err : "no pude usar el micrófono"); await espera(Math.min(2000, 150 * fallas)); }
              else fallas = 0;
              if (!activo || parando) break;
              await espera(60);   // el motor nuevo arranca enseguida: lo que se diga en el medio lo toma el siguiente
            }
            cerrar("");
          } catch (e) { cerrar("no pude usar el micrófono"); }
        })();
      });
    }
    // ---------- v149 · leer en voz alta desde la primera frase (la respuesta llega de a pedazos con el Worker v4-ia)
    function decirUno(p, T) {
      return new Promise((ok) => {
        if (T) { T.speak({ text: p, lang: "es-AR", rate: 1.0, pitch: 1.0, volume: 1.0, queueStrategy: 0 }).then(() => ok(), () => T.speak({ text: p, lang: "es-US", rate: 1.0, queueStrategy: 0 }).then(() => ok(), () => ok())); return; }
        let listo = false, perro = null; const f = () => { if (listo) return; listo = true; clearTimeout(perro); ok(); };
        try {
          const u = new SpeechSynthesisUtterance(p); u.lang = "es-AR"; u.rate = 1; const v = vozWeb(); try { if (v) u.voice = v; } catch (e) { }
          u.onend = f; u.onerror = f; perro = setTimeout(f, 4000 + p.length * 110);
          window.speechSynthesis.speak(u);
        } catch (e) { f(); }
      });
    }
    function hablante(op) {   // poner(texto que va llegando) lee cada frase completa; fin(texto final) lee lo que falta y espera
      op = op || {};
      callar();
      const T = nTTS(), max = T ? 3000 : 220;
      let dicho = 0, hecho = "", cola = [], corriendo = false, vivo = hayHabla(), finado = false, finOk = null, empezo = false;
      const terminar = () => { if (cortarH === corte) cortarH = null; if (!corriendo) hablando = false; const f = finOk; finOk = null; if (f) f(); };
      const corte = () => { vivo = false; cola = []; corriendo = false; try { if (T) T.stop(); else window.speechSynthesis.cancel(); } catch (e) { } terminar(); };
      function bomba() {
        if (!vivo || corriendo) return;
        const p = cola.shift();
        if (!p) { if (finado) terminar(); return; }
        if (!empezo) { empezo = true; try { if (op.alEmpezar) op.alEmpezar(); } catch (e) { } }
        corriendo = true; hablando = true; cortarH = corte;
        decirUno(p, T).then(() => { if (!vivo) return; corriendo = false; bomba(); });
      }
      const corteFrase = (a, desde) => { const re = /[.!?;:](?=\s)|\n/g; re.lastIndex = desde; let m, h = -1; while ((m = re.exec(a))) h = m.index + 1; return h; };
      function poner(a, final) {
        if (!vivo) return; a = String(a || "");
        if (a.slice(0, dicho) !== hecho) { if (!final || dicho) { bomba(); return; } }   // lo de antes cambió: no se repite
        const h = final ? a.length : corteFrase(a, dicho);
        if (h > dicho) { const tx = paraVoz(a.slice(dicho, h)); dicho = h; hecho = a.slice(0, h); if (tx && /[a-z0-9áéíóúñ]/i.test(tx)) partir(tx, max).forEach((x) => cola.push(x)); }
        bomba();
      }
      return {
        poner: (a) => poner(a, false),
        parte: () => { dicho = 0; hecho = ""; },   // empieza otro texto (otra vuelta de herramientas, o un error)
        fin: (a) => new Promise((ok) => { if (!vivo) return ok(); finOk = ok; finado = true; poner(a, true); if (!corriendo && !cola.length) terminar(); }),
        cortar: corte, empezo: () => empezo
      };
    }