import {
  Primitive,
  createContext,
  createPrimitive,
  measure,
  containsFragment,
  type Attributes,
  type AttributesFor,
  type PrimitiveOutput,
} from '../primitive/index.js';

/* -------------------------------------------------------------------------------------------------
 * Collapsible
 * -----------------------------------------------------------------------------------------------*/

type CollapsibleContextValue = {
  open: boolean;
  disabled: boolean;
  contentId: string;
  rootId: string;
  enhanced: boolean;
  toggle(): void;
};

const CollapsibleContext = /*#__PURE__*/ createContext<CollapsibleContextValue>('Collapsible.Root');

type CollapsibleRootProps = {
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  onOpenChange?(open: boolean): void;
};

class CollapsibleRootPrimitive<Props extends CollapsibleRootProps = CollapsibleRootProps> extends Primitive<Props> {
  static tag = 'div' as const;
  static attribute: string = 'mlk-collapsible-root';
  static defaultAttributes: AttributesFor<typeof CollapsibleRootPrimitive.tag> | null = null;
  static props: readonly string[] = [
    'open',
    'defaultOpen',
    'disabled',
    'onOpenChange',
  ] satisfies readonly (keyof CollapsibleRootProps)[];

  static initialProps(element: HTMLElement): Partial<CollapsibleRootProps> {
    return {
      defaultOpen: element.hasAttribute('data-open'),
      disabled: element.hasAttribute('data-disabled'),
    };
  }

  #open = this.props.defaultOpen ?? false;
  #enhanced = false;
  #adopted = false;
  #nativeContentId: string | undefined;

  protected override connected() {
    if (!this.#adopted) {
      this.adoptFragment();
      this.#adopted = true;
    }
    this.#enhanced = true;
    const onHashChange = () => this.handleFragmentChange();
    const view = this.element!.ownerDocument.defaultView!;
    view.addEventListener('hashchange', onHashChange);
    return () => {
      view.removeEventListener('hashchange', onHashChange);
      this.#enhanced = false;
      this.element?.removeAttribute('data-interactive');
    };
  }

  protected handleFragmentChange() {
    if (!containsFragment(this.element!)) return;
    if (this.props.open === undefined) this.#open = true;
    this.onOpenChange(true);
    this.refresh();
  }

  protected adoptFragment() {
    const content = [...this.element!.querySelectorAll('[mlk-collapsible-content]')].find((element) => {
      const root = element.closest('[mlk-collapsible-root]');
      return !root || root === this.element;
    });
    if (!this.scope.parent) this.#nativeContentId = content?.id || undefined;
    if (
      this.props.open === undefined &&
      (containsFragment(this.element!) || (content?.id && !content.hasAttribute('hidden')))
    ) {
      this.#open = true;
    }
  }

  protected get enhanced() {
    return this.#enhanced;
  }

  get open(): boolean {
    return this.props.open ?? this.#open;
  }

  get disabled(): boolean {
    return this.props.disabled ?? false;
  }

  toggle = () => {
    if (this.disabled) return;
    const next = !this.open;
    if (this.props.open === undefined) {
      this.#open = next;
      this.refresh();
    }
    this.onOpenChange(next);
  };

  protected get contentId() {
    return this.#nativeContentId ?? `${this.id}-content`;
  }

  protected get contextValue(): CollapsibleContextValue {
    return {
      open: this.open,
      disabled: this.disabled,
      contentId: this.contentId,
      rootId: this.id,
      enhanced: this.enhanced,
      toggle: this.toggle,
    };
  }

  protected get attributes(): Attributes {
    return {
      id: this.id,
      'data-interactive': this.enhanced ? '' : undefined,
      'data-open': this.open ? '' : undefined,
      'data-disabled': this.disabled ? '' : undefined,
    };
  }

  protected onOpenChange(open: boolean) {
    this.props.onOpenChange?.(open);
    this.element?.dispatchEvent(new CustomEvent('mlk-collapsible:open-change', { bubbles: true, detail: { open } }));
  }

  protected override render() {
    this.provide(CollapsibleContext, this.contextValue);

    return {
      attributes: this.attributes,
    };
  }
}

const Root = /*#__PURE__*/ createPrimitive(CollapsibleRootPrimitive<CollapsibleRootProps>);

/* -------------------------------------------------------------------------------------------------
 * CollapsibleTrigger
 * -----------------------------------------------------------------------------------------------*/

type CollapsibleTriggerProps = { disabled?: boolean };

class CollapsibleTriggerPrimitive extends Primitive<CollapsibleTriggerProps> {
  static tag = 'a' as const;
  static attribute: string = 'mlk-collapsible-trigger';
  static defaultAttributes: AttributesFor<typeof CollapsibleTriggerPrimitive.tag> = {
    draggable: 'false',
  };
  static props: readonly string[] = ['disabled'] satisfies readonly (keyof CollapsibleTriggerProps)[];

