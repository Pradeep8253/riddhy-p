import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../public/images/', import.meta.url));
const files = (await readdir(root)).filter((name) => !name.startsWith('.'));
let total = 0;
let tooLarge = [];
for (const name of files) {
  const info = await stat(join(root, name));
  total += info.size;
  console.log(`${String((info.size / 1024).toFixed(1)).padStart(7)} KB  ${name}`);
  if (info.size > 200 * 1024) tooLarge.push(name);
}
console.log(`Total: ${(total / 1024 / 1024).toFixed(2)} MB across ${files.length} files.`);
if (total > 20 * 1024 * 1024 || tooLarge.length) {
  if (tooLarge.length) console.error('Files over 200 KB:', tooLarge.join(', '));
  process.exit(1);
}
