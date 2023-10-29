import * as React from 'react';
import type { Primitive } from '@milkui/primitive';

/* -------------------------------------------------------------------------------------------------
 * createReactComponent
 * -----------------------------------------------------------------------------------------------*/

type ElementProps<E> = E extends keyof JSX.IntrinsicElements
  ? React.ComponentPropsWithoutRef<E>
  : {};

export function createReactComponent<E extends keyof JSX.IntrinsicElements, Attributes>(
  primitive: E extends keyof HTMLElementTagNameMap ? Primitive<E, Attributes> : never
) {
  type Props = React.PropsWithChildren<Omit<ElementProps<E>, keyof Attributes> & Attributes>;

  return React.forwardRef<HTMLElement, Props>((props, forwardedRef) => {
    const { children, ...rest } = props;
    const ref = React.useRef<HTMLElement>(null);

    React.useLayoutEffect(() => {
      const node = ref.current;
      let cleanupFns = [];
      if (node) {
        Object.entries(props).forEach(([prop, value]) => {
          if (prop.startsWith('on') && typeof value === 'function') {
            const event = mapReactEventToNativeEvent[prop] || prop.slice(2).toLowerCase();
            node.addEventListener(event, value);
            cleanupFns.push(() => node.removeEventListener(event, value));
          } else if (primitive.observedAttributes.includes(`data-${prop}`)) {
            (node.dataset as any)[prop] = value;
            node.removeAttribute(prop);
          }
        });
        return () => cleanupFns.forEach((fn) => fn());
      }
    }, Object.values(props));

    return React.createElement(
      primitive.config.element,
      {
        [primitive.config.attribute]: '',
        ref: mergeRefs(forwardedRef, ref),
        ...omitEvents(rest),
      },
      children
    );
  });
}

/* ---------------------------------------------------------------------------------------------- */

const mapReactEventToNativeEvent: Record<string, keyof HTMLElementEventMap> = {
  onChange: 'input',
  onMouseEnter: 'mouseover',
  onMouseLeave: 'mouseout',
  onPointerEnter: 'pointerover',
  onPointerLeave: 'pointerout',
  onFocus: 'focusin',
  onBlur: 'focusout',
};

function mergeRefs(...refs: React.Ref<unknown>[]) {
  return function mergedRefs(node: HTMLElement) {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref.current as any) = node;
      }
    });
  };
}

function omitEvents<P>(props: P) {
  const entries = Object.entries(props).filter(([key]) => !key.startsWith('on'));
  return Object.fromEntries(entries);
}
