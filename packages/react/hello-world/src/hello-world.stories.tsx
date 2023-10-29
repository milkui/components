import reactDecorator from '~/.storybook/react-decorator';
import * as HelloWorld from './hello-world';

const meta = {
  title: 'React/HelloWorld',
  decorators: [reactDecorator()],
  argTypes: {
    name: { control: 'text' },
  },
};

export const Base = (args: Record<keyof typeof meta.argTypes, any>) => {
  const { name = 'World' } = args;
  return <HelloWorld.Root name={name} />;
};

export default meta;
