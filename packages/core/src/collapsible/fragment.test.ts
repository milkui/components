import { afterEach, describe, expect, it } from 'vitest';
import { defineCollapsible, Root } from './index.js';

let cleanup: (() => void) | undefined;
afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  document.body.replaceChildren();
  history.replaceState(null, '', '/');
});

function setup() {
  document.body.innerHTML = `<div mlk-collapsible-root id="section">
    <a mlk-collapsible-trigger href="#section">Section</a>
    <div mlk-collapsible-content>Content <span id="deep">Deep link</span></div>
  </div>`;
  return {
    root: document.getElementById('section')!,
    trigger: document.querySelector('a')!,
  };
}

describe('fragment enhancement', () => {
  it('adopts a pre-existing deep link and keeps the authored root ID', () => {
    const { root, trigger } = setup();
    history.replaceState(null, '', '#deep');
    expect(trigger.getAttribute('role')).toBeNull();
    cleanup = defineCollapsible(document);
    expect(root.id).toBe('section');
    expect(root.hasAttribute('data-open')).toBe(true);
    expect(root.hasAttribute('data-interactive')).toBe(true);
    expect(trigger.getAttribute('href')).toBe('#section-content');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    trigger.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true);
    expect(root.hasAttribute('data-open')).toBe(false);
    expect(location.hash).toBe('#deep');
  });

  it('preserves modified navigation and handles Space as a button after enhancement', () => {
    const { root, trigger } = setup();
    cleanup = defineCollapsible(document);
    const modified = new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true });
    // Cancel browser navigation after recording what the primitive did.
    let preventedByPrimitive = false;
    document.addEventListener(
      'click',
      (event) => {
        preventedByPrimitive = event.defaultPrevented;
        event.preventDefault();
      },
      { once: true },
    );
    trigger.dispatchEvent(modified);
    expect(preventedByPrimitive).toBe(false);
    expect(root.hasAttribute('data-open')).toBe(false);
    const space = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    trigger.dispatchEvent(space);
    expect(space.defaultPrevented).toBe(true);
    expect(root.hasAttribute('data-open')).toBe(true);
  });

  it('does not override explicitly controlled state with a fragment', () => {
    const { root } = setup();
    history.replaceState(null, '', '#section');
    Root.mount(root, { open: false });
    expect(root.hasAttribute('data-open')).toBe(false);
    Root.unmount(root);
  });

  it('follows later fragment navigation without observing attributes', () => {
    const { root } = setup();
    cleanup = defineCollapsible(document);
    history.replaceState(null, '', '#deep');
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    expect(root.hasAttribute('data-open')).toBe(true);
    cleanup();
    cleanup = undefined;
    expect(root.hasAttribute('data-interactive')).toBe(false);
  });
});

it('adopts previously revealed content without needing the current URL fragment', () => {
  const { root } = setup();
  const content = root.querySelector('[mlk-collapsible-content]')!;
  content.id = 'section-content';
  cleanup = defineCollapsible(document);
  expect(root.hasAttribute('data-open')).toBe(true);
});

it('opens on beforematch without observing attributes', () => {
  const { root } = setup();
  cleanup = defineCollapsible(document);
  const content = root.querySelector('[mlk-collapsible-content]')!;
  expect(content.getAttribute('hidden')).toBe('until-found');
  content.dispatchEvent(new Event('beforematch', { bubbles: true }));
  expect(root.hasAttribute('data-open')).toBe(true);
  expect(content.hasAttribute('hidden')).toBe(false);
});

it('preserves an authored content ID and trigger link without a root ID', () => {
  document.body.innerHTML = `<div mlk-collapsible-root>
    <a mlk-collapsible-trigger href="#packages-content">Packages</a>
    <div mlk-collapsible-content id="packages-content" hidden="until-found">Content</div>
  </div>`;
  const root = document.querySelector('[mlk-collapsible-root]')!;
  const content = document.getElementById('packages-content')!;
  const trigger = root.querySelector('a')!;
  cleanup = defineCollapsible(document);
  expect(content.id).toBe('packages-content');
  expect(trigger.getAttribute('href')).toBe('#packages-content');
  expect(trigger.getAttribute('aria-controls')).toBe('packages-content');
  expect(content.hasAttribute('hidden')).toBe(true);
  trigger.click();
  expect(content.hasAttribute('hidden')).toBe(false);
  expect(content.id).toBe('packages-content');
});
