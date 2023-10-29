import { createReactComponent } from '@milkui/create-react-component';
import * as CollapsiblePrimitive from '@milkui/collapsible';

const Collapsible = createReactComponent(CollapsiblePrimitive.Root);
const CollapsibleTrigger = createReactComponent(CollapsiblePrimitive.Trigger);
const CollapsibleContent = createReactComponent(CollapsiblePrimitive.Content);

export {
  Collapsible as Root,
  CollapsibleTrigger as Trigger,
  CollapsibleContent as Content,
  //
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
};
