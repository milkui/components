import { template } from 'atomico';
import * as Collapsible from './collapsible';

export default {
  title: 'Core/Collapsible'
}

export const Base = () => template(
  <Collapsible.Root>
    <Collapsible.Trigger>More info</Collapsible.Trigger>
    <Collapsible.Content>The quick brown fox jumped over the lazy dogs.</Collapsible.Content>
  </Collapsible.Root>
);
