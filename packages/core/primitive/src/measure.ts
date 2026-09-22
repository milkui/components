/** Measures natural border-box size, including content compressed by a transition. */
export function measure(element: HTMLElement) {
  const { animationName, contentVisibility, transitionBehavior } = element.style;
  element.style.animationName = 'none';
  // Closed content may still be skipped when the opening state is first committed.
  // Reveal skipped content immediately without cancelling a running height transition.
  element.style.transitionBehavior = 'normal';
  element.style.contentVisibility = 'visible';
  const rect = element.getBoundingClientRect();
  const style = element.ownerDocument.defaultView!.getComputedStyle(element);
  const height = `${Math.max(rect.height, element.scrollHeight + borders(style, 'top', 'bottom'))}px`;
  const width = `${Math.max(rect.width, element.scrollWidth + borders(style, 'left', 'right'))}px`;
  element.style.animationName = animationName;
  element.style.contentVisibility = contentVisibility;
  element.style.transitionBehavior = transitionBehavior;
  return { height, width };
}

function borders(
  style: CSSStyleDeclaration,
  start: 'top' | 'right' | 'bottom' | 'left',
  end: 'top' | 'right' | 'bottom' | 'left',
) {
  return (
    pixels(style.getPropertyValue(`border-${start}-width`)) +
    pixels(style.getPropertyValue(`border-${end}-width`))
  );
}

function pixels(value: string) {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? number : 0;
}
