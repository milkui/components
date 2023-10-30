import type { StoryObj } from '@storybook/html';
import * as Collapsible from './collapsible';

type Story = StoryObj<StoryArgs>;
type StoryArgs = Collapsible.CollapsibleAttrs &
  Collapsible.CollapsibleTriggerAttrs & { trigger: string; content: string };

const meta = {
  title: 'Core/Collapsible',
  argTypes: {
    trigger: { control: 'text' },
    content: { control: 'text' },
  },
  render(args: StoryArgs) {
    return `
      <div data-collapsible ${args.open == null ? '' : `data-open=${args.open}`}>
        <button data-collapsible_trigger>${args.trigger}</button>
        <div data-collapsible_content>${args.content}</div>
      </div>
    `;
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
