# Ya pues

Expo SDK 58 / React Native 0.88 / React 19.3 app using Expo Router. Routes live in `src/app/`.

## Run

Use a supported Node.js version: 22.13+ on the 22 line, 24.3+ on the 24 line,
or 26+. Expo Go on the phone must support SDK 58.

```sh
npm install
npx expo start
```

After upgrading from SDK 57, stop the previous Metro server and run
`npx expo start --clear`, then scan the new QR code with Expo Go for SDK 58.
Existing development builds need a new native build; JavaScript updates alone
do not update their SDK. The migration keeps the existing AsyncStorage keys
and task/completion formats.

SDK 58 compatibility changes: the picker ref uses `ScrollViewInstance`; tab
presses use Router's `emitter` / `navigateToTab`; notification opening waits for
the navigation `state` event. Layout anchors replace the old initial-route
options. Web keeps synchronous routes and uses CSS safe-area insets, as required
by the SDK 58 streaming renderer. Android/iOS retain their existing safe-area handling.

## Checkpoints 3 and 4

The app opens on Inicio. Inicio and Racha are the two tab buttons; the raised
yellow + opens `/set-date` outside the tabs. The tab bar reserves its own height
and bottom safe area so it does not cover scrollable content. It uses the
installed Ionicons home/person/add icons and colors from `src/constants/colors.ts`.

| Screen | Route | Bottom bar |
| --- | --- | --- |
| Inicio | `/` | Yes |
| Racha | `/streak` | Yes |
| Tarea creada | `/task-created` | Yes, without an extra tab button |
| Acceso | `/start-page` | No |
| Login | `/login` | No |
| Bienvenida | `/welcome` | No |
| Fecha limite | `/set-date` | No |
| Hora limite | `/set-time` | No |
| La tarea | `/set-task` | No |
| La evidencia | `/set-proof` | No |
| Firma / imagen | `/sign` / `/sign?mode=image` | No |
| Avisos 1-4 | `/notification-1` through `/notification-4` | No |

The creation flow is date -> time -> task -> proof -> sign -> task created -> home.
The confirmation returns to home after 1.7 seconds, as in the prototype, and
clears the creation stack. The timer is cancelled when leaving the confirmation.
Login leads to welcome, which returns to home. Both signature modes share one
route and switch with the `mode` query parameter.

The follow-up persistence practice adds task form inputs, AsyncStorage, completion
records and calculated streak data. See [the storage contract and acceptance
check](docs/storage.md). Authentication, registration, Google sign-in, image uploads,
handwritten signature capture are not implemented.
Local device notifications are implemented with `expo-notifications` for SDK 58.
Open **Racha -> Ver recordatorios** to enable task reminders, save a daily time,
turn either kind off, or schedule a real ten-second test. Permissions are only
requested from these explicit actions. See [notification setup and device checks](docs/reminders.md).
The four existing notice screens open with real task data when a task notification
is tapped. Their separate preview cards still use fictional data and never schedule notices.

The Figma shows the home/person/+ bar. Its navigation has a gap: the person icon
on HOME has no direct link to STREAK, while STREAK and TASK COMPLETED show the
same bar and TASK COMPLETED links to STREAK. The app makes both tabs available
consistently. Figma assets were not downloaded; installed Ionicons are used.

## Tab layout options

- `initialRouteName`: opens Inicio first.
- `tabBar`: renders the shared bar with its central action button.
- `headerShown`: lets each tab render its own screen title.
- `tabBarActiveTintColor`: colors the selected tab with the primary color.
- `tabBarInactiveTintColor`: colors other tabs with the muted color.
- `tabBarShowLabel`: keeps the icon-only appearance of the Figma.
- `title`: provides the screen title and accessible tab label.
- `tabBarIcon`: receives the current color and renders the corresponding icon.
- `href: null`: keeps confirmation out of the visible tab buttons.

## Validate

```sh
npm test
npx expo lint
npx tsc --noEmit
npx expo export --platform web --max-workers 1
```

`example/` is archived starter code, ignored by Git, ESLint, and TypeScript.

Manual checks:

1. Switch between Inicio and Racha; check the selected icon and `/streak` URL.
2. Tap + from either tab; fill in the five steps without a bottom bar.
3. Sign and save; verify the confirmation, return home and new task in the list.
4. Open Acceso -> Login -> Bienvenida -> Inicio.
5. In Racha -> Ver recordatorios, test permission denial, the ten-second notification,
   a daily time two minutes ahead, persistence after restarting, and cancellation.
   Enable task notices, create a task, tap its notification and complete the task.
   Preview all four designs separately. Check the back button between form steps.
6. On a small phone and with large text, scroll to the last button and confirm
   that the bar does not cover it. Open each route directly as a deep link.

Reference: [Figma](https://www.figma.com/design/nNOZmFF0M4viYBKPr4a6PX/Ya-pues?node-id=0-1).
