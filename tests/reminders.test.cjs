const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const root = path.join(__dirname, '../src/features/reminders');
const modules = new Map();
function load(name) {
  if (modules.has(name)) return modules.get(name);
  const source = fs.readFileSync(path.join(root, `${name}.ts`), 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exported = {};
  modules.set(name, exported);
  vm.runInNewContext(output, { exports: exported, require: (id) => load(id.replace('./', '')) });
  return exported;
}
const { formatReminderCopy } = load('reminderCopy');
const { REMINDER_VARIANTS, reminderVariants } = load('reminderVariants');
const { reminderExample } = load('reminderExamples');

test('every reminder uses its existing route and a distinct explicit preview fixture', () => {
  const routes = REMINDER_VARIANTS.map((variant) => reminderVariants[variant].route);
  assert.deepEqual(Array.from(routes), ['/notification-1', '/notification-2', '/notification-3', '/notification-4']);
  const fixtures = REMINDER_VARIANTS.map(reminderExample);
  assert.equal(new Set(fixtures.map((fixture) => fixture.id)).size, 4);
  assert.ok(fixtures.every((fixture) => fixture.id.startsWith('preview-') && fixture.taskId === 'preview-task'));
});

test('missing or whitespace-only task, name and course fields never leak undefined or empty emphasis', () => {
  for (const variant of REMINDER_VARIANTS) {
    const copy = formatReminderCopy({ id: 'x', taskId: 't', variant, taskTitle: undefined, displayName: '  ', courseName: undefined });
    assert.equal(copy.emphasis, 'TU TAREA PENDIENTE');
    assert.ok(copy.heading.length > 0);
    assert.ok(!Object.values(copy).join(' ').includes('undefined'));
    assert.ok(!copy.emphasis.includes('·'));
  }
  assert.equal(formatReminderCopy({ ...reminderExample('personal'), displayName: '' }).heading, '¡YA PUES!');
});

test('long task titles and display names are preserved for wrapping rather than truncated', () => {
  const taskTitle = 'Preparar el proyecto final de diseño y revisar todos los detalles con mi equipo '.repeat(4).trim();
  const displayName = 'María José de los Ángeles y del Rosario';
  const copy = formatReminderCopy({ ...reminderExample('personal'), taskTitle, displayName, courseName: '  Taller\n  avanzado  ' });
  assert.equal(copy.heading, displayName.toLocaleUpperCase('es') + '!!!');
  assert.equal(copy.emphasis, taskTitle.toLocaleUpperCase('es') + ' · TALLER AVANZADO');
});

test('the four distinct messages preserve the intended reminder wording', () => {
  assert.equal(formatReminderCopy(reminderExample('initial')).heading, 'HORAAAAA');
  assert.equal(formatReminderCopy(reminderExample('unstarted')).heading, '¿EN SERIO?');
  assert.equal(formatReminderCopy(reminderExample('urgent')).heading, 'MENOS DE\n1 HORA');
  assert.ok(formatReminderCopy(reminderExample('unstarted')).tail.endsWith('?'));
});
