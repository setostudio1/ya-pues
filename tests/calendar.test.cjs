const assert = require('node:assert/strict');
const test = require('node:test');

const { createSourceLoader } = require('./helpers/loadSource.cjs');
const { reconcileTaskCalendar, taskCalendarMarker, taskEventDetails } = createSourceLoader()('calendar/taskCalendar');

const fixture = () => ({
  id: 'task-1', title: 'Preparar presentación', description: 'Revisar las diapositivas',
  dueDate: '2030-12-05', dueTime: '18:00', calendar: { id: 'personal', title: 'Personal' },
  intensity: 'low', proofType: 'photo', signedBy: 'Ana', signatureMode: 'signature',
  signatureImageUri: '', createdAt: '2030-12-01T12:00:00.000Z', ownerId: 'ana',
});

function harness(initial = fixture()) {
  let saved = structuredClone(initial);
  let writes = 0;
  let creates = 0;
  let updates = 0;
  let failWrite = 0;
  let failGet = false;
  let failDelete = false;
  let uncertainCreate = false;
  const events = new Map();
  const queries = [];
  function eventObject(event) {
    return {
      id: event.id,
      async update(details) { updates++; Object.assign(event, details); },
      async delete() {
        if (failDelete) throw new Error('provider unavailable');
        events.delete(event.id);
      },
    };
  }
  const device = {
    async getEvent(id) {
      if (failGet) throw new Error('access revoked');
      return events.has(id) ? eventObject(events.get(id)) : undefined;
    },
    async findEvents(calendarId, start, end, marker) {
      queries.push({ calendarId, start, end, marker });
      return [...events.values()]
        .filter((event) => event.calendarId === calendarId && event.notes.split('\n').includes(marker)
          && event.endDate >= start && event.startDate <= end)
        .map(eventObject);
    },
    async createEvent(calendarId, details) {
      const event = { ...details, id: `event-${++creates}`, calendarId };
      events.set(event.id, event);
      if (uncertainCreate) throw new Error('response lost after creating');
      return eventObject(event);
    },
  };
  return {
    events, queries, device,
    get saved() { return saved; },
    get creates() { return creates; },
    get updates() { return updates; },
    edit(changes) { saved = { ...saved, ...changes }; },
    failWriteAt(value) { failWrite = value; },
    denyAccess(value) { failGet = value; },
    failDeletion(value) { failDelete = value; },
    uncertainCreation(value) { uncertainCreate = value; },
    sync() {
      return reconcileTaskCalendar(structuredClone(saved), device, async (next) => {
        if (++writes === failWrite) throw new Error('disk full');
        saved = next ? structuredClone(next) : undefined;
      });
    },
  };
}

test('event uses title, description and local deadline, with no additional alarms', () => {
  const task = fixture();
  const details = taskEventDetails(task);
  assert.equal(details.title, task.title);
  assert.ok(details.notes.includes(task.description));
  assert.ok(details.notes.includes(taskCalendarMarker(task.id)));
  assert.equal(details.endDate.getHours(), 18);
  assert.equal(details.endDate.getDate(), 5);
  assert.equal(details.endDate - details.startDate, 30 * 60 * 1000);
  assert.deepEqual(details.alarms, []);
  assert.equal(details.allDay, false);
});

test('deadline near midnight crosses the previous day correctly', () => {
  const details = taskEventDetails({ ...fixture(), dueTime: '00:15' });
  assert.equal(details.startDate.getDate(), 4);
  assert.equal(details.startDate.getHours(), 23);
  assert.equal(details.startDate.getMinutes(), 45);
});

test('unlinked and legacy tasks do not create events', async () => {
  const h = harness({ ...fixture(), calendar: undefined, description: undefined });
  await h.sync();
  assert.equal(h.creates, 0);
  assert.equal(h.saved.calendarSync, undefined);
});

test('repeated reconciliation keeps a single event', async () => {
  const h = harness();
  await h.sync();
  const id = h.saved.calendarSync.eventId;
  await h.sync();
  assert.equal(h.creates, 1);
  assert.equal(h.updates, 0);
  assert.equal(h.saved.calendarSync.eventId, id);
});

test('editing updates the original event and preserves commitment fields', async () => {
  const h = harness();
  await h.sync();
  const id = h.saved.calendarSync.eventId;
  h.edit({ title: 'Terminar presentación', description: 'Añadir conclusiones', dueDate: '2030-12-07', dueTime: '09:00' });
  await h.sync();
  assert.equal(h.creates, 1);
  assert.equal(h.events.get(id).title, 'Terminar presentación');
  assert.ok(h.events.get(id).notes.includes('Añadir conclusiones'));
  assert.equal(h.events.get(id).endDate.getDate(), 7);
  assert.equal(h.events.get(id).endDate.getHours(), 9);
  assert.equal(h.saved.signedBy, 'Ana');
  assert.equal(h.saved.proofType, 'photo');
});

