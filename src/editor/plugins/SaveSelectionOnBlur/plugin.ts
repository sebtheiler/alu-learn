import { ExtendedReactEditor } from "../../types";

/**
 * SlateJS plugin to save the current selection when the editor is blurred
 * @param editor Editor to extend with new functionality
 * @returns Editor extended with save on blur functionality
 */
const withSaveSelectionOnBlur = (editor: ExtendedReactEditor) => {
  editor.saveSelectionOnBlur = () => {
    editor.blurSelection = editor.selection;
  };

  return editor;
};

export default withSaveSelectionOnBlur;
