import type { StoryObj } from '@storybook/html';
import * as HelloWorld from './hello-world';

type Story = StoryObj<StoryArgs>;
type StoryArgs = HelloWorld.HelloWorldAttrs;

const meta = {
  title: 'Core/HelloWorld',
  argTypes: {
    name: { control: 'text' },
  },
  render(args: StoryArgs) {
    return `<div data-hello-world data-name="${args.name}"></div>`;
  },
};

export const Base: Story = {
  args: {
    name: 'World',
  },
};

export default meta;
