import { trpcNonReact } from "../src/app/util";
import type { Article } from "../src/generated/client";
import { youtubeRegex } from "../globals";
import importPdf from "./importPdf";
import importHtml from "./importHtml";
import htmlToLexical from "lexical-editor/src/helpers/htmlToLexical";
import { sanitize } from "dompurify";

export type ImportType = "HTML" | "TEXT" | "PDF" | "ONLINE_VIDEO";

const importArticle = async ({
  data,
  importType,
  originUrl,
  importImages,
  callback,
}: {
  data: string;
  importType: ImportType;
  originUrl?: string;
  importImages?: boolean;
  callback: (article: Article) => void;
}) => {
  switch (importType) {
    case "HTML": {
      // `data` is the raw HTML body

      await importHtml(data, originUrl, importImages).then((article) =>
        callback(article)
      );
      break;
    }
    case "TEXT": {
      // `data` is the plaintext

      const dirty = `<div>${data}</div>`;
      const clean = sanitize(dirty);
      const editor = await htmlToLexical(clean);
      const editorState = editor.getEditorState();
      const stringified = JSON.stringify(editorState);
      const filePath = `${new Date().getTime()}-imported-text.lexical`;

      const article = await trpcNonReact.article.create.mutate({
        type: "LEXICAL",
        title: "Imported text",
        dataPath: filePath,
      });
      await trpcNonReact.file.write.mutate({
        filePath,
        data: stringified,
      });

      callback(article);

      break;
    }
    case "PDF": {
      // `data` is the raw PDF data

      await importPdf(data).then((article) => callback(article));
      break;
    }
    case "ONLINE_VIDEO": {
      // `data` is the video URL
      if (!youtubeRegex.test(data)) {
        throw new Error("Only YouTube is currently supported");
      }

      const { title, author_name: author } = await fetch(
        `https://noembed.com/embed?dataType=json&url=${data}`
      ).then((res) => res.json());
      const article = await trpcNonReact.article.create.mutate({
        type: "ONLINE_VIDEO",
        title,
        byline: author,
        originUrl,
        dataPath: data,
      });

      callback(article);

      break;
    }
  }
};

export default importArticle;
