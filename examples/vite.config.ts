import { readFile } from 'node:fs/promises';
import { readRoute } from './routes';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import {
  allNativeExamples,
  nativePreviewFileName,
  renderNativePreviewDocument,
  resolveNativeExample,
  templates,
} from './native-preview';

function suppressHiddenWarning(): Plugin {
  return {
    name: 'milk-suppress-react-hidden-warning',
    apply: 'serve',
    transformIndexHtml: {
      order: 'pre',
      handler() {
        return [
          {
            tag: 'script',
            injectTo: 'head-prepend',
            children: `
            (() => {
              const originalError = console.error;
              console.error = function (...args) {
                const isHiddenWarning =
                  typeof args[0] === 'string' &&
                  args[0].includes('Invalid DOM property \`%s\`. Did you mean \`%s\`?') &&
                  args[1] === 'HIDDEN' &&
                  args[2] === 'hidden';
                if (isHiddenWarning) return;
                Reflect.apply(originalError, this, args);
              };
            })();
          `,
          },
        ];
      },
    },
  };
}

function docsSsrPlugin(): Plugin {
  return {
    name: 'milk-docs-ssr',
    configurePreviewServer(server) {
      server.middlewares.use((request, response, next) => {
        const url = new URL(request.url ?? '/', 'http://localhost');
        if (readRoute(url.pathname)) {
          request.url = url.pathname.replace(/\/$/, '') + '/index.html' + url.search;
        } else if (url.pathname.startsWith('/component/')) {
          response.statusCode = 404;
          response.end('Component not found');
          return;
        }
        next();
      });
    },
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const url = new URL(request.url ?? '/', 'http://localhost');
        if (!readRoute(url.pathname)) {
          if (url.pathname.startsWith('/component/')) {
            response.statusCode = 404;
            response.end('Component not found');
            return;
          }
          next();
          return;
        }
        try {
          const template = await readFile(new URL('./index.html', import.meta.url), 'utf8');
          const html = await server.transformIndexHtml(url.pathname, template);
          const { render } = await server.ssrLoadModule('/entry-server.tsx');
          const page = render(url.pathname);
          response.setHeader('Content-Type', 'text/html; charset=utf-8');
          response.end(
            html
              .replace('<!--app-title-->', () => page.title)
              .replace('<!--app-html-->', () => page.html),
          );
        } catch (error) {
          server.ssrFixStacktrace(error as Error);
          next(error);
        }
      });
    },
  };
}

function nativePreviewHtmlPlugin(): Plugin {
  let ssr = false;
  return {
    name: 'milk-native-preview-html',
    configResolved(config) {
      ssr = Boolean(config.build.ssr);
    },
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const url = new URL(request.url ?? '/', 'http://localhost');
        const match = url.pathname.match(/^\/native\/([^/]+)\.html$/);
        if (!match) {
          next();
          return;
        }
        try {
          const preview = await server.ssrLoadModule('/native-preview.ts');
          const example = preview.resolveNativeExample(match[1]);
          const html = await server.transformIndexHtml(
            url.pathname,
            preview.renderNativePreviewDocument(example),
          );
          response.setHeader('Content-Type', 'text/html; charset=utf-8');
          response.end(html);
        } catch (error) {
          next(error);
        }
      });
    },
    transformIndexHtml: {
      order: 'pre',
      async handler(html, context) {
        if (!context.path.endsWith('/native.html')) return html;
        const originalUrl = 'originalUrl' in context ? context.originalUrl : context.path;
        const params = new URL(originalUrl ?? context.path, 'http://localhost').searchParams;
        const preview = context.server
          ? await context.server.ssrLoadModule('/native-preview.ts')
          : { resolveNativeExample, renderNativePreviewDocument };
        const example = preview.resolveNativeExample(params.get('example'));
        return preview.renderNativePreviewDocument(example);
      },
    },
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        if (ssr) return;
        const nativeHtml = bundle['native.html'];
        if (!nativeHtml || nativeHtml.type !== 'asset') {
          this.error('Missing built native preview HTML.');
        }
        const shell = String(nativeHtml.source);
        for (const example of allNativeExamples) {
          this.emitFile({
            type: 'asset',
            fileName: nativePreviewFileName(example),
            source: replaceNativePreview(shell, example),
          });
        }
      },
    },
  };
}

function replaceNativePreview(html: string, example: (typeof allNativeExamples)[number]) {
  return html
    .replace(/<title>.*?<\/title>/, `<title>Milk UI Native · ${example}</title>`)
    .replace(/data-example="[^"]*"/, `data-example="${example}"`)
    .replace(
      /(<main\b[^>]*>)[\s\S]*?(<\/main>)/,
      (_match, open, close) => `${open}${templates[example]}${close}`,
    );
}

export default defineConfig({
  plugins: [suppressHiddenWarning(), docsSsrPlugin(), nativePreviewHtmlPlugin()],
  build: {
    rollupOptions: {
      input: {
        react: fileURLToPath(new URL('./index.html', import.meta.url)),
        native: fileURLToPath(new URL('./native.html', import.meta.url)),
      },
    },
  },
  resolve: {
    alias: {
      '@milkui/primitive': fileURLToPath(
        new URL('../packages/core/primitive/src/index.ts', import.meta.url),
      ),
      '@milkui/collapsible': fileURLToPath(
        new URL('../packages/core/collapsible/src/index.ts', import.meta.url),
      ),
      '@milkui/button': fileURLToPath(
        new URL('../packages/core/button/src/index.ts', import.meta.url),
      ),
      '@milkui/accordion': fileURLToPath(
        new URL('../packages/core/accordion/src/index.ts', import.meta.url),
      ),
      '@milkui/react/primitive': fileURLToPath(
        new URL('../packages/react/src/primitive/index.ts', import.meta.url),
      ),
      '@milkui/react/collapsible': fileURLToPath(
        new URL('../packages/react/src/collapsible/index.ts', import.meta.url),
      ),
      '@milkui/react/button': fileURLToPath(
        new URL('../packages/react/src/button/index.ts', import.meta.url),
      ),
      '@milkui/react/accordion': fileURLToPath(
        new URL('../packages/react/src/accordion/index.ts', import.meta.url),
      ),
      '@milkui/react': fileURLToPath(new URL('../packages/react/src/index.ts', import.meta.url)),
    },
  },
});
