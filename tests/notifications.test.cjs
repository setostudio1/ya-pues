const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

process.env.TZ = 'America/Santiago';
const root = path.join(__dirname, '../src/features/reminders');
function loader(overrides = {}) {
  const cache = new Map();
  return function load(name) {
    if (name in overrides) return overrides[name];
    const key = name.replace('./', '');
    if (cache.has(key)) return cache.get(key);
    const output = ts.transpileModule(fs.readFileSync(path.join(root, `${key}.ts`), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    const exported = {};
    cache.set(key, exported);
    vm.runInNewContext(output, { exports: exported, require: load, Date, Set, Map, Promise });
    return exported;
  };
}
const load = loader();
const plan = load('notificationPlan');
const { createNotificationEngine } = load('notificationEngine');
const now = new Date('2026-11-09T09:00:00').getTime();
function task(id = 'one', overrides = {}) {
  return { id, title: 'Preparar la entrega de Taller', dueDate: '2026-11-12', dueTime: '18:00',
    createdAt: new Date(now).toISOString(), signedBy: 'Sofi', ...overrides };
}
function fixture() {
  const state = { preferences: plan.defaultPreferences(), tasks: [task()], completions: [],
    permission: 'granted', now, pending: new Map(), schedules: 0, cancels: [], requests: 0, readError: false, scheduleError: false };
  const port = {
    now: () => state.now,
    readPreferences: async () => structuredClone(state.preferences),
    writePreferences: async (value) => { state.preferences = structuredClone(value); },
    loadTasks: async () => { if (state.readError) throw Error('corrupt tasks'); return state.tasks; },
    loadCompletions: async () => state.completions,
    permission: async (request) => { if (request) state.requests++; return state.permission; },
    pending: async () => Array.from(state.pending.values()),
    schedule: async (value) => {
      if (state.scheduleError) throw Error('OS failed');
      state.schedules++;
      state.pending.set(value.id, { id: value.id, signature: plan.notificationSignature(value), plan: value });
    },
    cancel: async (id) => { state.cancels.push(id); state.pending.delete(id); },
    dismissInactive: async (ids, enabled) => { state.activeIds = ids; state.tasksEnabled = enabled; },
  };
  return { state, port, engine: createNotificationEngine(port) };
}

test('task reminders use the four approved offsets in local time with real task data', () => {
  const entry = task();
  const due = new Date(2026, 10, 12, 18, 0).getTime();
  const prefs = { ...plan.defaultPreferences(), tasksEnabled: true };
  const result = plan.planNotifications([entry], [], prefs, now);
  assert.equal(result.length, 4);
  assert.deepEqual(Array.from(result, (p) => p.trigger.at), [due - 86400000, due - 7200000, due - 2700000, due - 900000]);
  assert.equal(plan.taskDueAt(entry), due);
  assert.ok(result.every((p) => p.payload.taskId === entry.id && p.body.includes('TALLER')));
  assert.equal(plan.taskReminder(entry, 'personal').displayName, 'Sofi');
});

test('near deadlines get one initial notice; completed, expired and elapsed offsets are omitted', () => {
  const prefs = { ...plan.defaultPreferences(), tasksEnabled: true };
  const entry = task('near', { dueDate: '2026-11-09', dueTime: '09:30' });
  let result = plan.planNotifications([entry], [], prefs, now);
  assert.deepEqual(Array.from(result, (p) => p.payload.variant), ['initial', 'personal']);
  assert.equal(result[0].trigger.at, now + 60000);
  result = plan.planNotifications([entry], [], prefs, now + 120000);
  assert.deepEqual(Array.from(result, (p) => p.payload.variant), ['personal']);
  assert.equal(plan.planNotifications([entry], [{ taskId: 'near' }], prefs, now).length, 0);
  assert.equal(plan.planNotifications([entry], [], prefs, now + 3600000).length, 0);
});

test('notification payloads reject unknown owners, missing tasks and arbitrary navigation values', () => {
  assert.equal(plan.parseNotificationPayload({ kind: 'task', taskId: 'one', variant: 'urgent' }), null);
  assert.equal(plan.parseNotificationPayload({ owner: plan.NOTIFICATION_OWNER, kind: 'task', taskId: '', variant: 'urgent' }), null);
  assert.equal(plan.parseNotificationPayload({ owner: plan.NOTIFICATION_OWNER, kind: 'task', taskId: 'one', variant: '/login' }), null);
  assert.equal(plan.parseNotificationPayload({ owner: plan.NOTIFICATION_OWNER, kind: 'task', taskId: 'one', variant: 'urgent' }).variant, 'urgent');
});

test('startup never asks permission; denied activation does not persist or schedule', async () => {
  const { state, engine } = fixture();
  state.permission = 'denied';
  await engine.sync();
  assert.equal(state.requests, 0);
  await assert.rejects(engine.setTasksEnabled(true), /Sin permiso/);
  assert.equal(state.preferences.tasksEnabled, false);
  assert.equal(state.pending.size, 0);
});

test('activation and restart reconcile idempotently without duplicate schedules', async () => {
  const { state, port, engine } = fixture();
  await engine.setTasksEnabled(true);
  assert.equal(state.pending.size, 4);
  await engine.sync();
  await createNotificationEngine(port).sync();
  assert.equal(state.schedules, 4);
  assert.equal(state.cancels.length, 0);
});

test('completion cancels only that task and clears its delivered notices', async () => {
  const { state, engine } = fixture();
  state.tasks.push(task('two'));
  await engine.setTasksEnabled(true);
  state.completions.push({ taskId: 'one' });
  await engine.sync();
  assert.equal(state.pending.size, 4);
  assert.ok(Array.from(state.pending.values()).every((entry) => entry.plan.payload.taskId === 'two'));
  assert.equal(state.activeIds.has('one'), false);
});

test('snooze replaces the follow-up with ten minutes, persists on restart and rejects expired/completed tasks', async () => {
  const { state, port, engine } = fixture();
  await engine.setTasksEnabled(true);
  await engine.snooze('one');
  assert.equal(state.pending.has(plan.taskNotificationId('one', 'initial')), false);
  let followUp = state.pending.get(plan.taskNotificationId('one', 'unstarted')).plan;
  assert.equal(followUp.trigger.at, now + 600000);
  state.now += 60000;
  await createNotificationEngine(port).snooze('one');
  followUp = state.pending.get(plan.taskNotificationId('one', 'unstarted')).plan;
  assert.equal(followUp.trigger.at, state.now + 600000);
  assert.equal(state.preferences.snoozes.length, 1);
  state.completions.push({ taskId: 'one' });
  await assert.rejects(engine.snooze('one'), /ya no está pendiente/);
  state.completions = [];
  state.now = plan.taskDueAt(state.tasks[0]) - 300000;
  await assert.rejects(engine.snooze('one'), /menos de 10 minutos/);
});

test('daily settings survive restart, replacement keeps one ID, invalid times cannot overwrite them, off cancels', async () => {
  const { state, port, engine } = fixture();
  await engine.setDaily({ hour: 23, minute: 59 });
  await engine.setDaily({ hour: 0, minute: 0 });
  const reloaded = await createNotificationEngine(port).sync();
  assert.equal(reloaded.preferences.daily.hour, 0);
  assert.equal(state.pending.size, 1);
  for (const daily of [{ hour: 24, minute: 0 }, { hour: 12, minute: 60 }, { hour: 1.5, minute: 0 }, { hour: NaN, minute: 0 }]) {
    await assert.rejects(engine.setDaily(daily), /hora de 0 a 23/);
  }
  await engine.setDaily(null);
  assert.equal(state.pending.size, 0);
});

test('switching tasks off leaves daily and unrelated schedules alone', async () => {
  const { state, engine } = fixture();
  state.pending.set('other-feature', { id: 'other-feature' });
  await engine.setTasksEnabled(true);
  await engine.setDaily({ hour: 20, minute: 0 });
  await engine.setTasksEnabled(false);
  assert.deepEqual(Array.from(state.pending.keys()).sort(), [plan.DAILY_ID, 'other-feature'].sort());
});

test('failed reads never cancel pending notices; failed scheduling can be retried', async () => {
  const { state, engine } = fixture();
  await engine.setTasksEnabled(true);
  state.readError = true;
  await assert.rejects(engine.sync(), /corrupt tasks/);
  assert.equal(state.pending.size, 4);
  state.readError = false;
  state.scheduleError = true;
  await assert.rejects(engine.setDaily({ hour: 8, minute: 30 }), /OS failed/);
  state.scheduleError = false;
  await engine.sync();
  assert.equal(state.pending.size, 5);
});

test('rapid operations serialize, preventing a stale activation from undoing cancellation', async () => {
  const { state, engine } = fixture();
  await Promise.all([engine.setTasksEnabled(true), engine.setTasksEnabled(false), engine.sync()]);
  assert.equal(state.preferences.tasksEnabled, false);
  assert.equal(state.pending.size, 0);
});

test('the nearest notices are capped below the device limit, including the daily notice', async () => {
  const { state, engine } = fixture();
  state.tasks = Array.from({ length: 30 }, (_, i) => task(String(i)));
  await engine.setDaily({ hour: 20, minute: 0 });
  const result = await engine.setTasksEnabled(true);
  assert.equal(result.scheduledCount, 60);
  assert.equal(result.eligibleCount, 121);
  assert.equal(state.pending.size, 60);
  assert.ok(state.pending.has(plan.DAILY_ID));
});

test('test schedules a real ten-second request without enabling daily or task notices', async () => {
  const { state, engine } = fixture();
  await engine.test();
  assert.equal(state.pending.get(plan.TEST_ID).plan.trigger.at, now + 10000);
  assert.equal(state.preferences.tasksEnabled, false);
  assert.equal(state.preferences.daily, null);
});

test('corrupt preferences reject instead of silently erasing settings', () => {
  for (const value of ['{', '{}', '{"tasksEnabled":true,"daily":{"hour":24,"minute":0},"snoozes":[]}',
    '{"tasksEnabled":true,"daily":null,"snoozes":[null]}']) {
    assert.throws(() => plan.parsePreferences(value));
  }
  assert.equal(plan.parsePreferences(null).tasksEnabled, false);
});

function nativeFixture() {
  const calls = [];
  let current = { granted: false, status: 'undetermined', canAskAgain: true };
  let answer = { granted: true, status: 'granted', canAskAgain: true };
  let last = null;
  let listener;
  const native = {
    IosAuthorizationStatus: { PROVISIONAL: 3, EPHEMERAL: 4 },
    AndroidImportance: { HIGH: 4 },
    AndroidAudioUsage: { NOTIFICATION: 5 },
    AndroidAudioContentType: { SONIFICATION: 4 },
    SchedulableTriggerInputTypes: { DAILY: 'daily', DATE: 'date' },
    setNotificationHandler: (handler) => calls.push(['handler', handler]),
    setNotificationChannelAsync: async (id, value) => calls.push(['channel', id, value]),
    getPermissionsAsync: async () => { calls.push(['permission']); return current; },
    requestPermissionsAsync: async () => { calls.push(['request']); return answer; },
    scheduleNotificationAsync: async (value) => { calls.push(['schedule', value]); return value.identifier; },
    getAllScheduledNotificationsAsync: async () => [],
    cancelScheduledNotificationAsync: async (id) => calls.push(['cancel', id]),
    getPresentedNotificationsAsync: async () => [],
    addNotificationResponseReceivedListener: (callback) => { listener = callback; return { remove: () => calls.push(['remove']) }; },
    getLastNotificationResponse: () => last,
    clearLastNotificationResponse: () => { calls.push(['clear']); last = null; },
  };
  const device = loader({ 'expo-notifications': native, 'react-native': { Platform: { OS: 'android' } } })('notificationDevice');
  return { calls, native, device, current: (value) => { current = value; }, answer: (value) => { answer = value; },
    last: (value) => { last = value; }, emit: (value) => listener(value) };
}

test('native adapter creates an Android channel before permission and accepts provisional iOS authorization', async () => {
  const { device, calls, current } = nativeFixture();
  assert.equal(await device.permission(false), 'undetermined');
  assert.equal(calls.some(([type]) => type === 'request'), false);
  assert.equal(await device.permission(true), 'granted');
  const requestIndex = calls.findIndex(([type]) => type === 'request');
  assert.ok(calls.findIndex(([type]) => type === 'channel') < requestIndex);
  current({ granted: false, status: 'undetermined', canAskAgain: true, ios: { status: 3 } });
  assert.equal(await device.permission(false), 'granted');
  current({ granted: false, status: 'denied', canAskAgain: false });
  const before = calls.length;
  assert.equal(await device.permission(true), 'denied');
  assert.equal(calls.slice(before).some(([type]) => type === 'request'), false);
});

test('native adapter sends actual date/daily triggers with a stable cancellation ID and foreground presentation', async () => {
  const { device, calls } = nativeFixture();
  const requests = plan.planNotifications([task()], [], { tasksEnabled: true, daily: { hour: 8, minute: 30 }, snoozes: [] }, now);
  for (const value of requests) await device.schedule(value);
  const scheduled = calls.filter(([type]) => type === 'schedule').map(([, value]) => value);
  assert.equal(scheduled[0].identifier, plan.DAILY_ID);
  assert.equal(scheduled[0].trigger.type, 'daily');
  assert.equal(scheduled[0].trigger.hour, 8);
  assert.equal(scheduled[1].trigger.type, 'date');
  assert.equal(scheduled[1].trigger.date, requests[1].trigger.at);
  assert.equal(scheduled[1].content.data.taskId, 'one');
  assert.ok(scheduled.every((request) => request.trigger.channelId === 'task-reminders-v2'));
  assert.ok(scheduled.every((request) => request.content.data.channelVersion === 2));
  const behavior = await calls.find(([type]) => type === 'handler')[1].handleNotification();
  assert.equal(behavior.shouldShowBanner, true);
  await device.cancel(scheduled[1].identifier);
  assert.equal(calls.at(-1)[1], scheduled[1].identifier);
});

test('Android channel creation supplies non-null audio attributes for the explicit default sound', async () => {
  const { device, native, calls } = nativeFixture();
  native.setNotificationChannelAsync = async (id, options) => {
    // Model a native runtime that rejects the nullable audio attributes passed
    // by the explicit-sound path. This does not execute Android native code.
    if (options.sound && !options.audioAttributes) throw new Error('NullPointerException: audioAttributes');
    assert.equal(id, 'task-reminders-v2');
    assert.equal(options.sound, 'default');
    assert.equal(options.audioAttributes.usage, native.AndroidAudioUsage.NOTIFICATION);
    assert.equal(options.audioAttributes.contentType, native.AndroidAudioContentType.SONIFICATION);
    assert.equal(options.audioAttributes.flags.enforceAudibility, false);
    assert.equal(options.audioAttributes.flags.requestHardwareAudioVideoSynchronization, false);
    calls.push(['channel', id, options]);
  };
  assert.equal(await device.permission(false), 'undetermined');
  assert.equal(calls.some(([type]) => type === 'request'), false);
  assert.equal(await device.permission(true), 'granted');
});

test('existing task requests migrate to the new Android channel without changing task IDs', async () => {
  const { device, native, calls } = nativeFixture();
  const initial = plan.planNotifications([task()], [], { tasksEnabled: true, daily: null, snoozes: [] }, now)[0];
  const signature = plan.notificationSignature(initial);
  let upgraded = false;
  native.getAllScheduledNotificationsAsync = async () => [{ identifier: initial.id,
    content: { data: { signature, ...(upgraded ? { channelVersion: 2 } : {}) } } }];
  assert.equal((await device.pending())[0].signature, undefined);
  await device.cancel(initial.id);
  await device.schedule(initial);
  assert.equal(calls.find(([type]) => type === 'cancel')[1], initial.id);
  assert.equal(calls.find(([type]) => type === 'schedule')[1].trigger.channelId, 'task-reminders-v2');
  upgraded = true;
  assert.equal((await device.pending())[0].signature, signature);
});

test('notification taps handle cold launch once, accept later occurrences of the same ID and remove the listener', () => {
  const fixture = nativeFixture();
  const response = (date) => ({ notification: { date, request: { identifier: 'same-id',
    content: { data: { owner: plan.NOTIFICATION_OWNER, kind: 'daily' } } } } });
  const first = response(now);
  fixture.last(first);
  const opened = [];
  const stop = fixture.device.observeResponses((data) => opened.push(data));
  fixture.emit(first);
  fixture.emit(response(now + 86400000));
  assert.equal(opened.length, 2);
  assert.equal(fixture.calls.filter(([type]) => type === 'clear').length, 2);
  stop();
  assert.equal(fixture.calls.at(-1)[0], 'remove');
});

test('the web adapter does not import any native notification module or claim to schedule', async () => {
  const device = loader()('notificationDevice.web');
  assert.equal(await device.permission(true), 'unsupported');
  await assert.rejects(device.schedule({}), /Android e iOS/);
  const { state, engine } = fixture();
  state.permission = 'unsupported';
  state.readError = true;
  assert.equal((await engine.sync()).permission, 'unsupported');
});
