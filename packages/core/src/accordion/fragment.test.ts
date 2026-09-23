import { afterEach, expect, it } from 'vitest';
import { Root, Item, Header, Trigger, Content } from './index.js';
let cleanup: (() => void) | undefined;
afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  document.body.replaceChildren();
  history.replaceState(null, '', '/');
});

it('reveals targeted items while retaining other open items in multiple mode', async () => {
  document.body.innerHTML = `<div mlk-accordion-root data-type="multiple">
    <div mlk-accordion-item id="one"><a mlk-accordion-trigger href="#one">One</a><div mlk-accordion-content id="one-content">One</div></div>
    <div mlk-accordion-item id="two"><a mlk-accordion-trigger href="#two">Two</a><div mlk-accordion-content>
      <div mlk-accordion-root><div mlk-accordion-item id="nested"><a mlk-accordion-trigger href="#nested">Nested</a><div mlk-accordion-content>Nested content</div></div></div>
    </div></div>
  </div>`;
  history.replaceState(null, '', '#nested');
  cleanup = await defineAccordion(document);
  expect(document.getElementById('one')!.hasAttribute('data-open')).toBe(true);
  expect(document.getElementById('two')!.hasAttribute('data-open')).toBe(true);
  expect(document.getElementById('nested')!.hasAttribute('data-open')).toBe(true);
  const trigger = document.querySelector<HTMLElement>('#one > a')!;
  trigger.click();
  expect(document.getElementById('one')!.hasAttribute('data-open')).toBe(false);
  expect(document.getElementById('two')!.hasAttribute('data-open')).toBe(true);
});

it('uses authored content IDs without changing initial visibility or requiring item IDs', async () => {
  document.body.innerHTML = `<div mlk-accordion-root data-collapsible>
    <div mlk-accordion-item><a mlk-accordion-trigger href="#shipping">Shipping</a><div mlk-accordion-content id="shipping">Shipping details</div></div>
    <div mlk-accordion-item><a mlk-accordion-trigger href="#returns">Returns</a><div mlk-accordion-content id="returns" hidden="until-found">Returns details</div></div>
  </div>`;
  const shipping = document.getElementById('shipping')!;
  const returns = document.getElementById('returns')!;
  cleanup = await defineAccordion(document);
  expect(shipping.hasAttribute('hidden')).toBe(false);
  expect(returns.getAttribute('hidden')).toBe('until-found');
  expect(document.querySelector('[mlk-accordion-item][id]')).toBeNull();
  const trigger = document.querySelector<HTMLAnchorElement>('a[href="#returns"]')!;
  trigger.click();
  expect(shipping.getAttribute('hidden')).toBe('until-found');
  expect(returns.hasAttribute('hidden')).toBe(false);
  expect(trigger.getAttribute('aria-controls')).toBe('returns');
  expect(document.getElementById('returns')).toBe(returns);
});

async function defineAccordion(root: Document | HTMLElement) {
  const cleanups = [
    Root.define(root),
    Item.define(root),
    Header.define(root),
    Trigger.define(root),
    Content.define(root),
  ];
  await Promise.resolve();
  return () => cleanups.forEach((cleanup) => cleanup());
}
