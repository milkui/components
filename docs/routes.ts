export type Framework = 'react' | 'native';
export type ComponentName = 'accordion' | 'button' | 'collapsible';
export type DocsState = { component: ComponentName; framework: Framework };

export function readRoute(path: string): DocsState | undefined {
  if (path === '/') return { component: 'collapsible', framework: 'react' };
  const match = path.match(/^\/component\/(accordion|button|collapsible)(\/native)?\/?$/);
  if (!match) return undefined;
  return { component: match[1] as ComponentName, framework: match[2] ? 'native' : 'react' };
}

export function componentHref(state: DocsState, component: ComponentName = state.component) {
  return `/component/${component}${state.framework === 'native' ? '/native' : ''}`;
}

export const routePaths = [
  '/',
  ...(['accordion', 'button', 'collapsible'] as const).flatMap((component) => [
    `/component/${component}`,
    `/component/${component}/native`,
  ]),
];
