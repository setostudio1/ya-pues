const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');

const src = path.join(__dirname, '../src');
function loadComponent(file, overrides = {}) {
  const cache = new Map();
  const jsx = (type, props, key) => ({ type, props, key });
  const mocks = {
    'react/jsx-runtime': { jsx, jsxs: jsx },
    react: { Fragment: 'Fragment' },
    'react-native': { Pressable: 'Pressable', View: 'View', StyleSheet: { create: (styles) => styles } },
    'expo-router': { Link: 'Link' },
    '@expo/vector-icons/Ionicons': { default: 'Icon' },
    ...overrides,
  };
  function load(filename) {
    if (cache.has(filename)) return cache.get(filename);
    const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
    }).outputText;
    const exported = {};
    cache.set(filename, exported);
    vm.runInNewContext(output, { exports: exported, require: (id) => {
      if (id in mocks) return mocks[id];
      if (!id.startsWith('.')) throw Error(`Unexpected import: ${id}`);
      const target = path.resolve(path.dirname(filename), id);
      const override = path.relative(src, target).replaceAll(path.sep, '/');
      if (override in overrides) return overrides[override];
      return load(fs.existsSync(target + '.tsx') ? target + '.tsx' : target + '.ts');
    } });
    return exported;
  }
  return load(path.join(src, file));
}
function elements(node) {
  if (!node || typeof node !== 'object') return [];
  const children = Array.isArray(node.props?.children) ? node.props.children.flat(Infinity) : [node.props?.children];
  return [node, ...children.flatMap(elements)];
}

test('SDK 58 tab presses preserve prevention, selection, long press and the central creation link', () => {
  const BottomNav = loadComponent('components/BottomNav.tsx').default;
  const events = [];
  const destinations = [];
  let prevented = false;
  const props = {
    state: { index: 0, routes: [{ key: 'home', name: 'index' }, { key: 'profile-placeholder', name: 'streak' },
      { key: 'confirmation', name: 'task-created' }] },
    descriptors: { home: { options: { title: 'Inicio' } }, 'profile-placeholder': { options: { title: 'Racha' } } },
    emitter: { emit: (event) => { events.push(event); return { defaultPrevented: prevented }; } },
    navigateToTab: (key) => destinations.push(key), insets: { bottom: 0 },
  };
  const tree = elements(BottomNav(props));
  const tabs = tree.filter((node) => node.props?.accessibilityRole === 'tab');
  assert.equal(tabs.length, 2);
  assert.equal(tabs[0].props.accessibilityState.selected, true);
  assert.equal(tabs[1].props.accessibilityLabel, 'Racha');
  assert.equal(tree.find((node) => node.type === 'Link').props.href, '/set-date');
  tabs[0].props.onPress();
  assert.equal(destinations.length, 0);
  tabs[1].props.onPress();
  assert.deepEqual(destinations, ['profile-placeholder']);
  assert.equal(events.at(-1).type, 'tabPress');
  assert.equal(events.at(-1).canPreventDefault, true);
  prevented = true;
  tabs[1].props.onPress();
  assert.equal(destinations.length, 1);
  tabs[1].props.onLongPress();
  assert.equal(events.at(-1).type, 'tabLongPress');
  assert.equal(events.at(-1).target, 'profile-placeholder');
  props.state.index = 2;
  assert.equal(elements(BottomNav(props)).filter((node) => node.props?.accessibilityRole === 'tab').length, 2);
});

test('SDK 58 notification routing waits for navigation state and subscribes only once', async () => {
  const effects = [];
  const listeners = {};
  const destinations = [];
  let ready = false;
  let subscriptions = 0;
  let stopped = false;
  let open;
  const { NotificationsProvider } = loadComponent('features/reminders/NotificationsProvider.tsx', {
    react: {
      createContext: () => ({ Provider: 'Provider' }), useState: (value) => [value, () => {}],
      useRef: (value) => ({ current: value }), useCallback: (callback) => callback,
      useEffect: (effect) => effects.push(effect),
    },
    'react-native': { AppState: { addEventListener: () => ({ remove() {} }) } },
    'expo-router': {
      useNavigationContainerRef: () => ({ isReady: () => ready,
        addListener: (type, callback) => { listeners[type] = callback; return () => delete listeners[type]; } }),
      router: { dismissTo: (href) => destinations.push(href), push: (href) => destinations.push(href) },
    },
    'storage/data': { loadTasks: async () => [{ id: 'one' }], loadCompletions: async () => [] },
    'features/reminders/notificationDevice': { observeResponses: (callback) => {
      subscriptions++; open = callback; return () => { stopped = true; };
    } },
    'features/reminders/notificationService': { notificationService: { sync: async () => ({}) } },
  });
  NotificationsProvider({ children: null });
  const cleanups = effects.map((effect) => effect());
  assert.equal(subscriptions, 0);
  assert.equal(typeof listeners.state, 'function');
  ready = true;
  listeners.state();
  listeners.state();
  assert.equal(subscriptions, 1);
  open({ owner: 'ya-pues-reminders-v1', kind: 'task', taskId: 'one', variant: 'urgent' });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(destinations[0].pathname, '/notification-3');
  assert.equal(destinations[0].params.taskId, 'one');
  for (const cleanup of cleanups) cleanup();
  assert.equal(stopped, true);
  assert.equal(listeners.state, undefined);
});
