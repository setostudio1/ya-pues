# Ya pues

App para estudiantes que postergan: firmas un compromiso con fecha y hora límite, la app te avisa
cada vez con más urgencia y te ayuda a formar el hábito de cumplir a tiempo, con una racha diaria.

## Cómo correrla

```sh
npm install
npx expo start
```

Abre la app en el celular con **Expo Go (SDK 58)**. Las notificaciones solo funcionan en el
celular. Si cambiaste de versión o de rama, usa `npx expo start --clear`.

## Cómo está organizado el código

```
src/
├── app/             Pantallas y rutas (Expo Router). Cada vista solo junta sus componentes.
│   └── (tabs)/      Inicio, Racha y Tarea creada, con la barra inferior.
├── components/
│   ├── ui/          Piezas reutilizables: Button, BackButton, InputField, DataState, BottomNav…
│   ├── auth/        Acceso, inicio de sesión y registro.
│   ├── home/        Inicio: saludo, racha semanal, lista de tareas y recordatorios.
│   ├── streak/      Racha: mascota con los días y progreso.
│   ├── task-form/   Vistas de Figma SetDate, SetTime y SetTask, y sus piezas
│   │                (DatePickerColumn, StepLabel, FillForm, SetIntensity…).
│   └── reminders/   Pantallas de aviso, NotifyCard y configuración de recordatorios.
├── constants/       Colores, tema y textos de los avisos.
├── context/         Estado compartido: sesión y tarea en creación.
├── hooks/           Cargar tareas, completarlas, cerrar sesión y reprogramar avisos.
├── notifications/   notifications.ts (permiso y recordatorio diario) y taskReminders.ts (avisos por tarea).
├── storage/         Guardar y leer con AsyncStorage: tareas, cuentas y preferencias.
├── styles/          CSS para la web.
├── types/           Tipos de TypeScript.
└── utils/           Validaciones, fechas y cálculo de la racha.
```

Ninguna pantalla usa AsyncStorage directamente: todo pasa por `src/storage/` y por el módulo de
notificaciones. Los colores salen de `src/constants/`.

### Quién hizo cada vista

Integrantes: **Sofía Terrazas** (`sofiaterrazas-cyber`) y **SETO Studio** (`setostudio1`).
Todas las rutas se crearon en `78dc917` (SETO Studio); después cada integrante desarrolló estas partes:

| Vista (Figma) | Ruta | SETO Studio | Sofía Terrazas |
| --- | --- | --- | --- |
| Inicio | `/` | Lista de tareas, completar tareas y rediseño visual (`f20dcfe`, `775af3e`) | Saludo con nombre, cerrar sesión y tareas por cuenta (PR #20) |
| Racha | `/streak` | Cálculo de progreso y pantalla de perfil (`f20dcfe`, `a836d18`) | Organización en componentes (PR #20) |
| Set Date / Set Time / Set Task | `/set-date`, `/set-time`, `/set-task` | Vistas SetDate, SetTime, SetTask, DatePickerColumn, FillForm y SetIntensity (`f20dcfe`, `9d9efbb`) | Validaciones y conexión con el borrador (PR #20) |
| La evidencia / Firma | `/set-proof`, `/sign` | Pantallas, guardado al firmar y bloqueo de doble guardado (`f20dcfe`) | Guardar la tarea en el primer flujo (PR #14) y avisos al firmar (PR #20) |
| Tarea creada | `/task-created` | Confirmación con regreso a Inicio (`78dc917`) | Animación de recompensa y NotifyCard |
| Acceso / Login / Registro / Bienvenida | `/start-page`, `/login`, `/register`, `/welcome` | Rutas iniciales (`78dc917`) | Pantallas, cuentas y sesión (PR #18, #20) |
| Avisos 1–4 y Recordatorios | `/notification-1…4`, `/reminders-preview` | Pantallas ilustradas, tiempos y posponer (PR #19) | Módulo de notificaciones y recordatorio diario (PR #15) |
| Barra inferior y botón | — | BottomNav con botón + (`515dc82`, PR #11) | Animación y háptica del botón (PR #16) |

## Cambio de requisito

No reemplazamos ningún requisito base: la app tiene navegación, estado, formularios, persistencia,
notificaciones y animaciones. Sobre el alcance: en el paso “La evidencia” el usuario elige cómo
demostrará la tarea (foto, video o timelapse), pero la app todavía no captura ni sube esa evidencia.
Usar la cámara queda pendiente para una siguiente versión.
