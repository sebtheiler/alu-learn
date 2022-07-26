import { update } from "jdenticon";
import { useRef, useEffect } from "react";

interface JdenticonProps {
  /**
   * Value to generate the Jdenticon
   */
  value: string;
  /**
   * Size of the Jdenticon
   */
  size: number;
  /**
   * Styles to apply to the Jdenticon svg
   */
  style?: React.CSSProperties;
  /**
   * Class to apply to the Jdenticon svg
   */
  className?: string;
}

/**
 * Renders a Jdenticon icon
 * @see https://github.com/jmcudd/react-jdenticon/blob/master/src/index.js
 */
export default function Jdenticon({
  value,
  size,
  style,
  className,
}: JdenticonProps) {
  const icon = useRef<SVGSVGElement>(null);
  useEffect(() => update(icon.current as Element, value), [value]);

  return (
    <svg
      data-jdenticon-value={value}
      height={size}
      ref={icon}
      width={size}
      style={style}
      className={className}
    />
  );
}
