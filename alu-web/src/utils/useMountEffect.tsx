import { useEffect, useRef } from 'react';

// Taken from https://stackoverflow.com/a/57941438/10226703
export default function useMountEffect(func: Function, deps: any[]) {
  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) func();
    else didMount.current = true;
    // eslint-disable-next-line
  }, deps);
}
