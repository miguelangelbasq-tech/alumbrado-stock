# Asistente EMA: cómo poner en marcha el Worker «ema-ia»

El Worker `ema-ia` es el paso entre la app y Claude. La clave de Claude se guarda **solo ahí adentro**: no va en la app, ni en GitHub, ni en el chat.

Tardás unos 10 minutos.

---

## 1. Sacar la clave de Claude

> ✅ **Esto ya lo hiciste** (08/11/2026): organización «EMA Servicios», créditos del plan Max (USD 100 por mes) vinculados, límite de gasto de USD 30 por mes, clave `ema-ia` creada. Si ya tenés la clave guardada, pasá directo al paso 2.

Para hacerlo de nuevo (por ejemplo, si hay que cambiar la clave):

1. Entrá a **platform.claude.com** (organización **EMA Servicios**).
2. Menú de la izquierda: **Claves y acceso** › **Crear clave**. Si aparece el cartel de «federación de identidades», salteálo: Cloudflare necesita una clave común.
3. Nombre: `ema-ia` · Vence: **Nunca** · Alcance: **Espacio de trabajo predeterminado (default)**, no «Organización».
4. Tocá **Crear** y copiá la clave (empieza con `sk-ant-…`). **Se muestra una sola vez.**
5. No la pegues en ningún otro lado que no sea el paso 3 de abajo: ni en WhatsApp, ni en el chat, ni en un archivo.
6. El saldo sale de los **USD 100 por mes del plan Max**. Para ver o cambiar el tope: **Gasto** › **Límites de gasto**. Sin tarjeta cargada no se cobra nada aparte; si se acaba el crédito, el asistente contesta «se quedó sin saldo» hasta el mes siguiente.

## 2. Crear el Worker y pegar el código

1. Entrá a **dash.cloudflare.com** (la misma cuenta de `ema-fotos` y `ema-avisos`).
2. Menú de la izquierda: **Workers & Pages** › **Create** › **Create Worker**.
3. De nombre poné exactamente **`ema-ia`** y tocá **Deploy** (todavía con el código de ejemplo).
4. Tocá **Edit code**.
5. Borrá todo lo que hay y pegá el contenido completo del archivo **`workers/ema-ia.js`** (lo tenés en tu carpeta y en GitHub).
6. Tocá **Deploy** arriba a la derecha.

## 3. Cargar la clave como «Secret»

1. Volvé al Worker `ema-ia` › **Settings** › **Variables and Secrets** › **Add**.
2. Tipo: **Secret** (no «Text»).
3. Nombre: **`ANTHROPIC_API_KEY`**
4. Valor: pegá la clave del paso 1.
5. Tocá **Deploy** (o **Save**).

Después de esto, la clave no se vuelve a ver nunca más, ni siquiera en el panel. Está bien que sea así.

### Opcional: cambiar el límite de pedidos

Cada persona puede hacer, de entrada, **20 pedidos por minuto** y **400 por día**. Para cambiarlo, en el mismo lugar agregá variables de tipo **Text**:

- `IA_POR_MINUTO` → por ejemplo `10`
- `IA_POR_DIA` → por ejemplo `200`

## 4. Opcional: el KV para contar bien los pedidos

Sin esto anda igual, pero el límite por persona se cuenta «más o menos». Con el KV se cuenta exacto.

1. Menú de la izquierda: **Storage & Databases** › **KV** › **Create** (o **Create namespace**). Nombre: `ema-ia-limites`.
2. Volvé al Worker `ema-ia` › **Settings** › **Bindings** › **Add** › **KV namespace**.
3. Variable name: **`IA_KV`** · KV namespace: `ema-ia-limites`.
4. Tocá **Deploy**.

## 5. Probar

Abrí en el navegador:

**https://ema-ia.mdiaz-60f.workers.dev/salud**

Tiene que decir algo así:

```
{"ok":true,"version":"v1-ia","clave":true,"kv":true}
```

- `clave: true` → la clave está cargada. Si dice `false`, revisá el paso 3 (el nombre tiene que ser exacto: `ANTHROPIC_API_KEY`).
- `kv: true` → el KV está ligado. Si dice `false` y aparece un «aviso», es que no hiciste el paso 4 (anda igual).
- La clave **nunca** aparece en esa página. Si alguna vez la ves en algún lado, avisá y cambiala.

## Si algo sale mal

- **«Tu sesión no es válida»**: la persona tiene que cerrar y volver a entrar a la app.
- **«Llegaste a N pedidos…»**: es el límite por persona. Esperá un minuto, o hasta mañana si es el del día.
- **«La clave del asistente no funciona»**: la clave se borró o está mal. Creá una nueva (paso 1), cargala de nuevo (paso 3) y borrá la vieja en platform.claude.com.
- **«Se quedó sin saldo»**: se gastaron los créditos del mes o se llegó al tope de USD 30. Se renueva el 1 de cada mes; si hace falta antes, subí el tope en platform.claude.com › Gasto › Límites de gasto.
- **Si pegaste la clave en otro lado por error** (chat, mensaje, archivo): borrala en platform.claude.com › Claves y acceso, creá una nueva y cargala en el paso 3.

## Qué modelos usa

Solo dos, para que no se dispare el gasto:

- **claude-haiku-5-5**: el rápido y barato, para casi todo.
- **claude-sonnet-5-5**: el más capaz, para lo difícil.

Cada respuesta trae cuánto costó en dólares, así la app puede llevar la cuenta.
