export const HOTKEYS = {
  "mod+b": { mark: "bold", isBlock: false },
  "mod+i": { mark: "italic", isBlock: false },
  "mod+u": { mark: "underline", isBlock: false },
  "mod+`": { mark: "code", isBlock: false },
  "mod+=": { mark: "math_inline", isBlock: false },

  "mod+k": { mark: "link", isBlock: true },
  "mod+shift+c": { mark: "cloze", isBlock: false },
};
export const LIST_TYPES = ["numbered-list", "bulleted-list"];
export type Hotkey =
  | "mod+b"
  | "mod+i"
  | "mod+u"
  | "mod+`"
  | "mod+="
  | "mod+shift+c";
