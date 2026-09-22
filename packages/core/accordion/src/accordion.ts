import {
  CollapsibleContentPrimitive,
  CollapsibleRootPrimitive,
  CollapsibleTriggerPrimitive,
  type CollapsibleContextValue,
  type CollapsibleContentProps,
  type CollapsibleTriggerProps,
} from '@milkui/collapsible';
import {
  Primitive,
  createContext,
  createPrimitive,
  fragmentTarget,
  type Attributes,
  type AttributesFor,
  type PrimitiveOutput,
} from '@milkui/primitive';

type AccordionType = 'single' | 'multiple';
type AccordionOrientation = 'vertical' | 'horizontal';
type AccordionDir = 'ltr' | 'rtl';

type AccordionContextValue = {
  type: AccordionType;
  values: readonly string[];
  motion: boolean;
  disabled: boolean;
  collapsible: boolean;
  orientation: AccordionOrientation;
  dir: AccordionDir;
  triggers: ReadonlySet<HTMLElement>;
  registerTrigger(trigger: HTMLElement): () => void;
  setItemOpen(value: string, open: boolean): void;
};

type AccordionItemContextValue = {
  value: string;
  open: boolean;
  disabled: boolean;
  lockedOpen: boolean;
  triggerId: string;
  contentId: string;
};

const AccordionContext = /*#__PURE__*/ createContext<AccordionContextValue>({
  type: 'single',
  values: [],
  motion: false,
  disabled: false,
  collapsible: false,
  orientation: 'vertical',
  dir: 'ltr',
  triggers: new Set(),
  registerTrigger() {
    return () => {};
  },
  setItemOpen() {},
});

const AccordionItemContext = /*#__PURE__*/ createContext<AccordionItemContextValue>({
  value: '',
  open: false,
  disabled: false,
  lockedOpen: false,
  triggerId: '',
  contentId: '',
});

type AccordionSingleRootProps = {
  type?: 'single';
  value?: string;
  defaultValue?: string;
  onValueChange?(value: string): void;
  collapsible?: boolean;
  disabled?: boolean;
  orientation?: AccordionOrientation;
  dir?: AccordionDir;
};

type AccordionMultipleRootProps = {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?(value: string[]): void;
  disabled?: boolean;
  orientation?: AccordionOrientation;
  dir?: AccordionDir;
};

type AccordionRootProps = AccordionSingleRootProps | AccordionMultipleRootProps;
type AccordionRootPropKey = keyof AccordionSingleRootProps | keyof AccordionMultipleRootProps;

const connectedItems = new WeakMap<Element, AccordionItemPrimitive>();

class AccordionRootPrimitive extends Primitive<AccordionRootProps> {
  static tag = 'div' as const;
  static attribute: string = 'mlk-accordion-root';
  static defaultAttributes: AttributesFor<typeof AccordionRootPrimitive.tag> | null = null;
  static props: readonly string[] = [
    'type',
    'value',
    'defaultValue',
    'onValueChange',
    'collapsible',
    'disabled',
    'orientation',
    'dir',
  ] satisfies readonly AccordionRootPropKey[];

  static initialProps(element: HTMLElement): Partial<AccordionRootProps> {
    const type = element.getAttribute('data-type') === 'multiple' ? 'multiple' : 'single';
    return {
      type,
      defaultValue: initialValues(element, type),
      collapsible: element.hasAttribute('data-collapsible'),
      disabled: element.hasAttribute('data-disabled'),
      orientation:
        element.getAttribute('data-orientation') === 'horizontal' ? 'horizontal' : undefined,
      dir: element.getAttribute('dir') === 'rtl' ? 'rtl' : undefined,
    } as Partial<AccordionRootProps>;
  }

  #singleValue = typeof this.props.defaultValue === 'string' ? this.props.defaultValue : '';
  #multipleValue = Array.isArray(this.props.defaultValue) ? this.props.defaultValue : [];
  #triggers = new Set<HTMLElement>();
  #adopted = false;
  #motion = false;

