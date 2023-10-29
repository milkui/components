import * as Hooked from 'hooked-elements';
import { primitive } from '@milkui/primitive';

/* -------------------------------------------------------------------------------------------------
 * HelloWorld
 * -----------------------------------------------------------------------------------------------*/

interface HelloWorldAttrs {
  name?: string;
}

const HelloWorld = primitive<'div', HelloWorldAttrs>({
  element: 'div',
  name: 'hello-world',
  observedAttributes: ['name'],
  render(element, attrs) {
    element.replaceChildren(`Hello, ${attrs.name}`);
  },
});

/* ---------------------------------------------------------------------------------------------- */

export type { HelloWorldAttrs };
export { HelloWorld as Root };
