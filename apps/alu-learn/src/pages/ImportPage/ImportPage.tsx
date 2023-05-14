import SaveLocation from "@/components/SaveLocation";
import ImportFlashcards from "graphql-operations/operations/ImportFlashcards";
import SEO from "@/helpers/SEO";
import type { Mutation, MutationImportFlashcardsArgs } from "@/types";
import TextArea from "alu-ui/src/TextArea";
import { useRouter } from "next/router";
import { useMutation } from "@apollo/client";
import { useState } from "react";

export default function ImportPage() {
  const [importTxt, setImportTxt] = useState("");
  const router = useRouter();

  const [importFlashcardsMutation] = useMutation<
    { importFlashcards: Mutation["importFlashcards"] },
    MutationImportFlashcardsArgs
  >(ImportFlashcards);

  const importFlashcards = async ({
    courseTitle,
    subSectionId,
  }: {
    /** Save the flashcards to a new course */
    courseTitle?: string;
    /** Save the flashcards to an existing sub section */
    subSectionId?: string;
  }) => {
    const { data } = await importFlashcardsMutation({
      variables: {
        importTxt,
        courseTitle,
        subSectionId,
      },
    });

    if (data?.importFlashcards) router.push(data.importFlashcards);
  };

  return (
    <>
      <SEO
        title="Import flashcards"
        path="import"
        description="Import flashcards into Alu Learn from a text file or external source"
      />
      <div className="mt-28 mx-auto text-center max-w-2xl">
        <h1 className="text-4xl font-bold mb-3">Import</h1>

        <p>
          Copy-paste a <span className="font-bold">tab-separated</span> list of
          flashcards you would like to import
        </p>
        <TextArea
          placeholder={`Example:\nFront #1\tBack #1\nFront #2\tBack #2\nFront #3\tBack #3`}
          rows={10}
          value={importTxt}
          onChange={(e) => setImportTxt(e.target.value)}
        />

        <div className="max-w-md mx-auto mt-3">
          <p>
            Would you like to create a new course for the flashcards or save
            them to an existing course?
          </p>
          <SaveLocation callback={importFlashcards} createTitle="Import" />
        </div>
      </div>
    </>
  );
}
