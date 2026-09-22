Plan Summary:

- Goal: Add Accordion by recomposing Collapsible behavior internally, exposing only mlk-accordion-\* setup attributes.
- Public contract: Root, Item, Header, Trigger, Content. Root single/multiple, value/defaultValue/onValueChange, collapsible for single, disabled, orientation, dir. Item value/disabled. data-open on open item parts, data-disabled, data-orientation, aria-expanded/controls/labelledby; CSS owns visibility. Events mlk-accordion:value-change. React wrappers remain factory declarations.
- Clarification decisions: Existing delegation yes, grill no, commits no persist. Follow established component contracts with data-open instead of data-state. No native runtime dependencies, no observedAttributes, marker discovery only.
- Assumptions: Native seed attributes data-type, data-value, data-default-value, data-collapsible, data-disabled, data-orientation and dir; explicit props for reactive configuration. Single defaults empty and cannot close active item unless collapsible true; multiple allows independent toggling. Native registration defines accordion parts only.
- Risks: Composition must share lifecycle, providers, output and listeners without attaching duplicate markers; SSR must render composed output; keyboard isolation and DOM ordering with nested roots; no regressions in Collapsible; tree-shaking.
  Slice S1:
- Behavior: Consumers open accordion items, coordinate single/multiple state, navigate enabled headings with keyboard, and compare React/native behavior using only Accordion parts.
- Includes: Minimal reusable primitive composition supported by this real use case; native and thin React packages; behavioral tests incl SSR, controlled rejection, disabled/nested/keyboard/preventDefault, composition cleanup; docs/demo route and native preview; build/typecheck/tree-shaking.
- Task type: Feature and shared composition abstraction.
- Prompt complexity: high
- Delivery role: principal
- Review role: reviewer-final
- Role rationale: Cross-layer native composition must preserve framework ownership, SSR, context, and lifecycle.
- Out-of-scope/Cleanup: Additional frameworks, commits, publishing, general component DSL.
  Recommended Next Slice:
- Slice ID: S1
- Why now: Accordion proves native primitives can compose existing parts while preserving thin framework adapters.
