import * as Hooked from 'hooked-elements';

/* -------------------------------------------------------------------------------------------------
 * useControllableState
 * -----------------------------------------------------------------------------------------------*/

interface UseControllableStateParams<T> {
  value?: T;
  defaultValue?: T;
  onChange?(value: T): void;
}

function useControllableState<T>(params: UseControllableStateParams<T>) {
  const [value = params.value, setValue] = Hooked.useState(params.defaultValue);
  const isControlled = params.value !== undefined;

  const handleValueChange = (change: T | ((prevValue: T) => T)) => {
    const update = (prevValue = params.value) => {
      const nextValue = change instanceof Function ? change(prevValue) : change;
      params.onChange?.(nextValue);
      return nextValue;
    };

    if (isControlled) {
      update();
    } else {
      setValue(update);
    }
  };

  const handleChangeRef = Hooked.useRef(handleValueChange);
  Hooked.useLayoutEffect(() => {
    handleChangeRef.current = handleValueChange;
  });

  return [value, handleChangeRef.current] as const;
}

/* ---------------------------------------------------------------------------------------------- */

export { useControllableState };
