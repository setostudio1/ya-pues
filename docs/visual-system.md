# YA PUES visual system

The Figma reference informs whitespace, centered creation steps, readable task cards, pill actions, and the quiet navigation surface. Duolingo informs rounded typography and clear selected states. Existing content and workflows remain the source of truth.

- Typography: bundled Nunito at 400 for body, 600 for labels and section headings, 700 for titles. No 800/900 or synthetic bold.
- Surfaces: light canvas background, flat white cards, one-pixel outlines. Primary buttons have a small bottom edge; the weekly streak card alone uses the soft shadow from its Figma reference.
- Color: the supplied palette uses electric blue `#315BFF`, punchy yellow `#FFCF33`, coral `#FF5D73`, mint `#21D7AE`, violet `#936BFF`, deep ink `#161B35`, soft blue `#E6ECFF`, and canvas `#F7F8FF`. Supporting tints and darker text/depth colors live in `src/constants/colors.ts`. Text stays dark on pale surfaces.
- Web: a wider home layout from 768px; two-column creation and route layouts from 1024px. Mobile retains the existing scroll containers, safe areas, and picker geometry.

## Fonts

The licensed font files live in `public/fonts/`, sourced from the [Expo Google Fonts Nunito collection](https://github.com/expo/google-fonts/tree/main/font-packages/nunito). The OFL license is included alongside them.

Web loads these local files through `src/styles/global.css`. Android and iOS embed the same files through the already installed `expo-font` config plugin in `app.json`; this requires a new development or production build. Expo Go cannot apply build-time font configuration. No font-loading hook, loading gate, navigation change, or runtime font download was introduced.

## Home

The home composition follows the Figma HOME frame: greeting and original mascot, shared weekly streak card, deadline times beside task cards, and two compact reminder cards. The header, streak card, and reminder summary are read-only presentation components. The week highlights today's device-local date and does not filter the task list.

The existing task list, ordering, completion callbacks, and loading/error states remain intact. Task creation stays available through the navigation bar's + button; the extra four-button block below reminders was removed to follow the reference. The reminder summary shows the first two pending tasks in that existing order. All other tasks remain in the main list. Only actual deadline dates/times are displayed: the data model has no start/end intervals or saved profile name. The generic greeting avoids treating the reference's sample name as account data.

The mascot is bundled at `assets/images/home/mascot.png`, from the original image fill of Figma node `248:599` in the [HOME reference](https://www.figma.com/design/nNOZmFF0M4viYBKPr4a6PX/Ya-pues?node-id=248-508), and displayed in its 88 × 81 design slot.

## Weekly streak

`WeeklyStreak` is shared by Home and the Racha/profile screen. It receives the existing `calculateProgress` result and displays Monday–Sunday in the device-local calendar week. Only dates with real, normalized completions receive a yellow ring and lightning bolt; contiguous completed days share a yellow band. Current-day and future-day outlines stay distinct. The existing utility still owns all deduplication, completion and streak rules; no state, effects, storage changes or animations were added.

The original flash SVGs from [Figma node 250:249](https://www.figma.com/design/nNOZmFF0M4viYBKPr4a6PX/Ya-pues?node-id=250-249) live in `assets/images/streak/`. Their original 23.2 × 23.2 and 19.3333 × 19.3333 dimensions are preserved. The caption uses the real streak count, with a prompt to start when it is zero. Existing profile totals and historical seven-day counts remain available.

## Invitation in step 3

`TaskInvitation` appears below intensity. The “Añadir compañeros” field accepts a complete email and offers a selectable suggestion to add it. Enter or the + button adds it as well. Added companions appear as removable rows with initials, alongside a generic “Tú · Organizador” row. Email validation, normalization, and case-insensitive deduplication apply only to this invitation UI. The component does not search a contact directory or invent contact records.

“Invitar por correo” opens a `mailto:` draft through the already installed `expo-linking`, using the added companions as recipients and the current task title in the subject and message. The user reviews and sends through their mail app. The component reports validation/opening errors and never claims the mail was sent. Existing step-3 props, title/intensity handlers, task deadline/title/signature validation, and Continue action are unchanged.

## Task companion avatars

Companions now belong to the task draft and are saved with the task as an optional `companions` array. Each entry contains an email and an optional future profile `avatarUri`. The existing storage keys are retained, old tasks without companions continue to load, and a fresh draft starts with an empty list. The new companion data is validated and normalized before saving; existing completion and streak behavior is unchanged.

`CompanionAvatar` renders initials now, as requested. It also supports a future profile photo and returns to initials if that image fails. `CompanionAvatars` adds a compact, accessible group at the bottom right of a task card: up to two avatars and a +N badge for additional companions. The same avatar is reused in the step-3 list. No profile photo is fabricated or looked up from an external service. The completion action remains available beside the group, wrapping on narrow screens.
