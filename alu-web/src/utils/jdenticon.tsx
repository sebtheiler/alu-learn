import { update } from 'jdenticon';
import { useRef, useEffect } from 'react';

// Adapted from https://github.com/jmcudd/react-jdenticon/blob/master/src/index.js
export default function Jdenticon({ value, size }: { value: string, size: number }) {
  const icon = useRef<SVGSVGElement>(null);
  useEffect(() => update(icon.current as Element, value), [value]);

  return <svg data-jdenticon-value={value} height={size} ref={icon} width={size} />;
};
