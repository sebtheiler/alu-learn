import Button, { ButtonProps } from "components/Button";
import { ReactElement } from "react";

interface ButtonGroupProps {
  /**
   * Buttons in the group. Must be instances of `components/Button`
   */
  children: Array<ReactElement<ButtonProps>>;
  /**
   * Put spaces between each button?
   */
  spaced?: boolean;
  className?: string;
}

/**
 * Renders a button group that automatically styles the border radius on its buttons
 */
export default function ButtonGroup({
  children,
  spaced,
  className,
}: ButtonGroupProps) {
  return (
    <div className={className}>
      {children.map((button, i) => {
        const newProps = { ...button.props };
        if (i !== children.length - 1) {
          newProps._unroundRight = true;
          if (spaced) newProps.className += " mr-1";
        }
        if (i !== 0) {
          newProps._unroundLeft = true;
        }
        return <Button {...newProps} key={i} />;
      })}
    </div>
  );
}
