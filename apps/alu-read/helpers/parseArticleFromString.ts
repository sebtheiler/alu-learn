import { Readability } from "@mozilla/readability";

const parseArticleFromString = (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const parsedArticle = new Readability(doc).parse();

  return parsedArticle;
};

export default parseArticleFromString;
