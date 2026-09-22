import type { PrimitiveDefinition } from './primitive.js';

/** Opt-in DOM discovery; observes DOM insertion/removal, never attribute changes. */
export function definePrimitives(
  parts: readonly PrimitiveDefinition[],
  root: Document | HTMLElement = document,
) {
  const owned = new Map<HTMLElement, Set<PrimitiveDefinition>>();
  const view = (root.ownerDocument ?? (root as Document)).defaultView!;
  const contains = (element: HTMLElement) => root === element || root.contains(element);
  const scan = () => {
    for (const [element, mounted] of owned) {
      for (const part of mounted) {
        if (!contains(element)) {
          part.unmount(element);
          mounted.delete(part);
        }
      }
      if (!mounted.size) owned.delete(element);
    }
    for (const part of parts) {
      const matches = [...root.querySelectorAll<HTMLElement>(`[${part.attribute}]`)];
      if (root.nodeType === 1 && (root as HTMLElement).hasAttribute(part.attribute))
        matches.unshift(root as HTMLElement);
      for (const element of matches) {
        const mounted = owned.get(element) ?? new Set();
        part.mount(element);
        mounted.add(part);
        owned.set(element, mounted);
      }
    }
  };
  scan();
  const observer = new view.MutationObserver(scan);
  observer.observe(root, {
    childList: true,
    subtree: true,
  });
  return () => {
    observer.disconnect();
    for (const [element, mounted] of owned) for (const part of mounted) part.unmount(element);
    owned.clear();
  };
}
