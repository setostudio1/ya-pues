// Acceptance workflow using the installed AsyncStorage backend in a fresh process.
const path = require('node:path');

global.window = { localStorage: global.localStorage };
const root = process.argv[2];
const action = process.argv[3];
const storage = require(path.join(root, 'storage/data.js'));
const { createTaskDraft, calculateProgress, today } = require(path.join(root, 'utils/tasks.js'));

function draft(id, daysAhead) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return { ...createTaskDraft(), id, title: `Tarea ${id}`, signedBy: 'Sofi',
    dueDate: today(date), dueTime: '18:30' };
}

async function run() {
  if (action === 'create') {
    await storage.addTask({ ...draft('taller', 1), title: '  Entrega de taller 🎨  ', intensity: 'high', proofType: 'video',
      signedBy: '  María José  ', signatureMode: 'image', signatureImageUri: 'https://example.com/firma.png',
      companions: [{ email: 'Seto@EJEMPLO.COM', avatarUri: 'https://example.com/seto.png' }] });
    await storage.addTask({ ...draft('animacion', 2), title: 'Preparar animación', proofType: 'timelapse' });
  } else if (action === 'complete-first') {
    await storage.recordCompletion('taller');
  } else if (action === 'complete-second') {
    await storage.recordCompletion('animacion');
  } else if (action === 'append') {
    await storage.addTask(draft('tercera', 3));
  } else if (action !== 'read') {
    throw new Error(`Unknown practice action: ${action}`);
  }
  const tasks = await storage.loadTasks();
  const completions = await storage.loadCompletions();
  // Anchor the summary to the saved action's date so crossing midnight during
  // this test cannot change a snapshot unrelated to persistence.
  const reference = completions.length ? new Date(completions[0].createdAt) : new Date();
  console.log(JSON.stringify({ tasks, completions, progress: calculateProgress(tasks, completions, reference) }));
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
