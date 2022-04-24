import * as Atomico from "atomico";

function useControllableState<T>(params: {
  prop: T;
  defaultProp: T;
  changeEvent: string;
}) {
  const [value = params.prop, setValue] = Atomico.useState(params.defaultProp);
  const isControlled = params.prop !== undefined;
  const dispatchChange = Atomico.useEvent(params.changeEvent, {
    bubbles: false,
    cancelable: false,
    base: CustomEvent,
  });

  function handleChange(update: typeof setValue) {
    setValue((prevValue = params.prop) => {
      const isCallback = typeof update === "function";
      const nextValue = isCallback ? update(prevValue) : update;
      dispatchChange(nextValue);
      return isControlled ? prevValue : nextValue;
    });
  }

  return [value, handleChange] as const;
}

export { useControllableState };
