const assert = require('node:assert/strict');
const test = require('node:test');
const { createSourceLoader } = require('./helpers/loadSource.cjs');

const TASKS_KEY = 'ya-pues:tasks:v1';
const COMPLETIONS_KEY = 'ya-pues:completions:v1';
const draft = (id = 'task-1') => ({
  id, title: 'Preparar presentación', description: 'Revisar diapositivas',
  dueDate: '2099-12-05', dueTime: '18:00', calendar: { id: 'personal', title: 'Personal' },
  intensity: 'low', proofType: 'photo', signedBy: 'Ana', signatureMode: 'signature',
  signatureImageUri: '', companions: [{ email: 'amiga@example.com' }],
});

function harness(os = 'ios') {
  const values = new Map();
  const events = new Map();
  let granted = true;
  let canAskAgain = true;
  let requestAnswer = false;
  let requests = 0;
  let reads = 0;
  let creates = 0;
  let unavailable = false;
  const choices = [
    { id: 'personal', title: 'Personal', allowsModifications: true, source: { name: 'iCloud' } },
    { id: 'work', title: 'Trabajo', allowsModifications: true, isSynced: true, ownerAccount: 'ana@example.com' },
    { id: 'readonly', title: 'Festivos', allowsModifications: false },
    { id: 'disabled', title: 'Desactivado', allowsModifications: true, isSynced: false },
  ];
  function eventObject(event) {
    return {
      ...event,
      async update(details) { Object.assign(event, details); },
      async delete() { events.delete(event.id); },
    };
  }
  choices.forEach((choice) => {
    choice.createEvent = async (details) => {
      const event = { ...details, calendarId: choice.id, id: `event-${++creates}` };
      events.set(event.id, event);
      return eventObject(event);
    };
  });
  const calendar = {
    EntityTypes: { EVENT: 'event' },
    async getCalendarPermissions() {
      reads++;
      if (unavailable) throw new Error('native module unavailable');
      return { granted, canAskAgain };
    },
    async requestCalendarPermissions(...args) {
      assert.deepEqual(args, []); // Full access, never write-only or reminders.
      requests++;
      granted = requestAnswer;
      return { granted, canAskAgain };
    },
    async getCalendars(entity) { assert.equal(entity, 'event'); return choices; },
    async listEvents(ids, start, end) {
      return [...events.values()]
        .filter((event) => ids.includes(event.calendarId) && event.startDate <= end && event.endDate >= start)
        .map(eventObject);
    },
    ExpoCalendarEvent: {
      async get(id) {
        if (!events.has(id)) throw Object.assign(new Error('missing event'), { code: 'ERR_EVENT_NOT_FOUND' });
        return eventObject(events.get(id));
      },
    },
  };
  const storage = {
    async getItem(key) { return values.get(key) ?? null; },
    async setItem(key, value) { values.set(key, value); },
  };
  const load = createSourceLoader({
    '@react-native-async-storage/async-storage': storage,
    'react-native': { Platform: { OS: os } },
    'expo-calendar': calendar,
  });
  return {
    data: load('storage/data'),
    device: load('calendar/deviceCalendar'),
    status: load('calendar/syncStatus'),
    values, events,
    get creates() { return creates; },
    get requests() { return requests; },
    get reads() { return reads; },
    deny(askAgain = true) { granted = false; canAskAgain = askAgain; },
    allow() { granted = true; },
    grantOnRequest() { requestAnswer = true; },
    unavailable() { unavailable = true; },
    stored() { return JSON.parse(values.get(TASKS_KEY) ?? '[]'); },
  };
}

for (const os of ['ios', 'android']) {
  test(`${os}: selection requests access only on demand and excludes incompatible calendars`, async () => {
    const h = harness(os);
    h.deny();
    h.grantOnRequest();
    assert.equal(h.requests, 0);
    const choices = await h.device.selectDeviceCalendars();
    assert.deepEqual(choices.map((entry) => entry.id), ['personal', 'work']);
    assert.equal(h.requests, 1);
  });
}

test('advance reminder preferences survive creation, editing and reload', async () => {
  const h = harness('android');
  const input = { ...draft(), advanceReminder: { kind: 'days', days: 2 } };
  await h.data.addTask(input, 'ana');
  assert.deepEqual((await h.data.loadTasks('ana'))[0].advanceReminder, input.advanceReminder);
  await h.data.updateTask(input.id, { advanceReminder: { kind: 'none' } });
  assert.deepEqual((await h.data.loadTasks('ana'))[0].advanceReminder, { kind: 'none' });
});

test('a permanent permission denial does not prompt again', async () => {
  const h = harness();
  h.deny(false);
  await assert.rejects(h.device.selectDeviceCalendars(), /Sin permiso/);
  assert.equal(h.requests, 0);
});

