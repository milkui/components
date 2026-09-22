Plan Summary:

- Goal: Make createPrimitive(Class) the type boundary for complete primitive class metadata.
- Public contract: Static tag and attribute required when passed to createPrimitive; inherited metadata is accepted. Missing or invalid tags/attributes are compile-time errors. Prop keys and initialProps remain class-owned.
- Clarification decisions: User explicitly approves factory as boundary because TypeScript has no abstract static members. No base defaults for tag/attribute. Existing delegation yes, grill no, commits no.
- Assumptions: Classes use literal tag annotations and string attribute annotations compatible with subclass marker overrides.
- Risks: Preserve tag-specific React intrinsic props, optional prop inference, and root discriminated unions.

Slice S1:

- Behavior: Authors register a complete class with createPrimitive(Class), inherit metadata naturally, and get compile-time errors for incomplete metadata.
- Includes: Factory signature, migrate current class definitions, type regression tests, docs, existing runtime tests and tree-shaking checks.
- Task type: Small authoring API refactor.
- Prompt complexity: medium
- Delivery role: senior
- Review role: reviewer-final
- Role rationale: Shared type boundary with inherited static metadata.
- Out-of-scope/Cleanup: New runtime validation, lifecycle changes, new composition system, commits.

Recommended Next Slice:

- Slice ID: S1
- Why now: Completes class-owned definitions while keeping the factory small.