  protected override connected() {
    const adopt = () => {
      const item = targetedItem(this.element!);
      if (!item || this.props.value !== undefined) return;
      const value = connectedItems.get(item)?.value ?? nativeItemValue(item);
      this.#singleValue = value;
      this.#multipleValue = [...new Set([...this.#multipleValue, value])];
    };
    if (!this.#adopted) {
      if (this.props.value === undefined) {
        const revealed = ownItems(this.element!)
          .filter(isRevealedItem)
          .map((item) => connectedItems.get(item)?.value ?? nativeItemValue(item));
        if (revealed.length) {
          this.#singleValue = revealed[0]!;
          this.#multipleValue = [...new Set([...this.#multipleValue, ...revealed])];
        }
      }
      adopt();
      this.#adopted = true;
    }
    const onHashChange = () => {
      adopt();
      this.refresh();
    };
    const view = this.element!.ownerDocument.defaultView!;
    view.addEventListener('hashchange', onHashChange);
    return () => view.removeEventListener('hashchange', onHashChange);
  }

  get type(): AccordionType {
    return this.props.type === 'multiple' ? 'multiple' : 'single';
  }

  get values() {
    if (this.type === 'multiple') {
      const value = this.props.value;
      return Array.isArray(value) ? value : this.#multipleValue;
    }
    const value = this.props.value;
    if (typeof value === 'string') return value ? [value] : [];
    return this.#singleValue ? [this.#singleValue] : [];
  }

  get disabled() {
    return this.props.disabled ?? false;
  }

  get collapsible() {
    return this.type === 'single' && 'collapsible' in this.props
      ? (this.props.collapsible ?? false)
      : false;
  }

  setItemOpen = (itemValue: string, open: boolean) => {
    if (this.disabled) return;
    this.#motion = true;
    const current = this.values;
    if (this.type === 'multiple') {
      const next = open
        ? current.includes(itemValue)
          ? current
          : [...current, itemValue]
        : current.filter((value) => value !== itemValue);
      if (sameValues(current, next)) return;
      if (this.props.value === undefined) {
        this.#multipleValue = next;
        this.refresh();
      }
      this.onValueChange(next);
      return;
    }

    const isOpen = current[0] === itemValue;
    const next = open ? itemValue : this.collapsible && isOpen ? '' : (current[0] ?? '');
    if (next === (current[0] ?? '')) return;
    if (this.props.value === undefined) {
      this.#singleValue = next;
      this.refresh();
    }
    this.onValueChange(next);
  };

  registerTrigger = (trigger: HTMLElement) => {
    this.#triggers.add(trigger);
    return () => this.#triggers.delete(trigger);
  };

  protected onValueChange(value: string | string[]) {
    const callback = this.props.onValueChange as ((value: string | string[]) => void) | undefined;
    callback?.(value);
    this.element?.dispatchEvent(
      new CustomEvent('mlk-accordion:value-change', { bubbles: true, detail: { value } }),
    );
  }

  protected override render() {
    this.provide(AccordionContext, {
      type: this.type,
      values: this.values,
      motion: this.#motion,
      disabled: this.disabled,
      collapsible: this.collapsible,
      orientation: this.props.orientation ?? 'vertical',
      dir: this.props.dir ?? 'ltr',
      triggers: this.#triggers,
      registerTrigger: this.registerTrigger,
      setItemOpen: this.setItemOpen,
    });

    return {
      attributes: {
        'data-disabled': this.disabled ? '' : undefined,
        'data-orientation': this.props.orientation ?? 'vertical',
        dir: this.props.dir,
      },
    };
  }
}

const Root = /*#__PURE__*/ createPrimitive(AccordionRootPrimitive);

/* -------------------------------------------------------------------------------------------------
 * AccordionItem
 * -----------------------------------------------------------------------------------------------*/

type AccordionItemProps = {
  value?: string;
  disabled?: boolean;
};

class AccordionItemPrimitive extends CollapsibleRootPrimitive<AccordionItemProps> {
  #nativeContentId: string | undefined;
  static override attribute: string = 'mlk-accordion-item';
  static override props: readonly string[] = [
    'value',
    'disabled',
  ] satisfies readonly (keyof AccordionItemProps)[];

  static override initialProps(element: HTMLElement): Partial<AccordionItemProps> {
    return {
      disabled: element.hasAttribute('data-disabled'),
    };
  }

  protected override connected() {
    const element = this.element!;
    if (!this.scope.parent) this.#nativeContentId = itemContent(element)?.id || undefined;
    connectedItems.set(element, this);
    const cleanup = super.connected();
    return () => {
      connectedItems.delete(element);
      cleanup();
    };
  }

  protected override adoptFragment() {}
  protected override handleFragmentChange() {}

  override toggle = () => {
    const root = this.accordionContext;
    const item = this.itemContextValue(root);
    if (item.disabled || item.lockedOpen) return;
    root.setItemOpen(item.value, !item.open);
  };

