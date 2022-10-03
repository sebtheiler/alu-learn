import { nodes } from "@/lexicalEditor/LexicalEditor/LexicalEditor";
import {
  $isClozeDeletionNode,
  ClozeDeletionNode,
} from "@/lexicalEditor/plugins/ClozeDeletionPlugin/nodes";
import { createHeadlessEditor } from "@lexical/headless";
import { ElementNode, LexicalNode, RootNode, TextNode } from "lexical";
import type { LexicalEditor } from "lexical";

/**
 * Recursively finds all ClozeDeletionNode from a stringified field
 * @param field Stringified field to search for ClozeDeletionNodes in
 * @param callback Function to be called when a ClozeDeletionNode is found
 * @returns A promise to await as the function finds all the ClozeDeletionNodes
 * @example
 * ```ts
 * const field = JSON.stringify(JSON.parse(flashcard.fields as string)[0]);
 * const clozeColors = new Set<ClozeColor>();
 * await processCloze(field, (child) => clozeColors.add(child.getColor()));
 * ```
 */
const processCloze = (
  field: string,
  callback: (child: ClozeDeletionNode) => void
): LexicalEditor => {
  const editor = createHeadlessEditor({
    nodes,
    namespace: "process-cloze",
    onError: (error) => console.error(error),
  });
  const editorState = editor.parseEditorState(field);
  editor.setEditorState(editorState);

  editor.update(() => {
    const processChild = (
      child: LexicalNode | ElementNode | TextNode,
      i: number
    ) => {
      if ($isClozeDeletionNode(child)) {
        callback(child);
      }

      let subChildren: any;
      try {
        subChildren = child.getChildren();
      } catch {
        return;
      }

      for (const subChild of subChildren) {
        processChild(subChild, i + 1);
      }
    };

    const rootNode = editorState._nodeMap.get("root") as RootNode;
    const children = rootNode.getChildren();

    for (const child of children) {
      processChild(child, 0);
    }
  });

  return editor;
};

export default processCloze;
