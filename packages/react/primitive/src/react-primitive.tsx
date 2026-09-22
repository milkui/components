import * as React from 'react';
import { Slot } from 'radix-ui';
import type { Primitive, PrimitiveDefinition, PrimitiveScope } from '@milkui/primitive';

type NativeTag = keyof HTMLElementTagNameMap & keyof React.JSX.IntrinsicElements;
type DOMProps = Record<string, unknown>;
type AnyRef = React.Ref<HTMLElement> | undefined;
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
    const { asChild, children } = props as Props & { children?: React.ReactNode };
    const primitiveProps = Object.fromEntries(
      part.props.map((key) => [key, (props as DOMProps)[key as string]]),
    ) as P;
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
    const element = React.useRef<HTMLElement | null>(null);
    const connect = React.useCallback(
      (node: HTMLElement | null) => {
        if (element.current === node) return;
        primitive.disconnect();
        element.current = node;
        if (node) primitive.connect(node, true);
      },
      [primitive],
    );
    const composedRef = React.useCallback(
      (node: HTMLElement | null) => {
        connect(node);
        const cleanup = assignRef(forwardedRef as AnyRef, node);
        return () => {
          cleanup();
          connect(null);
        };
      },
      [connect, forwardedRef],
    );

    useLayoutEffect(() => {
      primitive.setParent(parent);
      // All declared keys are forwarded, including undefined when a prop was removed.
      primitive.update(primitiveProps);
      if (primitive.getSnapshot() === snapshot) primitive.commit();
    });
    useLayoutEffect(
      () => () => {
        primitive.disconnect();
      },
      [primitive],
    );

    const elementProps: DOMProps = {};
    assignDefinedProps(elementProps, props as DOMProps);

    delete elementProps.asChild;
    delete elementProps.children;
    delete elementProps.ref;

    for (const key of part.props) delete elementProps[key as string];
    // Defaults fill missing values; behavior output owns its attributes, including removals.
    const attributes: DOMProps = {};
    for (const [name, value] of Object.entries(part.defaultAttributes ?? {})) {
      const explicit = elementProps[name];
      attributes[name] = explicit === undefined ? value : explicit;
    }
    Object.assign(attributes, snapshot.attributes, { [part.attribute]: '' });
    // React treats lowercase hidden as boolean; uppercase preserves the HTML enum value.
    if (part.defaultAttributes?.hidden === 'until-found') {
      attributes.HIDDEN = attributes.hidden;
      delete attributes.hidden;
    }
    Object.assign(elementProps, attributes);
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
      <Slot.Root {...elementProps}>{children}</Slot.Root>
    ) : (
      React.createElement(part.tag, elementProps, children)
    );
    return primitive.scope.values.size > 0 ? (
      <ScopeContext.Provider value={primitive.scope}>{node}</ScopeContext.Provider>
    ) : node;
  });
  Component.displayName = part.attribute;
  return Component;
}

function assignRef(ref: AnyRef, node: HTMLElement | null): () => void {
  if (typeof ref === 'function') {
    const cleanup = ref(node);
    return typeof cleanup === 'function' ? cleanup : () => ref(null);
  }
  if (ref) {
    ref.current = node;
    return () => {
      ref.current = null;
    };
  }
  return () => {};
}

function assignDefinedProps(target: DOMProps, props: DOMProps) {
  for (const [name, value] of Object.entries(props)) {
    if (value !== undefined) target[name] = value;
  }
}
