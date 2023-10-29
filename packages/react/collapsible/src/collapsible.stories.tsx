import reactDecorator from '~/.storybook/react-decorator';
import * as Collapsible from './collapsible';

const meta = {
  title: 'React/Collapsible',
  decorators: [reactDecorator()],
  argTypes: {
    trigger: { control: 'text' },
    content: { control: 'text' },
  },
};

export const Base = (args: Record<keyof typeof meta.argTypes, any>) => {
  const { trigger = 'More info', content = 'The quick brown fox jumped over the lazy dogs.' } =
    args;
  return (
    <Collapsible.Root>
      <Collapsible.Trigger>{trigger}</Collapsible.Trigger>
      <Collapsible.Content>{content}</Collapsible.Content>
    </Collapsible.Root>
  );
};

export default meta;
