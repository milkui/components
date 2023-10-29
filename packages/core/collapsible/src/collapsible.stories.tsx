import './collapsible';

const meta = {
  title: 'Core/Collapsible',
  argTypes: {
    trigger: { control: 'text' },
    content: { control: 'text' },
  },
};

export const Base = (args: Record<keyof typeof meta.argTypes, any>) => {
  const { trigger = 'More info', content = 'The quick brown fox jumped over the lazy dogs.' } =
    args;
  return `
    <div data-collapsible>
      <button data-collapsible_trigger>${trigger}</button>
      <div data-collapsible_content>${content}</div>
    </div>
  `;
};

export default meta;