  protected override get motion() {
    return this.accordionContext.motion;
  }

  protected get accordionContext() {
    return this.consume(AccordionContext);
  }

  override get open() {
    return this.itemContextValue(this.accordionContext).open;
  }

  override get disabled() {
    return this.itemContextValue(this.accordionContext).disabled;
  }

  get value() {
    return this.props.value ?? this.#nativeContentId ?? this.id;
  }

  protected override get contentId() {
    return this.#nativeContentId ?? super.contentId;
  }

  protected itemContextValue(root: AccordionContextValue): AccordionItemContextValue {
    const value = this.value;
    const open = root.values.includes(value);
    const disabled = Boolean(root.disabled || this.props.disabled);
    return {
      value,
      open,
      disabled,
      lockedOpen: root.type === 'single' && open && !root.collapsible,
      triggerId: `${this.id}-trigger`,
      contentId: this.contentId,
    };
  }

  protected override get attributes(): Attributes {
    const { id, ...attributes } = super.attributes;
    return {
      ...attributes,
      'data-orientation': this.accordionContext.orientation,
    };
  }

  protected override render() {
    const root = this.accordionContext;
    const item = this.itemContextValue(root);

    this.provide(AccordionItemContext, item);
    return super.render();
  }
}

const Item = /*#__PURE__*/ createPrimitive(AccordionItemPrimitive);

/* -------------------------------------------------------------------------------------------------
 * AccordionHeader
 * -----------------------------------------------------------------------------------------------*/

type AccordionHeaderProps = object;

class AccordionHeaderPrimitive extends Primitive<AccordionHeaderProps> {
  static tag = 'h3' as const;
  static attribute: string = 'mlk-accordion-header';
  static defaultAttributes: AttributesFor<typeof AccordionHeaderPrimitive.tag> | null = null;
  static props: readonly string[] = [] satisfies readonly (keyof AccordionHeaderProps)[];

  protected override render() {
    const root = this.consume(AccordionContext);
    const item = this.consume(AccordionItemContext);
    return {
      attributes: {
        'data-open': item.open ? '' : undefined,
        'data-disabled': item.disabled ? '' : undefined,
        'data-orientation': root.orientation,
      },
    };
  }
}

const Header = /*#__PURE__*/ createPrimitive(AccordionHeaderPrimitive);

/* -------------------------------------------------------------------------------------------------
 * AccordionTrigger
 * -----------------------------------------------------------------------------------------------*/

type AccordionTriggerProps = CollapsibleTriggerProps;

class AccordionTriggerPrimitive extends CollapsibleTriggerPrimitive {
  static override attribute: string = 'mlk-accordion-trigger';

  #unregisterTrigger: (() => void) | undefined;
  #registeredRoot: AccordionContextValue['registerTrigger'] | undefined;

  protected override connected() {
    return () => {
      this.#unregisterTrigger?.();
      this.#unregisterTrigger = undefined;
      this.#registeredRoot = undefined;
    };
  }

  protected override layout() {
    const root = this.accordionContext;
    const disabled = this.getDisabled(this.disclosureContext);
    if (disabled || !this.element) {
      this.#unregisterTrigger?.();
      this.#unregisterTrigger = undefined;
      this.#registeredRoot = undefined;
      return;
    }
    if (this.#registeredRoot === root.registerTrigger) return;
    this.#unregisterTrigger?.();
    this.#registeredRoot = root.registerTrigger;
    this.#unregisterTrigger = root.registerTrigger(this.element);
  }

  protected get accordionContext() {
    return this.consume(AccordionContext);
  }

  protected get itemContext() {
    return this.consume(AccordionItemContext);
  }

  protected override getAttributes(root: CollapsibleContextValue): Attributes {
    const item = this.itemContext;
    return {
      ...super.getAttributes(root),
      id: item.triggerId || undefined,
      'aria-disabled':
        root.enhanced && (item.lockedOpen || this.getDisabled(root)) ? 'true' : undefined,
      'data-orientation': this.accordionContext.orientation,
    };
  }

  protected override getEvents(root: CollapsibleContextValue): PrimitiveOutput['events'] {
    return { ...super.getEvents(root), onKeyDown: this.handleKeyDown };
  }

  protected override handleKeyDown = (event: Event) => {
    if ((event as KeyboardEvent).key === ' ') {
      this.handleSpace(event);
      return;
    }
    const key = 'key' in event && typeof event.key === 'string' ? event.key : '';
    const root = this.accordionContext;
    const direction = keyDirection(key, root.orientation, root.dir);
    if (!direction) return;
    const triggers = accordionTriggers(root);
    if (!triggers.length) return;
    const currentIndex = triggers.indexOf(this.element!);
    if (currentIndex === -1) return;
    event.preventDefault();
    const next =
      direction === 'first'
        ? triggers[0]
        : direction === 'last'
          ? triggers[triggers.length - 1]
          : triggers[(currentIndex + direction + triggers.length) % triggers.length];
    next?.focus();
  };
}

const Trigger = /*#__PURE__*/ createPrimitive(AccordionTriggerPrimitive);

/* -------------------------------------------------------------------------------------------------
 * AccordionContent
 * -----------------------------------------------------------------------------------------------*/

type AccordionContentProps = CollapsibleContentProps;

class AccordionContentPrimitive extends CollapsibleContentPrimitive {
  static override attribute: string = 'mlk-accordion-content';

