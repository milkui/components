import type { HTMLAttributes } from 'dom-types/native';

export type Attributes = Record<string, string | number | boolean | undefined>;
/** Native HTML names and serializable values; listeners belong in primitive events. */
export type AttributesFor<Tag extends keyof HTMLElementTagNameMap> = Tag extends 'button'
  ? Omit<NativeAttributes<Tag>, 'type'> & { type?: HTMLButtonElement['type'] }
  : NativeAttributes<Tag>;

// dom-types still models hidden as boolean; HTML also defines the until-found state.
type NativeAttributes<Tag extends keyof HTMLElementTagNameMap> = Omit<
  SerializableAttributes<HTMLAttributes<Tag>>,
  'hidden'
> & { hidden?: boolean | '' | 'hidden' | 'until-found' };

type SerializableAttributes<T> = {
  [Key in keyof T as Key extends `on${string}` ? never : Key]?: Extract<T[Key], string | number | boolean | undefined>;
};

export type PrimitiveOutput = {
  attributes?: Attributes;
  style?: Record<string, string>;
  events?: Record<string, (event: Event) => void>;
};
export type PrimitiveScope = { parent?: PrimitiveScope; values: Map<object, unknown> };
export type PrimitiveOptions = { id?: string; parent?: PrimitiveScope };
type Cleanup = () => void;

export interface PrimitiveContext<T> {
  readonly defaultValue: T;
  readonly consumers: Set<Primitive<any>>;
}

export function createContext<T>(defaultValue: T): PrimitiveContext<T> {
  return { defaultValue, consumers: new Set() };
}

const attached = new WeakMap<Element, Set<Primitive<any>>>();
let nextId = 0;

/** A primitive can render on the server; DOM work starts only at connect(). */
export abstract class Primitive<Props extends object = object> {
  readonly id: string;
  readonly scope: PrimitiveScope;
  protected props: Readonly<Props>;
  protected element: HTMLElement | null = null;
  #snapshot: PrimitiveOutput = {};
  #listeners = new Set<() => void>();
  #contexts = new Set<PrimitiveContext<any>>();
  #changedContexts = new Set<PrimitiveContext<any>>();
  #eventCleanups: Cleanup[] = [];
  #connectionCleanup: Cleanup | void = undefined;
  #managed = false;
  #connected = false;
  #rendering = false;
  #destroyed = false;

  constructor(props: Props, options: PrimitiveOptions = {}) {
    this.props = props;
    this.id = options.id ?? `milkui-${++nextId}`;
    this.scope = { parent: options.parent, values: new Map() };
  }

  getSnapshot = () => this.#snapshot;
  subscribe = (listener: () => void) => {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  };

  /** Native updates are patches; undefined explicitly clears a property. */
  update(props: Partial<Props>) {
    if (
      this.#destroyed ||
      Object.entries(props).every(([key, value]) => Object.is(this.props[key as keyof Props], value))
    )
      return;
    this.props = { ...this.props, ...props };
    this.refresh();
  }

  setParent(parent: PrimitiveScope | undefined) {
    if (this.scope.parent === parent) return;
    this.scope.parent = parent;
    this.refresh();
  }

