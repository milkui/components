import '@atomico/react/proxy';
import { auto } from '@atomico/react';
import * as HelloWorldElement from '@milkui/hello-world';

const HelloWorld = auto(HelloWorldElement.Root);

export {
  HelloWorld as Root,
  //
  HelloWorld,
};
