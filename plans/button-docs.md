Plan Summary:

- Goal: Add the existing Button primitive to the documentation alongside Collapsible and Accordion.
- Public contract: Button page with React/native switch, simple live demo and code, anatomy, features, API and accessibility. Keep current disabled behavior; no expanded Button feature set.
- Clarification decisions: Existing docs style/preferences apply. Delegation yes, grill no, commits no. Setup markers use mlk-\*.
- Assumptions: Add the missing thin @milkui/react/button factory adapter to support existing docs framework switch. Update legacy tk-button marker to mlk-button and seed native disabled attributes so documented native disabled buttons remain disabled.
- Risks: Existing navigation/query params, native preview isolation, disabled parity, copied examples must use real exports.

Slice S1:

- Behavior: User selects Button from navigation, toggles React/native demos, tries enabled/disabled buttons, and copies matching working examples.
- Includes: Docs page/navigation/native previews; minimal React adapter; native marker/default initialization alignment; focused checks; docs build and existing regressions.
- Task type: Documentation with minimal integration support.
- Prompt complexity: medium
- Delivery role: senior
- Review role: reviewer-final
- Role rationale: Existing docs framework integration and native/React parity.
- Out-of-scope/Cleanup: New Button features, links/loading/variants APIs, lifecycle changes, unrelated component refactors, commits.

Recommended Next Slice:

- Slice ID: S1
- Why now: Exposes the existing primitive through the established docs experience.
