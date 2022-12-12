import SaveExportAutoFlashcards from "./SaveExport";
import AsyncButton from "@/atoms/AsyncButton";
import LinkButton from "@/atoms/LinkButton";
import TextInput from "@/atoms/TextInput";
import Tabs from "@/components/Tabs";
import { AUTO_FLASHCARD_LIMITS, SOURCE_TEXT_MAX_LENS } from "@/globals";
import GenerateAutoFlashcard from "@/graphql/GenerateAutoFlashcard";
import SEO from "@/helpers/SEO";
import useGlobalModalStore from "@/stores/globalModalStore";
import type {
  AutoFlashcardsMode,
  GeneratedFlashcard,
  Mutation,
  MutationGenerateAutoFlashcardArgs,
} from "@/types";
import { useMutation } from "@apollo/client";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useState } from "react";

export interface AutoFlashcardsPageProps {
  signedIn: boolean;
  numAutoFlashcardsGenerated: number | null;
  isPro: boolean | null;
}

/**
 * Page for automatically generating flashcards from notes
 */
export default function AutoFlashcardsPage({
  numAutoFlashcardsGenerated,
  isPro,
  signedIn,
}: AutoFlashcardsPageProps) {
  const setRegisterModalOpen = useGlobalModalStore(
    (state) => state.setRegisterModalOpen
  );
  const [sourceText, setSourceText] = useState("");
  const [mode, setMode] = useState("NOTES");
  const [numFlashcards, setNumFlashcards] = useState(3);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<
    GeneratedFlashcard[]
  >([]);

  const [generateAutoFlashcard, { loading }] = useMutation<
    { generateAutoFlashcard: Mutation["generateAutoFlashcard"] },
    MutationGenerateAutoFlashcardArgs
  >(GenerateAutoFlashcard);

  const generateFlashcards = async () => {
    const { data } = await generateAutoFlashcard({
      variables: {
        sourceText,
        mode: mode as AutoFlashcardsMode,
        numFlashcards,
      },
    });
    if (!data) return;

    const { generateAutoFlashcard: newGeneratedFlashcards } = data;
    setGeneratedFlashcards(newGeneratedFlashcards as GeneratedFlashcard[]);
  };

  const MAX_NUM_FLASHCARDS = isPro
    ? AUTO_FLASHCARD_LIMITS.pro
    : AUTO_FLASHCARD_LIMITS.regular;
  const disabled = (numAutoFlashcardsGenerated ?? 0) >= MAX_NUM_FLASHCARDS;

  return (
    <>
      <SEO
        title="Automatic Flashcard Creator from Your Notes"
        path="auto-flashcards"
        description="Best automatic flashcard generator. Simply copy and paste your notes, and our AI will automatically create flashcards. Export to Anki, Quizlet, and more."
      />
      <div className="mt-28">
        <h1 className="text-center text-4xl font-bold">
          Create Automatic Flashcards
        </h1>
        <p className="text-center">
          Enter your notes, and Alu will automatically create flashcards
        </p>
        {typeof numAutoFlashcardsGenerated === "number" && (
          <p className="text-center text-gray-500 mt-1">
            You have generated{" "}
            <strong>
              {numAutoFlashcardsGenerated}/{MAX_NUM_FLASHCARDS}
            </strong>{" "}
            of your monthly flashcards
            {isPro === false && (
              <>
                <br />
                Upgrade to{" "}
                <Link href="/pro">
                  <a className="text-blue-600">pro</a>
                </Link>{" "}
                to increase your limit
              </>
            )}
          </p>
        )}
        <div className="mt-5 max-w-sm mx-auto">
          <Tabs
            tabs={[
              {
                label: "Notes",
                value: "NOTES",
                description: "Create flashcards from long notes",
              },
              {
                label: "Single",
                value: "SINGLE",
                description: "Create a single flashcard from text",
              },
              {
                label: "Multi",
                value: "MULTI",
                description: "Create multiple flashcards from text",
              },
              // {
              //   label: "Cloze",
              //   value: "CLOZE",
              //   description: "Create a cloze flashcard from text",
              // },
            ]}
            callback={(selectedTab) => setMode(selectedTab.toUpperCase())}
          />
          {mode === "MULTI" && (
            <TextInput
              label="Flashcards to Create"
              type="number"
              min={1}
              max={5}
              value={numFlashcards}
              onChange={(e) => setNumFlashcards(parseInt(e.target.value))}
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
              disabled={disabled}
            />
            <span className="absolute text-gray-500 bottom-3 right-3 pointer-events-none">
              {sourceText.length}/{SOURCE_TEXT_MAX_LENS[mode]}
            </span>
          </div>
          <AsyncButton
            onClick={
              signedIn
                ? generateFlashcards
                : async () => setRegisterModalOpen(true)
            }
            disabled={disabled}
            block
          >
            Create Flashcards
          </AsyncButton>
          {mode === "NOTES" && loading && (
            <p className="text-red-600 my-2 text-center">
              Warning: This may take up to several minutes depending on the
              length of your notes. Do <strong>not</strong> refresh the page
              while you wait.
            </p>
          )}
        </div>
        {disabled && (
          <div className="max-w-lg mx-auto mt-5">
            <p className="text-red-600 my-2 text-center font-bold">
              You have exceeded your monthly quota of automatic flashcard
              generations.{" "}
              {isPro ? (
                <>
                  Contact{" "}
                  <a href="mailto:support@alulearn.com">support@alulearn</a> if
                  you would like to request a personal increase.
                </>
              ) : (
                <>
                  Upgrade to pro to generate up to {AUTO_FLASHCARD_LIMITS.pro}{" "}
                  flashcards per month
                </>
              )}
            </p>
            {!isPro && (
              <LinkButton href="/pro" block>
                Upgrade to Pro
              </LinkButton>
            )}
          </div>
        )}
        {generatedFlashcards.length > 0 && (
          <div className="mt-5 mb-20 mx-auto max-w-xl">
            <h2 className="text-center text-2xl font-bold">
              Created {generatedFlashcards.length} Flashcards
            </h2>
            <SaveExportAutoFlashcards
              generatedFlashcards={generatedFlashcards}
            />
            {generatedFlashcards.map((generatedFlashcard, i) => (
              <div key={i} className="relative">
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
                <FontAwesomeIcon
                  icon={faTrash}
                  title="Remove flashcard"
                  onClick={() =>
                    setGeneratedFlashcards(
                      generatedFlashcards.filter(
                        (f) => f !== generatedFlashcard
                      )
                    )
                  }
                  className="absolute right-3 top-5 hover:cursor-pointer"
                />
              </div>
            ))}
            <hr className="my-3" />
            <p className="text-center text-sm text-gray-600 mt-3">
              Alu does not guarantee that generated flashcards are accurate.
              Please verify them yourself, and see our{" "}
              <Link href="/legal/tos">
                <a className="text-blue-600">terms of service</a>
              </Link>{" "}
              for more information.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
