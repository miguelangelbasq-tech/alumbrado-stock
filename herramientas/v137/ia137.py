# 5) Asistente más «vivo» (código dormido): actuar sin preguntar de más, glosario de dictado, búsqueda aproximada de obras,
#    effort según la pregunta y system FIJO durante la charla (el contexto que cambia va en el mensaje de cada turno).
R('''    "- La persona escribe rápido y con errores de tipeo: interpretá la intención. Si de verdad no entendés, o hay dos obras o personas posibles, preguntá en una línea.",''',
  '''    "- La persona escribe rápido, abreviado, cortado o dictado por voz, con errores de tipeo: interpretá la intención y ACTUÁ sin preguntar de más. «dame la info de la plaza X», «avance del pueblito», «sanma cuántas columnas»: buscá la obra más parecida (buscar_obra ya busca aproximado) y contestá directo. Preguntá SOLO si hay dos o más candidatas parecidas de verdad, y ahí ofrecé las opciones en una línea («¿PLAZA X (ID 1) o PLAZA Y (ID 2)?»).",
    "- Glosario del dictado (cómo suena → qué es). Corregilo solo y no lo comentes: «pe erre efe ve», «prfv», «fb», «pr fb», «perfv» = PRFV · «pat», «pe a te» = PAT (puesta a tierra) · «be pe ene» = BPN · «o te», «ot» = orden de trabajo · jabalina, tablerito (caja bornera de columna), vínculo, capuchón, pañol, vale, remito, itemizado, legajo, cuadrilla son palabras de obra: no las cambies por otras parecidas.",
    "- Al principio de cada mensaje de la persona la app agrega «[Contexto de la app …]» con la fecha, la hora, quién habla, la pantalla y los permisos de ESE momento: usalo, pero no lo repitas ni lo comentes.",''')
# búsqueda aproximada
R('''  function buscarObras(texto) {
    const q = nk(texto); if (!q) return [];''', '''  // v137: búsqueda aproximada (sin tildes ni «plaza/barrio/el/la», palabras parciales y distancia de edición chica)
  function lev(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 9;
    let p = []; for (let j = 0; j <= b.length; j++) p.push(j);
    for (let i = 1; i <= a.length; i++) { const c = [i]; for (let j = 1; j <= b.length; j++) c.push(Math.min(p[j] + 1, c[j - 1] + 1, p[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))); p = c; }
    return p[b.length];
  }
  function parecido(w, pals, junto) {
    if (pals.indexOf(w) >= 0) return 1;
    if (w.length >= 3 && (junto.indexOf(w) === 0 || pals.some((x) => x.indexOf(w) === 0))) return 0.9;
    if (w.length >= 4) { const d = Math.min.apply(null, pals.map((x) => lev(w, x)).concat([9])); if (d <= 1 || (d <= 2 && w.length >= 7)) return 0.8; }
    if (w.length >= 4 && junto.indexOf(w) >= 0) return 0.7;
    return 0;
  }
  function aproximado(usar, nom) {
    const pals = nom.split(" ").filter((w) => w && VACIAS.indexOf(w) < 0); if (!pals.length || !usar.length) return 0;
    const junto = pals.join(""), qj = usar.join("");
    let s = usar.reduce((a, w) => a + parecido(w, pals, junto), 0) / usar.length;
    if (qj.length >= 4 && junto.indexOf(qj) === 0) s = Math.max(s, 0.9);
    return s >= 0.7 ? Math.round(40 + 40 * s) : s > 0 ? Math.round(10 + 20 * s) : 0;
  }
  function buscarObras(texto) {
    const q = nk(texto); if (!q) return [];''')
R('''      else { const n = usar.filter((w) => w.length > 2 && todo.indexOf(w) >= 0).length; if (n) p = 20 + Math.round(30 * n / usar.length); }
      if (p) l.push({ o, p });''', '''      else { const n = usar.filter((w) => w.length > 2 && todo.indexOf(w) >= 0).length; if (n) p = 20 + Math.round(30 * n / usar.length); }
      if (p < 60) p = Math.max(p, aproximado(usar, nom));   // v137
      if (p) l.push({ o, p });''')
R('''      else if (nom.indexOf(usar.join(" ")) >= 0) p = 75;''', '''      else if (nom.indexOf(usar.join(" ")) >= 0) p = usar.every((w) => nom.split(" ").indexOf(w) >= 0) ? 85 : 75;   // v137: palabra entera > pedazo''')
R('''    if (l.length === 1 || l[0].p >= 90 || (l[0].p >= 60 && l[0].p > l[1].p)) return { obra: l[0].o };''',
  '''    if (l.length === 1 || l[0].p >= 90 || (l[0].p >= 60 && l[0].p > l[1].p) || l[0].p - l[1].p >= 10) return { obra: l[0].o };   // v137: solo pregunta si hay 2+ parecidas de verdad''')
R('''    return { err: `Hay varias obras que se parecen a «${s}»: preguntá cuál es.`, candidatos: l.slice(0, 6).map((x) => fichaObra(x.o)) };''',
  '''    return { err: `Hay varias obras que se parecen a «${s}»: preguntá cuál es en una línea.`, candidatos: l.filter((x) => l[0].p - x.p < 10).slice(0, 6).map((x) => Object.assign(fichaObra(x.o), { puntaje: x.p })) };''')
