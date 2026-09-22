Plan Summary:

- Goal: Prove the blog's no-shadow-DOM, composable attribute behaviors with a native collapsible and a thin React adapter.
- Public contract: Milk React Root/Trigger/Content, controlled/uncontrolled open, disabled, callbacks, asChild, refs, forceMount, state attributes, dimensions and CSS exit animation presence. Native HTML usage exercises the same behavior without React.
- Clarification decisions: Delegation enabled; no grill; no commits. Additional reference: https://github.com/milkui/components shows declarative createReactComponent wrappers. User explicitly requires platform APIs and no native runtime dependencies; no hooked-elements. The user subsequently authorized Slot in the React adapter to replace custom slot merging (React remains a peer dependency). Native authoring should feel React-like, particularly context/provider/consumer concepts. Functions were an initial preference, but subsequent discussion prioritizes typed shared lifecycle abstractions (including a small base class where useful) over function aesthetics; prop synchronization, cleanup, subscriptions and context must not be repeated per component. Remix UI setup functions and handles are a reference: https://github.com/remix-run/remix/tree/main/packages/ui/src. No observedAttributes: attributes identify behavior and seed defaults, while explicit properties drive updates. Parts must be independently defined/exported, never gathered in a central definitions object; preserve tree-shaking and opt-in DOM registration. Colocate parts in one component file per package, using the user’s `comb`/`comd` comment snippets; independent definitions do not require separate files. Expose only the package index, with named exports and bundler tree-shaking instead of per-part package subpaths. Use Primitive terminology for the native API: Primitive, createPrimitive, and createContext, with component classes such as ContentPrimitive. Presence should use Web Animations APIs for animation and transition completion instead of CSS-name parsing and end-event bookkeeping. One complete slice so all requested functionality is available for inspection together.
- Assumptions: React 19 is already installed. Normal semantic elements and composable attributes are essential; a custom provider tag is optional if an attribute scope avoids extra layout nodes. Prefer explicit typed instance update/cleanup to a shared PROPS proxy. Preserve the unrelated button experiment unless changes are needed.
- Risks: React reconciliation must retain ownership of its children; native listeners must honor React preventDefault; SSR/hydration, nested roots, reconnects and interrupted animations need verification. Current directory has no .git metadata.

Slice S1:

- Behavior: A consumer composes Root, Trigger and Content in native HTML or React, then opens/closes the panel with pointer or keyboard using the same native behavior implementation.
- Includes: Minimal reusable attribute/lifecycle and framework bridge abstractions justified by actual usage; native collapsible and React packages; runnable examples; focused native/React tests, browser verification and a production tree-shaking check; architecture and usage documentation.
- Task type: Feature and architecture proof of concept.
- Prompt complexity: high
- Delivery role: principal
- Review role: reviewer-final
- Role rationale: Initial review exposed cross-layer lifecycle duplication and SSR/presence ownership gaps. Escalate the shared abstraction integration to principal delivery, retaining independent final review.
- Out-of-scope/Cleanup: Additional framework wrappers, other components, publishing, commits, a general-purpose component DSL.

Recommended Next Slice:

- Slice ID: S1
- Why now: One usable end-to-end collapsible proves the architecture before introducing other components or frameworks.

Docs example follow-up:

- Reorganize Vite examples as a Milk component docs page: live preview, features, anatomy, API reference, examples, and accessibility.
- Provide one React/Native selector that switches previews and code together, with URL state for direct comparison links.
- Keep native previews isolated in a plain HTML document using the native package, while React previews use the thin adapter. Do not add dependencies or change primitive logic.
- Verify both modes, code/API accuracy, native bundle isolation, production build, responsive layout, and keyboard interaction. No commits.

Docs simplification follow-up:

- Use one simple disclosure in the hero with its source directly below; retain the shared React/Native switch.
- Move advanced live previews into their corresponding Examples sections.
- Use plain feature bullets, a left Components navigation with Collapsible active, and a right On this page navigation.
- Delivery: senior; final review: reviewer-final. Verify framework switching, native disclosure, navigation targets, typecheck, and production bundle separation. No commits.

Setup attribute naming follow-up:

- Rename Collapsible markers to mlk-collapsible-root, mlk-collapsible-trigger, and mlk-collapsible-content to align with potential custom element names. Keep markers first in example markup.
- Update native definitions, discovery tests, examples, and docs together. Preserve state/config attributes and React APIs. Verify tests, example typecheck, and native demo interactions. No commits.

Animation demo parity follow-up:

- Investigate the reported native/React animation difference. Brave automation currently returns Transport closed, so browser animation timing remains unverified.
- Make native animation markup match React and remove the preview iframe's separate height transition and measured-height floors, which distort the comparison.
- Keep shared presence unchanged unless inspection reveals a concrete primitive bug. Verify DOM behavior, resize messages, typecheck, and production bundle; report the browser verification limitation.

Transition comparison follow-up:

- The transition demo used opacity/transform, while keyframes animated height; this made layout space jump.
- Transition height from 0 to auto using interpolate-size and @starting-style, with the same timings as keyframes.
- Preserve natural measured dimensions when opening transitions report a zero/intermediate bounding box, including borders, so switching back to keyframes does not use a stale zero size.
- Add a native measurement regression and run build/tests, examples typecheck, DOM checks, and production bundle checks. Brave automation remains disconnected; report that visual timing is unverified.

Binary open state follow-up:

- Replace data-state with presence-only data-open on Root, Trigger, and Content. Remove authored and primitive-managed hidden attributes. Consumer CSS owns default closed visibility.
- Keep aria-expanded, data-disabled, and React internal exit presence. forceMount controls mounting only, independent of actual open state and measurement.
- Update native and React tests, docs, demo CSS/snippets, nested styling, and reduced motion. Verify builds, DOM interactions, SSR, and exit timing regressions. No commits.
