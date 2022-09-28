import { nodes } from "@/lexicalEditor/LexicalEditor/LexicalEditor";
import type { Flashcard } from "@/types";
import processCloze from "course/processCloze";
import { createEditor, TextNode } from "lexical";
import { useEffect, useMemo } from "react";

const usePrepareFields = (flashcard?: Flashcard) => {
  // const frontEditor = useMemo(() => createEditor({ nodes }), []);
  // const backEditor = useMemo(() => createEditor({ nodes }), []);

  // useEffect(() => {
  //   if (!flashcard?.fields) return;

  //   const basicFrontField = JSON.stringify(JSON.parse(flashcard.fields as string)[0]);
  //   const basicBackField = JSON.stringify(JSON.parse(flashcard.fields as string)[1]);

  //   const parsedFrontState = frontEditor.parseEditorState(basicFrontField);
  //   console.log(parsedFrontState)
  //   basicFrontField && frontEditor.setEditorState(parsedFrontState);
  //   basicBackField && backEditor.setEditorState(backEditor.parseEditorState(basicBackField));
  // }, [frontEditor, backEditor, flashcard?.fields])

  // console.log(frontEditor.getEditorState())

  const { frontField, backField } = useMemo(() => {
    if (!flashcard)
      return {
        frontField: undefined,
        backField: undefined,
      };

    const basicFrontField = JSON.stringify(
      JSON.parse(flashcard.fields as string)[0]
    );
    const basicBackField = JSON.stringify(
      JSON.parse(flashcard.fields as string)[1]
    );

    switch (flashcard.type) {
      case "NORMAL":
        return {
          frontField: basicFrontField,
          backField: basicBackField,
        };
      case "CLOZE": {
        processCloze(basicFrontField, (child) => {
          console.log(child);
          // console.log(child.getChildren());
          // const textNode = new TextNode('[...]')
          // child.remove(true)
          // child.append(textNode)
        });

        return {
          frontField: basicFrontField,
          backField: basicFrontField,
        };
      }
      default:
        throw new Error(`Unrecognized flashcard type ${flashcard.type}`);
    }
  }, [flashcard]);

  return { frontField, backField };
};

export default usePrepareFields;
