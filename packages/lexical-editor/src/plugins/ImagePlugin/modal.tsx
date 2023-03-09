import { INSERT_IMAGE_COMMAND } from "./ImagePlugin";
import AsyncForm from "alu-ui/src/AsyncForm";
import FileUpload from "alu-ui/src/FileUpload";
import Modal from "alu-ui/src/Modal";
import TextInput from "alu-ui/src/TextInput";
import UploadImageFromUrl from "graphql-operations/operations/UploadImageFromUrl";
import GetPresignedPUTUrl from "graphql-operations/operations/GetPresignedPUTUrl";
import UpdateUploadedImage from "graphql-operations/operations/UpdateUploadedImage";
import clamp from "helpers-lib/src/clamp";
import classNames from "helpers-lib/src/classNames";
// TODO: either fix these types or just switch to trpc
// import type {
//   Maybe,
//   Mutation,
//   MutationUploadImageArgs,
//   MutationUploadImageFromUrlArgs,
//   UploadedImage,
// } from "@/types";
import { useMutation, useLazyQuery } from "@apollo/client";
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
  const [getPresignedPUTUrl] = useLazyQuery(GetPresignedPUTUrl)
  const [uploadImageFromUrl] = useMutation(UploadImageFromUrl);
  const [updateUploadedImage] = useMutation(UpdateUploadedImage)
  const [mode, setMode] = useState<Mode>("URL");
  const [file, setFile] = useState<File>();
  const [urlVal, setUrlVal] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [widthVal, setWidthVal] = useState<number>();
  const [heightVal, setHeightVal] = useState<number>();
  const [displayError, setDisplayError] = useState(false);

  const insertImage = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      let uploadedImage: /*Maybe<UploadedImage>*/ any | undefined;

      // Upload the image
      if (mode === "URL") {
        await uploadImageFromUrl({
          variables: {
            url: urlVal,
          },
        })
          .then(({ data }) => {
            uploadedImage = data?.uploadImageFromUrl;
          })
          .catch(() => {
            setDisplayError(true);
          });
      } else if (mode === "FILE") {
        if (!file) throw new Error("File not selected");

        // Get the presigned PUT URL from our server
        const contentType = file.type;
        const presignedPUTUrl: string | undefined = (await getPresignedPUTUrl({
          variables: {
            contentType,
          }
        })).data?.getPresignedPUTUrl
        
        if (!presignedPUTUrl) throw new Error("Failed to get presigned PUT url");

        // Upload the file to S3 using the presigned URL
        const upload = await fetch(presignedPUTUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": contentType },
          mode: 'cors',
          
        })
        console.log(upload)
        if (upload.ok) {
          uploadedImage = upload;
        } else {
          setDisplayError(true);
        }

        // Get the ID from the presigned URL
        const idRegex = /\/upload-(.*?)(?:\?|$)/;
        const match = presignedPUTUrl.match(idRegex);
        const id = match?.[1];

        // Update the uploaded image object that was created with its new URL
        if (id) {
          await updateUploadedImage({
            variables: {
              id,
              url: upload.url,
            }
          })
        }
      }

      if (!uploadedImage) {
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
      setDisplayError(false);
    },
    [
      editor,
      close,
      mode,
      file,
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
        {displayError && (
          <p className="text-red-600 text-center mb-3">Error uploading image</p>
        )}
      </AsyncForm>
      <p className="mt-2 text-gray-500 text-sm text-center">
        Only upload images that you have confirmed that you have the license to
        use
      </p>
    </Modal>
  );
}
