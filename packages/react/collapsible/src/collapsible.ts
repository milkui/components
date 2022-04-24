import '@atomico/react/proxy';
import { auto } from '@atomico/react';
import * as CollapsibleElement from '@milkui/collapsible';

const Collapsible = auto(CollapsibleElement.Root);
const CollapsibleTrigger = auto(CollapsibleElement.Trigger);
const CollapsibleContent = auto(CollapsibleElement.Content);

export {
  Collapsible as Root,
  CollapsibleTrigger as Trigger,
  CollapsibleContent as Content,
  //
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
};
