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
    <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="MODO GYM" />
    <meta name="format-detection" content="telephone=no" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="MODO GYM — El poder está en tu interior" />
    <meta property="og:description" content="Entrenamiento, rutinas, dieta y progreso. Mente + Corazón + Fuerza." />
    <meta property="og:image" content="/icons/icon-512.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="apple-touch-startup-image" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" href="/splash/splash-1290x2796.png" />
    <link rel="apple-touch-startup-image" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" href="/splash/splash-1284x2778.png" />
    <link rel="apple-touch-startup-image" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" href="/splash/splash-1179x2556.png" />
    <link rel="apple-touch-startup-image" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" href="/splash/splash-1170x2532.png" />
    <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" href="/splash/splash-1242x2688.png" />
    <link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" href="/splash/splash-1125x2436.png" />
    <link rel="apple-touch-startup-image" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" href="/splash/splash-828x1792.png" />
    <link rel="apple-touch-startup-image" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" href="/splash/splash-750x1334.png" />
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
html = html.replace(
  'content="width=device-width, initial-scale=1, shrink-to-fit=no"',
  'content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"'
);
if (!html.includes('rel="manifest"')) {
  html = html.replace('</head>', head + '  </head>');
}
if (!html.includes('serviceWorker')) {
  html = html.replace('</body>', sw + '  </body>');
}
writeFileSync(indexPath, html);
console.log('[pwa] index.html actualizado (manifest + service worker + meta tags)');
