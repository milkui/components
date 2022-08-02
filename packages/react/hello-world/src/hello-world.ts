import { NAME } from '@milkui/hello-world';
import { createReactComponent } from '@milkui/create-react-component';
import React from 'react';

const HelloWorld = createReactComponent<{ children: React.ReactNode }>(NAME);

export {
  HelloWorld as Root,
  //
  HelloWorld,
};
