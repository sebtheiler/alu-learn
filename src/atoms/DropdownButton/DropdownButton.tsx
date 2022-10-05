import { ButtonProps, generateButtonClassName } from "@/atoms/Button";
import Dropdown from "@/atoms/Dropdown";
import type { MenuOption } from "@/atoms/Dropdown";

interface DropdownButtonProps extends ButtonProps {
  /**
   * Options to display in the dropdown
   */
  options: MenuOption[];
}

/**
 * A button that displays a dropdown when clicked.
 * Amalgamation of `Dropdown` and `Button`
 */
export default function DropdownButton(props: DropdownButtonProps) {
  return (
    <Dropdown
      options={props.options}
      menuButtonProps={{ ...props, className: generateButtonClassName(props) }}
    >
      {props.children}
    </Dropdown>
  );
}
