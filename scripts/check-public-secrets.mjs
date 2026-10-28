import fs from 'node:fs';
import path from 'node:path';

const findings = [];
function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) scan(file);
    else if (/\.(?:ts|tsx|js|mjs|html|json|map)$/.test(file)) {
      const text = fs.readFileSync(file, 'utf8');
      if (/\b\d{6,12}:[A-Za-z0-9_-]{30,}\b/.test(text)) findings.push(file);
    }
  }
}
scan('src');
scan('dist');
if (findings.length) {
  console.error('Possible Telegram credential found (values withheld):', findings);
  process.exitCode = 1;
} else console.log('No Telegram credential pattern found in source or public build.');
