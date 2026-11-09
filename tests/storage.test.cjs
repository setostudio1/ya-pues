const assert = require('node:assert/strict');
const { after, beforeEach, test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const ts = require('typescript');

const projectRoot = path.resolve(__dirname, '..');
const expoRoot = path.join(projectRoot, '.expo');
fs.mkdirSync(expoRoot, { recursive: true });
const tempRoot = fs.mkdtempSync(path.join(expoRoot, 'storage-test-'));
for (const file of ['utils/invitations', 'utils/companions', 'utils/tasks', 'utils/pickers', 'storage/data']) {
  const source = fs.readFileSync(path.join(projectRoot, 'src', file + '.ts'), 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const target = path.join(tempRoot, file + '.js');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, output);
}

const storage = require(path.join(tempRoot, 'storage/data.js'));
const { today, createTaskDraft, buildTask, calculateProgress, isDateKey, isTime } = require(path.join(tempRoot, 'utils/tasks.js'));
const { getPickerDate, updatePickerDate } = require(path.join(tempRoot, 'utils/pickers.js'));
const { normalizeTaskCompanions, companionInitials } = require(path.join(tempRoot, 'utils/companions.js'));
let saved;
let failWrite;
let failRead;

beforeEach(() => {
  saved = new Map();
  failWrite = false;
  failRead = false;
  global.window = { localStorage: {
    getItem(key) { if (failRead) throw new Error('Read failed'); return saved.get(key) ?? null; },
    setItem(key, value) { if (failWrite) throw new Error('Disk full'); saved.set(key, value); },
  } };
});

after(() => {
  // Only remove the uniquely created test directory inside this workspace.
  const resolved = path.resolve(tempRoot);
  assert.ok(resolved.startsWith(expoRoot + path.sep) && path.basename(resolved).startsWith('storage-test-'));
  fs.rmSync(resolved, { recursive: true, force: true });
});

function draft(id, title = 'Hacer la tarea') {
  return { ...createTaskDraft(), id, title, signedBy: 'Sofi' };
}

test('empty storage loads both collections without writing defaults', async () => {
  assert.deepEqual(await storage.loadTasks(), []);
  assert.deepEqual(await storage.loadCompletions(), []);
  assert.equal(saved.size, 0);
});

test('date wheels preserve valid dates when changing month or leap year', () => {
  assert.deepEqual(getPickerDate('2026-11-21'), { year: 2026, month: 10, day: 21 });
  assert.equal(updatePickerDate('2026-01-31', { month: 1 }), '2026-02-28');
  assert.equal(updatePickerDate('2028-01-31', { month: 1 }), '2028-02-29');
  assert.equal(updatePickerDate('2028-02-29', { year: 2029 }), '2029-02-28');
  assert.equal(updatePickerDate('2026-01-31', { month: 3 }), '2026-04-30');
  assert.equal(updatePickerDate('2026-12-31', { year: 2027, month: 0 }), '2027-01-31');
  assert.ok(isDateKey(updatePickerDate('not a date', { day: 31, month: 1 })));
});

test('real AsyncStorage persists both collections across process restarts and preserves older data', () => {
  const file = path.join(tempRoot, 'localstorage.db');
  const fixture = path.join(__dirname, 'fixtures/persistence.cjs');
  function run(mode) {
    return JSON.parse(execFileSync(process.execPath,
      ['--experimental-webstorage', '--localstorage-file=' + file, fixture, tempRoot, mode],
      { encoding: 'utf8', env: { ...process.env, NODE_NO_WARNINGS: '1' }, stdio: ['pipe', 'pipe', 'pipe'] }));
  }
  const original = run('seed');
  assert.equal(original.tasks.length, 1);
  assert.equal(Object.hasOwn(original.tasks[0], 'companions'), false);
  assert.equal(original.completions[0].taskId, original.tasks[0].id);
  assert.equal(original.completions[0].date, today());
  assert.deepEqual(run('read'), original);
  const appended = run('append');
  assert.equal(appended.tasks.length, 2);
  assert.equal(appended.tasks[0].id, 'second-task');
  assert.deepEqual(appended.tasks[0].companions, [{ email: 'compa@ejemplo.com' }]);
  assert.deepEqual(appended.tasks[1], original.tasks[0]);
  assert.equal(appended.completions.length, 2);
  assert.deepEqual(run('read'), appended);
});

test('companions persist on their own task and do not leak into a fresh draft', async () => {
  const companions = [{ email: '  Santiago@EJEMPLO.COM ' }, { email: 'santiago@ejemplo.com' },
    { email: 'sergio@ejemplo.com', avatarUri: 'https://example.com/sergio.png' }];
  await storage.addTask({ ...draft('shared'), companions });
  await storage.addTask(draft('solo'));
  const tasks = await storage.loadTasks();
  assert.deepEqual(tasks.find((task) => task.id === 'shared').companions, [
    { email: 'Santiago@ejemplo.com' },
    { email: 'sergio@ejemplo.com', avatarUri: 'https://example.com/sergio.png' },
  ]);
  assert.deepEqual(tasks.find((task) => task.id === 'solo').companions, []);
  assert.deepEqual(createTaskDraft().companions, []);
  await storage.recordCompletion('shared');
  assert.equal((await storage.loadTasks()).find((task) => task.id === 'shared').companions.length, 2);
});

test('invalid companion data is rejected without overwriting previous tasks', async () => {
  await storage.addTask(draft('original'));
  const before = [...saved.entries()];
  for (const companions of ['invalid', [{}], [{ email: 'not an email' }],
    [{ email: 'a@ejemplo.com', avatarUri: 'javascript:alert(1)' }]]) {
    await assert.rejects(storage.addTask({ ...draft('invalid'), companions }));
    assert.deepEqual([...saved.entries()], before);
  }
  const key = [...saved.keys()][0];
  const corrupt = JSON.stringify([{ ...JSON.parse(saved.get(key))[0], companions: [{ email: 42 }] }]);
  saved.set(key, corrupt);
  await assert.rejects(storage.loadTasks());
  await assert.rejects(storage.addTask(draft('new')));
  assert.equal(saved.get(key), corrupt);
});

test('companion normalization preserves initials/photo fallback data without inventing identities', () => {
  assert.equal(companionInitials('santiago.rojas@ejemplo.com'), 'SR');
  assert.equal(companionInitials('seto@ejemplo.com'), 'S');
  assert.equal(companionInitials('sergio+trabajo@ejemplo.com'), 'ST');
  assert.deepEqual(normalizeTaskCompanions([{ email: 'a@EJEMPLO.COM' }]), [{ email: 'a@ejemplo.com' }]);
  assert.equal(normalizeTaskCompanions([{ email: 'a@ejemplo.com', avatarUri: 42 }]), null);
});

test('concurrent creation and repeated taps preserve every task and completion exactly once', async () => {
  const first = draft('one');
  await Promise.all([storage.addTask(first), storage.addTask(draft('two')), storage.addTask(first)]);
  assert.equal((await storage.loadTasks()).length, 2);
  await Promise.all([storage.recordCompletion('one'), storage.recordCompletion('one'), storage.recordCompletion('two')]);
  const log = await storage.loadCompletions();
  assert.equal(log.length, 2);
  assert.equal(new Set(log.map((entry) => entry.taskId)).size, 2);
  assert.ok(log.every((entry) => entry.date === today()));
});

test('a task cannot be completed without an existing saved task', async () => {
  await assert.rejects(storage.recordCompletion('missing'));
  assert.deepEqual(await storage.loadCompletions(), []);
});

test('corrupt JSON is reported and cannot be overwritten by creation', async () => {
  await storage.addTask(draft('one'));
  const key = [...saved.keys()][0];
  saved.set(key, '{broken');
  await assert.rejects(storage.loadTasks());
  await assert.rejects(storage.addTask(draft('two')));
  assert.equal(saved.get(key), '{broken');
});

test('wrong stored shapes are reported instead of pretending the collection is empty', async () => {
  await storage.addTask(draft('one'));
  const key = [...saved.keys()][0];
  saved.set(key, JSON.stringify([{ id: 'one' }]));
  await assert.rejects(storage.loadTasks());
  assert.equal(saved.get(key), JSON.stringify([{ id: 'one' }]));
});

test('read and write failures reject, preserve earlier tasks, and allow later retries', async () => {
  await storage.addTask(draft('one'));
  const before = [...saved.entries()];
  failRead = true;
  await assert.rejects(storage.loadTasks());
  await assert.rejects(storage.addTask(draft('two')));
  failRead = false;
  failWrite = true;
  await assert.rejects(storage.addTask(draft('two')));
  assert.deepEqual([...saved.entries()], before);
  failWrite = false;
  await storage.addTask(draft('two'));
  assert.equal((await storage.loadTasks()).length, 2);
});

test('completion write failures do not mark tasks completed', async () => {
  await storage.addTask(draft('one'));
  failWrite = true;
  await assert.rejects(storage.recordCompletion('one'));
  assert.deepEqual(await storage.loadCompletions(), []);
  failWrite = false;
  await storage.recordCompletion('one');
  assert.equal((await storage.loadCompletions()).length, 1);
});

test('draft validation rejects invalid dates, past deadlines, empty titles and missing signatures', () => {
  const now = new Date(2026, 10, 4, 12, 0);
  const valid = { ...createTaskDraft(now), title: '  Hacer tarea  ', signedBy: '  Sofi  ' };
  assert.equal(buildTask(valid, now).title, 'Hacer tarea');
  assert.equal(buildTask(valid, now).signedBy, 'Sofi');
  for (const update of [{ title: '' }, { signedBy: '' }, { dueDate: '2026-02-30' }, { dueTime: '24:00' },
    { dueDate: '2026-11-03' }, { signatureMode: 'image', signatureImageUri: '' }]) {
    assert.throws(() => buildTask({ ...valid, ...update }, now));
  }
  assert.ok(isDateKey('2028-02-29'));
  assert.ok(!isDateKey('2027-02-29'));
  assert.ok(isTime('23:59'));
  assert.ok(!isTime('7:05'));
});

test('local day and summaries handle timezone boundaries, gaps and duplicate or orphan records', () => {
  const now = new Date(2026, 10, 4, 12, 0);
  assert.equal(today(now), '2026-11-04');
  const tasks = ['a', 'b', 'c', 'd'].map((id) => ({ ...draft(id) }));
  const log = [
    { taskId: 'a', date: '2026-11-04' }, { taskId: 'a', date: '2026-11-04' },
    { taskId: 'b', date: '2026-11-04' }, { taskId: 'c', date: '2026-11-03' },
    { taskId: 'missing', date: '2026-11-02' },
  ];
  const summary = calculateProgress(tasks, log, now);
  assert.equal(summary.streak, 2);
  assert.equal(summary.todayCount, 2);
  assert.equal(summary.completed, 3);
  assert.equal(summary.pending, 1);
  assert.equal(summary.percentage, 75);
  assert.equal(summary.week.at(-1).count, 2);
  assert.equal(summary.week.length, 7);
  assert.equal(calculateProgress(tasks, [{ taskId: 'a', date: '2026-11-03' }], now).streak, 1);
  assert.equal(calculateProgress(tasks, [{ taskId: 'a', date: '2026-11-02' }], now).streak, 0);
  assert.equal(calculateProgress([], [], now).percentage, 0);
  const boundary = execFileSync(process.execPath, ['-e', `const {today}=require(${JSON.stringify(path.join(tempRoot, 'utils/tasks.js'))});process.stdout.write(today(new Date('2026-11-04T02:00:00Z')));`],
    { encoding: 'utf8', env: { ...process.env, TZ: 'America/Santiago' } });
  assert.equal(boundary, '2026-11-03');
});
