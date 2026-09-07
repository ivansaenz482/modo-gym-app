# 📋 FORMULARIO DATA SAFETY — MODO-GYM (respuestas para Play Console)

Completa estas respuestas en **Google Play Console → Contenido de la app → Datos**.

> ⚠️ IMPORTANTE: marca "Recoge datos" como **SÍ** para salud, porque la app guarda peso/altura/IMC.
> Si marcas "no" y Google detecta datos de salud → **RECHAZO**.

---

## 1. ¿Tu app recoge o comparte algún tipo de dato de usuario?
**Sí** ✅

## 2. Tipos de datos (marca estos):
- **[x] Salud y ejercicio** → Peso, altura, IMC, progreso de entrenamiento. (Se guardan en el dispositivo)
- **[x] Datos personales** → Nombre, edad, sexo, gym. (En el dispositivo)
- **[x] Fotos y vídeos** → Fotos de productos (solo las sube la administradora de la tienda).
- **[ ] Ubicación** → No
- **[ ] Contactos** → No
- **[ ] Mensajes** → No
- **[ ] Historial de búsqueda/compras** → No (solo catálogo del gimnasio)
- **[x] Otra información** → Productos de la tienda (nombre, precio, stock en Firebase).

## 3. ¿Los datos se recogen de forma **encriptada en tránsito**?
**Sí** — las conexiones usan HTTPS (Firebase, ImgBB).

## 4. Compartir datos con terceros
¿Compartes con otras empresas?
- **No** se comparten con terceros para publicidad.
- **Servicios externos** (Firebase, ImgBB) solo almacenan datos de la tienda (productos/fotos), no salud.

## 5. Eliminación de datos
- El **usuario** puede borrar su perfil/progreso: **Inicio → Editar**. También desinstalando la app.
- La **administradora** puede borrar productos de la tienda.
- **SÍ** existe un mecanismo de eliminación.

## 6. ¿La app requiere autenticación?
**No** (no hay inicio de sesión).

## 7. ¿Usa cifrado en reposo de los datos?
Los datos de salud se guardan localmente (AsyncStorage). La tienda en Firebase (Google la cifra).

---

## 🎯 Resumen para pegar rápido
| Sección | Respuesta |
|---------|-----------|
| Recoge datos | **Sí** |
| Salud y ejercicio | **Recoge** (local) |
| Encriptado en tránsito | **Sí** (HTTPS) |
| Eliminación de datos | **Sí** (editar/desinstalar) |
| Se comparte con terceros | **No** (para publicidad) |
| Autenticación | **No** |
