# Ya pues

Expo SDK 57 / React Native app using Expo Router. Routes live in `src/app/`.

## Run

```sh
npm install
npx expo start
```

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
handwritten signature capture and scheduled notifications are not implemented.
The four notice screens are reachable manually from Inicio; the prototype's
ten-second demonstration timer is not a scheduled device notification.

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
5. Open all four notices and return home. Check the back button between form steps.
6. On a small phone and with large text, scroll to the last button and confirm
   that the bar does not cover it. Open each route directly as a deep link.

Reference: [Figma](https://www.figma.com/design/nNOZmFF0M4viYBKPr4a6PX/Ya-pues?node-id=0-1).
