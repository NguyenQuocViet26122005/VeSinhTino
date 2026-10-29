import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

// Exercise the emitted ESM entry point, not only the shared TypeScript handler.
// Astro's static build does not execute Vercel's server function.
test('compiled server entry point loads and forwards both recipient IDs', async t => {
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
  const keys = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID', 'TELEGRAM_REPORT_CHAT_ID_2'];
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  Object.assign(process.env, { TELEGRAM_BOT_TOKEN: 'dummy-token', TELEGRAM_CHAT_ID: '111', TELEGRAM_REPORT_CHAT_ID_2: '222' });
  const sent = [];
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    sent.push(JSON.parse(options.body).chat_id);
    return Response.json({ ok: true });
  });
  try {
    const post = await entry.fetch(new Request('https://tino.test/api/contact', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ phone: '0900000000', name: 'Runtime test' })
    }));
    assert.equal(post.status, 200);
    assert.deepEqual(sent.sort(), ['111', '222']);
  } finally {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  }
});
