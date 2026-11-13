# Servidor de fotos: cómo actualizar el Worker «ema-fotos»

El Worker `ema-fotos` es el que guarda las fotos de la app en la nube de Cloudflare (el «bucket» `s3fotos`). La app le manda cada foto con el usuario de la persona; el Worker revisa que la sesión sea válida y la guarda.

No tiene claves adentro: entra al bucket por un **enlace** (Cloudflare lo llama «Binding»).

---

## ⚡ Actualizar el Worker para la v154 (10 minutos)

La versión nueva (`v2-fotos`) sigue guardando las fotos **exactamente igual que hoy**, y además:

- guarda **PDF** (documentación, remitos, planos) y **videos** de obra;
- sube por partes los videos muy grandes (más de 95 MB);
- deja **adelantar el video** sin bajarlo entero;
- sigue **sin dejar borrar** nada.

Hasta que lo pegues, la app sigue como hoy: las fotos andan y los botones nuevos de PDF y video dicen «falta actualizar el servidor de fotos».

### 1. Guardá una copia del código de hoy (para poder volver atrás)

1. Entrá a **dash.cloudflare.com** › **Workers & Pages** › **`ema-fotos`** › **Edit code** (o «Editar código»).
2. Seleccioná todo el código, copialo y pegalo en un archivo de texto en tu carpeta: `ema-fotos_v1_respaldo.txt`.
3. **No lo subas a GitHub ni lo pegues en el chat**: por las dudas de que tenga algo privado adentro.
4. Salí sin tocar nada.

### 2. Fijate que el bucket esté enlazado (esto es lo importante)

1. En el Worker `ema-fotos` › **Settings** › **Bindings** (en castellano: **Configuración** › **Enlaces**).
2. Tiene que haber una fila de tipo **R2 bucket** que diga `s3fotos`. El nombre de la izquierda (por ejemplo `FOTOS`, `BUCKET`, `R2`) **puede ser cualquiera**: el Worker nuevo lo encuentra solo.
3. **Si no hay ninguna fila de R2** (puede pasar: el Worker de antes quizás entraba con las claves de R2 que cargaste como «Secret»), agregala:
   - **Add** (Agregar) › **R2 bucket**.
   - Variable name: **`FOTOS`** · R2 bucket: **`s3fotos`**.
   - **Deploy** (o Guardar).
4. Las claves de R2 que están como «Secret» **no las borres todavía**: el Worker nuevo no las usa, pero dejalas hasta que veas que todo anda bien unos días (abajo, «Después»).

### 3. Pegar el código nuevo

1. Worker `ema-fotos` › **Edit code**.
2. Borrá todo y pegá el contenido completo del archivo **`ema-fotos_v2.js`** de tu carpeta (es el mismo que `workers/ema-fotos.js` en GitHub).
3. Tocá **Deploy**.

### 4. Probar

Abrí en el navegador:

**https://ema-fotos.mdiaz-60f.workers.dev/salud**

Tiene que decir algo así:

```
{"ok":true,"version":"v2-fotos","tipos":["image/jpeg","image/png","image/webp","application/pdf","video/mp4","video/webm"],"multipart":true,"rango":true,…,"r2":true,"enlace":"FOTOS"}
```

- `"version":"v2-fotos"` → está el código nuevo.
- `"r2":true` y `"enlace"` con un nombre → encontró el bucket.
- Si dice `"ok":false` y «El Worker no tiene ligado el bucket R2»: falta el paso 2 (el enlace). Hacelo y volvé a abrir `/salud`.

Después, en la app:

1. Sacá una foto en cualquier obra (la cámara de la app).
2. Abrila en el legajo de esa obra: tiene que verse, con la marquita «☁ nube» en el visor.
3. Mirá una foto vieja: también se tiene que ver.

Si las fotos andan, listo.

### Si algo sale mal: volver atrás

Las fotos **no se pierden** mientras tanto: si el servidor de fotos no contesta, la app las guarda en el celu o en la base, como siempre.

- **La forma rápida:** Worker `ema-fotos` › **Deployments** (Implementaciones) › en la versión de antes, los tres puntitos › **Rollback** (Volver a esta versión).
- **Si no aparece:** **Edit code**, borrá todo, pegá el respaldo del paso 1 y **Deploy**.

### Después (cuando todo ande unos días)

- Si el Worker nuevo anda con el enlace, las claves de R2 que están como «Secret» ya no hacen falta. Podés borrarlas del Worker y, en **R2** › **Manage API tokens**, borrar ese token. Así no queda ninguna clave dando vueltas.

---

## Qué acepta el servidor de fotos

| Carpeta | Qué va | Tope en una subida | Tope por partes |
|---|---|---|---|
| `fotos/` | fotos JPG, PNG, WEBP | 10 MB | — |
| `docs/` | PDF | 25 MB | 200 MB |
| `videos/` | videos MP4, WEBM | 95 MB | 2 GB |

- Revisa que el archivo sea de verdad lo que dice ser (una foto, un PDF o un video). Si no, lo rechaza.
- Nada se pisa: si llega otra vez el mismo archivo (un reintento), contesta «ya está».
- Nada se borra desde la app.
- Solo lo usan la app publicada en GitHub y la app de Android. Si algún día la app se abre desde otro sitio, se agrega en **Settings** › **Variables** una de tipo **Text**: `FOTOS_ORIGENES` = la dirección del sitio.

## Cuánto entra gratis en la nube de Cloudflare (R2)

- **10 GB** guardados por mes sin pagar, y bajar las fotos no se cobra.
- Una foto pesa unos 0,3 MB: entran unas 30.000.
- Un minuto de video (comprimido en el celu) pesa unos 7 a 10 MB: **los videos llenan rápido**. 10 GB son más o menos 1.000 a 1.400 minutos de video, junto con las fotos.
- Para ver cuánto va: **dash.cloudflare.com** › **R2** › **`s3fotos`** › **Metrics** (Métricas).
- Si se pasa de 10 GB, Cloudflare cobra unos US$ 0,015 por GB por mes (solo si hay tarjeta cargada).

## Mensajes que puede ver la gente

- **«Tu sesión no es válida: cerrá y volvé a entrar a la app.»** → la persona tiene que salir y volver a entrar.
- **«El archivo pesa … y el tope es …»** → es más grande de lo permitido (la app lo sube por partes cuando corresponde).
- **«Lo que llegó no es un archivo …»** → el archivo está dañado o no es del tipo correcto.
- **«No se puede borrar desde acá.»** → es a propósito.
- **«El servidor de fotos no tiene la nube conectada.»** → falta el enlace del bucket (paso 2).
