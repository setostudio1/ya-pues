# Persist tasks, completions and streak progress

Tasks previously disappeared because the screens only navigated between titles.
The creation flow now collects task data and awaits AsyncStorage before showing
success. Inicio reloads the task list on focus, records one completion per task,
and Racha calculates progress and consecutive active days from saved data.

The storage contract uses two namespaced JSON collections and serializes mutation
helpers to prevent lost updates. Failed writes preserve the draft; invalid saved
data is reported without silently clearing it. Loading, empty and retry states
are provided for both read screens.

Validation: `npm test` covers real AsyncStorage web persistence across process
restarts, preservation of existing entries, concurrency, duplicate actions, storage
failures, malformed data, local dates and streak calculations. All 11 tests,
Expo lint, TypeScript and web/Android/iOS exports passed. The close-and-reopen acceptance check in
`docs/storage.md` must be completed on a device or interactive browser.

Authentication, file uploads and scheduled device notifications remain outside
this persistence exercise. Add the actual issue references before publishing.
