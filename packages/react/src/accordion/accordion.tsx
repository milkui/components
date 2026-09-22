import {
  Content as NativeContent,
  Header as NativeHeader,
  Item as NativeItem,
  Root as NativeRoot,
  Trigger as NativeTrigger,
} from '@milkui/accordion';
import { createReactComponent } from '../primitive/index.js';
import type { ComponentProps } from 'react';

/* -------------------------------------------------------------------------------------------------
 * Accordion
 * -----------------------------------------------------------------------------------------------*/

const Root = /*#__PURE__*/ createReactComponent(NativeRoot);
const Accordion = Root;
type RootProps = ComponentProps<typeof Root>;
type AccordionProps = RootProps;

/* -------------------------------------------------------------------------------------------------
 * AccordionItem
 * -----------------------------------------------------------------------------------------------*/

const Item = /*#__PURE__*/ createReactComponent(NativeItem);
const AccordionItem = Item;
type ItemProps = ComponentProps<typeof Item>;
type AccordionItemProps = ItemProps;

/* -------------------------------------------------------------------------------------------------
 * AccordionHeader
 * -----------------------------------------------------------------------------------------------*/

const Header = /*#__PURE__*/ createReactComponent(NativeHeader);
const AccordionHeader = Header;
type HeaderProps = ComponentProps<typeof Header>;
type AccordionHeaderProps = HeaderProps;

/* -------------------------------------------------------------------------------------------------
 * AccordionTrigger
 * -----------------------------------------------------------------------------------------------*/

const Trigger = /*#__PURE__*/ createReactComponent(NativeTrigger);
const AccordionTrigger = Trigger;
type TriggerProps = ComponentProps<typeof Trigger>;
type AccordionTriggerProps = TriggerProps;

/* -------------------------------------------------------------------------------------------------
 * AccordionContent
 * -----------------------------------------------------------------------------------------------*/

const Content = /*#__PURE__*/ createReactComponent(NativeContent);
const AccordionContent = Content;
type ContentProps = ComponentProps<typeof Content>;
type AccordionContentProps = ContentProps;

/* ---------------------------------------------------------------------------------------------- */

export {
  Root,
  Item,
  Header,
  Trigger,
  Content,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
};

export type {
  RootProps,
  ItemProps,
  HeaderProps,
  TriggerProps,
  ContentProps,
  AccordionProps,
  AccordionItemProps,
  AccordionHeaderProps,
  AccordionTriggerProps,
  AccordionContentProps,
};
