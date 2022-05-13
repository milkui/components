import * as Atomico from 'atomico';
import { useChannel } from '@atomico/hooks/use-channel';

function createContext<T>(initialValue: T) {
  const channel = Math.random().toString(36).slice(-6);

  const useProvider = (value: T, deps = []) => {
    const [, setContext] = useChannel<T>(channel);

    Atomico.useLayoutEffect(() => {
      setContext(value);
    }, deps);
  };

  const useContext = () => {
    const [context] = useChannel<T>(channel);
    return context || initialValue;
  };

  return [useProvider, useContext] as const;
}

export { createContext };
