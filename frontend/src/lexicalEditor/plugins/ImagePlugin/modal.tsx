import { INSERT_IMAGE_COMMAND } from "./ImagePlugin";
import AsyncForm from "@/atoms/AsyncForm";
import FileUpload from "@/atoms/FileUpload";
import Modal from "@/atoms/Modal";
import TextInput from "@/atoms/TextInput";
import classNames from "@/helpers/classNames";
import { getElementsVals } from "@/helpers/getElementsVals";
import type { LexicalEditor } from "lexical";
import { useCallback, useState } from "react";

type Mode = "URL" | "FILE";

interface InsertImageModalProps {
  open: boolean;
  close(): void;
  editor: LexicalEditor;
}
export default function InsertImageModal({
  open,
  close,
  editor,
}: InsertImageModalProps) {
  const [mode, setMode] = useState<Mode>("URL");
  const [file, setFile] = useState<File>();

  const insertImage = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (mode === "URL") {
        const { url, caption } = getElementsVals(e.target as HTMLFormElement, [
          "url",
          "caption",
        ]);

        editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
          caption,
          src: url,
          sourceUrl: url,
        });
      }

      close();
    },
    [editor, close, mode]
  );

  function onFileInputChange({
    target: {
      validity,
      files: [file],
    },
  }) {
    if (validity.valid) setFile(file);
  }

  return (
    <Modal open={open} close={close} title="Insert Image">
      <div className="flex">
        <h1
          onClick={() => setMode("URL")}
          className={classNames(
            "text-lg text-center w-1/2",
            mode === "URL" && "underline font-bold"
          )}
          role="button"
        >
          URL
        </h1>
        <h1
          onClick={() => setMode("FILE")}
          className={classNames(
            "text-lg text-center w-1/2",
            mode === "FILE" && "underline font-bold"
          )}
          role="button"
        >
          File
        </h1>
      </div>
      <hr className="my-2" />
      <AsyncForm
        onSubmit={insertImage}
        buttonProps={{ children: "Insert Image", type: "submit", block: true }}
      >
        {mode === "URL" && <TextInput label="URL" name="url" />}
        {mode === "FILE" && (
          <>
            <FileUpload
              accept=".png, .jpg, .jpeg, .webm"
              className="w-full"
              name="file"
              onChange={onFileInputChange}
            />
            <TextInput
              label="Source URL (optional)"
              name="sourceUrl"
              className="my-2"
            />
          </>
        )}
        <TextInput label="Caption (optional)" name="caption" className="my-2" />
      </AsyncForm>
      <p className="mt-2 text-gray-500 text-sm text-center">
        Only upload images that you have confirmed that you have the license to
        use
      </p>
    </Modal>
  );
}
