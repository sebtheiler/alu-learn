import { nodes } from "@/lexicalEditor/LexicalEditor/LexicalEditor";
import {
  $isClozeDeletionNode,
  ClozeDeletionNode,
} from "@/lexicalEditor/plugins/ClozeDeletionPlugin/nodes";
import { createEditor, EditorState } from "lexical";
// import { createHeadlessEditor } from "lexical-headless"
import type { ElementNode, LexicalNode, RootNode, TextNode } from "lexical";
import { createEmptyEditorState } from "lexical/LexicalEditorState";

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
): Promise<null> => {
  // const editor = createEditor({ nodes });
  // const p = editor.parseEditorState(field);
  // editor.setEditorState(p)
  // console.log(editor.getEditorState(), p)
  // const editorState = editor._editorState;
  // editorState._nodeMap = p._nodeMap;
  // console.log(editorState)
  // const editorState = editor.getEditorState()
  // const editor = createEditor({ nodes, editorState: p })
  // editora.setEditorState(p)
  // const editorState = editor.getEditorState();
  // console.log(editorState)
  // console.log(p)
  // console.log(p, editorState)
  console.log(field);
  const editor = createEditor({ nodes });
  // editor.setReadOnly(false)
  // console.log(editor.getEditorState())
  // console.log(editor.isReadOnly())
  const editorState = editor.parseEditorState(field);
  console.log(editorState._nodeMap);
  editor.setEditorState(editorState);
  console.log(editor.getEditorState()._nodeMap);
  // const foo = new EditorState(editorState._nodeMap);
  // const foo = createEmptyEditorState()
  // const foo = editorState.clone()
  // console.log({ foo })
  // console.log(editor.getEditorState())
  // editor.setReadOnly(false)
  // console.log(editor.isReadOnly())

  return new Promise<null>((resolve) =>
    editorState.read(() => {
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

      resolve(null);
    })
  );
};

export default processCloze;
