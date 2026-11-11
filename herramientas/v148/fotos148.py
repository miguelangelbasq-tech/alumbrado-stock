# ============================================================== 4) fotos de la cuadrilla (Modo obra): la siguiente al toque
# Antes: después del disparo, Modo obra esperaba guardarFotoObra entera (GPS hasta 1,5 s + sello + nube hasta 5 s + base
# hasta 2,5 s + miniatura) antes de mostrar «Foto guardada · Sacar otra». Ahora la foto cuenta al instante (miniatura del
# celu, «Subiendo…») y todo lo lento sigue por atrás por el mismo camino (si no hay señal, la cola ema-fotos-cola de siempre).
R('  const fotosDe = (o, k) => { const a = API(); return a ? intentar(() => a.fotos(o, k) || [], []) : []; };',
  '''  const fotosDe0 = (o, k) => { const a = API(); return a ? intentar(() => a.fotos(o, k) || [], []) : []; };
  // v148: las fotos que se están guardando por atrás ya cuentan (así la columna siguiente sale al toque)
  const fotosDe = (o, k) => { const l = fotosDe0(o, k), pe = (o && S.fotoPend[o.id]) || []; if (!pe.length) return l; const ids = {}; l.forEach((x) => { ids[x[0]] = 1; }); return l.concat(pe.filter((x) => x.k === k && !(x.adjId && ids[Lk(x.adjId)])).map((x) => [x.id, x])); };''')
R('segTmp: {}, salidaTmp: {}, falta: {}, msg: "", toast: "", toastTs: 0, ultFoto: null };', 'segTmp: {}, salidaTmp: {}, falta: {}, msg: "", toast: "", toastTs: 0, ultFoto: null, fotoPend: {} };   // v148: fotoPend = fotos guardándose por atrás')
R('''    S.msg = "Guardando la foto…"; pintar(true);
    let enEspera = false, s = null;
    try { s = await window.guardarFotoObra(f, meta); }
    catch (er) { if (er && er.enEspera && er.adjId) { s = { adjId: er.adjId, mini: "" }; enEspera = true; } else { S.msg = window.__fotoError ? window.__fotoError(er, o) : "⚠ No se pudo guardar la foto. Probá de nuevo."; inp.value = ""; pintar(true); return; } }
    a.guardar(o, { ["campo.fotos." + Lk(s.adjId)]: { por, ts: Date.now(), k: p.k, tarea: p.label, cat, num, mini: s.mini || "" } });
    if (o.estado === "Emitida") a.guardar(o, { estado: "En curso" });
    inp.value = ""; S.msg = ""; S.ultFoto = { num, k: p.k };''', '''    // v148: la foto cuenta al toque y se guarda por atrás (antes se esperaba todo: 7 a 13 s en un celu lento)
    const t0 = Date.now(), pe = { id: "pend_" + t0.toString(36) + Math.random().toString(36).slice(2, 6), k: p.k, tarea: p.label, cat, num, por, ts: t0, mini: src, pend: true, otId: o.id };
    (S.fotoPend[o.id] = S.fotoPend[o.id] || []).push(pe);
    FC.poner({ id: pe.id, f, meta, otId: o.id, k: p.k, tarea: p.label, cat, num, por, ts: t0 });   // copia en el celu hasta que quede guardada
    porAtras(pe, f, meta);
    const enEspera = false, s = { mini: src };
    if (o.estado === "Emitida") a.guardar(o, { estado: "En curso" });
    inp.value = ""; S.msg = ""; S.ultFoto = { num, k: p.k };''')
