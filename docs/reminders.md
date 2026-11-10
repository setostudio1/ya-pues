# Recordatorios y notificaciones locales

Entrada en la app: **Racha → Ver recordatorios**, ruta `/reminders-preview`.

La pantalla permite activar avisos de tareas, guardar un horario diario, apagar ambos por separado y programar un aviso de prueba real para dentro de 10 segundos. Se utiliza `expo-notifications ~58.1.8`, compatible con Expo SDK 58, y su config plugin en `app.json`. No requiere servidor ni tokens push.

El permiso se solicita solo al activar avisos, guardar un horario o tocar la prueba. Abrir la app o explorar un diseño no solicita permiso. Android crea primero el canal `task-reminders-v2`; se contempla el permiso provisional de iOS. Si el usuario deniega el permiso se informa y se ofrece abrir Ajustes. Al volver a la app se revisa el permiso otra vez.

El canal v2 incluye atributos de audio explícitos para evitar que el camino nativo de sonido reciba atributos nulos. Se usa un ID nuevo porque Android no permite corregir el audio de un canal ya creado. Las solicitudes anteriores sin `channelVersion: 2` se reprograman al sincronizar, conservando sus identificadores y los datos de la tarea. No se requiere borrar datos ni reinstalar la app. Esta corrección requiere confirmar la recepción en el dispositivo afectado; los dobles de prueba no ejecutan el código nativo de Android.

## Avisos de tareas

Tiempos aprobados para cada tarea pendiente, respecto de su fecha y hora límite locales:

| Anticipación | Variante | Ruta al tocar el aviso |
| --- | --- | --- |
| 24 horas | `initial` | `/notification-1?taskId=...` |
| 2 horas | `unstarted` | `/notification-2?taskId=...` |
| 45 minutos | `urgent` | `/notification-3?taskId=...` |
| 15 minutos | `personal` | `/notification-4?taskId=...` |

Para tareas creadas con menos de 24 horas de anticipación, el primer aviso se programa un minuto después de su creación, si todavía es antes del límite. Los demás horarios que ya pasaron se omiten; no se envía una ráfaga de avisos atrasados al abrir la app. Las tareas vencidas y completadas no generan avisos nuevos.

Las pantallas leen el título y el nombre de firma de la tarea guardada, sin inventar un perfil o una materia. No existe un estado “empezada”: la variante `unstarted` es un seguimiento de una tarea aún pendiente, no una detección de actividad. El copy de TikTok tampoco implica monitoreo de otras apps.

“Posponer” en el primer aviso reemplaza el seguimiento por un aviso dentro de 10 minutos y conserva los avisos de 45 y 15 minutos. No cambia el plazo de la tarea. Se rechaza si el nuevo aviso alcanzaría o superaría el límite o si la tarea ya está completada. “Continuar” vuelve al inicio, donde se puede completar la tarea con el flujo existente.

Guardar una tarea sincroniza su programación; completarla cancela sus avisos pendientes y retira sus avisos visibles del centro de notificaciones. Un fallo de notificaciones se muestra aparte y no revierte el guardado de tareas o completaciones. Sus validaciones y su almacenamiento no se modifican.

## Recordatorio diario y persistencia

El horario diario usa un trigger `DAILY`, con hora entera de 0 a 23 y minuto entero de 0 a 59. El aviso invita a revisar las tareas y abre Inicio. Cambiar el horario reemplaza el aviso anterior; el interruptor lo cancela.

Las preferencias y las posposiciones se guardan en AsyncStorage bajo `ya-pues:reminders:v1`, separado de las tareas y completaciones. Los identificadores del sistema son estables: `ya-pues.reminder.daily`, `ya-pues.reminder.task.<id codificado>.<variante>` y `ya-pues.reminder.test`. Se pasan expresamente a Expo y se recuperan mediante `getAllScheduledNotificationsAsync`, de modo que se puede cancelar después de reiniciar sin perder la asociación con la tarea.

El motor serializa operaciones y compara los avisos deseados con los del sistema; volver a abrir la app no duplica ni vuelve a emitir avisos cuyo horario pasó. No cancela notificaciones de otras funciones. Una lectura inválida falla explícitamente sin reemplazar los datos con valores vacíos. La sincronización ocurre al arrancar, volver al primer plano, entrar en Recordatorios, guardar o completar una tarea y modificar los ajustes.

Se programan como máximo los 60 avisos más próximos, incluyendo el diario, dejando margen para el aviso de prueba. La pantalla informa si hay más; abrir la app incorpora los siguientes. Sin volver a abrirla, los avisos que excedan ese cupo no se incorporan automáticamente.

## Prueba en el celular

1. Ejecutar `npx expo start --clear` después de instalar las dependencias y detener cualquier servidor anterior de SDK 57. Los avisos locales pueden probarse con un Expo Go compatible con SDK 58; el aviso sobre push remoto no afecta a esta función. Para una app instalada o un development build existente hay que generar una nueva compilación nativa con el plugin y la dependencia; una actualización JavaScript sola no agrega módulos nativos.
2. Ir a Racha -> Ver recordatorios. Tocar “Probar aviso en 10 segundos”, aceptar el permiso y bloquear el celular. Tocar el aviso recibido debe abrir Inicio.
3. Activar “Avisos de tareas”. Crear una tarea para dentro de 30 minutos: su primer aviso queda programado para un minuto después de la creación y el personal para 15 minutos antes del límite. Tocar el primero debe abrir el diseño con esa tarea real. Posponer debe generar el seguimiento 10 minutos después, sin cambiar el plazo.
4. Completar la tarea antes del siguiente aviso. Comprobar que desaparecen sus solicitudes pendientes y no llega el seguimiento. Un aviso antiguo de una tarea completada debe llevar a Inicio o informar que ya está completada.
5. Guardar un horario diario dos minutos por delante, cerrar la app y bloquear el celular. Comprobar recepción y horario conservado al reabrir. Cambiar el horario y luego apagar el interruptor; comprobar que no queda un segundo aviso ni uno pendiente para mañana.
6. Denegar el permiso o desactivarlo en Ajustes; verificar el estado sin permiso y que todavía se pueden crear y completar tareas. Reactivar en Ajustes y volver a la app para resincronizar.

