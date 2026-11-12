  // v149b: la copia en el celu es la bandeja de fotosSeguras: no se borra hasta que la foto está en la base y en la orden.
  // Antes (v148) un error que no fuera de permiso o de señal borraba la copia («sacala de nuevo»), había un solo intento y
  // una foto trabada frenaba a todas las de atrás.
  const BJ = () => window.__fotoBandeja || null;
  const FC = { poner: (x) => (BJ() ? BJ().ponerNueva(x) : Promise.resolve(null)) };
  const COLA = []; let corriendo = false, ultToque = 0, colaDesde = 0;
  document.addEventListener("pointerdown", () => { ultToque = Date.now(); }, true);
  const libre = () => document.hidden || (!document.getElementById("emaCam") && Date.now() - ultToque > 1800);
  function correrCola() {
    if (corriendo || !COLA.length) return;
    if (!colaDesde) colaDesde = Date.now();
    if (!libre() && Date.now() - colaDesde < 90000) { setTimeout(correrCola, 400); return; }   // v149b: tope de espera 90 s
    corriendo = true; colaDesde = 0; const j = COLA.shift();
    Promise.race([Promise.resolve().then(j), new Promise((ok) => setTimeout(ok, 160000))]).catch((e) => console.warn("[cuadrillaDia] foto", e)).then(() => { corriendo = false; setTimeout(correrCola, 150); });   // v149b: una trabada no frena a las demás
  }
  document.addEventListener("visibilitychange", () => { if (document.hidden) correrCola(); });
  function porAtras(pe, f, meta) {
    COLA.push(() => window.guardarFotoObra(f, meta).then((x) => ({ s: x }), (er) => (er && er.enEspera && er.adjId ? { s: { adjId: er.adjId, mini: "" }, espera: true, er } : { er })).then((r) => {
      const sacarPe = () => { const l = S.fotoPend[pe.otId] || [], i = l.indexOf(pe); if (i >= 0) l.splice(i, 1); };
      if (!r.s) { sacarPe(); BJ() && BJ().campoFalta(pe.id); S.msg = "📥 La foto" + (pe.num ? " de " + pe.num : "") + " quedó guardada en el celu y se sube sola. No hace falta sacarla de nuevo."; pintar(true); return; }
      pe.adjId = r.s && r.s.adjId; const a = API(), o2 = otDe(pe.otId);
      if (!pe.adjId || !a || !o2) { sacarPe(); BJ() && BJ().campoFalta(pe.id); pintar(true); return; }
      a.guardar(o2, { ["campo.fotos." + Lk(pe.adjId)]: { por: pe.por, ts: pe.ts, k: pe.k, tarea: pe.tarea, cat: pe.cat, num: pe.num, mini: (r.s && r.s.mini) || "" } });
      BJ() && BJ().campoHecho(pe.id);
      setTimeout(() => { sacarPe(); pintar(true); }, 1500);   // la de por atrás se va cuando la real ya está en la orden
      const sb = document.querySelector('#cdHoja .cd-sube[data-pe="' + pe.id + '"]'); if (sb) sb.textContent = r.espera || navigator.onLine === false ? "Quedó guardada en el celu: se sube sola." : "Guardada · subiendo…";
    }));
    correrCola();
  }
  // v149b: las que quedaron en el celu (Android cerró la app) las sube la bandeja sola al volver (y las anota en la orden)
