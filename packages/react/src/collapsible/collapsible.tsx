import { Content as NativeContent, Root as NativeRoot, Trigger as NativeTrigger } from '@milkui/core/collapsible';
import { createReactComponent } from '../primitive/index.js';
import type { ComponentProps } from 'react';

/* -------------------------------------------------------------------------------------------------
 * Collapsible
 * -----------------------------------------------------------------------------------------------*/

const Root = /*#__PURE__*/ createReactComponent(NativeRoot);
const Collapsible = Root;
type RootProps = ComponentProps<typeof Root>;
type CollapsibleProps = RootProps;

/* -------------------------------------------------------------------------------------------------
 * CollapsibleTrigger
 * -----------------------------------------------------------------------------------------------*/

const Trigger = /*#__PURE__*/ createReactComponent(NativeTrigger);
const CollapsibleTrigger = Trigger;
type TriggerProps = ComponentProps<typeof Trigger>;
type CollapsibleTriggerProps = TriggerProps;

/* -------------------------------------------------------------------------------------------------
 * CollapsibleContent
 * -----------------------------------------------------------------------------------------------*/

const Content = /*#__PURE__*/ createReactComponent(NativeContent);
const CollapsibleContent = Content;
type ContentProps = ComponentProps<typeof Content>;
type CollapsibleContentProps = ContentProps;

/* ---------------------------------------------------------------------------------------------- */

export { Root, Trigger, Content, Collapsible, CollapsibleTrigger, CollapsibleContent };

export type {
  RootProps,
  TriggerProps,
  ContentProps,
  CollapsibleProps,
  CollapsibleTriggerProps,
  CollapsibleContentProps,
};
