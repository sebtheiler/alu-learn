import { nodes } from "@/editor/LexicalEditor/LexicalEditor";
import { clozeRegex } from "@/globals";
import type { ReviewInstance } from "@/types";
import processCloze from "course/processCloze";
import { createEditor, TextNode } from "lexical";

const prepareFields = (reviewInstance?: ReviewInstance) => {
  const flashcard = reviewInstance?.flashcard;
  if (!flashcard || !flashcard.fields)
    return {
      frontField: null,
      backField: null,
    };

  const frontEditor = createEditor({ nodes });
  const backEditor = createEditor({ nodes });

  const basicFrontField = JSON.stringify(
    JSON.parse(flashcard.fields as string)[0]
  );
  const basicBackField = JSON.stringify(
    JSON.parse(flashcard.fields as string)[1]
  );
  if (basicFrontField && basicFrontField !== "null")
    frontEditor.setEditorState(frontEditor.parseEditorState(basicFrontField));
  if (basicBackField && basicBackField !== "null")
    backEditor.setEditorState(backEditor.parseEditorState(basicBackField));

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

        const unclozifiedText = match.slice(0, match.length - 2).split("::")[1];
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
          child.setColor("YELLOW");

          // Obscure the content of the active cloze
          const subChildren = child.getChildren();
          for (const subChild of subChildren) subChild.remove(true);

          // Add the hint or default cloze text
          const hint = child.getHint();
          const textNode = new TextNode(hint ? `[ ${hint} ]` : "[...]");
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
};

export default prepareFields;
