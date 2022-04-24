import { template } from 'atomico';
import * as HelloWorld from './hello-world';

export default {
  title: 'Core/HelloWorld'
}

export const Base = () => template(
  <HelloWorld.Root name="Jenna" />
);