R('''    return { r: { encontradas: l.length, obras: l.slice(0, 10).map((x) => fichaObra(x.o)) } };''',
  '''    return { r: { encontradas: l.length, mejor: l.length ? Object.assign(fichaObra(l[0].o), { puntaje: l[0].p }) : null, obras: l.slice(0, 10).map((x) => Object.assign(fichaObra(x.o), { puntaje: x.p })) } };   // v137: con puntaje''')
# system fijo; el contexto que cambia va en el mensaje de cada turno
R('''    const sys = [{ type: "text", text: SISTEMA, cache_control: { type: "ephemeral" } }, { type: "text", text: contexto() }];''',
  '''    // v137: el system NO cambia entre turnos (si cambia, los bloques de pensamiento de antes no valen y la API da 400):
    // el contexto (hora, pantalla, permisos, charla por voz) va como texto al principio de cada mensaje de la persona.
    const sys = window.__iaCompat ? [{ type: "text", text: SISTEMA, cache_control: { type: "ephemeral" } }, { type: "text", text: contexto() }] : [{ type: "text", text: SISTEMA, cache_control: { type: "ephemeral" } }];''')
R('''    return Object.assign({ model: modelo, max_tokens: pro ? 16000 : modelo === SONNET ? 4000 : 1500, system: sys,''',
  '''    return Object.assign({ model: modelo, max_tokens: op.rapido ? (pro ? 4000 : 1500) : pro ? 16000 : modelo === SONNET ? 4000 : 1500, system: sys,''')
R('''    const userMsg = { role: "user", content: (resumenPend''', '''    const userTx = (resumenPend''')
R('''(nota.length ? "[Nota de la app: " + nota.join(" ") + "]\\n" : "") + texto };''', '''(nota.length ? "[Nota de la app: " + nota.join(" ") + "]\\n" : "") + texto;''')
R('''    const base = []; turnos.forEach((t) => t.forEach((m) => base.push(m)));   // v136: tal cual, solo se agrega''',
  '''    const userMsg = window.__iaCompat ? { role: "user", content: userTx } : { role: "user", content: [{ type: "text", text: "[Contexto de la app en este momento (no lo repitas): " + contexto() + "]" }, { type: "text", text: userTx }] };   // v137
    const base = []; turnos.forEach((t) => t.forEach((m) => base.push(m)));   // v136: tal cual, solo se agrega''')
R('''      const ef = op.effort || effortPara(texto);
      let r = await turno(base, userMsg, modelo, ef ? { effort: ef } : {});
      if (r.escalar) { modelo = SONNET; r = await turno(base, userMsg, SONNET, ef ? { effort: ef } : {}); }''',
  '''      const ef = op.effort || effortPara(texto), rap = !op.effort && !window.__iaCompat && ef === "low" && datoSimple(texto);   // v137: dato simple → rápido
      const opT = ef ? { effort: ef, rapido: rap } : {};
      let r = await turno(base, userMsg, modelo, opT);
      if (r.escalar) { modelo = SONNET; r = await turno(base, userMsg, SONNET, opT); }''')
R('''  function effortPara(t) { return quiereRevision(t) ? "high" : quiereCierre(t) ? "low" : ""; }''',
  '''  // v137: preguntas de un dato (cuántas, avance de, dónde está, quién está, stock de) → effort «low» y respuesta corta;
  // lo complejo (revisá, armá, cerrá, corregí, compará…) sigue en medium/high.
  const COMPLEJO = /(revis|arm[aá]|hac[eé]|cerr[aá]|correg|compar|propon|cambi|carg[aá]|emit|calcul|analiz|por qu[eé]|mov[eé]|pas[aá]|anul|mand[aá]|avis[aá]|pdf|imprim|inform)/i;
  const SIMPLE = /(^|[^a-z])(cu[aá]nt[oa]s?|avance|d[oó]nde|qui[eé]n(es)?|stock|hay|qued[aá]n?|falta[n]?|tiene)([^a-z]|$)/i;
  function datoSimple(t) { t = String(t || ""); return !window.__iaCompat && t.length <= 140 && SIMPLE.test(t) && !COMPLEJO.test(t); }
  function effortPara(t) { return quiereRevision(t) ? "high" : quiereCierre(t) ? "low" : datoSimple(t) ? "low" : ""; }''')
# los resúmenes leen también los mensajes con el bloque de contexto
R('''      if (m.role === "user" && typeof m.content == "string") txt.push("Persona: " + m.content.replace(/^\\[Nota de la app:[^\\]]*\\]\\n?/, "").slice(0, 300));''',
  '''      if (m.role === "user" && textoPersona(m)) txt.push("Persona: " + textoPersona(m).replace(/^\\[Nota de la app:[^\\]]*\\]\\n?/, "").slice(0, 300));''', 2)
R('''  let resumenPend = "";''', '''  let resumenPend = "";
  const textoPersona = (m) => (typeof m.content == "string" ? m.content : Array.isArray(m.content) ? m.content.filter((b) => b && b.type === "text" && !/^\\[Contexto de la app/.test(b.text || "")).map((b) => b.text).join(" ") : "");   // v137''')
