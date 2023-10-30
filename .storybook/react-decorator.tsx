/* https://github.com/JetBrains/ring-ui/blob/master/.storybook/react-decorator.tsx */
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { useEffect, useMemo } from '@storybook/preview-api';
import type { StoryFn, StoryContext } from '@storybook/react';

const reactDecorator = () => (Story: StoryFn, context: StoryContext) => {
  const node = useMemo(() => document.createElement('div'), [context.name]);
  const root = useMemo(() => createRoot(node), [node]);
  useEffect(() => () => root.unmount(), [root]);
  root.render(
    <React.StrictMode>
      <Story />
    </React.StrictMode>,
  );
  return node;
};

export default reactDecorator;
