# Attribute behaviors and framework adapters

This is a proof of the approach in [A Future for Web Components Without Shadow DOM](https://jjenzz.com/future-for-web-components-without-shadow-dom/), with Milk Collapsible and Accordion exposing thin React adapters over native primitives.

## Where the original experiment had got to

The original `@milkui/primitive` defines a custom-attribute base class using `@lume/custom-attributes`. Its proxy triggers a render when a property changes. `@milkui/button` attaches that behavior to a button, sets its disabled state, and logs clicks. The HTML Storybook demo waits one animation frame before sending props. There was no collapsible, React adapter, shared-state scope, or behavior test suite.

The button now uses the same small primitive base. The original proxy and external custom-attribute library have been removed.

## The earlier wrapper experiment

The separate [milkui/components experiment](https://github.com/milkui/components) already explored a native collapsible with React parts declared through `createReactComponent(NativePart)`. That establishes the desired direction: a reusable integration boundary, with component wrappers describing their native parts. Its `hooked-elements` dependency and attribute serialization are not carried forward. The new native implementation uses platform APIs and no runtime dependencies; the React adapter uses React and the user-selected Slot utility for composition.

## Why move away from one PROPS symbol?

A symbol is a reasonable private storage key. The problem is the contract around it:

- Two attributes on the same element overwrite the same props object, undermining the post's composable-behavior example.
- Updates sent before the custom-attribute registry upgrades an element can be lost.
- Assigning fields one at a time can render intermediate combinations of props.
- Removed props can remain in the object and retain stale callbacks or controlled values.
- A proxy hides the operation that changes behavior and complicates setup and disposal.

A typed primitive instance with explicit update and disposal methods makes those boundaries visible. Each primitive receives its own props, including real JavaScript values and functions. No serialization or shared property bag is needed. A future adapter can use the same instances.

## Familiar authoring concepts, platform implementation

Component definitions and context/provider/consumer concepts should remain recognizable from React, without requiring React or a hooks library in the native layer. A provider supplies state to its parts; nested providers isolate that state. The useful similarity is how authors compose behavior and share state, rather than reproducing React's scheduler or implicit hook call order. [Remix UI's setup functions and handles](https://github.com/remix-run/remix/blob/main/packages/ui/src/runtime/component.ts) provide another reference: an ordinary function owns closure state, receives current properties, publishes context, and returns the work to run on updates. Here the output describes behavior on an existing DOM element rather than a JSX tree. Function syntax is secondary to a clear typed lifecycle contract: any lifecycle, prop synchronization, subscription or cleanup logic shared by the parts belongs in the primitive layer, not in every component. Context/provider concepts work equally well with function or class definitions.

There is no `observedAttributes` API. Marker attributes identify behaviors and initial configuration can seed their defaults. Subsequent configuration is sent as JavaScript properties to the behavior instance. DOM lifecycle discovery is separate from prop reactivity; watching insertion/removal does not make configuration attributes reactive.

## Responsibility boundary

The framework-independent layer owns open state, requests to change controlled state, disabled behavior, accessibility attributes, click handling, and measurement. Semantic HTML stays in the light DOM and accepts ordinary CSS.

The React layer owns React elements and their children. Its job is to transport props, connect DOM refs, subscribe to native state, and render the snapshot. It must not independently implement toggling or an animation state machine. In particular, the native layer must never remove children that React owns. Content and its children remain mounted; consumer CSS controls visibility.

Setup attributes use the same names as potential custom elements, such as `mlk-collapsible-root`. They appear first after the element name in examples. Custom attribute names are JavaScript-enhanced hooks, not a claim that browsers natively implement a custom-attributes standard. There is no shadow root, customized built-in, or `display: contents` requirement. An attribute on the root's real element can define the scope without adding a custom-element wrapper solely for context.

## What counts as proving it?

The same native behavior must work without React, and the React API must cover more than toggling a Boolean: controlled updates, nested roots, disabled state, event cancellation, SSR/hydration, refs, content lifecycle, and CSS exit animations all exercise the ownership boundary. Tests should verify those visible contracts rather than the internal class or hook structure.

## Independent parts and registration

Root, Trigger, and Content are independent definitions and exports, colocated in one `collapsible` file per package with `comb` section headings and a `comd` export divider. Shared context is an internal dependency, not a central object that eagerly assembles the entire component. Importing a part should not start a global observer. Native DOM discovery is an explicit registration step; React connects the parts it renders directly. That separation makes lifecycle ownership clear and allows unused parts and discovery code to be removed from framework bundles.

## Authoring a part

Each part extends `Primitive<Props>` and implements `render()`. It reads typed `this.props`, consumes or provides a typed context, and returns attributes, styles, and events. Local state lives in instance fields. Calling `refresh()` publishes the new output; the base handles snapshot stability, subscriptions, DOM output, and context notifications.

`connected()` optionally returns a cleanup function for DOM resources. `layout()` runs after output reaches the DOM. Content measures its natural size when opening to supply CSS size variables. No animation tracking or deferred unmounting is performed.

Primitive classes declare their HTML tag, marker attribute, default HTML attributes, prop keys, and native attribute initialization as static metadata. Subclasses inherit that metadata using normal class inheritance. A subclass with a different prop contract, such as Accordion Item, overrides it; Accordion Trigger and Content inherit theirs from Collapsible without repeating the configuration.

For example, Collapsible Content declares its element metadata:

```ts
class CollapsibleContentPrimitive extends Primitive<CollapsibleContentProps> {
  static tag = 'div' as const;
  static attribute = 'mlk-collapsible-content';
  static defaultAttributes = null;
  // Content behavior and lifecycle.
}
```

Accordion Content inherits the tag and prop metadata, overriding its marker:

```ts
class AccordionContentPrimitive extends CollapsibleContentPrimitive {
  static override attribute = 'mlk-accordion-content';
  // Accordion-specific behavior.
}

const Content = /*#__PURE__*/ createPrimitive(AccordionContentPrimitive);
```

`createPrimitive(Class)` reads metadata from the class. Its TypeScript signature requires a valid HTML tag, marker attribute, and `defaultAttributes` declaration, including inherited values. Use `null` explicitly when a primitive has no default HTML attributes. An incomplete class can exist, but passing it to the factory is a type error; `Primitive` provides no default tag or marker. It exposes `create()` for DOM-independent instances and `mount()` for plain HTML. Only `mount()` reads initial attribute values, with explicit props taking precedence. Separating creation from connection allows the same native render method to produce SSR attributes before a DOM element exists.

The React declarations are simply:

```tsx
export const Root = createReactComponent(NativeRoot);
export const Trigger = createReactComponent(NativeTrigger);
export const Content = createReactComponent(NativeContent);
```

The reusable adapter transports props, supplies the parent native scope and a hydration-safe ID, subscribes to output, and connects React refs and events to native instances. Slot owns `asChild` prop, event, style, class, and child-ref composition; the adapter forwards its own props and native output without inspecting or cloning children. There is no collapsible state, context, measurement, or animation code in these wrappers. Another framework implements that bridge once.

React context carries the native scope through the React tree, including portals; native HTML resolves providers through DOM ancestors. Primitive instances subscribe only while connected, so abandoned server renders do not register global subscriptions. Independent exports and pure definition calls allow bundlers to remove unused parts; `node scripts/check-tree-shaking.mjs` verifies Root-only native and React bundles.

## Open state and visibility

Root, Trigger, and Content expose an empty `data-open` attribute only while open. Closed is the absence of that attribute. The trigger also exposes `aria-expanded`. There is no `data-state`. Closed content has `hidden="until-found"`; consumer CSS controls enhanced visibility and motion. Content children remain mounted in both native and React.

## Reusing Collapsible parts for Accordion

Accordion's Item extends `CollapsibleRootPrimitive`, inheriting its disclosure context and open/disabled output. It derives open and disabled state from Accordion and overrides toggle to request a group value change. Collapsible Root accepts a generic props type so Item keeps its own optional `value` and `disabled` API. Ordinary Collapsible roots retain their controlled and uncontrolled behavior.

Trigger and Content extend their corresponding Collapsible primitive classes, reusing button activation, ARIA expansion, and size measurement. Accordion adds heading/content relationships and keyboard navigation.

Each subclass is registered as its own primitive definition with an `mlk-accordion-*` marker. It is a single primitive instance on the element, so consumers need neither Collapsible attributes nor `defineCollapsible()`. The existing primitive lifecycle owns connection, disconnection, subscriptions, and event binding.

Native DOM ancestry and React's transported primitive scope resolve the shared Collapsible context. React Accordion parts use the shared adapter factory and contain no accordion state or keyboard logic.

## Default attributes and progressive enhancement

Default attributes use `AttributesFor<typeof MyPrimitive.tag>` from `@milkui/primitive` for native attribute names and tag-specific values. This uses type-only imports from `dom-types/native`, with no runtime dependency in the emitted JavaScript. `createPrimitive` also rejects attributes that do not belong to the declared tag, including extra keys on inferred objects. Event handlers and object values are excluded from these serializable defaults.

```ts
class ButtonPrimitive extends Primitive<ButtonProps> {
  static tag = 'button' as const;
  static attribute = 'mlk-button';
  static defaultAttributes = {
    type: 'button',
  } satisfies AttributesFor<typeof ButtonPrimitive.tag>;
  // ...
}
```

`defaultAttributes` describes the HTML a primitive needs before enhancement. Button declares `{ type: 'button' }` there instead of forcing its type from its runtime render method. Explicit attributes take precedence: a consumer can still use `type="submit"`.

The definition exposes this metadata for markup producers. The React adapter applies it to initial output, including server-rendered HTML and `asChild`, while preserving explicit consumer values. This supports HTML that remains usable without client JavaScript; it does not turn the hook-based adapter into a pure React Server Component.

Native documentation examples and anatomy code receive defaults from the same definitions. Native previews serve their markup before their enhancement script runs. Calling `mount()` on an arbitrary native element does not retroactively supply missing default HTML attributes; native authors should include them in their initial markup, as shown in the generated examples.

The React adapter resolves its defaults and behavior-owned snapshot attributes, then forwards them to the element or Slot. It only reads its own props. Slot owns child prop precedence, event composition, and ref composition. Ordinary HTML attributes stay with the renderer; they are not primitive props or snapshot output. Only events handled by the primitive need React event composition.

Native discovery observes child-list changes only. Changing configuration or marker attributes on an already connected element does not update or detach its primitive. Use the instance API for behavior updates; newly inserted marked elements are discovered and removed elements are disconnected.

## Fragment baseline

Collapsible Root has a stable ID. Native Accordion items require no ID: each content ID is also its native selection value. JavaScript can supply an optional item value override; the shared primitive prefers the explicit value, then the native content ID, then its internal identifier. React supplies that value while generating a unique internal identifier for its trigger/content DOM IDs, so values can repeat across separate accordions. Fragment adoption resolves the targeted primitive's value. Their triggers link to the content ID (`<root/item-id>-content`). Before enhancement, closed content has `hidden="until-found"`. Fragment navigation removes the attribute; CSS shows the revealed panel without depending on `:target`. Revealing another panel does not close previously revealed panels. No trigger button roles or expansion ARIA are rendered until the primitive connects. Content is always mounted.

Native markup declares initial state through Content: `hidden="until-found"` means closed; omitting `hidden` means open. No authored `data-open` is needed. React keeps `defaultOpen` and `defaultValue`, rendering the matching hidden state on the server. Enhancement adopts the current fragment for uncontrolled instances without firing change callbacks. Explicit controlled state remains authoritative. Later fragment navigation uses `hashchange`; find-in-page revelation uses `beforematch`, never attribute observation. Initialization also adopts already-revealed content.

Once connected, a Root/Item has `data-enhanced`; CSS switches to the primitive's `data-open` output. Triggers gain button semantics and Space activation. Successful ordinary activation prevents fragment navigation; modified clicks retain native link behavior. Initial setup does not enable motion. The first enhanced toggle sets `data-motion`, allowing consumer animation styles. Accordion shares this motion state across its items so outgoing and incoming panels animate together. The docs share their actual baseline/animation stylesheet with their code examples.

Without JavaScript links reveal content persistently but do not toggle it closed or enforce single selection. It can scroll and change history. IDs must be unique. Native markup must supply them and matching href values; the React bridge uses an explicit ID or its hydration-stable generated ID. Consumers using asChild should retain an anchor for the no-JS experience.

React workaround: React currently serializes lowercase `hidden` as a boolean. The adapter forwards this attribute as `HIDDEN` to preserve `until-found` during SSR and updates. HTML parsing normalizes the name to lowercase. React emits an invalid-property development warning; no runtime renaming or fragment CSS fallback is needed.

The docs Vite plugin filters only the HIDDEN casing warning in the browser during development. The published React adapter does not modify console methods; SSR terminal warnings remain visible.
