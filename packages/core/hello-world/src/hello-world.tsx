import register from 'preact-custom-element';
import * as Preact from 'preact';

const NAME = 'milk-hello-world';

/* -------------------------------------------------------------------------------------------------
 * HelloWorld
 * -----------------------------------------------------------------------------------------------*/

interface HelloWorldProps {
  children: Preact.ComponentChildren;
}

function HelloWorld({ children }: HelloWorldProps) {
  return Preact.cloneElement(children, {
    onClick: (event) => {
      if (!event.defaultPrevented) {
        console.log('click', event.defaultPrevented);
      }
    },
  });
}

/* ---------------------------------------------------------------------------------------------- */

if (!customElements.get(NAME)) {
  register(HelloWorld, NAME, ['children'], { shadow: true });
}

export {
  NAME,
  HelloWorld as Root,
  //
  HelloWorld,
};
