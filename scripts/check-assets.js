import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../public/images/', import.meta.url));
try {
  const files = (await readdir(root)).filter((name) => !name.startsWith('.'));
  let total = 0;
  let tooLarge = [];
  for (const name of files) {
    const info = await stat(join(root, name));
    total += info.size;
    console.log(`${String((info.size / 1024).toFixed(1)).padStart(7)} KB  ${name}`);
    if (info.size > 250 * 1024) tooLarge.push(name);
  }
  console.log(`Total: ${(total / 1024 / 1024).toFixed(2)} MB across ${files.length} files.`);
  if (total > 25 * 1024 * 1024 || tooLarge.length) {
    if (tooLarge.length) console.warn('Note: files over 250 KB:', tooLarge.join(', '));
  }
} catch (err) {
  console.log('No public/images directory found or readable:', err.message);
}
