// v139 · En la compu el Asistente es un panel lateral de alto completo: se puede hacer más ancho o más angosto
// arrastrando su borde izquierdo (doble clic vuelve al ancho de siempre). El ancho queda en este aparato (ema.ia.ancho).
// En el celular (hasta 900 px) no hace nada: el panel sigue a pantalla completa.
(function () {
  var CLAVE = "ema.ia.ancho", DEF = 480, MIN = 420;
  function pc() { return window.matchMedia && matchMedia("(min-width:901px)").matches; }
  function maximo() { return Math.max(MIN, Math.min(760, window.innerWidth - 560)); }
  function poner(w, guardar) {
    w = Math.round(Math.max(MIN, Math.min(maximo(), +w || DEF)));
    document.documentElement.style.setProperty("--ia-w", w + "px");
    if (guardar) try { localStorage.setItem(CLAVE, String(w)); } catch (e) { }
    return w;
  }
  function leido() { try { return +localStorage.getItem(CLAVE) || DEF; } catch (e) { return DEF; } }
  function asa() {
    var p = document.getElementById("iaPanel"); if (!p || p.querySelector(".ia-ancho")) return;
    var h = document.createElement("div"); h.className = "ia-ancho"; h.setAttribute("role", "separator"); h.setAttribute("aria-orientation", "vertical"); h.setAttribute("aria-label", "Ancho del asistente"); h.title = "Arrastrá para cambiar el ancho (doble clic: el de siempre)";
    var arr = null;
    h.addEventListener("pointerdown", function (e) {
      if (!pc()) return; e.preventDefault(); arr = { x: e.clientX, w: p.getBoundingClientRect().width };
      h.classList.add("on"); document.body.classList.add("ia-anchando"); try { h.setPointerCapture(e.pointerId); } catch (er) { }
    });
    h.addEventListener("pointermove", function (e) { if (arr) poner(arr.w + (arr.x - e.clientX), false); });
    function fin(e) { if (!arr) return; arr = null; h.classList.remove("on"); document.body.classList.remove("ia-anchando"); poner(p.getBoundingClientRect().width, true); try { h.releasePointerCapture(e.pointerId); } catch (er) { } }
    h.addEventListener("pointerup", fin); h.addEventListener("pointercancel", fin);
    h.addEventListener("dblclick", function () { poner(DEF, true); });
    p.appendChild(h);
  }
  poner(leido(), false);
  window.addEventListener("resize", function () { poner(leido(), false); });
  try { new MutationObserver(asa).observe(document.body, { childList: true, attributes: true, attributeFilter: ["class"] }); } catch (e) { }
  asa();
  window.__iaAncho = { poner: function (w) { return poner(w, true); }, leido: leido, maximo: maximo, DEF: DEF, MIN: MIN };
})();
