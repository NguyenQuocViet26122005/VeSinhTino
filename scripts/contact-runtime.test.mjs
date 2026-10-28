import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

// Exercise the emitted ESM entry point, not only the shared TypeScript handler.
// Astro's static build does not execute Vercel's server function.
test('compiled server entry point loads in Node ESM without extension resolution errors', async () => {
  const root = path.resolve('qa', `contact-runtime-${Date.now()}`);
  fs.mkdirSync(path.join(root, 'api'), { recursive: true });
  fs.mkdirSync(path.join(root, 'server'), { recursive: true });
  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify({ type: 'module' }));
  for (const name of ['api/contact', 'server/contact']) {
    const source = fs.readFileSync(`${name}.ts`, 'utf8');
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext }
    });
    fs.writeFileSync(path.join(root, `${name}.js`), outputText);
  }
  const { default: entry } = await import(pathToFileURL(path.join(root, 'api/contact.js')).href);
  const response = await entry.fetch(new Request('https://tino.test/api/contact'));
  assert.equal(response.status, 405);
  assert.equal((await response.json()).ok, false);
});
