import { defineAccordion, Root as AccordionRoot } from '@milkui/accordion';
import { defineButton } from '@milkui/button';
import { defineCollapsible, Root as CollapsibleRoot } from '@milkui/collapsible';

import { resolveNativeExample, templates, type NativeExampleKey } from './native-preview';

const requested = new URLSearchParams(window.location.search).get('example');
const pathExample = window.location.pathname.match(/^\/native\/([^/]+)\.html$/)?.[1] ?? null;
const example = resolveNativeExample(pathExample ?? requested);
const app = document.getElementById('native-app')!;
if (app.dataset.example !== example) {
  app.innerHTML = templates[example];
  app.dataset.example = example;
}
document.title = `Milk UI Native · ${example}`;
if (example.startsWith('accordion-')) defineAccordion(document);
else if (example.startsWith('button-')) defineButton(document);
else defineCollapsible(document);
connectExample(example);
connectResizeMessages();

function connectExample(key: NativeExampleKey) {
  if (key === 'collapsible-controlled') connectCollapsibleControlled();
  if (key === 'collapsible-animation') connectCollapsibleAnimation();
  if (key === 'collapsible-nested') connectCollapsibleNested();
  if (key === 'accordion-controlled') connectAccordionControlled();
}

function connectCollapsibleControlled() {
  const rootElement = element<HTMLElement>('controlled-root');
  let open = CollapsibleRoot.get(rootElement)?.open ?? false;
  let acceptRequests = true;
  const accept = element<HTMLInputElement>('controlled-accept');
  const external = element<HTMLButtonElement>('controlled-external');
  const root = CollapsibleRoot.mount(rootElement, {
    open,
    onOpenChange(nextOpen: boolean) {
      if (acceptRequests) setOpen(nextOpen);
      postSize();
    },
  });
  const setOpen = (nextOpen: boolean) => {
    open = nextOpen;
    root.update({ open });
    postSize();
  };
  accept.addEventListener('change', () => {
    acceptRequests = accept.checked;
  });
  external.addEventListener('click', () => setOpen(!open));
}

function connectCollapsibleAnimation() {
  const content = element<HTMLElement>('animation-root').querySelector<HTMLElement>(
    '[mlk-collapsible-content]',
  )!;
  element<HTMLInputElement>('animation-transition').addEventListener('change', (event) => {
    content.classList.toggle(
      'transition-content',
      (event.currentTarget as HTMLInputElement).checked,
    );
    postSize();
  });
  CollapsibleRoot.mount(element<HTMLElement>('animation-root'), {
    onOpenChange() {
      postSize();
    },
  });
}

function connectCollapsibleNested() {
  const prevent = element<HTMLInputElement>('nested-prevent');
  element<HTMLButtonElement>('nested-outer-trigger').addEventListener(
    'click',
    (event) => {
      if (prevent.checked) event.preventDefault();
    },
    { capture: true },
  );
}

function connectAccordionControlled() {
  const rootElement = element<HTMLElement>('accordion-controlled');
  let value = AccordionRoot.get(rootElement)?.values[0] ?? '';
  let acceptRequests = true;
  const accept = element<HTMLInputElement>('accordion-controlled-accept');
  const external = element<HTMLButtonElement>('accordion-controlled-external');
  const root = AccordionRoot.mount(rootElement, {
    type: 'single',
    value,
    onValueChange(nextValue) {
      if (acceptRequests) setValue(String(nextValue));
      postSize();
    },
  });
  const setValue = (nextValue: string) => {
    value = nextValue;
    root.update({ value });
    postSize();
  };
  accept.addEventListener('change', () => {
    acceptRequests = accept.checked;
  });
  external.addEventListener('click', () => setValue(value === 'usage-content' ? 'api-content' : 'usage-content'));
}

function element<T extends HTMLElement>(id: string) {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Missing #${id}`);
  return found as T;
}

function connectResizeMessages() {
  const observer = new ResizeObserver(postSize);
  observer.observe(app);
  window.addEventListener('load', postSize);
  postSize();
}

function postSize() {
  window.parent.postMessage(
    {
      type: 'milkui:native-preview-size',
      example,
      height: Math.ceil(app.getBoundingClientRect().height),
    },
    window.location.origin,
  );
}
