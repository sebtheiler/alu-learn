import { insertFlashcardLink } from "./helpers";
import Popover from "@/atoms/Popover";
import TextInput from "@/atoms/TextInput";
import Tooltip from "@/atoms/Tooltip";
import SearchFlashcards from "@/graphql/SearchFlashcards";
import type { SearchFlashcardsType } from "@/graphql/SearchFlashcards";
// import flattenNodes from "@/helpers/flattenNodes";
import { useDebounce } from "@/hooks/useDebounce";
import { useQuery } from "@apollo/client";
import { faAnchor } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ReactEditor } from "slate-react";

interface FlashcardLinkButtonProps {
  /**
   * Editor into which to insert the flashcard link
   */
  editor: ReactEditor;
  /**
   * Is the button selectable with tab?
   */
  tabbable: boolean;
  /**
   * Is the user a pro user? If not, they cannot insert flashcard links
   */
  isPro: boolean;
}

/**
 * Displays a button to insert a flashcard link into an editor
 */
export default function FlashcardLinkButton({
  editor,
  tabbable,
}: FlashcardLinkButtonProps) {
  const isPro = true;

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 750);
  const { data: searchData, refetch: searchFlashcards } =
    useQuery<SearchFlashcardsType>(SearchFlashcards, {
      skip: debouncedSearchTerm === "",
    });
  const { searchFlashcards: searchedFlashcards } = searchData ?? {};

  // We need to override the popup's `open` state so that we can
  // close the popup after the user selects a flashcard
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (debouncedSearchTerm === searchTerm && searchTerm.length > 0) {
      setIsSearching(true);
      searchFlashcards({ text: searchTerm }).then(() => setIsSearching(false));
    }
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
              {isSearching && <p className="mt-3">Loading…</p>}
            </div>
            {searchedFlashcards && searchedFlashcards.length > 0 && (
              <hr className="my-3" />
            )}
            <div>
              {searchedFlashcards &&
                searchedFlashcards.map(
                  (flashcard) =>
                    flashcard && (
                      <div
                        className="mb-1 bg-gray-100 border-2 border-gray-200 px-3 py-2 rounded-lg hover:cursor-pointer hover:scale-105 transition"
                        onClick={() => {
                          insertFlashcardLink(editor, flashcard);
                          document.body.click();
                          ReactEditor.focus(editor);
                          setOpen(false);
                        }}
                        key={flashcard.id}
                      >
                        {/* {flattenNodes(flashcard?.fields?.value[0])} */}
                      </div>
                    )
                )}
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
      <Tooltip tooltip="Insert Flashcard Link" className="w-36">
        <button
          style={{
            background: "rgba(0, 0, 0, 0)",
            border: "none",
          }}
          tabIndex={tabbable ? undefined : -1}
          className="text-dark"
        >
          <FontAwesomeIcon icon={faAnchor} />
        </button>
      </Tooltip>
    </Popover>
  );
}
