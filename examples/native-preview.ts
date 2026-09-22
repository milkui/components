import {
  Content as AccordionContent,
  Header as AccordionHeader,
  Item as AccordionItem,
  Root as AccordionRoot,
  Trigger as AccordionTrigger,
} from '../packages/core/accordion/src/index.js';
import { Button } from '../packages/core/button/src/index.js';
import {
  Content as CollapsibleContent,
  Root as CollapsibleRoot,
  Trigger as CollapsibleTrigger,
} from '../packages/core/collapsible/src/index.js';
import type { Attributes, PrimitiveDefinition } from '../packages/core/primitive/src/index.js';

export type NativeExampleKey =
  | 'collapsible-basic'
  | 'collapsible-controlled'
  | 'collapsible-animation'
  | 'collapsible-nested'
  | 'accordion-hero'
  | 'accordion-controlled'
  | 'accordion-multiple'
  | 'accordion-horizontal'
  | 'accordion-independent'
  | 'button-basic'
  | 'button-disabled';
type ExampleAlias = 'basic' | 'controlled' | 'animation' | 'nested';

export const allNativeExamples = [
  'collapsible-basic',
  'collapsible-controlled',
  'collapsible-animation',
  'collapsible-nested',
  'accordion-hero',
  'accordion-controlled',
  'accordion-multiple',
  'accordion-horizontal',
  'accordion-independent',
  'button-basic',
  'button-disabled',
] as const satisfies readonly NativeExampleKey[];
const examples = new Set<NativeExampleKey>(allNativeExamples);
const aliases: Record<ExampleAlias, NativeExampleKey> = {
  basic: 'collapsible-basic',
  controlled: 'collapsible-controlled',
  animation: 'collapsible-animation',
  nested: 'collapsible-nested',
};

