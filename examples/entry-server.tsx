import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './main';
import { readRoute } from './routes';
export { routePaths } from './routes';

export function render(path: string) {
  const state = readRoute(path);
  if (!state) return undefined;
  const title = state.component[0].toUpperCase() + state.component.slice(1);
  return {
    title: `Milk UI · ${title}`,
    html: renderToString(
      <React.StrictMode>
        <App state={state} />
      </React.StrictMode>,
    ),
  };
}
