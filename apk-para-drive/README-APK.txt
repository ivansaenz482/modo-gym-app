# MODO-GYM - APK para Drive

## Como instalar en tu telefono AHORA (sin esperar APK):

### Opcion 1 - Expo Go (ya funciona, SDK 54):
1. Actualiza Expo Go en Play Store
2. Ejecuta: npx expo start --tunnel -c
3. Escanea QR

### Opcion 2 - APK (esta carpeta):

**APK Debug listo para Drive:** pk-para-drive/modo-gym-debug.apk (se genera con el .bat)

**Para generarla:**
1. Asegurate que el proyecto corto existe en C:\modo-gym (ya copiado)
2. Doble click en pk-para-drive\generar-apk.bat o ejecuta en PowerShell:
   cd C:\modo-gym
   .\android\gradlew.bat assembleDebug
3. La APK queda en C:\modo-gym\android\app\build\outputs\apk\debug\app-debug.apk
4. Copiala a esta carpeta y subela a Drive. En el celular activa "Instalar apps desconocidas" y abre el APK.

**Alternativa nube (mas rapido, no compila local):**
   cd C:\modo-gym
   eas login
   eas build --platform android --profile preview
Te da link directo para instalar.

## Videos:
Ya integrados: 600+ ejercicios con GIF animado + imagen HD (yuhonas + adriankadev). Cada card muestra VIDEO en loop y detalle con player. Si quieres MP4 exacto por ejercicio, se puede cambiar base a free-exercise-db-with-videos cuando R2 este disponible.

Creado por Ing Ivan Teneta