# la cola de «por atrás»: una foto por vez, cuando la cámara está cerrada y la persona no está tocando (el sello y la
# compresión son trabajo pesado del celu: si se hacen mientras saca la siguiente, la traban). Con la app en segundo plano
# arranca enseguida. Cada foto queda copiada en el celu (IndexedDB ema-fotos-crudas) hasta que se guarda: si Android
# cierra la app antes, al volver a abrirla se guarda sola.
R('''  async function fotoElegida(inp) {''', '''  const FC = (() => {   // v148: copia cruda de las fotos que todavía no se guardaron
    const DBN = "ema-fotos-crudas", ST = "f"; let dbp = null;
    const abrirDb = () => dbp || (dbp = new Promise((ok, mal) => { try { const r = indexedDB.open(DBN, 1); r.onupgradeneeded = () => r.result.createObjectStore(ST, { keyPath: "id" }); r.onsuccess = () => ok(r.result); r.onerror = () => mal(r.error); } catch (e) { mal(e); } }));
    const tx = (modo, fn) => abrirDb().then((db) => new Promise((ok, mal) => { const q = db.transaction(ST, modo), r = fn(q.objectStore(ST)); q.oncomplete = () => ok(r && r.result); q.onerror = () => mal(q.error); }));
    return { poner: (x) => tx("readwrite", (s) => s.put(x)).catch(() => null), sacar: (id) => tx("readwrite", (s) => s.delete(id)).catch(() => null), todas: () => tx("readonly", (s) => s.getAll()).then((l) => l || [], () => []) };
  })();
  const COLA = []; let corriendo = false, ultToque = 0;
  document.addEventListener("pointerdown", () => { ultToque = Date.now(); }, true);
  const libre = () => document.hidden || (!document.getElementById("emaCam") && Date.now() - ultToque > 1800);
  function correrCola() {
    if (corriendo || !COLA.length) return;
    if (!libre()) { setTimeout(correrCola, 400); return; }
    corriendo = true; const j = COLA.shift();
    Promise.resolve().then(j).catch((e) => console.warn("[cuadrillaDia] foto", e)).then(() => { corriendo = false; setTimeout(correrCola, 150); });
  }
  document.addEventListener("visibilitychange", () => { if (document.hidden) correrCola(); });
  function porAtras(pe, f, meta) {
    COLA.push(() => window.guardarFotoObra(f, meta).then((x) => ({ s: x }), (er) => (er && er.enEspera && er.adjId ? { s: { adjId: er.adjId, mini: "" }, espera: true } : { er })).then((r) => {
      const sacarPe = () => { const l = S.fotoPend[pe.otId] || [], i = l.indexOf(pe); if (i >= 0) l.splice(i, 1); };
      if (r.er) { sacarPe(); FC.sacar(pe.id); S.msg = window.__fotoError ? window.__fotoError(r.er, otDe(pe.otId)) : "⚠ No se pudo guardar la foto" + (pe.num ? " de " + pe.num : "") + ". Sacala de nuevo."; pintar(true); return; }
      pe.adjId = r.s && r.s.adjId; const a = API(), o2 = otDe(pe.otId);
      if (!pe.adjId || !a || !o2) { sacarPe(); FC.sacar(pe.id); pintar(true); return; }
      a.guardar(o2, { ["campo.fotos." + Lk(pe.adjId)]: { por: pe.por, ts: pe.ts, k: pe.k, tarea: pe.tarea, cat: pe.cat, num: pe.num, mini: (r.s && r.s.mini) || "" } });
      FC.sacar(pe.id);
      setTimeout(() => { sacarPe(); pintar(true); }, 1500);   // la de por atrás se va cuando la real ya está en la orden
      const sb = document.querySelector('#cdHoja .cd-sube[data-pe="' + pe.id + '"]'); if (sb) sb.textContent = r.espera || navigator.onLine === false ? "Quedó en el celu: se sube sola cuando vuelva la señal." : "✓ Subida";
    }));
    correrCola();
  }
  // las que quedaron en el celu (Android cerró la app antes de guardarlas): se guardan solas al volver
  setTimeout(function recuperar() {
    if (!window.__fbUser || !API()) { setTimeout(recuperar, 5000); return; }
    FC.todas().then((l) => l.forEach((x) => {
      if (!x || !x.f || !x.otId || Object.keys(S.fotoPend).some((k) => S.fotoPend[k].some((y) => y.id === x.id))) return;
      if (!otDe(x.otId)) return;
      const pe = { id: x.id, k: x.k, tarea: x.tarea, cat: x.cat, num: x.num, por: x.por, ts: x.ts, mini: intentar(() => URL.createObjectURL(x.f), ""), pend: true, otId: x.otId };
      (S.fotoPend[x.otId] = S.fotoPend[x.otId] || []).push(pe); porAtras(pe, x.f, x.meta);
    }));
  }, 9000);
  async function fotoElegida(inp) {''')
