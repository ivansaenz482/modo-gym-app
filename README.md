# MODO-GYM ❤️🧠🏋️

**Mente + Corazón + Fuerza.** App premium de rutinas, dieta, IA y control de membresías.

Creado por **Ing. Ivan Teneta** · 2026

## Stack (gratis y escalable)
- **Expo 57 + React Native 0.86 + TypeScript** — un solo código para Android/iOS/Web
- **React Navigation** bottom tabs, **Zustand** + AsyncStorage (offline-first)
- **Expo LinearGradient, Vector Icons, Notifications**
- **APIs 100% gratis sin key** (ver abajo)

## APIs de ejercicios elegidas (GitHub, vídeos + imágenes)
1. **yuhonas/free-exercise-db** (⭐1.4k, 800+ ejercicios, JSON + imágenes HD, Unlicense) — `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json` → fuente principal, offline, sin límite, usada en `src/services/exerciseService.ts`.
2. **arhxam/free-exercise-db-with-videos** (MIT, 317 ejercicios, 593 vídeos Full-HD hombre/mujer + thumbnails) — fallback para vídeo cuando hay conexión. También clonable y auto-hosteable gratis.
- Alternativas evaluadas: `exercisedb-api` (11k ej.), `workoutx` (1300 GIFs, requiere key), `adriankadev/exercises-dataset` (1324 GIFs). Se dejó yuhonas por ser la más estable sin key y con imágenes ilimitadas.

Dieta e IA son **locales y gratis**: `src/services/dietService.ts` (7 días x 5 objetivos) y `src/services/aiService.ts` (MODO Coach offline rule-based, ampliable a HuggingFace free inference sin costo).

## Estructura escalable
```
src/
  theme/      → colors, typography (design system)
  store/      → zustand (user, membership, routine) persistido
  services/   → exerciseService, dietService, aiService, notifications
  screens/    → Onboarding, Home, Exercises, Routines, Diet, AI, Membership
  navigation/ → AppNavigator (tabs premium, sin expo-router para ligereza)
  data/       → mockExercises fallback
  components/ui → Logo (corazón+cerebro+pesa), Card
```
Añadir módulo futuro = crear `src/services/nuevo.ts` + `src/screens/Nueva.tsx` + tab.

## Features implementadas
- **Onboarding**: nombre, edad, sexo, estatura/peso, objetivo (bajar peso / músculo / definir / resistencia / mantener), días/semana, gym + cálculo IMC.
- **Ejercicios**: 800+ con búsqueda, filtros por categoría (Gym, Cardio, CrossFit, Calentamiento), imágenes HD, detalle con pasos, agregar a rutina diaria, favoritos.
- **Rutinas por secciones**: usuario agrega ejercicios a rutina diaria; IA recomienda split según días + calentamiento 8-10 min (`generateRoutineRecommendation`).
- **Dieta semanal variada**: 7 días x objetivo, kcal/proteína por comida + tip diario.
- **IA gratis MODO Coach**: offline, sin API key, respuestas por objetivo; chip rápidos.
- **Membresía**: gym, plan diaria/mensual/trimestral, fechas auto-calculadas, alerta vencimiento (crítico 3d, pronto 7d, vencida), historial pagos + gastos insumos (suplementos, ropa), total gastos.
- **Branding premium**: fondo #0A0A0F, acento #E10600, logo vectorial corazón+cerebro+ pesa, gradientes, cards dark.

## Cómo probar antes de Play Store
```bash
cd modo-gym
npm install
npx expo start          # escanea QR con Expo Go (Android/iOS)
npx expo start --web    # prueba en navegador
npx expo export --platform web  # verifica bundle (ya probado: OK)
npx tsc --noEmit        # typecheck
```
- Probar onboarding → Home recomienda rutina → Ejercicios → agregar a rutina → Dieta → IA → Pagos (crear membresía mensual y ver alerta).
- Probar offline: activa modo avión, los ejercicios caen a mock local.

## Build Play Store (cuando apruebes)
```bash
npm i -g eas-cli
eas login
eas build --platform android --profile preview   # APK para testeo interno
eas build --platform android --profile production # AAB para Play Console
eas submit --platform android                    # sube a Play Store
```
- Config: `app.json` (package `com.modogym.app`, version 1.0.0, adaptive icon), `eas.json` (preview APK, production AAB).
- Requisitos Play: icono 512x512, feature graphic 1024x500, capturas, política privacidad, contenido, y AAB firmado (EAS lo firma).
- Testing previo subir: instalar APK en 2 dispositivos reales, probar pagos, rutinas y modo avión.

## Diseño "no parece IA"
- Paleta gym premium dark + rojo neón, tipografía 900, bordes 16px, iconografía blanca/roja, microcopy humano ("Tu transformación").
- Logo hecho con capas (no imagen AI genérica): corazón + cerebro superpuestos levantando pesa.

## GitHub (subida tras tu aprobación)
```bash
git init
git add .
git commit -m "feat: MODO-GYM v1 - rutinas 800+ ej, dieta, IA gratis, membresías"
git branch -M main
git remote add origin https://github.com/<tu-user>/modo-gym.git
git push -u origin main
```
NO se hace push automático; esperamos tu filtro de aprobación.

## Roadmap escalable
- Notificaciones push reales (expo-notifications schedule)
- Backend Supabase/Firebase para sync multi-dispositivo
- Pagos con QR y recordatorio diario vía worker
- Video player nativo para vídeos Full-HD

## Licencia
MIT · Uso comercial permitido. Respeta Unlicense de yuhonas y MIT de free-exercise-db-with-videos.
