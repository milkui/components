import { describe, expect, it, vi } from 'vitest';
import { Button, defineButton } from './index.js';

describe('@milkui/core/button native behavior', () => {
  it('uses the mlk marker and preserves authored disabled state on discovery', () => {
    const host = document.createElement('div');
    host.innerHTML = `<button mlk-button disabled>Disabled</button>`;
    document.body.append(host);
    const button = host.querySelector<HTMLButtonElement>('[mlk-button]')!;
    const click = vi.fn();
    button.addEventListener('click', click);

    const cleanup = defineButton(host);

    expect(Button.attribute).toBe('mlk-button');
    expect(Button.defaultAttributes).toEqual({ type: 'button' });
    expect(button.hasAttribute('type')).toBe(false);
    expect(button.disabled).toBe(true);

    button.click();
    expect(click).not.toHaveBeenCalled();

    cleanup();
  });

  it('allows normal clicks when enabled', () => {
    const button = document.createElement('button');
    const click = vi.fn();
    button.addEventListener('click', click);

    Button.mount(button);
    button.click();

    expect(button.hasAttribute('type')).toBe(false);
    expect(button.disabled).toBe(false);
    expect(click).toHaveBeenCalledTimes(1);
  });

  it('preserves an explicit native button type on mount', () => {
    const button = document.createElement('button');
    button.setAttribute('type', 'submit');

    Button.mount(button);

    expect(button.getAttribute('type')).toBe('submit');
  });
});
