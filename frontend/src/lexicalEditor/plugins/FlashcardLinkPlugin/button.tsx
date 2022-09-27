import { TOGGLE_FLASHCARD_LINK_COMMAND } from "./FlashcardLinkPlugin";
import Popover from "@/atoms/Popover";
import TextInput from "@/atoms/TextInput";
import SearchFlashcards from "@/graphql/SearchFlashcards";
import classNames from "@/helpers/classNames";
import flattenLexical from "@/helpers/flattenLexical";
import { useDebounce } from "@/hooks/useDebounce";
import useProStore from "@/stores/proStore";
import type { Flashcard, Query, QuerySearchFlashcardsArgs } from "@/types";
import { useLazyQuery } from "@apollo/client";
import { faAnchor } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function FlashcardLinkButton({
  isActive,
}: {
  isActive: boolean;
}) {
  const router = useRouter();
  const isPro = useProStore((store) => store.isPro);
  const [open, setOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 750);
  const [, { data: searchData, loading, refetch: searchFlashcards }] =
    useLazyQuery<
      {
        searchFlashcards: Query["searchFlashcards"];
      },
      QuerySearchFlashcardsArgs
    >(SearchFlashcards, {
      variables: {
        text: debouncedSearchTerm,
        courseId: router.query.courseId as string,
      },
    });
  const { searchFlashcards: searchedFlashcards } = searchData ?? {};

  useEffect(() => {
    if (debouncedSearchTerm === searchTerm && searchTerm.length > 0)
      searchFlashcards();
  }, [debouncedSearchTerm, searchTerm, searchFlashcards]);

  return (
    <Popover
      popover={
        <div>
          <div className="text-center">
            <h3 className="text-md font-bold">Insert Flashcard Link</h3>
            {!isPro && (
              <small className="text-blue-500 hover:underline">
                <Link href="/pro">(pro-only)</Link>
                <br />
              </small>
            )}
            <p className="mt-2 text-sm text-gray-700">
              This will allow you to see a preview of a flashcard when studying
              by hovering the flashcard link
            </p>
            <hr className="my-3" />
          </div>
          <div>
            <div className="text-center">
              <p className="mb-1">Search for Flashcard</p>
              <TextInput
                onChange={(e) => setSearchTerm(e.target.value)}
                label="Search"
                className="bg-white"
                disabled={!isPro}
              />
              {!isPro && (
                <p className="mt-3">
                  Upgrade to{" "}
                  <Link href="/pro" className="text-blue-500">
                    pro
                  </Link>{" "}
                  to use flashcard links
                </p>
              )}
              {loading && <p className="mt-3">Loading…</p>}
            </div>
            {searchedFlashcards && searchedFlashcards.length > 0 && (
              <hr className="my-3" />
            )}
            <div>
              {searchedFlashcards &&
                searchedFlashcards.map((flashcard) => (
                  <SearchedFlashcard
                    flashcard={flashcard as Flashcard | undefined}
                    setOpen={setOpen}
                    key={flashcard?.id}
                  />
                ))}
            </div>
          </div>
        </div>
      }
      trigger="click"
      className="w-96"
      placement="bottom"
      onOpenCallback={() => setOpen(true)}
      onCloseCallback={() => setOpen(false)}
      open={open}
      arrow
    >
      <button
        className={classNames(
          "w-6 h-6 mx-1 rounded-md hover:bg-gray-200",
          isActive && "bg-blue-100 hover:bg-blue-100",
          !isPro && "hover:cursor-not-allowed text-gray-400"
        )}
        title="Flashcard Link"
        aria-label="Flashcard Link"
        disabled={!isPro}
        tabIndex={-1}
      >
        <FontAwesomeIcon icon={faAnchor} />
      </button>
    </Popover>
  );
}

function SearchedFlashcard({
  flashcard,
  setOpen,
}: {
  flashcard?: Flashcard;
  setOpen(open: boolean): void;
}) {
  const [text, setText] = useState<string | undefined>();
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    const getText = async () => {
      if (flashcard)
        setText(
          await flattenLexical(
            JSON.stringify(JSON.parse(flashcard.fields as string)[1])
          )
        );
    };

    if (!text) getText();
  });

  if (!flashcard) return null;

  return (
    <div
      className="mb-1 bg-gray-100 border-2 border-gray-200 px-3 py-2 rounded-lg hover:cursor-pointer hover:scale-105 transition"
      onClick={() => {
        editor.dispatchCommand(TOGGLE_FLASHCARD_LINK_COMMAND, {
          flashcardId: flashcard.id as string,
        });
        editor.focus();
        document.body.click();
        setOpen(false);
      }}
      key={flashcard.id}
    >
      {text}
    </div>
  );
}
