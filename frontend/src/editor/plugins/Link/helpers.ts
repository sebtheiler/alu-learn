import { Editor, Transforms, Range } from 'slate';
import { ReactEditor } from 'slate-react';

/**
 * Inserts a link into an editor
 * @param editor Editor into which to insert the link
 * @param url URL of the link to insert
 */
const insertLink = (editor: ReactEditor, url: string) => {
  if (editor.selection) {
    wrapLink(editor, url);
  }
}

/**
 * Returns if a link is active for an editor
 * @param editor Editor to check if link is active
 * @returns Whether or not a link is active
 */
const isLinkActive = (editor: ReactEditor) => {
  // @ts-ignore
  const [link] = Editor.nodes(editor, { match: n => n.type === 'link' });
  return !!link;
}

/**
 * Unwraps a link in an editor
 * @param editor Editor to unwrap link in
 */
const unwrapLink = (editor: ReactEditor) => {
  // @ts-ignore
  Transforms.unwrapNodes(editor, { match: n => n.type === 'link' });
}

/**
 * Wraps a link into an editor
 * @param editor Editor in which to wrap the link
 * @param url URL of the link to wrap
 */
const wrapLink = (editor: ReactEditor, url: string) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link = {
    type: 'link',
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
}

export {
  insertLink,
  isLinkActive,
  unwrapLink,
  wrapLink,
}
