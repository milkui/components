import * as Hooked from 'hooked-elements';
import { primitive, preventableEvent } from '@milkui/primitive';
import { useControllableState } from '@milkui/use-controllable-state';

/* -------------------------------------------------------------------------------------------------
 * Collapsible
 * -----------------------------------------------------------------------------------------------*/

type CollapsibleContextValue = {
  open: boolean;
  contentId: string;
  onTriggerClick(): void;
};
const CollapsibleContext = Hooked.createContext<CollapsibleContextValue>({} as any);

interface CollapsibleAttrs {
  open?: boolean;
  defaultOpen?: boolean;
}

const Collapsible = primitive<'div', CollapsibleAttrs>({
  name: 'collapsible',
  element: 'div',
  observedAttributes: ['data-open', 'data-default-open'],
  render(element, attrs) {
    const { open: openAttr, defaultOpen } = attrs;
    const id = Hooked.useMemo(() => uid(), []);
    const contentId = `collapsible-content-${id}`;

    const [open = false, setOpen] = useControllableState({
      value: openAttr,
      defaultValue: defaultOpen,
      onChange: (open) => {
        const event = new CustomEvent('mk-openchange', { detail: open });
        element.dispatchEvent(event);
      },
    });

    const provider = Hooked.useMemo(
      () => ({ open, contentId, onTriggerClick: () => setOpen((prevOpen) => !prevOpen) }),
      [contentId, open],
    );

    element.setAttribute('data-state', getState(open));
    CollapsibleContext.provide(provider);
  },
});

/* -------------------------------------------------------------------------------------------------
 * CollapsibleTrigger
 * -----------------------------------------------------------------------------------------------*/

interface CollapsibleTriggerAttrs {
  type?: string;
}

const CollapsibleTrigger = primitive<'button', CollapsibleTriggerAttrs>({
  name: 'collapsible_trigger',
  element: 'button',
  observedAttributes: ['type'],
  render(element, attrs) {
    const context = Hooked.useContext(CollapsibleContext);
    const type = attrs.type || element.tagName === 'BUTTON' ? 'button' : undefined;
    if (type) element.setAttribute('type', type);
    element.setAttribute('aria-controls', context.contentId);
    element.setAttribute('aria-expanded', String(context.open));
    element.setAttribute('data-state', getState(context.open));
    element.onclick = preventableEvent(context.onTriggerClick);
  },
});

/* -------------------------------------------------------------------------------------------------
 * CollapsibleContent
 * -----------------------------------------------------------------------------------------------*/

const CollapsibleContent = primitive({
  name: 'collapsible_content',
  element: 'div',
  render(element) {
    const context = Hooked.useContext(CollapsibleContext);
    element.setAttribute('id', context.contentId);
    element.setAttribute('data-state', getState(context.open));
    element.style.setProperty('display', context.open ? 'revert' : 'none');
  },
});

/* ---------------------------------------------------------------------------------------------- */

function getState(open: boolean) {
  return open ? 'open' : 'closed';
}

function uid() {
  return Math.random().toString(36).slice(2, 8);
}

export type { CollapsibleAttrs, CollapsibleTriggerAttrs };
export { Collapsible as Root, CollapsibleTrigger as Trigger, CollapsibleContent as Content };
