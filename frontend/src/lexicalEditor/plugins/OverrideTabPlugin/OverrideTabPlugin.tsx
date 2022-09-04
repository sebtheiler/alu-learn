import focusNextElement from "@/helpers/focusNextElement";
import { getSelectedNode } from "@/lexicalEditor/helpers/getSelectedNode";
import { $isListNode, $isListItemNode } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  KEY_TAB_COMMAND,
} from "lexical";
import { useEffect } from "react";

/**
 * If tab is pressed and the selection is not in a list, move to
 * the next element rather than indenting the paragraph.  If the
 * selection IS in a list, indent the list as normal.
 */
export default function OverrideTabPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_TAB_COMMAND,
      () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) return false;

        const node = getSelectedNode(selection);
        const parent = node.getParent();

        if ($isListNode(parent) || $isListItemNode(parent)) {
          return false;
        } else {
          focusNextElement();
          return true;
        }
      },
      COMMAND_PRIORITY_CRITICAL
    );
  });

  return null;
}
