// Exercise the installed AsyncStorage web backend in separate processes.
const path = require('node:path');
global.window = { localStorage: global.localStorage };
const root = process.argv[2];
const mode = process.argv[3];
const storage = require(path.join(root, 'storage/data.js'));
const { createTaskDraft } = require(path.join(root, 'utils/tasks.js'));

async function run() {
  if (mode === 'seed' || mode === 'append') {
    const draft = { ...createTaskDraft(), id: mode === 'seed' ? 'first-task' : 'second-task',
      title: mode === 'seed' ? 'Primera tarea' : 'Segunda tarea', signedBy: 'Sofi' };
    if (mode === 'seed') delete draft.companions;
    else draft.companions = [{ email: 'compa@ejemplo.com' }];
    await storage.addTask(draft);
    await storage.recordCompletion(draft.id);
  }
  console.log(JSON.stringify({ tasks: await storage.loadTasks(), completions: await storage.loadCompletions() }));
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
