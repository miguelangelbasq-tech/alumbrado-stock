  // ---------- v149 · respuesta en vivo (stream) y medidas
  //  · Solo si el Worker es v4-ia o más nuevo (lo dice /salud, que se pregunta al abrir el panel cada 6 h, o el ema.version de
  //    cada respuesta). Con el Worker de antes no se manda «stream» y todo sigue como hoy.
  //  · leerSSE arma el mismo mensaje que daría la respuesta entera (text, tool_use con su input, thinking con su firma,
  //    fallback…), así la historia sigue igual («solo agregar», v136). Si el WebView no deja leer de a pedazos, se lee todo
  //    junto al final (mismo resultado, sin el texto en vivo).
  const ahoraMs = () => (window.performance && performance.now ? performance.now() : Date.now());
  const LS_STREAM = "ema.ia.stream";
  function streamOk() {
    if (window.__v149No || window.__iaCompat || window.__iaStreamNo) return false;
    try { return localStorage.getItem(LS_STREAM) === "1"; } catch (e) { return false; }
  }
  function marcarVersion(v) {
    if (!v || window.__v149No) return;
    try { localStorage.setItem(LS_STREAM, /^v([4-9]|\d{2,})-ia/.test(String(v)) ? "1" : "0"); localStorage.setItem(LS_STREAM + ".ts", String(Date.now())); } catch (e) { }
  }
  let saludPend = false;
  function revisarSalud(forzar) {
    if (window.__v149No || window.__iaCompat || saludPend || navigator.onLine === false) return;
    let ts = 0; try { ts = +localStorage.getItem(LS_STREAM + ".ts") || 0; } catch (e) { }
    if (!forzar && Date.now() - ts < 6 * 3600e3) return;
    saludPend = true;
    fetch(URL_IA.replace(/\/ia$/, "/salud"), { cache: "no-store" }).then((r) => r.json()).then((j) => { if (j && j.version) marcarVersion(j.version); }).catch(() => { }).then(() => { saludPend = false; });
  }
  async function leerSSE(r, onTexto) {
    const msg = { content: [] }, jsonP = {}; let ema = null, err = null, resto = "", ultT = 0;
    const textoDe = () => msg.content.filter((b) => b && b.type === "text" && String(b.text || "").trim()).map((b) => b.text).join("\n\n");
    const aviso = (forzar) => { if (!onTexto) return; const a = ahoraMs(); if (!forzar && a - ultT < 90) return; ultT = a; try { onTexto(textoDe()); } catch (e) { } };
    function evento(tipo, d) {
      if (tipo === "ema") { ema = d; return; }
      if (!d || typeof d != "object") return;
      const t = d.type || tipo;
      if (t === "message_start" && d.message) { const m = d.message; Object.keys(m).forEach((k) => { if (k !== "content") msg[k] = m[k]; }); msg.content = []; }
      else if (t === "content_block_start") { msg.content[d.index] = Object.assign({}, d.content_block); if (msg.content[d.index].type === "tool_use") jsonP[d.index] = ""; }
      else if (t === "content_block_delta") {
        const b = msg.content[d.index], x = d.delta || {}; if (!b) return;
        if (x.type === "text_delta") { b.text = (b.text || "") + (x.text || ""); aviso(false); }
        else if (x.type === "input_json_delta") jsonP[d.index] = (jsonP[d.index] || "") + (x.partial_json || "");
        else if (x.type === "thinking_delta") b.thinking = (b.thinking || "") + (x.thinking || "");
        else if (x.type === "signature_delta") b.signature = (b.signature || "") + (x.signature || "");
        else if (x.type === "citations_delta") (b.citations = b.citations || []).push(x.citation);
      }
      else if (t === "content_block_stop") { const b = msg.content[d.index]; if (b && b.type === "tool_use" && Object.prototype.hasOwnProperty.call(jsonP, d.index)) { const s = jsonP[d.index]; try { b.input = s ? JSON.parse(s) : {}; } catch (e) { b.input = {}; } delete jsonP[d.index]; } }
      else if (t === "message_delta") { if (d.delta) Object.keys(d.delta).forEach((k) => { msg[k] = d.delta[k]; }); if (d.usage) msg.usage = Object.assign({}, msg.usage || {}, d.usage); }
      else if (t === "error") err = d.error || { type: "error" };
    }
    function bloque(s) {   // un evento SSE: «event: x» + «data: {...}»
      let tipo = "", data = "";
      s.split(/\r?\n/).forEach((l) => { if (l.indexOf("event:") === 0) tipo = l.slice(6).trim(); else if (l.indexOf("data:") === 0) data += l.slice(5).trim(); });
      if (!data) return; let d = null; try { d = JSON.parse(data); } catch (e) { return; } evento(tipo, d);
    }
    const tragar = (s) => { resto += s; const p = resto.split(/\r?\n\r?\n/); resto = p.pop(); p.forEach(bloque); };
    if (r.body && r.body.getReader && typeof TextDecoder != "undefined") {
      const rd = r.body.getReader(), dec = new TextDecoder();
      for (;;) { const x = await rd.read(); if (x.done) break; tragar(dec.decode(x.value, { stream: true })); }
      tragar(dec.decode());
    } else tragar(await r.text());
    if (resto.trim()) bloque(resto);
    msg.content = msg.content.filter((b) => !!b);
    aviso(true);
    if (err && !msg.stop_reason) {
      const oc = err.type === "overloaded_error";
      return { error: { tipo: oc ? "ocupado" : "claude", mensaje: oc ? "Claude está muy ocupado en este momento. Probá de nuevo en un rato." : "Se cortó la respuesta del asistente. Probá de nuevo." } };
    }
    if (ema) msg.ema = ema;
    msg.__stream = true;
    return msg;
  }
  // las últimas 20 preguntas con sus tiempos (ms): armar el pedido, red (Worker + Claude), herramientas, primer texto a la vista, total
  const MEDIDAS = [];
  function guardarMedida(m) {
    const o = { cuando: new Date().toTimeString().slice(0, 8), texto: m.texto, modelo: m.modelo, effort: m.effort, stream: m.stream, primero: Math.round(m.primero), total: Math.round(m.total), armar: Math.round(m.armar), red: Math.round(m.red), herr: Math.round(m.herr), nHerr: m.nHerr, pintar: Math.round(m.pintar), kb: Math.round(m.bytes / 1024) };
    MEDIDAS.push(o); if (MEDIDAS.length > 20) MEDIDAS.shift();
    window.__iaMedidas = MEDIDAS;
  }