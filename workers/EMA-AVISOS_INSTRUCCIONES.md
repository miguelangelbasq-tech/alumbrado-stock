# Avisos con la app cerrada: cómo dejarlos andando

Para que al celular le llegue «📋 Orden nueva», «⭐ Puntos aprobados», etc. **aunque la app esté cerrada**.

La app ya está lista (desde la v115). Falta revisar 3 cosas del lado de Cloudflare y Firebase. Tardás unos 10 minutos.

---

## 1. Ver qué versión tiene el Worker

Abrí en el navegador:

**https://ema-avisos.mdiaz-60f.workers.dev/salud**

- Si dice `"version":"v116-fcm"` y `"cuenta":true` → está bien, pasá al paso 3.
- Si dice otra versión (por ejemplo `v050` o `v115-fcm`), o no dice `fcm` → hacé el paso 2.
- Si dice `"cuenta":false` → falta el Secret `FB_SA_JSON` (avisame y lo vemos juntos).

## 2. Pegar el Worker nuevo (solo si el paso 1 lo pide)

1. Entrá a **dash.cloudflare.com** con la cuenta de **Mdiaz@emaservicios.com.ar** (la de `ema-fotos` y `ema-ia`).
2. **Workers & Pages** › **ema-avisos** › **Edit code**.
3. Borrá todo y pegá el contenido completo del archivo **`workers/ema-avisos.js`** (te lo paso junto con esto).
4. **Deploy**.
5. Volvé a abrir `/salud`: tiene que decir `v116-fcm`.

No hace falta tocar los Secrets ni el Cron: quedan como estaban.

## 3. Prender la API de mensajes de Firebase (una sola vez)

1. Entrá a **console.firebase.google.com** › proyecto **alumbrado-stock**.
2. Arriba a la izquierda, el engranaje ⚙ › **Configuración del proyecto** › pestaña **Cloud Messaging**.
3. Donde dice **«API de Firebase Cloud Messaging (V1)»**:
   - si dice **Habilitada** → listo;
   - si dice **Inhabilitada** → tocá los tres puntitos › **Administrar API en Google Cloud Console** › **Habilitar**.

## 4. En cada celular

1. Tener la **app de Android 1.3 o 1.4** (no la página en Chrome).
2. Entrar a la app una vez con su usuario. La primera vez pregunta **«¿Permitir notificaciones?»** → **Permitir**.
   - Si alguien tocó «No permitir»: Ajustes del celu › Apps › EMA Alumbrado › Notificaciones › prender.
3. Batería «Sin restricciones» (como para la ubicación).

## 5. Probar

1. Que la persona **cierre la app** (deslizarla fuera de las recientes).
2. Desde la oficina, abrí el **✨ Asistente** y pedile: **«mandale un aviso a Pedro que diga prueba»** → «Sí, hacelo».
   (También sirve emitirle una orden de prueba.)
3. En menos de 1 minuto le tiene que sonar el celu.
4. Si querés apurarlo, abrí **https://ema-avisos.mdiaz-60f.workers.dev/probar**: fuerza la vuelta ya y muestra cuántos mandó.

**Si no llega**, abrí `/probar` y mandame una foto de lo que dice:
- `fcm 404` o `UNREGISTERED` → ese celular tiene que volver a entrar a la app (se anota de nuevo solo).
- `fcm 403` → falta el paso 3 (la API está apagada).
- `429` → se terminó el cupo gratis del día de Firebase; vuelve a andar a las 4 o 5 de la mañana.
