import reactDecorator from '~/.storybook/react-decorator';
import * as HelloWorld from './hello-world';

export default {
  title: 'React/HelloWorld',
  decorators: [reactDecorator()],
};

export const Base = () => <HelloWorld.Root name={'Jenna'} />;