const rawTemplates: Record<NativeExampleKey, string> = {
  'collapsible-basic': `
    <div mlk-collapsible-root id="packages" class="package-list">
      <div class="package-row visible">
        <span>@milkui/collapsible</span>
        <span>Native primitive</span>
      </div>
      <a mlk-collapsible-trigger href="#packages-content" class="demo-trigger">Show packages</a>
      <div mlk-collapsible-content id="packages-content" class="demo-content">
        <div class="package-row">
          <span>@milkui/react/collapsible</span>
          <span>React adapter</span>
        </div>
        <div class="package-row">
          <span>@milkui/primitive</span>
          <span>Shared lifecycle</span>
        </div>
      </div>
    </div>
  `,
  'collapsible-controlled': `
    <section class="demo-card" aria-label="Controlled">
      <div mlk-collapsible-root id="controlled-root">
        <a mlk-collapsible-trigger href="#controlled-root-content" class="demo-trigger">Release notes</a>
        <div mlk-collapsible-content id="controlled-root-content" class="demo-content">
          <div class="demo-contentInner">Controlled content</div>
        </div>
      </div>
      <div class="demo-controls">
        <label><input id="controlled-accept" type="checkbox" checked /> Accept requests</label>
        <button id="controlled-external" type="button">Toggle externally</button>
      </div>
    </section>
  `,
  'collapsible-animation': `
    <section class="demo-card" aria-label="Animation and transition">
      <div mlk-collapsible-root id="animation-root">
        <a mlk-collapsible-trigger href="#animation-root-content" class="demo-trigger">Animation details</a>
        <div mlk-collapsible-content id="animation-root-content" class="demo-content">
          <div class="demo-contentInner">Animated content</div>
        </div>
      </div>
      <div class="demo-controls">
        <label><input id="animation-transition" type="checkbox" /> Use CSS transitions</label>
      </div>
    </section>
  `,
  'collapsible-nested': `
    <section class="demo-card" aria-label="Nested composition">
      <div mlk-collapsible-root id="outer-details">
        <a mlk-collapsible-trigger href="#outer-details-content" id="nested-outer-trigger" class="demo-trigger">Outer details</a>
        <div mlk-collapsible-content id="outer-details-content" class="demo-content">
          <div class="demo-contentInner">
            <div mlk-collapsible-root id="inner-details">
              <a mlk-collapsible-trigger href="#inner-details-content" class="demo-trigger">Inner details</a>
              <div mlk-collapsible-content id="inner-details-content" class="demo-content nested-content">
                <div class="demo-contentInner">Inner state is isolated.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="demo-controls">
        <label><input id="nested-prevent" type="checkbox" /> Prevent outer toggle</label>
      </div>
    </section>
  `,
  'accordion-independent': `
<div class="independent-accordions">
  <section>
    <h3>Delivery</h3>
    <div mlk-accordion-root data-type="single" data-collapsible>
      <div mlk-accordion-item>
        <h3 mlk-accordion-header><a mlk-accordion-trigger href="#delivery-shipping-content" class="demo-trigger">Shipping</a></h3>
        <div mlk-accordion-content id="delivery-shipping-content" class="demo-content" data-open><div class="demo-contentInner">Shipping information.</div></div>
      </div>
      <div mlk-accordion-item>
        <h3 mlk-accordion-header><a mlk-accordion-trigger href="#delivery-returns-content" class="demo-trigger">Returns</a></h3>
        <div mlk-accordion-content id="delivery-returns-content" class="demo-content"><div class="demo-contentInner">Returns information.</div></div>
      </div>
    </div>
  </section>
  <section>
    <h3>Account</h3>
    <div mlk-accordion-root data-type="single" data-collapsible>
      <div mlk-accordion-item>
        <h3 mlk-accordion-header><a mlk-accordion-trigger href="#account-billing-content" class="demo-trigger">Billing</a></h3>
        <div mlk-accordion-content id="account-billing-content" class="demo-content" data-open><div class="demo-contentInner">Billing information.</div></div>
      </div>
      <div mlk-accordion-item>
        <h3 mlk-accordion-header><a mlk-accordion-trigger href="#account-privacy-content" class="demo-trigger">Privacy</a></h3>
        <div mlk-accordion-content id="account-privacy-content" class="demo-content"><div class="demo-contentInner">Privacy information.</div></div>
      </div>
    </div>
  </section>
</div>
  `,
  'accordion-hero': `
    <div mlk-accordion-root data-type="single" data-collapsible>
      <div mlk-accordion-item>
        <h3 mlk-accordion-header>
          <a mlk-accordion-trigger href="#native-content" class="demo-trigger">Native package</a>
        </h3>
        <div mlk-accordion-content id="native-content" class="demo-content" data-open>
          <div class="demo-contentInner">@milkui/accordion</div>
        </div>
      </div>
      <div mlk-accordion-item>
        <h3 mlk-accordion-header>
          <a mlk-accordion-trigger href="#react-content" class="demo-trigger">React adapter</a>
        </h3>
        <div mlk-accordion-content id="react-content" class="demo-content">
          <div class="demo-contentInner">@milkui/react/accordion</div>
        </div>
      </div>
      <div mlk-accordion-item>
        <h3 mlk-accordion-header>
          <a mlk-accordion-trigger href="#primitive-content" class="demo-trigger">Shared primitive</a>
        </h3>
        <div mlk-accordion-content id="primitive-content" class="demo-content">
          <div class="demo-contentInner">@milkui/primitive</div>
        </div>
      </div>
    </div>
  `,
  'accordion-controlled': `
    <section class="demo-card" aria-label="Controlled accordion">
      <div mlk-accordion-root id="accordion-controlled" data-type="single">
        <div mlk-accordion-item>
          <h3 mlk-accordion-header>
            <a mlk-accordion-trigger href="#usage-content" class="demo-trigger">Usage</a>
          </h3>
          <div mlk-accordion-content id="usage-content" class="demo-content" data-open>
            <div class="demo-contentInner">Controlled accordion content</div>
          </div>
        </div>
        <div mlk-accordion-item>
          <h3 mlk-accordion-header>
            <a mlk-accordion-trigger href="#api-content" class="demo-trigger">API</a>
          </h3>
          <div mlk-accordion-content id="api-content" class="demo-content">
            <div class="demo-contentInner">The consumer owns the active value.</div>
          </div>
        </div>
      </div>
      <div class="demo-controls">
        <label><input id="accordion-controlled-accept" type="checkbox" checked /> Accept requests</label>
        <button id="accordion-controlled-external" type="button">Toggle externally</button>
      </div>
    </section>
  `,
  'accordion-multiple': `
    <section class="demo-card" aria-label="Multiple items">
      <div mlk-accordion-root data-type="multiple">
        <div mlk-accordion-item>
          <h3 mlk-accordion-header>
            <a mlk-accordion-trigger href="#multiple-native-content" class="demo-trigger">Native package</a>
          </h3>
          <div mlk-accordion-content id="multiple-native-content" class="demo-content" data-open>
            <div class="demo-contentInner">@milkui/accordion</div>
          </div>
        </div>
        <div mlk-accordion-item>
          <h3 mlk-accordion-header>
            <a mlk-accordion-trigger href="#multiple-react-content" class="demo-trigger">React adapter</a>
          </h3>
          <div mlk-accordion-content id="multiple-react-content" class="demo-content" data-open>
            <div class="demo-contentInner">@milkui/react/accordion</div>
          </div>
        </div>
        <div mlk-accordion-item>
          <h3 mlk-accordion-header>
            <a mlk-accordion-trigger href="#multiple-primitive-content" class="demo-trigger">Shared primitive</a>
          </h3>
          <div mlk-accordion-content id="multiple-primitive-content" class="demo-content">
            <div class="demo-contentInner">@milkui/primitive</div>
          </div>
        </div>
      </div>
    </section>
  `,
  'accordion-horizontal': `
    <section class="demo-card" aria-label="Horizontal orientation">
      <div mlk-accordion-root class="accordion-horizontal" data-type="single" data-orientation="horizontal" dir="ltr">
        <div mlk-accordion-item>
          <h3 mlk-accordion-header>
            <a mlk-accordion-trigger href="#horizontal-one-content" class="demo-trigger">One</a>
          </h3>
          <div mlk-accordion-content id="horizontal-one-content" class="demo-content" data-open>
            <div class="demo-contentInner">Horizontal item one.</div>
          </div>
        </div>
        <div mlk-accordion-item>
          <h3 mlk-accordion-header>
            <a mlk-accordion-trigger href="#horizontal-two-content" class="demo-trigger">Two</a>
          </h3>
          <div mlk-accordion-content id="horizontal-two-content" class="demo-content">
            <div class="demo-contentInner">Horizontal item two.</div>
          </div>
        </div>
      </div>
    </section>
  `,
  'button-basic': `
    <button mlk-button class="demo-button">Save changes</button>
  `,
  'button-disabled': `
    <button mlk-button class="demo-button" disabled>Save changes</button>
  `,
};

