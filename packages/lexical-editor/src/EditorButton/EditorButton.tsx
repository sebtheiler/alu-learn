import classNames from "helpers-lib/src/classNames";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { LexicalCommand, CommandPayloadType } from "lexical";
import { useMemo } from "react";
import useIsApple from "../helpers/useIsApple";

interface EditorButtonProps {
  /**
   * Command to dispatch when the button is clicked
   */
  command: LexicalCommand<any>;
  /**
   * Payload of the dispatched command
   */
  payload?: CommandPayloadType<any>;
  /**
   * Title to display on hover
   */
  title: string;
  /**
   * Keyboard shortcut. Only displays the shortcut; logic must be written elsewhere
   */
  shortcut?: string;
  /**
   * Font Awesome icon to display
   */
  faIcon: IconProp;
  /**
  /**
   * Is the button active?
   */
  isActive?: boolean;
  /**
   * Is the button disabled?
   */
  disabled?: boolean;
}

/**
 * Displays a button that dispatches an editor command. Used in the editor toolbar
 */
export default function EditorButton({
  command,
  payload,
  title,
  shortcut,
  faIcon,
  isActive = false,
  disabled = false,
}: EditorButtonProps) {
  const [editor] = useLexicalComposerContext();
  const IS_APPLE = useIsApple();
  const formattedTitle = useMemo(
    () =>
      title +
      (shortcut
        ? ` (${shortcut.toUpperCase().replace("MOD", IS_APPLE ? "⌘" : "Ctrl")})`
        : ""),
    [title, shortcut, IS_APPLE]
  );

  return (
    <button
      onClick={() => !disabled && editor.dispatchCommand(command, payload)}
      className={classNames(
        "w-6 h-6 mx-1 rounded-md hover:bg-gray-200",
        isActive && "bg-blue-100 hover:bg-blue-100",
        disabled && "hover:cursor-not-allowed text-gray-400"
      )}
      title={formattedTitle}
      aria-label={formattedTitle}
      disabled={disabled}
      tabIndex={-1}
    >
      <FontAwesomeIcon icon={faIcon} />
    </button>
  );
}
