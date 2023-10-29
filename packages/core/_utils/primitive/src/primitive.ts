import * as Hooked from 'hooked-elements';

type HookedElementsComponent = Exclude<Parameters<typeof Hooked.define>[1], Function>;

/* -------------------------------------------------------------------------------------------------
 * primitive
 * -----------------------------------------------------------------------------------------------*/

interface PrimitiveDefinition<E extends keyof HTMLElementTagNameMap, A extends Record<string, any>>
  extends Omit<HookedElementsComponent, 'observedAttributes' | 'render'> {
  render(this: Primitive<E, A>, element: HTMLElementTagNameMap[E]): void;
}

interface Primitive<E extends keyof HTMLElementTagNameMap, A extends Record<string, any>>
  extends PrimitiveDefinition<E, A> {
  attrs: A;
  observedAttributes: HookedElementsComponent['observedAttributes'];
  config?: { element: E; attribute: string };
}

function primitive<E extends keyof HTMLElementTagNameMap, A extends Record<string, any>>(
  attrs: (keyof A)[],
  comp: PrimitiveDefinition<E, A>
): Primitive<E, A> {
  return {
    ...comp,
    attrs: {} as A,
    observedAttributes: attrs.map((attr) => `data-${String(attr)}`),
    attributeChanged(name: string, prev: string, value: string) {
      comp.attributeChanged?.call(this, name, prev, value);
      const attr = name.replace(/^data-/, '');
      try {
        this.attrs[attr] = JSON.parse(value);
      } catch (e) {
        this.attrs[attr] = value === '' ? true : value;
      }
      comp.render.call(this, this.element);
    },
  };
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
