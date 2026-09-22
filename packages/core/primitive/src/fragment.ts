/** Read URL navigation state without observing configuration attributes. */
export function fragmentTarget(document: Document): HTMLElement | null {
  const hash = document.defaultView?.location.hash.slice(1);
  if (!hash) return null;
  try {
    return document.getElementById(decodeURIComponent(hash));
  } catch {
    return null;
  }
}

export function containsFragment(element: HTMLElement) {
  const target = fragmentTarget(element.ownerDocument);
  return target !== null && (element === target || element.contains(target));
}
