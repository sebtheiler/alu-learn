import SaveExportAutoFlashcards from "./SaveExport";
import AsyncButton from "alu-ui/src/AsyncButton";
import LinkButton from "alu-ui/src/LinkButton";
import TextArea from "alu-ui/src/TextArea";
import Select from "alu-ui/src/Select";
import {
  AUTO_FLASHCARD_LIMITS,
  languageToPrompt,
  SOURCE_TEXT_MAX_LENS,
} from "@/globals";
import GenerateAutoFlashcard from "graphql-operations/operations/GenerateAutoFlashcard";
import SEO from "@/helpers/SEO";
import capitalize from "helpers-lib/src/capitalize";
import useGlobalModalStore from "@/stores/globalModalStore";
import type {
  AutoFlashcardsMode,
  GeneratedFlashcard,
  LanguageSelectionType,
  Mutation,
  MutationGenerateAutoFlashcardArgs,
} from "@/types";
import { useMutation } from "@apollo/client";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useState } from "react";
import Ad from "@/components/Ad";

export interface AutoFlashcardsPageProps {
  signedIn: boolean;
  numAutoFlashcardsGenerated: number | null;
  isPro: boolean | null;
}

const MIN_LENGTH = 50; // number of characters

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
  const [generatedFlashcards, setGeneratedFlashcards] = useState<
    GeneratedFlashcard[]
  >([]);
  const [selectedLanguage, setSelectedLanguage] =
    useState<keyof typeof languageToPrompt>("ENGLISH");

  const [generateAutoFlashcard, { loading }] = useMutation<
    { generateAutoFlashcard: Mutation["generateAutoFlashcard"] },
    MutationGenerateAutoFlashcardArgs
  >(GenerateAutoFlashcard);

  const [error, setError] = useState("");

  const generateFlashcards = async () => {
    if (sourceText.length < MIN_LENGTH) {
      setError(
        `Input must be at least ${MIN_LENGTH} characters. It is currently ${sourceText.length} characters`
      );
      return;
    }
    setError("");

    const { data } = await generateAutoFlashcard({
      variables: {
        sourceText,
        mode: "CHATGPT" as AutoFlashcardsMode,
        language: selectedLanguage as LanguageSelectionType,
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
        <div className="grid grid-cols-12">
          <div className="col-span-12 md:col-span-3 px-2">
            <Ad adType="AUTO_FLASHCARDS_SIDE_1" />
          </div>
          <div className="col-span-12 md:col-span-6">
            <h1 className="text-center text-4xl font-bold">
              Create Automatic Flashcards
            </h1>
            <p className="text-center">
              Enter your notes, and Alu will automatically create flashcards
            </p>
            {/* I've removed this with the hypothesis that showing the # of flashcards generated decreases usage */}
            {/* {typeof numAutoFlashcardsGenerated === "number" && (
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
                    <Link href="/pro" className="text-blue-600">
                      pro
                    </Link>{" "}
                    to increase your limit
                  </>
                )}
              </p>
            )} */}
            <div className="mt-5 max-w-sm mx-auto">
              <div className="w-full relative">
                <Select
                  label="Source Text Language"
                  options={Object.keys(languageToPrompt).map((lang) => ({
                    value: lang,
                    label: capitalize(lang.toLowerCase()),
                  }))}
                  onChange={(val) =>
                    setSelectedLanguage(val as keyof typeof languageToPrompt)
                  }
                />
                {selectedLanguage !== "ENGLISH" && (
                  <p className="text-center text-sm text-gray-500 mt-2">
                    Note: Auto-flashcards has not been extensively tested
                    languages other than English
                  </p>
                )}
                <TextArea
                  name="sourceText"
                  placeholder="Copy and paste your notes here"
                  rows={8}
                  minLength={MIN_LENGTH}
                  maxLength={SOURCE_TEXT_MAX_LENS["NOTES"]}
                  onChange={(e) => setSourceText(e.target.value)}
                  disabled={disabled}
                />
                <span className="absolute text-gray-500 bottom-3 right-3 pointer-events-none">
                  {sourceText.length}/{SOURCE_TEXT_MAX_LENS["NOTES"]}
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
              {error && (
                <p className="text-red-600 my-2 text-center">{error}</p>
              )}
              {loading && (
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
                      <a
                        href="mailto:support@alulearn.com"
                        className="text-blue-500"
                      >
                        support@alulearn.com
                      </a>{" "}
                      if you would like to request a personal increase.
                    </>
                  ) : (
                    <>
                      Upgrade to pro to generate up to{" "}
                      {AUTO_FLASHCARD_LIMITS.pro} flashcards per month
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
                  <Link href="/legal/tos" className="text-blue-600">
                    terms of service
                  </Link>{" "}
                  for more information.
                </p>
              </div>
            )}
          </div>
          <div className="col-span-12 md:col-span-3 px-2">
            <Ad adType="AUTO_FLASHCARDS_SIDE_2" />
          </div>
        </div>
        <div className="my-5 px-2">
          <Ad adType="AUTO_FLASHCARDS_BOTTOM" />
        </div>
      </div>
    </>
  );
}
