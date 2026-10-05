import { readFileSync, writeFileSync, existsSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');
const pub = join(root, 'public');

if (!existsSync(dist)) {
  console.error('[pwa] dist/ no existe. Corre "expo export -p web" primero.');
  process.exit(1);
}

// 1) Copiar public/ -> dist/ (manifest, sw, iconos)
if (existsSync(pub)) {
  cpSync(pub, dist, { recursive: true });
  console.log('[pwa] public/ copiado a dist/');
}

// 2) Inyectar meta tags + manifest en <head>
const indexPath = join(dist, 'index.html');
let html = readFileSync(indexPath, 'utf8');

const head = `
    <meta name="description" content="MODO GYM — Entrenamiento, rutinas, dieta y progreso. Mente + Corazón + Fuerza." />
    <meta name="theme-color" content="#E10600" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="MODO GYM" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="MODO GYM — El poder está en tu interior" />
    <meta property="og:description" content="Entrenamiento, rutinas, dieta y progreso. Mente + Corazón + Fuerza." />
    <meta property="og:image" content="/icons/icon-512.png" />
    <meta name="twitter:card" content="summary_large_image" />
`;

const sw = `
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
          navigator.serviceWorker.register('/sw.js').catch(function () {});
        });
      }
    </script>
`;

html = html.replace('<html lang="en">', '<html lang="es">');
if (!html.includes('rel="manifest"')) {
  html = html.replace('</head>', head + '  </head>');
}
if (!html.includes('serviceWorker')) {
  html = html.replace('</body>', sw + '  </body>');
}
writeFileSync(indexPath, html);
console.log('[pwa] index.html actualizado (manifest + service worker + meta tags)');
