const assert = require('node:assert/strict');
const test = require('node:test');
const { createSourceLoader } = require('./helpers/loadSource.cjs');

const task = { id: 'task-1', title: 'Preparar presentación', dueDate: '2099-12-05',
  dueTime: '18:00', createdAt: '2099-12-01T12:00:00.000Z' };

function harness() {
  const pending = new Map();
  let savedTasks = [];
  let granted = true;
  let enabled = true;
  let importance = 5;
  const load = createSourceLoader({
    'react-native': { Platform: { OS: 'android' } },
    'expo-notifications': {
      AndroidImportance: { NONE: 0 },
      SchedulableTriggerInputTypes: { DATE: 'date' },
      async getPermissionsAsync() { return { granted }; },
      async getNotificationChannelAsync() { return { importance }; },
      async getAllScheduledNotificationsAsync() { return [...pending.values()]; },
      async cancelScheduledNotificationAsync(id) { pending.delete(id); },
      async scheduleNotificationAsync(entry) {
        assert.equal(pending.has(entry.identifier), false, 'duplicate scheduling request');
        pending.set(entry.identifier, entry);
      },
    },
    '@/notifications/notifications': {},
    '@/notifications/webReminders': {},
    '@/storage/data': { loadTasks: async () => savedTasks, loadCompletions: async () => [] },
    '@/storage/preferences': { loadTaskRemindersEnabled: async () => enabled },
  });
  return {
    pending,
    reminders: load('notifications/taskReminders'),
    tasks: load('utils/tasks'),
    save(tasks) { savedTasks = tasks; },
    disable() { enabled = false; },
    deny() { granted = false; },
    blockChannel() { importance = 0; },
  };
}

test('a new task defaults to the deadline only; all advance options use the expected date and title', async () => {
  const h = harness();
  const options = [
    [h.tasks.createTaskDraft().advanceReminder, null],
    [{ kind: 'five' }, '2099-12-05T17:55:00'],
    [{ kind: 'ten' }, '2099-12-05T17:50:00'],
    [{ kind: 'days', days: 2 }, '2099-12-03T18:00:00'],
  ];
  for (const [advanceReminder, advanceDate] of options) {
    await h.reminders.scheduleTaskReminders({ ...task, advanceReminder }, { replace: true });
    assert.equal(h.pending.size, advanceDate ? 2 : 1);
    assert.equal(+h.pending.get('task-1/due').trigger.date, +new Date('2099-12-05T18:00:00'));
    if (advanceDate) {
      assert.equal(+h.pending.get('task-1/advance').trigger.date, +new Date(advanceDate));
    }
    for (const entry of h.pending.values()) {
      assert.ok(entry.content.title.includes(task.title));
      assert.equal(entry.trigger.channelId, 'default');
    }
  }
});

test('editing replaces previous alerts and a stale sync cannot reschedule a deleted task', async () => {
  const h = harness();
  await h.reminders.scheduleTaskReminders(task);
  assert.equal(h.pending.size, 4);
  const update = { ...task, dueDate: '2099-12-06', dueTime: '19:00', advanceReminder: { kind: 'ten' } };
  h.save([update]);
  await Promise.all([
    h.reminders.scheduleTaskReminders(update, { replace: true }),
    h.reminders.syncTaskReminders([task], []),
    h.reminders.scheduleSavedTaskReminders(task.id),
  ]);
  assert.deepEqual([...h.pending.keys()], ['task-1/due', 'task-1/advance']);
  assert.equal(+h.pending.get('task-1/advance').trigger.date, +new Date('2099-12-06T18:50:00'));
  h.save([]);
  await h.reminders.cancelTaskReminders(task.id);
  await h.reminders.syncTaskReminders([update], []);
  assert.equal(h.pending.size, 0);
});

test('validation rejects an expired advance time and invalid day counts', () => {
  const h = harness();
  const now = +new Date('2099-12-05T17:55:00');
  assert.throws(() => h.tasks.validateAdvanceReminder({ ...task, advanceReminder: { kind: 'five' } }, now),
    h.tasks.ExpiredAdvanceReminderError);
  assert.doesNotThrow(() => h.tasks.validateAdvanceReminder({ ...task, advanceReminder: { kind: 'none' } }, now));
  for (const days of [0, -1, 1.5, Infinity]) {
    assert.throws(() => h.tasks.validateAdvanceReminder({ ...task, advanceReminder: { kind: 'days', days } }, now),
      /número entero/);
  }
});

test('the scheduler reports app, system and Android channel settings and leaves no old alerts after editing', async () => {
  for (const [restrict, status] of [['disable', 'disabled'], ['deny', 'denied'], ['blockChannel', 'denied']]) {
    const h = harness();
    const reminder = { ...task, advanceReminder: { kind: 'five' } };
    await h.reminders.scheduleTaskReminders(reminder);
    h[restrict]();
    assert.equal(await h.reminders.taskReminderAvailability(), status);
    await h.reminders.scheduleTaskReminders(reminder, { replace: true });
    assert.equal(h.pending.size, 0);
  }
});
