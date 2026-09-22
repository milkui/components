import * as React from 'react';
import { act } from 'react';
import { createPortal } from 'react-dom';
import { createRoot, hydrateRoot, type Root as ReactRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Content, Header, Item, Root, Trigger } from './accordion.js';

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

describe('@milkui/react/accordion', () => {
  it('keeps repeated values independent with unique generated fragment IDs', async () => {
    const onValueChange = vi.fn();
    function Group() {
      return (
        <Root collapsible onValueChange={onValueChange}>
          <Item value="shipping">
            <Trigger>Shipping</Trigger>
            <Content>Shipping details</Content>
          </Item>
        </Root>
      );
    }
    await act(async () => {
      reactRoot.render(
        <>
          <Group />
          <Group />
        </>,
      );
    });
    const items = container.querySelectorAll<HTMLElement>('[mlk-accordion-item]');
    const triggers = container.querySelectorAll<HTMLElement>('[mlk-accordion-trigger]');
    const contents = container.querySelectorAll<HTMLElement>('[mlk-accordion-content]');
    expect(items[0].hasAttribute('id')).toBe(false);
    expect(contents[0].id).not.toBe(contents[1].id);
    expect(triggers[0].getAttribute('href')).toBe('#' + contents[0].id);
    expect(triggers[1].getAttribute('href')).toBe('#' + contents[1].id);
    expect(container.querySelector('[data-value]')).toBeNull();
    await act(async () => {
      triggers[1].click();
    });
    expect(onValueChange).toHaveBeenLastCalledWith('shipping');
    expect(items[0].hasAttribute('data-open')).toBe(false);
    expect(items[1].hasAttribute('data-open')).toBe(true);
    await act(async () => {
      history.replaceState(null, '', '#' + contents[0].id);
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });
    expect(items[0].hasAttribute('data-open')).toBe(true);
    history.replaceState(null, '', '/');
  });

  it('hydrates the current fragment selection rather than resetting to defaultValue', async () => {
    const ui = (
      <Root defaultValue="one" collapsible>
        <Item id="hydrate-one" value="one">
          <Trigger>One</Trigger>
          <Content>One</Content>
        </Item>
        <Item id="hydrate-two" value="two">
          <Trigger>Two</Trigger>
          <Content>Two</Content>
        </Item>
      </Root>
    );
    const html = renderToString(ui);
    expect(html).toContain('href="#hydrate-two-content"');
    expect(html).not.toContain('data-interactive');
    await act(async () => {
      reactRoot.unmount();
    });
    container.innerHTML = html;
    history.replaceState(null, '', '#hydrate-two');
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await act(async () => {
        reactRoot = hydrateRoot(container, ui);
      });
      expect(container.querySelector('#hydrate-one')!.hasAttribute('data-open')).toBe(false);
      expect(container.querySelector('#hydrate-two')!.hasAttribute('data-open')).toBe(true);
      expect(error).not.toHaveBeenCalled();
    } finally {
      error.mockRestore();
      history.replaceState(null, '', '/');
    }
  });

  it('renders SSR attributes and hydrates through the native primitive contract', async () => {
    const html = renderToString(
      <Root defaultValue="one">
        <Item value="one">
          <Header>
            <Trigger>One</Trigger>
          </Header>
          <Content>One panel</Content>
        </Item>
      </Root>,
    );

    expect(html).toContain('mlk-accordion-root=""');
    expect(html).toContain('mlk-accordion-item=""');
    expect(html).toContain('mlk-accordion-header=""');
    expect(html).toContain('mlk-accordion-trigger=""');
    expect(html).toContain('mlk-accordion-content=""');
    expect(html).toContain('data-open=""');
    expect(html).not.toContain('aria-expanded');
    expect(html).not.toContain('aria-disabled');
    expect(html).not.toContain('mlk-collapsible-root');
    expect(html).not.toContain('data-state');
    expect(html).not.toContain('hidden=""');

    await act(async () => {
      reactRoot.unmount();
    });
    container.innerHTML = html;
    await act(async () => {
      reactRoot = hydrateRoot(
        container,
        <Root defaultValue="one">
          <Item value="one">
            <Header>
              <Trigger>One</Trigger>
            </Header>
            <Content>One panel</Content>
          </Item>
        </Root>,
      );
    });

    expect(trigger().getAttribute('aria-controls')).toBe(content()?.id);
    expect(content()?.getAttribute('aria-labelledby')).toBe(trigger().id);
    expect(content()?.textContent).toBe('One panel');
  });

  it('supports uncontrolled single state without accordion state in the adapter', async () => {
    const onValueChange = vi.fn();
    await act(async () => {
      reactRoot.render(
        <Root onValueChange={onValueChange}>
          <Item value="one">
            <Header>
              <Trigger>One</Trigger>
            </Header>
            <Content>One panel</Content>
          </Item>
          <Item value="two">
            <Header>
              <Trigger>Two</Trigger>
            </Header>
            <Content>Two panel</Content>
          </Item>
        </Root>,
      );
    });

    await act(async () => {
      triggers()[1]!.click();
    });

    expect(onValueChange).toHaveBeenCalledWith('two');
    expect(triggers()[0]!.getAttribute('aria-expanded')).toBe('false');
    expect(triggers()[1]!.getAttribute('aria-expanded')).toBe('true');
    expect(contents()[0]!.textContent).toBe('One panel');
    expect(contents()[1]!.textContent).toBe('Two panel');
    expect(container.querySelector('[mlk-collapsible-trigger]')).toBeNull();
  });

  it('requests controlled multiple updates and waits for parent value changes', async () => {
    const onValueChange = vi.fn();
    function App(props: { value: string[] }) {
      return (
        <Root type="multiple" value={props.value} onValueChange={onValueChange}>
          <Item value="one">
            <Trigger>One</Trigger>
            <Content>One panel</Content>
          </Item>
          <Item value="two">
            <Trigger>Two</Trigger>
            <Content>Two panel</Content>
          </Item>
        </Root>
      );
    }

    await act(async () => {
      reactRoot.render(<App value={['one']} />);
    });
    await act(async () => {
      triggers()[1]!.click();
    });

    expect(onValueChange).toHaveBeenCalledWith(['one', 'two']);
    expect(triggers()[1]!.getAttribute('aria-expanded')).toBe('false');

    await act(async () => {
      reactRoot.render(<App value={['two']} />);
    });

    expect(triggers()[0]!.getAttribute('aria-expanded')).toBe('false');
    expect(triggers()[1]!.getAttribute('aria-expanded')).toBe('true');
  });

  it('keeps closed content and its children mounted', async () => {
    await act(async () => {
      reactRoot.render(
        <Root>
          <Item value="closed">
            <Trigger>Closed</Trigger>
            <Content>Closed panel</Content>
          </Item>
          <Item value="forced">
            <Trigger>Forced</Trigger>
            <Content>Forced panel</Content>
          </Item>
        </Root>,
      );
    });

    expect(contents()[0]!.getAttribute('hidden')).toBe('until-found');
    expect(contents()[0]!.textContent).toBe('Closed panel');
    expect(contents()[1]!.textContent).toBe('Forced panel');
  });

  it('lets React handlers prevent native activation and keyboard movement', async () => {
    await act(async () => {
      reactRoot.render(
        <Root>
          <Item value="one">
            <Trigger onClick={(event) => event.preventDefault()} onKeyDown={(event) => event.preventDefault()}>
              One
            </Trigger>
            <Content>One panel</Content>
          </Item>
          <Item value="two">
            <Trigger>Two</Trigger>
            <Content>Two panel</Content>
          </Item>
        </Root>,
      );
    });

    await act(async () => {
      triggers()[0]!.click();
    });
    expect(triggers()[0]!.getAttribute('aria-expanded')).toBe('false');

    triggers()[0]!.focus();
    await act(async () => {
      keydown(triggers()[0]!, 'ArrowDown');
    });
    expect(document.activeElement).toBe(triggers()[0]);
  });

  it('keeps portalled items in the same accordion collection', async () => {
    const portalHost = document.createElement('div');
    document.body.append(portalHost);

    await act(async () => {
      reactRoot.render(
        <Root>
          <Item value="one">
            <Trigger>One</Trigger>
            <Content>One panel</Content>
          </Item>
          {createPortal(
            <Item value="two">
              <Trigger>Two</Trigger>
              <Content>Two panel</Content>
            </Item>,
            portalHost,
          )}
        </Root>,
      );
    });

    const [firstTrigger] = triggers();
    const portalledTrigger = portalHost.querySelector<HTMLButtonElement>('[mlk-accordion-trigger]')!;

    await act(async () => {
      portalledTrigger.click();
    });

    expect(firstTrigger!.getAttribute('aria-expanded')).toBe('false');
    expect(portalledTrigger.getAttribute('aria-expanded')).toBe('true');

    firstTrigger!.focus();
    await act(async () => {
      keydown(firstTrigger!, 'ArrowDown');
    });

    expect(document.activeElement).toBe(portalledTrigger);
  });
});

function trigger() {
  const button = container.querySelector<HTMLElement>('[mlk-accordion-trigger]');
  if (!button) throw new Error('Expected trigger');
  return button;
}

function triggers() {
  return Array.from(container.querySelectorAll<HTMLButtonElement>('[mlk-accordion-trigger]'));
}

function content() {
  return container.querySelector<HTMLElement>('[mlk-accordion-content]');
}

function contents() {
  return Array.from(container.querySelectorAll<HTMLElement>('[mlk-accordion-content]'));
}

function keydown(element: HTMLElement, key: string) {
  element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key }));
}
