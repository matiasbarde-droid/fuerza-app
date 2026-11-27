# Fuerza: app personal de entrenamiento de fuerza

PWA (app web instalable) para Android. Funciona **sin conexión** y guarda los datos
**solo en el teléfono** (IndexedDB). No tiene backend, cuentas ni rastreo.

**Stack:** React 18 · Vite 6 · TypeScript · Tailwind CSS 4 · Dexie (IndexedDB) ·
Recharts · dnd-kit · vite-plugin-pwa (Workbox)

## Funcionalidades

| Pestaña | Qué hace |
|---|---|
| **Entrenar** | Sesión en vivo: series, peso/reps sobre la marcha, temporizador de descanso con vibración y sonido, "última vez", sugerencia de doble progresión, pantalla siempre encendida |
| **Rutinas** | Cuestionario inicial, 6 planes basados en evidencia, editor con días, drag & drop y unidad kg/lb por ejercicio |
| **Ejercicios** | ~870 ejercicios de free-exercise-db con imágenes, filtros y traducción; ejercicios propios con foto |
| **Progreso** | Historial, gráficos por ejercicio (1RM estimado, peso máximo, volumen), peso corporal y cardio |
| **Ajustes** | Unidad, descanso, avisos, uso sin conexión y respaldo JSON |

## Estado

| Fase | Contenido | Estado |
|---|---|---|
| 1 | Estructura + biblioteca de ejercicios | ✅ |
| 2 | Rutinas, planes y cuestionario | ✅ |
| 3 | Modo entrenamiento (temporizador, progresión, Wake Lock) | ✅ |
| 4 | Historial, gráficos, peso corporal, cardio y respaldo JSON | ✅ |
| 5 | PWA offline, instalación y despliegue | ✅ |

## Requisitos

- Node.js 20 o superior (`node -v`)
- Git (y GitHub Desktop, opcional, para publicar)

## Comandos

```powershell
npm install             # instalar dependencias (solo la primera vez)
npm run dev             # desarrollo en http://localhost:5173
npm run dev:lan         # igual, accesible desde el celular por Wi-Fi
npm test                # tests (unidades, progresión, planes, respaldo…)
npm run build           # versión de producción en dist/
npm run preview         # sirve dist/ en http://localhost:4173 (con modo offline)
npm run sync-exercises  # volver a descargar free-exercise-db
npm run generate-icons  # regenerar íconos desde public/icon.svg
```

## Estructura

```
src/
  app/         navegación, rutas, aviso de actualización
  components/  UI compartida (botones, campos numéricos, gráfico, imagen)
  data/        ejercicios (JSON), traducciones, planes predefinidos
  db/          Dexie: esquema, rutinas, sesión en curso, historial, respaldo
  domain/      lógica pura con tests: unidades, progresión, recomendación
  features/    pantallas por pestaña (exercises, routines, workout, progress, settings)
  lib/         avisos (vibración/sonido), hooks, imágenes offline
scripts/       descarga de free-exercise-db
```

## Probar en el celular (Android) durante el desarrollo

### Opción A: Wi-Fi (rápido, para revisar la interfaz)

1. El PC y el celular, en la misma red Wi-Fi.
2. `npm run dev:lan`: Vite muestra `Network: http://192.168.x.x:5173/`.
3. Abre esa dirección en Chrome del celular.
4. La primera vez, Windows pregunta si Node.js puede usar la red: permite solo
   **Redes privadas**.

Limitación: por `http://` el navegador no permite instalar la app, el modo
offline ni la pantalla siempre encendida (exigen HTTPS).

### Opción B: cable USB (todas las funciones)

1. En el celular: Ajustes → Acerca del teléfono → toca 7 veces "Número de
   compilación" y activa **Depuración USB** en Opciones de desarrollador.
2. Conecta el cable y acepta el aviso en el celular.
3. En Chrome del PC: `chrome://inspect/#devices` → **Port forwarding** → añade
   `5173` → `localhost:5173` (y `4173` → `localhost:4173` para probar la
   versión de producción) y marca "Enable port forwarding".
4. Abre `http://localhost:5173` en Chrome del celular. Para probar el modo
   offline: `npm run build` + `npm run preview` y abre `http://localhost:4173`.

## Desplegar gratis en GitHub Pages

El repositorio incluye `.github/workflows/deploy.yml`: cada `push` a `main`
ejecuta los tests, compila y publica la app.

1. **Publicar el repositorio** (con GitHub Desktop): *File → Add local
   repository* → `C:\dev\fuerza-app` → **Publish repository**. Nombre:
   `fuerza-app`. Para GitHub Pages gratis el repositorio debe ser **público**
   (desmarca "Keep this code private"). El código no contiene datos personales:
   tus entrenamientos viven solo en tu teléfono.
2. **Activar Pages**: en github.com, en el repositorio → *Settings → Pages* →
   *Source*: **GitHub Actions**.
3. **Lanzar el despliegue**: en la pestaña *Actions* → "Desplegar en GitHub
   Pages" → *Run workflow* (o haz cualquier push). Tarda ~1–2 minutos.
4. La app queda en `https://<tu-usuario>.github.io/fuerza-app/`.

Para publicar cambios: haz commit y *Push origin* en GitHub Desktop. La app
instalada mostrará "Hay una versión nueva" y se actualiza con un toque.

**Alternativas:** Netlify o Vercel: importa el repositorio, comando de build
`npm run build`, carpeta de salida `dist`. No requiere más configuración.

## Instalar en Android

1. Abre la URL de GitHub Pages en **Chrome**.
2. Menú ⋮ → **Instalar app** (o "Agregar a pantalla principal").
3. Ábrela desde el ícono: se ve a pantalla completa, como una app nativa.
4. En **Ajustes → Uso sin conexión**, pulsa "Descargar imágenes de mis rutinas"
   (con Wi-Fi) para tener las imágenes sin internet.

## Respaldo de datos

Los datos viven en el almacenamiento de Chrome del teléfono. **Si borras los
datos de Chrome o desinstalas la app, se pierden.** Usa *Ajustes → Respaldo →
Exportar* de vez en cuando y guarda el `.json` en Drive o en el correo. Para
cambiar de móvil: exporta en el viejo e **Importar** en el nuevo.

## Seguridad y privacidad

- **Sin permisos:** la app no solicita ubicación, contactos, micrófono, cámara
  ni notificaciones. Las fotos se eligen con el selector de Android
  (`<input type="file">`); la app solo recibe la foto elegida y le borra los
  metadatos (incluido el GPS) al redimensionarla.
- **Datos locales:** IndexedDB del navegador, aislado por origen. Ninguna otra
  web o app puede leerlo. Al terminar un entrenamiento se pide al navegador
  "almacenamiento persistente" para que no lo borre por falta de espacio
  (Chrome lo concede sin mostrar avisos).
- **CSP estricta:** solo se ejecuta el código de la propia app; la única
  conexión externa permitida es `raw.githubusercontent.com` (imágenes de
  ejercicios).
- Sin analíticas, anuncios ni servicios de terceros en tiempo de ejecución.

## Créditos

Ejercicios e imágenes: [free-exercise-db](https://github.com/yuhonas/free-exercise-db)
(dominio público / Unlicense). Traducciones al español y planes: propios.
