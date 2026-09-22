import accordionStyles from './accordion.css?raw';
import buttonStyles from './button.css?raw';
import collapsibleStyles from './collapsible.css?raw';
import * as React from 'react';
import { componentHref, type DocsState, type ComponentName, type Framework } from './routes';
import * as Accordion from '@milkui/react/accordion';
import { Button } from '@milkui/react/button';
import * as Collapsible from '@milkui/react/collapsible';
import {
  allNativeExamples,
  nativePreviewFileName,
  withDefaultAttributes,
  type NativeExampleKey,
} from './native-preview';

type Example = {
  key: NativeExampleKey;
  label: string;
  summary: string;
  reactCode: string;
  nativeCode: string;
  ReactDemo: React.ComponentType;
};

const frameworks: Framework[] = ['react', 'native'];
const components: { name: ComponentName; label: string }[] = [
  { name: 'accordion', label: 'Accordion' },
  { name: 'button', label: 'Button' },
  { name: 'collapsible', label: 'Collapsible' },
];

const collapsibleHeroReactCode = `import * as Collapsible from '@milkui/react/collapsible';

export function Packages() {
  return (
    <Collapsible.Root id="packages" className="package-list">
      <div className="package-list__row package-list__row--featured">
        <span>@milkui/react/collapsible</span>
        <span>React primitive</span>
      </div>
      <Collapsible.Trigger>Show packages</Collapsible.Trigger>
      <Collapsible.Content>
        <div className="package-list__row">
          <span>@milkui/react/collapsible</span>
          <span>React adapter</span>
        </div>
        <div className="package-list__row">
          <span>@milkui/core/primitive</span>
          <span>Shared lifecycle</span>
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}`;

const collapsibleHeroNativeCode = `<script type="module">
  import { defineCollapsible } from '@milkui/core/collapsible';
  defineCollapsible(document);
</script>

<div mlk-collapsible-root id="packages" class="package-list">
  <div class="package-list__row package-list__row--featured">
    <span>@milkui/core/collapsible</span>
    <span>Native primitive</span>
  </div>
  <a mlk-collapsible-trigger href="#packages-content">Show packages</a>
  <div mlk-collapsible-content id="packages-content">
    <div class="package-list__row">
      <span>@milkui/react/collapsible</span>
      <span>React adapter</span>
    </div>
    <div class="package-list__row">
      <span>@milkui/core/primitive</span>
      <span>Shared lifecycle</span>
    </div>
  </div>
</div>`;

const accordionHeroReactCode = `import * as Accordion from '@milkui/react/accordion';

export function Packages() {
  return (
    <Accordion.Root type="single" defaultValue="native" collapsible>
      <Accordion.Item value="native">
        <Accordion.Header>
          <Accordion.Trigger>Native package</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <div className="demo__content-inner">@milkui/core/accordion</div>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="react">
        <Accordion.Header>
          <Accordion.Trigger>React adapter</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <div className="demo__content-inner">@milkui/react/accordion</div>
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="primitive">
        <Accordion.Header>
          <Accordion.Trigger>Shared primitive</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <div className="demo__content-inner">@milkui/core/primitive</div>
        </Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}`;

const accordionHeroNativeCode = `<script type="module">
  import { defineAccordion } from '@milkui/core/accordion';
  defineAccordion(document);
</script>

<div mlk-accordion-root data-type="single" data-collapsible>
  <div mlk-accordion-item>
    <h3 mlk-accordion-header>
      <a mlk-accordion-trigger href="#native-content">Native package</a>
    </h3>
    <div mlk-accordion-content id="native-content" data-open>
      <div class="demo__content-inner">@milkui/core/accordion</div>
    </div>
  </div>
  <div mlk-accordion-item>
    <h3 mlk-accordion-header>
      <a mlk-accordion-trigger href="#react-content">React adapter</a>
    </h3>
    <div mlk-accordion-content id="react-content">
      <div class="demo__content-inner">@milkui/react/accordion</div>
    </div>
  </div>
  <div mlk-accordion-item>
    <h3 mlk-accordion-header>
      <a mlk-accordion-trigger href="#primitive-content">Shared primitive</a>
    </h3>
    <div mlk-accordion-content id="primitive-content">
      <div class="demo__content-inner">@milkui/core/primitive</div>
    </div>
  </div>
</div>`;

const buttonHeroReactCode = `import { Button } from '@milkui/react/button';

export function SaveButton() {
  return <Button>Save changes</Button>;
}`;

const buttonHeroNativeCode = `<script type="module">
  import { defineButton } from '@milkui/core/button';
  defineButton(document);
</script>

<button mlk-button>Save changes</button>`;

const buttonDisabledReactCode = `<Button disabled>
  Save changes
</Button>`;

const buttonDisabledNativeCode = `<script type="module">
  import { defineButton } from '@milkui/core/button';
  defineButton(document);
</script>

<button mlk-button disabled>Save changes</button>`;

const collapsibleControlledReactCode = `const [open, setOpen] = React.useState(false);
const [acceptRequests, setAcceptRequests] = React.useState(true);

<Collapsible.Root
  id="release-notes"
  open={open}
  onOpenChange={(nextOpen: boolean) => {
    if (acceptRequests) setOpen(nextOpen);
  }}
>
  <Collapsible.Trigger>Release notes</Collapsible.Trigger>
  <Collapsible.Content>
    <div className="demo__content-inner">Controlled content</div>
  </Collapsible.Content>
</Collapsible.Root>`;

const collapsibleControlledNativeCode = `<script type="module">
  import { defineCollapsible, Root } from '@milkui/core/collapsible';
  defineCollapsible(document);

  let open = Root.get(document.getElementById('controlled-root')).open;
  const root = Root.mount(document.getElementById('controlled-root'), {
    open,
    onOpenChange(nextOpen: boolean) {
      if (accept.checked) setOpen(nextOpen);
    },
  });

  function setOpen(nextOpen: boolean) {
    open = nextOpen;
    root.update({ open });
  }
</script>`;