  protected override get sizeVariablePrefix() {
    return '--mlk-accordion-content';
  }

  protected override getAttributes(root: CollapsibleContextValue): Attributes {
    const item = this.consume(AccordionItemContext);
    const accordion = this.consume(AccordionContext);
    return {
      ...super.getAttributes(root),
      role: root.enhanced ? 'region' : undefined,
      'aria-labelledby': root.enhanced ? item.triggerId : undefined,
      'data-orientation': accordion.orientation,
    };
  }
}

const Content = /*#__PURE__*/ createPrimitive(AccordionContentPrimitive);

/* ---------------------------------------------------------------------------------------------- */

export { Root, Item, Header, Trigger, Content, AccordionRootPrimitive };
export type {
  AccordionOrientation,
  AccordionDir,
  AccordionType,
  AccordionRootProps,
  AccordionItemProps,
  AccordionHeaderProps,
  AccordionTriggerProps,
  AccordionContentProps,
};

function ownItems(element: HTMLElement) {
  return [...element.querySelectorAll<HTMLElement>('[mlk-accordion-item]')].filter(
    (item) => item.closest('[mlk-accordion-root]') === element,
  );
}

function targetedItem(element: HTMLElement) {
  const target = fragmentTarget(element.ownerDocument);
  return target && ownItems(element).find((item) => item === target || item.contains(target));
}

function isRevealedItem(item: HTMLElement) {
  const content = itemContent(item);
  return item.hasAttribute('data-open') || Boolean(content?.id && !content.hasAttribute('hidden'));
}

function itemContent(item: HTMLElement) {
  return [...item.querySelectorAll<HTMLElement>('[mlk-accordion-content]')].find(
    (content) => content.closest('[mlk-accordion-item]') === item,
  );
}

function nativeItemValue(item: HTMLElement) {
  return itemContent(item)?.id || item.id;
}

function initialValues(element: HTMLElement, type: AccordionType) {
  const target = targetedItem(element);
  const items = ownItems(element).filter(isRevealedItem);
  if (type === 'single' && target) return nativeItemValue(target);
  if (target && !items.includes(target)) items.push(target);
  const values = items.map(nativeItemValue);
  return type === 'multiple' ? values : (values[0] ?? '');
}

function sameValues(left: readonly string[], right: readonly string[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function keyDirection(
  key: string,
  orientation: AccordionOrientation,
  dir: AccordionDir,
): -1 | 1 | 'first' | 'last' | undefined {
  switch (key) {
    case 'Home':
      return 'first';
    case 'End':
      return 'last';
    case 'ArrowDown':
      return orientation === 'vertical' ? 1 : undefined;
    case 'ArrowUp':
      return orientation === 'vertical' ? -1 : undefined;
    case 'ArrowRight':
      return orientation === 'horizontal' ? (dir === 'rtl' ? -1 : 1) : undefined;
    case 'ArrowLeft':
      return orientation === 'horizontal' ? (dir === 'rtl' ? 1 : -1) : undefined;
  }
}

function accordionTriggers(root: AccordionContextValue) {
  return Array.from(root.triggers)
    .filter(
      (trigger) =>
        trigger.isConnected &&
        !trigger.hasAttribute('data-disabled') &&
        !trigger.hasAttribute('disabled'),
    )
    .sort((left, right) => {
      if (left === right) return 0;
      const position = left.compareDocumentPosition(right);
      return position & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1;
    });
}
