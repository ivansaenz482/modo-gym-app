@echo off
echo Generando APK MODO-GYM (debug) - puede tardar 8-12 min primera vez
cd /d C:\modo-gym
call android\gradlew.bat assembleDebug
echo.
echo APK generada en: C:\modo-gym\android\app\build\outputs\apk\debug\app-debug.apk
echo Copiando a carpeta Drive...
copy /Y C:\modo-gym\android\app\build\outputs\apk\debug\app-debug.apk .\apk-para-drive\modo-gym-debug.apk
pause
