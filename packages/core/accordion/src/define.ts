import { definePrimitives } from '@milkui/primitive';
import { Content, Header, Item, Root, Trigger } from './accordion.js';

const roots = new WeakMap<Document | HTMLElement, () => void>();
export function defineAccordion(root: Document | HTMLElement = document) {
  const existing = roots.get(root);
  if (existing) return existing;
  const disconnect = definePrimitives([Root, Item, Header, Trigger, Content], root);
  const cleanup = () => {
    disconnect();
    roots.delete(root);
  };
  roots.set(root, cleanup);
  return cleanup;
}
