import type { Meta, StoryObj } from '@storybook/html';
import { type ButtonProps, Button } from './button.js';

const meta: Meta<ButtonProps> = {
  title: 'Button',
  render: (args) => {
    const button = document.createElement('button');
    button.setAttribute(Button.attribute, '');
    button.textContent = 'boop';
    Button.mount(button, args);

    return button;
  },
  argTypes: {
    disabled: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<ButtonProps>;

export const Primary: Story = {
  args: {
    disabled: false,
  },
};

export const Secondary: Story = {
  args: {
    disabled: true,
  },
};
