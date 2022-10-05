import { INSERT_IMAGE_COMMAND } from "./ImagePlugin";
import AsyncForm from "@/atoms/AsyncForm";
import FileUpload from "@/atoms/FileUpload";
import Modal from "@/atoms/Modal";
import TextInput from "@/atoms/TextInput";
import UploadImage from "@/graphql/UploadImage";
import UploadImageFromUrl from "@/graphql/UploadImageFromUrl";
import clamp from "@/helpers/clamp";
import classNames from "@/helpers/classNames";
import type {
  Maybe,
  Mutation,
  MutationUploadImageArgs,
  MutationUploadImageFromUrlArgs,
  UploadedImage,
} from "@/types";
import { useMutation } from "@apollo/client";
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
  const [uploadImage] = useMutation<
    { uploadImage: Mutation["uploadImage"] },
    MutationUploadImageArgs
  >(UploadImage);
  const [uploadImageFromUrl] = useMutation<
    { uploadImageFromUrl: Mutation["uploadImageFromUrl"] },
    MutationUploadImageFromUrlArgs
  >(UploadImageFromUrl);
  const [mode, setMode] = useState<Mode>("URL");
  const [file, setFile] = useState<File>();
  const [urlVal, setUrlVal] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [widthVal, setWidthVal] = useState<number>();
  const [heightVal, setHeightVal] = useState<number>();

  const insertImage = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      let uploadedImage: Maybe<UploadedImage> | undefined;

      // Upload the image
      if (mode === "URL") {
        const { data } = await uploadImageFromUrl({
          variables: {
            url: urlVal,
          },
        });
        uploadedImage = data?.uploadImageFromUrl;
      } else if (mode === "FILE") {
        const { data } = await uploadImage({
          variables: {
            image: file,
          },
        });
        uploadedImage = data?.uploadImage;
      } else {
        return;
      }

      // Get the URL of the uploaded image
      const { url: src, width, height } = uploadedImage ?? {};
      if (!src) return;

      // Resize the width and height to fit within the max width
      const maxWidth = 500;
      const w = width ?? widthVal ?? undefined;
      const h = height ?? heightVal ?? undefined;
      const resizedWidth = w ? clamp(w, 0, maxWidth) : undefined;
      const resizedHeight = w
        ? ((resizedWidth as number) / w) * (h as number)
        : undefined;

      // Insert image
      editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
        caption,
        src,
        sourceUrl: urlVal ? urlVal : sourceUrl,
        width: resizedWidth,
        height: resizedHeight,
        maxWidth,
      });

      close();
      setCaption("");
      setUrlVal("");
      setSourceUrl("");
    },
    [
      editor,
      close,
      mode,
      file,
      uploadImage,
      uploadImageFromUrl,
      urlVal,
      caption,
      sourceUrl,
      heightVal,
      widthVal,
    ]
  );

  function onFileInputChange({
    target: {
      validity,
      files: [file],
    },
  }) {
    if (validity.valid) {
      setFile(file);

      // Get width and height
      // Only works for file uploads; we get width and height
      // server-side for URL images
      const fr = new FileReader();
      fr.onload = () => {
        const img = new Image();
        img.onload = () => {
          setWidthVal(img.width);
          setHeightVal(img.height);
        };
        if (fr.result) img.src = fr.result as string;
      };
      fr.readAsDataURL(file);
    }
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
        {mode === "URL" && (
          <TextInput
            label="URL"
            name="url"
            value={urlVal}
            onChange={(e) => setUrlVal(e.target.value)}
          />
        )}
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
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
            />
          </>
        )}
        <TextInput
          label="Caption (optional)"
          name="caption"
          className="my-2"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />
      </AsyncForm>
      <p className="mt-2 text-gray-500 text-sm text-center">
        Only upload images that you have confirmed that you have the license to
        use
      </p>
    </Modal>
  );
}
