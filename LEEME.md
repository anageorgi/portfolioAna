# Portfolio de Ana — cómo actualizarlo

## Subir a GitHub
Sube TODO el contenido de esta carpeta (index.html, media/, api/, models/) a tu repo. Vercel publica solo.

## Muro de notitas compartido (una sola vez)
1. En vercel.com abre tu proyecto → pestaña **Storage** → **Create Database** → **Upstash for Redis** (plan gratis).
2. Conéctala a tu proyecto (deja marcados Production y Preview).
3. Ve a **Deployments** → los tres puntitos del último → **Redeploy**.
Listo: los dibujos se guardan para todas las visitas. Sin este paso, cada quien ve solo los suyos.
Para borrar un dibujo: Storage → tu base → **Data Browser** → llave `ana:wall`.

## Videos de la tele
1. Pon tus clips cortos (.mp4) en `media/clips/`.
2. En index.html busca `const CLIPS = [];` y escríbelos así:
   `const CLIPS = ["media/clips/clip1.mp4","media/clips/clip2.mp4"];`
