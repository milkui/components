import { describe, expect, it, vi } from 'vitest';
import { Content, defineAccordion, Header, Item, Root, Trigger } from './index.js';

describe('@milkui/accordion native behavior', () => {
  it('coordinates a single accordion through accordion markers only', () => {
    const { root, items } = createAccordion(['one', 'two']);
    const changes = vi.fn();
    const leakedCollapsible = vi.fn();
    root.addEventListener('mlk-accordion:value-change', changes);
    root.addEventListener('mlk-collapsible:open-change', leakedCollapsible);

    mountAccordion(root, items);

    items[0]!.trigger.click();

    expect(changes).toHaveBeenCalledWith(expect.objectContaining({ detail: { value: 'one' } }));
    expect(leakedCollapsible).not.toHaveBeenCalled();
    expect(root.hasAttribute('data-open')).toBe(false);
    expect(items[0]!.item.getAttribute('data-open')).toBe('');
    expect(items[0]!.header.getAttribute('data-open')).toBe('');
    expect(items[0]!.trigger.getAttribute('data-open')).toBe('');
    expect(items[0]!.trigger.getAttribute('aria-expanded')).toBe('true');
    expect(items[0]!.trigger.getAttribute('aria-disabled')).toBe('true');
    expect(items[0]!.trigger.hasAttribute('disabled')).toBe(false);
    expect(items[0]!.content.getAttribute('data-open')).toBe('');
    expect(items[0]!.content.getAttribute('role')).toBe('region');
    expect(items[0]!.content.getAttribute('aria-labelledby')).toBe(items[0]!.trigger.id);
    expect(items[0]!.trigger.getAttribute('aria-controls')).toBe(items[0]!.content.id);
    expect(items[0]!.content.style.getPropertyValue('--mlk-accordion-content-height')).toBe('0px');
    expect(root.querySelector('[mlk-collapsible-root]')).toBeNull();
    expect(root.querySelector('[mlk-collapsible-trigger]')).toBeNull();
    expect(root.querySelector('[mlk-collapsible-content]')).toBeNull();

    items[0]!.trigger.click();

    expect(changes).toHaveBeenCalledTimes(1);
    expect(items[0]!.trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('enables motion for both panels when switching away from the initial item', () => {
    const { root, items } = createAccordion(['one', 'two']);
    Root.mount(root, { defaultValue: 'one' });
    mountItems(items);
    expect(items.every(({ item }) => !item.hasAttribute('data-motion'))).toBe(true);
    items[1]!.trigger.click();
    expect(items[0]!.item.hasAttribute('data-motion')).toBe(true);
    expect(items[1]!.item.hasAttribute('data-motion')).toBe(true);
    expect(items[0]!.item.hasAttribute('data-open')).toBe(false);
    expect(items[1]!.item.hasAttribute('data-open')).toBe(true);
  });

  it('allows closing the active single item when collapsible', () => {
    const { root, items } = createAccordion(['one']);
    const changes = vi.fn();
    root.addEventListener('mlk-accordion:value-change', changes);
    Root.mount(root, { defaultValue: 'one', collapsible: true });
    mountItems(items);

    items[0]!.trigger.click();

    expect(changes).toHaveBeenCalledWith(expect.objectContaining({ detail: { value: '' } }));
    expect(items[0]!.item.hasAttribute('data-open')).toBe(false);
    expect(items[0]!.trigger.getAttribute('aria-disabled')).toBeNull();
  });

  it('supports multiple values and controlled updates without mutating DOM state', () => {
    const { root, items } = createAccordion(['one', 'two']);
    const onValueChange = vi.fn();
    Root.mount(root, { type: 'multiple', value: ['one'], onValueChange });
    mountItems(items);

    items[1]!.trigger.click();

    expect(onValueChange).toHaveBeenCalledWith(['one', 'two']);
    expect(items[0]!.trigger.getAttribute('aria-expanded')).toBe('true');
    expect(items[1]!.trigger.getAttribute('aria-expanded')).toBe('false');

    Root.update(root, { value: ['two'] });

    expect(items[0]!.trigger.getAttribute('aria-expanded')).toBe('false');
    expect(items[1]!.trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('registers native markup from accordion attributes and cleans it up', () => {
    const host = document.createElement('div');
    host.innerHTML = `
      <div mlk-accordion-root>
        <div mlk-accordion-item id="one">
          <h3 mlk-accordion-header>
            <button mlk-accordion-trigger>One</button>
          </h3>
          <div mlk-accordion-content id="one-content">One panel</div>
        </div>
        <div mlk-accordion-item id="two">
          <h3 mlk-accordion-header>
            <button mlk-accordion-trigger>Two</button>
          </h3>
          <div mlk-accordion-content id="two-content" hidden="until-found">Two panel</div>
        </div>
      </div>
    `;
    document.body.append(host);
    const cleanup = defineAccordion(host);
    const root = host.querySelector<HTMLElement>('[mlk-accordion-root]')!;
    const triggers = host.querySelectorAll<HTMLButtonElement>('[mlk-accordion-trigger]');

    expect(triggers[0]!.getAttribute('aria-expanded')).toBe('true');
    triggers[1]!.click();
    expect(triggers[0]!.getAttribute('aria-expanded')).toBe('false');
    expect(triggers[1]!.getAttribute('aria-expanded')).toBe('true');

    cleanup();
    triggers[0]!.click();
    expect(Root.get(root)).toBeUndefined();
    expect(triggers[0]!.getAttribute('aria-expanded')).toBeNull();
  });

  it('inherits collapsible metadata for trigger and content while item keeps accordion metadata', () => {
    const host = document.createElement('div');
    host.innerHTML = `
      <div mlk-accordion-root>
        <div mlk-accordion-item id="one">
          <button mlk-accordion-trigger type="submit" disabled>One</button>
          <div mlk-accordion-content id="one-content" hidden="until-found">One panel</div>
        </div>
      </div>
    `;
    document.body.append(host);

    const cleanup = defineAccordion(host);
    const item = host.querySelector<HTMLElement>('[mlk-accordion-item]')!;
    const trigger = host.querySelector<HTMLButtonElement>('[mlk-accordion-trigger]')!;
    const content = host.querySelector<HTMLElement>('[mlk-accordion-content]')!;

    expect(Trigger.props).toEqual(['disabled']);
    expect(Content.props).toEqual([]);
    expect(Item.props).toEqual(['value', 'disabled']);
    expect(item.hasAttribute('data-open')).toBe(false);
    expect(trigger.getAttribute('type')).toBe('submit');
    expect(trigger.getAttribute('data-disabled')).toBe('');
    expect(content.textContent).toBe('One panel');

    cleanup();
  });

  it('moves focus in DOM order while skipping disabled items and nested accordions', () => {
    const { root, items } = createAccordion(['one', 'two', 'three']);
    const nestedRoot = document.createElement('div');
    const nestedItem = document.createElement('div');
    const nestedTrigger = document.createElement('button');
    nestedRoot.setAttribute('mlk-accordion-root', '');
    nestedItem.setAttribute('mlk-accordion-item', '');
    nestedItem.id = 'nested';
    nestedTrigger.setAttribute('mlk-accordion-trigger', '');
    nestedItem.append(nestedTrigger);
    nestedRoot.append(nestedItem);
    items[0]!.content.append(nestedRoot);
    document.body.append(root);

    Root.mount(root);
    Item.mount(items[0]!.item);
    Header.mount(items[0]!.header);
    Trigger.mount(items[0]!.trigger);
    Content.mount(items[0]!.content);
    Item.mount(items[1]!.item, { disabled: true });
    Header.mount(items[1]!.header);
    Trigger.mount(items[1]!.trigger);
    Content.mount(items[1]!.content);
    Item.mount(items[2]!.item);
    Header.mount(items[2]!.header);
    Trigger.mount(items[2]!.trigger);
    Content.mount(items[2]!.content);
    Root.mount(nestedRoot);
    Item.mount(nestedItem);
    Trigger.mount(nestedTrigger);

    items[0]!.trigger.focus();
    keydown(items[0]!.trigger, 'ArrowDown');
    expect(document.activeElement).toBe(items[2]!.trigger);

    keydown(items[2]!.trigger, 'ArrowDown');
    expect(document.activeElement).toBe(items[0]!.trigger);

    keydown(items[0]!.trigger, 'End');
    expect(document.activeElement).toBe(items[2]!.trigger);

    keydown(items[2]!.trigger, 'Home');
    expect(document.activeElement).toBe(items[0]!.trigger);
  });

  it('respects preventDefault before native activation and keyboard movement', () => {
    const { root, items } = createAccordion(['one', 'two']);
    document.body.append(root);
    mountAccordion(root, items);
    items[0]!.trigger.addEventListener('click', (event) => event.preventDefault(), {
      capture: true,
    });
    items[0]!.trigger.addEventListener('keydown', (event) => event.preventDefault(), {
      capture: true,
    });

    items[0]!.trigger.click();
    expect(Root.get(root)?.values).toEqual([]);

    items[0]!.trigger.focus();
    keydown(items[0]!.trigger, 'ArrowDown');
    expect(document.activeElement).toBe(items[0]!.trigger);
  });

  it('uses root orientation and dir for horizontal keyboard movement', () => {
    const { root, items } = createAccordion(['one', 'two']);
    document.body.append(root);
    Root.mount(root, { orientation: 'horizontal', dir: 'rtl' });
    mountItems(items);

    items[0]!.trigger.focus();
    keydown(items[0]!.trigger, 'ArrowRight');
    expect(document.activeElement).toBe(items[1]!.trigger);

    keydown(items[1]!.trigger, 'ArrowLeft');
    expect(document.activeElement).toBe(items[0]!.trigger);
  });
});

function createAccordion(values: string[]) {
  const root = document.createElement('div');
  const items = values.map((value) => {
    const item = document.createElement('div');
    const header = document.createElement('h3');
    const trigger = document.createElement('button');
    const content = document.createElement('div');
    item.id = value;
    trigger.textContent = value;
    header.append(trigger);
    item.append(header, content);
    root.append(item);
    return { item, header, trigger, content, value };
  });
  return { root, items };
}

function mountAccordion(root: HTMLElement, items: ReturnType<typeof createAccordion>['items']) {
  Root.mount(root);
  mountItems(items);
}

function mountItems(items: ReturnType<typeof createAccordion>['items']) {
  for (const entry of items) {
    Item.mount(entry.item);
    Header.mount(entry.header);
    Trigger.mount(entry.trigger);
    Content.mount(entry.content);
  }
}

function keydown(element: HTMLElement, key: string) {
  element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key }));
}
