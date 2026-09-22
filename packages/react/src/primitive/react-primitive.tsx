import * as React from 'react';
import { Slot } from 'radix-ui';
import type { Primitive, PrimitiveDefinition, PrimitiveScope } from '@milkui/core/primitive';

type NativeTag = keyof HTMLElementTagNameMap & keyof React.JSX.IntrinsicElements;
type DOMProps = Record<string, unknown>;
const ScopeContext = React.createContext<PrimitiveScope | undefined>(undefined);
const useLayoutEffect = typeof document === 'undefined' ? React.useEffect : React.useLayoutEffect;

/** The sole React bridge: component-specific primitive stays in the native definition. */
export function createReactComponent<
  P extends object,
  Tag extends NativeTag,
  PrimitiveInstance extends Primitive<P>,
>(part: PrimitiveDefinition<P, Tag, PrimitiveInstance>) {
  type Props = Omit<React.ComponentPropsWithoutRef<Tag>, keyof P> & P & { asChild?: boolean };
  const Component = React.forwardRef<HTMLElementTagNameMap[Tag], Props>((props, forwardedRef) => {
    const { asChild, children, ...elementProps } = props as DOMProps;
    delete elementProps.ref;
    const primitiveProps = {} as P;
    for (const key of part.props) {
      // Include undefined so removing a prop also clears it on the primitive.
      primitiveProps[key] = (props as P)[key];
      delete elementProps[key as string];
    }
    const parent = React.useContext(ScopeContext);
    const id = React.useId();
    const [primitive] = React.useState(() =>
      part.create(primitiveProps, {
        id: ((props as DOMProps).id as string | undefined) ?? id,
        parent,
      }),
    );
    const snapshot = React.useSyncExternalStore(
      primitive.subscribe,
      primitive.getSnapshot,
      primitive.getSnapshot,
    );
    const composedRef = React.useCallback(
      (node: HTMLElementTagNameMap[Tag] | null) => {
        if (node) primitive.connect(node, true);
        else primitive.disconnect();
        const ref = forwardedRef as React.Ref<HTMLElementTagNameMap[Tag]>;
        const cleanup = typeof ref === 'function' ? ref(node) : undefined;
        if (ref && typeof ref !== 'function') ref.current = node;
        return () => {
          primitive.disconnect();
          if (typeof cleanup === 'function') cleanup();
          else if (typeof ref === 'function') ref(null);
          else if (ref) ref.current = null;
        };
      },
      [primitive, forwardedRef],
    );

    useLayoutEffect(() => {
      primitive.setParent(parent);
      primitive.update(primitiveProps);
      // A changed snapshot needs another React commit before measuring its DOM.
      if (primitive.getSnapshot() === snapshot) primitive.commit();
    });

    // Defaults fill missing values; behavior output owns its attributes, including removals.
    for (const [name, value] of Object.entries(part.defaultAttributes ?? {})) {
      if (elementProps[name] === undefined) elementProps[name] = value;
    }
    Object.assign(elementProps, snapshot.attributes, { [part.attribute]: '' });
    // React treats lowercase hidden as boolean; uppercase preserves the HTML enum value.
    if (part.defaultAttributes?.hidden === 'until-found') {
      elementProps.HIDDEN = elementProps.hidden;
      delete elementProps.hidden;
    }
    elementProps.style = { ...snapshot.style, ...(elementProps.style as object) };
    elementProps.ref = composedRef;

    for (const name of Object.keys(snapshot.events ?? {})) {
      const reactHandler = elementProps[name] as
        | ((event: React.SyntheticEvent<HTMLElement, Event>) => void)
        | undefined;
      elementProps[name] = (event: React.SyntheticEvent<HTMLElement, Event>) => {
        reactHandler?.(event);
        if (!event.defaultPrevented) primitive.dispatch(name, event.nativeEvent);
      };
    }

    const node = asChild ? (
      <Slot.Root {...elementProps}>{children as React.ReactNode}</Slot.Root>
    ) : (
      React.createElement(part.tag, elementProps, children as React.ReactNode)
    );
    return primitive.scope.values.size > 0 ? (
      <ScopeContext.Provider value={primitive.scope}>{node}</ScopeContext.Provider>
    ) : (
      node
    );
  });
  Component.displayName = part.attribute;
  return Component;
}