test('storage interruption after native creation is recovered without duplicating', async () => {
  const h = harness();
  h.failWriteAt(2);
  await assert.rejects(h.sync(), /disk full/);
  assert.equal(h.events.size, 1);
  assert.equal(h.saved.calendarSync.eventId, undefined);
  await h.sync();
  assert.equal(h.creates, 1);
  assert.equal(h.saved.calendarSync.eventId, 'event-1');
});

test('uncertain native creation is found in its original window after editing the deadline', async () => {
  const h = harness();
  h.uncertainCreation(true);
  await assert.rejects(h.sync(), /response lost/);
  h.edit({ dueDate: '2030-12-10', dueTime: '10:00' });
  h.uncertainCreation(false);
  await h.sync();
  assert.equal(h.creates, 1);
  assert.equal(h.queries[0].end.getDate(), 5);
  assert.equal(h.events.get('event-1').endDate.getDate(), 10);
});

test('failed checkpoint before native creation never creates an event', async () => {
  const h = harness();
  h.failWriteAt(1);
  await assert.rejects(h.sync());
  assert.equal(h.creates, 0);
});

test('permission or provider failures keep the link without creating another event', async () => {
  const h = harness();
  await h.sync();
  const id = h.saved.calendarSync.eventId;
  h.edit({ title: 'Nuevo título' });
  h.denyAccess(true);
  await assert.rejects(h.sync(), /access revoked/);
  assert.equal(h.saved.calendarSync.eventId, id);
  assert.equal(h.creates, 1);
  h.denyAccess(false);
  await h.sync();
  assert.equal(h.creates, 1);
  assert.equal(h.events.get(id).title, 'Nuevo título');
});

test('deletion retains a tombstone until the event is removed', async () => {
  const h = harness();
  await h.sync();
  h.edit({ calendarDeletedAt: '2030-12-02T00:00:00Z' });
  h.failDeletion(true);
  await assert.rejects(h.sync());
  assert.ok(h.saved.calendarDeletedAt);
  assert.equal(h.events.size, 1);
  h.failDeletion(false);
  await h.sync();
  assert.equal(h.events.size, 0);
  assert.equal(h.saved, undefined);
});

test('interrupted deletion finishes even when the native event was already removed', async () => {
  const h = harness();
  await h.sync();
  h.edit({ calendarDeletedAt: '2030-12-02T00:00:00Z' });
  h.failWriteAt(3);
  await assert.rejects(h.sync());
  assert.equal(h.events.size, 0);
  assert.ok(h.saved);
  await h.sync();
  assert.equal(h.saved, undefined);
});

test('unlinking removes the event and retains the task', async () => {
  const h = harness();
  await h.sync();
  h.edit({ calendar: undefined });
  await h.sync();
  assert.equal(h.events.size, 0);
  assert.equal(h.saved.id, 'task-1');
  assert.equal(h.saved.calendarSync, undefined);
});

test('switching calendars deletes the old event before creating the new one', async () => {
  const h = harness();
  await h.sync();
  h.edit({ calendar: { id: 'work', title: 'Trabajo' } });
  h.failDeletion(true);
  await assert.rejects(h.sync());
  assert.equal(h.creates, 1);
  h.failDeletion(false);
  await h.sync();
  assert.equal(h.events.size, 1);
  assert.equal([...h.events.values()][0].calendarId, 'work');
});

test('recovering a provider ID change finds the original marker', async () => {
  const h = harness();
  await h.sync();
  const event = h.events.get('event-1');
  h.events.delete('event-1');
  event.id = 'new-provider-id';
  h.events.set(event.id, event);
  h.edit({ description: 'Descripción actualizada' });
  await h.sync();
  assert.equal(h.saved.calendarSync.eventId, event.id);
  assert.equal(h.creates, 1);
});

test('archived completed tasks retain history after deleting their event', async () => {
  const h = harness();
  await h.sync();
  h.edit({ calendar: undefined, archivedAt: '2030-12-06T00:00:00Z' });
  await h.sync();
  assert.equal(h.events.size, 0);
  assert.ok(h.saved.archivedAt);
  assert.equal(h.saved.calendarDeletedAt, undefined);
});
