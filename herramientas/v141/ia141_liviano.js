  // ---------- v141 · el asistente por rol y los topes (los controla el Worker v3-ia; acá solo se muestran)
  //  · Por defecto lo ven TODOS los roles (Administración lo puede apagar por rol en ⚙ › Límites).
  //  · __iaUso: lo que le queda a la persona hoy (/mio y cada respuesta: ema.uso) y el gasto del mes (/uso, admin y oficina).
  //  · Al cruzar el 80 % del mes, la primera respuesta trae ema.freno.avisar: se le avisa al celular a Administración (una vez).
  window.__iaLimDef = () => ({ roles: { oficina: { preguntas: 30, remitos: 40 }, panol: { preguntas: 20, remitos: 40 }, cuadrilla: { preguntas: 10, remitos: 0 }, operario: { preguntas: 10, remitos: 0 }, mirar: { preguntas: 10, remitos: 0 } }, mes: { tope: 100, pausaPct: 80, cortePct: 95 } });
  window.__iaNivel = function () {
    let y = null; try { y = window.PERMISOS && PERMISOS.yo ? PERMISOS.yo() : null; } catch (e) { y = null; }
    const r = String((y && y.rol) || "");
    return r === "admin" || r === "oficina" || r === "panol" ? r : r === "cuadrilla" || r === "operario" ? "crew" : "mirar";
  };
  const urlW = (ruta) => String(window.__iaUrl || "https://ema-ia.mdiaz-60f.workers.dev/ia").replace(/\/ia\/?$/, "") + ruta;
  async function getW(ruta) {
    if (window.__iaCompat || navigator.onLine === false) return null;
    const u = window.firebase && firebase.auth && firebase.auth().currentUser; if (!u) return null;
    let tok = ""; try { tok = await u.getIdToken(); } catch (e) { return null; }
    let ctl = null, tm = null; try { ctl = new AbortController(); tm = setTimeout(() => ctl.abort(), 15000); } catch (e) { ctl = null; }
    try { const r = await fetch(urlW(ruta), { headers: { Authorization: "Bearer " + tok }, cache: "no-store", signal: ctl ? ctl.signal : undefined }); let j = null; try { j = await r.json(); } catch (e) { j = null; } return j; }
    catch (e) { return null; } finally { clearTimeout(tm); }
  }
  let yoUso = null, mesUso = null, mesTs = 0;
  const evUso = () => { try { document.dispatchEvent(new CustomEvent("ia-uso")); } catch (e) { } };
  const n2 = (n) => (Number(n) || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  async function avisarFreno(f) {
    const mes = iso(new Date()).slice(0, 7);
    try { if (localStorage.getItem("ema.ia.freno") === mes) return; localStorage.setItem("ema.ia.freno", mes); } catch (e) { }
    let adm = [];
    try { adm = (PERMISOS.lista() || []).filter((u) => u && u.rol === "admin" && u.activo !== false && u.email).map((u) => String(u.email).toLowerCase()); } catch (e) { adm = []; }
    if (!adm.length) { try { const s = await firebase.firestore().collection("usuarios").where("rol", "==", "admin").get(); s.forEach((d) => { const x = d.data() || {}; if (x.email && x.activo !== false) adm.push(String(x.email).toLowerCase()); }); } catch (e) { } }
    if (!window.__pushAvisos || !window.__pushAvisos.dejarAviso) return;
    const txt = `Se gastaron US$ ${n2(f.gastoMes)} de ${n2(f.tope)} este mes. Quedan en pausa Pañol, Cuadrilla, Operario y Solo mirar hasta el día 1; a los US$ ${n2(f.corte)} se corta para todos menos Administración. Los límites se cambian en el asistente › ⚙ › Límites.`;
    for (const em of adm.filter((x, i, a) => x && a.indexOf(x) === i)) { try { await window.__pushAvisos.dejarAviso({ email: em, titulo: "✨ Asistente: se llegó al freno del mes", cuerpo: txt, tipo: "ia_freno", tag: "ema-ia-freno-" + mes }); } catch (e) { } }
  }
  window.__iaUso = {
    poner(ema) {
      if (!ema || !ema.uso) return;
      const u = ema.uso;
      yoUso = { rol: u.rol, quedanPreguntas: u.quedanPreguntas, topePreguntas: u.topePreguntas, quedanRemitos: u.quedanRemitos, topeRemitos: u.topeRemitos, pausado: false, ts: Date.now() };
      if (mesUso && ema.costoUsd > 0) { const k = u.tipo === "remito" ? "remitos" : u.tipo === "supervisor" ? "supervisor" : "preguntas"; mesUso.gastoMes = (mesUso.gastoMes || 0) + ema.costoUsd; mesUso.partes = mesUso.partes || {}; mesUso.partes[k] = (mesUso.partes[k] || 0) + ema.costoUsd; }
      if (ema.freno && ema.freno.gastoMes != null && mesUso) mesUso.gastoMes = ema.freno.gastoMes;
      if (ema.freno && ema.freno.avisar) avisarFreno(ema.freno);
      evUso();
    },
    marcarTope(tipo) { yoUso = yoUso || {}; if (tipo === "tope_dia") yoUso.quedanPreguntas = 0; else if (tipo === "tope_remitos") yoUso.quedanRemitos = 0; else yoUso.pausado = true; evUso(); },
    async mio() {
      const j = await getW("/mio");
      if (j && j.ok && j.version === "v3-ia") { yoUso = { rol: j.rol, quedanPreguntas: j.quedanPreguntas, topePreguntas: j.topePreguntas, quedanRemitos: j.quedanRemitos, topeRemitos: j.topeRemitos, pausado: !!j.pausado || j.habilitado === false, ts: Date.now() }; evUso(); }
      return j;
    },
    async uso(forzar) {
      if (!forzar && mesUso && Date.now() - mesTs < 600000) return mesUso;
      const j = await getW("/uso");
      if (j && j.ok) { mesUso = j; mesTs = Date.now(); evUso(); }
      return j;
    },
    estado: () => ({ yo: yoUso, mes: mesUso }),
    quedaTexto() {
      if (!yoUso) return "";
      if (yoUso.pausado) return "⏸ El asistente está en pausa para tu usuario";
      if (yoUso.topePreguntas == null || yoUso.quedanPreguntas == null) return "";
      const q = yoUso.quedanPreguntas, r = yoUso.quedanRemitos;
      let t = q > 0 ? `Te quedan ${q} pregunta${q === 1 ? "" : "s"} hoy` : "No te quedan preguntas hoy";
      if (yoUso.topeRemitos > 0 && r != null) t += ` · ${r} remito${r === 1 ? "" : "s"}`;
      return t;
    },
    agotado: () => !!(yoUso && (yoUso.pausado || yoUso.quedanPreguntas === 0)),
    textoMes() {
      const m = mesUso; if (!m || m.gastoMes == null) return "";
      const p = m.partes || {};
      return `Gastado este mes: US$ ${n2(m.gastoMes)} de ${(Number(m.tope) || 0).toLocaleString("es-AR")} · preguntas ${n2(p.preguntas)} · remitos ${n2(p.remitos)} · supervisor ${n2(p.supervisor)}`;
    },
    _poner: (a, b) => { yoUso = a; mesUso = b; mesTs = b ? Date.now() : 0; evUso(); }   // pruebas
  };
  document.addEventListener("permisos-listos", () => setTimeout(() => { try { const n = window.__iaNivel(); if ((n === "admin" || n === "oficina") && window.__iaPuede()) window.__iaUso.uso(); } catch (e) { } }, 5000));