const defaultedParts = [
  Button,
  CollapsibleRoot,
  CollapsibleTrigger,
  CollapsibleContent,
  AccordionRoot,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
] as const satisfies readonly PrimitiveDefinition[];

export const templates = Object.fromEntries(
  Object.entries(rawTemplates).map(([key, template]) => [key, withDefaultAttributes(template)]),
) as Record<NativeExampleKey, string>;

export function resolveNativeExample(value: string | null): NativeExampleKey {
  if (examples.has(value as NativeExampleKey)) return value as NativeExampleKey;
  if (value && value in aliases) return aliases[value as ExampleAlias];
  return 'collapsible-basic';
}

export function nativePreviewFileName(example: NativeExampleKey) {
  return `native/${example}.html`;
}

export function nativePreviewTitle(example: NativeExampleKey) {
  return `Milk UI Native · ${example}`;
}

export function renderNativePreviewDocument(example: NativeExampleKey) {
  return `<!doctype html>
<html lang="en" class="native-preview-document">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${nativePreviewTitle(example)}</title>
    <link rel="stylesheet" href="/style.css" />
  </head>
  <body class="native-preview-body">
    <main id="native-app" class="native-preview" aria-live="polite" data-example="${example}">
${indent(templates[example].trim(), 6)}
    </main>
    <script type="module" src="/native.ts"></script>
  </body>
</html>
`;
}

