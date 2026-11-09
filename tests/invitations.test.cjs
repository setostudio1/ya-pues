const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/utils/invitations.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const exported = {};
vm.runInNewContext(compiled, { exports: exported });
const { buildTaskInvitationUrl, normalizeCompanionEmail } = exported;

test('invitation preserves accents, emoji and reserved URL characters without adding recipients or parameters', () => {
  const title = '  Diseñar 🧩 & revisar #1?bcc=otra@ejemplo.com  ';
  const url = new URL(buildTaskInvitationUrl(title));
  assert.equal(url.protocol, 'mailto:');
  assert.equal(url.pathname, '');
  assert.deepEqual([...url.searchParams.keys()], ['subject', 'body']);
  assert.equal(url.searchParams.get('subject'), `Hagamos juntos: ${title.trim()}`);
  assert.ok(url.searchParams.get('body').includes(title.trim()));
});

test('invitation can be drafted before the task title is written', () => {
  const url = new URL(buildTaskInvitationUrl(' \r\n '));
  assert.equal(url.searchParams.get('subject'), 'Hagamos una tarea juntos · YA PUES');
  assert.ok(url.searchParams.get('body').includes('Una tarea en YA PUES'));
});

test('multiline task text stays in the body and cannot add email headers', () => {
  const urlString = buildTaskInvitationUrl('Preparar entrega\r\nbcc: otra@ejemplo.com');
  const url = new URL(urlString);
  assert.ok(!/[\r\n]/.test(urlString));
  assert.ok(!/[\r\n]/.test(url.searchParams.get('subject')));
  assert.equal(url.searchParams.get('bcc'), null);
  assert.ok(url.searchParams.get('body').includes('Preparar entrega\r\nbcc: otra@ejemplo.com'));
});

test('companion email validation accepts plus aliases and normalizes whitespace and domains', () => {
  assert.equal(normalizeCompanionEmail('  Santiago+proyecto@GMAIL.COM  '), 'Santiago+proyecto@gmail.com');
  assert.equal(normalizeCompanionEmail('sergio@equipo.ejemplo.cl'), 'sergio@equipo.ejemplo.cl');
});

test('companion email validation rejects incomplete addresses, malformed domains and header injection', () => {
  for (const value of ['', 'San', 'persona@', '@ejemplo.com', 'persona@ejemplo', 'a..b@ejemplo.com',
    '.a@ejemplo.com', 'a.@ejemplo.com', 'a@-equipo.com', 'a@equipo-.com',
    'a@ejemplo.com\r\nbcc:otra@ejemplo.com', 'a@ejemplo.com,b@ejemplo.com',
    'a'.repeat(65) + '@ejemplo.com', 'a@' + 'b'.repeat(64) + '.com']) {
    assert.equal(normalizeCompanionEmail(value), null, value);
  }
});

test('invitation includes selected companions once, preserving their order', () => {
  const url = new URL(buildTaskInvitationUrl('Preparar entrega', [
    ' Santiago@EJEMPLO.COM ', 'santiago@ejemplo.com', 'sergio+equipo@ejemplo.com',
  ]));
  assert.equal(decodeURIComponent(url.pathname), 'Santiago@ejemplo.com,sergio+equipo@ejemplo.com');
  assert.deepEqual([...url.searchParams.keys()], ['subject', 'body']);
  assert.equal(url.searchParams.get('subject'), 'Hagamos juntos: Preparar entrega');
});

test('recipient characters remain part of the address and invalid recipients cannot be silently sent', () => {
  const email = 'equipo+curso&bcc=otro@ejemplo.com';
  const url = new URL(buildTaskInvitationUrl('Trabajo en equipo', [email]));
  assert.equal(decodeURIComponent(url.pathname), email);
  assert.equal(url.searchParams.get('bcc'), null);
  assert.throws(() => buildTaskInvitationUrl('Trabajo en equipo', ['incompleto@']));
  assert.throws(() => buildTaskInvitationUrl('Trabajo en equipo', ['a@ejemplo.com\r\nbcc:b@ejemplo.com']));
});