  connect(element: HTMLElement, managed = false) {
    if (this.element === element && this.#connected) return;
    this.disconnect();
    this.element = element;
    this.#managed = managed;
    this.#connected = true;
    const primitives = attached.get(element) ?? new Set();
    primitives.add(this);
    attached.set(element, primitives);
    this.#connectionCleanup = this.connected();
    this.refresh();
    for (const context of this.scope.values.keys()) this.#notifyContext(context as PrimitiveContext<unknown>);
  }

  disconnect() {
    if (!this.#connected) return;
    this.#connected = false;
    this.#connectionCleanup?.();
    this.#connectionCleanup = undefined;
    this.#clearEvents();
    for (const context of this.#contexts) context.consumers.delete(this);
    if (this.element) attached.get(this.element)?.delete(this);
    this.element = null;
    for (const context of this.scope.values.keys()) this.#notifyContext(context as PrimitiveContext<unknown>);
  }

  destroy() {
    this.disconnect();
    this.#listeners.clear();
    this.#destroyed = true;
  }

  /** Framework adapters call commit after their children have reached the DOM. */
  commit() {
    if (this.element && this.#connected) this.layout(this.element);
  }

  /** Refresh also resolves context again, so a moved native part cannot act on its old provider. */
  refresh = () => {
    if (this.#rendering || this.#destroyed) return;
    this.#rendering = true;
    const previousContexts = this.#contexts;
    this.#contexts = new Set();
    let output: PrimitiveOutput;
    try {
      output = this.render();
    } finally {
      this.#rendering = false;
    }
    for (const context of previousContexts) {
      if (!this.#contexts.has(context)) context.consumers.delete(this);
    }
    const previous = this.#snapshot;
    const changed =
      !sameRecord(previous.attributes, output.attributes) ||
      !sameRecord(previous.style, output.style) ||
      !sameRecord(previous.events, output.events);
    if (changed) this.#snapshot = output;
    if (this.element && !this.#managed) {
      applyAttributes(this.element, output.attributes ?? {}, previous.attributes);
      for (const name of Object.keys(previous.style ?? {})) {
        if (!(name in (output.style ?? {}))) this.element.style.removeProperty(name);
      }
      for (const [name, value] of Object.entries(output.style ?? {})) this.element.style.setProperty(name, value);
      this.#syncEvents();
    }
    if (changed) for (const listener of [...this.#listeners]) listener();
    const contexts = [...this.#changedContexts];
    this.#changedContexts.clear();
    if (this.#connected) for (const context of contexts) this.#notifyContext(context);
    if (!this.#managed) this.commit();
  };

  /** Event routing is shared by native listeners and framework synthetic events. */
  dispatch(name: string, event: Event) {
    if (event.defaultPrevented || this.#destroyed) return;
    this.refresh();
    this.#snapshot.events?.[name]?.(event);
  }

  protected consume<T>(context: PrimitiveContext<T>): T {
    this.#contexts.add(context);
    if (this.#connected) context.consumers.add(this);
    let scope = this.scope.parent;
    while (scope) {
      if (scope.values.has(context)) return scope.values.get(context) as T;
      scope = scope.parent;
    }
    if (!this.scope.parent) {
      let ancestor = this.element?.parentElement;
      while (ancestor) {
        for (const primitive of attached.get(ancestor) ?? []) {
          if (primitive.scope.values.has(context)) return primitive.scope.values.get(context) as T;
        }
        ancestor = ancestor.parentElement;
      }
    }
    return context.defaultValue;
  }

  protected provide<T>(context: PrimitiveContext<T>, value: T) {
    const previous = this.scope.values.get(context);
    this.scope.values.set(context, value);
    if (!sameValue(previous, value)) this.#changedContexts.add(context);
  }

  protected connected(): Cleanup | void {}
  protected layout(_element: HTMLElement): void {}
  protected abstract render(): PrimitiveOutput;

  #notifyContext(context: PrimitiveContext<unknown>) {
    for (const consumer of [...context.consumers]) if (consumer !== this) consumer.refresh();
  }

  #syncEvents() {
    this.#clearEvents();
    const element = this.element!;
    for (const name of Object.keys(this.#snapshot.events ?? {})) {
      const type = name.slice(2).toLowerCase();
      const handler = (event: Event) => this.dispatch(name, event);
      element.addEventListener(type, handler);
      this.#eventCleanups.push(() => element.removeEventListener(type, handler));
    }
  }

  #clearEvents() {
    for (const cleanup of this.#eventCleanups) cleanup();
    this.#eventCleanups = [];
  }
}

function sameValue(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (left && right && typeof left === 'object' && typeof right === 'object') return sameRecord(left, right);
  return false;
}

function sameRecord(left: object | undefined, right: object | undefined): boolean {
  const a = left ?? {};
  const b = right ?? {};
  return (
    Object.keys(a).length === Object.keys(b).length &&
    Object.entries(a).every(([key, value]) => Object.is(value, (b as Record<string, unknown>)[key]))
  );
}

export function applyAttributes(element: HTMLElement, attributes: Attributes, previous: Attributes = {}) {
  for (const name of new Set([...Object.keys(previous), ...Object.keys(attributes)])) {
    const value = attributes[name];
    if (value === undefined || value === false) element.removeAttribute(name);
    else element.setAttribute(name, value === true ? '' : String(value));
  }
}

export interface PrimitiveDefinition<
  P extends object = any,
  Tag extends keyof HTMLElementTagNameMap = keyof HTMLElementTagNameMap,
  PrimitiveInstance extends Primitive<P> = Primitive<P>,
> {
  readonly attribute: string;
  readonly tag: Tag;
  readonly props: readonly (keyof P)[];
  readonly defaultAttributes: AttributesFor<Tag> | null;
  create(props: P, options?: PrimitiveOptions): PrimitiveInstance;
  mount(element: HTMLElement, props?: Partial<P>): PrimitiveInstance;
  get(element: Element): PrimitiveInstance | undefined;
  update(element: Element, props: Partial<P>): PrimitiveInstance | undefined;
  unmount(element: Element): void;
}

export type PrimitiveConstructor<
  P extends object,
  Tag extends keyof HTMLElementTagNameMap,
  PrimitiveInstance extends Primitive<P> = Primitive<P>,
> = {
  new (props: P, options?: PrimitiveOptions): PrimitiveInstance;
  readonly tag: Tag;
  readonly attribute: string;
  readonly props?: readonly string[];
  readonly defaultAttributes: AttributesFor<Tag> | null;
  initialProps?(element: HTMLElement): Partial<P>;
};

export function createPrimitive<
  P extends object,
  Tag extends keyof HTMLElementTagNameMap,
  PrimitiveInstance extends Primitive<P>,
  Defaults extends AttributesFor<NoInfer<Tag>> | null,
>(
  PrimitiveClass: PrimitiveConstructor<P, Tag, PrimitiveInstance> & {
    readonly defaultAttributes: Defaults &
      (Record<Exclude<keyof NonNullable<Defaults>, keyof AttributesFor<NoInfer<Tag>>>, never> | null);
  },
): PrimitiveDefinition<P, Tag, PrimitiveInstance> {
  const instances = new WeakMap<Element, PrimitiveInstance>();
  const props = (PrimitiveClass.props ?? []) as readonly (keyof P)[];
  const part: PrimitiveDefinition<P, Tag, PrimitiveInstance> = {
    attribute: PrimitiveClass.attribute,
    tag: PrimitiveClass.tag,
    props,
    defaultAttributes: PrimitiveClass.defaultAttributes,
    create(props, options) {
      const instance = new PrimitiveClass(props, options);
      instance.refresh();
      return instance;
    },
    mount(element, props = {}) {
      const existing = instances.get(element);
      if (existing) {
        existing.update(props);
        existing.refresh();
        return existing;
      }
      const propsWithDefaults = { ...PrimitiveClass.initialProps?.(element), ...props } as P;
      const primitive = part.create(propsWithDefaults, { id: element.id || undefined });
      instances.set(element, primitive);
      primitive.connect(element);
      return primitive;
    },
    get: (element) => instances.get(element),
    update(element, props) {
      const primitive = instances.get(element);
      primitive?.update(props);
      return primitive;
    },
    unmount(element) {
      instances.get(element)?.destroy();
      instances.delete(element);
    },
  };
  return part;
}
