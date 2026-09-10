import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'www');
const files = ['index.html', 'vocab.js', 'manifest.json', 'sw.js', 'icon.png'];
const directories = ['assets', 'vendor'];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

await Promise.all([
  ...files.map(file => cp(resolve(root, file), resolve(output, file))),
  ...directories.map(directory => cp(resolve(root, directory), resolve(output, directory), { recursive: true }))
]);

console.log(`Built offline web assets in ${output}`);
