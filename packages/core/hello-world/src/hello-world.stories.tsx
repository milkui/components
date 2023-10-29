import './hello-world';

const meta = {
  title: 'Core/HelloWorld',
  argTypes: {
    name: { control: 'text' },
  },
};

export const Base = (args: Record<keyof typeof meta.argTypes, any>) => {
  const { name = 'World' } = args;
  return `
    <div data-hello-world data-name="${name}"></div>
  `;
};

export default meta;
