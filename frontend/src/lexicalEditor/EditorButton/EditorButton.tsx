import classNames from "@/helpers/classNames";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { LexicalCommand, CommandPayloadType } from "lexical";
import { useMemo } from "react";

const IS_APPLE = /Mac|iPod|iPhone|iPad/.test(navigator.platform);

interface EditorButtonProps {
  command: LexicalCommand<any>;
  payload?: CommandPayloadType<any>;
  title: string;
  shortcut?: string;
  faIcon: IconProp;
  isActive?: boolean;
  disabled?: boolean;
}

/**
 *
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
  const formattedTitle = useMemo(
    () =>
      title +
      (shortcut
        ? ` (${shortcut.toUpperCase().replace("MOD", IS_APPLE ? "⌘" : "Ctrl")})`
        : ""),
    [title, shortcut]
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
    >
      <FontAwesomeIcon icon={faIcon} />
    </button>
  );
}
