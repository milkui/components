/* https://github.com/JetBrains/ring-ui/blob/master/.storybook/react-decorator.js */
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { useEffect, useMemo } from '@storybook/addons';

const reactDecorator = (story, context) => {
  const node = useMemo(() => document.createElement('div'), [context.kind, context.name]);
  const root = useMemo(() => createRoot(node), [node]);
  useEffect(() => () => root.unmount(), [root]);
  root.render(<StrictMode>{story()}</StrictMode>);
  return node;
};

export default () => reactDecorator;
