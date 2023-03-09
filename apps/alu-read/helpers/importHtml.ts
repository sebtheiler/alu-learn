import slugifyText from "helpers-lib/src/slugifyText";
import htmlToLexical from "lexical-editor/src/helpers/htmlToLexical";
import { trpcNonReact } from "../src/app/util";
import { Article } from "../src/generated/client";
import parseArticleFromString from "./parseArticleFromString";
import { sanitize } from "dompurify";

export default async function importHtml(
  html: string,
  originUrl?: string,
  importImages?: boolean
): Promise<Article> {
  // Replace links and images in HTML
  html = await replaceHrefsAndSrcs(html, originUrl, importImages);

  // Parse article from HTML
  const parsedArticle = parseArticleFromString(html);
  if (!parsedArticle) {
    throw new Error("Failed to parse article");
  }
  const title =
    parsedArticle.title && parsedArticle.title.length > 0
      ? parsedArticle.title
      : "New Article";
  const filePath = `${new Date().getTime()}-${slugifyText(title)}.lexical`;

  // Convert HTML to Lexical
  const editor = await htmlToLexical(sanitize(parsedArticle.content));
  const editorState = editor.getEditorState();
  const articleData = JSON.stringify(editorState);

  const article = await trpcNonReact.article.create.mutate({
    type: "LEXICAL",
    title,
    byline: parsedArticle?.byline ?? "",
    originUrl,
    dataPath: filePath,
  });
  trpcNonReact.file.write.mutate({
    filePath,
    data: articleData,
  });

  return article;
}

/**
 * Replaces the `href` attribute of all anchor elements with local `href` attributes to their absolute URL
 * based on the given website URL, and the `src` attribute of all image elements with local `src` attributes
 * with the base64-encoded version of the image it is referencing.
 *
 * @param {string} html - The HTML string to modify.
 * @param {string} url - The website URL to use for resolving local URLs.
 * @returns {Promise<string>} A promise that resolves to the modified HTML string.
 */
async function replaceHrefsAndSrcs(
  html: string,
  url?: string,
  importImages = false
): Promise<string> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  if (url) {
    const anchors = doc.getElementsByTagName("a");
    for (const anchor of anchors) {
      const href = anchor.getAttribute("href");
      if (href && (href.startsWith("/") || href.startsWith("../"))) {
        anchor.setAttribute("href", new URL(href, url).toString());
      }
    }
  }

  if (importImages) {
    const imgs = doc.getElementsByTagName("img");
    for (const img of imgs) {
      const src = img.getAttribute("src");
      if (src) {
        const imageUrl = new URL(src, url).toString();
        const base64 = await getBase64FromImageUrl(imageUrl);
        img.setAttribute("src", base64);
      }
    }
  }

  return doc.documentElement.outerHTML;
}

/**
 * Fetches an image from the given URL and returns it as a base64-encoded string.
 *
 * @param {string} url - The URL of the image to fetch.
 * @returns {Promise<string>} A promise that resolves to the base64-encoded string of the image.
 */
async function getBase64FromImageUrl(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      if (typeof base64data === "string") {
        resolve(base64data);
      } else {
        reject("Failed to convert image to base64.");
      }
    };
  });
}
