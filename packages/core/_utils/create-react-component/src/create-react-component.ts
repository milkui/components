import * as React from 'react';

/* -------------------------------------------------------------------------------------------------
 * createReactComponent
 * -----------------------------------------------------------------------------------------------*/

export function createReactComponent<P>(tagName: string) {
  if (!customElements.get(tagName)) return () => null;
  return React.forwardRef<HTMLElement, P>((props, forwardedRef) => {
    // @ts-ignore
    const { children, ...rest } = props;
    const ref = React.useRef<HTMLElement>(null);
    const nextProps = { ...omitEvents(rest), ref: mergeRefs(forwardedRef, ref) };

    React.useLayoutEffect(() => {
      const node = ref.current;
      let cleanupFns = [];
      if (node) {
        Object.entries(props).forEach(([prop, value]) => {
          const event = prop.startsWith('on')
            ? mapReactEventToNativeEvent[prop] || prop.slice(2).toLowerCase()
            : undefined;
          if (event) {
            node.addEventListener(event, value);
            cleanupFns = [...cleanupFns, () => node.removeEventListener(event, value)];
          }
        });
        return () => cleanupFns.forEach((fn) => fn());
      }
    }, Object.values(props));

    return React.createElement(tagName, nextProps, children);
  });
}

/* ---------------------------------------------------------------------------------------------- */

const mapReactEventToNativeEvent = {
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
  return Object.entries(props).reduce(
    (acc, [key, value]) => ({
      ...acc,
      ...(key.startsWith('on') ? {} : { [key]: value }),
    }),
    {}
  );
}
