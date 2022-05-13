import * as Atomico from 'atomico';
import { html } from 'atomico';
import { createContext } from '@milkui/create-context';
import { useControllableState } from '@milkui/use-controllable-state';

const createId = () => Math.random().toString(36).slice(-6);

const [useCollapsibleProvider, useCollapsibleContext] = createContext({
  id: '',
  open: false,
  onTriggerClick: () => {},
});

/* -------------------------------------------------------------------------------------------------
 * Collapsible
 * -----------------------------------------------------------------------------------------------*/

type CollapsibleEvents = Atomico.Host<{ onOpenChange: CustomEvent<boolean> }>;
interface CollapsibleProps extends Atomico.Props<typeof collapsible.props> {}

const collapsible = (props: CollapsibleProps): CollapsibleEvents => {
  const id = Atomico.useMemo(createId, []);
  const [open, setOpen] = useControllableState({
    prop: props.open,
    defaultProp: props.defaultOpen,
    changeEvent: 'OpenChange',
  });

  const provider = { id, open, onTriggerClick: () => setOpen((open) => !open) };
  useCollapsibleProvider(provider, [id, open]);

  return html`
    <host shadowDom>
      <slot></slot>
    </host>
  `;
};

collapsible.props = {
  defaultOpen: Boolean,
  open: Boolean,
};

/* -------------------------------------------------------------------------------------------------
 * CollapsibleTrigger
 * -----------------------------------------------------------------------------------------------*/

interface CollapsibleTriggerProps {}

const collapsibleTrigger = (props: CollapsibleTriggerProps) => {
  const context = useCollapsibleContext();
  return html`
    <host
      shadowDom
      data-state=${context.open ? 'open' : 'closed'}
      onclick=${preventable(context.onTriggerClick)}
    >
      <button part="root" aria-controls=${context.id} aria-expanded=${context.open}>
        <slot></slot>
      </button>
    </host>
  `;
};

collapsibleTrigger.props = {
  id: String,
};

/* -------------------------------------------------------------------------------------------------
 * CollapsibleContent
 * -----------------------------------------------------------------------------------------------*/

interface CollapsibleContentProps {}

const collapsibleContent = (props: CollapsibleContentProps) => {
  const context = useCollapsibleContext();
  return html`
    <host shadowDom data-state=${context.open ? 'open' : 'closed'}>
      ${
        context.open &&
        html`
          <div part="root" id=${context.id}>
            <slot></slot>
          </div>
        `
      }
    </host>
  `;
};

collapsibleContent.props = {
  id: String,
};

/* ---------------------------------------------------------------------------------------------- */

function preventable<T extends Event>(handler: (event: T) => void) {
  return (event: T) => {
    if (!event.defaultPrevented) {
      handler(event);
    }
  };
}

const Collapsible = Atomico.c(collapsible);
const CollapsibleTrigger = Atomico.c(collapsibleTrigger);
const CollapsibleContent = Atomico.c(collapsibleContent);

customElements.define('milk-collapsible', Collapsible);
customElements.define('milk-collapsible-trigger', CollapsibleTrigger);
customElements.define('milk-collapsible-content', CollapsibleContent);

export {
  Collapsible as Root,
  CollapsibleTrigger as Trigger,
  CollapsibleContent as Content,
  //
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
};