const collapsibleAnimationReactCode = `<Collapsible.Root id="animation-details">
  <Collapsible.Trigger>Animation details</Collapsible.Trigger>
  <Collapsible.Content>
    <div className="demo__content-inner">Animated content</div>
  </Collapsible.Content>
</Collapsible.Root>`;

const collapsibleAnimationNativeCode = `<script type="module">
  import { defineCollapsible } from '@milkui/core/collapsible';
  defineCollapsible(document);
</script>

<div mlk-collapsible-root id="animation-details">
  <a mlk-collapsible-trigger href="#animation-details-content">Animation details</a>
  <div mlk-collapsible-content id="animation-details-content">
    <div class="demo__content-inner">Animated content</div>
  </div>
</div>`;

const collapsibleNestedReactCode = `<Collapsible.Root id="outer-details">
  <Collapsible.Trigger asChild>
    <a>Outer details</a>
  </Collapsible.Trigger>
  <Collapsible.Content>
    <Collapsible.Root id="inner-details">
      <Collapsible.Trigger>Inner details</Collapsible.Trigger>
      <Collapsible.Content>Inner state is isolated.</Collapsible.Content>
    </Collapsible.Root>
  </Collapsible.Content>
</Collapsible.Root>`;

const collapsibleNestedNativeCode = `<div mlk-collapsible-root id="outer-details">
  <a mlk-collapsible-trigger href="#outer-details-content">Outer details</a>
  <div mlk-collapsible-content id="outer-details-content">
    <div mlk-collapsible-root id="inner-details">
      <a mlk-collapsible-trigger href="#inner-details-content">Inner details</a>
      <div mlk-collapsible-content id="inner-details-content">Inner state is isolated.</div>
    </div>
  </div>
</div>`;

const accordionControlledReactCode = `const [value, setValue] = React.useState('usage');
const [acceptRequests, setAcceptRequests] = React.useState(true);

<Accordion.Root
  type="single"
  value={value}
  onValueChange={(nextValue) => {
    if (acceptRequests) setValue(nextValue);
  }}
>
  <Accordion.Item value="usage">
    <Accordion.Header>
      <Accordion.Trigger>Usage</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content>
      <div className="demo__content-inner">Controlled accordion content</div>
    </Accordion.Content>
  </Accordion.Item>
</Accordion.Root>`;

const accordionControlledNativeCode = `<script type="module">
  import { defineAccordion, Root } from '@milkui/core/accordion';
  defineAccordion(document);

  let value = Root.get(document.getElementById('accordion-controlled')).values[0] ?? '';
  const root = Root.mount(document.getElementById('accordion-controlled'), {
    type: 'single',
    value,
    onValueChange(nextValue) {
      if (accept.checked) setValue(nextValue);
    },
  });

  function setValue(nextValue: string) {
    value = nextValue;
    root.update({ value });
  }
</script>`;

const accordionMultipleReactCode = `<Accordion.Root type="multiple" defaultValue={['native', 'react']}>
  <Accordion.Item value="native">
    <Accordion.Header>
      <Accordion.Trigger>Native package</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content>
      <div className="demo__content-inner">@milkui/core/accordion</div>
    </Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="react">
    <Accordion.Header>
      <Accordion.Trigger>React adapter</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content>
      <div className="demo__content-inner">@milkui/react/accordion</div>
    </Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="primitive">
    <Accordion.Header>
      <Accordion.Trigger>Shared primitive</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content>
      <div className="demo__content-inner">@milkui/core/primitive</div>
    </Accordion.Content>
  </Accordion.Item>
</Accordion.Root>`;

const accordionMultipleNativeCode = `<div mlk-accordion-root data-type="multiple">
  <div mlk-accordion-item>
    <h3 mlk-accordion-header>
      <a mlk-accordion-trigger href="#multiple-native-content">Native package</a>
    </h3>
    <div mlk-accordion-content id="multiple-native-content" data-open>
      <div class="demo__content-inner">@milkui/core/accordion</div>
    </div>
  </div>
  <div mlk-accordion-item>
    <h3 mlk-accordion-header>
      <a mlk-accordion-trigger href="#multiple-react-content">React adapter</a>
    </h3>
    <div mlk-accordion-content id="multiple-react-content" data-open>
      <div class="demo__content-inner">@milkui/react/accordion</div>
    </div>
  </div>
  <div mlk-accordion-item>
    <h3 mlk-accordion-header>
      <a mlk-accordion-trigger href="#multiple-primitive-content">Shared primitive</a>
    </h3>
    <div mlk-accordion-content id="multiple-primitive-content">
      <div class="demo__content-inner">@milkui/core/primitive</div>
    </div>
  </div>
</div>`;

const accordionHorizontalReactCode = `<Accordion.Root
  className="accordion-horizontal"
  type="single"
  orientation="horizontal"
  defaultValue="one"
>
  <Accordion.Item value="one">
    <Accordion.Header>
      <Accordion.Trigger>One</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content>
      <div className="demo__content-inner">Horizontal item one.</div>
    </Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="two">
    <Accordion.Header>
      <Accordion.Trigger>Two</Accordion.Trigger>
    </Accordion.Header>
    <Accordion.Content>
      <div className="demo__content-inner">Horizontal item two.</div>
    </Accordion.Content>
  </Accordion.Item>
</Accordion.Root>`;

