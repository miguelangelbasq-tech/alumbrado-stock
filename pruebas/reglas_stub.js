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
    mirar:     { inicio:'ver',registro:'ver',calc:'ver',parte:'ver',plan:'ver',avance:'ver',mapa:'ver',stock:'ver',informe:'ver',gastos:'oculto',produccion:'oculto',normas:'ver' }
  };
  const has = (o, k) => o && Object.prototype.hasOwnProperty.call(o, k);
  window.__stubRegla = function (op, col, id, viejo, nuevo, DB) {
    const u = (window.firebase && firebase.apps[0] && firebase.apps[0].auth().currentUser) || null;
    const logueado = !!u, uid = u && u.uid, email = u && u.email;
    const yo = (uid && DB.usuarios && DB.usuarios[uid]) || null;
    const activo = !!yo && yo.activo !== false;
    const confirmado = activo && yo.pendiente !== true;
    const rol = (yo && yo.rol) || 'mirar';
    const esAdmin = confirmado && rol === 'admin';
    const nivel = h => { const base = (ROLES[rol] || ROLES.mirar)[h] || 'ver'; const aj = (yo && yo.ajustes) || {}; return has(aj, h) ? aj[h] : base; };
    const edita = h => confirmado && nivel(h) === 'editar';
    const lee = h => confirmado && nivel(h) !== 'oculto';
    const equipo = () => ['inicio', 'avance', 'stock', 'parte', 'registro', 'calc'].some(lee);
    const adminUOficina = () => confirmado && ['admin', 'oficina'].includes(rol);
    const diff = () => { const k = new Set([...Object.keys(viejo || {}), ...Object.keys(nuevo || {})]); return [...k].filter(x => JSON.stringify((viejo || {})[x]) !== JSON.stringify((nuevo || {})[x])); };
    const soloCampos = l => diff().every(k => l.includes(k));
    const renombraObra = () => (edita('registro') || edita('avance')) && soloCampos(['plazaNombre', 'obraId', 'barrio', 'destino', 'nombre', 'id', 'form', 'obra']);
    const miClave = () => (yo && yo.personaClave) || '';
    const soyDeLaOrden = d => confirmado && miClave() !== '' && Array.isArray(d && d.personalNombres) && d.personalNombres.includes(miClave());
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
        if (id === 'presencia' || id === 'salud') return confirmado;
        if (id === 'baremo') return leer ? confirmado : edita('produccion');
        if (id === 'personal') return leer ? confirmado : (edita('produccion') || edita('parte'));
        if (id === 'cuadrillas') return leer ? confirmado : edita('parte');
        if (id === 'guias') return leer ? confirmado : adminUOficina();
        if (id === 'vapid') return leer ? confirmado : false;   // v050
        if (id === 'reinicios') return localStorage.getItem('stub.sinReglas072') ? false : (leer ? confirmado : esAdmin);   // v072
        if (id === 'ubicacion') return localStorage.getItem('stub.sinReglas083') ? false : (leer ? confirmado : adminUOficina());   // v083
        if (id === 'precios') return leer ? equipo() : (edita('informe') || edita('avance') || edita('gastos') || edita('produccion'));
        return false;
      case 'tableros': return confirmado;
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
      case 'ubicacionVivo': if (localStorage.getItem('stub.sinReglas083')) return false; return leer ? adminUOficina() : (crear || act) ? (confirmado && id === uid) : esAdmin;
      // v089: Proyectista — solo Administración y Oficina
      case 'proyectos': if (localStorage.getItem('stub.sinReglas089')) return false; return adminUOficina();
      default: return false;
    }
  };
})();
