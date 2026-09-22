import * as React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { App } from './main';
import { readRoute } from './routes';

const state = readRoute(window.location.pathname);
if (state)
  hydrateRoot(
    document.getElementById('app')!,
    <React.StrictMode>
      <App state={state} />
    </React.StrictMode>,
  );
