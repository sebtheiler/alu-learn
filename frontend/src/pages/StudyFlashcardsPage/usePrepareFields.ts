import { nodes } from "@/lexicalEditor/LexicalEditor/LexicalEditor";
import type { ReviewInstance } from "@/types";
import processCloze from "course/processCloze";
import { createEditor, TextNode } from "lexical";
import { useEffect, useMemo } from "react";

const usePrepareFields = (reviewInstance?: ReviewInstance) => {
  const flashcard = reviewInstance?.flashcard;
  const frontEditor = useMemo(() => createEditor({ nodes }), []);
  const backEditor = useMemo(() => createEditor({ nodes }), []);

  useEffect(() => {
    if (!flashcard?.fields) return;

    const basicFrontField = JSON.stringify(
      JSON.parse(flashcard.fields as string)[0]
    );
    const basicBackField = JSON.stringify(
      JSON.parse(flashcard.fields as string)[1]
    );

    const parsedFrontState = frontEditor.parseEditorState(basicFrontField);
    basicFrontField && frontEditor.setEditorState(parsedFrontState);
    basicBackField &&
      backEditor.setEditorState(backEditor.parseEditorState(basicBackField));
  }, [frontEditor, backEditor, flashcard?.fields]);

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
        const activeColor = reviewInstance.name?.split("-")[1].toUpperCase();

        const updatedFrontEditor = processCloze(basicFrontField, (child) => {
          if (child.getColor() === activeColor) {
            // Make the active cloze yellow, no matter its original color
            const subChildren = child.getChildren();
            for (const subChild of subChildren) subChild.remove(true);
            const textNode = new TextNode("[...]");
            child.append(textNode);
            child.setColor("YELLOW");
          } else {
            // Make all other clozes not appear
            child.setColor("BLANK");
          }
        });

        const updatedBackEditor = processCloze(basicFrontField, (child) => {
          if (child.getColor() == activeColor) {
            // Make the active cloze yellow, no matter its original color
            child.setColor("YELLOW");
          } else {
            // Make all other clozes not appear
            child.setColor("BLANK");
          }
        });

        return {
          frontField: JSON.stringify(updatedFrontEditor._pendingEditorState),
          backField: JSON.stringify(updatedBackEditor._pendingEditorState),
        };
      }
      default:
        throw new Error(`Unrecognized flashcard type ${flashcard.type}`);
    }
  }, [reviewInstance, flashcard]);

  return { frontField, backField };
};

export default usePrepareFields;
