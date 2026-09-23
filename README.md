<div align="center">

<a href="https://www.flaticon.com/free-icons/milk-box" title="milk components">
  <img src="https://user-images.githubusercontent.com/175330/164994717-0d161476-e471-4861-9099-97e9e33f8a9a.png" height="100" />
</a>

<br/>

# Headless components for all

</div>

Native primitives with thin framework adapters, exploring [web component behavior without shadow DOM](https://jjenzz.com/future-for-web-components-without-shadow-dom/).

The native implementation uses platform APIs with no runtime dependencies. Attributes attach behavior to semantic HTML; JavaScript properties carry reactive configuration. No `observedAttributes` or shadow DOM.

## Goal

Components should be usable from the first render, before JavaScript loads. Their HTML and CSS provide the initial appearance and basic browser interactions; JavaScript progressively enhances them with richer behavior. The goal is to avoid both a [flash of unstyled content (FOUC)](https://webkit.org/blog/66/the-fouc-problem/) and the ["uncanny valley" where a component looks ready but cannot respond to input](https://web.dev/articles/rendering-on-the-web#rehydration) until its JavaScript finishes loading.

## Run the docs

```sh
pnpm install
pnpm dev
```

The Vite app lives in `docs/`. Vite server-renders the docs before React hydrates them so we can test that experience. Disable JavaScript to check the baseline behavior—for example, accordion links should still reveal their content—then enable it to check that enhancement preserves the initial appearance without flicker. The baseline does not need every enhanced feature, but the content and basic interactions should remain available even if JavaScript is slow or fails to load.

## Native imports

Install `@milkui/core` and import the components you need:

```ts
import { Root, Item, Trigger, Content } from '@milkui/core/accordion';

Root.define(document);
Item.define(document);
Trigger.define(document);
Content.define(document);
```

Register only the parts your markup uses. Each `.define(root)` returns a cleanup function; repeated calls for the same part and root return the same cleanup. Discovery runs in a microtask, mounting parents before children regardless of registration order. Inserted and removed elements are handled automatically; attributes are never observed. Use `.mount(element, props)` when you need a synchronous instance; mount its providers first. Parts rendered outside their required provider ancestry throw an error instead of using fallback context.

The package root exports `Accordion` and `Collapsible` namespaces, and `Button`. Button uses `Button.define(document)`; Collapsible uses `Root.define`, `Trigger.define`, and `Content.define` from its entry point. Shared APIs for building primitives are available from `@milkui/core/primitive`. All entry points support tree-shaking. React adapters manage their own lifecycle and do not call `.define()`.

## React imports

Install `@milkui/react` and import only the component entry points you need:

```tsx
import * as Accordion from '@milkui/react/accordion';
import * as Collapsible from '@milkui/react/collapsible';
import { Button } from '@milkui/react/button';
```

The package root also exports `Accordion` and `Collapsible` namespaces and `Button`. All entry points share the same adapter and support tree-shaking.
