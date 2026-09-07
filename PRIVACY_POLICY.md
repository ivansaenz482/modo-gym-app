# Política de Privacidad — MODO-GYM

**Última actualización:** 31 de agosto de 2026  
**Titular:** MODO-GYM (gimnasio) — Dueña: Esther Acosta  
**Desarrollador:** Ing. Ivan Teneta — contacto técnico  

---

## 1. Datos que recoge la app

MODO-GYM guarda tus datos en el dispositivo y usa servicios en la nube solo para la tienda.

**Guardados en tu dispositivo (local):**
- **Datos de perfil que introduces:** nombre, edad, sexo, estatura, peso, objetivo, días por semana, nombre del gym.
- **Progreso:** historial de peso/altura/días para mostrar mejoras.
- **Peso por ejercicio:** cuánto peso alzaste (kg, reps, series) para recomendarte subir de carga.
- **Membresía y gastos:** gym, plan, fechas, precio, gastos de insumos.
- **Preferencias:** idioma (ES/EN), país y estaciones de radio favoritas.

**En la nube (solo la sección Tienda):**
- **Productos del gimnasio:** nombres, precios, stock, descripción y fotos, guardados en **Firebase Firestore**.
- **Fotos:** las imágenes de los productos se alojan en **ImgBB** (servicio gratuito de hospedaje de imágenes).

**No recoge:** ubicación precisa, contactos (agenda), datos de pago externo ni llamadas.

## 2. Cómo usa los datos

- Para personalizar rutinas, dieta, IMC, recordatorios de membresía y recomendar pesos.
- La tienda usa Firebase (Firestore) para mostrar y gestionar el catálogo del gimnasio; las fotos de productos se suben a ImgBB solo cuando la administradora las agrega.
- **No se comparten con terceros para publicidad ni se venden.**

## 3. Permisos

- **NOTIFICATIONS:** avisos de vencimiento de membresía y recordatorio de entrenar.
- **INTERNET / fotos:** para descargar imágenes de ejercicios, reproducir radio y subir fotos de productos a ImgBB.
- **Acceso a fotos (galería):** solo cuando la administradora elige la imagen de un producto desde su celular.

## 4. Servicios externos

| Servicio | Uso | Qué comparte |
|----------|-----|--------------|
| **Firebase Firestore** | Catálogo de la tienda | Nombre, precio, stock, descripción y foto del producto |
| **ImgBB** | Hospedaje de fotos de productos | La imagen subida por la administradora |
| **Radio Browser** | Música en vivo | Solo tu dirección IP de conexión |
| **TheMealDB / GitHub** | Imágenes de alimentos y ejercicios | No envía datos personales |

## 5. Almacenamiento y seguridad

Los datos personales se guardan localmente con `AsyncStorage`; si desinstalas la app se borran. Los datos de la tienda viven en tu cuenta de Firebase del gimnasio.

## 6. Derechos

Puedes editar o borrar tu perfil/progreso en Inicio > Editar. Para derechos, contacta al titular.

## 7. Menores

No dirigida a menores de 13 años sin supervisión.

## 8. Cambios

Se publicarán en esta URL y en la ficha de Play Store.

**Contacto:** MODO-GYM — modogym74@gmail.com

---

## Data Safety (respuesta de la consola de Play)

- **Recoge datos:** Sí — salud (peso/altura, local), y datos de la tienda (productos, en Firebase).
- **Cifrado en tránsito:** los datos de tienda se transmiten por HTTPS.
- **Eliminación:** el usuario borra sus datos desinstalando la app; la administradora puede borrar los productos desde la tienda.