export function withDefaultAttributes(markup: string): string {
  return defaultedParts.reduce((result, part) => addDefaultAttributes(result, part), markup);
}

function addDefaultAttributes(markup: string, part: PrimitiveDefinition): string {
  if (!part.defaultAttributes) return markup;
  let result = '';
  let index = 0;
  while (index < markup.length) {
    const tagStart = markup.indexOf('<', index);
    if (tagStart === -1) {
      result += markup.slice(index);
      break;
    }
    result += markup.slice(index, tagStart);
    const tag = readStartTag(markup, tagStart);
    if (!tag) {
      result += markup[tagStart];
      index = tagStart + 1;
      continue;
    }
    const marker = tag.attributes.find((attribute) => attribute.name === part.attribute);
    if (!marker) {
      result += markup.slice(tagStart, tag.end + 1);
      index = tag.end + 1;
      continue;
    }
    // Consume the template's open-state hint; native HTML only needs hidden on closed panels.
    const open =
      part.defaultAttributes.hidden === 'until-found'
        ? tag.attributes.find((attribute) => attribute.name === 'data-open')
        : undefined;
    if (open) {
      result +=
        markup.slice(tagStart, tag.attributesOffset + open.start).trimEnd() +
        markup.slice(tag.attributesOffset + open.end, tag.end + 1);
      index = tag.end + 1;
      continue;
    }
    const additions = serializeMissingAttributes(part.defaultAttributes, tag.attributes);
    if (!additions) {
      result += markup.slice(tagStart, tag.end + 1);
      index = tag.end + 1;
      continue;
    }
    const after =
      part.defaultAttributes.hidden === 'until-found'
        ? (tag.attributes.find((attribute) => attribute.name === 'id') ?? marker)
        : marker;
    result +=
      markup.slice(tagStart, tag.attributesOffset + after.end) +
      additions +
      markup.slice(tag.attributesOffset + after.end, tag.end + 1);
    index = tag.end + 1;
  }
  return result;
}

function readStartTag(markup: string, start: number) {
  let index = start + 1;
  if (!/[A-Za-z]/.test(markup[index] ?? '')) return null;
  while (/[\w:-]/.test(markup[index] ?? '')) index++;
  const attributesOffset = index;
  let quote: string | null = null;
  while (index < markup.length) {
    const char = markup[index];
    if (quote) {
      if (char === quote) quote = null;
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === '>') {
      return {
        end: index,
        attributesOffset,
        attributes: readAttributes(markup.slice(attributesOffset, index)),
      };
    }
    index++;
  }
  return null;
}

function readAttributes(source: string) {
  const attributes: { name: string; start: number; end: number }[] = [];
  let index = 0;
  while (index < source.length) {
    while (/\s/.test(source[index] ?? '')) index++;
    if (source[index] === '/' || !source[index]) break;
    const start = index;
    while (/[^\s=/>]/.test(source[index] ?? '')) index++;
    const name = source.slice(start, index);
    let end = index;
    while (/\s/.test(source[index] ?? '')) index++;
    if (source[index] === '=') {
      index++;
      while (/\s/.test(source[index] ?? '')) index++;
      const quote = source[index];
      if (quote === '"' || quote === "'") {
        index++;
        while (index < source.length && source[index] !== quote) index++;
        if (source[index] === quote) index++;
      } else {
        while (/[^\s>]/.test(source[index] ?? '')) index++;
      }
      end = index;
    }
    attributes.push({ name, start, end });
  }
  return attributes;
}

function serializeMissingAttributes(
  attributes: Attributes,
  existingAttributes: readonly { name: string }[],
) {
  let serialized = '';
  for (const [name, value] of Object.entries(attributes)) {
    if (
      value === undefined ||
      value === false ||
      existingAttributes.some((attribute) => attribute.name === name)
    )
      continue;
    serialized += value === true ? ` ${name}` : ` ${name}="${escapeAttribute(String(value))}"`;
  }
  return serialized;
}

function escapeAttribute(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function indent(value: string, spaces: number) {
  const padding = ' '.repeat(spaces);
  return value
    .split('\n')
    .map((line) => `${padding}${line}`)
    .join('\n');
}
