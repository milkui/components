import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { build } from 'vite';

const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temporaryDirectory = await mkdtemp(`${tmpdir()}/milkui-tree-shaking-`);
const packages = {
  '@milkui/primitive': 'packages/core/primitive',
  '@milkui/button': 'packages/core/button',
  '@milkui/collapsible': 'packages/core/collapsible',
  '@milkui/accordion': 'packages/core/accordion',
  '@milkui/react': 'packages/react',
};
const alias = {
  ...Object.fromEntries(
    ['accordion', 'button', 'collapsible', 'primitive'].map((name) => [
      `@milkui/react/${name}`, resolve(project, `packages/react/src/${name}/index.ts`),
    ]),
  ),
  ...Object.fromEntries(
    Object.entries(packages).map(([name, path]) => [name, resolve(project, path, 'src/index.ts')]),
  ),
};

try {
  for (const name of [
    '@milkui/collapsible',
    '@milkui/react/collapsible',
    '@milkui/accordion',
    '@milkui/react/accordion',
    '@milkui/react',
  ]) {
    const entry = resolve(temporaryDirectory, 'entry.ts');
    await writeFile(
      entry,
      name === '@milkui/react'
        ? `import { Collapsible } from '${name}'; export const Root = Collapsible.Root;\n`
        : `export { Root } from '${name}';\n`,
    );
    const result = await build({
      configFile: false,
      root: project,
      logLevel: 'silent',
      resolve: { alias },
      build: {
        write: false,
        minify: 'esbuild',
        lib: { entry, formats: ['es'] },
        rollupOptions: {
          external: ['react', 'react-dom', 'react/jsx-runtime'],
          onwarn(warning, warn) {
            // This client bundle size check does not preserve RSC directives.
            if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use client'))
              return;
            warn(warning);
          },
        },
      },
    });
    const code = result[0].output
      .filter((output) => output.type === 'chunk')
      .map((output) => output.code)
      .join('\n');
    const prefix = name.includes('accordion') ? 'mlk-accordion' : 'mlk-collapsible';
    const parts = name.includes('accordion')
      ? ['item', 'header', 'trigger', 'content']
      : ['trigger', 'content'];
    for (const part of parts) {
      assert.equal(
        code.includes(JSON.stringify(`${prefix}-${part}`)),
        false,
        `${name}: importing Root also retained ${part}`,
      );
    }
    if (name === '@milkui/react') {
      assert.equal(code.includes('mlk-accordion'), false, 'Root import retained Accordion');
      assert.equal(code.includes('mlk-button'), false, 'Root import retained Button');
    }
    assert.equal(code.includes('dom-types'), false, `${name}: retained a type-only dependency`);
    assert.equal(code.includes('MutationObserver'), false, `${name}: Root retained DOM discovery`);
    console.log(
      `${name} Root: ${Buffer.byteLength(code)} bytes (${gzipSync(code).length} gzip); unrelated parts and discovery removed`,
    );
  }
  for (const [name, path] of Object.entries(packages)) {
    const manifest = JSON.parse(await readFile(resolve(project, path, 'package.json'), 'utf8'));
    const externalDependencies = Object.keys(manifest.dependencies ?? {}).filter(
      (dependency) => !dependency.startsWith('@milkui/'),
    );
    // dom-types appears only in declaration imports, never in runtime bundles.
    const allowedDependencies =
      name === '@milkui/react'
        ? ['radix-ui']
        : name === '@milkui/primitive'
          ? ['dom-types']
          : [];
    assert.deepEqual(
      externalDependencies,
      allowedDependencies,
      `${name} has unexpected runtime dependencies`,
    );
  }
} finally {
  await rm(temporaryDirectory, { recursive: true });
}