  static initialProps(element: HTMLElement): Partial<CollapsibleTriggerProps> {
    return {
      disabled: element.hasAttribute('disabled'),
    };
  }

  protected handleClick = (event: Event) => {
    const mouse = event as MouseEvent;
    if (mouse.metaKey || mouse.ctrlKey || mouse.shiftKey || mouse.altKey || mouse.button > 0) return;
    const target = this.element?.getAttribute('target');
    if ((target && target !== '_self') || this.element?.hasAttribute('download')) return;
    const root = this.disclosureContext;
    if (!root.enhanced) return;
    if (this.getDisabled(root)) {
      event.preventDefault();
      return;
    }
    root.toggle();
    event.preventDefault();
  };

  protected handleKeyDown = (event: Event) => this.handleSpace(event);

  protected handleSpace(event: Event) {
    if ((event as KeyboardEvent).key !== ' ' || !this.disclosureContext.enhanced) return;
    if (this.element?.tagName === 'BUTTON') return;
    if (!this.getDisabled(this.disclosureContext)) this.disclosureContext.toggle();
    event.preventDefault();
  }

  protected get disclosureContext() {
    return this.consume(CollapsibleContext);
  }

  protected getDisabled(root: CollapsibleContextValue) {
    return Boolean(this.props.disabled || root.disabled);
  }

  protected getAttributes(root: CollapsibleContextValue): Attributes {
    const disabled = this.getDisabled(root);
    return {
      href: root.contentId ? `#${root.contentId}` : undefined,
      role: root.enhanced ? 'button' : undefined,
      'aria-disabled': root.enhanced && disabled ? 'true' : undefined,
      disabled: this.element?.tagName === 'BUTTON' && disabled ? true : undefined,
      'aria-controls': root.enhanced ? root.contentId : undefined,
      'aria-expanded': root.enhanced ? String(root.open) : undefined,
      'data-open': root.open ? '' : undefined,
      'data-disabled': disabled ? '' : undefined,
    };
  }

  protected getEvents(_root: CollapsibleContextValue): PrimitiveOutput['events'] {
    return { onClick: this.handleClick, onKeyDown: this.handleKeyDown };
  }

  protected override render() {
    const root = this.disclosureContext;
    return {
      attributes: this.getAttributes(root),
      events: this.getEvents(root),
    };
  }
}

const Trigger = /*#__PURE__*/ createPrimitive(CollapsibleTriggerPrimitive);

/* -------------------------------------------------------------------------------------------------
 * CollapsibleContent
 * -----------------------------------------------------------------------------------------------*/

type CollapsibleContentProps = {};

class CollapsibleContentPrimitive extends Primitive<CollapsibleContentProps> {
  static tag = 'div' as const;
  static attribute: string = 'mlk-collapsible-content';
  static defaultAttributes: AttributesFor<typeof CollapsibleContentPrimitive.tag> = {
    hidden: 'until-found',
  };
  #wasOpen = false;
  #style: Record<string, string> = {};

  protected override connected() {
    const element = this.element!;
    const reveal = (event: Event) => {
      if (event.target !== element) return;
      const root = this.disclosureContext;
      if (!root.open) root.toggle();
    };
    element.addEventListener('beforematch', reveal);
    return () => {
      element.removeEventListener('beforematch', reveal);
      this.#wasOpen = false;
    };
  }

  protected override layout(element: HTMLElement) {
    const open = this.disclosureContext.open;
    if (this.#wasOpen === open) return;
    this.#wasOpen = open;
    if (!open) return;
    const { height, width } = measure(element);
    this.#style = {
      [`${this.sizeVariablePrefix}-height`]: height,
      [`${this.sizeVariablePrefix}-width`]: width,
    };
    this.refresh();
  }

  protected get sizeVariablePrefix() {
    return '--mlk-collapsible-content';
  }

  protected get disclosureContext() {
    return this.consume(CollapsibleContext);
  }

  protected getAttributes(root: CollapsibleContextValue): Attributes {
    return {
      id: root.contentId || undefined,
      hidden: root.open ? undefined : CollapsibleContentPrimitive.defaultAttributes.hidden,
      'data-open': root.open ? '' : undefined,
      'data-disabled': root.disabled ? '' : undefined,
    };
  }

  protected getStyle() {
    return this.#style;
  }

  protected override render() {
    const root = this.disclosureContext;
    return {
      attributes: this.getAttributes(root),
      style: this.getStyle(),
    };
  }
}

const Content = /*#__PURE__*/ createPrimitive(CollapsibleContentPrimitive);

/* ---------------------------------------------------------------------------------------------- */

export {
  Root,
  Trigger,
  Content,
  CollapsibleRootPrimitive,
  CollapsibleTriggerPrimitive,
  CollapsibleContentPrimitive,
  CollapsibleContext,
};
export type { CollapsibleContextValue, CollapsibleRootProps, CollapsibleTriggerProps, CollapsibleContentProps };
