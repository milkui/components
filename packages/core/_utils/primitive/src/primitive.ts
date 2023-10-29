import * as Hooked from 'hooked-elements';

type HookedElementsComponent = Exclude<Parameters<typeof Hooked.define>[1], Function>;

/* -------------------------------------------------------------------------------------------------
 * primitive
 * -----------------------------------------------------------------------------------------------*/

interface Primitive<E extends keyof HTMLElementTagNameMap, A extends Record<string, any>>
  extends HookedElementsComponent {
  selector: string;
  element: E;
  attrs: A;
}

function primitive<
  E extends keyof HTMLElementTagNameMap,
  A extends Record<string, any> = {},
>(config: {
  name: string;
  element: E;
  observedAttributes?: (keyof A)[];
  render(element: HTMLElementTagNameMap[E], attrs: A): void;
}): Primitive<E, A> {
  const definition = {
    selector: `data-${config.name}`,
    element: config.element,
    attrs: {} as A,
    observedAttributes: config.observedAttributes?.map((attr) => `data-${String(attr)}`) || [],
    attributeChanged(name: string, prev: string, value: string) {
      console.log('attr');
      const attr = name.replace(/^data-/, '');
      if (value == null) {
        this.attrs[attr] = undefined;
      } else {
        try {
          this.attrs[attr] = JSON.parse(value);
        } catch (e) {
          this.attrs[attr] = value === '' ? true : value;
        }
      }
      this.render.call(this, this.element, this.attrs);
    },
    render(element: unknown) {
      console.log('test');
      config.render.call(this, element, this.attrs);
    },
  };

  Hooked.define(`[${definition.selector}]`, definition);
  return definition;
}

/* -------------------------------------------------------------------------------------------------
 * preventableEvent
 * -----------------------------------------------------------------------------------------------*/

function preventableEvent<E extends Event>(handler?: (event: E) => void) {
  return function handleEvent(event: E) {
    if (!event.defaultPrevented) handler?.(event);
  };
}

/* ---------------------------------------------------------------------------------------------- */

export type { Primitive };
export { primitive, preventableEvent };