test('permission denial still saves the task; restoring access creates exactly one event', async () => {
  const h = harness();
  h.deny();
  await h.data.addTask(draft(), 'ana');
  assert.equal((await h.data.loadTasks('ana')).length, 1);
  assert.equal(h.creates, 0);
  assert.equal(h.requests, 0);
  assert.match(h.status.getCalendarSyncStatus(), /pendiente/);
  h.allow();
  await h.data.syncTaskCalendars('ana');
  await h.data.syncTaskCalendars('ana');
  assert.equal(h.creates, 1);
  assert.equal(h.status.getCalendarSyncStatus(), '');
});

test('simultaneous add calls are serialized and do not duplicate a task or its event', async () => {
  const h = harness();
  await Promise.all([h.data.addTask(draft(), 'ana'), h.data.addTask(draft(), 'ana')]);
  assert.equal(h.stored().length, 1);
  assert.equal(h.creates, 1);
});

test('web creates, edits and removes tasks without accessing native calendar APIs', async () => {
  const h = harness('web');
  await assert.rejects(h.device.selectDeviceCalendars(), /Android e iOS/);
  const task = await h.data.addTask({ ...draft(), calendar: undefined }, 'ana');
  await h.data.updateTask(task.id, { title: 'Título editado', description: 'Detalle', dueDate: task.dueDate, dueTime: task.dueTime, intensity: task.intensity });
  await h.data.deleteTask(task.id);
  assert.equal((await h.data.loadTasks('ana')).length, 0);
  assert.equal(h.reads, 0);
  assert.equal(h.creates, 0);
});

test('native module unavailability never prevents saving or completing a task', async () => {
  const h = harness();
  h.unavailable();
  await h.data.addTask(draft(), 'ana');
  await h.data.recordCompletion('task-1');
  assert.equal((await h.data.loadCompletions()).length, 1);
  assert.equal((await h.data.loadTasks('ana')).length, 1);
  assert.equal(h.creates, 0);
});

test('editing the deadline keeps the event ID, owner, signature, evidence and companions', async () => {
  const h = harness();
  const task = await h.data.addTask(draft(), 'ana');
  const eventId = h.stored()[0].calendarSync.eventId;
  await h.data.updateTask(task.id, { title: 'Nuevo título', description: 'Nuevo detalle', dueDate: '2099-12-06', dueTime: '09:00', intensity: 'high' });
  const updated = (await h.data.loadTasks('ana'))[0];
  assert.equal(h.creates, 1);
  assert.equal(h.stored()[0].calendarSync.eventId, eventId);
  assert.equal(h.events.get(eventId).title, 'Nuevo título');
  assert.equal(updated.ownerId, 'ana');
  assert.equal(updated.signedBy, task.signedBy);
  assert.equal(updated.signatureMode, task.signatureMode);
  assert.equal(updated.signatureImageUri, task.signatureImageUri);
  assert.equal(updated.proofType, task.proofType);
  assert.deepEqual(updated.companions, task.companions);
  assert.equal(updated.createdAt, task.createdAt);
});

test('deleting while permissions are revoked hides the task and retries event removal later', async () => {
  const h = harness();
  await h.data.addTask(draft(), 'ana');
  h.deny();
  await h.data.deleteTask('task-1');
  assert.equal((await h.data.loadTasks('ana')).length, 0);
  assert.ok(h.stored()[0].calendarDeletedAt);
  assert.equal(h.events.size, 1);
  // Adding another task must not overwrite the hidden deletion checkpoint.
  await h.data.addTask({ ...draft('task-2'), calendar: undefined }, 'ana');
  h.allow();
  await h.data.syncTaskCalendars('ana');
  assert.equal(h.events.size, 0);
  assert.deepEqual(h.stored().map((task) => task.id), ['task-2']);
});

test('archiving a completed task deletes its event but retains completion and streak history', async () => {
  const h = harness();
  await h.data.addTask(draft(), 'ana');
  await h.data.recordCompletion('task-1');
  const history = h.values.get(COMPLETIONS_KEY);
  await h.data.deleteTask('task-1');
  assert.equal(h.events.size, 0);
  assert.ok(h.stored()[0].archivedAt);
  assert.equal(h.stored()[0].calendarDeletedAt, undefined);
  assert.equal(h.values.get(COMPLETIONS_KEY), history);
  assert.equal((await h.data.loadTasks('ana')).length, 1);
});

test('foreground synchronization only processes the current user and legacy tasks', async () => {
  const h = harness();
  h.deny();
  await h.data.addTask(draft('ana-task'), 'ana');
  await h.data.addTask(draft('bea-task'), 'bea');
  h.allow();
  await h.data.syncTaskCalendars('ana');
  assert.equal(h.creates, 1);
  assert.ok(h.stored().find((task) => task.id === 'ana-task').calendarSync.eventId);
  assert.equal(h.stored().find((task) => task.id === 'bea-task').calendarSync, undefined);
});
