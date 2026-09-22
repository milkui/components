Plan Summary:

- Goal: Declare prop keys and native initial-prop mapping on primitive classes, inheriting them through ordinary class extension.
- Public contract: createPrimitive definitions retain tag, attribute, primitive. Accordion Trigger/Content inherit Collapsible metadata without repetition; Item declares its distinct value/disabled contract. Runtime behavior and React props stay unchanged.
- Clarification decisions: Keep this a metadata refactor only; no composition or lifecycle machinery. Existing delegation yes, grill no, commits no.
- Assumptions: Static class metadata uses normal inheritance and explicit override. Subclasses can extend metadata explicitly when needed. Configuration attributes remain initial-only.
- Risks: Static-side TypeScript inheritance and factory inference must preserve optional props and discriminated unions; native mapping must not run for SSR/React create.

Slice S1:

- Behavior: Native Accordion content inherits forceMount prop discovery and data-force-mount initialization from Collapsible Content, while React forwards inherited props correctly.
- Includes: Static metadata in current primitive classes; factory reads class metadata; remove duplicate definitions; focused inheritance/override/initialization tests; docs and type validation.
- Task type: Metadata refactor.
- Prompt complexity: medium
- Delivery role: senior
- Review role: reviewer-final
- Role rationale: Small shared factory typing change with native and React compatibility.
- Out-of-scope/Cleanup: Lifecycle changes, composition APIs, rendering changes, new features, commits.

Recommended Next Slice:

- Slice ID: S1
- Why now: Removes duplicated inherited configuration with standard class inheritance.
