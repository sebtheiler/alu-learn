import Button from "atoms/Button";
import type { ButtonProps } from "atoms/Button";
import { ReactElement } from "react";

interface ButtonGroupProps {
  /**
   * Buttons in the group. Must be instances of `atoms/Button`
   */
  children: Array<ReactElement<ButtonProps>>;
  /**
   * Put spaces between each button?
   */
  spaced?: boolean;
  /**
   * Classname to apply to the div surrounding the children buttons
   */
  className?: string;
  /**
   * If specified, apply a fixed width to each button
   * E.g., 100px
   */
  fixedWidth?: string;
}

/**
 * Renders a button group that automatically styles the border radius on its buttons
 */
export default function ButtonGroup({
  children,
  spaced,
  className,
  fixedWidth,
}: ButtonGroupProps) {
  return (
    <div className={className}>
      {children.map((button, i) => {
        const newProps: ButtonProps = { ...button.props };
        if (i !== children.length - 1) {
          newProps._unroundRight = true;
          if (spaced) newProps.className += " mr-1";
        }
        if (i !== 0) {
          newProps._unroundLeft = true;
        }
        if (fixedWidth) {
          newProps.style = { ...newProps.style, width: fixedWidth };
        }
        return <Button {...newProps} key={i} />;
      })}
    </div>
  );
}
