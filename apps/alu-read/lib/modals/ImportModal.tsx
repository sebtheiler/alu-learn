import AsyncForm from "alu-ui/src/AsyncForm";
import Modal from "alu-ui/src/Modal";
import TextInput from "alu-ui/src/TextInput";
import Tabs from "alu-ui/src/Tabs";
import { getElementsVals } from "helpers-lib/src/getElementsVals";
import isUrl from "helpers-lib/src/isUrl";
import { useContext, useState } from "react";
import axios from "axios";
import importArticle, { ImportType } from "../../helpers/importArticle";
import { youtubeRegex } from "../../globals";
import { GlobalContext } from "../../src/app/globalContext";
import { trpc } from "../../src/app/util";
import type { Article } from "../../src/generated/client";
import Checkbox from "alu-ui/src/Checkbox";

type ImportOption = "URL" | "PASTE_RAW" | "PASTE_HTML" | "FILE";

interface ImportModalProps {
  open: boolean;
  close(): void;
}

const ImportModal: React.FC<ImportModalProps> = ({ open, close }) => {
  const [importError, setImportError] = useState("");
  const { setSelectedObject } = useContext(GlobalContext);
  const [importImages, setImportImages] = useState(false);
  const [importOption, setImportOption] = useState<ImportOption>("URL");
  const utils = trpc.useContext();

  const importHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    const callback = (article: Article) => {
      setSelectedObject({ objectType: "ARTICLE", ...article });
      utils.article.all.invalidate();
      close();
    };

    switch (importOption) {
      case "URL": {
        const { articleUrl } = getElementsVals(e.target as HTMLFormElement, [
          "articleUrl",
        ]);
        if (!isUrl(articleUrl)) {
          setImportError("Not a valid URL");
          return;
        }
        setImportError("");

        if (youtubeRegex.test(articleUrl)) {
          await importArticle({
            data: articleUrl,
            originUrl: articleUrl,
            importType: "ONLINE_VIDEO",
            importImages,
            callback,
          });
          return;
        }

        axios
          .get(articleUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36",
            },
          })
          .then(async (response) => {
            let importType: ImportType | undefined;
            const contentType = response.headers["content-type"];
            if (contentType.includes("text/html")) {
              importType = "HTML";
            } else if (contentType.includes("application/pdf")) {
              importType = "PDF";
            } else {
              setImportError(`Unable to parse response of type ${contentType}`);
            }

            if (importType) {
              await importArticle({
                data:
                  importType === "PDF" ? articleUrl : (response.data as string),
                importType: importType,
                originUrl: articleUrl,
                importImages,
                callback,
              });
              return;
            }
          })
          .catch((error) => {
            console.error(error);
          });
        break;
      }
      case "PASTE_RAW": {
        const { pasted } = getElementsVals(e.target as HTMLFormElement, [
          "pasted",
        ]);
        await importArticle({
          data: pasted,
          importType: "TEXT",
          callback,
        });
        break;
      }
      case "PASTE_HTML": {
        const pasted = document.getElementById("rawHtmlImport")?.innerHTML;
        if (pasted)
          await importArticle({
            data: pasted,
            importType: "HTML",
            importImages,
            callback,
          });
        break;
      }
    }
  };

  return (
    <Modal open={open} close={close} title="Import">
      <Tabs
        tabs={[
          { label: "URL", value: "URL" },
          { label: "Paste Raw", value: "PASTE_RAW" },
          { label: "Paste HTML", value: "PASTE_HTML" },
          // { label: "File", value: "FILE" },
        ]}
        callback={(selectedTab) => setImportOption(selectedTab as ImportOption)}
        className="mb-1 bg-white"
        defaultValue={importOption}
      />
      <AsyncForm
        onSubmit={importHandler}
        buttonProps={{ children: "Import", className: "mt-2", block: true }}
      >
        {importOption === "URL" && (
          <>
            <TextInput label="Article URL" name="articleUrl" autoFocus />
            <Checkbox
              label="Import images? (slow)"
              className="mt-1"
              defaultChecked={importImages}
              onChange={(e) => setImportImages(e.target.checked)}
            />
          </>
        )}
        {importOption === "PASTE_RAW" && (
          <>
            <textarea
              name="pasted"
              className="outline-alu-primary-purple border-2 border-stone-200 w-full rounded-xl p-3"
              autoFocus
              rows={5}
            />
          </>
        )}
        {importOption === "PASTE_HTML" && (
          <>
            <div
              className="outline-alu-primary-purple border-2 border-stone-200 w-full rounded-xl p-3 overflow-scroll"
              id="rawHtmlImport"
              contentEditable
            />
            <Checkbox
              label="Import images? (slow)"
              className="mt-1"
              defaultChecked={importImages}
              onChange={(e) => setImportImages(e.target.checked)}
            />
          </>
        )}
        {/* {importOption === 'FILE' && <>
        </>} */}
        {importError && <p className="text-red-500 font-bold">{importError}</p>}
      </AsyncForm>
    </Modal>
  );
};

export default ImportModal;
