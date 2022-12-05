import SaveExportAutoFlashcards from "./SaveExport";
import AsyncForm from "@/atoms/AsyncForm";
import TextInput from "@/atoms/TextInput";
import Tabs from "@/components/Tabs";
import GenerateAutoFlashcard from "@/graphql/GenerateAutoFlashcard";
import SEO from "@/helpers/SEO";
import { getElementsVals } from "@/helpers/getElementsVals";
import type {
  AutoFlashcardsMode,
  GeneratedFlashcard,
  Mutation,
  MutationGenerateAutoFlashcardArgs,
} from "@/types";
import { useMutation } from "@apollo/client";
import { useState } from "react";

const SOURCE_TEXT_MAX_LENS = {
  SINGLE: 250,
  MULTI: 1000,
  CLOZE: 200,
  NOTES: 10000,
};

/**
 * Page for automatically generating flashcards from notes
 */
export default function AutoFlashcardsPage() {
  const [sourceText, setSourceText] = useState("");
  const [mode, setMode] = useState("NOTES");
  const [generatedFlashcards, setGeneratedFlashcards] = useState<
    GeneratedFlashcard[]
  >([]);

  const [generateAutoFlashcard, { loading }] = useMutation<
    { generateAutoFlashcard: Mutation["generateAutoFlashcard"] },
    MutationGenerateAutoFlashcardArgs
  >(GenerateAutoFlashcard);

  const generateFlashcard = async (e: React.FormEvent) => {
    const { numFlashcards } =
      mode === "MULTI"
        ? getElementsVals(e.target as HTMLFormElement, ["numFlashcards"])
        : { numFlashcards: undefined };
    const { data } = await generateAutoFlashcard({
      variables: {
        sourceText,
        mode: mode as AutoFlashcardsMode,
        numFlashcards: numFlashcards ? parseInt(numFlashcards) : undefined,
      },
    });
    if (!data) return;

    const { generateAutoFlashcard: newGeneratedFlashcards } = data;
    setGeneratedFlashcards(newGeneratedFlashcards as GeneratedFlashcard[]);
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
        <AsyncForm
          onSubmit={generateFlashcard}
          className="mt-5 max-w-sm mx-auto"
          buttonProps={{ children: "Generate Flashcards", block: true }}
        >
          <Tabs
            tabs={[
              {
                label: "Notes",
                value: "NOTES",
                description: "Generate flashcards from long notes",
              },
              {
                label: "Single",
                value: "SINGLE",
                description: "Generate a single flashcard from text",
              },
              {
                label: "Multi",
                value: "MULTI",
                description: "Generate multiple flashcards from text",
              },
              {
                label: "Cloze",
                value: "CLOZE",
                description: "Generate a cloze flashcard from text",
              },
            ]}
            callback={(selectedTab) => setMode(selectedTab.toUpperCase())}
          />
          {mode === "MULTI" && (
            <TextInput
              label="Flashcards to Generate"
              type="number"
              min={1}
              max={5}
              defaultValue={3}
              name="numFlashcards"
              className="mt-3"
            />
          )}
          <p className="font-bold mt-2">Text</p>
          <div className="w-full relative">
            <textarea
              name="sourceText"
              placeholder="Copy and paste your notes here"
              rows={8}
              minLength={15}
              maxLength={SOURCE_TEXT_MAX_LENS[mode]}
              onChange={(e) => setSourceText(e.target.value)}
              className="border-2 border-alu-primary-purple/20 focus:border-alu-primary-purple rounded-xl p-3 outline-none w-full resize-none transition-all"
            />
            <span className="absolute text-gray-500 bottom-3 right-3 pointer-events-none">
              {sourceText.length}/{SOURCE_TEXT_MAX_LENS[mode]}
            </span>
          </div>
          {loading && (
            <p className="text-red-600 my-2 text-center">
              Warning: This may take up to several minutes depending on the
              length of your notes. Do <strong>not</strong> refresh the page
              while you wait.
            </p>
          )}
        </AsyncForm>
        {generatedFlashcards.length > 0 && (
          <div className="mt-5 mx-auto max-w-xl">
            <h2 className="text-center text-2xl font-bold">
              Generated Flashcards
            </h2>
            <SaveExportAutoFlashcards
              generatedFlashcards={generatedFlashcards}
            />
            {generatedFlashcards.map((generatedFlashcard, i) => (
              <div key={i}>
                <hr className="my-3" />
                <p className="font-bold">Front</p>
                <p>{generatedFlashcard.front}</p>
                {generatedFlashcard.flashcardType === "NORMAL" && (
                  <>
                    <br />
                    <p className="font-bold">Back</p>
                    <p>{generatedFlashcard.back}</p>
                  </>
                )}
                {/* <div className="mt-5">
                  <AsyncButton
                    variant="blue"
                    onClick={async () => console.log("saved")}
                    className="mb-1"
                    block
                  >
                    Save
                  </AsyncButton>
                  <AsyncButton
                    variant="green"
                    onClick={generateFlashcard}
                    block
                  >
                    Regenerate
                  </AsyncButton>
                </div> */}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
