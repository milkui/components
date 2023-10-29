import type { StoryObj } from '@storybook/react';
import * as React from 'react';
import reactDecorator from '~/.storybook/react-decorator';
import * as HelloWorld from './hello-world';

type Story = StoryObj<StoryProps>;
type StoryProps = React.ComponentProps<typeof HelloWorld.Root>;

const meta = {
  title: 'React/HelloWorld',
  decorators: [reactDecorator()],
  parameters: {
    framework: 'react',
  },
  argTypes: {
    name: { control: 'text' },
  },
  render(props: StoryProps) {
    return <HelloWorld.Root name={props.name} />;
  },
};

export const Base: Story = {
  args: {
    name: 'World',
  },
};

export default meta;
