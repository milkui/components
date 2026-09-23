import { expect, it } from 'vitest';
import { Root, Item, Trigger, Content, Header } from '../accordion/index.js';

it('discovers optional parts in DOM order regardless of definition order', async () => {
  const host = document.createElement('div');
  host.innerHTML = `<div mlk-accordion-root data-collapsible>
    <div mlk-accordion-item><h3 mlk-accordion-header>
      <a mlk-accordion-trigger href="#shipping">Shipping</a>
    </h3><div mlk-accordion-content id="shipping">Details</div></div>
  </div>`;
  const content = host.querySelector<HTMLElement>('[mlk-accordion-content]')!;
  const trigger = host.querySelector<HTMLAnchorElement>('a')!;
  const stopContent = Content.define(host);
  const stops = [stopContent, Trigger.define(host), Item.define(host), Root.define(host)];
  expect(Content.define(host)).toBe(stopContent);
  expect(Content.get(content)).toBeUndefined();
  await Promise.resolve();
  expect(content.id).toBe('shipping');
  expect(content.hasAttribute('hidden')).toBe(false);
  expect(trigger.getAttribute('aria-expanded')).toBe('true');
  expect(Header.get(host.querySelector('h3')!)).toBeUndefined();
  trigger.click();
  expect(content.hasAttribute('hidden')).toBe(true);
  stops.forEach((stop) => stop());
  expect(Content.get(content)).toBeUndefined();
});

it('can cancel pending discovery and register again after cleanup', async () => {
  const host = document.createElement('div');
  host.setAttribute('mlk-accordion-root', '');
  const stop = Root.define(host);
  stop();
  await Promise.resolve();
  expect(Root.get(host)).toBeUndefined();
  const nextStop = Root.define(host);
  stop();
  await Promise.resolve();
  expect(Root.get(host)).toBeDefined();
  nextStop();
  expect(Root.get(host)).toBeUndefined();
});
