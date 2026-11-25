const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Exercise the real TypeScript modules with only device and persistence APIs
// substituted. No React Native runtime or extra test dependency is required.
function createSourceLoader(mocks = {}) {
  const root = path.join(path.dirname(require.resolve('../../package.json')), 'src');
  const cache = new Map();
  function load(relative) {
    const filename = path.join(root, relative.endsWith('.ts') ? relative : `${relative}.ts`);
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
      fileName: filename,
    });
    const run = vm.compileFunction(outputText, ['require', 'module', 'exports'], { filename });
    run((name) => {
      if (Object.hasOwn(mocks, name)) return mocks[name];
      if (name.startsWith('@/')) return load(name.slice(2));
      throw new Error(`Unexpected device dependency: ${name}`);
    }, module, module.exports);
    return module.exports;
  }
  return load;
}

module.exports = { createSourceLoader };
