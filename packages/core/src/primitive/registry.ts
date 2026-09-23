import type { PrimitiveDefinition } from './primitive.js';

type Registration = { owned: Set<HTMLElement>; cleanup: () => void };
type Registry = {
  registrations: Map<PrimitiveDefinition, Registration>;
  schedule: () => void;
  observer: MutationObserver;
};
const roots = new WeakMap<Document | HTMLElement, Registry>();

/** Discover registered parts in DOM order; observe structure, never attributes. */
export function definePrimitive(part: PrimitiveDefinition, root: Document | HTMLElement = document) {
  let registry = roots.get(root);
  if (!registry) {
    const current = new Map<PrimitiveDefinition, Registration>();
    const scan = () => {
      for (const [definition, { owned }] of current) {
        for (const element of owned) {
          if (root !== element && !root.contains(element)) {
            definition.unmount(element);
            owned.delete(element);
          }
        }
      }
      if (!current.size) return;
      const selector = [...current.keys()].map((definition) => `[${definition.attribute}]`).join(',');
      const elements = [...root.querySelectorAll<HTMLElement>(selector)];
      if (root.nodeType === 1 && (root as HTMLElement).matches(selector)) elements.unshift(root as HTMLElement);
      for (const element of elements) {
        for (const [definition, { owned }] of current) {
          if (!element.hasAttribute(definition.attribute)) continue;
          definition.mount(element);
          owned.add(element);
        }
      }
    };
    const view = (root.ownerDocument ?? (root as Document)).defaultView!;
    const observer = new view.MutationObserver(scan);
    observer.observe(root, { childList: true, subtree: true });
    // Registrations made in the same turn are mounted together, parents first.
    let scheduled = false;
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      queueMicrotask(() => {
        scheduled = false;
        scan();
      });
    };
    registry = { registrations: current, schedule, observer };
    roots.set(root, registry);
  }
  const { registrations, schedule, observer } = registry;
  const existing = registrations.get(part);
  if (existing) return existing.cleanup;
  const owned = new Set<HTMLElement>();
  const cleanup = () => {
    if (registrations.get(part)?.cleanup !== cleanup) return;
    registrations.delete(part);
    for (const element of owned) part.unmount(element);
    owned.clear();
    if (!registrations.size) {
      observer.disconnect();
      roots.delete(root);
    }
  };
  registrations.set(part, { owned, cleanup });
  schedule();
  return cleanup;
}
