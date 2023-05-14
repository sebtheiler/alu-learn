import Button from "alu-ui/src/Button";
import ButtonGroup from "alu-ui/src/ButtonGroup";
import Modal from "alu-ui/src/Modal";
import SaveGeneratedFlashcards from "graphql-operations/operations/SaveGeneratedFlashcards";
import type {
  GeneratedFlashcard,
  Mutation,
  MutationSaveGeneratedFlashcardsArgs,
} from "@/types";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import { useState } from "react";
import SaveLocation from "@/components/SaveLocation";

export default function SaveExportAutoFlashcards({
  generatedFlashcards,
}: {
  generatedFlashcards: GeneratedFlashcard[];
}) {
  const router = useRouter();

  const [saveAllModalOpen, setSaveAllModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const [saveGeneratedFlashcards] = useMutation<
    { saveGeneratedFlashcards: Mutation["saveGeneratedFlashcards"] },
    MutationSaveGeneratedFlashcardsArgs
  >(SaveGeneratedFlashcards);

  const saveAll = async ({
    courseTitle,
    subSectionId,
  }: {
    /** Save the flashcards to a new course */
    courseTitle?: string;
    /** Save the flashcards to an existing sub section */
    subSectionId?: string;
  }) => {
    const { data } = await saveGeneratedFlashcards({
      variables: {
        generatedFlashcards,
        courseTitle,
        subSectionId,
      },
    });

    if (data?.saveGeneratedFlashcards)
      router.push(data.saveGeneratedFlashcards);
  };

  return (
    <>
      <ButtonGroup fixedWidth="200px" spaced className="text-center">
        <Button variant="green" onClick={() => setSaveAllModalOpen(true)}>
          Save All
        </Button>
        <Button variant="blue" onClick={() => setExportModalOpen(true)}>
          Export
        </Button>
      </ButtonGroup>
      <Modal
        open={saveAllModalOpen}
        close={() => setSaveAllModalOpen(false)}
        title="Save All Flashcards"
      >
        <SaveLocation callback={saveAll} createTitle="Save All" />
      </Modal>
      <Modal
        open={exportModalOpen}
        close={() => setExportModalOpen(false)}
        title="Export Flashcards"
      >
        <textarea
          rows={10}
          className="border-2 border-alu-primary-purple/20 focus:border-alu-primary-purple rounded-xl p-3 outline-none w-full resize-none transition-all"
          name="exportedFlashcards"
        >
          {generatedFlashcards
            .map((flashcard) => `${flashcard.front}\t${flashcard.back}`)
            .join("\n")}
        </textarea>
        <Button
          onClick={() => {
            // Taken from https://stackoverflow.com/a/65241581/10226703
            const linkEl = document.createElement("a");
            linkEl.href = `data:text/plain;charset=UTF-8,${
              (
                document.getElementsByName(
                  "exportedFlashcards"
                )[0] as HTMLInputElement
              ).value
            }}`;
            linkEl.setAttribute("download", "export.txt");
            linkEl.click();
          }}
          block
        >
          Download .txt File
        </Button>
        <hr className="my-3" />
        <p>
          <strong>Anki:</strong> Download the file, then click
          &quot;Import&quot; in Anki
        </p>
        <p>
          <strong>Quizlet:</strong> Click &quot;Import from Word, Excel, Google
          Docs, etc.&quot;, then copy-paste the text above into the input
        </p>
      </Modal>
    </>
  );
}
