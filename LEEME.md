# Portfolio de Ana — cómo actualizarlo

## Subir a GitHub
Sube TODO el contenido de esta carpeta (index.html, media/, api/, models/) a tu repo. Vercel publica solo.
El depa escaneado vive en `media/depa.glb`.

## Muro de notitas + recomendaciones compartidas (una sola vez)
1. En vercel.com abre tu proyecto → pestaña **Storage** → **Create Database** → **Upstash for Redis** (plan gratis).
2. Conéctala a tu proyecto (deja marcados Production y Preview).
3. Ve a **Deployments** → los tres puntitos del último → **Redeploy**.
Listo: los dibujos del muro Y las recomendaciones de libros y rolitas se guardan para todas las visitas.
Sin este paso, cada quien ve solo lo suyo.
Para borrar algo: Storage → tu base → **Data Browser** → llaves `ana:wall`, `ana:recs:books`, `ana:recs:songs`.

## Videos de la tele
1. Pon tus clips cortos (.mp4) en `media/clips/`.
2. En index.html busca `const CLIPS = [];` y escríbelos así:
   `const CLIPS = ["media/clips/clip1.mp4","media/clips/clip2.mp4"];`

## Ajustar los puntitos brillantes del depa
Abre tu página con `?debug` al final (ej. `portfolioana-five.vercel.app/?debug`),
entra y toca cualquier lugar del depa: aparece la coordenada `[x, y, z]`.
En index.html busca `const SPOTS=` y cambia la posición `p` del puntito que quieras mover.
