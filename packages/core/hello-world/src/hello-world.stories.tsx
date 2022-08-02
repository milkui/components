import './hello-world';

export default {
  title: 'Core/HelloWorld',
};

export const Base = () => /*html*/ `
  <script>
    function handleClick(event) {
      event.preventDefault();
      console.log('consumer click', event);
    }
  </script>
  <milk-hello-world><input onclick="handleClick(event)" /></milk-hello-world>
`;
