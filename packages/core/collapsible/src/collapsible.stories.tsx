import './collapsible';

export default {
  title: 'Core/Collapsible',
};

export const Base = () => /*html*/ `
  <milk-collapsible>
    <milk-collapsible-trigger>More info</milk-collapsible-trigger>
    <milk-collapsible-content>The quick brown fox jumped over the lazy dogs.</milk-collapsible-content>
  </milk-collapsible>
`;
