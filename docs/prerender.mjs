import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render, routePaths } from './dist/server/entry-server.mjs';

const template = await readFile(new URL('./dist/index.html', import.meta.url), 'utf8');
for (const path of routePaths) {
  const page = render(path);
  const html = template.replace('<!--app-title-->', () => page.title).replace('<!--app-html-->', () => page.html);
  const output = new URL(`./dist${path === '/' ? '' : path}/index.html`, import.meta.url);
  await mkdir(dirname(fileURLToPath(output)), { recursive: true });
  await writeFile(output, html);
}
