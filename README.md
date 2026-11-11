# Ya pues

App de organización honesta: firmas un compromiso con fecha y hora límite, la app te avisa
cada vez con más urgencia y te ayuda a formar el hábito de cumplir a tiempo, con una racha diaria.

## Cómo correrla

```
npm install
npx expo start
```

Abre la app en el celular con **Expo Go (SDK 58)**. En el navegador (`npx expo start --web`) los avisos
se muestran como un banner dentro de la app, con sonido y vibración si el dispositivo lo permite.
Si cambiaste de versión o de rama, usa `npx expo start --clear`.

## Cómo está organizado el código

```
src/
├── app/                 Solo pantallas (Expo Router). La carpeta define la ruta.
│   ├── (auth)/          Acceso, inicio de sesión y registro: /start-page, /login, /register.
│   ├── (new-task)/      Crear tarea paso a paso: /set-date, /set-time, /set-task, /set-proof, /sign.
│   ├── (reminders)/     Avisos 1–4 y configuración: /notification-1…4, /reminders-preview.
│   ├── (tabs)/          Inicio, Racha y Tarea creada, con la barra inferior.
│   ├── edit-task/[id]   Editar una tarea pendiente o vencida.
│   └── welcome.tsx      Bienvenida después de entrar.
├── components/
│   ├── ui/              Piezas reutilizables: Button, BackButton, Screen, InputField, BottomNav…
│   ├── auth/            Formularios de acceso.
│   ├── home/            Inicio: saludo, racha semanal, tarjetas de tareas y sus acciones.
│   ├── streak/          Racha: mascota con los días y progreso.
│   ├── task-form/       Vistas de Figma SetDate, SetTime, SetTask, EditTask y sus piezas.
│   └── reminders/       Pantallas de aviso, banner web y configuración de recordatorios.
├── constants/           Todo lo que se cambia a mano:
│   ├── colors.ts        Colores.
│   ├── typography.ts    Fuente, tamaños de letra y estilos de texto.
│   ├── spacing.ts       Espacios, bordes redondeados y grosores.
│   ├── layout.ts        Ancho máximo, sombras y dirección (fila o columna) de los contenedores.
│   ├── routes.ts        Todas las rutas de la app.
│   ├── tasks.ts         Textos de intensidad y evidencia, meses, días y largo del título.
│   ├── reminders.ts     Textos, tiempos, sonidos y colores de los avisos.
│   └── theme.ts         Junta todo lo anterior en `theme`.
├── context/             Estado compartido: sesión y tarea en creación.
├── hooks/               Cargar tareas, completarlas o borrarlas, cerrar sesión y reprogramar avisos.
├── notifications/       Permisos, avisos por tarea y simulador de avisos para la web.
├── storage/             Guardar y leer con AsyncStorage: tareas, cuentas y preferencias.
├── styles/              CSS para la web.
├── types/               Tipos de TypeScript.
└── utils/               Validaciones, fechas y cálculo de la racha.
```

Ninguna pantalla usa AsyncStorage directamente: todo pasa por `src/storage/` y por el módulo de
notificaciones. Los estilos usan `StyleSheet` con valores de `src/constants/`.

### Quién hizo cada vista

Integrantes: **Sofía Terrazas** (`sofiaterrazas-cyber`) y **SETO Studio** (`setostudio1`).
Todas las rutas se crearon en `78dc917` (SETO Studio); después cada integrante desarrolló estas partes:

| Vista (Figma) | Ruta | SETO Studio | Sofía Terrazas |
| --- | --- | --- | --- |
| Inicio | `/` | Lista de tareas, completar tareas y rediseño visual (`f20dcfe`, `775af3e`) | Saludo con nombre, cerrar sesión y tareas por cuenta (PR #20); tareas vencidas, eliminar y archivar |
| Racha | `/streak` | Cálculo de progreso y pantalla de perfil (`f20dcfe`, `a836d18`) | Organización en componentes (PR #20) |
| Set Date / Set Time / Set Task | `/set-date`, `/set-time`, `/set-task` | Vistas SetDate, SetTime, SetTask, DatePickerColumn, FillForm y SetIntensity (`f20dcfe`, `9d9efbb`) | Validaciones y conexión con el borrador (PR #20) |
| La evidencia / Firma | `/set-proof`, `/sign` | Pantallas, guardado al firmar y bloqueo de doble guardado (`f20dcfe`) | Guardar la tarea en el primer flujo (PR #14) y avisos al firmar (PR #20) |
| Editar tarea | `/edit-task/[id]` | — | Pantalla EditTask y reprogramación de avisos |
| Tarea creada | `/task-created` | Confirmación con regreso a Inicio (`78dc917`) | Animación de recompensa y NotifyCard |
| Acceso / Login / Registro / Bienvenida | `/start-page`, `/login`, `/register`, `/welcome` | Rutas iniciales (`78dc917`) | Pantallas, cuentas y sesión (PR #18, #20) |
| Avisos 1–4 y Recordatorios | `/notification-1…4`, `/reminders-preview` | Pantallas ilustradas, tiempos y posponer (PR #19) | Módulo de notificaciones y recordatorio diario (PR #15) |
| Avisos en la web | — | — | Banner, sonido y vibración (WebNotificationBanner) |
| Barra inferior y botón | — | BottomNav con botón + (`515dc82`, PR #11) | Animación y háptica del botón (PR #16) |

Usar la cámara queda pendiente para una siguiente versión.
