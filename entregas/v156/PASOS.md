# Lo que tenés que hacer vos (versión 2026-11-14 22:15)

La app ya está publicada. Faltan dos cosas que solo podés hacer vos:

## 1. Publicar las reglas nuevas de la base (2 minutos)
Sin esto, el rol Dirección no ve todo y la cuadrilla no puede mandar avisos a «Para resolver». La app le avisa a Administración mientras falten.

1. Entrá a **console.firebase.google.com** › proyecto **alumbrado-stock** › **Firestore Database** › pestaña **Reglas**.
2. Borrá todo lo que hay y pegá el contenido completo de **1_Reglas_Firestore_v155.txt**.
3. Tocá **Publicar**.

## 2. Pegar el Worker nuevo del asistente (5 minutos)
Sin esto, Dirección queda con 10 preguntas por día (como «Solo mirar»). Todo lo demás anda igual.

1. Entrá a **dash.cloudflare.com** › **Workers & Pages** › **ema-ia** › **Edit code**.
2. Borrá todo y pegá el contenido completo de **2_ema-ia_v5.js**.
3. Tocá **Deploy**. La clave y el KV quedan como estaban.
4. Abrí **https://ema-ia.mdiaz-60f.workers.dev/salud**: tiene que decir `"version":"v5-ia"`.

## 3. Para usar Dirección
- En **Usuarios**, al usuario del gerente/dueño ponele el rol **Dirección**.
- En **Itemizado › Nuestra zona** cargá la **fecha del acta de inicio** del contrato (si no, la app la estima con la primera orden y lo dice).
