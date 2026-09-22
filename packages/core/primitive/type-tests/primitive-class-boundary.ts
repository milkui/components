import type { AttributesFor, Primitive, createPrimitive } from '../src/index.js';

type Expect<T extends true> = T;
type Equal<Left, Right> =
  (<T>() => T extends Left ? 1 : 2) extends <T>() => T extends Right ? 1 : 2 ? true : false;

declare const createPrimitiveForTypeTest: typeof createPrimitive;

type ContentProps = { disabled?: boolean };

declare class CompletePrimitive extends Primitive<ContentProps> {
  static tag: 'div';
  static attribute: string;
  static props: readonly ['disabled'];
  static defaultAttributes: AttributesFor<'div'> | null;
  static initialProps(element: HTMLElement): Partial<ContentProps>;
  protected render(): {};
}

declare class MissingTagPrimitive extends Primitive<ContentProps> {
  static attribute: string;
  static defaultAttributes: AttributesFor<'div'> | null;
  protected render(): {};
}

declare class MissingAttributePrimitive extends Primitive<ContentProps> {
  static tag: 'div';
  static defaultAttributes: AttributesFor<'div'> | null;
  protected render(): {};
}

declare class InvalidTagPrimitive extends Primitive<ContentProps> {
  static tag: 'not-an-html-tag';
  static attribute: string;
  static defaultAttributes: AttributesFor<'div'> | null;
  protected render(): {};
}

declare class MissingDefaultAttributesPrimitive extends Primitive<ContentProps> {
  static tag: 'div';
  static attribute: string;
  protected render(): {};
}

declare class NullDefaultAttributesPrimitive extends Primitive<ContentProps> {
  static tag: 'div';
  static attribute: string;
  static defaultAttributes: null;
  protected render(): {};
}

declare class InheritedContentPrimitive extends CompletePrimitive {
  static attribute: string;
}

const Complete = createPrimitiveForTypeTest(CompletePrimitive);
const Inherited = createPrimitiveForTypeTest(InheritedContentPrimitive);
const NullDefaults = createPrimitiveForTypeTest(NullDefaultAttributesPrimitive);

type CompleteTag = Expect<Equal<typeof Complete.tag, 'div'>>;
type CompleteProps = Expect<Equal<(typeof Complete)['props'], readonly (keyof ContentProps)[]>>;
type CompleteDefaults = Expect<
  Equal<(typeof Complete)['defaultAttributes'], AttributesFor<'div'> | null>
>;
type InheritedTag = Expect<Equal<typeof Inherited.tag, 'div'>>;
type InheritedDefaults = Expect<
  Equal<(typeof Inherited)['defaultAttributes'], AttributesFor<'div'> | null>
>;
type NullDefaultAttributes = Expect<
  Equal<(typeof NullDefaults)['defaultAttributes'], AttributesFor<'div'> | null>
>;
type InheritedInstance = Expect<
  Equal<ReturnType<(typeof Inherited)['create']>, InheritedContentPrimitive>
>;

Complete.create({ disabled: true });
Inherited.create({ disabled: true });
NullDefaults.create({ disabled: true });

// @ts-expect-error tag is required on the primitive class.
createPrimitiveForTypeTest(MissingTagPrimitive);

// @ts-expect-error attribute is required on the primitive class.
createPrimitiveForTypeTest(MissingAttributePrimitive);

// @ts-expect-error tag must be a known HTMLElementTagNameMap key.
createPrimitiveForTypeTest(InvalidTagPrimitive);

// @ts-expect-error defaultAttributes must be explicitly defined, even when null.
createPrimitiveForTypeTest(MissingDefaultAttributesPrimitive);

// @ts-expect-error inherited content props do not include unrelated keys.
Inherited.create({ open: true });

const buttonDefaults = {
  type: 'button',
  disabled: true,
  tabindex: 0,
  'aria-label': 'Toggle',
  'data-part': 'trigger',
} satisfies AttributesFor<'button'>;

const invalidButtonDefaults = {
  // @ts-expect-error href belongs to anchors, not buttons.
  href: '/',
} satisfies AttributesFor<'button'>;

const invalidButtonType = {
  // @ts-expect-error invalid native button type.
  type: 'checkbox',
} satisfies AttributesFor<'button'>;

const invalidAttributeCase = {
  // @ts-expect-error native attribute names, not React property names.
  tabIndex: 0,
} satisfies AttributesFor<'button'>;

const invalidListener = {
  // @ts-expect-error event handlers are not serializable default attributes.
  onclick: () => {},
} satisfies AttributesFor<'button'>;

const anchorDefaults = { href: '/', target: '_blank' } satisfies AttributesFor<'a'>;

declare class ValidButtonPrimitive extends Primitive<ContentProps> {
  static tag: 'button';
  static attribute: string;
  static defaultAttributes: typeof buttonDefaults;
  protected render(): {};
}

createPrimitiveForTypeTest(ValidButtonPrimitive);

declare class InvalidButtonPrimitive extends Primitive<ContentProps> {
  static tag: 'button';
  static attribute: string;
  static defaultAttributes: { type: 'button'; href: string };
  protected render(): {};
}

// @ts-expect-error factory checks extra attributes even without satisfies.
createPrimitiveForTypeTest(InvalidButtonPrimitive);

declare class InvalidButtonTypePrimitive extends Primitive<ContentProps> {
  static tag: 'button';
  static attribute: string;
  static defaultAttributes: { type: 'checkbox' };
  protected render(): {};
}

// @ts-expect-error factory must not widen the tag to accept another element's type.
createPrimitiveForTypeTest(InvalidButtonTypePrimitive);

declare class InheritedButtonPrimitive extends ValidButtonPrimitive {
  static attribute: string;
}
createPrimitiveForTypeTest(InheritedButtonPrimitive);
