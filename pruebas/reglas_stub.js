// Port a JS de las reglas de Firestore del usuario (claude/Reglas_Firestore_actual.txt + presencia), para el stub.
// Se instala como window.__stubRegla(op, col, id, viejo, nuevo, DB). op: get | list | create | update | delete.
(function () {
  const ROLES = {
    admin:     { inicio:'editar',registro:'editar',calc:'editar',parte:'editar',plan:'editar',avance:'editar',mapa:'editar',stock:'editar',informe:'editar',gastos:'editar',produccion:'editar',normas:'editar' },
    oficina:   { inicio:'editar',registro:'editar',calc:'editar',parte:'editar',plan:'editar',avance:'editar',mapa:'editar',stock:'editar',informe:'editar',gastos:'editar',produccion:'editar',normas:'editar' },
    panol:     { inicio:'ver',registro:'ver',calc:'oculto',parte:'oculto',plan:'oculto',avance:'ver',mapa:'ver',stock:'editar',informe:'oculto',gastos:'oculto',produccion:'oculto',normas:'ver' },
    // v049: cuadrilla y operario = personal de obra (solo miran; marcan sus tareas por soyDeLaOrden)
    cuadrilla: { inicio:'ver',registro:'oculto',calc:'ver',parte:'oculto',plan:'ver',avance:'oculto',mapa:'ver',stock:'ver',informe:'oculto',gastos:'oculto',produccion:'oculto',normas:'ver' },
    operario:  { inicio:'ver',registro:'oculto',calc:'ver',parte:'oculto',plan:'ver',avance:'oculto',mapa:'ver',stock:'ver',informe:'oculto',gastos:'oculto',produccion:'oculto',normas:'ver' },
    direccion: { inicio:'ver',registro:'ver',calc:'ver',parte:'ver',plan:'ver',avance:'ver',mapa:'ver',stock:'ver',informe:'ver',gastos:'ver',produccion:'ver',normas:'ver' },   // v155: Dirección mira todo, no escribe
    mirar:     { inicio:'ver',registro:'ver',calc:'ver',parte:'ver',plan:'ver',avance:'ver',mapa:'ver',stock:'ver',informe:'ver',gastos:'oculto',produccion:'oculto',normas:'ver' }
  };
  const has = (o, k) => o && Object.prototype.hasOwnProperty.call(o, k);
  window.__stubRegla = function (op, col, id, viejo, nuevo, DB) {
    const u = (window.firebase && firebase.apps[0] && firebase.apps[0].auth().currentUser) || null;
    const logueado = !!u, uid = u && u.uid, email = u && u.email;
    const yo = (uid && DB.usuarios && DB.usuarios[uid]) || null;
    const activo = !!yo && yo.activo !== false;
    const confirmado = activo && yo.pendiente !== true;
    const rol0 = (yo && yo.rol) || 'mirar', rol = rol0 === 'direccion' && typeof window != 'undefined' && window.__reglasSinV155 ? 'mirar' : rol0;   // v155: __reglasSinV155 = las reglas de antes (Dirección cae a «mirar»)
    const esAdmin = confirmado && rol === 'admin';
    const nivel = h => { const base = (ROLES[rol] || ROLES.mirar)[h] || 'ver'; const aj = (yo && yo.ajustes) || {}; return has(aj, h) ? aj[h] : base; };
    const edita = h => confirmado && nivel(h) === 'editar';
    const lee = h => confirmado && nivel(h) !== 'oculto';
    const equipo = () => ['inicio', 'avance', 'stock', 'parte', 'registro', 'calc'].some(lee);
    const adminUOficina = () => confirmado && ['admin', 'oficina'].includes(rol);
    const leeTodo = () => confirmado && ['admin', 'oficina', 'direccion'].includes(rol);   // v155
    const noDir = () => confirmado && rol !== 'direccion';   // v155
    const diff = () => { const k = new Set([...Object.keys(viejo || {}), ...Object.keys(nuevo || {})]); return [...k].filter(x => JSON.stringify((viejo || {})[x]) !== JSON.stringify((nuevo || {})[x])); };
    const soloCampos = l => diff().every(k => l.includes(k));
    const renombraObra = () => (edita('registro') || edita('avance')) && soloCampos(['plazaNombre', 'obraId', 'barrio', 'destino', 'nombre', 'id', 'form', 'obra']);
    const miClave = () => (yo && yo.personaClave) || '';
    const soyDeLaOrden = d => confirmado && rol !== 'direccion' && miClave() !== '' && Array.isArray(d && d.personalNombres) && d.personalNombres.includes(miClave());
    const marcaCampo = () => soyDeLaOrden(viejo) && soloCampos(['campo', 'estado']) && ['Emitida', 'En curso'].includes((nuevo || {}).estado || '') && ['Emitida', 'En curso'].includes((viejo || {}).estado || '');   // v128
    const otDe = d => { const o = d && d.otId; return o && DB.ordenesTrabajo && DB.ordenesTrabajo[o]; };
    // v125 (fotoLibre): la cuadrilla crea fotos de cualquier obra sin orden; window.__reglasSinV125 = true simula las reglas de antes
    const fotoLibre = () => typeof window != 'undefined' && window.__reglasSinV125 ? false : confirmado && ['cuadrilla', 'operario'].includes(rol) && !((nuevo || {}).otId) && typeof (nuevo || {}).plazaId == 'string' && (nuevo || {}).plazaId !== '';
    const leer = op === 'get' || op === 'list', crear = op === 'create', act = op === 'update', borrar = op === 'delete', escr = !leer;
    const R = (r, c, uu, d) => leer ? r : crear ? c : act ? uu : d;   // read, create, update, delete
    switch (col) {
      case 'usuarios':
        if (leer) return (logueado && op === 'get' && id === uid) || confirmado;
        if (crear) return esAdmin || (logueado && id === uid && Object.keys(nuevo || {}).every(k => ['email', 'usuario', 'nombre', 'rol', 'pendiente', 'activo', 'creado'].includes(k)) && nuevo.rol === 'mirar' && nuevo.pendiente === true && nuevo.activo === true && nuevo.email === email);
        return esAdmin;
      case 'presencia': return leer ? esAdmin : (logueado && id === uid);
      case 'configEquipo':
        if (id === 'alias') return leer ? true : esAdmin;
        if (!id) return false;   // listar configEquipo: no hay regla de colección
        if (id === 'presencia') return confirmado;
        if (id === 'salud') return leer ? confirmado : noDir();   // v155
        if (id === 'baremo') return leer ? confirmado : edita('produccion');
        if (id === 'personal') return leer ? confirmado : (edita('produccion') || edita('parte'));
        if (id === 'cuadrillas') return leer ? confirmado : edita('parte');
        if (id === 'guias') return leer ? confirmado : adminUOficina();
        if (id === 'vapid') return leer ? confirmado : false;   // v050
        if (id === 'reinicios') return localStorage.getItem('stub.sinReglas072') ? false : (leer ? confirmado : esAdmin);   // v072
        if (id === 'ubicacion') return localStorage.getItem('stub.sinReglas083') ? false : (leer ? confirmado : adminUOficina());   // v083
        if (id === 'precios') return leer ? equipo() : (edita('informe') || edita('avance') || edita('gastos') || edita('produccion'));
        if (id === 'chat') return localStorage.getItem('stub.sinReglas184') ? false : (leer ? confirmado : adminUOficina());   // v184
        return false;
      case 'tableros': return leer ? confirmado : noDir();   // v155
      case 'auditoria': return leer ? equipo() : crear ? (confirmado && (nuevo || {}).usuario === email) : false;
      case 'movimientos': return R(equipo(), edita('stock') || edita('avance'), edita('stock') || renombraObra(), edita('stock'));
      case 'catalogoProductos': return leer ? equipo() : (edita('stock') || edita('calc'));
      case 'avanceObras': return R(confirmado, ['registro', 'avance', 'calc', 'mapa', 'parte', 'informe'].some(edita), ['registro', 'avance', 'calc', 'mapa', 'parte', 'informe'].some(edita), adminUOficina());
      case 'historialEtapas': return leer ? equipo() : (edita('avance') || (act && renombraObra()));
      case 'ordenesTrabajo': return leer ? confirmado : (['parte', 'plan', 'produccion'].some(edita) || (act && (renombraObra() || marcaCampo())));
      case 'planSemanal': return leer ? equipo() : (edita('plan') || (act && renombraObra()));
      case 'gastosObra': return leer ? (lee('gastos') || lee('informe')) : (edita('gastos') || (act && renombraObra()));
      case 'historialCalculos': return leer ? equipo() : (edita('calc') || (act && renombraObra()));
      case 'adjuntos': return leer ? confirmado : (['stock', 'avance', 'parte'].some(edita) || (act && renombraObra()) || (crear && !!(nuevo || {}).otId && soyDeLaOrden(otDe(nuevo))) || (crear && fotoLibre()));
      case 'reservas': return R(confirmado, ['parte', 'stock', 'avance'].some(edita), ['parte', 'stock', 'avance'].some(edita), adminUOficina());
      case 'fotosObra': return R(confirmado, ['avance', 'registro', 'parte', 'stock'].some(edita) || (!!(nuevo || {}).otId && soyDeLaOrden(otDe(nuevo))) || fotoLibre(), edita('avance') || edita('registro'), edita('avance') || edita('registro'));
      case 'planosObra': case 'planosImg': return leer ? confirmado : (edita('avance') || edita('registro'));
      case 'planosNotas': return leer ? confirmado : (edita('avance') || edita('registro') || edita('parte'));
      case 'cierresQuincena': return leer ? (lee('produccion') || adminUOficina()) : adminUOficina();
      case 'mapaPuntos': return leer ? confirmado : ['mapa', 'avance', 'registro'].some(edita);
      case 'herramientas': return leer ? confirmado : edita('stock');
      case 'herramientasMov': return R(confirmado, edita('stock'), adminUOficina(), adminUOficina());
      // v050: avisos con la app cerrada
      case 'pushSubs': return leer ? false : (crear || act) ? (logueado && (nuevo || {}).uid === uid) : (logueado && (viejo || {}).uid === uid);
      case 'avisosPush': return crear ? (confirmado && (nuevo || {}).enviado === false) : false;
      // v083: ubicación en vivo — cada uno escribe la suya; la ven Administración y Oficina
      case 'ubicacionVivo': if (localStorage.getItem('stub.sinReglas083')) return false; return leer ? leeTodo() : (crear || act) ? (noDir() && id === uid) : esAdmin;   // v155
      // v089: Proyectista — solo Administración y Oficina
      case 'proyectos': if (localStorage.getItem('stub.sinReglas089')) return false; return leer ? leeTodo() : adminUOficina();   // v155
      // v155: avisos de la cuadrilla a la oficina («📨 Para resolver»): cada uno crea los suyos (estado «nuevo», solo sus campos);
      // los leen Administración, Oficina y Dirección (y cada uno los suyos: get del suyo o consulta con uid == el suyo);
      // los marcan (visto / resuelto / respuesta) Administración y Oficina. Nadie los borra.
      case 'avisosCuadrilla': {
        if (localStorage.getItem('stub.sinReglas155')) return false;
        const CAMPOS = ['uid', 'email', 'nombre', 'persona', 'personaClave', 'rol', 'texto', 'tipo', 'otId', 'otNumero', 'obraId', 'obraNombre', 'fotoId', 'fotoMini', 'ts', 'fecha', 'hora', 'estado', 'para', 'porAsistente', 'tarea', 'tareaK', 'cuantos', 'explicacion'];
        if (op === 'get') return leeTodo() || (confirmado && !!viejo && viejo.uid === uid);
        if (op === 'list') return leeTodo() || (confirmado && ((nuevo || {}).__filtros || []).some((f) => f[0] === 'uid' && f[1] === '==' && f[2] === uid));
        if (crear) return noDir() && (nuevo || {}).uid === uid && (nuevo || {}).estado === 'nuevo' && Object.keys(nuevo || {}).every((k) => CAMPOS.includes(k));
        if (act) return adminUOficina() && soloCampos(['estado', 'vistoTs', 'vistoPor', 'respuesta', 'respTs', 'respPor', 'respPorNombre', 'resueltoTs', 'resueltoPor', 'analisis', 'decision', 'decTs', 'decPor', 'decPorNombre', 'decMotivo']);
        return false;
      }
      // v184: chat interno. Administración y Oficina todo; Dirección lee; el resto solo si está habilitado (configEquipo/chat)
      // y solo «General» y su conversación («p_» + uid). Nadie borra; aprobar / no corresponde, solo Administración y Oficina.
      case 'chatHilos': case 'chatInterno': {
        if (localStorage.getItem('stub.sinReglas184')) return false;
        const hab = () => ['admin', 'oficina'].includes(rol) || !!(((DB.configEquipo || {}).chat || {}).habilitados || {})[uid];
        const mio = (h) => h === 'general' || h === 'p_' + uid;
        const leeH = (h) => confirmado && (['admin', 'oficina', 'direccion'].includes(rol) || (mio(h) && hab()));
        const escH = (h) => confirmado && (['admin', 'oficina'].includes(rol) || (rol !== 'direccion' && mio(h) && hab()));
        if (col === 'chatHilos') {
          if (leer) return leeH(id);
          if (crear || act) return escH(id) && Object.keys(nuevo || {}).every((k) => ['id', 'tipo', 'uid', 'email', 'nombre', 'personaClave', 'ultTs', 'ultTexto', 'ultUid', 'ultNombre', 'pend', 'mes'].includes(k));
          return false;
        }
        if (op === 'get') return !!viejo && leeH(viejo.hilo);
        if (op === 'list') { if (['admin', 'oficina', 'direccion'].includes(rol) && confirmado) return true; const f = ((nuevo || {}).__filtros || []).find((x) => x[0] === 'hilo' && x[1] === '=='); return !!f && leeH(f[2]); }
        if (crear) { const m = nuevo || {}; const CAMPOS = ['id', 'hilo', 'mes', 'uid', 'email', 'nombre', 'persona', 'personaClave', 'rol', 'texto', 'tipo', 'ts', 'fecha', 'hora', 'fotoMini', 'fotoId', 'porAsistente', 'refId', 'estado', 'pedido'];
          return confirmado && m.uid === uid && Object.keys(m).every((k) => CAMPOS.includes(k)) && (['admin', 'oficina'].includes(rol) || (rol !== 'direccion' && mio(m.hilo) && hab() && ['msg', 'pedido', 'ia'].includes(m.tipo || 'msg') && ['', 'pendiente'].includes(m.estado || ''))); }
        if (act) return adminUOficina() && soloCampos(['estado', 'decTs', 'decPor', 'decPorNombre', 'decMotivo', 'resultado', 'analisis']);
        return false;
      }
      default: return false;
    }
  };
})();
