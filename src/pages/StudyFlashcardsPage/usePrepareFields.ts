import { clozeRegex } from "@/globals";
import { nodes } from "@/editor/LexicalEditor/LexicalEditor";
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
        const activeColorOrNumber = reviewInstance.name
          ?.split("-")[1]
          .toUpperCase();

        // Process legacy cloze numbers
        const clozeNumberMatches = basicFrontField.matchAll(clozeRegex);
        let newFrontField = basicFrontField;
        let newBackField = basicFrontField; // NOTE: intentionally `basicFrontField`
        for (const clozeNumberMatch of clozeNumberMatches) {
          const match = clozeNumberMatch[0];
          const clozeNumber = match.split("::")[0].replace(/^\D+/g, "");

          const unclozifiedText = match
            .slice(0, match.length - 2)
            .split("::")[1];
          if (clozeNumber === activeColorOrNumber) {
            // Obscure the content of the active cloze on the front
            newFrontField = newFrontField.replace(match, "[...]");
          } else {
            // Make other clozes appear normal on the front
            newFrontField = newFrontField.replace(match, unclozifiedText);
          }

          // Make all clozes on the back appear normal
          newBackField = newBackField.replace(match, unclozifiedText);
        }

        // Process modern cloze colors
        let foundFrontCloze = false;
        const updatedFrontEditor = processCloze(newFrontField, (child) => {
          foundFrontCloze = true;
          if (child.getColor() === activeColorOrNumber) {
            // Make the active cloze yellow, no matter its original color
            const subChildren = child.getChildren();
            child.setColor("YELLOW");

            // Obscure the content of the active cloze
            for (const subChild of subChildren) subChild.remove(true);
            const textNode = new TextNode("[...]");
            child.append(textNode);
          } else {
            // Make all other clozes not appear
            child.setColor("BLANK");
          }
        });

        let foundBackCloze = false;
        const updatedBackEditor = processCloze(newBackField, (child) => {
          foundBackCloze = true;
          if (child.getColor() == activeColorOrNumber) {
            // Make the active cloze yellow, no matter its original color
            child.setColor("YELLOW");
          } else {
            // Make all other clozes not appear
            child.setColor("BLANK");
          }
        });

        return {
          frontField: JSON.stringify(
            foundFrontCloze
              ? updatedFrontEditor._pendingEditorState
              : updatedFrontEditor.getEditorState()
          ),
          backField: JSON.stringify(
            foundBackCloze
              ? updatedBackEditor._pendingEditorState
              : updatedBackEditor.getEditorState()
          ),
        };
      }
      default:
        throw new Error(`Unrecognized flashcard type ${flashcard.type}`);
    }
  }, [reviewInstance, flashcard]);

  return { frontField, backField };
};

export default usePrepareFields;
