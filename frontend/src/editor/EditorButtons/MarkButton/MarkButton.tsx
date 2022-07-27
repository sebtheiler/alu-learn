import { isMarkActive, toggleMark } from "../../FullEditable/helpers";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tooltip from "components/Tooltip";
import capitalize from "helpers/capitalize";
import type { ReactEditor } from "slate-react";

type MarkFormat =
  | "bold"
  | "italic"
  | "underline"
  | "code"
  | "math_inline"
  | "link"
  | "flashcard_link";

interface MarkButtonProps {
  /**
   * Rich text mark format to apply to the editor
   */
  format: MarkFormat;
  /**
   * Font Awesome icon to display in the button
   */
  faIcon: IconProp;
  /**
   * SlateJS editor to apply the styling to
   */
  editor: ReactEditor;
  /**
   * Is the button able to be selected with tab?
   */
  tabbable: boolean;
}

/**
 * Displays a button to apply mark rich text formatting to an editor
 */
export default function MarkButton({
  format,
  faIcon,
  editor,
  tabbable,
}: MarkButtonProps) {
  return (
    <Tooltip tooltip={capitalize(format.replace("_", " "), true)}>
      <button
        onClick={(event) => {
          event.preventDefault();
          toggleMark(editor, format);
        }}
        style={{
          background: isMarkActive(editor, format)
            ? "#e1e6ed"
            : "rgba(0, 0, 0, 0)",
        }}
        tabIndex={tabbable ? undefined : -1}
        className="background-dark px-2 py-1"
      >
        <FontAwesomeIcon icon={faIcon} />
      </button>
    </Tooltip>
  );
}
