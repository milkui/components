import { createReactComponent } from '@milkui/create-react-component';
import * as HelloWorldPrimitive from '@milkui/hello-world';

const HelloWorld = createReactComponent(HelloWorldPrimitive.Root);

export {
  HelloWorld as Root,
  //
  HelloWorld,
};
