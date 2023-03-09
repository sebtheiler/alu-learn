# Lexical Editor

A custom implementation of Meta's [Lexical](https://lexical.dev) editor

## Plugins
* `AutoLinkPlugin`: Automatically create hyperlinks when copy-pasting a link
* `ClearEditorPlugin`: Use a ref to clear the editor's contents
* `ClozeDeletionPlugin`: Insert cloze deletions into the editor. Set the cloze's color and hint
* `EquationPlugin`: Write LaTeX equations in the editor
* `ExtractPlugin`: Create extracts from text (for Alu Read)
* `FlashcardLinkPlugin`: Create "links" that allow you to preview other flashcards in text
* `FloatingLinkEditorPlugin`: Display a floating editor for editing links
* `ImagePlugin`: Insert and display images in the editor
* `ListMaxIndentLevelPlugin`: Specify a maximum list indent level
* `MarkdownShortcutPlugin`: Use various Markdown shortcuts to style text (e.g., `*` for bullets, `>` for quotes, etc.)
* `MaxLengthPlugin`: Specify the maximum number of characters the editor can have
* `OverrideTabPlugin`: Stop tab from indenting the paragraph and instead use the normal behavior of selecting the next element on the page
* `ToolbarPlugin`: Display a toolbar for the editor

## Why Next instead of Vite?

`lexical-editor` is designed for integration with the rest of Alu, so it uses Next.js features such as `next/image` and `next/link`. These features are difficult to get functioning outside of Next.js, so `lexical-editor` uses Next.js as a development server.
