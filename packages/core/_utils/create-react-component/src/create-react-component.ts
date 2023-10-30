import * as React from 'react';
import type { Primitive } from '@milkui/primitive';

/* -------------------------------------------------------------------------------------------------
 * createReactComponent
 * -----------------------------------------------------------------------------------------------*/

type MergeProps<P1, P2> = Omit<P1, keyof P2> & P2;
type Props<E extends keyof JSX.IntrinsicElements, A> = MergeProps<
  React.ComponentPropsWithoutRef<E>,
  A
>;

function createReactComponent<E extends keyof JSX.IntrinsicElements, Attributes>(
  primitive: E extends keyof HTMLElementTagNameMap ? Primitive<E, Attributes> : never,
) {
  return React.forwardRef<React.ElementRef<E>, Props<E, Attributes>>((props, forwardedRef) => {
    const { children, ...rest } = props as any;
    const primitiveProps = React.useMemo(() => {
      const entries = Object.entries(rest).map(([prop, value]) => {
        const attribute = `data-${prop.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}`;
        if (!primitive.observedAttributes.includes(attribute)) {
          return [prop, value];
        } else if (value === undefined) {
          return [];
        } else if (typeof value === 'boolean') {
          return [attribute, value ? '' : false];
        } else {
          return [attribute, value];
        }
      });
      return Object.fromEntries(entries);
    }, Object.values(rest));

    return React.createElement(
      primitive.element,
      { ...primitiveProps, [primitive.selector]: '', ref: forwardedRef },
      children,
    );
  });
}

/* ---------------------------------------------------------------------------------------------- */

export { createReactComponent };
