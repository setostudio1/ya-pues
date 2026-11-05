# Que tu app recuerde - Ya pues

## Team contract (checkpoint 3)

- Things: tasks with a title, deadline, intensity, proof type and signed commitment.
- Action: complete one saved task once; record its ID and the local completion day.
- Summary: pending/completed totals, percentage, seven-day activity and current streak.
- All three roles from checkpoint 4 are implemented in this project.

`src/storage/data.ts` is the single persistence entry point. Screens never import
AsyncStorage directly. It uses AsyncStorage 2.2.0, selected by `expo install` for
SDK 57, and JSON strings as required by the practice.

| Type / function | Purpose |
| --- | --- |
| `Task` | A saved task: ID, title, deadline date/time, intensity, proof type, signer's name, signature mode, optional image URL and creation time. |
| `TaskDraft` | The same form data before it is saved; shared between steps in context. |
| `TaskCompletion` | An action: unique ID, saved task ID, local `YYYY-MM-DD` date and timestamp. |
| `loadTasks()` | Reads and validates the task array; returns an empty array only when no data exists; sorts newest first. |
| `saveTasks(tasks)` | Validates and saves the complete task array as JSON. |
| `loadCompletions()` | Reads and validates the completion array. |
| `saveCompletions(completions)` | Saves the complete completion array as JSON. |
| `today()` | Formats the device's local day, with zero-padded month and day. |
| `addTask(draft)` | Loads the current list, validates the draft, prepends it, awaits the write, then returns the saved task. |
| `recordCompletion(taskId)` | Checks that the task exists, records today's date and saves the full log; returns the original entry on a repeated tap. |

Storage keys are `ya-pues:tasks:v1` and `ya-pues:completions:v1`. The mutation helpers
serialize read-modify-write operations within the app so simultaneous taps do not
replace earlier entries. Draft IDs also make creation retries idempotent.
Read failures, malformed JSON and invalid stored shapes are reported rather than
replaced with empty data. A failed save keeps the draft available for retry.

## Where each role is implemented (checkpoint 4)

- Create: `set-date`, `set-time`, `set-task` and `set-proof` edit a shared draft.
  The date route mounts the original `SetDate.tsx` / `DatePickerColumn.tsx`
  recovered from `feature/screen-set-date` (commit `de8b769`). Date and time use
  scrolling columns. Task entry follows the teacher's `SafeAreaView` / `StepLabel`
  / `FillForm` / `SetIntensity` / `Button` composition, preserving the shared draft.
  New tasks default to Leve; the stored values remain low/medium/high.
  Day counts adjust to the selected month and year, including leap years.
  `sign.tsx` awaits `addTask` before opening the confirmation and resetting it.
  The name acts as the typed signature. Image mode stores a user-entered image
  URL; it does not upload a file or capture a handwritten signature.
- List and action: `(tabs)/index.tsx` uses `useStoredTasks`, renders the newest
  tasks first in a `FlatList`, and awaits `recordCompletion` on Completar tarea.
- Summary: `(tabs)/streak.tsx` loads both collections through the same hook and
  calculates all displayed counts from saved records.
- Refresh: `useStoredTasks.ts` uses `useFocusEffect` with `useCallback`, including
  cancellation of stale reads after blur. Returning from creation or another tab
  refreshes the list and summary. Both screens show loading, empty and error states.

A task is completed once, not once per day. Several tasks on one day count as
one streak day. A streak extends through today, or through yesterday if no task
has been completed today. A missed day breaks it. Calendar-day arithmetic uses
local dates, including daylight-saving changes. Unknown task IDs and duplicate
records do not inflate the summary.

Committed tasks and completions survive restart. An unfinished draft is in-memory
form state and is not committed until Firmar y guardar tarea succeeds.

## Persistence check (checkpoint 5)

```sh
npm test
npx expo lint
npx tsc --noEmit
npx expo export --platform web --platform android --platform ios --max-workers 1
```

The automated test uses the installed AsyncStorage web implementation and a
separate, temporary Web Storage database. It creates tasks and completions,
exits the process, starts a new process, and reads exactly the same records.
It then adds another task and checks that older data is still present after
another restart. Test data never touches the user's app storage.

Additional tests cover concurrency, duplicate actions, invalid drafts, malformed
storage, read/write failures, orphaned records, local dates, streak gaps and progress.

Verified for this implementation: all 11 automated tests, Expo lint, TypeScript,
static web export (20 routes including router-generated routes), and Android/iOS
Hermes bundle generation passed.

Finish the acceptance check on a phone or browser:

1. Create two tasks using different titles and deadlines. Confirm both appear,
   with the latest first; reopen the tabs without restarting.
2. Complete one. Check its completed state, one pending task and 50% progress.
3. Fully close Expo Go, or reload the browser with F5, then reopen the same app.
4. Check that both tasks, the completion and the summary remain unchanged.
5. Complete the other task; verify 100% progress and no duplicate completion.
6. For a streak longer than one day, repeat on consecutive local days.

An emulator/device restart test is separate from bundle generation. Browser UI
testing was unavailable in the agent environment; automated persistence testing
uses the real web storage backend across independent processes instead.

The GitHub PR, teammate approval and merge into `main` remain team workflow steps.
The implementation is on `feature/storage`; no issue numbers are assumed.
