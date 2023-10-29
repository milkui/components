import type { StoryObj } from '@storybook/react';
import * as React from 'react';
import reactDecorator from '~/.storybook/react-decorator';
import * as Collapsible from './collapsible';

type Story = StoryObj<StoryProps>;
type StoryProps = React.ComponentProps<typeof Collapsible.Root> &
  React.ComponentProps<typeof Collapsible.Trigger> & {
    trigger: React.ReactNode;
    content: React.ReactNode;
  };

const meta = {
  title: 'React/Collapsible',
  decorators: [reactDecorator()],
  parameters: {
    framework: 'react',
  },
  argTypes: {
    trigger: { control: 'text' },
    content: { control: 'text' },
  },
  render(props: StoryProps) {
    return (
      <Collapsible.Root open={props.open}>
        <Collapsible.Trigger>{props.trigger}</Collapsible.Trigger>
        <Collapsible.Content>{props.content}</Collapsible.Content>
      </Collapsible.Root>
    );
  },
};

export const Base: Story = {
  args: {
    trigger: 'More info',
    content: 'The quick brown fox jumped over the lazy dogs.',
  },
};

export const Controlled: Story = {
  argTypes: {
    open: { control: 'boolean' },
  },
  args: {
    trigger: 'More info',
    content: 'The quick brown fox jumped over the lazy dogs.',
    open: false,
  },
};

export default meta;
