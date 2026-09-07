MODO-GYM - APKs y AAB listos - Ing Ivan Teneta

UBICACION: apk-para-drive/

ARCHIVOS GENERADOS (ruta corta C:\modo-gym tambien):
- modo-gym-debug.apk (155 MB) - para probar rapido, incluye todo, debug signed
- modo-gym-release.apk (83 MB) - optimizado release, mas liviano, debug signed
- modo-gym-release.aab (56 MB) - PARA PLAY STORE (Android App Bundle)

TODOS CON VIDEOS: 600+ ejercicios con GIF animado + imagen HD (expo-video)

COMO PROBAR EN TU TELEFONO (Drive):
1. Sube a Drive el APK que quieras (recomendado release 83MB)
2. En el celular abre Drive > toca APK > Descargar
3. Activa "Instalar apps desconocidas" y abre
4. Prueba: Onboarding > Home > Ejercicios (ver VIDEO en loop) > Rutinas > Dieta > IA > Pagos

PLAY STORE:
- Sube el AAB: modo-gym-release.aab a Play Console > Produccion
- Paquete: com.modogym.app (app.json)
- Version: 1.0.0 - SDK 54
- Para firma definitiva usa: eas build --platform android --profile production (firma con keystore de EAS)

REGENERAR:
cd C:\modo-gym
.\android\gradlew.bat assembleDebug    -> debug
.\android\gradlew.bat assembleRelease  -> release APK
.\android\gradlew.bat bundleRelease    -> AAB

