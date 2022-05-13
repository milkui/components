import * as Atomico from 'atomico';

/* -------------------------------------------------------------------------------------------------
 * HelloWorld
 * -----------------------------------------------------------------------------------------------*/

function helloWorld({ name }: Atomico.Props<typeof helloWorld.props>) {
  return Atomico.html`<host shadowDom>Hello, ${name}</host>`;
}

helloWorld.props = {
  name: String,
};

/* ---------------------------------------------------------------------------------------------- */

const HelloWorld = Atomico.c(helloWorld);

if (!customElements.get('milk-hello-world')) {
  customElements.define('milk-hello-world', HelloWorld);
}

export {
  HelloWorld as Root,
  //
  HelloWorld,
};
