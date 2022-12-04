// import AsyncButton from "@/atoms/AsyncButton";
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
  const [mode, setMode] = useState("SINGLE");
  const [generatedFlashcards, setGeneratedFlashcards] = useState<
    GeneratedFlashcard[]
  >([]);

  const [generateAutoFlashcard] = useMutation<
    { generateAutoFlashcard: Mutation["generateAutoFlashcard"] },
    MutationGenerateAutoFlashcardArgs
  >(GenerateAutoFlashcard);

  const generateFlashcard = async (e: React.FormEvent) => {
    const { numFlashcards } = mode === 'MULTI' ? getElementsVals(e.target as HTMLFormElement, [
      "numFlashcards",
    ]) : { numFlashcards: undefined };
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
        <div className="max-w-sm mx-auto">
          <AsyncForm
            onSubmit={generateFlashcard}
            className="mt-5"
            buttonProps={{ children: "Generate Flashcard", block: true }}
          >
            <Tabs
              tabs={["Single", "Multi", "Cloze", "Notes"]}
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
          </AsyncForm>
          <div className="mt-5">
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
        </div>
      </div>
    </>
  );
}
