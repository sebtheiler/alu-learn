import { update } from 'jdenticon';
import { useRef, useEffect } from 'react';

// Adapted from https://github.com/jmcudd/react-jdenticon/blob/master/src/index.js
export default function Jdenticon({ value, size, style }: { value: string, size: number, style?: React.CSSProperties }) {
  const icon = useRef<SVGSVGElement>(null);
  useEffect(() => update(icon.current as Element, value), [value]);

  return <svg data-jdenticon-value={value} height={size} ref={icon} width={size} style={style} />;
};
