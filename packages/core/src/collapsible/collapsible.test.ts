import { describe, expect, it, vi } from 'vitest';
import { Root, Trigger, Content } from './index.js';

describe('@milkui/core/collapsible native behavior', () => {
  it('reads configuration once and observes only DOM insertion and removal', async () => {
    const host = document.createElement('div');
    host.innerHTML = `<div mlk-collapsible-root>
      <button mlk-collapsible-trigger type="submit">Toggle</button>
      <div mlk-collapsible-content></div>
    </div>`;
    const stop = await defineCollapsible(host);
    const root = host.firstElementChild as HTMLElement;
    const trigger = root.querySelector('button')!;
    const instance = Root.get(root);

    root.setAttribute('data-open', '');
    root.removeAttribute('mlk-collapsible-root');
    trigger.setAttribute('type', 'reset');
    await Promise.resolve();
    expect(Root.get(root)).toBe(instance);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    trigger.click();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('type')).toBe('reset');

    const added = document.createElement('div');
    added.setAttribute('mlk-collapsible-root', '');
    host.append(added);
    await Promise.resolve();
    expect(Root.get(added)).toBeDefined();
    expect(Root.get(root)).toBe(instance);

    root.remove();
    await Promise.resolve();
    expect(Root.get(root)).toBeUndefined();
    stop();
  });

  it('toggles semantic DOM through the same native controllers', async () => {
    const root = document.createElement('div');
    const trigger = document.createElement('button');
    const content = document.createElement('section');

    root.append(trigger, content);
    Root.mount(root, { defaultOpen: false });
    Trigger.mount(trigger);
    Content.mount(content);

    expect(root.hasAttribute('data-open')).toBe(false);
    expect(trigger.hasAttribute('data-open')).toBe(false);
    expect(content.hasAttribute('data-open')).toBe(false);
    expect(root.hasAttribute('data-state')).toBe(false);
    expect(trigger.hasAttribute('data-state')).toBe(false);
    expect(content.hasAttribute('data-state')).toBe(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(content.getAttribute('hidden')).toBe('until-found');

    trigger.click();

    expect(root.getAttribute('data-open')).toBe('');
    expect(trigger.getAttribute('data-open')).toBe('');
    expect(content.getAttribute('data-open')).toBe('');
    expect(root.hasAttribute('data-state')).toBe(false);
    expect(trigger.hasAttribute('data-state')).toBe(false);
    expect(content.hasAttribute('data-state')).toBe(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(content.hasAttribute('hidden')).toBe(false);
    expect(content.style.getPropertyValue('--mlk-collapsible-content-height')).toBe('0px');
  });

  it('measures natural border-box size when an opening transition compresses the rect', async () => {
    const root = document.createElement('div');
    const content = document.createElement('section');
    root.append(content);
    Object.defineProperties(content, {
      scrollHeight: { configurable: true, value: 120 },
      scrollWidth: { configurable: true, value: 240 },
    });
    content.getBoundingClientRect = () => ({ height: 0, width: 0 }) as DOMRect;
    const getComputedStyle = vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue(name: string) {
        return (
          {
            'border-top-width': '2px',
            'border-bottom-width': '3.5px',
            'border-left-width': '4px',
            'border-right-width': '6.25px',
          }[name] ?? '0px'
        );
      },
    } as CSSStyleDeclaration);

    Root.mount(root, { defaultOpen: false });
    Content.mount(content);
    Root.update(root, { open: true });

    expect(content.style.getPropertyValue('--mlk-collapsible-content-height')).toBe('125.5px');
    expect(content.style.getPropertyValue('--mlk-collapsible-content-width')).toBe('250.25px');
    getComputedStyle.mockRestore();
  });

  it('preserves fractional border-box rects when they exceed natural scroll extent', async () => {
    const root = document.createElement('div');
    const content = document.createElement('section');
    root.append(content);
    Object.defineProperties(content, {
      scrollHeight: { configurable: true, value: 100 },
      scrollWidth: { configurable: true, value: 200 },
    });
    content.getBoundingClientRect = () => ({ height: 140.25, width: 260.75 }) as DOMRect;
    const getComputedStyle = vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue() {
        return '1px';
      },
    } as CSSStyleDeclaration);

    Root.mount(root, { defaultOpen: false });
    Content.mount(content);
    Root.update(root, { open: true });

    expect(content.style.getPropertyValue('--mlk-collapsible-content-height')).toBe('140.25px');
    expect(content.style.getPropertyValue('--mlk-collapsible-content-width')).toBe('260.75px');
    getComputedStyle.mockRestore();
  });

  it('keeps nested roots isolated', async () => {
    const outerRoot = document.createElement('div');
    const outerTrigger = document.createElement('button');
    const innerRoot = document.createElement('div');
    const innerTrigger = document.createElement('button');
    const innerContent = document.createElement('div');

    outerRoot.append(outerTrigger, innerRoot);
    innerRoot.append(innerTrigger, innerContent);
    Root.mount(outerRoot, { defaultOpen: false });
    Trigger.mount(outerTrigger);
    Root.mount(innerRoot, { defaultOpen: false });
    Trigger.mount(innerTrigger);
    Content.mount(innerContent);

    innerTrigger.click();

    expect(Root.get(outerRoot)?.open).toBe(false);
    expect(Root.get(innerRoot)?.open).toBe(true);
    expect(outerTrigger.getAttribute('aria-expanded')).toBe('false');
    expect(innerTrigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('supports controlled updates and disabled roots without attribute reactivity', async () => {
    const root = document.createElement('div');
    const trigger = document.createElement('button');
    const changes: boolean[] = [];

    root.append(trigger);
    Root.mount(root, {
      disabled: true,
      open: false,
      onOpenChange: (open) => changes.push(open),
    });
    Trigger.mount(trigger);

    trigger.click();
    expect(changes).toEqual([]);
    expect(root.hasAttribute('data-open')).toBe(false);

    Root.update(root, { disabled: false });
    trigger.click();

    expect(changes).toEqual([true]);
    expect(root.hasAttribute('data-open')).toBe(false);

    Root.update(root, { open: true });
    expect(root.getAttribute('data-open')).toBe('');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('removes explicit native registration and can register the same root again', async () => {
    const host = document.createElement('div');
    host.innerHTML = `
      <div mlk-collapsible-root id="packages">
        <button mlk-collapsible-trigger>Toggle</button>
        <div mlk-collapsible-content id="packages-content" hidden="until-found">Panel</div>
      </div>
    `;
    document.body.append(host);

    const cleanup = await defineCollapsible(host);
    const root = host.querySelector<HTMLElement>('[mlk-collapsible-root]')!;
    const trigger = host.querySelector<HTMLButtonElement>('[mlk-collapsible-trigger]')!;
    const changes = vi.fn();

    root.addEventListener('mlk-collapsible:open-change', changes);

    trigger.click();
    expect(root.getAttribute('data-open')).toBe('');
    expect(changes).toHaveBeenCalledTimes(1);

    cleanup();
    trigger.click();
    expect(root.getAttribute('data-open')).toBe('');
    expect(changes).toHaveBeenCalledTimes(1);

    await defineCollapsible(host);
    expect(root.hasAttribute('data-open')).toBe(true);

    trigger.click();
    expect(root.hasAttribute('data-open')).toBe(false);
    expect(changes).toHaveBeenCalledTimes(2);
  });

  it('rejects missing providers and allows mounting after the provider exists', async () => {
    const root = document.createElement('div');
    const trigger = document.createElement('button');
    const content = document.createElement('div');
    root.append(trigger, content);

    expect(() => Trigger.mount(trigger)).toThrow('Collapsible.Root provider ancestor');
    expect(() => Content.mount(content)).toThrow('Collapsible.Root provider ancestor');
    expect(Trigger.get(trigger)).toBeUndefined();
    expect(Content.get(content)).toBeUndefined();
    Root.mount(root, { defaultOpen: false });
    Trigger.mount(trigger);
    Content.mount(content);

    trigger.click();

    expect(Root.get(root)?.open).toBe(true);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(content.hasAttribute('hidden')).toBe(false);
  });

  it('re-resolves nearest provider when a registered part is reparented', async () => {
    const host = document.createElement('div');
    host.innerHTML = `
      <div id="outer" mlk-collapsible-root>
        <div id="inner" mlk-collapsible-root>
          <button mlk-collapsible-trigger>Move me</button>
        </div>
      </div>
    `;
    document.body.append(host);
    await defineCollapsible(host);

    const outer = host.querySelector<HTMLElement>('#outer')!;
    const inner = host.querySelector<HTMLElement>('#inner')!;
    const trigger = host.querySelector<HTMLButtonElement>('button')!;

    outer.append(trigger);
    trigger.click();

    expect(Root.get(outer)?.open).toBe(true);
    expect(Root.get(inner)?.open).toBe(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('uses changed callbacks and drops removed callbacks on native controller updates', async () => {
    const root = document.createElement('div');
    const trigger = document.createElement('button');
    const first = vi.fn();
    const second = vi.fn();

    root.append(trigger);
    Root.mount(root, { onOpenChange: first });
    Trigger.mount(trigger);

    Root.update(root, { onOpenChange: second });
    trigger.click();

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(true);

    Root.update(root, { onOpenChange: undefined });
    trigger.click();

    expect(second).toHaveBeenCalledTimes(1);
  });

  it('prevents activation when only the trigger is disabled on a non-button element', async () => {
    const root = document.createElement('div');
    const trigger = document.createElement('div');

    root.append(trigger);
    Root.mount(root);
    Trigger.mount(trigger, { disabled: true });

    trigger.click();

    expect(Root.get(root)?.open).toBe(false);
    expect(trigger.getAttribute('data-disabled')).toBe('');
  });
});

async function defineCollapsible(root: Document | HTMLElement) {
  const cleanups = [Root.define(root), Trigger.define(root), Content.define(root)];
  await Promise.resolve();
  return () => cleanups.forEach((cleanup) => cleanup());
}
