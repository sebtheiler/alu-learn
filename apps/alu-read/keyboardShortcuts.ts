type Shortcut = {
  ctrlCmd?: boolean;
  shift?: boolean;
  alt?: boolean;
  key: string;
};

type Command = "createExtract" | "learnNext" | "import" | "moveToParent";

export const keyboardShortcuts = new Map<Command, Shortcut[]>([
  [
    "createExtract",
    [
      { alt: true, key: "x" },
      { ctrlCmd: true, key: "h" },
    ],
  ],
  ["learnNext", [{ ctrlCmd: true, key: "l" }]],
  ["import", [{ ctrlCmd: true, key: "i" }]],
  ["moveToParent", [{ ctrlCmd: true, shift: true, key: "h" }]],
]);

const matchesShortcut = (command: Command, event: KeyboardEvent): boolean => {
  const shortcuts = keyboardShortcuts.get(command);
  if (!shortcuts) throw new Error("Unrecognized command");
  for (const shortcut of shortcuts) {
    if (
      shortcut.key === event.key.toLocaleLowerCase() && // correct key
      (shortcut.ctrlCmd
        ? event.ctrlKey || event.metaKey
        : !(event.ctrlKey || event.metaKey)) && // if specified, ctrl or command is pressed
      (shortcut.shift ? event.shiftKey : !event.shiftKey) && // if specified, shift is pressed
      (shortcut.alt ? event.altKey : !event.altKey) // if specified, alt is pressed
    ) {
      return true;
    }
  }

  return false;
};

export default matchesShortcut;
