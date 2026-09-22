import { definePrimitives } from '../primitive/index.js';
import { Content, Root, Trigger } from './collapsible.js';

const roots = new WeakMap<Document | HTMLElement, () => void>();
export function defineCollapsible(root: Document | HTMLElement = document) {
  const existing = roots.get(root);
  if (existing) return existing;
  const disconnect = definePrimitives([Root, Trigger, Content], root);
  const cleanup = () => {
    disconnect();
    roots.delete(root);
  };
  roots.set(root, cleanup);
  return cleanup;
}
