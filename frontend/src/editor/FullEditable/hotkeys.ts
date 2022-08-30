import { toggleBlock, toggleMark } from "./helpers";
import isHotKey, { isKeyHotkey } from "is-hotkey";
import { Range, Transforms } from "slate";
import type { ReactEditor } from "slate-react";

const HOTKEYS = {
  "mod+b": { mark: "bold", isBlock: false },
  "mod+i": { mark: "italic", isBlock: false },
  "mod+u": { mark: "underline", isBlock: false },
  "mod+`": { mark: "code", isBlock: false },
  "mod+=": { mark: "math_inline", isBlock: false },

  "mod+k": { mark: "link", isBlock: true },
  "mod+shift+c": { mark: "cloze", isBlock: true },
  "mod+shift+4": { mark: "math-block", isBlock: true },
  "mod+shift+7": { mark: "numbered-list", isBlock: true },
  "mod+shift+8": { mark: "bulleted-list", isBlock: true },
};

type Hotkey = "mod+b" | "mod+i" | "mod+u" | "mod+`" | "mod+=" | "mod+shift+c";

const hotkeysHandler = (editor: ReactEditor) => {
  return (event: React.KeyboardEvent<HTMLDivElement>) => {
    const { selection } = editor;

    // Default left/right behavior is unit:'character'.
    // This fails to distinguish between two cursor positions, such as
    // <inline>foo<cursor/></inline> vs <inline>foo</inline><cursor/>.
    // Here we modify the behavior to unit:'offset'.
    // This lets the user step into and out of the inline without stepping over characters.
    // See https://github.com/ianstormtaylor/slate/blob/main/site/examples/inlines.tsx
    if (selection && Range.isCollapsed(selection)) {
      const { nativeEvent } = event;
      if (isKeyHotkey("left", nativeEvent)) {
        event.preventDefault();
        Transforms.move(editor, { unit: "offset", reverse: true });
      } else if (isKeyHotkey("right", nativeEvent)) {
        event.preventDefault();
        Transforms.move(editor, { unit: "offset" });
      }
    }

    // Apply each hotkey
    for (const hotkey in HOTKEYS) {
      if (isHotKey(hotkey, event)) {
        event.preventDefault();
        const { mark, isBlock } = HOTKEYS[hotkey as Hotkey];

        if (isBlock) {
          toggleBlock(editor, mark);
        } else {
          toggleMark(editor, mark);
        }
      }
    }
  };
};

export default hotkeysHandler;
