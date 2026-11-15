# Lo que tenés que hacer vos · v160 (PDF y videos en la nube)

La app nueva ya sabe guardar **PDF** y **videos** en la nube de las fotos (Cloudflare). Para que se prenda, falta **una sola cosa**: pegar el servidor de fotos nuevo. Hasta que lo pegues, la app sigue como hoy (las fotos andan igual) y los botones nuevos dicen «falta actualizar el servidor de fotos».

## 1. Subir la app
Subí el `index.html` nuevo a GitHub como siempre (*Add file › Upload files › Commit*).

## 2. Pegar el servidor de fotos nuevo (10 minutos)

**Antes, guardá una copia del de hoy** (por si hay que volver atrás):
1. Entrá a **dash.cloudflare.com** › **Workers & Pages** › **ema-fotos** › **Edit code**.
2. Seleccioná todo, copialo y guardalo en tu carpeta como `ema-fotos_v1_respaldo.txt` (no lo subas a GitHub ni lo pegues en el chat). Salí sin tocar nada.

**Fijate que el bucket esté enlazado:**
3. En **ema-fotos** › **Settings** › **Bindings** tiene que haber una fila **R2 bucket** con `s3fotos` (el nombre de la izquierda puede ser cualquiera).
4. Si no hay ninguna: **Add** › **R2 bucket** › Variable name `FOTOS` · bucket `s3fotos` › **Deploy**.

**Pegá el código nuevo:**
5. **ema-fotos** › **Edit code** › borrá todo y pegá el contenido completo de **ema-fotos_v2.js** (está en esta carpeta).
6. Tocá **Deploy**.

**Probá:**
7. Abrí **https://ema-fotos.mdiaz-60f.workers.dev/salud**: tiene que decir `"version":"v2-fotos"` y `"r2":true`.
8. En la app, sacá una foto y mirala en el legajo: tiene que verse. Las fotos viejas también.

**Si algo sale mal:** en **ema-fotos** › **Deployments**, en la versión de antes › tres puntitos › **Rollback**. Las fotos no se pierden mientras tanto (quedan en el celu o en la base).

## 3. Qué hay de nuevo en la app
- **PDF hasta 25 MB** (antes 650 KB): planilla de PAT y certificado, remitos, planos de obra y PDF sueltos del legajo van a la nube; en la base queda solo la ficha. Sin señal, quedan en el celu y se suben solos.
- **Videos de obra** (hasta 2 minutos): la cuadrilla, con «🎥 Video» en Modo obra, Mis tareas y la cámara de la app; la oficina, en el legajo › «🎥 Videos y PDF» › «🎥 Subir video». El celu achica el video antes de subirlo (un minuto queda en unos 6 a 8 MB). Se mira en el legajo con ▶ y se puede adelantar, bajar y compartir. Si se grabó en una columna, aparece en la hoja de esa columna del avance de obra (como evidencia: no cuenta como foto).
- **Ojo con el espacio gratis de la nube (10 GB):** los videos lo llenan rápido (unos 1.000 a 1.400 minutos junto con las fotos). Se ve en **dash.cloudflare.com › R2 › s3fotos › Metrics**.

**A confirmar con vos:** el tope de 2 minutos por video, la calidad (≈ 480p) y el tope de 25 MB por PDF; si el «🎥 Video» va también en otro lugar.