R('    hojaFoto(o, { src: s.mini || src, num, tarea: primero(p.label), gps, enEspera: enEspera, cuenta });',
  '    hojaFoto(o, { src: s.mini || src, num, tarea: primero(p.label), gps, enEspera: enEspera, cuenta, pe: pe.id });')
R('''${sin ? `<div class="cd-sinsen">${ic("nube", "s22", 2)}<span><b>Sin señal.</b> Quedó en el celu y se sube sola cuando vuelva la señal.</span></div>` : ""}''',
  '''${sin ? `<div class="cd-sinsen">${ic("nube", "s22", 2)}<span><b>Sin señal.</b> Quedó en el celu y se sube sola cuando vuelva la señal.</span></div>` : ""}${info.pe ? `<small class="cd-sube" data-pe="${esc(info.pe)}">Subiendo por atrás… podés seguir.</small>` : ""}''')
R('.cd-sinsen .cd-ic{margin-right:10px;color:#b86a00}', '.cd-sinsen .cd-ic{margin-right:10px;color:#b86a00}\n.cd-sube{display:block;margin-top:8px;font-size:12.5px;color:var(--text-soft)}')
# ---- lo que hacía lenta cualquier cosa que abre o cierra algo (la cámara, la hoja «Foto guardada», los avisos):
# atrasApp (v138) buscaba ventanas abiertas en TODA la página (38.000 nodos, 36.700 dentro de pantallas escondidas) en cada
# cambio del body. Ahora busca solo fuera de las pantallas escondidas (lo que está ahí adentro nunca se ve: mismo resultado).
R('    document.querySelectorAll(GEN_SEL).forEach((e) => { if (e.parentElement && e.parentElement.closest && !e.parentElement.closest(GEN_SEL)) cand.add(e); });',
  '''    [].forEach.call(document.body.children, (r) => {   // v148: sin entrar a las pantallas escondidas (antes: toda la página en cada cambio)
      if (r.classList && r.classList.contains("wrap") && /^view/.test(r.id || "") && (r.style.display === "none" || getComputedStyle(r).display === "none")) return;
      if (r.querySelectorAll) r.querySelectorAll(GEN_SEL).forEach((e) => { if (e.parentElement && e.parentElement.closest && !e.parentElement.closest(GEN_SEL)) cand.add(e); });
    });''')
# la cámara: el logo de la marca se lee una sola vez (antes, en cada apertura: leer y recortar una imagen base64 enorme del CSS)
R('''  function logoSrc() { try { const m = (getComputedStyle(document.documentElement).getPropertyValue("--logo-color") || "").match(/url\\(\\s*["']?(data:image\\/[a-z]+;base64,[A-Za-z0-9+/=]+)/); return m ? m[1] : ""; } catch { return ""; } }
  function pintarMarca() {''', '''  let logo0 = "";   // v148: se lee una sola vez
  function logoSrc() { if (logo0) return logo0; try { const m = (getComputedStyle(document.documentElement).getPropertyValue("--logo-color") || "").match(/url\\(\\s*["']?(data:image\\/[a-z]+;base64,[A-Za-z0-9+/=]+)/); return (logo0 = m ? m[1] : ""); } catch { return ""; } }
  function pintarMarca() {''')
