import * as Accordion from '@milkui/core/accordion';
import { Button } from '@milkui/core/button';
import * as Collapsible from '@milkui/core/collapsible';

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
if (example.startsWith('accordion-')) {
  Accordion.Root.define(document);
  Accordion.Item.define(document);
  Accordion.Header.define(document);
  Accordion.Trigger.define(document);
  Accordion.Content.define(document);
} else if (example.startsWith('button-')) {
  Button.define(document);
} else {
  Collapsible.Root.define(document);
  Collapsible.Trigger.define(document);
  Collapsible.Content.define(document);
}
queueMicrotask(() => connectExample(example));
connectResizeMessages();

function connectExample(key: NativeExampleKey) {
  if (key === 'collapsible-controlled') connectCollapsibleControlled();
  if (key === 'collapsible-animation') connectCollapsibleAnimation();
  if (key === 'collapsible-nested') connectCollapsibleNested();
  if (key === 'accordion-controlled') connectAccordionControlled();
}

function connectCollapsibleControlled() {
  const rootElement = element<HTMLElement>('controlled-root');
  let open = Collapsible.Root.get(rootElement)?.open ?? false;
  let acceptRequests = true;
  const accept = element<HTMLInputElement>('controlled-accept');
  const external = element<HTMLButtonElement>('controlled-external');
  const root = Collapsible.Root.mount(rootElement, {
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
  Collapsible.Root.mount(element<HTMLElement>('animation-root'), {
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
  let value = Accordion.Root.get(rootElement)?.values[0] ?? '';
  let acceptRequests = true;
  const accept = element<HTMLInputElement>('accordion-controlled-accept');
  const external = element<HTMLButtonElement>('accordion-controlled-external');
  const root = Accordion.Root.mount(rootElement, {
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
