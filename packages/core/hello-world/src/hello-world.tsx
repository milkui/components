import * as Hooked from 'hooked-elements';
import { primitive } from '@milkui/primitive';

/* -------------------------------------------------------------------------------------------------
 * HelloWorld
 * -----------------------------------------------------------------------------------------------*/

interface HelloWorldAttrs {
  name?: string;
}

const HelloWorld = primitive<'div', HelloWorldAttrs>(['name'], {
  render(element) {
    element.replaceChildren(`Hello, ${this.attrs.name}`);
  },
});

HelloWorld.config = {
  element: 'div',
  attribute: 'data-hello-world',
};

/* ---------------------------------------------------------------------------------------------- */

Hooked.define(`[${HelloWorld.config.attribute}]`, HelloWorld);

export type { HelloWorldAttrs };
export { HelloWorld as Root };
