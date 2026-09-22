Plan Summary:

- Goal: Declare default HTML attributes as required class metadata and include them in markup before client enhancement.
- Public contract: createPrimitive requires static defaultAttributes: Attributes | null, including inherited declarations. Definition exposes it. Defaults fill missing attributes; explicit consumer attributes win. Button type=button leaves runtime render and becomes metadata. React server output and native docs markup include defaults.
- Clarification decisions: Progressive enhancement, no dependencies, no observedAttributes. Existing delegation yes, grill no, commits no. Keep lifecycle unchanged.
- Assumptions: React adapter remains a client-capable component that can produce SSR HTML; this does not make its hook-based implementation a pure RSC. Native previews should contain actual initial HTML, not depend on native.ts to create buttons.
- Risks: Explicit type overrides, asChild children, boolean serialization, preserving demo source formatting, static native preview generation in development and production.

Slice S1:

- Behavior: Consumers receive type=button in initial HTML from React SSR and native docs, before any enhancement; explicit type=submit is respected. Missing defaultAttributes metadata fails typechecking and explicit null is valid.
- Includes: Metadata/type tests, Button and trigger defaults, thin generic React adapter merging, docs default augmentation and static native previews, focused SSR/override/native markup tests, build/regression checks.
- Task type: Progressive enhancement and authoring metadata.
- Prompt complexity: high
- Delivery role: senior
- Review role: reviewer-final
- Role rationale: Metadata spans initial HTML generation and adapters without altering lifecycle.
- Out-of-scope/Cleanup: Pure-RSC rewrite, new dependencies, new components, broad composition API, commits.

Recommended Next Slice:

- None. S1 complete and approved by final review.

Validation:

- All 53 tests, package builds, package and examples typechecks passed.
- Native initial HTML contains defaults before script execution; production asset references resolve.
- Production browser smoke test passed for Button docs and native Accordion interaction, with no console warnings or errors.
- Tree-shaking checks passed for native and React Collapsible and Accordion.
- Formatting passed using the Prettier fallback because Sweepi was unavailable.
