Plan Summary:

- Goal: Let Accordion Item extend Collapsible Root directly, just as Trigger and Content already extend their Collapsible parts.
- Public contract: Existing Accordion and Collapsible APIs, context, lifecycle and behavior remain unchanged.
- Clarification decisions: User explicitly rejected broader composition machinery. Delegation yes, grill no, commits no persist.
- Assumptions: Generic Collapsible root props preserve Accordion Item's value/disabled API; Item overrides open, disabled and toggle.
- Risks: Generic inference must preserve public part props. Inherited Collapsible state must not affect Accordion or emit Collapsible events.

Slice S1:

- Behavior: Accordion Item inherits Collapsible Root's provider and attributes directly, preserving group-controlled selection.
- Includes: Remove DisclosureRootPrimitive, move its implementation into CollapsibleRootPrimitive, make Root props generic, update Item inheritance and docs; revert the abandoned composition machinery completely. Existing regression tests and typechecks.
- Task type: Small inheritance refactor.
- Prompt complexity: medium
- Delivery role: principal
- Review role: reviewer-final
- Role rationale: Retain assigned executor for narrow correction; verify public types and behavior.
- Out-of-scope/Cleanup: New composition APIs, lifecycle changes, Trigger/Content changes, framework changes, commits.

Recommended Next Slice:

- Slice ID: S1
- Why now: Removes the unnecessary intermediate base class without expanding the primitive abstraction.
