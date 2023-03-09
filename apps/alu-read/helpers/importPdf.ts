import slugifyText from "helpers-lib/src/slugifyText";
import { pdfjs } from "react-pdf";
import { trpcNonReact } from "../src/app/util";
import { Article } from "../src/generated/client";

const importPdf = async (url: string): Promise<Article> => {
  // Get PDF title and author
  let title = url.split("/").at(-1)?.replace(".pdf", "") as string;
  let author = "";
  const doc = await pdfjs.getDocument(url).promise;
  await doc.getMetadata().then((metadata) => {
    title = !metadata.info["Title"] ? title : metadata.info["Title"];
    author = !metadata.info["Author"] ? author : metadata.info["Author"];
  });

  // Create article and write to file
  const filePath = `${new Date().getTime()}-${slugifyText(title)}.pdf`;
  const article = await trpcNonReact.article.create.mutate({
    type: "PDF",
    title,
    byline: author,
    originUrl: url,
    dataPath: filePath,
  });
  trpcNonReact.file.writeFromUrl.mutate({
    filePath,
    url,
  });

  return article;
};

export default importPdf;
