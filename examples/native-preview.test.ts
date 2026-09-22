import { describe, expect, it } from 'vitest';
import { renderNativePreviewDocument, withDefaultAttributes } from './native-preview';

describe('native preview default attributes', () => {
  it('adds primitive defaults immediately after marker attributes', () => {
    expect(withDefaultAttributes('<button mlk-button class="demo-button">Save</button>')).toBe(
      '<button mlk-button type="button" class="demo-button">Save</button>',
    );
    expect(withDefaultAttributes('<button mlk-button class="demo-trigger">Toggle</button>')).toBe(
      '<button mlk-button type="button" class="demo-trigger">Toggle</button>',
    );
  });

  it('inherits hidden-until-found defaults and leaves initially open panels visible', () => {
    expect(withDefaultAttributes('<div mlk-collapsible-content></div>')).toBe(
      '<div mlk-collapsible-content hidden="until-found"></div>',
    );
    expect(withDefaultAttributes('<div mlk-accordion-content></div>')).toBe(
      '<div mlk-accordion-content hidden="until-found"></div>',
    );
    expect(withDefaultAttributes('<div mlk-accordion-content data-open></div>')).toBe(
      '<div mlk-accordion-content data-open></div>',
    );
  });

  it('handles marker values and quoted attributes when inserting defaults', () => {
    expect(withDefaultAttributes('<button mlk-button="" class="demo-button">Save</button>')).toBe(
      '<button mlk-button="" type="button" class="demo-button">Save</button>',
    );
    expect(withDefaultAttributes('<button mlk-button title="type=submit">Save</button>')).toBe(
      '<button mlk-button type="button" title="type=submit">Save</button>',
    );
    expect(withDefaultAttributes('<button mlk-button title="2 > 1">Save</button>')).toBe(
      '<button mlk-button type="button" title="2 > 1">Save</button>',
    );
  });

  it('preserves explicit native attributes', () => {
    expect(withDefaultAttributes('<button mlk-button type="submit">Save</button>')).toBe(
      '<button mlk-button type="submit">Save</button>',
    );
  });

  it('renders two independent accordions with revealable content and matching links', () => {
    const document = new DOMParser().parseFromString(
      renderNativePreviewDocument('accordion-independent'),
      'text/html',
    );
    expect(document.querySelectorAll('[mlk-accordion-root]')).toHaveLength(2);
    expect(document.querySelectorAll('[hidden="until-found"]')).toHaveLength(2);
    expect(document.querySelectorAll('[data-open]')).toHaveLength(2);
    expect(document.querySelectorAll('[data-open][hidden]')).toHaveLength(0);
    for (const trigger of document.querySelectorAll('[mlk-accordion-trigger]')) {
      const target = document.getElementById(trigger.getAttribute('href')!.slice(1));
      expect(target?.hasAttribute('mlk-accordion-content')).toBe(true);
    }
    const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('serves no-JS button semantics in initial preview HTML', () => {
    const document = new DOMParser().parseFromString(
      renderNativePreviewDocument('button-basic'),
      'text/html',
    );
    const button = document.querySelector<HTMLButtonElement>('[mlk-button]')!;

    expect(button.getAttribute('type')).toBe('button');
    expect(button.textContent).toBe('Save changes');
  });
});
