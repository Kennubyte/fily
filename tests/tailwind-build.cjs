const { execFileSync } = require('node:child_process');
const { readdirSync, readFileSync } = require('node:fs');
const assert = require('node:assert/strict');

execFileSync('npm', ['run', 'build'], { stdio: 'inherit' });
const css = readdirSync('dist/assets').filter(f => f.endsWith('.css')).map(f => readFileSync(`dist/assets/${f}`, 'utf8')).join('\n');
for (const selector of ['.flex', '.p-6', '.md\\:flex-row', '.bg-black\\/70', '.shadow-2xl']) {
  assert.ok(css.includes(selector), `Missing generated Tailwind selector ${selector}`);
}
assert.match(css, /(?:#000000b3|#000b|rgba\(0,\s*0,\s*0,\s*(?:\.7|0\.7)\)|color-mix\([^}]*70%)/i, 'Modal backdrop must retain 70% opacity');
console.log('Tailwind production CSS smoke test passed');
