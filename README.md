# Ya pues

App para comprometerte con tus tareas: eliges la fecha y hora límite, describes la tarea, eliges
cómo vas a demostrar que la hiciste y firmas tu compromiso. La app te avisa antes del plazo y
lleva tu racha de días cumpliendo tareas.

Diseño en [Figma](https://www.figma.com/design/nNOZmFF0M4viYBKPr4a6PX/Ya-pues?node-id=0-1).

## Cómo correrla

Necesitas Node.js 22 o superior y la app **Expo Go** (SDK 58) en el celular.

```sh
npm install
npx expo start -c
```

Escanea el código QR con Expo Go. Si el celular no está en la misma red Wi-Fi que la computadora,
usa `npx expo start --tunnel -c`. Las notificaciones solo funcionan en el celular.

## Qué incluye

| Tema | Dónde está |
| --- | --- |
| Navegación | Expo Router: pestañas Inicio/Racha y rutas protegidas por sesión (`src/app/_layout.tsx`) |
| Estado | `SessionContext` (usuario) y `TaskDraftContext` (la tarea mientras se crea) |
| Persistencia | AsyncStorage para cuentas, sesión, tareas y tareas completadas (`src/storage/`) |
| Notificaciones | Avisos 2 h, 1 h y 15 min antes del plazo, posponer 10 min y recordatorio diario (`src/notifications/`) |
| Animaciones | Entrada de las pantallas de acceso y de las tarjetas; el botón se achica al tocarlo y vibra |
| Cuentas | Registro e inicio de sesión guardados en el celular; la contraseña se guarda con hash SHA-256 |
| Estados de pantalla | Cargando, vacío y error con botón Reintentar (`src/components/ui/DataState.tsx`) |

Flujo: Acceso → Iniciar sesión / Crear cuenta → Bienvenida → Inicio. Con el botón **+** se crea una
tarea en 5 pasos (fecha, hora, tarea, evidencia y firma). Desde **Racha → Ver recordatorios** se
prueba un aviso y se ven las 4 pantallas de aviso.

## Cómo está organizado el código

```
src/
├── app/            Pantallas. Cada archivo es una ruta y solo junta sus componentes
├── components/
│   ├── ui/         Piezas reutilizables: Screen, Button, InputField, DataState, BottomNav…
│   ├── auth/       Acceso, inicio de sesión y registro
│   ├── home/       Inicio: saludo, racha semanal, lista de tareas y recordatorios
│   ├── streak/     Racha: mascota con los días y progreso
│   ├── task-form/  Los 5 pasos para crear una tarea
│   └── reminders/  Pantallas de aviso y configuración de avisos
├── constants/      Colores, tema y textos de los avisos
├── context/        Estado compartido: sesión y tarea en creación
├── hooks/          Lógica reutilizable: cargar tareas, completar tareas, enviar formularios de acceso
├── notifications/  Permisos, programar y cancelar avisos, abrir la pantalla al tocar un aviso
├── storage/        Guardar y leer con AsyncStorage: tareas (data.ts) y cuentas (accounts.ts)
├── styles/         CSS para la web (fuente y márgenes seguros)
├── types/          Tipos de TypeScript
└── utils/          Funciones de apoyo: validaciones, fechas y cálculo de la racha
```

Ninguna pantalla usa AsyncStorage directamente: todo pasa por `src/storage/`. Los colores salen
de `src/constants/colors.ts`.

### Quién hizo cada parte

| Parte | Integrante (GitHub) |
| --- | --- |
| Estructura inicial, Inicio, pasos para crear una tarea, diseño visual, invitar compañeros, Racha y pantallas de aviso | setostudio1 |
| Pestañas y rutas, guardado de tareas, notificaciones, animaciones, acceso / registro / sesión y organización del código | sofiaterrazas-cyber |

## Cambio de requisito

No cambiamos ningún requisito base.

## Revisar el código

```sh
npx expo lint
npx tsc --noEmit
```

La fuente Nunito (`public/fonts/`) tiene licencia SIL Open Font License (`public/fonts/OFL.txt`).
