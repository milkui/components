import * as React from 'react';
import { act } from 'react';
import { createRoot, type Root as ReactRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Button } from './button.js';

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

describe('@milkui/react/button', () => {
  it('uses the native button primitive and allows enabled clicks', async () => {
    const click = vi.fn();

    await act(async () => {
      reactRoot.render(<Button onClick={click}>Save</Button>);
    });

    const button = container.querySelector<HTMLButtonElement>('[mlk-button]')!;
    button.click();

    expect(button.getAttribute('type')).toBe('button');
    expect(button.disabled).toBe(false);
    expect(click).toHaveBeenCalledTimes(1);
  });

  it('disables clicks through the shared disabled prop', async () => {
    const click = vi.fn();

    await act(async () => {
      reactRoot.render(
        <Button disabled onClick={click}>
          Save
        </Button>,
      );
    });

    const button = container.querySelector<HTMLButtonElement>('[mlk-button]')!;
    button.click();

    expect(button.disabled).toBe(true);
    expect(click).not.toHaveBeenCalled();
  });

  it('renders default and explicit button types during SSR', () => {
    expect(renderToString(<Button>Save</Button>)).toContain('type="button"');
    expect(renderToString(<Button type="submit">Save</Button>)).toContain('type="submit"');
    expect(renderToString(<Button type={undefined}>Save</Button>)).toContain('type="button"');
  });

  it('cleans forwarded callback refs on replacement and unmount', async () => {
    const firstCleanup = vi.fn();
    const secondCleanup = vi.fn();
    const firstRef = vi.fn(() => firstCleanup);
    const secondRef = vi.fn(() => secondCleanup);
    await act(async () => {
      reactRoot.render(<Button ref={firstRef}>Save</Button>);
    });
    const button = container.querySelector('button');
    await act(async () => {
      reactRoot.render(<Button ref={secondRef}>Save</Button>);
    });
    expect(container.querySelector('button')).toBe(button);
    expect(firstCleanup).toHaveBeenCalledTimes(1);
    expect(firstRef).toHaveBeenCalledTimes(1);
    expect(secondRef).toHaveBeenCalledWith(button);
    await act(async () => {
      reactRoot.render(null);
    });
    expect(secondCleanup).toHaveBeenCalledTimes(1);
    expect(secondRef).toHaveBeenCalledTimes(1);
  });

  it('renders asChild button defaults during SSR without overriding explicit types', () => {
    const defaultHtml = renderToString(
      <Button asChild>
        <button>Save</button>
      </Button>,
    );
    const undefinedHtml = renderToString(
      <Button asChild>
        <button type={undefined}>Save</button>
      </Button>,
    );
    const submitHtml = renderToString(
      <Button asChild>
        <button type="submit">Save</button>
      </Button>,
    );

    expect(defaultHtml).toContain('type="button"');
    expect(undefinedHtml).not.toContain('type=');
    expect(submitHtml).toContain('type="submit"');
    expect(submitHtml).toContain('mlk-button=""');
    expect(submitHtml).not.toContain('type="button"');
  });
});
