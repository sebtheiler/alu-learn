import AsyncButton from "@/atoms/AsyncButton";
import AsyncForm from "@/atoms/AsyncForm";
import GenerateAutoFlashcard from "@/graphql/GenerateAutoFlashcard";
import SEO from "@/helpers/SEO";
import type { Mutation, MutationGenerateAutoFlashcardArgs } from "@/types";
import { useMutation } from "@apollo/client";
import { useState } from "react";

const SOURCE_TEXT_MAX_LEN = 250;

/**
 * Page for automatically generating flashcards from notes
 */
export default function AutoFlashcardsPage() {
  const [sourceText, setSourceText] = useState("");
  const [generatedFlashcard, setGeneratedFlashcard] = useState<string[] | null>(
    null
  );

  const [generateAutoFlashcard] = useMutation<
    { generateAutoFlashcard: Mutation["generateAutoFlashcard"] },
    MutationGenerateAutoFlashcardArgs
  >(GenerateAutoFlashcard);

  const generateFlashcard = async () => {
    const { data } = await generateAutoFlashcard({
      variables: {
        sourceText: sourceText.replace("\n", ""),
      },
    });
    if (!data) return;

    const { generateAutoFlashcard: generatedFlashcard } = data;
    setGeneratedFlashcard(generatedFlashcard as string[]);
  };

  return (
    <>
      <SEO title="Auto Flashcards" path="auto-flashcards" description="" />
      <div className="mt-28">
        <h1 className="text-center text-4xl font-bold">
          Generate Automatic Flashcards
        </h1>
        <p className="text-center">
          Enter some text, and Alu will automatically create a flashcard from it
        </p>
        <div className="max-w-sm mx-auto">
          <AsyncForm
            onSubmit={generateFlashcard}
            className="mt-5"
            buttonProps={{ children: "Generate Flashcard", block: true }}
          >
            <p className="font-bold">Text</p>
            <div className="w-full relative">
              <textarea
                name="sourceText"
                rows={8}
                minLength={15}
                maxLength={SOURCE_TEXT_MAX_LEN}
                onChange={(e) => setSourceText(e.target.value)}
                className="border-2 border-alu-primary-purple/20 focus:border-alu-primary-purple rounded-xl p-3 outline-none w-full resize-none transition-all"
              />
              <span className="absolute text-gray-500 bottom-3 right-3 pointer-events-none">
                {sourceText.length}/{SOURCE_TEXT_MAX_LEN}
              </span>
            </div>
          </AsyncForm>
          {generatedFlashcard && (
            <div className="mt-5">
              <hr className="my-3" />
              <p className="font-bold">Front</p>
              <p>{generatedFlashcard[0]}</p>
              <br />
              <p className="font-bold">Back</p>
              <p>{generatedFlashcard[1]}</p>
              <div className="mt-5">
                <AsyncButton
                  variant="blue"
                  onClick={async () => console.log("saved")}
                  className="mb-1"
                  block
                >
                  Save
                </AsyncButton>
                <AsyncButton variant="green" onClick={generateFlashcard} block>
                  Regenerate
                </AsyncButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
