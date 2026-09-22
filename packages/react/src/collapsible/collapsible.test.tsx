import * as React from 'react';
import { act } from 'react';
import { createRoot, hydrateRoot, type Root as ReactRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Content, Root, Trigger } from './collapsible.js';

let container: HTMLDivElement;
let reactRoot: ReactRoot;

beforeEach(() => {
  container = document.createElement('div');
  document.body.replaceChildren(container);
  reactRoot = createRoot(container);
});

afterEach(async () => {
  await act(async () => {
    reactRoot.unmount();
  });
});

describe('@milkui/react/collapsible', () => {
  it('renders SSR attributes for initial closed/open state and hydrates them unchanged', async () => {
    const closedHtml = renderToString(
      <Root disabled>
        <Trigger>Toggle</Trigger>
        <Content>Panel</Content>
      </Root>,
    );
    const openHtml = renderToString(
      <Root defaultOpen>
        <Trigger>Toggle</Trigger>
        <Content>Panel</Content>
      </Root>,
    );

    expect(closedHtml).not.toContain('data-open');
    expect(closedHtml).not.toContain('data-state');
    expect(closedHtml).toContain('data-disabled=""');
    expect(closedHtml).not.toContain('aria-expanded');
    expect(closedHtml).toContain('HIDDEN="until-found"');
    expect(closedHtml).toContain('href="#');
    expect(closedHtml).toMatch(/id="[^"]+"/);
    expect(openHtml.match(/data-open=""/g)).toHaveLength(3);
    expect(openHtml).not.toContain('data-state');
    expect(openHtml).not.toContain('aria-expanded');
    expect(openHtml).not.toContain('HIDDEN=');

    await act(async () => {
      reactRoot.unmount();
    });
    container.innerHTML = closedHtml;

    await act(async () => {
      reactRoot = hydrateRoot(
        container,
        <Root disabled>
          <Trigger>Toggle</Trigger>
          <Content>Panel</Content>
        </Root>,
      );
    });

    expect(rootElement().hasAttribute('data-open')).toBe(false);
    expect(trigger().hasAttribute('data-open')).toBe(false);
    expect(screenContent()?.hasAttribute('data-open')).toBe(false);
    expect(container.querySelector('[data-state]')).toBeNull();
    expect(trigger().getAttribute('aria-controls')).toBe(screenContent()?.id);
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(screenContent()?.getAttribute('hidden')).toBe('until-found');
  });

  it('supports the Milk uncontrolled API', async () => {
    const onOpenChange = vi.fn();

    await act(async () => {
      reactRoot.render(
        <Root defaultOpen={false} onOpenChange={onOpenChange}>
          <Trigger>Toggle</Trigger>
          <Content>Panel</Content>
        </Root>,
      );
    });

    expect(screenContent()).not.toBeNull();
    expect(rootElement().hasAttribute('data-open')).toBe(false);
    expect(trigger().hasAttribute('data-open')).toBe(false);
    expect(screenContent()?.hasAttribute('data-open')).toBe(false);
    expect(container.querySelector('[data-state]')).toBeNull();
    expect(screenContent()?.textContent).toBe('Panel');
    expect(screenContent()?.getAttribute('hidden')).toBe('until-found');

    await act(async () => {
      trigger().click();
    });

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(rootElement().getAttribute('data-open')).toBe('');
    expect(trigger().getAttribute('data-open')).toBe('');
    expect(screenContent()?.getAttribute('data-open')).toBe('');
    expect(container.querySelector('[data-state]')).toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(screenContent()?.textContent).toBe('Panel');
  });

  it('requests controlled changes without mutating open state', async () => {
    const onOpenChange = vi.fn();

    function App(props: { open: boolean }) {
      return (
        <Root open={props.open} onOpenChange={onOpenChange}>
          <Trigger>Toggle</Trigger>
          <Content>Panel</Content>
        </Root>
      );
    }

    await act(async () => {
      reactRoot.render(<App open={false} />);
    });

    await act(async () => {
      trigger().click();
    });

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(rootElement().hasAttribute('data-open')).toBe(false);
    expect(trigger().hasAttribute('data-open')).toBe(false);
    expect(screenContent()?.hasAttribute('data-open')).toBe(false);
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(screenContent()?.textContent).toBe('Panel');

    await act(async () => {
      reactRoot.render(<App open />);
    });

    expect(rootElement().getAttribute('data-open')).toBe('');
    expect(trigger().getAttribute('data-open')).toBe('');
    expect(screenContent()?.getAttribute('data-open')).toBe('');
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(screenContent()?.textContent).toBe('Panel');
  });

  it('lets React preventDefault cancel native activation', async () => {
    const onOpenChange = vi.fn();

    await act(async () => {
      reactRoot.render(
        <Root onOpenChange={onOpenChange}>
          <Trigger onClick={(event) => event.preventDefault()}>Toggle</Trigger>
          <Content>Panel</Content>
        </Root>,
      );
    });

    await act(async () => {
      trigger().click();
    });

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screenContent()?.textContent).toBe('Panel');
  });

  it('isolates nested roots and supports asChild refs', async () => {
    const ref = React.createRef<HTMLAnchorElement>();

    await act(async () => {
      reactRoot.render(
        <Root>
          <Trigger>Outer</Trigger>
          <Content>
            <Root>
              <Trigger asChild>
                <a href="#inner" ref={ref}>
                  Inner
                </a>
              </Trigger>
              <Content>Inner panel</Content>
            </Root>
          </Content>
        </Root>,
      );
    });

    await act(async () => {
      trigger().click();
    });

    const innerTrigger = container.querySelector<HTMLAnchorElement>('a[href="#inner"]');
    expect(innerTrigger).toBe(ref.current);

    await act(async () => {
      innerTrigger?.click();
    });

    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(innerTrigger?.getAttribute('aria-expanded')).toBe('true');
  });

  it('keeps uncontrolled state through StrictMode callback-ref replacement and cleans old refs', async () => {
    const firstRef = vi.fn();
    const secondRef = vi.fn();

    function App(props: { useSecondRef: boolean }) {
      return (
        <React.StrictMode>
          <Root ref={props.useSecondRef ? secondRef : firstRef}>
            <Trigger>Toggle</Trigger>
            <Content>Panel</Content>
          </Root>
        </React.StrictMode>
      );
    }

    await act(async () => {
      reactRoot.render(<App useSecondRef={false} />);
    });
    await act(async () => {
      trigger().click();
    });

    expect(trigger().getAttribute('aria-expanded')).toBe('true');

    await act(async () => {
      reactRoot.render(<App useSecondRef />);
    });

    expect(firstRef).toHaveBeenLastCalledWith(null);
    expect(secondRef).toHaveBeenLastCalledWith(rootElement());
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(screenContent()?.textContent).toBe('Panel');
  });

  it('preserves closed Content asChild and its children', async () => {
    await act(async () => {
      reactRoot.render(
        <Root>
          <Trigger>Toggle</Trigger>
          <Content asChild>
            <section className="panel">
              <span>Panel child</span>
            </section>
          </Content>
        </Root>,
      );
    });

    const shell = container.querySelector<HTMLElement>('section.panel');
    expect(shell).not.toBeNull();
    expect(shell?.getAttribute('hidden')).toBe('until-found');
    expect(shell?.hasAttribute('data-open')).toBe(false);
    expect(shell?.textContent).toBe('Panel child');
  });

  it('merges asChild className, style, refs, and events with child handlers first', async () => {
    const childRef = React.createRef<HTMLButtonElement>();
    const childClick = vi.fn();
    const triggerClick = vi.fn();

    await act(async () => {
      reactRoot.render(
        <Root>
          <Trigger asChild className="from-trigger" style={{ color: 'red' }} onClick={triggerClick}>
            <button
              className="from-child"
              ref={childRef}
              style={{ backgroundColor: 'blue' }}
              onClick={childClick}
            >
              Toggle
            </button>
          </Trigger>
          <Content>Panel</Content>
        </Root>,
      );
    });

    const button = trigger();
    await act(async () => {
      button.click();
    });

    expect(childRef.current).toBe(button);
    expect(button.className).toContain('from-child');
    expect(button.className).toContain('from-trigger');
    expect(button.style.backgroundColor).toBe('blue');
    expect(button.style.color).toBe('red');
    expect(childClick.mock.invocationCallOrder[0]).toBeLessThan(
      triggerClick.mock.invocationCallOrder[0]!,
    );
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });

  it('lets Slot clean up child callback refs on replacement and unmount', async () => {
    const firstCleanup = vi.fn();
    const secondCleanup = vi.fn();
    const firstRef = vi.fn(() => firstCleanup);
    const secondRef = vi.fn(() => secondCleanup);
    const render = (ref: React.Ref<HTMLButtonElement>) => (
      <Root defaultOpen>
        <Trigger asChild>
          <button ref={ref}>Toggle</button>
        </Trigger>
        <Content>Panel</Content>
      </Root>
    );
    await act(async () => {
      reactRoot.render(render(firstRef));
    });
    expect(firstRef).toHaveBeenCalledWith(trigger());
    await act(async () => {
      reactRoot.render(render(secondRef));
    });
    expect(firstCleanup).toHaveBeenCalledTimes(1);
    expect(secondRef).toHaveBeenCalledWith(trigger());
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    await act(async () => {
      reactRoot.render(null);
    });
    expect(secondCleanup).toHaveBeenCalledTimes(1);
  });

  it('lets Slot compose child props over the forwarded props', async () => {
    await act(async () => {
      reactRoot.render(
        <Root>
          <Trigger disabled asChild>
            <button disabled={false}>Toggle</button>
          </Trigger>
          <Content>Panel</Content>
        </Root>,
      );
    });
    expect(trigger().hasAttribute('disabled')).toBe(false);
    await act(async () => {
      trigger().click();
    });
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('uses a fragment link without submitting its containing form', async () => {
    const submitted = vi.fn((event: React.FormEvent) => event.preventDefault());

    await act(async () => {
      reactRoot.render(
        <form onSubmit={submitted}>
          <Root>
            <Trigger>Toggle</Trigger>
            <Content>Panel</Content>
          </Root>
        </form>,
      );
    });

    await act(async () => {
      trigger().click();
    });

    expect(trigger().tagName).toBe('A');
    expect(submitted).not.toHaveBeenCalled();
  });

  it('renders fragment links during SSR and preserves asChild markup', () => {
    const defaultHtml = renderToString(
      <Root>
        <Trigger>Toggle</Trigger>
      </Root>,
    );
    const submitHtml = renderToString(
      <Root>
        <Trigger type="submit">Toggle</Trigger>
      </Root>,
    );
    const asChildHtml = renderToString(
      <Root>
        <Trigger asChild>
          <button type="submit">Toggle</button>
        </Trigger>
      </Root>,
    );

    expect(defaultHtml).toContain('<a href="#');
    expect(submitHtml).toContain('type="submit"');
    expect(asChildHtml).toContain('type="submit"');
    expect(asChildHtml).not.toContain('type="button"');
  });

  it('honors root and trigger disabled states without firing open-change requests', async () => {
    const rootChange = vi.fn();
    const triggerChange = vi.fn();

    await act(async () => {
      reactRoot.render(
        <>
          <Root disabled onOpenChange={rootChange}>
            <Trigger>Root disabled</Trigger>
            <Content>Panel</Content>
          </Root>
          <Root onOpenChange={triggerChange}>
            <Trigger disabled>Trigger disabled</Trigger>
            <Content>Panel</Content>
          </Root>
        </>,
      );
    });

    const [rootDisabledTrigger, localDisabledTrigger] = allTriggers();

    await act(async () => {
      rootDisabledTrigger?.click();
      localDisabledTrigger?.click();
    });

    expect(rootChange).not.toHaveBeenCalled();
    expect(triggerChange).not.toHaveBeenCalled();
    expect(rootDisabledTrigger?.getAttribute('aria-expanded')).toBe('false');
    expect(localDisabledTrigger?.getAttribute('aria-expanded')).toBe('false');
  });

  it('uses changed controlled props and removes stale callbacks', async () => {
    const first = vi.fn();
    const second = vi.fn();

    function App(props: { onOpenChange?: (open: boolean) => void; open?: boolean }) {
      return (
        <Root open={props.open} onOpenChange={props.onOpenChange}>
          <Trigger>Toggle</Trigger>
          <Content>Panel</Content>
        </Root>
      );
    }

    await act(async () => {
      reactRoot.render(<App open={false} onOpenChange={first} />);
    });
    await act(async () => {
      reactRoot.render(<App open={false} onOpenChange={second} />);
    });
    await act(async () => {
      trigger().click();
    });

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(true);

    await act(async () => {
      reactRoot.render(<App open={false} />);
    });
    await act(async () => {
      trigger().click();
    });

    expect(second).toHaveBeenCalledTimes(1);
  });
});

function trigger() {
  const button = container.querySelector<HTMLElement>('[mlk-collapsible-trigger]');
  if (!button) throw new Error('Expected trigger');
  return button;
}

function allTriggers() {
  return Array.from(container.querySelectorAll<HTMLElement>('[mlk-collapsible-trigger]'));
}

function rootElement() {
  const root = container.querySelector<HTMLElement>('[mlk-collapsible-root]');
  if (!root) throw new Error('Expected root');
  return root;
}

function screenContent() {
  return container.querySelector('[mlk-collapsible-content]');
}

function allContents() {
  return Array.from(container.querySelectorAll<HTMLElement>('[mlk-collapsible-content]'));
}