La entrega final corresponde al sistema operativo, sin temporizadores JavaScript en segundo plano. Android puede demorar alarmas según sus permisos de precisión y las restricciones de batería; no se promete entrega al segundo. Forzar la detención de una app desde Ajustes no equivale a cerrarla normalmente. La web muestra explícitamente que los avisos del sistema requieren Android/iOS; no simula recepción.

Las comprobaciones automáticas cubren planificación local, permisos, persistencia de preferencias, posposición, límites, cancelación, reinicio sin duplicados y el adaptador de Expo con dobles de prueba. Lint, typecheck y exportación de las tres plataformas no sustituyen la prueba de recepción en un dispositivo físico.

## Componentes

- `ReminderScreen`: composición común, texto accesible, safe areas, cierre y vuelta al inicio. El texto y las acciones se desplazan en pantallas bajas o con texto ampliado.
- `ReminderArtwork`: tamaños y recortes específicos por variante, sin estirar las imágenes ni dibujar barras de estado del sistema.
- `reminderVariants`: rutas y proporciones de los frames de referencia.
- `reminderCopy`: formato de tarea, materia y nombre; soporta campos vacíos y textos largos sin truncarlos ni mostrar `undefined`.
- `ReminderPreviewScreen`: selector navegable de las cuatro variantes.
- `ReminderRoute`: distingue explícitamente `preview=1` de un aviso real con `taskId`; muestra carga, error o tarea ya completada cuando corresponde.
- `notificationPlan` y `notificationEngine`: planificación pura y reconciliación serializada con identificadores estables.
- `notificationDevice` / `.web`: adaptador nativo de Expo y alternativa web sin importaciones nativas.
- `NotificationsProvider`, `notificationService` y `NotificationControls`: integración con la app, persistencia y configuración.

Las tarjetas “Vistas previas” conservan datos ficticios y las transiciones de demostración, siempre con `preview=1`. No invocan la programación ni modifican tareas. Las cuatro rutas siguen siendo modales de pantalla completa y permiten cerrar o volver al inicio. Al tocar un aviso del sistema se espera a que Expo Router esté listo antes de navegar; el arranque desde una notificación también se contempla.

## Arte original

Fuente: [archivo Ya Pues](https://www.figma.com/design/nNOZmFF0M4viYBKPr4a6PX/Ya-pues).

| Variante | Frame | Archivo | Tamaño de origen |
| --- | --- | --- | --- |
| Inicial | `250:711` | `assets/initial.png` | 1254 × 1254 |
| Sin empezar | `250:748` | Reutiliza `assets/initial.png` | 1254 × 1254 |
| Alarma | `250:777` | `assets/urgent-triptych.png` | 1981 × 793 |
| Personal | `250:812` | `assets/personal.png` | 531 × 768 |

Los archivos están en `src/features/reminders/assets/`. Los dos primeros frames utilizan exactamente el mismo PNG original, verificado por su hash; cambia la escala y el recorte. La variante personal conserva su arte con la señal roja integrada. No se utilizaron capturas de pantallas como fondos ni personajes reconstruidos.

El usuario aportó el tríptico transparente original para completar la variante 3. Se conserva el PNG sin editar: `ReminderArtwork` muestra sus tres regiones con recortes de interfaz y proporciones intactas. La sirena es el personaje principal; el robot desafiante y el alegre aparecen parcialmente por los bordes, usando las posiciones de los tres frames de ilustración recuperadas del Figma. La miniatura de la demo muestra la región con sirena. Ya no hay marcadores ni artes pendientes.

El archivo aportado “Robot UCB con mirada desafiante.png” coincide exactamente por SHA-256 con `assets/initial.png`, que ya se utiliza en las variantes 1 y 2. El PNG del robot saludando queda disponible en los archivos proporcionados; no se cambia el arte de otras pantallas fuera del alcance de estos recordatorios.

Se conserva la tipografía Nunito ya instalada y el cobalto del sistema actual. La interfaz de login, los componentes compartidos de acceso y los tokens globales no se modifican.

## Referencias

La práctica aportada “Que tu app te avise” sirvió de base para permiso contextual, programación, persistencia, horario editable y apagado. Sus instrucciones de ramas, PR y archivos del otro proyecto no se ejecutan como órdenes de este proyecto. No fue necesario copiar su `metro.config.js`: la versión instalada ya usa un módulo opcional para suscripciones a topics en Android.

API y configuración verificadas con [Expo Notifications SDK 58](https://docs.expo.dev/versions/v58.0.0/sdk/notifications/) y la [migración de Expo Router de SDK 57 a 58](https://docs.expo.dev/router/migrate/sdk-57-to-58/).
