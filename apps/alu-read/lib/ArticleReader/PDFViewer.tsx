import Button from "alu-ui/src/Button";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  pdfjs,
  Document,
  Page,
  Outline,
  TextLayerItemInternal,
  PDFPageProxy,
  TextItem,
} from "react-pdf";
import useWindowDimensions from "helpers-lib/src/hooks/useWindowDimensions";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "./PDFViewer.scss";
import { useDebounce } from "helpers-lib/src/hooks/useDebounce";
import { highlight } from "./pdfHighlightHelpers";
import createExtractFromHtml from "../../helpers/createExtractFromHtml";
import { trpc, trpcNonReact } from "../../src/app/util";
import { MergedObject } from "../../types";
import notEmpty from "helpers-lib/src/notEmpty";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import matchesShortcut from "../../keyboardShortcuts";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer: React.FC<{ object: MergedObject }> = ({ object }) => {
  const utils = trpc.useContext();
  const extracts = trpc.extract.all.useQuery(
    {
      parentArticleId: object.objectType === "ARTICLE" ? object.id : undefined,
    },
    {
      enabled: object.objectType === "ARTICLE" && !!object.id,
    }
  );
  const toHighlight = useMemo<string[] | undefined>(
    () => extracts.data?.map((extract) => extract.identifier)?.filter(notEmpty),
    [extracts]
  );
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, _setPageNumber] = useState(1);
  const setPageNumber = useCallback(
    (pageNumber: number) => {
      // Set the page number and save the selected page as the latest reading point in the article
      if (object.objectType !== "ARTICLE") return;
      _setPageNumber(pageNumber);
      trpcNonReact.article.update.mutate({
        id: object.id,
        readingPoint: pageNumber.toString(),
      });
    },
    [object, _setPageNumber]
  );
  const [textItems, setTextItems] = useState<TextItem[]>();
  const [showOutline, setShowOutline] = useState(false);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }
  const onPageLoadSuccess = useCallback(async (page: PDFPageProxy) => {
    const textContent = await page.getTextContent();
    setTextItems(textContent.items as TextItem[]);
  }, []);

  function onItemClick({ pageNumber: itemPageNumber }) {
    setPageNumber(itemPageNumber);
  }

  // Render highlights on the document
  const highlightRenderer = useCallback(
    (textItem: TextLayerItemInternal): string => {
      if (!textItems || !toHighlight) return "";

      let finalText = textItem.str;
      for (const stringToHighlight of toHighlight) {
        finalText = highlight(
          finalText,
          stringToHighlight,
          textItems,
          textItem.itemIndex
        );
      }

      return finalText;
    },
    [textItems, toHighlight]
  );

  // Resize PDF document on window resize
  const wrapperDiv = useRef<HTMLDivElement>(null);
  const { width } = useWindowDimensions();
  const [pageWidth, setPageWidth] = useState(1);
  const debouncedPageWidth = useDebounce(pageWidth, 500);
  useLayoutEffect(() => {
    if (!wrapperDiv.current) return;
    const wrapperWidth = wrapperDiv.current.getBoundingClientRect().width;
    setPageWidth(wrapperWidth);
  }, [width]);

  // Create extracts from selected text on keypress
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (matchesShortcut("createExtract", event)) {
        let html = "";
        let plainText = "";
        if (window.getSelection) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const div = document.createElement("div");
            div.appendChild(range.cloneContents());
            html = div.innerHTML;
            plainText = selection.toString().replaceAll("\n", "");
          }
        }

        createExtractFromHtml(html, object, utils, plainText);
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [object, utils]);

  const [file, setFile] = useState<any>(null);
  useEffect(() => {
    if (object.objectType !== "ARTICLE") return;
    (async () => {
      // const dataPath = object.article.dataPath;
      // const data = await trpcNonReact.file.read.query(dataPath);
      // const base64EncodedString = base64url(data);
      // const base64 = Buffer.from(data).toString('base64');
      // const base64Url = `data:application/pdf;base64,${base64}`

      // const pdf = require("/home/evolvedsquid/Documents/alu-read/1677723842403-1703.04908.pdf")
      // console.log(`Base64-encoded contents of ${path}: ${base64}`);
      // base64url

      // console.log(path.join(baseDir, dataPath))
      // setFile({ url: "https://arxiv.org/pdf/1703.04908.pdf" })
      // console.log(base64Url)
      // setFile(base64Url);
      // console.log(data)
      // setFile({ data })
      // TODO: this shouldn't be URL, but rather base64 data or something
      if (object.readingPoint) _setPageNumber(parseInt(object.readingPoint));
      setFile({ url: object.originUrl });
      // setFile('/home/evolvedsquid/Documents/alu-read/1677723842403-1703.04908.pdf')
    })();
  }, [object]);

  const IS_SSR = typeof window === "undefined";
  if (IS_SSR) return null;

  return (
    <div>
      <div className="px-20">
        <div ref={wrapperDiv}>
          {file && (
            <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
              <div className="relative flex">
                <Page
                  pageNumber={pageNumber}
                  customTextRenderer={highlightRenderer}
                  onLoadSuccess={onPageLoadSuccess}
                  className="mx-auto"
                  width={debouncedPageWidth}
                />
                {pageNumber < (numPages ?? 100) && (
                  <button
                    className="bg-gray-200 hover:bg-gray-300 rounded-full h-8 px-[12px] absolute top-1/2 -translate-y-1/2 -right-9"
                    onClick={() => setPageNumber(pageNumber + 1)}
                  >
                    <FontAwesomeIcon icon={faCaretRight} />
                  </button>
                )}
                {pageNumber > 1 && (
                  <button
                    className="bg-gray-200 hover:bg-gray-300 rounded-full h-8 px-[12px] absolute top-1/2 -translate-y-1/2 -left-9"
                    onClick={() => setPageNumber(pageNumber - 1)}
                  >
                    <FontAwesomeIcon icon={faCaretLeft} />
                  </button>
                )}
              </div>
              <p className="text-center text-gray-400">
                Page {pageNumber} of {numPages}
              </p>
              <Button onClick={() => setShowOutline(!showOutline)}>
                {showOutline ? "Hide" : "Show"} Outline
              </Button>
              {showOutline && (
                <div>
                  <h3 className="text-2xl font-bold">Outline</h3>
                  <Outline
                    onItemClick={onItemClick}
                    className="list-disc list-inside"
                  />
                </div>
              )}
            </Document>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