const accordionHorizontalNativeCode = `<div
  mlk-accordion-root
  class="accordion-horizontal"
  data-type="single"

  data-orientation="horizontal"
  dir="ltr"
>
  <div mlk-accordion-item>
    <h3 mlk-accordion-header>
      <a mlk-accordion-trigger href="#horizontal-one-content">One</a>
    </h3>
    <div mlk-accordion-content id="horizontal-one-content" data-open>
      <div class="demo__content-inner">Horizontal item one.</div>
    </div>
  </div>
  <div mlk-accordion-item>
    <h3 mlk-accordion-header>
      <a mlk-accordion-trigger href="#horizontal-two-content">Two</a>
    </h3>
    <div mlk-accordion-content id="horizontal-two-content">
      <div class="demo__content-inner">Horizontal item two.</div>
    </div>
  </div>
</div>`;

const collapsibleReactAnatomy = `import * as Collapsible from '@milkui/react/collapsible';

<Collapsible.Root>
  <Collapsible.Trigger />
  <Collapsible.Content />
</Collapsible.Root>`;

const collapsibleNativeAnatomy = `<script type="module">
  import { defineCollapsible } from '@milkui/core/collapsible';
  defineCollapsible(document);
</script>

<div mlk-collapsible-root id="collapsible">
  <a mlk-collapsible-trigger href="#collapsible-content"></a>
  <div mlk-collapsible-content id="collapsible-content"></div>
</div>`;

const accordionReactAnatomy = `import * as Accordion from '@milkui/react/accordion';

<Accordion.Root type="single">
  <Accordion.Item value="item-1">
    <Accordion.Header>
      <Accordion.Trigger />
    </Accordion.Header>
    <Accordion.Content />
  </Accordion.Item>
</Accordion.Root>`;

const accordionNativeAnatomy = `<script type="module">
  import { defineAccordion } from '@milkui/core/accordion';
  defineAccordion(document);
</script>

<div mlk-accordion-root data-type="single">
  <div mlk-accordion-item>
    <h3 mlk-accordion-header>
      <a mlk-accordion-trigger href="#item-1-content"></a>
    </h3>
    <div mlk-accordion-content id="item-1-content"></div>
  </div>
</div>`;

const buttonReactAnatomy = `import { Button } from '@milkui/react/button';

<Button />`;

const buttonNativeAnatomy = `<script type="module">
  import { defineButton } from '@milkui/core/button';
  defineButton(document);
</script>

<button mlk-button></button>`;

type DocsPage = {
  title: string;
  description: string;
  HeroDemo: React.ComponentType;
  heroNativeExample: NativeExampleKey;
  heroReactCode: string;
  heroNativeCode: string;
  styles: string;
  reactAnatomy: string;
  nativeAnatomy: string;
  examples: Example[];
  features: string[];
};

/* -------------------------------------------------------------------------------------------------
 * Collapsible demos
 * -----------------------------------------------------------------------------------------------*/

