import { useMemo } from "react";
import VideoPlayer from "./VideoPlayer";
import LexicalReader from "./LexicalReader";
import dynamic from "next/dynamic";
import useGetObject from "../../helpers/useGetObject";

const PDFViewer = dynamic(import("./PDFViewer"), { ssr: false });

const readersMap = [
  { articleType: "LEXICAL", extractType: "LEXICAL", Reader: LexicalReader },
  {
    articleType: "ONLINE_VIDEO",
    extractType: "VIDEO_TIMESTAMP",
    Reader: VideoPlayer,
  },
  {
    articleType: "PDF",
    extractType: null,
    Reader: PDFViewer,
  },
];

const ArticleReader: React.FC = () => {
  const object = useGetObject();

  const Reader = useMemo(
    () =>
      object
        ? readersMap.filter(
            ({ articleType, extractType }) =>
              (object.objectType === "ARTICLE" &&
                object.type === articleType) ||
              (object.objectType === "EXTRACT" && object.type === extractType)
          )[0].Reader
        : undefined,
    [object]
  );

  if (!object)
    return (
      <div className="text-center">
        <h3 className="text-2xl mt-10">
          Select or import an article to get started
        </h3>
        <h4 className="text-xl mt-4">Import (Ctrl + I)</h4>
        <h4 className="text-xl mt-2">Learn Next (Ctrl + L)</h4>
      </div>
    );
  return (
    <div>
      {object && (
        <div className="prose prose-a:text-blue-500 prose-a:no-underline mt-5 container mx-auto max-w-3xl">
          {Reader && <Reader object={object} />}
        </div>
      )}
    </div>
  );
};

export default ArticleReader;
