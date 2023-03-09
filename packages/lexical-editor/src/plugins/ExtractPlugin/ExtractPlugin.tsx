import { $generateHtmlFromNodes } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { $getSelection, COMMAND_PRIORITY_EDITOR, COMMAND_PRIORITY_HIGH, KEY_DOWN_COMMAND, LexicalCommand } from "lexical";
import { createCommand } from "lexical";
import { useEffect } from "react";
import useIsApple from "../../helpers/useIsApple";
import { ExtractColor, ExtractNode, toggleExtract } from "./nodes";

type ExtractPluginPayload = {
  color: ExtractColor;
}

export const TOGGLE_EXTRACT_COMMAND: LexicalCommand<ExtractPluginPayload> = createCommand();

export default function ExtractPlugin({
  createExtractCallback,
}: {
  createExtractCallback?(generatedHtml: string): void;
}) {
  const [editor] = useLexicalComposerContext();
  const IS_APPLE = useIsApple();

  useEffect(() => {
    if (!editor.hasNodes([ExtractNode])) {
      throw new Error(
        "ExtractPlugin: ExtractNode is not registered on editor"
      )
    }

    return mergeRegister(
      editor.registerCommand<ExtractPluginPayload>(
        TOGGLE_EXTRACT_COMMAND,
        (payload) => {
          const { color } = payload;
          toggleExtract({ color });

          const selection = $getSelection();
          const generatedHtml = $generateHtmlFromNodes(editor, selection);
          if (createExtractCallback)
            createExtractCallback(generatedHtml);

          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),
      editor.registerCommand(
        KEY_DOWN_COMMAND,
        (payload) => {
          const { key, altKey, shiftKey, ctrlKey, metaKey } = payload;
          // alt+x or ctrl/cmd+h to make an extract
          if (
            (key.toLocaleLowerCase() === 'x' && altKey && !shiftKey) ||
            (key.toLocaleLowerCase() === 'h' && (IS_APPLE ? metaKey : ctrlKey))
          ) {
            payload.preventDefault();
            editor.dispatchCommand(TOGGLE_EXTRACT_COMMAND, { color: "YELLOW" });
          }

          return true;
        },
        COMMAND_PRIORITY_HIGH
      )
    )
  })

  return <div></div>;
}