import htmlToLexical from "lexical-editor/src/helpers/htmlToLexical";
import { trpcNonReact } from "../src/app/util";
import { MergedObject } from "../types";

/**
 * Create a Lexical extract from some HTML
 * @param html HTML that is the content of the new Lexical extract
 * @param object The current selected object
 * @param utils `trpc.useContext()`
 * @param identifier Identifier for the extract
 */
const createExtractFromHtml = (
  html: string,
  object: MergedObject,
  utils: any,
  identifier?: any
) => {
  if (!object) return;
  return htmlToLexical(html)
    .then((editor) => {
      const editorState = editor.getEditorState();
      return JSON.stringify(editorState);
    })
    .then((extractData) =>
      trpcNonReact.extract.create.mutate({
        type: "LEXICAL",
        data: extractData,
        identifier,
        parentArticleId:
          object.objectType === "ARTICLE" ? object.id : undefined,
        parentExtractId:
          object.objectType === "EXTRACT" ? object.id : undefined,
      })
    )
    .finally(() => {
      utils.extract.all.invalidate();
      utils.article.all.invalidate();
    });
};

export default createExtractFromHtml;
