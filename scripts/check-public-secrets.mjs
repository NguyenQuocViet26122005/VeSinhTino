import fs from 'node:fs';
import path from 'node:path';

const findings = [];
function scan(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) scan(file);
    else if (/\.(?:ts|tsx|js|mjs|cjs|astro|html|json|map|md|ya?ml)$/.test(file)) {
      const text = fs.readFileSync(file, 'utf8');
      if (/\b\d{6,12}:[A-Za-z0-9_-]{30,}\b/.test(text) ||
        /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----[\s\S]{80,}?-----END (?:RSA |EC )?PRIVATE KEY-----/.test(text)) findings.push(file);
    }
  }
}
for (const dir of ['src', 'server', 'api', 'functions', 'scripts', 'dist']) scan(dir);
if (findings.length) {
  console.error('Possible private credential found (values withheld):', findings);
  process.exitCode = 1;
} else console.log('No Telegram token or private-key pattern found in application source or public build.');