function CollapsibleHeroDemo() {
  return (
    <Collapsible.Root id="packages" className="package-list">
      <div className="package-list__row package-list__row--featured">
        <span>@milkui/react/collapsible</span>
        <span>React primitive</span>
      </div>
      <Collapsible.Trigger>Show packages</Collapsible.Trigger>
      <Collapsible.Content>
        <div className="package-list__row">
          <span>@milkui/react/collapsible</span>
          <span>React adapter</span>
        </div>
        <div className="package-list__row">
          <span>@milkui/core/primitive</span>
          <span>Shared lifecycle</span>
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

function CollapsibleControlledDemo() {
  const [open, setOpen] = React.useState(false);
  const [acceptRequests, setAcceptRequests] = React.useState(true);
  return (
    <ExampleDemo title="Controlled collapsible">
      <Collapsible.Root
        id="release-notes"
        open={open}
        onOpenChange={(nextOpen: boolean) => {
          if (acceptRequests) setOpen(nextOpen);
        }}
      >
        <Collapsible.Trigger>Release notes</Collapsible.Trigger>
        <Collapsible.Content>
          <div className="demo__content-inner">Controlled content</div>
        </Collapsible.Content>
      </Collapsible.Root>
      <DemoControls>
        <label>
          <input
            type="checkbox"
            checked={acceptRequests}
            onChange={(event) => setAcceptRequests(event.target.checked)}
          />
          Accept requests
        </label>
        <button type="button" onClick={() => setOpen((value) => !value)}>
          Toggle externally
        </button>
      </DemoControls>
    </ExampleDemo>
  );
}

function CollapsibleAnimationDemo() {
  return (
    <ExampleDemo title="CSS transitions">
      <Collapsible.Root id="animation-details">
        <Collapsible.Trigger>Animation details</Collapsible.Trigger>
        <Collapsible.Content>
          <div className="demo__content-inner">Animated content</div>
        </Collapsible.Content>
      </Collapsible.Root>
    </ExampleDemo>
  );
}

function CollapsibleNestedDemo() {
  const [preventToggle, setPreventToggle] = React.useState(false);
  return (
    <ExampleDemo title="Nested composition">
      <Collapsible.Root id="outer-details">
        <Collapsible.Trigger asChild>
          <a
            onClick={(event) => {
              if (preventToggle) event.preventDefault();
            }}
          >
            Outer details
          </a>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <div className="demo__content-inner">
            <Collapsible.Root id="inner-details">
              <Collapsible.Trigger>Inner details</Collapsible.Trigger>
              <Collapsible.Content className="nested-content">
                <div className="demo__content-inner">Inner state is isolated.</div>
              </Collapsible.Content>
            </Collapsible.Root>
          </div>
        </Collapsible.Content>
      </Collapsible.Root>
      <DemoControls>
        <label>
          <input type="checkbox" checked={preventToggle} onChange={(event) => setPreventToggle(event.target.checked)} />
          Prevent outer toggle
        </label>
      </DemoControls>
    </ExampleDemo>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Accordion demos
 * -----------------------------------------------------------------------------------------------*/

function AccordionHeroDemo() {
  return (
    <Accordion.Root type="single" defaultValue="native" collapsible>
      <AccordionItem value="native" title="Native package">
        @milkui/core/accordion
      </AccordionItem>
      <AccordionItem value="react" title="React adapter">
        @milkui/react/accordion
      </AccordionItem>
      <AccordionItem value="primitive" title="Shared primitive">
        @milkui/core/primitive
      </AccordionItem>
    </Accordion.Root>
  );
}

function AccordionControlledDemo() {
  const [value, setValue] = React.useState('usage');
  const [acceptRequests, setAcceptRequests] = React.useState(true);
  return (
    <ExampleDemo title="Controlled accordion">
      <Accordion.Root
        type="single"
        value={value}
        onValueChange={(nextValue) => {
          if (acceptRequests) setValue(nextValue);
        }}
      >
        <AccordionItem value="usage" title="Usage">
          Controlled accordion content
        </AccordionItem>
        <AccordionItem value="api" title="API">
          The consumer owns the active value.
        </AccordionItem>
      </Accordion.Root>
      <DemoControls>
        <label>
          <input
            type="checkbox"
            checked={acceptRequests}
            onChange={(event) => setAcceptRequests(event.target.checked)}
          />
          Accept requests
        </label>
        <button type="button" onClick={() => setValue(value === 'usage' ? 'api' : 'usage')}>
          Toggle externally
        </button>
      </DemoControls>
    </ExampleDemo>
  );
}

function AccordionMultipleDemo() {
  return (
    <ExampleDemo title="Multiple items">
      <Accordion.Root type="multiple" defaultValue={['native', 'react']}>
        <AccordionItem value="native" title="Native package">
          @milkui/core/accordion
        </AccordionItem>
        <AccordionItem value="react" title="React adapter">
          @milkui/react/accordion
        </AccordionItem>
        <AccordionItem value="primitive" title="Shared primitive">
          @milkui/core/primitive
        </AccordionItem>
      </Accordion.Root>
    </ExampleDemo>
  );
}

function AccordionHorizontalDemo() {
  return (
    <ExampleDemo title="Horizontal orientation">
      <Accordion.Root className="accordion-horizontal" type="single" orientation="horizontal" defaultValue="one">
        <AccordionItem value="one" title="One">
          Horizontal item one.
        </AccordionItem>
        <AccordionItem value="two" title="Two">
          Horizontal item two.
        </AccordionItem>
      </Accordion.Root>
    </ExampleDemo>
  );
}

function AccordionIndependentDemo() {
  return (
    <div className="independent-accordions">
      <section>
        <h3>Delivery</h3>
        <Accordion.Root defaultValue="shipping" collapsible>
          <AccordionItem value="shipping" title="Shipping">
            Shipping information.
          </AccordionItem>
          <AccordionItem value="returns" title="Returns">
            Returns information.
          </AccordionItem>
        </Accordion.Root>
      </section>
      <section>
        <h3>Account</h3>
        <Accordion.Root defaultValue="billing" collapsible>
          <AccordionItem value="billing" title="Billing">
            Billing information.
          </AccordionItem>
          <AccordionItem value="privacy" title="Privacy">
            Privacy information.
          </AccordionItem>
        </Accordion.Root>
      </section>
    </div>
  );
}

function AccordionItem(props: { value: string; title: string; children: React.ReactNode }) {
  return (
    <Accordion.Item value={props.value}>
      <Accordion.Header>
        <Accordion.Trigger>{props.title}</Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content>
        <div className="demo__content-inner">{props.children}</div>
      </Accordion.Content>
    </Accordion.Item>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Button demos
 * -----------------------------------------------------------------------------------------------*/

function ButtonHeroDemo() {
  return <Button>Save changes</Button>;
}

function ButtonDisabledDemo() {
  return <Button disabled>Save changes</Button>;
}

const collapsibleExamples: Example[] = [
  {
    key: 'collapsible-controlled',
    label: 'Controlled',
    summary: 'The primitive requests changes. Your state decides whether to accept them.',
    ReactDemo: CollapsibleControlledDemo,
    reactCode: collapsibleControlledReactCode,
    nativeCode: collapsibleControlledNativeCode,
  },
  {
    key: 'collapsible-animation',
    label: 'CSS transitions',
    summary: 'Content stays mounted; CSS controls opening and closing motion.',
    ReactDemo: CollapsibleAnimationDemo,
    reactCode: collapsibleAnimationReactCode,
    nativeCode: collapsibleAnimationNativeCode,
  },
  {
    key: 'collapsible-nested',
    label: 'Nested composition',
    summary: 'Nested roots resolve their nearest provider and stay isolated.',
    ReactDemo: CollapsibleNestedDemo,
    reactCode: collapsibleNestedReactCode,
    nativeCode: collapsibleNestedNativeCode,
  },
];

const accordionExamples: Example[] = [
  {
    key: 'accordion-independent',
    label: 'Independent accordions',
    summary:
      'Disable JavaScript and reload, then open Returns and Privacy. Both remain visible. Links reveal panels without closing others. Enhancement adds independent single-selection toggling.',
    ReactDemo: AccordionIndependentDemo,
    reactCode: `<Accordion.Root defaultValue="shipping" collapsible>
  <Accordion.Item value="shipping"><Accordion.Trigger>Shipping</Accordion.Trigger><Accordion.Content>Shipping information.</Accordion.Content></Accordion.Item>
  <Accordion.Item value="returns"><Accordion.Trigger>Returns</Accordion.Trigger><Accordion.Content>Returns information.</Accordion.Content></Accordion.Item>
</Accordion.Root>
<Accordion.Root defaultValue="billing" collapsible>
  <Accordion.Item value="billing"><Accordion.Trigger>Billing</Accordion.Trigger><Accordion.Content>Billing information.</Accordion.Content></Accordion.Item>
  <Accordion.Item value="privacy"><Accordion.Trigger>Privacy</Accordion.Trigger><Accordion.Content>Privacy information.</Accordion.Content></Accordion.Item>
</Accordion.Root>`,
    nativeCode: `<div class="independent-accordions">
  <section>
    <h3>Delivery</h3>
    <div mlk-accordion-root data-type="single" data-collapsible>
      <div mlk-accordion-item>
        <h3 mlk-accordion-header><a mlk-accordion-trigger href="#delivery-shipping-content">Shipping</a></h3>
        <div mlk-accordion-content id="delivery-shipping-content" data-open><div class="demo__content-inner">Shipping information.</div></div>
      </div>
      <div mlk-accordion-item>
        <h3 mlk-accordion-header><a mlk-accordion-trigger href="#delivery-returns-content">Returns</a></h3>
        <div mlk-accordion-content id="delivery-returns-content"><div class="demo__content-inner">Returns information.</div></div>
      </div>
    </div>
  </section>
  <section>
    <h3>Account</h3>
    <div mlk-accordion-root data-type="single" data-collapsible>
      <div mlk-accordion-item>
        <h3 mlk-accordion-header><a mlk-accordion-trigger href="#account-billing-content">Billing</a></h3>
        <div mlk-accordion-content id="account-billing-content" data-open><div class="demo__content-inner">Billing information.</div></div>
      </div>
      <div mlk-accordion-item>
        <h3 mlk-accordion-header><a mlk-accordion-trigger href="#account-privacy-content">Privacy</a></h3>
        <div mlk-accordion-content id="account-privacy-content"><div class="demo__content-inner">Privacy information.</div></div>
      </div>
    </div>
  </section>
</div>`,
  },
  {
    key: 'accordion-controlled',
    label: 'Controlled value',
    summary: 'The root requests value changes. Your state decides whether to accept them.',
    ReactDemo: AccordionControlledDemo,
    reactCode: accordionControlledReactCode,
    nativeCode: accordionControlledNativeCode,
  },
  {
    key: 'accordion-multiple',
    label: 'Multiple items',
    summary: 'Multiple accordions can keep more than one item open at a time.',
    ReactDemo: AccordionMultipleDemo,
    reactCode: accordionMultipleReactCode,
    nativeCode: accordionMultipleNativeCode,
  },
  {
    key: 'accordion-horizontal',
    label: 'Horizontal orientation',
    summary: 'Orientation is a root-level option for keyboard navigation and layout.',
    ReactDemo: AccordionHorizontalDemo,
    reactCode: accordionHorizontalReactCode,
    nativeCode: accordionHorizontalNativeCode,
  },
];

const buttonExamples: Example[] = [
  {
    key: 'button-disabled',
    label: 'Disabled',
    summary: 'Disabled buttons keep native button semantics and do not fire click actions.',
    ReactDemo: ButtonDisabledDemo,
    reactCode: buttonDisabledReactCode,
    nativeCode: buttonDisabledNativeCode,
  },
];

/* -------------------------------------------------------------------------------------------------
 * Documentation
 * -----------------------------------------------------------------------------------------------*/

export function App({ state }: { state: DocsState }) {
  const page =
    state.component === 'accordion' ? accordionPage : state.component === 'button' ? buttonPage : collapsiblePage;

  React.useEffect(() => {
    document.title = `Milk UI · ${page.title}`;
  }, [page.title]);

  return (
    <>
      <header className="site-header">
        <a className="brand" href={componentHref(state, 'collapsible')} aria-label="Milk UI home">
          <span className="brand-mark">μ</span>
          <span>Milk UI</span>
        </a>
      </header>

      <main id="top" className="docs-shell">
        <ComponentsNav state={state} />
        <div className="docs-content">
          <section className="hero" aria-labelledby="page-title">
            <h1 id="page-title">{page.title}</h1>
            <p className="lead">{page.description}</p>
            <FrameworkSwitch state={state} />
          </section>

          <section id="demo" className="demo-section" aria-label={`${page.title} demo`}>
            <div className="preview-surface hero-preview">
              {state.framework === 'react' ? (
                <page.HeroDemo />
              ) : (
                <NativePreview example={page.heroNativeExample} title={page.title} />
              )}
            </div>
            <CodeBlock
              css={page.styles}
              title={state.framework === 'react' ? 'React source' : 'Native source'}
              code={state.framework === 'react' ? page.heroReactCode : withDefaultAttributes(page.heroNativeCode)}
            />
          </section>

          <FeaturesSection features={page.features} />
          <AnatomySection framework={state.framework} page={page} />
          <ApiReference framework={state.framework} component={state.component} />
          <ExamplesSection framework={state.framework} examples={page.examples} />
          <AccessibilitySection component={state.component} />
        </div>
        <Toc />
      </main>
    </>
  );
}

const collapsiblePage: DocsPage = {
  title: 'Collapsible',
  description: 'An interactive component that expands and collapses a panel.',
  HeroDemo: CollapsibleHeroDemo,
  heroNativeExample: 'collapsible-basic',
  heroReactCode: collapsibleHeroReactCode,
  heroNativeCode: collapsibleHeroNativeCode,
  styles: collapsibleStyles,
  reactAnatomy: collapsibleReactAnatomy,
  nativeAnatomy: collapsibleNativeAnatomy,
  examples: collapsibleExamples,
  features: [
    'Fragment links work before JavaScript loads.',
    'Controlled or uncontrolled open state.',
    'Semantic elements with no shadow DOM.',
    'React asChild composition, or native marker attributes.',
    'ARIA, data attributes, and keyboard behavior from shared primitive logic.',
    'CSS transitions.',
  ],
};

const accordionPage: DocsPage = {
  title: 'Accordion',
  description: 'A set of collapsible sections for showing one or many panels.',
  HeroDemo: AccordionHeroDemo,
  heroNativeExample: 'accordion-hero',
  heroReactCode: accordionHeroReactCode,
  heroNativeCode: accordionHeroNativeCode,
  styles: accordionStyles,
  reactAnatomy: accordionReactAnatomy,
  nativeAnatomy: accordionNativeAnatomy,
  examples: accordionExamples,
  features: [
    'Fragment links work before JavaScript loads.',
    'Single or multiple item selection.',
    'Controlled or uncontrolled value state.',
    'Collapsible single-item mode.',
    'Disabled roots and disabled items.',
    'Vertical or horizontal orientation with direction support.',
  ],
};

const buttonPage: DocsPage = {
  title: 'Button',
  description: 'A button primitive with native semantics and disabled state.',
  HeroDemo: ButtonHeroDemo,
  heroNativeExample: 'button-basic',
  heroReactCode: buttonHeroReactCode,
  heroNativeCode: buttonHeroNativeCode,
  styles: buttonStyles,
  reactAnatomy: buttonReactAnatomy,
  nativeAnatomy: buttonNativeAnatomy,
  examples: buttonExamples,
  features: [
    'Renders a real button element.',
    'React defaults to type="button"; native markup must specify its own type.',
    'Supports disabled state in React props and native initial attributes.',
    'React asChild composition, or a native marker attribute.',
  ],
};

function ComponentsNav(props: { state: DocsState }) {
  return (
    <aside className="components-nav" aria-label="Components">
      <p>Components</p>
      {components.map((component) => (
        <a
          key={component.name}
          href={componentHref(props.state, component.name)}
          aria-current={props.state.component === component.name ? 'page' : undefined}
        >
          {component.label}
        </a>
      ))}
    </aside>
  );
}

function FrameworkSwitch({ state }: { state: DocsState }) {
  return (
    <nav className="framework-switch" aria-label="Framework">
      {frameworks.map((framework) => (
        <a
          key={framework}
          href={componentHref({ ...state, framework })}
          className={state.framework === framework ? 'active' : ''}
          aria-current={state.framework === framework ? 'page' : undefined}
        >
          {framework === 'react' ? 'React' : 'Native'}
        </a>
      ))}
    </nav>
  );
}

function NativePreview(props: { example: NativeExampleKey; title: string }) {
  const frame = React.useRef<HTMLIFrameElement>(null);
  const fixedHeight = ['accordion-hero', 'collapsible-basic', 'button-basic'].includes(props.example);
  const initialHeight = props.example === 'accordion-independent' ? 620 : 320;
  const [height, setHeight] = React.useState(initialHeight);

  React.useEffect(() => {
    if (fixedHeight) return;
    setHeight(
      props.example === 'accordion-independent'
        ? 620
        : props.example.startsWith('button-')
          ? 170
          : props.example.endsWith('basic')
            ? 300
            : 320,
    );
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frame.current?.contentWindow) return;
      if (!isResizeMessage(event.data) || event.data.example !== props.example) return;
      setHeight(event.data.height);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [props.example, fixedHeight]);

  return (
    <iframe
      ref={frame}
      className="native-frame"
      title={`Native ${props.title} demo`}
      src={`/${nativePreviewFileName(props.example)}`}
      style={{ height: fixedHeight ? 320 : height }}
    />
  );
}

function isResizeMessage(value: unknown): value is { type: string; example: NativeExampleKey; height: number } {
  if (!value || typeof value !== 'object') return false;
  const message = value as Record<string, unknown>;
  return (
    message.type === 'milkui:native-preview-size' &&
    allNativeExamples.includes(message.example as NativeExampleKey) &&
    typeof message.height === 'number' &&
    Number.isFinite(message.height)
  );
}

function ExampleDemo(props: { title: string; children: React.ReactNode }) {
  return (
    <section className="demo__card" aria-label={props.title}>
      {props.children}
    </section>
  );
}

function DemoControls(props: { children: React.ReactNode }) {
  return <div className="demo__controls">{props.children}</div>;
}

function FeaturesSection(props: { features: string[] }) {
  return (
    <section id="features" className="section" aria-labelledby="features-title">
      <h2 id="features-title">Features</h2>
      <ul className="feature-list">
        {props.features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
    </section>
  );
}

function AnatomySection(props: { framework: Framework; page: DocsPage }) {
  return (
    <section id="anatomy" className="section" aria-labelledby="anatomy-title">
      <h2 id="anatomy-title">Anatomy</h2>
      {props.page.title !== 'Button' && (
        <p>
          Triggers link to content marked hidden="until-found" before JavaScript. Following a link reveals that panel
          without resetting others. Enhancement adds toggle and keyboard behavior.
        </p>
      )}
      <CodeBlock
        title={props.framework === 'react' ? 'React anatomy' : 'Native anatomy'}
        code={props.framework === 'react' ? props.page.reactAnatomy : withDefaultAttributes(props.page.nativeAnatomy)}
      />
      {props.page.title !== 'Button' && (
        <details>
          <summary>Disclosure styles used by these demos</summary>
          <CodeBlock title="Disclosure styles" code={props.page.styles} />
        </details>
      )}
    </section>
  );
}

function CodeBlock(props: { title: string; code: string; language?: string; css?: string }) {
  const [tab, setTab] = React.useState<'markup' | 'css'>('markup');
  const id = React.useId();
  const code = tab === 'css' && props.css !== undefined ? props.css : props.code;
  const [status, setStatus] = React.useState('');
  React.useEffect(() => setStatus(''), [code]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setStatus('Copied');
    } catch {
      setStatus('Copy failed');
    }
  };

  return (
    <figure className="code-block">
      <figcaption>
        <span>{props.title}</span>
        {props.css !== undefined && (
          <div className="source-tabs" role="tablist" aria-label="Source format">
            {(['markup', 'css'] as const).map((format, index) => (
              <button
                key={format}
                type="button"
                role="tab"
                id={`${id}-${format}`}
                aria-controls={`${id}-panel`}
                aria-selected={tab === format}
                tabIndex={tab === format ? 0 : -1}
                onClick={() => setTab(format)}
                onKeyDown={(event) => {
                  const next =
                    event.key === 'Home'
                      ? 0
                      : event.key === 'End'
                        ? 1
                        : ['ArrowLeft', 'ArrowRight'].includes(event.key)
                          ? 1 - index
                          : undefined;
                  if (next === undefined) return;
                  event.preventDefault();
                  setTab(next === 0 ? 'markup' : 'css');
                  event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
                }}
              >
                {format === 'markup' ? 'Markup' : 'CSS'}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy ${props.title}${props.css !== undefined ? ` ${tab}` : ''}`}
        >
          Copy
        </button>
      </figcaption>
      <pre
        role={props.css !== undefined ? 'tabpanel' : undefined}
        id={props.css !== undefined ? `${id}-panel` : undefined}
        aria-labelledby={props.css !== undefined ? `${id}-${tab}` : undefined}
        tabIndex={props.css !== undefined ? 0 : undefined}
      >
        <code
          className={
            tab === 'css' && props.css !== undefined
              ? 'language-css'
              : props.language
                ? `language-${props.language}`
                : undefined
          }
        >
          {code}
        </code>
      </pre>
      <span className="copy-status" aria-live="polite">
        {status}
      </span>
    </figure>
  );
}

function ApiReference(props: { framework: Framework; component: ComponentName }) {
  if (props.component === 'accordion') return <AccordionApi framework={props.framework} />;
  if (props.component === 'button') return <ButtonApi framework={props.framework} />;
  return <CollapsibleApi framework={props.framework} />;
}

function CollapsibleApi(props: { framework: Framework }) {
  return (
    <section id="api-reference" className="section" aria-labelledby="api-title">
      <h2 id="api-title">API reference</h2>
      <ApiPart
        title={props.framework === 'react' ? 'Collapsible.Root' : 'Root'}
        rows={[
          ['defaultOpen', 'boolean', 'false', 'Initial uncontrolled open state.'],
          ['open', 'boolean', 'undefined', 'Controlled open state.'],
          ['onOpenChange', '(open: boolean) => void', 'undefined', 'State change request callback.'],
          ['disabled', 'boolean', 'false', 'Prevents trigger activation.'],
          ...(props.framework === 'react' ? [['asChild', 'boolean', 'false', 'Render onto the child element.']] : []),
        ]}
      />
      <ApiPart
        title={props.framework === 'react' ? 'Collapsible.Trigger' : 'Trigger'}
        rows={[
          ['disabled', 'boolean', 'false', 'Disables only this trigger.'],
          ['href', 'string', 'Content fragment', 'Link to the content before enhancement.'],
          ...(props.framework === 'react' ? [['asChild', 'boolean', 'false', 'Render onto the child element.']] : []),
        ]}
      />
      <ApiPart
        title={props.framework === 'react' ? 'Collapsible.Content' : 'Content'}
        rows={[
          ...(props.framework === 'react' ? [['asChild', 'boolean', 'false', 'Render onto the child element.']] : []),
        ]}
      />
      <Table
        headers={['Data attribute', 'Values']}
        rows={[
          ['[data-open]', 'Present when open; absent when closed'],
          ['[data-disabled]', 'Present when disabled'],
          ['[mlk-collapsible-root]', 'Root marker'],
          ['[mlk-collapsible-trigger]', 'Trigger marker'],
          ['[mlk-collapsible-content]', 'Content marker'],
        ]}
      />
      <Table
        headers={['CSS variable', 'Description']}
        rows={[
          ['--mlk-collapsible-content-width', 'Measured content width.'],
          ['--mlk-collapsible-content-height', 'Measured content height.'],
        ]}
      />
    </section>
  );
}

function AccordionApi(props: { framework: Framework }) {
  return (
    <section id="api-reference" className="section" aria-labelledby="api-title">
      <h2 id="api-title">API reference</h2>
      {props.framework === 'native' && (
        <p className="api-note">
          Closed content uses hidden="until-found"; initially open content uses data-open without hidden. Use
          instance.update() for later state changes.
        </p>
      )}
      <ApiPart
        title={props.framework === 'react' ? 'Accordion.Root' : 'Root'}
        rows={[
          ['type', '"single" | "multiple"', '"single"', 'Selection mode.'],
          ['value', 'string | string[]', 'undefined', 'Controlled value.'],
          ['defaultValue', 'string | string[]', 'undefined', 'Initial uncontrolled value.'],
          ['onValueChange', '(value) => void', 'undefined', 'Value change request callback.'],
          ['collapsible', 'boolean', 'false', 'Allow the open single item to close.'],
          ['disabled', 'boolean', 'false', 'Disable every item.'],
          ['orientation', '"vertical" | "horizontal"', '"vertical"', 'Keyboard orientation.'],
          ['dir', '"ltr" | "rtl"', '"ltr"', 'Direction for horizontal navigation.'],
          ...(props.framework === 'react' ? [['asChild', 'boolean', 'false', 'Render onto the child element.']] : []),
        ]}
      />
      <ApiPart
        title={props.framework === 'react' ? 'Accordion.Item' : 'Item'}
        rows={[
          ...(props.framework === 'react'
            ? [['value', 'string', 'Generated identifier', 'Selection value; independent of the generated DOM ID.']]
            : []),
          ['disabled', 'boolean', 'false', 'Disable this item.'],
          ...(props.framework === 'react' ? [['asChild', 'boolean', 'false', 'Render onto the child element.']] : []),
        ]}
      />
      <ApiPart
        title={props.framework === 'react' ? 'Accordion.Header' : 'Header'}
        rows={[
          [
            props.framework === 'react' ? 'asChild' : 'element',
            props.framework === 'react' ? 'boolean' : 'h3',
            props.framework === 'react' ? 'false' : 'h3',
            'Heading wrapper for the trigger.',
          ],
        ]}
      />
      <ApiPart
        title={props.framework === 'react' ? 'Accordion.Trigger' : 'Trigger'}
        rows={[
          [
            props.framework === 'react' ? 'asChild' : 'href',
            props.framework === 'react' ? 'boolean' : 'string',
            props.framework === 'react' ? 'false' : 'Content fragment',
            'Link enhanced with disclosure behavior.',
          ],
        ]}
      />
      <ApiPart
        title={props.framework === 'react' ? 'Accordion.Content' : 'Content'}
        rows={[
          ...(props.framework === 'react'
            ? [['asChild', 'boolean', 'false', 'Render onto the child element.']]
            : [['id', 'string', 'required for fragment links', 'Unique content ID; also its native selection value.']]),
        ]}
      />
      <Table
        headers={['Data attribute', 'Values']}
        rows={[
          ['[data-open]', 'Present when the item is open'],
          ['[data-disabled]', 'Present when disabled'],
          ['[mlk-accordion-root]', 'Root marker'],
          ['[mlk-accordion-item]', 'Item marker'],
          ['[mlk-accordion-header]', 'Header marker'],
          ['[mlk-accordion-trigger]', 'Trigger marker'],
          ['[mlk-accordion-content]', 'Content marker'],
        ]}
      />
      <Table
        headers={['CSS variable', 'Description']}
        rows={[
          ['--mlk-accordion-content-width', 'Measured content width.'],
          ['--mlk-accordion-content-height', 'Measured content height.'],
        ]}
      />
    </section>
  );
}

function ButtonApi(props: { framework: Framework }) {
  return (
    <section id="api-reference" className="section" aria-labelledby="api-title">
      <h2 id="api-title">API reference</h2>
      <p className="api-note">
        {props.framework === 'native'
          ? 'Set type="button" explicitly in native markup to prevent form submission. Authored disabled attributes seed the initial disabled prop; use instance.update() for later changes.'
          : 'React defaults to type="button"; an explicit type prop overrides it. Use the disabled prop to disable it.'}
      </p>
      <ApiPart
        title="Button"
        rows={[
          ['disabled', 'boolean', 'false', 'Disable the button.'],
          ...(props.framework === 'react' ? [['asChild', 'boolean', 'false', 'Render onto the child element.']] : []),
        ]}
      />
      <Table
        headers={['Attribute', 'Values']}
        rows={[
          ['[disabled]', 'Present when disabled'],
          ['[mlk-button]', 'Button marker'],
        ]}
      />
    </section>
  );
}

function ApiPart(props: { title: string; rows: string[][] }) {
  return (
    <article className="api-part">
      <h3>{props.title}</h3>
      {props.rows.length ? (
        <Table headers={['Prop', 'Type', 'Default', 'Description']} rows={props.rows} />
      ) : (
        <p>No component-specific props.</p>
      )}
    </article>
  );
}

function Table(props: { headers: string[]; rows: string[][] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {props.headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row) => (
            <tr key={row.join('|')}>
              {row.map((cell, index) => (
                <td key={props.headers[index]}>{index === row.length - 1 ? cell : <code>{cell}</code>}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ExamplesSection(props: { framework: Framework; examples: Example[] }) {
  return (
    <section id="examples" className="section" aria-labelledby="examples-title">
      <h2 id="examples-title">Examples</h2>
      <div className="example-list">
        {props.examples.map((example) => (
          <article key={example.key} className="example-item">
            <h3>{example.label}</h3>
            <p>{example.summary}</p>
            <div className="preview-surface compact">
              {props.framework === 'react' ? (
                <example.ReactDemo />
              ) : (
                <NativePreview example={example.key} title={example.label} />
              )}
            </div>
            <CodeBlock
              title={props.framework === 'react' ? 'React source' : 'Native source'}
              code={props.framework === 'react' ? example.reactCode : withDefaultAttributes(example.nativeCode)}
            />
            {example.key === 'collapsible-animation' && (
              <CodeBlock title="Transition styles" code={collapsibleStyles} language="css" />
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function AccessibilitySection(props: { component: ComponentName }) {
  const rows =
    props.component === 'accordion'
      ? [
          ['Space', 'Opens or closes the focused trigger.'],
          ['Enter', 'Opens or closes the focused trigger.'],
          ['ArrowDown / ArrowRight', 'Moves focus to the next enabled trigger.'],
          ['ArrowUp / ArrowLeft', 'Moves focus to the previous enabled trigger.'],
          ['Home', 'Moves focus to the first enabled trigger.'],
          ['End', 'Moves focus to the last enabled trigger.'],
        ]
      : props.component === 'button'
        ? [
            ['Space', 'Activates the button.'],
            ['Enter', 'Activates the button.'],
            ['Tab', 'Moves focus to the next focusable element.'],
          ]
        : [
            ['Space', 'Opens or closes the collapsible.'],
            ['Enter', 'Opens or closes the collapsible.'],
            ['Tab', 'Moves focus to the next focusable element.'],
          ];
  return (
    <section id="accessibility" className="section" aria-labelledby="accessibility-title">
      <h2 id="accessibility-title">Keyboard interactions</h2>
      <p>
        {props.component === 'button'
          ? 'Button renders a native button, so it follows browser button behavior.'
          : 'Before enhancement, triggers are links to sections. Once enhanced, Enter and Space toggle them without changing the URL.'}
      </p>
      <Table headers={['Key', 'Description']} rows={rows} />
    </section>
  );
}

function Toc() {
  return (
    <aside className="toc" aria-label="On this page">
      <p>On this page</p>
      <a href="#demo">Demo</a>
      <a href="#features">Features</a>
      <a href="#anatomy">Anatomy</a>
      <a href="#api-reference">API reference</a>
      <a href="#examples">Examples</a>
      <a href="#accessibility">Accessibility</a>
    </aside>
  );
}
